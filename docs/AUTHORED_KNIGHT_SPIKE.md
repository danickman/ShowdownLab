# Authored Knight Art Spike

Status: renderer-integrated on an isolated test branch; **not approved for production**.

## Rollback strategy
- Existing procedural `FighterArt` is untouched and remains the fallback.
- Authored Knight assets are additive under `v3/assets/authored/knight/`.
- Rendering is selected at runtime with `showdownlab.art.knight`.
- A visible `KNIGHT ART · AUTHORED / PROCEDURAL` test toggle changes the renderer immediately.
- No combat, targeting, damage, cooldown, lifecycle, rewards, or progression logic is modified.

## Scope
Prepared pose set:
- idle
- move
- attack
- guard
- charge
- hit
- defeat

The authored renderer is intentionally enabled for **Blue Knight only** during the spike. Red Knight remains procedural, providing a direct side-by-side comparison in the same fight without introducing a misleading blue-authored sprite on the Red team.

## Asset preparation
- green-screen background converted to true alpha
- green spill reduced at the antialiased edge
- common square canvas and ground anchor
- lightweight WebP runtime copies
- source art remains outside the runtime asset folder and unmodified

## Runtime behavior
Knight action mapping:
- `guard` / `brace` → guard
- `charge` → charge
- `attack` / `kill` → attack
- `hit` → hit
- `defeat` → defeat
- other/default states → idle

If an authored image is missing or not loaded yet, rendering falls back to the existing procedural Knight automatically.

## Acceptance gate
Do not merge this spike until real phone testing confirms that the authored Knight is materially better in:
1. battle-scale readability
2. pose transitions
3. visual consistency
4. alpha-edge quality
5. performance
6. overall fit with the rest of the game

If it fails, delete/revert the spike branch or select Procedural; no procedural art reconstruction is required.
