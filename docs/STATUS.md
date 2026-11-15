# Status

Where the project stands and what comes next. Read this first when you pick the work up, and update it at the end of a session. Last updated 15 November 2026.

The rules for working here are in [`AGENTS.md`](../AGENTS.md). The reasoning behind what exists is in [`DECISIONS.md`](DECISIONS.md). What is measured and what is estimated is in [`SOURCES.md`](SOURCES.md).

## What exists

- **The site.** The Titanic wreck at full scale on a 1.1 km seabed: bow section, stern section about 690 m to the south-south-west, the five single-ended boilers, a debris field, and named debris (No. 1 hatch cover, two double-bottom pieces, two low pressure cylinders). Lit by the submersible's lamps, with a survey light on `V`.
- **The bow.** Hull lofted from half breadths measured off the 1911 plates, bent in two places as the real one is. It is hollow: plating, decks, eight watertight bulkheads and the funnel casings are solid, and you can enter through the staircase shaft, the funnel uptakes, hatches 1 to 3, the torn end, a tear in the port side, and the open port gangway door on D deck.
- **Inside the bow.** Only what dives report as surviving: the lift trunk and its grilles, the D deck reception room (panelling, leaded window screens) and a corner of the dining saloon, Scotland Road, the Turkish bath cooling room, brass bedsteads, and the 24 double-ended boilers. On the boat deck, the Marconi set and the captain's bath.
- **The stern.** A collapsed mass generated to match descriptions. The two reciprocating engines stand in the open at its torn end, built to measurements from the builder's machinery plates, and can be swum through. Aft of the engine room it is solid.
- **Life.** Rattails, brittle stars, sea stars, sea cucumbers, squat lobsters, anemones, sponges and two corals: the animals recorded at the wreck, in larger numbers than the real site.
- **The page.** Readouts, notes that cite their sources, a mini map, viewpoints on `1` to `9` and `[` `]`. One self-contained `index.html`, about 96 kB.
- **The project.** Public repository with six screenshots in the README (`.github/screenshots/`, taken from the model in headless Chrome), a live copy at https://experiments.optional.org.uk/shipwrecks/titanic/, the sources log, the decision log, and one set of contribution rules for people and AI assistants.

## How it has been checked

Every build has been loaded in headless Chrome with WebGPU and looked at in screenshots from the viewpoints. That confirms it starts without errors and that each thing is where it should be.

It has **not** been checked by a person at the controls. Unverified:

- how moving and colliding feel, especially inside the hull and among the engines;
- whether you can actually steer through the narrower openings (hatch No. 1, the gangway door, the cut-out to F deck);
- sound;
- touch controls on a real phone. They pass in Chrome's phone emulation. A report that holding to move did nothing on an iPhone led to a fix on 15 November 2026 (the code took a negative touch id, which iOS Safari can hand out, to mean no finger was down). The fix is confirmed with a faked negative id but not yet on an iPhone. Xcode's iOS Simulator cannot be used: it has no WebGPU;
- frame rate on real hardware.

## Known gaps, roughly in order of value

1. **Play it by hand** and fix what that turns up. This is the biggest unknown.
2. **Surfaces close up.** Plate seams and rivet rows were added to the hull but were not visible at the distances screenshotted, so they are unconfirmed. Walls and decks are still plain at arm's length.
3. **The captain's bath** reads as a small boat. The shape needs another go.
4. **The stern.** The poop deck folded back on itself is not modelled, and the collapse is generic noise. The engines' reversing gear, pumps and small pipework are left out.
5. **The bow's interior.** Steel cabin bathrooms, the vestibules by the gangway doors and any stairs are missing; the reception room's windows and the bath's tiles are generic patterns.
6. **Performance.** Upstream's fly-through benchmark was removed with its camera path. There is no measurement of frame time, and the readouts and mini map allocate memory four times a second, against the project's own rule. Restore a benchmark with a path around the wreck, then make the readouts allocation-free.
7. **Estimates that a better source could replace.** The full list is "Known approximations" in `SOURCES.md`. The largest: no builder's table of offsets for the hull, no published compass heading for either section, and two of the 1911 plates disagree by 5 ft at the bow.
8. **A second wreck.** Nothing is in place for this yet beyond the address the live copy sits under. `ship.js` and `site.js` are specific to the Titanic; the first step would be to see what they share with another ship.

## Things to know before changing anything

- **Each hull section is described once, as data** (`BOW` and `STERN` in `source/src/ship.js`: decks, openings, walls, partitions, solid blocks). Both the mesh and the collision are built from it. Add structure there.
- **The shader picks a surface by the vertex "aux" value** in steps of 0.1 (plating, deck, wall, bronze, wood, tiles, leaded glass, enamel, machinery, opening). The list is at the top of `W_SOLID` in `source/src/shaders-scene.js`.
- **Viewpoints** are the `POI_DATA` list in `source/src/site.js`. Adding one there adds its note, its `[` `]` stop and, for the first nine, its number key.
- **One session at a time.** Two assistant sessions committing in this repository at once have already collided once (see D011 and D012 in the decision log). Fetch before you start.
- **Decision ids.** Take the next free id from `DECISIONS.md` after fetching. The entries are not in strict order: D011 sits before D010.
