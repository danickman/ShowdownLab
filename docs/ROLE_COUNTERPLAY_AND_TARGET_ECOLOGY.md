# Showdown Lab — Role-aware threat selection, swarms and counterplay

**Date:** 2026-10-14. **Status:** Product/gameplay design and QA requirements; not implemented fighter logic. **Authority:** User feedback expands [Threat Targeting and Commander Design](THREAT_TARGETING_AND_COMMANDER_DESIGN.md). Existing RC4 combat mechanics, L1–L5 abilities, authored sprites and PWA are protected until validated changes.

## Design principle

**Every fighter must have a job, meaningful preferred opportunities, legitimate vulnerabilities and an opposing response.** Intelligence is expressed in selecting the *most useful feasible action given a role, allied support and immediate danger*, not in giving every fighter the same global list of dangerous units. It must remain a lively accessible auto-battler, not an optimization puzzle in which every matchup is predetermined.

A squad's intended role is a **soft tactical preference**, never an unbreakable rule. An isolated Goblin can still defend itself against an enemy Goblin; a Knight can still fight a Dragon if Dragon threatens its protected line; a wounded Sniper can prefer the approaching Knight to the more dangerous but distant Dragon.

### Three complementary dimensions, not just 'enemy danger'

1. **Strategic danger to nearby allies.** Estimate practical short-horizon damage/control (including cone, cleave, honk, piercing, stun, burn, current readiness, level/HP and nearest likely victims). Do not rank by unit name or theoretical DPS alone.
2. **Role fit / matchup opportunity.** Compare attacker tools and target vulnerability: protection, reach, armor, dodge, armor penetration, burst, cleave, charge, reflection range, group attack count and accessible approach. A target's size is one factor, not a universal priority.
3. **Local urgency / feasibility.** Consider time to reach/attack, enemy time to contact a vulnerable ally, protective proximity, escape routes, whether allies can attack together and the danger of exposing the attacker or leaving a post undefended.

**Priority arbitration:** imminent threat to self/protected allies > practical opportunity within current local battle > distant high-value target. A target can beat another only if *both are sufficiently comparable in reach/arrival cost* or the higher-value move is worth taking. Make urgency a gate/override, not just a low-weight numerical bonus.

### Proposed selection architecture (not exact parameter values)

1. Determine alive, visible and **realistically reachable** candidate enemies; include role-specific exceptions (Assassin vanish/backstab, Mole forward burrow, Sniper standoff).
2. Detect emergency: self-hit forecast, incoming charge, friendly ranged line threatened, losing local engagement.
3. Estimate effective opportunity for at most K local candidates, e.g., K=4–8 (hypothesis): expected preventable enemy harm, attacks that land, time to meaningful action, assist/interrupt prospects.
4. Add **counterplay suitability** and **team action feasibility**: pack Goblins with a compatible shared target, avoid oversaturating an engagement slot, don't redirect all fighters to one Dragon or leave Snipers undefended.
5. Apply modest cooldown/hysteresis for nonurgent target switches; bypass immediately on emergency, invalid/dead/burrowed target, or an opening that would otherwise disappear. Maintain Sniper aim continuity and Dragon windup direction.
6. Allow a front to dissolve naturally and survivors to reinforce; never lock whole armies into a squad ID. No new mandatory fixed 3-lane model.
7. Keep a deterministic, symmetrical tick snapshot of enemy/ally danger, positions and target pressure. Reuse cached local neighborhood queries rather than recomputing expensive per-unit global O(N²) scans.

## Ten-fighter role and counterplay matrix

These are **proposed behavioral identities and conditional counter relationships**, not preprogrammed wins or claims about current statistical matchups.

| Fighter | Best battlefield purpose | Prefer when feasible | Meaningful enemy response / weakness to preserve |
|---|---|---|---|
| **Knight** | Fast defender/interceptor with guard, charge and L4/L5 Bastion | Charging melee threats to allied Sniper/Dragon, dangerous bruisers entering its protection radius, interception before allies take hits | Sniper piercing armor, focused high damage, coordinated flanks, enemies bypassing its protected area. Don't make Knight the best attacker too |
| **Beetank** | Heavy initiator and disruptor with ram/stun and Seismic Ram | Dangerous big targets, dense valuable contact points, a heavy opponent whose charge can interrupt the enemy's push | Kiting, Sniper piercing, repeated flank pressure, inability to ram unreachable targets; avoid both endless chasing and invincible multi-target stuns |
| **Turtle** | Hold-the-line shield/anchor, shell and nearby melee reflection | Enemy attackers currently threatening its local allies; survive front pressure and anchor the engagement | Ranged stand-off, flanking, armor-penetration, unfavorable timing/position; reflection currently only procs on **nearby** attackers, not globally |
| **Barbarian** | Slower than Knight, high-damage front breaker with rage/Blood Cleave | Packed melee opponents or worn-down armored defenders it can reach; dense breach opportunity | Kiting, concentrated ranged fire, control/stun, defeat before rage/cleave payoff. Avoid automatic affinity for unreachably distant tanks |
| **Goblin** | Coordinated opportunistic swarm with fast flank and L4/L5 Pack Ambush | **One isolated, individually dangerous melee target** that several Goblins can surround/reach simultaneously; finish weakened backliners; contest enemy Goblins when blocking its pack | Dragon cone, Barbarian cleave, Beetank Seismic Ram, Goose area honk, strong chokepoint protection, ranged elimination before closing. Splitting the pack is a weakness |
| **Goose** | Chaotic local controller, scamper/honk and Thunder Honk | Closely grouped dangerous attackers or an approaching enemy swarm; disrupt a breakthrough | Durable opponents after honk, ranged focused attacks at safe distance, high-value enemies outside honk range. Keep comic chaos |
| **Mole** | Forward burrow disruptor and durable Nuclear Carapace at L4/L5 | Vulnerable backline targets or support threats **ahead of its forward direction**, reachable through a real burrow path; hit the line where pressure matters | Ambush after emergence, fast displacement, defense against exposed emergence; preserve invulnerability while burrowed and forward-only travel |
| **Assassin** | Backline execution/flanker with vanish and L4/L5 Execution | Dangerous isolated Sniper/Dragon, low-HP high-threat backliners with a *viable* vanish landing or safe approach | Nearby escorts/Knights, control/area stun, grouped defenders, failure to finish before disengaging; cannot be globally tethered to nearest melee |
| **Sniper** | Long-range priority elimination and piercing | High credible threat to nearby infantry (e.g. Dragon rather than a not-yet-closing Knight), favorable pierce geometry and realistic range | Charging Knight/Beetank/Assassin infiltration and flanks trigger pre-contact defense/retreat; aim/reload penalties matter |
| **Dragon** | Heavy AoE/burn area denial with cone/In­ferno | Valuable enemy clusters or narrow attacks threatening several allied infantry; target/angle giving good real cone coverage | Sniper high-value focus/piercing, Assassin access, dispersed/flanking units; don't force a low-value breath just to raise cast rate |

**Important counter asymmetry:** One Goblin loses a duel to heavy infantry more often than a *coordinated pack* needs to. A pack can be effective against an isolated opponent **but is itself vulnerable to AoE**. Tank should draw or interrupt heavy threats, but not become a universal counter to every expensive enemy. Special counters should emerge from real mechanics and team composition, not hardcoded damage multipliers or arbitrary 'class beats class' flags.

## Swarm intelligence: local pack coordination without a central rigid commander

- Recognize same-team Goblins near each other (using actual world distance), with attackable candidates shared between nearby pack members.
- Prefer **local overwhelming opportunities** when 2–5 Goblins can reach the same *isolated* target within a short coordinated arrival interval. The group should be able to surround using existing 8-slot melee staging without piling into the same pixel.
- Don't send individual Goblins crossing the entire arena to join another pack; local squad cohesion must have soft travel budget and release when the target is lost, the local pack is wiped, or AoE danger becomes excessive.
- Enemy swarm-vs-swarm: intercept hostile packs if they would otherwise enter our Snipers / outnumber our local Goblins. If the best accessible answer is to fight enemy Goblins, fight them. Don't force every swarm to bypass every swarm.
- Avoid funneling a pack of Goblins into an already-aimed Dragon breath or Beetank ram without evaluating predicted losses. Intelligence should not make Goblins immortal; sometimes a reckless swarm attack is appropriate, especially with player-selected offensive compositions.
- Compare **arrivals within a time window**, effective Pack Ambush bonuses, number of free melee approach/engagement slots, target armor/HP and available allied support. Prefer credible local opportunities, not raw focus-fire saturation.
- Track pack assembly time, arrival spread, hits per pack, actual surround angles, AoE losses, damage per survivor and whether packs genuinely regroup or just jitter. Test all L1/L4/L5; L4/L5 Pack Ambush rewards adjacency with nearby *allied Goblins*.

## Dynamic role counters and team drafting

A unit's counter can be **a position, cooperation pattern or ability**, not necessarily a single other unit. Suggested accessible relationships:

- Goblin packs overwhelm isolated lower-AoE melee targets **if they arrive together**; Goose honk, Dragon breath, Beetank splash and Barbarian cleave can punish clustering.
- Knight intercepts threats aimed at ranged allies; Assassin/Mole bypass a static defense line, while high-penetration Sniper pressure limits armor/guard. Knight guard/Bastion protect allies if it stays nearby.
- Beetank contests heavy fronts and creates a stun/breach opportunity; ranged kiting and priority damage can prevent long charge chains.
- Turtle can hold melee contact and punish nearby attackers with reflection; avoid representing its shell as broad ranged retaliation.
- Dragon punishes grouped foes and controls lanes through breath; Assassin flank and priority Sniper attack discourage unchecked Dragon domination.
- Barbarian can breach a packed frontline if it gets close; an opposing Sniper/Dragon or defensive control may deny the charge or punish rage duration.
- Assassin threatens unprotected valuable ranged units but becomes less effective when they are escorted.
- Avoid absolute hard counters. Existing 5-level Ultimate bonuses, spell intervention, exposure, numbers and timing should change the outcome of nominally disadvantageous encounters. Show readable counters in Fighter Guide/Draft hints when verified, not invented matchup win percentages.

**Draft quality goal:** every composition has at least one recognizable vulnerability and one approach to address it by choosing *units, formation, upgrades or spells*. A balanced draft must be useful but not always superior to a committed theme. Draft should permit counterplay without demanding perfect preknowledge of the enemy lineup.

## Suggested research acceptance suite (future QA, not yet implemented)

1. **Knight vs Dragon target choice:** Sniper targets nearby high-threat Dragon while Knight is not advancing; then switches to charging Knight with enough effective aim/reload lead time to fire or retreat, if physically possible.
2. **Tank vs big target:** Beetank has a reachable Dragon/Beetank plus a Goblin nearby. Prefer an impactful heavy ram **unless** Goblin imminently threatens its escorted Sniper. Knight prioritizes that escort emergency. Turtle holds frontline rather than following the highest-DPS Dragon across the arena.
3. **Pack vs isolated heavy:** 4 Goblins vs one isolated Knight / Beetank; show real pack assembly/contact, meaningful number of hits and L4 Pack Ambush uptime without target oversaturation or path collision.
4. **Pack vs hostile pack:** 4 Goblins protecting Sniper vs 4 incoming enemy Goblins; avoid bypassing each other to chase a distant Dragon, preserve actual local defense.
5. **Swarm vulnerable to AoE:** Goblin rush into an available Dragon cone or Goose honk; ensure AI can recognize high-risk clustering but not guarantee perfect avoidance; no invulnerable Goblin meta.
6. **Full combined composition:** frontline protectors, ranged artillery, flanker/pack at equal upgrade levels, both colors mirrored; test damage by role, target reach, ability triggers, terminal winners, deterministic traces and real mobile video.
7. **Small and huge:** 1v1, 5v5, 20/40/80/120/180 units; no unnecessary coordinator overhead in tiny matches, no superlinear planner blowup in the biggest.
8. **Spells/Ultimates interplay:** commander Auto Freely vs Tactical Reserve changes when protection or AoE is used, without silently granting extra casts or making hard counters irrelevant. Commander **remains a virtual policy, not a unit**.
9. **Failure metrics:** overfocus on Dragon, Goblin death before reaching target, useless 'escort' Knights doing zero damage/protection, melee deadlocks, over-retarget, Sniper aim resets, Assassin vanish starvation, damage/counter skew from L4/L5, huge-battle main-thread stalls.
10. **Fun benchmark:** same-seed normal-speed captures prove *observable* flanking, packed assault, timely interception, climactic AoE defense and interpretable causes of outcome. 'Smarter' must produce better battles, not remove surprise or player strategy.

## Engineering guardrails

Design threat and matchup scoring as an optional pure policy layer with deterministic cached state. Observe before steering and A/B against unchanged RC4 battle. Work out candidate eligibility and reach first. Prefer policy *differences by role* over stat increases or hard-coded class multipliers. When a role's abilities change dynamically (rage, burrow, charge, shell, ultimate) compute from current state and actual combat contracts. Start with **two bounded trials**, not simultaneous ten-role rewrite: (1) Sniper threat-to-infantry prioritization with advance-warning Knight response, (2) Goblin pack-vs-isolated-threat / hostile-pack response. Only then select one tank role for heavy-opponent interception. Retain one role at a time for causal attribution, multi-seed mirror runs and rejected-candidate audit. Need both combat and 430×932 iPhone rendering QA; no runtime merge/deploy without user approval.
