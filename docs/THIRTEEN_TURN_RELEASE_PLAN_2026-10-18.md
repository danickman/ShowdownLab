# Showdown Lab — active thirteen-turn release plan
Approved 18 October 2026. This plan supersedes the older TEN-turn schedule, but preserves all earlier study outcomes as history. Repository danickman/ShowdownLab; branch qa-turn1-duel-baseline; PR #14 into main; main remains untouched pending the final release.

## Scope change and philosophy

Exactly THREE NEW BOUNDED IMPLEMENTATION TURNS are added after Turn 2 source-real ROI: Turn 3 Beetank, Turn 4 Goblin and Turn 5 Barbarian. Original Turns 3–10 shift to Turns 6–13. Do NOT add extra experiment loops or release earlier.

**Gameplay mandate:** L4 and especially L5 should feel overwhelming when obtained first in an otherwise comparable fight. Favor distinctive, spectacle-worthy powers and decisive winner flips rather than 5–15% stat boosts or artificially equal DPS. A fighter must still face counterplay from peer L5, coordinated opposing types, kiting and genuinely overwhelming numbers. No invulnerability, infinite proc chains, permanent global disables or arbitrary guaranteed wins.

Turn 2's current-source consolidated ROI job is now VERIFIED SUCCESS at exact QA 789f670 / PR run 39104433463. See LIVE_ALL_FIGHTER_ROI_2026-10-18.md. Turn 3 source-only Beetank reach experiments are pending CI before any playable integration. Goblin Dry0/Pin2/Pin4 fixed-secondary-hit/stagger variants were REJECTED from genuine held-out evidence and are not to be recycled as the solution.

## Authoritative thirteen-turn ledger

| Turn | Work and bounded exit |
|---|---|
| 1 — done | Reject unsupported Goblin Fang/Stagger alternatives and install the repository Vercel non-main deployment guard. QA 571f6fc. |
| 2 — done | Single full consolidated live-source L4 and L5 ROI for all 10 families versus hold, +2 recruits, another family evolution, matched peer L5, doubled opposing fighter family, literal doubled whole enemy army, severe 3-v-15. Actual positive-HP and distinct damage fronts, seeded mirrors and full RAF parity. Commit 367949c; receipt verified via PR run 39104433463: 2,440 terminal, 40 observer/raw RAF pairs, 20 repeat pairs; see LIVE_ALL_FIGHTER_ROI_2026-10-18.md. |
| **3 — COMPLETE: Beetank** | Heavy-only L5 **Siege Breaker** accepted on QA. Heldout 7/8 first L5 vs 6/8 baseline, recruits 5/8, allied Knight 5/8; peer 4/8, whole opposing army doubled 0/8, 3v15 0/4. Exact 448-match ROI plus RAF and real 20/40-front safety gates passed. Local Siege FX and 42 pinned PWA assets; [decision](BEETANK_SIEGE_BREAKER_2026-10-18.md). Physical Safari remains open; no production. |
| **4 — COMPLETE: Goblin gate** | Two ambitious Goblin L4/L5 source-real candidates both rejected: power-only L5 6→5/8; Rally cohesion L4 2→7/8 but L5 5→4/8 and independently damaging fronts 24→8. Exact PR 39154536877 13 required checks green. No unsafe playable patch; Pack Ambush remains, residual L5 payoff documented. Turn 5 Barbarian NEXT. |
| **5 — COMPLETE: Barbarian verdict** | Three-arm exact-current-source Bloodstorm study (336 matched +12 severe) finished. Latest heldout first L5 8/8 current/contact/Bloodstorm but genuine damaging fronts 13→8 and windows 68→50 under Bloodstorm; prior separate heldout 3/8 indicates major matchup/seed sensitivity. Experimental contact-only and Bloodstorm both **REJECTED**, current Blood Cleave maintained; no gameplay/PWA changes. [Decision](BARBARIAN_BLOODSTORM_TURN5_2026-10-18.md). Turn 6 all-roster fairness next. |
| **6 — COMPLETE: roster fairness** | Reproduced Dragon L4 wins against whole-army x2 (8/8) and true 3v15 (4/4) on fresh seeds; two physically bounded L4 breath caps (4/6) changed zero wins/HP/front metrics, therefore REJECT. Assassin L5 borderline Execution 15/24 vs 9/24 hold and Turtle Guardian/Ricochet preserve unique roles. [Verified decision](DRAGON_L4_FAIRNESS_TURN6_2026-10-18.md); all 13 automatic CI checks green. Dragon extreme-numbers dominance remains OPEN, not fixed. Turn 7 engine/performance next. |
| **7 — COMPLETED: engine cost/performance gate** | Already-live ×2 projected combined-population ≤120 and three alternative choices validated at 100/119/120/180/300. Allocation-free enemy targeting preserved exact whole-RAF across **128 traces** 20/40/80/120/300 and 1×/10×, but **slowed** Node source elapsed ratios 1.009–1.061, so **REJECT and restore all original core/HTML/PWA 42-pin source**. Keep current validated collision-pruning, real 20/40-front floor and 300 adapter checks. [Turn 7 verified verdict](TARGET_SCAN_TURN7_2026-10-18.md). Turn 8 reliability next; final revert exact-head CI pending. |
| **8 — IMPLEMENTED, CI PENDING** | Adapter now requires between-round phase for ALL draft choices, limits each team to one accepted choice per round, resets flags per new battle and disallows stale old callback effects. Adds deterministic scripted terminal/lifecycle/one-round Jam/Thin regression in existing cheap population CI job, atomic 42-pin PWA update. Existing 300 edge, full core matches and Ultimate Lab enemy chooser/10 types/+5 browser coverage retained. [Turn 8 scope](ROUND_LIFECYCLE_TURN8_2026-10-18.md). |
| 9 | Original Turn 6: iPhone 14 Pro Max portrait 430x932 DPR3 UI, touch/safe areas, Fighter Guide/Upgrade Bay sprite crop, Draft controls, 1x default. |
| 10 | Original Turn 7: brighter enlarged living sky, full arena battle spread, HUGE Mole L5 ground cracks, debris/dirt and dynamic impacts with visible targets. |
| 11 | Original Turn 8: distinct daylight arenas, pacing/camera, sprite silhouettes/outline consistency, concise intro/effects and measured mobile-friendly cost. |
| 12 | Original Turn 9: full release candidate tests and artifacts, all ten L4/L5, terminal/RAF/multi-front, 80/120/300, 42 PWA SHA256 pins, offline/cache, mobile screenshot/physical Safari where supported, P0–P2 defects. |
| 13 | Original Turn 10: final defect gate, lock handoff/release notes and CI, review PR #14; merge QA to main then ONE controlled Vercel production deployment ONLY on passing gates. Verify deployed SHA and smoke; rollback or report blockers rather than force success. |

## Three high-impact design briefs

### Turn 3 — Beetank L5, Siege Breaker

Existing live-source small first-to-L5 study had only 4/8 first-L5 wins, compared with 7/8 for L4. Wait for all-roster ROI before selecting the exact failure case; these historical 8 samples are not the final diagnosis.

Desired experience: a threatening, committed heavy charge can CRACK the enemy armored line, injure a limited group around a physically reached frontline defender and open a genuine second engagement. Favor a cohesive contact-based forward overrun or local armor-breach shockwave; one meaningful impact with discernible telegraph, actual capped secondary HP damage and a cinematic ground fracture. Prior splash-only and contact-first seismic variants were rejected; **do not recycle them unchanged**. Counterable by correctly placed Snipers/Dragons, evasion, and larger opposing armies. Not a Turtle Guardian clone, not a Mole tunnel clone, not a permanent global armor break.

### Turn 4 — Goblin L4 and L5, Warband

Live Goblin L4/L5 ~5/8 in earlier first unlock samples, and fixed L5 Dry/Pin2/Pin4 delivered no held-out first-L5 win flips while harming enemy-Goblin-double counterplay. An ambitious redesign can change the mechanism rather than blindly tuning 1.05x damage.

Desired experience: a small **cooperating** pack wins tactical windows by focused synchronized rush and bounded follow-through against an actual reachable enemy, making evolving a few Goblins attractive versus recruiting more. L4 makes pack tactics available; L5 unlocks a visibly bigger, decisive warband burst/coordination payoff, not just another nearby ally multiplier. Can pressure an isolated heavy; remains fragile when caught, scattered or outnumbered. NO permanent teamwide haste, stun-lock, lone-Goblin invulnerability, recursive procs or activation that requires an already overwhelming pack.

### Turn 5 — Barbarian L5, Bloodstorm

Existing premium Blood Cleave is **accepted and playable** on QA. Later small mirror sample ~5/8 first-to-L5; previous seeds showed stronger results. The Turn 2 opportunity-cost audit, not a cherry-picked sample, decides the weakness.

Desired experience: a close-range berserker with escalating short-lived rage/momentum based on actual combat that culminates in a brutal, readable frontline cleave/finisher. Distinct from Beetank's heavy charge and Goblin's pack teamwork. Keep ability capped in victim count, duration, stun and extra hits; no permanent kill-based exponential snowball or arena-wide damage. Preserve ranged kiting, multiple genuine HP-damaging fronts and actual severe-number counters. Emphasize spectacular timing over invisible raw multipliers.

## Evidence and ambition guardrails for each new turn

- **Power aspiration, not a rigged pass floor:** when the evolved family is in a favorable equal-population mixed 20/40 mirror fixture, first L5 should plausibly win **7–8/8 fresh held-out battles**, versus ~4/8 symmetric hold. Report failures openly; do not remove inconvenient seeds or counter-role opponents just to hit 7/8. First L4 should also be worthwhile.
- **Meaningful draft ROI:** compare actual full-match wins and true HP versus holding, adding two real units, or evolving another actual family. Show why investment is worth selecting in at least some real combinations; do not demand universal dominance against every counter.
- **Fairness:** peer L5 should remain competitive (roughly 3–5/8 in *comparable* mirrors). A *whole army* doubled and the 3-evolved-v-15 exception should usually win by numbers; separate them from doubling only the opposing fighter family. Not a hard-coded win guarantee.
- **Genuine battle spectacle:** record geographically distinct persistent physical positive-HP damaging fronts/windows, unit survival/actual capped HP, observed action cues and role counters. A visually stronger unit must not silently extinguish independent battles or substantially degrade 80/120/300 performance.
- **Nonnegotiable physics:** complete source-real terminal battles, raw/observer exact whole-RAF SHA parity, deterministic replay, unchanged unrelated fighter/tier hashes where applicable, no secondary recursive proc loops, zombies or round-state leakage. Node timings are never claimed as Safari FPS.
- **Per fighter hard budget:** one identified problem from Turn 2, at most TWO distinct source-only mechanical candidates (or one candidate + one justified refinement), ONE consolidated matched test and decision. Ship ONE best credible playable change in the same fighter turn, updating ability/FX/Guide and every affected PWA manifest SHA/cache version. If no credible candidate satisfies fairness, keep current playable behavior and document the limitation; no four-week pursuit of a perfect eight-win score.
- **Costs and release:** no automatic Vercel preview deployments, no extra test-only Vercel builds, no manual production deployment before Turn 13. Preserve branch gate in vercel.json and verify if possible (Vercel team API previously 403). Archive old expensive research jobs; keep critical CI. Main and production untouched until explicit release gate.

Historical ten-turn ledgers in older notes are retained as chronological records, NOT competing current plans. **Only this thirteen-turn ledger controls work going forward.**


### Oct 18 Turn 3 safety amendment
Full-contact L5 Beetank 7/8 initial ROI was **not releasable** due to 20-pop actual front regression. A measured heavy-target-only correction passes the 20/40 genuine-front budget. Its own exact-head matched full-battle ROI is pending before Turn 3 closure; earlier full-reach 7/8 does not transfer automatically. This amendment supersedes the earlier Turn 3 status row. Next Goblin only after passing acceptance.


### 18 Oct authoritative Turn 3 final verdict
This overrides the older provisional safety amendment: corrected heavy-target Beetank now passes full current-source match ROI, peer/number counters, exact unchanged-L4/full RAF parity, standard 20/40 persistent damaging fronts, 300-body and root PWA SHA checks at PR 39148932682. **Turn 3 complete, Turns 4–13 remain.** No Beetank re-experiments; next Goblin Warband then Barbarian Bloodstorm.


### Oct 18 — Turn 4 final decision
Completed exactly two bounded authentic matched L4/L5 Warband concepts. The first power-only buff improves first-L4 slightly but worsens first-L5; the second Rally improves first-L4 enormously but first-L5 loses and true independent damaging fronts collapse 24→8. Both preserve deterministic physics but fail gameplay acceptance. They remain **unshipped**. Existing playable Goblin L4/L5 stays baseline; preserve the user's request for transformational evolutions as an **unresolved** longer-term product quality item, not a reason to ruin the present release. Turn 5 Barbarian follows; no new exploratory Goblin loop.


### 18 October — Turn 5 last bounded verdict
Source-only current/contact/Bloodstorm study [PR 39155505052](https://github.com/danickman/ShowdownLab/actions/runs/39155505052) succeeded. The 75-tick momentum/third-hit burst was ambitious, but current baseline already wins 8/8 new heldout while proposed Bloodstorm suppresses true independent damage fronts 13→8. Both tested new arms **not shipped**. Earlier independent cohorts 3/8 are valid evidence of variance. No experimental Goblin or Barbarian game changes under 13-turn scope. Next: Turn 6 broad material fairness/role separation, including Dragon L4 overdominance. Do not spend extra standalone evolution experiments.


### Verified Turn 6 final — 18 Oct
Dragon L4 candidate cone limits 4/6 had no measured effect in 336 full mixed +12 genuine severe matches, and were not installed. Actual new heldout Dragon L4 first 8/8; all-army x2 8/8 and 3v15 4/4 remain a fairness risk. Strict RAF was corrected to compare true no-L4 Dragon L5-vs-L5 peers; exact head PR 39164933942 13 required CI jobs succeeded. Protect Assassin, Turtle and Beetank role distinctions; no generic DPS retune. Next Turn 7 performance and collision at 80/120/300 and population-based draft ×2 choice safety.
