# 300 prefiltered ink mask study — 22 October 2026

**Source-only research candidate. Not playable.**

At high crowd density the actual evolved-art renderer executes a live Canvas brightness(0) filter on each outlined sprite each frame. Candidate `fast300-ink-candidate.cjs` converts the same authored image into a black alpha silhouette once and caches by decoded image, drawing it with original black shadow size, opacity, transformed position and animation. Cap source-mask side to 512px; small antialiasing differences require visual inspection. The original sprite, level accents, team ring, fighter count, collision, exact physics and all FX stay present.

`check-fast300-ink-browser.cjs` compares the original and source-intercepted art renderer (core LegacySimCore untouched), on true Chromium 430x932 DPR3, 300 real HP-damaging fighters and both 1x/10x speeds, alternating order with noncensored RAF P95, actual ticks/sec and reuse counters.

Predeclared acceptance: <=.80 P95 ratio **in each matched pair**, >=95% real ticks/second versus original in each pair and visual parity/legibility plus physical Safari QA. CI success does not imply candidate passes acceptance. No playable runtime files, root hashes, 42 SHA256 pins, service workers, main, preview or prod modified. See final rejected browser receipt below.


## Final source + real Chromium verdict — REJECT, no performance fix

Measured from real QA commit `bfe6de2fdbbcb9910ff0abf3af05ff86153a3f52` in [Actions 39892114427](https://github.com/danickman/ShowdownLab/actions/runs/39892114427), research artifact [fast300-ink-raster-research #12474987306](https://github.com/danickman/ShowdownLab/actions/runs/39892114427/artifacts/12474987306). Chromium genuinely ran 300 L1/L4/L5 source fighters, all authored sprites/FX, positive HP loss, real ticks, 430×932 DPR3 and uncensored 10-second+ RAF intervals for eight arms.

| Speed/trial | Baseline P95 | Candidate P95 | True baseline / candidate TPS |
|---|---:|---:|---:|
| 1× A | 300ms | 300ms | 27.89 / 27.74 |
| 1× B | 266.6ms | 266.7ms | 25.60 / 25.45 |
| 10× A | 583.3ms | 633.4ms | 145.88 / 145.84 |
| 10× B | 666.7ms | 683.3ms | 185.50 / 179.20 |

**Critical causal finding:** in ALL four candidate live-browser cases, the instrumentation recorded `builds:0,hits:0,draws:0`. The per-frame `inkBoost` Canvas filter exists in source but is not reached by this 300-fighter art/level mix, so the candidate is functionally INACTIVE. The browser job correctly failed `no real sprite-mask reuse` instead of claiming performance promotion. Even if forced artificially it would not be proven visual-equivalent or relevant. Do not try again without evidence that the actual production art path exercises the filter. Existing dark outlines still retained. Actual-combat physics source and playable rendering were never modified.

The trial's CI failure reflects an intentional falsification guard on RESEARCH, NOT a broken production build. All other completed mandatory quality checks were green. Job archived behind manual dispatch, no repeated expensive A/B on normal PR pushes. 300-fighter absolute RAF latency P1 remains OPEN; no iPhone Safari FPS claim, no merge/production deployment.
