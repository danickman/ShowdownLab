# iPhone Safari feedback: round Quake cleanup and fighter body-size normalization

Quake marks/scars/effects no longer persist between successive rounds. On the first state of each new round or battle ID, reset transient FX and marks, defeated art, prior health snapshot, camera shake and brief story text *before* generating new battle effects. Normal within-round aftermath fades remain. The physics engine, damage, spells and deterministic RNG are untouched.

All ten authored species now enforce consistent combat-only maximum drawn body width/height relative to camera unit size, preserving smaller Goblin/Goose and intentionally large Beetank/Dragon forms. Pose drawing, cues and visual envelopes use the same derived scaling factor. Presentation/Guide images remain unchanged. The renderer uses no extra Canvas draws. The SW cache version, root SHA256, 2 runtime source SHA256 entries and script URL pins are updated atomically. Follow-up needs genuine portrait screenshots and physical Safari acceptance before release; no merge or deployment is authorized by this change.


## Release-gate QA harness version maintenance

PR #15's first run confirmed the new 43-entry SHA-256 release graph, but the historical Turn19 guard still checked the previous `/v3/v3.js?v=fast300-raster70-qa1` URL, and the live Chromium offline fixture opened the previous Cache Storage name. Those two out-of-date **tests**, not gameplay code, are updated to assert the new renderer URL and resolve the cache name directly from the versioned service worker. No combat, renderer, presentation, or offline runtime files change in this commit. Re-run complete PR checks on new exact HEAD.
