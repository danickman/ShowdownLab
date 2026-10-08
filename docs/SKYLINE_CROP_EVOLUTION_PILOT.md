# Skyline composition, source cropping and first evolution pilot

User feedback: Beetank special and other poses appear cropped; skybox occupies too little screen and broad floor feels bland. User authorizes the first evolution image set and provides standalone originals. Integration branch only; main and production unchanged.

## Presentation changes

- Beetank ram source crosses the nominal bottom-row cell boundary at x=459. The horn was severed by extraction. Explicit crop `(55,410,525,714)` preserves the complete horn, shell and feet; normalized 96px combat WebP retains transparent margins. The subsequent whole-sheet audit uses `python3 tools/repair-source-boundaries.py` to preserve the same complete figure without grid cuts. The source sheet is unchanged.
- Six standalone originals improve menu detail: Knight (planted shield stance), Beetank, Goblin, Goose, Barbarian and Mole. Source copies/crops are in `tools/art-sources/presentation-crops.json`; use `python3 tools/prep-presentation-art.py`. Goose's detached ground sketch is removed by component isolation. Sniper, Turtle, Dragon and Assassin retain approved presentation sources. Menu framing still uses contain and preserves aspect ratio.
- Portrait skyline grows from 23.5% to 34% of Canvas height; landscape gets 28%. Camera floor begins at 35%/29%, with full-sprite reserves and landscape size limits retained. Combat world positions, ranges and targeting are unchanged.
- Cached floor gains worn stone highlights, material marks, garden moss, larger frontier/siege earth deposits, old fractures and chips. Central contrast stays restrained. Live cracks, scorch, dirt, debris and spell aftermath remain above the cache. No new persistent queues or per-unit filters. Existing ambience automatically occupies the larger sky region.

## Evolution model inspection and proposed representation

Current adapter tracks numeric per-team/per-type `levels`, separate persistent `mastery`, and passes both to the core. `applyDraft(up)` already limits numeric level to 10, but start normalization lacks an upper clamp. Lab sliders currently stop at 4. Reward availability and labels still need a deliberate cap/frequency pass before runtime evolution integration.

Keep level as 1–10 gameplay progression. Derive authored form: Base 1–4, Evolved 5–9, Ultimate 10. Derive procedural prestige within form (Base level minus 1, Evolved level minus 5, Ultimate 0); keep combat modifiers from existing level/stat rules and Mastery as independent input. Renderer form selection should resolve an approved form pose pack, falling back to Base while a form has no accepted assets. Do not duplicate derived state that can drift from level. Future reward choices must exclude level-10 fighters and reduce EVOLVE frequency while preserving Quick timer/autopick and deliberate Draft selection.

This turn generates a Knight Evolved art pilot only, outside active runtime mappings. No stat/evolution/reward changes, Ultimate generation or all-roster batch. Canonical uses Base closed helmet, blue tabard, spear and kite shield, with reinforced layered shoulders and brass-edged equipment. A targeted canonical repair changes the erroneous rear spearhead to a blunt butt cap. The subsequent seven-pose sheet is an evaluation candidate, not automatic user approval. Preserve good poses and selectively repair failures; never regenerate approved Base art to fix rendering.

## Checks and remaining gate

Passed: 80 active WebP decodes, 8,220 camera sprite bounds, 9,540 staged bounds across portrait/landscape and 2–180 units, floor cache lifecycle and 1.21M pixel budget, 16 all-arena ordinary/dense action scenes, 64 ambient cases/reduced-motion bypass, cue/theatre checks, physical impact renders, and 24 repeatable seeded terminal matches including callback-failure/RAF safeguards.

Native Canvas renders visually inspected. Phone QA remains open: complete Beetank ram horn during movement, Guide full body/equipment, larger skyline with readable fighters, floor material versus live damage, ordinary and 180-unit performance. Source cropping inspection confirms Beetank's specific defect; it does not claim all possible phone cropping reports resolved. No main merge or production deployment until exact-head phone release approval.

## Evolution extraction and decision

`tools/prep-evolved-knight.py` isolates the seven connected figures, rather than splitting nominal grid cells which would cut wide spears. `tools/art-spike/knight/evolved/manifest.json` records component bounds, alpha bounds and provisional human visual scores. Source WebPs preserve the canonical/sheet, seven 96px poses share the existing 91px foot line, and the presentation canonical is 512px. All extracted assets decode and retain transparent margins. Long thrust/charge equipment reduces packed body scale in a square; pose-wise registration/body scaling must be evaluated before runtime activation. Canonical, design and motion are candidate quality, pending user visual approval; no automatic evolution activation.

## Full-source boundary audit

The wider source audit confirms 19 poses crossing nominal grid cuts: Goblin idle/move/attack/signature (4); Mole idle/move/attack/signature/hit (5); Beetank idle/attack/signature/hit (4); Goose move/attack/guard/defeat (4); Barbarian move/attack (2). Repairs isolate the complete connected fighter from each approved full sheet, retain antialiased margins, and normalize to the existing 96px/91px foot line. No fighter redesign. `tools/art-sources/boundary-repairs.json` records source and output bounds. Visual contact-sheet review confirms complete horns, claws, wings, heads and weapons. Source component boundaries are appropriate to these reviewed sheets, not a general guarantee for disconnected or overlapping future artwork. Rechecked all 80 active decodes, 16 all-arena action cases and 24 seeded terminal matches after repairs.
