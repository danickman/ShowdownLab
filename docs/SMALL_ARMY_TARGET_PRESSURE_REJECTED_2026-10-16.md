# Small-army target pressure allocation — rejected source variants

**October 16, 2026 · QA-only read-only study · iPhone 14 Pro Max primary**

Despite improvements to contact and defensive utility, the permanent standard 16-case 20-fighter mix still has only **1 genuinely persisted independent HP-damaging front window**. Increasing nearest-enemy target pressure for small armies was studied as a more organic alternative to forced lanes or moving sprites for appearances.

The actual `nearest()` score applies `Math.max(0,pressure-2)*.035`. Source-only candidates used `max(0,pressure-1)*.015` **only at 20 fighters**: once for all roles, and once only for Turtle. All 20/40 runs retain actual seeded formations, role/level allocations, real physical `hurt()` HP, and terminal winning sides. At 40 fighters, candidate full-state SHA on *every RAF* must match the baseline.

Exploratory source evaluation on 16 genuine 20-fighter matches with fixed seeds 1337/9917, four compositions, two mirrors:

| Metric | Untouched baseline | All-role pressure candidate | Turtle-only pressure candidate |
|---|---:|---:|---:|
| Real persistent independent fronts | 1 | 6 | 2 |
| Geographically separated real-damage windows | 25 | 22 | 26 |
| Winners flipped from baseline | 0 | 2 | 2 |
| Actual credited Goblin HP | 1,243 | 1,106 | 1,393 |
| Actual credited Knight HP | 3,667 | 3,179 | 4,529 |

All-role tuning increased some multi-front persistence but **reduced Goblin HP by ~11% and Knight HP by ~13%**, while flipping two real match winners. Turtle-only tuning preserved more Goblin/Knight source HP but produced a single additional persistent front and still flipped two winners. These changes do **not** justify destabilizing tactical counters or draft value for a small selected-sample visual gain. Other tested variants (higher penalty, starting pressure at zero, heavy-only, ranged-only) also failed to clear the role/strategy tradeoff.

**Decision:** REJECT; nothing changed in combat, PWA, art or renderer. New independent `check-small-army-pressure-study.cjs` and Action job permanently records the two representative alternatives, real HP roles, terminal winners, source-trace parity and 40-body stat neutrality. Future proposals must solve the actual damage-connected battle geometry while keeping role contribution and long-term simulator limits. Real iPhone 14 Pro Max Safari still unverified.
