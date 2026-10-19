# Turn 11 — Daylight skyline caching and arena identity
October 18, 2026 Toronto. Starting QA dbc07a2584ec238d53f025420b76a0b09d5fe296; main 0cb1a7db330017193d69d3ab63525ed9cdaca12e protected.

## Diagnosis from actual source and exact CI
- Existing v3/arena-art.js repainted sky WebPs every frame, applying hue/sepia CSS filters during live Canvas render for Crystal and Solar. The skyline is static, while v3/arena-ambience.js already animates sunlight, clouds and birds independently. This is redundant scene workload.
- The four authored panoramas and six existing settings are original repo art; no new source images were generated. Crystal/Solar currently vary the underlying panoramas by fixed filters and ground palettes.
- Latest previous exact PR 39188323584 green 12/12. Turn 10 Chromium 1× 40/80/120/180/300 p95 frame intervals 50/183/250/300/600ms, versus prior independent-run 16.7/133/150/233/416.7ms. These are NOT matched-run A/B and not Safari FPS. Turn 10 painter-only p95 2.3/3.4/5.2/4.2/6.0ms, so a skyline cache alone cannot solve heavy simulator CPU.
- Turtle running pose cropped rear foot had already been repaired; v3/camera.js and v3/combat-staging.js clamp authentic authored sprite envelopes. Leave them intact instead of risky source-art edits.

## Changes
- v3/arena-art.js now caches only the current authored skyline plus chosen color-variant filter, at DPR capped 2.5 / about 1 million pixels, invalidated by arena, viewport or new source decode. One drawImage on warm frames; direct legacy composition on unavailable canvas or oversized window. Canvas retains both landmarks and bottom-wall alignment; dynamic sky still repaints separately.
- v3/arena-stage.js adds ten cool inset edge spires to Crystal Terrace, and ten warm radiating floor ribs / eight little mosaics to Solar Colosseum, within existing one-floor static cache, outside active battle lanes.
- Gameplay/ability/combat/staging/camera unchanged; **no claims of higher FPS without matched benchmark**.
- index.html and sw.js version references, release cache and all 42 SHA-256 module/root digests regenerated atomically.

## Validation / release gate
- Mandatory tools/qa/check-turn11-arena.cjs checks 200+ repeated warm cache draws, no repeated filtered source painting, changed dimension scene rebuild and finite floor drawing. Mandatory full 12-job PR CI includes offline integrity and 40/80/120/180/300 Chromium screenshot/stress.
- Exact new SHA CI pending; physical iPhone 14 Pro Max Safari 430x932 DPR3 NOT tested. No Vercel preview, no merge to main/production. On green CI, start Turn 12 Goblin L5-A.
