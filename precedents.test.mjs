import { test } from 'node:test';
import assert from 'node:assert/strict';
import { caseStrategy, library, CASES, STATUTE, NOT_ADVICE } from './precedents.mjs';

// The scenario the tool was asked to handle: a qualified, high-earning-history spouse now working part-time,
// plus a house the wealthy parents provided but hold in their own name.
const SCENARIO = {
  underEmployed: true,
  qualifications: ['MA English', 'PGCE'],
  formerRole: 'Head of English',
  formerSalaryGBP: 75000,
  currentRole: 'part-time vocal coach',
  assetsInThirdPartyName: ["house provided by her parents, held in the parents' name"],
  familyWealth: true,
  fundingImbalance: true,
  opponentFamilyFunded: true,
  militaryPension: true,
  pensionInDispute: true,
  separatedYearsAgo: 4,
  childrenRelocated: true,
  relocationDistanceMiles: 120,
  contactObstructed: true,
  wantsSharedTime: true,
  recentDiagnosisTactical: true,
};

test('the corpus is real and sourced — every case has a citation, court and source URL', () => {
  for (const c of Object.values(CASES)) {
    assert.ok(/\[\d{4}\]/.test(c.citation), `${c.name} has a real neutral citation`);
    assert.ok(c.court && c.source?.startsWith('http'), `${c.name} is sourced`);
    assert.ok(c.holding.length > 40, `${c.name} states its actual holding`);
  }
});

test('the full scenario surfaces all six argument lines', () => {
  const r = caseStrategy(SCENARIO);
  assert.equal(r.arguments.length, 6);
  const themes = r.arguments.map(a => a.theme).join(' | ');
  for (const need of [/earning capacity/i, /another name|family resources/i, /funding field/i, /Pension/i, /Children/i, /diagnosis/i])
    assert.match(themes, need);
});

test('LSPO argument cites Rubin v Rubin and s.22ZA — the funding leveller', () => {
  const a = caseStrategy(SCENARIO).arguments.find(a => /funding field/i.test(a.theme));
  assert.ok(a.precedents.some(p => /Rubin/.test(p.name)));
  assert.ok(a.statute.some(s => s.ref === 'MCA 1973 s.22ZA'));
  assert.match(a.argument, /parents/);   // family-funded litigation used against the needs claim
});

test('pension argument resists "the whole pension" via marital acquest + names the post-separation years', () => {
  const a = caseStrategy(SCENARIO).arguments.find(a => /Pension/i.test(a.theme));
  assert.match(a.theme, /Armed Forces/);
  assert.match(a.argument, /marital portion|MARITAL portion/i);
  assert.match(a.argument, /4 years/);
  assert.match(a.argument, /PODE|CETV/);
  assert.match(a.counterpoint, /needs can trump|needs may/i);   // honest: needs can beat ring-fencing
});

test('children argument is welfare-FIRST (s.1 CA 1989 + Re C), never a rights claim', () => {
  const a = caseStrategy(SCENARIO).arguments.find(a => /Children/i.test(a.theme));
  assert.ok(a.precedents.some(p => /Re C/.test(p.name)));
  assert.ok(a.statute.some(s => s.ref === 'Children Act 1989 s.1'));
  assert.match(a.argument, /120 miles/);
  assert.match(a.counterpoint, /welfare, NOT a parent|will not order a 50\/50/i);
  assert.match(a.counterpoint, /presumption.*repeal/i);   // honest about the 2025 law change
});

test('the diagnosis line tests EVIDENCE and refuses to stigmatise', () => {
  const a = caseStrategy(SCENARIO).arguments.find(a => /diagnosis/i.test(a.theme));
  assert.match(a.argument, /properly evidenced|PROPERLY EVIDENCED/);
  assert.match(a.argument, /does not.*establish an inability to work/i);
  assert.match(a.counterpoint, /bad faith|slur/i);   // explicit non-stigmatisation guardrail
});

test('earning-capacity argument cites Wright v Wright and s.25(2)(a) + s.25A', () => {
  const a = caseStrategy(SCENARIO).arguments.find(a => /earning capacity/i.test(a.theme));
  assert.ok(a.precedents.some(p => p.name === 'Wright v Wright'));
  assert.ok(a.statute.some(s => s.ref === 'MCA 1973 s.25(2)(a)'));
  assert.ok(a.statute.some(s => s.ref === 'MCA 1973 s.25A'));
  assert.match(a.argument, /£75,000/);              // the earning history is used
  assert.match(a.argument, /Head of English/);
  assert.ok(a.counterpoint.length > 20 && a.evidenceNeeded.length >= 3, 'even-handed: counterpoint + evidence');
});

test('hidden-asset argument cites Prest (resulting trust) and Thomas (judicious encouragement)', () => {
  const a = caseStrategy(SCENARIO).arguments.find(a => /another name|family resources/i.test(a.theme));
  assert.ok(a.precedents.some(p => /Prest/.test(p.name)));
  assert.ok(a.precedents.some(p => /Thomas/.test(p.name)));
  assert.match(a.argument, /resulting.constructive trust|beneficial ownership/i);
  assert.match(a.counterpoint, /cannot ORDER a third party|cannot compel/i);
});

test('only family wealth (no titled asset) → Thomas only, not Prest', () => {
  const a = caseStrategy({ familyWealth: true }).arguments[0];
  assert.ok(a.precedents.some(p => /Thomas/.test(p.name)));
  assert.ok(!a.precedents.some(p => /Prest/.test(p.name)));
});

test('genuine constraints appear in the counterpoint (young children / health)', () => {
  const a = caseStrategy({ underEmployed: true, youngChildren: true, healthLimits: true }).arguments[0];
  assert.match(a.counterpoint, /young children/);
  assert.match(a.counterpoint, /health/);
});

test('empty facts → no invented arguments, general s.25 still noted; never throws', () => {
  const r = caseStrategy({});
  assert.equal(r.arguments.length, 0);
  assert.match(r.summary, /s\.25/);
  assert.doesNotThrow(() => caseStrategy(null));
  assert.doesNotThrow(() => caseStrategy({ qualifications: 'MA English' })); // string not array
});

test('library() returns the full cited corpus and everything carries the not-advice guardrail', () => {
  assert.equal(library().length, Object.keys(CASES).length);
  assert.ok(/not legal advice/i.test(NOT_ADVICE));
  assert.equal(caseStrategy(SCENARIO).notAdvice, NOT_ADVICE);
});
