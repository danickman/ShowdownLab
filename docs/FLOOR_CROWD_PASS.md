# Presentation Turn 4 — courtyard floor and crowd rendering

Implemented on the art integration branch from `d66fa74e7684f8b33212f69592fac0ead302b681`.

## Implementation and scope

- `v3/arena-stage.js`: staggered perspective paving, restrained stone variation, dressed perimeter, daylight edge highlights and wall shadow. Uses each existing arena palette. One cached static floor, rebuilt only for size, palette or DPR changes; backing store capped near 1.2 million pixels (approximately 4.8 MiB). Canvas allocation failure uses the previous floor renderer. Live cracks, char, dirt, chips, effects and fighters are never baked into the cache.
- `v3/v3.js`: floor integration, shared live-unit/ID index per adapter snapshot, single-shadow rendering above 35 fighters, authored head positions for health/action labels. Critical bars are limited to two per team above 45 fighters, one per team above 90; normal fights retain their existing health-bar threshold. Live-unit counts drive presentation sizing. No offsets to unit or attack coordinates.
- `v3/camera.js`: gradual presentation-size reduction above 60 living fighters, down to 58% at 180. Normal-count sizing is unchanged. Camera reserves the resulting full authored silhouettes; combat projection/positions/ranges are unchanged.
- `v3/asset-renderer.js`: stronger, less fluorescent filled team rings; skips the inner decorative ring above 35 fighters. Foot anchors, authored mappings, canonical menu art, pose holds and silent fallback remain intact.
- `index.html` / `v3/index.html`: identical entry points load the floor module and updated renderer/camera/game revisions.
- `tools/check-stage.cjs`: cache reuse/invalidation/failure, memory bound, target-index refresh, critical-health caps and gradual crowd sizing checks.

No new generated artwork, menu changes, simulation/targeting/separation changes, progression/evolution work, main merge or production release. Turn 3 physical effects remain unchanged. The trusted simulation core, adapter, round-loop, Stage5B and battle-theatre renderer are untouched.

## Evidence and limits

Native Canvas inspection covers the integrated floor with physical impacts, lightning, quake, settling and residual damage. The 180-unit render is easier to read after reducing extreme-count silhouettes and health-bar clutter, but overlap is still present; this does not claim to solve engagement staging.

Thirty warm 180-unit native render frames, compared with Turn 3:

| Canvas call | Turn 3 | Turn 4 |
|---|---:|---:|
| Ellipse | 32,580 | 16,200 |
| Stroke | 16,470 | 5,460 |
| Fill rectangle | 11,250 | 120 |
| Image draw | 5,940 | 6,000 |
| Linear gradient | 150 | 0 |

These counts are a rendering-work proxy, not phone timing or FPS. Image draws increase slightly because each frame blits the cached floor. Smaller dense sprites reduce their covered area but actual GPU/compositing cost needs phone measurement.

Checks pass: stage cache/target-index/density regression; 112 theatre lifecycle cases; 8,220 initial/settled camera bounds; 71 WebP assets; 180 menu bounds and 60 presentation renders; 96 spell render cases across T0/T5 and up to 180 fighters; actual ten-fighter effect dispatch; 24 deterministic terminal matches; exception/RAF safeguards; runtime syntax and entry-point parity.

## Phone acceptance and next work

1. All four arena rounds: sunny cohesive paving, no stretching/white gaps on resize, live ground damage still obvious.
2. Normal fights: authored silhouettes remain full body; health/action labels sit above heads; team rings stay grounded.
3. Dense approximately 180-fighter fights: smaller silhouettes and limited health bars reduce clutter; no unexpected rendering stalls or cache churn. Compare with Turn 3 on the same phone.
4. Multiple rounds, rotation/resizing and restart: cache rebuilds cleanly, no frozen frame or loss of spell/defeat transitions.
5. Review the Turn 3 Home/Draft/Ready/Results/Guide/Bay menus and touch controls alongside this branch checkpoint.

Browser/device layout, visual and measured performance QA remain open. Await phone findings before generating more environments or evolution art. Next confirmed defects should be handled on the branch; final release still requires approved/frozen head, main merge and one deliberate production deployment.
