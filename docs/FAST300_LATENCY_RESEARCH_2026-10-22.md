# 300-fighter source-preserving optimization study — 22 October 2026

## Verdict: REJECT browser promotion; latency not yet resolved

Exact QA-only research commit `1e6228fbe076a40c85731e7c5c374c53b44c4c6a` finished [Actions 39729971664](https://github.com/danickman/ShowdownLab/actions/runs/39729971664) with **14/14 active jobs successful**, including separately source-exact and full real Chrome A/B research. A passing *study* is not a passing *optimization*. Artifact **fast300-latency-research** [ID 12404493668](https://github.com/danickman/ShowdownLab/actions/runs/39729971664/artifacts/12404493668) includes `fast300-exact.json` and `fast300-browser/fast300-browser-study.json`.

### Actual experiment

Research-only builder `tools/qa/fast300-candidate.cjs` produces a separate `LegacySimCore` source without touching any playable /v3 runtime:

- Cached opposing-team rosters refreshed when the actual source adds summoned units, with live status and backline filtering to preserve original nearest selection
- A 32-unit coarse x-envelope collision skip at 160+ living bodies; block bounds monotonically expand as physically touched fighters move, so only pairs *provably impossible to overlap* are omitted
- Unchanged four full ordered Gauss–Seidel collision passes, same exact physical pair calculations, all targeting, actor abilities, winner, damage and tick order, and exact 20/40/80/120 behavior

The source engine A/B performed all ten 20/40/80/120/300 x 1×/10× complete-frame SHA comparisons plus six heldout 300 same-frame SHA comparisons. All full-RAF hashes matched exactly. Observed matched Node 300 callback CPU P95 candidate/original ratios: 1× **0.891, 0.868, 0.965**; 10× **0.976, 0.936, 0.940**. These improvements are real but small and are **not FPS**.

### Genuine current-source Chromium, 430×932 DPR3, 300 fully simulated fighters and visible sprites/FX

Two alternating matched orders, both speeds, uncensored 10-second + active-damage runs, source injected via same-local-host request interception:

| Pair | Actual baseline RAF P95 | Candidate RAF P95 | Candidate/baseline | True baseline/candidate ticks/s |
|---|---:|---:|---:|---|
| A 1× | 283.4 ms | 283.3 ms | 1.000 | 28.54 / 28.46 |
| B 1× | 266.7 ms | 283.3 ms | 1.062 | 25.90 / 26.51 |
| A 10× | 566.6 ms | 500.0 ms | 0.882 | 146.08 / 146.27 |
| B 10× | 533.4 ms | 600.0 ms | 1.125 | 205.25 / 196.24 |

The candidate failed the preannounced **<=0.80 RAF P95 ratio in EACH of four trials** despite preserving all source gameplay and meaningful tick throughput. Its research receipt has `promotionEligible:false`. Therefore **REJECT default integration**; no PWA root hash/module/SW cache changes, production preview, QA runtime physics mutation or main merge. Do not claim 300 now performs at 60 FPS. Archived expensive research behind workflow_dispatch rather than automatically re-running on future QA changes.

### Next meaningful engineering route, not an approved release

Previous WebAssembly collision/nearest, threaded Worker, MessageChannel/cooperative scheduling, bitlanes, typed-array spatial collision, cached nearest, and target index attempts failed robust BOTH-speed Chromium responsiveness or sacrificed true combat tick throughput (see [TURN19_THREADED_300_PERFORMANCE_2026-10-19.md](TURN19_THREADED_300_PERFORMANCE_2026-10-19.md)). The high-density raster decrease *did* clear a historically strict **>=40% matched relative RAF improvement** from its previous larger unoptimized baseline, but recent absolute 1×/10× intervals remain high.

An actual next-step major redesign would need to remove the main-thread `O(300²)` CPU collision/targeting burden while respecting all real fighter presence, actual physical combat 10× rate and deterministic match outcomes, or explicitly secure user approval for a high-density fidelity/pacing compromise. Do not secretly reduce fighter count, omit actual hit ticks, claim fake smooth FPS, loosen quality thresholds or assume native Safari follows Linux Chromium. The already fixed CURRENT-LIVE 40-front threshold (58 persistent / 210 separated in most recent source run) is independent and must remain protected. Native iPhone 14 Pro Max Safari performance/temperature/memory acceptance is still outstanding.
