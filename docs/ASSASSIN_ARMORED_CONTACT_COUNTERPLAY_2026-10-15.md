# Assassin physical contact versus Beetank and Turtle — measured QA correction

Date: **2026-10-15**; target: `qa-turn1-duel-baseline`; production/main unchanged.

## Why

Previous Dragon-only correction established the same original failure against the two armored defenders: for six mirrored solo duels against each at levels **L1/L4/L5**, Assassin delivered **0 positive-damage hits**, despite physically contacting the defender. Real role counterplay should come from Beetank armor, ram/horn stun and Turtle shell/reflective shield, **not an attack-access dead zone**.

## Candidate evaluation

Read-only, same seed/mirror source A/B tested conservative effective reach values (relative to the two fighters' exact untraversable standing separation):
- **+0.002:** 38 actual solo hits against both over 12 L1/L4/L5 mirrored fights. 
- **+0.000:** 35 actual solo hits; same armored winner in all 12. 
- **−0.002** or lower: returned to *zero* solo Assassin strikes despite both bodies touching, so rejected.
- Chosen **+0.000**, with no additional range padding. This is stricter than the existing +.002 Dragon access adjustment. All other enemy types retain original nominal range.

During L4/L5 Turtle solo fights, **Ricochet Shell reflected real HP damage** against the Assassin (eight distinct reflect-cue activations across eight L4/L5 mirrors in +.000 trial). Beetank/Turtle still won each sampled solo duel. No changes to Assassin damage coefficient, health, teleport distance, AI target priority, cooldown, dodge, armor, status or rendering.

Matched heavy-only squad source A/B across 24 configurations each:
- Ten-Assassin vs heavy/guard roster: actual Assassin-on-armored hits **18→742**, 0 sampled terminal-winner differences; Turtle reflects activate.
- Mixed assassin/armored roles versus heavy guard: actual hits **3→58**, 0 sampled terminal-winner differences.
- In 36 matched 20/40/80 trials without any Beetank/Turtle/Dragon, **exact complete final-state parity**.
These are sampled/censored trajectories, not a universal win-rate or full-time battle report. A separate broad roster trial can change some larger swarm outcomes; therefore counterplay and damage need monitoring after release.

## Implementation and gates

New core `assassinheavy1`: Dragon contact unchanged (+.002), Beetank and Turtle nominal attack condition extends *only* to the exact standing collision radius, and no other roles gain artificial distance. No changes to collider/separation/target location, RNG or direct attack damage. Root canonical version and SW 42 pinned SHA-256 resources refreshed.

New permanent `tools/qa/check-assassin-heavy-contact.cjs` records real positive damage and reflected HP, checks all 12 solo heavy fights preserve heavy winner, protects 30 non-heavy solo full state hashes, compares 20/40/80 mixed/armored swarms, and requires unchanged 80/120/300 **no-wide-target** full physical SHA traces at 1× and 10×. The previous `check-assassin-dragon-contact.cjs` now reconstructs the **prior Dragon-only release** as its historical comparator instead of falsely demanding pre-fix heavy-invulnerability; existing Dragon counter and exact-state assertions retained. Full CI, PWA rollback, 430×932 Chromium, and real iPhone Safari QA still required.

Do not treat contact restitution as proof of balanced swarm-vs-tank win rates. Subsequent work must measure completed-match counterplay at L4/L5, especially Turtle reflection/Assassin Execution and Beetank stun. No production deployment was authorized.
