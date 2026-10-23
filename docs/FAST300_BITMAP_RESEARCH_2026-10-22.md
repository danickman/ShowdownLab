# Source bitmap caching at 300 — 22 October 2026

**QA-only source interceptor. Never shipped by this commit.**

Earlier 300 sprite-mask cache showed ZERO runtime use. This distinct experiment caches the genuine authored image actually drawn on every frame. At >=160 fighters only, a shared 96-source LRU pre-scales 256-pixel-long-edge Canvas bitmaps. All 300 genuine fighter sprites, actions, positions, teams, animations, rings, level accents and every combat/HP step remain present. The 20/40/80/120 path is entirely unchanged. Native art sharpness may change at 300 and needs direct screenshot comparison before any future promotion.

Two alternating A/B sets at 430×932 DPR3, real Linux Chromium, each speed 1× and 10×, >=10 seconds per arm, real HP damage and positive ticks, uncensored P95 RAF intervals, genuine cache build/hit/draw counters. Strict promotion: **P95 <=80% of baseline in EVERY matched trial and >=95% baseline real ticks/sec each trial**, plus actual image quality review. A successful research job is not proof of a performance fix.

No playable engine, v3 runtime, root 42 pinned digests, service worker, preview, main or production modified.

## Actual 430×932 DPR3 Chromium verdict — REJECT

Run [39895828827](https://github.com/danickman/ShowdownLab/actions/runs/39895828827), exact candidate source-only HEAD `e979753c63f8536d41adb21e54d597f35809c77a`; research job `fast300-bitmap-one-shot` ID `120226291115` ended in a meaningful no-op/reuse assertion failure. All eight arms had real 300 fighters, measurable HP loss, real simulation ticks, and uncensored >=10s samples. Chromium source-injected candidate draws were actually measured. The alternate-order paired results:

| Speed, replicate | Baseline RAF P95 | Cached bitmap P95 | Ratio (candidate / baseline) | Baseline / candidate true ticks/sec | Source bitmap builds / hits / draws |
|---|---:|---:|---:|---:|---:|
| 1× A | 300.0 ms | 283.3 ms | .944 | 27.58 / 27.88 | 1 / 131 / 132 |
| 1× B | 266.7 ms | 283.3 ms | 1.062 (worse) | 25.95 / 25.83 | 1 / 108 / 109 |
| 10× A | 633.4 ms | 633.3 ms | 1.000 | 146.15 / 145.47 | 1 / 5 / 6 |
| 10× B | 683.3 ms | 633.3 ms | .927 | 180.63 / 184.19 | 1 / 8 / 9 |

**Causal finding:** only ONE original source image per candidate browser arm exceeded the cache's 256-pixel downsample threshold. At 10× it was reused merely 5–8 times (6–9 draws), rather than meaningful crowd-wide reuse. The real combat source image workload is already mostly at/below 256 pixels; this candidate is effectively marginal and fails the predeclared per-pair >=20% P95 improvement, with one 1× regression. The test correctly failed its >20 hit/draw eligibility assertion for both 10× arms. Promoting this would unnecessarily risk authored image crispness for no robust benefit.

Archived the expensive one-shot job behind `workflow_dispatch` without lowering performance or fidelity thresholds. No playable runtime, simulation logic, level art, 42 root hashes, SW, main, preview, or production modified. Native Safari P1 remains OPEN. Next major improvement must attack verified per-frame physics/main-thread scheduling or use an architecture with genuinely isolated image/physics rendering; do not recycle inactive raster caches or accepted front QA.
