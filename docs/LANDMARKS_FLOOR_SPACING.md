# Phone feedback: panorama sides, ground identity and melee spacing

Continues from `33a8d60d2ce1a53dae6b3888e354be9841fd92f7` on `art-spike-knight-authored-v1`.
User phone screenshots show improved authored presentation, but too much side scenery is cropped, ground lacks character and ordinary melee still stacks vertically. This checkpoint addresses those findings; main and production remain unchanged.

## Implementation

- Skyline width fits the full panorama. Buildings and ruins on both sides remain visible; no architecture stretching. The parapet stays anchored to the floor. Portrait regions taller than the image get a sampled sky colour above it, with a short sky-edge fade and existing ambient animation. Very wide landscape still crops upper sky vertically rather than squeezing the scene. No extra image assets/decodes.
- Floors gain stronger slab material variation and architectural shapes: academy inset borders and low-key courtyard engraving, garden stone/grass pockets, frontier earth/wheel tracks and angular blocks, siege broken paving and old fractures. All are baked into the existing single size-bounded cache. Live dirt/cracks/char/spell impact layers remain separate and intact.
- Local staging now considers body-sized neighbours, rather than a very small foot cluster. Same-team ranks fan horizontally and stagger vertically. Ordinary fights of 2–60 living units have viewport-dependent caps, up to 56px horizontal and 36px vertical. At a 390px phone viewport the horizontal cap is 56px; short landscape reduces vertical spread. Full authored boxes stay in bounds.
- Camera reserves match staging caps. Offsets ease and obey a maximum 0.18 CSS px/ms settling rate (2.88px at a 16ms frame); fallen offsets remain through the existing defeat fade and round resets clear them. Fighters, rings, shadows, weapon/body cues and emitted ground impacts continue to use shared staging coordinates.
- Above 60 units no new local spread is computed; previous offsets settle back. Existing dense sizing and bounded effects remain. The staging neighbour grid is bounded by this cutoff; no solver or simulation repulsion is added.

## Files and non-goals

Runtime: `v3/arena-art.js`, `v3/arena-stage.js`, `v3/combat-staging.js`, `v3/camera.js`. Cache references: `index.html`, `v3/index.html`. Checks: `tools/check-skyline-framing.cjs`, `tools/check-combat-staging.cjs`, `tools/check-combat-cues.cjs`. Documentation: this file, handoff, roadmap, test matrix and release gates.

No modifications to legacy core, simulation adapter, targeting, range, engagement/separation, stats, formations, round choices, progression, authored fighter/evolution assets or menus. Existing Knight evolution candidate remains an inactive art spike. No new raster generation, main merge or production deployment.

## Acceptance evidence and limits

PASS: 20 panorama cases across portrait/landscape, all four arenas, original aspect ratio, full horizontal source extent, floor-wall alignment and fallback. PASS: 9,540 full-sprite staged bounds across five viewports, 2–180 units and clustered/spread/corner configurations; order stability, smoother isolated return, wider coincident cluster (>50px compared with previous 28px envelope), dense bypass, reset and shared ground/body anchors. PASS: 8,220 baseline camera bounds, floor-cache reuse/invalidation/1.21M pixel budget, ten fighter cue anchors, 16 ordinary/dense all-arena action scenes, and 24 seeded deterministic terminal matches with exception/RAF safeguards.

Native phone-size before/after seven-fighter melee and 24-fighter siege scenes reviewed. The wider ordinary cluster is visible, with rings and impact cues aligned. Dense overlap remains; bounded presentation spreading cannot make every extreme-army silhouette separate. Renderer checks do not establish real-device motion or FPS.

Phone QA remains OPEN: both side landmarks visible; sky continuation natural at portrait/landscape sizes; floor material readable without competing with live damage; ordinary 1x fighters more distinguishable without floating/sliding feet or detached contact; transitions between 60 and 61 units; ordinary/180-fighter performance. Release remains exact-head phone approval, frozen branch head, main merge and production deployment as one deliberate event.
