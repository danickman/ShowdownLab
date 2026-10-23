# 300 fighter exact current-raster physical grid study — 22 October 2026

**QA-only source intercept; unpromoted.** Historical target-grid source experiment improved core CPU but did not reduce visible frames on the old 2× dense raster. Today the playable renderer uses 1× at 300/1× speed and 0.85× at 300/10×, potentially exposing combat cost.

The candidate dynamically transforms TODAY's unchanged combat core. At 160+ total units it uses the historical exact target grid with real live invalidation on movement, damage, Goose knockback and newly summoned Goblin pack fighters; below 160 the original target function runs unchanged. At 160+ living units it uses a 2D live *bitset grid* in collision separation, processing only spatially possible pairs but **strictly in the original increasing i/j encounter order** and re-querying whenever a true contact moves the actor. Every original 4 Gauss-Seidel passes, Math.hypot, ordered pushes, damage, targeting, hits, RNG, and output remains exact. Smaller fights and initial deployment use the original solver byte-for-byte.

Preliminary V8-isolate actual current source tests compared entire original/candidate state JSON after every frame for 20/40/80/120/300 at 1× and 10× plus 2 extra 300 seeds: **14/14 exact comparisons**. Combined 300 old/new callback CPU elapsed totals (not browser FPS) three matched 1× 753/545ms, 773/560ms, 742/581ms; 10× 4004/2929ms, 3881/2850ms, 4114/2972ms. This is encouraging but NOT browser performance evidence.

Mandatory source CI: genuine source-exact full-frame SHA at all five populations both speeds and six 300 holdouts. Browser: genuine Chromium 430×932 DPR3 original vs source-injected candidate in two alternating orders both speeds, 300 deployed L1/L4/L5 authored fighters, live FX, actual positive HP damage, >=10s uncensored RAF frames each arm, original vs candidate true ticks/sec and active grid counters. **Promotion criteria:** candidate RAF P95 <=.80 of baseline in EACH of four matched trials, candidate authentic ticks/sec >=95% baseline each, no visual degradation or other quality regressions, native Safari separately accepted. A successful research job is not promotion. No playable files, 42 digests, SW cache, preview, main merge or production modified.

## Real current-raster Chromium verdict — deterministic but insufficient, REJECT

Exact source job on [PR Actions 39898191698](https://github.com/danickman/ShowdownLab/actions/runs/39898191698), QA source candidate `4953458ba2a5cd69316488128304669813b81bc8` passed all 10 20/40/80/120/300 original-vs-candidate full-RAF state SHA and six 300 heldouts. All four real 300 Chromium original/candidate pairs ran for >10 seconds, uncensored, 300 real deployed fighters, actual HP decrease, positive physical ticks, correct source interception, and **verified actively used** target grid plus collision grid. Research CI job passed, but performance promotion is rejected.

| Speed/rep | Current RAF P95 | Combined RAF P95 | Ratio | Actual current/new ticks per second |
|---|---:|---:|---:|---:|
| 1× A | 299.9ms | 283.3ms | .945 | 28.40 / 28.64 |
| 1× B | 283.4ms | 283.2ms | .999 | 25.69 / 26.34 |
| 10× A | 600.1ms | 500.0ms | .833 | 145.69 / 146.15 |
| 10× B | 683.2ms | 550.0ms | .805 | 184.31 / 208.99 |

Source exact CPU in Node CI at 300 was variable at 1× but 10× stronger: three heldout ratios 1× 1.177/.845/.891, 10× .549/.564/.522. Real Chromium shows safe 10× physics benefit but **not >=20% P95 improvement in all trials and essentially no reliable 1× gain**. No runtime integration allowed. The main-thread scheduling/native compositor bottleneck remains distinct from source CPU. The expensive A/B study is now archived behind manual workflow dispatch, preserving raw artifact receipts and rejecting silent quality loss.

Next independent approach: run this SAME exact combined physics in a paced real Worker on the CURRENT density raster rather than re-testing isolated JS speedups. Preserve true ticks/sec and >10s real HP trajectories; a prettier RAF without physical progress is an automatic rejection. No production previews/main/Safari claims.
