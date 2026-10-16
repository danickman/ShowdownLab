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
