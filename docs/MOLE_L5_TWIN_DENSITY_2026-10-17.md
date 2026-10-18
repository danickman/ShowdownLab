
# Mole L5 Twin density and off-target source performance gate
17 October 2026. Following the exact 204-match [candidate decision](MOLE_L5_LOW_COLLATERAL_2026-10-17.md), test the already proven Twin candidate: actual burrow eruption triggers deterministic .20-length, .060-halfwidth fissure with at most two extra enemies, .62 multiplier and three ticks stagger. FIRST L5 8/8 new heldout wins, peer L5 4/8, whole-army doubling 0/8, 3-v-15 0/4; real separate fronts persist 10 baseline to 27 Twin, but separate positive HP damaging windows 72 to 62.

The source-only node test tools/qa/check-mole-l5-twin-density.cjs imports the EXACT fissure generator and constants from the previously passed study, uses current live v3 combat source, and measures two new density seeds 37991 and 44033 at 80/120/300 total fighters with 26 percent Moles each side, blue L5/red L4. Each original-versus-Twin source run observes 16 RAF frames at 1x then 16 at 10x, complete physical state hashing, Node p50/p95, bounded movement and finite health. Require a real trace difference; a study that never triggers Twin is worthless. Six matched populations/seeds times two sources = 12 physical source samples.

Additionally verify twelve entire-RAF exact hash pairs without ANY L5 Moles: group no-Mole and group all-Moles-L4 at 20/80/300 for two independent speed-mode seed choices. If a non-L5 trace changes, stop. Ratio ceiling detects only catastrophic CPU cost, not acceptable mobile FPS.

The candidate is NOT yet integrated into v3 ultimate, PWA, animation or Fighter Guide. Even if green, actual playable QA integration, UI/theatre readability and hands-on iPhone 14 Pro Max Safari remain separate. Main and production protected. Exact-head CI pending.
