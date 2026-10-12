# Contact-aware crowd staging and Verdant ground

Continues from `00cbdc2c69a7c15ccd668dd8a4fe485c5ef246ef` on `art-spike-knight-authored-v1`. Bounded visual checkpoint; main and production remain unchanged.

## Changes and evidence

The prior symmetric rank fan could displace rear allies toward the opposing silhouettes. Staging now fans ranks away from the nearby opponent centroid. A 4px hysteresis band retains a contact side through small projection noise. Four deterministic passes reduce allied torso overlap within the existing envelope. Front fighters retain a smaller retreat offset than rear ranks. Simulation positions, targeting, range and outcomes are unchanged.

Caps remain at most 56px horizontally and 36px vertically for 2–60 living fighters. Same per-frame approach rate, complete equipment-box clamp, camera reserve, shared foot/cue coordinates and defeat/reset lifetime remain. At 61+ no separation passes run; residual offsets relax to zero. Worst case at 60 is four passes over 1,770 pairs (7,080 pair checks), without pairwise work in extreme armies. The body proxy excludes long weapon ends; this prioritises faces/torso readability rather than pretending every weapon is non-overlapping.

For the eight-fighter ranged/heavy comparison fixture, approximate torso intersection fell from 3250.6 to 687.1 CSS px² at 320×568, 2738.4 to 59.8 at 390×844, and 2848.2 to 56.0 at 430×932. At short landscape it remained 52.3. These are geometry proxy measurements on one fixture, not actual pixel occlusion scores or universal guarantees. Some allied overlap remains on the smaller portrait. Six native before/after frames captured from the actual seeded core at 1× (seed 997, 3/6/9 seconds, 16/13/12 living units) were visually inspected. Team separation improves; larger melee piles still overlap. No claim that all ordinary fights are perfectly readable.

Repeated small AIM/CHARGE/RAGE labels cluttered the actual captured fight. Secondary per-unit labels now render only below eight living fighters. Existing signature event/comic callouts, their budgets and small-fight labels remain unchanged.

Verdant Ruins gains an illustrated garden floor matching the sunny skyline: weathered pale limestone, mossed joints, faded botanical engraving and ivy/flowers at the perimeter. The central ground remains flat and light. Exact prompt and conversion are in `VERDANT_FLOOR_PROMPT.md`. No approved fighter artwork was changed or generated in this pass.

The floor module holds one current image record, lazily replacing academy/garden art when an illustrated arena is requested. Pending/failed art uses the existing procedural floor. Ready/error callbacks increment the existing revision for cache rebuild; stale callbacks from a replaced record are ignored. Warm frames use the same bounded single floor cache. There is no per-arena image record/cache collection or per-fighter image work. Each illustrated floor is 768×1152 (about 3.54 MB RGBA); replacing records does not claim immediate browser/GPU memory reclamation. Frontier and siege remain procedural. Live dirt, cracks, char, debris and spell scars remain above the floor.

## Validation

PASS: 9,540 existing staged bounds; 8,220 camera bounds; four Evolved packs × 4,110 bounds and actual pose/fallback checks; immutable inputs and stable source ordering; contact fronts and centroid-jitter hysteresis; 60→61 dense relaxation; shared body/ground anchors and reset.

PASS: academy/garden pending→ready/error paths, warm reuse and replacement, stale callback isolation, source-aspect preservation in portrait/landscape, single floor-cache pixel bounds. Six runtime arena WebPs and 112 authored WebPs decode. Four-arena native action composites and eight 24/180-unit L5/L10 scenes exercise aligned shot origins, bounded effects and Canvas state.

PASS: skyline framing, ambient/reduced motion, physical wakes/honk, theatre geometry/lifecycle, floor caching, signature/cue bounds, HTML parity, JavaScript parsing and diff checks. Twenty-four seeded matches remain terminal and deterministic; listener exception isolation and RAF continuity pass. Protected core, adapter, roster ownership and round-loop files are unchanged.

Reproduce with `node tools/check-crowd-readability.cjs`, `node tools/check-combat-staging.cjs`, `node tools/check-arena-evolution-pass.cjs`, and the existing asset/evolution checks. Native review uses `node tools/render-crowd-review.cjs [output.png]` and `node tools/check-sniper-scenes.cjs [output.png]` with `@napi-rs/canvas` available.

## Remaining phone gates

Exact-head iPhone acceptance is OPEN: moving melee contact fidelity, offset settling through flanks, full pose/equipment framing, garden contrast versus live damage, portrait/landscape floor cropping, cold art/fallback load, ordinary frame pacing and 60/61/180-unit transitions. Native steady-frame comparisons do not certify motion, touch behavior or FPS. Preview browser authentication/connector permission restrictions remain unresolved; no unchanged blocked route was retried.

All four Evolved pilots and approved Base packs are preserved. Combat balance, Mastery, evolution frequency and roster breadth are unchanged. Continue from phone findings and the remaining Evolved forms; release only an explicitly approved exact head as the single main/production event.
