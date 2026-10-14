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
