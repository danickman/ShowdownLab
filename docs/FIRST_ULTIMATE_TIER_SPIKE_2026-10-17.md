# First-to-L4/L5 battlefield power spike — gameplay design contract

17 October 2026. User's original Draft Showdown inspired intended experience: **First player to unlock L4 should normally swing an otherwise competitive round; first L5 should make an even more dramatic game-changing leap.** These are not incremental efficiency rewards. Legitimate exceptions include opponent's own L4/L5, doubling an opposing fighter family via ×2, radically superior army numbers or a devastating composition counter. Evolving only two or three weak units against ~15 stronger units is **not** an automatic win.

## Correct the earlier measurement lens

Prior Assassin/Turtle tier-investment studies were often **same-team choice comparisons against already-L4 allied and enemy fighters**. This is useful for the opportunity cost of different upgrades, but does **not measure whether being first to L4/L5 creates the desired decisive spike**. Winner changes caused intentionally by new abilities can be *successes*, not automatic red flags. Retain strict physical determinism, no zombie/stall, physically damaging independent fronts, Sniper/Dragon counters, population capacity, rendering budgets and actual iPhone Safari acceptance. Do not force zero winner flips when the purpose is to create impactful levels. Keep comparative Beetank tests as secondary, not the defining balance gate.

## Source-real first unlock audit

New script `tools/qa/check-first-ultimate-tier-spike.cjs` compares **ALL TEN fighter families**, both L3→L4 and L4→L5, with every combatant initially at the same lower tier and no hidden L4 opposing army. Each side's 10-fighter mirror base contains three copies of the nominated family and seven varied supporting fighters. Test 20/40 total fighters, two seeds (1337/2017), both side mirrors; four options:

1. **Hold:** neither side reaches next tier.
2. **First unlock:** nominate 3/6 family copies of one team reaching L4/L5 first, opponent at L3/L4.
3. **Peer counter:** both sides reach the same new tier on nominated families (so the asymmetric advantage should disappear).
4. **×2 counter:** the opposing player's prior-tier selected family is doubled, creating 13 vs 10 or 26 vs 20 units, against the first evolved family.

That is 10 families × 2 milestone tiers × 2 body counts × 2 seeds × 2 side mirrors × 4 actions = **640 full terminal matches** in **160 fixed matched groups**. Separately, 10 × 2 × 2 seeds × 2 sides = **80 severe-number-counter matches**, three evolved family fighters against 15 mixed lower-tier fighters. Total **720 completed full matches**, plus 24 observed/raw **entire RAF state SHA** pairs. Count actual fighter-ID positive HP, complete terminal winners and true geographically independent positive-HP damaging fronts. Produce per-family/tier scorecards, not universal average alone.

## Product target and next implementation criterion

Provisional *directional design goals*, not yet a pass/fail CI threshold: at approximately equal population and otherwise mirrored lower-tier armies, first-L4 should usually prevail (aim roughly 75%+ of fair trials) and first-L5 even more so (roughly 80%+). Explicitly measure composition exceptions, sample variation, and role-specific quality. Peer L4/L5 and ×2 options **should** be credible counters. Large numerical mismatches should prevent automatic evolution victories. Stage dramatic telegraphed signature effects with original sprite/art readability and avoid generic flat damage homogenization. Winning through a new ability should feel spectacular. **Do not mechanically guarantee wins or invent combat zones.**

## Status

This is an actual test/docs commit on QA only; CI results **PENDING exact HEAD**. It does not alter playable abilities, art, runtime, Guide, SW/pins, main or production. Existing bounded Assassin Dragon-charge research becomes a *secondary tactic* whose value should now be assessed in the broader first-to-tier context, rather than being allowed to dominate the entire balance program. The main progression goal is empowering **all ten** L4/L5 releases as decisive late-game unlocks while retaining legitimate counterplay.


## Verified baseline and targeted prototype continuation
Controlled symmetric 20/40 tests: hold baseline 80/160 wins (50%), first-tier evolution 121/160 wins (75.6%), peer both evolved 80/160 (50%), evolved team against doubled *opposing nominated family* 101/160 (63.1%). First L4 64/80 (80%); first L5 57/80 (71.25%). **Important:** L5 is less impactful than L4 in these fixtures, contrary to intended increasing spectacle/power. The ×2 case doubles only the nominated enemy family (13-vs-10 and 26-vs-20), not the full opposing army: do not label it a full army ×2. Severe asymmetric three-evolved-vs-15 tests: L4 3/40 wins, L5 1/40 wins—numerical limits already work.

| Unit | First L4 (of 8) | First L5 (of 8) | Next action |
|---|---:|---:|---|
| Knight | 8 | 8 | Preserve strong guard character |
| Sniper | 8 | 6 | Protect L4 and measure L5 presentation |
| Dragon | 8 | 8 | Preserve superpower / counters |
| Assassin | 8 | 8 | Do not buff from same-tier Beetank comparisons alone |
| Beetank | 7 | **4** | L5 first-unlock power spike investigation |
| Mole | 6 | **4** | L5 first-unlock power spike investigation |
| Turtle | 7 | 6 | Refine spectacle/front tradeoffs, not generic power |
| Goblin | 5 | 5 | L4/L5 signature Pack Ambush redesign |
| Barbarian | **4** | **4** | High-priority Blood Cleave role expression |
| Goose | **3** | **4** | High-priority Thunder Honk role expression |

Every unit row has only 8 mirrored/seeded fixtures; these are directional QA examples, not universal ability win probabilities. Original peer mirror returning 50% is expected, because the relative advantage disappears. **Different-source role upgrades should intentionally swing fair wins**, whereas severe numerical counters may still win.

