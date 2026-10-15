# Assassin versus Dragon: authentic contact and counterplay

**2026-10-15, QA branch only.** No production promotion authorized. Baseline was commit `7a19ef6804904691659ba3e2f4bcbda406cdae7d`, full [30/30 green](https://github.com/danickman/ShowdownLab/actions/runs/38820260560).

## Verified failure
An Assassin with nominal 24/500=.048 raw attack range physically cannot cross a Dragon's wide standing separation radius. Its backline targeting and rear vanish work, but a sampled Assassin 1v1 versus Dragon at L1/L4/L5, seeded and mirrored, delivered **zero actual damage-positive backstabs (6/6 bouts)**. This is an attack-access defect, not a request to inflate generic Assassin damage. An initial *all-heavy* reach experiment restored attacks on Turtle and Beetank as well, but it changed too much combat and weakened some small-fight continuity: **rejected**.

## Chosen narrow mechanic
Inside `assassinStep()`, calculate an effective attack reach from **the physical visual-contact collider only when the current selected enemy is a Dragon**. No speed, stats, backline target scoring, teleport destination, cooldown, damage, RNG or presentation coordinate is changed. Beetank and Turtle remain sturdy Assassin counters. Other targets use the old .048 range, full-state behavior unchanged. This is intentionally a modest geometric contact correction, not a global Engagement Director or a new Dragon debuff.

## Source A/B evidence: before integration
We executed identical source-level VM-style fixed 10× tests in JavaScript over six Dragon solo L1/L4/L5 mirrors, 36 other role duels and 36 matched mixed/heavy/ranged 20/40/80-fighter cases (seeds 1337/9917, mirrored sides). The candidate yields **22 genuine Dragon hits versus zero** across six solo duels, but Dragon retains the same terminal winner in all six. The 36 non-Dragon duels are byte-for-byte state identical. Group results:

| Count | Assassin real hits baseline→candidate | Assassin→Dragon hits baseline→candidate | Real separated damaging windows | Truly persistent separate windows |
|---|---:|---:|---:|---:|
| 20 | 9→61 | 0→41 | 22→21 | 1→2 |
| 40 | 18→102 | 1→85 | 101→106 | 19→30 |
| 80 | 48→143 | 0→93 | 110→112 | 59→70 |

These are **censored snapshots**, *not* win-rate estimates; two 20-body fixtures changed whether they reached a terminal outcome by the sampled frame. Some individual fronts worsen: do not infer universal improvement. Dragon's tank-body ranged identity remains powerful and no heavy damage multiplier changed. Further phone-scale gameplay testing is required.

## Required CI and future decisions
`tools/qa/check-assassin-dragon-contact.cjs` reconstructs pre-correction source from the current QA runtime, instruments **real positive hit damage**, verifies all six solo Dragon mirrors have increased real hits without reversing solo Dragon winners, checks 36 non-Dragon L1/L4/L5 duels and high-density **no-Dragon 80/120/300** exact state hashes, then tests mixed/heavy/ranged 20/40/80 armies, true damage-connected fronts, mirror, and deterministic observer. This is a new independent `assassin-dragon-contact-counterplay` GitHub Actions job. Existing permanent 300/1×10×, browser density/430×932 DPR3, all authored sprites, PWA 42 exact integrity hashes and rollback suites remain mandatory. **New CI success has not yet been verified when this report was authored.** Phone Safari acceptance and complete battle outcomes remain open.

**Next:** assess Execution activation in representative L4/L5 drafts and actual opponent counterplay, with special attention to Draconic cone vs newly accessible Assassin rear hits. Fix inaccurate ability-duration descriptive copy separately before a production release. Do not infer actual phone frame timing from desktop/Node.


**Later 15 October update:** A distinct QA turn corrected comparable Beetank/Turtle standing contact reach and is documented in [Assassin Armored Contact](ASSASSIN_ARMORED_CONTACT_COUNTERPLAY_2026-10-15.md). The above descriptions were accurate at their original checkpoint; the Dragon behavior, original Dragon-only test comparator and standalone six Dragon-duel outcomes remain preserved.
