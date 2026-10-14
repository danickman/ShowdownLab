# Showdown Lab — Battlefield Engagement, Canvas and Combat Theatre Design

**Research & design review:** 2026-10-14  
**Status:** Architectural proposal and experimentally grounded roadmap; not approved gameplay code.  
**Branch:** `qa-turn1-duel-baseline`  
**Production:** No changes to live combat, no merge or deployment.

## Executive recommendation

**Build a soft, role-aware engagement system and a battlefield-focused presentation system, while preserving the ten existing combat ability implementations.** Do not continue sweeping lateral formations or applying universal target persistence. A fight needs reasons to occupy an arena: local objectives, engagement ownership, guards, controlled reinforcement, and flanks; not merely more vertical spawn spread.

The proposed layers are:
1. **Tactical intention**: assign a meaningful but releasable local engagement objective.
2. **Role-aware target policy**: score local threats, target eligibility, commitment and special exceptions.
3. **Existing ability execution**: keep Knight guard/charge, Assassin vanish/backstab, Beetank ram, etc. as the authoritative action system.
4. **Collision/navigation**: local avoidance and bounded slots; never rewrite battle state merely for rendering.
5. **Presentation**: world positions project to an expanded, stable battlefield; sprite staging remains visual-only.

Design influences: Craig Reynolds' separation between goal selection and steering (https://www.red3d.com/cwr/steer/gdc99/); ORCA/RVO demonstrates local avoidance but is *not* recommended as a direct library dependency (https://gamma.cs.unc.edu/ORCA/); Riot's clarity and VFX hierarchy (https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/, https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/); Apple game controls and safe areas (https://developer.apple.com/design/human-interface-guidelines/game-controls); MDN layered/cached 2D canvas (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas).

## Findings verified against this repository

### Combat flow
- `v3/legacy-sim-core.js` performs `nearest(u)` on each living fighter on every step; the score is distance plus `max(0,pressure-2)*.035`. There is no persistent engagement ownership or high-level squad intent.
- Each target query scans living enemy units and rebuilds a pressure-by-target Map from the entire team, and `slotPoint` gathers/sorts attackers for the target. `separate` runs 3–4 whole-army pair passes per normal tick. This is quadratic or worse in the presence of repeated slot sorts; 80–120 fighters and 10x simulation are especially expensive.
- The existing `u.squad` **cannot automatically be treated as a tactical squad**: `formationEntries` assigns `squad:i` for string entries; structured entries may carry meaningful squad IDs. Establish and test semantics before using it as a stable behavior group.
- The underlying melee slot, knockback, dodge, guard, shell, ram, Sniper aim/retreat, Dragon breath, Mole forward burrow, Assassin teleport, Goblin and Barbarian actions are valuable load-bearing systems. Preserve these functions initially.

### Battle presentation
- `v3/camera.js` reserves a top section of approximately 29% of the portrait canvas (subject to a minimum), bottom reserve 96 CSS pixels, side padding 14 px; it then fits and recenters on *currently live units* each frame. This may reframe a fight toward a cluster, minimizing the user's perception of otherwise empty arena.
- `v3/v3.js` clears and redraws scenery, living fighters, defeated fighters, effects, spotlight and overlays on a single battle canvas. It already has a profiler, FX density tiers, caching and authored floor/sky hooks. Extend them rather than replacing them blindly.
- `v3/combat-staging.js` uses screen-space fanning and collision repair as presentation **only**. At more than 60 fighters, full allied collision staging is disabled while bounded grid-based fanning remains. **This is not a structural cap on actual fighter count or combat**, and should not be interpreted as one. Do not add fake battle spread beyond 60.
- Camera `unitSize` decreases with crowd density and zoom. A hard universal size increase risks cropping L5 effects and authored silhouettes. Measure projected sprite bounding boxes and legibility at portrait 390x844 and 430x932, landscape, plus 80/120/180 units.

### Verified experimental evidence (12 paired 80/120-unit cases, 3 seeds and blue/red mirror)
- Extreme lane separation reduced Assassin to ~186 attributed damage; connected ±0.20 formation with stronger Assassin and Beetank-only persistence produced ~836 damage, 13 hits. Wider ±0.24 formation reduced Assassin to ~160 damage / 2 hits while impairing Beetank and Barbarian.
- Blanket frontline current-target preference cut switches from 21,919 to 14,605 but Assassin damage dropped 624 → 407 and did not sustain later active fronts. Proximity-gated four-role preference also reduced Assassin damage 624 → 485 and Beetank hits 959 → 884.
- Beetank-only current-target preference (+.025 score for existing target) improved Beetank hits 959 → 1050, Barbarian 232 → 269, and Assassin damage 624 → 836 against connected ±0.20 strong Assassin. **Experimental correlation, not proof of general balance; one mirrored battle result can change.**
- Knight speed experiment (base 0.72 → 1.18) increased Knight hits 357 → 629, but reduced Assassin damage 836 → 471 and Beetank hits 1050 → 898; one winner differs from same-layout control. **Do not promote the raw stat increase.**
- Crucial Knight movement: `knightStep` moves with multiplier **0.72 while guarding**, while Barbarian normally uses 1.00. Even with nominal Knight speed 1.18, ordinary guarded approach is only 0.8496 movement units vs Barbarian 1.08; Knight's charge multiplier is 2.25 and can be disproportionately fast. Speed identity must be defined by effective behavior, not merely stat labels.
- **Measurement correction:** baseline full-run mean length ~210 observed RAF frames, connected ±0.20 plus Beetank-only ~218; the harness snapshots frame 360 only if a battle reaches it. Reporting absent frame-360 snapshots as **zero active fronts** is invalid evidence for front collapse. Frame 90 can also be biased when matches finish early. Fix metric denominators before using late-frame results to reject designs.

## Recommended actual battlefield behavior

### Local engagements, not hard lanes

Introduce a lightweight `EngagementDirector` that updates perhaps every 6–12 simulation ticks and when meaningful events occur (squad wipe, burst, last protector dead). Initial engagement zones are inferred from both teams' *real* positions and threat populations. They are not barriers or predetermined fixed scripts. For tiny battles use one front; for larger armies allow 2–3 concurrent front groups only if mutual opponents are available. Use normalized world coordinates and cheap deterministic sampling.

Each unit receives a **soft anchor** plus a state, not a hard lane: `approach -> engage -> exploit / hold -> reinforce -> resolve`. Track `engagementId`, `targetId`, `commitUntilTick`, last target distance, local friends/enemies and a role priority. Choose a preferred nearby opposing group with balanced available targets. A fighter can cross engagements to chase a reachable high-value target, flank, protect allies or reinforce a losing front.

Target scoring idea (hypothesis, calibrate with instrumented tests): 
`score = travelTime + pressurePenalty + anchorDepartureCost + threatPenalty + switchingCost - roleOpportunityBonus`.
- Use `travelTime` instead of distance when speed, safe approach or charge varies.
- `anchorDepartureCost` is a soft cost with range-aware caps and an escape condition; never trap the last fighter in a deserted engagement.
- `switchingCost` is based on commitment state and advantage, not a fixed blanket bonus. No sticky target when dead, burrowed, unreachable, far past home anchor, or when pursuing it would leave a protected ally vulnerable.
- When opponents disappear, **release** the front and redirect survivors in coherent waves; do not leave isolated parties idling indefinitely.
- Keep score and update semantics deterministic and symmetric under team mirroring. Compute pressure/occupancy from a consistent tick-start snapshot to avoid unit iteration-order bias.

### Movement and staging

Prefer soft anchor steering + local separation with explicit **engagement slots**. Anchors maintain a tactical corridor, while slot allocation prevents ten fighters from attacking the same pixel. A role may occupy a different orbit around one enemy: tanks center/front, melee sides, ranged standoff, flankers rear. Avoid generic boids cohesion, which would *increase* clumping. Inspired by Reynolds, use only the behavior components that support visible combat intent.

Use spatial hashing (uniform grid with neighbor lookups), cached per-tick pressure, and event-driven target decisions before heavier navigation frameworks. ORCA is a possible later reference for micro-avoidance, not an immediate migration. The current world remains continuous and 2D.

### Role-specific strategy without arbitrary power creep

| Fighter | Battlefield intention | Potential adjustment to test | Protect |
|---|---|---|---|
| Knight | Mobile interceptor and forward defender; arrives before Barbarian | First test **base spd 1.12, guarded approach 1.04×, charge multiplier ~1.5×** rather than raw 1.18 with 2.25× charge; effective guard travel ~1.165 > Barbarian march 1.08, charge burst ~1.68 near original 1.62. These are *hypotheses*, not approved stats. | Guard, armor, Bastion proximity at L4/L5; don't outrun protected allies |
| Barbarian | Slower assault bruiser who presses breaches and rages | Keep spd 1.08, improve opportunity/attack-slot acquisition before HP/damage buffs | Rage timing, cleave splash, high damage identity |
| Beetank | Disruptor/ram initiator | Carry narrow target persistence candidate; consider target commitment only during an active ram and robust contact confirmation | Impact-triggered RAM FX, stun, collision, tank armor |
| Turtle | Defensive anchor | Defend near allies/hold occupied engagement; only reinforce once local threats clear | Turtle-v-Turtle terminal, shell mitigation/reflection |
| Assassin | Mobile flanker/execution | Allow cross-front high-value targets and safe vanish landing; keep HP132/dmg31/dodge24%/vanish0.70 experimental; prioritize access to meaningful backstab over more blanket stats | Rear teleport, execute at L4/L5, avoid target starvation and sudden survival collapse |
| Sniper | Protected ranged pressure | Maintain safe standoff behind a local protector, reposition when breach occurs | Aim, reload, buttstroke, L4/L5 pierce alignment |
| Dragon | Area denial / slow artillery | Prefer threatening local clusters from usable cone distance; reposition deliberately | Breath cone, burn, legible windup |
| Mole | Forward subterranean disruptor | Burrow toward valuable forward targets, surface into lightly defended front | Forward-only invulnerable burrow until erupt, nuclear carapace |
| Goblin | Local swarm flanker | Opportunistic side routes and pack preference without hard lane locking | Fast movement, dodge, Pack Ambush adjacency |
| Goose | Chaos/stun support | Scamper locally, threaten clusters, and stay visible without having to chase across map | Honk, stun, playful signature |

Only adjust a stat after proving an *exposure problem* persists after tactics, collision, role target selection and attack animations. If stats change, compare base and L4/L5 because `evolution-rules.js` multiplies base HP/damage by 1.4^(level-1), and Ultimates amplify some roles.

## Canvas and theatre composition: use the screen to communicate battles

**Portrait-first recommendation** (design target to validate, not a measured current allocation):
- Allocate ~18–23% of height to *visually meaningful, authored sky*, with layered distant silhouette and lively but restrained ambience; don't remove sky identity.
- Aim for ~63–70% to legible battlefield where live feet and attack effects appear, reclaiming space from redundant bottom/HUD reservation and over-generous side margins when safe areas permit.
- Keep the top team HUD compact; floating bottom spell controls should occupy predictable safe zones and avoid covering active combat. iPhone 15 Pro Max portrait is primary.
- Stage fighters in **different depths and local engagement clusters**; maintain enough negative space between clusters that individual unit silhouettes read. Use actual world positions as source of truth; camera may reframe/zoom but presentation offsets may not invent combat positions.
- Camera: prefer a stable world overview with a speed-limited focus pan/zoom; provide user-initiated local focus/tap-to-follow optionally and a miniature overview for dense battles. Avoid continuous auto-zoom so tight that the player cannot tell which arena portions are unused.
- Add subtle ground-language: scuffs, dust, directional footprints, collision cracks, small collision-specific camera emphasis. VFX belongs at actual contact coordinates; don't add flashy fake hits.

### Visual hierarchy
1. **High priority**: lethal blow, ultimate, stun, charge/ram impact, spell telegraph, last-fighter turning point.
2. **Medium**: important regular attacks, shield reactions, formation breach, movement smoke.
3. **Low**: ambient particles, tiny common hits, excessive damage numbers and repeated comic words.

FX budget should be **event-weighted**, not only density cutoff; reserve capacity per visible engagement so the first front does not consume all cues. The `v3/v3.js` density tiers are a strong starting point. Match apparent VFX footprint, sound and animation timing to actual gameplay radius/power (Riot clarity principles), especially Dragon cone and Beetank ram. Distinguish team via outline, underfoot halo and readable silhouettes instead of blanket sprite washes.

### Performance roadmap
- Profile separately: `step/nearest`, `separate`, `slotPoint`, `ultimate`, sprite decode/draw, arena scene, ground FX, layer compositing, camera update, staging. Measure p50/p95 frame times and memory under 10, 40, 80, 120, 180 fighters, L1/L5, portrait/landscape, 1x/10x.
- Cache pressure per deterministic simulation tick and nearby positions with spatial hashes. Exact determinism/targeting golden traces must pass before replacing `nearest`. Bucketize `separate` with adjacent-cell pair enumeration; include worst-case dense crowd fallback and mirror tests.
- Pre-render static skyline/floor when theme/view changes; layer frequently updated fighter/FX components separately when profiling warrants it. Keep real dynamic scars/ambience in a dedicated dynamic layer. MDN recommends caching repeated drawing and layering static/dynamic visuals.
- Consider OffscreenCanvas workers only as a measured, compatible progressive enhancement (its presence does not guarantee better FPS). Be careful: `transferControlToOffscreen` cannot occur after an existing canvas context has been created; migrating current single-canvas renderer is nontrivial.
- Keep author sprite atlas/pinned asset approach; no new mass sprite generation. Preserve color purity; no procedural sprite-shading overlays.

## Correct QA specification (must precede acceptance)

**Fix test denominator:** `sectors.atFrame` exists only if the battle reached that frame. When reporting a frame, include `observedMatches`, `missingBecauseTerminal` and averages over *eligible matches only*. Also report active-front occupancy at 25%, 50%, and 75% of **each match's actual duration**, not a late absolute frame across dead battles.

**Replace crude horizontal-band only analysis:** group opposing close-contact pairs into connected components in world space and track components through time. Count actual simultaneously contested groups, their separation and duration. A band can hold several independent fights; three bands can still be one sprawling fight. Also track center-of-mass spread, lateral deployment occupancy, % fighters with an active target, idle/retarget duty cycle and actual sprite occlusion.

**Role safety:** track per-role damage *and* attempts, hit count, in-range and reachable-target frames, ultimate proc count, L4/L5 effects, survival, protective uptime, kill credit, position. Compare 10 roles, multiple compositions and asymmetric strengths; include mirror, repeated deterministic seeds, Knight vs Knight, Turtle vs Turtle, ranged-v-melee, flanker-v-backline, mixed forms and Ultimate Lab enemy choices.

**Fairness:** deterministic mirrored run outcomes, terminal state, no zombies/deadlocks. Multi-front goal is not to force exactly three sectors all match: if one side wins two fronts, survivors should legitimately reinforce and converge.

**Experience:** representative iPhone 15 Pro Max screenshots/videos at match start, first clash, midfight, clutch phase; compare old/new under same seed. Verify no feet/clipping, crisp silhouettes, readable important FX, actual full arena utilization, touch targets and safe areas. Browser CI cannot substitute for final manual iPhone performance QA.

**Suggested *targets*, not claims:** no major role loses >15% meaningful effectiveness against its matched control without justified tradeoff; no assassin attack starvation; more than one contact group present for a meaningful share of the battle in 80/120-unit scenarios without forced splitting; render p95 within 16.7ms for 60FPS *where measured* or an explicit tested 30FPS quality tier; zero terminal/deadlock regressions.

## Implementation turns — stop blind tuning

1. **Measurement correctness and visuals**: fix missing snapshot denominators, report duration-normalized engagement components, capture same-seed videos/sprites and camera viewport occupancy. Establish 10/40/80/120/180 performance baseline.
2. **Tactical intentions research spike**: transient engagement anchors computed from actual positions and opposing threat; no hard lanes, no stat changes, no sprite-stage deception. Two candidates: soft-anchor-only vs engagement component + anchor. Isolated VM only.
3. **Combat role policy**: consistent tick-start target pressure and conditional target commitment for melee/guards; preserve exception rules for Assassin/Mole/ranged. No blanket target stickiness. Compare all roles and late battle duration-normalized clusters.
4. **Navigation and cost reduction**: spatial partitioning nearest/slot/separate with deterministic fallback; mobile performance profiling before changing renderer architecture.
5. **Knight speed/movement identity**: trial balanced Knight effective guarded speed above Barbarian march, cap charge burst and protect Bastion uptime, then test all roles. Avoid raw 1.18 speed promotion following negative QA.
6. **Integrated QA-branch battlefield**: behind explicit experiment toggle/QA branch; full 12-case plus asymmetric suite, browser at iPhone dimensions, no production or source-integrity release until evidence supports.
7. **Canvas/theatre pass**: stable compositional camera, authentic authored arena environment, reclaimed floor, priority-based localized VFX/sound and scene caching; assess real mobile frames and screenshot diffs.
8. **Fun and strategy verification**: distinguish Quick/Draft/Lab, readable front reversals, meaningful spell windows and L4/L5 ultimate showcase; refine stats with role-balance matrix only after tactics.
9. **Release gate**: explicit user approval, required CI green, service worker digest synchronized with any renderer update, single planned merge/deploy and on-device smoke.

## Decision log

- Reject: blindly increasing squad-center separation ±0.24, blanket sticky targeting, four-role proximity persistence, automatic production promotion of Knight speed 1.18.
- Preserve as research baseline: ±0.20 connected fronts, Beetank-only narrow persistence, experimental Assassin HP132/dmg31/dodge24%/vanish0.70.
- Prioritize: meaningful engagement behavior, correct metrics, stable camera composition, role readability, performance headroom, in-game spectacle tied to real mechanics.
- Do not infer production readiness from passing Node VM experiments alone.


## Independent research cross-check (source-verified)

1. **Reynolds, *Steering Behaviors for Autonomous Characters* (GDC 1999)** — https://www.red3d.com/cwr/papers/1999/gdc99steer.html. Distinguishes goal-setting/strategy, steering and locomotion; separation is a local collision behavior, not a whole-battle objective. Applied here to distinguish engagement assignment from unit-specific attacks and avoidance.
2. **Gorniak & Davis, *SquadSmart — Hierarchical Planning and Coordinated Plan Execution for Squads of Characters* (AIIDE 2007)** — https://ojs.aaai.org/index.php/AIIDE/article/view/18775. Demonstrates group coordination layered over individual agents with bounded real-time planning. A full HTN is unnecessary for this project, but provides published precedent for a light engagement director instead of each fighter independently chasing the nearest enemy.
3. **Van den Berg et al., *Reciprocal n-body Collision Avoidance* (ORCA)** — https://gamma.cs.unc.edu/ORCA/publications/ORCA.pdf. Shows multi-agent collision avoidance; it does not supply engagement strategy or roles. Treat as a future engineering reference only if bounded slots + grid separation fail measured visual and runtime tests.
4. **Riot Games, *League's VFX Style Guide* (2017)** — https://nexus.leagueoflegends.com/en-us/2017/10/dev-leagues-vfx-style-guide/; and *Clarity in League* (2021) — https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/. Effects should communicate actual hitbox, power, source, action timing and hierarchy without overwhelming silhouettes. Apply to Dragon cones, Beetank contact, Goose stun, spells and ultimate cues, especially in crowd scenarios.
5. **MDN, *Optimizing canvas*** — https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas. Supports static pre-rendering, selective layered canvases, avoiding costly per-frame image scaling and minimizing canvas state changes; benchmark first because allocating too many high-DPR buffers can increase iPhone memory pressure.
6. **Apple, *Design for Safari 15* (WWDC21)** — https://developer.apple.com/videos/play/wwdc2021/10029/. Dynamic safe-area insets must inform battle controls and portrait/landscape layout. They cannot be assumed away based on a fixed canvas height.

**Inference boundary:** These sources provide established *principles* for coordination, readability and performance. They do not validate the exact values (2–3 fronts, target-score weights, desired viewport percentages, or Knight guard multipliers) proposed for Showdown Lab. Those remain falsifiable game-specific hypotheses requiring instrumented browser and deterministic simulation tests.


## Second-pass decision review — performance, fun, and complete roadmap (2026-10-14)

### Major correction: connected fronts are a role-safe research candidate, NOT a proven spatial winner

The **completed** [CI 38641118684](https://github.com/danickman/ShowdownLab/actions/runs/38641118684), including its 12-case, 3-seed/80+120/mirrored comparison, reports eligible samples rather than zero-filling already-terminal matches. Active contested *horizontal bands*, averaged by observed match lifetime:

| Variant | 25% | 50% | 75% |
|---|---:|---:|---:|
| Original live-core geometry baseline | **2.500** | **1.083** | **0.417** |
| Connected-front ±0.20 + experimental strong Assassin + Beetank persistence | 1.833 | 0.833 | 0.333 |
| Connected-front + raw Knight speed 1.18 | 2.250 | 0.583 | 0.083 |

All 12 matched cases are present at these **relative** fractions. These metrics are not counts of independent contact components, do not prove why fronts merge, and do not by themselves determine enjoyability, but **invalidate any prior claim that the connected-front proposal is objectively superior at sustaining spatial fronts**. Preserve **both original baseline and connected research candidate** until a verified world-space engagement graph and captured same-seed mobile playback choose a winner. Preserve live core. Keep raw Knight speed experiment unpromoted.

### Performance analysis

1. **Engine baseline is already nontrivial**: per-step nearest enemy and same-team pressure scans; slotPoint filters/sorts attackers for each advancing melee fighter; separation resolves all living pairs in 3–4 passes. This is O(N²) or worse under dense crowd/slot sort costs. 80/120-fighter cost must be measured *separately* from draw/frame cadence.
2. **Existing meaningful optimization evidence already exists**: handoff Turn 5C found deterministic-parity hot-path optimizations averaging 762→418 ms over 90 synthetic callback samples at 80 fighters and 2056→883 ms at 120 in GitHub Node VM. This is not iPhone FPS and should be profiled again on the latest branch before adding an Engagement Director.
3. **Budget rule**: an engagement planner should replace repeated global target scans or remain approximately below 5–10% incremental 120-fighter per-tick CPU as a *proposed acceptance threshold*, with no worsening p95 browser input latency; if over budget, optimize spatial hashing/cache first. Update strategic goals roughly every 8–12 logical ticks and immediately for kills, target invalidation, local engagement dissolving and major stuns, rather than full replan for all characters every step.
4. **Consistent tick snapshot**: cache living target indexes, team pressure, spatial bucket lists, and commitment state once per logical tick/decision epoch. Stable ID sorting and seeded tie-breaks ensure deterministic replay; no order-dependent allocations that privilege blue or low-id units.
5. **Collision**: reuse grid staging concepts for *real* physics only after exact collision and end-state comparisons; keep existing hard separation fallback for cramped groups. Do not reuse visual-only staging offsets for hit, range, knockback or target selection.
6. **Avoid accidental cost increases**: don't add ORCA, A*, crowd nav meshes, actor-per-worker messaging, full 2D particle physics, or per-frame hundreds-of-agent path search. Do not introduce a new fullscreen canvas layer without benchmarking memory/CPU; target device canvas DPR is capped at 2. At 430×932 CSS, one DPR2 RGBA surface is ~6.41 MB of pixels before browser/texture duplication; three equal layers would be ~19.2 MB before sprite decoding and caching.
7. **Scheduling**: rendering may skip frames when busy, but never skip deterministic combat ticks to pretend a speed mode completed. Preserve terminal/last-hit and 10× behavior, and measure input-to-spell visual response at 1×/4×/10×. Avoid an unbounded catch-up loop after Safari background resume: clamp and make pause/resume behavior explicit.
8. **Performance gates proposed, not measured claims**: 10–40 fighters should approach smooth 60Hz target on iPhone 15 Pro Max; 80–120 target consistently responsive >=30fps under load if 60fps is not sustainable; huge Lab battles degrade ambience then minor FX, never character silhouettes, hit feedback or input handling. Track p50/p95 frame time and max frame spikes, sim-step CPU, staging time, allocated buffers, max resident memory where available, and input latency. Test portrait **430×932**, compact portrait, landscape, 80/120/180, L1/L4/L5, and speed 1×/10×. CI Chromium metrics are proxies only; physical iOS Safari is a required release gate.

### Fun and pacing risk register

| Risk | How the design could fail | Safeguard and acceptance observation |
|---|---|---|
| Regimented, predictable battles | Hard lanes lock both teams into rote pairings | Engagement assignments soft/releasable, visible cross-front flanks and legitimate reinforcement |
| Battles become too slow | Defenders hold ground after local threats have gone | Immediate release/nearest hostile fallback; measure first contact, no-hit intervals, battle duration and clutch tail |
| Combat becomes less strategic | Smart AI cleans up poor compositions automatically | Preserve real counters and mistakes in draft; player composition, levels, spells and enemy choices meaningfully change outcomes |
| Assassin loses opportunities | Target locality blocks rear access | Cross-engagement backline pursuit exemption and exposure-to-backstab metrics; no universal distance tax |
| Goblin/Goose/Dragon AOE weakens | Spreading removes pack/honk/cone opportunities | Keep naturally formed small clusters; reassess target opportunity, proc counts and hit shape, not just damage stats |
| Knight turns into lone sprinter | High base speed and charge outrun allies | Compare effective guard travel to Barbarian march, protective Bastion uptime and ally distances; initial trial Knight stat 1.12 / guard multiplier 1.04 / charge multiplier 1.5 (hypothesis only) |
| Turtle causes stalemate | Fixed defense position delays last contact | Auto release once sector clear, Turtle-v-Turtle across levels, enforced legitimate terminal state not forced kill |
| 3 fights overwhelm phone view | Even perfect spatial dynamics make sprites too small | 2–3 concurrent fronts only when naturally viable; prioritization, feet/weapon silhouette QA and optional spectator focus; no fake screen-space combat |
| Spells feel unresponsive | Event backlog delays click and feedback | Input-to-on-screen cue budget, sampled interaction latency, immediate legal cast feedback; unchanged actual spell mechanics |
| Ultimates lose spectacle | Crowd FX gates suppress L4/L5 role defining powers | Reserve per-engagement premium cues based on mechanical importance and confirmed activation; no fabricated hit FX |
| Non-determinism breaks replay | Dynamic zone assignment/tie-breaks depend on array order | Fixed seeded ordering, mirrored paired runs, battle trace hashes, versioned rules for future battle codes |
| Strategic balance overfits 120-unit Lab | Design tuned to three-front mega-swarms | 1v1, 4v4, 10/20/40, 80/120/180 role compositions; small battles should *not* be required to split |

**Enjoyability principle:** battles should have naturally emerging (1) first clashes, (2) local breakthroughs and reversals, (3) rapidly converging endgame; do not script phases or force combat to last longer. Show team protection, stun, heal, rage and ultimates *as they really happen*. Keep the chaotic personality of Goose/Goblin/Assassin; disciplined formations should not take over the arcade identity.

### Roadmap integration and supersession audit

Current ROADMAP.md mixes *historical* M3 Level 10 design with the **October 12 approved five-level system**. The latter is authoritative: L1 Base, L2 Evolved, L3 prestige accent, L4 Ultimate ability + Ultimate art, L5 empowered Ultimate. Remove L10 from **active** planning; leave early rationale as archived history. All ten forms, six arena treatments and six-word multi-mode UX exist at some stage, so do not spend another content cycle regenerating 10×7 art assets. Do not expand to the 26-unit backlog yet.

Preserve completed / committed work: custom Ultimate Lab **Choose Your Enemies** subpage and actual counts; root-only index, deleted v3/index.html, SHA-pinned SW offline rollout, team HUD, Quick/Draft/Lab distinctions and five-level guides. The **Ultimate Lab enemy picker is built and browser-tested on this branch** but remains unreleased; don't rebuild or overcrowd Lab UI. Existing broken/pending cases should be audited as separate release blockers rather than being rediscovered through the tactical overhaul.

Roadmap revisions:
- **P0 reliability and performance**: deterministic/terminal tests, Turtle-v-Turtle, root-only PWA digests/cold-warm-offline upgrade, iOS input response, measurable 80/120/180 performance. No combat migration until these gates.
- **P1 one compelling combat prototype**: baseline and connected candidate plus new soft-engagement director A/B/C, identical seeded armies, duration-normalized genuine world-space contact components, ten-role L1/L4/L5 safety. Abandon or scale down director if marginal.
- **P1 canvas/combat theatre in parallel**: audit camera horizon (~29% portrait top) and 96px bottom reserve, safe area, stable stage, sprite envelopes, dynamic effects budgets, impact/ultimate readability, animation timing, brighter arena identity; presentation-only improvements can ship independently after release gates.
- **P1 strategy and immediate fun**: meaningful Quick choices and pacing, Draft upgrade-vs-reinforce trade-offs, better opponent AI that varies appropriately, clear ability tooltips and contextual last-round outcomes. Reinforce spell agency at breakthrough moments. This work is just as important as combat engineering.
- **P2 user-facing polish**: audio/haptics as optional user-activated mobile enhancement; onboarding/Guide clarity, accessibility and settings, actual phone QA, meaningful result recap and rewards.
- **P2 content/replay and modes**: Boss Hunt must become a true boss ruleset *or be honestly renamed*; saved armies, seed/battle codes, daily challenges, replay/versioned trace can add strong return-value. Delay heavy arena mechanics until basic engagement readability is proven.
- **P3 expansion**: 26-unit roster, L10, multiplayer, full simulation worker rewrite, engine migration and expensive new art generation are explicitly out of near-term scope.

### Proposed interlocked delivery sequence (bounded and shippable)

| Turn group | Scope | Deliverable / hard decision |
|---|---|---|
| A: 1–2 turns | Correct role and world-space contact-cluster metrics; expose per-phase target reach, battle duration and early terminal handling | Compare actual independent contact clusters, not just y bands; decide whether original remains better for spatial occupancy |
| B: 1–2 | Dedicated iPhone portrait canvas/frame/event profiler and same-seed screenshot/capture baseline | Quantitative picture of camera crop, occlusion and real input latency; choose canvas-only quick wins |
| C: 2–3 | Cache per-tick target pressure and local buckets, remove duplicated scans with golden traces | 80/120/180 throughput and exact invariants preserved; room for director |
| D: 2–3 | QA-only soft director spike A/B/C: no director vs soft anchors vs anchors+role exceptions | Accept only on genuine engagement, role balance, duration and watchability; have a kill switch |
| E: 1–2 | Knight guarded-movement/charge identity and risk-based other role tuning | Knight effectively faster than Barbarian without suppressing Assassin/Beetank; no blanket stat power creep |
| F: 2–3 | Stable camera and combat theatre, VFX clarity per actual contacts, compact safe-area HUD | Same-seed portrait videos, battle screenshots, performance, correct feet/ultimate hitbox cues |
| G: 2–4 | Draft choices, opponent behavior, Lab modes including new enemy picker, onboarding, progression, result recap | Game loop more replayable, enjoyable and interpretable; avoid duplicate features |
| H: 2–3 | Complete device, PWA/offline, snapshot/determinism, accessibility and deliberate release gate | One user-authorized merge and deploy after acceptance |

These are work packages, not scheduling commitments; parallelize only independent presentation and simulation experiments. Use source-linked evidence at each checkpoint. No main merge, no deployment until user approval. Maintain documentation and QA with each turn.

### Research cross-check supporting these recommendations

- Craig Reynolds steering hierarchy: https://www.red3d.com/cwr/papers/1999/gdc99steer.html
- Riot TFT Game Analysis Team emphasizes satisfying, exciting, intelligible combat and diverse viable choices: https://teamfighttactics.leagueoflegends.com/en-us/news/dev/talking-tactics-game-analysis-team-gat/
- Riot TFT Rise of the Elements Learnings notes invisible AoE, variance from unpredictable targeting and board clutter: https://teamfighttactics.leagueoflegends.com/en-us/news/dev/dev-tft-rise-of-the-elements-learnings/
- Riot TFT Galaxies Learnings emphasizes visible spell travel, recognizable key fighters and flexible trait synergies: https://teamfighttactics.leagueoflegends.com/en-us/news/dev/dev-teamfight-tactics-galaxies-learnings/
- Riot TFT October 13, 2026 post acknowledges targeting, character motion, visual clarity, input response and performance as game-feel risks in an engine migration. This is a cautionary analogy **not** an endorsement of any particular Showdown Lab technical change: https://teamfighttactics.leagueoflegends.com/en-us/news/dev/tldw-follow-the-fix-update/
- Riot VFX clarity and hierarchy: https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/
- MDN canvas performance patterns: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
- MDN Long Animation Frame instrumentation **only where supported**: https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Long_animation_frame_timing
