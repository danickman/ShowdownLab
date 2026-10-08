# Knight Evolved registration checkpoint

Branch pilot only. Knight uses Base at L1–4 and Evolved at L5–9. L10 temporarily keeps Evolved until Ultimate art exists. Other fighters remain Base. Mastery is independent. Lab starting-level controls now permit L1–10.

Seven battle poses use one source-pixel scale (.4), a shared 162.8px reference body height and per-pose registered foot anchors. Full connected-component extraction preserves spear/shield edges. The approved canonical is copied unchanged. Reproduce with `python tools/prep-evolved-knight.py`. Runtime metadata is generated into `v3/evolved-knight.js`; assets are in `v3/assets/authored/knight/evolved/`.

Renderer retains action holds and motion, keys pose memory by fighter/form and falls back to the corresponding Base pose if an Evolved asset fails. Camera/staging reserve the largest registered equipment envelope, including facing and recoil allowance. Both entry pages load metadata before renderer and refresh affected cache references.

Validation: 88 authored WebPs decode; 4,110 Evolved camera/staging envelope cases, 9,540 existing staging cases and 8,220 existing camera cases pass. Native seven-pose Base/Evolved contact sheet reviewed for stable body scale, complete equipment and grounded feet. 24 seeded matches remain terminal/deterministic; listener exception and RAF safeguards pass. Stage cache, combat cues and skyline framing checks pass.

Open: iPhone pose/readability, crowded fight contact fidelity and performance review; evolution progression design and Ultimate assets. This does not approve a release. Legacy simulation, adapter, rewards, Mastery, EVOLVE frequency, roster ownership and production are unchanged.
