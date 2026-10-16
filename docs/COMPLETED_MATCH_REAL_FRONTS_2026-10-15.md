# Fully completed 20/40 battle-quality study — 2026-10-15

**QA branch only.** Source base: \`38a537e85b81d672398897ae0f0ee77f34c430fc\`. Full predecessor GitHub run [38827239405](https://github.com/danickman/ShowdownLab/actions/runs/38827239405): 35 active success, one optional skip. Production/main unchanged.

## Why this study exists

Short HP/position traces and head-to-head win counts are insufficient to judge whether fighting is both enjoyable and authentic. The desired signal is **several real HP-damaging, spatially separate engagements that continue across time**, plus varied role participation and a full terminal winner. The permanent \`check-role-fronts-baseline.cjs\` already implements damage-edge graph truth and persistence; this turn expands it into a **complete-match** acceptance gate for ordinary 20/40-fighter crowds.

## Controlled source A/B trials (no variants shipped)

All trials are deterministic fixed-seed, mirrored full battles, 10× simulator speed, with an actual terminal result. Each arm was compared to the current shipped QA runtime under the same matchup, roster and seed.

| Candidate | Completed-match outcome | Decision |
|---|---|---|
| Barbarian extra heavy-contact range | Zero real hit or winner changes in six L1/L4/L5 mirrors for Beetank, Turtle, Dragon | Reject ineffective reach buff |
| Initial row spread from 0.065 to 0.080 | Initial 12-case/size probe: 20-body substantial distinct damage windows **24→27**, persistent **1→6**; **40-body** persistent **53→28** despite greater spacing | Reject unscoped change |
| Lane targeting preference 0.12→0.18 | Same probe: 20-body persistent **1→1**; 40-body **53→31** | Reject |
| Broader 20-only row spacing 0.070/0.075/0.080/0.085 | Across 32 completed 20-body battles, baseline distinct **57**, persistent **5**. Best trial at 0.080 gave distinct **62**, persistent **8** but changed four winners and lowered some role damage. Other widths showed inconsistent gains | Do not ship population gate without further proof |
| Disable hit-interruption caused by secondary/burn/splash | 12 full 40-body games: independent persistent **53→38**, reduced total damage and hits even though individual melee damage rose | Reject |
| Goblin-only reduce anti-crowding target-pressure penalty | In 16 completed 40-body games, Goblin damage rose **2,004→2,891** at zero penalty, but persistent independent fights **69→41** | Reject crowding buff |
| Dragon cone non-primary hit from 0.72→0.66/0.60/0.54 | 16 complete 40-body games: baseline persistent **66**, all variants **59/53/53**. Dragon share only falls from ~35% to 33% at strongest cut while weakening independent fight continuity | Reject indiscriminate Dragon nerf |

**Important:** Do not compare first 12-case and second 16-case denominators as if they were identical. Variants can change actual completed winners legitimately, but mere damage increase does not meet the user’s strategic multi-front goal.

## Live baseline that must remain visible

In the direct fixed 16-match per-size mixed/swarm/heavy/ranged roster benchmark (two seeds × both mirror sides, 10× and up to 450 frames, no stops before a genuine winner), the current QA runtime produced:

| Measure | 20 fighters (16 complete) | 40 fighters (16 complete) |
|---|---:|---:|
| Authentically separated **damage windows** | **25** | **193** |
| Consecutive independent persistent two-front windows | **1** | **66** |
| Positive HP-damage hit events | **1,287** | **3,386** |
| Attributed attacker HP damage | **~59,484** | **~151,232** |
| Dragon share of attributed damage | **~45%** | **~35%** |
| Terminal winner confirmed | **16/16** | **16/16** |

The persistent 20-fighter signal is critically weak (**one qualifying window across sixteen matches**). This is the next design problem. The larger arena may still be visually clumped, but 40-body damage-front evidence is significantly stronger. Short snapshots, fake combat zones, simple proximity and staging layout alone will not answer it. Dragon burn, source-less reflection, and spells lack an actual attack-source ID and are correctly excluded from attacker-front attribution; do not treat the damage totals as complete HP-throughput numbers. Knight guarding, Turtle reflection, Goose stun and Mole damage absorption also have utility beyond credited DPS.

## New permanent gate

\`tools/qa/check-completed-match-quality.cjs\` runs all 32 actual terminal fights; instruments only positive, attacker-attributed HP damage; extracts **the same existing graph** rather than a new proxy definition; records early/middle/late damage-window distribution, 25/50/75% survival, source-by-role damage and team damage, complete winner/tick, exact per-frame parity versus uninstrumented simulation in 20 and 40, and deterministic repeatability. The independent CI job archives a full JSON receipt. Baseline quality floors detect severe regressions and are intentionally conservative. They do **not** imply 20-body fronts are satisfactory; do not remove them to make a new candidate pass.

## Next gameplay turn

Test selective **small-battle engagement retention** without predetermined battle lines: late target-switch hysteresis, squads following live opponents when actual local damage has occurred, or one-to-one contact ownership. Require genuine persistent fronts (20-body) and non-degraded 40-body counterplay across more seeds/roles, including real finished winners and 300-fighter budget. No new high-density CPU work or global stat multipliers without proving benefit. The Phaser/HTML renderer and actual Safari QA remain separate.

**This turn intentionally ships no combat or presentation adjustment after five candidate families failed measured quality.** That is a QA and design safeguard, not a claim that the weak 20-fighter experience has been solved. Full new-head GitHub CI required to validate the new analysis test.


## Validation and queued role-value follow-up

The new 32 terminal-match quality gate fully passed on [QA Actions run 38830645911](https://github.com/danickman/ShowdownLab/actions/runs/38830645911): 36 required jobs successful, zero failed, one optional skipped. Observed mid/late phase separated-damage windows confirmed **20-body early 22, middle 3, late 0** vs **40-body early 114, middle 73, late 6** across the 16 completed matchups per size. The user then explicitly prioritized Assassin Execution, Turtle defensive value versus Beetank, and evolved weak units in the next gameplay implementation turn; see [ROLE_VALUE_EVOLUTION_NEXT_TURN.md](ROLE_VALUE_EVOLUTION_NEXT_TURN.md). No live gameplay files change in this doc-only follow-up.
