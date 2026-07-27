// ════════════════════════════════════════════════════════════════
// divorcerbot · precedents.mjs — a VERIFIED, cited case-law engine for England & Wales financial remedy
//
// Discipline (from the estate's legal builds): every citation is a real, reported case, sourced to a public
// reference, and described by its actual holding. Nothing here is invented. This maps a fact-pattern to the
// authorities that bear on it and states BOTH sides — it is argument scaffolding, not a prediction and NOT
// legal advice. Financial-remedy outcomes are discretionary (MCA 1973 s.25); only a court decides.
//
// Scope: England & Wales financial remedy. Scotland (Family Law (Scotland) Act 1985) and Northern Ireland
// differ — these authorities do not apply there.
// ════════════════════════════════════════════════════════════════

export const NOT_ADVICE =
  'Case-law information, not legal advice. Outcomes under MCA 1973 s.25 are discretionary and fact-specific. ' +
  'Get a solicitor before relying on any of this.';

// ── the corpus (all real, all sourced) ────────────────────────────────────────
export const CASES = {
  wright: {
    id: 'wright', name: 'Wright v Wright', citation: '[2015] EWCA Civ 201', court: 'Court of Appeal', year: 2015,
    source: 'https://www.familylawweek.co.uk/judgments/wright-v-wright-2015-ewca-civ-201/',
    principle: 'A spouse with an earning capacity is generally expected to use it; long-term "joint lives" ' +
      'maintenance is not a guaranteed "meal ticket for life".',
    holding: 'The Court of Appeal upheld the reduction and phased termination (over ~5 years) of the ex-wife\'s ' +
      'spousal maintenance. A capable former spouse, particularly once children are older, can be expected to ' +
      'work towards financial independence rather than rely indefinitely on the other.',
    tags: ['earning-capacity', 'clean-break', 'spousal-maintenance'],
  },
  thomas: {
    id: 'thomas', name: 'Thomas v Thomas', citation: '[1995] 2 FLR 668', court: 'Court of Appeal (Waite LJ)', year: 1995,
    source: 'https://financialremediesjournal.com/thomas-v-thomas-1995-2-flr-668-ca/',
    principle: '"Judicious encouragement": where a spouse enjoys access to wealth without an absolute ' +
      'entitlement (a discretionary trust beneficiary, or someone dependent on a relative\'s generosity), the ' +
      'court may frame orders assuming that money is likely to be made available.',
    holding: 'The court may afford "judicious encouragement" to a third party (e.g. a wealthy family) to ' +
      'provide funds, and may assume resources likely to be made available — but it CANNOT compel a third ' +
      'party, must not apply improper pressure, and must be satisfied the third party would be likely to respond.',
    tags: ['family-resources', 'third-party-assets'],
  },
  prest: {
    id: 'prest', name: 'Prest v Petrodel Resources Ltd', citation: '[2013] UKSC 34', court: 'Supreme Court', year: 2013,
    source: 'https://www.bailii.org/uk/cases/UKSC/2013/34.html',
    principle: 'Assets held in another name (a company, or on the facts a third party) can be beneficially owned ' +
      'by the spouse under a resulting trust, and so form part of the assets available on divorce.',
    holding: 'Properties legally owned by the husband\'s companies were held on a purchase-money resulting trust ' +
      'for him — he was the true beneficial owner — and could be transferred to the wife. (The corporate veil ' +
      'was NOT pierced; the result came through ordinary trust law and the inference that he had provided the money.)',
    tags: ['beneficial-ownership', 'third-party-assets'],
  },
  rubin: {
    id: 'rubin', name: 'Rubin v Rubin', citation: '[2014] EWHC 611 (Fam)', court: 'High Court (Mostyn J)', year: 2014,
    source: 'https://www.bailii.org/ew/cases/EWHC/Fam/2014/611.html',
    principle: 'A Legal Services Payment Order (MCA 1973 s.22ZA) can require the better-resourced spouse to fund ' +
      'the other\'s legal costs, so a lack of money is not a bar to being represented.',
    holding: 'Mostyn J set out the governing principles for LSPOs: the applicant must show they cannot reasonably ' +
      'obtain legal services any other way (including that they cannot get a litigation loan and no solicitor will ' +
      'act under a Sears Tooth charge); the respondent\'s ability to pay is assessed on the s.22ZB factors and, ' +
      'where disclosure is deficient, the court may make robust assumptions about their means; a doubtful ' +
      'substantive claim is judged with caution.',
    tags: ['costs', 'lspo', 'level-playing-field'],
  },
  reC: {
    id: 'reC', name: 'Re C (Internal Relocation)', citation: '[2015] EWCA Civ 1305', court: 'Court of Appeal', year: 2015,
    source: 'https://www.bailii.org/ew/cases/EWCA/Civ/2015/1305.html',
    principle: 'On a proposed move WITHIN the UK, the child\'s welfare is the paramount and only test — there is no ' +
      'separate "exceptionality" hurdle for internal relocation.',
    holding: 'The Court of Appeal confirmed that internal-relocation disputes are decided by the s.1 Children Act ' +
      '1989 welfare test (and checklist), the same paramountcy test as any other private-law children question; ' +
      'earlier relocation "guidance" is a factor to weigh, not a gloss on the welfare test.',
    tags: ['children', 'relocation', 'welfare'],
  },
};

// ── statutory anchors (from legislation.gov.uk) ───────────────────────────────
export const STATUTE = {
  s25_2a: {
    ref: 'MCA 1973 s.25(2)(a)',
    text: 'The court must consider the income, earning capacity, property and other financial resources which ' +
      'each party has or is likely to have — including "any increase in earning capacity which it would ... be ' +
      'reasonable to expect a party to the marriage to take steps to acquire".',
    source: 'https://www.legislation.gov.uk/ukpga/1973/18/section/25',
  },
  s25A: {
    ref: 'MCA 1973 s.25A',
    text: 'The court has a duty to consider whether financial obligations between the parties can be ended as ' +
      'soon as is just and reasonable (the "clean break" duty), including by a term/fixed-period maintenance order.',
    source: 'https://www.legislation.gov.uk/ukpga/1973/18/section/25A',
  },
  s25_2e: {
    ref: 'MCA 1973 s.25(2)(e)',
    text: 'The court considers any physical or mental disability of either party — but it must be properly ' +
      'evidenced and its actual effect on that party\'s needs and earning capacity shown, not assumed from a label.',
    source: 'https://www.legislation.gov.uk/ukpga/1973/18/section/25',
  },
  s22ZA: {
    ref: 'MCA 1973 s.22ZA',
    text: 'The court may order one party to pay an amount to enable the other to obtain legal services for the ' +
      'proceedings (a Legal Services Payment Order) — the statutory route to level a funding imbalance.',
    source: 'https://www.legislation.gov.uk/ukpga/1973/18/section/22ZA',
  },
  ca1989_s1: {
    ref: 'Children Act 1989 s.1',
    text: 'The child\'s welfare is the court\'s PARAMOUNT consideration (s.1(1)); the court applies the welfare ' +
      'checklist (s.1(3)) — including the child\'s wishes (by age/understanding), needs, the likely effect of ' +
      'change, and any harm — and makes no order unless doing so is better for the child than none (s.1(5)).',
    source: 'https://www.legislation.gov.uk/ukpga/1989/41/section/1',
  },
};

const asBool = (v) => v === true;
const nonEmpty = (v) => (Array.isArray(v) ? v.length > 0 : !!v);
const cite = (c) => ({ name: c.name, citation: c.citation, court: c.court, source: c.source, principle: c.principle, holding: c.holding });

// ── the analyzer ──────────────────────────────────────────────────────────────
// Map a structured fact-pattern to the authorities that bear on it. Deterministic and even-handed: each
// argument comes with the counter-argument and the evidence that would actually be needed to run it.
//
// facts: {
//   underEmployed: bool,            // earning materially below capacity
//   qualifications: [string],       // e.g. ['MA English', 'PGCE']
//   formerRole: string,             // e.g. 'Head of English'
//   formerSalaryGBP: number,        // e.g. 75000
//   currentRole: string,            // e.g. 'part-time vocal coach'
//   youngChildren: bool,            // children under school age / caring responsibilities
//   healthLimits: bool,             // genuine health reasons not to work
//   assetsInThirdPartyName: [string], // e.g. ['house gifted by parents, held in parents\' name']
//   fundedByCoupleOrSpouse: bool,   // was that asset paid for by the couple / the spouse?
//   familyWealth: bool,             // a wealthy family that has supported them
// }
export function caseStrategy(facts = {}) {
  facts = facts || {};
  const args = [];

  // 1) Earning capacity — the under-employed but qualified spouse.
  if (asBool(facts.underEmployed) || nonEmpty(facts.qualifications) || facts.formerRole) {
    const uplift = [];
    if (nonEmpty(facts.qualifications)) uplift.push(`qualifications (${[].concat(facts.qualifications).join(', ')})`);
    if (facts.formerRole) uplift.push(`a prior senior role (${facts.formerRole})`);
    if (Number.isFinite(facts.formerSalaryGBP)) uplift.push(`a proven earning history (~£${facts.formerSalaryGBP.toLocaleString('en-GB')})`);
    args.push({
      theme: 'Imputed earning capacity',
      precedents: [cite(CASES.wright)],
      statute: [STATUTE.s25_2a, STATUTE.s25A],
      argument: `The court considers not just what a party earns but what they could reasonably earn. Given ${uplift.join(', ') || 'their background'}` +
        `${facts.currentRole ? `, working only as ${facts.currentRole} may understate that capacity` : ''}. On the Wright v Wright line, a capable ` +
        `former spouse is expected to move towards independence; press for a TERM maintenance order or clean break under s.25A rather than joint-lives support, ` +
        `with income imputed at a level their history and qualifications support.`,
      counterpoint: `The court will not impute an unrealistic income. Genuine constraints defeat it: ${[
        facts.youngChildren ? 'caring for young children' : null,
        facts.healthLimits ? 'health limitations' : null,
        'time needed to retrain/re-enter the profession', 'the actual local job market and current salaries',
      ].filter(Boolean).join('; ')}. Earning capacity is also not itself a matrimonial asset to be shared.`,
      evidenceNeeded: ['employment history / references', 'the qualifications themselves', 'current vacancies & salary data for the role', 'any health evidence', 'the children\'s ages and care arrangements'],
    });
  }

  // 2) Assets held in a third party's name / family wealth as a resource.
  if (nonEmpty(facts.assetsInThirdPartyName) || asBool(facts.familyWealth)) {
    const precedents = [];
    if (nonEmpty(facts.assetsInThirdPartyName)) precedents.push(cite(CASES.prest));
    if (asBool(facts.familyWealth)) precedents.push(cite(CASES.thomas));
    args.push({
      theme: 'Assets held in another name / family resources',
      precedents,
      statute: [STATUTE.s25_2a],
      argument: (nonEmpty(facts.assetsInThirdPartyName)
        ? `An asset held in someone else\'s name (${[].concat(facts.assetsInThirdPartyName).join('; ')}) is not automatically out of reach. ` +
          `If it was paid for with the couple\'s or the spouse\'s money, Prest v Petrodel supports a RESULTING/CONSTRUCTIVE TRUST argument: legal title ` +
          `sits with the third party but beneficial ownership — and therefore the value — belongs to the spouse and enters the pot. `
        : '') +
        (asBool(facts.familyWealth)
          ? `Even where the asset is genuinely the family\'s, Thomas v Thomas lets the court treat wealth the spouse can realistically expect from a ` +
            `generous family as a "resource likely to be made available", and frame orders that give the family "judicious encouragement" to provide.`
          : ''),
      counterpoint: `Limits apply: the court cannot ORDER a third party (the parents) to pay — Thomas only permits encouragement, and only where the family ` +
        `would be likely to respond. A resulting-trust claim needs evidence that the spouse (not the parents) really provided the money; if the parents ` +
        `genuinely funded and own it as a true gift to themselves, it may sit outside the marital pot. Joining the third party to proceedings may be required.`,
      evidenceNeeded: ['how the property was funded (bank records, conveyancing file)', 'title register & any declaration of trust', 'gift/loan documentation', 'the family\'s history of financial support', 'occupation / who lives there'],
    });
  }

  // 3) Level the funding field — a Legal Services Payment Order.
  if (asBool(facts.fundingImbalance) || asBool(facts.opponentFamilyFunded)) {
    args.push({
      theme: 'Level the funding field (Legal Services Payment Order)',
      precedents: [cite(CASES.rubin)],
      statute: [STATUTE.s22ZA],
      argument: 'A funding imbalance is not something you have to simply absorb. Under MCA 1973 s.22ZA and the Rubin v Rubin ' +
        'principles you can apply for a Legal Services Payment Order requiring the better-resourced spouse to fund your ' +
        'reasonable legal costs.' + (asBool(facts.opponentFamilyFunded)
          ? ' Where their litigation is bankrolled by wealthy parents, that same family support is itself evidence of resources likely ' +
            'available (Thomas v Thomas), and deficient financial disclosure lets the court make robust assumptions about their ability to pay.'
          : ''),
      counterpoint: 'You must first show you genuinely cannot fund representation another way (no litigation loan available, no solicitor ' +
        'will act on a deferred/Sears Tooth basis). If your own substantive claim looks weak, the court applies caution.',
      evidenceNeeded: ['refusals for litigation loans', 'evidence solicitors won\'t act on deferred terms', 'the other side\'s means / family funding', 'your own income & outgoings'],
    });
  }

  // 4) The pension — answering "she wants the whole pension".
  if (asBool(facts.pensionInDispute) || asBool(facts.militaryPension)) {
    const yrs = Number.isFinite(facts.separatedYearsAgo) ? facts.separatedYearsAgo : null;
    args.push({
      theme: 'Pension — a fair share, not the whole pension' + (asBool(facts.militaryPension) ? ' (Armed Forces Pension)' : ''),
      precedents: [],
      statute: [STATUTE.s25_2a],
      argument: 'Pensions are shared to achieve FAIRNESS, usually of the MARITAL portion — not handed over whole. The court can ring-fence ' +
        'accrual from before the marriage and, often, accrual AFTER separation' + (yrs ? ` (here ~${yrs} years since separation)` : '') +
        '. For a defined-benefit scheme like the Armed Forces Pension, get a CETV and a PODE (Pension on Divorce Expert) report so the ' +
        'sharing equalises retirement INCOME rather than blindly splitting the fund value.',
      counterpoint: 'Against ring-fencing: in a long marriage with needs to meet (especially housing for the children), the court may still ' +
        'share the whole pension to meet those needs — needs can trump the marital-acquest argument. Apportionment is discretionary, not automatic.',
      evidenceNeeded: ['CETV of every pension (both parties)', 'a PODE report', 'dates: marriage, cohabitation, separation', 'pre-marital service record', 'both parties\' retirement income needs'],
    });
  }

  // 5) The children — relocation & meaningful time (welfare-first, not "rights-first").
  if (asBool(facts.childrenRelocated) || asBool(facts.contactObstructed) || asBool(facts.wantsSharedTime)) {
    args.push({
      theme: 'Children — relocation & meaningful time',
      precedents: [cite(CASES.reC)],
      statute: [STATUTE.ca1989_s1],
      argument: 'Frame this around the CHILDREN\'S welfare, which is paramount (Children Act 1989 s.1). A move of ' +
        `${Number.isFinite(facts.relocationDistanceMiles) ? `~${facts.relocationDistanceMiles} miles` : 'a significant distance'} that cuts ` +
        'across the children\'s relationship with a willing, capable parent, and obstruction of contact, are weighed under the welfare ' +
        'checklist — the likely effect of the change on the children and the value to them of a full relationship with both parents. ' +
        'Internal relocation is decided on that same welfare test (Re C), with no automatic right to move. Apply for a Child Arrangements ' +
        'Order for substantial, regular time.',
      counterpoint: 'This is decided by the children\'s welfare, NOT a parent\'s entitlement — the court will not order a 50/50 split as a ' +
        'formula. The children\'s settled situation, their own wishes (by age), the primary carer\'s position and the practical distance all ' +
        'weigh. Note: the s.1(2A) "presumption of parental involvement" was announced for repeal in Oct 2025 — rely on welfare + the checklist, not the presumption.',
      evidenceNeeded: ['a parenting plan / the time you seek', 'your involvement history with the girls', 'the impact of the distance on schooling & contact', 'any messages showing contact being obstructed', 'CAFCASS will assess welfare'],
    });
  }

  // 6) A recent diagnosis relied on tactically — test the evidence, do not stigmatise.
  if (asBool(facts.recentDiagnosisTactical)) {
    args.push({
      theme: 'Scrutinise a recent diagnosis relied on in the case',
      precedents: [],
      statute: [STATUTE.s25_2e],
      argument: 'A medical condition is relevant (s.25(2)(e)) but it must be PROPERLY EVIDENCED and its actual effect shown. A diagnosis on ' +
        'its own does not establish an inability to work — many people with the same diagnosis work at a senior level — so it does not, by ' +
        'itself, defeat the earning-capacity argument. Nor does a diagnosis, without more, justify restricting the other parent\'s time with ' +
        'the children. Ask for the underlying medical evidence and how, specifically, it bears on earning capacity and on the children\'s welfare.',
      counterpoint: 'Be careful and fair: if the condition is genuinely evidenced and does reduce capacity or affect care, the court will give it ' +
        'proper weight. Attacking a health condition in bad faith reflects badly on you — keep it to a proportionate request for evidence, not a slur.',
      evidenceNeeded: ['the actual medical report / diagnosis basis', 'when and why it was obtained', 'occupational-health or expert evidence on its effect', 'her actual functioning (e.g. running a coaching business)'],
    });
  }

  return {
    jurisdiction: 'england-wales',
    arguments: args,
    summary: args.length
      ? `${args.length} line(s) of argument identified, each with the authority, the counter-argument, and the evidence you would need.`
      : 'No specific financial-remedy argument matched the facts entered. The general s.25 factors still apply.',
    caution: 'Discretionary jurisdiction — these authorities inform, they do not determine. Every case turns on its own facts and needs.',
    notAdvice: NOT_ADVICE,
  };
}

// Return the whole cited corpus (for a "case library" view).
export function library() { return Object.values(CASES).map(cite); }

export default { CASES, STATUTE, caseStrategy, library, NOT_ADVICE };
