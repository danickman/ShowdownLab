# Next Gameplay Turn — Make Evolved Fighters Worth Picking

**Priority:** Next gameplay implementation turn after the completed-match multi-front benchmark. User requested explicit Assassin Execution and Turtle-versus-Beetank improvement while the current QA pass was finishing. This document is a committed **future work order**, not an implemented rebalance.

**Baseline:** QA branch `qa-turn1-duel-baseline`, source `8351308afed29ca04b9fc7dda9e8968a535bd263`, [36 required jobs passing](https://github.com/danickman/ShowdownLab/actions/runs/38830645911), one optional exploratory skip. Main and production remain unchanged.

## Player-experience problem / design goal

Investing several Draft rounds to evolve a fighter through L4 and L5 must be rewarded by a **visible, gameplay-altering payoff**. It should give players a strong strategic reason to draft that fighter, not require choosing Dragon, Sniper or Beetank to feel competent. Distinct roles and weaknesses must remain. Not every fighter should lead the raw DPS table, but no roster entry should be a bad evolutionary investment with negligible combat agency.

Specifically:
1. **Assassin:** Current L4 Execution gives +80% backstab damage only while the pre-hit target is under 40% HP; L5 gives +120% when under 55%. Longer seeded samples found **27 triggers / 390 real L4 backstabs (6.9%)** and **30 / 339 L5 (8.8%)**. It works, but the felt opportunity is uncommon. It can reach Dragon, Beetank and Turtle at contact after earlier targeted fixes, and those heavy defenders still retain counterplay. Test ways to make L4/L5 Execution meaningfully attainable, including target selection and finish windows, without an always-on damage multiplier or unavoidable tank kills.
2. **Turtle versus Beetank:** Beetank already has a powerful interrupting Ram and higher apparent damage. Turtle needs a different, defensible reason to pick it: **protective staying power, attrition, shell timing, melee punishment and Ricochet reflection**. Compare actual team survival when supported by Turtle versus Beetank, prevented incoming HP damage, reflected *actual* damage, stunned enemies and successful decisive shell slams—not just direct DPS. If those benefits are weak, change Turtle's ability/AI responsivity in a measured way rather than making Turtle a slower Beetank.
3. **The wider roster:** In 16 fully completed 40-body benchmark battles, positive attacker-attributed HP damage included Assassin **~4,385**, Turtle **~2,440**, Beetank **~8,532**, Dragon **~53,309**, Sniper **~35,209**. These are **aggregates across nonidentical deployed fighter mixes**, and reflect/tank/CC source-less effects are excluded, so **not per-fighter or per-upgrade rankings**. Normalize by fighter deployed, level, survival time, and action opportunities before drawing strength conclusions. Include Goose, Goblin, Knight and Barbarian in the eventual review.

## Required turn procedure (one bounded, evidence-backed change at a time)

### A. Measure upgrade value, not just combat HP damage
- Run matched **fully terminal** seeded and mirror fights at **L1, L4, L5**, population 20/40 and selected 80 cases. Use representative draft compositions including mono-squad and balanced mixed armies.
- Track per-role *deployed fighter-minutes/ticks*, target opportunities, pre-hit HP brackets, completed attacks, total effective HP removed, credited kill/assist contributions, allies protected, damage actually prevented, received damage/HP survived, objective-disrupting stun unit-ticks, reflection damage and true Ultimate event activations. Explicitly separate normal physical damage from reflected/secondary damage and distinguish censored windows from actual winners.
- Measure **marginal value of the evolution investment**, using the same squad and opponent with only the target role's tier changed, holding other roster decisions and random seed constant. Characterize L1→L4 and L4→L5 gains; avoid assuming all tiers increase victory chance identically.
- Keep existing `damageFronts` graph for authentic independent damaging fronts and continuity at 20/40: improvements must not merely inflate particle or threat activity. Establish 300-body performance/parity budget.

### B. Assassin Execution candidates — test before selecting
- Baseline, then compare modest pre-hit threshold windows (e.g. L4 45–50%; L5 60–65%), **or** real tactical finisher-mark / low-HP backline priorities, or other event-grounded per-target execution opportunity. Do not combine multiple candidates until each independent benefit is demonstrated.
- Require higher measured Execution *activations per actual backstab*, credible upgrade payoff, visible true-hit VFX with cooldown/density limits, and improved damage/finish influence in *completed matches*. No fake guaranteed activations, global damage multiplier, extra hidden knife projectiles or uncounterable instakills.
- Protect Assassin's backline identity and the relative strength of armored Beetank/Turtle, Dragon contact behavior, Sniper vulnerability and deterministic move/teleport paths. Ensure repeated evolved Assassins cannot trivially overwhelm every tank or invalidate healing/guard.

### C. Turtle differentiated value — test before selecting
- Compare Beetank L1/L4/L5 versus Turtle in matched mirror/side-normalized incoming focus, melee swarms, ranged DPS, Dragon splash and Assassin threats. Calculate **net team value**: survival and prevention+reflection, protection of nearby allies, number/duration of meaningful defensive counters and damaged enemies. Record support value separately from direct attack.
- If weak, test one carefully isolated Turtle-only change (shell timing, retaliation reach/frequency, short-range shell-slam counterpressure, genuine ally shelter, or ricochet cap/delivery) **without** inflating all Turtle base stats or cloning Seismic Ram.
- Preserve Beetank as a proactive charging disruptor and Turtle as defensive area denial. Turtle should excel in identifiable enemy/draft scenarios, and Beetank in others. Every reflected blow must come from a real attacker and obey attack-range/source rules.

### D. Acceptance, docs and release
- For each A/B trial report population, seeds, side mirrors, role counts, level, initial condition, real winner, elapsed simulation ticks, attributed damage, damage prevented/reflected, ability event count, actual independent damage fronts, and performance costs. Compare **normalized value**, not raw totals alone.
- Require meaningful L4/L5 uplift in at least one strategically important complete-match scenario, **while retaining losing counters**. Do not invent arbitrary 20% improvement goals or force all outcomes to turn favorable.
- Add permanent deterministic regressions for selected behavior, protect Turtle/Turtle and all existing 300-body/offline/430×932 DPR3 tests, ensure any new visual cue is based on real sim event and capped at high density, repin all 42 release resources if runtime or Guide changes, update `ROADMAP.md`, `QA_IMPLEMENTATION_HANDOFF.md` and `TEST_MATRIX.md`, and obtain full new-head GitHub Actions success.
- Keep QA branch only. **No merge/deployment without explicit approval.** Physical iPhone Safari remains a manual acceptance gate.

## Current-turn boundary

The October 15/16 completed-match QA turn **did not implement any of these role adjustments**. The next development turn must execute the measurement and then ship one validated Assassin-or-Turtle payoff correction. Preserve the work already completed on 20-body persistent fronts; this role-value effort does not remove that priority.
