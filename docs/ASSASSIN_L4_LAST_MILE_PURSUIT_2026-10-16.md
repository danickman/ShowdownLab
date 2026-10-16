# Assassin L4 — bounded ready-attack last-mile pursuit, source-only

October 16, 2026. NOT a runtime/combat change.

## Evidence motivating the trial

Source-actual `check-assassin-l4-target-focus.cjs` completed three×104 real terminal matches. Target loyalty eliminated 5 wounded-backline abandonments but reduced prespecified L4 HP 16,816→16,503 and backstabs 192→187. Live Assassin L4 in those selected matches spent 17,079/18,892 decision ticks stalking; 13,255 decision ticks had `cooldown<=0` but `dist>reach`. This is a pursuit/contact issue; doubling Execution procs from higher wounded HP thresholds also did not help.

## Candidate movement (non-shipping)

Current actual `assassinStep()` uses `moveToward(u,t,1,1.45)` for stalking. Compare source-only multipliers **1.65** (about +14%) and **1.85** (about +28%) *ONLY* when all are true:

- Unit is exactly L4 Assassin (L1-3 and L5 unchanged).
- Its real strike cooldown is ready (`u.cooldown<=0`).
- Its actual current chosen target is an alive backline Sniper/Dragon.
- Real measured target distance lies strictly beyond existing attack reach, but is **less than 0.30 arena units**.
- Assassin is performing normal stalking movement. No teleport, attack reach, damage, Execution threshold, armoured target access, counter stuns, global `nearest()`, shell logic, or all-class speeds are touched.

If none holds, movement remains the original 1.45. Candidates modify **source evaluated in CI only**, not `v3/legacy-sim-core.js`.

## Full A/B and release gates

New `tools/qa/check-assassin-l4-pursuit.cjs` compares baseline, 1.65, 1.85 across 104 matched physical terminal battles per source: 32 standard mixed/swarm/heavy/ranged 20/40, 24 selected prespecified, 24 independent unseen-seed, 24 armored/no-Knight counters, with both blue/red and mirrors. Observe *real* selected backstabs/Executions, landed after-armour HP on Sniper/Dragon/Beetank/Turtle, attack-ready but out-of-range ticks, win flips, Knight/Goblin contribution, genuine HP-connected persistent fronts and separated HP-damage windows. Original live 20/40 front baseline never weakened. A failed source candidate is recorded as REJECTED. Full RAF observed/unobserved parity required; L5 Assassin vs five 1v1 counter roles and 80/120/300 no-L4 physical 1×/10× SHA parity required.

A promising candidate must improve actual selected L4 HP by >5% without losing first/held-out/stress wins, standard independent fronts or separated damage windows. Even then it requires high-population with evolved L4 actual CPU, rendering/telegraph review, Guide accuracy, atomic PWA integrity update and **physical iPhone 14 Pro Max Safari** signoff before production. No merges/deployment authorized in this source-only study.


## Verified 312-fight source A/B verdict — DO NOT ship either pursuit speed

[Push Actions 38957537337](https://github.com/danickman/ShowdownLab/actions/runs/38957537337) finished its **dedicated** 3×104 source-real fully terminal pursuit study successfully on QA `c25d7f5`, with fully independent win/HP-damage front graphs, read-only observer/raw physical-state parity, unmodified L5 solo physical SHA against five roles and no-L4 80/120/300 source-state parity at 1×/10×. These results measure proposed non-shipping source changes, not live-game modifications.

| Actual combat measure | Current 1.45 | L4-only 1.65 | L4-only 1.85 |
|---|---:|---:|---:|
| Prespecified L4 direct HP (24 real finishes) | 16,815.88 | 17,474.36 (+3.9%) | 18,913.28 (+12.5%) |
| Prespecified L4 backstabs | 192 | 200 | 209 |
| Prespecified team wins | 13/24 | **12/24** | **12/24** |
| Independent new-seed wins | 12/24 | **11/24** | 12/24 |
| Counter-stress wins | 10/24 | 12/24 | 10/24 |
| Standard 20-body genuine persistent fronts | 1 | **0** | 3 |
| Standard 40-body genuine persistent fronts | 58 | **34** | **41** |
| Standard 40-body separated actual-damage windows | 192 | **176** | **186** |
| Actual 20/40 standard matched winner flips | 0 | 2 | 2 |

The 1.65 candidate fails current 20-body real independent-front safety outright and sacrifices 24 persistent 40-body windows. The 1.85 candidate gains some 20-body fronts but reduces 40-body persistent actual combat fronts by **17/58 (~29%)**, and both versions lose a win in the first independently mirrored selected phase. Additional ranged pursuit undercuts the battle as an ecosystem even when Assassin directly damages a target more. The nominal 1.65 (+3.9%) source increase also does not meet the prespecified +5% direct HP hurdle. No user-visible or gameplay changes are warranted.

**Release decision:** **REJECT BOTH.** Keep `assassinStep()` stalking speed 1.45, unchanged action reach, original 40% L4 /75% L5 Execution thresholds, Sniper kiting, armor counters and current PWA. Do not treat all movement speed or Execution damage as the solution.

**Next research should locate wasted contact geometry**, not optimize more percentages on these seeds: measure Assassin relative to moving Sniper/Dragon (closing velocity, slot destination vs physical reach, collision pushback, target reassignment in `step()` before backline selection). Investigate whether deterministic **slotPoint / engagement-slot and separation behavior** prevents a ready attacker from closing; any candidate must retain all-role front windows in standard 40 plus 20, preserve original role counters, and pass population 80/120/300 costs and iPhone 14 Pro Max physical Safari. Also retain Turtle L4 role differentiation and actual sustained multi-front fights as priorities.

