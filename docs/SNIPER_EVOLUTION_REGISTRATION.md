# Sniper Evolved registration checkpoint

Continues from `292526e824e2b8293f022aa67f29ce033dd8478d` on `art-spike-knight-authored-v1`. Branch review only; main and production are unchanged.

## Art and registration

Sniper joins Knight, Beetank and Goose as an active Evolved pilot. L1–4 retain approved Base art; L5–9 select Evolved, with Evolved fallback at L10 while Ultimate is absent. No stats, combat behavior, Mastery or evolution-frequency changes.

The new silhouette keeps the approved youthful face, navy hood, tan scarf, grey segmented armour, boots and one scoped rifle. Two angular coat tails, a three-cartridge shoulder roll and reinforced stock/barrel distinguish Evolved. The actual approved reference is hooded; historical references to a hat are superseded.

Built-in imagegen produced one canonical, one seven-pose sheet and one targeted two-pose repair. The initial move barrel touched the attack coat; that entire combined component is rejected. Only those two poses use the repair source. Sources and exact prompts are in `tools/art-spike/sniper/evolved/`; lossless WebP sources preserve generated alpha. No Base artwork was regenerated or modified.

`tools/prep-evolved-sniper.py` extracts complete alpha components into rectangular lossless WebPs with transparent margins and a one-pixel outer outline. The original sheet uses .4 source scale; both repaired poses use the same .4 × 510/743 calibration to match original standing anatomy. Crouched and prone poses are not expanded to standing height. Runtime reference height is 204px with 1.26 scale and individually registered feet. Editorial identity/equipment scores are 9/10 and pose clarity at least 8.5/10; these are inspection judgments, not automated measurements or phone approval.

Seven registered poses: idle, move, attack, guard, signature (kneeling scoped aim), hit and prone defeat. Evolved-only action overrides select move for movement/retreat and guard for close defence; Base mappings remain unchanged. Form-keyed holds, motion, facing and optional-asset fallback remain active.

Standing and kneeling muzzle positions and per-pose body impact positions are registered in the pose metadata. `FighterAssets.cueOffset()` projects them by shared scale/facing; `fighterCue()` uses them before its existing generic anchor. This prevents the longer rifle from emitting shots at its torso and keeps kneeling shots lower. Other pilots and Base cues retain their existing path. No extra effect queues or per-frame image processing are added.

## Validation

- 112 authored WebPs and five arena WebPs decode; all packs exist.
- Four active Evolved packs each pass 4,110 registered camera/staging cases, including short portrait, landscape and up to 180 units. Actual renderer checks cover all seven poses, shared scale, native facing and failed Evolved attack fallback.
- 8,220 existing camera bounds and 9,540 staging bounds pass; simulation objects remain unchanged.
- Standing/kneeling weapon cues are inside the equipment envelope and mirror correctly; native attack emission matches the registered muzzle.
- Four native 390×844 arena composites and eight additional 24/180-unit active L5/L10 scenes pass asset/error, effect-budget and Canvas-state checks. The Base/Evolved contact sheet and four-arena composite were visually inspected.
- Existing floor-cache, skyline, ambience, physical wakes/honk, reduced motion and theatre checks pass. Twenty-four seeded matches remain terminal/deterministic; listener exception isolation, continued RAF scheduling, JavaScript parsing and HTML parity pass.

Reproduce with `python tools/prep-evolved-sniper.py`, `python tools/check-authored-assets.py`, `node tools/check-evolution-packs.cjs`, and `node tools/render-evolution-review.cjs sniper`. Native checks require `@napi-rs/canvas`; run `node tools/check-sniper-scenes.cjs [output.png]` for arena/shot checks. Render exports are review evidence, not runtime assets.

## Deployment and phone gates

The incoming checkpoint's GitHub Vercel checks succeeded. Deployment `dpl_2RBr2NfYqPrH9F58XVviMUyneeog` was confirmed READY with commit `292526e824e2b8293f022aa67f29ce033dd8478d`, preview `https://showdownlab-2e3bjilnu-danickmans-projects.vercel.app/`. Direct browser access reached Vercel Authentication; the connector's protected fetch returned 403 at `read_protection_bypass`. No repeated retry or protection change was attempted. Live preview inspection is therefore blocked, not passed.

Exact-head phone review remains OPEN: full rifle/boots/coat bounds, pose switching and retreated movement, standing/kneeling muzzle alignment, crowd contact/readability, portrait/landscape UI and cold asset load, plus measured ordinary/extreme frame pacing and reduced motion. Native composites still show crowded overlap; they do not establish phone FPS. Current sunny arena art/materials/effects are preserved. Follow with evidence-led crowd/floor polish after this bounded pack; do not imply those issues are solved by art registration.

Protected core, adapter, Stage5B roster ownership, round loop, terminal fixes and exception/RAF guards are unchanged. Freeze and merge only an exact head explicitly approved on phone; keep the single main/production release event.
