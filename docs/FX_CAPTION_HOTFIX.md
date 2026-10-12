# Production effects caption hotfix

The user authorised release of review head `303c51a48e828979e8616cc949646d3b506e437a`. PR #7 merged as `fb9f3c925eb27f15d5e2e37c6d45baa86181f136`, with tested tree `cc98aec6d40ca784bdafae2e61ccc7539ff9c58c`. Vercel deployed that exact main commit to production and assigned `https://showdownlab.vercel.app/`.

Post-release HTTP checks returned 200 and byte-identical HTML, Sniper Evolved metadata, staging code and Verdant floor. Public-browser Home, Guide, Quick Ready and Battle navigation worked; a Quick match reached the seven-round defeat overlay at 10×. This is a cloud-browser smoke check, not iPhone FPS or subjective phone approval.

Browser application logs exposed `ReferenceError: Cannot access 'cap' before initialization` in `spawnFX()` on last-fighter and final-KO transitions. Its local effect-queue constant shadowed the outer caption-formatting function. Protected adapter exception isolation allowed the battle to continue, but the effects callback failed before trimming its queue and refreshing previous-unit state. Earlier native checks exercised nonterminal effects and supplied a formatter stub; they did not execute these caption branches.

The hotfix renames only the local queue constant to `fxCap`, preserving budget values and behavior. Both HTML entry points refresh the `v3.js` cache key. `tools/check-fx-terminal.cjs` reproduces the released temporal-dead-zone error, then verifies last-fighter and final-KO captions, previous-state tracking, repeated terminal emission and reduced/dense queue bounds with the corrected function. Twenty-four seeded matches, exception/RAF safeguards, runtime parsing, HTML parity and diff checks pass. No combat, stats, progression, roster or art changes are included.

Dragon Evolved remains separate review work. This production hotfix does not release new Dragon assets. Phone motion/readability/performance review remains open.
