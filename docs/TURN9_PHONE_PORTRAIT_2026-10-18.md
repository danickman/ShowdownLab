# Turn 9 — Portrait Guide and between-round safe areas

18 October 2026, QA prechange `648813ee0935e24820f050d469626ed481d5307e`. Primary iPhone 14 Pro Max 430×932 DPR3 (physical 1290×2796). No changes to fighter art, balance or combat physics. Existing Guide squeezed three evolution art canvases into equal 155–185px columns. Now L4 gets a featured full-width 228–278px portrait above compact two-column L1/L2 comparison, with smaller 375/390px layouts and no horizontal crop. Existing authored forms, fighter info, scroll container and font hierarchy unchanged.

The round-loop modal previously used static 22px/10px edge padding regardless of Dynamic Island and home indicator. Vertical padding now includes CSS safe-area custom properties with 16px/10px baseline; vertical scrolling handles tall three-offer drafts without losing the CTA. Quick/Draft/Lab semantics, 1× default, touch 48px targets and dual one-pick-per-round guard untouched.

New in existing Chromium density job: `tools/qa/check-turn9-portrait.cjs` checks actual live DOM at 430×932 DPR3 touch, 390×844 and 375×667, ten cards, L4 gallery relative sizing and order, horizontal bounds, safe modal padding with simulated 59px top/34px bottom and button bounds. Stores proof screenshots. **Chromium emulation is not real iPhone Safari.** New PWA release `turn9-portrait1` with 42 pinned SHA-256 assets and fresh HTML CSS/runtime versions. **New-head CI acceptance pending.** No Vercel QA previews or production deployment.


### Exact-head CI compatibility correction
The first PR run 39183423512 exposed a stale historical test assertion that demanded `round-loop.js?v=doubleko1` even though the file was correctly cache-busted for this new UI release. Keep all Turtle double-KO and round consistency checks, but validate the *current* versioned round UI URL against the SW module list and 64-character pinned SHA instead of freezing obsolete build numbering. The Turn 9 browser test server now sends correct HTML/CSS/JavaScript Content-Type headers so Chromium actually loads runtime assets. No gameplay behavior or PWA content needs further adjustment; full exact-new-head CI required before acceptance.


## Final Turn 9 acceptance — 18 October 2026 Toronto (21:05 EDT; 19 October UTC)

**Exact QA:** `b5e5b2bb9f55df42154d1f7a712f028ed9b14cf0`; [PR CI #39183539283](https://github.com/danickman/ShowdownLab/actions/runs/39183539283) **completed SUCCESS**. **All 12 required jobs passed**, 58 deliberately archived/skipped, zero failures. Full engine/300-fighter source state, genuine separate physical HP fronts, offline service-worker interrupted upgrade/rollback, source SHA-256, 430×932 DPR3 Chromium, and root release gate remain green. QA push workflow skipped deliberately; **no QA preview deployment intentionally requested**, and deployment-account audit was not independently available. Production/main at `0cb1a7db330017193d69d3ab63525ed9cdaca12e`, unchanged.

The Turn 9 viewport source test `tools/qa/check-turn9-portrait.cjs` is included in existing successful `browser-density-portrait` job **117841248423**. Actual Chromium measured:
| Emulated touch viewport | L4 featured artwork width | L1 comparison width | inset top padding | inset bottom padding |
|---|---:|---:|---:|---:|
| 430 × 932 DPR3 | **340px** | 184px | 75px | 50px |
| 390 × 844 DPR3 | **334px** | 169px | 69px | 44px |
| 375 × 667 DPR3 | **319px** | 161.5px | 69px | 44px |

All three pass: authored L4 *visually precedes* the two smaller L1/L2 images; 10 Fighter Guide cards, no crop outside container, no document horizontal overflow, guide vertically scrollable, three reward cards plus 48px-or-larger CTA reachable after scrolling, safe padding for emulated notch 59px and bottom indicator 34px. Real original artwork retained; no battle engine or fighter balance edits.

The first Turn 9 CI attempt failed only because a historical test hardcoded old `round-loop.js?v=doubleko1` and the browser test server lacked valid CSS/JS MIME headers; both were corrected without weakening integrity or gameplay checks. Exact resulting head `b5e5b2b` fully passed.

**ACCEPT Turn 9.** The Guide L4 spotlight and between-round safe areas remain in playable QA and the offline PWA is atomically pinned with all 42 SHA-256 assets. Native iPhone 14 Pro Max *Safari* is still **OPEN** as a release-only manual device gate; Chromium DPR3 does NOT establish on-device FPS, Dynamic Island behavior, or touch responsiveness.

**Turn 10 NEXT:** highly visible Mole L5 ground rift/crack and local dirt/debris battle spectacle, sunny larger sky and wider-use battleground, bounded visual/performance risk. No evolution rebalancing, avoid new speculative multi-arm experiments, preserve physical determinism. Four turns remain in fixed 13-turn plan (#10–13). Controlled merge and one production deployment only in Turn 13 after complete release acceptance.
