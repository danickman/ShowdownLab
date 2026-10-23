# Source bitmap caching at 300 — 22 October 2026

**QA-only source interceptor. Never shipped by this commit.**

Earlier 300 sprite-mask cache showed ZERO runtime use. This distinct experiment caches the genuine authored image actually drawn on every frame. At >=160 fighters only, a shared 96-source LRU pre-scales 256-pixel-long-edge Canvas bitmaps. All 300 genuine fighter sprites, actions, positions, teams, animations, rings, level accents and every combat/HP step remain present. The 20/40/80/120 path is entirely unchanged. Native art sharpness may change at 300 and needs direct screenshot comparison before any future promotion.

Two alternating A/B sets at 430×932 DPR3, real Linux Chromium, each speed 1× and 10×, >=10 seconds per arm, real HP damage and positive ticks, uncensored P95 RAF intervals, genuine cache build/hit/draw counters. Strict promotion: **P95 <=80% of baseline in EVERY matched trial and >=95% baseline real ticks/sec each trial**, plus actual image quality review. A successful research job is not proof of a performance fix.

No playable engine, v3 runtime, root 42 pinned digests, service worker, preview, main or production modified.
