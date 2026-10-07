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
