// ============================================================================
// the wreck site as it lies today: where each piece is, and what there is to see
// ============================================================================
// World coordinates: x = metres east, z = metres south, y = metres above the seabed datum (y = 0). The origin is
// midway between the two hull sections. Where each number comes from is logged in docs/SOURCES.md.
const SITE = {
  depth: 3800, // depth of the seabed datum, metres
  // Each hull section: `pivot` (ship coordinates) sits at `at` (world). heading: compass bearing its forward end
  // points to; pitch: degrees down by the bow; roll: degrees of list to port.
  // The stern lies about 679 m south and 115 m west of the bow (from the published coordinates of each), turned
  // about 180 degrees so its after end points back north toward the bow. No source gives either heading in
  // degrees: the bow is drawn pointing roughly north-north-east on site maps (est. 12 degrees).
  parts: [
    // The bow's keel is about 18 m under the mud at the stem and at the surface at the tear: with the hull's two
    // bends (ship.js) that leaves about 2 degrees of pitch for the section as a whole (est.)
    { name: 'Bow section', mesh: 0, geom: BOW, pivot: [0, 0, 0], at: [71, -18 + bowDrop(0), -407], heading: 12, pitch: 2, roll: 0 },
    { name: 'Stern section', mesh: 1, geom: STERN, pivot: [LOA - 6, 0, 0], at: [-47, -13, 291], heading: 192, pitch: -5.5, roll: 0 }, // pitch est.: rudder buried about 13 m, mud at the engines' crankshafts [W6, W9]
  ],
  // single-ended boilers from boiler room No. 1, about 150 m east-south-east of the stern: x, z, bearing of the
  // furnace end (their arrangement within the cluster is est.)
  boilers: [[72, 380, 40], [83, 388, 300], [66, 394, 130], [92, 399, 210], [79, 406, 80]],
};

// Points of interest: `part` indexes SITE.parts, `at` and `view` are ship coordinates (what to look at, and where
// keys 1-9 put the camera). `r`: how close, in metres, before the note shows. `src`: ids in docs/SOURCES.md.
const POI_DATA = [
  { part: 0, name: 'The bow', at: [2, STEM_TOP - 2, 0], view: [-13, STEM_TOP - 1, 6], r: 30,
    text: 'The prow ploughed into the seabed and is buried to about the level of the anchors. The bow section stands upright and is the most intact part of the wreck.', src: 'W6, W8, W9' },
  { part: 0, name: 'Forecastle', at: [14, STEM_TOP, 0], view: [-3, STEM_TOP + 6, -2], r: 16,
    text: 'Anchor chains run from the hawse pipes to the windlass. The spare centre anchor still lies in its well at the stem, under the crane that handled it.', src: 'W6' },
  { part: 0, name: 'No. 1 hatch', at: [25.7, DK.B + 3, 0], view: [17.5, DK.B + 9, 5], r: 9,
    text: 'The hatch cover is gone: it was blown off when the bow struck the bottom and lies on the seabed ahead of the wreck.', src: 'W6, W9' },
  { part: 0, name: 'Fallen foremast', at: [47, DK.B + 2.5, 1.5], view: [39, DK.B + 8, -8], r: 9,
    text: 'The foremast fell back across the well deck and rests on the bridge. The lookouts first saw the iceberg from the crow\'s nest on this mast.', src: 'W6' },
  { part: 0, name: 'Bridge and telemotor', at: [BRIDGE + 3.6, DK.boat + 1.8, 0], view: [BRIDGE - 6, DK.boat + 4.5, -4], r: 13,
    text: 'The wooden wheelhouse has gone. The bronze telemotor, which carried the ship\'s wheel, still stands where the helm was put hard over.', src: 'W2, W6' },
  { part: 0, name: 'Officers\' quarters', at: [78, DK.boat + 1.5, 0], view: [70, DK.boat + 7, 13], r: 9,
    text: 'The deckhouse around the first funnel held the officers\' cabins and the Marconi wireless room. Its roof has fallen in, and the funnel has left an open casing.', src: 'W6, W7' },
  { part: 0, name: 'Grand staircase', at: [97.2, DK.boat, 0], view: [90, DK.boat + 7, 7], r: 9,
    text: 'An open shaft where the forward grand staircase and its glass dome stood. Remotely operated vehicles use it to reach the decks below.', src: 'W6' },
  { part: 0, name: 'The break', at: [BOW_END - 12, DK.D, 0], view: [BOW_END + 26, DK.D + 2, 3], r: 24,
    text: 'The hull parted between the second and third funnels. Here the decks have collapsed on to one another and slope down toward the torn end.', src: 'W5, W6' },
  { part: 1, name: 'Stern and propellers', at: [XAP - 4, 16, 0], view: [LOA + 20, 31, 16], r: 36,
    text: 'The stern section lies about 600 m from the bow and is far more broken: its decks pancaked and its plating splayed outward. The rudder is buried up to 15 m deep. The bronze wing propellers were wrenched upward and rest on the mud.', src: 'W1, W6, W9' },
  { part: 0, name: 'Inside: the grand staircase', at: [97, DK.D + 1.2, 0], view: [105, DK.D + 1.5, 2.5], r: 7,
    text: 'The staircase itself was wood and is gone, leaving an open shaft from the boat deck down to E deck. Drop down it and you can swim out along each deck. Dive vehicles enter the ship this way.', src: 'W6, W9' },
  { part: 0, name: 'Inside: boiler room No. 2', at: [139, 5, 0], view: [BOW_END + 9, 7, 4], r: 12,
    text: 'Five double-ended boilers, each 4.8 m across, still sit side by side where the hull tore open. The single-ended boilers of room No. 1, just aft of here, fell out and lie near the stern.', src: 'A1, A2, W6, W9' },
  { part: 0, name: 'Inside: No. 1 funnel uptake', at: [FUNNEL[0], DK.D, 0], view: [FUNNEL[0], DK.boat + 6, 0.5], r: 7,
    text: 'The funnel is gone and its casing is an open oval shaft, 7.5 m by 5.8 m, leading down through every deck to boiler rooms 5 and 6.', src: 'A1, W6' },
  { part: 1, name: 'Reciprocating engines', at: [ENGINE_X[1], 9, 0], view: [STERN0 - 13, 14, 10], r: 22,
    text: 'The two main engines stand at the torn end of the stern, in the open, their cylinder covers 11 m above the engine room floor. Each had four cylinders; the forward one of each broke away with the hull and lies in the debris field. You can swim between the columns, under the cylinders, and along the working platforms.', src: 'A1, A7, W5, W6' },
  { part: 0, name: 'Inside: the first class lifts', at: [LIFT[1], DK.C + 1.2, 0], view: [STAIR[1] - 0.6, DK.C + 1.4, 1.2], r: 4,
    text: 'Three lifts ran side by side from E deck to A deck, just forward of the staircase. Their iron grilles still hang across the openings on each deck.', src: 'A2, A3, W6, W18' },
  { part: 0, name: 'Inside: D deck reception room', at: [104, DK.D + 1.3, -6], view: [90.5, DK.D + 1.5, 9], r: 10,
    text: 'First class passengers came aboard here through the gangway doors in the ship\'s side; the port one has fallen away and you can swim in through it. The room\'s pillar casings, panelling and most of its leaded windows survive under deep silt. Only a corner of the dining saloon beyond is left.', src: 'A3, W6, W9, W16, W17' },
  { part: 0, name: 'Inside: Scotland Road', at: [80, DK.E + 1.3, 4.1], view: [58, DK.E + 1.4, 4.1], r: 5,
    text: 'The crew\'s working passage ran most of the length of E deck on the port side, wide enough to move stores and men quickly. Its forward part was explored by remotely operated vehicles in 2005.', src: 'A3, W16' },
  { part: 0, name: 'Inside: Turkish bath cooling room', at: [102, DK.F + 1, -11], view: [102, DK.F + 1.3, -5.5], r: 5,
    text: 'One of the best preserved rooms on the ship: its tiles, teak and loungers were found in remarkable condition in 2005. It is reached down the staircase shaft, through the cut-out to F deck.', src: 'A3, W16, W17' },
  { part: 0, name: 'Marconi room', at: [90.6, DK.boat + 1, 0.8], view: [85.5, DK.boat + 3.2, -3], r: 5,
    text: 'The wireless rooms that sent the distress calls. The wooden walls have gone, but the transmitter, switchboards and motor generator of the silent room are still largely intact under a failing roof.', src: 'A2, A3, W16, W19' },
  { part: 0, name: 'Captain\'s bathroom', at: [76.7, DK.boat + 0.5, -5.5], view: [74, DK.boat + 2.6, -10.5], r: 4,
    text: 'The outer wall of Captain Smith\'s quarters fell away in the 1990s and left his bath in view. It was reported lost in 2019 and seen again under debris in 2021.', src: 'A3, W9' },
];
const POI_BOILERS = { name: 'Boilers', r: 22, text: 'Five single-ended boilers from boiler room No. 1, where the hull parted. They fell straight down from the surface, so they mark the spot where the ship broke up.', src: 'W1, W9' };
