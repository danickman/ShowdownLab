# Sunlit Lab authored environment pilot

Implemented 2026-10-07 on `art-spike-knight-authored-v1`, based on `18ae45e906ba9361e91bfbd8c95b453ecc9f3343`.

## Direction and scope

Sunny daylight, airy blue sky, warm limestone, brass observatory details and green distant hills. Discourage neon and dark themes. One Sunlit Lab scene only; other arenas retain their sunny procedural scenery until phone approval. Evolutions remain postponed.

The built-in imagegen tool produced one skyline image. Runtime asset: `v3/assets/arenas/sunlit-lab/skyline.webp`, 1774 × 887, 217,190 bytes (quality 88 WebP conversion only; no artwork repair or regeneration). The WebP is the retained project asset. No new fighter artwork.

`v3/arena-art.js` preloads and caches one decoded image. It clips a proportionally scaled, bottom-anchored background into the existing horizon strip. Loading/failure leaves the bright procedural scenery available. No extra per-fighter filters, particles, compositing passes or new effect queues. Decode memory is approximately 6 MiB at four bytes per pixel; actual phone rendering cost remains to be measured.

## Live battle floor is preserved

The floor remains rendered separately beneath the authored skyline. Persistent impact scars, ARC scorch residue, QUAKE dirt fractures, dust kicks, ground puffs, flying debris and Mole burrow dirt are retained. Their existing expiration, caps and density tiers are unchanged. The asset contains no baked damage; battle aftermath is drawn after the floor and before fighters. Combat core, simulation adapter, targeting, progression and formation behavior are untouched.

## Verification and phone acceptance

Automated checks: 71 authored fighter WebPs; 8,220 camera/presentation bounds; 24 deterministic terminal seeded matches plus throwing-listener/RAF guard; all runtime JS syntax. Native Canvas pilot renders all four arena paths and verifies 3,288 settled camera bounds. Native damage test confirms 1,056 visibly changed floor pixels from scars/ARC/QUAKE marks, exercises dust/debris, and verifies loading/failure/other-arena fallback. Battle scar, spawn-FX and draw-FX blocks are byte-identical to the parent. These are renderer checks, not browser/device QA or an FPS claim.

On the branch preview, test Round 1 (and Round 5 if reached):

- Sunny skyline appears without loading errors; no stretched architecture or unwanted dark overlay.
- HUD leaves the academy landmarks visible; fighters remain the visual focus.
- Heavy hits leave cracks; ARC leaves scorch residue; QUAKE throws dirt and leaves fractures; charges raise dust. Marks fade normally and reset for a new battle.
- Other arena rounds keep their existing daylight scenery.
- At high fighter counts, performance does not materially regress compared with the Turn 1 branch.

No main merge or production deployment is part of this checkpoint. Phone visual/performance QA is open.

## Final generation prompt

Create one production-quality 2D background asset for a sunny mobile comic fantasy arena game named Showdown Lab. Wide landscape composition, aspect ratio 2:1. Environment ONLY: a charming open-air research academy courtyard skyline on a beautiful sunny late morning. Bright airy pale blue sky, soft white cumulus clouds, warm cream limestone, honey stone, restrained sage foliage, small terracotta roof accents and distant blue-green hills with atmospheric haze. Distinctive handcrafted fantasy laboratory architecture: two low elegant academy pavilions at left and right, arched windows, subtle brass astronomical instruments and roof observatory dome. Clear coherent sunlight from upper left; soft warm highlights, cool gentle shadows. Illustrated ink-and-paint game art with confident clean contour lines, rich but restrained detail, tactile materials, sophisticated shapes, cohesive stylized proportions. Not photoreal, not flat vector, no primitive polygon mountains. This asset occupies ONLY the distant sky and horizon strip above a separately rendered battle floor. Composition: upper 55 percent mostly open sky; architecture concentrated in lower 35 percent at sides; central skyline low and open, distant gardens and hills; bottom edge is a continuous low cream stone courtyard perimeter wall, horizontally level, cropped flush with image bottom. View from inside courtyard looking toward distant wall, no near foreground, NO battle floor or ground plane visible below wall. Side buildings must remain legible when left/right edges crop slightly on tall mobile screens. No characters, no fighters, no HUD, no text, no logos, no banners, no team rings, no weapons, no particles, no baked battle damage. Bright daylight, inviting and sunny, avoid neon, dark themes, dramatic night lighting, futuristic glowing geometry, excessive contrast and bloom. Deliver a single finished full-bleed landscape background.

