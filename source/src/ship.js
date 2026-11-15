// ============================================================================
// RMS Titanic: as-built dimensions, and the hull and fittings generated from them
// ============================================================================
// Ship coordinates, used by every function here and by the wreck shader:
//   x = metres aft of the stem head (the forward tip of the forecastle deck)
//   y = metres above the keel
//   z = metres to port of the centreline
// Where each number comes from is logged in docs/SOURCES.md ("Used where"). Numbers marked "est." are read off
// the 1911 plans or estimated from photographs, not surveyed: see "Known approximations" in that file.
const FT = 0.3048;
const LOA = 882.75 * FT;    // length overall, 882 ft 9 in [A1]
const LBP = 850 * FT;       // length between perpendiculars [A1]
const BEAM = 92.5 * FT;     // extreme breadth, 92 ft 6 in [A1]
const WL = 34.58 * FT;      // load draught, 34 ft 7 in [A2]
const FP = 5.5 * FT;        // forward perpendicular, abaft the stem head (measured on Plate III) [A3]
const XAP = FP + LBP;       // aft perpendicular (the rudder post)
// deck heights above the keel amidships, at the ship's side: waterline heights from the 1912 inquiry report plus
// the draught [A2]
const DK = { G: 29.08 * FT, F: 37.08 * FT, E: 45.58 * FT, D: 54.58 * FT, C: 65.08 * FT, B: 74.08 * FT, A: 83.08 * FT, boat: 92.58 * FT };
// sheer: the decks rise 13 ft to the bow and 5 ft to the stern [A2]; [rise, how far from the end it starts] (the
// curve between is est.)
const SHEER_F = [13 * FT, 131], SHEER_A = [5 * FT, 138];
const sheer = (x) => { const f = max(1 - x / SHEER_F[1], 0), a = max((x - SHEER_A[1]) / (LOA - SHEER_A[1]), 0); return SHEER_F[0] * f * f + SHEER_A[0] * a * a; };
// weather decks, fore to aft: forecastle (128 ft [A1]), forward well deck, superstructure, aft well deck, poop.
// Ends of the superstructure and poop measured on Plates III and IV [A3]
const FC_END = 128 * FT, SUP0 = 181.5 * FT, SUP1 = 723 * FT, POOP0 = 776 * FT;
const BRIDGE = 190 * FT;    // front of the navigating bridge, "190 feet from the bow" [A2]
// funnel centres at the boat deck, measured on Plate III (within 5 ft) [A3]; each 24 ft 6 in by 19 ft [A1]
const FUNNEL = [246 * FT, 363.5 * FT, 482.5 * FT, 599 * FT];
const FUN_L = 24.5 * FT / 2, FUN_W = 19 * FT / 2;
// rows of portholes for the shader: [height above the keel amidships, spacing] (est.: real rows are irregular)
const PORT_ROWS = [[DK.F + 1.35, 2.74], [DK.E + 1.4, 2.74], [DK.D + 1.45, 3.66], [DK.C + 1.45, 3.66]];
// Where the hull parted, and what is left. The bow's tear runs through the No. 3 funnel uptake [W5, W6]; the
// bow section is quoted as 137 to 143 m long and the stern section as 105 to 110 m [W9]
const BOW_END = 143, STERN0 = 161;
const STEM_TOP = DK.B + SHEER_F[0];

// ---------------------------------------------------------------- hull form
// No builder's table of offsets is in the public domain. These half breadths were measured from the deck
// outlines on Plates IV and V of The Shipbuilder, June 1911 [A3], as fractions of the full half beam:
// [feet abaft the forward perpendicular, C deck, G deck, orlop deck, tank top]
const OFFSETS = [[-5.5, 0, 0, 0, 0], [-3, .015, 0, 0, 0], [0, .063, .008, 0, 0], [10, .199, .065, .06, .02], [21.25, .332, .128, .10, .06],
  [42.5, .537, .247, .22, .15], [63.75, .667, .362, .33, .24], [85, .756, .479, .43, .32], [127.5, .831, .677, .58, .53], [170, .914, .817, .77, .71],
  [212.5, .967, .916, .91, .82], [255, .992, .966, .97, .92], [297.5, .998, .991, .99, .97], [340, 1, .995, 1, .99], [382.5, 1, .998, 1, 1],
  [425, 1, .997, 1, 1], [467.5, .998, .995, 1, 1], [510, .993, .995, .99, .99], [552.5, .989, .991, .99, .96], [595, .985, .987, .99, .91],
  [637.5, .978, .962, .95, .82], [680, .965, .907, .87, .70], [722.5, .940, .802, .71, .56], [765, .897, .594, .51, .47],
  // abaft here the tank top plan shows the shaft tunnels, not the hull: its values are est.
  [786.25, .870, .470, .38, .34], [807.5, .822, .322, .25, .21], [828.75, .760, .168, .11, .09], [839, .720, .092, .05, .04],
  [850, .665, 0, 0, 0], [860, .603, 0, 0, 0], [870, .5, 0, 0, 0], [877, .33, 0, 0, 0], [877.25, 0, 0, 0, 0]];
const LEVEL = [1.6, 21.08 * FT, DK.G, DK.C]; // heights of the tank top, orlop, G and C decks
// Half breadth of the hull at (x, y): between the measured levels and stations it is interpolated; the sides are
// vertical above C deck, and below the tank top the bottom is nearly flat with a tight turn of bilge [A1, Fig. 14]
function hullHalf(x, y) {
  const f = x / FT - 5.5;
  if (f <= -5.5 || f >= 877.25) return 0;
  if (y < 0) y = 0;
  let i = 1; while (OFFSETS[i][0] < f) i++;
  const a = OFFSETS[i - 1], b = OFFSETS[i], t = (f - a[0]) / (b[0] - a[0]), sh = sheer(x);
  const tank = mix(a[4], b[4], t), orl = mix(a[3], b[3], t), g = mix(a[2], b[2], t), c = mix(a[1], b[1], t);
  const yg = LEVEL[2] + sh, yc = LEVEL[3] + sh;
  const h = y < LEVEL[0] ? tank * pow(y / LEVEL[0], 0.3) : y < LEVEL[1] ? mix(tank, orl, (y - LEVEL[0]) / (LEVEL[1] - LEVEL[0])) : y < yg ? mix(orl, g, (y - LEVEL[1]) / (yg - LEVEL[1])) : y < yc ? mix(g, c, (y - yg) / (yc - yg)) : c;
  return BEAM / 2 * h;
}
// top edge of the side plating: the forecastle and poop at B deck level, bulwarks along the well decks, and the
// A deck bulwark along the superstructure
const shellTop = (x) => (x < FC_END || x > POOP0 ? DK.B : x < SUP0 || x > SUP1 ? DK.C + 1.2 : DK.A + 1.1) + sheer(x);
// the highest solid deck at x, for collisions: the boat deck along the superstructure
const solidTop = (x) => (x < FC_END || x > POOP0 ? DK.B : x < SUP0 || x > SUP1 ? DK.C : x < BRIDGE ? DK.A : DK.boat) + sheer(x);

// ---------------------------------------------------------------- mesh helpers (ship coordinates)
// six faces with their own vertices
function box(m, x0, x1, y0, y1, z0, z1, aux = 0) {
  const P = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  for (const f of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [3, 7, 6, 2], [0, 4, 7, 3], [1, 2, 6, 5]]) m.quad(...f.map((k) => m.v(...P[k], aux)));
}
// upright or lying cylinder from a to b; rad may be a list of radii along it
function cyl(m, a, b, rad, aux = 0, sides = 12) {
  const n = Array.isArray(rad) ? rad.length - 1 : 1, pts = [];
  for (let k = 0; k <= n; k++) pts.push([mix(a[0], b[0], k / n), mix(a[1], b[1], k / n), mix(a[2], b[2], k / n)]);
  m.tube(pts, Array.isArray(rad) ? (k) => rad[k] : rad, sides, true, () => aux);
}
// thin bar along a polyline
const bar = (m, pts, w, aux = 0, h = w) => { const n0 = m.aux.length; m.sweep(pts, w, h, () => abs(pts[1][1] - pts[0][1]) > abs(pts[1][0] - pts[0][0]) + abs(pts[1][2] - pts[0][2]) ? [1, 0, 0] : [0, 1, 0]); for (let k = n0; k < m.aux.length; k++) m.aux[k] = aux; };
// A deck between the ship's sides from x0 to x1 at height yFn(x), 1 m cells, with holes cut out.
// holes: [x0, x1, half width, 1 if elliptical]
function deckPlate(m, x0, x1, yFn, holes, aux, inset = 0.05, there = null) {
  const NZ = 28; let prev = null, px = 0;
  for (let x = x0; x <= x1 + 1e-3; x = min(x + 1, x1) + (x >= x1 ? 1 : 0)) {
    const y = yFn(x), h = max(hullHalf(x, y) - inset, 0), row = [];
    for (let k = 0; k <= NZ; k++) row.push(m.v(x, y, h * (k / NZ * 2 - 1), aux));
    if (prev) for (let k = 0; k < NZ; k++) {
      const cx = (x + px) / 2, cz = h * ((k + 0.5) / NZ * 2 - 1);
      let open = false;
      for (const o of holes) { const u = (cx - (o[0] + o[1]) / 2) / ((o[1] - o[0]) / 2), w = cz / o[2]; if (o[3] ? u * u + w * w < 1 : abs(u) < 1 && abs(w) < 1) open = true; }
      if (!open && (!there || there(cx, y))) m.quad(prev[k], prev[k + 1], row[k + 1], row[k]);
    }
    prev = row; px = x;
  }
}
const inHole = (holes, x, z, m = 0) => {
  for (const o of holes) { const a = (o[1] - o[0]) / 2 - m, b = o[2] - m, u = (x - (o[0] + o[1]) / 2) / a, w = z / b; if (a > 0 && b > 0 && (o[3] ? u * u + w * w < 1 : abs(u) < 1 && abs(w) < 1)) return true; }
  return false;
};
// rail on stanchions along the deck edge from x0 to x1 on side sg
function railing(m, x0, x1, yFn, sg, inset = 0.25) {
  const top = [], mid = [];
  for (let x = x0; x <= x1; x += 2) {
    const y = yFn(x), z = sg * (hullHalf(x, y) - inset);
    bar(m, [[x, y, z], [x, y + 1.05, z]], 0.06);
    top.push([x, y + 1.05, z]); mid.push([x, y + 0.55, z]);
  }
  if (top.length > 1) { bar(m, top, 0.06); bar(m, mid, 0.04); }
}
// pair of bollards on a base plate
function bollards(m, x, y, z) {
  box(m, x - 0.9, x + 0.9, y, y + 0.12, z - 0.4, z + 0.4);
  for (const d of [-0.5, 0.5]) cyl(m, [x + d, y, z], [x + d, y + 0.75, z], [0.22, 0.22, 0.3], 0, 10);
}
// capstan or windlass drum: a waisted drum on a base
const capstan = (m, x, y, z, r, h) => cyl(m, [x, y, z], [x, y + h, z], [r * 1.25, r, r * 0.72, r * 0.8, r * 1.05, r * 0.5], 0, 14);
// hatch coaming around an opening
function coaming(m, x0, x1, y, hw, h = 0.9) {
  const t = 0.12;
  box(m, x0 - t, x0, y, y + h, -hw - t, hw + t); box(m, x1, x1 + t, y, y + h, -hw - t, hw + t);
  box(m, x0, x1, y, y + h, -hw - t, -hw); box(m, x0, x1, y, y + h, hw, hw + t);
}
// stockless anchor hanging from a hawse pipe on side sg: shank up into the pipe, flukes flat against the plating
function sideAnchor(m, x, y, sg) {
  const z = sg * (hullHalf(x, y) + 0.3);
  box(m, x - 0.25, x + 0.25, y, y + 3.2, z - 0.2, z + 0.2);
  box(m, x - 1.5, x + 1.5, y - 0.7, y, z - 0.35, z + 0.35);
  for (const d of [-1, 1]) box(m, x + d * 1.5 - 0.3, x + d * 1.5 + 0.3, y - 0.7, y + 1.9, z - 0.22, z + 0.22);
  cyl(m, [x, y + 3.4, z - sg * 0.9], [x, y + 3.4, z + sg * 0.5], 0.75, 1, 12); // hawse pipe mouth
}

// Steel partitions standing on a deck, as thin panels: { lvl, h, x0, x1, z0, z1 } with x0 === x1 (athwartships) or
// z0 === z1 (fore and aft). room() walls a rectangle and leaves doorways: doors = [[side, where, width], ...] with
// side 'f' forward, 'a' aft, 'p' port, 's' starboard and `where` the doorway's centre along that wall.
function room(lvl, h, x0, x1, z0, z1, doors = [], aux = 0.6) {
  const out = [], wall = (side, a, b, fixed) => {
    let cuts = doors.filter((d) => d[0] === side).map((d) => [d[1] - d[2] / 2, d[1] + d[2] / 2]).sort((p, q) => p[0] - q[0]), at = a;
    for (const c of [...cuts, [b, b]]) { if (c[0] > at + 0.05) out.push(side === 'f' || side === 'a' ? { lvl, h, aux, x0: fixed, x1: fixed, z0: at, z1: c[0] } : { lvl, h, aux, x0: at, x1: c[0], z0: fixed, z1: fixed }); at = c[1]; }
  };
  wall('f', z0, z1, x0); wall('a', z0, z1, x1); wall('s', x0, x1, z0); wall('p', x0, x1, z1);
  return out;
}
function meshPanels(m, panels) {
  for (const p of panels) {
    if (p.grille) continue; // drawn as bars by the section
    if (p.x0 === p.x1) box(m, p.x0 - 0.03, p.x0 + 0.03, p.lvl + sheer(p.x0), p.lvl + sheer(p.x0) + p.h, p.z0, p.z1, p.aux ?? 0.6);
    else for (let x = p.x0; x < p.x1 - 0.01; x += 4) { const e = min(x + 4, p.x1), y = p.lvl + sheer((x + e) / 2); box(m, x, e, y, y + p.h, p.z0 - 0.03, p.z0 + 0.03, p.aux ?? 0.6); }
  }
}

// ---------------------------------------------------------------- a hull section
// o.x0, o.x1: its extent; o.gap(x, y, side): plating that is gone; o.deckEnd(y): where the decks inside stop;
// o.fit(m): adds the fittings; o.warp(x, y, z): the damage, applied to every vertex at the end
function meshSection(o) {
  const m = new Mesh(), NR = 30;
  const xs = [];
  for (let x = o.x0; x < o.x1; x += x < 12 ? 0.5 : 1) xs.push(x);
  xs.push(o.x1);
  for (const b of [FC_END, SUP0, SUP1, POOP0]) if (b > o.x0 && b < o.x1) xs.push(b - 0.02, b + 0.02);
  xs.sort((a, b) => a - b);
  // shell plating, keel to deck edge, both sides
  for (const sg of [-1, 1]) {
    let prev = null, px = 0;
    for (const x of xs) {
      const top = shellTop(x), row = [];
      for (let j = 0; j <= NR; j++) { const y = top * pow(j / NR, 1.5); row.push(m.v(x, y, sg * hullHalf(x, y), 0.2)); }
      if (prev) for (let j = 0; j < NR; j++) if (!o.gap || !o.gap((x + px) / 2, top * pow((j + 0.5) / NR, 1.5), sg)) m.quad(prev[j], row[j], row[j + 1], prev[j + 1]);
      prev = row; px = x;
    }
  }
  // every deck, with its openings, as far as it survives
  for (const d of o.decks) deckPlate(m, d.x0, d.x1, (x) => d.lvl + sheer(x), d.holes, 0.4, 0.05, o.deckEnd);
  // transverse bulkheads and walls
  for (const w of o.walls) {
    let prev = null;
    for (let j = 0; j <= 12; j++) {
      const y = mix(w.y0, w.y1, j / 12) + (w.sheer ? sheer(w.x) : 0), h = hullHalf(w.x, y) - 0.05, row = [];
      for (let k = 0; k <= 14; k++) row.push(m.v(w.x, y, h * (k / 7 - 1), w.aux || 0));
      if (prev) for (let k = 0; k < 14; k++) if (!(w.notch && abs(h * ((k + 0.5) / 7 - 1)) < FUN_W && y > DK.F)) m.quad(prev[k], prev[k + 1], row[k + 1], row[k]);
      prev = row;
    }
  }
  if (o.panels) meshPanels(m, o.panels);
  // funnel uptake casings: elliptical shafts from the boiler rooms to the boat deck
  for (const c of o.tubes) {
    let prev = null;
    for (let j = 0; j <= 8; j++) {
      const y = mix(c.y0, c.y1, j / 8) + sheer(c.x), row = [];
      for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU; row.push(m.v(c.x + cos(a) * c.a, y, sin(a) * c.b, 0)); }
      if (prev) for (let k = 0; k < 24; k++) m.quad(prev[k], prev[k + 1], row[k + 1], row[k]);
      prev = row;
    }
  }
  o.fit(m);
  for (let k = 0; k < m.p.length; k += 3) { const p = o.warp(m.p[k], m.p[k + 1], m.p[k + 2]); m.p[k] = p[0]; m.p[k + 1] = p[1]; m.p[k + 2] = p[2]; }
  if (o.after) o.after(m); // things the damage left standing
  return m;
}

// ---------------------------------------------------------------- the bow section as it lies today
// Upright and largely whole from the stem to the break aft of the second funnel. The decks at the torn end have
// collapsed on to each other and slope down toward the break; the wheelhouse, funnels and most deckhouse roofs
// are gone, and the foremast has fallen back across the well deck on to the bridge.
const bowTear = (y) => BOW_END - 9 + 7 * vnoise(y * 0.31, 3.3, 0) + 0.25 * y;
// The bow is bent downward in two places: 6 to 10 degrees under the well deck cranes and about 4 degrees under
// the forward expansion joint [W5, W6]. bowDrop(x): how far the hull at x hangs below its as-built line (8 degrees
// is used for the first bend).
const BEND = [[52.7, Math.tan(8 * PI / 180)], [86.4, Math.tan(4 * PI / 180)]];
const bowDrop = (x) => BEND[0][1] * max(BEND[0][0] - x, 0) + BEND[1][1] * max(BEND[1][0] - x, 0);
const bowSag = (x, y) => { const t = max(x - (BOW_END - 30), 0); return t * t * 0.011 * sstep(DK.D, DK.boat, y); };
// openings: [x0, x1, half width, 1 if elliptical]. Hatches Nos. 1 to 3 and the funnel uptakes run down through
// every deck; the grand staircase is an open shaft from the boat deck to E deck [W6]
// Hatch positions are measured on the plates against the bulkheads (the bow of Plate IV sits about 5 ft off the
// other plates, so these are good to about 1.5 m) [A3]
const H1 = [78 * FT, 90.5 * FT, 2.13], H2 = [130 * FT, 147 * FT, 2.97], H3 = [156 * FT, 168 * FT, 3.05];
const F1 = [FUNNEL[0] - FUN_L, FUNNEL[0] + FUN_L, FUN_W, 1], F2 = [FUNNEL[1] - FUN_L, FUNNEL[1] + FUN_L, FUN_W, 1];
// the well of the forward grand staircase: 20 ft wide, 15 ft long, under the dome 97.9 m from the stem [A3, W6]
const STAIR = [311 * FT, 327 * FT, 3.05];
// the trunk of the three first class lifts, just forward of the staircase, A deck to E deck [A2, A3]; and the
// cut-out by which the staircase shaft reaches F deck [W6] (its size is est.)
const LIFT = [303 * FT, 311 * FT, 3.05], CUT = [97.2, 99.4, 1.5];
const SCREEN_Z = 13.1; // the window screens stand about 1 m inboard of the ship's side (est.)
const TWEEN = (lvl) => (lvl === DK.A ? 9.5 : lvl === DK.D ? 10.5 : lvl === DK.F ? 8.5 : 9) * FT; // height to the deck above [A2]
// watertight bulkheads A to H: metres from the stem (the inquiry report's compartment lengths, from the forward
// perpendicular) and the deck each rises to [A2]. E and G stand under the funnel uptakes, which branch over them.
const BULKHEADS = [[46, DK.D], [91, DK.D], [142, DK.E], [193, DK.E], [247, DK.E, 1], [304, DK.E], [361, DK.E, 1], [418, DK.E]].map((b) => ({ x: b[0] * FT + FP, y0: 1.6, y1: b[1], sheer: 1, notch: b[2] }));
const BOW = {
  x0: 0, x1: BOW_END + 6,
  // plating gone at the torn end, and a large vertical tear in the port side under the first funnel [W5]
  // and the port D deck gangway door, which was found open in 1986 and has since fallen away (73.5 by 56 in,
  // about 298 to 308 ft from the stem) [W9, W17]
  gap: (x, y, sg) => x > bowTear(y + sg * 3) || (sg > 0 && abs(x - 72) < 1.3 + 1.2 * vnoise(y * 0.5, 9.1, 0) && y > DK.G && y < DK.C + sheer(x))
    || (sg > 0 && abs(x - 92.4) < 0.95 && y > DK.D + sheer(x) && y < DK.D + sheer(x) + 2.1),
  deckEnd: (x, y) => x < bowTear(y) - 2,
  // the two bends, the upper decks sagging toward the break, and the sides leaning out there
  warp: (x, y, z) => { const t = max(x - (BOW_END - 30), 0); return [x, y - bowDrop(x) - bowSag(x, y), z * (1 + t * t * 0.00012 * sstep(DK.E, DK.A, y))]; },
  unY: (x, y) => y + bowDrop(x),
  wide: () => 1,
  // decks: level, extent, openings. Forecastle, well deck, A and boat decks are open to the water above
  decks: [
    { lvl: DK.boat, x0: BRIDGE - 0.6, x1: BOW_END - 4, holes: [F1, F2, STAIR, [86.1, 86.8, 20]] }, // the forward expansion joint has pulled open
    { lvl: DK.A, x0: SUP0, x1: BOW_END, holes: [F1, F2, STAIR, LIFT] },
    { lvl: DK.B, x0: 0.6, x1: FC_END, holes: [[1.4, 5.2, 1.0], H1] },
    { lvl: DK.B, x0: SUP0, x1: BOW_END + 6, holes: [F1, F2, STAIR, LIFT] },
    { lvl: DK.C, x0: 1, x1: FC_END, holes: [H1] },
    { lvl: DK.C, x0: FC_END, x1: SUP0, holes: [H2, H3] },
    { lvl: DK.C, x0: SUP0, x1: BOW_END + 6, holes: [F1, F2, STAIR, LIFT] },
    { lvl: DK.D, x0: 1, x1: BOW_END + 6, holes: [H1, H2, H3, F1, F2, STAIR, LIFT] },
    { lvl: DK.E, x0: 1, x1: BOW_END + 6, holes: [H1, H2, H3, F1, F2, CUT] },
    { lvl: DK.F, x0: 2, x1: BOW_END + 6, holes: [H1, H2, H3, F1, F2] },
    { lvl: DK.G, x0: 3, x1: BOW_END + 6, holes: [H1, H2, H3, F1, F2] },
  ],
  // Steel partitions that still stand. The softwood cabin walls have been eaten away [W16, W17].
  panels: [
    // lift trunk: steel sides and front on each deck; the iron grilles still hang across the openings facing the stairs
    ...[DK.A, DK.B, DK.C, DK.D].flatMap((lvl) => [{ lvl, h: TWEEN(lvl), x0: LIFT[0], x1: LIFT[1], z0: -3.05, z1: -3.05 }, { lvl, h: TWEEN(lvl), x0: LIFT[0], x1: LIFT[1], z0: 3.05, z1: 3.05 },
      { lvl, h: TWEEN(lvl), x0: LIFT[0], x1: LIFT[0], z0: -3.05, z1: 3.05 }, { lvl, h: TWEEN(lvl), x0: LIFT[1], x1: LIFT[1], z0: -3.05, z1: 3.05, grille: 1 }]),
    // "Scotland Road", the crew's working passage down the port side of E deck, 8 ft wide, from 184 ft aft [A3, W16]
    ...[0, 1, 2, 3, 4, 5].flatMap((k) => [9.5 * FT, 17.5 * FT].map((z) => ({ lvl: DK.E, h: TWEEN(DK.E), x0: 184 * FT + k * 10.6, x1: 184 * FT + k * 10.6 + 9.2, z0: z, z1: z }))),
    // D deck: the forward wall of the first class reception room (288 ft) and the wall between it and the dining
    // saloon (371 ft), each with its doorways (doorways est.)
    ...[[-13.9, -6], [-4.2, 4.2], [6, 13.9]].map((z) => ({ lvl: DK.D, h: TWEEN(DK.D), aux: 0.1, x0: 288 * FT, x1: 288 * FT, z0: z[0], z1: z[1] })),
    ...[[-13.9, -8.6], [-6.6, -3.1], [3.1, 6.6], [8.6, 13.9]].map((z) => ({ lvl: DK.D, h: TWEEN(DK.D), aux: 0.1, x0: 371 * FT, x1: 371 * FT, z0: z[0], z1: z[1] })),
    // the screens of leaded windows that stand inboard of the portholes down each side of the reception room, aft
    // of the gangway vestibules (318 ft), and in the saloon's surviving starboard corner [W16, W17]. Drawn by the
    // section; listed here so the camera cannot pass through them
    ...[-1, 1].map((sg) => ({ lvl: DK.D, h: TWEEN(DK.D), x0: 318 * FT, x1: 371 * FT - 0.2, z0: sg * SCREEN_Z, z1: sg * SCREEN_Z, grille: 1 })),
    { lvl: DK.D, h: TWEEN(DK.D), x0: 371 * FT + 0.2, x1: 119, z0: -SCREEN_Z, z1: -SCREEN_Z, grille: 1 },
    // F deck: the cooling room of the Turkish baths, starboard, 325 to 344 ft [A3, W16, W17]
    ...room(DK.F, TWEEN(DK.F), 325 * FT, 344 * FT, -13.7, -24 * FT, [['p', 102, 1.5]], 0.3),
  ],
  // solid things the camera cannot pass through: the boilers, and the Marconi set
  blocks: [
    ...[[68.7, 4], [85.6, 5], [103, 5], [120.4, 5], [139, 5]].flatMap(([x, n]) => Array.from({ length: n }, (_, k) => { const z = (n === 4 ? [-26, -8.75, 8.75, 26] : [-34, -17, 0, 17, 34])[k] * FT; return { x0: x - 3.05, x1: x + 3.05, y0: 2.1, y1: 7, z0: z - 2.1, z1: z + 2.1 }; })),
    { x0: 90.1, x1: 91.3, y0: DK.boat, y1: DK.boat + 1.7, z0: -0.7, z1: 0.7 },
  ],
  walls: [...BULKHEADS, { x: FC_END, y0: DK.C, y1: DK.B, sheer: 1, aux: 0.6 }, { x: SUP0, y0: DK.C, y1: DK.A + 1.1, sheer: 1, aux: 0.6 }],
  tubes: [{ x: FUNNEL[0], y0: DK.E, y1: DK.boat, a: FUN_L, b: FUN_W }, { x: FUNNEL[1], y0: DK.E, y1: DK.boat, a: FUN_L, b: FUN_W }],
};
function meshBow() {
  const fc = (x) => DK.B + sheer(x), well = (x) => DK.C + sheer(x), ad = (x) => DK.A + sheer(x), bd = (x) => DK.boat + sheer(x);
  return meshSection({
    ...BOW,
    fit: (m) => {
      rseed(300);
      // ---- forecastle
      for (const sg of [-1, 1]) {
        // the port bow railing's forward 4.5 m fell off between 2022 and 2024
        railing(m, sg > 0 ? 6 : 1.5, FC_END - 0.5, fc, sg);
        for (const x of [5.5, 9, 30, 35.5]) bollards(m, x, fc(x), sg * (hullHalf(x, fc(x)) - 1.3));
        capstan(m, 15.8, fc(15.8), sg * 1.9, 1.0, 1.2);         // anchor cable holders (position est.)
        capstan(m, 11.9, fc(11.9), sg * 2.6, 0.55, 1.0);        // capstans, as placed on Plate IV [A3]
        capstan(m, 20.1, fc(20.1), sg * 3.87, 0.55, 1.0);
        // anchor chain: hawse pipe to wildcat
        bar(m, [[7.2, fc(7.2) + 0.12, sg * 1.7], [14.8, fc(14.8) + 0.14, sg * 1.9]], 0.26);
        sideAnchor(m, 8.6, fc(8.6) - 7.4, sg);
        // breakwater: a low V of plate ahead of No. 1 hatch
        bar(m, [[22.7, fc(22.7) + 0.45, sg * 0.1], [25.9, fc(25.9) + 0.45, sg * 8.2]], 0.1, 0, 0.9);
      }
      // centre anchor in its well at the stem, and the crane that handled it
      box(m, 1.8, 4.9, fc(3) - 0.5, fc(3) - 0.1, -0.5, 0.5);
      cyl(m, [6.6, fc(6.6), 0], [6.6, fc(6.6) + 1.6, 0], [0.55, 0.45, 0.4], 0, 12);
      bar(m, [[6.6, fc(6.6) + 1.5, 0], [3.2, fc(4) + 4.6, 0]], 0.3);
      coaming(m, H1[0], H1[1], fc(25.7), 2.13, 1.1);                // No. 1 hatch: the cover was blown off as the bow hit
      // break of the forecastle, and the fallen foremast: foot on the forecastle, head on the port bridge wing
      cyl(m, [38.2, fc(38.2) + 0.5, 0], [BRIDGE + 1.5, bd(BRIDGE) + 0.5, 4.5], [0.61, 0.56, 0.5, 0.44], 0, 12); // 4 ft across at the foot
      cyl(m, [47.2, fc(40) + 1.5, 1.45], [47.2, fc(40) + 1.5, 1.2], 0.42, 1, 10); // crow's nest doorway
      // ---- forward well deck: No. 2 and No. 3 hatches, two cargo cranes
      coaming(m, H2[0], H2[1], well(42), 2.97); coaming(m, H3[0], H3[1], well(49.4), 3.05);
      for (const sg of [-1, 1]) {
        // the two cargo cranes of No. 3 hatch, 23 ft off the centreline: wrenched over, jibs lying against the deck
        cyl(m, [52.7, well(52.7), sg * 7], [52.7, well(52.7) + 2.3, sg * 7], [0.7, 0.6, 0.75], 0, 12);
        bar(m, [[52.7, well(52.7) + 2.2, sg * 7], [45, well(45) + 0.6, sg * 9.5]], 0.34);
      }
      // ---- superstructure front: B deck, A deck, then the bridge on the boat deck
      const hA = (x) => hullHalf(x, DK.A) - 4.4;
      for (const sg of [-1, 1]) {
        // A deck: deckhouse wall behind the promenade, and the frames of the promenade screen
        for (let x = SUP0 + 5; x < BOW_END - 14; x += 3) box(m, x, x + 3, ad(x), bd(x), sg * hA(x) - 0.03, sg * hA(x) + 0.03, rnd() < 0.85 ? 0.6 : 1);
        for (let x = SUP0 + 2; x < BOW_END - 12; x += 2.6) bar(m, [[x, ad(x) + 1.1, sg * (hullHalf(x, DK.A) - 0.06)], [x, bd(x), sg * (hullHalf(x, DK.A) - 0.06)]], 0.1, 0.6);
        // boat deck: officers' quarters around the first funnel; the roof has fallen in
        // (224 to 310 ft from the stem, 48 ft wide [A3]); the starboard side had collapsed by 2019 [W9]
        for (let x = 68.3; x < 94; x += 3) if (rnd() < (sg < 0 ? 0.35 : 0.85)) box(m, x, x + 3, bd(x), bd(x) + rr(1.2, 2.7), sg * 7.3 - 0.03, sg * 7.3 + 0.03, 0.6);
        // davits of the forward boats; most have gone
        for (const x of [67.1]) { const z = sg * (hullHalf(x, DK.boat) - 0.5), y = bd(x); m.tube([[x, y, z], [x, y + 2.6, z], [x, y + 3.4, z + sg * 0.5], [x, y + 3.6, z + sg * 1.5]], 0.13, 8, true, () => 0); }
        railing(m, BRIDGE + 2, BOW_END - 16, bd, sg, 0.1);
      }
      box(m, SUP0 + 5, SUP0 + 5.06, ad(SUP0), bd(SUP0), -hA(SUP0 + 5), hA(SUP0 + 5), 0.6);
      // the bridge: only the bronze telemotor that held the ship's wheel still stands
      cyl(m, [BRIDGE + 3.6, bd(BRIDGE), 0], [BRIDGE + 3.6, bd(BRIDGE) + 1.15, 0], [0.34, 0.2, 0.17, 0.2, 0.3, 0.3], 0.8, 14);
      box(m, 68.3, 68.36, bd(68), bd(68) + 2.2, -7.3, 7.3, 0.6);
      // steam winches beside Nos. 1 and 2 hatches (positions est.)
      for (const [x, z, y] of [[29.3, -3.6, fc(29.3)], [29.3, 3.6, fc(29.3)], [45.9, -4.6, well(45.9)], [45.9, 4.6, well(45.9)]]) { box(m, x - 0.9, x + 0.9, y, y + 0.5, z - 0.6, z + 0.6); cyl(m, [x, y + 0.75, z - 0.9], [x, y + 0.75, z + 0.9], 0.38, 0, 10); }
      // stubs of the davits along the boat deck edge at each lifeboat station [A3]; a pair lies thrown against the
      // port side of the bridge beside the mast head [W6]
      for (const sg of [-1, 1]) for (const x of [75.9, 78, 86.7, 88.9, 97.4, 100, 108.8]) { const z = sg * (hullHalf(x, DK.boat) - 0.5); cyl(m, [x, bd(x), z], [x, bd(x) + rr(0.3, 0.9), z], 0.16, 0, 8); }
      for (const d of [0, 1.1]) m.tube([[BRIDGE + 4 + d, bd(BRIDGE) + 0.2, 7.5], [BRIDGE + 5 + d, bd(BRIDGE) + 0.25, 10], [BRIDGE + 5.6 + d, bd(BRIDGE) + 0.5, 11.2]], 0.13, 8, true, () => 0);
      // footings of the wheelhouse walls (207 to 224 ft from the stem) [A3, W6]
      for (const sg of [-1, 1]) box(m, 63.1, 68.3, bd(65), bd(65) + 0.25, sg * 3.2 - 0.05, sg * 3.2 + 0.05, 0.6);
      box(m, 63.1, 63.2, bd(63), bd(63) + 0.25, -3.2, 3.2, 0.6);
      // first class entrance house round the staircase (split walls), and the gymnasium on the starboard side,
      // its roof and floor fallen to A deck [A3, W6]
      for (const sg of [-1, 1]) for (let x = 94.4; x < 104; x += 3.2) if (rnd() < 0.7) box(m, x, x + 3.2, bd(x), bd(x) + rr(0.8, 2.6), sg * 6.2 - 0.03, sg * 6.2 + 0.03, 0.6);
      for (let x = 104.3; x < 118; x += 3.5) box(m, x, x + 3.5, bd(x), bd(x) + rr(0.3, 1.2), -hullHalf(x, DK.boat) + 4.6, -hullHalf(x, DK.boat) + 4.66, 0.6);
      // Marconi rooms on the centreline, 290 to 302 ft [A2, A3]: the wooden walls are gone, but the transmitter,
      // switchboards and motor generator of the "silent room" are largely intact [W16, W19] (their layout is est.)
      { const y = bd(90);
        // switchboard: a slate panel of dials and knife switches
        box(m, 89, 89.08, y, y + 1.9, -1.3, 1.3, 0.9);
        for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) cyl(m, [89.08, y + 1.05 + r * 0.45, -0.9 + c * 0.6], [89.13, y + 1.05 + r * 0.45, -0.9 + c * 0.6], 0.11, 0.8, 12);
        for (let c = 0; c < 5; c++) box(m, 89.08, 89.16, y + 0.5, y + 0.72, -1 + c * 0.5 - 0.03, -1 + c * 0.5 + 0.03, 0.8);
        // the transmitter: transformer, a bank of condenser boxes, and the rotary spark discharger on the motor generator shaft
        box(m, 90.1, 90.75, y, y + 0.75, -0.7, -0.05, 0.9);
        for (let c = 0; c < 3; c++) box(m, 90.85, 91.3, y, y + 0.62, -0.7 + c * 0.47, -0.3 + c * 0.47, 0.9);
        box(m, 90.1, 91.3, y, y + 0.16, 1.05, 2.5, 0.9);
        cyl(m, [90.7, y + 0.5, 1.15], [90.7, y + 0.5, 1.75], [0.26, 0.31, 0.31, 0.26], 0.9, 14);   // motor
        cyl(m, [90.7, y + 0.5, 1.8], [90.7, y + 0.5, 2.3], [0.3, 0.34, 0.34, 0.3], 0.9, 14);        // alternator
        cyl(m, [90.7, y + 0.5, 2.34], [90.7, y + 0.5, 2.42], 0.4, 0.8, 18);                          // spark disc
        cyl(m, [90.7, y + 0.5, 1.1], [90.7, y + 0.5, 2.46], 0.045, 0, 6); }
      // the captain's bathroom, starboard, 248 to 255 ft: its outer wall has fallen and the bath lies in the debris
      // [W9]: a roll-top enamelled bath, and the pipes that fed it
      { const y = bd(76), x0 = 75.9, L = 1.7, zc = -5.5, rings = [];
        for (let i = 0; i <= 10; i++) { const u = i / 10, w = 0.36 * pow(sin(PI * clamp(u * 0.9 + 0.05, 0, 1)), 0.18), ring = []; for (let k = 0; k <= 8; k++) { const a = k / 8 * PI; ring.push(m.v(x0 + u * L, y + 0.6 - sin(a) * (0.5 * w / 0.36), zc + cos(a) * w, 0.7)); } rings.push(ring); }
        for (let i = 0; i < 10; i++) for (let k = 0; k < 8; k++) m.quad(rings[i][k], rings[i][k + 1], rings[i + 1][k + 1], rings[i + 1][k]);
        const rim = []; for (let i = 0; i <= 10; i++) { const u = i / 10; rim.push([x0 + u * L, y + 0.6, zc + 0.36 * pow(sin(PI * clamp(u * 0.9 + 0.05, 0, 1)), 0.18)]); }
        m.tube(rim, 0.03, 6, true, () => 0.7); m.tube(rim.map((q) => [q[0], q[1], 2 * zc - q[2]]), 0.03, 6, true, () => 0.7);
        for (const ex of [0.25, 1.45]) for (const ez of [-0.2, 0.2]) cyl(m, [x0 + ex, y, zc + ez], [x0 + ex, y + 0.14, zc + ez], 0.04, 0.8, 6);
        for (const ez of [-0.08, 0.08]) m.tube([[x0 + L + 0.1, y, zc + ez], [x0 + L + 0.1, y + 0.75, zc + ez], [x0 + L - 0.08, y + 0.8, zc + ez]], 0.022, 6, true, () => 0.8); }
      // lift grilles, and the pillars of the staircase landings on each deck [W6, W18]
      for (const d of [DK.A, DK.B, DK.C, DK.D]) {
        const y = d + sheer(95);
        for (let z = -3; z <= 3.01; z += 0.25) bar(m, [[LIFT[1], y, z], [LIFT[1], y + 2.2, z]], 0.035);
        bar(m, [[LIFT[1], y + 2.2, -3.05], [LIFT[1], y + 2.2, 3.05]], 0.06); bar(m, [[LIFT[1], y + 1.1, -3.05], [LIFT[1], y + 1.1, 3.05]], 0.05);
        for (const sg of [-1, 1]) for (const x of [STAIR[0] + 0.3, STAIR[1] + 0.4]) bar(m, [[x, y, sg * 3.5], [x, y + TWEEN(d), sg * 3.5]], 0.3);
      }
      // D deck reception room: pillar casings still stand; forward starboard corner of the dining saloon: table
      // supports still bolted to the deck [W6, W16] (spacings est.)
      { const y = DK.D + sheer(100);
        for (let x = 89.5; x < 112; x += 4.6) for (const z of [-9.5, -5.2, 5.2, 9.5]) if (!(x > LIFT[0] - 1 && x < STAIR[1] + 1 && abs(z) < 5.5)) bar(m, [[x, y, z], [x, y + TWEEN(DK.D), z]], 0.32, 0.1);
        // window screens: panelled piers and leaded windows by turns
        const screen = (x0, x1, sg) => { for (let x = x0, i = 0; x < x1 - 0.5; i++) { const w = i % 2 ? 1.5 : 0.9, e = min(x + w, x1), z = sg * SCREEN_Z, h = TWEEN(DK.D);
          if (i % 2) { box(m, x, e, y, y + 0.9, z - 0.04, z + 0.04, 0.1); box(m, x, e, y + 0.9, y + 2.35, z - 0.02, z + 0.02, 0.5); box(m, x, e, y + 2.35, y + h, z - 0.04, z + 0.04, 0.1); } else box(m, x, e, y, y + h, z - 0.05, z + 0.05, 0.1);
          x = e; } };
        for (const sg of [-1, 1]) screen(318 * FT, 371 * FT - 0.2, sg);
        screen(371 * FT + 0.2, 119, -1);
        for (let x = 114.2; x < 119; x += 1.9) for (let z = -12.6; z < -6; z += 1.9) cyl(m, [x, y, z], [x, y + 0.7, z], [0.16, 0.06, 0.06, 0.2], 0, 8); }
      // brass bedsteads left where the cabin walls rotted away, B and C decks forward of the staircase [W16]
      // (which cabins is not recorded: positions est.)
      for (const d of [DK.B, DK.C]) for (let i = 0; i < 9; i++) {
        const x = rr(60, 88), z = (rnd() < 0.5 ? -1 : 1) * rr(6.5, 11.5), y = d + sheer(x);
        for (const [ex, ez] of [[0, 0], [1.9, 0], [0, 0.9], [1.9, 0.9]]) bar(m, [[x + ex, y, z + ez], [x + ex, y + (ex ? 0.7 : 1.1), z + ez]], 0.05, 0.8);
        for (const ez of [0, 0.9]) bar(m, [[x, y + 0.4, z + ez], [x + 1.9, y + 0.4, z + ez]], 0.04, 0.8);
        for (const ex of [0, 1.9]) bar(m, [[x + ex, y + 0.4, z], [x + ex, y + 0.4, z + 0.9]], 0.04, 0.8), bar(m, [[x + ex, y + (ex ? 0.7 : 1.1), z], [x + ex, y + (ex ? 0.7 : 1.1), z + 0.9]], 0.04, 0.8);
      }
      // Turkish bath cooling room: the loungers are still in place [W16]
      for (const x of [100, 102.6]) for (const z of [-12.6, -9]) { const y = DK.F + sheer(101); box(m, x, x + 1.9, y + 0.3, y + 0.42, z - 0.33, z + 0.33, 0.1); box(m, x, x + 0.5, y + 0.42, y + 0.62, z - 0.33, z + 0.33, 0.1); for (const ex of [0.1, 1.8]) for (const ez of [-0.28, 0.28]) bar(m, [[x + ex, y, z + ez], [x + ex, y + 0.3, z + ez]], 0.06, 0.1); }
      // boiler room No. 2: the uptakes have been crushed down on to the boilers [W6]
      for (let k = -2; k <= 2; k++) bar(m, [[136.2, 7.25, k * 17 * FT + rr(-0.5, 0.5)], [139, 7.9 + rr(0, 0.8), k * 17 * FT + rr(-1, 1)], [141.8, 7.3, k * 17 * FT + rr(-0.5, 0.5)]], 2.6, 0, 0.12);
      // pillars between the decks (spacing est.)
      for (const d of [DK.C, DK.D, DK.E]) for (const sg of [-1, 1]) for (let x = 14; x < BOW_END - 12; x += 5.5) if (hullHalf(x, d) > 6 && !(x > FC_END && x < SUP0 && d === DK.C)) bar(m, [[x, d + sheer(x), sg * 4.6], [x, d + sheer(x) + (d === DK.C ? 9 : d === DK.D ? 10.5 : 9) * FT, sg * 4.6]], 0.12);
      // double-ended boilers still in their rooms, five abreast (four in No. 6): those of No. 2 boiler room can be
      // seen in the tear [A1, A2, W6, W9]
      // one row to a room, at 0, 17 and 34 ft off the centreline (8.75 and 26 ft in No. 6), tops 23 ft above the keel [A3]
      for (const [x, n] of [[68.7, 4], [85.6, 5], [103, 5], [120.4, 5], [139, 5]]) for (let k = 0; k < n; k++) {
        const z = (n === 4 ? [-26, -8.75, 8.75, 26] : [-34, -17, 0, 17, 34])[k] * FT, y = 23 * FT - 2.4, l = 10 * FT;
        m.tube([[x - l, y, z], [x + l, y, z]], 2.4, 20, true, () => 0); m.tube([[x + l, y, z], [x - l, y, z]], 2.39, 20, true, () => 0);
        for (const e of [-1, 1]) for (const a of [-1, 0, 1]) cyl(m, [x + e * (l - 0.3), y - 1 + abs(a) * 0.25, z + a * 1.25], [x + e * (l + 0.04), y - 1 + abs(a) * 0.25, z + a * 1.25], 0.55, 1, 12);
      }
      // stumps of the funnel casings, and the well of the grand staircase
      for (const f of [FUNNEL[0], FUNNEL[1]]) {
        const ring = [], y = bd(f);
        for (let k = 0; k <= 24; k++) { const a = k / 24 * TAU; ring.push([f + cos(a) * FUN_L, y, sin(a) * FUN_W]); }
        for (let k = 0; k < 24; k++) { const h0 = rr(0.3, 1.4), a = ring[k], b = ring[k + 1]; m.quad(m.v(a[0], a[1], a[2], 0), m.v(b[0], b[1], b[2], 0), m.v(b[0], b[1] + h0, b[2], 0), m.v(a[0], a[1] + h0, a[2], 0)); }
      }
    },
  });
}

// ---------------------------------------------------------------- the stern section
// Far more broken than the bow: it sank full of air and imploded, the decks pancaked and the plating splayed
// outward. The forward end is a heap; the counter, rudder and the wing propellers at the after end are recognisable.
// The reciprocating engines, measured from the builder's elevation, plan and section of the engine rooms
// (Plates VII and VIII and Fig. 53 of The Shipbuilder, June 1911) [A7], good to about 0.5 ft. Cylinder centres from
// the stem, forward to aft LP, HP, IP, LP; their diameters over the lagging; engine centrelines 16.5 ft off the
// ship's. EH(h): height above the keel of a level h feet above the engine room tank top (6 ft 3 in [A1]).
const ENGINE_X = [527.5 * FT, 543 * FT, 563 * FT, 578.5 * FT], ENGINE_D = [10.4 * FT, 7 * FT, 9.7 * FT, 10.4 * FT], ENGINE_Z = 16.5 * FT;
const EH = (h) => (6.25 + h) * FT;
// the bedplate survives from about the first shaft coupling (536 ft) aft; the forward end went with the hull [W5, W6]
const ENGINE_X0 = 536 * FT, ENGINE_X1 = 584 * FT;
const sternSquash = (x) => mix(0.2, 1, sstep(STERN0, STERN0 + 62, x));
const STERN = {
  x0: STERN0 - 4, x1: LOA - 0.3,
  // the starboard side lost its plating in the breakup
  gap: (x, y, sg) => x < STERN0 + 8 * vnoise(y * 0.4, 7.1, sg) || (sg < 0 && y > DK.G - 2 && x < XAP - 34 + 10 * vnoise(y * 0.3, 2.2, 0)) || (y > DK.E && vnoise(x * 0.13, y * 0.2, sg * 3.7) < mix(0.62, 0.3, sstep(STERN0, STERN0 + 70, x))),
  deckEnd: (x, y) => x > STERN0 + 6 + 5 * vnoise(y * 0.5, 1.7, 0),
  // decks pancaked toward the torn forward end, plating splayed outward, everything crumpled
  warp: (x, y, z) => {
    const s = sternSquash(x), k = sstep(DK.G - 4, DK.B, y), c = (vnoise(x * 0.11, y * 0.2, z * 0.11) - 0.5) * 7 * (1 - s);
    return [x, mix(y, DK.G - 4 + (y - DK.G + 4) * s, k) + c * k, z * (1 + (1 - s) * 0.75 * k) + c * 0.6 * k];
  },
  // The decks lie on one another with no gap to swim through, so the stern is solid to the camera from the after
  // end of the engine room (bulkhead L [A2]) to the stern. Forward of that the engines stand in the open.
  solid: 582 * FT + FP,
  blocks: [-1, 1].flatMap((sg) => [{ x0: ENGINE_X0, x1: ENGINE_X1, y0: 1.9, y1: EH(6.6), z0: sg * ENGINE_Z - 2.9, z1: sg * ENGINE_Z + 2.9 },
    { x0: 572 * FT - 0.75, x1: 572 * FT + 0.75, y0: EH(26.3), y1: EH(36), z0: sg * ENGINE_Z - 1.4, z1: sg * ENGINE_Z + 1.4 },
    ...[1, 2, 3].map((k) => { const r = ENGINE_D[k] / 2 + 0.05; return { x0: ENGINE_X[k] - r, x1: ENGINE_X[k] + r, y0: EH(26.3), y1: EH(37.6), z0: sg * ENGINE_Z - r, z1: sg * ENGINE_Z + r }; })]),
  top: (x) => { const y = solidTop(x); return DK.G - 4 + (y - DK.G + 4) * sternSquash(x); },
  wide: (x) => 1 + (1 - sternSquash(x)) * 0.75,
  decks: [DK.G, DK.F, DK.E, DK.D, DK.C, DK.B].map((lvl) => ({ lvl, x0: STERN0 - 3, x1: lvl >= DK.C ? SUP1 : LOA - 4, holes: [] })),
  walls: [], tubes: [],
};
function meshStern() {
  return meshSection({
    ...STERN,
    fit: (m) => {
      rseed(310);
      const pd = (x) => DK.B + sheer(x), well = (x) => DK.C + sheer(x);
      deckPlate(m, STERN0 + 8, SUP1, (x) => DK.A + sheer(x), [[FUNNEL[3] - FUN_L, FUNNEL[3] + FUN_L, FUN_W, 1], [STERN0, STERN0 + 26, 9]], 0.4);
      deckPlate(m, SUP1, POOP0, well, [[224.9, 228.6, 3.1], [234.4, 236.4, 3.1]], 0.4);
      deckPlate(m, POOP0, LOA - 1.2, pd, [[241, 247, 5], [252, 258, 7]], 0.4);
      box(m, POOP0, POOP0 + 0.06, well(POOP0), pd(POOP0), -hullHalf(POOP0, DK.B), hullHalf(POOP0, DK.B), 0.6);
      for (const sg of [-1, 1]) {
        railing(m, POOP0 + 14, LOA - 2, pd, sg);
        for (const x of [243, 262]) bollards(m, x, pd(x), sg * (hullHalf(x, pd(x)) - 1.3));
        capstan(m, 250, pd(250), sg * 4.2, 0.55, 1.0);
        cyl(m, [226.5, well(226.5), sg * 7], [226.5, well(226.5) + 2.3, sg * 7], [0.7, 0.6, 0.75], 0, 12); // aft well deck cargo crane [A3]
        // wing propeller: three bronze blades, 23 ft 6 in across. The shaft wings were torn from the hull and bent
        // upward, so the propellers now rest on the mud about 7 m above their original line
        const px = XAP - 9.5, py = 13.2, pz = sg * 7.5;
        cyl(m, [px - 9, py - 3.2, pz * 0.8], [px + 0.8, py, pz], [0.9, 0.75, 0.6], 0, 10);
        for (let b = 0; b < 3; b++) {
          const a = b / 3 * TAU + 0.5, pts = [];
          for (let k = 0; k <= 5; k++) pts.push([px + 0.25 * sin(k * 0.5), py + cos(a) * k / 5 * 23.5 * FT / 2, pz + sin(a) * k / 5 * 23.5 * FT / 2]);
          const n0 = m.aux.length;
          m.sweep(pts, () => 0.14, (k) => 0.5 + 1.5 * sin(PI * (k + 0.6) / 6.2), () => [1, 0, 0]);
          for (let k = n0; k < m.aux.length; k++) m.aux[k] = 0.8;
        }
      }
      // cargo cranes on the poop, 26.5 ft off the centreline, and what is left of the docking bridge [A3]
      for (const sg of [-1, 1]) { cyl(m, [239.9, pd(239.9), sg * 8.1], [239.9, pd(239.9) + 2.3, sg * 8.1], [0.7, 0.6, 0.75], 0, 12); bar(m, [[239.9, pd(239.9) + 2.2, sg * 8.1], [247, pd(247) + 1, sg * 6]], 0.34); }
      for (const z of [-9, -3, 3, 9]) bar(m, [[257.5, pd(257.5), z], [257.5, pd(257.5) + 2.4, z]], 0.14);
      // rudder
      box(m, XAP + 0.4, XAP + 0.4 + 15.25 * FT, 1.2, WL + 0.8, -0.35, 0.35); // 15 ft 3 in wide [A1]
      cyl(m, [XAP + 0.2, 0.6, 0], [XAP + 0.2, WL + 2.4, 0], 0.42, 0, 10);
    },
    // The two reciprocating engines stand in the open at the torn forward end, mud to the level of their
    // crankshafts [W6]. Every level, centre and diameter here is measured from the 1911 machinery plates [A7]: the
    // cylinder covers stand 36 ft above the tank top, just under E deck. The forward LP cylinder of each engine,
    // with its end of the bedplate, broke away with the hull and lies in the debris field [W5, W6].
    after: (m) => {
      const CY = EH(5.8), TH = 75 * 0.0254 / 2, ROD = 13.9 * FT; // crankshaft centre; crank throw (half the 75 in stroke); connecting rod
      for (const sg of [-1, 1]) {
        const zc = sg * ENGINE_Z, x0 = ENGINE_X0, x1 = ENGINE_X1, inb = -sg; // inb: the direction of the ship's centreline
        // bedplate (20 ft wide, top 4.95 ft above the tank top), main bearings, crankshaft and thrust shaft (27 in),
        // and the 10 ft turning wheel at the after end
        box(m, x0, x1, 1.9, EH(4.95), zc - 2.9, zc + 2.9, 0.9);
        for (const f of [538.3, 548.2, 558, 567.4, 574.3, 582.6]) box(m, f * FT - 0.3, f * FT + 0.3, EH(4.95), EH(6.6), zc - 0.75, zc + 0.75, 0.9);
        cyl(m, [x0, CY, zc], [587.5 * FT + FP, CY, zc], 27 * 0.0254 / 2, 0.9, 12);
        cyl(m, [585.2 * FT - 0.11, CY, zc], [585.2 * FT + 0.11, CY, zc], [5 * FT, 5 * FT], 0.9, 24);
        for (let k = 1; k < 4; k++) {
          const x = ENGINE_X[k], r = ENGINE_D[k] / 2, a = k * 2.1, py = CY + cos(a) * TH, pz = zc + sin(a) * TH, hy = py + sqrt(ROD * ROD - pow(sin(a) * TH, 2));
          // columns: one inboard and one outboard of each cylinder. From the side each is an A: a 5 ft trunk under
          // the cylinder that splits at 15.5 ft into two legs standing 10.6 ft apart over the feet. The crosshead
          // guides are on their inner faces
          for (const ez of [-1, 1]) {
            for (const ex of [-1, 1]) bar(m, [[x + ex * 4.15 * FT, EH(6.9), zc + ez * 6.4 * FT], [x + ex * 1.45 * FT, EH(15.5), zc + ez * 5 * FT]], 0.64, 0.9);
            box(m, x - 2.5 * FT, x + 2.5 * FT, EH(15.5), EH(25.2), zc + ez * 3.5 * FT, zc + ez * 5.2 * FT, 0.9);
            box(m, x - 4.15 * FT - 0.4, x + 4.15 * FT + 0.4, EH(6.6), EH(7.2), zc + ez * 6.4 * FT - 0.8, zc + ez * 6.4 * FT + 0.8, 0.9);
            box(m, x - 2.1 * FT, x + 2.1 * FT, EH(15.2), EH(24.4), zc + ez * 3.3 * FT, zc + ez * 3.5 * FT, 0.9);
          }
          // cylinder: lagged body from 26.5 to 35.9 ft, domed cover to 37.4 ft, relief valve above
          cyl(m, [x, EH(25.2), zc], [x, EH(37.4), zc], [r * 0.7, r, r, r, r, r, r * 0.93, r * 0.45], 0.9, 22);
          cyl(m, [x + r * 0.5, EH(36.6), zc], [x + r * 0.5, EH(39), zc], 0.14, 0.8, 8);
          // piston rod, crosshead, connecting rod (13.9 ft), crank pin and webs
          bar(m, [[x, hy, zc], [x, EH(26.5), zc]], 0.22, 0.9); box(m, x - 0.45, x + 0.45, hy - 0.3, hy + 0.3, zc - 0.95, zc + 0.95, 0.9);
          bar(m, [[x, hy, zc], [x, py, pz]], 0.36, 0.9);
          cyl(m, [x - 0.6, py, pz], [x + 0.6, py, pz], 0.34, 0.9, 12);
          for (const ex of [-0.6, 0.6]) bar(m, [[x + ex, CY, zc], [x + ex, py, pz]], 0.7, 0.9, 0.26);
        }
        // valve chests stand in the gaps fore and aft of the cylinders: the HP's one piston valve abaft it (550.5 ft),
        // the IP's two side by side before it (556 ft), the LP's twin slide valve chest before it (572 ft)
        cyl(m, [550.5 * FT, EH(26.5), zc], [550.5 * FT, EH(36.6), zc], [1.95 * FT, 1.95 * FT, 1.95 * FT, 1.2 * FT], 0.9, 14);
        for (const ez of [-1, 1]) cyl(m, [556 * FT, EH(26.5), zc + ez * 1.75 * FT], [556 * FT, EH(36.6), zc + ez * 1.75 * FT], [1.7 * FT, 1.7 * FT, 1.7 * FT, 1 * FT], 0.9, 12);
        box(m, 572 * FT - 2.35 * FT, 572 * FT + 2.35 * FT, EH(26.5), EH(36), zc - 4.5 * FT, zc + 4.5 * FT, 0.9);
        for (const f of [550.5, 556, 572]) for (const ez of [-0.5, 0.5]) bar(m, [[f * FT, CY + 0.5, zc + ez], [f * FT, EH(26.5), zc + ez]], 0.12, 0.9); // valve rods
        // exhaust main along the inboard side, 31 ft up: 3.8 ft across, 5.25 ft once the after LP's branch joins,
        // on through the bulkhead to the turbine. Steam main to the HP valve, and the receiver pipes outboard
        m.tube([[x0, EH(31), zc + inb * 8.95 * FT], [577 * FT, EH(31), zc + inb * 8.95 * FT]], 1.9 * FT, 14, true, () => 0.9);
        m.tube([[577 * FT, EH(31), zc + inb * 8.95 * FT], [587.5 * FT + FP, EH(31), zc + inb * 8.95 * FT]], 2.62 * FT, 14, true, () => 0.9);
        m.tube([[ENGINE_X[3], EH(33), zc + inb * 4.8 * FT], [ENGINE_X[3] - 0.4, EH(31.5), zc + inb * 8 * FT]], 1.6 * FT, 12, true, () => 0.9);
        m.tube([[x0, EH(28.7), zc + inb * 6.5 * FT], [549 * FT, EH(28.7), zc + inb * 6.5 * FT], [550.5 * FT, EH(30), zc + inb * 1.9 * FT]], 0.925 * FT, 10, true, () => 0.9);
        m.tube([[ENGINE_X[1], EH(28.8), zc + sg * (ENGINE_D[1] / 2 + 0.4)], [ENGINE_X[2], EH(28.8), zc + sg * (ENGINE_D[2] / 2 + 0.4)]], 1.1 * FT, 10, true, () => 0.9);
        m.tube([[ENGINE_X[2], EH(33.4), zc + sg * (ENGINE_D[2] / 2 + 0.4)], [ENGINE_X[3], EH(33.4), zc + sg * (ENGINE_D[3] / 2 + 0.4)]], 1.1 * FT, 10, true, () => 0.9);
        // working platforms: middle (16.1 ft) and upper (23.1 ft), inboard and outboard of each engine, with rails;
        // inclined ladders rising aft, floor to middle (556 to 563.5 ft) and middle to upper (568 to 572.5 ft)
        for (const h of [16.1, 23.1]) for (const ez of [-1, 1]) {
          const y = EH(h), zi = zc + ez * 2.9, zo = zc + ez * 3.9, rail = [], rail2 = [];
          box(m, x0, x1, y, y + 0.05, min(zi, zo), max(zi, zo), 0.9);
          for (let x = x0; x <= x1 + 0.01; x += (x1 - x0) / 8) { bar(m, [[x, y, zo], [x, y + 1, zo]], 0.04, 0.9); rail.push([x, y + 1, zo]); rail2.push([x, y + 0.5, zo]); }
          bar(m, rail, 0.04, 0.9); bar(m, rail2, 0.03, 0.9);
        }
        for (const [f0, f1, h0, h1] of [[556, 563.5, 4.95, 16.1], [568, 572.5, 16.1, 23.1]]) {
          const z = zc + inb * 3.4;
          for (const ez of [-0.3, 0.3]) bar(m, [[f0 * FT, EH(h0), z + ez], [f1 * FT, EH(h1), z + ez]], 0.07, 0.9);
          for (let t = 0.06; t < 1; t += 0.07) bar(m, [[mix(f0, f1, t) * FT, EH(mix(h0, h1, t)), z - 0.3], [mix(f0, f1, t) * FT, EH(mix(h0, h1, t)), z + 0.3]], 0.035, 0.9);
        }
      }
      // the upper platform also runs across between the engines
      box(m, ENGINE_X0, ENGINE_X1, EH(23.1), EH(23.1) + 0.05, -ENGINE_Z + 3.9, ENGINE_Z - 3.9, 0.9);
      // what is recognisable on top of the heap: the second class entrance house, partly standing (647 to 675 ft), a
      // cargo crane hanging over the starboard side and another upside down, about 690 ft from the stem [W6]
      rseed(320);
      for (const sg of [-1, 1]) for (let x = 197.2; x < 205; x += 2.8) if (rnd() < 0.7) box(m, x, x + 2.8, STERN.top(x), STERN.top(x) + rr(0.6, 2.2), sg * 4 - 0.03, sg * 4 + 0.03, 0.6);
      { const x = 690 * FT, y = STERN.top(x), h = hullHalf(x, DK.B) * STERN.wide(x);
        cyl(m, [x, y, -h + 0.5], [x + 0.4, y - 1.2, -h - 1.6], [0.7, 0.6, 0.75], 0, 12); bar(m, [[x + 0.4, y - 1.2, -h - 1.6], [x + 2.5, y - 6.5, -h - 2.4]], 0.34);
        cyl(m, [x - 1.5, y + 1.9, 4.5], [x - 1.5, y + 0.1, 4.5], [0.7, 0.6, 0.75], 0, 12); bar(m, [[x - 1.5, y + 0.3, 4.5], [x + 5, y + 0.4, 7]], 0.34); }
    },
  });
}

// ---------------------------------------------------------------- loose pieces
// Single-ended Scotch boiler (15 ft 9 in across, 11 ft 9 in long): five of them, from boiler room No. 1 where the
// hull parted, lie near the stern. Axis along x, furnace doors on the +x face.
function meshBoiler() {
  const m = new Mesh(), r = 15.75 * FT / 2, l = 11.75 * FT;
  m.tube([[-l / 2, 0, 0], [l / 2, 0, 0]], r, 28, true, () => 0);
  m.tube([[l / 2, 0, 0], [-l / 2, 0, 0]], r * 0.995, 28, true, () => 0);
  for (const a of [-1, 0, 1]) cyl(m, [l / 2 - 0.3, -r * 0.42 + abs(a) * 0.25, a * r * 0.52], [l / 2 + 0.04, -r * 0.42 + abs(a) * 0.25, a * r * 0.52], 0.55, 1, 14);
  return m;
}
// torn hull plate: a bent, ragged sheet about 1 m across (scaled per instance)
function meshPlate(sd) {
  rseed(400 + sd);
  const m = new Mesh(), N = 6, bend = rr(-0.5, 0.5), tw = rr(-0.4, 0.4);
  const P = (i, j) => { const u = i / N - 0.5, v = j / N - 0.5, e = 1 + 0.25 * (vnoise(i * 1.7 + sd, j * 1.7, 0) - 0.5) * (abs(u) > 0.4 || abs(v) > 0.4 ? 1 : 0); return [u * e * 1.4, bend * u * u * 2 + tw * u * v + 0.03, v * e]; };
  const id = []; for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) id.push(m.v(...P(i, j), 0));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) m.quad(id[i + j * (N + 1)], id[i + 1 + j * (N + 1)], id[i + 1 + (j + 1) * (N + 1)], id[i + (j + 1) * (N + 1)]);
  return m;
}
// hanging cluster of rusticles: icicles of rust grown by iron-eating bacteria, tip down from y = 0
function meshRusticles() {
  rseed(420);
  const m = new Mesh();
  for (let i = 0; i < 7; i++) {
    const x = rr(-0.5, 0.5), z = rr(-0.08, 0.08), l = rr(0.25, 1), r = rr(0.02, 0.05);
    m.tube([[x, 0.02, z], [x + rr(-0.03, 0.03), -l * 0.5, z], [x + rr(-0.04, 0.04), -l, z]], (k) => r * (1 - k * 0.42), 5, true, () => 0);
  }
  return m;
}
