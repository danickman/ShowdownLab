# ShowdownLab

Showdown Lab is an experimental mobile-first auto-battler built around drafting strange armies, watching deterministic combat play out, and reinforcing/evolving between rounds.

## Project docs

- [Product / experience specification](docs/V3_PRODUCT_SPEC.md)
- [26-unit roster specification](docs/V3_ROSTER_SPEC.md)
- [Execution roadmap & milestone tracker](docs/ROADMAP.md)
- [Character art & evolution bible](docs/CHARACTER_ART_BIBLE.md)
- [Test matrix](docs/TEST_MATRIX.md)
- [Draft Showdown 1.17.1 mechanical research notes](docs/DRAFT_SHOWDOWN_RESEARCH.md)

## Current status

Current focus: **Visuals 11 RC** on the v3 vertical slice.

Protected gameplay baseline: **RC4 rich combat core**.

Before major feature work, complete M0 Visuals 11 validation and record findings in the test matrix.


## Canonical application

The former v3 experience is now the canonical Showdown Lab application and is served from the repository root in production. Its implementation files remain under `/v3` during stabilization to avoid unnecessary path churn; root `index.html` intentionally serves the same app. Legacy v2.6 files remain only as historical reference until cleanup is explicitly scheduled.
