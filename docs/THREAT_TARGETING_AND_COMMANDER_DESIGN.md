# Showdown Lab — Threat-aware Targeting, Opportunistic Specials and Virtual Commander
**Captured:** 2026-10-14  
**Status:** User feedback and architecture/design specification. Deferred prototype; NOT a gameplay, AI, spell, renderer or production change.  
**Related:** [Battlefield review](BATTLEFIELD_ENGAGEMENT_AND_CANVAS_DESIGN_2026-10-14.md), [active roadmap](ROADMAP.md), [QA handoff](QA_IMPLEMENTATION_HANDOFF.md).

## Intent and UX

The user wants a **smart but reactive army** without introducing an actual commander fighter:
1. **Sniper/ranged and Assassin** prefer the most dangerous *reasonably close/reachable* hostile unit, especially enemy damage threats to allied infantry. Example: if an enemy Dragon and Knight are both near each other and shootable, a Sniper initially fires at Dragon.
2. **Immediate self- or squad-protection supersedes general threat priority**. When Knight approaches the Sniper or allied ranged group, switch early enough for the Sniper to aim/fire once or twice (where mechanically possible) before the Knight enters melee, rather than waiting until direct contact.
3. **Area/signature attacks** should choose the best realistic moment/angle for aggregate effect, considering number and importance of targets, but not wait indefinitely for an impossible perfect opportunity.
4. **Virtual army commander** automates spell use in two explicit styles: **Aggressive / Use Freely** (use available spells opportunistically without strategic saving) and **Tactical Reserve** (withhold when not needed, respond to lethal threats or valuable breakthroughs). This is army-level logic, NOT an extra roster fighter.

These are *design preferences*, not permission to change the protected RC4 combat core on this turn. Add a transparent three-way UX control: **Manual (default), Auto: Freely, Auto: Tactical Reserve**. Use a tucked-away battle menu/Ultimate Lab submenu; do not clutter main Lab selector or override manual spell buttons without an opt-in. The meaning of "free" here is **no deliberate reserve policy**, NOT bypass all limits or grant unlimited casts. Existing Ultimate Lab unlimited-spells option remains a separate existing sandbox control.

## Verified current implementation boundaries

- `v3/legacy-sim-core.js::nearest(u,preferBack)` currently scores proximity plus allied target crowding. `AssassinStep` re-queries with `preferBack=true` for Sniper/Dragon and can stalk, vanish, backstab and disengage. This creates a distinct long-distance/reach problem; one universal shortest-distance rule would starve Assassin.
- `sniperStep`: nominal range = 195/500 world units; aimTicks 27 and cd 78 at L1; reload or melee buttstroke and retreat are separate behaviors. The player example is about **engagement and shot cadence**, not just selecting a nearest static target.
- `dragonStep` uses 16-tick windup, cd 48; `dragonBreath` uses a forward 0.30-length widening cone around the current target's direction and damages multiple hostile units. Direction selection is currently tied to one selected target rather than optimizing expected aggregate hits.
- Unit signatures in `v3/ultimate-abilities.js` are often **event-triggered modifiers** rather than independent manually cast actions: Sniper Piercing Verdict, Dragon Inferno, Assassin Execution, Beetank Seismic Ram, Barbarian Blood Cleave, Goose Thunder Honk. Do not turn all Ultimates into generic on-demand spells. Preserve cooldowns, L4/L5 multipliers, cast/windup and deterministic event semantics.
- `v3/legacy-sim-core.js::castSpell` currently applies: **ARC/zap** lowest absolute-HP enemy + stun; **BLOOM/heal** lowest HP-fraction ally; **QUAKE** global all-enemy damage/stun; **AEGIS** global all-ally ward. Core API currently does NOT accept a target ID for ARC or BLOOM; the commander cannot claim to target a particular enemy/ally unless a separately tested extension supports it.
- `v3/v3.js` imposes approximately 5s UI real-time cooldown on ordinary spells, or no such cooldown when `activeExperiment.unlimitedSpells` is true, with existing unlocks and tech levels. This is **outside the deterministic simulation**. A battle-code/replay-safe commander must handle eligibility and action scheduling through simulation ticks or recorded events, rather than wall-clock timing, while preserving existing visible spell cooldown and normal/manual controls.
- Previously tested proximity target penalties had serious collateral effects on Assassin, Sniper, Barbarian and Beetank; see QA handoff. This design is **not** another blanket locality penalty, hard lane or unconditional target stickiness.

## Proposed targeting policy — threat first, distance and urgency as constraints

Separate the decision into **candidate eligibility**, **strategic threat priority**, and **emergency interception**. Source-of-truth for attacks and targets remains in the authoritative combat core.

**1. Candidate set:** living, visible/reachable enemies within the weapon's normal range for Sniper and other true ranged shots. Prefer a handful of nearest shootable candidates (e.g. 4–8; calibrate) before scoring threat. Use a limited additional acquisition set only when nothing is in range. Avoid chasing an unreachable Dragon across the arena. Assassin's relevant eligibility is not its tiny melee hit reach: use *viable interception/vanish/backstab route and exposure*, with a hard limit on dangerous chase distance; retain rear-threat access.

**2. Effective threat-to-allied-infantry score (proposed inputs, values not fixed):**
- current level/mastery actual attack damage, attack rate, windup and plausible armor/ward mitigation;
- probable targets: allied infantry in reachable area over a short forecast (not just raw nominal DPS);
- AoE cone/splash/honk/evolved-Ultimate expected *coverage* and disable (stun/burn) opportunity;
- enemy health and how soon allies could disable/eliminate it, current stun/cooldown, firing opportunities;
- distance/travel time of the shooter to target, not simply nearest enemy.

Weight *prevented future harm* and ability to land a real attack, not static type labels. Dragon is often high-threat **when placed to breathe on an allied group**, but an isolated, stunned, out-of-range Dragon may not outrank a Knight 1 second from hitting the Sniper. Avoid optimizing every role toward Dragon if it leaves the front unprotected.

**3. Squad/self urgency override:** predict time to contact (ETA) of approaching melee threats using approach vector, charge state, speed and obstacles; compare with own time to meaningful response (remaining aim + cooldown + shot opportunity + reaction margin). An approaching Knight should take priority *before* melee range if the Sniper can hit it in time; if not, prefer retreat, nearby protection or an emergency stun/interrupt rather than futile retargeting. A threat to the *local protected group* matters as well as to the Sniper itself; use nearby allied position and Knight Bastion coverage as inputs. Check threat each decision epoch and whenever a charge/target change/death occurs.

**4. Hysteresis and targeting stability:** urgent self-threat can interrupt immediately; otherwise change only when the new candidate materially outranks the current target and action timing permits. Sniper should not repeatedly reset aim because Dragon and Knight scores differ marginally. Maintain bounded commitment for windup/reload; release on dead/burrowed/unreachable targets, emergency hazard or a better opportunity by a meaningful threshold. Evaluate 2–3 actual candidate alternatives before switching; deterministic ties by ID/seed.

**5. Assassin-specific targeting:** prioritize dangerous vulnerable backliners and isolated high-value opportunities using estimated safe landing/backstab viability, target health, incoming risk and vanish readiness. A Knight approaching allied Snipers may justify defensive interception **only if Assassin can actually engage**; do not blindly redirect every Assassin to a threatening Knight. Track backstab opportunities and survival, not just arbitrary threat-score totals.

### User example as executable acceptance scenario

- A Sniper sees enemy Dragon and Knight both within its range; similar travel-to-shot distance; Knight is not closing on any allied backline. **Expected target: Dragon** if its estimated near-term danger to allied infantry is higher.
- Knight advances toward that Sniper / protected group. Compute Knight ETA. **Expected:** Sniper switches to Knight *with sufficient aim/reload lead time* to produce one or two viable attack opportunities before melee, **if mechanics/remaining travel actually permit**. Retreat may be preferable when there is too little time to fire.
- Knight abandons approach and Dragon again poses the highest credible threat: revert to Dragon only after a nonurgent hysteresis window, without frame-by-frame oscillation.
- Knight and Dragon aren't both reachable (or Dragon is nearly invulnerable/fully suppressed): don't chase high-threat Dragon across the map; use realistic eligible alternatives.
- Level 4/5 Sniper pierce: favor a shot that hits a high-danger first target *and* a second aligned enemy when otherwise comparable, without faking a projected hit.

## Opportunistic area and signature attack decisions

1. If an ability is currently on cooldown, active/winding up or automatically triggered by ordinary strikes, **keep the original timing and semantics** unless a deliberately scoped feature changes it.
2. If activation and aim direction are optional, calculate expected total *effective* damage/disable over eligible local centers or orientation vectors: sum predicted damage to each enemy (including armor/ward), expected burn/execution, stun duration value, protection saved and likely movement during windup. Count valid enemy hits, not raw sprite proximity. Reward targets threatening allies, but do not solely maximize cluster count if the cluster is unimportant.
3. Include opportunity cost of waiting; hold a ready cast only for a **short bounded, measured window** when a better multi-target hit is likely soon. Fire immediately when under threat, a good opportunity exists, or the hold limit expires. Never turn Dragon into an idle turret waiting for a 5-unit cluster.
4. **Dragon:** rotate/aim cone before its *existing* windup, then lock or deliberately track according to actual game contract (decide through a separate QA). Its fire FX should depict the actual damaging cone, not unrelated artwork. **Goose:** high-value honk against clustered vulnerable threats, but don't suppress its funny chaotic movement. **Beetank/Barbarian:** improve opportunity to line up a real ram/cleave without delaying basic hits. **Sniper:** align pierce opportunistically without repeatedly aborting aim. Preserve Assassin execute threshold and Mole carapace as reactive/passive identities.
5. Test against one target, packed enemy platoons, mixed ranged/melee, split fights, last-unit cleanup, L1/L4/L5 forms; avoid ever delaying terminal state.

## Virtual commander — modes and shared deterministic spell gateway

| Mode | Policy | Intended experience |
|---|---|---|
| **Manual** (default) | Player taps ARC, BLOOM, QUAKE, AEGIS; existing normal rules apply | Full agency |
| **Auto — Use Freely** | Cast whenever eligible and positive useful impact, prefer damage/stun/protection/heal, no extra tactical holdback | Spectacular aggressive auto-support, limited by ordinary cooldowns/unlocks |
| **Auto — Tactical Reserve** | Compare predicted near-term damage, likely casualties, battle-state stalemate, active front advantage and future danger before committing | Save BLOOM/AEGIS for meaningful casualties; ARC/QUAKE to interrupt lethal threats or break a real logjam |

The commander is **not a battlefield unit**, needs no new authored sprite and should be rendered only as a small menu policy label or optional event-log indicator. The user may still cast manually unless a chosen mode explicitly disables it (avoid doing so by default). Auto selection should visibly indicate *what happened and why* in compact UI, not spam comic captions.

Examples of Tactical Reserve utility scoring:
- **BLOOM:** evaluate actual recoverable HP on an ally plus probability that the heal prevents near-term death; avoid large overheal, or healing an ally already safe while a frontline is collapsing. Current core chooses weakest HP fraction; to select intelligently, extend core API in a separate test.
- **AEGIS:** anticipate a dangerous Dragon volley / enemy Ultimate / several threatened allies; current whole-army ward means it may be useful even for a concentrated front.
- **ARC:** disrupt a major imminent high-damage enemy action, threaten a key attacker/low-health finisher, or help a losing local fight. Current default auto-picks lowest absolute HP enemy, so target-specific interrupts require a new tested target-selection contract.
- **QUAKE:** stop an enemy breakthrough, break many stalled close engagements, create a counterattack window or secure a win; current Quake is **global**, not targeted per local cluster, so weigh whole-board stuns and global spell efficiency.

Commander spell scheduler invariants:
- Reuse same unlock/tech/spell-power/cooldown eligibility as manual mode unless Ultimate Lab explicitly configures unlimited sandbox power. Never grant extra casts silently; don't spend Parts for each cast.
- One validated cast request per decision interval/event; explicit priority and arbitration to prevent casting four global spells simultaneously unless sandbox permits; preserve deterministic tick-based action ordering, seed and battle replays. No unintended auto casting after pause, terminal state, rematch, or screen exit.
- Support blue and red teams independently if enemy commander is enabled in an experiment; don't secretly enable a better opponent spell AI against manual players. Record auto decisions and policy in future battle-code/replay headers.
- Candidate evaluation may be approximate and fast. No per-fighter full-horizon rollout, LLM inference or network service.
- UI disclosure: **AUTO: FREELY** or **AUTO: RESERVE** in battle menu, default **MANUAL**; optionally show why cast in trace/Guide, and allow a one-tap disable.

## Performance, correctness and rollout

- First add **observer-only** squad threat/ETA and spell-effect scoring traces over current live combat; compare expected vs observed tactical decisions but issue no gameplay commands. The just-tested soft local target penalty was rejected due to Sniper/Barbarian/Beetank/Goblin regressions.
- Derive/cached threat rankings per team/engagement at a modest tick cadence (for example 8–12 logical ticks) with urgent reactive invalidation. Score a bounded shortlist (4–8) using shared spatial index and immutable tick snapshot, not O(all allies × all enemies) on every decision.
- Phase 1: sniper Dragon-vs-Knight regression & ETA switch. Phase 2: Assassin reach/cross-front viability, risk and strategic priority. Phase 3: Dragon cone and other AOE selection (preserve signature cadence). Phase 4: commander observer/sandbox spells. Phase 5: opt-in auto modes in Lab, then normal game only after acceptance.
- Quantitative gates: cross-role hits/damage/reach/survival, especially Sniper/Assassin/Beetank/Barbarian; no excessive aim resets or target oscillation, meaningful shot-before-Knight-contact, attack-lag/rate, fair per-mode spell use, no premature overheal or redundant Quake, deterministic mirrored outcomes with role-based exceptions, no deadlock/zombie, no input starvation at 10×, validated CPU and iPhone p95.
- Visual FX dependency: later polish of Sniper bullet and Dragon organic flame is already in ROADMAP.md. It must stay synchronized with *real* hit origins, target decisions and breath-cone geometry; do not generate fake extra bullets or flame damage.

## Technical implementation boundaries

Suggested future modules: `v3/tactical-threat-policy.js` pure deterministic scoring helpers; `v3/commander-policy.js` pure spell policy and eligibility; optional `tools/qa/check-threat-targeting.cjs` and `tools/qa/check-commander-policy.cjs`. These are *proposed* file names, not existing components. Ship to production only after QA-on-branch, root-pinned asset manifest/atomic offline upgrade checks, real iPhone portrait playback and user authorization. No additional unit, game engine rewrite or proprietary feature imitation.

**External design cross-check:** Utility decision systems can score each eligible target and apply momentum to avoid rapid oscillation; this is a reference principle rather than evidence that any particular weights work here. https://uintel-go.utilityworlds.com/Documentation/UtilityIntelligence/Decisions/ ; https://teamfighttactics.leagueoflegends.com/en-us/news/dev/talking-tactics-game-analysis-team-gat/
