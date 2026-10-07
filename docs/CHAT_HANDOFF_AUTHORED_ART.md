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

## Sniper + shared presentation framing — implementation checkpoint

Milestone M2 / Base polish turn: **implemented on branch; device QA and release pending**.
Starting head verified clean: `d0af43fc0c10508a0757bf8b4fdf6f8c14b5cbe8`.

The immediate defect was worse than a stale mapping: `idle-v2.webp` and
`aim-v2.webp` were binary payloads without WebP headers and could not decode.
The old idle was cropped; the old signature contained disconnected fragments.

Converted existing user-supplied art, with no image generation:
- standing: `A3609F5B-CD16-46EA-85E9-BFBADA473A01.png`, existing transparent canonical
- AIM: `4545D040-3D50-43A2-8207-690CB3BE0754.jpeg`, complete rifle-up pose
- AIM background removal preserved non-background light details by removing only border-connected near-white pixels
- both combat copies normalized to 96×96, content fitted within 88 px, ground at 91 px, lossless WebP and the existing one-pixel outline convention
- high-resolution standing presentation copy normalized to 512×512, 469 px content / 485 px ground; approximately 101 KiB, UI only

Authoritative runtime paths:
- `v3/assets/authored/sniper/idle.webp`: complete standing body, both boots and rifle
- `v3/assets/authored/sniper/signature.webp`: coherent AIM, selected by the existing aim action mapping
- `v3/assets/authored/sniper/presentation.webp`: sharp standing/canonical for UI

Removed the two corrupt v2 files and superseded signature-v2 candidate. No v1/v2 runtime selection remains.
Other Sniper actions retain the existing pose pack and mappings.

## Shared presentation framing checkpoint

`FighterAssets.presentationFrame()` now fits art into explicit logical-pixel bounds,
preserving aspect ratio with padding and a separate team-ring reserve. UI uses idle
only; optional high-resolution presentation art falls back to authored idle on failure.
Battle motion, pose holds, fighter scales, anchors and camera stay separate.

`paintOne()` sizes each canvas backing store to its actual CSS box, capped at 2× DPR,
and renders in logical CSS pixels. This fixes the previous 320×360 Guide canvas being
stretched into differently proportioned boxes. Surface defaults replace the old
per-fighter/per-screen scale matrix. Resize/screen-size changes schedule static repaint.

Surfaces covered: Draft, Ready/pre-match, Upgrade Bay, Fighter Guide, Results/MVP and
Home. Match-start currently presents live combat plus a text ceremony, not a separate
portrait; its combat rendering is preserved. Guide remains the largest UI art surface.

Validation:
- all 71 authored files decode with nonempty transparent content; all 10 pose packs exist
- all runtime JavaScript parses; both HTML entry pages remain identical; diff whitespace clean
- actual production draw function exercised for all 10 fighters across six UI sizes: 60 renders
- 180 aspect/bounds checks cover narrow/tall/wide source ratios and reserved team rings
- Sniper standing/AIM and full-roster Guide-size Canvas renders visually inspected
- presentation with an explicit aim action still selects the 512×512 standing canonical
- 24 mixed-roster seeded 8-vs-8 matches at 10× terminated and paired seeds reproduced identical results
- an additional throwing-listener run terminated; RAF scheduling continued

Browser limitation: no local browser binary was available, the browser download failed,
and the available browser could not open localhost. **Browser layout/tap QA and real
390×844 / short-phone iPhone QA are still open.** Canvas tests do not certify them.

Run `python tools/check-authored-assets.py` before release to catch malformed payloads.

Remaining quality debt: nine other fighters still enlarge their small combat idle copies
in the Guide. Recover higher-resolution approved canonical presentation copies later;
do not generate new art to fix framing. No claim of a fully polished Guide yet.

Next action: obtain one branch preview for required iPhone smoke/visual QA, fix only
confirmed defects, then freeze the approved head. Merge to main and production deploy
remain one gated release event. Neither has happened in this turn.

## Presentation Turn 1 — sunny composition / grounding (2026-10-07)

Implemented on the integration branch after `b1c2d3dec28d25dce316216d23cd23b194700c29`. No new art, combat changes, main merge or production release.

User direction is now explicitly **daylight and sunny; discourage neon/dark themes**.

Changes:
- Authored world points are foot anchors. Combat team rings now centre on that point and draw behind the sprite. Procedural fallback translates its body centre to respect the same foot contract.
- Contact/cast shadows in `drawUnit()` now sit at the feet instead of ~0.3 sprite heights below them.
- Camera composes the full live-army bounds on the floor, reserves actual authored scale/anchor/equipment dimensions, snaps initial framing, widens when required and smooths inward motion. It does not mutate units or targeting.
- Sky/floor boundary moved from 31% to 23.5% of view height; camera floor composition accounts for sprite height instead of centring only foot points.
- First arena renamed Sunlit Lab; all four use daylight skies, light material palettes, sun/cloud/horizon depth, a quiet sparse-joint floor, edge-only team washes and small pennants.
- Removed layered dark floor panels, oversized side ellipses, repeated central circles/stripes, dense floor texture, sky halftone, neon skyline geometry and global dark vignette.
- Round intro/outro retain timing and state flow but use warm light overlays/dark text instead of darkening the sunny scene.
- Persistent impact scars, bounded spell aftermath, density tiers and combat FX remain intact.

Validation: 8,220 initial/settled full-sprite camera-bound checks across five viewport sizes, three layouts and 2/8/24/60/180 units; camera state immutability; foot-aligned ring/render-order checks; native Canvas render review of all four arenas; authored-asset/UI framing and seeded combat regression. See `TEST_MATRIX.md`.

Run `node tools/check-presentation.cjs` and `python tools/check-authored-assets.py`.

Remaining: browser/iPhone layout, camera motion, crowded-fight legibility and FPS must be tested on the branch preview. Native Canvas checks do not certify browser/device performance. Sprite stacking and FX/callout placement are intentionally still presentation-turn-3 work. The simplified procedural courtyard is a clean scaffold for authored scenery, not a claim that environment polish is finished.

Planned subsequent bounded turns:
1. Turn 2: one sunny Sunlit Lab authored environment pilot; review in-engine before generating other scenes.
2. Turn 3: combat visual hierarchy, controlled callouts, team identification and presentation spacing.
3. Turn 4: approved environment language across the other arenas, UI/lighting cohesion and phone performance.

Evolutions remain deferred. Keep changes on the art branch; avoid repeated intermediate production deploys.

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

Read the implementation checkpoint above before repeating asset preparation. Verify the branch head, then obtain the remaining phone QA. For new confirmed defects:
1. inspect the actual branch head
2. inspect current Sniper files and renderer mappings
3. verify which replacement WebPs already exist and which are actually referenced
4. state the exact minimal Sniper integration plan
5. do not generate any more Sniper art

Then complete the Sniper integration and visual-framing fix on the branch, QA it, and only after approval prepare the single merge-to-main / production deployment event.


### Presentation Turn 2 — sunny authored Sunlit Lab pilot

One authored skyline now replaces Sunlit Lab distant scenery only. Floor scorch residue, impact cracks, dirt/dust and flying debris are explicitly preserved with their existing caps and expiration. Other arenas, fighters and combat logic are unchanged. See [ARENA_ART_PILOT.md](ARENA_ART_PILOT.md) for the asset, final generation prompt, checks and phone acceptance. Automated/native renderer checks pass; browser/iPhone visual and performance QA remains open. Branch checkpoint only; no main merge or production release.


### Presentation Turn 3 — physical effects and sunny academy UI

Branch implementation adds branching ground fractures, dirt/chips, daylight edges and Dragon char; improves local spell impact hierarchy/crowd budgets and places comic callouts above silhouettes. A shared sunny cream/brass/navy presentation stylesheet now styles menus and battle controls. No new images, combat/progression changes or production release. See [THEATRE_UI_PASS.md](THEATRE_UI_PASS.md) for exact files, evidence, phone acceptance and remaining overlap/performance work. Automated/native checks pass; browser/iPhone layout, touch, visual and performance QA remain open.
