// ════════════════════════════════════════════════════════════════
// divorcerbot · divorce.mjs — the UK divorce self-help ENGINE
//
// ⚖️  THIS IS NOT LEGAL ADVICE. It is a self-help information tool. It gives general information about the
//     law and does deterministic calculations from figures YOU enter. It cannot know your circumstances,
//     cannot represent you, and can be wrong for your case. For advice, see a solicitor (Resolution /
//     Law Society), Citizens Advice, or GOV.UK. If you are in danger, see SAFETY below.
//
// Every rule here is sourced to an authoritative reference (GOV.UK / legislation.gov.uk) — see SOURCES.
// UK divorce law is DEVOLVED: England & Wales, Scotland, and Northern Ireland are materially different.
// The engine is jurisdiction-aware and never applies one nation's rule to another.
//
// Zero dependencies. Deterministic. Pure functions (no dates-from-clock, no randomness) — every output is
// a function of its inputs, so it is testable and reproducible.
// ════════════════════════════════════════════════════════════════

export const NOT_ADVICE =
  'This tool provides general information and calculations, not legal advice. It cannot account for your ' +
  'individual circumstances. For advice about your case, consult a solicitor, Citizens Advice, or GOV.UK.';

export const SAFETY = {
  message: 'If you are experiencing domestic abuse, your safety comes first. Support is free and confidential.',
  refuge_national_da_helpline: '0808 2000 247 (24/7, run by Refuge)',
  emergency: '999 (in an emergency; if you cannot speak, dial 999 then press 55 on a mobile)',
  note: 'Domestic abuse can exempt you from mediation (MIAM) and may qualify you for legal aid. Tell the court/solicitor.',
};

export const SOURCES = {
  ddsa_2020: 'https://www.legislation.gov.uk/ukpga/2020/11/contents',            // no-fault, E&W, in force 6 Apr 2022
  mca_1973_s25: 'https://www.legislation.gov.uk/ukpga/1973/18/section/25',       // financial factors
  gov_divorce: 'https://www.gov.uk/divorce',                                     // E&W process + £612 fee
  gov_divorce_finalise: 'https://www.gov.uk/divorce/finalise-your-divorce',      // 20 weeks + 6w1d timeline
  gov_cms: 'https://www.gov.uk/how-child-maintenance-is-worked-out',             // CMS rates + shared care
  gov_cms_steps: 'https://www.gov.uk/government/publications/how-we-work-out-child-maintenance/how-we-work-out-child-maintenance',
  scotland: 'https://www.mygov.scot/browse/birth-death-family/divorce-separation',
  ni: 'https://www.nidirect.gov.uk/articles/getting-divorce-or-dissolving-civil-partnership',
};

// ── jurisdictions ─────────────────────────────────────────────────────────────
// Divorce is devolved. These are the three UK systems, kept honestly distinct.
export const JURISDICTIONS = {
  'england-wales': {
    id: 'england-wales', name: 'England & Wales',
    noFault: true,
    marriageMinimumYears: 1,                 // must be married > 1 year (DDSA 2020 / MCA 1973 s.3)
    ground: 'Irretrievable breakdown of the marriage. Since 6 April 2022 (DDSA 2020) this is a no-fault ' +
      'statement — you do not prove adultery, behaviour, desertion or separation. The statement is ' +
      'conclusive: a divorce can only be contested on jurisdiction, the validity of the marriage, or fraud.',
    facts: [],                               // none — no-fault
    terms: { applicant: 'applicant', firstOrder: 'conditional order', finalOrder: 'final order',
             was: 'formerly petitioner / decree nisi / decree absolute' },
    jointApplication: true,
    court: 'Apply online at GOV.UK (or by post) to the family court.',
    feeGBP: 612,
    financeStatute: 'Matrimonial Causes Act 1973 s.25',
    source: 'gov_divorce',
  },
  scotland: {
    id: 'scotland', name: 'Scotland',
    noFault: false,
    marriageMinimumYears: 0,                 // Scotland has no 1-year bar
    ground: 'Irretrievable breakdown, OR an interim gender recognition certificate. Breakdown is shown by ' +
      'ONE of four facts (below). Scotland did NOT adopt the E&W no-fault model.',
    facts: [
      '1 year separation WITH the other party’s consent',
      '2 years separation (no consent needed)',
      'Adultery',
      'Unreasonable behaviour',
    ],
    terms: { applicant: 'pursuer', firstOrder: '—', finalOrder: 'decree of divorce',
             was: 'desertion was removed as a ground by the Family Law (Scotland) Act 2006' },
    jointApplication: false,
    court: 'Sheriff Court or Court of Session. A simplified (“DIY”) procedure exists for 1-year-with-' +
      'consent or 2-years separation where there are no children under 16 and no financial dispute.',
    feeGBP: null,                            // varies; see Scottish Courts
    financeStatute: 'Family Law (Scotland) Act 1985 (fair sharing of matrimonial property)',
    source: 'scotland',
  },
  'northern-ireland': {
    id: 'northern-ireland', name: 'Northern Ireland',
    noFault: false,
    marriageMinimumYears: 2,                 // cannot apply in the first 2 years of marriage
    ground: 'Irretrievable breakdown shown by ONE of five facts (below). Northern Ireland has NOT adopted ' +
      'no-fault divorce — it still uses the fault/separation system England & Wales left behind in 2022.',
    facts: [
      'Adultery',
      'Unreasonable behaviour',
      'Desertion (2+ years)',
      '2 years separation WITH consent',
      '5 years separation (no consent needed)',
    ],
    terms: { applicant: 'petitioner', firstOrder: 'decree nisi', finalOrder: 'decree absolute',
             was: 'the pre-2022 England & Wales model' },
    jointApplication: false,
    court: 'Matrimonial proceedings in the High Court or a divorce county court.',
    feeGBP: null,
    financeStatute: 'Matrimonial Causes (Northern Ireland) Order 1978',
    source: 'ni',
  },
};

// small self-contained guards (kept inline so this file is a single sovereign unit)
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
const nonNeg = (v) => { const n = num(v); return Number.isFinite(n) && n >= 0 ? n : NaN; };
const round2 = (n) => Math.round(n * 100) / 100;
const jur = (id) => JURISDICTIONS[String(id || '').toLowerCase()] || null;

// ── eligibility & jurisdiction gate ───────────────────────────────────────────
// Decide whether the person can (probably) apply, in their jurisdiction. Returns reasons either way and
// never throws on odd input. `marriedYears` is the whole years married; `connection` is a rough proxy for
// the habitual-residence / domicile jurisdiction test (true if they confirm a UK connection).
export function assessEligibility(input = {}) {
  const j = jur(input.jurisdiction);
  if (!j) return { ok: false, jurisdiction: null, eligible: false,
    reasons: ['Choose a jurisdiction: England & Wales, Scotland, or Northern Ireland — the law differs in each.'] };

  const years = num(input.marriedYears);
  const reasons = [], blocks = [];

  if (input.marriageRecognised === false)
    blocks.push('The marriage must be legally recognised in the UK. If unsure, get advice — an overseas marriage may still count.');

  if (j.marriageMinimumYears > 0) {
    if (!Number.isFinite(years)) reasons.push(`Enter how many years you have been married (must be at least ${j.marriageMinimumYears}).`);
    else if (years < j.marriageMinimumYears)
      blocks.push(`In ${j.name} you must be married for at least ${j.marriageMinimumYears} year${j.marriageMinimumYears > 1 ? 's' : ''} before you can apply. ` +
        (j.id === 'northern-ireland' ? 'You may be able to seek a separation order in the meantime.' : ''));
  }

  if (input.connectionToJurisdiction === false)
    blocks.push(`The court needs a jurisdictional connection (usually habitual residence or domicile in ${j.name}). Check the residence/domicile rules or get advice.`);

  // Scotland/NI: a fact must be available
  if (!j.noFault && Array.isArray(input.factsAvailable) && input.factsAvailable.length === 0)
    reasons.push(`${j.name} is fault/separation-based: you must be able to establish one of — ${j.facts.join('; ')}.`);

  const eligible = blocks.length === 0 &&
    (j.marriageMinimumYears === 0 || (Number.isFinite(years) && years >= j.marriageMinimumYears));

  return {
    ok: true, jurisdiction: j.id, jurisdictionName: j.name, noFault: j.noFault,
    eligible, blockers: blocks, notes: reasons,
    ground: j.ground, facts: j.facts, terms: j.terms, feeGBP: j.feeGBP,
    summary: eligible
      ? `On what you’ve entered, you appear able to apply for divorce in ${j.name}.` +
        (j.noFault ? ' No fault or reason needs to be proven.' : ' You will need to establish one of the facts.')
      : `On what you’ve entered, you may not yet be able to apply in ${j.name}. See the blockers.`,
    notAdvice: NOT_ADVICE,
  };
}

// ── the divorce timeline (England & Wales) ────────────────────────────────────
// From the application being ISSUED: 20 weeks (140 days) before you can apply for the CONDITIONAL order;
// then 6 weeks + 1 day (43 days) after the conditional order before you can apply for the FINAL order;
// apply for the final order within 12 months of the conditional order or you must explain the delay.
// Pure: takes the issue date as an ISO string, returns ISO strings — no clock is read.
export function divorceTimeline(input = {}) {
  const j = jur(input.jurisdiction);
  if (!j) return { ok: false, reason: 'Unknown jurisdiction.' };
  if (j.id !== 'england-wales')
    return { ok: true, jurisdiction: j.id, fixedTimeline: false,
      note: `${j.name} does not use the England & Wales 20-week / 6-week-and-1-day structure. Timing depends on ` +
        `the fact relied on (e.g. the separation period) and court procedure. See ${j.name} guidance.` };

  const t0 = parseISO(input.applicationIssuedISO);
  if (!t0) return { ok: false, reason: 'Enter the date the application was issued (YYYY-MM-DD).' };

  const conditionalEarliest = addDays(t0, 140);        // 20 weeks
  const finalEarliest = addDays(conditionalEarliest, 43); // 6 weeks + 1 day AFTER the conditional order
  const finalApplyBy = addMonths(conditionalEarliest, 12);

  return {
    ok: true, jurisdiction: 'england-wales', fixedTimeline: true,
    applicationIssued: toISO(t0),
    conditionalOrderEarliest: toISO(conditionalEarliest),
    finalOrderEarliest: toISO(finalEarliest),
    finalOrderApplyBy: toISO(finalApplyBy),
    minimumTotalDays: 140 + 43,
    minimumTotalWeeks: round2((140 + 43) / 7),
    terms: j.terms,
    steps: [
      { at: toISO(t0), what: 'Application issued by the court (sole or joint).' },
      { at: toISO(conditionalEarliest), what: 'Earliest you can apply for the CONDITIONAL order (20 weeks / 140 days after issue).' },
      { at: toISO(finalEarliest), what: 'Earliest you can apply for the FINAL order (6 weeks + 1 day / 43 days after the conditional order).' },
      { at: toISO(finalApplyBy), what: 'Apply for the final order by around here (within 12 months of the conditional order) or explain the delay.' },
    ],
    note: 'These are the statutory MINIMUM waits; the court and your circumstances can make it longer. ' +
      'Consider sorting FINANCES (a consent order) before the final order — divorcing first can affect some rights.',
    notAdvice: NOT_ADVICE,
  };
}

// ── Child Maintenance Service calculator (2012 scheme, GOV.UK) ─────────────────
// Deterministic estimate of the weekly CMS amount from gross weekly income. This is the standard formula;
// the CMS also handles collect-&-pay fees, variations, and edge cases this does not. Always confirm with
// the official calculator. Rates verified from GOV.UK "How we work out child maintenance".
const CMS = {
  cap: 3000,                                   // gross weekly income cap; above this → apply to court
  flat: 7,
  basic:     { 1: 0.12, 2: 0.16, 3: 0.19 },    // £200–£800
  basicPlus: { 1: 0.09, 2: 0.12, 3: 0.15 },    // portion above £800 (to £3,000)
  reduced:   { 1: 0.17, 2: 0.25, 3: 0.31 },    // £100.01–£199.99, on income above £100 (+ £7)
  otherChildReduction: { 1: 0.11, 2: 0.14, 3: 0.16 }, // reduce income for the payer's other resident children
  // shared care: nights/year the paying parent has the child → reduction to the amount
  sharedCare: [
    { minNights: 175, fraction: 0.5, extraWeekly: 7 },   // 1/2 AND a further £7/week off
    { minNights: 156, fraction: 3 / 7 },                 // 156–174
    { minNights: 104, fraction: 2 / 7 },                 // 104–155
    { minNights: 52,  fraction: 1 / 7 },                 // 52–103
  ],
};
const tier = (n) => (n >= 3 ? 3 : n === 2 ? 2 : 1);

export function cmsMaintenance(input = {}) {
  const children = Math.floor(num(input.children));
  if (!Number.isFinite(children) || children < 1)
    return { ok: false, reason: 'Enter the number of children the maintenance is for (1 or more).' };
  const t = tier(children);
  let gwi = nonNeg(input.grossWeeklyIncome);
  if (!Number.isFinite(gwi)) return { ok: false, reason: 'Enter the paying parent’s gross weekly income (£, a number ≥ 0).' };

  const notes = [];
  let cappedAtCourt = false;
  if (gwi > CMS.cap) { gwi = CMS.cap; cappedAtCourt = true;
    notes.push(`Gross weekly income is above the £${CMS.cap} cap; the estimate uses £${CMS.cap}. The receiving parent can apply to court for a top-up.`); }

  // Nil / flat rate first (benefits or low income). Shared care of 52+ nights can reduce a flat rate to nil.
  if (input.nilRateCircumstances === true)
    return ok0('nil', 0, children, notes.concat('Nil-rate circumstances (e.g. full-time student, prisoner, under 16, or certain benefits).'));
  if (input.onBenefits === true || gwi <= 100) {
    let weekly = gwi < CMS.flat && input.onBenefits !== true ? 0 : CMS.flat;
    let rate = weekly === 0 ? 'nil' : 'flat';
    if (rate === 'flat' && nonNeg(input.sharedCareNights) >= 52) { weekly = 0; rate = 'nil';
      notes.push('Flat rate reduced to nil: shared care of 52+ nights a year.'); }
    return ok0(rate, weekly, children, notes);
  }

  let weekly, rate;
  if (gwi < 200) {
    // Reduced rate: £7 + percentage of the income above £100.
    weekly = CMS.flat + CMS.reduced[t] * (gwi - 100);
    rate = 'reduced';
    notes.push('Reduced rate (income £100.01–£199.99).');
  } else {
    // Basic / Basic-plus. First reduce income for the payer's OTHER resident children, then apply rates.
    const otherCount = Math.max(0, Math.floor(num(input.otherChildren) || 0));
    const hasOther = otherCount > 0;
    const adjusted = hasOther ? gwi * (1 - CMS.otherChildReduction[tier(otherCount)]) : gwi;
    if (hasOther) notes.push(`Income reduced by ${(CMS.otherChildReduction[tier(otherCount)] * 100).toFixed(0)}% for ${otherCount} other child(ren) living with the paying parent.`);
    if (adjusted <= 800) { weekly = CMS.basic[t] * adjusted; rate = 'basic'; notes.push('Basic rate (income £200–£800).'); }
    else { weekly = CMS.basic[t] * 800 + CMS.basicPlus[t] * (adjusted - 800); rate = 'basic-plus'; notes.push('Basic-plus rate (income above £800).'); }
  }

  // Shared care reduction (applies to reduced/basic/basic-plus).
  const nights = nonNeg(input.sharedCareNights);
  let sharedApplied = null;
  if (Number.isFinite(nights) && nights >= 52) {
    const band = CMS.sharedCare.find((b) => nights >= b.minNights);
    if (band) {
      weekly = weekly * (1 - band.fraction) - (band.extraWeekly || 0);
      if (weekly < 0) weekly = 0;
      sharedApplied = { nights, reductionFraction: band.fraction, extraWeekly: band.extraWeekly || 0 };
      notes.push(`Shared care reduction for ${nights} nights/year (−${(band.fraction * 100).toFixed(2)}%${band.extraWeekly ? ` and −£${band.extraWeekly}/week` : ''}).`);
    }
  }

  weekly = round2(weekly);
  return {
    ok: true, rate, children,
    weekly, monthly: round2((weekly * 52) / 12), annual: round2(weekly * 52),
    grossWeeklyIncomeUsed: gwi, cappedAtCourt, sharedCare: sharedApplied, notes,
    disclaimer: 'Estimate only, using the standard 2012-scheme formula. Use the official calculator at GOV.UK for your exact figure.',
    notAdvice: NOT_ADVICE,
  };
}
function ok0(rate, weekly, children, notes) {
  return { ok: true, rate, children, weekly: round2(weekly), monthly: round2((weekly * 52) / 12),
    annual: round2(weekly * 52), notes, disclaimer: 'Estimate only. Confirm with the official GOV.UK calculator.', notAdvice: NOT_ADVICE };
}

// ── financial provision — the s.25 factors (England & Wales) ───────────────────
// The divorce ENDS the marriage; splitting money/property/pensions is a SEPARATE process. A court (or the
// parties by consent order) weighs the Matrimonial Causes Act 1973 s.25 factors. First consideration: the
// welfare of any child under 18. This returns the checklist + a neutral snapshot of the pot — NOT a division.
export function s25Factors() {
  return {
    firstConsideration: 'The welfare, while a minor, of any child of the family under 18 (MCA 1973 s.25(1)).',
    factors: [
      { ref: 's.25(2)(a)', label: 'Income, earning capacity, property and other financial resources of each party (now and foreseeable).' },
      { ref: 's.25(2)(b)', label: 'Financial needs, obligations and responsibilities of each party (now and foreseeable).' },
      { ref: 's.25(2)(c)', label: 'The standard of living enjoyed by the family before the breakdown.' },
      { ref: 's.25(2)(d)', label: 'The age of each party and the duration of the marriage.' },
      { ref: 's.25(2)(e)', label: 'Any physical or mental disability of either party.' },
      { ref: 's.25(2)(f)', label: 'Contributions each has made or will make to the family’s welfare, including looking after the home or caring for the family.' },
      { ref: 's.25(2)(g)', label: 'Conduct, if it would be inequitable to disregard it.' },
      { ref: 's.25(2)(h)', label: 'The value of any benefit either party will lose the chance of acquiring (e.g. a pension on divorce).' },
    ],
    orders: ['maintenance (periodical payments)', 'lump sum', 'property adjustment / transfer', 'pension sharing or attachment', 'a clean break (no ongoing claims)'],
    process: 'If you agree, put it in a consent order for the court to approve; if not, apply for a financial order. ' +
      'Most cases start with a MIAM (mediation information meeting). Pensions are often the biggest asset — get them valued.',
    source: SOURCES.mca_1973_s25, notAdvice: NOT_ADVICE,
  };
}

// A neutral snapshot of the matrimonial pot. NOT a division and NOT a recommendation — starting-point maths
// only. Splitting depends on the s.25 factors and needs, which no formula can decide.
export function financialSnapshot(input = {}) {
  const assets = sumMoney(input.assets), debts = sumMoney(input.debts), pensions = sumMoney(input.pensions);
  const net = round2(assets - debts);
  return {
    ok: true, assets, debts, pensions, netNonPension: net, totalIncludingPensions: round2(net + pensions),
    halfNetNonPension: round2(net / 2),
    caution: 'A 50/50 split is a common STARTING POINT for long marriages, but the outcome turns on needs and ' +
      'the s.25 factors — especially housing for children and pension fairness. This is not a recommendation.',
    notAdvice: NOT_ADVICE,
  };
}

// ── date helpers (pure) ────────────────────────────────────────────────────────
function parseISO(s) {
  if (typeof s !== 'string') return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null; // reject 2023-02-30
  return dt;
}
function addDays(dt, n) { return new Date(dt.getTime() + n * 86400000); }
function addMonths(dt, n) {
  const d = new Date(dt.getTime());
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + n);
  if (d.getUTCDate() < day) d.setUTCDate(0); // clamp end-of-month
  return d;
}
function toISO(dt) { return dt.toISOString().slice(0, 10); }
function sumMoney(list) {
  if (!Array.isArray(list)) { const n = nonNeg(list); return Number.isFinite(n) ? round2(n) : 0; }
  let total = 0;
  for (const item of list) {
    const v = typeof item === 'object' && item ? nonNeg(item.value) : nonNeg(item);
    if (Number.isFinite(v)) total += v;
  }
  return round2(total);
}

export default {
  JURISDICTIONS, NOT_ADVICE, SAFETY, SOURCES,
  assessEligibility, divorceTimeline, cmsMaintenance, s25Factors, financialSnapshot,
};
