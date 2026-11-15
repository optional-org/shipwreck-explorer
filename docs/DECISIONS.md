# Decision log

The choices that shaped this project and the reasoning behind them, oldest first.

This is a summary written from each contributor's private prompt log, in plain words. It does not quote anyone. The exact prompts stay on the machine of the person who typed them.

Each entry has an id. A commit that carries out a decision names it in a trailer line (`Decision: D004`), so `git log --grep "Decision: D004"` finds the work, and each entry lists its commits once they exist.

How to add an entry is in [`AGENTS.md`](../AGENTS.md).

---

## D001: Build a shipwreck explorer on Abyssal Garden, starting with the Titanic

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Start from the open-source Abyssal Garden project (MIT licence) and turn it into an interactive shipwreck explorer. The first wreck is the Titanic, as close to reality as public information allows. Keep a folder of reference material, which need not be committed, and a committed log of what is used where, with links. Use only public domain material and credit every source.
- **Why:** Abyssal Garden already had a working underwater WebGPU renderer. Limiting the project to public domain material and logging every source keeps it legally clean and lets others check the work.
- **What it led to:** `docs/SOURCES.md`, the gitignored `reference/` folder, the upstream credit in the README and menu.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D002: Realistic darkness, the whole site at true scale, modelled in code

- **Date:** 15 November 2026
- **Decided by:** Claude (assistant), while starting the build; not objected to by the project owner
- **Decision:** Light the scene only with the submersible's lamps, as at the real depth, with a clearly labelled survey light that is not real. Enlarge the world to about 1.1 km so the bow and stern lie at their true distance and bearing. Generate the wreck in code from sourced measurements and the 1911 plans.
- **Why:** The brief was to be as real as possible using only public domain material. No public domain 3D scan or photograph of the wreck exists, but measurements and facts can be cited freely.
- **Alternatives:** Visible artistic lighting only; the bow alone in the original small world; importing a scan or photo textures (none are public domain).
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D003: More detail, sea life, a ship you can swim through, and a mini map

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** The first build was too sparse. The explorer should be much more detailed, have marine life, let you go inside the different parts of the ship, and show a mini map of where you are on the wreck.
- **Why:** The first build was a hull you could only circle, with nothing living and no way to tell where you were.
- **What it led to:** The hollow bow with collision on plating, decks and bulkheads and passage through real openings; the animals recorded at the wreck; the mini map; the bow's real bends.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D004: Sea life is denser than the real wreck, with the white animals cut back

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Keep the raised numbers of animals, which are well above what surveys report, so that life is visible in the lamp light. Later the same day: reduce the white ones (anemones, squat lobsters, whip corals), which were too many.
- **Why:** At realistic numbers you could cross the wreck without seeing anything alive. The white animals then dominated the decks.
- **What it led to:** The density is listed under "Known approximations" in `docs/SOURCES.md`.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D005: Model the rooms and machinery that still exist

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Make the interior worth exploring and true to the wreck: the rooms that are still there, and the engine room and any other machinery that remains.
- **Why:** Empty decks are not the real wreck. The engines and other mechanical parts are among the most interesting things left.
- **What it led to:** Research into what dives have found inside. Only reported survivals are modelled: the lift trunk, the D deck reception room and open gangway door, Scotland Road, the Turkish bath cooling room, the Marconi set, the captain's bath, the boilers, and the two reciprocating engines at the stern. Unseen machinery (turbine, dynamos, steering gear) is left out.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D006: Work through the rough parts

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Improve the parts flagged as rough after D005: bare rooms, the plain Marconi set and bath, simplified engines, plain steel surfaces.
- **Why:** These were the gaps between the model and what the sources describe.
- **What it led to:** Panelling, tiles and leaded glass; a detailed Marconi set and bath; plate seams and rivets. The engines were rebuilt to measurements taken from the builder's 1911 machinery plates, which were added to the reference folder and the sources log.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D007: Keep the prompts private and publish the reasoning

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Aim for a community-driven project. Keep a log of every prompt behind the build, maintained whenever work is done, with the rule written into the project's assistant instructions so other contributors follow it. The exact prompts are not committed. They are used to write this decision log, which is committed, tied to commits, and records the reasoning and choices without quoting anyone.
- **Why:** The history of how the project was directed will be asked for when it goes public and gives contributors context. Publishing people's raw prompts, typos and all, would not respect them; the reasoning is what matters.
- **What it led to:** `scripts/export-prompts.py`, the gitignored `docs/prompts.jsonl` and `docs/PROMPTS.md`, this file, and the rules in `AGENTS.md`.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D008: One set of rules for every AI assistant

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** The project's rules and workflow should work in any popular AI assistant, with OpenAI's Codex in particular, not only Claude Code.
- **Why:** A community project will have contributors on different assistants, and the sourcing, decision log and private prompt rules must hold for all of them.
- **What it led to:** The rules moved to `AGENTS.md`, the file most assistants read by default. `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` only point to it, so there is one copy to maintain. The prompt export reads Codex's session history as well as Claude Code's, and has an `--add` option so any other assistant can record prompts itself.
- **Alternatives:** A full copy of the rules in each tool's own file (they would drift apart).
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D009: Publish as a public repository

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Commit the work and publish it as a public repository on GitHub, under the Optional account.
- **Why:** A community-driven project needs a public home where people can read the sources log, the decisions and the code, and contribute.
- **What it led to:** The repository `optional-org/shipwreck-explorer`. The upstream Abyssal Garden history is kept underneath this project's commits.
- **Commits:** `27da0a0` Turn Abyssal Garden into Shipwreck Explorer: the Titanic wreck

## D011: Name Optional Ltd in the licence

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Add a copyright line for Optional Ltd to `LICENSE`, beneath the line for the author of Abyssal Garden, which stays. The licence remains MIT.
- **Why:** The licence named only the upstream author. The work added on top of Abyssal Garden carried no notice of who holds it. This came out of a check of the public repository for anything that should not be in it.
- **Alternatives:** Leaving the licence as it was. The new work is protected either way, but who holds it was not stated.
- **What it led to:** The second line in `LICENSE`. The same check removed a link to a private assistant session from two commit messages, which changed their hashes.
- **Commits:** `4a8943e` Name Optional Ltd in the licence

## D010: Host the live copy under experiments.optional.org.uk

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Publish the explorer at `experiments.optional.org.uk/shipwrecks/titanic/`, on Optional's own hosting. How it is hosted and published is kept out of the repository.
- **Why:** A memorable address with room for more wrecks and other experiments beside it. Details of the hosting are private to Optional.
- **Alternatives:** GitHub Pages. Free, and it redeploys on every merge, but it serves a repository at its own name, so that address would have needed a second repository to publish into.
- **What it led to:** The live link in the README. A maintainer publishes after changes are merged; the live copy does not update on its own.
- **Commits:** `c80f8c1` Add the live link and the Optional credit; keep publishing private

## D012: Credit Optional as creator and maintainer

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Show a link to Optional along the bottom of the explorer as its creator and maintainer, more prominent than the credit to the author of Abyssal Garden.
- **Why:** Optional created and maintains this project and hosts the live copy. The original author is still credited for the renderer it is built on, as the MIT licence asks.
- **What it led to:** A larger credit line above the existing one in the menu, and a link to this repository beside the upstream credit. The credit is in the page itself, so downloaded copies show it too.
- **Commits:** `c80f8c1` Add the live link and the Optional credit; keep publishing private.

## D013: Show screenshots in the README

- **Date:** 15 November 2026
- **Decided by:** Nathan (project owner)
- **Decision:** Add screenshots of the model to the README, as the Abyssal Garden README does.
- **Why:** A visitor to the repository should see what the explorer looks like before opening it. The upstream project's screenshots do this well.
- **Alternatives:** Leaving the README as text with a link to the live copy. The rule against image files stands for the explorer itself: these files are documentation and nothing in `index.html` uses them.
- **What it led to:** Six pictures in `.github/screenshots/`, the same place upstream keeps its own, each rendered from the model in headless Chrome. One opens the README and five sit after "Going inside".
- **Commits:** not yet committed.
