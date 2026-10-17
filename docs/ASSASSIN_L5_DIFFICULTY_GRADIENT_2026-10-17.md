# Assassin L5 — Opponent difficulty gradient and marginal investment

17 October 2026. Source-only follow-up to [Assassin live draft ROI](ASSASSIN_L5_LIVE_DRAFT_ROI_2026-10-17.md). The accepted live study passed 192 full terminal variants and 16 physical RAF parity pairs on exact source; new heldout first L5 draft wins 9/24 vs 8/24 for hold, 2 recruits and Beetank L5, despite genuine nominated Assassin HP nearly doubling and Execution triggers 18→73. Complete all-swarm wins (8/8) and all-backline losses (0/8) cannot reveal close roster effects. No production source changes proposed.

## Controlled setup

Run `tools/qa/check-assassin-l5-difficulty-gradient.cjs` with LIVE `v3/ultimate-abilities.js`, `v3/legacy-sim-core.js` and `v3/evolution-rules.js`. Reuse proven physical-ID attribution and actual true connected graph of positive-HP hits. Preserve identical friendly roster with 3 of 10 nominated L4 Assassins and one Beetank; repeat for 40 fighters. Starting with same weak-swarm foe formation, replace exactly the positions `[0,2,1,3,4]` in that order with fighters from either the hard ranged-backline or armored formation: **1, 3 or 5** substitutions. This creates six comparable difficulty-gradient compositions, not a global RNG rebalancing.

Each configuration compares four genuine full-match draft choices: hold L4, evolve the entire Assassin family L4→L5, recruit exactly two L4 Assassins or evolve the one/two existing Beetanks L4→L5. Two new calibration seeds **23801/28019** and fresh holdout **37339**, each at 20/40 total fighters and both sides. **72 matched groups × four actual choices = 288 terminal matches**. Add **16 observed/raw entire RAF SHA parity pairs** with physical HP/front/Execution counts. Report real new wins and lost wins versus holding, not just percentages of increased damage; classify `discordant` groups separately from all-win/all-loss matches. No guarantees of same draft choice economics in every game.

## Interpretation gates

A useful next Assassin action should strengthen the first L5 unlock (already impressive in fair benchmark) and turn additional *borderline* draft choices in multiple seeds, especially vs ranged pressure, without suppressing genuinely independent HP-damaging fronts. If the difficulty scan exposes near-wins, inspect real Sniper aim/Dragon windup and count ACTUAL outgoing attacks suppressed in a subsequent bounded L5-only interruption A/B; mere physical overlap is not an interrupted shot. Do not repeat rejected raw speed, threshold or generic global debuff trials. Any eventual playable change requires genuine opponent ×2 and 3-v-15 counters, independent fronts, 80/120/300 source CPU and physical iPhone 14 Pro Max Safari. Current source untouched.

**Dedicated exact-head CI and outcomes pending; no claims until receipts.**

## Verified run result — source-only gradient accepted
QA commit `4964058a9afbedee4dc1369d38d72549f3263628` ran [dedicated push job](https://github.com/danickman/ShowdownLab/actions/runs/39075871949/job/117522785413) successfully: **288 genuinely terminal live-source matches plus 16 entire-frame original/observer SHA parity pairs**. Full exact-head push and PR aggregated workflows were still in progress at this read; do not say all green until independently verified.

Calibration included 48 matched groups (two seeds): hold L4 **17/48** wins, evolve Assassin L5 **32/48**, recruit +2 L4 **24/48**, evolve Beetank L5 **22/48**. 20/48 groups gave different real winners across choices.

**New holdout seed 37339, 24 matched groups:**

| Foe replacements | Hold L4 | Assassin L5 | Recruit 2 L4 | Beetank L5 | Discordant winner groups |
|---|---:|---:|---:|---:|---:|
| Ranged 1/5 | 4/4 | 4/4 | 4/4 | 4/4 | 0 |
| Ranged 3/5 | 0/4 | **2/4** | 1/4 | 0/4 | 2 |
| Ranged 5/5 | 0/4 | 0/4 | 0/4 | 0/4 | 0 |
| Armored 1/5 | 4/4 | 4/4 | 4/4 | 4/4 | 0 |
| Armored 3/5 | 0/4 | **3/4** | 0/4 | 0/4 | 3 |
| Armored 5/5 | 1/4 | 2/4 | 0/4 | **3/4** | 4 |
| **All groups** | **9/24** | **15/24** | **9/24** | **11/24** | **9/24** |

At 20 initial bodies, held-out L5 **9/12** versus hold 4/12, recruit 5/12, Beetank 5/12. At 40 bodies, L5 6/12 versus hold 5/12, recruit 4/12, Beetank 6/12. Real physically connected positive-HP damage-front persistence: hold **73**, Assassin L5 **83**, recruits **78**, Beetank **75**. Independent separated HP-damage windows: **203 / 257 / 245 / 221** respectively. In the two-seed calibration, Assassin L5 also led on team wins 32/48 vs 17/48 hold.

**Decision: ACCEPT existing playable Assassin L5 Execution mechanics; DO NOT increase damage/threshold, speed, or add a global suppression ability based on saturated backline tests.** First-unlock fair-tier Assassin 8/8 historical small case and marginal ROI in mixed opponents are different questions. The prior extreme live ROI held-out 9/24 is still valid; these intermediate fixtures explain exactly where additional Assassin L5 wins are realized. Against a full ranged team the L5 upgrade may properly lose. Persistent fronts and separated HP windows IMPROVED, so the observed value is compatible with arena-spread combat in this selected test. No shipped change, no mobile acceptance claim; 80/120/300 and native Safari release gate remains open.

Next premium-first-unlock class priority: **Mole L5**, originally 4/8 fair first-L5 wins; compare a distinctive bounded eruption gameplay concept (not mere +damage reduction) against peer tier, complete enemy ×2, 3 evolved versus 15, real physical HP/fronts/1×–10× CPU. Goblin L4/L5 follows. Reject any change that erases separate engagements or makes every role identical.
