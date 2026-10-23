# Turn 6 — Dragon L4 numerical fairness against actual armies

Exact pretest QA `0b8a87822058e710b9d4a4c3c3635518be334b1a`, PR #14. **Source-only first**, no runtime/PWA changes. Existing all-ten ROI cohort reported L4 Dragon 8/8 first unlock but also **8/8 vs literal doubled enemy whole army** and **4/4 wins for THREE evolved Dragons against 15 opposing units** (20/40 mixed prototype, calibration 11717/23771, heldout 71569/87071). These results are alarming but highly role/formation/seed-specific. L5 Dragon only 4/8 vs double opposing entire army, so L4/L5 relationship merits careful verification.

Live Dragon breath cone iterates over **every** physically in-cone enemy with no victim limit, and ignites L4 victims for residual 45% attack-damage over 3 seconds; base Dragon at L1 has 290 HP and 43 attack and its evolved level multiplier is 1.4 per level. A strong early L4 should still feel spectacular. Limiting every level or globally reducing damage would violate the design intent.

Study `tools/qa/check-dragon-l4-numerical-fairness.cjs` compares the untouched actual core against precisely two **L4-only** source hypotheses: at most **four** or **six** physically in-cone burnable primary target recipients, selected with deterministic primary target preference and nearest physical projection; no artificial damage or new offensive behavior. Both leave L5 uncapped and protect the power apex. Two calibration seeds 35617/46219 plus two unseen seeds 82531/93047, red/blue mirrored 20/40 and seven true draft choices (hold, first upgrade, peer upgrade, doubled opposing Dragon family, entire foe army x2, +2 Dragon recruits, another family upgrade), plus literal three L4 Dragons against fifteen mixed L3 foes.

**Tests required:** 336 genuinely terminal matched source comparisons +12 genuine 3v15; 6 full observer/raw RAF SHA pairs; 16 exact completely unchanged Dragon L5, 16 exact unchanged below-L4 Dragon, and 32 unaffected Assassin/Turtle full RAF comparisons; 3 exact raw repeats. Report first-to-L4 hero wins and true 2×/3v15 counters, physical positive HP, genuine independent HP damage fronts/windows and objective opportunity cost. A reasonable capped L4 must **not** collapse first-unlock ROI or turn L4 into weak incremental damage. Entire army x2 and 3v15 should have meaningful counterplay. If both candidates fail, retain original, document contextual role/counter limitations and move to Turn 7; never edit historical real test results or redefine severe as family double. No auto Vercel preview or production/main merge. Actual iPhone Safari performance pending.

**Status: source-only experiment pending GitHub Actions on new exact-head QA.** Assassin: prior first-L5 8/8, matched peer 4/8, opposing whole army x2 0/8; unique backline assassination not comparable to Beetank's heavy-target siege. Turtle: prior first-L5 6/8, peer 4/8, whole army x2 0/8, healing-free ally guardian + actual close ricochet; role is protection/attrition distinct from beetank L5 assault and Assassin L5 execution. Exact outcome of *all* off-target role simulations under L4 Dragon cone limits needs confirmation. Do not flatten these three into identical damage roles.


### Strict parity harness correction — why firstUnlock L5 was an invalid unaffected control
The first exact-head CI [39164593607](https://github.com/danickman/ShowdownLab/actions/runs/39164593607) completed actual sample simulation work but **FAILED** at the strict whole-RAF claim that first-L5 was unchanged. In first-L5, the opponent's nominal Dragon family remains **L4**, so the candidate changes their breath, rightly changing the overall match; that does NOT imply L5 Dragon source code changed. The corrected full-RAF off-target control uses `matchedUnlock` (both teams Dragon L5, zero L4 Dragons), so the candidate branch must be physically exactly identical throughout battle. Mixed L5-vs-L4 games remain included in actual cross-tier outcome and are not silently called invariant. No dropped assertions, no forged acceptance, no live gameplay edit. Repeat complete independent CI evidence required.


## FINAL — Turn 6 Dragon L4 fairness / source-only decision, 18 October 2026

Exact QA source d132ee33384767b3021ba1b86b03b7ffb189fcc9; GitHub Actions [PR run 39164933942](https://github.com/danickman/ShowdownLab/actions/runs/39164933942), dedicated job 117785785708 SUCCESS, 13 required jobs green, 56 archived/skipped. This source-only study finished 336 actual fully terminal matched 20/40-body games + 12 real 3-v-15 terminal games; 6 raw/observed full RAF pairs, 16 fully unchanged Dragon L5-vs-L5, 16 unchanged below L4, 32 unaffected Assassin/Turtle full-RAF pairs, 3 raw repeatability pairs. Calibrating seeds 35617/46219; genuinely unseen 82531/93047, two team mirrors.

| Fresh heldout outcome | Current unlimited | L4 limit 4 | L4 limit 6 |
|---|---:|---:|---:|
| First-to-L4 Dragon wins | 8/8 | 8/8 | 8/8 |
| Equal opposing L4 wins | 4/8 | 4/8 | 4/8 |
| Only opponent Dragon family doubled | 8/8 | 8/8 | 8/8 |
| Literally whole enemy army doubled | 8/8 | 8/8 | 8/8 |
| Add two Dragons | 8/8 | 8/8 | 8/8 |
| Evolve allied Beetank | 7/8 | 7/8 | 7/8 |
| Severe 3 L4 Dragons versus 15 L3 mixed foes | 4/4 | 4/4 | 4/4 |
| Actual selected Dragon direct HP | 28,388.99 | 28,388.99 | 28,388.99 |
| Genuine selected Dragon fire hits | 424 | 424 | 424 |
| Persistent physically separate positive-HP-damaging fronts | 12 | 12 | 12 |
| Separate HP-damaging time windows | 73 | 73 | 73 |

**Verdict: REJECT both limits.** Neither candidate bound any real attack in these fixtures, so the proposals literally did not affect physical match results. Dragon L4 overdominance against doubled entire armies and 3-v-15 is reproduced in this new cohort, but cannot be explained by any breath cast hitting more than 4 or 6 targets in these layouts. Do not claim this balance concern is repaired. Do not silently nerf all Dragons or flatten spectacular first-L4 evolution just for a numerical target.

**Mechanistic next step (future evidence-based work, not another Turn 6 loop):** Base Dragon has 290 HP and 43 damage before the 1.4-per-level multiplier; L4 applies 45% ignition damage over 3 seconds. The current physical attacker-credited source observer sees true post-cap direct hits, but burn is later applied with no attacker source and is *not* included in direct selected-fire HP totals. A useful future diagnostic would measure actual burn HP, defensive survival and realistic counter-roster compositions rather than merely another cone width or hit-count knob.

**Test-design correction:** First failed study run 39164593607 asserted L5 physical-state invariance despite facing L4 Dragon opponents whose abilities were intentionally modified. Corrected study compares L5-versus-L5 (no L4 Dragon on either side) with exact whole-RAF parity and leaves real mixed-tier outcomes measured. This fixed-head test passed; no assertions were disabled.

**Role decision:** Assassin L5 Execution already wins 15/24 contested borderline games versus holding L4 9/24 and improves persistent physical fronts; preserve stealth/Execution. Turtle's Guardian and genuine close-range Ricochet provide protection/attrition distinct from Beetank Siege Breaker anti-heavy charge. Do not equalize roles by direct DPS alone. Earlier Goblin and Barbarian speculative variants remain correctly rejected.

**Release scope:** Turn 6 of 13 COMPLETE as a safety/fairness investigation, with Dragon extreme numerical dominance recorded OPEN for release QA; no playable Dragon/Assassin/Turtle or PWA changes. Seven turns (#7–13) remain. Turn 7 targeting, collision and 80/120/300 actual performance + x2 gating next. No Vercel preview/production deployments, main unchanged; physical iPhone 14 Pro Max Safari check remains open.
