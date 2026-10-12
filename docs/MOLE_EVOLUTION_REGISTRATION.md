# Mole Evolved registration

Continuation base: `624694a01d17090e4d15004a5d5f08b894b96f3a` on `art-spike-knight-authored-v1`, with the user-authorized five-level progression and ten Ultimate abilities. This milestone adds art only; it retains those mechanics unchanged. Main/production remain `ba58c3d`.

## Art contract and pipeline

The approved dark brown-grey fur, stern eyes, rounded ears, tan muzzle/belly, pink-brown nose, stocky low body, leather harness, two digging arms and two feet remain. Evolved gains broad natural horn shovel claws, low stepped bronze shoulder caps and a reinforced dusty leather harness. Three claws per hand remain consistent; there is no drill, extra thumb claw, weapon, glow or tall Ultimate carapace.

Built-in imagegen created a canonical and a 3/3/1 sheet. The initial sheet introduced an extra fourth claw and was excluded. The corrected sheet supplies seven disconnected complete silhouettes. Exact prompts, both source sheets, canonical and manifest are in `tools/art-spike/mole/evolved/`. The rejected sheet remains for audit, not runtime use.

`tools/prep-evolved-mole.py` extracts complete alpha components at one .4 source scale, adds a thin outline and six-pixel transparent padding, and registers individual source ground points. Runtime scale is 1.20 with 148.8px anatomy reference height. Crouch, eruption and seated defeat are not resized to idle height. Body and leading-claw cues use the existing cue API. Exports decode before replacement. Only low-alpha generated background outside the complete component edge band is excluded.

Seven poses are idle, scuttle move, claw rake, low brace, raised-claw eruption, recoil hit and seated defeat. Full feet, ears and three claw tips per hand remain within the runtime frames. Evolved guard uses its dedicated pose; existing dig/burrow/erupt mapping selects signature. Approved Base art and action mapping are retained.

L1 stays Base. L2 selects Evolved; L3 adds the existing procedural accent. L4/L5 still use Evolved as the honest artwork fallback while Mole Ultimate art is absent. Nuclear Carapace remains 35% incoming damage reduction at L4 and 50% at L5. HP/damage scaling, abilities, Mastery, targeting and progression frequency are unchanged in this art pass.

## Validation

136 authored WebPs and six arena WebPs decode. Seven Evolved packs each pass 4,110 equipment/camera/staging envelope cases. Actual decoded Mole poses at L2 select seven distinct files at the shared source-pixel scale; failed optional attack uses Base. Claw and eruption cues mirror inside the complete hand/foot envelope. Native contact sheet and eight four-arena duel/mixed-crowd composites were inspected. Eight additional L2/L5 scenes at 24/180 fighters pass readiness, Canvas state, effect budgets and Ultimate-cue suppression. Existing staging/camera, sky/floor, physical/reduced-motion, terminal-caption, progression and ten-ability regressions remain required, along with baseline and mixed-level deterministic matches.

Editorial identity/equipment scores are 9/10 and pose clarity at least 8.5/10; these are human judgments, not automatic scores or phone approval. Native mixed melee still overlaps. Device motion/FPS, exact-head portrait/landscape framing, menu previews and cold loading remain open.

Reproduce: `python tools/prep-evolved-mole.py`, `python tools/check-authored-assets.py`, `node tools/check-evolution-packs.cjs`, `node tools/render-evolution-review.cjs mole`, `node tools/check-mole-scenes.cjs [output.png]` and `node tools/check-evolution-effects.cjs`. Native render tools require `@napi-rs/canvas`.

## Deployment follow-through

At this milestone's start, GitHub still reported neither Vercel status nor check runs for mechanics commit `624694a`; the branch alias still resolved to the older Assassin preview `72e2ef4`. An exact-SHA preview creation through the configured Git connection was attempted for project `prj_flKvs2viRIOqXwpbEu1DfHoAM8AO`, team `danickmans-projects`, target `preview`. Vercel returned 403: the connector lacks access to that team scope. No Vercel CLI is available locally. The unchanged blocked route is not retried; status must be checked again on the new checkpoint. No new preview is claimed READY without matching deployment metadata.

Seven Evolved packs are complete. Turtle, Goblin and Barbarian remain; all dedicated Ultimate packs are still absent.
