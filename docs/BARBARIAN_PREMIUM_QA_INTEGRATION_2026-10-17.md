# Barbarian Premium Blood Cleave — QA playable integration

17 October 2026. Original game balancing intent: first L4/L5 evolution changes an otherwise competitive round unless met by matching evolution, whole-army ×2 or severely superior enemies.

## Empirical promotion basis
Verified original-source 408 genuine terminal matched choice variants and 12 full-RAF parity at `0ba5ef5`; unseen first L4 3/8→6/8, first L5 2/8→7/8 for current vs premium. Secondary HP on held-out L5: 9,102→23,179. Independent positive-HP fronts 32→14, separate HP damage windows 80→74. No free win against peer Ultimate (4/8 mirrored), whole enemy army ×2 defeats premium 7/8 at L5 and 8/8 at L4, three premium fighters lose 8/8 to fifteen strong opponents.

Verified six current-vs-premium dense real-fighter cases, 80/120/300, two seeds 1×/10×: premium/source 10× p95 CPU relative to current ranged .94–1.08, no state corruption, six exact off-target no-Barbarian RAF SHA checks. 300 bodies at 10× is intrinsically costly for both engines (around 332–354 ms Node p95 synthetic frame): **no iPhone browser frame-rate or production claim**.

## QA-only source changes
- Live `ShowdownUltimates.specs.barbarian` describes new attacks.
- Cleave main hit remains. When an L4 axe lands, sweep up to 3 additional nearby physical targets within .135 arena units for 58% attack damage; stagger additional victims 8 simulation ticks. At L5 the sweep reaches .205, up to 5 targets, 100% attack damage and 12 ticks stagger. Stable nearest-distance then physical-ID target order, no recursive hit or global stun.
- `UltimateEffects.draw` widens the crescent arc at L5 and adds a quiet secondary warm arc that disappears in reduced-motion mode; avoids flashes and viewport shakes.
- Atomic cached offline release changes root references for 2 modified modules to `barbcleave1`, cache version, and verified SHA-256 map for root plus those modules. Retains all 42 pins and runtime order.
- Historical source-only 408-match researcher and 80/120/300 current-before comparison now load frozen `tools/qa/fixtures/barbarian-before-premium-ultimate.js`, not a silently moving target.

## Mandatory QA gate
Fresh exact-head full CI, release-hashes verify, atomic SW rollback, all-roster first-evolution, complete-win and role-counter checks. Dense Node CPU already measured does not replace actual Safari iPhone 14 Pro Max 430×932 DPR3, GPU/sprites, 80/120/300 frame budget, 1× and 10× observation. Main and production untouched; deployment requires separate authorization. Monitor the front-persistence loss and whether cleave visual communicates its L5 power.
