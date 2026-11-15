# AGENTS.md

The rules for any AI coding assistant working in this repository (Codex, Claude Code, Cursor, GitHub Copilot, Gemini CLI and others). Human contributors: these are the project's rules too.

This is the only place the rules are written. `CLAUDE.md`, `GEMINI.md` and `.github/copilot-instructions.md` just point here: change the rules here and nowhere else.

## What this is

Shipwreck Explorer: a browser 3D model of the RMS Titanic wreck site, generated entirely by code and shipped as one self-contained `index.html` (WebGPU, no engine, no image or model files). The aim is to be as close to the real wreck as public sources allow.

## Rules that always apply

### 1. Keep the prompt log (private) and the decision log (committed) up to date

Two records are kept of how the project is directed.

**The prompt log** is private. It is every prompt typed to an AI assistant for this project, word for word. It is gitignored and stays on the machine of the person who typed it.

- At the end of any session that changes the project, run `python3 scripts/export-prompts.py`. It reads your assistant's own session history on this machine (Claude Code and Codex are supported), adds the session's prompts to `docs/prompts.jsonl` and renders `docs/PROMPTS.md`. It only ever adds.
- If it reports nothing new because it cannot read your assistant's history, add the prompts yourself: for each prompt the person typed this session, in order, run `python3 scripts/export-prompts.py --add` with the exact text on standard input. Add only what the person typed, word for word.
- Never commit either file, paste from them into anything that is committed, or send them anywhere.

**The decision log**, `docs/DECISIONS.md`, is committed. It records the choices that shaped the project and the reasoning behind them, written from the prompt log.

- Before committing work, read the session's prompts and add an entry for each real decision: a change of direction, a new requirement, a choice between options, a rule. A request to carry out something already decided is not a new decision; add its commit to the existing entry instead.
- Write in your own plain words. **Do not quote the person**, and leave out typos, asides, frustration and anything personal. Record what was decided, why, what else was considered, and what it led to. The aim is to keep the reasoning and protect the dignity of whoever typed the prompts.
- Say who decided, by the name they choose to go by. A choice the assistant made on its own is recorded as the assistant's.
- Give the entry the next id (`D008`, ...). Put a trailer `Decision: D008` in the message of each commit that carries it out, and list those commits in the entry (short hash and subject) in a later commit.
- If you are not using an AI assistant, write the entry yourself for any decision your change makes.

### 2. Public domain material only, and everything sourced

- Only public domain (or CC0) reference material may be saved or reused. CC BY and CC BY-SA are not public domain. A licence tag on Wikimedia Commons is a volunteer's claim: read the page and quote its licence statement.
- Facts (dimensions, positions, the condition of the wreck) may be cited from any published source, in our own words. Never copy text, images, drawings or scan data from a source that is not public domain.
- `docs/SOURCES.md` is the log of what is used where. Any new or changed number, position or note in the model must cite a source id there, and the id goes in a comment next to the number in the code (`[A1]`, `[W6]`).
- Model only what sources say exists. If something is a guess, mark it `est.` in the code and list it under "Known approximations" in `docs/SOURCES.md`.
- Reference files live in `reference/`, which is gitignored. Log each file (name, link, licence statement) in `docs/SOURCES.md`.

### 3. Keep it one small file

- No engines or 3D libraries, no image, model or sound files: everything is generated in code.
- The frame loop should not allocate memory. (The readouts and mini map currently do, four times a second. Do not add more.)
- Report the size of `index.html` when it changes.

### 4. Writing

Plain, direct sentences in docs, comments and UI text. No em-dashes. No emoji in the interface.

## Working on it

```bash
cd source
npm install
npm run build            # writes ../index.html, minified
npm run build:readable   # unminified, for debugging
```

Always finish with `npm run build` so the committed `index.html` matches the source. The live copy at https://experiments.optional.org.uk/shipwrecks/titanic/ is published privately by the maintainers. Do not try to publish it, and do not add hosting or infrastructure details (providers, bucket or server names, ids, credentials, deploy scripts) to anything that is committed. There are no automated tests. Check a change by loading the page in a WebGPU browser (Chrome or Edge), served from localhost or over HTTPS, and looking at it: use keys `1` to `9` and `[` `]` to jump between viewpoints, and `V` for the survey light.

## Where things are

Files in `source/src/` are concatenated in the order listed in `source/build.mjs`. They share one scope, so a name defined in an earlier file is visible in later ones.

| File | What it holds |
|---|---|
| `ship.js` | The ship as built: dimensions, hull offsets, decks, openings, bulkheads, rooms, fittings and machinery, and the damage to each hull section. Ship coordinates: x metres aft of the stem head, y metres above the keel, z metres to port. |
| `site.js` | The wreck site: where each section lies, and the points of interest with their notes and source ids. |
| `world.js` | Places everything on the seabed (debris, animals, rusticles) and keeps the camera out of the steel (`hullCollide`). |
| `shaders-scene.js` | WGSL: seabed, lamp lighting, wreck materials, fish, marine snow, post-processing. |
| `main.js` | Renderer, camera, controls, readouts, mini map. |
| `math.js`, `shaders.js`, `quality.js`, `audio.js` | Noise and mesh helpers, shared shaders, detail levels, sound. |

Each hull section is described once, as data (`BOW`, `STERN` in `ship.js`: decks, openings, walls, partitions, solid blocks), and both the mesh and the collision are built from that data. Add structure there, not in two places.

## Credits

Built on [Abyssal Garden](https://github.com/Noniv/abyssal-garden) by Maksymilian Dendura (MIT). Keep the `LICENSE` and the credit in the menu and README.
