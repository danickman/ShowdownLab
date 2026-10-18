# Beetank L5 Siege Breaker — accepted QA integration, 18 October 2026

**Exact preintegration SHA** `bb23df32d1f7bec71f5c27e883faa70494063f75`; [test run #39147163107](https://github.com/danickman/ShowdownLab/actions/runs/39147163107), dedicated job 117733234078 **SUCCESS**. Tested **336 actual full-terminal matched candidate matches**, 12 severe 3-v-15 terminal matches, 6 raw/observer full RAF SHA pairs, 16 unchanged-L4 exact RAF pairs and 16 unrelated-role exact RAF pairs. Calibration seeds 26017/32417 and genuinely unseen 73813/86417; 20/40 bodies, both blue/red mirrors. Note correlated fixtures; numbers are not population-level win probabilities.

| Fresh heldout first-L5 | Existing | Partial contact | Full visual-contact |
|---|---:|---:|---:|
| Winning battles | 6/8 | 6/8 | **7/8** |
| Actual Beetank horn hits | 16 | 31 | **39** |
| Actual horn HP damage | 379.56 | 889.04 | **1218.07** |
| Actual selected Beetank HP damage | 11352.68 | 15290.66 | **19187.80** |
| Real independent persistent damaging fronts | 15 | 15 | **13** |
| Separated positive-HP damage windows | 109 | 130 | **115** |
| Mirrored peer L5 wins | 4/8 | 4/8 | **4/8** |
| Doubled ENTIRE enemy army wins | 0/8 | 0/8 | **0/8** |
| Severe 3 evolved vs 15 wins | 0/4 | 0/4 | **0/4** |

Calibration first L5 baseline 4/8, partial 8/8, full 7/8; hold, recruit and alternate family choice remain unchanged physical RAF, so improvement is attributable to the Beetank L5 contact path in this controlled test. Family-only doubling heldout 7/8 baseline vs **8/8 full** (not the same as doubling the entire enemy army). Full wins 2/8 more than recruiting two Beetanks or evolving a supporting Knight (both 5/8). Genuine front-window preservation is acceptable despite 15→13 persistent-front reduction, and real damaging windows improve 109→115. Original Seismic splash-only and Breach/Overdrive candidates remain REJECTED; not recycled.

**Accepted live gameplay patch:** at L5 only, Beetank's actual melee eligibility uses a collision-aware contact radius: `Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002)`. L1-L4 Beetank and all unrelated fighters retain original contact rule. The same bound also influences the L5 charged-ram contact threshold; there is NO global range/HP/armor multiplier, no recursive splash, no movement teleport, no target rule rewrite. Existing every-second-horn bounded 55% splash continues to apply; its increased actual triggering, rather than invented area damage, creates the power spike. L5 Seismic cue named **Siege Breaker**, with a local ground plate fracture, radiating cracked lines and restrained rock shards; L4 still retains normal `seismic` cue. Guide dynamically reads updated `ShowdownUltimates.specs.beetank.l5`.

PWA integration in same atomic QA commit: root HTML URL versions, SW 42 pinned SHA256 releases and version `showdown-lab-release-beetsiege1`; no duplicate v3/index, no manual/preview/prod deployment. Stronger L5 is deliberately spectacular but whole-army x2 and severe 3-v-15 counters remain available. Source Node timing is not physical iPhone FPS. **Exact new-head CI and physical iPhone 14 Pro Max visuals still pending**, don't call production approved until release gate #13.


## Source-real 20/40 multi-front correction: heavy-target siege
Full L5 contact had improved first-L5 wins to 7/8 but **failed the unchanged authentic 20-fighter persistent-front quality gate** (zero fronts, required one). Genuine complete-match source-only diagnostic [run 39148151701](https://github.com/danickman/ShowdownLab/actions/runs/39148151701), job 117736138438 PASS:

| L5 contact policy | 20 persistent real fronts | 20 separate HP windows | 40 persistent real fronts | 40 separate HP windows |
|---|---:|---:|---:|---:|
| Original | 1 | 25 | 58 | 192 |
| Partial | 1 | 25 | 58 | 199 |
| Full | **0** | 22 | 61 | 204 |
| **Heavy targets only** | **1** | 25 | 56 | 194 |

**Live correction:** L5 collision-aware contact now only triggers against Beetank, Turtle and Dragon, so Siege Breaker is distinctly anti-heavy; all other opponents retain standard nominal horn reach. This restores the 20-body authentic front while leaving existing QA quality floors UNCHANGED, and retains the bounded L5 blast/cinematic earth fracture. Automatic 42 SHA256 PWA pins and cache advanced to `beetsiege2`. Source-real four-arm terminal ROI comparison current/partial/full/heavy-only is PENDING new exact-head CI; previous full candidate 7/8 is **not** claimed for heavy-only. No production/preview build.


## FINAL — Beetank L5 Siege Breaker QA accepted (18 Oct)

Exact QA `cca94d527a948e73846dd4a76adec251f85dce59` [PR run 39148932682](https://github.com/danickman/ShowdownLab/actions/runs/39148932682) **SUCCESS: 13 required jobs, 52 intentionally skipped**. Dedicated source A/B job 117738553758 **SUCCESS**: **448 genuine complete matched battles** (16 fixtures × 7 choices × 4 arms), 16 genuine severe 3-v-15 terminal battles, 8 whole-RAF raw/observer SHA pairs, 24 unchanged L4 and 24 unaffected-role whole-RAF comparisons. Both sides mirrored at 20/40 with fresh heldout seeds 73813/86417; calibration 26017/32417.

| Fresh heldout first L5 | Baseline | Partial | Full (rejected safety) | **Heavy-only accepted** |
|---|---:|---:|---:|---:|
| First-to-L5 wins | 6/8 | 6/8 | 7/8 | **7/8** |
| Real Beetank HP damage | 11,352.68 | 15,290.66 | 19,187.80 | **21,311.01** |
| Actual horn hits | 16 | 31 | 39 | **50** |
| Horn real HP | 379.56 | 889.04 | 1,218.07 | **1,571.34** |
| Genuine damaging fronts | 15 | 15 | 13 | **14** |
| Separate HP-damage windows | 109 | 130 | 115 | **115** |
| Peer L5 wins | 4/8 | 4/8 | 4/8 | **4/8** |
| Entire opposing army x2 | 0/8 | 0/8 | 0/8 | **0/8** |
| 3v15 severe | 0/4 | 0/4 | 0/4 | **0/4** |

Heavy-only first-L5 ROI also beats **+2 recruits 5/8** and **evolving allied Knight 5/8**. Doubling only enemy Beetank family yields 8/8 heavy-only wins, distinct from full army x2. Production `completed-match-quality-budget` authentic 20-body front floor remains **1/1**, 40-body reaches **56** versus min40. Unrestricted full-reach variant had unacceptable zero 20-body persistent fronts, so it was **rejected**, not shipped. The actual playable L5 is conditional physical heavy-target collision reach versus Beetank/Turtle/Dragon, with local Siege fractures/rocks, normal L4 untouched and atomic **42 PWA SHA-256 pins** cache `beetsiege2`. No recursive hits, peer and numerical counters still active.

**Decision:** Turn 3 complete. The three-turn budget has two designated roles remaining: Goblin Warband (Turn 4) and Barbarian Bloodstorm (Turn 5). No more Beetank experiments without a new verified P0/P1. Full real-device iPhone 14 Pro Max Safari performance/visual acceptance remains OPEN for release gate; no main merge, preview or production deploy. Completed expensive ROI CI now manual-only.
