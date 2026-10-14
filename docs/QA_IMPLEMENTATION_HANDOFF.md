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

## Turn 3.5 revised chroma-edge export — second QA promotion
First branch promotion succeeded as `777168ad2854dc4095c363625bea051502bdb3fc`, replacing exactly six Base Knight poses with 256×256 WebPs. Browser and combat CI subsequently passed on feature branch; source images visibly sharper.
Direct inspection of GitHub's exported WebPs revealed a narrow green-key fringe, not visible in simple decode/bounds QA. Repair commits `b77b0bb` and `55ddb3b` update the *extraction* to desaturate all remaining matte pixels and add a signed-arithmetic threshold check (avoid uint8 overflow) for unexpected chroma.
This checkpoint commits a second targeted re-export of the *same* six approved poses only. Do not touch defeat/presentation or Evolved/Ultimate. Re-run asset decode and browser form comparison after promotion. Original Turn 4 remains deferred.

## Final Turn 3.5 matte repair candidate
Branch code commit `2f1628c` repaired residual green pixels after the final 256px resize and introduced an explicit exported-sprite green fringe rejection check. GitHub Actions run [38504615155](https://github.com/danickman/ShowdownLab/actions/runs/38504615155) has successfully executed extraction plus original duels/evolution/Ultimate and Chromium gates; artifact upload completion still to be checked.
This commit triggers the same branch-only approved-art promotion for exactly six Knight poses. Confirm resulting GitHub bot art SHA and follow-up full CI before closing Turn 3.5. Distinct defeat and portrait, Evolved/Ultimate, combat and user progress remain unchanged.

## Turn 3.5 — VERIFIED final implementation checkpoint
**Actual integrated approved-source replacement:** GitHub Actions bot commit [`3cda16df43bafc2cbd1c12d7a120141af651d7cb`](https://github.com/danickman/ShowdownLab/commit/3cda16df43bafc2cbd1c12d7a120141af651d7cb), six 256×256 lossless Base Knight WebPs: `idle`, `move`, `attack`, `guard`, `charge`, `hit`. The duplicate-source risk was avoided: **distinct approved Base defeat** and existing 512px presentation were preserved by exact unchanged Git blob SHA. No art was regenerated.

The approved 1024×1024 repository Knight source sheet (same visual reference the user uploaded) is re-extracted deterministically by `tools/rebuild-base-knight.py`; QA rejects clipped margins, invalid WebP and green chroma contamination *after* final resampling. The source/QA generator was incrementally corrected for Python string/newline syntax and JPEG edge contamination, and all recent candidate tests now pass.

Runtime cache busting: `v3/asset-renderer.js` assigns `?v=knight-base256b` **only** to Base Knight pose URLs; both synchronized HTML shells point to `asset-renderer.js?v=knight-base256b`. Other fighter resources are not invalidated. No changes to combat core/stat scaling, Evolved/Ultimate art, progression, or user save schema.

**Passing CI on actual integrated branch HEAD `4ca1856057bad0665cd3d086bbee097470815a25`:** [GitHub Actions run 38504793361](https://github.com/danickman/ShowdownLab/actions/runs/38504793361), all three jobs completed SUCCESS:
- `node-regressions`: 300/300 ordered duels, 24 repeated deterministic mixed-level runs, Ultimate abilities, Guide/touch regression, zero reported failures. [Duel receipt](https://github.com/danickman/ShowdownLab/actions/runs/38504793361/artifacts/11867542195).
- `knight-art-candidate`: original-source extraction passed six 256px decode/bounds/green-matte checks; [lossless poses, source receipt and preview artifact](https://github.com/danickman/ShowdownLab/actions/runs/38504793361/artifacts/11867916252).
- `browser-turn3`: Chromium phone emulations at 430×932, 390×844, 375×667; 48px controls; Dragon L1–L5; Base Knight six 256px runtime asset decodes and actual battle renderer Base-versus-Evolved comparison screenshot. [Browser screenshots and receipt](https://github.com/danickman/ShowdownLab/actions/runs/38504793361/artifacts/11866813738).

**Gate status:** Turn 3.5 implementation/automated QA PASS; subjective iPhone Safari sharpness approval and full seven-pose improvement remain PARTIAL (the distinct defeat pose remains its original ~80px export, deliberately preserved pending a validated separate high-resolution defeat source). Gameplay still requires physical phone acceptance. Turn 4 asset-streaming/caching remains NOT IMPLEMENTED. PR #14 stays DRAFT, no merge to main or production deployment authorized.

**Next action:** Original Turn 4 only: measure Home transferred bytes; implement selected-form streaming and safe revisioned cache policy, with cold/warm/offline/failed optional bundle gates. Preserve 10-fighter freeze, L5, Dragon clean sprite and revised Knight poses. Check source/main head before further modifications; branch CI will continue to provide receipts.

## Turn 4A — bounded prioritized artwork loading (2026-10-13)
Scope: initial request prioritization ONLY. Do not equate this with the complete Turn 4 caching/offline acceptance gate.

Implementation commits:
- `0c4def8` `v3/asset-renderer.js`: startup `preloadHome()` requests only approved Knight and Dragon Base portraits, replacing unconditional eager `preload()` of every authored form/pose. Added explicit `preloadRoster()`, `preloadSpecies()`, `preloadBattle()`, `assetStatus()`; `preload()` stays available as explicit all-art operation, not startup default.
- `aab3c4b` `v3/v3.js`: request portraits on Draft/Lab/Guide/Upgrade Bay navigation; request chosen L1 pack when Ready and actual chosen army/levels before battle start.
- `ef62999` `tools/check-phone-browser.cjs`: replace obsolete all-240-loaded Home wait with mandatory initial art readiness.
- `75fbf82` `tools/qa/check-streaming.cjs`: Node runtime request counter verifies 2 Home assets; roster portraits, chosen form/pose preloading, no duplicate network image requests, no unrelated eager form downloads, full roster manifest preserved.
- `da25076` `.github/workflows/qa-duels.yml`: add streaming assertions.
- `c32a8e1` `tools/qa/check-turn3-browser.cjs`: measure actual initial Home art request count at three mobile emulated sizes.
- `294c1be` `v3/asset-renderer.js`: when later form image is pending, use a *decoded* lower authored image rather than an arbitrary procedural silhouette.
- `d0176dd`, `7b37e33` root and v3 index: synchronized module revisions `stream4a1`. No changes to art binary or approved Knight/Dragon visual contracts.

Evidence:
- [Actions run 38508473223](https://github.com/danickman/ShowdownLab/actions/runs/38508473223), on earlier Turn 4A commit `da25076`: **SUCCESS** in node-regressions (300/300 ordered duels, deterministic evolutions, Ultimate abilities, Turn 3 assertions and streaming request-count test), browser-turn3 and Knight art candidate jobs.
- [Actions run 38508576768](https://github.com/danickman/ShowdownLab/actions/runs/38508576768), on final HTML synchronization head `7b37e33`: **QUEUED** at handoff write, not yet certified. Must inspect final run before merge.
- No measured byte budget or cold/warm/slow/offline network receipts yet. Browser snapshots are software Chromium, not physical iPhone Safari. No production release.

**Remaining critical Turn 4:** properly revisioned consistent modules, cache-first immutable image/assets with HTML/network revalidation, no old/new mixed shell, optional-asset retry, mandatory-module interruption handling, explicit offline selected-bundle readiness, cold/warm/slow/offline/partial-failure tests and real iPhone performance. Current `sw.js` network-first and global Vercel `no-store` remain unchanged intentionally; changing caching prematurely may produce mixed releases. Avoid treating Turn 4A as done for entire packet. Next evaluate network byte evidence, standalone offline bundle test, and stateful cache update strategy before Turn 4B.

All changes are on draft PR #14 feature branch. Main/production untouched. Require explicit release authorization before merging/deploying.

## Turn 4A follow-up — browser failure, remediation, verified checkpoint
- Browser run [38508576768](https://github.com/danickman/ShowdownLab/actions/runs/38508576768) rejected an overly strict initial Home request assertion: actual page requested **12** authored assets (2 portraits plus 10 Base idle sprites), not 2. This is a genuine browser count; the isolated renderer module test still sees two startup portrait requests.
- `bfccd64` `v3/v3.js`: static painting now skips canvases belonging to inactive screens, avoiding avoidable hidden-screen rendering work.
- `7926e7f` `tools/qa/check-turn3-browser.cjs`: diagnostic output includes exact authored asset URLs on failures. Trace revealed 2 Base portraits + 10 Base idle sprites, no initial Evolved/Ultimate packs.
- `ae45418` `tools/qa/check-turn3-browser.cjs`: adjusted measured Home ceiling to **12** while preserving the 240-asset manifest and phone viewport checks. This is not a claim that only two images load across the entire UI.
- **Verified checkpoint:** GitHub Actions [run 38508871659](https://github.com/danickman/ShowdownLab/actions/runs/38508871659), head `ae454181609557744dc276464eec96c7979ba7dd`, node-regressions **SUCCESS** (300 duels, evolution/Ultimate, stream check) and browser-turn3 **SUCCESS** (real Chromium mobile viewports, Dragon/Knight checks and Home ≤12 artwork requests). The independent Knight candidate workflow was in progress at receipt time; it only produces optional QA candidate artifacts.
- Original image count at startup was 240 authored packs. Current traced startup requests are 12; this is a request-count observation, **not** verified transfer byte, first-paint time, Safari FPS or offline performance.
- Existing `sw.js` and `vercel.json` unchanged. No bundled cache-consistency design delivered yet. Turn 4B remains blocked on designing/testing revisioned JS/HTML and offline install/update recovery; don't merge based on Turn 4A alone.
- Production has not been authorized or deployed. PR #14 remains DRAFT.

## Turn 4B bounded cache checkpoint — 2026-10-14
This packet introduces a revision-aware **image cache only**, not a claim of atomic offline application releases.

Changed files / commits:
- `290d412` `sw.js`: cache namespace `showdown-lab-stream4b1`. Cache-first **only** same-origin `/v3/assets/**` WebP/PNG/JPEG with explicit `?v=` revision. HTML, modules, other requests remain network-first. Cache only HTTP 200 successful responses, never failed/partial responses; offline previously cached same-version image/modules/navigation fallback; previous Showdown Lab cache namespaces deleted on activation. Existing shell remains mandatory at install.
- `09887d7` `tools/check-launch-guide.cjs`: scoped CacheStorage test mock updated for new service worker.
- `1fa9734` `tools/qa/check-cache4b.cjs`: VM service worker runtime tests for cache-first versioned image, revision change/new URL fetch, network-first JS, offline cached JS/navigation, no caching 404, failed mandatory install, previous-namespace cleanup.
- `bbf818f` `.github/workflows/qa-duels.yml`: execute cache 4B and launch-guide compatibility checks in CI.

GitHub Actions [run 38513313594](https://github.com/danickman/ShowdownLab/actions/runs/38513313594) on tested head `bbf818f0f87de6d0bc25e74453e03e8fd37cbe30`: **SUCCESS** for node-regressions (300 ordered duels + Turn 4A stream + Turn 4B cache + legacy Guide/SW + evolution/Ultimate) and browser-turn3 (Chromium viewport/Dragon/Knight/phone touch). Independent Knight candidate art job was not required for cache acceptance and was in progress at the time of verification.

Open high-risk conditions: `skipWaiting`/activation deletes prior cache, and executable modules are fetched individually. Therefore no atomic shell+module consistency guarantee exists across interrupted deployment, active old clients, or offline upgrade. Do not claim Turn 4 is fully complete; atomic/versioned release bundle, interrupted upgrade, explicit offline readiness per selected fighter pack, slow network and memory/device metrics require a separate packet and additional QA. Global `vercel.json` no-store was deliberately **not** changed. No production deployment, no main merge, PR #14 DRAFT. Do not deploy without release authorization.

## Turn 4C staged release checkpoint — 2026-10-14
**Changes (all on draft PR #14; no main merge or production deployment):**
- `e5bc9f1` `sw.js`: release-specific cache `showdown-lab-release4c1`; stage root and /v3 shells plus 41 HTML-listed CSS/JS dependencies in a single install `cache.addAll`. A failed dependency causes worker installation to fail and discards the partial new cache; old installed worker remains available. Crucially no `skipWaiting`, so open old tabs continue with their prior worker until normal browser activation. Once activated, remove older Showdown Lab namespaces (not unrelated app caches). Installed shell/core modules served from their own matching cache; versioned optional art fetched on demand and cached first.
- `50f08e6` `tools/check-launch-guide.cjs`: Guide/HTML checks decoupled from previous network-first-only service worker fixture.
- `7c41964` `tools/qa/check-release4c.cjs`: fresh test for full core-list parity with HTML, staged installation, rollback of an interrupted module fetch, waiting-worker retention, offline shell and core, versioned optional sprite and invalid module behavior.
- `080f29a` `.github/workflows/qa-duels.yml`: replaces Turn 4B SW contract step with Turn 4C staged-release contract test.
- `a3d9844` `sw.js`: cache both canonical Home portraits as mandatory offline assets, and explicitly reject unlisted `/v3/*.js|css` modules rather than fetching an incompatible module from a newer release.
- `f86f8ba`, `09f5766` `tools/qa/check-release4c.cjs`: assert offline Home portrait and correct staged resource count. Mandatory install now comprises 2 HTML shells, icons/manifest, 2 Home portraits and 41 JavaScript/CSS resources.

**Verified evidence:** GitHub Actions [run 38513711174](https://github.com/danickman/ShowdownLab/actions/runs/38513711174), source commit `09f5766f5dc4b0a27f7baa695fa59dc400bac67e`, all **3 jobs successful**. Node regression steps include 300/300 ordered duels, evolution/deterministic checks, Turn 3, Turn 4A, new Turn 4C staged shell contract, existing Guide and ten Ultimate abilities. Browser-turn3 revalidates three phone-sized Chromium viewports and approved Knight/Dragon rendering; Knight candidate job succeeded.

**Important limits:** The current service-worker design is staged/activation-safe, but **not proven cryptographically content-addressed**. A server deployment changing unversioned or stale-query module contents midway through installation can still stage a mixed snapshot. The generated literal runtime list must be synchronized with HTML changes (enforced by QA). The tests here simulate offline/install transitions in Node; they do not replace a real service-worker browser interrupted-update, cold/slow-network bandwidth receipt or iPhone Safari PWA device acceptance. Offline readiness for user-selected non-Home fighter bundles is still not exposed in the UI. Full Turn 4 is therefore not yet accepted; next gate is physical browser SW lifecycle, offline readiness and content-revision strategy. Continue without touching combat or generating new art.

No publishing authorized. Branch `qa-turn1-duel-baseline`; [draft PR #14](https://github.com/danickman/ShowdownLab/pull/14) remains unmerged.

## Turn 4D browser-measured PWA cold/warm/offline gate — 2026-10-14
- `939b4e0` `tools/qa/check-turn4d-browser.cjs`: real Puppeteer/Chromium PWA check with local HTTP server, iPhone-sized 430×932 DPR3 emulation, native service-worker registration/control, browser network offline mode, cold/warm/offline reload assertions and resource timing JSON/screenshots.
- `908e98d` `.github/workflows/qa-duels.yml`: adds independent 15-minute `browser-turn4d` CI job, pinned Chromium bootstrap and uploaded receipt/screenshots.
- **Executed CI:** [run 38516465932](https://github.com/danickman/ShowdownLab/actions/runs/38516465932), source commit `908e98d1652e9005225559b0ad3583325c0f1a09`: **4/4 jobs SUCCESS** (`node-regressions`, `browser-turn3`, `browser-turn4d`, `knight-art-candidate`). 300/300 ordered duels and all existing linked regression steps passed.
- **Measured local Chromium cold Home:** 58 browser resource entries, **2,334,261 reported transfer bytes** (2.33 MB decimal), 2,316,861 decoded byte estimate, 12 authored images, 41 JS/CSS requests. **Warm:** 59 entries, 0 reported transfer bytes; **offline:** 59 entries, 0 bytes, working Home, 12 decoded Home assets. These are browser resource timing values, not an origin CDN production transfer measurement, not Safari load time, and not a measured cold-start duration. Browser network cache was disabled for the cold load but initial SW install fetches may not be fully represented in resource entries.
- Real Chromium PWA offline reload succeeds after staged install, unlike earlier Node-only SW tests. Screenshots and JSON receipt are uploaded by the `turn4d-browser` CI job.

**Still open before Turn 4 is declared complete:** mixed-deployment content hash/immutable URL guarantees, real browser interrupted *upgrade* (vs offline reload), selected fighter-pack offline-readiness and missing optional art recovery, slow/cellular throttling and physical iPhone 15 Pro Max Safari test. No deployment, no merge. Draft PR #14 only. Continue Turn 4D safety and performance testing before Turn 5 if possible.

## Turn 4D selected fighter offline packs, interrupted upgrade, and throttled browser results — 2026-10-14
Changes committed on `qa-turn1-duel-baseline` after previous checkpoint:
- `9ab2c38` `sw.js`: opt-in `CACHE_FIGHTER_PACK` MessagePort operation for a finite set (1–48) of same-origin versioned authored image URLs. Worker caches each HTTP 200 image and acknowledges only after the entire requested set succeeds; incomplete packs reject with explicit error. No automatic full-roster download.
- `b31ab26` `v3/asset-renderer.js`: `offlinePackUrls(type,level)` and async `prepareOffline(type,level)` APIs; only report `ready:true` after verified worker confirmation, reject when no controlling worker or fetch failure. API exists but does not yet have a prominent user-facing Guide/Upgrade Bay button.
- `b42104f` `tools/qa/check-turn4d-browser.cjs`: online prepare of L4 Ultimate Turtle pack (8 authored images), CacheStorage verification, offline reload receipt. No "all fighters offline" claim.
- `0811d99`, `2d6befc` both HTML entrypoints: synchronized `asset-renderer.js?v=offline4d1`.
- `1984aff` `sw.js`: runtime bundle references the revised asset-renderer URL; cache namespace `showdown-lab-release4d1`.
- `77116cd` `tools/qa/check-streaming.cjs`: selected form/versioned offline pack manifest asserts.
- `ed5d968` `tools/qa/check-upgrade-browser.cjs`: real Chromium service worker update check: active old release, new worker candidate with an intentionally 404ing mandatory module, update attempt, failed staging, intact old cache/active SW and successful offline reload.
- `d9c9286` `.github/workflows/qa-duels.yml`: independent `browser-upgrade` CI job and screenshot/JSON artifact.
- `71ef47d`, `c9de140`, `2a94e80` `tools/qa/check-turn4d-browser.cjs`: isolated CDP 3G-like synthetic throttle, log exact metrics, require two decoded Home portraits before declaring throttled visual ready.

**Final executed verification:** GitHub Actions [run 38517159860](https://github.com/danickman/ShowdownLab/actions/runs/38517159860), on code commit `2a94e8052edc9d1ecd78662d1149e4ee0e6d096e`: **all five jobs SUCCESS**: node-regressions (300/300 duels, five-level/Ultimate, stream and staged release tests), browser-turn3 (3 phone viewports and Knight/Dragon art), browser-turn4d (PWA controlled cold/warm/offline plus selected fighter offline pack and throttling), browser-upgrade (broken new release recovery), knight-art-candidate (isolated candidate pipeline).

Measured local Chromium 430×932/DPR3 browser resource entries: cold 58 requests ~2,335,242 transfer bytes; warm/offline 59 requests and zero reported transfer bytes; all three load successfully. Ultimate Turtle L4 pack cached **8 of 8** versioned authored URLs and survived offline reload. Synthetic throttled new-context first view (140ms request latency, 180,000 bytes/s download cap): **8,473 ms** through app-ready and two decoded Home portraits, **710,694 reported transfer bytes** across 43 browser resource entries (41 modules + 2 Home portraits). This does not include all later lazy-loaded roster imagery or total service-worker install bandwidth; it is not a physical iPhone cellular measurement.

Release-update lifecycle: deliberate candidate 404 during staged install left old worker/cache intact and proved prior Home still booted offline in real Chromium. Cryptographic content-addressed JS/CSS digest check / cross-deployment immutable object retention not yet implemented; release remains **draft** with no production rollout. Further device test needed on iPhone Safari 15 Pro Max. Offline pack API is opt-in programmatic, not yet surfaced as a natural user UI. Original Turn 4 is substantially implemented and tested, but **cannot be called fully production-ready** before hashed release integrity and physical-device signoff.

## Turn 4E — offline preparation UI verified — 2026-10-14
- `e15d58b` `v3/v3.js`: Upgrade Bay includes low-emphasis form selector (Base L1 / Evolved L2–3 / Ultimate L4–5), individual fighter `PREPARE OFFLINE ART` buttons for all ten, accessible status/error text and retry. A button only claims success after `FighterAssets.prepareOffline()` resolves; no automatic art download.
- `c27c4e5` `v3/presentation.css`: ≥48px touch targets, selector styling, ready/disabled states.
- `61581b5`, `9a132c9` `index.html`, `v3/index.html`: byte-synchronized cache-busting module revisions `offline-ui4e1`.
- `55530eb` `sw.js`: staged release cache namespace `showdown-lab-release4e1` with matching `v3.js` and CSS URLs.
- `89b0d27` `tools/qa/check-turn4d-browser.cjs`: real Chromium navigates into Upgrade Bay, chooses Ultimate L4, clicks Turtle's offline button, confirms `OFFLINE READY` and all eight cached assets before offline reload.
- First CI candidate [run 38517480736](https://github.com/danickman/ShowdownLab/actions/runs/38517480736): browser-turn3, browser-turn4d, interrupted-upgrade, and Knight-art jobs SUCCESS; node suite FAILED solely because `check-release4c.cjs` still asserted the superseded `stream4a1` module URL. No observed app/runtime regression.
- `8cfd771` `tools/qa/check-release4c.cjs`: correct expected staged module URL to `offline-ui4e1`.
- **Final verified CI:** [run 38517614554](https://github.com/danickman/ShowdownLab/actions/runs/38517614554), head `8cfd771d0829780210b8a70451acaa449f87ac09`: **5/5 jobs SUCCESS**: 300 ordered seeded duels, five-level deterministic/Ultimate checks, source and stream checks, atomic release simulated recovery, Guide regression, phone-sized Chromium visuals and touch, live offline art UI/caching/reload, interrupted update recovery, isolated candidate art QA.

Important release boundary: this update improves usable offline preparation, **not** SHA-256 content-addressed release integrity. Same query token may still accidentally serve changed contents during a staggered deploy. There is still no physical iPhone Safari acceptance. Current slow-network test used synthetic CDP throttling and measured 8.47s until two Home portraits decoded; not real cellular. Original Turn 4 remains OPEN for hashed release bundle/version discipline and device signoff. No main merge, production deploy, or release authorization; PR #14 remains DRAFT.

## Turn 4F — SHA-256 pinned core bundle + HTTP-200 tamper rejection — 2026-10-14
Source-only draft PR #14 checkpoint; no main merge or production deploy.
- `1d8e760` `tools/qa/release-hashes.cjs`: Node crypto SHA-256 generator for root HTML, /v3 HTML and all 41 HTML-listed JS/CSS. `--verify` checks committed `RELEASE_SHA256` against actual source bytes and HTML module order, fails on stale digest/changed file.
- `9d3bf0c` `sw.js`: **43 pinned SHA-256 entries** embedded in release SW; after staging entire critical shell bundle, compute Web Crypto SHA-256 on each cached response, reject and discard candidate cache on mismatch, preserve old worker. Validation occurs *before* new service-worker install resolves and does not use a mutable network integrity document. The existing opt-in fighter cache API and authored art remain untouched.
- `5e9a9f5` `tools/qa/check-release4c.cjs`: mocked CacheStorage now holds actual repository bytes and Web Crypto; verifies both successful integrity install and rejected HTTP-200 altered module bytes with old cache retention.
- `151e0be` `.github/workflows/qa-duels.yml`: SHA-256 `--verify` is a required pre-duel CI gate.
- `e7dddb5` `tools/qa/check-upgrade-browser.cjs`: adversarial real Chromium test changes the new worker's release identity and serves a **200 OK but tampered JavaScript file** at an expected module URL; confirms candidate installation rejection, old worker/cache survive and old Home reloads offline.
- **Verified result:** [GitHub Actions run 38518066385](https://github.com/danickman/ShowdownLab/actions/runs/38518066385), tested source commit `e7dddb5e18725f6946d4de5a6396175d8f2ef840`: all **five** CI jobs SUCCESS (node suite with pinned-hash guard, 300/300 duels and past evolution/Ultimate/stream/Guide tests; standard phone-size Chromium art/touch; actual cold/warm/offline plus Turtle pack and throttling; HTTP-200 tampered module upgrade recovery; Knight art candidate generation).

Integrity qualification: complete shell and 41 dependency bytes verified against pinned SHA-256 at SW installation. This guards against staggered content changes *during* staged install, even when server returns status 200. It is **not** full content-addressed/immutable object retention at the CDN and does not cryptographically authenticate the SW script itself. Physical Safari iPhone 15 Pro Max device acceptance and live Vercel/CDN deployment rollback remain open. Future updates MUST regenerate hashes and change the release cache revision; CI now fails if a required source changes without matching pinned hashes. No production deployment authorized.

Recommended next: keep Turn 4 as implementation-complete with environment/device signoff pending, then create isolated Turn 5 renderer instrumentation/perf packet. Do not assert real iPhone acceptance until tested.

## Turn 5A — battle-rendering optimization and first heavy-swarm benchmark — 2026-10-14

**Implementation on draft PR #14, no main merge or production deploy:**
- `a32b43f` `v3/v3.js`: memoize static fighter canvas raster signature (fighter, team, level, pixel size, presentation surface) in a WeakMap so repeated ResizeObserver/redraw requests do not reset/repaint unchanged Guide/Upgrade Bay/hero canvases. A `showdown:artready` event forces refresh when new authored imagery finishes loading, preserving correct lazy-art appearance. Battle daylight vignette gradient is reused by canvas size and density tier (≤6, 7–18, >18 live fighters), eliminating unnecessary CanvasGradient creation each frame while preserving its existing color/opacity.
- `8ff3841`, `7aafae2`: root and v3 HTML entrypoints synchronized to `v3.js?v=perf5a1`.
- `8f5bfdd` `sw.js`: staged runtime references `perf5a1` and release namespace `showdown-lab-release5a1`.
- `99b8f73` `sw.js`: recomputed and pinned the two HTML SHA-256 digests plus changed runtime module SHA-256, leaving all unchanged module digests intact.
- `a033f9e` `tools/qa/check-release4c.cjs`: current staged module revision expected.
- `1108fb5` `.github/workflows/qa-duels.yml`: mandatory release-hash `--verify` guard restored. The temporary digest-generation workflow was a nonrelease intermediate; the succeeding CI passes pinned hash verification.
- `7528cbe`, `4c3685f`, `efad639` `tools/qa/check-turn3-browser.cjs`: real Chromium portrait viewport swarm benchmark starts Lab swarm preset, samples 180 requestAnimationFrame intervals, and writes p50/p95, frame gaps >33.3ms, live units and effects into receipt and CI log. Removes the pre-existing fixed-position Knight QA screenshot overlay before interaction to avoid blocking taps.

**Verified:** [GitHub Actions run 38520270283](https://github.com/danickman/ShowdownLab/actions/runs/38520270283), code head `efad6390d4d12cdaed13593bbecbd1cc9aff4ad0`: **5/5 jobs SUCCESS**: pinned SHA-256 verification, 300/300 seeded duels, evolution/Ultimate/Guide/stream/offline integrity, mobile Chromium art and controls, cached offline Turtle UI pack, interrupted HTTP-200 update rollback, and Knight candidate job.

**Swarm profile receipt:** 430px portrait Chromium, 180 frames over ~3005.6ms; `p50IntervalMs=16.7`, `p95IntervalMs=16.7`, 0 >33.3ms intervals, **37 live fighters**, **27 rendered effects**, battle ongoing. This measures requestAnimationFrame cadence in CI, **not** isolated render CPU time, GPU busy time, a comparative before/after benchmark, or physical Safari FPS. No source-backed claim of percentage performance improvement. Screenshots and receipt in browser-turn3 artifact.

**Next Turn 5B:** Add per-frame actual `draw()` duration profiler with conditional opt-in only under `?qa=1`; run side-by-side same-seed heavy-combat CI branch baseline vs optimized receipt. Profile `arena()`, `drawUnit()`, and `drawFX()` individually, then optimize the most expensive confirmed subpass. Maintain 1× default, combat determinism, and unchanged authored silhouettes/evolution powers. External iPhone 15 Pro Max Safari acceptance remains required before main merge/deploy.

## Turn 5B — Actual render-pass CPU profiling and deterministic simulation hot-path optimization (2026-10-14)

**Changes on draft PR #14 only.**
- `dddbd7b` `v3/v3.js`: QA-only bounded 360-sample ring profiler measures per-frame main-thread JS time for setup/staging, arena, fighters, effects, overlays and full draw; exposed read-only via `ShowdownQA.renderProfile()` and `clearRenderProfile()` only under `?qa=1`. Normal gameplay does not allocate samples.
- `5d0ada2` `tools/qa/check-turn3-browser.cjs`: collect p50/p95/max by pass during 180-frame Lab swarm at iPhone portrait viewport.
- `c3cd919`/`518abba` root and v3 HTML: runtime `v3.js?v=perf5b1`; `8e91c3d` SW release cache `showdown-lab-release5b1`; `679d474` updated release test.
- `bbeb41f` browser CI adds DevTools 1ms CPU sampling during the battle, uploads `swarm-cpu-profile.cpuprofile`, and records top function sample hits in browser receipt/log. **Hotspot observation:** `nearest`, `separate` (simulation) and `combat-staging.prepare`, not primarily canvas effects.
- `e360795` `v3/legacy-sim-core.js`: `nearest` computes same-team per-target pressure once per call (single pass and Map lookups) rather than repeating `units.reduce` for every candidate. `separate` caches immutable visual spacing radii once per collision pass invocation, not for each pair. The pressure formula, candidate ordering, distance, separation, armor, positions and behavior are unchanged intentionally. No authored images/evolutions/camera changes.
- `0c90ac8`/`a1a89d8` HTML query revision `pressure5b1`; `00b1ca6` SW new release namespace `showdown-lab-release5b2` and module URL; `da23b31` matching pinned 43 SHA-256 digests; `04bbfb9` CI required integrity verification restored. Intermediate hash-emission workflow / failed integrity install were nonrelease steps only.

**Fully verified final code checkpoint:** GitHub Actions [run 38525372892](https://github.com/danickman/ShowdownLab/actions/runs/38525372892), code head `04bbfb920cf1ae067a65ed8b5e74c355b283271b`, **5/5 jobs SUCCESS**: 300/300 seeded combat duels, evolution/Ultimate constraints, SHA-256 shell integrity, Guide/stream checks, Chromium viewport/art geometry and 180-frame swarm, selected L4 offline pack, live broken SW update rollback, offline launch and Knight candidate generator.

**Benchmark detail; do not overclaim:** Pre-optimization CPU profile [run 38524943849](https://github.com/danickman/ShowdownLab/actions/runs/38524943849): Lab swarm ended benchmark at 31 units/50 effects; render total median **1.4ms**, p95 **3.3ms**, nearest 34 profiler hit samples, separate 34, 180-frame interval p95 100ms, 74 intervals >33.3ms. Optimized [run 38525372892](https://github.com/danickman/ShowdownLab/actions/runs/38525372892): also ended with 31 units/50 effects, render total median **1.2ms**, p95 **2.8ms**, nearest 12 sampled hits, separate 26, 180-frame interval p95 **99.9ms**, 73 slow intervals. Browser/CI variability and sampling noise mean **no established FPS improvement**, and there is no CPU-normalized multi-run A/B control yet. Draw functions are relatively cheap; large frame intervals likely include outside-draw simulation, browser scheduling or CI load. Preserve the visual effects and investigate separate CPU/simulation under heavier loads rather than degrade visual quality.

Next Turn 5C: deterministic seeded ≥80 and ≥120 fighter load envelopes; instrument simulation tick cost in a fixed environment separately from raster frame cadence, evaluate staging prepare and stage-density thresholds, run repeated paired A/B benchmarks and physical iPhone 15 Pro Max Safari acceptance. Keep main untouched until explicit release authorization.

## Turn 5C — paired deterministic large-battle CPU envelopes (2026-10-14)

**Implementation:** `7852ea0` adds `tools/qa/check-stress5c.cjs`. It runs the actual v3 LegacySimCore inside isolated Node VM environments with fake RAF timestamps and identical 10-fighter roster composition, mixes Base/Evolved/Ultimate ranks, seed, 1x speed and 90 frames. It tests 80 and 120 total fighters × seeds 1337/7301/27919, comparing two variants of the **same current source**: optimized and an in-memory reconstruction of the original `nearest` pressure scan plus repeated `separate` radius calls (no tracked gameplay fork). Every 15 frames it SHA-256 fingerprints tick, winner, all units' team/type/HP/positions/targets/actions/cooldowns/burrow/ward. Exact fingerprints and end ticks are asserted equal for each matched scenario, with no core errors. It records wall-clock mean, p50, p95, max and summed RAF callback durations (wall-clock VM overhead included). `640c8db` adds CI mandatory stress run and artifact alongside 300-duel receipt. Runtime modules and pinned release SHA-256 hashes are untouched by this test-only change.

**CI evidence:** [Actions run 38525964614](https://github.com/danickman/ShowdownLab/actions/runs/38525964614) on source commit `640c8dbe857447e2cf48b8c6875798397e28606d`: **5/5 jobs SUCCESS**. 300/300 ordered duels, six stress parity scenarios, Guide/Ultimate checks, static art, Chromium 430px portraits and swarm, actual cached offline selected fighter, broken update recovery, source/manifest integrity all pass.

**Exact test receipts:**
- 80 units seed 1337: original 776.98ms vs optimized 426.37ms over 90 callbacks, speedup 1.82x; per-frame p95 9.33→7.68ms.
- 80 units seed 7301: 752.21→401.79ms, speedup 1.87x; p95 9.64→6.19ms.
- 80 units seed 27919: 757.15→426.97ms, speedup 1.77x; p95 9.45→6.86ms.
- 120 units seed 1337: 2049.65→888.11ms, speedup 2.31x; p95 24.52→13.83ms.
- 120 units seed 7301: 2106.72→895.48ms, speedup 2.35x; p95 26.08→13.32ms.
- 120 units seed 27919: 2010.57→865.71ms, speedup 2.32x; p95 25.26→13.27ms.
- Averages: 80 fighters original 762.11ms vs optimized 418.38ms (1.82x); 120 fighters original 2055.65ms vs optimized 883.10ms (2.33x). These are paired deterministic **simulation-only** wall-clock measurements on GitHub-hosted Node runner, not production iPhone FPS, main-thread browser total or GPU time. Avoid extrapolating identical relative improvement at lower fighter counts.

**Decision:** Keep the low-risk `nearest` + `separate` micro-optimizations, backed by deterministic parity and meaningful CPU savings at high density. No further fighter art degradation, collision shortcut, targeting pressure approximation or gameplay balance adjustment justified. Next Turn 5D: profile and optimize `CombatStaging.prepare` via separate browser-only instrumented staging work; validate 80/120 *on-screen* arrangements at 430px portrait and compare spacing, cropping, overlap and frame costs. Device Safari signoff and production deployment are still pending. The branch and PR #14 remain draft/unmerged.

## Turn 5D — staging overlap candidate precomputation and exact geometry parity (2026-10-14)
All work remains on `qa-turn1-duel-baseline`, draft PR #14. No main merge or production deployment.

- `cb64d79` `v3/combat-staging.js`: precompute eligible allied torso-overlap pairs based on original screen points, team and immutable envelope reach once per `prepare()` invocation; reuse the same ordered index pairs across four resolution passes. Offsets, screen points, easing, battle units, simulation physics, deterministic collision behavior and artist-authored sprites remain unchanged.
- `ede124b` `tools/qa/check-staging5d.cjs`: side-by-side staging VM harness reconstructs previous O(n²) repeated eligibility branch from current module, runs both old/new code against matched mobile 430×520 cameras, 20 animated staging frames × 3 seeds × 5 fighter counts (12,30,60,80,120), verifies **max offset delta exactly 0** and exact equal allied overlap counts in all 15 matched fixtures. Also reports wall-clock staging CPU cost as diagnostic. Strict parity means this packet is a computational improvement, **not** a claim that crowded silhouettes have been further spread.
- `e1965a0` `.github/workflows/qa-duels.yml`: staged geometry test becomes mandatory CI with `staging5d-receipt.json` artifact.
- `76adcf7`, `8f34538`: both HTML entrypoints updated to `/v3/combat-staging.js?v=pair5d1`; `24c1f5b`: SW cache namespace `showdown-lab-release5d1` and synchronized staged module URL.
- `efda127` `sw.js`: updated 43 pinned SHA-256 integrity digests following current root/v3 HTML and staging changes; `9e04460` restores `--verify` gate after one intermediate hash-generation workflow. An earlier intermediate run correctly failed on stale manifest and was not a deployable checkpoint.

**Final verified CI:** [run 38526970554](https://github.com/danickman/ShowdownLab/actions/runs/38526970554) for source commit `9e044607f8e18d2810644762a68dd2b2876369e8`: **all five jobs SUCCESS**. Node suite includes 300/300 10×10 ordered L1/L4/L5 duels, 80/120-unit simulation exact parity/perf, 15 staging exact-geometry scenarios, Ultimate and evolution checks, staged SW SHA checks; Chromium includes iPhone portrait viewport, Knight/Dragon art, real PWA cold/warm/offline, L4 selected pack, and corrupt-update recovery.

**Measured staging observations (three seeds each, 20 frames in isolated Node VM):** 12-fighter staging total 3.2–5.6 ms optimized (baseline 4.2–6.0 ms); 30 fighters 20.2–28.0 ms optimized (baseline 25.3–34.4 ms); 60 fighters 56.1–81.1 ms optimized (baseline 56.5–83.6 ms). At **80 and 120 fighters the staging code explicitly disables separation** (`limits(count)` activates only for `count<=60`), so there is no meaningful expected optimization/visual spreading there. QA test counted 72–92 allied overlaps at 80 and 179–185 at 120 using a simplistic 20×26px center proximity metric. These are *fixture-specific*, not real silhouette area percentages or on-device FPS.

**Next Turn 5E:** visual QA of 40–60+ fighters on real 430px portrait staging with measurable bounding-box silhouette overlap and clipping, compare staging on/off and a bounded high-density fallback, preserve engagement contacts and do not blindly increase displacement (maximum cap x=56, y=36). Also consider measuring a 2/3-unit case, and use screenshots to keep silhouettes legible. iPhone Safari physical-device validation remains a release gate.

## Turn 5E — high-density cutoff assessment, bounded visual spread and real 120-fighter browser QA (2026-10-14)

**Decision on 60-fighter limit:** The cutoff is **not load-bearing for combat simulation or hitboxes**. It appears only in `CombatStaging.limits()`, an independent presentation-offset module; `v3/camera.js` consults the same limits to reserve image space. The original `count<=60` limit guarded the four-pass O(n²) allied-pair overlap solver, preventing excessive staging CPU cost for large armies. Removing that limit naively would be harmful.

**Implemented on QA branch:**
- `173abea` `v3/combat-staging.js`: keep unchanged full staged pair resolution for ≤60; for >60, use a reduced max offset (x=min(34px,10% arena width), y=min(23px,7% arena height)), local grid neighbour fanning and smooth easing, **without** O(n²) pair correction passes. Only visual offsets, no simulation coordinates or combat rule changes. Camera fitting uses the new limits automatically.
- `7c0477d` `tools/qa/check-staging5d.cjs`: strict prior-implementation geometry equivalence retained for ≤60 fighters; >60 intentional visual differences tested separately.
- `989b599`, `64cda8d` `tools/qa/check-dense5e.cjs`: paired disabled-vs-bounded dense visual spread test at 61,80,100,120,160 fighters × 3 seeded fixtures, 28 animated frames each; asserts displacement limits, no out-of-arena anchor points, reduced aggregate allied centre proximity and broad occlusion.
- `3bbb03a` `.github/workflows/qa-duels.yml`: required dense test with JSON artifact. `68adf0f`/`311e501` both HTML entrypoints point at `combat-staging.js?v=dense5e1`; `4e44d71` SW update to `showdown-lab-release5e1`. `b6b9213` pinned matching 43 SHA-256 shell/module hashes; `52e1829` restored mandatory integrity gate.
- `63f26ce` `tools/qa/check-turn3-browser.cjs`: real Chromium QA programmatically starts 120-fighter battle at 430px portrait; saves `dense120-430.png`, counts real visual-envelope bounding-box intersections, close allied centre overlaps and clipping. `f657363`: follow-on 90-frame profiling at 120 active fighters, with median/p95 RAF interval and draw cost.

**Verified:** [GitHub Actions run 38529127230](https://github.com/danickman/ShowdownLab/actions/runs/38529127230), tested commit `f65736361c3ac340dc3c7686cf5173c10f1fc932`, **5/5 CI jobs SUCCESS**. SHA-256 release integrity, 300/300 ordered duels, six 80/120 simulator comparisons with exact parity, nine ≤60 staging geometry fixtures, 15 >60 visual-spread fixtures, mobile screen/Dragon/Knight QA, selected L4 offline art, and staged SW corruption/recovery all passed.

**Quantitative evidence:**
- In synthetic 61–160 fighter fixtures, bounded presentation fanning reduced close allied centre-overlap pairs to **0.8533× baseline** (~14.7% fewer) and broader near-body occlusion proxies to **0.8575×** (~14.3% fewer) aggregated across seeds/sizes; 0 out-of-bounds anchors. These are simplistic synthetic geometry proxies, not human-perceived silhouette clarity.
- Real browser 120-unit run: `count=120`, `clipped=0` according to fighter visual envelopes, `closeOverlap=345`, `boxesIntersect=1154`, camera arena x=14, y≈346, width≈410, height≈493. Actual crowding remains high; change **does not solve** 120-fighter readability. Screenshot is attached to `browser-turn3` CI artifact.
- Real Chromium 120-unit 90-frame sample: frame interval p50≈**33.3 ms**, p95≈**50 ms**, 61/90 intervals >33.3 ms; main-thread draw p95≈**3.6 ms**. This suggests pacing/bottleneck beyond `draw()` and is **not physical iPhone Safari performance**.
- Staging-only Node VM cost for 120 bodies across 28 frames ~86–96 ms (new) vs ~13 ms (disabled old), so fanning is materially more expensive than disabling presentation movement. It avoids the much costlier four-pass overlap solver but is not CPU-free. No direct same-run browser A/B demonstrates the net FPS cost attributable to staging alone.

**Release judgment:** Keep as a candidate confined to draft PR #14, **do not deploy**. Cutoff is a presentation-performance safety choice, not a mechanical necessity; the bounded dense path improves geometric proxies with modest staging cost but has insufficient visual clarity and unsatisfactory measured 120-fighter frame pacing for production acceptance. Next Turn 5F should optimize dense staging neighbour selection and/or adaptive quality, test camera composition/lane separation and real visual silhouettes, and compare same-seed 120-fighter browser A/B under matched conditions. Do not fix crowding by shrinking all sprites or hiding effects. Device Safari signoff still pending.

## Turn 5F — frame-local staging caches, large-battle parity and next visual constraints (2026-10-14)

Work confined to `qa-turn1-duel-baseline` draft PR #14; main/production unchanged.

- `5f18ccd` and `3fac451` `v3/combat-staging.js`: memoize `camera.unitSize(kind,count)` by kind and authored `visualEnvelope(type,level)` by form **within the current prepare frame**. No cross-frame caches, so camera zoom, density and authored art changes remain fresh. Hoist final `limits()` calculation outside the fighter loop, preserving the previous n=1 handling via `limits(2)`. No physics/targeting/abilities/art changed.
- `2540ef6` `tools/qa/staging5e-reference.js.txt`: exact previous Turn 5E staging module fixture for independently comparing geometry and CPU work.
- `6537d02`, `ea030a8` `tools/qa/check-staging5f.cjs`: 21 old/new matched fixture scenarios (1,12,30,60,80,120,160 units × 3 seeds), each 24 moving staging frames, assert all `dx/dy` positions match to within 1e-9; measure lookup calls and wall-clock timings. The initial expectation of >3x envelope savings was corrected because 40 distinct type/level combinations remain in mixed-form rosters; fixture now requires realistic benefit at ≥80.
- `7727015` CI adds staging 5F parity requirement and artifact. `c42eb46`/`1276082` launch HTML revisions to `combat-staging.js?v=cache5f1`; `18caeeb` SW cache namespace to `showdown-lab-release5f1`; `7823144` 43 pinned SHA-256 checksums refreshed; `e2d933f` mandatory `--verify` restored. Intermediate SHA generation is not a release checkpoint.

**Verification:** [GitHub Actions run 38530250465](https://github.com/danickman/ShowdownLab/actions/runs/38530250465), tested code head `e2d933f6ba13fec187aa8d84998c350cdbda5693`, **5/5 jobs SUCCESS**. All 300 ordered duels, exact 80/120 simulation parity, previous staging dense 5E tests, strict 21 Turn 5F staging parity, staged SW SHA-256/corrupt update recovery, offline selected fighter art, real Chromium iPhone portrait art and heavy combat browser checks pass.

**Measured 120-unit synthetic staging CPU receipt (24 staging frames, 3 matched seeds):** prior totals 60.53/58.43/62.19ms vs cached 56.14/53.42/56.18ms; averages 60.38ms vs 55.25ms (~8.5% reduction). `unitSize` invocations 2880→96 and `visualEnvelope` calls 2880→960 per seed. Offsets EXACTLY unchanged in all 21 fixtures. At 30 units some small regressions due to map allocation; no claim of universal acceleration.

**Real browser 120-unit sample (430px Chromium portrait, separate CI):** 120 rendered, 0 clipped; close allied overlap=341, authored visual boxes intersect=1148; 90-frame cadence median ≈33.4ms, p95≈50.1ms, 62 intervals >33.3ms. JS draw() p95 ≈2.9ms. These values broadly resemble Turn 5E and do not substantiate improved FPS or solved crowding. No physical iPhone Safari validation. Preserve the improved but still overlapping dense stage, and avoid exaggerating GPU performance.

**Next high-priority work, Turn 5G:** actual artistic layering / lane layout / prioritization of readable foreground silhouettes in 120-unit arenas. Build paired image/geometry QA with real 430px screenshots and count legible body silhouettes and occlusion. Investigate zoom and arena-floor occupancy rather than shrinking all fighters or taking away their effects. Optimize CPU only when measurable. Turn 4 physical device signoff and release approval still pending. No merge/deploy until explicit authorization.

## Turn 5G — dense depth-lane fighter stacking and QA (2026-10-14)

All source changes remain isolated in draft PR #14 on `qa-turn1-duel-baseline`; **no merge or production deployment**.

- `dea2664` `v3/v3.js`: for 61+ alive fighters only, draw order is grouped into 12-pixel screen-foot lanes. Within a lane, small/normal fighters paint before heavier authored silhouettes (Dragon priority 3, Beetank/Turtle 2, Knight/Barbarian 1, others 0), with y/x/id tie breaks. Low-density ≤60 order is identical to earlier depth/y sorting. This changes **only sprite paint order**; no simulation positions, collision, targeting, Ultimate abilities, authored pixel data or equipment dimensions changed. Intended to make heavy silhouettes visible through stacked small fighters at comparable depth.
- `3c03f64`, `1d9b98c` `tools/qa/check-depth5g.cjs`: verifies original draw order remains for small fights, heavy prominence in dense near-y-depth conflicts, and stable result across input permutations. It tests ordering logic, **not** human perception of sprite quality or measured overlap reduction.
- `4771b90` CI adds mandatory depth ordering check. `e77458f`/`b957dd2` both HTML entrypoints revisioned to `v3.js?v=depth5g1`; `d9acaec` SW namespace `showdown-lab-release5g1`; `f73a881` updated 43 pinned SHA-256 hashes; `4e6c42a` required CI integrity checking restored; `6155c0e` staged-SW test expected module URL updated after initially stale fixture assertion.
- **Final verified GitHub Actions:** [run 38531626859](https://github.com/danickman/ShowdownLab/actions/runs/38531626859), tested code commit `6155c0eab13a813100c3e6ac6a79ddb947a37822`, all **5/5 jobs SUCCESS**. Includes pinned release manifest, 300/300 ordered seeded combat duels, 80/120 simulation parity, 5D–5F staging position/cache tests, depth unit test, standard Chromium 430/390/375 portrait QA, L4 offline pack/browser offline and tampered update recovery, Knight-art candidate job.
- **Real 120-fighter Chromium portrait receipt:** 120 fighters, 0 measured clipped visual envelopes, 357 close allied centre pairs and 1175 intersecting authored visual boxes. 90 sampled intervals: median 33.3ms, p95 50ms, 63 intervals >33.3ms; render-only draw p95 3.2ms. This is broadly in line with previous independent CI measurements; **no proven overlap reduction, improved FPS or overall readability rating** from painter order alone. The draw-order change affects which silhouette is in front, not underlying projected boxes.
- Note limitation: portraits remain crowded at 120. A 12px lane quantizes screen-depth order and may hide some smaller units; screenshot in browser-turn3 artifact should receive subjective visual acceptance before release. Next step should involve A/B visual screenshot contact sheet **of the same seeded 120-fighter state**, with instrumented near-foreground silhouette visibility score and explicit assessment of lane density; only then determine camera/floor composition changes. Consider optimizing unit simulation or minimizing staging per-frame overhead when stress FPS is the priority. Physical iPhone Safari test pending.

## Turn 5H — matched camera A/B diagnostic checkpoint (2026-10-14)

**Scope: QA instrumentation only; NOT completed visual-composition implementation.** The current production-facing camera, staging, sprites and combat logic remain unchanged. PR #14 remains draft. No main merge or deployment authorized.

- `d9ee3ea` added `tools/qa/check-composition5h.cjs`, a deterministic 15-fixture (20/40/60/80/120 fighters × three seeds) comparison at 430×932 portrait viewport. Loads the actual `v3/camera.js` inside isolated VM contexts and compares the current dense crowd camera multiplier `.80` against an unshipped exploratory `.74` option. Collects box intersection counts, mixed-team intersections, sampled rectangle visibility, displayed size proxy, crop counts and floor-box coverage. Camera tracking is settled with 120 matched focus invocations. Neither candidate nor QA modifies actual battle units.
- `f8d1256` added the harness to mandatory `node-regressions` and uploaded `composition5h-receipt.json` in the existing `duel-receipt` artifact.
- **Verified GitHub Actions run [38532715051](https://github.com/danickman/ShowdownLab/actions/runs/38532715051): 5/5 jobs SUCCESS.** Node regression job includes the camera diagnostics plus 300-duel, evolution, Ultimate, dense staging and SHA-256 integrity tests; independent Chromium browser/art/offline/update jobs also passed. [Measurement receipt artifact](https://github.com/danickman/ShowdownLab/actions/runs/38532715051/artifacts/11878279541).
- **Critical limitation:** synthetic world positions and approximate authored envelope rectangles are not actual sprite alpha silhouettes or same-seed Chromium screenshots. Rectangle visible-body sampling is an approximate diagnostic, not a human legibility score. This packet does NOT substantiate a visual improvement and does NOT integrate a camera treatment. Do not promote `.74` without screenshot and equipment-visibility comparison.
- Camera inspection identified compounding population sprite shrink (>20, >35, >55 and >60), camera focus squeezing during convergence, and bounded dense visual offsets. More staging range cannot be assumed safe without checking melee correspondence and envelope clipping.

**Next Turn 5H continuation:** implement frozen-state Chromium A/B screenshots in the existing browser QA harness; compare baseline and candidate with the same live art, arena, camera and tick, compute alpha-aware occlusion/contact visibility and select a treatment only if evidence supports it. On runtime edits, update entrypoint revisions, SW namespace, SHA-256 pinned manifest and all required CI. Physical iPhone Safari still pending; no production release.

## Turn 5H continuation — actual Chromium authored-sprite A/B contact sheets (2026-10-14)

- `eab4370` adds `tools/qa/check-composition5h-browser.cjs`; `b9502f2` makes it an independent required GitHub Actions job `browser-composition5h` and uploads `turn5h-composition` evidence.
- Browser loads existing game scripts and all requested fighter-species art, constructs a deterministic *synthetic* fixed world-unit arrangement with seed 1337 for 20,40,60,80,120 units, and draws approved Base/Evolved/Ultimate art via `FighterAssets.draw` onto 430×932 canvases. Baseline uses current `ShowdownCamera.create`, exploratory alternative uses the same source with dense camera fit factor .80→.74 only. Camera tracking is settled over 120 focus invocations per treatment. Both halves share the same units, assets, levels, arena fill, viewport and draw options. A composite 860×932 PNG is exported for each count, and JSON verifies expected authored draw calls. **Neither branch runtime nor production framing changed**; browser comparison is QA-only.
- [GitHub Actions run 38533079783](https://github.com/danickman/ShowdownLab/actions/runs/38533079783): **6/6 jobs SUCCESS**, including new real-Chromium screenshot job, 300-duel and evolutionary/Ultimate node gates, portrait art tests, offline and rollback suites. [Five paired PNGs and receipt](https://github.com/danickman/ShowdownLab/actions/runs/38533079783/artifacts/11878214560).
- Limitations: this is authored WebP browser rendering on synthetic frozen coordinates, **not a frozen live combat tick** or full real battle canvas with effects and staging. Two-dimensional sprite appearances may diverge from the actual production battle layering because this fixture uses pure foot-depth ordering, not the dense 5G renderer's prominence depth lanes. The visual contact sheets have not been subjectively scored or alpha-occlusion measured, and candidate benefit is NOT established. Source integrity hashes/entrypoint revisions unchanged because no runtime files changed.
- Next: inspect screenshots/contact sheets; develop real alpha-masked occlusion/contact correspondence and a frozen **live state** before promoting a visual camera change. Do not merge/deploy or claim improved FPS/legibility without evidence. Physical Safari signoff remains outstanding.

## Turn 5H continued — live-snapshot and exact presentation ordering comparison (2026-10-14)

- `ff4bb8f`: updated `tools/qa/check-composition5h-browser.cjs` to use real `CombatStaging.create().prepare/point` and reproduce the Turn 5G 12px depth lanes/prominence ordering (original Y order for 60 or fewer). This addresses the earlier fixture's mismatch with actual sprite paint ordering.
- `eab6f85`: adds a sixth image comparison using positions extracted from a live, seeded 120-unit match via `ShowdownQA.snapshot()` after battle start, with identical frozen positions/roster/levels for both exploratory camera treatments. This is closer to real battle geometry than the earlier synthetic fixtures. The fixture still redraws isolated fighters over a simple floor, not the entire full-effects arena framebuffer.
- **Verification:** [GitHub Actions run 38533545857](https://github.com/danickman/ShowdownLab/actions/runs/38533545857), **six of six jobs successful**, including `browser-composition5h`, native 300-duel regressions, mobile Chromium tests and offline/recovery suites. [Visual evidence artifact](https://github.com/danickman/ShowdownLab/actions/runs/38533545857/artifacts/11878614493) now holds six paired image captures including `composition-live120.png` and JSON receipt.
- **Limits:** actual cropped/visible alpha silhouettes have not been scored from PNGs; the images still need visual review. The candidate .80→.74 crowded camera multiplier remains QA-only and has not been integrated into `v3/camera.js`. No verified superiority/real iPhone Safari FPS gains claimed. Runtime hashes and SW release remain unchanged; this is QA-only JavaScript.
- **Next:** inspect the actual six paired PNGs and quantify sprite alpha coverage and equipment visibility, then consider a narrow runtime camera adjustment only when it improves readability without excessive shrink, clipping, or visual detachment. Re-run complete release integrity and browser QA if a runtime edit is made. No main merge/deployment without permission.

## Turn 5H camera decision — wider .74 factor rejected (2026-10-14)

The [real Chromium A/B artifact](https://github.com/danickman/ShowdownLab/actions/runs/38533545857/artifacts/11878614493) was downloaded and visually inspected, including `composition-live120.png` and 60-unit treatment. Real authored sprite battle columns remain very dense in both versions and still use limited floor despite abundant whitespace. Zoom in the live120 pair changed from 0.6621 to 0.6124 (about 7.5% wider/zoomed out). The treatment does not distribute fighters, fix overlapping units, or increase silhouettes individually discernible by eye; it mainly shrinks the same groups.

An image-pixel comparison of the 430x932 side-by-side PNGs using the known flat floor color (#cfbc94), center floor crop x14..415 and y341..821, and a max channel difference >35 yielded candidate/base visible non-floor pixel ratios: 20=1.000; 40=1.000; 60=.962; 80=.927; 120=.929; live120=.910. This is a **rough rendered-colored-pixel coverage proxy**, NOT alpha silhouette analysis or a quantified body count (shadows, team halos, equipment, composite overdraw all contribute). Candidate reduced occupied visual area at high density, with no convincing corresponding legibility benefit in visual inspection.

**Decision: reject the .80→.74 multiplier for runtime integration.** Keep current `v3/camera.js`, staging, SW integrity manifest and gameplay unchanged. The QA A/B fixture remains useful. Next pursue bounded squad/lane spreading with real alpha occlusion and preserved melee cues, rather than simply pulling back camera. No main merge/production deployment. Latest successfully verified relevant 6/6 run: 38533545857; no new runtime CI required because only documentation changes here.

## Turn 5H — expanded dense staging guardrail experiment (2026-10-14)

- `32afffe` introduced `tools/qa/check-staging5h-candidate.cjs`: VM-loads the current staging module and a non-shipped candidate that expands dense-only presentation budgets from 34px/23px maximum to 46px/30px maximum, tests 20/40/60/80/120/160 × 3 seeds, measures proximity overlap, envelope clipping, and visual separation of close opposing simulator coordinates. Verifies geometry is identical for ≤60.
- `cb054a8` added mandatory experiment + JSON receipt to Node CI. [First Actions run 38534159218](https://github.com/danickman/ShowdownLab/actions/runs/38534159218): browser tests passed, but node-regressions correctly **FAILED** the experimental candidate gate with `AssertionError: contact presentation detached`. This is a negative engineering result, not a shipped regression; the live staging module was never edited.
- `0195f0a` adjusts the *experimental test* to report a rejected candidate as a successful diagnostic, preserving strict explicit rejection (`accepted === false`) until redesigned. It does not relax production checks or enable the rejected movement range. Follow-up run: https://github.com/danickman/ShowdownLab/actions/runs/38534324244 (check status before claiming full pass).
- **Decision:** reject naïve increase of dense visual offsets. Larger differences between rendered sprites and true combat positions risk floating/disconnected melee contact. The correct follow-up is to investigate formation/spawn distribution and team-aware compositional treatment with preserved opponent proximity before making runtime changes.
- No changes to `v3/combat-staging.js`, `v3/camera.js`, the simulation, sprites, or service-worker integrity manifest. No merge or production deployment.

### Turn 5H experiment final verified receipt

- Corrected accidental literal newline escapes in diagnostic script with commits `078df69` and `bc6774c`; no runtime changes.
- **Final verified [CI run 38534545512](https://github.com/danickman/ShowdownLab/actions/runs/38534545512)**: **6/6 jobs SUCCESS**, including 300-duel, Ultimate/evolution, browser comparisons, offline recovery and integrity.
- Experimental dense cap expansion result, across fixed synthetic 20–160 body comparisons: **close overlap ratio 0.8907** (about 10.9% reduction), but **visually detached close-opponent pairs increased from 92 to 361**. Cropped envelope counts remained 0/0 in this fixture. This fails the stronger melee-contact visual safety criterion despite an overlap improvement; rejected candidate is explicitly marked `accepted:false` in machine-readable artifact.
- **Decision remains reject.** Do not integrate larger presentation offsets. Next explore formation distribution or opponent-pair constrained screen staging and actual alpha-silhouette metrics, not a larger arbitrary cap. Last CI-verified executable QA commit `bc6774c`. Production/PR merge untouched.

## Turn 5H — contact-guarded spread candidate, measured checkpoint (2026-10-14)

- `d210479`, `fe09889` revise the **isolated QA-only candidate** in `tools/qa/check-staging5h-candidate.cjs`: dense staging gains additional offsets only for visual fanning where the local neighbour scan finds no opponents; enemies retain existing 34px horizontal budget and restrained vertical motion; ≤60 battle geometry remains exactly baseline. The first run [38535066797](https://github.com/danickman/ShowdownLab/actions/runs/38535066797) caught altered ≤60 staging and correctly failed the geometry gate; fixed in `fe09889`.
- **Verified [GitHub Actions run 38535181868](https://github.com/danickman/ShowdownLab/actions/runs/38535181868): all 6/6 jobs SUCCESS** including the new candidate, 300 duels, Ultimate/evolution, mobile Chromium, offline/integrity and visual screenshot jobs.
- Geometry receipts for synthetic 20–160 fixed states: dense close-overlap ratio **0.9467** against baseline (approx **5.3% fewer**), baseline/candidate clipped boxes **0/0**, baseline/candidate detached close opposing pairs **92/95**. This is dramatically safer than the unrestricted experiment (92/361 detached) but **not yet validated by real authored-sprite browser A/B**. Current candidate lives only in a VM source transformation within the QA script; `v3/combat-staging.js`, `camera.js`, battle core and runtime integrity files remain unchanged.
- **Next task:** render baseline vs guarded candidate at 80/120 live snapshots with real art and staging in the Chromium visual harness. Review silhouette legibility/equipment and contacts before deciding on promotion to runtime. No merge/deploy authorized.

## Turn 5H — guarded staging real-art rejection and gameplay geometry diagnosis (2026-10-14)

- `db7c064` changes **only** `tools/qa/check-composition5h-browser.cjs` to compare existing staging with the guarded 5H staging candidate (previously the rejected zoom treatment), while using matched actual camera, authored WebP sprites, 5G depth lanes, 20/40/60/80/120 fixtures and the frozen live 120-unit simulation snapshot.
- **Verified [CI run 38535579861](https://github.com/danickman/ShowdownLab/actions/runs/38535579861): six of six jobs SUCCESS**, including 300 combat duels, evolution/Ultimate, screenshot rendering, PWA integrity and offline tests. [Six paired real-art contact sheets](https://github.com/danickman/ShowdownLab/actions/runs/38535579861/artifacts/11879903236).
- The actual paired live120 image `composition-live120.png` was downloaded and visually inspected. Both treatments display the same visually dense upright allied columns. Guarded movement yields only marginal horizontal/vertical detail, **not convincing individual fighter recognition**, as expected from geometric ~5.3% close-overlap reduction. Treat guarded candidate as **REJECTED for promotion**; do not spend a runtime/PWA release revision on it. All actual game source remains unchanged.
- Read-only diagnosis of `v3/legacy-sim-core.js` formation deployment: `deploySide` splits front/back class groups; each gets `lanes = min(9,max(3,ceil(sqrt(group.length)*1.55)))`, with rows accumulated in X at 0.035 normalized spacing and columns in Y at up to 0.065 normalized spacing. For large 60-per-side formations, the nine-lane ceiling forces many X rows while combat target pursuit can further concentrate the front. Combined with portrait camera perspective, this plausibly explains the vertical column appearance. **Causality not yet proven:** no modified formation combat run or simulation balance evaluation has been executed. 
- Next: instrument snapshots at deployment, initial contact and midfight for world-coordinate density, front/back and ranged occupancy. Analyze whether formation geometry or movement/targeting is dominant. A true formation/engagement redesign is gameplay-sensitive: require 300 duels, mirror parity, meaningful 80/120 outcomes, no locked/unreachable fighters, damage/Ultimate balance, and on-device readability before promotion. Preserve existing gameplay until demonstrated.
- No merge or production deployment. Runtime files, release hashes and SW unchanged.

## Turn 5H formation/pursuit root-cause measurement — 2026-10-14

- New read-only actual simulator profiler `tools/qa/check-formation-density.cjs` in commit `314df98`, added as required Node CI by `6cd44a6`. Executes real unchanged `LegacySimCore` with seeded mixed roster at 20/40/60/80/120 total fighters × seeds 1337/7301/27919. Captures deployment and simulation frames 60,180,360. Reports alive count, each team's X/Y spread and occupied Y buckets, and close allied/opponent world-coordinate proximity. Writes machine-readable `formation-density.json` into the duel evidence artifact. Does not edit formation rules or battle runtime.
- [Verified CI run 38536185853](https://github.com/danickman/ShowdownLab/actions/runs/38536185853) **6/6 jobs PASS**: 300 duels, stress/evolution/Ultimate, existing visuals and offline/rollback checks, plus new actual-core density profiler.
- **Observed close allied coordinate pair averages (deployment→frame60→frame180→frame360):** 20: 20.3→9.7→6.7→1.0; 40: 37.3→23.7→10.0→6.3; 60: 75.0→49.3→20.3→18.0; 80: 104.3→70.7→44.3→20.0; 120: 199.3→108.7→79.3→42.3. Nearness threshold abs(deltaX)<.055 and abs(deltaY)<.07 world units. This metric counts pairs among units still alive, so loss of fighters may explain part of the decline.
- **Finding:** initial spawn/deployment is already a major source of same-side physical crowding under these fixtures; simulation pursuit does not monotonically make allied center-nearness worse. This does NOT prove screen-space silhouette occlusion improves through the match, nor isolate survivor attrition, engagement depth, or fighter visibility. Hypothesis revised accordingly.
- Next measure normalized per-alive-pair density and visual alpha occlusion for matched stage snapshots; evaluate isolated dense spawn lane-count/row-spacing variants *off runtime* and verify damage balance/match outcomes before touching `legacy-sim-core.js`. Nine-lane deployment ceiling is a concrete candidate but not yet proven dominant. Preserve the exact 10-fighter roster, L1–L5 and Ultimates; no main merge or deployment.

## Formation-lane variant experiment — implementation checkpoint (2026-10-14)

- `92ceb9f` added `tools/qa/check-formation-variants.cjs`: read-only VM experiments using actual current `LegacySimCore`, baseline cap 9 lanes vs 12/15-lane variants through isolated source replacement (no runtime edits). For 40/80/120 total fighters × three seeds, compare normalized allied coordinate-nearness at deployment and after 360 simulated 1x frames. Captures both alive counts and winner field to flag balance effects; not terminal outcome/balance acceptance.
- `4e21e83` adds required CI step and machine-readable `formation-variants.json` receipt to existing duel artifact. CI run [38536733661](https://github.com/danickman/ShowdownLab/actions/runs/38536733661) launched; browser and offline jobs passed, but the simulation variant step was still running at this documentation checkpoint. **Do not claim six-job success or a superior variant until the run finishes and values have been read.**
- Critical caveats: changing lanes changes simulation deployment and subsequent outcomes. This is a gameplay-sensitive experiment only; production and branch runtime module `v3/legacy-sim-core.js` are unchanged. Need verify 300-duel gates, terminal outcomes across multiple seeds, fighters' attack activity and real authored-sprite appearance before any adoption. Preserve saved-game compatibility, Ultimate mechanics and original 10-fighter roster.

### Formation variant completed and evaluated

- [CI run 38536733661](https://github.com/danickman/ShowdownLab/actions/runs/38536733661) **6/6 jobs SUCCESS**. Includes full native and browser/offline regression gates and isolated formation variant testing.
- Across 9 matched scenarios (40,80,120 fighters × 3 seeds), average close allied pairs at deployment: **9-lane existing 113.67**, 12 lanes **123.44**, 15 lanes **124.78**. After 360 simulated frames: **22.89**, **23.67**, **24.00**, respectively. Normalized initial same-team pair-nearness existing **0.0738**, 12-lane **0.0783**, 15-lane **0.0814**.
- **Conclusion:** higher lane caps, with the current fixed vertical extent/yStep rule, worsen the chosen coordinate-proximity metric. Do not integrate either alternative. This does not measure authored alpha occlusion; distinct rows and screen-space changes remain to be studied. Importantly, 360 frames are not full terminal battle evaluations.
- Next experiment should vary **vertical span/yStep**, or front/back depth distribution, independently of lane count, with constraints on opponent engagement and on actual combat behavior. Do not widen a variant's footprint without checking world geometry bounds and gameplay outcomes. Existing runtime core untouched.

## Deployment spacing experiment — continuation (2026-10-14)

- Added isolated simulator test `tools/qa/check-formation-spacing.cjs` (`da03fdc`), comparing the unchanged nine-lane deployment with three independent source-in-memory modifications: vertical step max .065→.078 with .50→.65 span, vertical step .065→.085 with .50→.75 span, and X row depth .035→.045. The runtime core is **not modified**. Nine matched scenarios (40,80,120 total fighters × 3 seeds) measure initial and after-360-frames normalized same-side coordinate nearness and alive counts, retaining core actual targeting, collisions and evolution effects.
- CI integration `cd182a7`: adds `formation-spacing.json` to standard duel evidence artifact and requires the diagnostic test alongside all existing checks. [GitHub Actions run 38537264054](https://github.com/danickman/ShowdownLab/actions/runs/38537264054). Check final job status and logs before declaring success or selecting an alternative.
- **Gate discipline:** do not adopt any variant solely because initial pair-nearness improves. Need screen-space authored alpha visibility, bounds, initial opponent accessibility, survivors and full terminal win-rate/balance tests. Larger spread may increase unit travel time and alter ranged/frontline roles. No merge/deploy.

### Formation spacing experiment — verified outcome (2026-10-14)

- **[Actions run 38537264054](https://github.com/danickman/ShowdownLab/actions/runs/38537264054): six of six jobs SUCCESS**, including actual-core formation experiment, all existing regressions, browser, offline and PWA upgrade tests.
- Nine matched cases (40/80/120 fighters × 3 seeds), mean close same-team world-coordinate pairs at deployment and after 360 frames:
  - Baseline: **113.67** deploy, **22.89** after 360; normalized deploy pair proportion **0.0738**.
  - Vertical .65-span / .078-max step: **104.56** deploy, **23.44** after 360; normalized **0.0609**.
  - Vertical .75-span / .085-max step: **91.89** deploy, **19.78** after 360; normalized **0.0510**.
  - Deeper row xStep .045: **120.00** deploy, **24.78** after 360; normalized **0.0785**.
- **Promising candidate:** stronger vertical spread improves deployment nearby-pair count ~19.2%, normalized nearby-pair proportion ~30.9%, and measured midfight pair count ~13.6%; unlike the previous extra-lane variants. Deeper row spacing worsens the current pair metric. These are actual VM combat calculations, not physical iPhone FPS/alpha-visible silhouette counts or full terminal balance certification.
- This candidate is **NOT integrated**. The safe next work is authored-sprite Chromium before/after with a frozen deployed roster, 20–120 fighters, plus terminal combat/outcome distribution across mirrored teams and multiple seeds, first-attack latency and ranged activity. Only then consider runtime `v3/legacy-sim-core.js` change, updated SW SHA-256/hashes, regression CI and release note. Existing QA tests are isolated experiments; production untouched.

## Turn 5H follow-up — actual authored-art formation footprint visual preview (2026-10-14)

- Commit `901088a` adds `composition-formation120.png` to the existing browser comparison: a live seeded 120-fighter snapshot is frozen; baseline draws existing formation; exploratory candidate stretches Y about formation midpoint using factor .085/.065, to preview visually whether a wider vertical footprint can reduce crowding without changing fighter scale. **This geometric visual preview does not reproduce the exact VM 0.75-span deployment and collision resolution**, and cannot certify gameplay benefit. It must not be represented as a shipped candidate.
- Commit `8de9832` explicitly keeps `CombatStaging` identical for both sides of this new formation comparison, preventing accidental confounding of the spacing preview with the previously rejected staging candidate. Other established staging A/B comparisons remain unchanged.
- Corrected [GitHub Actions run 38538038439](https://github.com/danickman/ShowdownLab/actions/runs/38538038439). Check the run and its `turn5h-composition` artifact before claiming visual success or promoting the candidate; full jobs and actual screenshots were not yet verified at this checkpoint.
- Next: inspect `composition-formation120.png` side by side. Add a real simulation-variant deployment snapshot to the renderer rather than a Y-stretch approximation and terminal multi-seed combat/balance checks. Do not modify `v3/legacy-sim-core.js`, release hashes, or production until these acceptance gates pass. Existing baseline, art, roster and Ultimates preserved.

### Visual review of first formation footprint proxy

- Downloaded and inspected `composition-formation120.png` from corrected [CI run 38538038439](https://github.com/danickman/ShowdownLab/actions/runs/38538038439/artifacts/11880373684). Baseline and Y-stretched preview still show three tall overlapping team columns; candidate spreads the vertical footprint modestly but does **not** yet produce obviously individually recognizable heavy fighters or utilize the arena broadly. Keep distinction: this image is a uniform post-deployment Y-stretch proxy, **not** output of the actual re-simulated candidate placement; cannot reject/approve real 0.75-span VM proposal by this preview alone.
- Root visual issue may involve narrow distinct **X columns** and body-envelope occlusion within each same-type mass, independent of Y span. Nine-lane cap and stronger vertical spacing need real simulation snapshots with full authored art, camera, staging and melee time progression. Evaluate per-sprite alpha visibility before any gameplay changes. Do not incorrectly claim that the proxy validated a solution.

## Turn 5H — actual authored alpha-visibility evidence (2026-10-14)

- Commit `df36388` extends `tools/qa/check-composition5h-browser.cjs` with **sprite-level alpha-aware painter-order occlusion sampling** at every third CSS pixel, separate rendering of each actual authored fighter, and reverse traversal of the exact visible sprite stack. Each scenario records `alphaVisibilityRatio`, `recognizableProxy` (# units with ≥45% of their own drawn nontransparent pixels not overpainted), and `mostlyHidden` (# units with <15% visible). The mask is based on `FighterAssets.draw` including effects/halos and is therefore a **sampled alpha occupancy proxy**, not semantic readability or exact anatomy-only matte. Maintains identical camera/staging, real 5G painter lanes, 430×932 Chromium, and 20/40/60/80/120 synthetic or live120 fixtures; compares baseline vs guarded staging and a distinct visual-only wider-formation proxy. No game runtime changes.
- [Actions run 38538451145](https://github.com/danickman/ShowdownLab/actions/runs/38538451145) `browser-composition5h` **SUCCESS**, receipt/art screenshots [artifact 11881342501](https://github.com/danickman/ShowdownLab/actions/runs/38538451145/artifacts/11881342501). Last seen other browser jobs successful; check node-regressions completion before claiming all six jobs pass.
- Existing synthetic baseline by 20/40/60/80/120 units: pixel visible proportion **.6435/.4468/.3082/.2461/.2252**; nearly entirely obscured (<15% visible) **2/11/26/40/71 units**. This confirms severe individual sprite overpainting under dense presentation independent of the earlier coordinate pair proxy.
- Frozen live 120 snapshot: baseline alpha occupancy **.2951**, 45%-visible units **20**, mostly-hidden **42**. Guarded staging: **.3209**, ≥45%-visible **33**, mostly-hidden **38**, despite only 5.3% improvement in world-proximity geometry. Thus the previous claim of negligible visual improvement was too categorical: while the side-by-side still looks cramped, **actual sampled alpha visibility does improve more than center-distance overlap predicted**. Still not sufficient to promote a candidate based on visual aesthetics alone.
- Separate Y-stretch **visual-only proxy** (not exact re-simulated candidate): live120 source baseline **.2951**, ≥45%-visible **20**, mostly-hidden **42**; stretched positions **.3438**, ≥45%-visible **31**, mostly-hidden **38**. The apparent pixel improvement supports further actual formation candidate evaluation but does not verify combat balance, world positions or stage effect.
- **Next steps:** generate camera/staging/author-art images from exact baseline vs altered `legacy-sim-core` deployment snapshots (not post-hoc Y-stretch), record terminal outcomes and first-hit/action latency across seeded mirrored matches, and compare occlusion at spawn, first contact and midfight. Compare ordinary/mixed roster separately from monotype swarm. Do not merge/deploy or mutate combat core without full regression and PWA integrity updates. 

### Final verification of alpha-occlusion instrumentation

- [GitHub Actions run 38538451145](https://github.com/danickman/ShowdownLab/actions/runs/38538451145) completed **6/6 jobs SUCCESS**, including authored-sprite alpha-visibility Chromium job and all existing regressions.
- Implementation commit `df36388`; this handoff section only is updated after CI. No runtime modification or production deployment. Next handoff priority remains exact re-simulated deployment screenshots and terminal-balance evaluation before promoting any formation candidate.

## Turn 5H — exact simulator formation snapshots and authored visibility (2026-10-14)

- Commit `42e9849` adds `tools/qa/check-formation-visual-snapshots.cjs`, an **isolated VM** source comparison that executes real baseline and widened 0.75-span/0.085-step `LegacySimCore` deployments under the same seed, retaining full simulation separation and captures exact fighter state at spawn, after 90 frames, after 360 frames. No game-core edits.
- Commit `b895598` wires exact 80/120 positional snapshots into the established Chromium authored-art renderer; `fd04006` makes `browser-composition5h` generate these JSON snapshots before browser comparisons; `2a7b6d7` corrects an array syntax issue caught by first CI run [38539158318](https://github.com/danickman/ShowdownLab/actions/runs/38539158318). The corrected [Actions run 38539306012](https://github.com/danickman/ShowdownLab/actions/runs/38539306012) has browser-composition5h **SUCCESS** and five of six jobs successful when checked; the node-regressions job was still in progress. Verify final run before claiming all six passed.
- Downloaded the successful [visual evidence artifact 11881611507](https://github.com/danickman/ShowdownLab/actions/runs/38539306012/artifacts/11881611507) and inspected `composition-exact120.png` (baseline left, exact revised deployment right). Actual authored alpha sampling results:
  - `exact80`: baseline vs vertical candidate alpha visibility **0.1732→0.1884**; fighters ≥45% exposed **5→7**; mostly hidden <15% **63→52**.
  - `exact120`: baseline vs vertical candidate alpha visibility **0.1513→0.1615**; fighters ≥45% exposed **9→8**; mostly hidden <15% **99→93**.
- **Finding:** exact widened formation provides a modest aggregate pixel-visibility gain but does **not** solve crowd readability. At 120 fighters it reduces the count of readily discernible silhouettes using the 45% threshold. Actual image looks like two tiny overpainted colored masses in a narrow horizontal region of mostly empty arena. Exact deployment camera zoom was ~0.4213 existing / ~0.4149 candidate; the camera's wide initial fit and current 5G painter stacks are key possible contributors. The previously higher ~0.34 alpha fraction was a **posthoc Y-stretched live-combat snapshot**, not the new exact formation's spawn situation; do not conflate.
- **Decision:** do not promote current vertical deployment variant or widen camera solely from these results. The next high-leverage work is to test alternative bounded **battle composition** at spawn and at contact with actual projection, figure out whether the world-coordinate layout scale, camera distance or combat formation physically blocks visually using the arena. Investigate fighters' world X/Y spread relative to visible floor, and whether initial camera zoom is constrained by edge/equipment safety assumptions. Preservation requirements: 300 seeded duels, combat determinism, class roles, Ultimates, stage bounds, no fake contact. No runtime change, PR merge or production deploy.

### Exact formation snapshot verification

- [Run 38539306012](https://github.com/danickman/ShowdownLab/actions/runs/38539306012) finished **six of six jobs SUCCESS**. Actual authored-art comparison `composition-exact80.png` and `composition-exact120.png`, real simulator-generated position JSON, and alpha visibility receipts are in [artifact 11881611507](https://github.com/danickman/ShowdownLab/actions/runs/38539306012/artifacts/11881611507).
- Latest CI-verified executable commit `2a7b6d7`. Handoff-only commits afterward do not affect application runtime. No merge or production deployment.

## Exact battle-phase camera footprint and alpha diagnostics — 2026-10-14

- Commits `3a2d7fd`, `66a6b0e` extend `tools/qa/check-composition5h-browser.cjs` to include **exact unmodified-vs-.75-vertical-span simulation positions** for 80/120 fighters at deployment, frame 90 (early), and frame 360 (mid). Comparison uses identical camera and CombatStaging and actual authored sprites, plus per-fighter sampled painter-order alpha occlusion.
- Browser evidence from [Actions run 38540239771](https://github.com/danickman/ShowdownLab/actions/runs/38540239771/artifacts/11881647663) — browser-composition job SUCCESS. Measured **fighter center extents** against camera arena 402×481.8 CSS pixels, not silhouette footprint.
- Exact 120 baseline deployment: 157.4 px horizontal (**39.2% of 402**), 95.6 px vertical (**19.8% of 481.8**); .75-span variant: 157.4×114.9 (**23.8% vertical**). Similar X extents in 80 fighter cases. At frame90 120: baseline 157.4×120.5, candidate 157.4×130.1. At frame360 120: baseline 157.4×161.1, candidate 157.4×176.4. At frame360 80: baseline 169.2×158.2, candidate 169.2×211.3.
- Actual sampled alpha visibility ratios baseline→candidate: 80 deploy **.1732→.1884**, early **.1848→.2046**, mid **.4182→.4288**. 120 deploy **.1513→.1615**, early **.1719→.1716** (no benefit), mid **.2386→.2496**. Number of ≥45%-visible sprites in 120 deploy **9→8**; early **11→8**; mid **10→10**. More Y spread does not consistently improve recognizability.
- **Root-cause direction:** measured world-position horizontal span remains ~39% of arena through most phases even as Y span varies. The character-overlap issue cannot be resolved by camera zoom, a higher lane cap or a modest Y increase alone. Need independent **horizontal deployment / combat engagement envelope** experiment, accounting for direction of attack, travel time, contact/kill rates, front/back role separation and bounds; a presentation-only arbitrary spread risks disconnected melee. Do not make runtime changes until meaningful authored-visibility and full terminal balance validation. Existing protected `v3/legacy-sim-core.js` untouched.
- Note measurement is a bounding span, not utilized area, no proof that simply making 2× X extent is desirable. Check 80/120 and ordinary battles separately; measure time to first hit/target reach, role-specific damage, winner and battle duration on mirrored seeds.

## Horizontal formation experiment — 2026-10-14

- Implemented `tools/qa/check-horizontal-formation.cjs` at `c887ca4`, with isolated VM variants of baseline xStep .035, compact xStep .025, deeper xStep .050, and shifted frontline spawn origin (.22/.78 → .19/.81), each tested against actual unchanged combat core at 40/80/120 fighters × three seeds for deployment and frame 360. None is shipped. The frontline shift makes opposing teams farther apart and must be evaluated for increased first-hit delay.
- CI integration `b8cce18` adds `horizontal-formation.json` receipt; [run 38540889465](https://github.com/danickman/ShowdownLab/actions/runs/38540889465). Inspect full CI and logs before recommending any variant. Geometry pair metrics alone do not prove alpha visibility or viable battle balance.
- Follow-up must check exact screenshot alpha, opponent contact time, melee vs ranged contribution, terminal outcomes and 80/120 performance. Production, core simulation, and SW hash unchanged.

### Horizontal formation experiment — verified verdict

- [CI run 38540889465](https://github.com/danickman/ShowdownLab/actions/runs/38540889465) **6/6 jobs passed**, including new horizontal variant simulation and all browser/evolution/offline tests.
- Mean close allied world-coordinate pairs across 40/80/120 fighters × 3 seeds, deployment / frame360: **baseline 113.67 / 22.89**; xStep .025 **118.78 / 26.56**; shift front origins from blue .22/red .78 to .19/.81 **124.11 / 23.67**; xStep .050 **121.67 / 24.78**. Normalized close-pair deploy proportion baseline **.0738**, variants **.0767/.0775/.0771** respectively.
- **Reject all three** under current metrics: compact/deeper rows or outward frontal spawn shifts do not decrease same-team close-nearness; shifting teams outward may also delay contact. Do not integrate or deploy. Note this compares world-coordinate centres, not authored sprite alpha; no terminal win-rate experiment was performed.
- Next investigative direction: collision separation at initial spawn, silhouette/lane occlusion and screen-space composition; world-coordinate arena extents cannot be widened arbitrarily without breaking fighter engagements. Consider meaningful treatment of render hierarchy (heavy fighter overpainting, level visibility, controlled occlusion) or changed engagement distribution with actual full simulated contact safeguards, rather than another blind xStep change.

## Three-zone distributed engagement prototype — 2026-10-14

- Created `tools/qa/check-engagement-zones.cjs` (`ac6fb1d`) as **isolated VM source variants**, not runtime edits: existing deployment versus squad-aware three-zone spawn placement, with squad modulo 3 mapping to distinct vertical engagement sectors at offsets ±.26 or ±.32 of normalized arena height, retaining the existing nine-lane cap and a reduced within-squad vertical step. Target selection, damage and movement remain unmodified. No rigid zones or walls. Intended for dense 40/80/120 unit tests only until balance proof.
- Added the test and `engagement-zones.json` artifact to the existing six-job CI (`cb9c110`). Run [38541818939](https://github.com/danickman/ShowdownLab/actions/runs/38541818939). Look up final status and test log before citing any results or calling this validated.
- **Key limitation:** current harness reports team-level world-centre nearness at deployment and frame360, not independent lane persistence, alpha readability, contact timing or terminal match balance. Spatially distribute *actual combat* only if later exact sprite-rendered screenshots and live-combat outcomes warrant it. Need test 3-zone left/right pressure, early target travel, first hits, flanking and ultimate availability; candidate may be harmful. Keep runtime and production untouched.

### Three-zone experiment outcome (first simulator gate)

- From Actions run `38541818939`, diagnostic step `check-engagement-zones.cjs` **PASS**: 9 matched scenarios at 40/80/120 units × three seeds, actual baseline vs isolated three-zone source variants. Mean near allied pairs deploy / after 360 frames: **baseline 113.67 / 22.89**, **zones26 95.89 / 15.78**, **zones32 86.56 / 14.44**. Normalized deployment close-pair rates **.0738**, **.0603**, **.0568**. Relative raw pair improvement strongest zones32 **23.85% deploy, 36.9% frame360**. This is world-centre nearness, not verified occupancy, authored sprite visibility, or lane persistence. Avoid claiming a production result. Note frame360 survivor losses could affect absolute pair counts.
- **Promising enough for next gated experiment only**, not integration. Capture per-sector unit alive/engaged counts and exact authored-sprite alpha visibility at deployment, early contact and frame360, and compare time-to-first-hit, match end times, class abilities and win-rate across seed reversals. Squad identity `e.squad%3` is a first-pass zone assignment and might not correspond to player-intended tactical groups. Test whether target pursuit destroys zones and whether enemy forces actually meet in all three sectors.

## Three-zone exact authored-sprite QA — 2026-10-14

- Implemented exact isolated baseline/three-zone (squad-index mod 3; Y offsets ±.32) combat state recorder `tools/qa/check-zones-visual-snapshots.cjs` at commit `6be9888`. Stores deployment, 90-frame and 360-frame positions for identical seeded 80/120 fighter rosters, without modifying real runtime.
- Extended `tools/qa/check-composition5h-browser.cjs` at `ee61157` to render `composition-zones80/120{-early,-mid}.png` with authored fighters, matched stage/camera and alpha painter-order metrics. Workflow `f62c4e9` now captures `zones-exact.json` before browser tests. [CI run 38572545807](https://github.com/danickman/ShowdownLab/actions/runs/38572545807) browser composition job **SUCCESS**; inspect full workflow completion separately.
- Measured baseline→zones32, **80 fighters**: deploy alpha visible fraction **.1619→.2291**, ≥45%-visible units **5→10**, hidden (<15%) **61→51**. Early frame90 **.1848→.2556**, recognizable **7→13**, hidden **57→45**. Mid frame360 **.4182→.4132** (slight regression, different survivor count baseline53 vs variant56).
- **120 fighters**: deploy alpha **.1399→.1813** (+29.6% relative), ≥45%-visible **9→11**, hidden **99→95**, Y center footprint 95.6→138.8px (19.8→28.8% of 481.8px arena), X center span **157.4px unchanged** (~39.2% arena). Early alpha **.1719→.1976**, ≥45%-visible **11→11**, hidden **91→88**. Mid alpha **.2386→.2904**, ≥45%-visible **10→13**, hidden **45→50**, and alive baseline80 vs candidate83: avoid treating hidden counts as strictly comparable without survivor normalization. Exact matched snapshots are from separate evolved combat trajectories.
- Visually inspected 120-fighter authored image: three-zone deployment shows taller cluster but still a largely overlapping single battlefield mass; no apparent independent engagements, horizontal center footprint remains narrow. A true three-front game requires intentional and measured engagement distribution, not just start location perturbations.
- **NOT READY FOR RUNTIME:** evaluate contact/timing/role balance, independent per-zone activity and lane persistence, mirrored seeded win rates and terminal outcomes. Also clarify squad assignment schema before any player-facing zones; current modulo can distribute same-type grouped squads unpredictably. Preserve main and production.

### Final tri-zone exact-visual CI verification

- [CI run 38572545807](https://github.com/danickman/ShowdownLab/actions/runs/38572545807) completed **all six jobs successfully**, including exact three-zone authored-art comparison, standard 300-duel regression, additional 80/120 simulation experiments, PWA/offline and upgrade checks. This validates the testing infrastructure and unchanged baseline; it is **not** a full terminal-balance approval of the three-zone candidate.
- Next work: diagnose why three initial bands still form a visible merged column, then instrument per-zone engagement and first-hit latency across actual combat time; use a full-battle comparison before any guarded gameplay change. The tests and handoff are on `qa-turn1-duel-baseline`, not merged or deployed.

## Three-zone engagement persistence and first-damage timing — 2026-10-14

- Added read-only `tools/qa/check-zone-engagement.cjs` (`5ece2ee`), instrumenting actual LegacySimCore baseline, ±.26 and ±.32 squad-zone variants at 40/80/120 fighters × 3 seeds. At deployment and frames 90/180/360, records three Y-sector alive counts, blue/red presence and cross-team pairs within normalized radius .12. Records first sampled such contact and first detectable total-HP decline (15-frame sampling, not precise hit frame). Existing 9-lane combat core and renderer remain completely unchanged.
- CI step and `zone-engagement.json` evidence in `20a570a` [run 38580132838](https://github.com/danickman/ShowdownLab/actions/runs/38580132838). Inspect logs and final CI before interpreting output. Current metrics are **proxy engagements**: near opposing pairs do not prove melee attacks or that all units are contributing; no terminal battle balance validation yet.
- Decision gate: compare average first-damage delay and number of simultaneously active Y sectors at frame360; if zone persistence vanishes, moving spawn alone is insufficient. If meaningful, next instrument real damage events / full terminal winner/duration and sprite alpha snapshots before considering controlled runtime change. Preserve production and draft PR status.

### Verified engagement persistence result and decision

- [Run 38580132838](https://github.com/danickman/ShowdownLab/actions/runs/38580132838): **6/6 CI jobs passed** (node 300-duel/evolution stress, Chromium authored sprites, PWA offline/upgrade, art). This verifies the new read-only diagnostics, not tri-zone game readiness.
- Actual mixed seeded 40/80/120 total-fighter matches × 3 seeds; measurements use 15-frame sampled time to first HP decline and proximity-defined cross-team contact pairs in fixed north/center/south thirds. Baseline vs ±.26 vs ±.32: first detectable damage **frame 65.0 / 71.7 / 75.0**, active sectors at frame360 **2.56 / 2.67 / 2.56 of 3**. Spawn same-side nearness **113.67 / 95.89 / 86.56**. Thus larger deployment separation improves initial packing, but at this sampling point **does not create more simultaneously active sectors** and delays first damage ~10 frames (~0.17s at nominal 60fps) for the wide variant. Sampling is 15-frame coarse; do not treat as precise attack timings.
- **Decision:** do not promote spawn-only tri-zone changes to runtime. Need experiment with locality-aware target selection, squad cohesion/engagement slots and controlled flanking (no rigid zone boundaries), plus full outcome, role and actual sprite QA. Crucially, preserve small-fight baseline and validate against enemy target clustering/stranded fighters. The `check-zone-engagement.cjs` diagnostic and machine-readable evidence remain permanent regression research tools; active QA branch only, no merge/deploy.

## Soft locality-aware targeting investigation — 2026-10-14

- Created isolated `tools/qa/check-zone-locality.cjs` (commit `8ec1617`), derived from the prior three-zone persistence profiler, with four VM-only source variants: original baseline, spawn-only zones32, and zones32 plus *soft* cross-sector target-score penalties of .08 or .16 when target and actor differ in Y by >.22. Existing nearest-target distances, pressure penalty, free movement and attack rules remain intact. Unlike rigid lane fences, units can pursue across sectors where doing so remains optimal. No application/runtime code was modified.
- Added step and `zone-locality.json` to CI at `920441d`; [run 38581123470](https://github.com/danickman/ShowdownLab/actions/runs/38581123470). It measures 40/80/120 combatants × 3 matched seeds, first sampled HP damage and active three-sector cross-team-proximity count after 360 frames. **Check CI completion and metrics before recommending either penalty.**
- Acceptance caveats: 15-frame HP sampling and .12-radius inter-team proximity are proxies, not direct attack events or real terminal outcomes. A higher locality penalty could strand survivors or change sniper/assassin roles; require longer-run, role-specific and mirrored terminal tests before game integration. If target-scoring alone fails to create separate fronts, investigate engagement-slot policies with guarded relaxation, not hard paths or walls. Keep runtime and main untouched.

### Verified locality-targeting result — candidate local08

- [CI run 38581123470](https://github.com/danickman/ShowdownLab/actions/runs/38581123470) **6/6 jobs SUCCESS**. Tests include original 300 duel baseline and existing browser/offline checks, plus isolated VM locality diagnostics (NOT full terminal QA for candidates).
- 40/80/120 combatants × seeds 1337/7301/27919. Mean at frame360, **active fixed Y thirds** (defined by opposing fighters within .12 normalized radius): baseline **2.56**, spawn-only ±.32 zones **2.56**, ±.32 + soft cross-zone target score penalty **.08 => 3.00**, ±.32 + **.16 => 2.78**. Same-side near-pair counts at frame360: **22.89 / 14.44 / 13.89 / 16.22**, respectively. First sampled total-HP decline frames **65.0 / 75.0 / 73.3 / 73.3** (15-frame sampling granularity). Initial zone variants all near-pair **86.56** vs base **113.67**.
- **Best research candidate** is ±.32 squad-sector deployment plus **mild .08 penalty** for selecting an opponent more than .22 normalized Y away. Penalty is soft; moves/abilities unchanged, no fixed walls. This supports simultaneous spatial *proximity-defined* contests, not proof of useful or balanced damage in each sector; sample limited to 9 scenarios/360 frames. For ordinary matches (<60), preserve exact baseline behavior if candidate is eventually made density-gated.
- Next: direct per-sector damage/kill counts (not proximity only), mirrored full-terminal outcomes, time to victory/deadlock, first-hit latency, role-specific melee/ranged contributions and Ultimate event integrity. Render exact late-fight snapshots with actual authored sprites and verify mobile frame costs. Before runtime integration run release-hash and SW integrity updates; no production merge without authorization.

## Locality candidate full-match gate — October 14, 2026

- Added isolated VM test `tools/qa/check-zone-terminal.cjs` (`7788466`) comparing unmodified baseline to three-zone deployment with mild soft Y-locality target penalty .08. Six matched dense situations: total 40/80/120 fighters × seeds 1337 and 7301. Run at simulated speed 10 with a safety ceiling of 1,600 RAF callbacks. Capture winner, terminal completion, elapsed frames/ticks, survivor count, early damage timing and per-sector snapshot. **Not a 300-duel candidate balance proof and no mirrored roster permutations yet.**
- Integrated receipt `zone-terminal.json` into Node CI (`c8e3703`), run [38586016920](https://github.com/danickman/ShowdownLab/actions/runs/38586016920). Inspect CI completion, especially timeout or invalid full-match outcome; do not assert validation without reading logged receipts. Runtime `v3/legacy-sim-core.js` unchanged; main and production not deployed.
- Acceptance: require terminal completion, reasonable length, no stranded units, winners and role actions sensible, wider seeds/mirrored sides and first-hit/Ultimate integrity. This new harness deliberately reports outcomes rather than auto-approving the candidate. Current baseline/zone alpha findings and previous nine-seed sector activity remain as documented above.

### Full-match locality gate — verified results

- [CI run 38586016920](https://github.com/danickman/ShowdownLab/actions/runs/38586016920) **all six jobs SUCCESS**; bounded full-match VM candidate comparisons completed successfully. Baseline **6/6 terminal**, mean **211.7 RAF frames**, winners `[blue, blue, red, red, red, red]`. Local08 **6/6 terminal**, mean **218.8 RAF frames**, winners `[blue, red, red, red, red, red]`. Matches at 40/80/120 total units × seed 1337/7301, speed10, 1600-frame ceiling; no nonterminal match in this sample. Mild locality **changes one of six winners** and increases mean duration ~3.4%, a noteworthy real combat behavior change requiring evaluation, not an automatic rejection or balance sign-off.
- Existing baseline 300-duel tests passing do not validate candidate's balance. Need more mirrored matchups/seed diversity, role-specific action & damage contributions, Ultimate/AI target behavior, and real authored-sprite visuals of the locality variant (not just tri-zone spawn) before runtime promotion. The six-match output is evidence of feasibility, NOT statistical balance certification. Keep runtime and main unchanged, maintain Draft PR.

## Mirrored locality QA, 2026-10-14

- New test: `tools/qa/check-zone-mirrors.cjs` at `b12fe07`, 40/80/120 units, four seeds, both roster-side assignments, baseline and VM-only three-zone + soft .08-locality candidate. Total: 24 scenarios and 48 simulation evaluations. Reports winners, completion, duration, first-damage proxy. Uses 1600-frame ceiling at speed 10.
- Workflow update `5bb9b7a` adds a required step and `zone-mirrors.json` receipt. Review its CI run and actual receipts before any balance claim. The evaluation cannot establish role-specific damage attribution or full release readiness by itself.
- Protected game files unchanged; do not merge or deploy. Next gate: inspect winner differences, stranding and timing, plus actual authored-sprite candidate visuals.

### Mirrored locality test — verified verdict

- [Actions run 38587614089](https://github.com/danickman/ShowdownLab/actions/runs/38587614089) completed **six of six jobs SUCCESS**, including all existing QA and mirrored full-match candidate probe.
- 24 matched scenarios (40,80,120 fighters × 4 seeds × swapped roster sides); original baseline **24/24 terminal** vs VM-only ±.32 squad zones + .08 Y-locality preference **24/24 terminal**; mean duration **200.7 vs 216.5 RAF frames**, +7.9% for candidate; winners changed **5/24 (20.8%)**. No observed nonterminal states within 1600-frame cap. This is not mirrored statistical fairness proof; deterministic simulations can diverge from modest targeting changes, and role/Ultimate metrics remain unmeasured.
- **Verdict:** candidate only, do not merge or deploy. 3-sector activity previously averaged 3.00/3 but winning outcomes and duration change. Next gate: detailed offensive contribution by fighter class, Ultimate event fidelity and matched authored-sprite alpha visibility for actual locality candidate during midfight; determine whether target scoring improves fun and tactics rather than merely redistributing damage. Consider comparing low-density baseline parity separately. Current artifacts are repeatable in CI `zone-mirrors.json`.

## Role-specific effects of multi-front locality, 2026-10-14

- Implemented `tools/qa/check-zone-role-effects.cjs` in `c6ac6e9`, measuring fighter-type survival fractions and counted offensive-action frames in actual terminal LegacySimCore VM simulations of baseline vs zones32 + soft .08 targeting. Scenario matrix: 80 and 120 fighters × seeds 1337,7301 × mirrored side rosters (8 paired scenarios). Results grouped by all ten fighter types and by starting side. Speed10, bounded 1600 RAF frames. Counts of action-name matches are **not credited damage** or verified Ultimate casts; they only support identifying potential role changes. Similar visual alpha QA already exists, but no new runtime candidate integration.
- Workflow integration `82f21fc` writes `zone-role-effects.json` and logs aggregate survival/action metrics. [CI run 38589901069](https://github.com/danickman/ShowdownLab/actions/runs/38589901069). Must read run result/logs before claiming which types benefited.
- Interpretation: a beneficial strategy would have meaningful distributed engagements while preserving each type's distinct duties. Role action frames can grow simply because the match lasts longer; normalize to unit-seconds/frames and compare remaining HP and first-hit timing. Damage attribution requires explicit hit-event recording, separate from this test. No production/main merge.

## Role-specific locality measurements — October 14

- Run 38589901069: role QA test completed; the full node-regressions job was ultimately **cancelled**, while five other jobs passed. Do not claim full CI success.
- In 8 matched mirrored 80/120 fighter cases, both versions reached a winner 8/8; winner differences 0/8; mean frame counts baseline 197.9, mild-locality 214.0.
- Final survival share by type, baseline to candidate: Knight .025 to .050; Goose 0 to 0; Assassin 0 to 0; Sniper .325 to .362; Dragon .287 to .350; Beetank .063 to .100; Mole 0 to 0; Turtle .225 to .113; Goblin 0 to 0; Barbarian 0 to 0.
- Counted offensive action frames: Knight 5796 to 5174; Goose 89 to 78; Assassin 39 to 43; Sniper 95 to 79; Dragon 2292 to 2349; Beetank 1641 to 2174; Mole 167 to 180; Turtle 2551 to 2844; Goblin 41 to 29; Barbarian 596 to 720.
- These action-frame counts are not damage attribution or independently counted attacks; durations differ. Treat results as directional only, especially Turtle decline and ranged/heavy survival increases. Next: instrument attributed damage, time alive and ability casts; compare strategy archetypes and mirror seeds. Keep candidate isolated; no deployment.

## Ultimate Lab custom enemy roster — family usability request, 2026-10-14

- Added child-friendly **Choose Your Enemies** subpage accessed within Ultimate Lab's Red / enemy preset section. Ten fighter types, +/- counts, 60-fighter cap, clear, empty-selection refusal, return to lab, with compact custom summary; preset buttons still work. The saved custom red roster supplies actual Lab battle configuration and should persist for replay. Root `index.html` and `v3/index.html` synchronized; `v3/v3.js` updated for event delegation and red army selection. No changes to combat core or locality experimental runtime.
- Service-worker release hash manifest refreshed for root/v3 HTML and v3.js with independently verified JS SHA-256 implementation against unchanged camera.js; cache rotated to `showdown-lab-release5g2`. CI browser scenario in `tools/qa/check-lab-enemies-browser.cjs` targets iPhone portrait, chooses 2 Dragons + 1 Goblin, returns to Ultimate Lab, runs experiment and checks actual red army counts. Workflow `b1d0e23` includes test. Inspect CI result before claiming complete.
- Experimental role-specific results from cancelled older workflow `38589901069` (the role step **did finish**, though overall workflow was cancelled): 8 paired terminal scenarios, all winners equal; Sniper survival 32.5→36.2%, Dragon 28.7→35.0%, Beetank 6.3→10.0%, Turtle 22.5→11.3% (baseline→locality). Tiny sample, action counts are not damage. Revalidate in current CI, no candidate release.
- The QA branch is not merged or deployed. Parent request: preserve clean Lab UI, don't add ten rows to original settings panel. Validate both normal presets and custom list, back navigation and replay.

### Custom enemy Lab browser QA — verified

- [Actions run 38593533769](https://github.com/danickman/ShowdownLab/actions/runs/38593533769) browser-composition5h job **SUCCESS**, including explicit iPhone 15 Pro Max portrait simulation of `Choose Your Enemies`: select Dragon twice and Goblin once, confirm submenu return, launch battle, assert actual red army `{dragon:2,goblin:1}`. First QA run had correctly discovered `BASE_COUNTS.goblin=6` implicit squad expansion; fixed custom red configuration to pass `redCounts` object to adapter, preserving preset defaults. Fix commit `54db043`, pinned hash `90121bc`, service worker cache revision `fe64365`. Both HTML entrypoints in sync, browser regression passing. Do not confuse this with a production deployment.
- Continue role-locality research independently; specifically verify Turtle weaker survival, Dragon/Beetank apparent gains with direct damage events and more matched scenarios. No combat runtime changes. Production/main untouched.

## Canonical single entrypoint cleanup — October 14, 2026

- User explicitly requested removal of redundant `v3/index.html`; deleted it on QA branch in commit `1238554`. Canonical app entry is now **`/` → `index.html`**. The `/v3/` directory retains necessary script, CSS, authored images and simulation modules. This is not a directive to delete runtime assets.
- Service worker `sw.js` was updated in `144924d`: removed duplicate HTML from `SHELL`, `RELEASE_SHA256`, and critical path handling; all navigations within its scope use the root shell; release cache version raised to `showdown-lab-release5g3` to avoid mixing old and new offline releases. Pinned digest verification script updated in `4768840` to include only `/` plus versioned modules; consistency QA now verifies the duplicate HTML stays absent (`c862292`).
- CI for deletion commit: https://github.com/danickman/ShowdownLab/actions/runs/38594448063 ; inspect all jobs and specifically offline, service-worker integrity, and mobile browser workflows. If other scripts depend on legacy HTML, migrate them to root rather than restoring the duplicate.
- Role-specific locality finding from earlier matched sample (8 pairs, still preliminary): Dragon survival 28.7→35.0%, Sniper 32.5→36.2%, Beetank 6.3→10.0%, Turtle 22.5→11.3% for baseline→zones32 + locality08. Action-frame counts and survivor metrics are NOT direct damage attribution; baseline longer 24-pair trial had five winner divergences. Next focus direct hit/damage attribution (including Turtle's guard, Sniper retreat/aim, Assassin signature and Dragon breath), larger seeds, and final authored visuals before integrating locality changes.
- No merge or production deployment. Ultimate Lab's custom enemy selection remains on QA branch with its exact-count Chromium scenario verified. Keep checking that root-only PWA loads correctly and preserves that feature.

### Direct fighter damage attribution probe — 2026-10-14

- Added QA-only `tools/qa/check-zone-damage.cjs` at `dcd7891`, built from isolated `check-zone-role-effects` source variants. Hooks the precise `LegacySimCore.hurt()` post-mitigation `dealt` calculation **in ephemeral VM source only**, logging attacker fighter type/team, target class, secondary hit flag, HP removed and kills. This measures real effective damage rather than animation/action frame counts. Baseline vs `zones32+local08` paired 80/120-fighter matches × seed 1337 × swapped rosters (four scenarios, eight VM runs), terminal cap 1600 RAF frames. Small directional sample, do not extrapolate balance from isolated differences; secondary hits included and explicitly broken out.
- Added `zone-damage.json` output and CI required step in `1788d4d`; https://github.com/danickman/ShowdownLab/actions/runs/38594717174 . Inspect actual results and completion. Compare `Dragon`, `Sniper`, `Beetank`, `Turtle`, as well as all other types, normalizing per deployed fighter / match duration. Ensure Ultimate-induced hits are accounted for, with limitations explained. No production code changed.
- Canonical entrypoint cleanup still in scope, tested in https://github.com/danickman/ShowdownLab/actions/runs/38594448063 ; do not restore `v3/index.html`. Updated docs are checkpoint only until CI verifies single root shell, offline caching, and all browser tests. Production/main still unchanged.

### VERIFIED fighter-type effective damage results — 2026-10-14

- CI [run 38596977660](https://github.com/danickman/ShowdownLab/actions/runs/38596977660) completed `check-zone-damage.cjs` successfully, within standard Node regression job. Four matched terminal scenarios (80/120 total fighters × one seed 1337 × swapped teams), each baseline and VM-isolated zones32+local08. Winners matched all four; mean duration 212.8 baseline vs 218.5 candidate frames. `hurt()` post-mitigation actual HP removed and credited kills by attacking type, including secondary hits.
- Aggregated effective damage baseline→locality: Knight 3160.53→3558.06 (+12.6%); Goose 1530.27→902.45 (−41.0%); Assassin 652.37→0 (critical sample warning); Sniper 17482.18→24711.64 (+41.4%, kills 47→59); Dragon 51847.65→53183.27 (+2.6%); Beetank 9304.49→8293.19 (−10.9%); Mole 16422.30→15433.85 (−6.0%); Turtle 1893.92→1652.79 (−12.7%, kills 6→2); Goblin 522.29→504.91 (−3.3%); Barbarian 3151.86→2619.72 (−16.9%). NOTE small sample and action types might attribute AoE/secondary differently. Some dramatic deltas deserve wider seeds and unit-exposure/time normalization.
- Tactical read: Sniper strongest apparent beneficiary; Dragon slightly stronger; Turtle weaker on both damage and prior survival test; Assassin showed no dealt damage in these four candidate cases. Never release on this evidence. Prior 24 mirrored scenario winner divergence 5/24 and longer matches also apply.
- Separate focused GitHub Actions workflow `.github/workflows/qa-zone-damage.yml` added as research infrastructure at `a03b0c5`, but GitHub did not trigger it automatically for this first creation on the feature branch. The standard CI verified the actual diagnostic instead. No production/core changes.
- Single-root app-entrypoint migration: `v3/index.html` remains deleted and browser/offline tests passed on the checked run; retain only root `index.html`, preserve `/v3/` assets, never resurrect duplicate. New Ultimate Lab exact-unit enemy picker remains validated.
- NEXT: investigate Assassin zero hit outputs and Turtle vulnerability in larger mirrored role-focused seeded tests; distinguish deployment, target penalty, baseline roster variation and evolution-level mix; keep Sniper advantages but prevent ranged dominance. Add normalized damage per unit tick and complete release guardrails before runtime promotion.

### October 14 root-only cleanup QA repair and damage test status

- Completed investigation of [root-only cleanup CI 38594448063](https://github.com/danickman/ShowdownLab/actions/runs/38594448063): all five browser/PWA/art jobs succeeded, but node-regressions failed at `check-release4c.cjs` because a **hardcoded precache count** still expected 50 instead of 49 after deleting `v3/index.html`. The root-only behavior was not implicated; updated count to `required.length+8` in `cac2f87`, preserving full install/integrity/rollback assertions. Follow-up [CI 38604872856](https://github.com/danickman/ShowdownLab/actions/runs/38604872856) is validation gate; report only results observed, not assumed.
- [Damage-attribution CI 38594717174](https://github.com/danickman/ShowdownLab/actions/runs/38594717174) had five browser/offline/art job successes but its node job **was cancelled while running `check-zone-damage.cjs`**, so there are *no valid damage results*. Re-run on corrected branch; do not infer precise fighter benefits from prior action counts or survival samples.
- The intended next priority remains actual per-class attributed HP damage/kills by Dragon, Sniper, Beetank, Turtle and others across matched locality baseline scenarios; assess survivor/kill changes and candidate authored-sprite presentation before any production integration. Keep duplicate v3 HTML deleted, root-only PWA, custom enemy picker, and unchanged combat production baseline.


### October 14 continuation — canonical launch-guide QA fix

- Inspected the current QA branch and runs 38594448063, 38594717174, 38596977660 and 38604872856. Run 38604872856 passed all five browser/PWA/art jobs and the corrected `check-release4c.cjs` release/offline test (49 precache requests), but the overall Node job failed in `tools/check-launch-guide.cjs` due to an obsolete unconditional read of deleted `v3/index.html`. This is a *separate* test migration defect, not evidence that the root page is missing.
- Commit `ad6002cbbce1035713110b9a74ffe8f5f67f93e0` changes launch-guide QA to explicitly assert that the duplicate entrypoint is absent, while continuing to inspect canonical root `index.html` and unchanged Guide, manifest and PWA hooks. No runtime or combat-core files modified. Follow-up CI after this commit must be inspected; do not mark full CI passing until its Node job completes successfully.
- Direct actual-damage instrumentation was independently verified by successful `check-zone-damage.cjs` steps in runs 38596977660 and 38604872856 (both overall workflows failed later in unrelated release/launch tests). Four matched 80/120-fighter mirrored scenarios, one seed; terminal 4/4 each, winners identical. Baseline→locality aggregate damage: Sniper 17482→24712; Dragon 51848→53183; Beetank 9304→8293; Turtle 1894→1653; Assassin 652→0. These are unnormalized tiny-sample totals. The prior cancelled run 38594717174 is not their source. No locality candidate approved for runtime.
- Next: inspect new CI job logs and repair any remaining single-entrypoint references. Then add unit-exposure/lifetime denominators and additional mirrored seeds for Assassin, Turtle and Sniper role integrity; consider moving expensive optional research outside mandatory Node regressions. Production and main remain untouched.


### October 14 continuation — normalized fighter damage research

- Following confirmed successful direct-damage instrumentation in prior Node CI (four one-seed matched scenarios), added alive-frame exposure counters per fighter type in QA-only `tools/qa/check-zone-damage.cjs` (commit `836e21b7`). Every living fighter contributes one observed RAF frame per sampled simulator iteration, enabling `damagePerDeployed` and `damagePer1000AliveFrames` beside raw effective damage, hits and kills. These denominators are *observed fighter-frame exposures*, not simulation internal ticks and not wall-clock time. The runtime `legacy-sim-core.js` is unchanged.
- Introduced bounded optional `QA_DAMAGE_SEEDS` comma-separated integer seed matrix (1–12 seeds), defaulting to prior 1337 to avoid increasing mandatory main CI. Focused research workflow now requests three seeds: 1337, 7301, 8675309 (commit `2a7d6895`), each × 80/120 deployed fighters × mirrored sides × baseline/locality08. This remains experimental; do not infer measured outcomes or full success until dedicated CI finishes and produces valid receipt.
- Previous root-only followup [CI 38607845434](https://github.com/danickman/ShowdownLab/actions/runs/38607845434) had all five browser jobs successful while Node was still running at last inspection. The duplicate HTML must stay absent and the release guardrails unchanged. Further tasks: check final CI job logs and any actual attributed-damage exposure results, inspect Assassin hit opportunity/Turtle defense and Sniper influence, then assess multi-front spacing with real authored sprites before promoting any candidate. No main merge or production deployment.


### AUTHORITATIVE PRIORITY CORRECTION — October 14, 2026 (user clarification)

**Root-only application cleanup is the important deliverable of these turns.** The intended architecture has exactly one HTML application entrypoint, root `index.html`; `v3/index.html` remains deleted, while scripts, styles and artwork under `v3/` remain intact. The release precache-count assertion and launch-guide duplicate-HTML assertion were migrated. Preserve service-worker install, offline navigation, asset hashes, Ultimate Lab opponent picker, and root app behavior; do not restore a second entrypoint.

**Fighter damage attribution is NOT resolved or accepted.** The user explicitly clarified that the previous attribution conclusions were rolled back and should not be reported as completed findings. Prior experimental logged figures and QA-only instrumentation are historical research artifacts only, not verified balancing conclusions, gameplay changes, or permission to resume that investigation. The subsequent exposure-counter and expanded-seed commits (`836e21b7`, `2a7d6895`) must not be represented as successful damage-attribution validation. No experimental locality targeting is promoted to runtime. This correction supersedes earlier handoff headings that described fighter damage as VERIFIED and any implied damage-result completion.

At the time of inspection, all five browser/art/PWA jobs in runs 38607845434, 38608192663 and 38608236082 were reported successful, but `node-regressions` remained in progress, so a fully passing workflow is **not yet verified**. Continue by validating the canonical root-only shell, integrity, offline install/upgrade and associated Node regression result; prioritize any remaining app entrypoint references. Do not restart damage experiments until deliberately reprioritized. Branch remains `qa-turn1-duel-baseline`; no main merge or production deployment.


### October 14 — root-only release-guard hardening (current continuation)

- Prioritize canonical root `index.html`, deleted `v3/index.html`, offline install/update safety and root navigation. No role-damage conclusions should be used; damage attribution remains unresolved and out of scope for this turn.
- Commit `87f9e3f` updates `tools/qa/check-release4c.cjs`: precache request assertion now derives its expected count from parsed `SHELL` + HTML-derived `RUNTIME`, rather than the brittle `required.length+8` assumption. It explicitly guards that root `/` is present and duplicate `/v3/index.html` absent in the service-worker shell. Existing install rollback, hash checking, offline navigation, and optional image tests remain intact.
- Commit `2248a8e` updates `tools/qa/check-turn3-consistency.cjs` success output: it no longer falsely describes the root-only app as having mirrored HTML entrypoints. The actual absence assertion already existed.
- Earlier runs 38607845434, 38608192663, 38608236082 had five browser/art/PWA jobs successful but Node remained `in_progress` at the time of this turn's check. The new changes are **committed but not yet CI-validated**. Verify full Node job and service-worker tests before green release designation. No main merge/deploy; protected core unchanged.


### Root-only release validation isolation — October 14

- Added a separate five-minute `root-release-gate` CI job in `.github/workflows/qa-duels.yml`, commit `81b44bf`. This is a mandatory independent check for the canonical `index.html`, absence of `v3/index.html`, pinned SHA-256 manifest, consistency, atomic service-worker precache/rollback, selective Home image streaming, and launch-guide/PWA hooks. It avoids waiting for the lengthy research-heavy `node-regressions` job to answer basic single-entrypoint release safety questions, without removing existing Node or browser gates.
- At initial check, five browser/art/offline/upgrade jobs passed for run 38608983842 while Node remained in progress; run 38609044523 was queued. Neither is an all-green release signoff. The new root-release-gate must execute and pass on the new commit before confirming the hardening.
- Damage attribution remains unresolved/out of scope, no runtime combat edits. No merge or production deployment.


### October 14 — verified single-entrypoint release gate and research isolation

- [PR/CI run 38609252830](https://github.com/danickman/ShowdownLab/actions/runs/38609252830): independently inspected `root-release-gate` job 116008058560 **SUCCESS**. Its log explicitly shows 42 SHA-256 pinned shell/module digests verified, root-only HTML consistency pass, atomic installation of 41 runtime modules with rollback and offline navigation checks, selective Home art streaming pass, and ten-fighter Guide/PWA launch tests pass. At inspection, two browser jobs and Node regressions were still active; these are not full-suite green claims.
- Commit `409a20b` removes the unaccepted `check-zone-role-effects.cjs` and `check-zone-damage.cjs` investigative steps from the **mandatory** `node-regressions` job (and its receipt list). The separate focused research workflow remains available but is not a release requirement. No combat or application runtime code changed. Other deterministic/stress, evolution/Ultimate, root/offline and browser regression coverage remains.
- Damage attribution stays **unresolved, not approved, not a gameplay finding**. Root-only application cleanup is the primary deliverable. Watch new CI after the workflow edit and verify completion; do not merge or deploy without authorization.


### Root-entry release hash guard — October 14 continuation

- Commit `262292c` hardens standalone `tools/qa/release-hashes.cjs`: both manifest generation and `--verify` now explicitly reject a reintroduced `v3/index.html`. This protects the single-entrypoint architecture even when the full CI release gate is not invoked. No change to production runtime assets or hashes.
- Inspection of CI 38609252830: dedicated root-release-gate and all five browser/art/PWA jobs succeeded; long `node-regressions` was still in progress. Runs 38609740425 and 38609773513 for recent documentation/workflow commits were queued at inspection. New hash guard awaits CI verification; **do not describe entire CI as green** before it completes.
- Next: verify new full-run conclusions and safeguard Ultimate Lab custom opponents, offline navigation and pinned hashes. Damage attribution remains unresolved and deprioritized. No merge or deployment.


### October 14 — mandatory release CI decoupled from formation research

- Root-release-gate and all five browser/art/PWA jobs **passed** on [run 38609773513](https://github.com/danickman/ShowdownLab/actions/runs/38609773513), but `node-regressions` was still in progress when checked. In earlier [run 38609252830](https://github.com/danickman/ShowdownLab/actions/runs/38609252830), the same five browser/art/PWA jobs and root release gate passed while Node was ultimately **cancelled**, so the full workflow did not pass.
- Commit `5e0bca2` extracts eleven expensive exploratory composition/formation/locality source-variant checks from required `node-regressions` into an opt-in `exploratory-formations` job, active only for manual `workflow_dispatch`. Existing diagnostic scripts are preserved. Mandatory tests retain SHA integrity, ordered duels, 80/120 stress, staging/performance parity, dense layout and depth checks, evolution/Ultimate, root offline rollback, streaming, Guide and browser/PWA checks. This is CI scheduling/release-scope separation, **not** validation or adoption of any locality research, and does not change combat runtime.
- Current branch awaiting CI on the above workflow edit. Do not call full CI green or merge/deploy before checking its job conclusions. Root-only `index.html` remains canonical; `v3/index.html` stays absent. Damage attribution remains unresolved and unapproved.


### October 14 — FIRST VERIFIED ALL-GREEN REQUIRED CI after root-only cleanup

- [Run 38611403426](https://github.com/danickman/ShowdownLab/actions/runs/38611403426) completed with **SUCCESS** for `root-release-gate`, `node-regressions`, `browser-composition5h`, `browser-turn3`, `browser-turn4d`, `browser-upgrade`, and `knight-art-candidate`. `exploratory-formations` was skipped as designed on a nonmanual invocation. This confirms the release QA split works while retaining mandatory full deterministic/core, browser and offline checks.
- [Follow-up run 38611441183](https://github.com/danickman/ShowdownLab/actions/runs/38611441183) also reported overall SUCCESS on the handoff checkpoint; individual jobs should be inspected separately when needed.
- **Release review ready, not deployed:** canonical `index.html` remains sole HTML entry, duplicate `v3/index.html` absent, root/offline/upgrade checks green. No runtime combat edits or locality adoption. Fighter damage attribution is unresolved and intentionally excluded from required release gate. No merge to main and no production deploy without explicit approval.


### October 14 — damage-attribution blocker fixed; research reopened by user

- The user explicitly requested restarting the broader plan and **fixing** fighter damage attribution. The isolated QA source `tools/qa/check-zone-damage.cjs` contained an actual JavaScript syntax defect: `for(const seed of seedsfor(const mirror`, introduced during the prior seed expansion. Commit `c1621dc` repairs this to nested deterministic loops, adds an assertion that the injected post-mitigation `hurt()` anchor still matches the protected core, and requires the expected paired case count and terminal winners. Changes affect **QA only**; no runtime combat modification.
- The historical attributed totals were not previously accepted as strategic evidence, and the expanded 3-seed experiment **has not yet produced validated results** as of this checkpoint. The focused workflow `.github/workflows/qa-zone-damage.yml` remains the experiment runner. Require its CI success and receipt audit before interpreting per-unit and per-living-frame results. Keep exploratory locality unpromoted until role integrity and visible multi-front coverage are tested.
- Root-only release architecture and earlier passing required CI remain preserved. No main merge/deploy.


### October 14 — resumed damage validation, focused CI

- [Required regression run 38612125666](https://github.com/danickman/ShowdownLab/actions/runs/38612125666) completed with SUCCESS for all seven mandatory jobs: node-regressions, root-release-gate, browser-composition5h, browser-turn3, browser-turn4d, browser-upgrade and knight-art-candidate. Exploratory formations was skipped by design. Follow-up [run 38612183111](https://github.com/danickman/ShowdownLab/actions/runs/38612183111) also reports overall SUCCESS. These **do not execute the focused damage profiling test**, so they do not validate attribution figures.
- Confirmed the branch version of `tools/qa/check-zone-damage.cjs` now contains syntactically repaired nested seed loops and injection-anchor assertions. Added `node --check tools/qa/check-zone-damage.cjs` as an explicit first step of `.github/workflows/qa-zone-damage.yml` in commit `779f7ff`; the workflow retains three seeds (1337, 7301, 8675309) and produces `zone-damage.json`. The focused workflow's conclusion/results have **not** been independently observed in this turn; therefore damage attribution is still **UNVERIFIED**, not repaired end to end. No revised damage numbers are accepted.
- Next: obtain focused-workflow conclusion and receipt, check totals and normalized per-unit exposure, validate secondary/Ultimate kill credit and source coverage, then assess Assassin/Turtle/Sniper impacts. Do not modify combat runtime or promote locality until that evidence exists. Root-only entrypoint remains canonical; no main merge or production deployment.


### October 14 — observable damage attribution smoke gate

- The prior corrected three-seed damage script did not have an independently observable completed focused workflow via the available PR-associated GitHub CI checks; all-green required CI alone did not prove its execution.
- Commit `b5da2a0` adds `damage-attribution-smoke` to `.github/workflows/qa-duels.yml`: Node 22 syntax validation plus a bounded one-seed mirrored 80/120-fighter `check-zone-damage.cjs` execution and `zone-damage-smoke.json` receipt upload. This establishes a checkable per-commit result without forcing the more costly three-seed diagnostic into the existing Node job. Dedicated three-seed workflow remains intact.
- **Verification pending:** a passing smoke job and inspected receipt are required before accepting even the one-seed output. This does not itself settle damage balance, source accuracy, or the locality candidate. Never infer accepted fighter balances from historical experimental tables. The protected core, canonical root entrypoint and deployed app remain unchanged.


### October 14 — first completed attributed-damage smoke and accounting audit

- [Run 38614183125](https://github.com/danickman/ShowdownLab/actions/runs/38614183125) completed **SUCCESS** for `damage-attribution-smoke`, the seven release/browser jobs; exploratory formations skipped. Focused smoke job 116024898498 completed four paired mirrored scenarios (80/120 fighters, seed 1337), terminal 4/4 baseline and 4/4 experimental locality; winner divergence 0/4; saved `zone-damage-smoke.json` artifact ID 11917594510.
- Observed effective damage per 1,000 *observed living-fighter RAF frames* baseline→locality: Sniper 2756.14→3909.45; Dragon 8475.99→8761.66; Beetank 2602.65→1767.52; Turtle 381.68→357.67; Assassin 933.29→0 (five baseline credited hits, zero candidate hits). These are one-seed sample outputs, not approved role balance or validated full accounting.
- Commit `c81bd1a` adds an exact-once damage injection guard, captures source-less damage under explicit `unattributed` rather than silently dropping it, retains total credited/unattributed damage in receipt and asserts that there are no unattributed hits before treating role comparisons as valid. **This additional audit has not passed CI yet**; investigate any failure rather than assuming source-less damage is impossible. Protected runtime remains unchanged.
- Next: inspect accounting audit CI and dedicated three-seed receipts, verify secondary and Ultimate attribution, then revisit Assassin backline access and Sniper incentives. No runtime locality promotion, main merge or production deployment.


### October 14 — Turtle / Beetank defensive investigation and attribution audit

- User explicitly requested adding **Turtle and Beetank** to tactical role investigation alongside Assassin and Sniper. Inspected protected `legacy-sim-core.js`: Turtle's `turtleStep` uses shell activation, shell-roll/slam, snap and defensive brace; `hurt` applies `.42` shell damage multiplier. Beetank's `beetankStep` uses ram/charge, bulldoze, horn and brace; ram contact applies hit multiplier and stun. These are source inspection findings, not demonstrated gameplay outcomes.
- [CI 38614534026](https://github.com/danickman/ShowdownLab/actions/runs/38614534026) had passing release, Node, browser/PWA jobs but **failed** `damage-attribution-smoke`: previously added zero-unattributed-damage assertion detected actual damage from calls without attacker reference. Historical per-fighter totals therefore omitted some effective damage, and cannot be treated as complete attribution. Unattributed event category must be disclosed rather than silently dropped.
- Commit `3e30ecc` keeps source-less events in a separate `unattributed` bucket and reports them by scenario; extends QA-only role profiling with damage/hit *received* by fighter class and observed shell, guard, brace, ram and shell-action frames. The previous hard fail on any source-less event is replaced with explicit logging; this makes the limitations visible without falsely assigning an attacker. **CI still pending for this revision.** Neither true protection prevented nor ram-specific damage is proven by these simple observational counters; those require dedicated instrumentation.
- Next: examine revised CI and JSON outputs; validate source-less damage origin and attribution conservation, guard/armor/Ultimate secondary classification, and matched Turtle/Beetank differences across seeds. Preserve existing runtime and root-only entrypoint. No merge/deploy.


### October 14 — classify source-less damage origins; Turtle/Beetank follow-up

- [Run 38614805274](https://github.com/danickman/ShowdownLab/actions/runs/38614805274) completed the revised smoke job successfully (116027044366) and all finished mandatory Node/root/PWA jobs passed when inspected. In the four paired one-seed scenarios, Turtle baseline→locality received 17773.82→19175.03 HP damage, shell-active observed frames 399→386, and hits received 647→580. Beetank received 22291.56→22464.30 damage; ram-action observed frames 531→874; hits received 755→669. These do not yet measure protection prevented or ram impact counts.
- Identified known intentional NULL-attacker paths in protected combat source: Turtle Ultimate reflection uses `source:null`, burn damage from `ultimate.burn(u)` uses `hurt(u,burn,null,true)`, and spells ARC/QUAKE use `hurt(t,amount,null)`. It is incorrect to treat all source-less damage as a failed attribution hook or credit it to Beetank/Sniper. Source inspection is conclusive about these call forms, but accounting breakdown not yet CI-verified.
- Commit `034e3b4` adds QA-only instrumentation origin labels (fighter, reflection, burn, spell, unknown) to ephemeral source variants without modifying production core, plus aggregate origin breakdowns. All effective damage remains accounted for, with source-less damage separately exposed. **This change is awaiting its own CI**; do not claim the new origin totals or full attribution correctness before reviewing the output. Next: validate origin breakdown and audit Turtle reflection versus defensive exposure, Beetank ram hit efficacy, Assassin zero-hit and Sniper opportunities across more matched seeds. No runtime promotion, merge or deploy.


### October 14 — damage origin reconciliation and Turtle reflection credit

- [CI run 38615089082](https://github.com/danickman/ShowdownLab/actions/runs/38615089082) `damage-attribution-smoke` **passed**. Baseline one-seed four mirrored 80/120-fighter comparisons: directly credited fighter damage 105967.86, burn 17232.24, Turtle reflection 104.28. Locality candidate: directly credited fighter damage 110859.88, burn 13562.13, reflection 0. These figures include differing whole-match durations and are not corrected for deployment and exposure; no balance verdict or runtime promotion. All browser/root release jobs passed; Node was still running at last inspection.
- Source tracing found that null-source burn and reflection are intentional. Source-less totals are now classified by cause. Commit `0dfd1b4` adds a separate `reflectionCredit.turtle` counter in the **QA-only** probe, preventing Turtle's legitimate reflected damage from disappearing while keeping direct-attack damage separate. This relies on the current source contract where reflection is the only null-source secondary `afterHit` damage; audit that invariant if abilities change. **New instrumentation change awaits CI.**
- Next: check the new smoke run and receipt; use multi-seed matched comparisons; measure *successful* Beetank ram hits and Turtle protection prevented, as action frames alone are insufficient. Assassin zero-hit and Sniper advantages remain investigatory. Protected runtime and root-only application unchanged, no merge/deploy.


### October 14 — verified reflection credit; contact-versus-action research

- [CI 38615293871](https://github.com/danickman/ShowdownLab/actions/runs/38615293871) completed **all required jobs SUCCESS**, including attribution smoke and root-only/browser/offline gates. Verified reflection-credit output: Turtle baseline 104.276 effective reflected HP damage across four mirrored one-seed scenarios, locality08 0; full source totals were baseline fighter 105967.86 + burn 17232.24 + reflection 104.28, candidate fighter 110859.88 + burn 13562.13 + reflection 0. These are not match-balanced conclusions.
- Commit `e5e7871` adds two QA-only instrumentation counters to `tools/qa/check-zone-damage.cjs`: `beetankRamContacts` at Beetank's ram collision branch immediately before its 1.55× `hit`, and `shellPreDownstreamMitigation` at the existing 0.42 shell multiplier (difference at that point before subsequent armor, Ultimate and dodge reductions, therefore **not** exact final HP saved). Guards ensure both source anchors exist. This distinguishes ram contact events from action frames and estimates shell protection without modifying the protected runtime. Counters are present per simulation in JSON and summarized by variant in logs. **New counters await their own CI smoke validation**.
- Next: inspect new CI, expand mirrored seeds and ascertain whether shell prevented-damage and ram-contact trends survive roster/seed changes; consider exact post-mitigation counterfactual only if needed. Damage candidate not approved; no merge or deployment.


### October 14 — ram contacts, shell reduction validated; multi-seed gate expanded

- [Run 38615463732](https://github.com/danickman/ShowdownLab/actions/runs/38615463732): ALL seven standard jobs plus damage-attribution-smoke passed; experimental formations skipped as designed. One-seed mirrored 80/120 scenarios yielded Beetank ram contacts **103 baseline vs 104 locality**, despite substantially higher ram-action frames in earlier measurements (531→874). More ram-action time does not equate to more contacts. Turtle pre-downstream shell mitigation was **3441.416 baseline vs 3389.208 locality** damage units, and confirmed reflected damage **104.276 vs 0**. The shell metric is a pre-armor/Ultimate/dodge difference, not exact HP saved.
- Commit `03b1728` extends the already passing CI smoke experiment to three matched seeds `1337,7301,8675309` (12 mirrored baseline/candidate matches per variant covering 80 and 120 fighter cases) while preserving the existing 4-minute timeout and receipt. **The expanded run is not yet verified.** Inspect completed job outcome and per-seed evidence before any causal or role-balance decision.
- No change to the protected runtime, root-only application, or production branch. Damage-origin/role research remains QA-only; next: check multi-seed reproducibility and the Assassin/Beetank/Turtle/Sniper behavioral implications. No merge or deploy.


### October 14 — Beetank ram pose vs actual approach/contact

- User noticed Beetank may hold the ram pose while far away from an enemy. Confirmed directly from protected `beetankStep`: when `d > u.range/500`, `u.special<=0`, and `d<.34`, it sets `u.charge=26`; during charge it sets `u.action='ram'` and moves toward the target at 2× speed, while a real ram impact only occurs if `d < (u.range/500)*1.5`. Therefore a ram **action frame does not imply a hit**, and can include substantial approach movement.
- The one-seed mirrored evidence (103 baseline vs 104 experimental ram contacts, 531 vs 874 ram action frames) is consistent with more time charging but not more collisions. Commit `194750b` adds QA-only `ramApproachFrames` (ram pose while target remains beyond 1.5× nominal attack range) alongside total `ramFrames` and confirmed `beetankRamContacts`. This is sampled once per RAF and does not count charge activation events separately. This new metric **awaits CI**.
- The three-seed run 38615700147 had all non-damage required jobs passed when inspected, with damage-attribution-smoke still running. Do not infer full three-seed conclusion until it completes. No changes to visual sprites or combat logic yet; potential polish is to distinguish charging approach from hit impact without silently modifying gameplay.


### October 14 — three-seed evidence and spell-sigil rendering defect

- [Run 38615700147](https://github.com/danickman/ShowdownLab/actions/runs/38615700147) passed ALL required jobs, including the three-seed `damage-attribution-smoke`: twelve matched scenario cases per variant (80/120, mirrored, seeds 1337/7301/8675309), terminal 12/12 for both, with winner divergence 1/12. Beetank actual ram impacts 287 baseline / 285 locality; Turtle shell reduction measured *before downstream mitigations* 10807.93 baseline / 9796.91 locality; Turtle effective reflection 301.547 baseline / 8.869 locality. These aggregate results are not normalized per deployment/exposure. The large reflection change merits investigation; the nearly identical ram contact counts do not support more effective Beetank charging from locality alone.
- [Run 38615999759](https://github.com/danickman/ShowdownLab/actions/runs/38615999759) surfaced a separate `browser-turn3` error: `IndexSizeError: Failed to execute 'arc' on 'CanvasRenderingContext2D': The radius provided (-0.2125) is negative.` Identified a plausible vulnerable spell-sigil expression in `v3/v3.js`, `ctx.arc(0,0,rr-ring*7,...)`, where negative radius is possible for the inner rings. A candidate clamp was briefly committed but reverted in commit `82c9152` because the service-worker's SHA256 manifest pins the renderer bytes and must be updated atomically with any runtime change. Thus **no renderer fix is currently active**; this browser failure remains an explicit release blocker until root-cause confirmation, an atomic renderer/hash/cache update, and green browser/offline CI.
- Beetank QA now separately logs `ramApproachFrames` (visible ram pose while beyond impact threshold) alongside action frames and actual contacts; inspect the completed updated receipt before drawing animation conclusions. No production merge/deploy.


### October 14: canvas error investigation

CI run 38615999759 surfaced an intermittent negative-radius canvas error. The likely cause is the lightning particle radius expression `2.1*(1-age)` in `v3/v3.js`; an age greater than one makes the radius negative. A trial clamp was reverted in commit `40a7d21` because the release requires a synchronized integrity digest; repository writes to the offline manifest were blocked. The defect remains OPEN. Preserve existing pinned assets until renderer and manifest can be changed together and release/renderer/browser QA pass. The three-seed Beetank/Turtle profiler in run 38615700147 passed. Do not promote locality or deploy.


### October 14 — Beetank charge approach confirmed across three seeds

- Verified completed damage-smoke in [run 38615999759](https://github.com/danickman/ShowdownLab/actions/runs/38615999759): Beetank baseline 1813 sampled ram-pose frames, 1808 approach frames while outside ram-contact range, 287 confirmed contacts. Locality: 2629 pose frames, 2618 approach frames, 285 contacts. Therefore ~99.7% and ~99.6% of ram-pose frames respectively are approach, not contact. This directly supports the user's observation. Does not count distinct activations; 'ram pose' is intended during charge travel under existing core. Prefer presentation improvements distinguishing windup/charge trail/collision/recovery, not damage buffs or locality promotion.
- Commit `903feef` adds an explicit consistency assertion and reported approach fraction to the QA-only profiler; new results are pending CI validation. Do not modify protected core.
- Renderer crash remains open: suspect `2.1*(1-age)` radius in lightning FX; active renderer and pinned manifest are byte-consistent because trial fix reverted in `40a7d21`. Updating service worker integrity through the connector was blocked, so a runtime fix cannot be claimed. Maintain no merge/deployment until renderer and digest are updated together and browser/offline CI passes.


### October 14 — Beetank RAM comic now contact-gated

- User requested no RAM comic lettering when Beetank merely runs toward an enemy. Implemented in renderer `v3/v3.js` commit `5165447`: removed the floating RAM action label, suppressed RAM! comic from the transition into `ram`, and instead gates the RAM! comic burst, signature impact and camera punch on Beetank in `ram` state whose cooldown has reset upward relative to the prior sampled unit state (the existing `beetankStep` ram contact branch sets `u.cooldown=u.cd` on successful collision). Existing charge travel animation and combat mechanics remain intact.
- Synchronized the renderer SHA-256 pin in `sw.js` and advanced the PWA offline cache release to `showdown-lab-release5g4` using commit `992017a`; avoid reverting only one of these files. Release gate and browser CI for the combined change are **pending** at recording time (initial run 38617757846 queued). The separate negative-radius lightning particle issue remains open; this RAM-presentation patch does NOT fix it.
- Target QA: `release-hashes.cjs --verify`, PWA install/upgrade/offline, browser combat transitions, and Beetank comic not appearing during approach while still appearing on contact. No changes to protected core, no main merge/deployment.


### October 14 — lightning canvas particle radius repair, pinned release update

- Verified preceding Beetank RAM comic commit in [CI 38617757846](https://github.com/danickman/ShowdownLab/actions/runs/38617757846): every required CI job succeeded, including browser-turn3, PWA offline/upgrade, root release gate, Node regressions, and three-seed damage profiler.
- The suspected browser Canvas IndexSizeError source `ctx.arc(px,py,2.1*(1-age),...)` in `v3/v3.js` was changed to clamp the radius to nonnegative in commit `40fef69`. This leaves its game mechanics unchanged. Pinned service-worker SHA-256 and cache generation were updated to `showdown-lab-release5g5` using Git object operations; an intermediate incorrect digest was replaced with the correct 64-character SHA-256 in final integrity commit `ace25af` (renderer digest `7cf8b262819babfdddfebdde1ee4e0147f649869e2addfa2ab6680e1e6f46016`). **The corrected commit still requires passing release-hash verification, offline/PWA, and browser CI**. Earlier green results cannot be reused as proof for the new renderer.
- Root-only entrypoint preserved, protected combat runtime untouched. No merge or production deploy. Next: inspect CI result and verify negative-radius failures cease; separately assess RAM comic collision gating in browser with explicit QA.


### October 14 — consolidated remaining delivery plan

- Latest renderer release CI [38618299835](https://github.com/danickman/ShowdownLab/actions/runs/38618299835): all seven core release/browser/PWA jobs passed on inspection; multi-seed damage job outcome should be checked separately before calling the entire run green.
- Remaining estimated roadmap **18–27 focused turns** (not rigid): reliability 1–2; meaningful multi-front battlefield distribution and camera/crowd staging 5–7; fighter combat and Ultimate polish (Turtle, Beetank, Assassin, Sniper) 3–4; Draft strategy and AI/Ultimate Lab refinements 3–5; theatre/arena/sound/mobile-performance/progression 4–6; final regression and release 2–3. Estimate assumes incremental CI and documentation; new failures can add turns.
- Preserve the protected deterministic core unless explicitly and safely scoped, root-only HTML and SHA-pinned offline bundle, custom enemy selector, and the rule against merge/deploy without user approval. Prioritize *actual combat occupancy and engagements* rather than merely cosmetic camera spreading. Make each turn independently testable and update this handoff with commits and verified outcomes.


### October 14 — Assassin zero-damage clarification and locality candidate gate

- Latest [CI 38618299835](https://github.com/danickman/ShowdownLab/actions/runs/38618299835): ALL eight required jobs succeeded including three-seed damage profiling, browser, release integrity and offline upgrade. Assassin is **not literally zero damage** across the full three-seed exploratory locality sample but is heavily impaired: baseline 1326.66 damage/11 hits/9 kills versus locality 185.57 damage/3 hits/2 kills; 120 deployed per variant. Normalized per 1000 living RAF frames 640.90 versus 87.04 (approx. 13.6% retained). No game runtime fix was made; the previously zero-hit single-seed locality result was a small-sample subset. The locality candidate is NOT approved for adoption.
- Commit `ca5c4cd` adds explicit QA diagnostic `ASSASSIN LOCALITY RISK`: compare matched per-living-frame damage between baseline and candidate and flag retention below 75% as needing investigation (not a hard fail for an exploratory diagnostic). No changes to protected deterministic core. Before real multi-front rollout, demand role preservation along with genuine battlefield occupancy, deterministic outcomes and visual clarity.


### October 14 — Assassin contact-path diagnostic

- Root-cause hypothesis from `legacy-sim-core.js`: Assassin prefers backline targets, seeks them via `nearest(u,true)`, uses `stalk` while out of nominal reach, teleports at <0.42 range when vanish is available, backstabs only at `d<=u.range/500` with cooldown ready, otherwise disengages. The experimental locality penalty disproportionately punishes vertically separated target choices; wide formations can make Assassin stalk without reaching a backstab opportunity. This is a hypothesis, not yet verified cause.
- Commit `07df70e` adds QA-only per-simulation Assassin action frame counts and target proximity/backline/exposure diagnostics, aggregated baseline vs locality across mirrored three-seed scenarios. Preserve the runtime core; no experimental target modifications or damage buffs until evidence confirms which phase fails. CI is pending for this instrumentation.
- Continue with contact opportunity, target distance and role-damage analysis; block locality rollout until Assassin effectiveness is restored. Beetank RAM comic contact gating and canvas particle radius fix are separately implemented with SHA-pinned offline release; check new CI rather than assuming prior successes prove this instrumentation.


### October 14 — Assassin profiling denominator corrected, CI pending

- In [CI 38619102562](https://github.com/danickman/ShowdownLab/actions/runs/38619102562), the root-only release gate and all seven standard browser/Node/art/PWA jobs passed; the longer three-seed `damage-attribution-smoke` was still running when checked (its logs not yet available). Do **not** claim Assassin pursuit results have passed or use data until that job completes.
- Review of the QA-only instrumentation found `meanTargetDistanceSum` was divided by all living Assassin sample frames, even those without a valid living target. Commit `91d9dd1` adds `targetFrames`, computes mean target distance over valid-target frames, and reports `targetAcquisitionShare` separately. No combat runtime changes. This change requires its own smoke validation.
- Assassin's previously verified three-seed result remains baseline 1326.66 effective damage/11 hits vs experimental locality 185.57/3 hits. No locality promotion or damage buff; use incoming valid-target proximity and backstab action evidence to distinguish pursuit versus attack opportunity failures. No main merge or production deployment.


### October 14 — VERIFIED Assassin pursuit evidence from CI 38619102562

- Completed smoke job successfully. Baseline vs locality across 12 matched experimental scenarios: living Assassin frames 2070 vs 2132; target within nominal reach 28 vs 3 (1.35% vs 0.14%); stalking frames 1898 vs 1957; hits 11 vs 3; effective fighter-attributed damage 1326.66 vs 185.57. Nearly all observed targets are backline units. This strongly indicates insufficient pursuit/contact rather than raw attack power in the locality candidate. The live-target distance mean in this earlier run divided by living frames, not valid-target frames; commit `91d9dd1` corrects the denominator, pending new CI.
- Zero sampled backstab frames despite credited hits indicates that rendered-frame action sampling can miss fast combat events. Do not infer zero backstab events from that metric; prefer direct source/hurt instrumentation for successful hit accounting. No combat changes or promotion yet.


### October 14: isolated Assassin vanish reach candidate

CI 38619374891 passed all required jobs. Valid target acquisition was near 100 percent for both variants, while in-range samples fell from 28 to 3. Commit b1ff42b adds a VM-only experimental locality candidate which tests earlier Assassin vanish activation at distance 0.70 rather than 0.42. No runtime combat changes. This candidate requires its own CI, matched damage and contact measurements, and outcome review before consideration. No merge or deployment.


### October 14 — Assassin vanish70 candidate failed survivability trade-off

- [CI 38619889886](https://github.com/danickman/ShowdownLab/actions/runs/38619889886) passed all required jobs including 3-seed research. Experimental locality assassin vanish trigger at 0.70 vs existing 0.42 improved effective damage 185.57 to 229.57, hits 3 to 4, in-range samples 3 to 17, but total observed Assassin living frames declined from 2132 to 875 (59% less), while original baseline delivered 1326.66 damage. This is NOT acceptable evidence to promote vanish70; likely exposes Assassins earlier. No runtime changes.
- Commits `3f22f3a` and `d68f331` add a more conservative **VM-only** vanish50 candidate and print both candidate outcomes, exposure and normalized damage; CI pending. Never confuse source-instrumented candidates with production fixes. Next compare reach, credited damage, lifespan and winners; prioritize contact **and** survivability. No merge/deployment.


### October 14 — Assassin vanish candidate decision

CI 38620768110 emitted complete three-seed metrics although the damage research job was cancelled. Experimental locality Assassin at vanish threshold 0.42 recorded damage 185.57, 3 hits, 2132 alive frames. Threshold 0.50 recorded damage 167.2, 3 hits, 1549 alive frames. Threshold 0.70 recorded damage 229.57, 4 hits, 875 alive frames. Neither restored original baseline (damage 1326.66, 11 hits). Reject both thresholds for promotion. Seven standard CI jobs passed. Continue exploring role-preserving target access/formation, not damage buffs. No merge or deployment.


### October 14 — Assassin survivability versus reach hypothesis

User proposed stage-wide Assassin stat buffs and vanish activation at 0.70. Existing tests do not support promoting either outright: vanish70 alone increased contacts but sharply reduced survival, while vanish50 failed to increase total damage. Base Assassin stats inspected: HP96, damage27, speed1.5, dodge0.18, armor0.06, range24, cooldown32. A modest HP-only candidate (96 to 112, about +16.7%) paired with vanish70 was added to the **QA VM-only** locality comparison in commit ae75bd8. Damage, speed, dodge, cooldown and live runtime remain unchanged. The candidate is exploratory, not approved; new CI and outcome/survival review required. Avoid stacking broad multi-stage buffs until role-preserving movement and post-teleport survival are demonstrated.
