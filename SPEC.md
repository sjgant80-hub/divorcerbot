# divorcerbot — specification

The contracts the engines guarantee. Everything here is deterministic and pure (no clock, no randomness):
same inputs ⇒ same output, every run. All legal rules are sourced in [SOURCES.md](SOURCES.md). This is a
self-help information tool — **not legal advice**; every result carries a `notAdvice` field.

## Jurisdiction model (`divorce.mjs`)
UK divorce law is devolved and the three systems are kept distinct in `JURISDICTIONS`:
- **england-wales** — no-fault (DDSA 2020, in force 6 Apr 2022); married ≥ 1 year; sole or joint;
  applicant / conditional order / final order; £612 fee.
- **scotland** — fault + separation (Divorce (Scotland) Act 1976 as amended); no 1-year bar; four facts;
  simplified procedure.
- **northern-ireland** — still fault-based; 2-year marriage bar; five facts.

The engine never applies one nation's rule to another.

## `assessEligibility(input) → result`
`input`: `{ jurisdiction, marriedYears, marriageRecognised, connectionToJurisdiction, factsAvailable }`.
Returns `{ ok, eligible, blockers[], notes[], ground, facts[], terms, feeGBP, summary, notAdvice }`.
- An unknown jurisdiction ⇒ `ok:false` (never guessed). Non-finite `marriedYears` ⇒ not eligible.
- Fault jurisdictions with `factsAvailable: []` get a note to establish a fact; no-fault ones never do.
- Never throws on odd input.

## `divorceTimeline(input) → result` (England & Wales)
From the application being **issued**: **20 weeks (140 days)** to the conditional order; **6 weeks + 1 day
(43 days)** to the final order; apply for the final order within 12 months of the conditional order. Pure
date maths on ISO strings (`YYYY-MM-DD`); rejects invalid dates (e.g. `2024-02-30`). Non-E&W ⇒
`fixedTimeline:false` with guidance. Minimum total = 183 days.

## `cmsMaintenance(input) → result` (CMS 2012 scheme)
`input`: `{ grossWeeklyIncome, children, sharedCareNights, otherChildren, onBenefits, nilRateCircumstances }`.
- **Nil** (< £7 / nil circumstances) · **Flat** £7 (≤ £100 or benefits; drops to nil with 52+ shared-care
  nights) · **Reduced** (£100.01–£199.99: £7 + 17/25/31% of income over £100) · **Basic** (£200–£800:
  12/16/19%) · **Basic-plus** (£800.01–£3,000: + 9/12/15% on the excess).
- Income reduced by 11/14/16% for the payer's relevant other children (income ≥ £200).
- Shared-care reduction: 52–103 nights −1/7 · 104–155 −2/7 · 156–174 −3/7 · 175+ −½ and a further −£7.
- Income capped at £3,000 (above ⇒ `cappedAtCourt:true`; the receiving parent applies to court).
- The rate-band boundaries are **continuous by design** (the amount matches on each side). Never throws.

## `s25Factors()` / `financialSnapshot(input)`
The MCA 1973 s.25 factors verbatim (a)–(h) plus the child-welfare first consideration, the order types, and
the process. `financialSnapshot` is a neutral pot snapshot (assets − debts, half, +pensions) — explicitly
**not** a division or a recommendation.

## `precedents.mjs` — cited case-law strategy (England & Wales)
`caseStrategy(facts) → { arguments[], summary, caution, notAdvice }`. Maps a fact-pattern to the verified
authorities in `CASES` (Wright, Thomas, Prest, Rubin, Re C) and `STATUTE` (s.25(2)(a), s.25A, s.25(2)(e),
s.22ZA, Children Act 1989 s.1). Each argument ships with its **counter-argument** and the **evidence
needed**. Invariants: (1) never cite a case not in the corpus; (2) children framed on **welfare**, never a
parent's "right"; (3) a diagnosis is tested for evidence, never stigmatised; (4) even-handed; (5) never
throws. The AI analyser's system prompt injects only this corpus, so it cannot invent case law.

## `ingest.mjs` — all-format, client-side ingestion
`detectKind`, `cleanText`, `htmlToText` (pure) + `ingest(file, extractors)` (routes to injected async
extractors) + `assembleCorpus`. PDF → pdf.js, image → OCR, .docx → mammoth (browser build), text/CSV/email
→ direct. File bytes never leave the browser; only the extraction libraries load from a CDN. Degrades
gracefully — a missing/throwing extractor or unreadable format yields a labelled note, never a rejection.

## Verification
`npm test` — 56 tests across the three engines. Every test encodes a real legal rule (verified worked CMS
examples, timeline dates, jurisdiction routing, the cited corpus) or an ethical guardrail (welfare-first,
non-stigmatisation, not-advice). All three modules pass the `witness` mutation gate (a reviewed-equivalent
baseline in `witness.baseline.json` documents the unkillable equivalents). CI runs the suite on every push.
