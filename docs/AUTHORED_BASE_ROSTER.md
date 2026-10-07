# Authored Base Roster — Runtime Preparation

Status: **IN PROGRESS on `art-spike-knight-authored-v1`**. No production merge or deployment is approved.

## Scope

Base authored art is now frozen for the implemented 10-fighter roster:

- Knight
- Dragon
- Sniper
- Goose
- Assassin
- Beetank
- Mole
- Turtle
- Goblin
- Barbarian

The planned remaining 16 fighters are deliberately deprioritized. Art effort now goes to:
1. finishing Base runtime integration for these 10
2. Evolved forms for L5–9
3. Ultimate forms for L10
4. arenas, backgrounds, progression scenes and other presentation art

## Source-art status

Approved Base reference / production art exists for all 10.

Runtime preparation target per fighter:
- idle
- move
- attack
- guard / defensive
- signature
- hit
- defeat

Knight already has a verified seven-pose authored runtime pack.

For Assassin and Turtle, the approved sheet supplies a shared Hit/Defeat source rather than distinct final poses. During first-pass runtime integration, that approved source may temporarily back both `hit` and `defeat`. This is a known visual-quality debt, not a gameplay blocker.

## Runtime preparation contract

All runtime authored assets:
- true alpha, not green background
- green-spill reduced
- 96 × 96 transparent canvas
- common ground anchor
- lossless WebP
- one pose per file
- procedural renderer preserved as fallback
- no combat logic changes required

Expected path pattern:

`v3/assets/authored/<fighter>/<pose>.webp`

Pose names:
- `idle.webp`
- `move.webp`
- `attack.webp`
- `guard.webp`
- `signature.webp`
- `hit.webp`
- `defeat.webp`

Knight retains its existing `charge.webp` runtime naming until renderer normalization is completed deliberately.

## Performance constraint

Real-phone testing demonstrated that authored art works, but very high unit counts become slow around the Round 6 / ~180-unit range.

Therefore:
- keep runtime sprites lightweight
- retain the current spectacle-density/performance tier system
- do not add high-frame-count sprite animation yet
- authored key poses + code-driven motion remains the preferred pattern

## Build sequence

1. prepare and QA transparent runtime packs
2. commit packs to the isolated art branch
3. generalize the asset renderer from Knight-only to roster-aware authored rendering
4. preserve per-fighter procedural fallback
5. test the 10-fighter Base set on phone
6. fix scale / anchor / state-mapping defects only
7. freeze Base authored runtime contract
8. only then begin Evolved-form integration

## Explicit non-goals

- no merge to `main`
- no production deploy without explicit approval
- no remaining-16 roster expansion
- no combat rewrite
- no removal of `FighterArt`
- no high-frame-count animation system
- no Evolved / Ultimate runtime work until Base passes


## Turn 3 — roster-aware renderer checkpoint

Status: **IMPLEMENTED ON BRANCH; NOT DEPLOYED**

The authored renderer now recognizes all 10 implemented Base fighters and uses the same safe resolution pattern for both teams:

combat action → fighter-specific authored state → authored WebP → procedural `FighterArt` fallback on missing/not-ready asset.

The runtime switch is now roster-wide:

`showdownlab.art.base`

Visible test control:
- `BASE ART · AUTHORED LOADING`
- `BASE ART · AUTHORED READY`
- `BASE ART · ASSET ERROR`
- `BASE ART · PROCEDURAL`

Fighter-specific signature mappings include:
- Knight → charge
- Sniper → aim
- Goose → honk
- Dragon → fire wind-up / fire
- Assassin → vanish
- Beetank → ram / bulldoze
- Mole → dig / burrow / erupt
- Turtle → shell / shell roll / shell slam
- Goblin → rush
- Barbarian → rage states

The old Knight API names remain as compatibility aliases for the duration of the spike.

No combat-core code was changed.
No production deployment has been performed.


## Turn 4 — pre-deploy QA hardening

Status: **PASSED STATIC / LOCAL ASSET QA; NOT DEPLOYED**

Checks completed:
- all 63 newly prepared non-Knight WebPs opened and verified successfully with Pillow
- all 7 Knight runtime files expose valid RIFF/WEBP VP8X headers, and the Knight authored path was already proven on-device
- renderer syntax parses successfully
- renderer now handles adapter/core terminal `dead` as authored `defeat`
- renderer maps `stun` to authored `hit`
- renderer maps shared `reengage` recovery movement to authored `move`
- Dragon close-range `claw_swipe` and `guard_close` are explicitly mapped
- fighter-specific core actions are mapped to move / attack / guard / signature without changing combat logic
- authored draw exceptions are isolated and fall back to procedural art instead of breaking the render loop
- diagnostics expose per-fighter per-state loading / ready / error status
- the visible Base Art toggle always retains a procedural recovery path

Protected regression checks:
- `legacy-sim-core.js` still catches state-consumer exceptions
- the core frame loop still schedules the next RAF in `finally`
- `simulation-adapter.js` still isolates listener and CustomEvent dispatch exceptions
- `stage5b-ui.js` does not own or overwrite `#rosterContent`
- the authored-art renderer changes since the asset checkpoint are limited to `v3/asset-renderer.js`, the two HTML cache keys, and authored-art documentation

Next gate:
- branch deployment
- phone smoke test across several mixed-fighter battles
- visual scale / anchor corrections only


## Turn 6 — runtime visual normalization

Status: **IMPLEMENTED ON BRANCH; PHONE RECHECK NEXT**

Phone QA found three presentation issues:
- inconsistent relative fighter scale, especially heavy units receiving both camera-size and authored-scale amplification
- static-looking slow/rear-line fighters such as Turtle
- inconsistent outer-ink strength causing some fighters, especially Dragon, to read softer than Beetank

Corrections implemented:
- reduced authored scale multipliers for heavy fighters so camera class remains the primary size signal
- tightened the normal / small fighter multipliers for better roster consistency
- added subtle code-driven idle, guard, move and signature motion using existing frame time + unit id
- Turtle receives stronger low-amplitude idle/guard weight-shift so it no longer reads as a frozen cut-out during long defensive states
- added deterministic outer-silhouette ink to prepared runtime sprites
- rejected small disconnected sheet debris during prep while preserving materially-sized detached equipment
- cleaned Dragon pose-label remnants from the prepared runtime pack
- activated normalized authored pack cache key `base-pack2`

No combat state transitions, timings, targeting, damage, movement logic or protected core behavior changed.

Next QA:
- mixed-fighter phone battles
- verify heavy-vs-normal size balance
- verify Turtle/slow-fighter motion reads naturally
- compare Dragon / Goose / Goblin outline quality against Beetank
- verify no detached weapon was accidentally removed by cleanup


## Turn 8 — permanent authored UI + 1x default

Status: **IMPLEMENTED ON BRANCH; PHONE QA NEXT**

Changes:
- removed the procedural/authored art toggle and localStorage mode switch
- authored sprites are now the normal renderer path for all 10 implemented fighters
- procedural FighterArt remains only as a silent safety fallback if an authored asset is missing or fails to draw
- restored 1× as the default battle speed for Quick, Draft and normal rematches
- Ultimate Lab speed options are now 1× / 2× / 4× / 10× with 1× default
- added presentation-only per-fighter UI scaling for Draft, Ready, Upgrade Bay, Home and Results surfaces
- increased authored sprite size and contrast on fighter cards
- reduced the pale card overlay that was washing out Draft art
- enlarged Results / MVP presentation art

No combat rules, damage, targeting, movement physics, round rules or protected freeze fixes changed.

Next gate:
- phone QA for menu/card scale and contrast
- then renderer-side pose persistence so attacks/signatures/hits hold longer than move poses


## Turn 9 — combat pose persistence

Status: **IMPLEMENTED ON BRANCH; PHONE QA NEXT**

Renderer-only presentation changes:
- attack pose minimum visual hold: ~360 ms
- signature / charge pose minimum visual hold: ~520 ms
- hit pose minimum visual hold: ~340 ms
- guard pose receives a short stabilization hold
- move presentation is intentionally broken into move / settle pulses rather than displaying the move pose continuously
- heavy units use slower, lower-amplitude movement motion than light units
- attack gets a short forward lunge and settle
- signature gets a stronger anticipation / commitment transform
- hit gets a short recoil
- presentation-only pose memory is keyed by unit id and never changes simulation state

No combat timing, movement physics, damage, targeting, action selection, round flow or protected core behavior changed.

Next QA:
- confirm attacks are now easier to see than move cycles at 1×
- confirm signatures are clearly readable
- verify Turtle / Beetank feel heavy rather than jittery
- verify Sniper / Assassin do not look stuck on attack frames
- verify pose holds do not create obvious sliding while simulation movement continues


## Turn 10 — defeat-state recovery, first-load authored sync, Dragon emphasis

Status: **IMPLEMENTED ON BRANCH; PHONE QA NEXT**

Phone QA identified three defects:
- some units could inherit / retain the defeat pose across later rounds
- first screen paint could briefly show procedural art before authored assets finished loading
- Dragon still read too small and too softly outlined relative to Beetank and other heavy fighters

Corrections:
- defeat pose is no longer stored with an infinite visual hold
- any live non-defeat state immediately clears a stale defeat pose
- authored pose memory is explicitly reset when entering battle and at every round boundary
- authored assets now emit a ready event when each image finishes loading
- static UI canvases repaint when authored assets become ready
- while an authored asset is merely loading, the renderer does not substitute procedural art; procedural fallback is reserved for actual asset/draw failure
- Dragon battle scale increased and receives a dark silhouette underlay to strengthen its outer ink at mobile battle scale

No combat simulation behavior changed.
