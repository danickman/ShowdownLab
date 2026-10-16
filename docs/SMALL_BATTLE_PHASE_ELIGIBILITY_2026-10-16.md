# True front eligibility through 20-fighter battle attrition

2026-10-16 | QA branch only | baseline eb2e3126a54b2b9dba82bcd509193150d7eefa37 | iPhone 14 Pro Max is primary; physical Safari still untested.

## 32 finished 10v10 battles: four roster families, four seeds, two mirror sides

Our source-instrumented combat observer uses only actual attacker-attributed positive HP damage. At approximately 1/6, 1/2 and 5/6 of the completed fight:

| Measure | Early | Middle | Late |
|---|---:|---:|---:|
| Average fighters still alive | 17.4 | 9.1 | 6.5 |
| Average blue/red alive | 8.6/8.8 | 4.5/4.6 | 3.2/3.3 |
| At least four living on **each** side | 32/32 | 10/32 | 0/32 |
| At most two left on either side | 0/32 | 5/32 | 31/32 |
| Genuinely separate HP-damaging windows | 46 | 3 | 0 |
| Windows with real positive attacker HP damage | 348 | 362 | 221 |

**Interpretation:** In the late phase, a second independent damage-positive front is generally not feasible: one side has at most two actual survivors in 31 of 32 full games. Do not generate fake fights or penalize finishers to fulfill a misleading late two-front objective. Middle play still has real 4v4+ opportunities in 10 of the 32 cases, but very limited simultaneous damage. Preserve this distinction when improving engagement.

## Successful-hit target affinity was rejected

A separate matched A/B of 30 **fully completed** 20-body games (five rosters, three seeds, both sides), with a corrected admissible distance-score bound, awarded 0.012 or 0.024 target loyalty **only after a real successful melee hit** for 90 simulation ticks. It never ran above 20 fighters, so companion 30 40-body games were physically unchanged.

| Candidate | Separated damage windows | Persistent multi-front windows | Winner differences | Turtle direct damage | Goblin direct damage |
|---|---:|---:|---:|---:|---:|
| Current QA | 52 | 4 | 0 | 2783 | 2209 |
| Loyalty .024 general melee excluding Assassin/Mole | 56 | 4 | 4/30 | 2612 | 1743 |
| Loyalty .024 Knight, Beetank, Barbarian, Turtle | 64 | 3 | 3/30 | 3043 | 1960 |
| Loyalty .012 general melee excluding Assassin/Mole | 63 | 4 | 2/30 | 2549 | 2179 |

More transient separation does **not** imply persistent front improvement, and sacrificing low-DPS role contribution is counterproductive. Reject these experiments; no runtime changes.

## Permanent QA upgrade

The existing completed-match QA records living **blue** and **red** fighter counts each RAF and correlates them with the already truthful attacker-target connected damage components in each 30-tick window. Added fields include eligibleWindows (>=4 alive on **both** sides), eligibleDamageWindows, eligibleSeparatedWindows, lopsidedWindows (<=2 on either side), phase midpoint average survivors and 4v4/<=2 counts. All original 32 full terminal wins, credited-role normalization, front persistence floors and full physical observer parity remain enforced.

A window is *eligible* if enough actual opposing units remain; it is NOT automatically a fight. Approximate window start survivor state is accurate to one RAF (~10 simulation ticks at 10x). Do not claim browser/FPS evidence from the Node simulation. Continue targeting mid-match 4v4+ authentic separate battles while preserving Turtle, Assassin, Goblin and existing role counters, 40+ fronts and 300-body performance.

**No combat, VFX, source art, release hashes or production content changed.**


## Oct 16 follow-up — damage actually connected locally

A separate read-only QA observation now measures **positive primary melee attacker-target HP damage at <=0.13 arena separation**, independent of long-range crossfire, without equating proximity with fighting. Source A/B 20 full battles found no ranged-crossfire-caused merged-front artifacts, and no proposed combat change met the role-preserving multiple-front standard. See [SMALL_BATTLE_LOCAL_DAMAGE_2026-10-16.md](SMALL_BATTLE_LOCAL_DAMAGE_2026-10-16.md). All full-state snapshots and runtime unchanged.
