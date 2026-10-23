# Showdown Lab — Beetank charge wind-up, no fabricated impacts

**Date:** 2026-10-15. **Branch:** `qa-turn1-duel-baseline`. **Release:** QA only; no main merge or production deployment.

## User-facing result

Beetank's fast moving charge commonly occurred between renderer state snapshots, particularly at 10×. RC4 combat was executing correctly; the authored charge effects and existing RAM cues were easy to miss. We recover a **real charge initiation** using an existing, deterministic Beetank `special` cooldown reset. We do not manufacture hit damage or depict a successful contact where none was observed.

Renderer-only implementation [`45d8182`](https://github.com/danickman/ShowdownLab/commit/45d8182dfd5df7cc13e0187e3b348a0f99dd64cc):
- `beetankChargeReset(old,u)` requires type Beetank, finite old/current `special`, and `u.special > old.special+5`. Source `beetankStep` resets special to 100 when charge starts.
- Suppresses an additional cue if current `ram` action was already visibly entered; the existing renderer has already drawn dustkick/chargeWake.
- Otherwise, if the true reset is seen, it can emit **only** the existing `dustkick` to indicate a charge that happened during the missed frames. A past charge that has since ended does **not** warrant a fresh charge wake or any contact impact.
- Adds a `chargeWake` only while `u.charge>0` **and** density ≤28, speed below 10×, and not reduced-motion preference. Dust recovery requires density ≤36, user not requesting reduced motion, and no more than four other dustkicks in the previous 300ms.
- Does **not** emit `ram` impact, damage, hit, shock ring, KO, comic `RAM!`, new flashes or screen shake; does not touch `v3/legacy-sim-core.js` or any L4/L5/combat mechanics. Existing `fxCap` still applies.
- Records `special:u.special` in the presentation-only prior-unit map. Snapshot memory overhead is one numerical field per fighter, without extra simulation work.

## Source-derived proof and distinction

In 18 matched 20/40/80-body mirrored, seed-1337 battle observations at 1×, 4× and 10×:
- **1,143** actually executed charge initiations, taken from an instrumentation hook on `u.charge=26;u.special=100`.
- `action==='ram'` transitions captured **842** charges; `special` reset detected **1,141**; **zero** false charge reset detections in these samples.
- Of those 1,141, **844 still had an active `charge>0`** at the sampled frame; **297 had already finished** charging. The proposed visuals distinguish those two cases.
- An active-charge recovery not already signaled by `action` occurred in **25 cases**. Many other formerly invisible start events had already finished by the next frame and are eligible **only for dust evidence**, not live wake.
- At 10×: **708** charge initiations, 706 resets, **485** active charges, **221** already finished; no false resets. Some events can be lost across batch samples or unit defeat. These counts are not per-device frame-rate measurements.

This explicitly avoids the false assumption that every increase of `special` means the charge is **still** in progress. It also distinguishes a charge *start* from the potentially damaging ram *hit* (which has its own existing independent feedback).

## QA and PWA release gate

- Renderer [`45d8182`](https://github.com/danickman/ShowdownLab/commit/45d8182dfd5df7cc13e0187e3b348a0f99dd64cc)
- Canonical root `/v3/v3.js?v=ramcue1` [`40ecbfd`](https://github.com/danickman/ShowdownLab/commit/40ecbfd47bbf6b6877699f373458aaec8b1c977f)
- Worker cache `showdown-lab-release-ramcue1` and **42 SHA-256 resource pins** [`e111a9c`](https://github.com/danickman/ShowdownLab/commit/e111a9c7c54da7759921dd69554164c9e69b2609). The previous and replacement resource hashes were checked and canonical root script order matched the worker's required runtime array.
- Reproducible read-only regression [`tools/qa/check-beetank-charge-cue.cjs`](../tools/qa/check-beetank-charge-cue.cjs) [`87e4b31`](https://github.com/danickman/ShowdownLab/commit/87e4b31e15502d7559794b91d53d365259ebe422), dedicated CI job [`2c9f1e5`](https://github.com/danickman/ShowdownLab/commit/2c9f1e5fcdcdf8fefbb75e1df01b53841be325f3). Asserts role-only real reset, no initial/NaN/decrement cues, action deduplication, source anchors, no fake impact, no 300-body flood, read-only simulator-state parity, sample accuracy and no phantom charges.
- **Current post-implementation CI is pending** [workflow 38801442460](https://github.com/danickman/ShowdownLab/actions/runs/38801442460). Previous Sniper/Gooose baseline [38799691819](https://github.com/danickman/ShowdownLab/actions/runs/38799691819) was entirely green (28 successes, one intentional skip). The latest run needs full Node/perf, screenshot/portrait, 300 bodies, fighter role parity, PWA integrity and new Beetank receipt.

## Next most productive turns

1. Complete full post-`ramcue1` CI; fix test failures without weakening guardrails.
2. Continue on **real** Turtle shell slam, Mole erupt, Assassin backstab and Dragon cone evidence only where short-lived state effects disappear between snapshots. Prefer an existing action-counter or shield/cooldown signature, no artificial combat or fictional target selection.
3. Evaluate 20-fighter battle outcomes and role support by normalized fighter-time. The preceding small-front experiment did **not** show reliable 20-body persistent double fronts; do not impose visually scattered false conflicts. Preserve ≥60 combat exact parity and performance including rare 300.
4. Make comic combat theatre rewarding and readable at 1× on an iPhone 15 Pro Max portrait (430×932), while respecting 10× animations, motion accessibility and total effect caps.

**Release boundary:** no `main` merge or production change without explicit user approval.
