# Completed first evolution roster and launch presentation

Goblin and Barbarian complete the ten-fighter Evolved roster. All fighters use Base at L1, new Evolved art from L2, a restrained procedural gold accent at L3, their Ultimate ability at L4, and the stronger ability plus accent at L5. Dedicated Ultimate artwork remains absent: L4/L5 truthfully fall back to Evolved. The existing five-level mechanics and +40% compounded HP/damage upgrades are unchanged by this release.

## Authored registration

Each pack has seven distinct poses and a portrait. Canonical sources, exact generation prompts, source sheets, and registration manifests are in `tools/art-spike/goblin/evolved/` and `tools/art-spike/barbarian/evolved/`. Reproducible preparation is in `tools/prep-evolved-goblin.py` and `tools/prep-evolved-barbarian.py`.

Goblin preserves the approved olive bald head, long ears, hooked nose, pale eyes, grin, bare feet, and one blade. The broader ragged shoulder leather and orange scarf tail earn a new silhouette. The source attack and defeat hid the empty hand; a dedicated two-pose repair restores both visible hands, both feet and one complete blade. Original sheet extraction uses .4 scale; repaired attack/defeat are calibrated by ear span (323/551 and 323/527 respectively), then use the same runtime pixel scale. Reference height 164.4, scale 1.16, native right facing. Individual feet and blade/torso cues are registered. Goblin retains the small camera size.

Barbarian preserves the face, tan skin, dark topknot and a single double-bitted axe with one shaft. Fuller fur shoulders, studded leather apron, bracers and fur-trimmed boots provide the first evolution. All seven source poses retain both hands and the complete axe. Shared .4 extraction, reference height 155.6, runtime scale 1.16, native right facing; individual ground and weapon anchors.

Dragon Base's refreshed portrait and seven poses were separately published at `463b2031331475d1d9cb246068e59378bc160e26` (tree `5dc0932511175bf925d06622fe0b30740ac835cb`). Other approved Base art and Dragon Evolved are preserved.

## Launch screen, PWA and Guide

A generated Knight/Dragon emblem replaces the legacy generic icon. Full source and prompt are in `tools/art-spike/app-icon/`; PNG exports include 192/512 icons, a separate padded maskable icon, 180px Apple touch icon and 32px favicon. Root and `/v3` load the manifest and icons. The root worker replaces the legacy v26 cache, uses network-first fetches and falls back to previously visited assets offline; this is not a promise of a fully preloaded offline game. Existing saved progress is untouched.

The sunny launch screen stages the full approved Knight and refreshed Dragon in a contained duel panel, with clear Quick/Draft actions and three secondary destinations. Short/landscape layouts and reduced-motion rules are retained. `tools/review-mobile.html` provides a development-only iframe viewport harness for actual browser review at 320×568, 390×844, 430×932 and 844×390; it does not emulate iPhone hardware.

The Fighter Guide uses the live Ultimate specs, lists all ten L4 abilities and L5 enhancements, gives matchup/positioning tips, compares real L1/L2 portraits, and explains every art/effect level, compounded HP/damage, match-level reset, the L5 cap and separate permanent Mastery. Ultimate artwork is explicitly marked in development.

Two concrete presentation fixes: defeated Goblin/Goose retain small size and Beetank/Turtle retain heavy size; round introductions now label L5 as V instead of IV. Match rules, balancing and protected simulation/terminal/RAF paths are unchanged.

## Validation

- 160 authored WebPs decode; all ten Base/Evolved pose packs present.
- All ten evolution boundaries, actual seven-pose drawing, shared scale, mirrored cues, failed-pose fallback; 4,110 viewport/staging envelope cases per Evolved pack.
- Goblin and Barbarian native Base/Evolved contact sheets inspected; four daylight arenas in duels and mixed melee plus 24/180 density cases inspected/exercised. Feet, ears/hair, scarf and weapon ends retained.
- Native five-tier/effect render; all ten Ultimate cues bounded and Canvas-balanced in full/reduced/minimal modes.
- L1–L5 rules and all ten ability regressions; 24 mixed-level and 24 baseline seeded matches terminal and deterministic; exception/RAF safeguards passed.
- Camera, crowd/staging, skyline/floors, bounded effects, theatre, terminal caption and combat-cue checks passed.
- Guide actual render function, exact live ability text, twenty Base/Evolved previews, compounded levels, manifest/Apple hooks, dimensions/opaque icon exports, and worker legacy-cache/network-first/offline behavior checked.
- Native rendering and automated viewport review do not establish physical-phone FPS or phone approval. Dense melee overlap still merits device review. Dedicated Ultimate art and further balance tuning remain future bounded milestones.

Browser review and deployment receipts are recorded after publication in the handoff/release notes.


### Public release receipt and browser follow-up

PR #9 merged tested review head `b055bd868a087932b8b6391dc10d823db79eb84a` as production `c5037b61a3d2ef51e7cbacde5408081c8831321d`; tree `3d7b5be8aa838aeb258082836544b94a1af2f903`. Vercel deployment `dpl_HTjMaAqzvvKbEa6TsozgV8ergijt` reported READY/production with `showdownlab.vercel.app` assigned. Sixteen public HTML, manifest/icon/worker/module/style/art responses byte-matched that tree.

Public browser review verified the 390px sunny launch screen, live Guide text for all ten L4/L5 abilities and progression table, 320×568 home without scrolling/horizontal overflow and all touch targets >=48px, and active Quick combat. Console errors observed were browser-extension metadata errors, not game errors. Landscape review exposed the legacy 430px shell squeezing the two-column home hero; the follow-up widens only the active home shell in landscape and versions the stylesheet. Native scene tests remain separate from physical-device FPS/approval.
