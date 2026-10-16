# Assassin L4 Execution value: matched source-only study

**16 October 2026 — QA research; no game/PWA change.**

The current L4 Execution requires a backstab on an enemy below **40% pre-hit HP** for +80% damage. L5 is a **separate investment**: below 75% HP for +120%. We are testing whether 50%, 55% or 60% L4 trigger thresholds would make it a more consistently appealing evolution without making Assassin a universal counter to Knight, Beetank or Turtle, disrupting 20/40 authentic fronts, or undermining L5.

Permanent test: `tools/qa/check-assassin-l4-trigger-study.cjs`. Four source variants ×104 truly terminal 20/40-body matches each: 32 standard role mixtures, 24 prespecified Assassin team formations with three modes, 24 unseen seeded mirrors, 24 new no-Knight/armored counters. Source instruments positive attacker-credited HP after armor/dodge/cap, true L4 Execution callbacks, physical backstab counts, Beetank/Turtle/Sniper damage separately, winner changes, original independent real geographically separated HP-damage fronts, and Knight/Goblin role contribution.

The program requires exact observation parity in full RAF physical state, **unchanged L5 Assassin physical frame SHA** against five solo counter roles, and **unchanged no-Assassin physical state** in 80/120/300 fighters at both 1× and 10×. It is not a phone FPS claim.

**Decision criteria:** never promote a threshold solely because triggers or raw DPS rose; demand held-out improvement without unacceptable counter-role losses, winner flips or deterioration in authentic 20/40-front persistence. The existing real 20-body one-front deficit remains a separate priority. `main` and production remain untouched.

## Previous Turtle research conclusion

Source-only timed Turtle counterplay at QA `901c198` passed [push 38925820908](https://github.com/danickman/ShowdownLab/actions/runs/38925820908) and its PR checks. Reactive 24% increased wounded-ally immediate protection but standard 40-body genuine front persistence dropped **58→52**, unseen wins **13→12**; Knight-gap-only reaction dropped unseen wins **13→10**, fronts **58→50**; recovery-only reaction dropped stress wins **6→3** and triggered scarcely. **Reject all as gameplay changes.** Leave the existing Turtle L4 18% wounded ally Guardian and 30% close-contact reflection intact.

## Genuine first-run rejection and research harness correction

On initial [push run 38932999445](https://github.com/danickman/ShowdownLab/actions/runs/38932999445), the 416-fight study completed match collection and the safety assertion **correctly found the L4 50% threshold erased the single standard 20-fighter persistent independent damage-front window**. It then exited before exporting the full source A/B receipt. This is **evidence against the proposed candidate**, not a defect in the shipped simulation. The source-only audit is corrected to **record each candidate's explicit REJECTED verdict** whenever it degrades real front persistence, separated windows, unseen winner count or role counters; the *unchanged live game baseline still must pass the original 20/40 gates*. Instrumentation parity, L5 solo SHA and 80/120/300 population checks remain mandatory. No combat, PWA or production file changed.

## Verified full 416-match verdict — push CI 38933733573 (research job succeeded)

All **4 ×104** candidate matches completed and the instrumented/uninstrumented physical-state parity, unchanged five-target L5 solo traces, and 80/120/300-fighter 1×/10× no-Assassin physics controls passed in the [source study](https://github.com/danickman/ShowdownLab/actions/runs/38933733573). The first run's assertion failure at 50% was a **real rejected candidate**, not a combat regression. The corrected study preserves failed-candidate verdicts in the CI receipt while retaining strict live-baseline gates.

| L4 HP gate | Real selected-case Executions (24) | Actual L4 HP damage dealt (24) | Selected wins | Unseen wins | Difficult-counter wins | Standard 20 true persistent fronts |
|---|---:|---:|---:|---:|---:|---:|
| Current **40%** | 13 | 16,815.88 | 13 | 12 | 10 | **1** |
| 50% | 26 | 17,279.71 | 13 | 12 | 10 | **0** |
| 55% | 28 | 17,339.84 | 13 | 12 | 10 | **0** |
| 60% | 31 | 17,457.58 | 13 | 12 | 10 | **0** |

There were zero finished-match winner flips in these three phase comparisons, but the other outcome signal is equally important: doubling L4 Execution activations at 50% gains just **2.76%** of selected Assassin real HP damage, with no extra wins. A 60% threshold grants **~3.82%** extra selected HP while trading away genuine 20-body separate-front persistence and reducing Knight contribution in several counter-stress comparisons. Against Beetank/Turtle, the prespecified real HP credit was **322.73 / 184.60** and unchanged by any threshold; in the armored/no-Knight stress compositions it was **zero** for all four. Thus increasing a wounded-target multiplier does not fix Assassin's target access or front engagement behaviour. There is no evidence here that L4 becomes more compelling.

**Release verdict: REJECT ALL THREE L4 TRIGGER THRESHOLD INCREASES.** Existing 40% L4 and 75% L5 conditions, role descriptions and real combat remain unchanged. The 20-body true-front deficit still requires an independent solution. Never weaken positive HP-damage front tracking to let this candidate through.

**Next diagnostic instead of another damage buff:** measure Assassin L4 time spent stalking, vanishing, hitting and disengaging, real backstab reach/HP conversion, unwanted switches off an already-wounded *backline* target, and whether exposure to Knight/Turtle/Beetank causes the loss of counterplay. Assess a *target continuity / kill-confirm* hypothesis only if that measurement identifies real wasted attack windows; run mirrored 20/40 complete fights before any gameplay patch. Any future improvement must retain L5 advantage and actual physical iPhone 14 Pro Max budget.
