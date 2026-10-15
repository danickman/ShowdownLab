# Showdown Lab — melee contact-reach and actual battle participation

**Research date:** 2026-10-15. **Status:** **Knight contact reach integrated on QA branch only**; Goblin, Beetank and other candidates remain **research-only**. Branch `qa-turn1-duel-baseline`, no production deployment. Assassins' sign-only rear teleport is independently integrated for QA behind its own gates.

## Finding: authored visual spacing and physical attack reach do not always meet

The rich RC4 renderer and collision solver maintain role-specific visual separation:

- `bodyRadius(u) = (.014 + u.r/1300) * (HEAVY ? 1.16 : 1)`.
- `visualSpacingRadius(u) = bodyRadius(u) * (wide ? 1.34 : heavy ? 1.26 : 1.18)`.
- Cross-team standing collision distance is `visualSpacingRadius(a) + visualSpacingRadius(b)`.
- Ordinary melee target-step logic subtracts only `(.22 * (bodyRadius(a) + bodyRadius(b)))` from geometric distance, then compares against `a.range/500`.
- If the **standing adjusted collision distance exceeds nominal melee reach**, the attacker needs extra compression/overshoot, charge, knockback movement or another ability before it can land a normal strike. This is a geometric opportunity gap, not proof an attacker can never hit in a dynamic fight. Turtle already uses a documented `contactReach` override to avoid a Turtle-versus-Turtle stalemate.

At the *resting* cross-team collision boundary, the following melee roles fall short of their nominal ranges (normalized arena units). Computed from the actual current `DEF` roster, `bodyRadius` and `visualSpacingRadius`, not approximate sprites:

| Role | vs Beetank | vs Turtle | vs Dragon |
|---|---:|---:|---:|
| Knight | 0.0047 | 0.0037 | 0.0067 |
| Goblin | **0.0111** | **0.0101** | **0.0130** |
| Assassin | 0.0038 | 0.0028 | 0.0058 |
| Beetank | 0.0064 | 0.0054 | 0.0084 |
| Mole | 0.0053 | 0.0043 | 0.0073 |
| Goose | **0.0118** | **0.0108** | **0.0138** |
| Barbarian | 0 | 0 | 0 |
| Turtle | 0.0114 nominal | 0.0104 nominal | 0.0134 nominal |

**Note:** Turtle values are nominal differences only: `turtleStep()` already widens its allowed attack radius with `contactReach`, unlike most others. Normal Assassin melee uses raw target center distance in `assassinStep()` rather than the main melee's 0.22 body-radius correction; it also has a newly restored field-rear vanish in QA, so its opportunities require a separate controlled experiment and should not be lumped into a blanket buff.

Additional warning: Goose nominal reach is short even against Knight (~0.0002 margin). This may be offset by its non-damage honk, stuns, scampers and ultimate; Goose cannot be ranked on credited HP damage alone. Swarm-vs-heavy hits should still be possible and offer deliberate counterplay.

## Early observed 1v1 evidence, *not yet CI confirmed*

A direct V8 test instantiated the exact real QA RC4 with source-only variants (no runtime modification), L1 per side, symmetric mirrored teams, seed 1337, up to **850 logical ticks** at 10×. Each candidate changes `const r=u.range/500` only inside **one role's attack routine** to:

```js
const r = Math.max(
  u.range / 500,
  visualSpacingRadius(u) + visualSpacingRadius(t)
  - (bodyRadius(u) + bodyRadius(t)) * .22 + .002
);
```

No fighter coordinate, collision impulse, game speed, damage, armor, cooldown, L4/L5 special rule, or other role's attack range changes. Since the added amount is limited by actual cross-team visual collision reach, the intention is to make ordinary attacks possible **once a fighter has physically reached the target** without letting a distant melee combatant magically hit through a crowd.

| Attacker vs target | Original real hits | Candidate real hits |
|---|---:|---:|
| Knight vs Beetank | 0 / 0 | 4 / 5 |
| Knight vs Dragon | 0 / 0 | 8 / 8 |
| Goblin vs Beetank | 0 / 0 | 1 / 1 |
| Goblin vs Turtle | 0 / 0 | 1 / 1 |
| Beetank vs Beetank | 1 / 4 | 4 / 2 |
| Knight vs Knight | 17 / 16 | 17 / 16 (**exact unchanged**) |
| Goblin vs Goblin | 4 / 5 | 4 / 5 (**exact unchanged**) |

Slash-separated counts are mirror 1 and 2, respectively. The inconsistent Beetank mirror is a reason to **keep the Beetank trial experimental**, not to claim all heavies are fixed. Knight and Goblin smaller-opponent matches being bitwise unchanged is a desirable invariant. In actual matches, a slightly wider attack reach can change target deaths, ultimate timing and entire team outcomes, so only mirrored/seeded counterplay metrics can decide adoption.

## Reproducible QA and required gates

- Added [`tools/qa/check-melee-contact-reach-study.cjs`](../tools/qa/check-melee-contact-reach-study.cjs) [`7534a97`](https://github.com/danickman/ShowdownLab/commit/7534a97345860d638f492f56e404061bfadf0466), `melee-contact-reach-research` GitHub job [`aadc818`](https://github.com/danickman/ShowdownLab/commit/aadc8187fcf33c61555fe65fe9bc69136a855abd), first workflow [38689523789](https://github.com/danickman/ShowdownLab/actions/runs/38689523789) **queued when documented**.
- Test reads exact game geometry source and DEF stats and **fails on source drift**, validates the original uninstrumented versus observed state digest, repeats **12 1v1 pairings at L1/L4/L5, 2 seeds, 2 mirrors (144 duels)** comparing original and each relevant role-only candidate (288 duel simulations); retains both teams' damage, HP, winners and censor labels. Confirms exact full-state parity on Knight-vs-Knight, Goblin-vs-Goblin and Beetank-vs-Goblin where role contact reach should be identical to original. It also explores combined candidate across mixed and heavy **40/80/120** armies with two seeds/mirrors (24 matched A/B scenarios), but **combined changes are for measurement only**.
- Distinct mechanic: **Assassin rear-side vanish** was shipped into QA game at [`3366306`](https://github.com/danickman/ShowdownLab/commit/336630656c0ae265de1186683cd8ef286cc52c22) in response to 24 seed/mirror trials showing 20 of 24 had increased attributed Assassin damage and 40 versus 26 corrected persistent damage-front windows in total. Root `?v=assassin-rear1` [`250e0bb`](https://github.com/danickman/ShowdownLab/commit/250e0bb0d33131a38238d4ac48ba10124ea06642), 42 SHA256 offline pins/cache [`8f9bab4`](https://github.com/danickman/ShowdownLab/commit/8f9bab4825c290ca986101139fde4ae902a53b2b), corresponding two mirrored Assassins A/B harnesses changed to **reconstruct prior original** before comparing the current shipped candidate. Previous `target-bound1` and `coarse-bound1` CPU filters were retained.
- A future gameplay reach change must pass **real** 40/80/120 battle contribution per role/level and opponent response, L4/L5 matchup, no new stalemates, 300 fighter 1×/10× performance, canonical 42-entry offline SHA and root-only PWA, portrait Chromium QA and authored art/spectacle. **Do not automatically activate the combined candidate or alter Assassin range.**

## What is next for gameplay quality

1. Complete post-`assassin-rear1` full QA and analyze the Assassin rear/defender outcomes. Revert on failures; do not equate a QA-branch trial with a production release.
2. If the contact-reach A/B demonstrates stable role-specific improvement without dominant swarms, try **one melee role at a time** on QA. Knight versus heavies is a promising first limited improvement because normal Knight-vs-Knight play is unaffected. Goblin versus tanks needs especially careful swarm scaling.
3. Beyond access, improve **persistent actual damage-positive fronts**. Differentiate independent sustained attacker-target graph components from short scattered hits and physical proximity. Work with [B1/B2 role and multi-front findings](ROLE_DAMAGE_MULTIFRONT_BASELINE_2026-10-15.md) before deciding any target/formation steering. Avoid resurrecting the previously rejected global Engagement Director.
4. Add player-visible comic impacts, readable multi-front action, Ultimates and rewards **after** real role opportunity improves. This is an action game; successful local engagements must be both tactically meaningful and visually comprehensible.

**Release boundary:** All above is QA branch work; `main`/production remain unchanged until explicit user authorization.


## October 15 later turn: Knight-only access fix implemented on QA, no other melee buffs

**Source:** `v3/legacy-sim-core.js` [`9cf6263`](https://github.com/danickman/ShowdownLab/commit/9cf62635b98e9ce64281d888b90edb1341693db8). Only Knight's effective attack-reach calculation changes from `r=u.range/500` to `r=Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002)` inside `knightStep()`. Same body positions, collision impulses, team roles, armor, damage, ability multipliers, cooldowns, and Knight charge/guard rules. For targets already inside Knight's nominal range, the rule is unchanged.

**Browser/offline assets:** `index.html` now references `/v3/legacy-sim-core.js?v=knight-contact1` ([`9815c07`](https://github.com/danickman/ShowdownLab/commit/9815c07e6d6de74262a4be6e22d28257ec3deb35)); `sw.js` cache is `showdown-lab-release-knightcontact1` with all **42 SHA-256 entries** verified/recomputed from the prior root/core ([`75c7a28`](https://github.com/danickman/ShowdownLab/commit/75c7a28650728184b58aaabb3a830b4fdca09f90)). Root HTML's exact runtime scripts matched the new SW RUNTIME list. `main` untouched.

**Direct V8 candidate validation before promotion:**
- 30 mirrored L1/L4/L5 Knight duels, 900-tick cap: Knight-vs-Beetank, Turtle and Dragon baseline normal hits **0** in every tested mirror/level; with corrected reach Knight hit **3–15 times**, varying by foe/level. Knight-vs-Knight and Knight-vs-Goblin were **exactly unchanged** in all tested sample outcomes.
- 10 representative 40/80/120 (mixed/heavy/swarm) mirrored direct 152–850-tick probes showed early large armies sometimes entirely unchanged, while 40-heavy later trials showed Knight attack opportunity improving; others had less change.
- A further **16 matched 40/80 mixed/heavy scenarios**, two seeds and both team mirrors at **470–850 logical ticks**, had aggregate fighter-attributed Knight damage **6,957.2 baseline → 7,779.9 candidate** (about +11.8% for THIS selected sample). **5** cases improved, **2** decreased and others unchanged. Corrected persistent damage-positive multi-front windows summed **67 → 71**, with **3** cases improving separate fight windows and **2** worsening. This is emergent match timing; not a guarantee of stronger Knight across all matches or persistent front stability.
- 12 separate direct simulation smokes at 120/180/300 fighters, 1× and 10×, two mirrors: all simulation positions/HP were finite; 300 at 10× progressed 50 ticks in a short bounded smoke. Directional Node V8 callback timings were mixed and are not physical iPhone Safari results.

**Release tests:** `tools/qa/check-melee-contact-reach-study.cjs` [`9061f41`](https://github.com/danickman/ShowdownLab/commit/9061f418dcd436b87b79f0923dc2ce7262d105d6) now asserts that the **real shipped Knight implementation** is present, reconstructs the previous nominal Knight reach as control, and leaves Goblin/Beetank variants isolated. Added explicit defect regression [`53fb5c1`](https://github.com/danickman/ShowdownLab/commit/53fb5c16c4668834d6b2af1892e3baedd100a0b5): L1 Knight-versus-Beetank/Turtle/Dragon must go from **zero** baseline positive hits to **two or more** within 850 ticks, plus exact unaffected light-duel trace parity. Full current GitHub Actions suite (including browser PWA/offline integrity, extreme 300, role-effective damage and control, and Assassin fair matchups) **still queued or cancelled as superseded** at this checkpoint; **not green** and absolutely not cleared for merge or production.

**Next combat turn:** Establish independent CI success and portrait browser performance. Then evaluate Goblin reach separately, particularly that a **swarm of Goblins must not trivialize Beetank/Turtle/Dragon**, while handling Mole, Goose and Assassin with role-specific counters rather than granting a blanket universal melee buff. In parallel, aim to improve **persistent actual damage-positive engagements**, not just separated positional sprites, then theatrical hit feedback and mode reward choices. Do not reintroduce rejected global engagement-steering logic.


## October 15 — Goblin-only contact reach integrated on QA after all 26 CI jobs completed

**Verified pre-integration full suite:** [Run 38692131369](https://github.com/danickman/ShowdownLab/actions/runs/38692131369) completed **25 SUCCESS + one intentionally skipped**, **zero failures**; includes the previously failing old stress5c reconstruction (repaired), offline integrity/root launch, all density/portrait browser gates, 300 fighters, complete role + damage-positive fronts, Assassin counterplay and isolated Goblin heavy study. This validates `knight-contact1`, not the later `goblin-contact1`, which requires its own full run.

**Goblin study independent CI result:** `goblin-heavy-counterplay` passed source A/B with exact original/instrumented parity and light-fighter trace conservation. The candidate is conditional: `gap=visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22; r=gap>u.range/500?gap+.002:u.range/500`. Thus when physical resting collision gap is **already inside Goblin's nominal range**, code uses original `r` exactly, not unconditional `+0.002`. No Goblin damage, HP, cooldown, speed, dodge, crit probability or visual collision changes. Exact small-duel/light swarm traces remained equal.

- **18 selected L1/L4/L5 heavy 1v1 tests:** baseline **0** credited Goblin-on-heavy hits; candidate **12**; all **18** heavy defenders survived, same as control.
- **72 Goblin pack-versus-heavy trials:** baseline **0** credited heavy hits, candidate **750** across independent cases. At the tested censor/terminal endpoints, **480 defender bodies survived** under both variants; summed residual defender HP decreased from **233,625.2 → 223,724.5** as expected for actual Goblin attacks, without eliminating heavy army counters. These are pooled across varying swarm sizes/seeds/levels, **not one 750-hit match**.
- **12 small-opponent duels:** Goblin damage **675.3 → 675.3**, no trajectory drift; **24 swarms versus Knight:** damage **2,400.8 → 2,400.8**, exact trace parity.
- **40/80 mixed and counterplay cases:** 40 unit 598.7→713.1 attributed Goblin damage and 80 unit 1,270.3→1,499.6, in a limited matched synthetic trial. At 120, early censored windows showed zero from both candidates, **not evidence that Goblin remains useless in full 120-fighter matches**. One 80 scenario worsened individual Goblin damage as entire combat timing changes.
- **Dragon keeps its ranged/superior-body counter:** in two illustrative 12v12 Goblin-versus-Dragon early-censored runs, neither source achieved an actual Goblin hit, despite contact correction. Do not promise general Goblin viability or fairness until varied complete match outcomes and cross-role utility are measured.

**Promoted to QA branch ONLY:**
- `v3/legacy-sim-core.js` [`8b73e7e`](https://github.com/danickman/ShowdownLab/commit/8b73e7efd13be1299f4738f377bcaf145177209f): exactly one Goblin `r` expression changed, conditional on physical standing collision gap being greater than nominal range. Knight's `knight-contact1`, Assassin's rear teleport and both collision/target fast filters untouched.
- Root `index.html` `/v3/legacy-sim-core.js?v=goblin-contact1` [`a29a447`](https://github.com/danickman/ShowdownLab/commit/a29a447d5821592ce02bef0588ce4a61593250e9).
- SW `showdown-lab-release-goblincontact1` [`18a8a21`](https://github.com/danickman/ShowdownLab/commit/18a8a21d73fa4230d5f10eb4bd647eb01f58ec34), **42 exactly repinned SHA-256 digests**, previous source/root pins verified and new RUNTIME list equal to canonical root script references.
- `check-goblin-heavy-counterplay.cjs` [`04a26b4`](https://github.com/danickman/ShowdownLab/commit/04a26b4598870fe9572a5c1edbbd847166bcc960) now asserts actual shipped Goblin source and reconstructs previous nominal-contact runtime; fails if anchoring drifts. Added product regression [`97f8a8a`](https://github.com/danickman/ShowdownLab/commit/97f8a8a31de0a4f46db55312e74608960e2c24ab): L1 mirrored Goblin vs Beetank/Turtle **must land >0 hits**, must preserve L1 heavy duel winner, 6v6 Goblin pack must hit but all six armor defenders survive, and all light-target full-state traces stay identical.
- Cross-role `check-melee-contact-reach-study.cjs` [`8babc6c`](https://github.com/danickman/ShowdownLab/commit/8babc6c32642b228904066fb707ecb71fdfcccce) reconstructs the pre-Knight/pre-Goblin original independently, exposes Knight-only and Goblin-only current source variants and retains **Beetank-only unshipped candidate** separately. It prevents false CI anchor failures after legitimate game promotion.

**Next:** The complete **post-Goblin integration** GitHub Actions suite must pass (including `node-regressions`, root offline integrity, 300 1×/10×, iPhone portrait browser and all role/target counters). No production/main deployment. Move into **actual ongoing multi-front battle persistence, Goose/Turtle control value and Mole role dominance**, not an open-ended procession of source-only perf optimizations. The user's goal is real simultaneous fights across the floor, readable payoffs, strategic counterplay, and an addictive comic theater.
