# Showdown Lab — True Mole eruption cues, high-speed readable theatre

**15 October 2026 | QA-only `qa-turn1-duel-baseline` | Not merged or deployed to production**

## Observed problem and approach

The RC4 combat simulation executed Mole's burrow/eruption, including its damage and seven-tick stun, but the renderer was sampling snapshots too sparsely to consistently see the one-tick `action='erupt'` animation.

A direct read-only probe of 18 mirrored 20/40/80-fighter battles at 1×, 4×, 10× (seed 1337) registered **1,043 actual executed eruptions** versus only **82** observed action transitions. A `special` cooldown increase identified 932 without false detections in that fixture, but missed 111 actual events; at 10× it identified only **349/441**. Burrow/cooldown heuristics are not guaranteed to identify genuine eruptions and may mistake other actions in future mechanics.

**Choice:** record a minimal last-event tick **only when a real eruption action executes**. This is preferred over inventing eruptions from cooldowns, adding global event queues, changing hit logic, or changing the snapshot cadence that affects mobile CPU cost.

## Implemented QA-branch changes

- [Core: genuine Mole event stamp](../v3/legacy-sim-core.js): changed only the actual eruption statement to `u.action='erupt';u.eruptTick=tick;hit(u,mt,1.7)`. There is no initialization or update on other units, no new branch in targeting/movement/damage, no extra RNG and no second attack.
- [Renderer: recover short-lived Mole eruption](../v3/v3.js): save last `eruptTick` in the previous snapshot. Detect only a finite, *changed* Mole event tick, while the unit is alive and its normal transient eruption action was not already seen. Reuse the existing `erupt` circular ground burst at the Mole's own location, limited dustkick at ≤27 alive, and optional comic **KRAK!** below 18 alive and below 10×. No invented target position, projectile, victim reaction, successful damage, stun, KO or camera shake.
- At over **48** live units the new fallback draws **no additional effects**. Under 48, a cap of four existing active eruption cues during 280ms prevents clutter; the global `fxCap` remains in place. Reduced-motion preference suppresses the recovered cue. The usual action-based effects still work normally.
- Root resources: `/v3/legacy-sim-core.js?v=moleerupt1` and `/v3/v3.js?v=moleerupt1`.
- Service worker: `showdown-lab-release-moleerupt1`, **42 exact SHA-256 resource pins** regenerated after checking all previous source/root hashes; canonical root-script order equals SW RUNTIME.
- CI resilience: old post-`turtleslam1` run [38803658023](https://github.com/danickman/ShowdownLab/actions/runs/38803658023) ended with 28 successful jobs and two browser jobs failing during **npm install `ECONNRESET`**, before any browser/game assertions. Introduced [`tools/qa/install-browser-deps.sh`](../tools/qa/install-browser-deps.sh) and replaced five browser job installers with three **time-bounded** attempts and controlled npm retry limits. Failed dependency setup must still mark a job failed; it is never waved through as a game pass.

## Test and release requirements

Permanent independent [`tools/qa/check-mole-eruption-cue.cjs`](../tools/qa/check-mole-eruption-cue.cjs) uses actual real-event instrumentation, 18 seed/mirror/speed scenarios, prior-core reconstruction, a full physical state SHA-256 digest with **only the new telemetry field excluded**, no false cue assertions, renderer-density and action-deduplication source guards, and reporting of 10× recall and misses. The test is part of `mole-eruption-cue-sampling` in the full `qa-duels.yml` CI matrix.

Expected result: far higher reliable real-eruption cue detection than transient `action` and byte-identical physical combat and RNG paths. **Do not claim test success or production readiness until independent CI receipts confirm it.**

### Next in the gameplay roadmap

1. Complete the newest full CI: Node core regressions, role/actual multi-front telemetry, 300 bodies, portrait Chromium at 430×932 DPR3, offline PWA install/rollback, real Turtle/Beetank/Goose/Sniper cues, and Mole eruption parity.
2. Diagnose and then improve Assassin's real backstab visual persistence, without creating fictional strikes or undermining restored rear teleport survival/counterplay.
3. Return to substantial player-facing outcomes: readable real damage-positive clashes in 20–40 fighter battles, Goose/Turtle protection legibility, stronger L4/L5 Ultimate payoff, clean authored sprites and responsive mobile PWA.
4. Preserve 60+ exact target selection, all ten fighters, three modes and 300-fighter stress; **no main merge/deployment without explicit approval**.
