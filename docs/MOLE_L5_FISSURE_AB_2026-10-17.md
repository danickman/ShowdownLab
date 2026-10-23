# Mole L5 Eruption Fissure — source-only first-tier A/B
17 October 2026. User requirement: an early L5 must normally win a competitive round, while peer L5, overwhelming numbers/x2 and 3-v-15 asymmetry still matter. Prior all-roster first-L5 Mole benchmark was only **4/8** selected wins. Mole currently uses **Nuclear Carapace** for 35% L4 / 50% L5 incoming damage reduction, plus unmodified physical burrow/invulnerable underground / emerge 1.7x physical hit in legacy sim. Avoid a bland further resistance buff or blanket stun.

## Distinctive L5-only variants
Two source-only, deterministic **forward ground fissures** emerge only from a genuine physical Mole `erupt` attack, after its original main hit. Fissure is aligned along attacking-team forward axis and begins at the actual struck enemy:
- Rift: length .25 arena, lateral width .075, nearest 4 other physical enemies, 1.25× attack secondary damage, six simulation ticks stagger.
- Fault: length .33, width .095, nearest 5 enemies, 1.75× attack secondary damage, eight ticks stagger.

Stable forward projection then lateral projection then physical-ID tie breaking; no chain reactions, no whole-army disabling, no extra RNG. L1–L4 ultimate physics must remain **exact per RAF frame**. Keep original Mole burrow movement, immune-underground behavior, stats, and incoming defense completely unchanged.

## Evidence and promotion gate
`tools/qa/check-mole-l5-fissure-ab.cjs` runs current live source versus temporary Rift/Fault ultimate source inside independent VM. Calibration seeds **12721, 17167** and untouched holdout **23819, 29837**, mirrored blue/red, genuine 20/40 fighters. First-to-L5, peer L5, enemy Mole family doubled, **entire opposing army doubled**, and three evolved Mole versus fifteen strong enemies.

16 matched initial states × four choice conditions × three source arms = **192 authentic terminal games**, plus four severe-number states × three arms = 12 additional, **204 complete physical terminal battles**. Twelve read-only observed-vs-raw full-RAF SHA pairs and 16 exact L4 current/variant full RAF SHA controls. The study reports actual positive-HP dealt by Mole by physical ID, post-cap secondary HP, true independent geographically separated positive-HP damaging fronts/windows, and winners. A high win lift that destroys peer and whole-army counters or physical fronts must be rejected, as with earlier Goose cascades. Later candidate stages: 80/120/300 mixed body 1×/10× Node CPU and rendered effects, followed by **physical iPhone 14 Pro Max Safari (430×932 DPR3)**. Node 300-fighter frame timings do not imply smooth phone FPS.

**Unshipped hypothesis; dedicated exact-head CI results pending.** Neither v3 ultimate source, renderer/Guide, index, SW pins, main nor production changed.


## Verified Oct 17 exact-source A/B result — initial large fissures rejected
The exact [push workflow](https://github.com/danickman/ShowdownLab/actions/runs/39076623733) and [PR workflow](https://github.com/danickman/ShowdownLab/actions/runs/39076626333) at QA `f96a686a4214b39097a1299e2982c0e1e3630562` both **passed with 54 successful checks and one skipped**. Dedicated Mole test ran **204 actual fully completed source battles, 12 read-only entire-frame parity pairs, 16 exact unchanged-L4 physical SHA controls**, success on both workflows.

| Genuine matched heldout scenario (8 each) | Current L5 | Rift | Fault |
|---|---:|---:|---:|
| First unlock vs prior tier | 3 | **8** | **8** |
| Matched peer L5 | 4 | 4 | 4 |
| Enemy doubles Mole family | 6 | 8 | 8 |
| Enemy doubles ENTIRE army | 0 | 2 | **8** |

In the 4 severe 3-v-15 heldout numerical-overwhelm matches, current **0 wins**, Rift **0**, Fault **3**. Both fissures create measurable resolved extra HP; first-unlock Rift recorded 23,733.84 actual extra positive HP over 347 secondary physical hits (8 heldout cases), Fault 31,164.91 over 342. However, holdout first-unlock authentic persistent geographically distinct HP-damaging fronts declined **14 current → 10 Rift → 3 Fault**; separate physical damaging time windows **77 → 39 → 20**. Even Rift destroys almost HALF the time windows despite its beneficial score/counters.

**Verdict: REJECT BOTH without shipping**, especially Fault which invalidates whole-army x2 and severe overwhelm; Rift might otherwise work but cuts geographically independent damaging action unacceptably. The original combat code and PWA remain unchanged. This source-only trial is *not* an adopted game ability. Continue with independently measured reduced collateral [Mole L5 Shard/Twin study](MOLE_L5_LOW_COLLATERAL_2026-10-17.md).
