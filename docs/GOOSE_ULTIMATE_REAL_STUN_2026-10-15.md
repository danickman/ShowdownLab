# Goose Thunder Honk — make its L4/L5 control match the promise

**2026-10-15, QA branch only.** Baseline `63dfe7dae450ff98abf49903e38bbaf7b30cb491` had [34 passing + one optional skipped QA jobs](https://github.com/danickman/ShowdownLab/actions/runs/38824104198). Main/prod untouched.

## Audit of Ultimate value, including Assassin Execution

In 36 mirror-and-seed-controlled scenarios each at all-L4 and all-L5, with mixed/rush/guard armies of 20/40/80 units, simulation ran to terminal where practical or up to a larger capped observation period. **Assassin Execution did fire**, with **27 of 390 L4 backstabs (6.9%)** and **30 of 339 L5 (8.8%)**. Earlier no-activation findings were from short, censored samples. Backline access was correct; no undocumented execution damage boost or threshold change was justified. Some opposing roles (Dragon/Sniper/Mole) still account for substantially more raw damage, but support and control must not be valued by DPS alone.

## Confirmed Goose mismatch

The Ultimate in-game descriptions say Thunder Honk doubles to **0.73s at L4** and reaches **1.07s at L5**. But `v3/ultimate-abilities.js` previously applied **22 and 32 stun ticks**, approximately **0.37/0.53s at 60 simulation ticks/s**. The plain base honk also applies 11 ticks. The ability effects were appearing visually but actual ultimate stun duration was effectively half of advertised.

**Chosen bounded repair:** On a *real* level-4 honk use `Math.max(target.stun,44)`; L5 use `Math.max(target.stun,64)`. This makes 0.73/1.07 seconds accurate. Retains plain L1–3 honk timing, normal Goose attacks, damage (45/75% of attack), radius (.18/.22), target filtering, cooldown and RNG exactly. Stun combines via existing max rule and cannot stack linearly; ranged opposition can escape the area. No extra particles, new simulator entity objects, or more expensive scans.

## Direct matched source A/B

Seeded/mirrored battles against melee, sniper/dragon ranged backlines and mixed armies; 20/40/80 population at L4 and L5. Metrics track **enemy unit-ticks actually spent stunned** in the running simulator, not gross nominal stun applications.

At 40 bodies, 12 cases per level across three roster types:
- L4 actual enemy disabled ticks **9,557→15,723**, combined Goose-sourced HP damage **4,797→5,809**.
- L5 actual disabled ticks **21,324→52,736**, Goose-sourced HP damage **17,082→22,801**.
- **Zero new Goose-side wins** in those 24 sampled 40-body scenarios; existing ranged-heavy counters remain decisive.
At 80 bodies, 12 cases per level:
- L4 actual disabled ticks **18,989→29,908**, Goose-sourced damage **10,829→10,865**.
- L5 actual disabled ticks **40,711→64,292**, Goose-sourced damage **33,289→35,996**.
- No changed terminal winners over the short 80-body windows, which are *all censored* and do not establish complete-win fairness.

At 20 bodies, matched melee/ranged/mirror-Goose tests showed control gain; ranged enemies still beat Goose in all eight level-specific pairs per roster while the Goose mirror can remain undecided under a finite observation cap. This is a deliberately stronger L4/L5 support role, **not a damage-buff / anti-ranged role inversion**. Future long completed-match studies and actual iPhone Safari acceptance remain required.

## Gate

`tools/qa/check-goose-ultimate-stun.cjs` verifies exact 44/64 applied stun ticks and unchanged immediate damage, Observer-vs-pure full physical state hashes, exact L1–3 behavior, 20/40/80 mirror-and-seed enemy stun-time, maintained ranged counter and exact no-Goose 80/120/300 physical parity at 1×/10×. Existing ten-ability unit check and Fighter Guide durations updated. The PWA worker release `goosestun1` repins all 42 critical shell/runtime resources and has changed exact root, Ultimate and renderer URLs. Dedicated independent Actions job joins full existing 300/browser/offline roll-back suite. **Post-commit QA not yet confirmed at report creation.**


## True-honk cue sampling versus truncated QA window

An initial Goose-stun CI job also failed in `check-goose-honk-cue.cjs`: it required **every actual honk to appear in periodic snapshots**, but stopped the simulator at a preselected frame with no final emitted snapshot. In isolated mirrored 20/40-fighter 1×/4×/10× reproduction, cooldown- and action-based detection found **302 of 305** true honks *before* the forced final tick boundary. Calling existing `LegacySimCore.setRunning(false)` at the **end of the test fixture only** forces the same state publish the game performs on pause, and recovered **305 of 305**, with no physical simulation change and no fake visual event. A proposed `honkTick` telemetry spike was rejected: it still missed those exact same final-window events because they had not been emitted. This is a **test observation boundary repair**, not a renderer or combat change. Strict no-missing-honk and no-double-cue assertions are preserved. No further runtime/SW pin updates.
