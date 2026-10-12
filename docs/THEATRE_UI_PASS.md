# Presentation Turn 3 — physical battle theatre and sunny academy UI

Implemented on the authored-art integration branch, based on `161591960ebf49fe0fb9c9bffc17a04ea75db702`. User direction: make battle damage enjoyable and physical, enhance spell impacts, improve menus, retain sunny daylight and avoid neon/dark themes.

## Changes

- `v3/battle-theatre.js`: cached branching fracture geometry, daylight edge highlights, settled chips/dirt/char, short dust pressure waves and ballistic chunks with ground shadows. Geometry is generated once per mark via a WeakMap; no particle objects are added per chunk. Reduced/minimal detail budgets apply.
- `v3/v3.js`: routes ground damage through the shared renderer, keeps existing 14-scar/28-spell-mark caps and nine-second damage lifetime, adds Dragon fire char, replaces heavy ground puffs with physical impacts, limits QUAKE/AEGIS targets sampled for presentation at high density, flattens floor sigils, shortens ARC's brightest strike, moves comic callouts above full fighter silhouettes, and limits DOM spell ribbons to one. ARC/BLOOM local effects and heavy earth impacts follow world positions as the camera moves. A lethal ARC can still show its strike at a defeated target. Simulation spells are unchanged.
- `v3/presentation.css`: shared cream stone/brass/navy visual language for Home, Draft, Ready, Results, Fighter Guide, Upgrade Bay, Ultimate Lab and battle controls. Reuses the approved Sunlit skyline on Home. Removes remaining dark surface inconsistencies, heavy saturation/contrast filters, large blurred screen pulses and continuously pulsing home CTAs. Adds focus states, consistent button hierarchy, compact layouts and short-phone scrolling. Full-body canonical contain framing remains owned by the existing asset renderer.
- `index.html` and `v3/index.html`: identical entry points load the theatre module and presentation stylesheet; user-facing development badge/title replaced with Sunlit Arena framing.
- `tools/check-theatre.cjs`: portable geometry/lifecycle, bounded crowd/cast, state immutability, lethal ARC and entry-point checks.

No new art generated. No roster/evolution expansion, combat/stat/targeting/separation changes, altered progression/rewards/cooldowns, main merge or production release. Protected simulation, adapter, camera, asset renderer, round-loop and Stage5B files are unchanged. Sprite overlap/engagement staging remains a later presentation problem; these effects do not solve it.

## Evidence

- Theatre check: 112 geometry/lifecycle cases; expired marks disappear, repeated geometry is stable, Canvas state balances, 180-unit spell sampling is bounded, rapid casting cannot grow FX/marks beyond caps, and combat unit data is not mutated.
- Native Canvas: four spell types, T0/T5, 4/24/60/180 units, three effect ages (96 renders). Physical ground/ARC/QUAKE composites inspected at 100 ms, 350 ms and 2.2 seconds. Actual spawnFX dispatch exercised all ten fighters, heavy hits, fire and KO with bounded queues.
- Existing checks: 71 authored asset decodes; 8,220 camera bounds; 180 UI framing checks/60 authored presentation renders; canonical Sniper still selected on menus during AIM; pose reset; 24 terminal deterministic seeded matches; throwing listener/RAF protection; runtime JS syntax and HTML parity.
- Presentation CSS parsed including declarations/media queries. This is syntax verification, not browser layout QA.

Browser layout/tap and real iPhone visual/performance QA remain open. Native Canvas renders omit the HTML UI. No subjective device pass or FPS claim.

## Phone acceptance

1. Home → Draft → Ready → Battle → Results, then Guide/Bay/Lab: readable sunny panels, usable controls, complete heads/boots/weapons, no unwanted horizontal overflow. On short phones Home may scroll rather than compress fighter art.
2. At 1×, heavy impacts lift dirt/chips and leave branching ground damage. Dragon fire/ARC leave char; QUAKE fractures and dirt settle. Damage follows the arena as the camera reframes and fades without accumulating indefinitely.
3. ARC's bright strike registers then clears; BLOOM growth and AEGIS protection stay distinguishable. T5 feels stronger without hiding fighter identity. Test a lethal ARC.
4. Comic words sit above fighters; only one spell ribbon appears, including unlimited Lab casting. HUD and spell controls remain tappable.
5. Multiple rounds/new battles: no defeated pose leak or accumulated ground damage across a new battle. Density limits work at approximately 180 visible fighters; compare phone performance against Turn 2.

Continue next with arena/floor cohesion, overlap/readability and measured phone performance after feedback. Keep evolution art postponed until this presentation phase is approved.
