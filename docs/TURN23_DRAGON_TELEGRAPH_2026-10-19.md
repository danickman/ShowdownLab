# Turn23 — Dragon L4 physical breath charge / numerical counterplay
October 19 2026 Toronto. Source-only, not playable. Starting QA af2bb97ec1f4faf7f6dd880b6fc5397a61ef1ad8.
Earlier Turn6 4/6 breath-victim caps changed no contacts in fixtures and left 8/8 defeats of literally doubled foe army and 4/4 wins in real 3v15. Turn23 tests a DISTINCT physically justified mechanic: L4-only longer stationary, interruptible windup for its massive Inferno attack (+12 or +24 authentic simulation ticks). Preserve the same breath fan, hit positions, HP, damage, real fire and burn, target AI, level multiplier, and L5 original charge. Physically opposing numbers can exploit exposed pre-breath time; an L4 should still be a dramatic first unlock in fair 20/40 fights.

Strict same-source paired real full-terminal mirrored 20/40 on calibration seeds 41443/51799, unseen heldout 83117/97429: seven original choices (hold / first L4 / peer / family double / literal doubled entire foe army / 2 new recruits / other-family evolution). 336 true battles + 12 true 3-v-15 battles. Verify six observed/raw complete RAF digests, unchanged L5-vs-L5 where neither side L4 (16), unchanged sub-L4 (16), Assassin/Turtle off-target (32), three deterministic repeats; actual selected direct HP, independent HP-damaging fronts and separated windows. Source trial only; no active core, Guide, SW, 42 PWA hashes, preview, main or prod changes.

Acceptance requires a material change in genuine foe numerical counterplay without collapsing first-unlock hero ROI, peer symmetry, true multi-front engagements or unrelated mechanics. Never accept on cosmetic animation, fabricated hits, or alternate fixture definitions. The automatic job records evidence but green CI alone is NOT a gameplay acceptance.

## Source-real result and QA candidate decision — 19 October 2026
[Exact 16-job source CI 39365994983](https://github.com/danickman/ShowdownLab/actions/runs/39365994983), [full source-research commit a2b18e4dd5bd59aee18677a458a3cf6af5ee1ce4](https://github.com/danickman/ShowdownLab/commit/a2b18e4dd5bd59aee18677a458a3cf6af5ee1ce4). 336 complete matched source battles +12 real severe 3-v-15, six read-only observer/full RAF parity, 16 unchanged Dragon L5, 16 L3 and below, 32 unrelated Assassin/Turtle, three repeat digests. All PASS.

| Metric | Current | Charge +12 | Charge +24 |
|---|---:|---:|---:|
| Heldout fair first-L4 wins | 8/8 | 8/8 | 8/8 |
| Heldout matched L4 peers | 4/8 | 4/8 | 4/8 |
| Heldout literal ENTIRE foe army 2x wins | 7/8 | 5/8 | 3/8 |
| Calibration literal entire foe army 2x wins | 7/8 | 5/8 | 2/8 |
| Heldout opposing Dragon-family doubled wins | 8/8 | 7/8 | 4/8 |
| True heldout three L4 Dragons vs fifteen L3 wins | 3/4 | 0/4 | 0/4 |
| Heldout persistent distinct true HP fronts | 11 | 13 | 12 |
| Calibration persistent distinct true HP fronts | 18 | 12 | 15 |
| Heldout separate HP windows | 90 | 95 | 87 |
| Calibration separate HP windows | 106 | 108 | 100 |

**SELECT +24 for QA integration**, not +12: retains dramatic L4 first unlock 8/8 on both cohorts, matched peer 4/8 and authentic numerical counterplay; 3-v-15 becomes 0/4, whole foe army 2x 3/8, foe Dragon family 2x 4/8. Same original 16-tick charge at L1–L3 and L5, only L4 waits an extra 24 actual vulnerable windup physics ticks; no HP, direct/DoT, cone, range, targeting, cooldown, kill/draw, FX change. The calibration persistent-front count drops 18→15 (17%), heldout increases 11→12; windows 106→100 and 90→87. This residual contact quality cost is acknowledged; mandatory live all-role 40-front >=40, 300 CPU and physical native Safari still release gates. **Gameplay QA integrated as a CANDIDATE, pending full exact-head automatic CI.** Source research job archived manual-only; permanent lightweight physical L3/L4/L5 first-fire tick regression added. 42 root+41 runtime SHA manifest + SW cache+HTML version updated atomically. Nothing on main, production or preview.

## FINAL ACCEPT — integrated source-real playable QA, October 19
Accepted +24 tick Dragon L4 exposed breath windup only. Playable deterministic `v3/legacy-sim-core.js` changed exactly at Dragon windup dispatch. L3/L5 real first-fire intervals remain 16 ticks, L4 becomes 40. Fully versioned root HTML, 41 runtime asset references, service worker cache and 42 SHA256 integrity values updated atomically. First integration attempt's service-worker core SHA was stale, repaired, and the prior dense-canvas cache regression string updated to require the new cache name without relaxing raster/FX rules.

**Exact playable integration CI: [39366878873](https://github.com/danickman/ShowdownLab/actions/runs/39366878873) at ec86cbc339cfe1a95d5b2e4f3c6ad054d4b9bd6a — 15/15 active jobs PASS; 85 previously archived research jobs skipped, zero fails.** Source-full 336+12 true terminal evidence [39365994983](https://github.com/danickman/ShowdownLab/actions/runs/39365994983) already passed. Permanent regression specifically runs actual L3/L4/L5 first breath 16/40/16 ticks, no observer-only or visual timings. Genuine current-live persistent 40-front gate, 300 crowd, damage attribution, offline staged 41-module install/rollback, browser portrait and density all green. Calibration distributed-front impact from 18→15 is explicitly retained as a tradeoff; no artificial hit, target removal, cone or HP reduction. Done, do not revisit Dragon L4 in an unfunded loop. Next #24.
