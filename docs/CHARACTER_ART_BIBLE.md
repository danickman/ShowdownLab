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

## Daylight environment direction — 2026-10-07

User-approved direction: **sunny daylight, bright outdoor arenas, warm material colour and clear atmospheric depth**. Discourage neon and dark scene themes. Team Blue/Red remain identification accents; spell energy is brief action feedback, not the environment palette.

Use a consistent upper-left daylight source, grounded contact shadows, restrained stone/earth/grass surfaces and quiet combat space. Avoid global dark vignettes, glowing skyline geometry, dense halftone wallpaper, overlapping floor washes and decorative shapes under fighters.

The first arena is now **Sunlit Lab**, replacing the user-facing Neon Lab name. Moon Vault retains its current name but uses pale stone in daylight; it is not a night scene.

Next authored-art pilot: one sunny environment-only Sunlit Lab backdrop, followed by in-engine review. Do not bake fighters, HUD, team colours, rings, shadows or combat effects into environment art. Approve one pilot before scaling.

## Evolution contract

**L1–4 Base:** same identity, refined equipment, stronger accents, posture and modest scale.

**L5–9 Evolved:** meaningful silhouette transformation, secondary signature feature, stronger facets, upgraded action tell and ideally gameplay change.

**L10 Ultimate:** instantly recognizable even in silhouette; unique crown/crest/weapon/body architecture, special aura/rim treatment and upgraded signature ability. Never just “20% bigger.”

## Current 10

### Knight
Core read: heroic armored vanguard, shield first and spear second.
- Base canonical v1: broad shoulders, compact angular shield, T-shaped visor, long spear, blue tabard, forward brace.
- Evolved: taller angular shield, stronger pauldrons, longer energized spear, more aggressive wedge-like charge.
- Ultimate: fortress knight; body-height shield, crown/crest helm, dominant spear architecture and strong geometric charge wake. Reads as a mobile wall.

Authored-pipeline rule: the canonical master is the design source of truth. Generate large pose changes one image at a time using the canonical Knight as the design/equipment reference and a separate pose reference when needed. Do not allow shield shape, spear count, armor proportions or tabard design to drift between poses.

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

### B — Hybrid — current leading path
Authored fighter key poses + procedural movement, team cues, recoil, camera response, hit flash, motion lines, ability FX and evolution overlays.
Pros: quality jump while preserving renderer investment.
Cons: 26-unit consistency still needs disciplined art direction.

The Knight spike has validated the generation method strongly enough to test in-engine: canonical-reference + pose-reference + one pose per generation. The remaining decision is whether it holds up at real iPhone battle scale and in motion.

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

## Visual north-star references

The two concept sheets supplied during Visuals 11 planning are the clearest expression of the intended **feel**:
- crisp faceted comic rendering
- extremely readable silhouettes
- oversized signature anatomy/equipment
- high-energy action typography
- arenas with unmistakable visual identity
- evolutions that visibly alter the fighter rather than only adding a badge
- battles staged like a moving comic panel

These are design references, not assets to reproduce literally. Future geometry, hybrid or authored art should be judged by whether it achieves the same readability, energy and hierarchy while remaining original.

Specific quality checks derived from the references:
- Knight must read by shield/helmet before color.
- Sniper must read by rifle length and planted aim line.
- Goose must remain comedic and unmistakable at tiny scale.
- Dragon must dominate horizontally through wings/head/tail and never resemble Barbarian.
- Assassin must be angular, dark and surgical rather than bulky.
- Beetank must read as low armored mass plus horn.
- Mole must read by claws/nose/earth action.
- Turtle must be shell-first and intentional, never blob-like.
- Goblin must read as tiny/kinetic with oversized blade/ears.
- Barbarian must dominate vertically as humanoid shoulders + axe.

If authored external art is explored, first compare one asset against the current geometry at **actual battle scale**, not only at card/portrait size.