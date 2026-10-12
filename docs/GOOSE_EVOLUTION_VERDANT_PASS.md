# Goose evolution and Verdant Ruins checkpoint

Goose joins Knight and Beetank as an active Evolved art pilot. L1–4 retain Base; L5–9 use Evolved, and L10 uses the best available Evolved art while Ultimate remains uncreated. Other seven fighters retain Base. No combat, stats, Mastery or evolution-frequency changes.

The seven poses preserve two wings, two feet, white feathers, orange bill/feet and one navy neck band with a brass buckle. Raised ruff and fuller tail distinguish the silhouette. Source alpha components use a common 0.4 extraction scale, a 164px body reference and 1.20 runtime scale. Feet are manually registered per pose, including prone defeat. Source facing is right. Preparation, component bounds and editorial QA are recorded in tools/art-spike/goose/evolved/manifest.json and tools/prep-evolved-goose.py. Manual scores are judgments, not automated measurements.

The runtime includes 21 registered Evolved combat poses across three fighters, eight assets per pack including presentation, and 104 authored WebPs overall. Guard/brace select Goose's guard artwork without changing simulation behavior.

Verdant Ruins has a dedicated sunny skyline: an ivy-covered broken arch, round garden tower and open lake valley. Full-width aspect-preserving framing retains the source landmarks and grounds the parapet against the floor. Five arena WebPs decode successfully. The academy illustrated floor and existing distinct procedural floors remain active.

Honk now draws a 420ms flattened pressure wave and small physical feather flecks, capped at 11 drawing primitives. Minimal and reduced-motion modes suppress feathers; reduced quality uses two. It adds no persistent particle queue, shadow blur or gameplay mutation. Signature onset effects now capture world coordinates and staging offsets so existing projection keeps their ground anchor stable through camera movement. Existing global effect limits remain in force.

Validation passed: 104 authored assets, five arena assets, evolution boundaries and all seven actual pose renders; 4110 envelope cases per pack; 20 skyline framing/fallback cases; 9540 staging bounds and 8220 camera bounds; bounded honk primitives, reduced-motion behavior and Canvas state; floor caching and density controls; ordinary/dense all-arena action cycles; deterministic 24 seeded matches, exception containment, RAF continuity and JavaScript parsing. Native contact sheets and eight-unit four-arena screenshots were visually inspected.

Native renders do not establish phone FPS or approval. Remaining review gates: exact-head phone testing for equipment/wing bounds, crowded combat readability, skyline framing, reduced-motion behavior and frame pacing. Existing bounded staging can still allow overlap during combat. Main and production are unchanged. Next art priority is Sniper Evolved.
