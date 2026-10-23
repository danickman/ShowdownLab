# RAF-clock Worker vs current 300 — actual Chromium verdict (22 October 2026)

## Decision — reject playable promotion

Research-only candidate commit `ec8e7aa0f81bd748f0708a4215f15dac0d09f7c5` passed **all 14 active CI jobs** in [GitHub Actions 39865400374](https://github.com/danickman/ShowdownLab/actions/runs/39865400374). This proves the *research ran successfully*, not that the candidate improves performance sufficiently. Full original browser recording: [artifact 12464211168](https://github.com/danickman/ShowdownLab/actions/runs/39865400374/artifacts/12464211168), `turn20-raf-clock-worker.json`. The report records `promotionEligible: false` correctly.

Prior research Worker used independent timers and overran main-frame pacing (often doing much more simulator work while starving rendering). This genuinely distinct source-only implementation requests at most ONE Worker physics frame per real main-thread `requestAnimationFrame` pulse, with one in flight and original unchanged engine `frame` and `step`, RAF timestamps measured on Worker performance clock, same original four collision passes, all actual units, target acquisition, spells and kills. The bridge uses ACK-limited actual roster snapshots and falls back inline on a reported Worker exception. Legacy 80/120 roster controls stay inline. **No playable runtime file changed.**

### Two alternating order, true 300-fighter, both-speed original-vs-Worker comparisons

One-life genuine mixed L1/L4/L5 combats, 430×932 DPR3 Chromium Linux; 5.5 seconds minimum observation with at least 20–38 real main RAF intervals, source winner/HP/ticks and no page or Worker errors:

| Speed & replicate | Current P95 RAF ms | Worker P95 RAF ms | Ratio | Current real ticks/s | Worker real ticks/s |
|---|---:|---:|---:|---:|---:|
| 1× A | 333.3 | 266.7 | .800 | 27.17 | 28.33 |
| 1× B | 283.4 | 316.6 | 1.117 (worse) | 25.15 | 26.38 |
| 10× A | 883.3 | 566.6 | .641 | 115.63 | 91.84 |
| 10× B | 733.3 | 500.0 | .682 | 115.49 | 108.19 |

Required **every** matched pair P95 <=60% of original, and true tick throughput >=85% of original without worker frame censoring. On 1× B the candidate worsens frame stalls 11.7%; on 10× A genuine combat rate drops to **79.4%** of baseline; so it fails both contract dimensions. While 10× relative RAF lift of 31.8–35.9% is repeatable here, the 1× miss and throughput regression forbid shipping. Worker snapshots were genuine (24–25 at 1× and 15–16 at 10×), HP fell, and 80/120 control cases did not activate the Worker.

**Do not change the real engine, speed controls, add hidden tick dropping, copy Worker bridge into production, skip fighter physics, alter SW/root/42 hashes, merge main or deploy**. Archive the research job behind manual `workflow_dispatch` to avoid repeat full browser cost on next PR push.

### Engineering implication

All prior major source-exact optimization avenues (collisions, target scans, WASM, spatial indexes, cloned workers, cooperative timers, bitlanes, high-density raster) either improved relative CPU only, missed robust BOTH-speed browser RAF gates, or slowed honest simulation. Current core performs dense combat + output on main RAF; main-thread/render architectural separation could help, but needs an independently designed and **physically real** clocked Worker + snapshot interpolation or a portable deterministic parallel simulation architecture, requiring focused investment and testing. Do not assert a safe 60FPS 300 battle.

Prior Turn19 relative renderer acceptance remains valid independently; current 40-fighter persistent positive-HP fronts acceptance is already closed (58, latest source 210 separated). Physical iPhone 14 Pro Max Safari performance, thermal and touch acceptance remains unmeasured. PR14 and main/production unchanged.
