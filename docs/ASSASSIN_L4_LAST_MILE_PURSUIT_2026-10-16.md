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
