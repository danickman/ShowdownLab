# Authored Knight Art Spike

Status: renderer-integrated on an isolated test branch; **phone visual QA is the next gate**. Not approved for production.

Branch: `art-spike-knight-authored-v1`

Renderer-integration head before documentation updates: `b21da0eeb2d7cab5a1c9c09ab463850a1cdb3a24`

Production remains on Package 16 and is intentionally unchanged.

## Why this spike exists

The procedural/geometry renderer reached a useful ceiling. The current decision is **not** to replace all procedural art. The working direction is a hybrid authored-art pipeline:

- authored fighters for silhouette, character form and key action poses
- procedural motion, recoil, bob, hit flash, particles, spell overlays, targeting, shadows and arena effects
- one fighter proven at real battle scale before scaling to the current 10 or planned 26

The main art bottleneck is no longer transparency. It is **character consistency and pose control**.

## Art-generation method that passed

Multi-pose sheets were rejected because shield, weapon and armor design drifted between poses.

The viable method is:

1. create one canonical character master
2. generate one pose at a time
3. use the canonical master as the design/equipment reference
4. optionally provide a second image as pose-only reference
5. give design consistency higher priority than pose
6. clean/extract alpha after the pose passes

The dual-reference method was the first production-pipeline-viable result.

## Knight canonical contract

Canonical Base Knight v1:
- T-shaped visor
- broad armored shoulders
- compact angular shield
- long spear
- blue tabard
- thick dark comic outlines
- faceted/cel-shaded armor
- broad heroic proportions

**Important:** the authored Knight now uses a spear, not the older procedural sword description. Future Knight art should follow the authored spear + shield contract unless deliberately redesigned.

Prepared pose set:
- idle
- move
- attack
- guard
- charge
- hit
- defeat

The Guard and Attack poses were generated with canonical + pose references. That method should remain the default for large silhouette changes.

## Asset preparation

Runtime assets live under:

`v3/assets/authored/knight/`

Current preparation:
- green-screen background converted to true alpha
- green spill reduced at the antialiased edge
- common square canvas
- normalized ground anchor
- lightweight WebP runtime copies

Generation should continue on a flat chroma background rather than asking the image model to create transparency directly. Use an actual cleanup/background-removal step afterwards.

## Renderer integration

Existing procedural `FighterArt` is untouched and remains the fallback.

Runtime selection key:
`showdownlab.art.knight`

A visible:
`KNIGHT ART · AUTHORED / PROCEDURAL`
test control flips the renderer immediately.

During the spike:
- **Blue Knight** uses authored art when Authored is selected
- **Red Knight** remains procedural
- this allows direct A/B comparison in one battle
- missing/not-loaded authored assets fall back to procedural automatically

No combat, targeting, damage, cooldown, lifecycle, reward or progression behavior was intentionally changed.

Knight action mapping:
- `guard` / `brace` → guard
- `charge` → charge
- `attack` / `kill` → attack
- `hit` → hit
- `defeat` → defeat
- other/default states → idle

## Phone QA incident — authored art did not appear

First iPhone test showed the toggle in Authored mode while Blue Knights still rendered procedurally.

Repository inspection found the immediate cause: five authored pose files committed as `.webp` do not contain valid WebP headers and therefore fail image decode in the browser. The verified-good runtime files are currently `move.webp` and `defeat.webp`.

Temporary wiring-validation hotfix:
- idle / move / attack / guard / charge / hit route to the verified `move.webp`
- defeat routes to the verified `defeat.webp`
- the toggle now reports `AUTHORED READY`, `AUTHORED LOADING`, or `ASSET ERROR`
- this is intentionally a renderer-pipeline proof only, not final pose QA
- once authored rendering is visibly confirmed on phone, re-upload the five corrupted pose assets from the prepared source pack and restore the full state mapping

No combat code or procedural fallback was changed.

## Verification already completed

- all 8 runtime JavaScript files parse
- root and `/v3` HTML shells remain byte-identical
- branch is isolated from production
- Vercel reported successful branch deployment
- procedural renderer remains recoverable without reconstruction

Do **not** claim subjective iPhone visual QA has passed. It has not yet been completed.

## Next gate: real-phone visual QA

Open the branch preview, preferably Ultimate Lab, and compare Authored vs Procedural while watching a Blue Knight.

Judge:
1. battle-scale readability
2. sprite scale relative to other fighters
3. alpha edge / green spill
4. idle-to-guard transition
5. charge readability
6. attack readability
7. hit and defeat readability
8. whether pose switching feels coherent or like disconnected cut-outs
9. overall visual fit with the procedural arena/effects
10. apparent performance

The key question is not whether the source sprite looks attractive when enlarged. It is whether the authored Knight is **materially better during actual combat on an iPhone**.

## Decision after phone QA

If the spike clearly passes:
1. normalize any scale/anchor/edge defects
2. lock the Knight runtime contract
3. complete Base authored sprites for the existing 10-fighter roster
4. keep authored generation one-pose-at-a-time
5. then revisit the remaining 16 fighters
6. create separate canonical designs later for L5–9 Evolved and L10 Ultimate forms

If the spike is only marginally better:
- do not scale production to 26
- improve the integration/motion model first

If the spike fails:
- keep the procedural art path
- remove/revert the authored test branch
- no procedural art reconstruction is required

## Non-goals for the next turn

Unless explicitly requested:
- do not merge to `main`
- do not deploy to production
- do not rewrite `legacy-sim-core.js`
- do not generate the remaining 25 fighters
- do not start L5/L10 evolved art
- do not remove the procedural fallback
- do not turn this into a full sprite-sheet animation system
