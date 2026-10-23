# 20-fighter target-retention experiment — independent seed verdict

**Date:** October 15/16, 2026. **Result: REJECT / hold for redesign; no live gameplay change.**
**Baseline:** QA source `ea9bc86e290abf05beba8136190a8edb93ef2e55`, [full green Actions](https://github.com/danickman/ShowdownLab/actions/runs/38840259653). Assassin L5 75%-HP Execution and Turtle 0.10-radius Ricochet are **already implemented** on this branch. Main/prod unchanged. Primary device **iPhone 14 Pro Max**, real Safari still open.

## Gameplay hypothesis

In small 20-fighter battles, continuously switching targets might dissolve otherwise independent real fights. Consider awarding a tiny current-target preference in `nearest()` only for deployed **16–20 fighter** battles, restricted to melee, and retaining the existing expensive 40/80/120/300 population behavior exactly. The original `nearest()` has pressure and lane biases and a low-cost squared-distance prefilter. A change of target penalty must also widen that prefilter's admissible bound, or the selection can miss legal lower-score retained targets.

**Measurement:** true positive HP damage edges connected into distinct attacker–target components in the existing 30-tick `damageFronts` graph; count two geographically separated **and independently persistent** fronts. All A/B matches actually reach terminal, not capped snapshots. Compare matched seed, role mix, side mirror, winner, hits and normalized role damage. Ranged threat, fighter proximity, overlapping VFX, target pointers and pre-attack actions **do not count** as actual fighting.

## Calibration and holdout, not blended

Initial unbounded 20-body-only current-target discount **0.020** increased persistence **5→14** in 40 full battles across 5 rosters × 4 seeds × mirrors. However, the unchanged original distance prefilter was not admissible when target score was discounted. After **correcting the bound**, persistence became **5→10**, separated damage windows **69→73**, with **5/40 changed winners**. On an **independent six-seed holdout × five compositions × mirrored sides (60 terminal battles)**, the corrected candidate achieved persistence **9→17**, separated windows **116→140**, but **9/60 different winners**, and Turtle's attributed HP damage fell **7,290→6,016** with Goblin **4,315→3,902**. Stronger fronts are promising but degrading underused roles undercuts the user's value goal.

Tried retaining only specific frontline roles (Knight, Beetank, Barbarian), preserving direct Turtle/Goblin retarget behavior:

| Variant, corrected score bound | Calibration 40 persisted | Holdout 60 persisted | Holdout separated | Holdout changed winners | Verdict |
|---|---:|---:|---:|---:|---|
| Current QA baseline | 5 | 9 | 116 | 0 | Baseline |
| All melee ex Assassin/Mole, +0.020 | 10 | 17 | 140 | 9/60 | Reject for balance and role damage |
| Knight/Beetank/Barbarian +0.020 | 9 | 12 | 134 | 12/60 | Reject: changes one in five results; modest persistence |
| Knight/Beetank/Barbarian +0.030 | 9 | 13 | 125 | 11/60 | Reject: outcome variance and mixed role losses |

With frontliners +0.030 in the 60-match holdout, Turtle source-attacked HP contribution fell **7,290→6,981**, Goblin **4,315→4,255**, Sniper **36,520→33,459** and Barbarian **10,549→10,000**. Knight/Beetank/Assassin/Mole improved in that sample. The change **did not reverse the known 20-fighter winner status of the swarm/heavy/ranged counter groups** in the holdout, but disproportionately affected mixed and glass-cannon rosters and no clear per-evolution payoff was established. Winner divergence is not inherently a bug, but **this level of uncontrolled counter ecology shift does not justify a very small absolute improvement to sustained fronts**.

Additional candidate restrictions to a close opponent (distance 0.16–0.30), or to only bruisers/goblins, proved inconsistent and generally smaller gains. The approach also changes live per-target scoring on each scan, so it isn't a free visual quality improvement. No target-steering, collision radius, XP/upgrade power, camera or formation changes have been committed in this study.

## What the permanent acceptance framework needs

Existing `tools/qa/check-completed-match-quality.cjs` now **reports each role's actual deployed count and attributed HP damage per deployed fighter**, alongside the original 32 full-terminal multi-front, phase and outcome metrics. This is a missing denominator in old “Turtle 2,440 vs Beetank 8,532” comparisons: those aggregate damages can be misleading when deployed mix/level differs. It still does **not** value Turtle reflected HP (source-less) or prevented damage, and is **not a per-level or per-surviving-minute DPS**; follow-on should measure genuine melee reflection, shields and stun unit-ticks separately.

Next live change should target **independent threat-and-contact ownership grounded in real damaging pairs, especially in middle/late 20-body phases**, rather than unconditional target stickiness or more wide spacing. Compare solo counters, 20/40 fully completed battles, small roster picks and actual iPhone 14 Pro Max theatre/readability. Require improvement that does not destroy low-DPS role ROI or multiply 300-body simulation cost. Main and production remain locked.
