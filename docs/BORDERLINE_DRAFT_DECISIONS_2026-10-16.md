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

## Verified completion and gameplay verdict — 16 October 2026

**Exact source QA HEAD:** `8bc4d21aa89c267685e495128bf2e463b8883ea6`. Both [push 38977768668](https://github.com/danickman/ShowdownLab/actions/runs/38977768668) and [PR 38977772560](https://github.com/danickman/ShowdownLab/actions/runs/38977772560) completed **44/44 required jobs successfully**, plus a separately intentionally skipped Knight-art workflow. Full source study passed **896/896 real terminal variants and 16/16 complete observed/raw physics RAF parity pairs**. Saved artifact [borderline-draft-decisions, 12079598696](https://github.com/danickman/ShowdownLab/actions/runs/38977768668/artifacts/12079598696). Original runtime, PWA, main and production unchanged.

Prespecified discover-and-select shortlisted `assassin-20: ranged-1, armored-1`; `assassin-40: armored-1, ranged-1`; `turtle-20: armored-1, ranged-1`; `turtle-40: armored-1, ranged-1`. Separate **unseen** seeds 4049/9091, blue/red mirrors, gave **eight matched scenarios** per role/population:

| Family and population | Hold | Evolve L3→L4 | Recruit 2 | Evolve Beetank L3→L4 | Persistent real damaging fronts, hold→evolve |
|---|---:|---:|---:|---:|---:|
| Assassin, 20 | 3/8 | 1/8 | 4/8 | 5/8 | 7→11 |
| Assassin, 40 | 2/8 | 4/8 | 4/8 | 8/8 | 46→48 |
| Turtle, 20 | 0/8 | **7/8** | 6/8 | 4/8 | **7→3** |
| Turtle, 40 | 3/8 | **7/8** | 4/8 | 6/8 | **43→48** |

Real Turtle Guardian **marginal beyond stronger Knight** prevents 883.99 HP at L4 across the 8 selected 20-body fixtures and 2007.09 HP in 40-body fixtures; bounded Ricochet actually inflicts 849.65 / 1232.73 HP (actual post-mitigation/cap). These are actual physical hit effects, **not** proof that all outcome flips are caused by one Guardian activation versus overall evolution stat progression. 20-body Turtle wins improve but persistent independent fronts decline **7→3**; record the tradeoff rather than claiming a universal victory for stage dispersion. The Turtle L4 role **already works in borderline cases**; no numerical buff or new reactive shell is justified.

Assassin 20-body evolved L4 actually wins **two fewer** than hold in chosen holdout mixtures (3→1), whereas 40-body wins **two more** (2→4). In both, Beetank evolution remains a stronger match winner than L4 Assassin. Assassin evolved true direct HP increases 1813.39→2892.62 (20) and 2551.14→4448.38 (40), yet backline lethal attacker counts do not independently prove shot prevention. Next hypothesis must be specifically *genuine telegraphed Sniper aim or Dragon windup denial* by L4 backstab under real backline threats—distinct from previously rejected generic stun/speed/mark/HP threshold tweaks. Measure how often it would ACTUALLY trigger, interrupted shots, whole-team wins, ranged counters, actual HP fronts and Node 80/120/300 budget **before** shipping any ability.

**Research budget:** After this accepted receipt, full 896-match script moves into conditional `qa-research-archive.yml` (trigger on source changes or research script changes), while ordinary CI retains **128 known-fixture real terminal matches** as `check-borderline-choice-regression.cjs`, with 8 raw-versus-observer per-RAF SHA parity pairs and positive physical Turtle win/protect/reflect plus genuine-front floors. These are **known regression scenarios, not novel holdouts** and may not be re-used as unbiased discovery for an Assassin candidate. Historical trials remain archived and retrigger on actual combat-source changes. CI for this archive/refinement commit must be checked separately.

No Safari acceptance claim: physical iPhone **14 Pro Max**, 430×932 CSS/DPR3, remains OPEN.
