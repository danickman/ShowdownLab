# Authored Knight Art Spike

Status: asset preparation in progress; no production behavior changed.

Rollback strategy:
- Existing procedural FighterArt remains untouched.
- Authored Knight is additive under `v3/assets/authored/knight/`.
- Renderer integration will be gated by an explicit authored/procedural switch.
- No combat, targeting, damage, cooldown, lifecycle, or progression logic will be modified for this spike.

Prepared pose set:
- idle
- move
- attack
- guard
- charge
- hit
- defeat

Normalization target:
- transparent PNG
- 1024×1024 canvas
- horizontal anchor x=512
- nominal ground anchor y=940
- green-screen spill removed at alpha edge

The prepared binary PNGs are being generated outside the repo first so they can be visually validated before renderer integration.
