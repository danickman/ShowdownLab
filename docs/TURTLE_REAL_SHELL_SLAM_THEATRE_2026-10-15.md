# Showdown Lab — Turtle shell-slam visibility with exact real-event telemetry

**Date:** October 15, 2026. **Branch:** `qa-turn1-duel-baseline`. **Production untouched.** Release status: full post-integration QA pending.

## Finding

Turtle's shell-slam is a real single-tick combat action (`u.action='shell_slam';hit(u,t,1.65);t.stun=Math.max(t.stun,5)`). The renderer samples snapshot states at a slower cadence, especially at 4× and 10×. In **18 mirrored 20/40/80-unit fixtures** with a real-event hook on the executed slam statement:

| Signal | All fixtures | 10× only |
|---|---:|---:|
| Actual executed shell-slam calls in observed intervals | 288 | 195 |
| Existing transient `shell_slam` action transitions | 20 | 5 |
| Old shellBash or cooldown observations combined | 192 | 112 |
| New explicit event timestamps detected | **273** | **181** |
| False timestamp detections | **0** | **0** |

The older `shellBash` and cooldown signals are ambiguous: shell defense exiting, normal `snap` and target changes can alter those fields, and many slam events happen and resolve before the renderer refreshes. A renderer-only estimate risks inventing attacks. **Do not fake attacks to fill the visual gap.**

## Implemented: one visual event marker, no physics edits

1. In [`v3/legacy-sim-core.js`](../v3/legacy-sim-core.js), only the true shell-slam execution path gained `u.shellSlamTick=tick`, between the action assignment and the existing `hit(u,t,1.65)`. There is **no initialization or per-tick maintenance field for other fighters**; only turtles that have actually slammed receive this property. The marker is never read by combat/AI, damage, targeting or RNG.
2. In [`v3/v3.js`](../v3/v3.js), the renderer preserves `shellSlamTick` in its previous snapshot map and checks `Number.isFinite(u.shellSlamTick) && u.shellSlamTick !== old?.shellSlamTick`, for actual Turtle units. If an ordinary visible `shell_slam` action transition was already observed, the recovery cue is suppressed.
3. At density ≤48 and fewer than four `shell_slam` visual cues in the previous 280ms, the renderer reuses the existing authored `shell_slam` crescent arc centered on that Turtle. Below density 30 it also shows an existing shell `impactArc`; below 20 and below 10× it may show the existing comic **THUNK!** cue. The global `fxCap` stays in effect.
4. **No fabricated target, victim position, successful damage, knockback, stun, KO, impact to a different fighter, screen shake or new attack is created.** The recorded event proves a real attempted melee slam (which can be dodged or mitigated). Recovery is suppressed for dead Turtles in the sampled state. Some end-of-life and multiple-inter-frame slams therefore remain visually missed; correct underclaiming is better than fictional hits.

## Physical combat proof before promotion

A direct script evaluated source-only baseline RC4 versus the same source plus the `shellSlamTick` assignment (and optional read-only `__qaSlam` hook), across 18 20/40/80 body × 1×/4×/10× mirrored simulations, seed 1337. Removing **only the new `shellSlamTick` telemetry property** from snapshots yielded **identical complete physical game-state traces** in every scenario, including health, positions, stun, shells, cooldowns, actions, hitTick, targets, RNG-dependent choices, unit survival and terminal states. Real-event detection 273/288, no phantom events. This is direct V8 verification, **not** a claim that browser or GitHub CI have passed.

## Offline release and independent QA

- Core marker [`a57ddcf`](https://github.com/danickman/ShowdownLab/commit/a57ddcfdc8b6e21d6467d1dc92224ce6d258a27c)
- Renderer [`3937a2b`](https://github.com/danickman/ShowdownLab/commit/3937a2be70a113476959a55ec8bcd5ac80204168)
- Canonical root versions `/v3/legacy-sim-core.js?v=turtleslam1` and `/v3/v3.js?v=turtleslam1` [`7ad22a1`](https://github.com/danickman/ShowdownLab/commit/7ad22a1a5798357ab0d0ea96aca50518a5c47158)
- SW cache `showdown-lab-release-turtleslam1` [`98dcdcf`](https://github.com/danickman/ShowdownLab/commit/98dcdcf2ac5e06931dc35c2182880d29546c1ccc), **42 source-verified SHA-256 hashes**. Both old core/renderer/root pins validated against exact source before replacement; script/RUNTIME ordering checked.
- Permanent standalone read-only [`check-turtle-shell-slam-cue.cjs`](../tools/qa/check-turtle-shell-slam-cue.cjs) [`8bb62a9`](https://github.com/danickman/ShowdownLab/commit/8bb62a9f887742cf16d4ac2445f0d4cbc83bdb70) and workflow `turtle-shell-slam-cue-sampling` [`a83fe28`](https://github.com/danickman/ShowdownLab/commit/a83fe284f66cf5e9c942dea07e00dcf33c945987). Exact physics and RNG parity with pre-stamp source, actual hits vs missed transient action, no false events, source anchor drift and duplicate FX/density guards.
- Previous `ramcue1` [CI 38801734808](https://github.com/danickman/ShowdownLab/actions/runs/38801734808) was **29 successes, one intentional skip, zero failures**. **New full post-turtleslam1 CI must pass before release.** This includes the core Node regression suite, 300-body stress and mobile Chromium portrait, PWA offline hash verification, support/role attribution and all prior Sniper/Goose/Beetank real-cue checks.

## Next actions

- Complete new full QA. Fix source-anchoring regressions without weakening RC4 physical parity or stress.
- Investigate Mole eruption and Assassin backstab missed visual actions; if state counters are insufficient, prefer limited truthful telemetry over ambiguous cooldown inference, *but* don't add generic event infrastructure or extra per-fighter work to 300-unit battles.
- Continue the user's wider aim: real damage-positive independent clashes in 20–40 body battles, readable successful defender/support action and satisfying comic battle theatre on iPhone 15 Pro Max portrait. Preserve 60+ fighter exact target-selection rules, high-density FX caps, authored sprite art and all three game modes.
- Do not merge or deploy to `main`/production without authorization.
