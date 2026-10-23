# Local melee damage versus strategic crossfire — 20/40 completed matches

**2026-10-16 · QA-only observational improvement, no combat rule change.** Baseline `2c62c2d071ff348b3f15fd105806f3167f517730` [green full actions](https://github.com/danickman/ShowdownLab/actions/runs/38844197547). iPhone 14 Pro Max primary (430 × 932 DPR3), actual Safari QA pending. Main and production untouched.

## Problem

The user asked for authentic simultaneous fights across the arena, and meaningful opportunities for Assassin, Turtle, Goblin and other fighters. Current full-combat damage-edge graph reports only very rare independent persistent fronts at 20 fighters. We asked whether an apparent single brawl is a **measurement artifact**: if the same Dragon or Sniper damages opposing fighters in two genuine nearby melee skirmishes, the all-role attacker-target connectivity graph would correctly join them into one component despite visible separation.

## True-event dual measurement

An isolated source A/B audit instrumented positive `hurt()` HP damage, including **attacker role, victim role, actual source/victim distance at damage time and whether it was primary or secondary**, without changing the simulator. The second metric only uses a `primary` positive hit from a **non-Dragon, non-Sniper** role that reaches within **0.13 normalized arena units** of the actual victim. This is a strict contact-damage diagnostic (not an assertion that every close-range move or attack animation hit). Source-less burn, Turtle reflection, spells and splash are not misattributed. The full mixed-role damage graph is still the required benchmark.

A synthetic six-event fixture establishes that a Dragon firing across two disconnected groups **can** collapse the global damage components while leaving two independent actual melee contacts in the contact-only graph. In the real 20 completed-match exploratory probe (5 compositions × 2 seeds × both mirrors): **30** all-role geographically distinct damage windows, **10** contact-only separated windows, **1** persistent all-role and **1** contact-only persistent window, and **zero** contact-only multi-front windows masked by ranged bridging. Therefore the poor 20-body multi-front signal was **not an artifact of Dragon/Sniper crossfire** in this tested group. Close-range fights were *less* often independently sustained.

## A/B candidate decisions (not shipped)

| Candidate | 20-body cases | Existing real persistent fronts | Candidate real persistent fronts | Other evidence |
|---|---:|---:|---:|---|
| Phase-gated first-contact ownership penalty for bruisers, +0.02 | 30 completed | 3 | 3 | Two changed winners; HP damage shifts among roles |
| Same, +0.035 | 30 completed | 3 | 2 | Three changed winners |
| Same, +0.05 | 30 completed | 3 | 3 | Two changed winners |
| Wider melee ring arcs | 30 completed | 3 | 3–4 | Up to four changed winners, damage loss in some roles |
| Narrower melee ring arcs (only 20 bodies) | 40 completed | 3 | 10 | Two changed winners; Goblin direct HP **3,025→2,636** and Knight **8,144→7,046**; more physical crowding risk |
| Narrower slots only for Turtle | 40 completed | 3 | 3 | Turtle direct HP 3,069→3,884, but no genuine persistence improvement; one changed winner |
| Narrower slots only for bruisers | 40 completed | 3 | 5 | Goblin direct HP 3,025→2,523 and Knight 8,144→7,375 |

These are **exploratory samples**; the 30- and 40-case denominators and rosters are not interchangeable with the permanent 32 complete QA matches. Do **not** call more spatial contact, damage or a narrower silhouette arrangement a victory unless longer independent fights improve without undercutting the role evolution value and established counterplay.

## Permanent QA upgrade

The existing `tools/qa/check-completed-match-quality.cjs` now includes distance/secondary fields in its **read-only** true-hit instrumentation; calculates a contact-only second damage graph, its 30-tick window persistence and per-phase actual damaged-contact separation; and reports potential **crossfire-merged** windows as a separate measured possibility. Synthetic fixture proves the graph distinction. Both 20/40 original full-state SHA trace parity checks remain strict, as do all existing 32 terminal, per-role participation, 4v4 opportunity and full-source fronts floors. An extra cost here is test-run analysis only; the browser/combat runtime and 300-body frame budget are untouched.

## Next opportunity

The phase-eligibility forensic data already show only 10/32 completed 20-body games with four living on each side at the midpoint and none late, so late one-front play is mostly real attrition, not failed pathfinding. The next useful work is a **battle-level, real-time tactical moment** encouraging multiple viable local engagements earlier, especially when both teams still have ≥4 active fighters, with squad roles and counterplay preserved. A target pressure or slot-angle change that simply makes Goblins weaker is rejected. Do not fake battle zones or add effects unrelated to authentic HP damage. Mobile theatre and readability remain a separate iPhone 14 Pro Max Safari manual gate.

**New-head full GitHub Actions CI remains required after this QA/doc-only commit.**
