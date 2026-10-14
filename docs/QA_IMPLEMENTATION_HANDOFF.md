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

## Verified source/CI checkpoint for Turn 3
GitHub Actions [run 38502005540](https://github.com/danickman/ShowdownLab/actions/runs/38502005540), job 115650906582, **completed SUCCESS** on PR merge containing source commit `b5cfeac3ec4279b18d0e720b68b7c7ae3e0ad5b1`. Steps passed: ordered 300-duel sweep; existing evolution/determinism; new `tools/qa/check-turn3-consistency.cjs`; existing Ultimate abilities; JSON artifact upload. No test failures reported. The handoff-only commit after this run does not alter executable code.

Gate distinction: CI source-level touch CSS assertions do NOT certify measured iPhone Safari hit areas or raw-vs-rendered Dragon imagery. Turn 3 is a **bounded tested source checkpoint**, not full visual/device acceptance. Do not merge or deploy based on this alone. Next test physical/browser geometry, Dragon L1–L5 screenshots, and remainder of Turn 3 before Turn 4.

## Turn 3 executed browser and bootstrap checkpoint — 2026-10-13 Toronto
- `63cb7e31` `tools/qa/setup-browser.cjs`: packaged Chromium requires ELF magic and working `--version`; truncated executable is atomically rebuilt from pinned package. Chrome is not committed.
- `4eca16c1` `tools/qa/check-turn3-browser.cjs`: isolated local in-process HTTP server and Puppeteer viewport checks (430×932, 390×844, 375×667 at DPR3), Lab slider and checkbox row DOM rectangles ≥47.5px, Upgrade Bay buttons ≥47.5px, no document overflow, Dragon L1–L5 Guide canvases with >1000 nontransparent pixels and screenshot captures, browser page and asset errors.
- `c1146138` `.github/workflows/qa-duels.yml`: pinned Chromium install/bootstrap, independent browser job, output screenshot/receipt upload.

**Executed:** GitHub Actions run [38502659720](https://github.com/danickman/ShowdownLab/actions/runs/38502659720), head `c1146138e1fe95b072f21a317000949c5e35907c`.
- `node-regressions`: SUCCESS, 300/300 duels, evolution/determinism, Turn 3 source checks and Ultimate ability suite; [duel artifact 11866657566](https://github.com/danickman/ShowdownLab/actions/runs/38502659720/artifacts/11866657566).
- `browser-turn3`: SUCCESS. Browser control geometry at three viewport sizes; Dragon L1–L5 Guide canvases nonblank; 3 phone-sized Lab and shop captures plus five Dragon canvas PNGs and JSON receipt. [Browser evidence artifact 11865748999](https://github.com/danickman/ShowdownLab/actions/runs/38502659720/artifacts/11865748999).
- Screenshot artifact is stored but full raw-sprite-versus-final-pixel inspection has **not** been independently accepted. No real iPhone Safari test, actual handset performance claim or broad all-pose visual acceptance.
- All approved art remains unchanged; Dragon clean-sprite renderer preserved. Main and production untouched; PR #14 remains DRAFT.

**Turn 4 preflight only:** inspected `v3/asset-renderer.js` (unconditional `preload();` of `allAuthoredUrls()` at module initialization), `sw.js` (single network-first runtime cache), `vercel.json` (global `no-store`). Asset streaming and revisioned offline policy are **not yet implemented**. Next work requires measured cold/warm Home bytes and a plan for readiness compatibility with the existing browser harness before changing eager preload.

## Turn 3.5 — Base Knight resolution repair, gated promotion
User supplied 1024×1024 green-screen source images and a six-pose reference sheet. The identical approved Knight sheet is already versioned at `tools/art-sources/knight-base-sheet.jpg`, allowing deterministic extraction in GitHub without uploading or regenerating imagery.

Files and commits:
- `tools/rebuild-base-knight.py` introduced `4e8939c`, corrected `29eef30`: extracts six disconnected figures from the approved original 1024px sheet via connected-component segmentation, green-screen alpha/fringe treatment, 256×256 lossless WebP export, 8px+ transparent margins and 248px common foot anchor. Mapping: top idle/move/attack, bottom guard/charge/hit. **`charge.webp` is mandatory Knight signature path.**
- `.github/workflows/qa-duels.yml` candidate job `cdf8d15`; artifact staging path corrected `329d642` after upload-artifact rejected hidden directory. The candidate generation passed; GitHub Actions [run 38503818099](https://github.com/danickman/ShowdownLab/actions/runs/38503818099) completed with browser and native/Node regression jobs passing.
- `.github/workflows/promote-base-knight.yml` `68e0e59`: dedicated one-time promotion on QA feature branch only, gated by a `[knight-promote]` commit message. It regenerates and stages exactly six Base Knight runtime WebPs, runs the all-authored decode gate and verifies dimensions/alpha before using GitHub Actions' branch-local token to commit. Neither Evolved/Ultimate nor original Base presentation/defeat is touched.

The original Base idle was ~80px; new 256px poses provide more source detail at phone battle scale. Source sheet has no distinct seventh high-resolution defeat pose, so the existing approved defeat image is explicitly preserved, not silently cloned from hit. No new art generation calls and no combat/stat changes.

**Promotion requested by this handoff commit:** wait for the one-time GitHub Actions job to finish and verify its exact resulting commit SHA. Follow-up branch CI/browser regression is required before declaring runtime improvement shipped to the QA branch. Raw frame subjective visual acceptance and physical iPhone Safari remain open. No merge to main or production publish authorized. Original Turn 4 loading/caching remains unchanged.
