# Turtle L4/L5 Ricochet Shell — incremental genuine melee-punishment improvement

**2026-10-15/16 · QA branch only, before implementation HEAD `ee490c2af96ef3ab00412c9239736aa63c01b06b`.** iPhone 14 Pro Max 430×932 DPR3 primary target; real Safari test is still open.

## Design reason and safety boundary

Turtle's real role is **defensive attrition and retaliating against nearby attacks**, not becoming an alternative Beetank charger. Raw direct attacker-attributed 40-fighter damage in 16 completed mixed/mirrored scenarios was about Turtle **2,440**, Beetank **8,532**, Dragon **53,309**; this comparison does NOT measure a defender's prevented damage or Turtle's uncredited source-less reflection. Need to justify expensive L4/L5 evolutions through measured *effective reflected HP* rather than cosmetic Ultimate activity.

Current `afterHit()` only retaliated at **≤0.09 arena-coordinate separation**, while melee standing collisions and slight knockback often put true physical hits just outside it. A source A/B sweep tested 0.10, 0.105, 0.11, 0.115, 0.12; increasing too far removed the only demonstrated 20-fighter persistent independent real-damage front. **0.10 is the bounded candidate** that preserves it. No always-on damage, new knockback, cooldown, HP, animations, RnG, defense stats, targeting change or expensive enemy scan.

## Actual positive HP reflected and front fidelity — matched completed matches

Same actual game seed, mirrored sides, fully terminal 20/40 fighter teams, four army composition families (mixed, swarm, heavy, ranged; 2 seeds ×2 sides = 16 matches/size). Measure actual HP removed by each reflection **after** calling the original `hurt()` path; do not count desired reflection power or number of cue graphics as damage.

| Measure | 20 fighters | 40 fighters |
|---|---:|---:|
| Finished battles | 16/16 | 16/16 |
| Real reflected HP, old 0.09 reach | ~139 | ~360 |
| Real reflected HP, new 0.10 reach | ~177 | ~401 |
| Real damage-separated windows, old→new | 25→25 | 193→191 |
| Consecutive persistent independent fronts, old→new | **1→1** | **66→66** |
| Changed winners across these complete games | **0** | **0** |

No false positive claim: Turtle's direct DPS remains lower than Beetank. This change deliberately improves **punishment of an attacker who actually hits a close Turtle**, not damage from a passive aura, a ranged sniper outside reach, or hypothetical threat cells. The long-term user request for further Turtle utility and Assassin Execution upgrade value remains open.

### Alternatives rejected on real data

- **Assassin Execution HP threshold** L4 0.40→0.45/0.48/0.50/0.52/0.55 and L5 0.55→0.60/0.62/0.65/0.68/0.70 improved some real activation counts and late outcomes, but the fixed 20-fighter true front score **1→0 persistent** in the current 16-game reference. No Assassin threshold changes shipped; investigate backline target selection, early combat engagement continuity and marginal evolution value with more independent seeds.
- Turtle reach **≥0.105** likewise scored **0** persistent windows at 20 despite higher reflection HP.
- Initial spacing/lane weight, blanket burn/splash hit-stagger removal and indiscriminate Dragon nerfs from previous research were also rejected.
- The unchanged existing 40-fighter persist=66 is a *floor*, not proof that visual crowding is solved. Actual Safari 14 Pro Max acceptance remains open.

## QA acceptance

Permanent `tools/qa/check-turtle-ricochet-value.cjs` asserts real L4/L5 0.095 attacker gets 30%/45% normal proportional retaliation (but L1–3 none), and 0.101 attack does not. Full instrumented-vs-pure complete physical-state hash parity, matched **32 completed** 20/40 real positive-damage-front graph/mirrored A/B, **solo L1/L4/L5 Turtle vs Beetank/Sniper counterplay**, no-Turtle 20/40/80/120/300 1×/10× physical state parity, no winner flip across fixed baselines, no regression in persistent independent fronts. The 300 population remains uncapped; no core hot-path extra work.

Changed runtime `v3/ultimate-abilities.js` only, and its source of Fighter Guide ability descriptions. Canonical `index.html` now queries `turtlereflect1`, PWA atomic worker `showdown-lab-release-turtlereflect1` regenerated root/Ultimate SHA-256 pins with all 42 resource digests still checked. No live deployment or main merge. Full new-head CI and real iPhone Safari remain separate acceptance gates.

**No Assassin improvement was implemented in this turn.** Next turn should focus on authentic Assassin L4/L5 payoff without degrading the lone 20-body persistent multi-front signal.
