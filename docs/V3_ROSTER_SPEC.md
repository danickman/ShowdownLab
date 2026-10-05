# Showdown Lab v3 — Full Roster Specification

Status: **Stage 5A — roster locked for implementation**

This document preserves the 26-unit v2 roster and assigns each fighter a v3 gameplay/presentation identity. It is subordinate to `V3_PRODUCT_SPEC.md`: every unit must read through silhouette + signature feature + motion + colour accent + personality, and must eventually receive L5/L10 evolution treatment.

## Implementation rule
A unit is not considered migrated because its name/card exists. It counts only when it has: distinct battle behavior, readable action tell, battle art, hit/death response, opponent compatibility, Draft integration, and Roster integration.

## Accepted vertical-slice anchors

| Unit | Role | v3 signature |
|---|---|---|
| Knight | Tank melee | Guarded advance → shielded charge → weighted sword combat |
| Goose | Chaos swarm/disruptor | Waddle, juke, dash, peck and disruptive honk |
| Sniper | Long range | Reposition → deliberate aim tell → precision shot → reload |
| Dragon | Fire splash heavy | Heavy advance → fire wind-up → multi-target cone breath |

## Wave 1 — movement and frontline contrast (Stage 5B)

| Unit | Legacy role | v3 signature / acceptance identity |
|---|---|---|
| Assassin | Backline hunter | Vanishes/skirts frontline, bursts onto vulnerable ranged target, then disengages; fast blade silhouette |
| Beetank | Heavy tank | Huge beetle shell, slow bulldoze, horn/body ram with strong knockback; absorbs frontal punishment |
| Mole | Burrow ambusher | Digs underground, visible dirt trail, erupts beside backliner for burst hit, then fights briefly before re-burrowing |
| Turtle | Shell defender | Slow approach; retracts under pressure for major damage reduction, then emerges for short counterattack window |
| Goblin | Hyper swarm | Tiny frantic melee unit; zig-zag rush, rapid weak stabs, strongest visual/readability when several are present |
| Barbarian | Heavy bruiser | Aggressive axe fighter; accelerates/rages as health falls, broad slow swing with high impact |

## Wave 2 — ranged, artillery and specialists (Stage 5C)

| Unit | Legacy role | v3 signature / acceptance identity |
|---|---|---|
| Snail | Heavy artillery | Extremely slow armored snail; stops to lob a large arcing shell/bomb with obvious landing marker and splash |
| Engineer | Turret builder | Repositions to a safe pocket, visibly constructs a stationary turret; personal weapon is weak |
| TNT | Explosive runner | Carries obvious explosive; sprints toward a cluster, fuse ignites, detonates in large AOE and sacrifices itself |
| Merlinor | Splash mage | Staff-bearing caster; charge rune → slow magical orb → splash burst; fragile and deliberate |
| Archer | Rapid ranged | Mobile bow fighter; quick draw/release cadence, lower burst than Sniper, kites lightly rather than hard-retreating |
| Spartan | Shield phalanx | Spear + large shield; advances defensively, braces against frontal attacks, then thrusts from behind shield |
| Bloodvine | Control artillery | Rooted/plant creature; launches seed/vine projectile that damages and briefly roots/slows a target area |
| Whelp | Mobile ranged | Small flying/quick dragonkin; strafes while firing lighter fire shots, contrasting Dragon's heavy committed breath |
| Sixshoot | Fast gunslinger | Rapid six-shot burst with visible cylinder/reload downtime; lateral footwork and low durability |
| Parasite | Life-steal skirmisher | Leaps/latches onto a target for short drain, visibly heals from damage, then hops to a new victim |
| Cowboy | Dual-shot ranger | Mid-range duelist; paired revolver shots, roll/reposition, steadier than Sixshoot and less extreme than Sniper |
| Agent | Adaptive marksman | Reads distance: controlled shots at range, evasive reposition when pressured; clean tactical/tech silhouette |
| Villain | Beam bruiser | Durable mid-range threat; conspicuous charge tell followed by sustained beam sweep rather than discrete projectile |
| Totem | Support aura | Mostly stationary support piece; pulsing aura buffs/heals nearby allies and becomes a priority target |
| Spider | Brood swarm | Scuttling controller/spawner; periodically produces small broodlings and pressures space through numbers |
| Captain | Hook duelist | Throws hook at medium range, pulls target toward self, follows with close-range combo; unmistakable hook/rope tell |

## Roster count
26 primary units total:

1. Knight
2. Goose
3. Assassin
4. Sniper
5. Snail
6. Engineer
7. TNT
8. Beetank
9. Mole
10. Turtle
11. Goblin
12. Merlinor
13. Archer
14. Barbarian
15. Spartan
16. Bloodvine
17. Whelp
18. Sixshoot
19. Parasite
20. Cowboy
21. Agent
22. Villain
23. Totem
24. Spider
25. Dragon
26. Captain

`Turret` and future broodlings are spawned/support entities, not primary roster slots.

## Stage 5 implementation gates

### 5B — first new-unit wave
Implement Assassin, Beetank, Mole, Turtle, Goblin and Barbarian end-to-end. Preserve the four accepted anchors. Exit: ten primary units are playable and visually/behaviorally distinguishable.

### 5C — second wave
Implement the remaining sixteen primary units plus required spawned entities (Turret/broodlings). Exit: all 26 primary units participate in simulation and render with distinct tells.

### 5D — content/UI integration
Replace four-unit Draft/Roster assumptions with the 26-unit roster. Add role/trait metadata, roster browsing, Draft selection pool behavior, opponent selection compatibility, and remove synthetic/repeated roster entries.

### Stage 5 acceptance
- 26 unique primary roster entries; no filler/repeated cards.
- Cover unit names during battle: silhouette + behavior should communicate role family.
- No new unit simply reuses another unit's state machine with stat changes.
- Spawned entities are visually subordinate and cannot masquerade as roster units.
- Four accepted anchor units retain their established identities.
- Initial balance is sane enough that no single unit obviously dominates normal two-unit drafts across repeated matches.

Evolution art (L5/L10) remains required by the product spec's M3 definition of done and will be addressed after base-roster behavior/art is integrated, so evolution work does not block implementation of the base 26-unit roster.