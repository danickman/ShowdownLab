# First L4/L5 benchmark — verified results and ability priorities

17 October 2026. QA `c703b911d7dc56f1383b49f57b7300f13a159dcf`, [push](https://github.com/danickman/ShowdownLab/actions/runs/39001984770) and [PR](https://github.com/danickman/ShowdownLab/actions/runs/39001987803) both **46/46 required green**, one intentionally skipped each. **720 complete terminal first-to-tier source battles and 24 raw/observed physical-state RAF parity pairs**; artifact [first-ultimate-tier-spike](https://github.com/danickman/ShowdownLab/actions/runs/39001984770/artifacts/12089273860).

Controlled symmetric 20/40 tests: hold baseline 80/160 wins (50%), first-tier evolution 121/160 wins (75.6%), peer both evolved 80/160 (50%), evolved team against doubled *opposing nominated family* 101/160 (63.1%). First L4 64/80 (80%); first L5 57/80 (71.25%). **Important:** L5 is less impactful than L4 in these fixtures, contrary to intended increasing spectacle/power. The ×2 case doubles only the nominated enemy family (13-vs-10 and 26-vs-20), not the full opposing army: do not label it a full army ×2. Severe asymmetric three-evolved-vs-15 tests: L4 3/40 wins, L5 1/40 wins—numerical limits already work.

| Unit | First L4 (of 8) | First L5 (of 8) | Next action |
|---|---:|---:|---|
| Knight | 8 | 8 | Preserve strong guard character |
| Sniper | 8 | 6 | Protect L4 and measure L5 presentation |
| Dragon | 8 | 8 | Preserve superpower / counters |
| Assassin | 8 | 8 | Do not buff from same-tier Beetank comparisons alone |
| Beetank | 7 | **4** | L5 first-unlock power spike investigation |
| Mole | 6 | **4** | L5 first-unlock power spike investigation |
| Turtle | 7 | 6 | Refine spectacle/front tradeoffs, not generic power |
| Goblin | 5 | 5 | L4/L5 signature Pack Ambush redesign |
| Barbarian | **4** | **4** | High-priority Blood Cleave role expression |
| Goose | **3** | **4** | High-priority Thunder Honk role expression |

Every unit row has only 8 mirrored/seeded fixtures; these are directional QA examples, not universal ability win probabilities. Original peer mirror returning 50% is expected, because the relative advantage disappears. **Different-source role upgrades should intentionally swing fair wins**, whereas severe numerical counters may still win.

## Source-only candidate — no gameplay change

New `tools/qa/check-ultimate-signature-spike-candidates.cjs` probes two dramatic, distinct, bounded proposals: Goose Thunder Honk produces a deterministic one-hop echo cascade hitting extra enemies adjacent to a first ring; Barbarian Blood Cleave creates a wider arcing multi-target stagger. They are conditional **temporary ultimate-source replacements inside test VMs**, not authored live Ultimate abilities. Compare baseline versus each proposal at L4/L5, 20/40, seeds 1337/2017 and held-out 4051/6067, blue/red, mirror peer-tier and doubled-enemy-family counters, plus genuine 3-evolved-vs-15 exceptions. Preserve actual physically resolved HP, terminal wins, independent HP-positive damaging fronts, raw/observed parity and explicit population bound. Stronger initial spike **and** meaningful peer/number counterplay are the targets. Any win/flank improvement must survive 80/120/300 CPU and real Safari before promotion.

**New exact-head CI pending.** No runtime, Guide, PWA manifest, art, main or production patch.
