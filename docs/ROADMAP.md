## Package 15 — Arcade Flow & Spell Spectacle
Status: **RC candidate**. Adds a 4-second Quick Showdown intermission with REINFORCE / WILDCARD / EVOLVE choices, plus a second-generation spell presentation pass for ARC, BLOOM, QUAKE and AEGIS. Spell rendering now scales more visibly with tech while bounding sampled visual targets in large fights.


## Package 14 — Visual Overdrive RC
Status: **RC candidate**. Scope includes power-scaled spell spectacle, Upgrade Bay economy clarity, full 10-fighter redraw/polish, material-aware combat impacts, battle staging/performance refinement, progression theatre, fighter-specific battle personality, and reward-key reload hardening. Automated RC evidence is recorded in `docs/TEST_MATRIX.md`. Manual phone visual/tap QA remains post-deploy.
# Showdown Lab — Execution Roadmap & Milestone Tracker

Status: **ACTIVE PLAN — Package 13 RC candidate**
Protected combat baseline: **RC4 rich combat core**

This is the operating plan for future work. Its purpose is to replace free-form iteration with bounded, testable milestones.

## North star

Build a community-friendly auto-battler inspired by the strengths of Draft Showdown while remaining its own game.

The target is **capability and experience parity, not asset or aesthetic cloning**:
- satisfying draft → battle → reinforce/evolve → repeat loop
- distinct units with readable behaviors and counters
- escalating army progression across a match
- strong mobile presentation and combat readability
- sandbox/Lab experimentation
- replayability through roster breadth, drafting variety, progression and deterministic battle systems
- original Showdown Lab presentation, characters, balance and systems

Draft Showdown remains a benchmark for polish, clarity and loop quality. Do not copy protected art, audio, UI assets, exact character designs or proprietary content.

## Guardrails

1. **RC4 combat core is protected.** Do not rewrite v3/legacy-sim-core.js casually.
2. Presentation work belongs outside the combat core unless a gameplay change is explicitly approved.
3. Preserve terminal-state fixes and canonical results flow.
4. Prefer one bounded milestone/branch over many tiny production commits.
5. Every meaningful release gets a version badge, test checklist, frozen head and one deliberate deployment attempt when rate limits are sensitive.
6. New units must be behaviorally distinct, not stat reskins.
7. Extreme Lab density may reduce effects, never silhouette/readability first.

## Current state

Working:
- 10 primary fighters: Knight, Sniper, Goose, Dragon, Assassin, Beetank, Mole, Turtle, Goblin, Barbarian
- RC4 rich behavior set
- lives, reinforcement and evolution round loop
- four procedural arenas
- 1× / 2× / 4× / 10× speed
- ARC / BLOOM interventions plus unlockable Quake / Aegis spell system and spell tech
- differentiated Lab presets with free evolution, mastery, spell-tech and spell-unlock sandbox controls
- geometry-first comic character renderer
- Visuals 11 skyboxes, comic FX, round ceremony, progression previews, arena escalation, clutch-state storytelling, team banners, ambience and result framing
- art-preview contact sheet / battlefield-scale / silhouette QA page

Unfinished/risky:
- Package 13 requires production/device playtest after RC deployment
- Results → NEXT SHOWDOWN reset needs regression
- Lab rematch lives behavior needs regression
- cooldown UI on quick rematches needs regression
- Boss Hunt is not yet a true boss ruleset
- only 10/26 primary units implemented
- full L5/L10 evolution system not implemented
- external authored art pipeline not selected
- Daily Challenge, battle codes, saved armies, persistence/settings and full feature parity are incomplete
- accessibility, offline/PWA, device hardening and profiling are incomplete

# M0 — Visuals 11 validation

### Turn 0.1 — Production smoke
Home → Draft → Ready → Battle → between-round choice → next round → match result. Test one win and one loss. Confirm no zombie/stalled battles.

### Turn 0.2 — Visual readability
At 2× and 4× verify fighter distinction, Dragon vs Barbarian, Turtle identity, comic density, skybox contrast, HUD readability and final-KO drama.

### Turn 0.3 — Progression
Run 5+ rounds. Verify reinforcement deltas, evolution preview, life pips, next-arena label, army identity and visible higher-level geometry.

### Turn 0.4 — Edge regression
NEXT SHOWDOWN, REMATCH, all Lab presets, 10× termination, ARC/BLOOM independence, pause/resume and speed switching.

**Gate:** P0/P1/P2 defects are fixed before feature expansion.

# M1 — Stabilize v3 gameplay shell

### Turn 1.1 — State/lifecycle cleanup
Fix confirmed results/rematch defects, document/remove dead adapter variables, clarify phase ownership, add small transition invariants.

### Turn 1.2 — HUD/control semantics
Consolidate duplicate state communication, finalize lives presentation, reset cooldown visuals correctly, normalize speed semantics.

### Turn 1.3 — Lab mode definition
Formalize Duel, Horde, Crossfire, Boss Hunt and optional Chaos. Either implement true boss rules or rename Boss Hunt.

### Turn 1.4 — Deterministic regression harness
Fixed seeds; assert termination, no immortal units, single terminal emission and clean repeated rematches.

# M2 — Decide long-term art path

### Turn 2.1 — Geometry ceiling test
Score the first 10 on silhouette, personality, small-scale clarity, action readability, evolution readability and perceived production quality.

### Turn 2.2 — External art spike
Generate **one original Showdown Lab fighter only** (Knight or Goose), transparent background, consistent camera angle, readable at 40–60 px. Integrate through asset-renderer with geometry fallback.

### Turn 2.3 — Animation strategy spike
Compare:
A. authored body + procedural motion/FX
B. 3–5 authored pose frames
C. sprite sheet
D. geometry-only

### Turn 2.4 — Art-path decision
Choose Geometry-first, Hybrid or Authored Sprites before scaling art production to 26.

# M3 — Character progression system

Product contract:
- L1–4 base development
- L5–9 evolved form
- L10 ultimate

Visuals 11 level geometry is prototype presentation, not the final progression contract.

### Turn 3.1 — Progression data model
Define level, form, gameplay modifiers, visual form, scale/effect overrides and signature-ability changes.

### Turn 3.2 — One L5 evolved unit
Knight or Goose end-to-end. Must alter silhouette and at least one meaningful gameplay property.

### Turn 3.3 — One L10 ultimate
Rare, unmistakable and not merely larger.

### Turn 3.4 — Progression UI
Reveal ceremony, pre-commit preview, results history and roster next-form display.

### Turn 3.5 — Scale to first 10
Only after the system proves stable.

# M4 — Full 26-unit roster

Remaining 16: Snail, Engineer, TNT, Merlinor, Archer, Spartan, Bloodvine, Whelp, Sixshoot, Parasite, Cowboy, Agent, Villain, Totem, Spider, Captain.

### Turn 4.1 — Artillery wave
Snail, Merlinor, Bloodvine.

### Turn 4.2 — Ranged wave
Archer, Whelp, Sixshoot, Cowboy, Agent. Each must differ meaningfully from Sniper.

### Turn 4.3 — Utility/support wave
Engineer + Turret, Totem, Spider + broodlings.

### Turn 4.4 — Burst/control wave
TNT, Parasite, Captain.

### Turn 4.5 — Frontline specialist wave
Spartan, Villain.

### Turn 4.6 — 26-unit integration
Draft pool, opponents, Lab, roster, role metadata, contact sheet and small-scale QA.

### Turn 4.7 — Balance smoke
Seeded match matrix to find obvious domination/failure. Do not chase perfect balance yet.

# M5 — Feature/capability parity

Goal: move from vertical slice to credible community fork/successor experience.

### Turn 5.1 — Saved armies
Save/load/edit/quick deploy with migration-safe schema.

### Turn 5.2 — Battle codes
Encode seed + army + levels + mode for deterministic sharing/replay.

### Turn 5.3 — Daily Challenge
Deterministic daily seed, constraints, result summary and local completion.

### Turn 5.4 — Meta-progression decision
Choose match-only evolution, persistent unlocks/collection, or sandbox/community-first. Do not bake monetization assumptions into core architecture.

### Turn 5.5 — Settings/accessibility
Reduced motion, FX density, color-safe team cues, text sizing where practical, sound controls if audio exists, persistent speed.

### Turn 5.6 — Advanced Lab
Arbitrary Blue/Red armies, levels/forms, seed, lives, speed, arena, density and deterministic replay.

### Turn 5.7 — Results/stat depth
Damage, damage taken, KOs, survival time, signature ability count and stronger MVP logic.

# M6 — Arena/content expansion

### Turn 6.1 — Arena identity
Unique skyline/skybox, floor language, particles, motif and late-round escalation for each arena.

### Turn 6.2 — Parallax/signage spike
Try lightweight moving skyline, holographic signage, crowd light ribbons and projected floor glyphs. Keep only if they add depth without obscuring units.

### Turn 6.3 — New arenas
Add 2–4 original environments after the first four are stable.

### Turn 6.4 — Optional arena rules
Only if they deepen strategy without making outcomes unreadable.

# M7 — Community-ready architecture

### Turn 7.1 — Contributor docs
Architecture diagram, unit checklist, art contribution spec, coding conventions and release workflow.

### Turn 7.2 — Data-driven unit registry
Move unit metadata/config out of scattered code so adding a fighter is bounded.

### Turn 7.3 — Safe mod/content hooks
Declarative units/arenas/presets/challenges; avoid arbitrary script execution.

### Turn 7.4 — Replay/debug tooling
Seed display, deterministic replay, compact trace export and dev-only performance counters.

# M8 — Release hardening

### Turn 8.1 — Device matrix
Current iPhone, smaller iPhone, iPad portrait, desktop narrow/tall, Android Chrome equivalent if available.

### Turn 8.2 — Performance
Measure 2×, 4×, 10×, Horde and extreme Lab.

### Turn 8.3 — PWA/offline
Cache versioning, cold start, stale service worker, offline launch and upgrade path.

### Turn 8.4 — Accessibility
Reduced motion, contrast, touch sizing, semantic controls and screen-reader sanity outside Canvas.

### Turn 8.5 — Release regression
No unresolved P0/P1/P2.

# Milestone tracker

| Milestone | State |
|---|---|
| M0 Visuals 11 validation | SUBSTANTIALLY COMPLETE · RC PLAYTEST NEXT |
| M1 Stabilize v3 shell | PARTIAL · LIFECYCLE/HUD/LAB ADVANCED |
| M2 Long-term art path | PLANNED |
| M3 Character progression | PLANNED |
| M4 Full 26-unit roster | 10/26 BASE UNITS COMPLETE |
| M5 Feature/capability parity | PARTIAL · PERSISTENT PARTS/MASTERY/SPELL TECH ADDED |
| M6 Arena/content expansion | PARTIAL |
| M7 Community-ready architecture | NOT STARTED |
| M8 Release hardening | NOT STARTED |

## Productive-turn contract

Every implementation turn should state:
1. milestone + turn number
2. exact files expected to change
3. explicit non-goals
4. acceptance test
5. commit SHA when done

If a task cannot be described this way, it is probably still too vague.

## Research-informed parity additions

See `DRAFT_SHOWDOWN_RESEARCH.md` for the evidence and confidence levels behind these items.

Before M4 roster scale-out, insert a **data-model checkpoint**:
- define a declarative UnitDefinition registry (stats, targeting, movement, attack, special/spawn behaviors, evolution metadata)
- define an effect-based DraftCard model (spawn, multiply, upgrade, merge, spell, eligibility, phase weights)
- define deterministic Spell objects instead of special-casing ARC/BLOOM
- preserve seeded RNG and event/state separation so battle codes/replays remain possible

Expand M5 capability-parity work with these future executable turns:
- **Turn 5.8 — Smart Draft AI:** tendency + unit-count + synergy + round-context scoring, with aiSmartness controlling greed/optimality
- **Turn 5.9 — Comeback rules:** optional consolation draft after round loss, with no ads/paywalls
- **Turn 5.10 — Commander/Mastery model:** separate global progression, unit mastery and visual evolution rather than one overloaded level
- **Turn 5.11 — Ghost opponent spike:** replay a deterministic opponent deck/seed profile without real-time networking
- **Turn 5.12 — Lab AI transparency:** show candidate draft scores and why the bot selected a card

After M4 reaches 26/26, treat extra researched unit identities as an **expansion backlog**, not baseline scope. Add only when they introduce a genuinely new behavior family.