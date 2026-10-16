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
