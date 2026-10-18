# Mole L5 lower-collateral Shard/Twin — second source-only study
17 October 2026 — follow-up to [initial Rift/Fault source study](MOLE_L5_FISSURE_AB_2026-10-17.md).

## Why repeat with less damage
Both original Mole fissures hit the desired first-L5 power spike (8/8 heldout versus live baseline 3/8), but their secondary HP inflicted broad cross-front engagement collapse: **14→10→3 authentic persistent damaging fronts**, 77→39→20 geographically separated physical HP damage windows. The large Fault also swept the entire x2 army 8/8 and won severe 3-v-15 in 3/4, contradicting genuine numerical counterplay. Full [push CI](https://github.com/danickman/ShowdownLab/actions/runs/39076623733) and [PR CI](https://github.com/danickman/ShowdownLab/actions/runs/39076626333) passed, meaning the prior experiment is valid but those candidate mechanics are **rejected**. Mere green tests and stronger damage are not enough.

## Prespecified conservative physical alternative
Both source-only candidates add damage when current actual L5 burrow eruption strikes an enemy. Both have a deterministic forward team axis, strictly no extra RNG, and preserved original primary hit:
- **Shard**: a narrow forward seam extending .16 arena units and .045 half-width, cap **one** extra defender, .60 attack multiplier resolved into actual post-armor positive HP, 2 ticks stagger.
- **Twin**: .20 arena length, .060 half-width, cap **two**, .62 attack multiplier, 3 ticks stagger.

Compare same current live Mole ultimate source, plus original unaffected v3 sim, not frozen ability snapshots. Exact unaffected L4 full-frame state equality retained. Keep Mole burrow immunity, unmodified core movement and premium Barbarian, Goose, Assassin abilities. No ability art or runtime patch yet.

## Experiment and acceptance
`tools/qa/check-mole-l5-low-collateral-ab.cjs` performs **204 completed physical source battles** and **12 original/observer entire-RAF SHA checks**, plus **16 exact-L4 original vs modified-source full-RAF SHA checks**. Real 20/40 population; both sides; training **12721/17167**, **new untouched holdout 30469/45989**. First-to-L5, matched opponent L5, enemy Mole family ×2, enemy WHOLE TEAM ×2, severe 3 evolved Mole vs 15 foes. Report selected Mole physical HP, extra post-cap HP, genuine independent damage-front windows/persistence and wins.

**Do not promote unless the heldout new wins coexist with enough genuine separated fronts and legitimate counterplay**. Also compare whole-army ×2 and 3-v-15. If a compact fissure still erases fight density, investigate single-target positional control/delayed rupture rather than simply increasing splash. If promising, additional matched non-Mole and 80/120/300 Node budgets, physical Safari 14 Pro Max acceptance, and effects readability are mandatory.

**Source-only; CI not run yet.** Main and production protected.


## Verified second A/B source-result at exact QA 556fec9
[Push Mole dedicated job](https://github.com/danickman/ShowdownLab/actions/runs/39088657882/job/117560468556) PASSED: 204 fully terminal true matches, 12 original-vs-observer entire-RAF SHA pairs, 16 unchanged-L4 candidate-vs-baseline entire-RAF SHA pairs. Full push/PR suite status was NOT complete when read.

| Holdout fixture | Current L5 | Shard | Twin |
|---|---:|---:|---:|
| First L5 unlock | 2/8 | 4/8 | 8/8 |
| Peer L5 | 4/8 | 4/8 | 4/8 |
| Opponent Mole copies doubled | 6/8 | 5/8 | 2/8 |
| Opponent ENTIRE army doubled | 0/8 | 0/8 | 0/8 |
| Three evolved against fifteen | 0/4 | 0/4 | 0/4 |

First-L5 heldout authentic independent persistent fronts: 10 baseline, 24 Shard, 27 Twin. Actual separate positive-HP damaging time windows: 72/68/62. Twin really damages secondary enemies for 11,752.76 postcap HP in 313 true positive-HP hits, versus rejected broad Fault 31,164.91/342. It satisfies strong 8/8 first-L5 spike and legitimate severe/whole-army counterplay; unlike Fault, it does not crush persistent fronts, although separate time windows decline by 14 percent. **Twin is a promising source-only candidate, NOT playable yet**; Shard less interesting at 4/8. Need 80/120/300 actual-source CPU and exact off-target physics. See [density gate](MOLE_L5_TWIN_DENSITY_2026-10-17.md).
