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
| **5 — ADDED: Barbarian** | Ambitious L5 **Bloodstorm** apex built on accepted Blood Cleave: explosive frontline melee pressure with bounded rage/finisher payoff; real full-match and combat-front verification, appropriate cinematic effects. |
| 6 | Original Turn 3: repair only other MATERIAL ROI outliers, especially Assassin/Turtle distinct roles, and preserve broad fighter viability without flattening diverse counters. Do not reopen the three dedicated roles absent a P0/P1 regression. |
| 7 | Original Turn 4: combat/targeting/collision/performance and true separated battles at 80/120/300, stop proposing x2 if population >120 and offer meaningful alternatives. |
| 8 | Original Turn 5: terminal/deterministic stability, 300-body edge case, fairness/AI, no zombies, no round leakage; confirm Ultimate Lab enemy-starting-unit chooser and three-mode clarity. |
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
