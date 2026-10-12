# Assassin Evolved registration

Continuation base: review checkpoint `b8c2bafadc218a7ffbe14f9b7ccdaa49d5b9a547` on `art-spike-knight-authored-v1`. Production remains the released caption hotfix `ba58c3d88215847e3234a727abf8eb931b803f41`. Dragon and Assassin are new review art.

## Art and registration

Assassin preserves the lean human body, narrow exposed tan brow/eyes, charcoal face mask, pointed violet-lined hood, grey segmented armour, dark boots and exactly two steel daggers, one in each hand. Stepped shoulder guards, reinforced bracers and long separated violet-lined coat tails give Evolved its physical silhouette. No glow, ghost duplicate or additional weapon is baked into the art.

Built-in imagegen created a canonical and a 3/3/1 sheet. The sheet's move and attack silhouettes touched, and the leading attack blade had insufficient edge clearance. Both are excluded; a separate two-pose repair supplies the complete silhouettes. Other five poses use their complete connected components. Extraction removes low-alpha generated background outside the component's two-pixel edge band; no cloth, foot or blade is trimmed to fit a square.

Exact prompts and lossless source WebPs are in `tools/art-spike/assassin/evolved/`. Preparation is `tools/prep-evolved-assassin.py`; source bounds, feet and editorial review scores are in its manifest. Original sheet scale is .4; repair move and attack use .4 × 125/194 and .4 × 125/173, calibrated to hood-to-chin anatomy rather than pose height. Every prepared sprite uses runtime scale 1.28 / reference height 194, individual ground anchors and transparent margins. Crouches and defeat retain anatomical size. Runtime WebPs are decoded before replacement.

Seven poses are registered: idle, stalk/disengage move, backstab attack, guard, coiled vanish signature, recoil hit and seated defeat. Evolved guard maps to its authored guard; Base action mapping is preserved. L1–4 remain Base, L5–9 select Evolved, and L10 uses Evolved until Ultimate exists. Leading dagger and per-pose body cues use the existing form-specific cue API. Existing effects, pose holds, facing and Base fallback remain.

## Validation and open gates

PASS: 128 authored WebPs and six arena WebPs decode. Six Evolved packs each pass 4,110 camera/staging bounds across portrait/landscape, edge layouts and 2–180 fighters. Actual pose rendering uses a common prepared-pixel scale; all seven Assassin actions select their registered files. Failed Evolved attacks fall back to Base. Dagger cues mirror within the full coat/blade envelope and Base cues remain unchanged.

Native Base/Evolved contact sheet and eight four-arena duel/mixed-crowd composites were visually inspected. Eight additional active L5/L10 scenes at 24/180 fighters pass bounded effects, asset readiness and Canvas-state checks. Backstab's emitted impact arc starts at the registered leading dagger. Existing contact-aware staging, camera, sunny floor/skyline framing, reduced motion, physical effects and terminal-caption regressions pass. Twenty-four seeded matches remain deterministic and terminal; listener exception and RAF safeguards pass. HTML copies match and runtime/diff checks pass.

Editorial identity/equipment ratings are 9/10 and pose clarity at least 8.5/10. They are manual judgments, not automated scores or phone acceptance. Full feet, coat ends and both blades are visible in the contact sheet. Mixed melee still overlaps in the native arena composites.

Reproduce with `python tools/prep-evolved-assassin.py`, `python tools/check-authored-assets.py`, `node tools/check-evolution-packs.cjs`, `node tools/render-evolution-review.cjs assassin` and `node tools/check-assassin-scenes.cjs [output.png]`. Native render tools require `@napi-rs/canvas`.

Exact-head phone approval remains OPEN: transitions, target-facing blades, vanish opacity, mixed-crowd readability, portrait/landscape framing, menu/Results form framing, cold loading and ordinary/extreme frame pacing. Main and production are unchanged. Next candidates are Mole, Turtle, Goblin and Barbarian; Ultimate artwork is absent. No combat, stats, Mastery, evolution frequency or roster changes.
