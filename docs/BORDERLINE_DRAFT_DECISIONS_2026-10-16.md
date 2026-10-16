# L4 borderline evolution choices — source-only controlled research

Date: October 16, 2026. This is a QA study, **not** a released Assassin or Turtle buff.

## Context
The existing 384 real-match same-team opportunity-cost study saturated Turtle outcomes at 8/24 regardless of choice; Assassin L3 to L4 evolved in 5/24 while allied Beetank upgrade won 8/24. Multiple flat buffs and Assassin speed/mark ideas were rejected after true win and damage-front counterchecks.

## Prespecified test
New test script: tools/qa/check-borderline-draft-decisions.cjs. It loads the already-reviewed actual-full-terminal battle and physically attributed HP/Guardian/reflect/connected-damage-front observer directly, with strict exact source anchors. It adds **attacker physical ID, class, defender ID, class and simulation tick** of direct fatal strikes. Raw versus observed RAF SHA parity is checked for all four choices and both family/size combinations.

Each 10-per-side mixed friendly team uses exactly three nominated L3 Assassin or Turtle units, one L3 Beetank, and L4 Knight/Goblin/Barbarian/Goose/Sniper/Mole. For 40 bodies this roster is repeated twice. Opponents are 12 fixed increasingly ranged/armored combinations of authentic roster units, six per counter-track. Each matched fixture compares *hold*, selected family evolution L3 to L4, +2 same-family L3 recruitment, or allied Beetank evolution to L4.

Discovery: 2 families x 2 sizes x 12 enemy rosters x 2 seeds (1337/2017) x both colors x 4 choices = **768 fully terminal variants**. Rank fixed patterns separately per family/size by actual outcome flips among choices, then mixed hold winners. Use only the top two per cell for an **unseen holdout** at seeds 4049 and 9091 with both colors and four choices = **128 more terminal variants**. There are 16 separate full-RAF observer parity pairs.

## Honesty and acceptance
A discovery winner flip does not prove an ability is better generally; use unseen outcomes and meaningful Assassin backline threats or Turtle endangered allies, Knight-marginal saved HP, physical lethal last-hit IDs, actual wins and true independent HP-damaging fronts. A direct kill is not a measured denied enemy shot; kills caused by Ricochet's null-source secondary hurt are not assigned to attacker-led kills. Mirror/seed outcomes are matched simulation observations, not independent game populations. +2 reinforcement may not be an actual offered choice on every round.

**CI evidence pending:** This commit adds a dedicated active Actions job with JSON receipt. No runtime, Ultimate, evolution, UI, 42 pinned PWA resources, main or production edits. Consider novel bounded abilities only if real unseen win distinctions exist without eroding physical fronts/counters; physical iPhone **14 Pro Max** Safari acceptance remains open.
