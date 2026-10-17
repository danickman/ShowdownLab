# QA source research CI budget — 16 October 2026

Five **rejected historical source-only combat experiments** have been moved unchanged into `.github/workflows/qa-research-archive.yml`: Assassin L4 target-focus (312 real matches), Assassin L4 threshold study (416), Turtle L4 timed shell (416), Turtle L4 ROI (520) and small-army target-pressure rejection. Total: **at least 1,664 fully terminal simulation matches per workflow run** avoided on ordinary QA commits, excluding pressure-study matches; push and PR previously both paid this cost.

The archived studies **still run automatically** on QA branch pushes that change `v3/legacy-sim-core.js`, `v3/ultimate-abilities.js`, `v3/evolution-rules.js`, or any of those five historical study scripts. Thus a real combat source edit still triggers the historical full-match A/B suite with its original code, fixtures and assertions. `workflow_dispatch` also supports selecting one/all once this workflow has been added to GitHub's default branch; do not claim that choice is currently visible while the file exists only on QA.

All 43 ordinary required jobs remain in `.github/workflows/qa-duels.yml`, including current **Assassin last-mile source study** (until explicitly retired), original shipped Turtle Guardian regression, true independent HP-damage fronts, high-population/300 tests, release SHA-256/42-pinned PWA resources, authored art and 430×932 iPhone 14 Pro Max portrait/browser checks. **No tests deleted, no thresholds weakened, no combat/renderer/PWA code changed, no deployment or main merge.**

The source-only Assassin pursuit multipliers (1.65/1.85) were tested and rejected after 312 true terminal games, as documented in `ASSASSIN_L4_LAST_MILE_PURSUIT_2026-10-16.md`; they remain in the ordinary current study pending further focused design. For any future gameplay patch, both ordinary exact-head push/PR CI and the automatically triggered historical-source suite must succeed. Physical iPhone 14 Pro Max Safari signoff remains a separate manual gate.


### Accepted borderline matchup discovery archived
- At exact `8bc4d21`, full source-only 896-match borderline opportunity discovery passed push/PR 44 required jobs each and 16 per-RAF observer parity pairs. Results and full artifact in [BORDERLINE_DRAFT_DECISIONS_2026-10-16.md](BORDERLINE_DRAFT_DECISIONS_2026-10-16.md). The full script remains in `tools/qa/` and archive auto triggers on live combat/ultimate/evolution changes, or that script changing. Normal CI no longer repeats 896 discovery fights every docs-only push; instead it runs 128 known meaningful matchup controls + 8 parity comparisons. No primary accepted native, browser, true front or high-population test removed; physical Safari still pending.

### Oct 17 — source-only signature research archived
- Successful Goose/Barbarian 480-match candidate comparison at QA fc86180 preserved in tools/qa/check-ultimate-signature-spike-candidates.cjs and Actions artifact from run 39016547468. Moving this exploration to conditional Historical combat source studies workflow, triggered by v3 core/ultimate/evolution changes or source study script. Docs-only QA pushes no longer rerun it. The 720-match ten-fighter first-L4/L5 benchmark remains active. Source-only acceptance does not imply game ability approval; Goose wide wave requires separate revised fanout/stun prototype.


### Oct 17 — 408-case Goose falloff accepted exploratory suite conditional
- First source test `check-goose-echo-falloff-ab.cjs` passed 408 real terminal fights +12 exact raw/observed RAF parity at QA b36adbc in run 39041535844. Archive it under historical conditional combat/source/test triggers; ordinary daily CI avoids 408 extra completed research matches after this acceptance. The new 416-case damage-led shockwave source comparison remains active until a result is accepted and documented. Canonical first-to-tier 720-case multi-family benchmark remains required.
