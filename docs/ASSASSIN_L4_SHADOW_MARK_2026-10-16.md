## Completed source A/B verdict — reject both marks

Dedicated `assassin-l4-shadow-mark` [CI job 117172081229](https://github.com/danickman/ShowdownLab/actions/runs/38959917733) PASSED the real 312 terminal tests, observer/raw RAF parity, five L5 solo control counters, and non-L4 80/120/300 unchanged-source parity. Both prototypes are **REJECTED as gameplay**, not a reason to loosen tests. In 24 initial selected real terminal matches:

| Metric | Current Assassin | Mark +25% | Mark +40% |
|---|---:|---:|---:|
| Mark applications | 0 | 166 | 165 |
| Actual mark consumes | 0 | 78 | 78 |
| Consumed by anyone other than Assassin | 0 | **0** | **0** |
| Assassin actual direct HP | 16,815.88 | 18,321.50 | 19,283.99 |
| Full-game team wins | 13 | 13 | 13 |
| Real persistent front windows | 77 | 73 | 72 |

Standard 20-fighter positive-damage persistently independent fronts **1→0** for both mark variants. Standard 40-game separated damage windows **192→191/185**. Independent unseen seeds win 12→12 for both, and 40% armored/no-Knight holdout wins **10→9**. 25% raises Assassin's own DPS by ~9% and 40% by ~15%, but fails the intended cooperative mechanism because 0 allied mark consumers, and undermines combat theatre. This proves allied targeting cannot exploit the mark in its tested form. Neither belongs in runtime/Ability Guide/PWA.

**Next stop chasing stat tweaks:** Benchmark upgrade opportunity cost with genuine **L3→L4** and **L4→L5** choice against reinforcing the same squad or upgrading Beetank, across opposing swarm/backline/armored compositions. Tier-4 should enable a fighter's unmistakable role and tier-5 should add a repeatable, bounded Ultimate decision, but only when it gives better *team combat value* than the alternative draft pick. Good mechanics candidates: endangered-ally preservation / battle-turning shell intervention for Turtle, and genuine backline attack denial/counterplay on Assassin vanish without synthetic damage, not an ineffective ally follow-up mark. Measure team wins and actual HP saved/denied, true 20/40 persistent independent fronts, and 80/120/300 CPU with current art and primary iPhone 14 Pro Max Safari. Retain existing L4/L5 skills while testing. No production/main merge.


# Assassin L4 Shadow Mark tactical follow-through — source-only research

**16 October 2026 — not shipped, not merged to main or deployed.**

L4 Assassin gets a different tactical purpose from increasing damage/movement: a genuine vanish on a real enemy Sniper or Dragon could apply a one-use, nonstacking 120-tick **Shadow Mark**. Only the next actual direct allied hit on the marked physical unit gains 25% or 40% damage, before normal armour/guard/dodge and HP cap. Without a real follow-up hit it expires without damage. Beetank/Turtle heavy targets cannot be marked. No extra stun, free hits, permanent debuff, wide aura, attack-range shortcut, or L5 change.

The permanent QA research code runs original source baseline +25%/+40% source-only prototypes, **3×104 fully terminal, matched 20/40 physical matches**: standard whole-roster, original selected L4, unseen seeds, and armored/no-Knight stress. Reports real mark application, use by other allied roles, actual Assassin/Sniper/Dragon/Beetank/Turtle HP, genuine independent HP-damage fronts, match winners, Knight/Goblin health. Mandatory full raw/observed frame SHA equivalence, unchanged L5 solos versus five opponents and 80/120/300 no-L4 source parity at 1×/10×.

Reject if real winner/front/counterplay regresses. If promising, a further game implementation requires L4-dense 300 CPU benchmarking, real in-game cue, Guide copy, 42 SHA release-pins, full QA and physical iPhone 14 Pro Max Safari. No conclusion of fitness until exact-head CI and holdout data.
