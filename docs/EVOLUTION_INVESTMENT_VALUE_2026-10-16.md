# Evolution investment value — source-authentic completed matches

**October 16, 2026 · QA branch only**

The prior exact source head `8ea4896ef3f5592c366cad30acb503384839475d` was [39 mandatory jobs green](https://github.com/danickman/ShowdownLab/actions/runs/38847657325). Existing QA fixes: Turtle L4/L5 0.10 true hit-reflect reach, Assassin L5 Execution below 75% pre-hit HP, cached per-tick target pressure. No production or `main` promotion.

**Question:** Does spending multiple draft evolutions on Assassin or Turtle materially improve combat outcomes, or do Beetank's proactive disruption and Dragon/Sniper raw damage dominate?

A new permanent source-observed CI receipt compares **216 genuinely completed** matches by replacing the identical target squad slots with **Assassin, Turtle or Beetank**, upgraded at **L1/L4/L5**. Opponents and other allied units all remain L4. Three enemy styles (mixed, close-melee swarm and long-range Sniper/Dragon), total populations 20/40, seeds 1337 and 9917 and both side orientations give 24 matched battles per tier/role. All other inputs are fixed for marginal tier comparisons; matches may end differently when investment changes.

Evidence is separated into **real attacker-attributed positive HP removed**, Assassin's actual Execution effect count, **actual HP removed from the attacking foe by Turtle reflection**, the pre-armor/dodge **nominal** Turtle shell reduction (this is explicitly *not* actual HP damage prevented), role alive unit-ticks, win outcomes, real independent damage-connected HP fronts and positive sources. This avoids falsely ranking defensive or control fighters only by raw DPS. The instrumented full game trace must exactly match the uninstrumented one on audited 20/40 examples. A full detailed JSON of every trial is archived by GitHub Actions.

**Acceptance constraints:** source evidence must include nonzero real L4/L5 Execution and Turtle reflection, all 216 trials end with an actual winner, no new behavioral changes, no mass spawns or per-tick gameplay observers. No role redesign will be chosen without measuring marginal match value and genuine counterplay. This is a **measurement release**, not a hidden buff or a mobile Safari test. Physical target **iPhone 14 Pro Max** portrait 430×932 DPR3; Safari on hardware still not certified.

**Next proposed action:** examine the CI receipt, identify which investment is actually disappointing in the most representative drafts, then test a small *role-specific* ability change with full 20/40/300 and front/duel counter-protection, followed by release hash repinning if combat changes. Independent early/middle 20-body front problem remains open.

**Status at authoring:** QA-only test/doc commit in preparation. Full exact-head Actions required.
