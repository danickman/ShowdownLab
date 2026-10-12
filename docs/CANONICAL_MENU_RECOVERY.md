# Canonical menu source recovery — 2026-10-08

## Decision

The supplied originals improve large presentation art for Knight, Goose, Dragon,
Assassin, Beetank, Mole, Goblin and Barbarian. Their menus previously enlarged
80–96px battle sprites. Each now has a dedicated 512px transparent standing WebP,
recovered from its approved original sheet. This preserves source detail; it does
not invent detail or redesign the fighter. Knight remains a simpler art style.

Retain the current approved Sniper presentation: the older sheet is not a quality
upgrade. Retain Turtle presentation and the previous full-foot move repair.
All 70 battle pose files are unchanged by this pass.

## Reproduction

Originals are in tools/art-sources; presentation-crops.json records explicit
single-figure crops. Run `python tools/prep-presentation-art.py`. Crops exclude
labels and neighboring poses. Knight needs separate yellow-green removal and
edge despill. WebPs preserve alpha, full equipment and existing ground anchors
(Knight .918, others .948). No per-fighter CSS changes.

## Runtime and performance

All ten fighters now resolve a dedicated canonical image in the shared menu
renderer. Error fallback remains authored idle. The same cached dark-ink pass
is reused; battle rendering does not receive additional filters or larger assets.
Eight additional 512px menu images add approximately 1.3MB encoded and 8MiB
decoded RGBA. Cached menu ink uses two additional 512px buffers per viewed image;
there is no per-unit or per-frame image allocation. Original source sheets are
not runtime loaded. Preload total is 80 authored images including 70 battle poses.

## Acceptance evidence and remaining gate

- All 80 WebPs decode with nonempty alpha and transparent borders.
- Native canvas contact sheet reviewed at menu scale: all ten full silhouettes,
  complete weapons, no source labels; recovered art visibly sharper.
- Camera, staging, cues, floor/theatre, ambient bounds and cached-ink checks pass.
- 24 seeded matches retain deterministic terminal behavior; listener failure and
  next-RAF protections pass. No protected combat source changes.
- Branch preview only. Actual iPhone Guide layout, visual approval and ordinary /
  extreme-density performance remain user QA gates before main/production.
