# Timed Turtle Shell Guardian — source-only tactical study

October 16, 2026. **No gameplay modification.**

## Rationale and proposed risk trade-off
The immediately prior 520-battle study rejected making permanent L4 Guardian or Ricochet percentages stronger. This study uses a *temporary* defensive role while L4 Turtle is in its existing shell state. Normal L4 wounded-ally Guardian remains 18% within radius 0.12 and only for allies with pre-hit HP below 60%; L5 stays unchanged. No generated damage, stacking, or forced enemy selection is added. The existing 22-tick shell prevents its own regular attacks and leads to its normal eventual shell-slam.

Four comparison sources: **baseline** (shipped QA); **shellBrace28** (L4 shelter becomes 28% only during its naturally triggered shell); **reactiveShell24** and **reactiveShell30** (L4 eligible guardian enters its existing shell when a nearby allied defender already below 45% health gets hit, if `shell===0 && special<=0`; its shell-state protection is respectively 24%/30%, ordinary protection remains 18%). Only the *one* selected guardian may react on a given hit; the selected strongest nonstacking protector rule remains. The cooldown is set to 85 on activation, and Turtle cannot simultaneously continue attacking during the 22-tick shell.

## Test protocol
`tools/qa/check-turtle-timed-shell-study.cjs`: **four real source variants ×104 complete terminal 20/40-player matches = 416 fights**. The same 32 standard matches, 24 prespecified Turtle squads, 24 unseen-seed matches, and 24 no-Knight/armored counter-stress matches per option as the prior L4 ROI study. Independently report true source-linked geographically separated HP-damage fronts, terminal winners, actual direct Turtle HP, reflected defender HP taken after dodge/armor/HP cap, same-hit L4 saved ally HP, protective events when shelled, Knight and Goblin genuine HP. Instrumented/uninstrumented RAF state hashes must be exact, and L5 solo versus Beetank/Sniper/Assassin must preserve physical frame SHA under every candidate. No numerical gate weakened.

If source-only data survives holdouts, follow with more independent seeds, 80/120/300 real fighter CPU and physical **iPhone 14 Pro Max** Safari acceptance *before any gameplay patch*. Source CI is not FPS certification. No runtime changes, art, PWA assets, merge or deploy.

See also [rejected passive L4 ROI](TURTLE_L4_EVOLUTION_INVESTMENT_2026-10-16.md).

**Measurement correctness:** record a true below-45%-HP trigger separately from ordinary shell-active mitigation. A baseline shell must never count as the proposed reactive action; observation must preserve all RAF-state SHA hashes.


## Verified first full trial — commit `76f99b5`, push CI 38924690947

The 416-match source-only trial **passed**. Real triggered shells were confirmed by a separate callback (not confused with ordinary shell time), and per-frame observed/raw source SHA controls plus L5 solo SHA held. It is **not** a gameplay approval.

| Candidate | First 24 true fronts | Unseen 24 true fronts | Unseen wins | No-Knight/armored wins | Standard 40 true fronts |
|---|---:|---:|---:|---:|---:|
| Current QA | 109 | 110 | 13/24 | 6/24 | 58 |
| Natural shell 28% | 110 | 113 | 13/24 | **4/24** | 57 |
| Real critical-ally reaction 24% | 117 | 118 | 12/24 | **7/24** | 52 |
| Real critical-ally reaction 30% | 124 | 123 | **11/24** | 7/24 | 54 |

24%-reaction triggered **176** real events in first 24 matches and **194** on unseen seeds; L4 *same-hit* saved ally HP first 24 matches rose 4,007→5,759. The 20-body standard still had only **one** persistent real separated attack front; 40-body real persistence declined **58→52**, so the original broad reaction should **not ship** even though the defensive effect is real. Natural-shell-only 28% worsened stress wins. 30% reaction further worsened unseen wins. Do not confuse immediate saved HP with full-match causal team HP.

### Follow-up refinement — same 416-case job, no new expensive CI job

Keep original baseline and reactiveShell24 as historical/controlled comparators; replace rejected natural shell 28% and reactive 30% with two role-preserving L4 24% reaction variations:

- **protectiveGap24** — only react if the currently selected L4 Turtle's ordinary 18% shelter is *already* stronger than nearby Knight Bastion or any other assigned guard. It won't interrupt the Knight-protected defender merely to steal Bastion's role.
- **gapDuringRecovery24** — same lack-of-alternative-protection requirement, and Turtle must still have `cooldown>=16`; Turtle protects a critically hit ally during its attack recovery rather than interrupting its own ready strike.

Both require defender **pre-hit HP below 45%**, a physically nearby selected L4 Turtle, and Turtle `special<=0, shell===0`; triggered shell still lasts 22 ticks with special lockout and a normal eventual shell slam, no new damage. The observer records actual pre-react protection and cooldown; hard assertions verify every new reaction met these restrictions, with raw-source RAF state equivalence. **Same job and 416-case budget**, not an expensive accumulating per-commit CI job. This does not change shipped gameplay, root PWA hashes, UI art, 300-population cap, or main/prod.



## Verified gated-refinement verdict — October 16

Exact-head QA `901c198` [push 38925820908](https://github.com/danickman/ShowdownLab/actions/runs/38925820908) and PR green. Of 416 fully terminal matches, the gap-only L4 shell reaction gives 24 prespecified genuine fronts 109→122 but held-out wins fall **13→10**, while baseline 40-body independent sustained fronts fall **58→50**. Recovery-only reaction seldom triggers (0 prespecified, 1 unseen, 2 stress) and loses hard-counter wins **6→3**. Broad 24% reaction dropped standard 40 fronts **58→52** and unseen wins **13→12**. **All rejected.** No actual Turtle combat or ability description changed. Next research is [Assassin L4](ASSASSIN_L4_EXECUTION_STUDY_2026-10-16.md).
