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


### Oct 17 CI guard correction
- First candidate run at QA `266efff` [push](https://github.com/danickman/ShowdownLab/actions/runs/39016144222) completed prototype match loops but failed **after them**, in final non-target-role exact-SHA guard: attempted `powers[c.role]` for Knight/Sniper/Mole although only Goose/Barbarian prototypes exist. Undefined source left `ShowdownUltimates` unregistered. Fixed by loading unmodified ultimate source for every other role. Also corrected console case accounting: 448 real paired scenario variants plus 32 severe-number case variants = 480 complete source fights; 8 pairwise RAF parity and six unaffected-role source-SHA comparisons. No combat/A/B result should be claimed until this corrected CI passes and prints receipts. Runtime/main/production unchanged.

## Verified source-only Goose/Barbarian signature outcome — 17 October

QA fc861806f487747b968a963149f2bce68a29f6cd. Dedicated source study passed in push Actions run 39016547468: 448 full terminal matched role/tier/peer/family-double variants plus 32 true severe-number variants = 480 completed battles; 8 raw-vs-observed complete-RAF SHA parity pairs and 6 unaffected Knight/Sniper/Mole source-SHA guards.

| First-tier scenario | Existing wins | Prototype wins | True persistent damaging fronts existing -> prototype |
|---|---:|---:|---:|
| Goose L4, training | 3/8 | 8/8 | 13 -> 8 |
| Goose L4, held-out | 7/8 | 7/8 | 8 -> 5 |
| Goose L5, training | 4/8 | 7/8 | 3 -> 3 |
| Goose L5, held-out | 5/8 | 8/8 | 12 -> 2 |
| Barbarian L4, training | 4/8 | 6/8 | 9 -> 19 |
| Barbarian L4, held-out | 3/8 | 4/8 | 21 -> 18 |
| Barbarian L5, training | 4/8 | 4/8 | 23 -> 15 |
| Barbarian L5, held-out | 4/8 | 6/8 | 20 -> 17 |

Aggregate unseen first-unlock Goose+Barbarian: 19/32 -> 25/32 wins, but true independent physical HP-damaging fronts 61 -> 42 and separated positive-HP windows 332 -> 271. The weakest tradeoff is Goose L5 unseen (12 -> 2 fronts, 99 -> 46 separated HP windows) and peer L5 (6 -> 0 fronts). This over-broad cascade is spectacular but risks replacing a lively multi-front fight with mass disabling.

Unseen peer-matched evolution baseline and prototype remain 16/32 wins each; equal tier counters still restore symmetry. The opposing nominated fighter FAMILY doubling trial is 20/32 -> 22/32 wins, NOT a whole-army x2 counter. Severe 3 evolved against 15 foes remained 0/16 wins in either arm. These comparisons are matched per source; small cohort seeds and side mirrors correlate.

Decision: retain Goose broad cascading prototype as a RESEARCH SPIKE, not as live gameplay. Narrow echo stun duration and fan-out, retain distinctive spectacle and real independent fronts, test with new seeds and 80/120/300 density before promotion. Barbarian L5 wide staggering sweep is promising (held-out wins 4 -> 6/8 and fronts 20 -> 17), but L4 held-out rises only 3 -> 4/8; real secondary-hit instrumentation, high population CPU, comic timing and iPhone 14 Pro Max physical Safari needed. Beetank L5, Mole L5 and both Goblin tiers remain weak in prior first-unlock benchmark.

Preserve accepted full research script and source receipt while moving its 480-match job to conditional historical CI. The 720-match ten-role first-unlock benchmark remains actively required. Changes to docs/workflows have their own exact-head CI and cannot inherit green from the previous source commit. No live combat, PWA, Guide, art, main or production edits.
