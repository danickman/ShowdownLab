# Showdown Lab — Test Matrix

Status: **ACTIVE**
Purpose: validate underplayed changes before more feature work.

## Severity
- P0 — catastrophic/unplayable
- P1 — core loop broken, battle cannot finish, state corruption
- P2 — significant UX/visual/performance defect
- P3 — polish

P0–P2 block release.

## Visuals 11 first-play

### Boot/cache
- [ ] splash says VISUALS 11 · RC
- [ ] no asset guard error
- [ ] hard reload keeps same version
- [ ] no stale Visuals 9/10 art

### Draft
- [ ] all 10 fighters render
- [ ] selection obvious
- [ ] two-pick limit/confirm work
- [ ] Dragon/Barbarian/Turtle distinct
- [ ] no phone overflow

### Ready
- [ ] Blue choice truthful
- [ ] Red opponent truthful
- [ ] battle transition reliable

### Round opening
- [ ] round correct
- [ ] arena name/background match
- [ ] army counts/evolution summary truthful
- [ ] ceremony does not hide first meaningful combat too long

### Arena presentation
For Neon Lab, Ember Pit, Moon Vault, Verdant Ruins:
- [ ] distinct skybox
- [ ] banners visible but not distracting
- [ ] ambience fits
- [ ] halftone treatment preserves readability
- [ ] floor markings add depth
- [ ] later rounds feel more intense

### Combat readability
At 2× and 4×:
- [ ] units recognizable
- [ ] major ability tells readable
- [ ] health bars appear only when useful
- [ ] comic callouts linger enough
- [ ] no wall of text

At 10× require correctness/termination, not cinematic readability.

### Clutch storytelling
- [ ] LAST FIGHTER truthful
- [ ] OUTNUMBERED truthful
- [ ] FINAL K.O. once
- [ ] vignette subtle
- [ ] victory spotlight picks living winner
- [ ] old round outro clears before next round

### Between-round progression
- [ ] result banner matches winner
- [ ] hearts/pips match lives
- [ ] Blue pips blue / Red pips red
- [ ] reinforce/multiply/evolve deltas truthful
- [ ] choice changeable before deploy
- [ ] evolution preview matches selected unit/new level
- [ ] preview hides for non-evolution choice
- [ ] next arena label matches actual arena
- [ ] overlay scrolls on small phone
- [ ] opponent reinforces after deploy

### Match completion
- [ ] ends without ARC/BLOOM intervention
- [ ] no immortal/zombie units
- [ ] final lives truthful
- [ ] largest squad/highest evolution summary truthful
- [ ] results opens once
- [ ] MVP is living winner

### Navigation/rematch
- [ ] Ready screen names the active mode and uses mode-specific instructions
- [ ] battle HUD identifies Quick / Draft / Lab without adding visual clutter
- [ ] Quick Results primary action starts another Quick match, not Draft
- [ ] Draft Results primary action starts a fresh Draft flow
- [ ] Lab Results primary action returns to Ultimate Lab
- [ ] Ultimate Lab exposes all four spells for experimentation without permanently unlocking them
- [ ] leaving Lab restores normal purchased-spell visibility
- [ ] Upgrade Bay sticky Parts wallet stays visible and does not overlap the title on small phones
- [ ] Upgrade Bay collapses spell cards to one column on narrow portrait screens
- [ ] no dark-theme panels remain in between-round evolution preview or match-complete overlay
- [ ] NEXT SHOWDOWN starts clean match
- [ ] REMATCH starts clean battle
- [ ] no old defeated bodies/effects
- [ ] cooldown visuals reset
- [ ] leaving battle safe
- [ ] Home → Draft does not reuse stale phase

### Lab
- [ ] Lab Blue/Red mastery sliders freely set M0–M5 without spending Parts
- [ ] Lab ARC/BLOOM/QUAKE/AEGIS tech sliders freely set T0–T5
- [ ] Lab spell tech affects real spell power but never mutates saved progression
- [ ] Lab evolution level, mastery, and spell tech can be combined independently
- [ ] Lab rematch reuses the exact chosen experiment configuration
- [ ] leaving Lab restores normal purchased spell visibility and saved progression
- [ ] stale cooling classes are cleared when a new battle starts
- [ ] direct spell casting cannot push the FX queue beyond the density cap
Run Duel, Horde, Crossfire and Boss Hunt:
- [ ] expected Red composition
- [ ] selected Blue respected
- [ ] lives respected
- [ ] 2×/4×/10× works
- [ ] match terminates

### Targeted combat regressions
- [ ] Turtle shell counter triggers a visible roll/slam sequence instead of passively sitting in shell
- [ ] Turtle counterattack briefly stuns and meaningfully threatens melee opponents without becoming a top DPS unit
- [ ] Turtle survives/competes better than the previous passive-shell build across mixed matchups
- [ ] Bloom, battle menu, Results secondary actions, and sheet controls remain clearly visible in daylight UI
- [ ] comic words clear in about one second and do not obscure ongoing melee
- [ ] deadlock recovery never lets opposing teams pass through and swap engagement sides
- [ ] 4× L1 Sniper vs 1× L1 Assassin: Snipers can defend at close range; expected typical result is Blue win with roughly 3 survivors
- [ ] Sniper close-defense damage remains clearly weaker than normal rifle damage
- [ ] Dragon has a weak close-defense attack when pinned inside firing posture
- [ ] Mole is not targetable while burrowed
- [ ] Mole tunnels only forward toward an enemy, erupts near the target, and can re-burrow toward the next enemy if it survives
- [ ] Assassin rear-line behavior remains distinct from Mole forward tunneling
- [ ] L1 vs L2 vs L3 of the same unit can be distinguished at battlefield scale without reading labels
- [ ] L2 and L3 each add a unit-specific silhouette change rather than only scale/glow
- [ ] Dragon, Beetank, Sniper, Goblin and Turtle evolution shapes remain recognizable in dense fights

### Meta progression / Parts
- [ ] ARC uses a directional lightning strike rather than a generic pulse
- [ ] BLOOM uses leaf/petal growth cues rather than a generic circle
- [ ] QUAKE reads through ground cracks/dust across the enemy side, not a screen-filling flash
- [ ] AEGIS uses hexagonal shield geometry plus per-unit wards
- [ ] spell callout pills remain secondary to the battlefield effect
- [ ] all four spell buttons disable correctly when the battle cannot accept the spell
- [ ] fighter mastery purchase deducts Parts and persists after reload
- [ ] fighter mastery is capped at 5
- [ ] each mastery rank adds only 2.5% HP and damage, separate from in-match level/evolution
- [ ] player mastery applies in Quick and Draft but not Ultimate Lab sandbox runs
- [ ] rematch preserves the same mastery values used by the completed match
- [ ] armored hits use sparks/debris while organic hits use restrained blood flecks
- [ ] ranged organic hits show a distinct puncture/impact cue
- [ ] comic words are limited to signature moments and never dominate dense fights
- [ ] clouds, birds, banners and other ambient motion stay subtle behind combat
- [ ] Quake unlock costs 90 Parts and persists after reload
- [ ] Aegis unlock costs 120 Parts and persists after reload
- [ ] locked spells do not appear in the battle spell rack
- [ ] unlocked spells appear without replacing ARC/BLOOM
- [ ] Quake applies light AoE damage + short stun to living enemies only
- [ ] Aegis applies a temporary visible ward to all living allies and reduces incoming damage
- [ ] purchased spell tech upgrades increase the new spell's effect
- [ ] spell rack remains usable on portrait mobile with 4 unlocked spells
- [ ] Quick Showdown and Draft wins award Parts exactly once per completed match
- [ ] Ultimate Lab awards no Parts
- [ ] Parts persist across reloads
- [ ] ARC/BLOOM tech purchases deduct the correct amount and persist
- [ ] spell tech increases real spell effect without changing normal unit combat
- [ ] max spell tech cannot exceed 5
- [ ] insufficient Parts disables upgrade purchase
- [ ] reopening Results does not duplicate rewards
- [ ] Upgrade Bay is the single roster/upgrade destination

### Combat feel / environment polish
- [ ] Quick Showdown never opens the between-round draft; both sides auto-reinforce and continue
- [ ] Draft Battle still opens the full between-round choice/evolution overlay
- [ ] Ultimate Lab is unaffected by Quick auto-reinforcement rules
- [ ] inter-round Draft overlay uses daylight surfaces and readable dark text
- [ ] match-finish overlay no longer snaps back to the old dark/neon presentation
- [ ] battle HUD remains readable against bright skies without obscuring arena art
- [ ] Results podium and controls remain clearly readable in daylight
- [ ] Sniper casing FX are tiny, brief, and disabled in dense battles
- [ ] atmospheric sunlight motes remain nearly invisible during active combat
- [ ] mastery pips match stored mastery level on every fighter card
- [ ] mastered fighter cards gain visual prestige without looking like a separate in-match evolution tier
- [ ] card sheen animation remains subtle and does not affect scrolling performance
- [ ] daylight unit shadows fall consistently away from the upper-left sun direction
- [ ] arena landmarks are distinguishable but stay behind combat silhouettes
- [ ] Verdant ruins, Ember industrial shapes, Moon domes, and Lab structures read differently at a glance
- [ ] Dragon fire ember fragments add texture without hiding nearby fighters
- [ ] warm rim lighting no longer gives base fighters a neon outline
- [ ] directional melee impact arcs read as motion, not another comic bubble
- [ ] Sniper attacks show a brief muzzle cue/tracer without obscuring targets
- [ ] charge/ram/rush actions kick up restrained ground dust
- [ ] heavy impacts can create a brief ground puff without stacking into screen fog
- [ ] blood remains stylized, small, and absent on Knight/Beetank/Turtle armored hits
- [ ] Verdant foliage sway is barely noticeable during active combat
- [ ] Ember smoke drifts slowly in the distant background
- [ ] Moon Vault distant rotor motion remains behind the battle plane
- [ ] Neon Lab distant instrument motion does not compete with units
- [ ] Sniper, Beetank and Goblin silhouettes remain legible at dense battle scale after added detail

### Stress
- [ ] 8+ round match
- [ ] 10× terminal correctness
- [ ] dense Goose/Goblin callouts acceptable
- [ ] Dragon FX does not hide all fighters
- [ ] repeated rematches do not accumulate stale state

## First-10 art scorecard

Score 1–5.

| Unit | Silhouette | Personality | Small scale | Action | Evolution | Notes |
|---|---:|---:|---:|---:|---:|---|
| Knight | | | | | | |
| Sniper | | | | | | |
| Goose | | | | | | |
| Dragon | | | | | | |
| Assassin | | | | | | |
| Beetank | | | | | | |
| Mole | | | | | | |
| Turtle | | | | | | |
| Goblin | | | | | | |
| Barbarian | | | | | | |

If silhouette or small-scale clarity <3, fix before adding more units.

## Deterministic regression seeds

After first Visuals 11 playtest, curate seeds for:
- baseline melee/ranged
- swarm vs heavy
- Assassin backline
- Dragon splash
- Turtle long fight
- extreme comeback
- final-life round

Record armies/levels, speed and expected termination. Only lock expected winner when balance is intentionally locked.

## Device matrix
Primary:
- [ ] iPhone portrait ~390×844

Secondary:
- [ ] smaller iPhone
- [ ] iPad portrait
- [ ] desktop narrow/tall
- [ ] landscape does not corrupt navigation

## Performance observations
Record rather than guess:
- normal/max fighter count
- frame stability at 2×/4×/10×
- thermal slowdown
- input latency
- large FX spikes

Future profiling tools stay behind a development flag and out of production HUD.


## Package 13 RC automated evidence

Automated gate run before promotion:
- Runtime parse check: all 8 browser JS modules passed.
- Canonical shell: root `index.html` and `v3/index.html` are byte-identical.
- Mixed combat stress: 40/40 seeded 8-vs-8 mixed-roster battles terminated; no stalled winnerless case.
- Lifecycle stress: 8 sequential reset/start matches produced strictly increasing battleIds 1→8 and all reached `match_over`.
- Spell mechanics: Quake at 1.75× power affected both living enemies; Aegis at 1.75× applied ward 114 to both living allies.
- Turtle targeted smoke: Turtle consistently defeats light Goblin pressure but still loses to Barbarian, Beetank and Dragon-class power in tested baseline matchups, preserving a counter-bruiser rather than top-DPS identity.

Manual device/visual checks remain required after deployment; automated evidence does not mark unchecked visual rows above as complete.

### Package 14.1 — spell spectacle scaling
- [ ] ARC reads as a top-down lightning strike at phone scale; T3–T5 adds visible branching/secondary bolts and stronger camera punch without hiding the target.
- [ ] BLOOM visibly emits green leaves/petals and growing stems; higher tech increases botanical density/radius rather than becoming a generic green circle.
- [ ] QUAKE produces unmistakable ground fracture + debris across affected enemies and camera shake increases materially from T0 to T5; HUD remains tappable/readable.
- [ ] AEGIS reads as a protective dome/shield around each living ally, with stronger shield geometry at higher tech.
- [ ] Spell FX duration scales modestly with tech but remains bounded; 10× and dense Lab fights still terminate and retain fighter silhouettes.
- [ ] Spell mechanics/damage/heal/ward values remain governed by the existing deterministic core; Package 14.1 presentation changes do not alter combat balance.

### Package 14.2 — Upgrade Bay economy/readability
- [ ] Upgrade Bay opens with a prominent current Parts wallet and one-sentence earn/spend explanation.
- [ ] Spell Armory is visually separated from Fighter Mastery.
- [ ] Every spell shows current T-rank/power, exact next benefit, exact next cost, and affordability state.
- [ ] Locked Quake/Aegis show exact unlock price and how many additional Parts are needed.
- [ ] Every fighter shows current M-rank, cumulative HP/DMG bonus, exact next bonus, exact next cost, and affordability state.
- [ ] With 34 Parts at M0, fighter cards visibly say NEED 1 MORE · 35 PARTS rather than presenting an unexplained disabled button.
- [ ] Buying/upgrading immediately refreshes wallet, next benefit, next price and button state.
- [ ] 390px portrait renders spell cards one-column with no clipped CTA/cost text.

### Package 14.3 — hero-five fighter redraw
- [ ] Knight reads shield-first at phone scale; guard/charge/attack poses are visually distinct and L4 is not merely larger.
- [ ] Sniper silhouette is dominated by hood + long rifle + optic; aim, shot recoil and reload are distinguishable without labels.
- [ ] Goose remains comedic and unmistakable through beak, wing, crest and HONK gesture; stronger levels do not turn it into a generic bird.
- [ ] Dragon reads as the broadest/heaviest of the five with dominant wings, jaw, horns and fire profile; never resembles Barbarian.
- [ ] Assassin reads lean/angular with eye slit, split cloak and asymmetric twin blades; vanish/backstab/disengage poses remain clear.
- [ ] Hero-five material highlights improve separation without washing out team accents or dark ink contours.
- [ ] L2/L3/L4 shape progression remains visible at battle scale for all five.
- [ ] Cover labels in a 390×844 battle: all five remain identifiable from silhouette + signature equipment alone.

### Package 14.4 — second-five fighter redraw
- [ ] Beetank reads as low fortress-beetle mass with oversized ram horn; ram/bulldoze silhouette is unmistakable.
- [ ] Mole reads through shovel claws and squat digging body; burrow/erupt contrast is obvious without labels.
- [ ] Turtle shell dominates the silhouette; shell, roll, slam and exposed-head states remain visually distinct.
- [ ] Goblin reads tiny, frantic and knife-first with exaggerated ears; rush/stab motion is more kinetic without becoming visual noise.
- [ ] Barbarian remains a broad vertical humanoid with oversized axe; rage changes posture/crest/impact without resembling Dragon.
- [ ] L2/L3/L4 progression for all five changes shape language and signature equipment, not only scale/glow.
- [ ] Material edge-light and team accents remain secondary to silhouette.
- [ ] All ten current fighters remain distinguishable at normal 390×844 battle scale with labels hidden.

### Package 14.5 — combat impact and readable chaos
- [ ] Sword, axe, blade, claw, ram, shell and peck attacks produce visually distinct contact trails/impact shapes.
- [ ] Armored targets (Knight, Beetank, Turtle) produce sparks/clash bursts rather than organic blood effects.
- [ ] Organic hits retain restrained blood/puncture cues; ranged puncture stays visually different from melee.
- [ ] Heavy axe/ram/shell/claw contacts generate ground shock rings and stronger camera punch.
- [ ] KOs receive a brief decisive burst without obscuring adjacent fighters or HUD controls.
- [ ] Beetank ram, Turtle shell impact, Barbarian heavy swing, Assassin/Goblin blade contact and Mole/Dragon claw hits are readable at 2×.
- [ ] 10× automatically reduces secondary particles/trails and lowers the FX cap; combat still terminates normally.
- [ ] No gameplay damage, targeting, cooldown or terminal-state mechanics are changed by this presentation pass.

### Package 14.6 — staging and performance
- [ ] Camera framing follows combat smoothly without jittering on small target movements; late duels/clutch states get a modest readable zoom.
- [ ] Large crowds zoom out enough to preserve both teams and keep spell controls/HUD unobstructed.
- [ ] Fighters feel grounded through weighted directional contact shadows and arena perspective cues.
- [ ] Daylight arenas gain depth bands/floor guides without reverting to a dark simulator look.
- [ ] Dragon fire reads as layered luminous breath rather than a flat polygon.
- [ ] Sniper shots read as precise tracers with a distinct impact point.
- [ ] Dense/10× combat reduces background birds/motes and secondary scene detail before reducing core fighter readability.
- [ ] Battle HUD and spell rack remain readable/tappable at ~390px portrait width.
- [ ] Staging changes do not alter simulation damage, targeting, cooldowns, progression, or terminal-state behavior.

### Package 14 Bonus A — progression theatre
- [ ] Affordable fighter/spell upgrades are visually highlighted without hiding non-affordable options.
- [ ] Locked, affordable, maxed and intermediate spell-tech states are visually distinct.
- [ ] Fighter mastery purchase immediately updates pips, exact next cost, wallet balance and affordability state.
- [ ] Spell unlock/tech purchase immediately updates card state, power text, wallet balance and battle availability.
- [ ] Successful purchases show a brief non-blocking celebration/toast; no modal or extra tap is required.
- [ ] Purchase animations do not shift surrounding layout or trap focus on narrow mobile screens.

### Package 14 Bonus B — battle personality
- [ ] Signature actions use fighter-specific comic vocabulary without flooding dense fights.
- [ ] Knight, Sniper, Goose, Dragon, Assassin, Beetank, Mole, Turtle, Goblin and Barbarian each have at least one distinctive visual/action callout.
- [ ] Low-HP clutch aura appears only in smaller fights and does not obscure health bars or targeting.
- [ ] Selective signature bursts reinforce major actions without replacing core attack/hit readability.
- [ ] Last-fighter moments include fighter-specific flavor text and remain brief/non-blocking.
- [ ] Final-KO story beat attributes a recognizable finisher personality without changing winner logic.
- [ ] 10× and large-crowd fights suppress personality flourishes before suppressing core combat FX.

### Package 14 RC automated evidence — 2026-10-06
- [x] All 8 runtime JavaScript modules parse successfully with `new Function`.
- [x] Root `index.html` and `v3/index.html` are byte-identical.
- [x] 40/40 seeded mixed-roster 8-vs-8 battles at 10× reached `match_over` with a winner.
- [x] 8 sequential reset/start lifecycle runs reached `match_over`; battle IDs were strictly increasing (41→48 in the test runtime).
- [x] Quake at 1.75× reported 17.5 base damage to every living enemy and applied its stun behavior through the deterministic core.
- [x] Aegis at 1.75× applied 114 ward ticks to every living Blue unit.
- [x] ARC at 1.75× produced a successful 56-damage precision strike and stun in the deterministic test harness.
- [x] BLOOM at 1.75× restored a damaged ally to its max HP in the test harness.
- [x] Mastery M5 produced the intended +12.5% HP/damage multiplier (Knight 175→196.875 HP; 18→20.25 damage).
- [x] Upgrade formulas/source gates verified: fighter cost 35×next rank, spell tech 50×next tech, four cooldown keys, Lab spell-tech override and unlimited-spell path present.
- [x] Reward de-duplication hardened with a per-page run identifier so persisted reward keys do not collide after browser reload.
- [x] Vercel preview deployment status for the RC branch is successful.
- [ ] Manual 390×844 iPhone visual/tap QA after production deployment remains required; automated checks cannot certify subjective art readability or touch feel.

### Package 15 — Quick arcade & spell spectacle
- [ ] Quick Showdown pauses after each non-terminal round for a compact timed intermission.
- [ ] Quick presents exactly three large arcade choices: REINFORCE, WILDCARD, EVOLVE.
- [ ] Tapping a Quick choice applies it and launches the next round without the full Draft flow.
- [ ] If the player does nothing, Quick auto-picks after ~4 seconds and proceeds.
- [ ] Draft Battle keeps its deliberate between-round picker unchanged.
- [ ] ARC reads as a sky-to-ground lightning strike with forked branches and stronger impact at higher tech.
- [ ] BLOOM reads as living green growth: vines, leaves, particles and healing halo, scaling with tech.
- [ ] QUAKE visibly fractures the ground, throws debris, emits arena shockwaves and increases camera shake with tech.
- [ ] AEGIS reads as an unmistakable protective dome/hex shield network.
- [ ] Large fights cap sampled spell targets for rendering only; spell mechanics still affect all valid units.
- [ ] 10× combat remains readable and terminates normally after the visual changes.

### Package 16.1 — spell choreography
- [ ] Every spell cast produces a target/area sigil before/through the primary visual impact.
- [ ] ARC gets the strongest white-blue screen pulse and target-centric sigil without obscuring the struck unit.
- [ ] BLOOM cast pulse is green/life-coded and remains visually different from AEGIS.
- [ ] QUAKE receives the heaviest camera/arena response while keeping HUD controls readable.
- [ ] AEGIS cast moment reads cool-blue/protective, not like ARC damage.
- [ ] Spell callout shows current T0–T5 and actual power percentage.
- [ ] T3–T5 callouts and sigils visibly scale without adding gameplay damage beyond existing core mechanics.

### Package 16.2 — persistent spell aftermath
- [ ] ARC leaves a brief world-space scorch/electrical residue that fades over several seconds.
- [ ] BLOOM leaves visible green growth/leaves after the initial heal burst; higher tech adds subtle drifting leaf motion.
- [ ] QUAKE leaves persistent ground fractures/dust residue at affected enemy positions.
- [ ] AEGIS leaves fading hex ward residue at allied positions after activation.
- [ ] Damage taken while warded produces a distinct shield-hit shimmer/spark rather than looking like ordinary damage.
- [ ] High-tech residual animation is subtle and bounded; spell aftermath never grows without limit.
- [ ] Spell aftermath is cleared when a new battle begins and remains presentation-only.

### Package 16.3 — combat spectacle
- [ ] Heavy hits and KOs trigger a brief presentation-only camera punch without pausing or altering the simulation loop.
- [ ] Armor impacts throw metallic shards/sparks; organic/ranged punctures use a different material response.
- [ ] Axe, blade, claw, shell, ram and peck trails are visually distinct at normal phone scale.
- [ ] Sniper fire gets a visible muzzle shock/recoil flash in addition to tracer and casing cues.
- [ ] KO punctuation changes with finishing attack flavor instead of using one generic burst.
- [ ] Slash/stab/axe/shell contact arcs use distinct geometry and remain readable at 2×.
- [ ] Dense and 10× fights continue to suppress secondary spectacle before core combat readability.
- [ ] All changes remain presentation-only: no damage, targeting, cooldown, lifecycle or terminal-state rules change.

### Package 16.4 — progression theatre
- [ ] Quick intermission choices have unmistakable REINFORCE / WILDCARD / EVOLVE visual identities.
- [ ] All three reward types preview their next-round impact; preview is not limited to evolution.
- [ ] REINFORCE preview shows squad growth, WILDCARD shows multiplied battlefield count, EVOLVE shows the upgraded fighter form.
- [ ] Selecting a reward creates a brief lock-in/reward-acquired moment before the next round starts.
- [ ] Quick remains fast: choice + lock-in handoff adds only a brief pause and preserves the ~4s auto-pick path.
- [ ] Draft keeps deliberate choice/change-preview behavior, with a stronger deploy handoff rather than auto-starting on selection.
- [ ] Reward theatre is visual only; draft application logic, bot reinforcement, round seeds and lives are unchanged.

### Package 16.5 — cohesion and performance
- [ ] Combat spectacle uses full / balanced / reduced / minimal density tiers rather than independent ad-hoc thresholds.
- [ ] 10× and large crowds reduce secondary FX lifetime, opacity, visible aftermath and queue caps before core hit/spell readability is reduced.
- [ ] Persistent spell aftermath remains visible in ordinary fights but is bounded more aggressively in dense fights.
- [ ] Active AEGIS ward reads as a protective dome with shield-panel structure, not a generic ellipse.
- [ ] Spell callouts, HUD, spell rack and menu remain tappable/readable at ~390px portrait width and on shorter phone screens.
- [ ] Quick/Draft reward cards, preview panel and deploy button fit narrow/short phone screens without clipping.
- [ ] Reduced-motion preference disables nonessential UI animation while preserving state feedback.
- [ ] No simulation damage, targeting, cooldown, lives, rewards, draft mechanics or terminal-state logic changes in this pass.

### Package 16 RC automated evidence — 2026-10-06
- [x] All 8 runtime JavaScript modules parse successfully.
- [x] Root `index.html` and `v3/index.html` are byte-identical.
- [x] 24/24 seeded mixed-roster 8-vs-8 battles at 10× reached `match_over` with a winner.
- [x] 6 sequential reset/start lifecycle runs reached `match_over`; battle IDs were strictly increasing (25→30 in the RC test runtime).
- [x] QUAKE T0 vs T5 scaling verified through deterministic core: 10 base damage vs 17.5 base damage per target before armor modifiers.
- [x] ARC at 1.75× produced a successful 56-damage precision strike.
- [x] BLOOM at 1.75× restored a damaged ally to max HP in the harness.
- [x] AEGIS at 1.75× applied 114 ward ticks to every living Blue unit.
- [x] Quick intermission source gates verified: 4-second timer, REINFORCE / WILDCARD / EVOLVE identity, auto-pick path, reward preview and lock-in.
- [x] Draft path remains deliberate/changeable before deploy.
- [x] Lab spell-tech override and unlimited-spell paths remain present.
- [x] Upgrade Bay ownership hotfix remains intact; Stage5B helper no longer contains the legacy ACTIVE FIGHTER overwrite path.
- [x] Persistent reward de-duplication run key remains present.
- [x] Spectacle density tiers, bounded visible spell aftermath, and all four spell render paths are present.
- [ ] Manual 390×844 iPhone visual/tap QA remains required after production deployment; automated checks cannot certify subjective spectacle quality or touch feel.


### Authored Base polish — Sniper / shared framing, 2026-10-07

- [x] `python tools/check-authored-assets.py`: 71 WebPs decode with alpha, nonempty art and all 10 pose packs present.
- [x] Sniper standing and AIM normalized to 96×96; canonical presentation is 512×512.
- [x] Sniper complete body/boots/rifle and coherent AIM checked in Canvas renders.
- [x] All 10 fighters rendered via production draw API at six presentation sizes (60 renders).
- [x] 180 framing checks for image/ring bounds and narrow/square/wide aspect ratios.
- [x] Explicit AIM action on a presentation surface still chooses standing canonical.
- [x] 24 seeded mixed-roster 8-vs-8 10× runs reached match_over; paired seeds produced identical winner and per-unit HP.
- [x] Throwing adapter listener was contained; match terminated and next RAF remained scheduled.
- [x] All runtime JS parses, identical root/v3 HTML, clean diff whitespace.
- [ ] Browser Draft → Ready → Battle → Results and Guide/Upgrade Bay layout/tap smoke: unavailable in this environment (browser missing; download failed; localhost blocked).
- [ ] Real iPhone: standing/AIM transitions at 1× and full body on Draft/Ready/Bay/Guide/Results.
- [ ] Real iPhone at ~390×844 and a shorter viewport: no stretched canvas, cropping, horizontal overflow or ring clipping.
- [ ] Real iPhone dense-fight performance: no regression; no new per-fighter blur/filter cost introduced.
- [ ] User visual approval → frozen branch head → main merge → one deliberate production deployment.


### Presentation Turn 1 — sunny staging / grounding, 2026-10-07

- [x] `node tools/check-presentation.cjs`: 8,220 full-sprite bounds checks at initial and settled camera states.
- [x] Viewports: 320×568, 375×667, 390×700, 390×844, 768×1024; 2/8/24/60/180 live units; cluster, corner and spread layouts.
- [x] Camera does not mutate combat units; equipment/head/feet stay inside camera stage bounds.
- [x] Sniper idle ring centres at its foot point and draws behind the sprite.
- [x] Native Canvas renders exercise all four daylight arena paths and living-unit shadows/rings.
- [x] Sampled arc/ellipse/fillRect calls across four six-unit scenes reduced from 3,733 to 236. This is a background-work proxy, not a phone FPS result.
- [x] Existing 71-asset decode, 180 UI-framing bounds and 60 presentation renders pass.
- [x] 24 seeded mixed-roster matches terminate with repeatable outcomes; intentional listener exception remains contained with RAF scheduling preserved.
- [x] Runtime JS parses, HTML entry pages identical, clean diff whitespace; protected simulation/adapter/round-loop/Stage5B files unchanged.
- [ ] Real iPhone: sunlight/contrast, feet/rings/shadows, initial camera framing, camera tracking and widening through multiple rounds.
- [ ] Real iPhone: all four arenas and round intro/outro remain bright and readable.
- [ ] Real iPhone: dense ~180-unit scenes and 10× performance; no subjective pass or FPS claim yet.
- [ ] Browser layout/tap smoke: environment limitation from the previous turn remains open.

Known remaining debt: sprite stacking and callout/effect placement (Turn 3); authored sky/environment detail (Turn 2 pilot).


### Presentation Turn 2 — sunny authored Sunlit Lab pilot

One authored skyline now replaces Sunlit Lab distant scenery only. Floor scorch residue, impact cracks, dirt/dust and flying debris are explicitly preserved with their existing caps and expiration. Other arenas, fighters and combat logic are unchanged. See [ARENA_ART_PILOT.md](ARENA_ART_PILOT.md) for the asset, final generation prompt, checks and phone acceptance. Automated/native renderer checks pass; browser/iPhone visual and performance QA remains open. Branch checkpoint only; no main merge or production release.


### Presentation Turn 3 — physical effects and sunny academy UI

Branch implementation adds branching ground fractures, dirt/chips, daylight edges and Dragon char; improves local spell impact hierarchy/crowd budgets and places comic callouts above silhouettes. A shared sunny cream/brass/navy presentation stylesheet now styles menus and battle controls. No new images, combat/progression changes or production release. See [THEATRE_UI_PASS.md](THEATRE_UI_PASS.md) for exact files, evidence, phone acceptance and remaining overlap/performance work. Automated/native checks pass; browser/iPhone layout, touch, visual and performance QA remain open.


### Presentation Turn 4 — courtyard floor / crowd rendering

Cached perspective paving connects the floor to the sunny skyline; live physical damage remains separate. Stronger foot-aligned team rings, limited dense-fight health bars, gradual sprite-size reduction above 60 living units and a snapshot target index reduce presentation clutter/work without changing combat positions or targeting. See [FLOOR_CROWD_PASS.md](FLOOR_CROWD_PASS.md) for exact files, cache budget, native comparison and phone acceptance. Tests pass; real phone performance and visual/tap QA remain open. No new art/evolutions, main merge or production release. Address phone findings next before expanding environment/evolution art.


### Turn 3/4 release-gate follow-through

Weapon/body effect anchors, short hit recoil, shorter ordinary trails and one prioritized comic callout now refine hierarchy. All four arenas share one authored sunny skyline and distinct cached academy/forge/observatory/garden dressing. Ordinary/dense native checks pass; spacing was evaluated without moving combat positions. Dense overlap remains a phone assessment item. See [RELEASE_PRESENTATION_GATES.md](RELEASE_PRESENTATION_GATES.md) for exact implementation/evidence and the explicitly OPEN phone visual, touch and acceptable-performance gates. Turn labels are not release approval. No main merge/production deployment or evolution work.


### Turn 6 staging checks — automated PASS / phone OPEN

Run `node tools/check-combat-staging.cjs`: 9,540 complete sprite boxes across portrait/landscape, 2–180 units and cluster/corner/spread layouts; immutable state, order-stable offsets, caps, settling, dense bypass, defeat/reset and shared cue/ground anchors. Existing camera, theatre, floor-cache, cue/recoil, asset/presentation and seeded terminal checks remain passing. Native six-fighter before/after and 180-fighter scenes inspected; all-arena action and spell matrix checks pass.

Phone: ordinary 1× melee silhouettes/contact, stable feet/rings, aligned hits/signatures, ground cracks/char staying at impact, lethal ARC, QUAKE/fire, round resets and landscape cropping; ordinary and ~180-fighter measured performance. These device gates are not passed by native Canvas tests. No production release until the exact branch head receives phone approval.


### Turn 7 — intro / Guide / Turtle / living locations

Run `node tools/check-living-arenas.cjs`: 64 bounded ambient cases, reduced-motion bypass, opening wash gone at 350ms/captions at 900ms, cached ink and Guide content layout structure. Cue/cache checks now cover academy/garden/frontier/siege and three unique preloaded skyline images. All 72 authored assets decode; Turtle move has transparent margins and complete source extraction; Turtle standing uses dedicated 512px presentation. Existing staging/camera/menu/seeded tests pass. Native all-arena actions/spells and all-ten menu ink composites inspected.

Phone remains OPEN: Guide all text/Mastery visible through scroll, opening readability, full Turtle running silhouette, distinct frontier/siege scenery, subtle living atmosphere, existing physical floor aftermath, ordinary/~180-unit FPS and reduced motion. Eight other small menu sources remain quality debt. See [LIVING_ARENAS_PASS.md](LIVING_ARENAS_PASS.md); overall-positive feedback alone is not release approval.


## Canonical menu recovery — 2026-10-08

Eight remaining menu canonicals recovered from supplied originals at 512px;
Sniper/Turtle approved presentations retained. Battle poses untouched.
See docs/CANONICAL_MENU_RECOVERY.md for provenance, reproduction and QA gates.


## Skyline / cropping correction and Knight evolution pilot

See [SKYLINE_CROP_EVOLUTION_PILOT.md](SKYLINE_CROP_EVOLUTION_PILOT.md): complete Beetank ram re-extraction, six supplied standalone menu sources, larger portrait/landscape sky region and cached material/earth detail. Seven Knight Evolved candidate poses and canonical are stored in tools/art-spike/knight/evolved; not active runtime assets. Existing cap/model inspection is documented; gameplay state unchanged. Phone cropping/sky-floor/readability/performance and evolution-design approval remain OPEN. Main/production unchanged.

Full-source audit additionally repairs 19 nominal-grid cuts across Goblin, Mole, Beetank, Goose and Barbarian. Reproduce with `tools/repair-source-boundaries.py`; provenance in `tools/art-sources/boundary-repairs.json`. Native repair contact sheet reviewed; decodes/all-arena actions/seeded regressions pass.


## Phone panorama / floor / spacing correction

See [LANDMARKS_FLOOR_SPACING.md](LANDMARKS_FLOOR_SPACING.md): full-width side landmarks with proportional architecture, stronger arena-specific cached floor identity, and body-aware ordinary melee staging up to 60 units with larger viewport-bounded caps. Camera/cues/ground impacts share positions; combat core/outcomes/evolution assets are unchanged. Native/automated checks pass; phone visual/contact/performance remains OPEN. No main merge or production deployment. This supersedes the earlier 14px/6px and 44-unit staging limits.


## Knight Evolved branch registration — 2026-10-08

See [KNIGHT_EVOLUTION_REGISTRATION.md](KNIGHT_EVOLUTION_REGISTRATION.md). Seven shared-scale poses now active for Knight L5+, with registered equipment bounds and L10 Evolved fallback. Lab permits L1–10. Automated/native checks pass; phone release gates remain OPEN. This supersedes the prior inactive-spike status. No main merge or production release.


## Beetank Evolved and academy floor — 2026-10-09

See [BEETANK_EVOLUTION_ARENA_PASS.md](BEETANK_EVOLUTION_ARENA_PASS.md) for assets, implementation, verification and open phone gates; [EVOLUTION_DESIGN_MAP.md](EVOLUTION_DESIGN_MAP.md) defines candidate directions for all ten. Knight + Beetank Evolved now select at L5+, with L10 fallback. Sunlit Lab gains authored ground, bounded physical rush wakes, level-aware MVP/captions and corrected Beetank facing. Base assets and combat rules are unchanged. Goose, then Sniper are next art priorities after pilot phone review. No main merge or production release.


## Goose Evolved and Verdant Ruins — 2026-10-11

See [GOOSE_EVOLUTION_VERDANT_PASS.md](GOOSE_EVOLUTION_VERDANT_PASS.md) for scope and validation. Three active Evolved pilots now include Goose, with seven registered poses and L10 fallback. Verdant gains a dedicated sunny skyline and honk gains a bounded grounded pressure wave with reduced-motion feather suppression. Automated and native render checks pass; exact-head phone gates remain OPEN. Sniper is next. This supersedes the previous two-pilot count. No main merge or production release.


## Sniper Evolved registration — 2026-10-11

See [SNIPER_EVOLUTION_REGISTRATION.md](SNIPER_EVOLUTION_REGISTRATION.md) for exact assets, targeted repair, shared anatomy calibration, registered feet and form-specific muzzle/body anchors. Four Evolved pilots (Knight, Beetank, Goose, Sniper) now select at L5+, with L10 fallback; 28 combat poses and 112 authored WebPs overall. Base sources, combat, stats, Mastery, evolution frequency and production remain unchanged. Automated/native checks pass; exact-head phone readability/FPS approval remains OPEN. Incoming Vercel deployment was READY, but live browser inspection was blocked by preview authentication and protected-fetch permissions. Crowd overlap remains visible in native composites. This supersedes the prior three-pilot count and Sniper-next status.


## Contact-aware staging and Verdant floor — 2026-10-11

See [CROWD_VERDANT_READABILITY_PASS.md](CROWD_VERDANT_READABILITY_PASS.md). Crowded ranks fan away from nearby opponents, and four bounded allied torso passes improve spacing inside the unchanged 56px/36px and 60-unit limits. Secondary per-unit labels are limited to small fights. Verdant gains a sunny moss/stone illustrated floor with one current image record and procedural fallback; academy art and live physical damage are retained. Actual seeded 1× before/after frames and four-arena native composites were inspected. Automated checks pass; larger melee overlap and exact-head phone motion/FPS approval remain OPEN. Approved Base/Evolved art, combat, progression, main and production are unchanged.


## Main release, effects hotfix and Dragon Evolved — 2026-10-11

The user authorised main merge of review head `303c51a`; PR #7 merged as `fb9f3c9` and Vercel production served its tested tree. A real public-browser smoke exposed last-fighter/final-KO caption shadowing, fixed on production in `ba58c3d` with a reproducing regression. Post-fix Lab termination passed without new application-origin errors. See [FX_CAPTION_HOTFIX.md](FX_CAPTION_HOTFIX.md).

Dragon Evolved is the next review checkpoint, based on the hotfix: seven registered poses, a repaired four-foot move, shared anatomy scale, full wing/horn/tail framing and mouth-aligned breath cues. Five packs / 35 Evolved combat poses / 120 authored WebPs now exist on the review branch. See [DRAGON_EVOLUTION_REGISTRATION.md](DRAGON_EVOLUTION_REGISTRATION.md). Approved Base files, combat and progression are unchanged. The new Dragon art is not released to main/production; new-head phone visual/FPS gates remain OPEN.


## Assassin Evolved — 2026-10-12

See [ASSASSIN_EVOLUTION_REGISTRATION.md](ASSASSIN_EVOLUTION_REGISTRATION.md). Seven registered combat poses plus a portrait preserve the hood, eyes, twin daggers and complete feet/coat tips. Two failed sheet poses are replaced with anatomy-calibrated move/attack repairs; dagger/body cues use existing effect contracts. Six packs / 42 Evolved combat poses / 128 authored WebPs now exist on the review branch. Asset decoding, actual pose/fallback rendering, six-pack equipment envelopes, eight duel/mixed-crowd arena composites and eight dense L5/L10 scenes pass, alongside deterministic and presentation regressions. Mixed melee overlap and exact-head phone motion/FPS remain OPEN. Base art, protected simulation, combat and progression are unchanged. Production remains `ba58c3d`; Dragon and Assassin are review-only. Mole, Turtle, Goblin and Barbarian remain, with Ultimate art absent.


## Five-level progression and Ultimate abilities — 2026-10-12

The user explicitly authorized a gameplay milestone and selected the L5 cap. See [FIVE_LEVEL_ULTIMATE_MILESTONE.md](FIVE_LEVEL_ULTIMATE_MILESTONE.md), which supersedes all earlier L1–4 / L5–9 / L10 form boundaries. L2 selects available Evolved art; L3 adds a restrained rim/ground accent. L4 unlocks a role-specific Ultimate ability, and L5 enhances it with a stronger accent; Ultimate art is still absent and falls back honestly to existing forms. HP and damage increase 40% multiplicatively at each upgrade. Mastery/base role stats, terminal safeguards and frozen roster remain. Both player and enemy drafts stop offering upgrades at L5; Lab/API/core inputs enforce the cap. Guide and authored reward previews describe actual abilities and pending art. Ability/progression/determinism/native effect checks are required alongside existing presentation regressions. Review-only; production remains `ba58c3d`. Balance and exact-head phone/FPS acceptance remain open.


## Mole Evolved — 2026-10-12

See [MOLE_EVOLUTION_REGISTRATION.md](MOLE_EVOLUTION_REGISTRATION.md). Seven shared-scale poses and a canonical preserve Mole’s face, three claws per hand, full feet and compact anatomy, with broad shovel claws and low bronze/leather shoulder protection. The first extra-claw sheet is excluded; the corrected sheet is registered at L2, with L3 accents and L4/L5 fallback while Ultimate art remains absent. Seven packs / 49 Evolved combat poses / 136 authored WebPs now exist. Mechanics from `624694a`, including Nuclear Carapace 35%/50% resistance, remain unchanged. Native/automated checks pass; mixed melee overlap and phone/FPS gates remain open. Vercel has not reported the mechanics preview, and an exact-SHA preview request returned a team-scope 403; no local Vercel CLI is available. Publish/verify GitHub and check new-head deployment status without retrying that unchanged blocked route. Production remains `ba58c3d`. Turtle, Goblin and Barbarian remain next; all Ultimate art is pending.


## Turtle Evolved — 2026-10-12

See [TURTLE_EVOLUTION_REGISTRATION.md](TURTLE_EVOLUTION_REGISTRATION.md). Raised hex shell ridge, thick stepped rim and seven registered poses preserve Turtle’s face, fists, leather equipment and three-toed feet. L2 art, L3 accent and L4/L5 fallback use the existing five-level contract; Ricochet Shell 30%/45% reflection and other mechanics are unchanged. Eight packs / 56 Evolved combat poses / 144 authored WebPs now exist. Native/automated checks pass; phone/FPS and mixed-melee overlap remain open. Mole checkpoint `7cb5732` was verified READY via automatic Git deployment, resolving the previously unreported mechanics preview. Main/production remain `ba58c3d`. Goblin/Barbarian Evolved and all Ultimate art remain. The user explicitly authorized regenerating Dragon Base next; preserve other Base art and Dragon Evolved.


## Dragon Base refresh — 2026-10-12

The user authorized regenerating Dragon Base only; see [DRAGON_BASE_REFRESH.md](DRAGON_BASE_REFRESH.md). Portrait and seven clean high-resolution poses preserve four feet, two wings/two head horns and one tail, with a repaired four-foot defeat. Optional Base registration preserves anatomy scale and mouth/ground anchors instead of fitting wings to a square. Other Base and Dragon Evolved assets remain unchanged. Native/automated checks pass; phone/FPS and mixed-melee overlap remain open. Next: Goblin and Barbarian Evolved, focused defect review, full QA and an authorized deployment. Dedicated Ultimate art remains pending.


## Completed Evolved roster and launch release · 2026-10-13 UTC

Dragon Base refresh is separately published at `463b203`. Goblin and Barbarian complete all ten L2 Evolved packs. Custom PWA/Apple/maskable icons, sunny home duel panel, live Ultimate/evolution Guide, defeated-species sizing and L5 introduction label are included. See `GOBLIN_BARBARIAN_EVOLUTION_RELEASE.md` for source contracts, QA and remaining phone/Ultimate-art gates. Main deployment is authorized by the user; physical-phone FPS/approval remains unverified.


### Oct 15 custom enemy chooser QA
- [x] Preserve ten roles, existing nested Lab screen and +1/−1 single adjustment.
- [x] Add reachable role-specific +5 control; exercise real event handler in Node.
- [x] Cap tests: 0→5, 58→60, 60→60; exact mixed custom enemy counts.
- [ ] New-head full GH Actions including portrait, offline rollback and 300 body stress must finish green.
- [ ] iPhone 14 Pro Max Safari device visual/tap review still open.


### Oct 15 — Assassin authentic Dragon-contact regression
- [x] Source A/B six seeded mirrored L1/L4/L5 Assassin-Dragon duels: baseline 0 actual hits; conditional contact restored real attacks, Dragon still won.
- [x] Source A/B 36 non-Dragon L1/L4/L5 solo duels bitwise-unchanged; Beetank/Turtle tank counters remain.
- [x] Seed/mirrored 20/40/80 group probes measured true attributed damage and persistent geographic fronts rather than proximity-only contacts; outcomes are censored.
- [ ] Complete *new-head* GitHub Actions including dedicated Dragon contact test and exact physical-state/300-offline/portrait gates.
- [ ] iPhone 14 Pro Max Safari real-device battle/readability and long completed matches; Chromium is only a proxy.


### October 15 — Assassin reaches Beetank and Turtle at true body contact
- [x] Candidate source A/B: six mirrored L1/L4/L5 solos per armored defender; baseline 0 hits, exact contact 35 total, heavy counters retain 12/12 wins.
- [x] Turtle L4/L5 reflection verified under direct melee; existing Dragon rule and other solo roles unaffected.
- [x] 24 heavy-army, 24 mixed-heavy matched cases measured hit damage and counters without fake zone counts; snapshot/terminal limitations recorded.
- [ ] New-head CI, dedicated source-state/counterplay, offline PWA rollback, uncapped 300, 430×932 DPR3 browser and all existing role tests.
- [ ] Actual iPhone Safari manual animation, visibility and performance confirmation; do not claim Chromium = real device.


### Oct 15 — Heavy-contact test runner discrepancy follow-up
- [x] Reproduce 4 pending→heavy victory cases at 80 bodies (L1 seed1337 both mirrors, L4 seed1337 nonmirror, L5 seed9917 mirror): all defender victories, no Assassin wins/reversals.
- [x] Refine permanent CI to reject established winner reversal and any Assassin-only victory against armored guard; permit only censored unresolved→defender terminal transition.
- [ ] Rerun full 35-job new-head matrix; preserve independent core PWA, Chrome, 300 and source attributable damage regression.


### Oct 15 — Thunder Honk L4/L5 real crowd-control and truthful guide
- [x] Long Assassin L4/L5 source-audit: 27/390 Execution triggers L4, 30/339 L5; no unsourced damage buffs.
- [x] Isolated source A/B L4 22→44 ticks and L5 32→64; keep 45/75% hit damage, .18/.22 area and L1–3 11-tick base honk.
- [x] 20/40/80 matched seeded/mirrored Goose melee/ranged/mixed source tests tracked true time spent stunned; ranged counters retained in sampled 20/40 bouts, 80 outcomes censored.
- [x] Changed Fighter Guide to actual game duration and preserved original Dragon 90-tick/1.5s Inferno explanation.
- [ ] New-head unit+dedicated Goose source-counterplay CI, 42 offline SHA pins, 430×932 DPR3 browser, 300-fighter throughput and source-attribution full run.
- [ ] Actual iPhone 14 Pro Max Safari performance/frame-readability and completed many-round win-rate study before production promotion.

- [x] Update legacy `check-turn3-consistency.cjs` duration assertions to **enforce new L4 44/L5 64 Goose Guide** (not delete timing checks).
- [ ] Complete all post-test-fix CI jobs including source-linked honk true-stun and duel QA.

- [x] Recover 305/305 true Goose honks including last partial snapshot using existing test-only forced state publish; no new game telemetry or skipped cue assertion.
- [ ] Verify full new-head GitHub QA run after both Guide and honk observation test fixes.


### Oct 15 — full terminal battle-quality / multi-front QA turn
- [x] A/B source variants (not shipped) tested against **full winners**, not only short censored frames: Barbarian contact, deploy spread, lane preference, secondary stagger, Goblin swarm penalty, Dragon splash. Reject variants that dilute independent 40-body damage fronts or produce little gain.
- [x] Current baseline: 16 genuine finished matches at 20 (25 real separated, 1 persistent, 1287 true hits), 16 finished at 40 (193 separated, 66 persistent, 3386 true hits). Source-attributed damage only; no fake distance/proximity front signal.
- [x] Add **read-only** `check-completed-match-quality.cjs`: exact uninstrumented trace parity, seeded/mirrored 32 terminal battles, HP-credited role mix, early/mid/late active windows, 25/50/75% survival, permanent conservative damage-front quality floor and JSON artifact.
- [ ] New independent `completed-match-quality-budget` CI and full existing portrait/300/offline/legacy + role counter suite completed green for exact HEAD.
- [ ] Improve genuine 20-body *persistent* simultaneous fights in next game turn; 1 persisted window in 16 games is a serious open design problem, not a sign-off.
- [ ] Physical iPhone 14 Pro Max Safari animation + frame pacing and user acceptance.


### Queued next gameplay turn — Assassin/Turtle L4/L5 tangible evolution value
- [ ] True Execution activations per physical backstab and pre-hit target HP bracket, normalized for each Assassin deployed and duration; completed L1/L4/L5 mirror/seed 20/40 and selected 80 battles, record marginal L4/L5 value.
- [ ] Targeted trigger/finisher/selection variants with evidence, preserving Beetank/Turtle tank counters, Sniper/Dragon tactical identity and real-battle persistence.
- [ ] Turtle-versus-Beetank complete tank utility comparison: real HP prevented, damage reflected to sourced attackers, ally survival, meaningful shell/bash disruptions, survival time, counter matchups. Count that value separate from attributable direct DPS.
- [ ] Implement bounded validated role improvement (not blanket DPS), with true event cue and dedicated permanent deterministic coverage.
- [ ] Full new-head branch CI 300 fighters + 430×932 DPR3 portrait + 42 pinned offline release and role-counter checks, QA only; physical iPhone Safari manual QA.


### Correct primary phone — iPhone 14 Pro Max
- [x] Authoritative device confirmed as **iPhone 14 Pro Max portrait**, 430×932 CSS pixels, DPR3, physical display 1290×2796. Existing Chromium viewport test geometry remains valid.
- [x] Browser emulation uses 430×932 ×3 and smaller-screen responsive checks remain secondary; dedicated `tools/qa/check-primary-device-contract.cjs` prevents wrong phone naming.
- [ ] Manual **iPhone 14 Pro Max Safari** validation of the actual PWA: Dynamic Island/header and home-indicator/footer safe areas, ability/touch hit targets, authored sprite clarity, 1× 20/40/80 and exceptional 300-fighter frame pacing, PWA install and offline behavior, thermal and memory stability.


### Oct 15/16 — Turtle L4/L5 legitimate melee retaliatory reach (QA)
- [x] Finished 16 mirrored seeded mixed/swarm/heavy/ranged 20-body and 16 40-body match A/B: old .09 → new .10 reflected real post-defense HP 139→177, 360→401; stable completed winners.
- [x] Protect real damage-connected multi-front persistence **20:1→1**, **40:66→66**; reject .105+ Turtle and L4/L5 Assassin blanket/conditional HP threshold increases that erase fragile 20 persistent multi-front window.
- [x] Existing L1–3, Turtle vs Beetank and Turtle vs Sniper counters and true anti-recursion, plus exact 20/40/80/120/300 no-Turtle state parity 1×/10×, permanent dedicated independent Actions/receipt.
- [x] Update truthful L4/L5 Guide text, root script cache bump, atomic 42 SHA256 SW pins and cache namespace.
- [ ] Full new-head runtime PWA/QA including new Turtle test, 430×932 DPR3 **iPhone 14 Pro Max** emulated portrait, 300 and role counter gates.
- [ ] **Still outstanding:** Assassin evolved Execution strategic payoff (high-threshold direct buffs were rejected), stronger Turtle ally/team utility vs Beetank, more sustained 20-body true fronts and actual iPhone 14 Pro Max Safari physical QA. Do not call these fixed.


### Oct 15/16 — Assassin L5 actual Execution payoff without multi-front degradation
- [x] Reject target bias and post-vanish broad Execution window: ineffective/erased real persistent fronts; reject L4 threshold upgrades for 20-body multi-front harm.
- [x] Isolate L5-only 55%→75% successful pre-hit backstab threshold (unchanged L4 40%; no L1–3 damage, power, base HP, knockback, speed or cooldown changes).
- [x] Source A/B 40 complete mirrored/seeded 20/40 matches (mixed/heavy/swarm/ranged/backline): no winner flips; real Execution 6→7/4→7, separated damage 30→30/226→226; persistence 1→1/75→75.
- [x] L1/L4/L5 solo source A/B versus Turtle/Beetank/Dragon/Knight/Sniper: L5 four mirrored heavy defender victories retained each, Sniper still countered; L1/L4 exact physical parity.
- [x] Dedicated `check-assassin-execution-payoff.cjs` real event, true HP damage, 1×/10× no-Assassin 80/120/300 source parity, actual 20/40 fronts and counterplay. Existing Ultimate unit thresholds now explicit.
- [ ] New-head all Actions, browser portrait 430×932 DPR3, offline SHA/rollback and role sample complete success; only then consider this QA branch green.
- [ ] Actual iPhone 14 Pro Max Safari readability/performance/thermal and more rigorous draft-evolution ROI.


### Oct 15/16 — Target retention independent holdout and normalized role-value QA
- [x] 40 completed 20-body calibration and separate **60 complete battle six-seed** holdout, five matchup mixes × mirrored sides; record independent positive HP damage-front persistence, winner changes and role damage, not proximity.
- [x] Correct lower-bounded nearest-scan pruning before accepting any discounted target score; reject fake gains caused by skipping legally better scores.
- [x] Reject blanket/nearby and bounded bruiser target stickiness: limited persistent-front improvements did not justify 9–12 changed winners in 60 games or mixed damage loss for Turtle/Goblin.
- [x] Existing 32-terminal `check-completed-match-quality.cjs` adds per-role original-deployment denominator and true attributed HP per deployed fighter, with finite/nonzero checks and original exact observer-vs-pure-state parity.
- [ ] Full exact new-head CI green with normalized receipts, 300 stress, rooted offline 42 SHA resources and 430×932 DPR3 Chromium portrait.
- [ ] Actual physical iPhone **14 Pro Max** Safari manually accepted.
- [ ] Future measured selective contact ownership for multiple genuine 20-body mid/late fronts; protect 40+ and weak-role utility.


### Oct 16 — 20-body survivor-adjusted real damage-front QA
- [x] All 32 matched 20-fighter forensic games actually terminate: 4 modes × 4 seeds × 2 mirrors. 4v4+ midfight opportunity distinguished from natural 1–2-enemy late attrition using *actual HP>0* living fighter counts.
- [x] Hit-grounded 90-tick retarget A/B across 30 completed 20 plus 30 40-body matches, with corrected nearest candidate admissibility. Reject variants which fail persistent damage-front gain and reduce low-damage role value; NO runtime changes.
- [x] Extend 32-term-match permanent test: per-RAF living blue/red, eligible 4v4+ vs lopsided ≤2 by 30-tick damage window, 1/6/1/2/5/6 phase snapshots, summary and no fictional front criteria. Preserve previous terminal, positive HP graph, role denominators and observer state parity.
- [ ] Full exact-head QA Actions and archived new phase receipt. Primary iPhone 14 Pro Max physical Safari still manual.



### Oct 16 — true melee contact and crossfire front diagnostic
- [x] Confirm complete-matches and living side eligibility; no fake front counts from target proximity or action intent.
- [x] Instrument actual attacker-to-target distance and primary-vs-secondary **positive HP damage** in QA only; preserve full deterministic state parity.
- [x] Synthetic fixture: true close melee fronts remain two while crossfire Dragon merges full attacker-target graph into one; all-zero events never count as battle.
- [x] 20 completed source samples: all-role 30 separated, direct-close melee 10, no hidden independent melee front swallowed by ranged links.
- [x] Reject phase-qualified +0.02/.035/.05 target-ownership and alternative slot geometry without stable contribution/persistence across fronts; no combat/runtime modifications.
- [ ] Full *new-head* CI including 32 finished 20/40 true-damage front/role QA, portrait iPhone 14 Pro Max CSS proxy, PWA SHA pins, and 300-body counterplay.
- [ ] Physical iPhone 14 Pro Max Safari device acceptance; do not claim Chromium = mobile FPS.


### Oct 16 — target pressure once per tick while preserving real fights
- [x] Reject early tactical lane interception, heavy-target reward and frontliner distribution source A/Bs that compromise role damage, winners or real persistent 40-body fronts; document denominator (16 fully terminal cases per population).
- [x] New real lazy target-pressure cache captures sequential nearest pressure, tracked per-unit target updates, death pruning, and match reset without stat/AI change.
- [x] Source A/B **44/44 exact full-state trace parity**: 32 fully completed 20/40 matches and 12 mirrored 80/120/300 1×/10× cases; keep true 20/40 multi-front floor, unchanged attacker damage and role contributions.
- [x] Root/core query `pressurecache1`, all 42 SHA-256 PWA resources repinned; no visuals/Ultimate changes.
- [ ] New head complete CI: direct cache parity job, prior pressure A/B research, local-front/lane, Assassin/Turtle counters, 300, browser PWA and atomic offline integrity all green.
- [ ] Physical iPhone **14 Pro Max** Safari 1× performance and actual multiple localized combat QA; Node benchmark ratios are *not* phone FPS.

- [x] Update old stress5c and two armored-Assassin contact CI comparators to the live pressure-cache source contract without removing baseline state/counterplay assertions.
- [ ] Verify fresh exact-head CI entire matrix after source-check maintenance; 42 SW pins unchanged since pressurecache1.


### Oct 16 — completed marginal evolution ROI evidence gate
- [x] 216 20/40 seeded/mirrored **terminal** tier-controlled Assassin/Turtle/Beetank battles, three opponent styles, both teams, L1/L4/L5; normalise damage by actually deployed role fighters.
- [x] Read-only positive HP sourced attacks, actual HP removed by Turtle Ricochet, shell reduction marked **pre-armor nominal** (not falsely actual HP saved), true Execution events, role survival exposure, real damage-connected front windows, actual winner.
- [x] Pure-versus-instrumented entire physical state SHA parity for Turtle swarm and Assassin ranged matches; reject non-terminal or missing role-ability cases.
- [ ] Exact-head GitHub CI success and archived JSON receipt for new `evolution-investment-value` job plus all previous 300/browser/counterplay suites.
- [ ] Select next evolutionary gameplay candidate based on ROI including strategic counters; preserve source-authentic fronts and avoid global numerical DPS equalization.
- [ ] Physical iPhone **14 Pro Max Safari** manual performance, touch and evolution visual acceptance.


### Evolution ROI nominated-unit attribution (Oct 16)
- [ ] 216 completed 20/40 real source battles, no censored samples, selected slot ID mapping consistent with blue-then-red and front-before-back deployment
- [ ] L1 nominated Turtle reflects **zero** HP, while separate allied L4 Turtles produce independently reported, positive, non-target same-role reflection; L4/L5 selected Turtle reflects actual HP
- [ ] Selected squad attribution applies to direct HP damage, shell nominal, Execution and alive unit-ticks, with exact deployment denominator (3/6), no other same-role ally contamination
- [ ] Instrumented vs uninstrumented exact frame-state SHA parity and exact-head green PR run; independent Actions receipt audited before balancing


### Turtle Guardian Shell prospective A/B, non-shipping CI
- [ ] Dedicated 48 full terminal matched source A/B covers mixed/swarm/ranged, both mirrors, L4/L5, 20/40, 2 fixed seeds
- [ ] Compare actual damage HP and genuine persistent independent damage fronts, winning sides, solo Turtle vs Beetank/Sniper/Assassin and exact no-evolved-guardian state parity
- [ ] Validate 80/120/300 real engine finite simulation, 1×/10×, no hard cap; iPhone 14 Pro Max physical Safari still manual
- [ ] Only after separate source evidence and current exact-head CI decide whether to ship a guarded, nonstacking protective Turtle niche; no covert DPS boosts


### Source-only Turtle Guardian actual savings and CPU acceptance
- [ ] All guardian events matched to the exact incoming defender/tick and post-dodge/remaining-HP capped hit; immediately realized prevented HP must be nonzero but never exceed nominal pre-dodge reduction
- [ ] Keep full-state observational parity, genuine counterplay and terminal wins/fronts; distinguish event-local HP saving from whole-match counterfactual
- [ ] Record balanced-order baseline vs guardian Node CPU median ratios with 5 repetitions at 120/300, 1×/10× before any runtime ship; real iPhone 14 Pro Max manual acceptance pending


### Turtle Guardian Shell runtime (QA only)
- [ ] L4 18% ally protection inside 0.12, L5 28% inside 0.14; only evolved living allied Turtle, not self
- [ ] Two Turtles and Knight Bastion never stack; strongest single protective effect applies; historical exact no-guard source comparisons and solo Beetank/Sniper/Assassin remain valid
- [ ] Full 48 terminal match source A/B, real reflected HP and locally saved HP distinguished from nominal, persistent independent real HP-damage fronts, exact source observer parity, 300 density at 1×/10×
- [ ] 42 pinned PWA runtime digests, new runtime/cache URLs, mint comic guardian cue and Guide descriptions; physical iPhone 14 Pro Max Safari UX/FPS/thermal manual gate OPEN


### Guardian Shell wounded ally guard (post full-unrestricted rejection)
- [ ] Real source limits Guardian to current defender pre-hit HP fraction <60%, no effect at >=60%, regardless of nearby evolved Turtle; L4=18%/0.12, L5=28%/0.14, never stacks with Bastion or other Turtles, no self-guard
- [ ] Standard 16 genuine 20/40 matches each: 20 real persistent fronts >=1, 40 >=40 with separated windows >=140 and all roles real HP damage; no relaxing original source gate
- [ ] In dedicated 48 completed Turtle evolution matches: L4 and L5 real win/fronts and immediate real prevented HP source, solo counter truths and deterministic parity
- [ ] Original Assassin L5 Execution and Turtle radius .09→.10 A/B tests reconstruct exact prior no-Guardian physics, while latest live Guardian is separately regression-tested; current 42 SHA-256 hashes and Safari manual acceptance


### Guardian wounded-ally independent holdout (Oct 16)
- [ ] 80 extra fully terminal A/B pairs across unseen seeds and no-Knight/armored-heavy lineups; each mode/tier has eight paired mirrors, with 20/40 populations
- [ ] Report real positive HP-damage fronts, wins, Turtle role HP and actual immediately saved HP; no weakening initial 48-case game outcome checks
- [ ] Verify exact-head 43-job GitHub Actions; production/main still untouched; manual iPhone 14 Pro Max Safari open


### Small-army target allocation pressure source study, rejection control
- [ ] 16 terminal 20-body source matches per candidate with genuine positive HP damage-connected front score, Knight/Goblin/Beetank/Turtle direct HP and winner flips
- [ ] 16 terminal 40-body matches per candidate with baseline-versus-tuned identical full RAF SHA trace; no hidden large-pop changes
- [ ] Candidate must NOT be shipped if it sacrifices viable roles, even when persistent fronts look numerically better; no proximity-only fight counting


### L4 Turtle evolutionary investment, independently held-out A/B
- [ ] Four L4-only source variants against current live rules, 104 genuinely terminal pairings each (standard 32, prespecified 24, unseen seed 24, no-Knight/armored 24)
- [ ] Genuine attacker-credited HP and separate actual immediate saved ally HP; role-normalized value, winner flips, Knight/Goblin damage, persistent independent true-damage fronts
- [ ] L5 solo Beetank/Sniper/Assassin full-frame state SHA unchanged for *all* L4-only variants and read-only physical observer parity
- [ ] No gameplay patch, hash/PWA changes or main/production touch until candidate is proven across held-out strategies and 300/iPhone 14 Pro Max budget

- [ ] L4 Ricochet's secondary `source:null` hits are physically attributed to the reflecting L4 Turtle and counted only after armour/shield/dodge/HP cap; actual reflection >0 and observed/unobserved SHA matches. Do not conflate with direct attack HP or artificially count reflected damage as independent offensive fronts.


### Turtle L4 long-form payoff study — accepted evidence, rejected proposed buffs
- [x] 520 truly completed matched source trials, actual post-armor/dodge/cap Ricochet HP separate from attacker-credited HP; L5 solo SHA and source observer parity, archived in Actions 38857552669
- [x] Guard20 worsens no-Knight/armored holdout wins 6→4 despite initial persistence benefit; Guard22 hurts several role-front measures; reflect35 increases true reflected HP but degrades persistence in prespecified/unseen seeds; radius13 worsens stress wins
- [x] Retain original L4 Turtle gameplay values; no hidden numeric adjustment or false 'balance pass'. Next design event-gated tactical shell counterplay with genuine winner, front, hero-role and population performance controls


### Source-only timed Turtle shell guard tactical hypothesis
- [ ] 4 ×104 fully terminal standard/prespecified/new-seed/stress comparisons; genuine nonstacking timed shell defensive response, not global passive percentage increase
- [ ] Actual post-hit saved/reflected/direct HP, original genuine independent active fronts, Beetank/Assassin and Knight/Goblin collateral, unchanged L5 solo hashes and physical source observer parity
- [ ] Do not ship until holdouts, 80/120/300 CPU and real iPhone 14 Pro Max Safari reviewed

- [ ] Count true injured-ally reactive shell starts independently; do not mistake existing shell animation for the new counterplay


### Turtle shell response selectivity — new source gating
- [x] First 416 true terminal baseline / natural shell / reactive 24% / reactive 30% comparisons passed, genuine actual trigger callback measured; broad reaction 40-pop fronts 58→52 and unseen wins 13→12, natural shell stress wins 6→4, so not shipped
- [ ] Same 416-case CI job now compares baseline, broad reactive24, gap-only reactive24 and gap+recovery-window reactive24; asserts actual selected Guardian initially stronger than Knight/Bastion and recovery cooldown>=16 where applicable; maintains L5 solo full physical SHA
- [ ] Never call source-only CPU or true-front metrics real iPhone 14 Pro Max Safari acceptance


### Assassin L4 Execution payoff — SOURCE ONLY
- [ ] Four true L4 pre-hit HP gate source variants (40%, 50%, 55%, 60%) × 104 genuine full-terminal matches with mirrored standard, distinct backline, swarm and heavy-counter holdouts
- [ ] Explicit true physical backstab / Execution callback conversion, real L4 attacker-attributed HP versus Beetank/Turtle/Sniper and general combat, role wins, Knight/Goblin contribution and authentic 20/40 persistent fronts
- [ ] Instrumented/raw full RAF parity, L5 Assassin unchanged solo-versus-Beetank/Turtle/Sniper/Dragon/Knight SHA, and 80/120/300 1×/10× no-Assassin full state unchanged
- [ ] Preserve primary iPhone 14 Pro Max Safari acceptance and choose gameplay change only after measured holdout counter health and device frame budget


### Assassin L4 execution source study — completed/rejected numerical thresholds
- [x] 416 genuine complete 20/40-body source games: 40% live vs 50/55/60% with unseen/armored holdouts, real L4 hits, true physical Execution/backstab callbacks, original HP-damage front graph and role counters
- [x] 5 L5 solo-counter full-frame SHA parity; 80/120/300 1x/10x no-Assassin parity; unchanged original live baseline 20/40 authentic front gates; export explicit rejection instead of aborting receipts
- [x] All 3 simple higher L4 gates REJECTED: first 24 actual L4 Execution procs 13→26/28/31, real HP damage +2.8–3.8%, no winner gain, standard 20 independent persistent fronts 1→0. Do not weaken gates.
- [ ] Diagnose exact L4 stalking/vanish/backstab/target-switch-to-unwounded loss under 20/40 physical full matches before an Assassin-specific pursuit/kill-confirm tactical candidate; validate role-counter and CPU invariants, physical iPhone 14 Pro Max Safari manual.


### Assassin L4 wounded-backline continuity (SOURCE ONLY, no buff shipping)
- [ ] 3×104 genuinely terminal baseline / 0.06 / 0.12 remembered wounded Sniper-or-Dragon physical target comparisons, including standard, prespecified, unseen, no-Knight/armored
- [ ] Measure target switches while original prey remains alive below 40% HP; stalking/vanish/backstab/disengage decisions, positive real Assassin HP on Sniper/Dragon vs Beetank/Turtle; true independent 20/40 HP-damaging fronts
- [ ] All L5 5 solo counters unchanged full frame SHA, no-L4 80/120/300 1× and 10× snapshots identical and read-only observer full RAF parity
- [ ] Never use `u.target` as persistent prey state without fixing existing core double-nearest, and never weaken authentic front thresholds to promote a source-only failed candidate


### L4 Assassin target continuity tested / rejected; last-mile reach diagnosis verified
- [x] Three ×104 genuine completed matched source simulations and physical observer SHA/L5 solo/80-300 no-L4 parity, separate true damage fronts
- [x] Candidate focus06/focus12 stop five lost wounded backlines (in 24 selected cases), but selected Assassin real HP falls by ~1.9%, backstabs 192→187, no win improvements; armored stress 20-fighter real persistent fronts 10→7 — REJECTED
- [x] 13,255 / 18,892 prespecified L4 decisions have ready attack but cannot reach target; measure is simulator decisions, not wall clock time. Source `step()` double-nearest persists, target lock not appropriate.
- [ ] Next L4-only short-range *movement* research when cooldown ready and backline target within final .30 arena units; no attack range/damage or armor changes, preserve 20/40 independent real HP-damage fronts and real counter/winner health, check 80/120/300 performance and iPhone 14 Pro Max manual QA


### Source-only Assassin L4 last-mile ready pursuit vs real backline
- [ ] 312 terminal A/B battles: L4 only attack-ready, real Sniper/Dragon target, beyond actual reach but within 0.30 arena; 1.45 baseline vs movement multipliers 1.65 and 1.85
- [ ] Source true damage/HP/fronts, first and unseen winner stability, remaining Beetank/Turtle counters, current 20/40 full independent-front parity, actual struck-backstab/Execution conversion
- [ ] Exact read-only observer RAF SHA, unchanged L5 1v1 vs five counter classes and unaffected 80/120/300 at 1× and 10×, plus evolved-L4 large-pop CPU acceptance before any runtime update


### L4 Assassin last-mile movement experiments — completed / rejected
- [x] 312 truly completed 20/40 matched source games with observed/raw SHA, unaffected five L5 solo counters and non-L4 80/120/300 1×/10× SHA, exact source CI 38957537337 dedicated study green
- [x] 1.65 gives selected Assassin +3.9% HP but loses wins 13→12, standard 20 persistent fronts 1→0, standard 40 fronts 58→34
- [x] 1.85 gives selected +12.5% HP but loses wins 13→12, standard 40 fronts 58→41 and separated HP windows 192→186; NO speed patch shipped
- [ ] Profile physical Assassin slotPoint destination distance vs actual melee reach, physical collision/separate() pushback and two different nearest() assignments in one tick; guard by real positive HP-damage fronts at 20/40 and high-pop 300 budget before another action change


### QA research cost governance
- [x] Five previously rejected source A/B studies moved unchanged to conditional combat-source/own-script push workflow; preserve fixtures/artefacts, do not weaken checks. Saves >1,664 completed terminal matches on routine docs/QA commits.
- [x] Original shipped-combat regressions, true HP fronts, active Assassin last-mile, primary iPhone 14 Pro Max 430×932 browser contract, 300 fighters, 42-PWA-digest integrity remain 43-job normal push/PR matrix.
- [ ] Verify exact-head GitHub push and PR with new archive registration; when real combat core changes require source archive success as well; physical Safari manual gate pending.


### Assassin L4 Shadow Mark (research only)
- [ ] Baseline + 25/40% one-use 120-tick real Sniper/Dragon marks from an actual L4 vanish, 312 real completed 20/40 matches
- [ ] Real other-ally direct-hit mark consumption, actual HP, front windows, original/new seed/armored/no-Knight winners, unaffected Beetank/Turtle counters
- [ ] Strict observed/raw RAF SHA, L5 five-solo counter SHA, no-L4 80/120/300 1×/10× SHA, no PWA or production change pending evidence


### L4 Assassin Shadow Mark — 312-match terminal result REJECTED
- [x] 3×104 matched real terminal source simulation study / L5 five solo SHA / no-L4 80/120/300 1×/10× SHA all pass (CI 117172081229)
- [x] Mark25 166 applications/78 consumed, mark40 165/78, **zero allied consumers**; only Assassin direct HP ↑, no selected or unseen wins ↑, baseline standard 20 true persistent fronts 1→0, real separated 40 windows ↓
- [x] Both Shadow Mark candidates intentionally NOT in runtime or Guide. Next: evaluate L3→L4 and L4→L5 **draft choice payoff** versus actual reinforcement/Beetank with real winners, defense/attack contribution, 20/40 authentic front and 300 performance gates; no synthetic medal for raw DPS


### Evolution milestone opportunity cost — actual current game outcomes
- [ ] 144 role×tier×swarm/ranged/armored×20/40×seed×side base fixtures, current unmodified simulator, three actions upgrade all role units vs +1 or +2 real reinforcements, 432 fully terminal genuine matches
- [ ] Compare actual draft choice winners, selected direct HP, physically reflected Ricochet HP, Guardian marginal HP saved beyond Knight after HP cap/dodge, positive HP-damage fronts and mode-specific counters
- [ ] Exact read-only observer/unedited RAF SHA; no new physics/ability/Guide/PWA assets until player-value and Safari 14 Pro Max gates and independent holdouts support a change


### Draft one-pick evolution opportunity cost (experimental source-real, NOT shipped)
- [ ] 96 mirrored selected cases ×4 held-roster/upgrade/recruit2/Beetank upgrade = 384 terminal battles; two selected families (Turtle, Assassin), L3→L4 & L4→L5, swarm/backline/armored, 20/40, two seeds, both sides
- [ ] 3/6 physical chosen copies and 1/2 existing Beetanks per side, 2 recruits increase global population to 22/42; do not claim exact random draft offer count
- [ ] Genuine wins, separately real physical direct HP, actual returned shell Ricochet damage, post-dodge/cap Guardian ally saving, Beetank HP, damage-positive independent fronts; strict observed/raw RAF hash parity
- [ ] Hold current real combat/evolution rules; if hard counters reveal underperforming choices, design a bounded tactical role mechanic and test it rather than generic percentage/attack-range buff. 80/120/300 game budget and physical iPhone 14 Pro Max Safari must precede any future gameplay release


### Evolution one-pick opportunity verdict (816 completed, QA only)
- [x] 432 full terminal family evolution L3→L4 / L4→L5 vs +1/+2 same family (Assassin/Turtle/Beetank); 384 full terminal same-team nominated family vs recruiting two vs evolving existing Beetank
- [x] Observer/raw full-RAF state parity; all nominated same-type physical IDs receive family-wide upgrades, guardian marginal HP above eligible Knight mitigation, actual Ricochet HP after armor/dodge/cap, true HP-damaging front graph, complete winner and 20/40 roster side/mode/seed pairing
- [x] Assassin L4 loses same-team comparative draft opportunity: own evolution 5 vs +2 6 vs Beetank evolution 8 winner counts; real persistent fronts 56 vs recruiting 68 vs Beetank 66. L5 delivers 10 vs 8 vs 9, retain valuable L5 identity.
- [x] Turtle protection is physically real (4,615 L4; 13,873 L5 HP per-event marginal saves) but extremes cause 8/24 wins irrespective of choice (8 swarm wins, 16 armor/backline losses). Find winnable borderline utility, not simple percentage buffs.
- [x] Source studies preserved conditionally on actual combat-source or own-study change in qa-research-archive workflow, 816 redundant normal CI matches removed. Existing original counter/front/300/PWA/browser regressions remain required.
- [ ] Design truly tier-4 Assassin backline threat-denial action and Turtle bounded ally-intervention; strict matched 20/40 physical fronts/winners and high-density CPU; physical iPhone 14 Pro Max Safari manual gate.


### Oct 16 — borderline L4 draft choices (source study)
- [ ] Exact-head Action: 768 discovery plus 128 unseen real terminal matches, 16 physical frame-hash parity pairs and actual physical HP/Guardian/reflection/damaging-front/direct-fatal-hit ID receipts
- [ ] Review unseen win flips vs recruit/Beetank and counter/front sustainability before prototyping L4 role-specific intervention
- [ ] Physical iPhone 14 Pro Max Safari acceptance remains OPEN


### Oct 16 — Completed borderline L4 choice study acceptance
- [x] 896/896 genuinely terminal matched source battles, 16/16 observed/raw per-RAF SHA parity pairs at QA `8bc4d21`, [push CI](https://github.com/danickman/ShowdownLab/actions/runs/38977768668) and [PR CI](https://github.com/danickman/ShowdownLab/actions/runs/38977772560) 44 required successes each
- [x] Held-out 4049/9091 seeded blue/red mirror Turtle L3→L4 win flips at 20 (hold 0/8, evolve 7/8) and 40 (hold 3/8, evolve 7/8). True Guardian/Ricochet physical HP measured; 20 front 7→3 warning preserved
- [x] Held-out Assassin L4 mixed outcome 20 3→1 wins, 40 2→4; Beetank 5/8 and 8/8, so investigate tactical backline shot denial rather than raw multiplier
- [ ] New exact-head 128-case *known* borderline CI regression plus 8 RAF parity controls; **pending** in current archive/refinement change
- [ ] Any proposed new backline threat denial must prove actual shot suppression and true 20/40 wins/fronts, L5 unchanged, 80/120/300 budget; physical iPhone 14 Pro Max Safari OPEN


### Oct 16 — Assassin real Sniper aim / Dragon windup overlap research
- [ ] Exact-head source-only CI: 180 fully terminal choice cases, 12 read-only full-RAF SHA parity pairs; aim/windup positive HP physical-ID backstabs distinguished from readiness/proximity
- [ ] Separate prespecified seed 9173 holdout; measure actual enemy shots and dragon breath events, real true damaging fronts and team wins without claiming blocked attacks
- [ ] Any proposed new anti-ranged interruption requires genuine source A/B actual denied shots, 20/40 counters/fronts and 80/120/300 performance plus iPhone 14 Pro Max Safari manual acceptance (OPEN)


### Oct 17 — First-to-L4/L5 transformational unlock game design acceptance
- [ ] First-to-tier source-real audit across 10 fighter families x L3->L4 and L4->L5 x 20/40, 1337/2017 mirror x hold/first L4/L5/peer L4/L5/foe x2 = 640 genuine terminal matches, plus 80 true severe 3-evolved-vs-15 exceptions, 24 exact RAF physics SHA parity pairs
- [ ] Directional design: first L4 should usually swing equal-force rounds (approximately 75%+) and first L5 stronger still (approximately 80%+), but retain countervailing peer evolutions, x2 family and overwhelming odds. These are initial design goals **not** unjustified CI fail floors; log each role, exceptions and genuine fronts.
- [ ] Re-evaluate prior Assassin and Turtle same-tier ROI research as **secondary**, since opposing L4s already present invalidates treating these as first-unlock tests; preserve complete battle quality and physical iPhone 14 Pro Max Safari release gates.


### Oct 17 — VERIFIED first L4/L5 transformational power spike
- [x] 720/720 real complete matches / 24 original-observer physical RAF SHA parity on exact QA `c703b91` ([push](https://github.com/danickman/ShowdownLab/actions/runs/39001984770), [PR](https://github.com/danickman/ShowdownLab/actions/runs/39001987803)), both 46 required successful
- [x] Baseline first unlock L4 64/80, L5 57/80; peer 40/80 both tiers; doubled enemy nominated family counter 52/80 and 49/80; 3 evolved vs 15 only 3/40 L4 and 1/40 L5. Treat mirrored small-N directional, not universal rates.
- [ ] New Goose Thunder echo and Barbarian Blood Cleave staggering sweep source-only 4-tier A/B, 20/40 and peer-/nominated-family double and 3-v-15 real terminal outcomes; 8 RAF source instrumentation SHA parity pairs. **Exact-head CI pending**; reject absent actual ability wins/role counters; no gameplay/pins/source modified.

### Oct 17 — verified Goose/Barbarian source-only signatures
- [x] fc86180 dedicated source job passed 480 real terminal matches, 8 raw/observer full-RAF SHA parity, 6 unaffected role SHA controls
- [x] Goose L5 unseen first-tier 5 -> 8/8 but real persistent fronts 12 -> 2 and separated physical-HP windows 99 -> 46; do not yet ship this particular fanout/stun duration
- [x] Barbarian L5 unseen 4 -> 6/8 first-tier wins, damaging fronts 20 -> 17 and separated windows 75 -> 69
- [x] Same-tier peer remains 16/32 either source; severe number counter 3-v-15 wins 0/16; enemy family double NOT whole army x2
- [ ] Retune Goose echo to balance exceptional power with independent simultaneous fights; whole-army x2 study, actual 80/120/300 CPU, real Safari and asset-integrity checks
- [ ] New exact-head archived/reduced CI workflow approval; no playable combat or production change


### Oct 17 — Source-only Goose L4/L5 narrower echo vs peer and full army ×2
- [ ] 408/408 genuine full terminal baseline/broad/trim Goose battles, 12 untouched/observed per-RAF SHA parity, 2 fresh held-out seeds 8303/10111, two populations, two tiers, both side mirrors
- [ ] Assert enemy **whole-army ×2** creates 10 vs 20 or 20 vs 40; separate family-only x2 and 3 evolved vs 15
- [ ] Preserve positive-HP genuine fronts, meaningful first L4/L5 signature spikes, peers/number counters and no global stun; performance 80/120/300 real frame budget and physical Safari 14 Pro Max remain OPEN. No live gameplay modifications.


### Oct 17 — Goose previous trimmed echo verdict and damage-led echo trial
- [x] Exact QA b36adbc dedicated job passed 408/408 terminal Goose original/broad/trim combat variants and 12 read-only per-RAF SHA controls
- [x] Fresh held-out first L5 current 3/8, broad 8/8, trim 5/8, positive-HP persistent independent fronts 10/3/2, separated damage windows 86/33/66. Trim remains too weak and suppressive to promote.
- [x] Full opposing army x2 won against ALL Goose sources in 16/16 held-out source tests, plus 3 evolved vs 15 legitimate counter
- [ ] New damage-led echo 4-tick secondary stagger test: 416 complete terminal variants (including 32 severe-number variants) +16 exact RAF parity; two fully new seeds 15013/19031, 20/40, tier peers, family x2 and true full-army x2. CI pending.
- [ ] Accept only actual L5 power spike plus credible peer/x2/true independent damaging fronts, then 80/120/300 and iPhone 14 Pro Max real Safari; no game/runtime edit yet.


### Oct 17 — Goose Impact Shockwave dense CPU/source safety
- [x] Source-only 416 true fully terminal impact A/B and 16 read-only exact-RAF physical state parity pairs at fb11a07 PR CI; held-out L5 first 3/8→8/8, true independent fronts 8→9 but separated windows 86→51
- [ ] New 80/120/300 actual fighter smoke, Goose-heavy mixed rosters, two seeds, original and Impact source, 16 1x/8 10x physical RAF frames each, finite HP/world excursion and Node CPU p50/p95, catastrophic >15x guard. CI pending.
- [ ] Actual mobile iPhone 14 Pro Max Safari viewport, browser sprite-heavy 300 population FPS, cache hashes/Guide effects and main/prod unchanged. No claim Node equals Safari.


### Oct 17 — Goose Impact original core authorized QA only
- [x] Source A/B 416 full terminal, 16 read-only full RAF parity; unseen first L5 3/8→8/8, authentic damage fronts 8→9; complete enemy army x2 and 3-v-15 can counter.
- [x] Synthetic Node CPU on true 80/120/300 population 1x/10x Impact near original, no non-finite physical state. 300 at 10x p95 ~340ms and not suitable as 60 FPS claim.
- [ ] Fresh exact-head actual `v3/ultimate-abilities.js` QA first-tier, Goose counterplay, SW SHA256 verify/atomic PWA update, effect preview and portrait browser. Updated index and SW pins with goosestun Impact URL gooseimpact1.
- [ ] Physical iPhone 14 Pro Max Safari, original main/prod unchanged, no deployment.


### Oct 17 — all-ten tier spike follow-on: Barbarian real wide Cleave
- [x] Exact live Goose Impact QA SHA 7c09cb3 49 required successful on push & PR; PWA hashes/Guide and historical source baselines reconciled.
- [ ] Source-only 408 fully terminal first-L4/L5 Barbarian current/wide/premium real battles, 12 observed vs original full-state RAF SHA; genuine post-cap physical HP on secondary hits, independent true fronts, 13007/16001 unseen seeds.
- [ ] Peer matching and **whole opposing army ×2**, not just same-family doubling, plus severe 3 evolved versus 15. Do NOT ship until new-head CI/80-120-300 density and real iPhone 14 Pro Max Safari visual acceptance.


### Oct 17 — Barbarian premium real source research accepted
- [x] 408/408 genuinely complete Barbarian L3→L4 and L4→L5 source match A/B, 12 instrumented/raw complete-frame SHA parity, QA 0ba5ef5 push/PR 50 required successful each.
- [x] Held-out premium L5 7/8 vs current 2/8 wins, real secondary HP 23,178.92 vs 9,102.36. Front persistence 14 vs 32; enemy full-army ×2 still wins 7/8, peer 4/8, 3-v-15 wins 0/8.
- [ ] 80/120/300 true fighters, current/premium CPU 1x/10x, 2 seeds, 6 SHA off-target no-Barbarian parity. Node synthetic frames are not Safari FPS. New exact-head CI pending; no live mechanics changes.


### Oct 17 — Premium Barbarian live QA (NOT main/prod)
- [x] Original-source 408 terminal A/B and 12 RAF parity proved L4 6/8, L5 7/8 unseen first-tier wins, meaningful peer and whole-army ×2 counter.
- [x] 80/120/300 synthetic Node source CPU cost comparable to former Barbarian (10× p95 premium/base .94–1.08), no state invalidity, six exact SHA off-target no-Barbarian controls; **300×10 CPU still severe**.
- [ ] Fresh `barbcleave1` playable QA v3 rules/effects specs, static unit splash QA, SW 42 pinned SHA/RUNTIME atomic cache, all-roster live first-tier regression and art/viewport. CI pending, physical Safari 14 Pro Max OPEN, no production deployment.


### Oct 17 — Premium Barbarian cross-ability regression discipline
- [ ] Exact-head updated Goose 20 full-RAF off-target parity comparing only old/new Honk on otherwise IDENTICAL current Premium Barbarian source
- [ ] Historical Assassin L5 strict fixed witness on frozen pre-premium Ultimate source and separately logged real current Premium-Barbarian cross-evolution 20/40 HP/front/winner effects (no hidden acceptance of collapsed fronts)
- [ ] Source first L4/L5 winners, actual multi-front ecology, 300 CPU 10x and physical iPhone 14 Pro Max Safari still separate gates; no main/prod merge.


### Oct 17 — post-Premium source-isolated Goose and Turtle research
- [ ] Goose current real physical stun/hit changes and ranged counters compared against **Goose-only historical honk on current Premium Barbarian**; no-Goose at 80/120/300 1×/10× must be bitwise identical
- [ ] Historical Turtle .09→.10 Ricochet original front/winner/reflect floors unchanged on frozen pre-premium sources, plus 32 true terminal modern Turtle cross-Premium diagnostics at 20/40 logged separately
- [ ] Modern actual independent-front metrics must be reviewed for meaningful lost simultaneous engagements before main/prod; iPhone 14 Pro Max Safari remains OPEN.


### Oct 17 — Beetank L5 first-evolution Seismic Overdrive source-only
- [x] Barbarian playable QA da87c14 exact-head CI: push 39065712821/PR 39065715932 51 required pass each and one intentional skip; PWA/genuine counter controls not shipped to main.
- [ ] Beetank L5 source trial 408 authentic terminal original/Shock/Quake matches in 20/40, both mirrors, new seed calibration 9821/11071 and held-out 14341/19121; peer tier, enemy family doubling, **entire enemy army ×2**, severe 3-v-15
- [ ] 12 real raw/instrumented whole RAF SHA parity, plus 16 original vs L5-only variants strict L4 whole-frame equality. Physical positive-HP secondary hits, independent fronts and counter-win evidence mandatory before any QA gameplay integration.
- [ ] 80/120/300 1x/10x actual physics/CPU, visual authored quake, real iPhone 14 Pro Max physical Safari remain OPEN.


### Oct 17 — Beetank Seismic verdict and contact-first Breach A/B
- [x] Exact QA `a4fcc35` push 39072663005 / PR 39072665731 succeeded; 408 full original/Shock/Quake terminal battles, 12 instrumented/raw full RAF SHA pairs, 16 strict L4 source parity; held-out first L5 win **4/8 for ALL 3 arms**, despite secondary actual HP 4,423/7,930/12,136. Do not ship rejected Shock/Quake as decisive.
- [ ] Source-only contact-first Breach and Overdrive: 204 authentic L5 terminal (20/40, blue/red, 2 training +2 unseen seeds), 12 exact instrumentation RAF SHA, 16 L4 strictly unchanged physical RAF SHA, real secondary HP/front/window receipts, same-tier L5, whole-army doubling, 3-v-15 exceptions. CI pending.
- [ ] If held-out wins actually improve, profile 80/120/300 mixed source-physics 1×/10× and true iPhone 14 Pro Max native Safari, visual treatment/pins/Guide before any playable QA promotion. Main/production unchanged.


### Oct 17 — Beetank Breach terminal verdict and Assassin L5 actual draft ROI
- [x] Beetank Breach dedicated job 39074483985 succeeded at QA a332e335; 204 complete source terminal, 12 whole-RAF observed/raw and 16 unchanged-L4 SHA. Held-out first-L5 current/Breach/Overdrive **8/8,4/8,7/8**; real secondary HP 5,103/10,723/14,814, authentic fronts 22/13/21; matched peer 4/8, whole opponent x2 defeated all, severe 3-v-15 defeated all. Reject both.
- [ ] Assassin L5 re-evaluate controlled one-pick ROI against hold/add 2 L4 copies/promote own existing Beetank, on **current live ultimates** vs archived frozen Goose source. 3 opponent styles ×20/40 × four seeds × two side mirrors =48 matched fixtures/192 terminal cases, 16 entire-RAF exact instrumentation parity pairs. Record physical-ID Execution procs, post-cap actual HP, true damaging fronts/windows, wins and beneficial/harmful winner flips. Diagnostic old 1337/2017 vs new holdout 33071/40151; new head CI pending.
- [ ] Physical iPhone 14 Pro Max native Safari, 80/120/300 perf remain OPEN; no Assassin live ability or main/prod modification.


### Oct 17 — source-only Beetank studies archived after failed held-out payoff
- Both completed but REJECTED historical A/B explorations retain their original executable checks, strict physical-winner/front contracts, 408 + 204 full terminal battle protocols, artifact receipts, and 12+16 RAF parity controls apiece. Moved their jobs from regular `qa-duels.yml` to `qa-research-archive.yml` with conditional **combat-source / own-script change** trigger and optional `workflow_dispatch` study selectors. Not deleted and no relaxed thresholds.
- Active live ten-role first-tier source regression, Goose/Barbarian performance, genuine damage fronts, PWA integrity, 300 bodies, UI/browser and new live Assassin L5 ROI remain in regular CI. This is only a CI workload isolation; it does **not** change any playable ability, renderer, PWA, main or production. Verify exact new-commit CI and retain physical iPhone 14 Pro Max manual gate.


### Oct 17 — Verified Assassin L5 live ROI and new gradient
- [x] Exact SHA a15e68e push 39074967092 **52 required jobs success**, 1 skipped; Assassin L5 live source 192 full terminal/16 raw observed RAF SHA. Same-roster heldout hold 8/24, Assassin L5 9/24, +2 recruits 8/24, Beetank L5 8/24, actual nominated positive HP 17,382→30,867, true persistent fronts 64→73, Execution 18→73. Strong first-L5 8/8 in OTHER first-unlock fairness source study does not automatically prove value in hard current draft fight. PR entire status read separately.
- [ ] Six 1/3/5 harder ranged/armored enemy team gradient, 20/40 bodies, 2 fresh calibration & 1 heldout seeds, both sides × 4 real choices = **288 genuine full terminal** and 16 complete-RAF parity. Classify win-discordant fixtures, protect real positive-HP fronts, count Execution, do not mistake proximity for damage. Exact-head CI pending.
- [ ] Physical iPhone 14 Pro Max Safari, 80/120/300 source and rendered frame budgets remain separate gates; no live change/main/prod.


### Oct 17 — Completed Assassin L5 difficulty gradient verdict
- [x] Exact `4964058a` [dedicated source job](https://github.com/danickman/ShowdownLab/actions/runs/39075871949/job/117522785413) passed **288 real complete terminal** live-source choices, 16 raw vs observer entire RAF SHA, 6 opponent compositions × 20/40 ×3 seeds × both team mirrors ×4 choices.
- [x] Fresh heldout 24 configurations: L4 hold **9**, Assassin L5 **15**, +2 L4 Assassin **9**, Beetank L5 **11** wins. Genuine independently damaging positive-HP fronts 73/83/78/75 and separate HP damage windows 203/257/245/221. Ranged 3 substitutions first L5 2/4 vs hold 0/4; armored 3 substitutions L5 3/4 vs hold 0/4. All win against 1 hard foe and all lose against 5 ranged foes. Preserve L5; no raw buffs required.
- [ ] Next source-only premium Mole L5 first-to-tier physics, true entire opposing army ×2 and 3-v-15 counters, 20/40, mirrored new holdout, 80/120/300 CPU and physical iPhone 14 Pro Max Safari. No main/prod.


### Oct 17 — Mole L5 eruption-only bounded fissure source experiment
- Earlier all-roster first L5 Mole won only 4/8 selected fair first-unlock fights. Separate accepted Assassin L5 borderline ROI remains intact (15/24 heldout vs hold 9/24), do not repeat its buffs.
- New `tools/qa/check-mole-l5-fissure-ab.cjs`: real physical burrow `erupt` triggers two source-only forward fissure candidates: Rift .25 length .075 half-width cap4 1.25 attack and 6-tick stagger; Fault .33/.095 cap5 1.75 attack and 8 ticks. No chain/global stun, L4 exact-RAF physical parity. True 20/40 mirrored first unlock, peer L5, family x2, full opposing army x2 and 3-v-15, **204 completed-match cases +12 observer parity +16 untouched L4 parity** expected, CI pending. Prespecified seeds 12721/17167 and untouched 23819/29837. Evaluate real winner changes, post-armor HP, separate damaging fronts; reject oversuppressive effects. No playable source/PWA/main/prod patch. [Decision](MOLE_L5_FISSURE_AB_2026-10-17.md).


### Oct 17 — rejected large Mole Fissure effects; conservative Shard/Twin A/B
Exact QA f96a686 push and PR workflows **passed** (54 green each, one skip), 204 actual Mole matches, 12 raw instrumented complete RAF SHA, 16 same-L4 complete RAF SHA. On unseen first-L5: current **3/8**, Rift **8/8**, Fault **8/8**; peer matched all 4/8, enemy whole army ×2 current 0/8, Rift 2/8, Fault 8/8, severe 3-v-15 current/Rift 0/4, Fault 3/4. First-to-L5 true positive-HP separate-window count: current **77**, Rift **39**, Fault **20**, persistent geographically genuine fronts **14→10→3**. Rift extra real HP 23,733.84 /347 hits; too much collateral. **Reject both candidates** as proposed despite win improvement, no live edit. [Exact decision](MOLE_L5_FISSURE_AB_2026-10-17.md).
- Next new [Shard/Twin physically restrained source experiment](MOLE_L5_LOW_COLLATERAL_2026-10-17.md) with cap 1/2, .60/.62 attack, 2/3 tick stagger, genuinely NEW 30469/45989 holdout, 204 terminal, 12 raw parity, 16 L4 full-RAF equality. Requires heldout wins AND fronts/counters. No deployment/main edits.


### Oct 17 Mole Twin bounded source choice and performance follow-up
- QA 556fec9 dedicated push job 117560468556 PASSED 204 actual source terminal matches, 12 read-only whole RAF SHA controls, 16 untouched L4 whole RAF SHA: first-L5 heldout current 2/8, Shard 4/8, Twin 8/8; peer 4/8, entire enemy team x2 0/8, severe 3-v-15 0/4. Selected physical secondary Twin HP 11,752.76 from 313 positive-HP hits. Genuine front persistence current 10 vs Twin 27, separate damaging windows 72 vs 62. Reject Fault and Shard as respective overly broad/underpowered candidates; retain Twin as leading SOURCE ONLY research, not yet playable.
- New 80/120/300 1x/10x Node original-vs-Twin 12 physical runs and 12 entire RAF no-L5 parity SHA test using new density seeds 37991/44033, source extraction from exact tested Twin body; CI pending. Native iPhone 14 Pro Max Safari manual OPEN, main and production untouched. See MOLE_L5_TWIN_DENSITY_2026-10-17.md.


### Oct 17 — Mole Twin promoted to PLAYABLE QA, pending exact-head CI
- At previous QA 08c795f2 both push/PR full suite GREEN, 56 successes +1 skip per run. Density Node 10x p95 current/Twin: 80 bodies 35.9–37.0/41.2–42.8ms, 120 67.7–68.6/70.8–72.0ms, 300 341.2–348.6/347.0–357.4ms. 12 non-L5 exact whole-RAF SHA, actual Twin activation at each density. These are NOT Safari FPS.
- Promoted exact source-proven L5 Twin from 204-terminal new-heldout A/B (first L5 8/8, matched peer 4/8, whole opponent army doubled 0/8, severe 3 vs 15 0/4, independent persistent HP fronts 10 to 27). Forward .20 arena / .060 halfwidth, cap 2, .62 attack, three simulation-tick stagger, only when physical burrow eruption strikes; original L4/L5 Nuclear Carapace reduction remains. Changes in v3/ultimate-abilities.js are strictly limited to accepted mechanic, truthful L5 Guide spec and cosmetic fissure cue. Grounded daylight two-branch fissure animation in v3/ultimate-effects.js, team direction/Guide strategy in v3/v3.js. PWA index and sw cache ID, module versions and 42 SHA256 entries updated atomically. Previous pre-Twin fixture frozen; historical studies remain independent and repeatable. New source-exact regression test + ultimate unit tests enforce bounded real victim behavior.
- No main or production change, and physical iPhone 14 Pro Max 430×932 DPR3 Safari visual/performance gate OPEN. Exact new QA CI must pass before claiming QA acceptance.


### Oct 18 — Mole Twin ground spectacle enlarged substantially, no mechanics change
- User reported the original Twin ground crack far too mild. Replaced tiny 2.05-fighter-size 360ms path with a 4.15-fighter-size 620ms animated wide dark trench, hot amber inner cracks, four side branches, seven flying stone fragments, three local dust puffs and expanding ground shock ring. Still anchored to the actually hit defender and attacking team forward axis; no fake HP or global camera flashes. On reduced/minimal tier, effect drops to 1.8x length and 300ms, base trench and ring only (no debris or side branches). New exact directional, stroke/fill complexity and density guard test, plus unique Ultimate life for fissure only. PWA HTML/SW renewed atomically with all 42 integrity hashes and moletheatre2 cache. Main/prod untouched; physical 14 Pro Max Safari visuals still require manual QA.


### Oct 18 — Goblin L5 power identity source-only first-unlock A/B
- User requested exciting Mole Twin ground crack plus continued Goblin development. Mole theatre committed on previous turn, pure render, independent.
- New source-only `tools/qa/check-goblin-l5-pack-first-unlock.cjs` evaluates **Hunt** (L5 stab +.58 multiplicative bonus per up to 2 OTHER Goblins targeting same physical defender within .16) vs **Fang** (L5 stab with 1 nearby friendly delivers one additional .80× attack on SAME still alive defender through protected secondary real physical-HP path). Existing L4 and other rules unchanged; live current-source ability is the A/B baseline. Prespecified training 11717/23771, unseen 30971/44831, blue/red mirrors, true 20/40 fighters and first-to-L5, matched peer, Goblin family x2, full opposing army x2, severe 3 L5 Goblins vs 15 mixed L4. **204 terminal source battles, 12 exact observed/raw entire-RAF SHA, 16 exact unchanged L4 whole-RAF SHA** expected. Look for wins AND physically separate damaging fronts, real HP, genuine counterplay. [Study](GOBLIN_L5_PACK_FIRST_UNLOCK_2026-10-18.md). New exact-head CI pending; nothing playable changed by Goblin study.


### Oct 18 — Goblin Double Fang promising but insufficient; source-only second A/B
- At first exact SHA 631e9bd dedicated [Goblin 204 terminal job](https://github.com/danickman/ShowdownLab/actions/runs/39096398729/job/117583831543) PASS 12 raw/observed and 16 exact unchanged L4 whole RAF. NEW heldout first L5: live 4/8, Pack Hunt 5/8, Double Fang 6/8; peer all 4/8, enemy Goblin family ×2 4/8 vs Fang 7/8; full enemy army ×2 0/8 for all; severe 3-v-15 0/4 all. True 1st L5 separated damaging fronts live 16, Hunt 11, Fang 19; separate damaging windows 69,72,68; Fang genuine positive secondary HP 499.44 over 29 hits. No game change; Hunt rejected, Fang partial improvement but not yet enough.
- New source-only `tools/qa/check-goblin-l5-fang-refinement.cjs` tests genuine same-target coordinated **Surge 1.20x extra, no stun** against **Pin 1.05x extra with 4-tick stun** on true still-alive stab victim with friendly within .16. Training 11717/23771, unseen fresh 50821/62951; first L5/peer L5/Goblin family double/ENTIRE enemy army double/3-v-15; 204 full terminal plus 12 observer RAF and 16 unchanged-L4 exact SHA checks. [Decision](GOBLIN_L5_FANG_REFINEMENT_2026-10-18.md); new CI pending. Keep main/prod and Goblin playable code unchanged.

### Oct 18 Goblin L5 heldout result and 0/2/4-tick isolated follow-up
- At SHA 59b48986 push 39096928102 / PR 39096930827 full 60 success +1 skipped each. Verified 204 full source terminals, 12 RAF observer SHA and 16 unchanged L4 SHA. Heldout live first L5 6/8, Surge 1.2× no stun 4/8 (reject), Pin 1.05× +4 tick stun 7/8. Equal L5 peer 4/8, enemy family x2 live 5/8 vs Pin 6/8, whole enemy army ×2 0/8 all, severe 3v15 0/4. Authentic first-L5 persistent HP damaging fronts live 13 vs Pin 18, separate positive HP windows 81 vs 63, so DO NOT ship Pin4 blindly.
- New tools/qa/check-goblin-l5-stagger-isolation.cjs compares identical same-target 1.05 secondary hit with zero/two/four tick stagger, never-before-seen 71569/87071 seeds and calibrated 11717/23771, 20/40 both team mirrors and counter modes, 272 real terminal, 16 raw/observer RAF and 24 unchanged L4 RAF parity. Source only; CI pending, physical iPhone 14 Pro Max Safari OPEN, no main/production modification. See docs/GOBLIN_L5_STAGGER_ISOLATION_2026-10-18.md.


## 2026-10-18 — fixed ten-turn release: Turn 1 — Goblin decision and cost guard

- **Ledger:** **1/10 completed** (Goblin decision and version-controlled cost guard); **2–10 remain**: (2) all-roster current-source L4/L5 ROI; (3) only material role balance fixes; (4) performance/targeting/population; (5) fairness/stability; (6) mobile UI; (7) graphics and Mole fissure spectacle; (8) arena/effects; (9) release candidate QA; (10) final gate/merge/single production deploy. This is the new fixed ten-turn release plan, distinct from historical turn numbers in this file.
- Verified exact pre-commit QA **`906145dfeb84072e1884910ed24eb521e2e61f0d`**, main **`0cb1a7db330017193d69d3ab63525ed9cdaca12e`**, PR #14 OPEN and mergeable. [QA push 39100316254](https://github.com/danickman/ShowdownLab/actions/runs/39100316254) succeeded; dedicated job **117595075533** log proves 272 real terminal stagger A/B, 16 raw/observer full-RAF parity pairs, and 24 exact unmodified L4 comparisons.
- Heldout 71569/87071, both mirrors, 20/40 bodies: first-to-L5 Goblin wins current **6/8**, dry **6/8**, Pin2 **6/8**, Pin4 **6/8**. Versus peer L5 **4/8 for all**. Opposing Goblin-family x2 baseline **5/8**, dry **3/8**, Pin2 **4/8**, Pin4 **3/8**. Whole opposing army doubled **0/8 all**, severe 3-v-15 **0/4 all**. Under first L5, persistent HP-damaging fronts baseline **21**, dry **23**, Pin2 **26**, Pin4 **17**; separated positive-HP damage windows **83/88/95/75** respectively. Dry/Pin2/Pin4 do land authentic added HP damage but produce **zero incremental heldout first-L5 wins** and weaken family-x2 counterplay. Training first-L5 wins 2/8 current, 5/8 dry, 4/8 Pin2, 6/8 Pin4: training improvement does NOT override heldout.
- **Decision: reject all three stagger/Fang variants; retain actual playable Goblin L5 Pack Ambush.** No gameplay/Ultimate ability/PWA/SHA-256 asset changes for this turn. Stop the Goblin experiment loop; move to all-ten L4/L5 consolidated ROI in Turn 2.
- **Cost guard:** `vercel.json` now requests `git.deploymentEnabled: {'*':false,'main':true}`. As documented by Vercel, any matching explicit true overrides false; thus QA and other previews should be skipped, while main remains enabled for the eventual single production release. Existing production assets remain untouched. This is a **repository-level safety gate**, not independently observed deployment behavior yet. Prior Vercel `previewDeploymentsDisabled:true` update was reportedly successful but cannot be read back through current get-project output. Direct PATCH to add a second ignored build step failed **403 scope unauthorized** on 18 October; no authenticated control-plane verification. Verify GitHub/Vercel deployment history after this QA push if access permits; do NOT infer a skipped deployment purely from missing API fields. Production and main are unchanged until Turn 10.
- **Tests:** dedicated stagger test passed at exact predecessor SHA, and current edit is JSON Git configuration/documentation only. Recheck HEAD, core status and deployment gate before Turn 2 source modifications. Actual physical iPhone 14 Pro Max Safari QA remains OPEN.


### 18 Oct Turn 3 Beetank Siege Breaker QA acceptance
- [x] Preintegration source QA: fresh heldout current L5 6/8 vs full contact 7/8; raw/observer 6 whole-RAF pairs; 16 strict untouched L4 and 16 unaffected role comparisons; 348 terminal matchup/severe cases. [A/B](BEETANK_SIEGE_BREAKER_2026-10-18.md)
- [x] Full enemy army doubled and severe 3-v-15 still counter L5, matched peer 4/8; post-cap horn HP and true separate fronts measured.
- [ ] Required exact **integration-head** CI: source, physical RAF, root manifest 42 SHA256 assets, service-worker release, 300 fighter performance; do not claim green early.
- [ ] Physical iPhone 14 Pro Max 430x932 DPR3: burst/rock legibility at 1x, cue aligned to real L5 contact, no crop, no FPS regression.


- [x] Source-real Siege diagnostics: full L5 contact breaks 20-body persistent independent HP front floor; anti-heavy-only correction restores 1 front, 40-body 56. Main release floor unchanged.
- [ ] Corrected four-arm true terminal first-L5 ROI, peer, recruits/alternative, enemy family and whole-army x2, severe 3v15 and raw/frame parity; exact-head full root release CI.


### Turn 3 FINAL acceptance (18 Oct)
- [x] QA `cca94d527a948e73846dd4a76adec251f85dce59` 13/13 required CI green; source 448 matched terminal/16 severe, 8 observed/raw full RAF parity and 24+24 L4/offtarget exact source controls.
- [x] Heavy-only L5 first heldout wins 7/8 vs baseline6/8, recruits5/8, allied Knight5/8, peer4/8; whole enemy army doubled0/8, severe3v15 0/4.
- [x] 20-body genuine persistent fronts remain 1, 40-body56; no quality threshold weakened. PWA 42 SHA256 pins/service-worker cache beetsiege2 checked.
- [ ] Real iPhone 14 Pro Max 430×932 DPR3 physical Safari, visual readability, FPS and thermal acceptance still open for Turn12.


### 18 Oct — Turn 4 Goblin decision (P2 gameplay quality open, not shipping unsafe candidate)
- [x] Two bounded actual full terminal candidate studies: each 448 matched +16 3v15, 8 observer/raw whole RAF pairs, 8 unchanged pre-L4 pairs and 4 raw replay pairs
- [x] Warband power-only rejected: L5 heldout 6→5/8 despite more HP
- [x] Rally cohesion rejected: L4 2→7/8 but L5 5→4/8, genuine persistent damaging fronts 24→8
- [x] Peer 4/8, whole enemy army x2 and severe 3v15 counter availability preserved under tested candidates
- [x] Exact PR 39154536877 13 CI required green, repaired browser-upgrade SHA/cache cleanup waits and passed
- [ ] Playable Goblin L4/L5 first-to-tier is still strategically modest; explicit future architecture redesign only, no more Turn 4 loops
- [ ] Native iPhone 14 Pro Max Safari acceptance remains physical-only gate, no production release


### 18 Oct — Turn 5 Barbarian Bloodstorm final QA source gate
- [x] Exactly bounded current / L5 collision contact / contact + 75-tick hit-started rage & every-third real-hit finisher comparative study
- [x] 336 actual terminal options +12 real 3 vs 15 matches, both team mirrors at 20/40, distinct unseen 78511/95261
- [x] Six full observer/raw RAF parity, sixteen unchanged L4 and sixteen unrelated-role full RAF parity, three exact repeats
- [x] L5 peer 4/8, whole-enemy army x2 0/8 and severe 3v15 0/4 in heldout; no recursion or global damage
- [x] **Rejected** trial because heldout first L5 stays 8/8 and actual independent battle fronts regress 13→8, windows 68→50
- [ ] Barbarian baseline varies materially between older heldout 3/8 and this new 8/8; address broad cross-seed fairness in Turn 6 without another multi-arm Barbarian loop
- [ ] Physical iPhone 14 Pro Max Safari visual/performance validation remains open


### 18 October — Turn 6 verified real Dragon L4 numerical-counter gate
- [x] 336 true terminal seven-draft-option matches plus 12 true 3-v-15, fresh calibration and unseen 20/40 red/blue mirrors
- [x] Strict raw/observed entire RAF 6 pairs, unchanged L5-vs-L5 without L4 opponents 16, L3 Dragon 16, Assassin L4 plus Turtle L4 32, repeated 3
- [x] Reject 4/6 victim cone caps as physically ineffective; no playable/PWA update
- [x] Confirm overdominance still 8/8 wins against **entire** doubled enemy army and 4/4 in severe 3v15, not just a family-only double
- [x] Preserve already verified Assassin L5 15/24 contested and Turtle reflected/saved HP versus Beetank assault roles
- [ ] OPEN: Dragon L4 source-specific burn/survival/counterplay explanation and mitigation if evidenced, to consider at release QA rather than unscheduled endless hypotheses
- [ ] Release physical iPhone Safari and genuine 80/120/300 device-performance checks still required


### Turn 7 — crowded engine and draft cap (pending exact head CI)
- [x] Audit existing x2 cap 120 projected entire battle and existing 100/119/120/180/300 offer checks, 1-round Jam/Thin expiry
- [x] Protect original collision pair order and axis-pruning; no speculative position rebalance
- [ ] Prove new allocation-free pressure-cached nearest exactly matches original full-RAF at 20/40/80/120/300 with 1× and 10× two mirrors and historical/current seeded lines (128 traces)
- [ ] Compare credible Node VM ABBA timing without representing as Safari FPS
- [ ] Full source CI regression true 20/40 independent damaging fronts, extreme 300, browser portrait and offline integrity on current QA SHA
- [ ] Native Safari performance on iPhone 14 Pro Max remains physical acceptance, not reachable from GitHub Actions
