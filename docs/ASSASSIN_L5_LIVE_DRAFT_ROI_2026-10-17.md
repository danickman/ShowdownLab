# Assassin L5 live-current draft investment ROI — October 17, 2026

## Question and historical baseline
The archived same-team 384-game choice study previously found for Assassin L4→L5 (24 matched roster cases) hold **8/24**, evolve Assassin L5 **10/24**, recruit two **8/24**, evolve existing Beetank family **9/24**. The separate family-only 432-game study found Assassin L5 evolve **20/24** vs +2 recruits **18/24**. All-ten first-to-L5 baseline on 8 symmetric selected battles scored Assassin **8/8**. These sources are valid selected *historical findings*, not broadly estimated win rates.

The older choice study explicitly loads `tools/qa/fixtures/goose-before-impact-ultimate.js`, freezing old ultimate abilities before Goose Impact and premium Barbarian. It cannot establish today's live Assassin L5 return on a draft pick. Assassin L5 in live `v3/ultimate-abilities.js` executes **+120% backstab damage below 75% of target HP**, and L4 remains +80% below 40%. Do not conflate activation count, physical damage, first unlock dominance, and marginal draft ROI.

## New test-only implementation
`tools/qa/check-assassin-l5-live-roi.cjs` reuses original full-terminal physics and attributed positive-HP observer/connected-front math, explicitly swaps only the historical frozen ultimate source to **live** premium Barbarian + Goose Impact + Assassin L5. It records genuine Execution trigger count by physical nominated Assassin actor, and real post-cap positive HP, team wins, separated damage windows, persistent damaging fronts, and Beetank own contribution.

48 fixture sets = 3 foe compositions (swarm, backline, armored) × 20/40 deployed bodies × 4 seeds × 2 team mirrors. Four decisions per fixture: hold all 3/6 existing Assassins at L4; promote all to L5; add two L4 Assassins (population 22/42); or promote existing 1/2 L4 Beetanks instead. This yields **192 complete terminal source battles**, plus **16 instrumented-versus-raw whole-frame physical SHA pairs**, using original historical seeds **1337/2017 diagnostic** and new holdouts **33071/40151**. Per-match start rosters and own nominated actor IDs must be validated in source. The same-choice comparisons apply to these configurations only, not guaranteed draft offers and not intrinsic value per individual fighter.

## Acceptance
Report separately old-seed live replication vs new held-out findings and each composition/population. Genuine extra wins versus recruits/Beetank must be visible on held-out cases, not just more Execution procs or damage. Preserve armor/Beetank/Turtle counters and fronts. No Assassin tweak proposed yet. If baseline ROI weakens substantially, investigate unique threat denial or improved signature presentation before blindly adjusting Execution damage. Mixed-roster 80/120/300 1×/10× CPU and actual iPhone 14 Pro Max Safari remain mandatory if any future combat change proposed. Source-only documentation/CI step; **not gameplay or PWA deployment**.

**New exact-head CI pending; no invented outcomes.**
