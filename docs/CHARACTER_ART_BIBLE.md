# Showdown Lab — Character Art & Evolution Bible

Status: **DESIGN SOURCE OF TRUTH**

## Visual ethos

Original **comic-book battle laboratory**:
- chunky unmistakable silhouettes
- dark ink outlines
- faceted/cel-shaded color blocks
- expressive faces and posture
- oversized signature anatomy/equipment
- team ownership through accents, not full-body recoloring
- selective comic action typography
- evolution changes shape language, not only size/glow
- readable at roughly 40–60 px battle scale

The renderer may be geometry, hybrid or authored. The identity contract stays the same.

## Evolution contract

**L1–4 Base:** same identity, refined equipment, stronger accents, posture and modest scale.

**L5–9 Evolved:** meaningful silhouette transformation, secondary signature feature, stronger facets, upgraded action tell and ideally gameplay change.

**L10 Ultimate:** instantly recognizable even in silhouette; unique crown/crest/weapon/body architecture, special aura/rim treatment and upgraded signature ability. Never just “20% bigger.”

## Current 10

### Knight
Core read: heroic armored vanguard, shield first and sword second.
- Base: broad shoulders, large shield, visor, compact sword, forward brace.
- Evolved: taller angular shield, stronger pauldrons, longer energized sword, wedge-like charge.
- Ultimate: fortress knight; body-height shield, crown/crest helm, strong geometric charge wake. Reads as a mobile wall.

### Sniper
Core read: lean precision shooter dominated by rifle length.
- Base: narrow torso, long rifle, scope, planted aim.
- Evolved: heavier rifle, stabilizer/bipod geometry, stronger optics.
- Ultimate: extreme marksman; rifle dominates horizontal silhouette; luminous optic/rail; one decisive comic-panel shot.

### Goose
Core read: absurd confident menace, long neck and oversized beak.
- Base: white body, long neck, orange beak, manic eye, waddle.
- Evolved: crest/plumage, broader wing gestures, open-beak HONK.
- Ultimate: “war goose” while staying funny; feather crown and huge HONK lines. Never becomes generic bird.

### Dragon
Core read: low broad winged red heavy with long snout and dorsal spikes.
- Base: wide wings, horns, tail, red/orange facets, low center.
- Evolved: larger wings/spines/horns, angular head armor, expanded fire wind-up silhouette.
- Ultimate: dominant wingspan and crown-like horns/spines; biggest normal fighter-driven effect. Must never resemble Barbarian.

### Assassin
Core read: lean angular shadow fighter with blades.
- Base: narrow/tall, masked face, bright eye slit, twin blades.
- Evolved: asymmetric cloak/shadow geometry, longer blades, shoulder fins.
- Ultimate: near-black silhouette with bright eye/blade accents; multi-blade/split-cloak language; surgical teleport/backstab.

### Beetank
Core read: beetle + armored vehicle mass.
- Base: low carapace, oversized horn, broad stance.
- Evolved: more shell plates, forked ram geometry, heavier front.
- Ultimate: living battering ram; extreme horn and fortress carapace.

### Mole
Core read: squat digging ambusher with claws and nose.
- Base: broad low body, claws, nose, squint.
- Evolved: shovel claws, earth plates, stronger dirt trail.
- Ultimate: subterranean siege creature; giant plated claws and comic crater eruption.

### Turtle
Core read: defender first; shell dominates silhouette.
- Base: wide faceted shell, clear head/neck, short legs.
- Evolved: fortress shell ridges, thicker rim and frontal plate.
- Ultimate: walking bunker with battlement/crest shell geometry. Avoid blob/circle appearance.

### Goblin
Core read: tiny frantic knife fighter.
- Base: pointed ears, narrow body, squint/tooth, oversized knife.
- Evolved: sharper ears, paired/larger blades, stronger lean.
- Ultimate: hyper-kinetic rogue; blade fan/aggressive ear profile. Power comes from motion/swarm, not bulk.

### Barbarian
Core read: broad muscular axe bruiser, visually opposite Dragon.
- Base: huge shoulders, hair/brow, oversized axe, upright humanoid.
- Evolved: larger axe, wilder crest/hair, stronger shoulders, deeper rage posture.
- Ultimate: heroic berserker; massive axe arc and bright rage accents. Remains vertical humanoid; never gains wing-like geometry.

## Remaining 16 — first-pass visual targets

| Unit | Core silhouette | Evolution / ultimate direction |
|---|---|---|
| Snail | spiral armored shell + tiny front | artillery ports/ridges → mobile siege artillery |
| Engineer | compact builder + pack/tool | technical pack/deployables → command-engineer |
| TNT | explosive pack + sprint | fuse rig/blast shielding → demolition runner |
| Merlinor | staff + robe/arcane shape | growing runes/staff crown → radiant caster |
| Archer | bow arc dominates | stronger bow/quiver → exaggerated longbow/streaks |
| Spartan | shield + spear | crest/shield/spear grow → phalanx champion |
| Bloodvine | rooted plant + branching vines | thorns/blossoms grow → radial control form |
| Whelp | small agile winged dragonkin | sharper wings/tail → aerial skirmisher, never Dragon-heavy |
| Sixshoot | compact gunslinger + revolver | holster/cylinder emphasis → high-speed duelist |
| Parasite | hooked latching creature | tendrils/limbs grow → predatory drain form |
| Cowboy | hat + paired revolvers | coat/hat/guns exaggerate → classic showdown silhouette |
| Agent | clean tactical marksman | tech visor/modules → sleek adaptive form |
| Villain | durable humanoid + beam emitter | armor/emitter grow → heavy beam bruiser |
| Totem | stationary vertical support | stacked rings/icons/aura → battlefield shrine |
| Spider | low multi-leg scuttler | abdomen/legs grow → brood-mother, brood subordinate |
| Captain | hook/rope + command shape | hook/reel/coat grow → strongest hook/pull telegraph |

## Art-path alternatives

### A — Geometry-first
Pros: code-native, no asset pipeline, consistent scaling/team/evolution, easy procedural animation.
Cons: lower authored-detail ceiling.

### B — Hybrid — preferred experiment
Authored transparent body/portrait + procedural team accent, recoil, hit/death, motion lines, ability FX and evolution overlays.
Pros: quality jump while preserving renderer investment.
Cons: 26-unit consistency still needs disciplined art direction.

### C — Authored pose/sprite system
Pros: highest visual ceiling.
Cons: highest production cost and animation complexity.
Do not commit before a one-unit spike proves the workflow.

## Acceptance rule

Cover the fighter name and shrink to battlefield scale. A successful design still communicates:
1. who/what it is
2. broad role
3. current major action
4. base vs evolved/ultimate form
