# Presentation release gates — hierarchy and arena cohesion follow-through

Branch implementation checkpoint based on `b6ca6bf3a4b3ed2c5fbc23a038ab540ceba815a8`. The user's original Turn 3/4 acceptance criteria remain required before release. Prior turn numbers do not constitute release approval.

## Turn 3 — combat visual hierarchy

Implemented follow-through:

- Data-driven weapon/body cue offsets for all ten fighters in `v3/battle-theatre.js`; Sniper shots/muzzle, weapon trails, Dragon fire and hit particles no longer use feet as their origin/impact location.
- Shorter ordinary shot, slash and impact lifetimes; signature and spell moments retain longer punctuation. No increase in effect queue caps.
- One comic callout at a time. Routine attack words are suppressed in squads of eight or more; signatures can replace ordinary attack captions. A fighter's duplicate small action label hides during its comic callout. Conventional italic/weight font syntax plus sans-serif fallback avoids the oversized font result seen in the native composite.
- `v3/asset-renderer.js` adds a short damage-notified recoil without replacing attack/signature poses or changing core actions. Weight profiles remain active. The visual reaction map is capped at 192 and cleared with pose memory on reset; menu art does not receive recoil.
- Per-snapshot target lookup for attack cue generation avoids introducing repeated target scans.
- Presentation spacing evaluated with ordinary and dense composite scenes. No arbitrary sprite offsets were applied: independent displacement would misrepresent short-range contact and targeting. Existing density scaling/camera bounds/rings remain. Dense melee overlap is still present and requires phone assessment, followed by a deliberate spacing pass if confirmed problematic. No claim that every fighter is individually readable in a 180-unit pile.

Phone gate still open: at 1×, fighters and actions remain identifiable in an ordinary crowd; trails/hit reactions support silhouettes; important signatures register without overlapping text or obscuring fighters.

## Turn 4 — cohesion and performance

Implemented follow-through:

- `v3/arena-art.js` shares the existing sunny authored academy skyline across all four arenas with one decoded image, instead of returning the other three to primitive procedural skies. No additional art generated.
- `v3/arena-stage.js` caches distinct academy, forge, observatory and garden dressing in the existing bounded floor texture. Arena palettes keep limestone/sandstone/pale stone/garden material differences. This is one shared academy location with differently dressed courtyards, not four bespoke authored scenes. Sunlight remains consistent; Moon Vault remains daylight.
- Shared sunny menus/HUD from Turn 3 and shared shadow/team ring treatment from Turn 4 remain intact. Live cracks, char, dirt and spell aftermath are unchanged.
- Ordinary/extreme-density rendering and queue/cache bounds checked again. One skyline decode, one current-floor cache and bounded recoil/effects; no per-fighter blur stacks introduced.

Phone gate still open: arenas feel like one game; Home/Draft/Ready/Results/Guide/Bay layout and taps work; ordinary and approximately 180-fighter fights have acceptable measured performance on the user's phone.

## Files and evidence

Changed runtime: `v3/battle-theatre.js`, `v3/asset-renderer.js`, `v3/v3.js`, `v3/arena-art.js`, `v3/arena-stage.js`, `index.html`, `v3/index.html`. Checks: new `tools/check-combat-cues.cjs`, extended `tools/check-stage.cjs`. Handoff/roadmap/test matrix updated.

Passing evidence:

- Ten weapon/body anchors and mirrored facing; short trail hierarchy; recoil, reset and reaction-store cap; one skyline decode across all four arenas.
- Cache reuse/invalidation/fallback, all four dressing paths, floor backing-store cap, snapshot index, critical health caps and density scale.
- Native four-arena attack/hit/recoil composites inspected; 16 ordinary/dense all-arena 1× scenes at 4/24/60/180 units, four action cycles each, bounded FX/marks/callouts and balanced Canvas state.
- 96 native spell renders across four types, T0/T5 and up to 180 units; 112 physical theatre lifecycle checks.
- 8,220 camera bounds; 71 asset decodes; 180 menu framing bounds/60 presentation renders; Sniper canonical/AIM separation; 24 deterministic terminal seeded matches and exception/RAF safeguards.
- Existing dense-render work reductions remain. Native call counts are not phone FPS.

Protected simulation core/adapter/round-loop/Stage5B and combat/evolution/reward logic are unchanged. Browser/device layout and real-phone subjective/performance approval are not claimed.

## Release sequence

1. User tests this branch preview against the two phone gates above and the Sniper/menu acceptance.
2. Fix confirmed defects on the branch, rerun affected checks.
3. Freeze the explicitly approved head.
4. Merge that head to main and deploy its approved build as one deliberate release event.

No main merge or production deployment is part of this checkpoint. Evolutions remain postponed until presentation QA is accepted.
