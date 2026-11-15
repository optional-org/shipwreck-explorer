# Sources log

What this project is built from, where each item came from, its licence status, and where it is used.

**The rule:** only public domain material is copied into this project. Facts (dimensions, positions, descriptions of the wreck's condition) are not copyrightable and are cited from published sources of any licence, in our own words. No text, image, drawing or scan data is reused from a source that is not public domain.

Every source has an id. The code cites these ids in comments (`[A1]`), and the notes shown in the explorer cite them too.

- **U** = code this project is built on
- **A** = the ship as built (1911 to 1912)
- **W** = the wreck site as it lies today
- **R** = reference files kept locally in `reference/` (not committed)

All links were retrieved on 15 November 2026.

## 1. Code

| Id | Source | Licence | Used where |
|---|---|---|---|
| U1 | [Abyssal Garden](https://github.com/Noniv/abyssal-garden) by Maksymilian Dendura, 2026 | MIT (see [`LICENSE`](../LICENSE)) | The WebGPU renderer, mesh builder, seabed generator, detail levels, menu and build script: `source/src/main.js`, `math.js`, `shaders.js`, `quality.js`, `audio.js`, `build.mjs`, `template.html`. The world, lighting and materials were rewritten for this project. |

## 2. The ship as built: sources of facts

| Id | Source | Status | Link |
|---|---|---|---|
| A1 | *The Shipbuilder*, Vol. VI, Midsummer 1911 Special Number, "The White Star Liners Olympic and Titanic", ed. A. G. Hood. Scan on the Internet Archive. | Public domain. Published in the UK in June 1911. The Internet Archive item states "Usage: Public Domain Mark 1.0". | https://archive.org/details/the_shipbuilder_special_numbers_images_201909 |
| A2 | British Wreck Commissioner's report on the loss of the Titanic (Lord Mersey), 1912, section "Description of the ship". US Senate reprint, Project Gutenberg text. | Public domain. Official report published in 1912. Project Gutenberg: "Public domain in the USA". | https://www.gutenberg.org/ebooks/39415 |
| A3 | Our own measurements of the plates in A1 (files R1 to R3), scaled from the 882 ft 9 in overall length. Accurate to about 1 m (funnels 1.5 m). Method and full tables are in the local research notes, `reference/titanic/as-built/RESEARCH.md`. | Our own work, derived from a public domain source. | See R1 to R3 |
| A6 | Samuel Halpern, "Titanic's Prime Mover" (revised 2011): the reciprocating engines. | All rights reserved. Facts cited only. | https://www.titanicology.com/Titanica/TitanicsPrimeMover.htm |
| A7 | Our own measurements of the engine and boiler rooms on Plates VI, VII and VIII and Fig. 53 of A1 (files R16 to R19), scaled from the cylinder bores, crankshaft and boiler sizes. Heights good to about 0.5 ft. Full tables are in the local notes, `reference/titanic/interior/ENGINES.md`. | Our own work, derived from a public domain source. | See R16 to R20 |
| A4 | Mark Chirnside, "Titanic's centre propeller dossier" (Harland and Wolff notebook evidence). | All rights reserved. Fact cited only. | https://markchirnside.co.uk/titanics-centre-propeller-dossier/ |
| A5 | Titanic Research and Modeling Association, paint and colour reference. | All rights reserved, modellers' research. Fact cited only. | https://trmaarchive.com/paint |

## 3. The wreck site: sources of facts

| Id | Source | Status | Link |
|---|---|---|---|
| W1 | Lippsett, "The Quest to Map Titanic", *Oceanus* 49(2), Woods Hole Oceanographic Institution, 2012. | Copyright WHOI. Facts cited only. | https://www.whoi.edu/cms/files/Oceanus_49_2_Titanic_123424.pdf |
| W2 | NOAA Office of General Counsel, "RMS Titanic: History and Significance". | US government web page. Facts cited only. | https://www.noaa.gov/office-of-general-counsel/gc-international-section/rms-titanic-history-and-significance |
| W3 | NOAA Office of National Marine Sanctuaries, "2010 Expedition Results". | US government web page. Facts cited only. | https://sanctuaries.noaa.gov/maritime/titanic/expedition_results.html |
| W4 | Cullimore and Johnston, "Rusticles Thrive on the Titanic", NOAA Ocean Exploration, 2003 expedition. | Facts cited only. | https://archive.oceanexplorer.noaa.gov/titanic/background/welcome.html |
| W5 | Mengot and Woytowich, "The Breakup of Titanic: A Progress Report from the Marine Forensics Panel (SD-7)", SNAME, 16 April 2009. | Copyright the authors. Facts cited only. | https://wormstedt.com/RoyMengot/TitanicWreck/TRMA/MFPBreakupPaper.pdf |
| W6 | Roy Mengot, wreck survey pages (bow and stern). Detailed secondary source built from WHOI 1986 imagery and later dives. | All rights reserved. Facts cited only. | https://wormstedt.com/RoyMengot/TitanicWreck/BOW/bow.html and https://wormstedt.com/RoyMengot/TitanicWreck/STERN/stern.html |
| W7 | "Titanic: archaeology of an emigrant ship", *Current Archaeology* 265, 2012 (interview with James Delgado, NOAA). | Copyright the publisher. Facts cited only. | https://the-past.com/feature/titanic-archaeology-of-an-emigrant-ship/ |
| W8 | Best, Powrie, Hayward and Barton, "Geotechnical investigation of the Titanic wreck site", *Marine Georesources and Geotechnology* 18(4), 2000. Abstract only. | Copyright the publisher. Fact cited only. | https://www.tandfonline.com/doi/abs/10.1080/10641190009353798 |
| W9 | Wikipedia, "Wreck of the Titanic". Tertiary: used where it reports Ballard (1987) and others. | Text is CC BY-SA, so none of it is copied. Facts cited only. | https://en.wikipedia.org/wiki/Wreck_of_the_Titanic |
| W10 | Ballard's 1985 coordinates for the bow, stern and boilers, as reproduced on an enthusiast page; they match the grid on the 1988 WHOI map in W1 and the 2022 dataset W13. | Facts cited only. | https://www.titanicstory.com/discover.htm |
| W11 | News coverage of the RMS Titanic, Inc. 2024 expedition (fallen bow railing). | Copyright the publisher. Fact cited only. | https://goodmorningamerica.com/news/story/titanic-photo-expedition-reveals-famed-railing-ships-bow-113324487 |
| W12 | NOAA Ocean Today, "Titanic wreck site" (rudder size and burial). | US government web page. Fact cited only. | https://oceantoday.noaa.gov/titanicwrecksite/ |
| W13 | Cleland et al., CTD dataset from the 2022 dives, PANGAEA, 2023. | CC BY 4.0. Position cross-check only, no data copied. | https://doi.pangaea.de/10.1594/PANGAEA.961181 |
| W15 | Cleland et al., "Megafauna of the RMS Titanic shipwreck and a nearby seamount ridge", *Deep-Sea Research Part I* 223, 2025. Abstract read via the university record. | Copyright the publisher. Facts cited only. | https://pure.uhi.ac.uk/en/publications/megafauna-of-the-rms-titanic-shipwreck-and-a-nearby-seamount-ridg/ |
| W16 | National Geographic, "Titanic: underwater exploration" (James Cameron's 2001 and 2005 dives inside the wreck with small remotely operated vehicles). | Copyright the publisher. Facts cited only. | https://www.nationalgeographic.com/magazine/article/titanic-shipwreck-underwater-exploration-james-cameron |
| W17 | Wikipedia, "First-class facilities of the Titanic" (rooms, and what dives have found in them). | Text is CC BY-SA, so none of it is copied. Facts cited only. | https://en.wikipedia.org/wiki/First-class_facilities_of_the_Titanic |
| W18 | Wikipedia, "Grand Staircase of the Titanic". | Text is CC BY-SA. Facts cited only. | https://en.wikipedia.org/wiki/Grand_Staircase_of_the_Titanic |
| W19 | Jerry Proc, "Titanic's radio room" (the Marconi installation and its state on the wreck). | All rights reserved. Facts cited only. | https://jproc.ca/radiostor/titanic.html |
| W14 | NOAA Ocean Service, "How far does light travel in the ocean?" | US government web page. Fact cited only. | https://oceanservice.noaa.gov/facts/light_travel.html |

## 4. Reference files (local, not committed)

Files R1 to R15 are saved under `reference/titanic/as-built/`. All of the files listed here are public domain; the licence text is quoted from the hosting page. To rebuild the folder, download each file link and save it under the filename shown.

Files R1 to R10 share one source: A1, *The Shipbuilder*, June 1911, Internet Archive item `the_shipbuilder_special_numbers_images_201909`, licence statement "Usage: Public Domain Mark 1.0". Credit: "The Shipbuilder, Vol. VI, Midsummer 1911 Special Number, ed. A. G. Hood. Public domain. Scan: Internet Archive." The plates and photographs show Olympic as completed in 1911; Titanic's known differences are noted in section 6.

| Id | Filename | What it is | File link |
|---|---|---|---|
| R1 | `shipbuilder-1911-plate-3-profile-rigging-boat-deck-a-deck.jpg` | Plate III: profile, boat deck plan, A deck plan | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n316.jpg |
| R2 | `shipbuilder-1911-plate-4-decks-b-c-d-e-forecastle-poop.jpg` | Plate IV: forecastle, poop, B, C, D and E deck plans | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n318.jpg |
| R3 | `shipbuilder-1911-plate-5-decks-f-g-orlop-tank-top.jpg` | Plate V: F, G, orlop and tank top plans | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n320.jpg |
| R4 | `shipbuilder-1911-fig14-midship-section.jpg` | Fig. 14: midship section | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n211.jpg |
| R5 | `shipbuilder-1911-fig17-stern-castings-rudder.jpg` | Fig. 17: stern castings and rudder | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n213.jpg |
| R6 | `shipbuilder-1911-fig33-olympic-forecastle-deck.jpg` | Fig. 33: Olympic's forecastle deck on the slip | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n226.jpg |
| R7 | `shipbuilder-1911-fig35-olympic-stern-propellers.jpg` | Fig. 35: Olympic's stern before launching (photo by Frank and Sons, South Shields) | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n228.jpg |
| R8 | `shipbuilder-1911-fig44-boiler-room-sections.jpg` | Fig. 44: sections through boiler rooms 1 and 2 | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n236.jpg |
| R9 | `shipbuilder-1911-fig61-olympic-centre-propeller.jpg` | Fig. 61: Olympic's centre propeller | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n251.jpg |
| R10 | `shipbuilder-1911-fig142-centre-anchor.jpg` | Fig. 142: the 15.5 ton centre anchor | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n329.jpg |

Files R16 to R20 are from the same Internet Archive item and carry the same public domain statement. They are saved under `reference/titanic/interior/`.

| Id | Filename | What it is | File link |
|---|---|---|---|
| R16 | `shipbuilder-1911-plate-6-boiler-rooms-1-2.jpg` | Plate VI: boiler rooms 1 and 2, elevation and plan | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n322.jpg |
| R17 | `shipbuilder-1911-plate-7-engine-rooms-elevation.jpg` | Plate VII: engine rooms, elevation | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n324.jpg |
| R18 | `shipbuilder-1911-plate-8-engine-rooms-plan.jpg` | Plate VIII: engine rooms, plan | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n326.jpg |
| R19 | `shipbuilder-1911-fig-53-engine-room-section.jpg` | Fig. 53: section across the reciprocating engine room | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n244.jpg |
| R20 | `shipbuilder-1911-fig-54-engine-erecting-shop.jpg` | Fig. 54: an engine in the erecting shop | https://archive.org/download/the_shipbuilder_special_numbers_images_201909/page/n245.jpg |

Files R11 to R15 are photographs from Wikimedia Commons. Credit: "[photographer], [date]. Public domain, via Wikimedia Commons."

| Id | Filename | What it is, and who made it | Why it is public domain (as stated on the page) | Page | File link |
|---|---|---|---|---|---|
| R11 | `titanic-departing-southampton-1912-stuart.jpg` | Titanic leaving Southampton, 10 April 1912. Francis Godolphin Osbourne Stuart (died 1923). | "The author died in 1923, so this work is in the public domain in its country of origin [...] published (or registered with the U.S. Copyright Office) before January 1, 1931." | https://commons.wikimedia.org/wiki/File:RMS_Titanic_3.jpg | https://upload.wikimedia.org/wikipedia/commons/f/fd/RMS_Titanic_3.jpg |
| R12 | `titanic-boat-deck-starboard-aft-1912-barker.jpg` | Titanic's boat deck, starboard side aft, 11 April 1912. Thomas Barker (died 1924). | "The author died in 1924, so this work is in the public domain in its country of origin [...] published [...] before January 1, 1931." | https://commons.wikimedia.org/wiki/File:Boat_Deck_of_Titanic.jpg | https://upload.wikimedia.org/wikipedia/commons/9/90/Boat_Deck_of_Titanic.jpg |
| R13 | `titanic-boat-deck-port-aft-1912-barker.jpg` | Titanic's boat deck, port side aft, 11 April 1912. Thomas Barker (died 1924). | Same template as R12 (read in the page source, not the rendered page). | https://commons.wikimedia.org/wiki/File:Titanic_portside_second_class_boat_deck.jpg | https://upload.wikimedia.org/wikipedia/commons/5/50/Titanic_portside_second_class_boat_deck.jpg |
| R14 | `olympic-propellers-rudder-drydock-1911-welch.jpg` | Olympic in dry dock, 1911: propellers, rudder and counter. Robert John Welch (died 1936) for Harland and Wolff; Bain Collection, Library of Congress. | "The author died in 1936 [...] This work is from the George Grantham Bain collection at the Library of Congress. According to the Library, there are no known copyright restrictions on the use of this work." | https://commons.wikimedia.org/wiki/File:Olympic_rudder_before_launch.jpg | https://upload.wikimedia.org/wikipedia/commons/1/11/Olympic_rudder_before_launch.jpg |
| R15 | `olympic-and-titanic-belfast-1912-harland-wolff.jpg` | Olympic and Titanic together at Belfast, 6 March 1912. Harland and Wolff (Commons attributes it to R. J. Welch, died 1936). | "The author died in 1936 [...] published [...] before January 1, 1931." Page note: "First published in maritime press in 1912." | https://commons.wikimedia.org/wiki/File:Olympic_and_Titanic.jpg | https://upload.wikimedia.org/wikipedia/commons/0/0e/Olympic_and_Titanic.jpg |

The local folder also holds four sets of research notes (`as-built/RESEARCH.md`, `wreck-site/RESEARCH.md`, `interior/RESEARCH.md` and `interior/ENGINES.md`) with every fact, its link, and where sources disagree.

**No file from the reference folder is shipped in the explorer.** The explorer contains no images at all. The plates were measured (A3); the photographs were used to check shapes and proportions by eye.

## 5. Used where

| What | Value in the model | Source | In the code |
|---|---|---|---|
| Length overall, between perpendiculars, breadth | 882 ft 9 in, 850 ft, 92 ft 6 in | A1 | `ship.js`: `LOA`, `LBP`, `BEAM` |
| Load draught | 34 ft 7 in | A2 | `ship.js`: `WL`; shader paint line |
| Deck heights above the keel | Boat 28.22 m down to G 8.86 m | A2 (waterline heights plus draught), checked on R4 | `ship.js`: `DK`, `LEVEL` |
| Sheer | 13 ft forward, 5 ft aft | A2 | `ship.js`: `SHEER_F`, `SHEER_A` |
| Forecastle 128 ft; bridge front 190 ft from the bow | | A1; A2 | `ship.js`: `FC_END`, `BRIDGE` |
| Ends of the superstructure and the poop | 181.5 ft, 723 ft, 776 ft from the stem | A3 (R1, R2) | `ship.js`: `SUP0`, `SUP1`, `POOP0` |
| Hull half breadths at 33 stations and 4 levels | Table | A3 (R2, R3) | `ship.js`: `OFFSETS`, `hullHalf()` |
| Funnel size and positions | 24 ft 6 in by 19 ft; centres 246, 363.5, 482.5, 599 ft | A1 (size), A3 (positions, R1) | `ship.js`: `FUNNEL`, `FUN_L`, `FUN_W` |
| Hatches 1 to 3, 5 and 6; capstans; cargo cranes; foremast foot; officers' quarters; grand staircase; expansion joint | Positions | A3 (R1, R2); A1 for what each is | `ship.js`: `meshBow()`, `meshStern()`, `STAIR` |
| Centre anchor in a well at the stem, with its crane | | A1 (R10) | `ship.js`: `meshBow()` |
| Boilers | 15 ft 9 in across; single-ended 11 ft 9 in long, three furnaces, five in boiler room No. 1 | A1, A2 (R8) | `ship.js`: `meshBoiler()`; `site.js`: `boilers` |
| Wing propellers | Three blades, 23 ft 6 in, bronze blades | A1 (R7, R14) | `ship.js`: `meshStern()` |
| Rudder | 15 ft 3 in wide | A1 (R5) | `ship.js`: `meshStern()` |
| Shell plates 6 ft wide and about 30 ft long | | A1 | `shaders-scene.js`: plate seams |
| Colours as built: black topsides, red below the waterline, white above the sheer line, yellow band | | A5, checked on R11 | `shaders-scene.js`: paint remnants |
| Stern lies about 679 m south and 115 m west of the bow | From the coordinates of each | W10, W1, W13 | `site.js`: `parts` |
| Stern turned about 180 degrees, after end toward the bow | | W1 | `site.js`: stern `heading` |
| Boilers about 150 m east-south-east of the stern | From the coordinates | W10 | `site.js`: `boilers` |
| Depth about 3,800 m | | W1, W2 | `site.js`: `depth` |
| The break: between funnels 2 and 3, the bow's tear through the No. 3 funnel uptake | | W5, W6 | `ship.js`: `BOW_END`, `STERN0` |
| Bow buried to about the level of the anchors, tapering to nothing at the tear | 18 m at the stem (sources give 12 to 20 m) | W6, W8, W9 | `site.js`: bow `at`, `pitch` |
| Bow fittings as they are today: railings, missing No. 1 hatch cover, fallen foremast resting on the port side of the bridge, cranes wrenched over, telemotor the only thing standing on the bridge, funnels gone, open stairwell, decks collapsed at the tear | | W6, W2, W7, W9 | `ship.js`: `meshBow()`, `BOW`; `site.js`: notes |
| Port bow railing section (about 4.5 m) fallen between 2022 and 2024 | | W11 | `ship.js`: `meshBow()` railing |
| Starboard officers' quarters collapsed by 2019 | | W9 | `ship.js`: `meshBow()` |
| Stern: decks pancaked, plating splayed out, starboard plating lost, rudder buried up to 15 m, wing propellers bent up about 20 degrees and resting on the mud | | W6, W9, W1, W12 | `ship.js`: `STERN`, `meshStern()`; `site.js` |
| The bow's two bends: 6 to 10 degrees down under the well deck cranes, about 4 degrees under the forward expansion joint | 8 and 4 degrees | W5, W6 | `ship.js`: `BEND`, `bowDrop()`; `shaders-scene.js`: `drop()` |
| Watertight bulkheads A to H: positions and the deck each rises to | From the report's compartment lengths | A2 | `ship.js`: `BULKHEADS` |
| Openings you can swim through: hatches Nos. 1 to 3, the grand staircase shaft (boat deck to E deck, 20 ft by 15 ft), the funnel uptakes (24 ft 6 in by 19 ft), the torn end | | A3, A1, W6 | `ship.js`: `H1`, `H2`, `H3`, `STAIR`, `F1`, `F2`, `BOW.decks`; `world.js`: `hullCollide()` |
| Large vertical tear in the port side under the first funnel | | W5 | `ship.js`: `BOW.gap` |
| Double-ended boilers still in boiler rooms 2 to 6 (20 ft long, five abreast, four in No. 6); those of No. 2 visible in the tear | | A1, A2, W6, W9 | `ship.js`: `meshBow()` |
| Reciprocating engines standing at the stern's torn end, tops level with the collapsed decks; cylinder bores | 54, 84, 97, 97 in | W6, A2 | `ship.js`: `meshStern()` `after` |
| Wheelhouse footings, davit stations, entrance house, gymnasium, Marconi room, poop cranes, docking bridge | Positions | A3; condition from W6, W7 | `ship.js`: `meshBow()`, `meshStern()` |
| No. 1 hatch cover on the seabed ahead of the prow; two pieces of double bottom, about 70 ft long, east of the hull sections | 60 m ahead (sources: 30 m to a few hundred feet) | W6, W9, W3, W5 | `world.js`: named debris, `meshBottom()` |
| Animals: rattail fish (up to 0.91 m), squat lobsters, brittle stars, sea stars, sea cucumbers, anemones, sponges, bamboo coral (*Lepidisis*) and *Chrysogorgia* growing on the wreck | | W9, W15 | `world.js`: `meshFauna()`, `meshRattail()`, placement; `shaders-scene.js`: `W_FISH` |
| Lift trunk (three lifts, A to E deck, just forward of the staircase) with its iron grilles; staircase landings' pillars | 303 to 311 ft from the stem | A2, A3, W6, W18 | `ship.js`: `LIFT`, `BOW.panels`, `meshBow()` |
| D deck reception room and the surviving corner of the dining saloon; port gangway door open (fallen away) | 288 to 371 ft; door 73.5 by 56 in at about 298 to 308 ft | A3, W6, W9, W16, W17 | `ship.js`: `BOW.panels`, `BOW.gap`, `meshBow()` |
| "Scotland Road" working passage, port side of E deck, 8 ft wide | From 184 ft aft, 9.5 to 17.5 ft off the centreline | A3, W16 | `ship.js`: `BOW.panels` |
| Turkish bath cooling room, F deck starboard, with its loungers | 325 to 344 ft | A3, W16, W17 | `ship.js`: `BOW.panels`, `meshBow()` |
| Marconi silent room equipment still standing; wooden walls gone | 290 to 302 ft, on the centreline | A2, A3, W16, W19 | `ship.js`: `meshBow()`, `BOW.blocks` |
| Captain's bath | 248 to 255 ft, starboard | A3, W9 | `ship.js`: `meshBow()` |
| Brass bedsteads where softwood cabin walls have gone | B and C decks forward of the staircase | W16 | `ship.js`: `meshBow()` |
| Boiler positions across each room; uptakes crushed on to the boilers of No. 2 | 0, 17 and 34 ft off the centreline; tops 23 ft above the keel | A3, W6 | `ship.js`: `meshBow()`, `BOW.blocks` |
| Reciprocating engines: every level, centre and diameter (bedplate, crankshaft, columns, crosshead guides, cylinders, valve chests, exhaust and steam pipes, platforms and ladders); forward low pressure cylinders broken off and lying in the debris; mud at the crankshafts | Cylinders at 527.5, 543, 563 and 578.5 ft, 16.5 ft off the centreline; covers 35.9 ft above the tank top | A7 (R17, R18, R19, R20), A1; condition from W5, W6 | `ship.js`: `ENGINE_X`, `ENGINE_D`, `EH()`, `meshStern()` `after`, `STERN.blocks`; `world.js`: `meshLP()` |
| Stern: second class entrance house partly standing, a crane hanging over the starboard side and one upside down | 647 to 675 ft; about 690 ft | W6 | `ship.js`: `meshStern()` `after` |
| Rusticles on every edge and face | | W4 | `ship.js`: `meshRusticles()`; `world.js`; shader rust |
| No sunlight; lamps light only the water near the vehicle | | W14, W1 | `shaders-scene.js`: lamp model; `main.js` |
| Mud seabed, nearly level across the site | 3,785 to 3,795 m contours on the 1988 map | W1 | `shaders-scene.js`: `W_DENS` |

## 6. Known approximations

These are estimates, marked "est." in the code. Each one is a place where a better public domain source would improve the model.

- **Hull form.** No builder's lines plan or table of offsets is in the public domain. The hull is interpolated from half breadths we measured on small plan reproductions (A3), accurate to about 0.5 m in breadth.
- **Olympic versus Titanic.** The 1911 plates show Olympic. Titanic's B deck layout and enclosed A deck screen differed (A2). The promenade screen is modelled as a plain frame.
- **Headings.** No source gives the compass heading of either section in degrees. The bow is set to 12 degrees (it is drawn north-north-east on site maps) and the stern opposite.
- **Bow attitude.** The two bends are modelled as sharp folds of 8 and 4 degrees (sources give 6 to 10 for the first). The remaining 2 degrees of pitch is chosen so the keel is 18 m under the mud at the stem and at the surface at the tear. The buckled plating at each bend, and the slight skew to port, are not modelled. No list angle is published; none is modelled.
- **Burial depth.** Sources give 12 m (W8) to 18 or 20 m (W6, W9) at the prow. 18 m is used.
- **Stern.** The collapse of the stern is generated from noise to match its described condition. It is representative, not a survey. The folded-back poop deck is not modelled. The engines are built to the measured plates (A7), but simplified: plain cylinders and boxes for castings, no reversing gear, pumps or small pipework, and the crank angles are arbitrary. Which side the ladders stood on is not clear on the plates. How much of each engine above the bedplate survives beyond the loss of the forward cylinders is not recorded in detail, so the after three cylinders are shown complete. The plates put the cylinder covers 37 ft above the tank top, which agrees with the published 35 ft figure for the engines' height and not the 30 ft one. Aft of the engine room the stern cannot be entered: its decks lie on one another, and the turbine, condensers, dynamos and steering gear under them have not been seen, so they are not modelled.
- **Interior of the bow.** The decks, bulkheads, hatch and stair openings, funnel casings, boilers, lift trunk, reception room walls, Scotland Road and the Turkish bath cooling room are where the sources put them, to about 1.5 m fore and aft (two of the 1911 plates disagree by 5 ft at the bow). Only things reported as surviving are modelled. The reception room's panelling and leaded window screens, the Turkish bath's tiles and loungers, the Marconi set and the captain's bath are there because dives reported them, but their patterns, sizes and exact places are estimates: the tile and window designs are generic, not copied from photographs. Doorways, pillar spacing and the bedsteads are estimates too. Not modelled: steel bathrooms of the cabins, the mail room (below the mud), the firemen's tunnel, the swimming bath and squash court (never seen on the wreck), and all stairs. The pillars are at an estimated spacing. Watertight doors are treated as closed. The funnel uptakes are straight shafts; the real ones branch to each boiler room. Mud fills the hull to the level of the seabed outside, which is a guess.
- **Animals.** The kinds are the ones recorded at the wreck (W9, W15). Their positions are random and their shapes are simple. There are deliberately more of them than on the real wreck, so that they show up in the lamp light: the 2022 survey found the wreck less rich in life than a nearby natural ridge (W15).
- **B deck windows** are drawn at a regular spacing, like the portholes.
- **Debris field.** The spread of plates and coal is statistical. The No. 1 hatch cover and the two double-bottom pieces are placed at estimated positions; other individual items (the telegraphs, bench ends, the deckhouse pieces) are not placed, because their positions are only on copyrighted maps.
- **Portholes, plate seams and rivets.** Drawn at regular spacings on the right decks, not at their true individual positions. Rivet rows follow the seams at an estimated pitch.
- **Boiler arrangement** within the cluster, the cable holder positions, which davits still stand, and the sheer curve between its published end values.
- **Water and light.** Lamp power, absorption and scattering are tuned to look like dive footage, not measured.
- **Centre propeller.** Not modelled: it is buried on the wreck, and its blade count is disputed (A1 shows Olympic's four blades; A4 reports three for Titanic).

## 7. Considered and not used

Listed so nobody adds them by mistake.

- **The 2022 Magellan / Atlantic Productions scan and RMS Titanic, Inc. imagery (2010, 2024):** copyrighted.
- **National Geographic photographs** of the wreck, and the 1988 WHOI site map: copyrighted.
- **NOAA-hosted photographs of the wreck** from the 2003 and 2004 expeditions: every one is credited jointly with, or solely to, a non-federal body or person (the Russian Academy of Sciences, the Institute for Exploration, the University of Rhode Island, Lori Johnston, National Geographic). Wikimedia Commons tags some as US government works, but the credit lines do not support that. NOAA's site says its content "may be distributed freely", which is not a public domain statement. Not used unless NOAA confirms their status in writing.
- **Free but not public domain:** the Commons wreck site map `FR-Titanic-Wreck-Site-Map.png` (CC BY-SA 3.0), CC BY-SA redrawn deck plans, and Wikipedia text.
- **Father Francis Browne's 1912 photographs:** he died in 1960, so they are in copyright in Ireland and the UK until the end of 2030.
- **Modern redrawn plans** (Beveridge and co-authors, Titanic Honor and Glory, Bob Read, Encyclopedia Titanica, model kit makers) and National Museums NI scans of the Harland and Wolff plans: copyrighted or rights asserted.
- **Commons files with weak provenance:** 1912 photographs carrying only an uploader's CC0 tag, an annotated copy of the 1911 *Engineering* side plan with a modern overlay, and a "CC0" boat deck drawing that derives from a CC BY-SA one.

## Adding a source

1. Check the licence statement on the hosting page yourself and quote it here. A tag on Wikimedia Commons is a volunteer's claim, not proof.
2. Give it the next free id and a row in the right table, with the link.
3. Add a row to "Used where", and cite the id in a comment next to the number in the code.
4. If a file is saved, put it under `reference/` and list the filename and download link here.
