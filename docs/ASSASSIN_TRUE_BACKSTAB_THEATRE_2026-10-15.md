# Showdown Lab — Assassin true backstab cue recovery

**Date:** October 15, 2026. **Branch:** `qa-turn1-duel-baseline`. **Release:** QA only, `main` and production unchanged.

## Problem and reasoning

Assassin's genuine `backstab` executes for a single simulation tick. At 4×/10× the renderer often receives the next state after that action is gone, causing a successful or attempted real strike to have no signature animation. This is **not** a reason to increase damage or force fighters together, and a cooldown-rise guess was inadequate: in 18 mirrored 20/40/80 fighter scenarios at 1×/4×/10×, **96 real backstab calls** produced only **seven transient backstab action transitions**. The cooldown heuristic matched **65** of those 96 and missed **31**; at 10× it matched only **12 of 34**.

## QA branch implementation

- The only Assassin core change is `u.backstabTick=tick` immediately after the genuine `u.action='backstab'` and immediately before the existing `hit(u,t,u.special>65?1.65:1.1)`. It is **presentation telemetry**, not a new attack, damage multiplier, movement change, target decision, or RNG call. Existing rear-entry and all skill/ultimate formulas remain unchanged. [Core commit `645cf78`](https://github.com/danickman/ShowdownLab/commit/645cf78776ce35489ed4316d41bd72b5e47a4b26).
- The renderer compares changed, finite Assassin `backstabTick` against its previous snapshot, suppresses the recovery cue if the ordinary visible `backstab` transition has already fired, and places the **existing purple signatureBurst and weapon impactArc** at the Assassin's actual position. At fewer than 14 living fighters and below 10×, the existing comic `STAB!` may be shown. [Renderer `2180e2c`](https://github.com/danickman/ShowdownLab/commit/2180e2c6f3024a12350f48b17c5c89fe7c5ed52c).
- Only a **real executed attempted backstab** creates this VFX. It does **not** prove the target took damage—the normal dodge/armor rules still decide. The renderer creates no new opponent, victim damage, death effect, hit event, tracer, screen shake, or extra knockback.
- Reduced-motion preference disables the new recovered cues; density >48 live units disables new cues; at most three recent Assassin signatures within 280ms; secondary weapon arc only below density 30, and text below density 14. Existing `fxCap` remains authoritative.
- Canonical PWA root script tags now use both `legacy-sim-core.js?v=backstabcue1` and `v3.js?v=backstabcue1`. [Root `1ee44eb`](https://github.com/danickman/ShowdownLab/commit/1ee44ebafb4a829d4f2bab479c3ce74f1b5d787c). SW `showdown-lab-release-backstabcue1` preserves exactly **42 SHA-256 hashes** verified against previous/current root/core/renderer resource bytes, and its RUNTIME script inventory matches canonical root ordering. [Worker `cb0427d`](https://github.com/danickman/ShowdownLab/commit/cb0427ddabda8ec2972ebd1600674eeb0f4424bd).

## Isolated A/B and QA receipts

A direct V8 simulation reconstructed the exact previous core without `backstabTick` and compared it against the current core plus a read-only actual-event hook. Across all **18 seed-1337, mirrored, 20/40/80-body ×1×/4×/10× cases**, the full physical simulation state, including RNG-sensitive actions, position, hit points, target choice and terminal outcome, was **identical in every sampled frame**, once the sole telemetry property was removed. An explicit event hook verified zero false detections:

| Metric | All 18 scenarios | 10× scenarios |
|---|---:|---:|
| Real executed backstab calls | 96 | 34 |
| Recognized through transient action | 7 | 1 |
| Recognized through true-event stamp | **90** | **30** |
| False backstab events | **0** | **0** |

The **six remaining misses** result from states such as a dead attacker at the next sample or multiple actions between emitted states. No visual can honestly reconstruct those from an absent snapshot without a larger event transport. Do not claim complete visual coverage.

Automated permanent source-anchored regression: [`tools/qa/check-assassin-backstab-cue.cjs`](../tools/qa/check-assassin-backstab-cue.cjs), [commit `238115f`](https://github.com/danickman/ShowdownLab/commit/238115f22e2b969d79e867c0ad7cdcc477cde8a3). CI job `assassin-backstab-cue-sampling`, [`279e79c`](https://github.com/danickman/ShowdownLab/commit/279e79c64b24cf46c61b36b3553f11f94c4e5f74). It verifies source stamp, actual-event instrumented call, exact prior/observed physical-state hashes, zero ghost detections and the renderer's action deduplication and density guards.

**Last complete green baseline:** [30/30 jobs, Mole release 38812367557](https://github.com/danickman/ShowdownLab/actions/runs/38812367557). This **Assassin-integrated branch must pass its own full CI** (node-regressions, root offline PWA hash and rollback, 430×932 portrait browser, 1×/10× and 300-fighter stress, Sniper/Goose/Beetank/Turtle/Mole/Assassin real event studies, damage-front and attacker-victim parity). Do not claim complete green on partial jobs. No main merge/deployment until user approval.

## Follow-up design priorities

- Do not continue only polishing cues: return to real, persistent **20–40-fighter fronts**, exciting L4/L5 Ultimate outcomes and dramatic visible results across the available arena.
- Study whether small fights can gain authentic role-based target choices and better opening formation through source A/B without overriding the existing ≥60 exact-parity policies. No scripted fake "two battles."
- Make control/support legible—Goose honks, Turtle shell mitigation, Beetank charge wind-up—and avoid blanket buffs that destabilize high-density balance.
- Verify the iPhone 15 Pro Max portrait experience and 300-body edge performance for each subsequent visual refinement. No new sprite-generation quota spend unless assets clearly demand it.
