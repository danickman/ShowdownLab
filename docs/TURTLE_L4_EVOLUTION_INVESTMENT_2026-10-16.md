# Turtle L4 meaningful evolution investment — controlled source study

**October 16, 2026 · QA-only research · no runtime change**

## Why
Corrected 216-match tier ROI showed L4 Turtle had the same 11/24 win count as L1 while Beetank maintained a far stronger direct attacker-credited HP output. The conditional low-HP ally Guardian made Turtle defensively distinct from Beetank, particularly at L5. The user asked that every fighter provide a tactically meaningful reason for repeated evolution investments, rather than escalating all classes into equal DPS.

## First source exploratory signal (not a release claim)

Under matched standard 32 full-terminal 20/40 matches (16 each) and 24 Turtle-heavy selected-faction matches, 18%→20% **L4 only** protection produced:

| Metric | Current QA (18% L4) | Candidate (20% L4) |
|---|---:|---:|
| Standard 20 persisted real independent fronts | 1 | 1 |
| Standard 40 persisted real independent fronts | 58 | 57 |
| Targeted 24 matches, real independent fronts | 109 | 120 |
| Targeted selected-faction Turtle direct HP | 10,385 | 11,339 |
| Targeted wins | 12 | 12 |

Stronger 22% L4 cover reduced standard 40 persistent fronts from 58 to 53 and targeted wins 12→10. A L4 Ricochet boost from 30→35/40% did not improve standard front persistence or targeted payoff as consistently; increasing the radius to 0.13 also reduced the standard fight score. These outcomes do **not** justify committing a tuning parameter based solely on 24 favourable samples.

## New permanent source A/B

`tools/qa/check-turtle-l4-investment.cjs` compares unchanged current source with four L4-only candidates: Guardian 20%, Guardian 22%, reflection 35%, radius 0.13. Across **104 full terminal cases per variant**: 32 standard full-roster 20/40 quality matches, 24 prespecified Turtle matches, 24 new-seed matches (2017/4201), and 24 heavy/no-Knight counter stress matches. Exact team, seed, roster and level are held fixed between candidate and live source. Read-only real `hurt()` HP, authentic independent attacking fronts, winners, Knight/Goblin HP and local actual post-dodge/HP-cap saving are independently reported. All L5 Turtle **solo counter** physical frame-state SHA remains identical and source observers must be trace-neutral.

The study intentionally **does not ship** any L4 numerical change. Choose an implementation only if substantial actual defensive utility and strategic payoff is backed by robust held-out data, genuine front safety and acceptable counters. Avoid superficial buffs or test-threshold weakening. Primary iPhone 14 Pro Max Safari acceptance stays open. No main merge or production deployment.

## Measurement accuracy: reflected damage

Ricochet reflect uses `source:null` on a secondary `hurt()` call. Ordinary attacker-credited damage therefore **excludes** Turtle reflected damage. The permanent study now correlates actual physical secondary target HP loss with the live Turtle reflector's ID/tier; this is measured **after** incoming armour, Guardian/Bastion protection, dodge, and remaining-HP cap. It is distinct from direct Turtle snap/slam HP, and deliberately separate from the existing direct-attack geographic damage-front control. A positive amount in any full-terminal sample is required. Observed and unobserved frame hashes must match exactly so this instrumentation cannot silently change combat behavior.

Holdout verdict must consider direct HP **plus actually reflected HP plus saved ally HP**, not false direct-DPS parity with Beetank.
