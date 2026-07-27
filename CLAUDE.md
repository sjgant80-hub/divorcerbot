# CLAUDE.md — divorcerbot

## What this is
A UK divorce self-help tool (E&W / Scotland / NI). Deterministic engines (`divorce.mjs`, `precedents.mjs`)
run in the browser; an agnostic AI analyser (BYOK Claude / OpenAI-compatible / local WebLLM) reads messy
data grounded in the verified corpus. It is a bridge to affordable advice, not a substitute for it.

## Non-negotiables (do not regress)
- **Never invent or misstate law.** Every statute, figure and case must be real and sourced in
  [SOURCES.md](SOURCES.md). If you add a case, verify the citation and holding against a primary source
  first (legislation.gov.uk / bailii / GOV.UK). The AI system prompt is instructed to use ONLY the corpus
  in `precedents.mjs` — never let it cite outside it.
- **Not legal advice.** Every engine result carries `notAdvice`. Keep the disclaimer and the domestic-abuse
  safety signpost (Refuge 0808 2000 247) prominent.
- **Jurisdiction-aware.** Divorce is devolved — E&W (no-fault), Scotland (fault + separation, no 1-yr bar),
  NI (fault, 2-yr bar) are distinct. Never apply one nation's rule to another.
- **Even-handed.** Every argument in `caseStrategy` ships with its counter-argument and the evidence needed.
- **Child welfare is paramount.** Children arguments are framed on welfare (Children Act 1989 s.1), never as
  a parent's "right". Anchor on welfare + the checklist, NOT the s.1(2A) presumption (repeal announced 2025).
- **Do not stigmatise health.** A diagnosis is tested for evidence and actual effect, never used as a slur.
- **Deterministic + zero-dependency.** Pure functions, no clock/random in the engines. WebLLM/CDN import is
  the only external call, and only when the user chooses a network engine.
- **BYOK only.** The tool never ships or holds an API key; keys live in the user's browser.

## Verify
- `npm test` — 32 tests (`divorce.test.mjs` + `precedents.test.mjs`). CMS worked examples, timeline dates,
  jurisdiction routing, the full scenario's six argument lines, the guardrails.
- Every test encodes a real rule or the tool's ethical guardrails — add tests the same way.
