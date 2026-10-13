# Dragon Base refresh — user-authorized exception

The user explicitly requested regenerating Dragon Base because the existing image looked poor. This supersedes the preserve-Base rule for Dragon only. Other Base assets and all Dragon Evolved assets remain unchanged. Continuation review head is `61a13c1`; production release is `8cb8e5`.

The refresh replaces the portrait and all seven Base combat poses together. Red angular face/amber eyes, two swept tan head horns, four clawed legs, two orange/red bat wings, gold-orange underside and one curled tail remain. Clean dark comic ink and faceted sunny shading replace the soft low-resolution/chroma-fringed read. Base retains simpler scales and wing bones than Evolved, without its chest mantle or reinforced spars.

Exact prompts and lossless sources are in `tools/art-spike/dragon/base-refresh/`. The sheet's defeat hid one front foot; it was excluded and repaired with four separately visible feet. `tools/prep-base-dragon.py` extracts complete silhouettes with .4 sheet scale and .4 × 117/284 repair scale, calibrated to facial frill/snout anatomy. Every prepared pose uses runtime scale 1.36 / reference height 148 and individually registered feet. Portrait stays 512×512; combat outputs are complete padded rectangles rather than shrinking wings to a fixed square.

`v3/base-dragon.js` registers Base feet/body/mouth cues. Renderer supports optional Base registrations while keeping actual form selection L1 Base / L2 Evolved. Source assets decode once; URL enumeration deduplicates the Base registry. Failed Ultimate falls through Evolved, then registered Base, then the existing procedural fallback. The refreshed Base uses its own prepared ink rather than an additional enlarged black silhouette. Evolved ink/scales/files remain untouched.

PASS: 144 authored/six arena images decode; seven Base poses rendered in the native Base/Evolved contact sheet. Base Dragon passes 4,110 complete wing/horn/foot/tail camera/staging cases at 320×568 through desktop, including 180 fighters. Mouth cues mirror and emitted Base breath aligns with the registered mouth. Four native daylight Base scenes and eight 24/180-unit Base scenes pass readiness, bounded FX and balanced Canvas state. Eight Evolved packs and existing presentation, reduced-motion, terminal, fallback and deterministic guards remain required.

Editorial identity/equipment ratings are 9/10 and pose clarity at least 8.5/10, with no critical frame/equipment defect. These are manual judgments. Phone FPS/pose transitions and crowded melee acceptance remain open. Combat/progression/Mastery are unchanged.

Reproduce with `python tools/prep-base-dragon.py`, `node tools/check-dragon-base.cjs`, `node tools/render-evolution-review.cjs dragon`, and `node tools/check-dragon-base-scenes.cjs [output.png]` (native Canvas dependency).

Remaining focused sequence: finish Goblin and Barbarian Evolved, review concrete mechanic/presentation defects, full release QA, then user-authorized deployment. Dedicated Ultimate art remains a separate later milestone.
