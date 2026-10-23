# 300-fighter compositor raster x real Worker — 23 October 2026

**Research only. Playable theatre, original physics, authored art and PWA/offline unchanged.**

The optimized source-exact target+contact Worker preserves 1x/10x true ticks and achieves repeatable 30.6–33.3% improvement to 10× RAF P95 at 300, but only 5.9% at 1×. This isolates a remaining native/compositor 1× bottleneck; the user wants the P1 resolved without lost real combat.

Under CURRENT real 300 fighters only, this study combines the verified exact-core Worker with **1× backing ratio .75 instead of 1.0** while retaining 10× original .85. No change to smaller battles (<160), canvas CSS size, body counts, world positions, original authored sprites/FX, actual actions, permanent leveling or 300 combat rules. Saves genuine browser screenshots for every arm at matched viewport (430×932 DPR3) so loss of outlines/readability can be evaluated. Lower backing pixels = deliberate rendering-quality tradeoff and will be rejected if figures cease to be legible.

Two alternating orders × 1×,10× per two seeds at >=10s uncensored true RAF, 300 real initial units, real damage, original/candidate physics true ticks/sec, worker full-state source SHA, actual Worker collision and target diagnostic hits, 80/120 no-worker inline controls. Promotion requires **P95 improvement >=20% in EACH of 4 real matched trials, >=95% baseline true physics ticks/s EACH**, error-free completed browser, good screenshots and separate physical iPhone Safari. Green CI does not mean approval or quality parity. NO preview, branch merge, playable change, PWA hashes, or production impact.

## Controlled .75× 1× raster + exact Worker verdict — promising, 1.2pp short of strict gate

[Exact QA PR CI #39899462747](https://github.com/danickman/ShowdownLab/actions/runs/39899462747) on `4b84efb2b3599a7ad54ee9a1a866c28e53c4dfb0` **13/13 active checks green**; 17 manually archived checks skipped. Genuine original-versus-Worker mixed 300 fighter full FX 430×932 DPR3, 10s uncensored RAF each, true HP damage, all source exact SHA cases green, 80/120 kept inline. 1× canvas candidate .75 vs current 1.00; 10× candidate AND baseline retained original .85. Correct head and actual rendered canvases intercepted, Worker optimized target and contact grid counters nonzero, no page errors.

| Paired | Baseline RAF P95 | .75 / exact Worker RAF P95 | Ratio | Actual baseline/candidate true ticks/s |
|---|---:|---:|---:|---:|
| 1× A | 300.0ms | 200.0ms | .667 | 27.08 / 37.09 |
| 1× B | 266.7ms | 216.6ms | .812 | 25.54 / 35.81 |
| 10× A | 700.0ms | 299.9ms | .428 | 145.98 / 146.20 |
| 10× B | 683.3ms | 433.4ms | .634 | 179.39 / 207.70 |

Candidate passes throughput/HP and 10×/first-1× latency thresholds; the second 1× pair is 18.8% better, **just below** predeclared >=20% requirement. Report `promotionEligible:false`; do not ship. Actual screenshots artifact [12477947761](https://github.com/danickman/ShowdownLab/actions/runs/39899462747/artifacts/12477947761) saved after HP-damaging runs show authored daylight skyline and full fighter rendering but differ in battle position due candidate completing more authentic ticks, so not a controlled same-state visual quality comparison. Next study takes same-state paused screenshots and uses .70 1× only at 300 to distinguish raster contribution; 10× stays unchanged.

No source-facing module, SW, SHA pins, main/prod, Vercel preview or deployment was touched. Archive expensive .75 trial behind workflow_dispatch.
