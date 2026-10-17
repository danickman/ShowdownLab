# Barbarian Blood Cleave — first L4/L5 real counter A/B

17 October 2026. Source-only follow-on to the accepted all-ten first-evolution study. This does NOT edit playable abilities.

User intent: first L4 or L5 should usually turn a fair round decisively, countered by a peer evolution, true whole-army ×2, severe numerical disadvantage, or extreme composition. The verified prior first-tier sample (8 small mirrored cases per tier) had Barbarian 4/8 first-L4, 4/8 first-L5 wins. The previous wide Blood Cleave source-only trial on another held-out seed improved first L5 to 6/8 with moderately reduced persistent damage fronts (20→17), but lacked whole-army doubling and real secondary-HP attribution.

Three same-core genuine battle sources: current narrow Cleave; prior wide Cleave (L4 radius .135 cap3 58% attack splash, stagger 8 ticks; L5 radius .18 cap5 85% attack, stagger 14 ticks); and an L5-focused premium variant (same L4, L5 radius .205 cap5 100% attack, stagger 12 ticks). Deterministic closest-first by real position and fighter ID, no global crowd debuff, no ability at L1–L3 and no changes to another role.

At 20 and 40 initial fighters, two milestone tiers, seeds 8111/10103 prespecified and 13007/16001 held out, both player sides: compare first evolution to previous tier, peer tier matching, opposing Barbarian FAMILY copies doubling, and **the entire opposing army doubling**. Exactly 32 fixtures × four strategies × three sources =384 genuinely terminal games, plus eight numerical exceptions × three sources =24 (3 evolved Barbarians versus 15 opponent fighters). Total **408 true terminal source games**; **12 exact raw/observer whole RAF physics SHA pairs**. Actual physical HP on capped, resolved secondary hits, per-side winners, distinct geographically independent positive-HP damage fronts and actual separated HP-damage windows are reported. Not merely opportunities or animation intents.

Source comparison is directional on small correlated matched seeds; do not falsely promise automatic victories. A viable candidate must increase first L5's fair advantage and make signature attacks visibly impactful **without invalidating peer tier and whole-army ×2**, destroying independent fights, or producing dangerous 80/120/300 crowd CPU cost. Physical iPhone 14 Pro Max Safari 430×932 DPR3 remains open.

New exact-head CI pending. No gameplay, effects, renderer, hashes, main or production changes.
## Verified first-tier A/B and dense-population CPU follow-up

Study at QA `0ba5ef5b32928f114d64871a310698c75e08900d` completed 408 genuine terminal matches and 12 observed/raw full physical frame parity pairs. [Push Actions](https://github.com/danickman/ShowdownLab/actions/runs/39058215766) and [PR Actions](https://github.com/danickman/ShowdownLab/actions/runs/39058218964) both **50 required jobs passed**, one intentionally skipped.

| Held-out first unlock | Current | Wide | Premium |
|---|---:|---:|---:|
| L4 wins | 3/8 | **6/8** | **6/8** |
| L5 wins | 2/8 | 5/8 | **7/8** |
| L5 physical secondary HP | 9,102.36 | 19,909.18 | 23,178.92 |
| L5 true persistent positive-HP fronts | 32 | 17 | 14 |
| L5 independent HP-damage windows | 80 | 64 | 74 |

Peer evolution maintains 4/8 wins on held-out L4 and L5; whole opposing army ×2 leaves premium evolved player at 0/8 L4 and **1/8 L5**, so numerical counterplay still dominates, but this exceptional win deserves its own replay. All eight severe 3 Barbarian versus 15 enemies exceptions still lose. The candidate is legitimately dramatic, not a flat percentage stat increase. More damage may shorten battles and reduce time for simultaneous fronts; both winners and authentic HP damaging front persistence must be reviewed.

Next source-only trial `tools/qa/check-barbarian-premium-density.cjs`: current vs premium at 80/120/300 fighters, Blue Barbarian L5 vs Red L4 with 26% Barbarian each, two seeds, 1× 16 and 10× 8 synthetic source RAF frames, finite positional/HP and unit count checks, CPU percentiles and 6 full physical frame-SHA **off-target** parity pairs without Barbarian. No iPhone browser GPU performance claim or runtime patch. New exact-head CI pending.

### Oct 17 — QA playable Barbarian L4/L5 Premium Blood Cleave, NOT production
- Source-only A/B at `0ba5ef5` was fully green 50 required push and PR; 408 true terminal matches, 12 exact raw/observed RAF hashes. Unseen first unlock L4 current 3/8 vs premium 6/8; L5 current 2/8 vs premium 7/8; real secondary HP 9,102→23,179, persistent fronts 32→14, separated HP windows 80→74. Peer L5 4/8, whole enemy-army ×2 still wins 7/8, severe 3-v-15 loses all.
- Barbarian CPU at `6ebbdf9` dedicated push job PASSED actual 80/120/300 1x/10x vs current, premium p95 10× ratio 0.94–1.08, no nonfinite physical states, six no-Barbarian raw-RAF SHA pairs. At 300×10 the existing overall simulation p95 is **332–354 ms** in Node, NOT smooth Safari. Manual iPhone 14 Pro Max Safari 430×932 DPR3 still OPEN.
- Promoted the measured .135/.205 radius, 3/5-target, 58%/100%-attack, 8/12-tick stagger Blood Cleave into current QA `v3/ultimate-abilities.js`; stylized wider L5 slash in `v3/ultimate-effects.js` with reduced-motion suppression, updated ability specs/Guide, atomically renewed root index/SW two module digests with `barbcleave1` cache name (42 hash pins). Frozen exact pre-premium source for accepted 408 battle research and density comparisons. **This is QA source only, CI pending, no main/production deployment.**
