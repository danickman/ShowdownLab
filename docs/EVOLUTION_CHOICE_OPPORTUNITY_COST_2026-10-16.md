# Evolution choice investment and draft opportunity cost — controlled full-match audit

## Verified full-match results — two complementary, not pooled, tests

**October 16, 2026.** Both studies passed read-only instrumented/original complete-RAF physical parity, true terminal winners, physically indexed attack/protection/reflection attribution and genuine separated damage-front checks in [push CI 38961589266](https://github.com/danickman/ShowdownLab/actions/runs/38961589266). The push completed **45 successful required jobs plus one skipped** at exact QA `35a33b7463e451b6f192a4099542c15e55c8ac19`; these are **pre-documentation verdict** receipts. No runtime or PWA change.

### A — one family evolution versus adding fighters (432 fights)

Different candidate-friendly formations with no existing allied Beetank required; compare each family independently, do not treat role results as head-to-head same-team outcomes.

| Family and milestone | Evolve team wins /24 | Add one win /24 | Add two wins /24 |
|---|---:|---:|---:|
| Assassin L3→L4 | 15 | 13 | 13 |
| Assassin L4→L5 | **20** | 16 | 18 |
| Turtle L3→L4 | 10 | 9 | 10 |
| Turtle L4→L5 | 11 | 9 | 11 |
| Beetank L3→L4 | 9 | 10 | 9 |
| Beetank L4→L5 | 12 | 10 | 11 |

Assassin L5 is **valuable** against this defined choice; Turtle evolution generates real prevention/reflect but ties two-copy recruitment on wins. Backline-heavy defenders stopped all eight L3→L4 Turtle and Beetank upgraded tests and all eight Assassin L3→L4 trials; L5 Assassin won four such fights, Turtle and Beetank still zero. These are deliberately strong matched scenarios, **not general win probabilities**.

### B — choosing Turtle / Assassin investment versus upgrading Beetank *on the same friendly team* (384 fights)

This fixes an important missing comparator: every friendly team actually has 3/6 nominated Assassin or Turtle copies and 1/2 Beetanks. The same team can use its choice to evolve the nominated family, add two fighters (population 20→22 or 40→42), or evolve that *existing Beetank* family. 24 matched scenarios per family/tier, equal seeds/team mirror/opposing swarm, backline and armored patterns.

| Chosen family + milestone | Hold (no pick) | Evolve chosen | Recruit 2 | Evolve Beetank |
|---|---:|---:|---:|---:|
| Assassin L3→L4 | 5/24 | **5/24** | 6/24 | **8/24** |
| Assassin L4→L5 | 8/24 | **10/24** | 8/24 | 9/24 |
| Turtle L3→L4 | 8/24 | 8/24 | 8/24 | 8/24 |
| Turtle L4→L5 | 8/24 | 8/24 | 8/24 | 8/24 |

- **Assassin L4 is the clearest potential investment weakness in the mixed-roster experiment**: selected physical direct HP rises compared with the hold choice (9,846→17,487), yet team wins stay 5 and persistent real fronts **63→56**; recruiting 2 wins 6 / fronts 68, spending pick on Beetank wins 8 / fronts 66. Raw assassin DPS improvement is not the same as team gain.
- **Assassin L5 produces a genuine counter payoff:** selected direct HP 17,453→34,071, team wins 8→10, while two recruits win 8 and Beetank evolution wins 9. This argues **against** a broad Assassin L5 nerf or blind assumption Assassin is always underpowered.
- **Turtle protection works but often fails to turn outcomes:** chosen L4 Guardian physically saves 4,615 allied HP in the L3→L4 trial; chosen L5 Guardian physically saves 13,873 allied HP in the L4→L5 trial, compared with 7,093 from two additional L4 Turtles. These are realized *per-hit marginal savings beyond stronger Knight Bastion*, **not** a whole-match causal difference. Yet all four choices win 8/24 per tier.
- The same-team Turtle formations **win all 8 swarm tests and lose all 16 backline/armored tests**, regardless of choice. This ceiling/floor explains why a legitimate defensive improvement cannot create a win in this sample. A better Turtle counter/tool matters more than 18→20% aura scaling. For L4→L5 Turtle, recruiting two also creates 115 authentic persistent front windows vs 88 when evolving; do not sacrifice comic battle dispersion just to inflate a protection total.

**Verdict:** keep current Turtle / Assassin / Beetank physics, draft offers, actor art and 42 PWA manifest integrity unchanged. Next targeted mechanic study should specifically test **L4 Assassin's contribution to actual backline disruption and fight-turning threat denial** without speed, damage or radius blanket buffs (earlier Shadow Mark never transferred to allies). For Turtle, test a clear bounded ally-intervention effect in **winnable borderline** mixed/armored scenarios rather than saturating all-win swarms or all-loss backlines; log actual saved HP, front count and winner flips. Also separately return to genuine 20-body persistent independent combat fronts. Before accepting game changes, require whole-game 20/40 counter matches, 80/120/300 cost and manual iPhone 14 Pro Max Safari acceptance.

### Research cost control

The two verified source-real choice studies have been moved from always-on 46-job `qa-duels.yml` to `qa-research-archive.yml`. The unchanged scripts run on **actual combat source changes** (`legacy-sim-core.js`, `ultimate-abilities.js`, `evolution-rules.js`) or the exact study script changing, and can be dispatched manually when the archive exists on default branch. The normal workflow retains all gameplay, PWA, body-count, original HP-front and Guardian/Assassin regression gates; this removes **816 redundant terminal simulations per normal push/PR** without throwing away evidence or weakening acceptance floors.


**October 16, 2026 · current actual QA combat, not candidate buff.**

User's strategic question: *Why spend repeated evolution picks on a potentially underwhelming Assassin or Turtle instead of adding more fighters or investing in Beetank?*

Previous tests compared absolute L1/L4/L5 damage or source-only percentage tweaks. They did **not** compare the *marginal choices* a player actually faces when approaching an upgrade milestone. This report adds directly matched full-terminal choices: **upgrade the whole selected role squad L3→L4 or L4→L5**, versus **add one** or **add two** fighters of that role at the existing tier.

## Matched design
- Three roles: Assassin, Turtle, Beetank, same evolution ladder; two milestone steps L3→L4 and L4→L5.
- Three deliberately differentiated enemies: swarm, ranged/backline and armored heavy; all enemy fighters fixed at level 4.
- Two population starting scenarios 20 and 40, two distinct deterministic seeds 1337/2017, both mirrored team colours. **144 fixture combinations ×3 choices =432 real completed terminal matches.**
- Player team begins with 30% of chosen class (3 in a ten-unit team, 6 in twenty); the same seven-role supporting group remains constant; all support fighters are L4. Reinforcement adds one or two real physical units, as it should—do not artificially constrain total fighters back to original size.
- Preserve physical attacking HP contributions, actual Turtle Ricochet reflected HP, immediate wounded-ally Guardian saved HP **after defender mitigation and HP cap, marginal to Knight Bastion**, team wins, genuine physically independent positive-HP damage fronts and roster/population side effects.
- Read-only observed/raw RAF-state SHA on L3 and L4 role scenarios. No runtime/PWA/Guide/art code changed. Distinguish *proposed unit additions* from actual Draft offer amounts; do not claim exact apples-to-apples economic parity for every draft offer.

## Decision
If evolutions underperform alternative reinforcements across all three archetypes, investigate **draft-choice economic scaling and ability action impact**, not arbitrary generic DPS. If Turtle's evolved Guardian shows genuine HP prevented / wins in swarm but worse elsewhere, reveal meaningful squad-counter identity. If Assassin evolves into a high-value ranged counter but not a tank buster, make that clear. If Beetank dominates every scenario, identify bounded unique L4/L5 payoff and offer-economics adjustments to preserve viable alternative builds. No balance patch without a second holdout sample, original full 20/40 authentic front gates, dense 80–300 perf tests and real iPhone 14 Pro Max Safari review. No merge/deploy.
