# Beetank Evolved / academy ground / physical wakes

Continues from `84af6f2ed65c308156096f78466ceb6d2309c89c` on `art-spike-knight-authored-v1`. Branch review checkpoint; no main merge or production release.

## Evolution design and assets

`EVOLUTION_DESIGN_MAP.md` defines the preserved identity, Evolved/Ultimate silhouette direction and signature visual language for all current ten fighters. Designs are candidates; new gameplay behavior is not implemented. Current active Evolved pilots are Knight and Beetank at L5+, with temporary Evolved fallback at L10. Mastery remains independent.

Beetank now has a transparent Evolved canonical and seven complete poses: idle, move, horn attack, guard, low ram, hit and defeat. New art uses stepped teal shell plates and reinforced bronze-edged shoulders/forearms. Exact built-in imagegen prompts and lossless sources are in `tools/art-spike/beetank/evolved/`. Editorial contact-sheet QA: identity/equipment 9/10 and pose clarity at least 8.5/10; no critical crop/equipment defects found. Scores represent visual inspection, not machine measurements; phone review remains open.

`tools/prep-evolved-beetank.py` extracts complete connected components, preserves alpha, prepares all poses at common .4 source scale and writes per-pose foot registration to `v3/evolved-beetank.js`. Prepared files are rectangular, so the low ram fits without shrinking the torso to a square. Renderer now selects from a small per-fighter evolution registry, keeps form-keyed pose holds and uses matching Base assets if optional Evolved art fails. Diagnostics include both forms.

Beetank's native source faces left; both Base and Evolved battle rendering now normalize that direction to the requested target facing. Presentation portraits retain their native composition. Base source images are unchanged.

Health bars and signature captions reserve the selected form's equipment envelope. Results portraits retain the MVP's actual level/form on repaints. The last-fighter caption displays numeric level rather than incorrectly clamping all levels to IV.

## Arena art and physical effects

Sunlit Lab now uses a ground-only academy illustration: warm limestone, brass compass medallion, ivy and ceramic detail confined to the sides. `ACADEMY_FLOOR_PROMPT.md` preserves the prompt and preparation details. Other arenas retain their distinct garden/frontier/siege floors. Skyline full-width landmark handling stays unchanged.

`v3/arena-floor-art.js` decodes one 768 × 1152 WebP (283,368 bytes; approximately 3.54 MB decoded RGBA). It paints into the existing single floor cache, retaining original medallion/stone proportions with a centred cover region. Landscape crops a middle band; unusually tall portrait may crop edge detail. The illustration does not add collision objects. A ready/error revision invalidates the procedural fallback cache once; failed/missing art retains the procedural academy floor. Live cracks, dirt, char, debris and spell marks remain separate above the floor. Existing floor-cache limit remains approximately 1.21M backing-store pixels, with no retained per-arena cache collection.

Charges, Beetank ram, Barbarian rage-charge and Turtle shell-roll emit short earth/stone wakes at action onset. Wakes retain world/staging origin, last 420ms, have at most 15 primitive fills/strokes each, and cap at three concurrent effects before the existing global effect trim. They are suppressed above 28 living fighters, at 10× speed and with reduced motion. No new per-frame particle queue, blur, simulation random calls or persistent skid marks. Existing heavy impacts and scars continue unchanged.

## Verification and remaining gates

PASS: all 96 authored sprites and four arena WebPs decode. Both Evolved packs pass 4,110 camera/staging cases each across five portrait/landscape sizes, 2–180 units and clustered/corner/spread layouts. Actual renderer checks confirm shared scale, correct facing and corresponding Base-pose error fallback. Existing 9,540 staging and 8,220 camera bounds pass.

PASS: illustrated floor fallback → ready → error cache transitions and reuse; finite mirrored wake geometry, expiry/density/speed/reduced-motion caps exercised through the actual emission path. Stage cache, ten fighter cues, 20 skyline cases, 64 ambience cases and 112 theatre geometry/lifecycle checks pass. Native seven-pose Base/Evolved Beetank contact sheet and ordinary/24/180-unit arena scenes reviewed. Sixteen existing all-arena scenes remain balanced. Twenty-four seeded matches remain terminal/deterministic; throwing listener and RAF protections pass.

Native render inspection caught an empty first floor export before publication; replacement was decoded in both Pillow and native Canvas. `tools/check-arena-assets.py` now rejects empty or invalid runtime arena exports.

Open phone gates: evolved silhouettes/pose transitions, target facing, ordinary melee contact fidelity, health/caption placement, floor contrast versus live damage, portrait/landscape framing, cold asset load, and 2×/4×/10×/180-unit FPS. Native CPU checks do not establish iPhone performance. Knight L10 Ultimate and the remaining eight Evolved packs are not generated or implemented. Legacy core, adapter, stats, targeting, EVOLVE frequency, rewards, Mastery and roster ownership are unchanged.
