# QA implementation handoff — turn 1 (in progress)
Date: 2026-10-13
Base main: `0cb1a7db330017193d69d3ab63525ed9cdaca12e`
Branch: `qa-turn1-duel-baseline`
Prior audit: `bd6d7c2ae9f8a333c288fe4e6c0e31eb21f13cb6`

## Provenance
Main is two commits ahead of prior audit, merging PR #13 Dragon clean-sprite fix. The changes include `v3/asset-renderer.js`, both entrypoints, `tools/check-dragon-clean-sprites.cjs` and the portrait handoff. Preserve this correction; do not regenerate Dragon art.

## Turn 1 change
Added `tools/qa/check-duels.cjs`: actual adapter/core seeded 300 ordered duels (ten types × ten types × L1/L4/L5), one life, 10×, 1,200 RAF frames of 16.667ms, receipt via `QA_RECEIPT=/path/to/receipt.json`. Fails on nonterminal matchups or console errors. Run from repository root:
```
QA_SHA=0cb1a7db330017193d69d3ab63525ed9cdaca12e QA_RECEIPT=/tmp/showdown-duels.json node tools/qa/check-duels.cjs
```
Expected baseline based on previous review: 297/300 terminate; Turtle/Turtle at L1/L4/L5 stall. **Not re-executed on current head yet.** Do not record expected results as fresh passes.

## Status
- Baseline refreshed: PASS (remote main comparison)
- Dragon correction merged: PASS (commit and changed-file verification); physical visual QA OPEN
- New duel runner committed: PASS (GitHub write); execution NOT RUN
- Full roster runtime sweep: NOT RUN
- Existing deterministic/native suites: NOT RUN
- Browser/device: NOT RUN
- Production release: NOT AUTHORIZED / NOT ATTEMPTED

## Next
Run new runner and inspect its receipt. Reconcile older docs and portable Chromium bootstrap to finish turn 1. Then turn 2: fix Turtle/Turtle contact/engagement without arbitrary HP drain or team crossing; require 300/300 termination, mirrored heavy cases and old deterministic/Ultimate suites. No merge/deploy until gates and authorization.
