# Turtle guardian candidate — source A/B research (NOT SHIPPED)

**October 16, 2026 · QA branch read-only prototype**

The corrected 216-match ROI study found Turtle L4/L5 actual reflected HP and defense, but only 11/24 → 11/24 → 13/24 winning teams at L1/L4/L5; Beetank L4/L5 still deals substantially more attacker-credited HP. Nominal shell reduction is not automatically HP prevented. The player needs a real tactical reason to choose Turtle, particularly against Beetank.

**Hypothesis:** Distinguish Turtle from Beetank by giving allies *nonstacking localized protective cover*, rather than just raw DPS. Prototype (source substitution inside standalone QA only) L4: living Turtle protects other nearby allies within 0.12 arena units from 18% incoming damage; L5 within 0.14 from 28%. The maximum nearby Knight Bastion or Turtle cover applies, never multiplying. Turtle does NOT protect itself via this new effect. In an eventual release, caching evolved protector references is required to avoid costly global scans.

Initial independent direct-source exploratory test (48 full paired matches, 24 per tier, three roster types, 20/40, two seeds, both mirrors): L4 wins 11→13, persistent authentic HP-damage fronts 113→110 and separated damage windows 310→314. L5 wins 13→14, genuine persistent fronts 100→112 and separated windows 300→329. L5 Turtle own actual HP damage fell in this sample, 13,126→11,791; team HP damage rose 102,235→103,798. Real winner flips, survival and ranged-counter tradeoffs warrant care. Estimated nominal protective reduction is NOT actual prevented HP.

Permanent `tools/qa/check-turtle-guardian-prototype.cjs` holds the proposal OUTSIDE the shipped engine, exercises real source A/B 48 terminal matches, source trace parity, solo Beetank/Sniper/Assassin unchanged, non-evolved exact parity and 80/120/300 state-only finite execution. Its independent Actions job archives the detailed receipt.

**Ship/no-ship gate:** Require full exact-head CI plus extended mirror/seed/population/role tests and a measured 300-body CPU cost before editing `legacy-sim-core.js`, `ultimate-abilities.js`, Guide, theatre or 42 PWA pins. If approved, update same-speed comparison, explicit user-visible Turtle ability text and an accessible shield cue; avoid replicating Knight's position or undermining Goblin/Knight role contributions. Real iPhone 14 Pro Max Safari manual acceptance remains open. Main and production untouched.
