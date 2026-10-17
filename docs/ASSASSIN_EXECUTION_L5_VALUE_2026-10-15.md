# L5 Assassin Execution — targeted finisher payoff without false combat theatre

**Date:** October 15/16, 2026. **Branch:** `qa-turn1-duel-baseline` (QA only). Baseline `fc766355566dfe3b7a73abbf6dc39de3d252552c`, [full 37 active successes/one optional skip](https://github.com/danickman/ShowdownLab/actions/runs/38838627030); production/main unchanged. iPhone **14 Pro Max** is primary, actual Safari gate still manual.

## Why this tier-specific correction

Assassin's Execution is a real physical HP damage event, but earlier repeated L4/L5 observation produced low apparent value despite expensive evolution. L4 gives **1.8× damage below 40% target HP**; L5 gives **2.2× damage below 55%**. The upgrade from L4 to L5 felt too conditional versus obvious Dragon/Sniper/Beetank payoffs. Following the newly validated Turtle real-contact Ricochet correction, evaluate **L5-only pre-hit threshold 55%→75%**, leaving all base Assassin attributes and L4 unchanged. Only a real successful backstab under the threshold is affected. No extra dice roll, phantom attack, unconditional damage, teleport, HP, cooldown, targeting scan or image asset.

## Selection and rejected alternatives

All experiments use the current game simulator, normal seeded side mirrors, **terminal** matches, actual attacker-credited HP damage and connected independent damage-front persistence—not distance-only overlays.

- Global L4/L5 45/60, 48/62, 50/65 and 52/68 thresholds: more activations, **20-fighter persistent true fights 1→0**. Rejected.
- L4-only 50/55 threshold: **20 persisted 1→0**; rejected.
- Wounded-backliner target scoring 0.012–0.050: no meaningful Execution increase; rejected to protect target-choice/performance.
- Extra Execution on post-vanish strike (65+ remaining special, wounded target): improved ability flashes but lost the 20-body persistent front and reduced 40-body persistence; rejected.
- **L5-only 75%**: 20-body 20-match **30 separated and 1 persistent both before/after**, 40-body **226 separated and 75 persistent both before/after**. **0 changed winners in 40 finished battles.** True Execution event counts **6→7 at 20**, **4→7 at 40** (these samples have mixed levels and role compositions; do not confuse with old all-L5 samples). Attributed Assassin damage **~5,804→~5,922** at 20 and **~8,230→~8,698** at 40. Chosen bounded improvement, preserving L4/Baseline.

## Specific evolved-role counters

Solo source A/B at L1, L4, L5, each target Beetank/Turtle/Dragon/Sniper/Knight × 2 seeds × two mirrors:

- At **L5**, Turtle/Beetank/Dragon/Knight each retains all **4/4** defender victories. Sniper loses **4/4** to Assassin, preserving expected rear threat.
- Against L5 Beetank, Execution triggered **0→4** actual times over four solos, Assassin credited damage **~1,506→1,958**, while defender still won all four.
- Against L5 Dragon, Execution **0→5** actual times and credited HP damage **~1,766→2,473**, with Dragon retaining all four wins.
- L5 Turtle did not provide a new Execution opportunity in these solos, and all Turtle victories remain intact; don't claim the target is now easy prey.
- L1/L4 actual results, damage, timing and full states must remain unchanged.
- The heavy enemy 20-body 4-seed/mirror tests kept defender **4/4** winning while evolved L5 Assassin Execution events **5→12** and direct credited damage **~3,422→4,090**. Additional stacked five-level army evolution value, utility and player-choice ROI remain future open work.

## Regressions and PWA

`tools/qa/check-assassin-execution-payoff.cjs` enforces exact L5 threshold at **74%, not 75%**, exact 2.2× HP damage and unchanged L4 <40%, L1–3 zero, full source instrumentation state parity; 40 completed true 20/40 multi-front and damage benchmarks across mixed/swarm/heavy/ranged/backline; 60 complete L1/L4/L5 solo mirror/seed armored/ranged counter cases; exact unrelated 80/120/300 1×/10× physical parity and fixed L1/L4 all-Assassin match parity. Permanent CI report artifact. Keeps the separate Turtle reflection regression intact. Main root script query `assassinexecution1`, new atomic worker cache revision, all **42 SW SHA-256 pins verified** (root and Ultimate actual bytes updated), existing Ultimate unit coverage expanded.

**Acceptance:** full exact-head CI including 430×932 DPR3 Chromium geometry/portrait, offline rollback, 300-body, preserved Turtle/Knight/Sniper/Dragon/etc. counters. **Physical iPhone 14 Pro Max Safari** remains untested and must not be claimed. No production/main deployment.
