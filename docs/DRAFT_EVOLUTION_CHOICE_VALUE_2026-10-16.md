# Draft evolution opportunity cost — source-real control study

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


**16 October 2026 · QA-only; not implemented in gameplay.**

## Motivation

L4 Turtle percentage buffs and L4 Assassin pursuit/Shadow Mark modifications failed robust winner and authentic HP-damaging-front controls despite gains in isolated damage or prevention. Rather than continuing numerical tweaks, measure whether a player's *one draft pick* devoted to L3→L4 or L4→L5 evolution has demonstrable team value versus using that choice on a same-family reinforcement or a competing Beetank evolution.

## Experiment

`tools/qa/check-draft-evolution-choice-value.cjs` uses **real, unmodified** `v3/legacy-sim-core.js`, current `ultimate-abilities.js` and `evolution-rules.js`. In each battle, 20 or 40 fighters start deployed (10/20 per team). The nominated team has 3/6 Turtles **or** Assassins at either L3 or L4, and 1/2 Beetanks at the same tier. For each matched seed/opponent mode/population/side mirror, compare:

1. **Hold**: no choice, 3/6 nominated units stay at L3/L4.
2. **Evolve family**: the single nominated fighter family's 3/6 copies advance L3→L4 or L4→L5.
3. **Recruit two**: keep the family's tier and add two more fighters at that tier, growing total active fighters to 22/42.
4. **Upgrade Beetank**: retain the nominated tier, evolve the existing 1/2 Beetank copies instead.

96 matched starting scenarios × 4 choices = **384 complete source simulations**, using 3 counter modes (swarm, backline, armored), two seeds (1337/2017), 20/40 populations and both side mirrors for each role/tier decision. Results include actual terminal winner, attacker-credited real HP by **physical fighter ID** (not unrelated same-type allies), actual post-mitigation/cap Ricochet HP, genuine physically saved immediate allied HP by Guardian **marginal to the strongest otherwise eligible Knight Bastion**, Be(e)tank's own attacker HP, attacker-defender graph persistent independent damage fronts and separated positive damage windows. The observed simulator must have the **same frame-by-frame state SHA** as the original uninstrumented source in seeded controls.

## Read with caution

The game generates variable reinforcement counts and alternative draft offers; **two recruits** is a controlled, plausible example, not a claim every draft will offer two. Upgrading a whole family of 3/6 units versus adding two shifts the quantity/value of the draft choice, and different starting population changes actual outcomes; do not normalize those differences away or claim a generic economics ratio. Beetank evolution only improves 1/2 existing allies here, a deliberate opportunity-cost comparison, not a 1:1 pure strength equivalence.

The goal is evidence of actual **team wins and independent fights**, not a disguised DPS ranking. Rejected abilities are not added to the game. No iPhone 14 Pro Max Safari acceptance is implied by Node. A positive upgrade finding should guide an intentional gameplay prototype; absent such evidence, do not recommend a buff or alter `main`/production.

## Fidelity safeguard: no mixed-tier hidden allies

A draft evolution changes the **entire** chosen fighter family, not just selected copies. To prevent a false advantage in Turtle trials, the 10-unit friendly pattern contains exactly three selected Turtle or Assassin copies and **no additional same-family L4 fighter**; repeated 40-unit rosters have six selected copies. An explicit invariant now checks every own-family copy is in the nominated physical-ID set (plus two extra fighters only for the recruit action). Enemy fighters may independently have their own Turtle or Assassin copies, as normal. This correction supersedes any pending earlier research workflow receipt.
