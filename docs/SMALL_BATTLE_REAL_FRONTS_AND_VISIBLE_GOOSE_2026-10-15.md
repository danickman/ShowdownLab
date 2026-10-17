# Showdown Lab — real local fronts and visible support abilities

**Date:** 2026-10-15. **Development branch:** `qa-turn1-duel-baseline`. **Production:** unchanged; no merge/deployment authorized.

## Decisions this turn

1. Release a narrowly bounded **soft local-target preference in QA** for smaller battles, judged by actual damage-connected fights and persistence—not just sprite distribution.
2. Preserve **exact existing target/combat behavior for 60+ deployed fighters and for one-on-one cases**. Do not reactivate a global Engagement Director or introduce hard 3-lane squads.
3. Fix a measurable **missing Goose honk spectacle** using its existing cooldown signal and existing BattleTheatre honk artwork—without adding a simulator event stream or combat changes.
4. Do **not** apply broad DPS buffs to Goose, Turtle, Beetank or Knight until protective/control participation is credited.

## B2 — actual 20–40 fighter target selection

The current RC4 `nearest()` target score is physical distance plus `Math.max(0,pressure-2)*.035` for over-targeting. The isolated alternative adds `Math.abs(dy)*laneWeight` **only** for ordinary frontline roles: Knight, Goose, Beetank, Turtle, Goblin and Barbarian. Assassin, Mole, Sniper and Dragon retain their original target ranking; Assassin's backline preference, Mole's forward burrow and every existing attack/Ultimate remain authoritative.

The lane weight depends on **deployed unit count** (the RC4 array retains dead units; there is no midfight flip):

- At 40 or fewer: 0.12, a soft *preference* for feasible opponents at similar vertical coordinates, never a mandatory target lane.
- Between 40 and 60: linearly taper from 0.12 to zero.
- At 60 or more: **zero**, to protect the established 80–300-fighter targeting and performance.

This score never subtracts from physical distance, preserving the `nearest()` early-reject safety proof and stable RNG ordering.

### Independent and post-integration QA

- Source-only [`check-local-front-lane-study.cjs`](../tools/qa/check-local-front-lane-study.cjs) [`ca282ae`](https://github.com/danickman/ShowdownLab/commit/ca282ae210fa130c1cdec652acb8a86b38237b29); CI job [`77dfcfb`](https://github.com/danickman/ShowdownLab/commit/77dfcfbc4bd095e24efc913f418505344f1f8d0f), independently successful in [run 38696029785](https://github.com/danickman/ShowdownLab/actions/runs/38696029785).
- **24 mirrored/seeded 40-fighter cases** across mixed, heavy and swarm armies: windows containing **two geographically separated, actual damage-positive fight components** **171 → 188**; two or more such fights that demonstrably continued from distinct earlier fights **37 → 57**; combined fighter-sourced damage **119,238.1 → 121,898.2**. **14/24** cases improved separated-front windows, **7/24** worsened. This is not a guaranteed per-case improvement or complete duel win-rate evidence.
- **24 20-fighter cases:** separated windows **25 → 25**, persistent **0 → 0**; a useful negative result. The targeting preference is not enough to reliably sustain two fronts in every small battle.
- **Exact original/current callback-state digest equality** across 12 one-on-one matches plus tested 60, 80, 120 and early 300-fighter samples. At 60–300 the rule is zero, not an unbounded penalty.
- Promoted to QA-only source [`1fdbb93`](https://github.com/danickman/ShowdownLab/commit/1fdbb93841e3f2bc5619d6101ad0864fc0ca9bdb), canonical core URL `?v=frontlane1` [`cf6f210`](https://github.com/danickman/ShowdownLab/commit/cf6f210d58dca4e4feb581dfbdcd2c72a86e337a), SHA-256 pinned PWA worker [`c8fba0a`](https://github.com/danickman/ShowdownLab/commit/c8fba0ae21c798a69b878d74d87821c1774d564e). Updated the `distance-bound-research`, `nearest-scan-research` and independent local-front QA comparators to reconstruct the original target policy before comparing to the QA release.
- **Full post-target change suite [38696830851](https://github.com/danickman/ShowdownLab/actions/runs/38696830851): 26 successful jobs, one intentionally skipped, zero failed.** Includes 430×932 portrait Chromium, offline shell hashes, read-only role observations, 300 stress and mirrored parity.

### Why no wider 20-fighter spawn spread?

A separate source-only 24-scenario experiment widened starting Y spacing from 0.065 to 0.072, 0.076 or 0.082 in formations with 10 fighters per side. For each, baseline was **25** separated damage-positive windows, **0** truly persistent, total attributed damage **57,395.2**. Results:

| Initial step | Separate fight windows | Persistent windows | Total fighter-attributed damage |
|---|---:|---:|---:|
| 0.065 baseline | 25 | 0 | 57,395.2 |
| 0.072 | 26 | 1 | 55,897.8 |
| 0.076 | 19 | 0 | 57,200.0 |
| 0.082 | 34 | 3 | 55,571.0 |

The most visually promising width reduces real hit throughput by ~3% and can worsen individual seeds. **Not implemented.** One central melee may be a legitimate 20-fighter outcome. Do not introduce purely decorative “fake fronts” or compromise Assassin/sniper access to force two fights.

## B1 — protect support utility beyond raw damage

In **18 mirrored 20/40/80 direct V8 samples**, an extra read-only callback (proved identical sampled state traces) attributed control or mitigation actions, not just hit damage:

| Role/action | Observed result | Important limit |
|---|---|---|
| Goose honk | 394 affected-enemy stun applications, 4,119 incremental nominal stun ticks | These are gross added stun durations, not each target's actual experienced disabled time |
| Beetank ram | 65 stuns, 513 added ticks | No claim of equivalent DPS |
| Knight guard | 538 mitigated-hit events, ~12,840 raw incoming damage intercepted | Before subsequent armor, Ultimate/dodge, actual HP preservation not directly measured |
| Turtle shell | 30 mitigation events, ~1,092 raw incoming damage intercepted; 24 slam stuns totaling 112 added ticks | Not a complete reflection/protection valuation |

Therefore Goose's high honk-control value and Turtle/Knight defensive contribution must **not** be evaluated solely by low direct HP damage. Before balancing, normalize by role population, level, time alive and action opportunity, attribute effective stun experienced, and measure opposite-team responses.

## B4 — real Goose honks were mostly hidden by the renderer's sampling cadence

The rich RC4 Goose honk is a **one-tick action**. PWA `spawnFX(next)` was recognizing it only when `next.units[].action==='honk'`, but `emit()` throttles UI state snapshots to approximately every 48ms of real time, so at 4× and 10× most honks occur between snapshots. This was not a broken stun mechanic, but a loss of visible authored comic effects.

**Direct read-only observation in twelve 20/40-body cases, two mirrors at 1×/4×/10×:** 313 actual honks, only **51** observed via transient action, all **313** recovered using `u.honk > old.honk+5`. At 10×, **2 of 116** actual honks had visible action cues. Exact sampled simulator-state parity verified against uninstrumented RC4.

**Renderer-only QA repair:** [`e318964`](https://github.com/danickman/ShowdownLab/commit/e318964cd9ff3cba644d17cad2169404fd25c036) records prior Goose cooldown in presentation-only `prev` and detects a real reset. If the action-based cue already fired, it does not replay it. Otherwise it reuses existing `kind:'honk'` and `BattleTheatre.drawHonk`, familiar comic word (small densities), a few authored spark particles and an optional signature burst. It follows the existing `fxCap`, caps visual recovery at >48 fighters, and never emits a fake combat event or adds RNG/attack rules.

- PWA renderer path `/v3/v3.js?v=honkcue1` [`1c9964b`](https://github.com/danickman/ShowdownLab/commit/1c9964b71177130ed06f387dad6a20dec09e251e), worker `showdown-lab-release-honkcue1` [`d31c1f6`](https://github.com/danickman/ShowdownLab/commit/d31c1f6ac737cad12c72c0fe3ddcb5e690262d6f), all 42 SHA pins validated against exact old and new bytes.
- [`tools/qa/check-goose-honk-cue.cjs`](../tools/qa/check-goose-honk-cue.cjs) [`927604f`](https://github.com/danickman/ShowdownLab/commit/927604f1d09bc22f761d9e898dc158c604f24ffd), new CI job [`b0a1376`](https://github.com/danickman/ShowdownLab/commit/b0a1376dd69c58b574a57e5f955704abf7a321b6), **independently passed** in [run 38698173332](https://github.com/danickman/ShowdownLab/actions/runs/38698173332): 313 actual, 313 detected, 262 newly recovered and 51 naturally visible, 116/2 at 10×. Simulator state parity unchanged.
- Older offline check `check-release4c.cjs` hard-coded the previous `?v=depth5g1` even after the root and worker correctly installed `?v=honkcue1`. Fixed [`68d7e81`](https://github.com/danickman/ShowdownLab/commit/68d7e81aa761ea01429645f36bad7ef4edde55e3) to resolve **the one exact current versioned renderer from canonical HTML**, then require that verified asset to be served offline. Unexpected version still must fail closed. Prior run 38698173332 is **not full green** because the old test ran before this repair. Complete post-repair full-run status must be checked before any release decision.

## Next game and QA gates

1. Confirm **every** post-`honkcue1` CI job (especially browser screenshot 430×932 DPR3, root offline cache isolation, strict honk source test, 300 fighters, original combat parity). Leave `main` untouched.
2. For 20-fighter fights, evaluate **attack opportunity and meaningful local consequences** rather than mandating two simultaneous battles. Low count often naturally forms one decisive clash; do not over-spread 20 into empty floor and delay damage.
3. Extend visible *real* short-lived signatures only where current screenshots miss them (e.g. Beetank ram, Turtle shell slam, Assassin backstab, Sniper shot, Dragon cone), with action counters when possible. No synthetic hits or expensive blanket VFX at 300.
4. Attribute actual utility and outcomes (experienced stun, saved HP, backline protected, mitigation) alongside direct damage. Adjust balance or staged BattleTheatre animations only with matchup/role evidence.
5. Later, after release approval, compare game feel in production with genuine iPhone portrait, including 1× readability and rare 300-fighter/10× situations. Production remains unchanged until explicit approval.
