# Draft evolution opportunity cost — source-real control study

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
