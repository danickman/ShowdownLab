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
