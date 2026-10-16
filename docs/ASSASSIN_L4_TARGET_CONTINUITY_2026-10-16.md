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
