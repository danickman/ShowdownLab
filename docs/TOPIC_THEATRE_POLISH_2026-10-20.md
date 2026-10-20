# Showdown Lab — next topic: battle theatre and authored-fighter polish
Active after VERIFIED Turtle L5 Shell Rebound, Barbarian L5 Measured Charge and Goblin L5 Rabble Call playable QA. Source of truth branch qa-turn1-duel-baseline, PR #14. **No fixed turn budget and no automatic topic abandonment**. Prior docs/THEATRE_UI_PASS.md records completed daylight arena, QUAKE/ARC and bounded effects work; do not assume remaining complaints resolved.

## Goals and acceptance checks
- Native 430x932 DPR3 (iPhone 14 Pro Max), plus 390x844 and 375x667 Chromium *rendered* viewports: fighter full body, no cropped feet, weapons, face or tails in Guide, Upgrade Bay, Draft cards, ready/results and in-battle presentation, all ten L1/L2-L5 representations. Physical Safari visual approval later mandatory.
- Team-identity outlines and halo readable against daylight scenery, no washed-out evolution cards, no misleading defeated poses or detached sprite parts across consecutive battles. Preserve authored roster art, 10 frozen families, seven registered base/evolved poses and skill cue truth. Do NOT generate new art or replace established assets without user direction.
- Impact theatre: distinct real Goblin summoning emergence, Turtle reprisal, Barbarian first-contact charge, Mole ground fissure, ARC/QUAKE/BLOOM/AEGIS; meaningful impacts and earth cracks without obstructive whiteouts or continuous flashing. Daylight arenas and wide living skybox, dynamic shadows and dirt. Density 20/40/80/120/300 must remain legible and bounded in CPU/DOM/Canvas activity; 1x default.
- Modes: Quick Match, Draft, Ultimate Lab all reach real terminal result then next round without leaking action/defeat animations or caches, and their touch targets do not overlap interactive UI.
- Use actual source+browser evidence, screenshots and pixel/DOM/canvas QA where available; fix reproducible issues on protected QA branch with exact-head full CI, source tests and atomic 42 asset pins if executable source changes. Claim no physical iPhone acceptance until user supplies real device evidence. Avoid Vercel previews. Don't merge, deploy, or open unrelated fighter tuning work without user request.

## Starting sequence
1. Inventory existing authored sprite bounds and actual render/Guide/Upgrade frames and prior QA captures; reproduce specific clipping/readability defects by viewport and mode.
2. Fix high-signal presentation bugs in source with visual/QA receipts, not speculative design churn. Re-run performance/300 and live 40 independent damage fronts; physics untouched.
3. Get user real-device screenshots or observations at final Safari release acceptance. If lacking, leave manual P1 gate open and continue automatable QA/polish only.


## Authored-presentation QA in progress, 20 October
Live Guide tactical tips for newly released Turtle L5 Shell Rebound, Barbarian L5 Measured Charge and Goblin L5 Earned Rabble were stale; now truthful. Source/spec and actual combat unchanged. A new full authored Guide Chromium visibility gate covers all ten families at L1/L2/L4 and 430×932, 390×844, 375×667 touch DPR3 (90 actual canvas scenes), detects missing art, panels whose figure boxes clip, high-confidence image cutoffs at canvas edges and blank sprites; uploads five 430px fighter-gallery screenshots and precise pixel receipts. This test will expose real crop problems for subsequent fixes. Native Safari iPhone device acceptance remains OPEN. All 42 root/module PWA pins updated atomically; 300/20/40 battle gates remain required; no Vercel preview, main or production changes.
