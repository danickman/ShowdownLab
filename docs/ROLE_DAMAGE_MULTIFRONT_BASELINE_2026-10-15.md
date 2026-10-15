# Showdown Lab — B1/B2 role contribution, Assassin access and real fight fronts

**Captured:** 2026-10-15. **Scope:** QA-only, user-authorized investigation of underperforming fighters and actual simultaneous battles. **No gameplay changes in this turn.** Main/production untouched.

## Why this turn follows the performance work

After the collision- and target-bound optimizations, the goal is now **FUN supported by actual combat**: roles must contribute through damage/control/protection, and distinct local fights should be visible rather than fighters merely spreading across a larger canvas. B1 = direct role effectiveness, B2 = damage-positive geographical engagement persistence; B3 = carefully targeted role identity/counterplay; B4 = animations, comic theatre and rewarding gameplay.

Authoritative schedule: [Combat Balance and Multi-front Return Plan](COMBAT_BALANCE_AND_MULTIFRONT_RETURN_PLAN_2026-10-15.md). Latest released baseline remains unchanged; this work is on `qa-turn1-duel-baseline`.

## New reproducible read-only B1/B2 instrumentation

[tools/qa/check-role-fronts-baseline.cjs](../tools/qa/check-role-fronts-baseline.cjs), first commit [`16bde55`](https://github.com/danickman/ShowdownLab/commit/16bde5581bb1a6d262d9e1224c5f506b25ea0d55), seed replication [`1013b8d`](https://github.com/danickman/ShowdownLab/commit/1013b8d90ee479547140028169c958162c6c8e6a), and independent `role-multifront-baseline` CI job [`98e15e4`](https://github.com/danickman/ShowdownLab/commit/98e15e492eecd7df6a29a5bf5ae144971bf280e1).

- Measures **real positive fighter-attributed hit events** from original `hurt()` (attacker, target, role, level, damage, kill and hit location); instruments a read-only end-of-step callback to record the actual action, alive/target/in-range exposure, first hit/attack tick, pursuing fighter opportunities, target changes, stunned and hit-reaction ticks, ability/action names, damage per alive/target tick and contributor participation. Captured changes must prove **exact per-callback full game-state hash equality** with untouched simulator for every scenario.
- Covers **mixed, swarm, heavy, ranged and Assassin-access** roster families at 20/40/80/120; mirrored teams, L1–L5, two seeds for mixed/Assassin-access; limited 180/300 mixed stress observations are explicitly **censored**, never compared to complete match lifetime totals.
- Defines **damage-positive engagement components**, not proximity clusters. For each 30 logical-tick window, connect units only if an actual credited hit occurred between them. To count two concurrent separated *substantial* fights, each component needs at least two hit events and two actors, and their damage-weighted centroids must be separated by at least 0.18 normalized arena distance. Count qualifying windows and *persistent* distinct fights across successive windows only if components still share actors and remain spatially separated. Ranged impacts may connect distant attackers to target victims; stand-off threats, aim animation, and Assassin pursuit by themselves do **not** create phantom fighting components.
- Keep support/control separate from HP damage. Current stun sampling counts **incoming stunned fighter-ticks**, not attributed inflicted stun; future B1 extension should instrument actual origin attribution for Goose/Turtle/Mole/Beetank and Ultimate abilities before ranking support roles as weak. Damage from burn/reflection without an attacker is not credited as a fighter hit. Avoid interpreting `hit` reaction pose or strike animation as proven damage.
- The production PWA, RC4 rules, render, root entry, worker hashes and all unit stats are untouched by these test-only files. GitHub CI may still be queued; do not claim full results from CI before a success receipt.

## Exploratory direct V8 observation — low Assassin damage

An initial direct read-only **8-case, exact sampled-state parity** probe across 40/80 fighters, mixed/ranged/Assassin-heavy families and mirrors, for only **140–200 logical ticks**, observed **zero fighter-attributed Assassin damage in 7/8 cases**. At the same time, Assassin repeatedly stalked and activated vanish while Mole contributed significant attributed damage. This is a **short-window, composition-specific hypothesis**, not a universal balance ranking or per-level normalization. Later 220–280-tick runs did record some Assassin hits.

The current `assassinStep()` code uses `u.x=clamp(t.x+(u.team==='blue'?-.075:.075))` and y jitter `(rnd()-.5)*.10` upon vanish. Blue attacks from the left and red from the right, so the offset returns the Assassin to its **approach/front side** of its opponent, rather than the field-relative rear. Assassin's nominal melee radius is `24/500=.048`, while the original x offset alone is 0.075 even before y jitter and collision separation; thus vanish can require significant extra pursuit before it can hit. It may also face another foe before reaching the target, and is vulnerable during approach. No source stat or teleport behavior changed here.

### Focused matched-source preliminary A/B

A direct V8 probe compared the unchanged source to **three QA-only candidate teleport placements** across six mirrored mixed/Assassin-access cases at 40/80 fighters (240–280 logical ticks, not finished battles).

| Candidate (field-relative x, same or reduced y jitter) | Assassin hits across six cases | Assassin fighter damage |
|---|---:|---:|
| Original toward approaching side, ±0.075 | 4 | 206 |
| Flip direction **only**, rear ±0.075; original jitter | 31 | 1,545.4 |
| Rear ±0.055; jitter .08 | 27 | 1,518 |
| Rear ±0.035; jitter .06 | 30 | 1,639.2 |

These results suggest that the **direction of vanish**, more than the distance of teleport alone, is causing missed rear-access opportunities. But dramatically increased Assassin damage could create an unfair backline assassin meta, and entire battle outcomes/other roles change once a candidate alters targets and hits. In some 40-fighter mirrors the rear-only variant was no better (even fewer hits). No candidate is approved for the game yet.

A distinct six-case *same-direction but closer* test improved Assassin damage in five matched cases and left one unchanged. That supports reach as a secondary factor, but the rear-direction-only candidate is cleaner for attributing cause.

## Reproducible B3 design experiment and next acceptance gate

[tools/qa/check-assassin-rear-study.cjs](../tools/qa/check-assassin-rear-study.cjs), commit [`3c8e9d9`](https://github.com/danickman/ShowdownLab/commit/3c8e9d955e57647a80a1b8a4965f983c1bff20f6), independent `assassin-rear-opportunity-research` job [`ce09b69`](https://github.com/danickman/ShowdownLab/commit/ce09b69707f6f0edde103094b7a0eca43fc9a86e). Tests the three alternate placements against unchanged Assassin, using 40/80/120 fighters, mixed/Assassin-access/ranged families, mirrors, two seeds where practical, L1–L5, per-role damage share, credited hits, kills, vanish→field-rear/attack-range feasibility, backstab actions, both teams' live bodies/HP and winner/censored status. An instrumented control must produce **bitwise-identical** callback traces to untouched RC4. All gameplay-changing candidate executions remain isolated to QA.

**Next decisions (do not skip):**

1. Confirm complete B1/B2 independent CI receipt; rank role contribution per alive/target exposure and distinguish low damage from useful protection, control or late attack timing. Repeat alternative seeds and full battles for meaningful outcomes; do not infer win rates from 200-tick samples.
2. Determine whether true separated damage-producing fronts persist across midfight windows and visibly occupy more of the arena; choose only one formation/target access variable for an isolated candidate. Compare heavy formations as well as 80+ mixed battles.
3. Accept an Assassin teleport proposal only if it improves attack opportunity without trivializing Sniper/Dragon protection or turning Assassin into a high-DPS uncounterable backline killer. Include pure and mixed rosters, mirrored seeds, L1/L4/L5, hit conversion, counterplay, fair team wins, actual 300-fighter performance, 430×932 DPR3 browser visuals and full RC4 role/offline release checks.
4. Keep the comic spectacle plan linked to **actual hits and Ultimates** (rear vanish tell, satisfying backstab impact, readable defeat/knockback, multiple visible micro-battles), not misleading cosmetic fighting while fighter damage remains zero.
