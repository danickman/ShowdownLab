# Showdown Lab — Sniper shot visibility and next theatrical cues

**Date:** October 15, 2026. **QA branch:** `qa-turn1-duel-baseline`. **Production:** unchanged; no deployment or merge authorized.

## Decision and implemented behavior

At 4× and 10×, Sniper's firing action (`u.action='attack'`) is only one logical tick, while the PWA renderer receives throttled RC4 snapshots. A rifle can actually fire and damage an enemy without the authored muzzle, ejected casing or comic shot feedback being drawn. The simulator is not missing shots—the renderer is missing *evidence* of real events.

Implemented a **render-only** fallback in [`v3/v3.js`](../v3/v3.js). `sniperShotReset(old,u)` requires:
- `u.type==='sniper'`, a finite previous and current cooldown, `u.cooldown>old.cooldown+5`, and `u.cooldown>26`.
- The **26-tick Sniper buttstroke** therefore cannot be mistaken for a rifle shot.
- If the ordinary visible `attack` action already triggered, suppress duplicate recovery.
- Otherwise reuse the established `muzzle`, `casing`, `muzzleShock` and bounded sparks, instead of fabricating a second combat attack or an unrelated visual style.
- **No reconstructed bullet tracer** if the source's target may have changed during the missing snapshots. This avoids displaying a shot at an innocent/wrong opponent.
- Small fights get the full cue; for above 48 living fighters, the existing deterministic density downsampling `(u.id+next.tick)%Math.max(2,Math.ceil(density/40))===0` caps recovered effects. All existing `fxCap` and movement/accessibility limits remain active.

**No combat stat, CPU simulator, targeting, attack timing, level or winner logic changed.** The full PWA renderer was syntax checked before commit.

## Observational evidence

The original source-level read-only test instrumented the **actual rifle firing statement** (not animation events). Over 18 mirrored, 20/40/80-body scenarios spanning 1×, 4× and 10×:

| Event metric | All test scenarios | 10× scenarios |
|---|---:|---:|
| Actual observed rifle shots | 495 | 366 |
| Shots signaled by one-tick action | 16 | 9 |
| Shots recognized by cooldown reset | 492 | 363 |
| False rifle-shot detections | **0** | **0** |
| Actual shots still missed | 3 | 3 |

Read-only test hooks proved exact original/instrumented simulator snapshot digest parity in two independent smoke fixtures. Early 1× tests produced no shots within their short observation windows, so **do not infer a rifle cannot fire at 1×** or an overall accuracy rate across every roster/duration.

Automated test source [`tools/qa/check-sniper-shot-cue.cjs`](../tools/qa/check-sniper-shot-cue.cjs), commit [`46ad070`](https://github.com/danickman/ShowdownLab/commit/46ad070fab08e48625212d11eb8ee2faed7fb7a7), independent CI job [`f003f23`](https://github.com/danickman/ShowdownLab/commit/f003f23a2311ec09dfc55e0e869ba05a0bfb4b57). Successful CI receipt reproduces **495 / 492 / 0 false** and the 10× **366 / 363 / 0 false** subset.

## Integration and regression results

- QA renderer [`ed88726`](https://github.com/danickman/ShowdownLab/commit/ed88726c54c743470ad5b3fbab05d1ad615d1a38).
- Canonical root `/v3/v3.js?v=snipercue1` [`e1bbdb1`](https://github.com/danickman/ShowdownLab/commit/e1bbdb1895a8a7666a067c9a160125945dd3e13b).
- Service worker release `showdown-lab-release-snipercue1`, **42 pinned SHA-256 resources** checked against old and new resource bytes, with exact root runtime-script inventory parity [`44f511b`](https://github.com/danickman/ShowdownLab/commit/44f511bb43d42b46f5dffe9f37375b8964aeb363).
- [**Full post-integration GitHub Actions run 38799691819**](https://github.com/danickman/ShowdownLab/actions/runs/38799691819): **29 jobs, 28 SUCCESS, one intentional skipped, zero failures**. Passed portrait browser density, offline PWA, Node simulator parity, Sniper recovery, Goose honk, Assassin/Goblin/Knight counterplay, real engagement telemetry and 300-fighter stress.

The release is therefore **QA-green, not production-deployed**. No user authorization to merge/deploy has been given.

## Next theatrical opportunity: Beetank charge wind-up

A separate **uncommitted, read-only exploratory** 18-case 20/40/80-body probe at 1×, 4× and 10× observed **1,143 actual Beetank ram charge initiations**, 842 caught by transient `action==='ram'`, and **1,141** recovered by an increase of `u.special` after its real reset to 100; **zero false triggers** in these sampled cases.

Unlike a successful impact, `special` resetting to 100 proves **ram initiation**, not that the Beetank reached or damaged a target. If promoted later, show the existing `chargeWake` and `dustkick` *wind-up* only, never fabricated hit/ring, shield reduction, damage, KO or comic impact. Confirm visual density and 10× affordability, mirror/seed exact simulation parity and full canonical SHA/offline/browser gates.

Other priority work: clear and genuine damage-positive fronts in 20–40-body battles without fake forced lanes; normalize actual Goose/Beetank stun effect, Knight/Turtle protection and Mole burst by surviving fighter-time before further damage balancing. Preserve the already green local soft-lane targeting and its strict ≥60 fighter parity.
