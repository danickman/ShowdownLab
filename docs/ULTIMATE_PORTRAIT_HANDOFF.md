# Ultimate portrait handoff

Updated: 2026-10-12 Toronto. Branch: `ultimate-portrait-polish`. Baseline main: `4d88372d3d02bde5c23c9aca74a48b80bf042934`.

Read `ULTIMATE_PORTRAIT_PLAN.md` first. User authorized execution, not only planning. Work priority: real Puppeteer opening-placement evidence → fix readability → Knight Ultimate pilot → ten Ultimate packs → bounded comic/arena/progression polish → regression/browser QA and release. Existing Base/Evolved packs are complete; all dedicated Ultimate assets initially absent.

## Current checkpoint

- Plan created; branch `ultimate-portrait-polish`, baseline main unchanged. No AGENTS.md.
- Real Puppeteer 25.13 + packaged Chromium 153 runs. Chrome direct download failed proxy; @sparticuz npm binary decompressed locally. Server must run INSIDE the browser harness because separate exec calls have isolated loopback namespaces.
- `tools/check-phone-browser.cjs` now serves local source itself, captures portrait DPR3 cold load/Home/Guide/Quick, five actual simulator fixtures at opening/.5/2/5sec, landscape smoke, errors and JSON screen envelopes. Invoke `NODE_PATH=/workspace/scratch/e3125c78ec81/browser-runtime/node_modules QA_BROWSER_PATH=/workspace/scratch/e3125c78ec81/browser-runtime/chromium QA_ENFORCE_OPENING=1 node tools/check-phone-browser.cjs local ../phone-after-placement`.
- Passed real browser: all five opening team-order/full-box containment gates, no page errors and no asset failures. Screenshots inspected. First baseline run exposed 20 legacy Knight/Dragon preload 404s and fixture-reset artifact; both fixed. Before receipt is a FAILED baseline, not release evidence.
- Camera now caps wide sprites more tightly and reserves full lateral staging only for converged combat anchors. No combat core changes. `check-combat-staging` (9540 bounds) and `check-presentation` (8220 bounds) PASS. Ordinary melee improves; extreme overlap remains inherent and needs further review.
- Knight Ultimate canonical + seven poses integrated, 168 authored decode PASS. `check-ultimate-packs.cjs` PASS: real decoded seven poses, L4/L5 boundaries, scale, mirrored cues and 822 bounds. Native sheet inspected. Knight attack repaired due original cropped tip; untouched sources kept. Generic `tools/prep-ultimate.py` uses explicit registration JSON and never invents QA scores.
- Dragon, Barbarian, Goblin, Beetank, Turtle, Mole Ultimate boards generated (sources currently in ../generated_images; copy and record prompts/registration before continuing). Dragon/Barbarian/Goblin sources already copied under tools/art-spike/<fighter>/ultimate. All have eight disconnected source silhouettes. Goblin attack hides empty hand and Dragon defeat needs a four-foot audit before approval. Sources are CANDIDATES, not active packs.
- Sniper, Assassin and Goose boards pending. Pipeline saves calls by one canonical + seven-pose board per fighter, targeted repairs only. Do not regenerate full approved boards casually.
- Existing Evolved checks/effects PASS before latest camera change; rerun affected bounds/Ultimate tests after final registrations. Dedicated synthetic Ultimate fallback check PASS. No deployment or remote checkpoint claimed yet.

## Resume instructions

Inspect git status and this checkpoint before doing anything. Run tests from repository root; native tests require `@napi-rs/canvas` (installed in primary runtime). Do not regenerate approved art or start a new hosting project. Existing production is https://showdownlab.vercel.app/ and repository is danickman/ShowdownLab. Update this file at each meaningful checkpoint with commands/results and commit receipts. Keep physical iPhone FPS/approval explicitly open until user/device evidence.

## Integration and polish checkpoint

All ten Ultimate packs integrated: 240 authored WebPs (10 fighters × 3 forms × 8 exports). 10 combined boards + 8 targeted corrections = 18 generation calls; no 80-image isolated generation sequence. Rejected variants are recorded in per-pack qa-review.json and never referenced by runtime. User identified extra Assassin blades and Goblin duplicate handedness; final accepted repairs use simpler open poses. Latest Dragon defeat has four visibly countable feet; five/three-foot attempts rejected.

Guide now compares L1/L2/L4 and describes actual five-level progression. Six arena treatments: original four plus Crystal Terrace and Solar Colosseum (reused/tinted panoramas + distinct cached floors; not falsely claimed new authored panoramas). L3/L5 role-color comic seals and short reward punch, heavier local Ultimate ink. No combat core/ability balancing or saved-progress changes.

Real browser captures all five formation fixtures with active Ultimate art and zero asset/page errors after Goose portrait recovery. The Goose portrait became a zero-byte file during export; processor now writes/decodes temporary portrait then atomically replaces it. Python/native/Chromium verification is required. Full Quick/Draft/Lab/spell/terminal browser run is being completed; do not claim it passed until receipt finishes. Desktop frame samples remain non-phone evidence.

Passed: 240 asset decode; 10 Ultimate pack actual drawing/scales/cues/8220 bounds; six-arena Ultimate native composites and 24/180 density effects; native five-tier effects; live Guide/PWA; 24 mixed-level seeded deterministic/terminal cases; Ultimate ability and synthetic future fallback; terminal caption regression; theatre/combat cues/defeated scale. Evolved/camera/staging/sky/floor suite is still running at this checkpoint.

Git CLI push cannot authenticate; GitHub connector write access verified. Publish exact changed blobs/tree/commit to the feature branch with the connector, then verify the remote tree. No main merge or new production deployment claimed yet.

## Final local verification

Full real Puppeteer run PASSED: five initial-order/containment fixtures, zero page/asset errors, cold Home/Guide, Quick, actual Draft two-card selection/deploy, Lab L4 reaching core, ARC visual effects, round terminal and landscape smoke. `docs/ULTIMATE_BROWSER_RECEIPT.json` records evidence. All Evolved bounds, camera/staging, sky/floor, ambient/reduced-motion checks passed. All 240 runtime and all source WebPs decode. Temporary Python bytecode and leftover export files excluded.

Performance change: per-form bounds cached; L3/L5 silhouette rims now cached role-color bitmaps instead of two live shadow-blurred sprite copies. Affected native tests and optimized real browser Quick/Draft/Lab flows PASSED. Software Chromium ordinary Dragon-pack median interval improved 116.6→66.7ms (~43%); 180-unit extreme remained ~550ms. These are slow software-host measurements, NOT iPhone FPS acceptance. Further extreme-density/phone profiling remains open; no core balancing changes made.

Publication is in progress through verified GitHub blob/tree/commit API. Record exact branch SHA and any deployment receipts when returned.


## Dragon clean-sprite hotfix — 2026-10-13

User reported procedural-looking shading/double edges across Dragon forms. Dragon now opts into `cleanSprite`: removed its enlarged black `inkBoost` silhouette, skips L3/L5 colored silhouette bitmap, and displays original canonical portraits without contrast/outline processing. Ground evolution seals, team rings, breath/ability effects and authored assets remain intact. Both HTML entry points version the renderer as `dragon-clean1`.

Validation: `node tools/check-dragon-clean-sprites.cjs` passes 145 render cases across L1–L5, seven poses, both facings, low/high density, and canonical portraits. Existing Dragon Base camera/cues 4,110 cases and Ultimate registration/bounds 8,220 cases pass. Real Puppeteer at 430×932 DPR3 passes cold loading, Guide, Dragon duel sequence, Quick/Draft/Lab/spell/terminal flows, landscape smoke, and no page/asset errors. Physical Safari/FPS acceptance remains open. No new art generated.
