# Dragon Evolved registration and release follow-through

Continuation base: production hotfix `ba58c3d88215847e3234a727abf8eb931b803f41`. Review branch remains `art-spike-knight-authored-v1`; Dragon work is a new branch checkpoint, not included in the production release.

## Release state

The user requested merge to main. PR #7 was updated to its full authored-roster/presentation scope and merged at exact head `303c51a48e828979e8616cc949646d3b506e437a`, producing `fb9f3c925eb27f15d5e2e37c6d45baa86181f136`. Its tree matched the tested checkpoint. Vercel production was confirmed READY with that SHA and the public alias `https://showdownlab.vercel.app/`. HTML, Sniper metadata, staging code and Verdant floor returned 200 and matched release bytes.

The public browser exercised Home → Guide → Home → Quick Ready → Battle at 1×/10× → seven-round match-complete overlay → Results → Home. Application logs exposed the `cap` shadowing error on last-fighter/final-KO emission. The minimal production hotfix renamed the queue constant and added a regression reproducing the original error; see `FX_CAPTION_HOTFIX.md`. Production is now READY at `ba58c3d88215847e3234a727abf8eb931b803f41`, with byte-matching HTML/runtime. After reload, a one-life 10× Lab Knight/Sniper vs Dragon-preset match reached its victory overlay; no new application-origin errors were recorded during that run. This cloud-browser smoke is not phone approval or an iPhone FPS measurement. New Dragon art is kept on the review branch.

## Art contract and preparation

Dragon Evolved preserves the angular red face, amber eyes, two swept tan head horns, four clawed legs, two red/orange bat wings, gold-orange underside and single curling tail. Scarlet overlapping chest/shoulder scutes, reinforced segmented wing spars and a stronger dorsal ridge give the silhouette its Evolved read. There is no new humanoid equipment, glow form or gameplay ability.

Built-in imagegen produced one canonical and a seven-pose 3/3/1 sheet. The move cell hid one forefoot; it was excluded and repaired with a single pose showing four distinct feet. Other poses retain complete sheet components. Only low-alpha border noise below 8 is discarded before extraction. Approved Base files remain unchanged.

Exact prompts, lossless source WebPs and registration/QA manifest are in `tools/art-spike/dragon/evolved/`. `tools/prep-evolved-dragon.py` uses .4 source scale for the sheet and .4 × 270/750 for the larger repaired pose, calibrated to horn-to-front-foot anatomy. Guard/defeat are not enlarged to standing height. Runtime scale is 1.36, with a shared 150.8px reference height and manually registered feet. Rectangle outputs retain full wing/tail/horn ends with transparent margins. Editorial identity/equipment scores are 9/10 and pose clarity at least 8.5/10; these are manual judgments, not machine scores or phone acceptance.

An empty portrait export was caught before publication and rebuilt. Preparation now decodes a temporary WebP before atomically replacing each runtime file. Native review checks also require every authored portrait/pose to finish decoding, rather than relying solely on an error count. This prevents an empty, still-loading asset from escaping review.

Seven poses are active for L5–9: idle, grounded move, jaw/claw attack, wing brace, breath wind-up, recoil hit and prone defeat. L1–4 retain Base; L10 temporarily uses Evolved while Ultimate is absent. Existing action mapping, pose holds, motion, fallback and facing are preserved. Registered attack/breath mouth positions and per-pose body positions use the existing form-specific cue API; fire begins at the mouth rather than the generic body cue. No effect count, particle lifetime, stats, targeting, damage, Mastery or EVOLVE frequency changes.

## Validation and remaining gates

PASS: 120 authored and six arena WebPs decode. Five Evolved packs each pass 4,110 camera/staging envelope cases, including 320×568 portrait, short landscape and 180 units. All seven actual Dragon poses use the shared source scale; failed Evolved attack falls back to Base. Mouth/claw cues mirror and remain within the complete equipment envelope. Wider native contact-sheet columns preserve the full Dragon wing extent during review.

PASS: native Base/Evolved contact sheet and four-arena breath/brace composites were visually inspected. Eight additional active L5/L10 24/180-unit scenes pass effect budgets, all-asset readiness and balanced Canvas state. Existing 9,540 staging bounds, 8,220 camera bounds, contact-side/ordering/dense-transition checks, floor/cache/fallback, skyline, ambience/reduced motion and physical theatre checks pass. Twenty-four seeded matches remain terminal/deterministic, with listener exception and RAF safeguards intact. Terminal caption regression, runtime parsing, HTML parity and diff checks pass.

Reproduce with `python tools/prep-evolved-dragon.py`, `python tools/check-authored-assets.py`, `node tools/check-evolution-packs.cjs`, `node tools/check-fx-terminal.cjs`, and `node tools/render-evolution-review.cjs dragon`. Native arena review: `node tools/check-dragon-scenes.cjs [output.png]`, with `@napi-rs/canvas` available.

Phone review for the new head remains OPEN: wings/horns/feet across pose transitions, broader silhouette in mixed crowds, mouth/fire alignment, target facing, menu/Results form framing, portrait/landscape cropping, cold asset load and ordinary/extreme frame pacing. Large melee overlap remains. No claim that native renders or the production cloud-browser smoke establish iPhone performance. Next Evolved candidates are Assassin, Mole, Turtle, Goblin and Barbarian; Ultimate art is still absent.
