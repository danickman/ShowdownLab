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


## Turn 6 — bounded melee staging pilot (2026-10-08)

This follow-through supersedes the earlier decision to defer presentation offsets. `v3/combat-staging.js` now owns one presentation transform shared by fighters, shadows/rings, target-facing cues, weapon/body anchors, comic captions and spotlights. No simulation unit is modified. Nearby fighters in groups of 2–44 receive at most 14 CSS pixels horizontally and 6 vertically; isolated fighters settle back smoothly. ID rank is stable across snapshot array order. At more than 44 living fighters, separation work is bypassed and previous offsets relax away. This is a modest ordinary-melee improvement, not a claim that extreme armies become individually readable.

Ground damage, spell impacts and defeat records capture a copy of the offset where the impact occurred. Existing cracks/char/dirt remain at that location rather than following a fighter that walks away. Offset storage is capped at 240; fallen offsets expire after one second and round/battle starts reset it. Camera padding reserves staging room; short viewports also cap the complete sprite height so Dragon does not exceed the floor area in landscape. No additional image generation or effect queues.

Changed runtime: `v3/combat-staging.js`, `v3/camera.js`, `v3/v3.js`, both HTML entry points. Checks: `tools/check-combat-staging.cjs`, adapted `tools/check-stage.cjs` and `tools/check-theatre.cjs`. Handoff/roadmap/test matrix updated.

Acceptance evidence:

- 9,540 complete authored boxes at initial/settled frames across five viewport sizes including landscape, six army sizes (2–180), clustered/corner/spread layouts and all ten fighters.
- Frozen combat objects unchanged; ID-order invariance, bounded spread, gradual settling, density bypass, defeat expiry, round reset, shared body/ground anchors and stationary emitted damage.
- Native before/after six-fighter melee and 180-fighter composite inspected. Ordinary overlap improves modestly; extreme overlap remains. Native all-arena action matrix and 96 spell renders pass with bounded queues and balanced Canvas state.
- Existing 8,220 camera bounds, 112 theatre lifecycle cases, floor-cache bounds, ten cue/recoil checks, 71 WebP decodes, 180 menu framing bounds/60 renders and 24 terminal deterministic matches/exception isolation pass.

Non-goals: targeting, engagement slots, simulation separation, outcomes, progression/evolutions, roster expansion, menu redesign, more art generation or production deployment. Sunny menus, shared skyline, physical ground damage and protected core/adapter/round-loop/Stage5B remain intact.

Phone acceptance remains OPEN: ordinary 1× melee should show clearer individual silhouettes without sliding feet, detached hits, misleading contact or cropping. Check round reset, lethal ARC, QUAKE/fire aftermath and menu/landscape framing. Measure ordinary and approximately 180-unit performance on a real phone. Approval of this exact branch head is required before the existing frozen-head/main/production release sequence.


## Turn 7 — latest phone corrections and environment extension

See [LIVING_ARENAS_PASS.md](LIVING_ARENAS_PASS.md) for the shortened opening, Guide layout, cached menu outlines, supplied-source Turtle repair and two new living daylight war settings. This supersedes the earlier all-four-same-location statement: academy/garden share one skyline, frontier and siege have distinct authored backdrops (three decodes). Live physical damage and bounded staging remain. Automated/native evidence passes; phone Guide layout, ambient visuals and measured ordinary/extreme performance remain OPEN. Eight small-source menu fighters still need approved original-source recovery. No main merge/production release or evolution work at this checkpoint.


## Skyline / cropping correction and Knight evolution pilot

See [SKYLINE_CROP_EVOLUTION_PILOT.md](SKYLINE_CROP_EVOLUTION_PILOT.md): complete Beetank ram re-extraction, six supplied standalone menu sources, larger portrait/landscape sky region and cached material/earth detail. Seven Knight Evolved candidate poses and canonical are stored in tools/art-spike/knight/evolved; not active runtime assets. Existing cap/model inspection is documented; gameplay state unchanged. Phone cropping/sky-floor/readability/performance and evolution-design approval remain OPEN. Main/production unchanged.


## Phone panorama / floor / spacing correction

See [LANDMARKS_FLOOR_SPACING.md](LANDMARKS_FLOOR_SPACING.md): full-width side landmarks with proportional architecture, stronger arena-specific cached floor identity, and body-aware ordinary melee staging up to 60 units with larger viewport-bounded caps. Camera/cues/ground impacts share positions; combat core/outcomes/evolution assets are unchanged. Native/automated checks pass; phone visual/contact/performance remains OPEN. No main merge or production deployment. This supersedes the earlier 14px/6px and 44-unit staging limits.


## Knight Evolved branch registration — 2026-10-08

See [KNIGHT_EVOLUTION_REGISTRATION.md](KNIGHT_EVOLUTION_REGISTRATION.md). Seven shared-scale poses now active for Knight L5+, with registered equipment bounds and L10 Evolved fallback. Lab permits L1–10. Automated/native checks pass; phone release gates remain OPEN. This supersedes the prior inactive-spike status. No main merge or production release.


## Beetank Evolved and academy floor — 2026-10-09

See [BEETANK_EVOLUTION_ARENA_PASS.md](BEETANK_EVOLUTION_ARENA_PASS.md) for assets, implementation, verification and open phone gates; [EVOLUTION_DESIGN_MAP.md](EVOLUTION_DESIGN_MAP.md) defines candidate directions for all ten. Knight + Beetank Evolved now select at L5+, with L10 fallback. Sunlit Lab gains authored ground, bounded physical rush wakes, level-aware MVP/captions and corrected Beetank facing. Base assets and combat rules are unchanged. Goose, then Sniper are next art priorities after pilot phone review. No main merge or production release.


## Goose Evolved and Verdant Ruins — 2026-10-11

See [GOOSE_EVOLUTION_VERDANT_PASS.md](GOOSE_EVOLUTION_VERDANT_PASS.md) for scope and validation. Three active Evolved pilots now include Goose, with seven registered poses and L10 fallback. Verdant gains a dedicated sunny skyline and honk gains a bounded grounded pressure wave with reduced-motion feather suppression. Automated and native render checks pass; exact-head phone gates remain OPEN. Sniper is next. This supersedes the previous two-pilot count. No main merge or production release.


## Sniper Evolved registration — 2026-10-11

See [SNIPER_EVOLUTION_REGISTRATION.md](SNIPER_EVOLUTION_REGISTRATION.md) for exact assets, targeted repair, shared anatomy calibration, registered feet and form-specific muzzle/body anchors. Four Evolved pilots (Knight, Beetank, Goose, Sniper) now select at L5+, with L10 fallback; 28 combat poses and 112 authored WebPs overall. Base sources, combat, stats, Mastery, evolution frequency and production remain unchanged. Automated/native checks pass; exact-head phone readability/FPS approval remains OPEN. Incoming Vercel deployment was READY, but live browser inspection was blocked by preview authentication and protected-fetch permissions. Crowd overlap remains visible in native composites. This supersedes the prior three-pilot count and Sniper-next status.


## Contact-aware staging and Verdant floor — 2026-10-11

See [CROWD_VERDANT_READABILITY_PASS.md](CROWD_VERDANT_READABILITY_PASS.md). Crowded ranks fan away from nearby opponents, and four bounded allied torso passes improve spacing inside the unchanged 56px/36px and 60-unit limits. Secondary per-unit labels are limited to small fights. Verdant gains a sunny moss/stone illustrated floor with one current image record and procedural fallback; academy art and live physical damage are retained. Actual seeded 1× before/after frames and four-arena native composites were inspected. Automated checks pass; larger melee overlap and exact-head phone motion/FPS approval remain OPEN. Approved Base/Evolved art, combat, progression, main and production are unchanged.


## Main release, effects hotfix and Dragon Evolved — 2026-10-11

The user authorised main merge of review head `303c51a`; PR #7 merged as `fb9f3c9` and Vercel production served its tested tree. A real public-browser smoke exposed last-fighter/final-KO caption shadowing, fixed on production in `ba58c3d` with a reproducing regression. Post-fix Lab termination passed without new application-origin errors. See [FX_CAPTION_HOTFIX.md](FX_CAPTION_HOTFIX.md).

Dragon Evolved is the next review checkpoint, based on the hotfix: seven registered poses, a repaired four-foot move, shared anatomy scale, full wing/horn/tail framing and mouth-aligned breath cues. Five packs / 35 Evolved combat poses / 120 authored WebPs now exist on the review branch. See [DRAGON_EVOLUTION_REGISTRATION.md](DRAGON_EVOLUTION_REGISTRATION.md). Approved Base files, combat and progression are unchanged. The new Dragon art is not released to main/production; new-head phone visual/FPS gates remain OPEN.


## Assassin Evolved — 2026-10-12

See [ASSASSIN_EVOLUTION_REGISTRATION.md](ASSASSIN_EVOLUTION_REGISTRATION.md). Seven registered combat poses plus a portrait preserve the hood, eyes, twin daggers and complete feet/coat tips. Two failed sheet poses are replaced with anatomy-calibrated move/attack repairs; dagger/body cues use existing effect contracts. Six packs / 42 Evolved combat poses / 128 authored WebPs now exist on the review branch. Asset decoding, actual pose/fallback rendering, six-pack equipment envelopes, eight duel/mixed-crowd arena composites and eight dense L5/L10 scenes pass, alongside deterministic and presentation regressions. Mixed melee overlap and exact-head phone motion/FPS remain OPEN. Base art, protected simulation, combat and progression are unchanged. Production remains `ba58c3d`; Dragon and Assassin are review-only. Mole, Turtle, Goblin and Barbarian remain, with Ultimate art absent.


## Five-level progression and Ultimate abilities — 2026-10-12

The user explicitly authorized a gameplay milestone and selected the L5 cap. See [FIVE_LEVEL_ULTIMATE_MILESTONE.md](FIVE_LEVEL_ULTIMATE_MILESTONE.md), which supersedes all earlier L1–4 / L5–9 / L10 form boundaries. L2 selects available Evolved art; L3 adds a restrained rim/ground accent. L4 unlocks a role-specific Ultimate ability, and L5 enhances it with a stronger accent; Ultimate art is still absent and falls back honestly to existing forms. HP and damage increase 40% multiplicatively at each upgrade. Mastery/base role stats, terminal safeguards and frozen roster remain. Both player and enemy drafts stop offering upgrades at L5; Lab/API/core inputs enforce the cap. Guide and authored reward previews describe actual abilities and pending art. Ability/progression/determinism/native effect checks are required alongside existing presentation regressions. Review-only; production remains `ba58c3d`. Balance and exact-head phone/FPS acceptance remain open.
