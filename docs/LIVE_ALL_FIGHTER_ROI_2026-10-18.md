# Live all-ten L4/L5 draft ROI — 18 October 2026

Verified exact QA `789f6706b949df8f1c65adb54b41ca19ee3f1d7e` source with PR [39104433463](https://github.com/danickman/ShowdownLab/actions/runs/39104433463), consolidated ROI job 117607315871 **SUCCESS**. 2,440 complete terminal simulations; 40 raw/observed per-RAF physical-state SHA pairs; 20 deterministic repeats, no reported failure. 320 mirrored 20/40-fixture groups × seven real choices = 2,240, plus 80 genuine 3 evolved versus 15, plus 120 terminal replay/parity simulations. Node wall time 1,379,842 ms on CI; **NOT Safari FPS**.

Source SHA256: core `48dea363b585dfe709c5de6a75e486d7986860afd5f460dad4f31f640463c244`, Ultimates `53ec631bc06487abfac6d0402f6f7f41a84ccfa00efebbdb4ad99357814b68f8`, evolution `2eaefa95cd55ffd69903112dbe605fc047658a3b509a7e5e534f8e3a074ca614`.

Calibration seeds 11717/23771, *independent holdout* 71569/87071, red/blue, 20/40 bodies; each row tier comprises eight correlated physical battles. All un-upgraded baseline wins **4/8**. Columns are actual winners for first-tier upgrade, two additional same-role recruits, and other-family evolution; literal opposing entire-army double win counts separated by tier. Alternative family Beetank, except Knight for Beetank itself. **This is a controlled opportunity choice, not a universal draft-shop price model.**

| Fighter | L4 first | L5 first | L4 recruits | L5 recruits | L4 entire foe army x2 | L5 entire foe army x2 |
|---|---:|---:|---:|---:|---:|---:|
| knight | 8 | 6 | 4 | 5 | 0 | 0 |
| sniper | 8 | 7 | 7 | 6 | 3 | 2 |
| dragon | 8 | 8 | 8 | 7 | 8 | 4 |
| assassin | 8 | 8 | 6 | 8 | 0 | 0 |
| beetank | 8 | 6 | 4 | 4 | 0 | 0 |
| mole | 7 | 8 | 5 | 3 | 0 | 0 |
| turtle | 7 | 6 | 4 | 4 | 0 | 0 |
| goblin | 5 | 6 | 3 | 3 | 0 | 0 |
| barbarian | 3 | 3 | 3 | 4 | 0 | 0 |
| goose | 7 | 8 | 2 | 3 | 0 | 0 |

Critical unabridged values: L5 Beetank first **6/8**, +2 recruits **4/8**, evolve allied Knight **6/8**, peer **4/8**, doubled entire foe **0/8**, severe **0/4**. L5 Goblin first 6/8, recruits 3/8, alternative Beetank 2/8; L4 Goblin first 5/8. Barbarian L4 first 3/8 versus hold 4/8 and recruits/alternative 3/8; Barbarian L5 first **3/8**, hold 4/8, recruits/alternative both **4/8**; material negative draft ROI. L5 Goose first 8/8, peer 4/8 and enemy whole-army double 0/8. Dragon L4 first 8/8, enemy whole army double 8/8, severe 3-v-15 **4/4**: a concerning role-specific balance exception for Turn 6. L5 Dragon whole army doubled 4/8. Knight, Sniper, Assassin high first-tier win rates; preserve their tactical distinctions.

**Decision:** Turn 2 complete. No blanket buffs. Three user-funded specialized role turns: #3 Beetank L5 close contact / Siege Breaker, #4 Goblin Warband, #5 Barbarian Bloodstorm. Prior Beetank high raw splash rejected; test whether real collisions and sustained horn reach lead to winner flips before accepting a playable ability. Preserve all exact previous source physics for unrelated roles and lower levels, meaningful peer L5 and whole-army x2 counterplay, and geographically separated HP-damaging fronts. Code measurements and source-only A/B are not a playable feature.
