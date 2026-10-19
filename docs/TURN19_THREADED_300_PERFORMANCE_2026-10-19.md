# Turn19: funded architectural 300-fighter frame P95 fix

Authorization October 19 Toronto. Original baseline unchanged; no main/prod/previews until Turn26. Source-only bitlane attempt f908460 ended slower and rejected. This is a new development turn, NOT a replay of #14/#15/#18.

Priority architecture: isolate full unmodified LegacySimCore simulation from the main thread at high density in a classic Worker (supported by Safari and same-origin offline pre-cache), keep authored fighters, actual full real physical combat, all 4 contact passes, target/damage/kill/tick order and 10x control. Reconcile adapter synchronous pause/speed/casts, genuine terminal, snapshots and fallback. Test full active 300 units at 430x932 DPR3 real Chromium requestAnimationFrame 1x/10x with matched alternation, full effects, adequate uncensored frame intervals and actual ongoing HP loss/ticks, 80/120 normal inline controls, source-exact physics identity, 42 pinned PWA digests and offline. Target >=40% repeatable improvement BOTH speeds. Measure physical iPhone 14 Pro Max Safari in #25 independently.

Until implemented and measured, this is **OPEN P1, NOT COMPLETED**. Next separate mandatory live positive-HP independent-front repair is #20. Barb #21–22; fairness #23–24; QA #25; only conditional release #26.
