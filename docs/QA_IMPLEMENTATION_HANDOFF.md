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

## 2026-10-13 continuation — turn 1/2 bounded change
Baseline remained main `0cb1a7db330017193d69d3ab63525ed9cdaca12e`; Dragon PR #13 remains preserved.

Changes on `qa-turn1-duel-baseline`:
- `e2bf3aa`: corrected runner lifecycle bug. Do NOT clear the RAF queue or reset mock time between successive battles; the real core owns its RAF handle and would otherwise retain a dead handle.
- `2a345b3`: `v3/legacy-sim-core.js` Turtle melee contact reach is bounded below by opposing visual collision radii minus the existing core's distance discount, with 0.002 contact tolerance. This corrects a geometric gap between Turtle nominal 27/500 attack reach and two-heavy contact separation. No HP drain, side teleport, Ultimate rebalance or sweeping recovery changes.
- `01a7f75`: isolated `.github/workflows/qa-duels.yml` tests ordered 300 duels, existing evolution/determinism and Ultimate abilities, uploading a JSON receipt on completion. Restricted to this QA feature branch; no deployment action.

Static explanation: turtle visual collision radius is `(.014+14/1300)*1.34≈.03320`; opposing pair spacing ≈.06639; old attack effective reach is `.054+(.02477*2*.22)≈.06490` (less than separation). With corrected contact-aware reach it is ≥ separation plus a small tolerance. Existing `reengageStep`/`recoverDeadlock` definitions remain uncalled; do not turn on a global recovery/balance change without new reproduction.

Verification status as of commit `01a7f7503892d124ff7eef69d70f3d38813e1b12`:
- Remote commits and file contents: VERIFIED
- Geometric cause and isolated correction: CODE INSPECTED, NOT RUNTIME VERIFIED
- CI workflow submission: COMMITTED; no workflow runs returned at first query
- 300-duel gate: NOT RUN / no new result receipt
- Existing evolution and Ultimate regressions: NOT RUN
- Native/real Chromium/physical iPhone: NOT RUN
- Turn 1 docs reconciliation/bootstrap: OPEN
- Main merge / production deployment: NOT PERFORMED

Next: poll CI status/check run; if unavailable, execute `node tools/qa/check-duels.cjs` in a GitHub checkout with Node 22 and collect `QA_RECEIPT`. Require 300/300, deterministic suite, mirrored Turtle tests and full relevant existing suite before accepting Turn 2. Investigate other stalls only from actual failing receipts. Continue reconciliation and Chromium bootstrap as Turn 1 gates. Do not merge or deploy without explicit release authorization.

## QA draft PR checkpoint — 2026-10-13 Toronto
- Draft PR #14: https://github.com/danickman/ShowdownLab/pull/14 — OPEN, not approved for merge or production.
- PR head when created: `5a9bc1c2a2878ed1d6c01c1399a975d20e527bac`; base main: `0cb1a7db330017193d69d3ab63525ed9cdaca12e`.
- CI trigger added: push of `qa-turn1-duel-baseline`, PR against main, and manual dispatch. First GitHub workflow-run lookup returns no runs; connector's commit-workflow lookup only returns PR-triggered runs and should not be treated as a complete Actions listing.
- Execution limitation: local container's `git ls-remote` fails DNS resolution to github.com; remote source/commits inspected through GitHub connector. Tests remain NOT RUN from this environment, so the Turtle fix is not certified.
- No main merge, deployment or release authorization.
- Next: retrieve CI job/receipt if Actions starts, otherwise arrange test execution through a GitHub-enabled runtime. Correct any remaining failures before declaring Turn 2 complete.

## Verified Turn 2 combat checkpoint — 2026-10-13 Toronto
Draft PR #14 GitHub Actions run **38497594420**, job **115636825439**, tested synthetic PR merge **85089c4bf9ccf82c279a8c8c4b08932e429d710b** (feature head `93b015d152f0f8d4fb44e1669b13f4ef60ac977b`, main `0cb1a7d`).
Receipt artifact **11863988336**, [Actions run](https://github.com/danickman/ShowdownLab/actions/runs/38497594420), [duel artifact](https://github.com/danickman/ShowdownLab/actions/runs/38497594420/artifacts/11863988336).

Executed on GitHub Actions Node 22:
- `node tools/qa/check-duels.cjs`: PASS **300 of 300**, failed 0, errors 0; L1/L4/L5, all ordered species, 1337 seed, 10x, 1200 frames maximum. Runner now separately asserts Turtle/Turtle has observed damage and no side crossing, in addition to terminal outcome.
- `node tools/check-evolution-progression.cjs`: PASS 40% HP/damage per tier and separate mastery, L5 cap, 24 deterministic mixed runs, listener/RAF safeguards.
- `node tools/check-ultimate-abilities.cjs`: PASS all ten L4/L5 role abilities and ability guardrails.
- JSON receipt uploaded as Actions artifact; log confirms all steps completed successfully.

Changed file since earlier checkpoint: `tools/qa/check-duels.cjs` (commit `93b015d`, added mirrored-contact and noncrossing assertions).
Combat P1 Turtle/Turtle **fixed at tested seeded coverage**, no arbitrary HP drain or global recovery activation. Original 15 native/browser suites and physical Safari not rerun at this checkpoint. Turn 1 documentation reconciliation and Chromium bootstrap still open. Turn 3 timing/shop/Guide/Dragon visual QA and touch targets **not started**. PR remains DRAFT; no merge or production deployment authorized.

## Turn 3 bounded text/touch packet — 2026-10-13
Branch based on unchanged main `0cb1a7d`; Dragon clean-sprite PR #13 preserved, without any renderer or art change.

Commits and files:
- `cab6ee4` `v3/v3.js`: fixed toast's erroneous cumulative 2.5% mastery figure to 5% per rank, matching core and Guide; corrected noninteractive targeting language for Beetank/Mole/Turtle/Goose; Guide now describes approx 60 steps/s and L4/L5 burn/stun times.
- `ba69736` `v3/presentation.css` (includes preceding CSS commit): Lab sliders 48px input hit boxes, 48px checkbox rows, 48px minimum shop purchase controls, selectors based on real `data-screen` attributes.
- `76e6e3b` `docs/FIVE_LEVEL_ULTIMATE_MILESTONE.md`: corrected old 30-tick/s claim to observed fixed 16.666ms step (~60Hz). No combat cadence changed.
- `222dcba` `tools/qa/check-turn3-consistency.cjs`: source/regression assertions for mastery copy, timing, Guide advice, touch and synchronized HTML.
- `3fee3ee`, `9f4087a` `index.html` and `v3/index.html`: matching asset revision strings for changed JS and CSS (no PWA cache architecture rewrite).
- `b5cfeac` `.github/workflows/qa-duels.yml`: includes Turn 3 consistency check.

CI workflow triggered at https://github.com/danickman/ShowdownLab/actions/runs/38502005540 ; as of writing **in progress**, no pass claimed. Native/Chromium measured 48px hitboxes, Dragon raw-vs-rendered captures, iPhone Safari and full scene packet still OPEN. No core change, art generation, merge or production release.

Next: obtain CI result and remediate any failure. Then test actual phone selectors/geometry and Dragon clean art at L1–L5 in Puppeteer; do not claim browser/device gate from source assertions alone. Proceed to Turn 4 only when packet gates are truly satisfied.
