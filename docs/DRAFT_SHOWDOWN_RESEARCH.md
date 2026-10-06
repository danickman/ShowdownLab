# Draft Showdown 1.17.1 — Mechanical Research Notes

Status: **REFERENCE RESEARCH — NOT IMPLEMENTATION SOURCE CODE**
Purpose: preserve reverse-engineering findings that may inform Showdown Lab's future mechanics and parity roadmap.

These notes summarize prior static analysis of a user-supplied Draft Showdown 1.17.1 package plus observed gameplay. They are evidence for mechanical concepts and architecture, not permission to copy code, assets, exact protected content, proprietary balance tables, or UI/art.

## Clean-room rule

Use this research to answer what systems exist, what kinds of data drive them, what behavior families matter, and what architecture is worth reproducing independently.

Do not redistribute extracted assets, copy source/decompiled implementation, reproduce proprietary art/audio, or blindly clone exact hidden constants where independent tuning is appropriate.

Showdown Lab should independently implement similar mechanics with original code, content, visuals and balance.

## Package / architecture findings

- Draft Showdown 1.17.1
- package: com.QuestLab.DraftWar
- Unity / IL2CPP
- base APK + ARM64 split
- large libil2cpp.so, global-metadata.dat and data.unity3d
- modern Unity generation

High-confidence deterministic-combat concepts identified include BattleCombatSimulationService, BattleSimulationTick, BattleRngSeed/BattleSeed, BattleChecksum/BattleChecksumAdapter, BattleSpawnScheduler, SimClock, deterministic projectile/hazard/spell implementations, canonical simulation-state concepts and deterministic formula support.

Diagnostic strings referenced per-unit differences such as NEXT_ATTACK_TICK, PENDING_BULLETS, DEATH_TICK, MASS and RADIUS.

### Implication for Showdown Lab

Our direction is correct: keep a deterministic/headless rules engine separate from presentation. Long-term: rules + seeded RNG → deterministic simulator → normalized battle events/state → Canvas renderer.

This supports battle codes, replays, deterministic regression, ghost opponents and potentially client-light multiplayer later.

## Data-driven configuration findings

Strong evidence exists for serialized/config-driven systems corresponding to DraftPool, UnitUpgradeSetup, SpellUpgradeSetup, MasterySetup, AiTendencySetup, AiUnitCountSetup, OpponentsSetup, DraftSynergySetup, CommanderPathSetup, ArenaProgressionSetup, RankedMilestonesSetup and TrophyRoad.

### Implication

Showdown Lab should move toward a data-driven unit/draft/progression registry rather than hard-coding every rule in combat branches.

## Draft architecture

Observed concepts include DraftPool, DraftPoolManager, DraftPoolsPerRound, DraftSetup, DraftRound, DraftSeed/DraftSeeding, DraftCard, DraftPick/DraftPickData, spawn/multiply/upgrade/merge card effects, weighted draft setup, draft synergy, card/deck AI settings, NormalDraftStrategy and RankedDraftFacade.

Recovered table fragments strongly suggest draft configuration distinguishes weight, early/late weighting, spawn, multiply, upgrade, merge and several magnitude variants.

### Independent Showdown Lab model

A draft card should be treated as an effect targeted at a unit/spell/system target, with magnitude, eligibility, weight, phase weight and tags. This is more scalable than modeling a card as merely a unit.

Future parity work: seeded draft pools, effect-based cards, early/late weighting, synergy-aware scoring, comeback/consolation choices and Lab controls to force specific draft effects.

## AI / opponent architecture

Observed concepts include OpponentProvider, AiOpponentPlayer, NetworkOpponentPlayer, LocalHumanPlayer, IOpponentSource, trophy/Elo opponent lookup, opponent deck creation, opponent strength/commander bonus, SelectOpponentUnitsWithDraftAI, SelectOpponentSpells, AiSmartness, AiTendency, AiTendencyModifier and AiUnitCountSetup.

There are also rated/ghost-related strings around rated matchmaking, rated ghost, rated fight ghost, opponent_id, player_mmr, player_rd and player_trophies.

### Working inference

Opponent drafting appears to consider more than randomness: card/unit value, opponent tendency/personality, current unit count, synergy, round weighting and controlled randomness. aiSmartness likely controls how strongly the best-scoring result is preferred.

### Showdown Lab opportunity

Expose AI reasoning in Lab/debug mode: candidate cards, score components, why the bot picked one and an intelligence slider. That turns this research into a unique community feature rather than a clone.

## Progression architecture

Separate systems were identified for Commander, Mastery, Arena progression and Ranked progression.

Commander concepts include level/points, health/damage bonuses, path/milestones, spell-slot unlocks and mode unlocks. Mastery concepts include level, points, upgrades, bonuses and reward types. Arena progression includes requirements/unlocks and unit/spell unlocks.

### Design lesson

Do not collapse all progression into one unit level. Keep unit level, evolution/form, mastery, commander/global modifiers, arena unlocks and any future ranked rating separable where useful. Monetization wrappers should not be reproduced.

## Consolation / comeback system

Observed concepts include IConsolationFacade, ConsolationPickData, ConsolationPrize and opponent consolation drafting, including free/ad variants.

### Showdown Lab interpretation

Keep the game-design value: losing can unlock a comeback/consolation draft. Remove ad gates, paid rerolls and artificial waiting.

## Spell architecture

Observed spell/data concepts include SpellData, SpellDeckEntry, SpellUpgradeSetup, SpellDeterminism, buff/damage spells, mine/object spawning, unit spawning, Arrow Storm, Lightning/Chain Lightning, Meteor/Meteor Shower, Poison Dart and explosion/minefield-like effects.

### Implication

Spells should be first-class deterministic simulation objects capable of direct damage, AOE, buffs/debuffs, hazards, spawning units/objects and chained effects. ARC and BLOOM are vertical-slice interventions, not the final spell architecture.

## Unit behavior architecture

Observed behavior families include MeleeBehaviour, ShooterBehaviour, SniperBehaviour, CowboyBehaviour, GoblinBehaviour, SpawnerBehaviour, BounceBehaviour, AgentBehaviour, deterministic D variants and TurtleStrategy/TurtleStrategyD.

Strong asset/behavior correlations were observed for Engineer spawning a turret, later Sniper forms with drone/minion entities, Assassin clone entities, Toxic Barrel persistent puddles and Turtle shell/spin strategy.

### Implication

A scalable unit definition should separate stats, targeting strategy, movement strategy, attack behavior, special behaviors, spawn behavior, evolution modifiers and presentation metadata. Avoid forcing every future unit into only HP/damage/range.

## Roster research vs Showdown Lab roster

The package exposed evidence for 30+ content/unit identities, including Assassin, Beetank, Cupid, Goose, Kingclops, Mole, Splime, Snail, TNT, Waster, Toxic Barrel, Sniper, Turtle, Parasite, Cowboy, Agent, Villain, Goblin, Totem, Engineer, Spider, Dragon, Captain, Archer, Barbarian, Wizard, Spartan, Bloodvine, Matriarch, Whelp, Sixshoot/Sixshooter and Overmind.

This does not automatically redefine our planned 26-unit roster. The current Showdown Lab milestone remains the curated 26 in V3_ROSTER_SPEC.md. Additional researched identities are future expansion candidates only after the 26-unit baseline is stable and only if they add unique gameplay with original design/mechanics.

## Arena research

Observed environment names included Agent HQ, Arctic, Canyon, Castle, Colosseum, Frisky Forest, Japan, Jungle, Magical Forest, Mole Beach, Slampit, Space Station, Stadium, Toxic Wasteland, Underwater, Zombie, Medieval, Fantasy Factory and Wrestling.

No sufficiently strong evidence yet says arenas must alter combat rules. Treat arenas as cosmetic/presentation-first until evidence or our own design goals justify modifiers.

Our current original arenas — Neon Lab, Ember Pit, Moon Vault and Verdant Ruins — are directionally sound.

## Unit level evidence

Recovered configuration fragments support ordinary unit max level around 15 and formula-driven progression. Exact numeric field alignment from Unity serialization was not reliable enough to treat nearby values as authoritative stats.

Rule: do not copy or document exact HP/damage/timing constants unless independently verified.

## Visual reference implications

The attached Showdown Lab concept references establish a useful quality bar, not literal assets to reproduce.

They reinforce these priorities:
1. silhouette before detail
2. one oversized signature feature per unit
3. high-contrast faceted color blocks
4. thick ink contour
5. action words as punctuation, not wallpaper
6. arena identity visible at a glance
7. progression should visibly change form
8. battle should look like a comic panel in motion
9. UI and arena framing are part of the art
10. geometry can carry much more production value when staging, lighting and effects support it

See CHARACTER_ART_BIBLE.md for the independent Showdown Lab design contract.

## Confidence map

| Area | Confidence |
|---|---:|
| Overall deterministic architecture | 95% |
| Draft architecture | 85% |
| AI/opponent architecture | 80–85% |
| Progression architecture | ~80% |
| Spell architecture | ~75% |
| Roster/content inventory | 85–90% |
| Individual unit behavior | 50–70% |
| Exact upgrade effects | ~30% |
| Exact draft probabilities | ~25% |
| Exact unit stats/timings | ~20% |

These are planning-confidence estimates, not scientific measurements.

## Planning consequences

- deterministic replay/battle-code architecture is a first-class capability
- data-driven draft effects and unit registry should precede 26-unit scale-out
- AI needs tendency/synergy/unit-count logic rather than random picks
- comeback/consolation draft should be explored without monetization
- spells should become deterministic simulation objects
- progression should keep unit/mastery/commander/form concepts separable
- Lab can become a supported rules laboratory with transparent AI/debug controls
- ghost/rated opponent concepts are possible later without real-time synchronization

The next implementation priority remains Visuals 11 validation. Research guides later architecture; it does not derail the current release.