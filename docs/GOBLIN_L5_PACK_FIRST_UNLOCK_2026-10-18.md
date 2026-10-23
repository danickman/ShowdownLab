# Goblin L5 — Pack Hunt versus Double Fang
18 October 2026. **Source-only A/B; no playable mechanics changed.** The prior first-L5 original Goblin benchmark won 5/8 selected mirrored fixtures, leaving Goblin behind the intended transformative L5 round swing. Current L4 Goblin nearby-family buff is 20% per up to 3 allies; L5 is 30% per up to 4 nearby allies. Those are useful auras but neither showcases a new L5 coordinated assault. Avoid another globally strong or unstoppably wide stun.

## Two deliberately different coordinated ambush identities
- **Pack Hunt:** On a genuine L5 Goblin stabbing target T, add a focused coordinated direct-damage bonus **58% per up to two OTHER alive Goblins**, ONLY if each ally physically is within .16 arena units of T and currently targets the exact same physical target ID. This stacks multiplicatively on existing 30%-per-nearby-Goblin L5 aura, remains capped, no RNG or global proximity buff. L4 unchanged.
- **Double Fang:** Leave ordinary L5 outgoing aura intact. If another live Goblin is within .16 of the same still-living defender when an L5 stab genuinely hits, the L5 attacker makes exactly ONE secondary physical same-target .80× attack hit, resolving real post-armor HP through existing recursion-protected afterHit mechanism; no stun, teleport or cross-front AoE. It may finish a wounded armored enemy but cannot hit untargeted enemies.

Both candidates use **CURRENT live source including Mole Twin** and current Goose/Barbarian premium signatures. No source is rewritten in browser: the study changes only VM-loaded temporary copies of `v3/ultimate-abilities.js`. Test source-only negative controls ensure L4 physics is **byte-for-byte identical** across every simulated RAF frame.

## Fixed acceptance protocol
`tools/qa/check-goblin-l5-pack-first-unlock.cjs` runs **16 seeded mirrored 20/40-fighter fixtures** with training seeds **11717/23771** and entirely new holdout **30971/44831**; each compares live baseline, Hunt and Fang in **four real terminal conditions**: first to L5, matching peer L5, doubled lower-tier Goblin enemy family, or doubled ENTIRE opposing army (distinct). 16 × 4 × 3 = **192 completed full battles**. Add four 3-L5-Goblins-versus-15 mixed L4-enemies severe matches × three source arms = **12 genuine terminal matches**, total **204**. Add 12 raw/observed whole RAF physical SHA pairs and 16 exact unchanged-L4 candidate/control SHA pairs.

Score actually resolved post-cap Goblin HP, any genuine secondary HP, *independent persistent* geographically distinct HP-positive damaging fronts/windows, real terminal wins, no race to wipe whole arena. First-to-L5 should be round changing; peer L5 and sheer numerical advantage remain valid counters. Do not choose based on damage totals alone. If promising, test holdout roster gradients, draft ROI, 80/120/300-fighter source CPU, and physical iPhone 14 Pro Max Safari before playable QA integration.

**CI pending.** Main and production remain protected. Mole Twin visual spectacle is a separate pure-renderer QA change.


## Oct 18 dedicated exact-head first A/B results
The [push Goblin dedicated job](https://github.com/danickman/ShowdownLab/actions/runs/39096398729/job/117583831543) at QA `631e9bd87e0e1fd4a42606986a3d86c07e877ce0` **passed**: 204 true completed combat matches, 12 original/raw observer whole-RAF SHA parity, and 16 exact L4 unaffected candidate/full-RAF physical SHA controls. These are *selected* mirrored seeds, not independent sampled universal odds; full push/PR workflow aggregate should be assessed separately.

| NEW heldout condition | Current | Pack Hunt | Double Fang |
|---|---:|---:|---:|
| First-to-L5 | 4/8 | 5/8 | **6/8** |
| Opponent also L5 | 4/8 | 4/8 | 4/8 |
| Opponent lower-tier Goblin FAMILY doubled | 4/8 | 5/8 | **7/8** |
| Opponent ENTIRE army doubled | 0/8 | 0/8 | 0/8 |
| Severe three L5 against fifteen prior-tier foes | 0/4 | 0/4 | 0/4 |

Real postcap extra positive-HP from first L5 Fang: **499.44 HP across 29 secondary hits**, not cosmetic FX; first-L5 true persistent independent HP-damage fronts **16 current, 11 Hunt, 19 Fang** and separate HP-damaging windows **69, 72, 68**. Fang foe-family doubling yields 868.56 secondary positive HP over 42 hits and 25 genuine damaging fronts vs 20 base. Hunt is much weaker and erases first-tier independent fronts. A 6/8 first spike is still marginal by requested round-changing standard; family doubled 7/8 may overrun the *particular* family ×2 counter, but entire army ×2 and severe 3 vs 15 retain counterplay. Do not claim these eight correlated fixtures prove universal odds.

**Decision:** REJECT Pack Hunt for live integration; **retain Double Fang as research baseline, not shipped**. Next bounded [Fang refinement](GOBLIN_L5_FANG_REFINEMENT_2026-10-18.md) compares +1.20 attack no stun vs +1.05 attack/4-tick short pin on fresh heldout first-to-L5/peer/family ×2/whole-army ×2. No playable Goblin source/PWA/renderer/Guide changed.
