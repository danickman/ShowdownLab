# Target pressure live cache — stat-neutral simulator optimization

**2026-10-16 — QA branch only.** Baseline [a1aa983](https://github.com/danickman/ShowdownLab/commit/a1aa983bf716113f83e3ee5506b1e84f38fa8704) completed all active GitHub Actions successfully [run 38845812591](https://github.com/danickman/ShowdownLab/actions/runs/38845812591). Main/production unchanged.

## Why now

The user prioritizes authentic simultaneous fights in 20–40-fighter battles, meaningful Assassin/Turtle/Beetank upgrades, performance and strong stage readability on **iPhone 14 Pro Max**. A fresh tactical A/B compared role-specific early lane interception, pressure distribution, Beetank-heavy pursuit and front-safe targeting against the same fixed full-terminal 16×20 and 16×40 suites. No candidate improved persistent multi-front damage consistently without sacrificing Knight/Beetank/Goblin real HP output or changing substantial winner outcomes:

| Early tactical source experiment | 20-fighter authentic persistent windows | 40-fighter | Outcome |
|---|---:|---:|---|
| Existing deployed policy | 1 | 66 | Protected baseline |
| Defender intercept (Knight/Turtle/Beetank) | 1 | 66 | 20 Goblin damage drops ~19%; reject |
| Defender+Barbarian wing preference | 3 | 66 | 20 Beetank damage drops ~13%, 2 winners change; reject |
| Earlier high-target pressure | 1 | 66 | 20 Knight damage drops ~10%; reject |
| Beetank heavy-target 0.045 reward | 1 | 46 | 40 persistence decreases, one winner changes; reject |
| Knight/Barbarian target distribution | 2 | 37 | 40 persistence decreases, one winner changes; reject |

These results use source-observed positive HP damage, connected attacker-target components, two geographic fronts at least .18 apart in a 30-tick window, and persistence of two independent components in adjacent windows. Some changes moved normal winner outcomes; no gameplay/targeting change is justified. This remains an outstanding gameplay problem, especially mid-match when each team still has ≥4 actual living units.

## Cache implementation

The previous runtime recalculated a fresh `pressureByTarget` Map for each fighter's `nearest` query, scanning its entire allied team. Its tactical purpose is **already established**: discourage more than two allies concentrating on the same target. We keep exact sequential targeting and penalty: no change to score, target priority, health, cooldown, speed, RNG, movement, damage or combat roles.

- Lazy, per-tick `pressureCache`, with exactly two team Maps, rebuilt at first `nearest()` query per step.
- `trackTarget()` updates pressure counts **immediately**, preserving within-tick attack order, Assassin back-target selection, Mole burrow target changes, null/normal retarget and deadlock handling.
- `hurt()` removes each newly dead combatant from its own team's pressure Map. Rebuilding after a burn death before the first query also produces the correct live set.
- `deploy()` resets cache so two matches in one session cannot inherit any earlier target history.
- One once-per-tick scan instead of N allied scans; retains existing `nearest` broadphase distance rejection, collision logic and `step()` ending unchanged, so older event/damage QA observers remain valid.

The separate GitHub [source A/B pressure study](https://github.com/danickman/ShowdownLab/blob/qa-turn1-duel-baseline/tools/qa/check-pressure-cache-spike.cjs) found synthetic Node/VM median workload ratios (candidate/control): **40: 0.933; 80: 0.980; 120: 0.926; 180: 0.955; 300: 0.960**. These are directionally useful but **not phone FPS**; workload, GC/JIT and source candidate style differ from live lazy-cache implementation.

For this exact **live lazy-cache** variant, 44 matched V8 full-state source trials yielded **44/44 identical full timeline traces**: **32 fully terminated** 20/40 cases (4 roster modes × two seeds × mirrored sides × two sizes) plus **12 80/120/300-body traces at 1× and 10×**. No different winner, HP, animation action, coordinate, RNG-dependent state or target was found. New permanent `tools/qa/check-target-pressure-cache-parity.cjs` independently rebuilds the previous uncached core from the shipped source, then hashes *every physics snapshot*, protects exact 44 arms and requires actual full winners at 20/40. Existing pressure experimental test rebuilt to compare old eager-cache experiment against its real historical control rather than attempting to add a second cache to the shipped runtime.

## Release quality

- Runtime: `v3/legacy-sim-core.js` target-pressure accounting only. Worker cache `showdown-lab-release-pressurecache1`, root core URL `?v=pressurecache1`, exactly **42 SHA-256 resource pins** recalculated and checked in source. Sprite assets, Ultimate role specs, camera/renderer and all battle visuals unchanged.
- Existing 300/1×/10×, duel 300, true role fronts, full terminal 20/40, Battle Guide, iPhone **14 Pro Max** 430×932 DPR3 Chromium portrait, service-worker atomic/rollback and all regression jobs are **mandatory** on the new exact head; physical Safari remains manual.
- Do **not** equate CPU time savings to improved strategic fronts: this turn creates **performance headroom** for a future evidence-based engagement director; preserves the bad 20-body persistent-front score rather than hiding it. A future design must earn increased real independent HP fights without reducing important fighter roles.

**Exact-head GitHub Actions validation pending when this report was written; update status based on actual run.**
