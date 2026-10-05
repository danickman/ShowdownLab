# Showdown Lab v3.0 — Product & Experience Specification

Status: **M0 APPROVED**

## Product objective
Rebuild Showdown Lab's presentation layer as a portrait-native mobile game whose usability, visual hierarchy, character readability and moment-to-moment game feel are competitive with the Draft Showdown reference while retaining Showdown Lab's richer simulation and systems.

Draft Showdown is an experience benchmark, not an aesthetic clone.

## Experience loop
**BUILD → ANTICIPATE → SHOWDOWN → REWARD → EVOLVE → AGAIN**

Primary player states:
**HOME → BUILD/DRAFT → READY → SHOWDOWN → RESULTS**

Secondary paths: Ultimate Lab, Daily Challenge, Settings, saved armies and battle codes.

There is no persistent application navigation during normal gameplay.

## Portrait-native contract
Primary target is a modern portrait iPhone (~390×844 CSS px). Desktop/landscape remain functional but do not dictate mobile geometry.

- Active combat devotes roughly 75–90% of usable display area to the arena/arena-integrated HUD.
- Simulation coordinates are independent from presentation coordinates.
- A camera maps simulation state into the portrait viewport.
- Typical normal fighter visual body is 38–52 px; large units 55–75 px; exceptional/boss units may reach 80–110 px.
- Character readability is degraded only after particles, shadows and secondary effects are reduced.
- No horizontal scrolling.
- No essential touch target below 44×44 CSS px.
- Battle, normal Draft and Home do not page-scroll. Roster and Lab use intentional scroll containers/sheets.

## Battle hierarchy
Persistent: team/lives status and round.
Contextual: currently usable spells/abilities.
Hidden behind one menu: pause, speed, settings, AI/debug, surrender and secondary controls.

Production gameplay contains no persistent telemetry, debug log or universal app toolbar.

Healthy normal units do not carry permanent large health bars. Selected, damaged and boss units may expose progressively richer health information.

## Character system
Art direction: **Toybox Battle Laboratory** — playful, tactile, experimental and energetic illustrated miniatures viewed from an approximate three-quarter/top-down perspective.

Each unit identity is built from:
**silhouette + signature feature + motion + colour accent + personality**.

Team ownership uses controlled blue/red accents; it must not turn the whole character monochrome.

Minimum animation vocabulary: idle, move, wind-up, attack, recover, hit, death and selected.

Evolution:
- L1–4 Base
- L5–9 Evolved: meaningful visual/silhouette change
- L10 Ultimate: clearly special transformation

Stars may communicate level secondarily but are not the evolution itself.

### M2 vertical-slice units
- Knight — melee/tank/readability baseline
- Sniper — ranged/projectile/aiming baseline
- Goose — small/comedic/personality baseline
- Dragon — large/effects/scale baseline

The four must be recognizable without labels at normal phone viewing scale.

## Draft
Normal four-choice draft fits without page scrolling. Character artwork is the dominant card element. Name, role and one short trait are secondary. Selection produces immediate visual feedback and updates a visual army tray. The primary action becomes unmistakable once required selections are complete.

## Ready
A short, optionally skippable VS state provides anticipation between army creation and combat.

## Results
Results lead with winner/celebration, then survivors/MVP and concise meaningful performance, followed by progression/evolution. Detailed logs are secondary. Primary action is the next showdown; rematch and edit army are subordinate.

## Army / roster
Army management is a visual roster room, not a settings form. Active army is shown as character portraits. Unit details use contextual sheets and progressive disclosure.

## Ultimate Lab
Three-stage visual sandbox:
1. Build Blue
2. Build Red / choose opponent preset
3. Experiment tray for advanced parameters

Complex controls are permitted only after deliberate entry into advanced configuration. Primary action: **RUN EXPERIMENT**.

## Technical architecture
Keep the simulation and replace the presentation architecture.

Existing game systems feed a **Simulation Adapter / Game State API**, which serves a clean v3 UI and renderer. Presentation code must not depend on scattered legacy globals as its long-term interface.

Battle rendering baseline: **Canvas 2D** for continuously moving arena/characters/projectiles/FX; DOM for readable/touchable HUD, controls and inspection UI. Use one time-based render loop.

The renderer consumes normalized state such as id, type, team, level, hp/maxHp, position, facing, action, target and status.

The UI invokes explicit operations such as startBattle, selectDraftUnit, castSpell, setSpeed, pauseBattle and createLabArmy.

### Asset strategy
Modular transparent character assets, authored above display resolution and compressed for delivery. Per-unit metadata defines anchors, bounds, team-accent treatment, effect anchors, base scale and animation timing.

Load assets in bundles: core vertical-slice, roster, evolution, then Lab/secondary. Likely battle assets preload before battle begins.

### Performance tiers
A — full normal presentation.
B — reduce particles, shadows and secondary animation.
C — extreme Lab: minimal particles, simplified shadows and reduced distant animation frequency while retaining silhouettes and attack readability.

Targets on test iPhone:
- Normal battle: ~60 fps
- Busy battle: >=45 fps
- Extreme Lab: >=30 fps

## v2 disposition
KEEP: combat model, unit definitions, AI logic, levels/evolutions, spells, daily challenges, deterministic seeds, battle codes, save schema where practical, Ultimate Lab mechanics and balance work.

ADAPT: draft logic, army management, battle events, settings and persistence interface.

REPLACE: current page shell, battle layout, unit DOM graphics, universal navigation, HUD, loadout UI, draft UI, results UI, Ultimate Lab presentation, Visual Forge overlay architecture and game-feel polling architecture.

## Milestones and gates
### M1 — Mobile Foundation
Build clean v3 screen architecture, safe-area handling, intentional scrolling, portrait camera geometry and touch foundations. No visual-quality claim is made at M1.

Exit gate:
- canonical iPhone viewport fills correctly
- Home fits without accidental scroll
- Battle cannot page-scroll
- Roster intentionally scrolls
- primary controls >=44×44
- no horizontal overflow
- orientation changes do not corrupt layout
- no dependence on stacking new CSS overrides onto v2 presentation

### M2 — Production Vertical Slice
Home → Draft → Ready → Battle → Results with Knight, Sniper, Goose and Dragon at production quality.

Exit gate requires user Test Cycle A and explicit approval. Do not scale to the other 22 units until this gate passes.

### M3 — Visual & Content Scale-Out
All 26 units receive identifiable silhouette, portrait, battle representation, movement personality, attack tell, hit/death response, team treatment and L5/L10 evolution. Perform silhouette/contact-sheet review.

### M4 — Systems Integration
Integrate retained game systems: Quick Showdown, Draft, army management, AI, spells, evolution, Daily Challenge, Ultimate Lab, battle codes, saves, settings, pause/speed and offline/PWA behavior.

Then user Test Cycle B.

### M5 — Release Candidate
Feature freeze. Device hardening, regression, performance, memory stability, touch hit-testing, overflow, safe areas, accessibility, PWA caching/offline startup, stale saves, error recovery and dead-code cleanup.

Then user Test Cycle C.

Defects: P0 catastrophic; P1 major/core broken; P2 significant UX/visual/performance; P3 polish. P0–P2 block release. Exactly one bounded remediation cycle follows Test C.

## v3.0 definition of done
- Home, Draft, Battle and Results look like a purpose-built mobile game.
- Arena/arena-integrated HUD consumes >=75% of usable battle display.
- Typical fighters remain >=38 px under expected density.
- 26 primary units have recognizable identities and obvious L5/L10 evolution.
- Important controls are thumb-friendly.
- Required screens scroll reliably and only intentionally.
- No permanent production telemetry or universal navigation contaminates battle.
- Retained game systems pass regression.
- Test C produces no unresolved P0/P1/P2 defects.
- Performance meets defined tiers or pathological Lab exceptions are explicitly accepted.
- User approves the product experience.

## Visual acceptance heuristic
Blur a battle screenshot slightly and view it from arm's length. It must still obviously read as a mobile game in battle, not a website containing a simulation.
