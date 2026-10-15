# Showdown Lab — scheduled return to combat balance, actual fronts and fun

**Decision date:** 2026-10-15. **Status:** Approved product direction and turn-gated work queue, NOT an implemented combat rebalance. **Branch:** `qa-turn1-duel-baseline`; no merge/deploy without user approval.

## Why this is not optional polish

The large-battle presentation should deliver **multiple real fights around the arena**, with visible damage, consequences, meaningful evolved abilities, complementary roles and tactical responses. More separated fighters or a larger contact-component count alone is NOT success. Recent effective-engagement QA observed low Assassin fighter-attributed damage in certain 40–120 mixed compositions despite substantial pursuit, including **0 versus 120 units of damage** in the two mirrored 120-fighter trials over 448 logical ticks. That is a prompt to investigate real engagement opportunity and role contributions, **not proof that Assassin is globally too weak**. Other low-contribution roles must be investigated before buffing anything.

Performance is part of the gameplay requirement: big groups and 10× shouldn't turn a comic spectacle into seconds-long main-thread stalls. Finish the safe, provably equivalent CPU optimizations first. **Return to the following playability work immediately after one bounded performance-and-browser validation turn**, not at an indefinite future date.

## Turn sequence and acceptance gates

### Turn P — finish current collision/target optimization and measure actual renderer

- Current target-bound1 nearest optimization: independent 40/80/120/180/300, 1×/10× mirrored ABBA + 12 long parity tests passed **before QA integration**; post-integration full tests and browser/worker gates must pass.
- Evaluate `collision-coarse-bound-research` as the next candidate, against **shipped target-bound1**, with 2/4/10/20 small fights, 40/80/120/180/300, 1×/10×, mirrored plus later-stage seed parity. Do not combine unverified changes. If it passes with meaningful speed gain, integrate on QA only, bump canonical root version and all 42 worker SHA-256 entries, run offline-update and full browser regression.
- Record real Chromium 430×932 DPR3 live 40–300 p50/p95 simulation/RAF/Canvas samples, early intact 300-deploy picture, and 10× responsiveness. Separate synthetic Node and Chromium readings from actual Safari device tests.

### Turn B1 — baseline **effective fighting**, not nearest-neighbor geometry

- Repeat matched seeds and mirrors at **20/40/80/120** plus early-censored **180/300**, L1–L5 representative formations, at least a pure melee, ranged-support, swarm, heavy/single-boss and mixed roster family.
- Per role and per level: unit-time alive, eligible enemy-target-time, **attempted actions**, actual positive credited damage, hits per opportunity, time to first damage, kill participation, effective damage per surviving fighter-tick, wasted pursues/target switching, stuns/mitigation and ultimate capability activation. Avoid treating all support/control as zero value simply because no fighter-sourced HP reduction occurred.
- Specifically measure **Assassin**: travel and rear access, vanish/backstab triggers, approach-to-hit conversion; **Sniper**: aim continuity/shot or melee fallback; **Dragon**: cone windup/true multi-hit; **Turtle/Knight/Beetank**: guarding, time under threat and control (not just DPS); **Goblin/Goose**: pack support and disruption; **Mole/Barbarian**: burrow/cleave and uptime.
- All data read-only in QA. Replay cases and snapshots must be deterministic. Propose hypotheses, not buffs, until replicate runs show a pattern.

### Turn B2 — are multiple battles **actually happening**?

- Track actor/target **damage-positive engagement edges** and their continuity over time; group interacting fighters into active components by actual attacks/damage/threat, **not simple contact radius**. Count simultaneous independent active engagements; report width/height/arena sectors, persistence, cumulative damage, participating sides, front handoffs and locally threatened defenders.
- Consider ranged Sniper/Dragon impacts and Assassin pursuit as **separate supporting signals**—do not count aim/closing alone as a real battle. A team that is visually dispersed yet cannot damage or control the opponent fails. A single large energetic melee may be legitimate, but it should not leave most combatants idle.
- Compare baseline with temporary diagnostics/target or spawn/formation A/B, **one variable per experiment**, preserving storyful clashes, heavy-vs-heavy opportunities, swarms that may group on vulnerable targets, exposed backline counters and threat urgency. Never activate the rejected proximity-only global Engagement Director.
- Capture actual authored-sprite visual evidence (portrait 430×932, 20–120 fighters) during **damage-positive midfight**, not just initial deployment; check readability, occlusion, all arenas and meaningful occupation of the floor.

### Turn B3 — narrowly improve weak roles and counterplay

- Rank replicated low-contribution outcomes with **why**: target unreachable, engagement slot contention, excessive detour, too-long cooldown, ability not triggering, low damage per successful hit, front protected too well, or too much friendly competition.
- Prioritize mechanics/target-opportunity fixes and distinct role identity ahead of generic HP/DPS buffs. Test **Assassin rear access/backstab**, Sniper standoff/reload and Dragon cone as targeted A/B if evidence supports it; assess underperforming infantry/tanks on mitigated damage, objective protection and vulnerability counters.
- Use mirrored random seeds, matched formations at L1/L4/L5, avoid invulnerable/stale or unkillable pairs; require opponent responses and counterplay, no single overpowered dominant role, and exact 300-fighter performance gates for each proposed change.
- Update Fighter Guide role descriptions and L4/L5 ability text whenever actual mechanics change; avoid synthetic stats in marketing/UI.

### Turn B4 — fun, rewards and battle theatre

- Once B1–B3 evidence supports strategic effectiveness, improve *player-perceivable* multi-front theatre: distinct hit reactions and impact locations, readable spell/ultimate payoffs, comic damage bursts and defeats, battlefield marks, crowd silhouettes/halos, pacing/zoom, audio/cues and rewards reflecting meaningful tactical outcomes.
- Improve mode-specific gratification (Quick Match speed and clarity; Draft consequential choices and counterpicks; Ultimate Lab experimentation and choose-enemy support). Preserve authored sprites, sunny readable arenas, portrait first.
- Compare a small set of human-playtest-like scripted battle stories for comprehension and delight, plus screenshots/video and representative client iPhone Safari QA before production.

## Definition of done

A successful release must show that several **persisting, damage/control-positive** fights actually take place across the field when both teams have enough fighters; role contributions are understandable and credible; evolutions materially change the match; low-damage roles can achieve their intended jobs; decisive counterplay exists; and 40–120 battles remain smooth on the target phone with safe 180–300 extremes. A larger painted arena, higher raw contact count, or fabricated FPS doesn't count.

Every turn: write baseline vs candidate results in `docs/QA_IMPLEMENTATION_HANDOFF.md`; maintain `docs/ROADMAP.md`; preserve RC4 seed reproducibility and root-only PWA/offline integrity; do not merge or deploy without approval.

**Execution update (Oct 15):** B1/B2 QA scripts and CI are committed (pending runner), with preliminary actual hit-front results and an apparent wrong-side Assassin vanish offset discovered. A separate four-way Assassin source A/B is test-only; do not promote before full matched seed/role/counterplay validation. See [B1/B2 initial findings and Assassin rear QA](ROLE_DAMAGE_MULTIFRONT_BASELINE_2026-10-15.md).

**Execution October 15:** B3 has advanced beyond diagnostics: Assassin's sign-only rear-placement correction is in the QA runtime behind complete release/counterplay gates. Further real duel testing identified geometric reach deficit for several melee roles against large collision bodies. Independent L1/L4/L5 contact-reach A/B is ongoing; no reach change accepted or deployed. See [Melee Contact Reach & Battle Access](MELEE_CONTACT_REACH_AND_BATTLE_ACCESS_2026-10-15.md) and [Role Damage and Real Multi-front Baseline](ROLE_DAMAGE_MULTIFRONT_BASELINE_2026-10-15.md). B2 actual battle persistence and B4 theatre remain active product outcomes; do not substitute mere fighter separation for hits.

**October 15 next B3 subturn:** Knight contact-reach correction shipped **QA branch only**: new `knight-contact1` offline version/42 hashes and role-specific regression tests. Direct L1/L4/L5 heavy matchups showed Knight now lands real hits without weakening same-size duel parity; 40/80-fighter heavy/mixed effects were heterogeneous, so front persistence and role fairness are still active constraints. Goblin and Beetank contact work remains isolated QA-only. Independently check 300, browser and release gates before production; see [Melee Contact Reach](MELEE_CONTACT_REACH_AND_BATTLE_ACCESS_2026-10-15.md).

**Execution update October 15:** B3 Goblin conditional melee-contact reach is now integrated *only on QA*. All 26 jobs of pre-integration [38692131369](https://github.com/danickman/ShowdownLab/actions/runs/38692131369) completed green/intentional skip; independent 72-pack counterplay proves real hits without defeating same-sized heavy defenders. Post-integration suite still pending, no merge. B1/B2 next priorities: measure support/control and actual sustained dispersed damage fronts at 20–40, and make active hits more theatrically visible. See [Melee Contact Reach](MELEE_CONTACT_REACH_AND_BATTLE_ACCESS_2026-10-15.md).
