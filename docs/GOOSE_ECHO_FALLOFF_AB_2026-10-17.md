# Goose Thunder Honk: L4/L5 echo falloff against true battle fronts

October 17, 2026. QA source-only targeted study; not a live ability modification.

## Why
Previous accepted source-only *broad* Goose cascade made first-to-L5 wins 5/8 → 8/8 on original held-out seeds, but reduced genuine independent HP-damage front windows 12 → 2 and separated positive-HP activity windows 99 → 46. The original game goal is a game-changing L4/L5 unlock, with multiple simultaneous entertaining engagements and credible opposing evolutions or ×2 numerical counters. A faster win can lower front counts; measure both, do not treat any number as an absolute pass/fail score.

## Candidate
Original Goose Thunder Honk: 0.18/0.22 radius, stuns 44/64 ticks, 45%/75% damage, no cascade.
Previously tested broad echo: first ring radius .23/.27, up to 5/7; one-hop echo .115/.17, up to 3/5; **every affected unit** stunned 52/82 ticks. Last held-out first L5 reached 8/8 but multi-front damage compressed severely.
New trimmed single-hop design: first ring .215/.245, capped 5/6, stunned 45/64 ticks and deals .62/.88 attack damage; second ring .08/.10 from first victims, capped 2/3, **short stagger only 12/18 ticks** and damage .32/.52. No recursively propagating wave, no global crowd debuff, deterministic nearest distance plus physical-ID tiebreakers. The purpose is spectacular visible echo damage without freezing faraway battlefronts.

## Matched design
20/40 initial bodies, L3→L4 or L4→L5, two original seeds 1337/2017 and **two newly withheld seeds 8303/10111**, blue and red side mirrors. Each group compares existing Goose, accepted broad prototype and trimmed prototype under four source-real conditions: first unlock on one side, matching peer-tier evolution on both teams, doubling only opposing Goose copies, and **doubling the entire opposing army**. Full-army ×2 creates 10 vs 20 or 20 vs 40 rather than 10 vs 13 or 20 vs 26. Exact physical unit count is asserted per match. Additional 3 evolved Goose vs 15 previous-tier enemies to preserve extreme-number exception. 384 main authentic terminal matches +24 exception matches = **408**, plus **12 per-RAF raw versus observed whole-state SHA parity comparisons**.

Report true terminal winners, actual post-cap direct HP by selected Goose and each team, genuine independent positive-HP damaging fronts, separated positive-HP event windows, ticks and severe-number counter outcomes. Do not claim DOM Safari frame-rate performance from Node. If the new echo is sufficiently powerful without invalidating credible counters/fronts, follow with true 80/120/300 population stress and visual/accessibility review before any playable QA patch.

## Status
New exact-head push/PR CI PENDING. No modification to v3/ultimate-abilities.js, base combat, manifests/service-worker, original game assets, main or production. Previously accepted broad source experiment retained unchanged in conditional archive.

## Verified 408-battle three-way Goose result — 17 October

Exact QA b36adbc dedicated [push run](https://github.com/danickman/ShowdownLab/actions/runs/39041535844) **passed** 408 authentic terminal source matches and 12 exact raw/observed RAF state hashes; study artifact 12104511326. Full baseline push/PR workflows may complete later and must be checked separately.

| First-to-tier, fresh 8303/10111 mirror seeds | Existing Goose | Broad stun echo | Trim short echo |
|---|---:|---:|---:|
| L4 wins | 3/8 | 7/8 | 4/8 |
| L5 wins | 3/8 | 8/8 | 5/8 |
| L5 genuine persistent damaging-front windows | 10 | 3 | 2 |
| L5 separated physical-HP damage windows | 86 | 33 | 66 |

Broad wave remains hugely impactful but overly suppressive. Trim wave improves some true HP-damage window coexistence compared to broad, but gives up too much L5 first-unlock value and does not restore persistent positive-HP fronts. Neither candidate approved for playable QA. Equal tier L5 returns 4/8 wins for existing/broad/trim. At the two truly full-army ×2 rosters (10-vs-20 and 20-vs-40), **all three Goose sources won 0/16 held-out**; 3 evolved vs 15 earlier-level troops yielded **0/4 at each tier** across all arms. These are specific mirrored scenarios, not a universal mathematical guarantee of defeats for evolved units.

Next source-only iteration tests a **damage-led shockwave**: first ring still a significant L4/L5 Thunder Honk, one-hop second ring with strong positive HP but a very short 4-tick stagger. Broader damage reach without long mass stun. Two genuinely fresh 15013/19031 held-out seeds, one previously viewed 8303 calibration seed, and real full enemy army x2 as well as family doubling. Compare source actual winners and independent damaging fronts at both tiers, not artificial front flags. Previously accepted Goose A/B moved into conditional historical research workflow so ordinary CI does not repeat 408 exploratory fights on every documentation change.
