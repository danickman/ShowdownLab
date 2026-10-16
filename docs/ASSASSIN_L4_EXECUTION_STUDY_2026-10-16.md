# Assassin L4 Execution value: matched source-only study

**16 October 2026 — QA research; no game/PWA change.**

The current L4 Execution requires a backstab on an enemy below **40% pre-hit HP** for +80% damage. L5 is a **separate investment**: below 75% HP for +120%. We are testing whether 50%, 55% or 60% L4 trigger thresholds would make it a more consistently appealing evolution without making Assassin a universal counter to Knight, Beetank or Turtle, disrupting 20/40 authentic fronts, or undermining L5.

Permanent test: `tools/qa/check-assassin-l4-trigger-study.cjs`. Four source variants ×104 truly terminal 20/40-body matches each: 32 standard role mixtures, 24 prespecified Assassin team formations with three modes, 24 unseen seeded mirrors, 24 new no-Knight/armored counters. Source instruments positive attacker-credited HP after armor/dodge/cap, true L4 Execution callbacks, physical backstab counts, Beetank/Turtle/Sniper damage separately, winner changes, original independent real geographically separated HP-damage fronts, and Knight/Goblin role contribution.

The program requires exact observation parity in full RAF physical state, **unchanged L5 Assassin physical frame SHA** against five solo counter roles, and **unchanged no-Assassin physical state** in 80/120/300 fighters at both 1× and 10×. It is not a phone FPS claim.

**Decision criteria:** never promote a threshold solely because triggers or raw DPS rose; demand held-out improvement without unacceptable counter-role losses, winner flips or deterioration in authentic 20/40-front persistence. The existing real 20-body one-front deficit remains a separate priority. `main` and production remain untouched.

## Previous Turtle research conclusion

Source-only timed Turtle counterplay at QA `901c198` passed [push 38925820908](https://github.com/danickman/ShowdownLab/actions/runs/38925820908) and its PR checks. Reactive 24% increased wounded-ally immediate protection but standard 40-body genuine front persistence dropped **58→52**, unseen wins **13→12**; Knight-gap-only reaction dropped unseen wins **13→10**, fronts **58→50**; recovery-only reaction dropped stress wins **6→3** and triggered scarcely. **Reject all as gameplay changes.** Leave the existing Turtle L4 18% wounded ally Guardian and 30% close-contact reflection intact.
