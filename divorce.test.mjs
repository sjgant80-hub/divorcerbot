import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assessEligibility, divorceTimeline, cmsMaintenance, s25Factors, financialSnapshot,
  JURISDICTIONS, NOT_ADVICE, SAFETY,
} from './divorce.mjs';

// ── jurisdiction & eligibility ────────────────────────────────────────────────
test('the three UK jurisdictions are kept distinct — E&W no-fault, Scotland & NI not', () => {
  assert.equal(JURISDICTIONS['england-wales'].noFault, true);
  assert.equal(JURISDICTIONS['scotland'].noFault, false);
  assert.equal(JURISDICTIONS['northern-ireland'].noFault, false);
  assert.equal(JURISDICTIONS['england-wales'].marriageMinimumYears, 1);
  assert.equal(JURISDICTIONS['northern-ireland'].marriageMinimumYears, 2);
  assert.equal(JURISDICTIONS['scotland'].marriageMinimumYears, 0);
});

test('E&W: married over a year → eligible, no fact needed', () => {
  const r = assessEligibility({ jurisdiction: 'england-wales', marriedYears: 3, marriageRecognised: true });
  assert.equal(r.eligible, true);
  assert.equal(r.noFault, true);
  assert.equal(r.blockers.length, 0);
});

test('E&W: married under a year → blocked by the 1-year bar', () => {
  const r = assessEligibility({ jurisdiction: 'england-wales', marriedYears: 0.5, marriageRecognised: true });
  assert.equal(r.eligible, false);
  assert.ok(r.blockers.some(b => /at least 1 year/.test(b)));
});

test('NI: married 1 year → blocked (needs 2); a fault/separation fact is required', () => {
  const r = assessEligibility({ jurisdiction: 'northern-ireland', marriedYears: 1, marriageRecognised: true });
  assert.equal(r.eligible, false);
  assert.ok(r.blockers.some(b => /at least 2 years/.test(b)));
  assert.equal(r.noFault, false);
  assert.ok(r.facts.length === 5, 'NI still has the five facts');
});

test('Scotland: no 1-year bar, but it is fault/separation-based', () => {
  const r = assessEligibility({ jurisdiction: 'scotland', marriedYears: 0, marriageRecognised: true });
  assert.equal(r.eligible, true, 'no minimum-marriage bar in Scotland');
  assert.equal(r.noFault, false);
  assert.ok(r.facts.includes('Adultery'));
});

test('unknown jurisdiction is rejected, never guessed', () => {
  const r = assessEligibility({ jurisdiction: 'narnia', marriedYears: 5 });
  assert.equal(r.ok, false);
  assert.equal(r.eligible, false);
});

test('a non-UK-connection blocks (jurisdictional gate) and never throws', () => {
  const r = assessEligibility({ jurisdiction: 'england-wales', marriedYears: 3, marriageRecognised: true, connectionToJurisdiction: false });
  assert.equal(r.eligible, false);
  assert.ok(r.blockers.some(b => /habitual residence|domicile/.test(b)));
});

// ── the E&W timeline ──────────────────────────────────────────────────────────
test('E&W timeline: 20 weeks (140d) to conditional, then 6 weeks + 1 day (43d) to final', () => {
  const iss = '2024-01-01';
  const r = divorceTimeline({ jurisdiction: 'england-wales', applicationIssuedISO: iss });
  const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  assert.equal(r.ok, true);
  assert.equal(days(iss, r.conditionalOrderEarliest), 140, '20 weeks to the conditional order');
  assert.equal(days(r.conditionalOrderEarliest, r.finalOrderEarliest), 43, '6 weeks + 1 day to the final order');
  assert.equal(r.minimumTotalDays, 183);
  assert.equal(r.terms.finalOrder, 'final order');
});

test('E&W timeline rejects a bad date, and non-E&W has no fixed timeline', () => {
  assert.equal(divorceTimeline({ jurisdiction: 'england-wales', applicationIssuedISO: '2024-02-30' }).ok, false);
  const sc = divorceTimeline({ jurisdiction: 'scotland', applicationIssuedISO: '2024-01-01' });
  assert.equal(sc.fixedTimeline, false);
});

// ── CMS calculator (verified worked examples) ─────────────────────────────────
test('CMS basic rate: 12/16/19% of gross weekly income for 1/2/3 children', () => {
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1 }).weekly, 60);   // 12% × 500
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 2 }).weekly, 80);   // 16% × 500
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 3 }).weekly, 95);   // 19% × 500
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 4 }).weekly, 95);   // capped tier at 3+
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1 }).rate, 'basic');
});

test('CMS basic-plus: 12% of first £800 + 9% of the remainder (1 child, £1000)', () => {
  const r = cmsMaintenance({ grossWeeklyIncome: 1000, children: 1 });
  assert.equal(r.weekly, 114);   // 0.12×800 + 0.09×200 = 96 + 18
  assert.equal(r.rate, 'basic-plus');
});

test('CMS reduced rate: £7 + 17% of income over £100 (1 child, £150)', () => {
  const r = cmsMaintenance({ grossWeeklyIncome: 150, children: 1 });
  assert.equal(r.weekly, 15.5);  // 7 + 0.17×50
  assert.equal(r.rate, 'reduced');
});

test('CMS flat rate £7 on low income / benefits; nil below £7', () => {
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 80, children: 2 }).weekly, 7);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1, onBenefits: true }).weekly, 7);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 5, children: 1 }).weekly, 0);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1, nilRateCircumstances: true }).weekly, 0);
});

test('CMS reduces income for the payer’s other resident children (11% for 1 other)', () => {
  const r = cmsMaintenance({ grossWeeklyIncome: 600, children: 1, otherChildren: 1 });
  assert.equal(r.weekly, 64.08);  // 600×0.89 = 534; 12%×534
});

test('CMS shared care: 175+ nights → halve then take a further £7 off', () => {
  const r = cmsMaintenance({ grossWeeklyIncome: 500, children: 1, sharedCareNights: 175 });
  assert.equal(r.weekly, 23);     // 60 × 0.5 − 7
  const r2 = cmsMaintenance({ grossWeeklyIncome: 500, children: 1, sharedCareNights: 52 });
  assert.equal(r2.weekly, 51.43); // 60 × (1 − 1/7)
});

test('CMS caps gross weekly income at £3,000 and flags the court top-up route', () => {
  const r = cmsMaintenance({ grossWeeklyIncome: 4000, children: 1 });
  assert.equal(r.grossWeeklyIncomeUsed, 3000);
  assert.equal(r.cappedAtCourt, true);
  assert.equal(r.weekly, 294);   // 0.12×800 + 0.09×2200 = 96 + 198
});

test('CMS never throws on bad input; needs a valid child count and income', () => {
  assert.equal(cmsMaintenance({ children: 0 }).ok, false);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: -5, children: 1 }).ok, false);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 'lots', children: 1 }).ok, false);
});

// ── hardening: exact boundaries a legal calculator must get right ─────────────
test('CMS £7 boundary: income exactly £7 is flat (£7), income £0 is nil (£0)', () => {
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 7, children: 1 }).weekly, 7);   // flat, not nil
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 7, children: 1 }).rate, 'flat');
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 0, children: 1 }).weekly, 0);   // valid input, nil
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 0, children: 1 }).rate, 'nil');
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 5, children: 1 }).rate, 'nil');
});

test('CMS cap boundary: exactly £3,000 is NOT flagged for court; £3,000.01 uses the cap', () => {
  const at = cmsMaintenance({ grossWeeklyIncome: 3000, children: 1 });
  assert.equal(at.cappedAtCourt, false);
  assert.equal(at.weekly, 294);                                                    // 0.12×800 + 0.09×2200
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 3000.01, children: 1 }).cappedAtCourt, true);
});

test('CMS flat rate drops to nil with 52+ shared-care nights (and records extraWeekly honestly)', () => {
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 80, children: 1, sharedCareNights: 52 }).weekly, 0);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 80, children: 1, sharedCareNights: 51 }).weekly, 7); // 51 < 52
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1, sharedCareNights: 52 }).sharedCare.extraWeekly, 0);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1, sharedCareNights: 175 }).sharedCare.extraWeekly, 7);
});

test('CMS shared-care band edges: 104 and 156 nights step up (2/7, 3/7)', () => {
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 700, children: 1, sharedCareNights: 104 }).sharedCare.reductionFraction, 2 / 7);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 700, children: 1, sharedCareNights: 103 }).sharedCare.reductionFraction, 1 / 7);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 700, children: 1, sharedCareNights: 156 }).sharedCare.reductionFraction, 3 / 7);
});

test('CMS rejects an invalid child count even when income is valid', () => {
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 0 }).ok, false);
});

test('eligibility year boundary: E&W at exactly 1 year is eligible; the blocker reads "1 year" (singular)', () => {
  assert.equal(assessEligibility({ jurisdiction: 'england-wales', marriedYears: 1, marriageRecognised: true }).eligible, true);
  const blocked = assessEligibility({ jurisdiction: 'england-wales', marriedYears: 0.9, marriageRecognised: true });
  assert.equal(blocked.eligible, false);
  assert.ok(blocked.blockers.some(b => /1 year\b/.test(b) && !/1 years/.test(b)), 'singular "1 year"');
});

test('non-finite years (Infinity) is not eligible — a real, finite number is required', () => {
  assert.equal(assessEligibility({ jurisdiction: 'england-wales', marriedYears: Infinity, marriageRecognised: true }).eligible, false);
});

test('Scotland with no years entered is still eligible and gets no spurious year prompt', () => {
  const r = assessEligibility({ jurisdiction: 'scotland', marriageRecognised: true });
  assert.equal(r.eligible, true);
  assert.ok(!r.notes.some(n => /at least 0/.test(n)));
});

test('NI blocker mentions a separation order; E&W blocker does not', () => {
  assert.ok(assessEligibility({ jurisdiction: 'northern-ireland', marriedYears: 1, marriageRecognised: true }).blockers.some(b => /separation order/.test(b)));
  assert.ok(!assessEligibility({ jurisdiction: 'england-wales', marriedYears: 0.5, marriageRecognised: true }).blockers.some(b => /separation order/.test(b)));
});

test('a fault jurisdiction with no facts gets the "establish a fact" note; a no-fault one never does', () => {
  assert.ok(assessEligibility({ jurisdiction: 'scotland', marriedYears: 2, factsAvailable: [] }).notes.some(n => /establish one of/.test(n)));
  assert.ok(!assessEligibility({ jurisdiction: 'scotland', marriedYears: 2, factsAvailable: ['Adultery'] }).notes.some(n => /establish one of/.test(n)));
  assert.ok(!assessEligibility({ jurisdiction: 'england-wales', marriedYears: 3, factsAvailable: [] }).notes.some(n => /establish one of/.test(n)));
});

test('timeline apply-by date is exactly 12 months after the conditional order (same day of month)', () => {
  const r = divorceTimeline({ jurisdiction: 'england-wales', applicationIssuedISO: '2024-01-01' });
  const c = new Date(r.conditionalOrderEarliest + 'T00:00:00Z');
  const applyBy = new Date(r.finalOrderApplyBy + 'T00:00:00Z');
  assert.equal(applyBy.getUTCDate(), c.getUTCDate(), 'day of month preserved (month-clamp not misfiring)');
  assert.equal((applyBy.getUTCFullYear() - c.getUTCFullYear()) * 12 + (applyBy.getUTCMonth() - c.getUTCMonth()), 12);
});

// ── financial / s.25 ──────────────────────────────────────────────────────────
test('s25Factors lists all eight statutory factors + the child-welfare first consideration', () => {
  const s = s25Factors();
  assert.equal(s.factors.length, 8);
  assert.ok(/welfare/.test(s.firstConsideration));
  assert.ok(s.factors.some(f => f.ref === 's.25(2)(f)' && /home|caring/.test(f.label)));
});

test('financialSnapshot is a neutral pot snapshot, not a division', () => {
  const r = financialSnapshot({ assets: [100000, { value: 20000 }], debts: 30000, pensions: 50000 });
  assert.equal(r.assets, 120000);
  assert.equal(r.netNonPension, 90000);   // 120000 − 30000
  assert.equal(r.halfNetNonPension, 45000);
  assert.equal(r.totalIncludingPensions, 140000);
  assert.ok(/not a recommendation/i.test(r.caution));
});

// ── guardrails ────────────────────────────────────────────────────────────────
test('every result carries the not-advice guardrail and the safety helpline exists', () => {
  assert.ok(/not legal advice/i.test(NOT_ADVICE));
  assert.equal(assessEligibility({ jurisdiction: 'england-wales', marriedYears: 3 }).notAdvice, NOT_ADVICE);
  assert.equal(cmsMaintenance({ grossWeeklyIncome: 500, children: 1 }).notAdvice, NOT_ADVICE);
  assert.ok(/0808 2000 247/.test(SAFETY.refuge_national_da_helpline));
});
