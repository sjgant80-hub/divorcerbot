# divorcerbot

**Live:** [sjgant80-hub.github.io/divorcerbot](https://sjgant80-hub.github.io/divorcerbot/)

**UK divorce self-help — that levels the playing field.** A sovereign, offline-first, single-file tool for
divorce in **England & Wales, Scotland and Northern Ireland**. It gives general legal *information*, runs
the real *calculations*, maps your facts to *verified, cited case law*, and — crucially — is built to get
you to **affordable advice or representation**, not to replace it.

> ⚖️ **This is not legal advice.** It cannot know your circumstances and can be wrong for your case. Every
> figure and case is sourced (GOV.UK / legislation.gov.uk). For advice, see a solicitor, Citizens Advice,
> or GOV.UK. 🛟 Domestic abuse: **0808 2000 247** (Refuge, 24/7). Emergency **999** (dial then press **55**).

## Two engines, deliberately separate

- 🔒 **Deterministic (in your browser, no data leaves).** Eligibility + jurisdiction gate; the no-fault
  timeline (20 weeks + 6 weeks 1 day, £612 fee); the **Child Maintenance** calculation (2012-scheme formula,
  verified rates); the **MCA 1973 s.25** financial factors; and the **cited case-strategy** engine. Same
  inputs → same answer, because the law and the CMS formula are rules, not opinions.
- 🧠 **AI analyser — your choice of engine, agnostic BYOK + local.** Pour in the messy pile of a real
  divorce and it reads it against the framework:
  - **WebLLM** — a model runs *inside your browser*; nothing is uploaded. Best for private “doc-only” work.
  - **Bring Your Own Key** — Claude, or any OpenAI-compatible provider. Your key, your account, your data →
    only the provider you choose. divorcerbot never holds a key.
  - Grounded in the **verified corpus only** — instructed never to invent case law, to stay even-handed
    (every argument gets its counter), to keep any child’s welfare paramount, and not to stigmatise health.

## What it actually does for a hard case

It was built against a real, adversarial fact-pattern — a spouse working part-time despite senior
qualifications, a house held in wealthy parents’ names, a military pension, children relocated and contact
obstructed, and a funding imbalance. It maps that to the authorities and, for each, gives the
counter-argument and the evidence you’d need:

| The situation | The law it surfaces |
| --- | --- |
| Under-employed but qualified (e.g. Head of English, £75k history) | **Wright v Wright** [2015] EWCA Civ 201 · MCA s.25(2)(a) earning capacity · s.25A clean break |
| A house/asset held in someone else’s name | **Prest v Petrodel** [2013] UKSC 34 (resulting trust / beneficial ownership) |
| Wealthy family bankrolling them | **Thomas v Thomas** [1995] 2 FLR 668 (judicious encouragement) |
| One side has money for lawyers, you don’t | **Rubin v Rubin** [2014] EWHC 611 (Fam) · MCA **s.22ZA** — a Legal Services Payment Order makes *them* fund your lawyer |
| “She wants the whole pension” (Armed Forces) | Ring-fence pre-marital & post-separation accrual; CETV + a PODE report |
| Children moved away / contact obstructed | **Children Act 1989 s.1** (welfare paramount + checklist) · **Re C** [2015] EWCA Civ 1305 |
| A recent diagnosis used tactically | s.25(2)(e) — *test the evidence*, never stigmatise |

## Your route to advice — the point of it

Two moves the tool is built around: (1) a **Legal Services Payment Order** (s.22ZA / Rubin v Rubin) can make
a better-resourced spouse **pay your legal costs** — the statutory leveller; (2) walking into a solicitor
**already prepared** (facts sorted, numbers run, authorities identified, a draft position statement in hand)
turns hours of billed time into minutes. The tool also signposts legal aid, Advocate/LawWorks pro bono,
Citizens Advice, Resolution, mediation and litigant-in-person help.

## Run / test

```bash
npm test    # 32 tests — CMS worked examples, timeline arithmetic, jurisdiction routing, the cited corpus
```

Open `index.html` from the live site (or any static host). Zero runtime dependencies. Deterministic. MIT.
Sources in [SOURCES.md](SOURCES.md).
