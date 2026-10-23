# 300 prefiltered ink mask study — 22 October 2026

**Source-only research candidate. Not playable.**

At high crowd density the actual evolved-art renderer executes a live Canvas brightness(0) filter on each outlined sprite each frame. Candidate `fast300-ink-candidate.cjs` converts the same authored image into a black alpha silhouette once and caches by decoded image, drawing it with original black shadow size, opacity, transformed position and animation. Cap source-mask side to 512px; small antialiasing differences require visual inspection. The original sprite, level accents, team ring, fighter count, collision, exact physics and all FX stay present.

`check-fast300-ink-browser.cjs` compares the original and source-intercepted art renderer (core LegacySimCore untouched), on true Chromium 430x932 DPR3, 300 real HP-damaging fighters and both 1x/10x speeds, alternating order with noncensored RAF P95, actual ticks/sec and reuse counters.

Predeclared acceptance: <=.80 P95 ratio **in each matched pair**, >=95% real ticks/second versus original in each pair and visual parity/legibility plus physical Safari QA. CI success does not imply candidate passes acceptance. No playable runtime files, root hashes, 42 SHA256 pins, service workers, main, preview or prod modified. Pending recorded research measurements.
