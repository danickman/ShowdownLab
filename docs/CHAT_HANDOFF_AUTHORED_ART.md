# New Chat Handoff — Authored Fighter Art Pipeline

Use this when continuing the current Showdown Lab work in a fresh chat.

## Repository / branch

Repository: `danickman/ShowdownLab`

Production baseline before the art spike:
`d468263ca5b9921c69f8c8135086e10a0c979568`
(Package 16 — Spectacle Overdrive)

Current art-spike branch:
`art-spike-knight-authored-v1`

Production has **not** been changed by the art spike.

## What we are doing

We deliberately paused roster/feature expansion after deciding the procedural geometry renderer had reached its useful visual ceiling.

The selected direction is a **hybrid authored-art pipeline**, not a wholesale replacement of procedural rendering.

Authored art should own:
- fighter identity
- silhouette
- equipment/form
- key action poses

Code/procedural presentation should continue to own:
- movement/translation
- idle bob
- facing
- recoil
- hit flash
- camera punch
- shadows
- particles
- spell overlays
- targeting/area indicators
- arena effects
- most secondary motion

## Art-generation findings

The original multi-pose Knight sheet proved style and action readability but failed consistency:
- shield drift
- spear/weapon drift
- armor proportion drift
- text/labels appeared

The successful method is:
**canonical master + optional pose reference + one sprite per generation**

Priority order:
1. exact design consistency with canonical
2. pose
3. polish

Do not return to one-shot multi-pose sheets for production.

## Knight art state

Canonical Base Knight v1 is accepted.

Key design:
- T-shaped visor
- broad armored shoulders
- compact angular shield
- long spear
- blue tabard
- thick dark outlines
- cel/faceted comic shading

Seven prepared poses:
- idle
- move
- attack
- guard
- charge
- hit
- defeat

The dual-reference Attack was the first result considered production-pipeline viable. Guard followed the same method.

## Runtime spike

The seven authored Knight poses are integrated on the branch under:
`v3/assets/authored/knight/`

Renderer:
`v3/asset-renderer.js`

Runtime switch:
`showdownlab.art.knight`

Visible test control:
`KNIGHT ART · AUTHORED / PROCEDURAL`

Spike behavior:
- Blue Knight = authored when enabled
- Red Knight = procedural
- same-fight A/B comparison
- automatic procedural fallback if authored asset is unavailable

Protected rule:
**Do not casually modify `v3/legacy-sim-core.js`.**

The rich RC4 combat behaviors and prior freeze/lifecycle fixes are protected.

## Immediate next task

Perform real iPhone QA of the branch preview before doing more art production.

Assess:
- actual battle-scale readability
- relative sprite size
- pivot/ground anchor
- green/alpha edge quality
- idle → guard
- guard silhouette
- charge
- attack
- hit
- defeat
- whether switching poses feels coherent
- whether authored Knight fits the game’s arena/FX language
- performance

Do not merge to main until this passes.

If the user supplies screenshots/video from the test, diagnose the visual/integration issues first. Prefer small renderer/asset-normalization changes over regenerating art immediately.

## If the spike passes

Next recommended sequence:
1. fix Knight scale/anchor/alpha issues discovered on phone
2. freeze Knight Base authored asset contract
3. define naming/canvas/pivot/export rules in docs
4. scale the method to the existing 10 fighters only
5. evaluate again before creating the remaining 16
6. later create genuinely distinct L5–9 Evolved and L10 Ultimate canonical forms

Do not confuse current L1–4 visual changes with true evolved forms.

## Existing roster

Current implemented 10:
Knight, Sniper, Goose, Dragon, Assassin, Beetank, Mole, Turtle, Goblin, Barbarian.

Remaining planned 16:
Snail, Engineer, TNT, Merlinor, Archer, Spartan, Bloodvine, Whelp, Sixshoot, Parasite, Cowboy, Agent, Villain, Totem, Spider, Captain.

## Important historical guardrails

- Never restore legacy Stage5B ownership of `#rosterContent`; it previously overwrote the Package 14 Upgrade Bay.
- Preserve the RC4 emit/RAF error-isolation freeze fix.
- Preserve immediate terminal-state emission on final KO.
- Preserve seeded deterministic combat behavior.
- Quick has a ~4-second REINFORCE / WILDCARD / EVOLVE auto-pick intermission.
- Draft remains deliberate/changeable before deploy.
- Do not add fake anti-deadlock damage.
- Do not rewrite the combat core just to support presentation.

## Source-of-truth docs

Read these before making substantial changes:
- `docs/AUTHORED_KNIGHT_SPIKE.md`
- `docs/CHARACTER_ART_BIBLE.md`
- `docs/ROADMAP.md`
- `docs/V3_PRODUCT_SPEC.md`
- `docs/V3_ROSTER_SPEC.md`
- `docs/TEST_MATRIX.md`
- `docs/DRAFT_SHOWDOWN_RESEARCH.md`

## Working style requested by the user

Be decisive and production-minded.
Challenge weak ideas instead of agreeing automatically.
Do not expand scope casually.

When coding, state:
1. milestone/turn
2. exact files expected to change
3. non-goals
4. acceptance test
5. final commit SHA

The user wants master-plan progress, not endless tiny iterations.
