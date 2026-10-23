# Assassin L4 target continuity — source-only matched diagnostic

October 16, 2026 — QA branch. No runtime patch, fighter-guide promise, PWA integrity update, production deployment or main merge.

## Rationale and true core detail

The authentic `step()` loop first calls `nearest(u)` and `trackTarget(u,t.id)` for *all* fighters, including Assassin. Then `assassinStep()` calls `nearest(u,true)` to prefer living Snipers and Dragons (if any), and calls `trackTarget()` **again**. This means the visible `u.target` at entry to Assassin-specific logic is a transient generic assignment, not a dependable memory of a wounded backline opponent. Do **not** implement an "Execution target loyalty" mechanic using `u.target` as remembered Assassin prey without addressing this double-targeting sequence.

The earlier source-only 416-completed-game L4 threshold study rejected 50%, 55% and 60% HP gates: Execution procs rose 13→26/28/31 per 24 first selected games, while real damage rose only 2.8–3.8%, winner counts did not improve and standard 20-body independent fronts fell from 1 to 0.

## Controlled tactical hypothesis (NOT shipped)

A physically distinct L4-only remembered Assassin focus (`u._assassinFocus` in candidate **source only**) persists the last backline-preferred target between Assassin decision ticks. If it is **still alive, backline Sniper/Dragon, already below 40% HP**, remain on it only if within 0.06 or 0.12 arena units of the current preferable backline target. Otherwise freely reacquire. These two bounded alternatives leave L1–L3, L5, target legality and existing Execution thresholds unchanged. Candidate focus is not present in the actual game.

The permanent research runner `tools/qa/check-assassin-l4-target-focus.cjs` reports **true individual physical Assassin decisions** (stalk, vanish, reach-ready, backstab, disengage), target switches while previous wounded backliners survive, sniper/dragon and Beetank/Turtle actual post-armor HP damage, real Execution/backstab callbacks, completed winner and genuinely independent damage-front counts. Read-only observation requires frame-state SHA parity. L5 solo vs Beetank/Turtle/Sniper/Dragon/Knight and 80/120/300 non-L4 physical traces at 1× and 10× must remain identical.

**312 complete actual matches:** three source variants × (32 standard 20/40 and 24 each preselected, unseen seed, no-Knight/armored stress). Reject a candidate with reduced winner/fighting-front metrics even if target-continuity ticks or damage increase. Current gameplay keeps L4=40% and L5=75% Execution threshold. Physical iPhone 14 Pro Max Safari approval remains open.

## Acceptance and follow-through

If both candidate variants fail genuine battle quality, do not silently ship a target-lock tweak; use the diagnostic to locate the dominant loss (stalking versus disengagement, too little actual HP contact, focus swaps, armour access). If a candidate is promising, consider role-specific balance and real high-population frame budget before any production change. Keep QA handoff, roadmap and test matrix synchronized.


## Verified result: 312 real terminal matches — October 16

Dedicated source study passed in [push Actions 38956599251](https://github.com/danickman/ShowdownLab/actions/runs/38956599251) on QA `eb26a7b`. Instrumented/raw SHA identical; five L5 solo counter roles and no-L4 80/120/300 fighters at 1×/10× identical. All 312 seeded battles actually terminated. The receipt explicitly marks **both proposals REJECTED**. These are source-only results; no runtime patch.

| 24 preselected L4 Assassin games | Live | 0.06 wounded-backline focus | 0.12 focus |
|---|---:|---:|---:|
| Team wins | 13 | 13 | 13 |
| Actual Assassin L4 direct HP | **16,815.88** | 16,502.92 | 16,502.92 |
| Real backstabs | **192** | 187 | 187 |
| L4 Execution callbacks | 13 | 14 | 14 |
| Wounded backline abandoned alive | 5 | 0 | 0 |
| Physically separated persistent attack fronts | 77 | 85 | 85 |
| Real damage-front windows | 214 | 221 | 221 |

The relatively few relevant abandoned wounded enemies (five in 24 first matches, sixteen in the unseen seed matches) do not justify keeping an already wounded target if it delays contact. Focus variants reduce normal target switches modestly but also reduce realized offensive HP. The positive fronts in selected matches do **not** override actual lost HP and no win gains; in 24 stress matches, 20-fighter persistent independent fronts also drop 10→7. Neither focus margin meets the independent +5% selected real HP improvement check.

**Primary measured bottleneck is access, not Execution activation or target loyalty.** During those 24 first matches, L4 Assassin source observations counted **18,892 decision ticks**: 17,079 stalking; 227 vanish; 192 backstab; 1,394 disengagement; 13,255 decision ticks where attack cooldown was zero but target distance remained beyond reach (~70.2% of observed decisions). One decision tick is **not** a real-time second. Double generic/backline nearest selection still exists, and `u.target` is reset first by generic selection each tick.

The response should *not* be to invent hits, globally enlarge reach, remove Beetank/Turtle armour or broadly double Execution damage. **Next falsifiable source-only test**: give only L4 Assassin a modest, finite **last-mile backline pursuit assist** on stalking ticks with `cooldown<=0`, target actually of Sniper/Dragon type, `d>r` but inside a short bounded distance (e.g. `d<.30`). Test movement multipliers and real landed HP, 20/40 independent fronts, armor/ranged counterplay, 80/120/300 cost and physical device eventually. Keep existing L5 75% Execution, L4 40% and all current actual combat unchanged until those tests succeed.

