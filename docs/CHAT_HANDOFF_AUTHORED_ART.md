# New Chat Handoff — Authored Art, Evolution & Presentation

Updated: 2026-10-07

Use this as the operational handoff for continuing Showdown Lab in a fresh chat.

## Repository / release state

Repository: `danickman/ShowdownLab`

Production:
- Package 16 — Spectacle Overdrive
- production/main baseline before the authored-art spike: `d468263ca5b9921c69f8c8135086e10a0c979568`
- production URL: https://showdownlab.vercel.app/

Working branch:
- `art-spike-knight-authored-v1`
- branch head immediately before this documentation handoff: `9ff20a15b2b7dc4834ddc48d58a2d439ab1b9d2c`
- verify the actual branch head again before changing code

Do not claim subjective iPhone QA has passed unless the user explicitly reports it.

## Current product decision

The implemented roster is intentionally frozen at 10 fighters:
Knight, Sniper, Goose, Dragon, Assassin, Beetank, Mole, Turtle, Goblin, Barbarian.

Do not add the remaining planned 16 fighters now. Roster expansion is deprioritized until:
1. Base authored art is fully polished
2. evolution art/progression is proven
3. battle theatre and arena presentation reach a professional quality bar
4. performance is acceptable on real phones

The biggest current weakness is not mechanics. It is **look, feel, staging and polish**. The game is materially improved by authored sprites but still reads as an enthusiast prototype rather than a professionally art-directed mobile game. Future work should attack that gap deliberately.

## Authored-art architecture

Authored sprites are now the normal presentation path for the current 10.

Target runtime pattern:
combat state
→ existing action/pose mapping
→ authored asset renderer
→ authored fighter pose
→ procedural `FighterArt` only as a silent failure fallback

Do not add back the old authored/procedural user toggle.

Code should continue to own:
- translation / movement
- facing
- idle weight shift
- recoil
- attack lunges
- squash/stretch where appropriate
- hit flash
- shadows
- team halos
- camera punch
- particles
- spell overlays
- targeting
- arena effects
- presentation timing / pose holds

Do not rewrite combat rules merely to make sprites animate.

## Base-art state

All 10 current fighters have authored Base runtime packs.

Runtime assets live under:
`v3/assets/authored/<fighter>/`

Typical pose contract:
- idle
- move
- attack
- guard / defensive
- signature
- hit
- defeat

Knight retains its authored charge mapping.

The renderer is:
`v3/asset-renderer.js`

Important implemented presentation behavior includes:
- 1× default speed
- attack/signature/hit pose persistence so action poses remain visible
- move/settle cadence so movement does not dominate every frame
- heavy-unit motion profiles
- stale defeat-pose recovery across rounds
- authored-first loading rather than flashing procedural art on first paint
- per-fighter scale normalization
- stronger Dragon scale / silhouette treatment
- team ownership halos/rings
- improved heavy-unit transitions
- card/menu authored-art presentation
- Upgrade Bay mastery card support
- Fighter Guide work in progress
- arena/skybox polish pass in progress

## Sniper — immediate unfinished task

This is the first task for the new chat.

The old Sniper assets caused two visible defects:
1. AIM could show detached/floating body parts because the crop came from a bad sheet extraction.
2. Normal standing/idle art was later damaged/cropped so the legs/boots could be cut off.

The user supplied replacement full-body source images for:
- standing / idle Sniper
- aiming Sniper

Several replacement candidate images were generated during troubleshooting. **Do not generate more Sniper art.** There is already enough source material.

Current repo state includes files such as:
- `v3/assets/authored/sniper/idle-v2.webp`
- `v3/assets/authored/sniper/aim-v2.webp`
- `v3/assets/authored/sniper/signature-v2.webp`
plus the older pose pack.

However the final approved replacement integration was **not completed** before handoff.

Required next work:
1. inspect the current Sniper asset files and renderer mappings on the branch
2. choose the approved complete full-body standing source for the canonical runtime idle
3. choose the approved complete full-body rifle-up source for AIM
4. convert/prep to the same runtime WebP/alpha/anchor contract as the rest of the roster
5. replace or deliberately remap the active runtime files — do not leave ambiguous v1/v2 selection
6. ensure standing/idle shows both legs and boots in combat
7. ensure AIM is one coherent body with no detached floating limbs/equipment
8. ensure Upgrade Bay / Draft / Ready / Results / Fighter Guide use the intended full-body presentation image rather than a cropped action pose
9. cache-bust only as needed
10. phone QA before release

Do not regenerate the canonical Sniper again unless the user explicitly requests new art.

## Fighter Guide / menu framing debt

Upgrade Bay improved substantially, but Fighter Guide framing remains inconsistent and has appeared vertically squashed/cropped.

Known failure modes:
- `object-fit` / contain logic applied against the wrong container proportions
- presentation canvas reserve for team ring reducing usable art area too aggressively
- source pose selection using an action/cropped asset instead of the canonical idle
- guide art being enlarged beyond the available aspect ratio

Next implementation should make one shared presentation-framing function/config for:
- Draft cards
- Ready screen
- Upgrade Bay
- Fighter Guide
- Match start
- Results / MVP

Requirements:
- never crop head, weapon, feet or signature equipment
- preserve source aspect ratio
- reserve ring/ground space explicitly rather than shrinking art unpredictably
- Fighter Guide should show the largest, highest-quality full-body art in the UI
- per-fighter overrides are acceptable, but the default should be data-driven and consistent

## Battle presentation findings

Real-phone testing has repeatedly surfaced these priorities:

### Staging / spacing
Large groups still bunch into visually confusing piles. Improve perceived spacing without breaking combat:
- prefer presentation offsets / formation pressure / engagement-slot tuning before changing target logic
- preserve melee contact and deterministic outcomes where possible
- keep units individually identifiable
- avoid all fighters collapsing onto one x/y cluster
- make front, mid and rear lines visibly distinct

Any simulation-level separation change must be treated as a gameplay change and tested carefully.

### Pose readability
At 1×:
- attack/signature poses should stay on screen long enough to register
- move poses should be intermittent rather than continuous
- slow units must not look frozen
- defeated poses must never leak into the next round

### Team readability
Red/Blue ownership must remain obvious without repainting the whole fighter:
- filled ground halo
- outer + inner team rings
- restrained rim/accent cues
- readable in crowded fights and against warm/cool arenas

### Fighter balance adjustments already made
Recent branch work includes:
- Assassin durability increased so it survives long enough to perform its role
- Barbarian movement speed increased so it actually engages the frontline
Do not casually undo these without testing.

## Professional-polish target

The next phase should be treated as a **presentation-direction pass**, not random FX accumulation.

The visual goal:
- authored fighters feel like they live in the same world
- consistent outline weight, contrast and shadow language
- arena depth and lighting frame the fighters
- effects reinforce attacks rather than cover them
- camera and staging make moments legible
- UI, cards, guide, battle and results share one coherent art direction
- no low-resolution/cropped/squashed fighter art
- no generic flat skybox / empty-field feeling
- no visual clutter that makes individual fighters unreadable

When choosing between “more effects” and “better composition/readability,” choose composition/readability.

## Skybox / arena direction

Current procedural skyboxes and arena backdrops are now a visible quality bottleneck.

Near-term priorities:
- stronger foreground / midground / background separation
- proper atmospheric perspective
- coherent daylight key light
- horizon bloom / haze
- arena-specific silhouette landmarks
- restrained parallax
- floor perspective cues
- team-side washes that support, not overpower, the units
- background motion only when it does not compete with combat

Do not solve the problem by simply adding more dots, shapes or neon.

Scene/background authored art is now a higher priority than expanding the fighter roster.

## Evolution direction — plan before generating

Do not start generating all evolution art immediately.

Current progression contract remains:
- L1–4 = Base
- L5–9 = Evolved
- L10 = Ultimate

The user is considering limiting visual evolution to **three authored canonical forms per fighter maximum**, while using procedural prestige treatments to create intermediate states.

Recommended direction to evaluate:
- Form A: Base authored form
- Form B: Evolved authored form
- Form C: Ultimate authored form

Within those forms, code can create progression steps using:
- controlled gold/metal accents
- stronger rim light
- aura/energy treatment
- signature equipment glow
- crest/mark overlays
- modest scale/posture amplification
- upgraded VFX / trails / impact language

This avoids generating a completely new sprite set for every numerical level while still making progression visible.

Do not let procedural “pimping” replace genuinely distinct Evolved and Ultimate silhouettes.

## Refined evolution-art generation pipeline to test

The Base pipeline proved that two-reference + single-pose generation gives excellent consistency but is too slow at roster scale.

For evolution work, test a faster pipeline on **one fighter first**:

1. Start from the approved Base canonical master.
2. Generate **one Evolved canonical master** only.
   - same identity
   - deliberate silhouette upgrade
   - exact equipment contract
   - no pose sheet yet
3. Feed that Evolved canonical to Gemini and request a six/seven-pose sprite/reference sheet in one pass.
4. If most cells are good, extract usable cells and regenerate only failed poses individually.
5. Use the same method for Ultimate only after Evolved passes.

This creates:
canonical evolution image → multi-pose sheet → selective repair,
instead of:
canonical → pose reference → six separate generations every time.

Quality gate:
- if multi-pose consistency falls below production quality, fall back only for the failed poses, not the entire sheet.

For each evolution form, preserve:
- exact head/face
- body proportions
- equipment count
- weapon identity
- costume/armor construction
- signature color language
- outline weight
- small-screen silhouette

## Evolution game-design questions for the new chat

Before implementation, decide:
- exact number of authored forms: recommended Base / Evolved / Ultimate
- what L2–4 look like procedurally
- what L6–9 look like procedurally within Evolved
- whether evolve choices can appear after the fighter has reached Ultimate
- how often EVOLVE appears in Quick/Draft
- whether evolve offers are weighted toward fighters that can still advance
- whether level and form are separate data fields
- what gameplay/stat/signature changes accompany each form
- how upgrade/mastery and match evolution remain conceptually distinct

Current user direction:
- EVOLVE prompts should appear less often
- units should never exceed the deliberately defined authored evolution states
- no uncontrolled infinite evolution ladder

## Performance

Real-phone testing showed very large armies can become slow around Round 6 / roughly 180 visible units.

Keep:
- lightweight WebP assets
- current spectacle-density tiers
- bounded particles and aftermath
- authored key poses rather than high-frame-count animation
- 1× default

Profile before adding expensive filters, per-unit blur, large compositing passes or high-frame-rate sprite animation.

## Release / deployment rule for the next chat

Do **not** merge incomplete Sniper work to main.

Once the Sniper replacement and the current authored-base presentation fixes are genuinely ready:
1. run static/runtime regression checks on the branch
2. perform the required iPhone smoke/visual QA
3. freeze the branch head
4. merge the approved branch to `main`
5. deploy production as the same deliberate release event

The user explicitly wants to avoid wasting deployments. Do not do a sequence of unnecessary production deploys for tiny intermediate fixes.

A branch preview may be used only when needed to obtain the required phone QA before merge.

## Protected combat baseline

Trusted combat core:
`v3/legacy-sim-core.js`

Preserve:
- formations
- target pressure
- separation
- engagement slots
- armor/dodge/knockback
- Knight guard/charge
- Sniper aim/retreat/reload
- Goose honk/scamper
- Dragon cone breath
- Assassin vanish/backstab/disengage
- Beetank ram
- Mole burrow/erupt
- Turtle shell
- Goblin rush/stab
- Barbarian rage
- immediate terminal-state emit when final unit dies

Historical freeze protection:
- core `emit()` catches callback exceptions
- frame loop always schedules next RAF
- adapter isolates listener/dispatch exceptions

Do not remove these.

Historical Upgrade Bay regression:
- never restore legacy Stage5B ownership of `#rosterContent`

## Quick / Draft contract

Quick:
- pauses after non-terminal rounds
- REINFORCE / WILDCARD / EVOLVE
- approximately four-second timer
- auto-pick on idle

Draft:
- deliberate
- player can change selection before deploy

Evolution frequency and caps may be changed deliberately in the next phase, but do not regress the basic Quick/Draft flow.

## Required reading before substantial work

Read:
- `docs/CHAT_HANDOFF_AUTHORED_ART.md`
- `docs/AUTHORED_BASE_ROSTER.md`
- `docs/AUTHORED_KNIGHT_SPIKE.md`
- `docs/CHARACTER_ART_BIBLE.md`
- `docs/ROADMAP.md`
- `docs/V3_PRODUCT_SPEC.md`
- `docs/V3_ROSTER_SPEC.md`
- `docs/TEST_MATRIX.md`
- `docs/DRAFT_SHOWDOWN_RESEARCH.md`

Also inspect:
- `v3/asset-renderer.js`
- `v3/v3.js`
- `v3/v3.css`
- `v3/legacy-sim-core.js`
- `v3/simulation-adapter.js`
- `tools/prep-authored-sheet.py`
- `v3/assets/authored/sniper/`

## Working style

Be decisive and production-minded.
Do not casually expand scope.
Fix source/framing/mapping problems before asking for new images.
Do not repeatedly regenerate approved canonical art.

For implementation turns report:
1. milestone / turn
2. exact files expected to change
3. explicit non-goals
4. acceptance test
5. final commit SHA

## First action in the new chat

Before changing code:
1. inspect the actual branch head
2. inspect current Sniper files and renderer mappings
3. verify which replacement WebPs already exist and which are actually referenced
4. state the exact minimal Sniper integration plan
5. do not generate any more Sniper art

Then complete the Sniper integration and visual-framing fix on the branch, QA it, and only after approval prepare the single merge-to-main / production deployment event.
