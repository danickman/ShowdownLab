# Presentation Turn 7 — phone feedback and living daylight battlefields

Based on branch head `a9a9d72f1ddc8b29baf43abec761d82cb5c27f8b`. User phone feedback: overall presentation looks better; opening whiteout lingers; Guide content needs space; menu sprite quality varies; Turtle running pose appears cropped. This is useful phone evidence, not blanket release or measured performance approval.

## Implemented

- Opening wash: reduced from the 1,500ms intro with up to 78% white coverage to at most 18% coverage, gone at 350ms. Round captions finish at 900ms with a fade. Combat timing is unchanged.
- Guide: one bounded scroll container, block-flow cards sized by content, more copy padding/line spacing and a 300–380px presentation area. Removed accumulated fixed-minimum-height hardening rules; cards no longer clip overflowing copy to fit a grid row.
- Menu ink: one cached alpha silhouette edge and contrast treatment per decoded presentation image. Team rings are unchanged. No per-fighter battle filter/compositing stack introduced. Existing source resolution is still a limitation: eight fighters use small 80–96px idle assets; source recovery remains necessary for truly consistent high-resolution Guide art. Sniper and Turtle have dedicated 512px presentations. No fighter regeneration.
- Turtle: supplied six-pose JPEG crosses the nominal three-column boundary. Its running rear foot lies left of that cell boundary. Re-extracted the complete running figure with an explicit crop; standing figure supplies a 512px presentation WebP. Other Turtle poses are untouched.
- Locations: round rotation is Sunlit Lab → Verdant Ruins → Frontier Keep → Siege Ruins, then repeats. Academy/garden share the approved existing skyline; frontier and siege each have one new authored daylight backdrop. Later settings are progressively more fortified/damaged; there is no night/neon theme. Cached floor chips, edge rubble and quiet old wheel scars connect war settings to their backdrop.
- Living environment: independent translucent cloud wisps, small flying birds, faint distant frontier/siege smoke, and leaves/dust in perimeter lanes. No ambient objects in the central battle floor. Stateless fixed loops, fewer elements above 60 fighters, no new queues, and ambience disabled by reduced-motion preference. Existing team pennants still flutter in ordinary fights.
- Live ground cracks, char, dirt, chips, spell aftermath and presentation-only staging remain. Three unique skyline URLs preload once each; academy/garden share one decode. Total skyline WebP payload is approximately 804KB, about 18.9MB decoded RGBA, with the existing single bounded floor cache.

## Exact files

Runtime: `v3/v3.js`, `v3/v3.css`, `v3/asset-renderer.js`, `v3/arena-art.js`, `v3/arena-stage.js`, new `v3/arena-ambience.js`, `index.html`, `v3/index.html`.

Assets: `v3/assets/arenas/frontier/skyline.webp`, `v3/assets/arenas/siege/skyline.webp`, `v3/assets/authored/turtle/move.webp`, `v3/assets/authored/turtle/presentation.webp`. Source: `tools/art-sources/turtle-base-sheet.jpg` (not loaded by runtime).

Checks: new `tools/check-living-arenas.cjs`; updated `tools/check-combat-cues.cjs`, `tools/check-stage.cjs`. Docs: this file, `LIVING_ARENAS_ART.json`, handoff, roadmap, test matrix and release gates.

Generation uses built-in image_gen, two environment images only. Exact final prompts and asset paths are in [LIVING_ARENAS_ART.json](LIVING_ARENAS_ART.json). Original generated PNGs remain available in the generating conversation; runtime uses the inspected WebPs.

## Turtle extraction provenance

User supplied `IMG_6083(1).jpeg`; stored intact as `tools/art-sources/turtle-base-sheet.jpg`, 1376×768, SHA256 `dd3bed2b0bec701d7d3c1427c4fd4af80d29867e84b6eb32c6b077ca3fbe4ea4`.

Source crops (left, top, right, bottom): move `(395,15,825,415)`, standing `(25,15,360,415)`. Each contains one complete figure and no labels/neighbouring figures. Used existing `chroma_alpha`, `normalize`, `add_outline` functions from `tools/prep-authored-sheet.py`; connected-component removal is unnecessary in these explicit single-figure crops. Move: 96px canvas, 88px content, bottom 91. Standing: 512px canvas, 464px content, bottom 485. Lossless WebP; source-alpha and common-ground conventions preserved.

Move alpha bounding box `(3,7,93,92)` confirms transparent margins on every side. The prior source cell severed the rear foot; whole-source extraction and the inspected native comparison confirm its recovery. Larger Guide art does not affect battle sprite size.

## Acceptance and checks

PASS: 64 finite/bounded ambient scenes at ordinary/extreme density and different times; reduced-motion bypass; opening wash/caption timing; once-per-image menu ink caching; three decoded location URLs reused; floor cache/camera/staging bounds; all 72 authored assets decode; 180 menu framing bounds/60 renders; 24 deterministic terminal seeded matches and callback/RAF safeguards.

Native composites inspected: four authored locations with ordinary attacks/hit cues, all ten Guide portraits with actual cached ink, complete Turtle run extraction. All-arena action matrix (16 scenes at 4/24/60/180) and 96 spell renders pass with bounded queues and balanced Canvas state. Native Canvas evidence does not prove iPhone CSS layout, motion preference behaviour or device FPS.

Phone gate OPEN: brief readable opening; scroll through every Guide field and Mastery section; compare Turtle and Sniper standing art; Turtle running shell/arms/both feet intact; clearly distinct frontier/siege backgrounds; living sky/perimeter motion supports fighters; physical damage remains visible. Check ordinary and ~180-fighter performance, late rounds, reduced motion and landscape. The eight remaining small menu sources are acknowledged debt, not silently reported as high resolution.

Non-goals: core/adapter/round-loop/Stage5B changes, combat outcomes, targeting, evolution/progression/reward changes, roster expansion, new fighter generation, main merge or production deployment. After this branch preview passes the release gates, freeze/merge/deploy one approved release, then begin the evolution-model review and one-fighter art spike.
