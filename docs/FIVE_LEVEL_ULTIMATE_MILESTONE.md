# Five-level evolution and Ultimate mechanics

User-authorized gameplay milestone, 2026-10-12 UTC. This supersedes L1–4 Base / L5–9 Evolved / L10 Ultimate. Continuation base is review commit `72e2ef433cb5a6ed543f3ce1166a0237d9dc76b2`. Main/production remain `ba58c3d`; this milestone is review-only.

## Progression

| Level | Artwork target | Procedural treatment | HP/damage relative to L1 |
|---|---|---|---|
| L1 | Approved Base | Existing team ring | 1× |
| L2 | Evolved | Existing team ring | 1.4× |
| L3 | Evolved | Restrained warm rim, one gold ground chevron | 1.96× |
| L4 | Ultimate | Role-specific ability cues | 2.744× |
| L5 | Ultimate | Stronger rim, two chevrons and enhanced ability cues | 3.8416× |

Every evolution choice raises the selected squad exactly one level and adds 40% HP and damage multiplicatively. Collection Mastery remains independently +5% per rank, capped at M5. Speed, range, base armor/dodge, base attack cooldowns and roster ownership remain unchanged. Fixed spell damage/healing remains unchanged, so its relative power against high-level fighters is lower.

L5 is the hard cap. Adapter and raw core deployment clamp inputs; old test/Lab levels above five normalize to five rather than reinterpreting the old form. Both player reward modes exclude capped squads from upgrade offers; all-capped armies retain reinforcement/multiplication choices. Enemy draft selects eligible squads and takes a body reward if none can upgrade. An API request to upgrade a capped squad returns false without publishing or mutating state. Lab sliders stop at five. Reward labels distinguish EVOLVE / TEMPER / ULTIMATE / ASCEND and show HP/damage plus the unlocked ability. The reward preview now uses authored art rather than procedural geometry.

Six Evolved packs select at L2: Knight, Beetank, Goose, Sniper, Dragon, Assassin. Mole, Turtle, Goblin and Barbarian still use approved Base art. Ultimate art is absent for all ten. L4–5 therefore show the best available art plus actual Ultimate mechanics and cues. Previews explicitly say artwork is pending. Renderer accepts future `<Fighter>UltimateArt` registrations with shared-scale poses, feet, envelopes and cues. No approved asset was regenerated.

## Ultimate abilities

| Fighter | L4 ability | L5 enhancement | Strategy / counterplay |
|---|---|---|---|
| Knight | Bastion: nearby allies take 20% less damage within .09 world radius | 30% protection within .12 | Protect a formation; separate/flank the group. Multiple Bastions do not stack. |
| Sniper | Piercing Verdict: rifle shots ignore 60% of armor and pierce one enemy behind the target for 55% attack damage | Ignore all armor; 80% piercing damage | Punish armored, aligned ranks; close melee removes the rifle benefit. |
| Dragon | Inferno: breath adds 45% attack damage as burn over 90 ticks | 75% attack damage burn | Sustained cone pressure; spread out and interrupt/close on Dragon. Burns refresh rather than stack; underground Mole receives no burn ticks. |
| Assassin | Execution: backstab adds 80% damage below 40% enemy HP | 120% bonus below 55% HP | Finish vulnerable back lines; bodyguards and healing deny the threshold. |
| Beetank | Seismic Ram: ram/every third horn splashes 35% damage and stuns nearby enemies for 12 ticks within .11 | Every second horn, 55% splash, 20 ticks and .14 radius | Disrupt clustered front lines; spreading and ranged pressure reduce splash. |
| Mole | Nuclear Carapace: reduce all incoming damage by 35% | 50% reduction | Durable burrowing threat; high sustained damage or fewer, heavier ranged hits still matter. |
| Turtle | Ricochet Shell: reflect 30% of damage actually taken from attackers within .09 | 45% reflection | Punish close attacks; distant ranged attacks and spells do not trigger reflection. |
| Goblin | Pack Ambush: +20% damage per allied Goblin within .10, up to three allies | +30%, up to four allies | Reward cohesive packs; splash and separation break the bonus. |
| Barbarian | Blood Cleave: axe swings splash 40% attack damage to up to three other enemies within .065 of the victim | 65%, up to five, .09 radius | Punish dense melee; dispersed ranged units avoid the cleave. |
| Goose | Thunder Honk: honk deals 45% attack damage and stuns for 22 ticks within .18 | 75%, 32 ticks and .22 radius | Control nearby crowds; ranged spacing remains its counter. |

Simulation uses approximately 60 ticks/sec at 1× (fixed step 16.666ms in `v3/legacy-sim-core.js`). Accordingly Dragon's 90-tick L4 burn lasts about 1.5s; Goose's 22-tick L4 stun about 0.37s and 32-tick L5 stun about 0.53s. This corrects the earlier 30-tick research estimate without rebalancing ability durations. Modifier hooks are in `v3/ultimate-abilities.js`; original targeting, role step logic, separation, terminal handling, listener isolation and RAF lifecycle are retained. Secondary damage applies normal defenses but cannot emit another piercing/cleave/reflection chain. No extra combat randomness is introduced. Damage reduction combines multiplicatively with existing armor, guard, shell and ward; Bastion uses only the strongest nearby source. Its candidate list is prepared once per deployment, so ordinary attacks do not rescan the whole roster for protection.

## Presentation and validation

Ten short role-specific effects distinguish shield/carapace protection, rifle piercing, burn, execution, seismic pressure, reflection, pack pressure, axe cleave and honk. Event stamps are throttled to 12 ticks per source. Presentation emits at most six cues per snapshot, suppresses them at 60+ fighters/minimal tier, retains the existing total FX cap, and expires cues after 220–360ms. Ground coordinates and staging offsets are captured at onset. L3/L5 accents have no particle queue; dense/minimal scenes retain static foot marks without sprite blur. Reduced-motion modes use static geometry.

Tests cover level/HP/damage boundaries, Mastery preservation, API and player/bot cap behavior, all ten L4 and L5 mechanics, no L1–3 abilities, exact core damage-path resistance/reflection/piercing, finite secondary chains and burrow-safe burns. Mixed L1–5 seeded matches validate determinism and termination alongside baseline simulations and exception/RAF guards. Native tier contact sheet and effect geometry cover all packs and all effect tiers, asset readiness and balanced Canvas state. Existing equipment envelopes, staging/camera, sky/floor framing, physical effects, terminal captions and reduced-motion checks remain required.

Reproduce: `node tools/check-evolution-progression.cjs`, `node tools/check-ultimate-abilities.cjs`, `node tools/check-ultimate-art-contract.cjs`, `node tools/check-evolution-effects.cjs` (native Canvas dependency), and existing checks in `TEST_MATRIX.md`.

Balance is a first playable tuning pass, not a claim of fair win rates for every matchup. Device frame pacing and exact-head phone approval remain open. Ultimate art and four remaining Evolved packs are separate art milestones. Existing mixed-melee overlap remains open.


## October 15, 2026 gameplay correction to the 2026-10-12 milestone

The historical Goose Thunder Honk 22/32 ticks above (0.37/0.53s) was **the original implementation**, not the ultimate's advertised 0.73/1.07 seconds. A later measured QA-only correction doubles L4/L5 physical stun to **44/64 ticks (approximately 0.73/1.07 seconds)** without changing damage, range, chance, cooldown or base Goose. The current Fighter Guide and Ultimate specs have been aligned. [Updated matched A/B research](GOOSE_ULTIMATE_REAL_STUN_2026-10-15.md). Do not assume this gameplay change has been deployed to production.
