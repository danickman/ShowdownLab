# L4 Assassin — real ranged telegraph overlap measurement

16 October 2026. SOURCE-ONLY / NO GAMEPLAY CHANGE.

## Why and baseline
Previous accepted 896 full terminal borderline study found Assassin L3→L4 won 1/8 selected unseen 20-body matchups and 4/8 at 40, versus evolving same-team Beetank 5/8 and 8/8. Turtle L4 proved valuable and should not receive another generic buff. Rejected Assassin movement, target continuity, Shadow Mark and Execution HP thresholds remain rejected.

## Real event hypothesis
Can actual selected L4 Assassin backstabs hit a live Sniper during its aimTicks preparation or Dragon during windupTicks? Only a hit that **actually resolves positive HP after armor, dodge and cap**, with physical attacker and target IDs and prep time still active, counts as backstab overlap. The *original* code already uses Sniper aim and Dragon windup; a backstab presently does not reset them. Other mechanics can suppress/delay attacks; proximity, ready cooldown ticks and overlapping preparation **must not** be represented as a shot denied.

Source-only uniquely anchored telemetry extends the already accepted full-terminal draft study observer. It records post-mitigation physical HP, real team winners, actual existing positive-HP damaging front graph, actual opposing rifle discharge and Dragon breath invocation, selected L4 Assassin decision ready/reach status, and exact per-RAF observed/raw JSON SHA parity. No extra RNG, no combat edits, no partial-match outcomes.

Prespecified scenarios: 20/40 total fighters, mixed allied Assassin/Beetank L3 and other L4 roles, five enemy rosters ranged-1, ranged-3, ranged-6, armored-1, armored-3; 5003 and 7027 discovery seeds, 9173 independent held-out seed; both colors; choices hold, Assassin L3→L4, allied Beetank L3→L4. **180 complete terminal simulated battles**, 12 independent full-frame parity comparisons. Holdout is defined before result inspection; the sample is deliberately small and matchup-dependent, not a population probability claim.

## Acceptance
First verify job syntax, full terminal receipts and raw/observed RAF SHA. Then inspect **actual positive-HP hits during a telegraph**, their physical IDs, HP and target state. If zero, reject *shot interruption on existing backstabs* as an opportunity until a fundamentally different mechanic is considered. If nonzero, a subsequent source-only actual cancellation A/B must prove suppressed completed enemy attacks, maintain true 20/40 damage fronts, preserve Sniper/Dragon role counters and team outcomes, and justify higher-population 80/120/300 resource cost. No candidate should be shipped based on proximity or mere damage. Physical iPhone 14 Pro Max portrait 430×932 DPR3 Safari acceptance remains OPEN.

**CI result:** pending new exact-head push and PR Actions jobs. No Guide, PWA, art, main or production change.


### CI harness correction
Initial QA commit `9a32b5e` launched the study but its [push job](https://github.com/danickman/ShowdownLab/actions/runs/38994257164) caught a **nested source-observer build syntax error** before the first simulation (two missing replacement-call closures). No physics assertion was reached and no conclusion about Assassin or actual shot overlap can be drawn from that failed job. The observer builder has been corrected and now explicitly V8-compiles the generated source before any match. A fresh exact-head CI receipt is mandatory.
