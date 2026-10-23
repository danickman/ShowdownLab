# 300 true-combat Worker playable QA integration — 23 October 2026

**QA branch only. NOT released, no preview, no main merge or production deployment. Native physical iPhone 14 Pro Max Safari acceptance remains OPEN.**

Authoritative source-research [real Chromium run 39900025185](https://github.com/danickman/ShowdownLab/actions/runs/39900025185) verified all four same-host >=10s 300 full-authored-population + FX tests met >=20% RAF P95 improvement with >=95% real ticks/s: 1x 283.4->183.4ms and 266.7->183.2ms; 10x 616.6->300.1ms and 649.9->400.0ms. Same-source all-frame deterministic parity 10 population/speed +6 heldout complete; physical Worker sound with zero errors/rollbacks; 80/120 remained inline.

Real browser production-intended bridge test [39901169891](https://github.com/danickman/ShowdownLab/actions/runs/39901169891) additionally verified 300 pause held tick 49 unchanged, authentic speed10 then QUAKE emitted exactly one completed real event and damaged 89 enemies, Worker retired into 40-fighter original inline, browser without Worker fell back to original engine.

Playable integration changes: exact current-source target index + ordered-collision body in v3/legacy-sim-core.js with <160 old-path identity; main RAF-bounded classic Worker >=160 using same pinned modules; adapter once-only pending Worker spell event; 300-only 1x Canvas backing 0.70 CSS-pixels, 10x remains 0.85, <=159 retains DPR2. No skip/hide of bodies, spells, impacts, real physics ticks or animations. Cache release bump; worker script separately SHA256 pinned in the offline SHELL and integrity checked in atomic SW install. Root runtime grows 41->42 modules; 43 corresponding HTML+module SHA256 pins. Research test's frozen old source preserved separately to assert playable physics content provenance.

**Acceptance remaining:** exact-head root Node release-hash, offline rollback/worker corruption, existing browser density/role/touch/match checks; direct playable Worker lifecycle and 300 screenshot legibility. Native physical iPhone Safari 430x932 DPR3 acceptance of softness and responsiveness. No merge/deploy until explicit user authorization.

## 23 October — live QA integration gate corrected after exact-head CI

Commit `d64f27ed` integrated the version-pinned Worker into the actual QA root; its first exact-head pull-request run passed root release-integrity, SHA256, atomic offline rollback, existing 300 deterministic source and many other jobs. Its source-only **historical lifecycle harness** failed before reaching Chromium because it attempted to transform the *already transformed* playable `v3/legacy-sim-core.js` a second time (assertion on `unstick:0})}function formationEntries`). That is a **test harness drift**, not a measured runtime verdict.

The live lifecycle harness now verifies deployed optimized core against the frozen original and source builder, then launches root index.html without any source/adapter/Worker intercepts. It tests genuine 300 Worker, pause tick freeze, resume 10×, exactly-one actual Quake response, 40 inline retirement and browser-without-Worker fallback. Strict viewport and HP requirements retained. Do not claim lifecycle acceptance until exact-head GitHub Actions and real Chromium logs pass. No Vercel preview or production change.


### QA density test startup race at 180/300 isolated

After the first QA playable commit, density-browser saw an initial 180 attempt report 4 survivors rather than 180. The stress harness carried over the previous 120-fighter test's 10x speed into `startMatch` and only called `setSpeed(1)` after waiting for the asynchronous Worker deployment. The new Worker correctly advances authentic HP combat at the selected speed; therefore the 180 roster can die before the snapshot intended to assert all original fighters. Harness now selects 1x **before** calling `startMatch` for each density/cold 300 CDP profile, and reports phase, speed and Worker counters if it still cannot capture all deployed bodies. The 300 Worker/engine and playable speed semantics stay unchanged. Must reconfirm from real CI; do not excuse actual missing fighters.


### Second strict 180 initial-deployment test correction

The follow-up dense Chromium run still produced a false initial-roster failure after waiting 25 seconds at 1×, by which time the match had genuinely ended (`workerTicks:565`, 48 real Worker snapshots, zero Worker errors, phase `match_over`, four **living** rendered units). The test had been pausing *after* the wait and used an end-of-battle living-sprite count as if it were the initial deployed count. The harness now pauses immediately after starting the real Worker, before any wait, and only then samples the complete 180/300 original formation after the asynchronous snapshot. Exact counts remain required (no fighters hidden), and raw Worker/adapter diagnostic counts are recorded if this still fails. No simulated fighter, speed, raster, source hash or playable behavior changed.
