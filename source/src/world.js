// ---------------------------------------------------------------- terrain mesh from the density grid
function buildTerrain(D) {
  const sn = surfaceNets(D, NX, NY, NZ), nv = sn.nv, gp = sn.pos;
  const smp = sampler3(D, NX, NY, NZ);
  const vb = new ArrayBuffer(nv * 16), vf = new Float32Array(vb), v8 = new Int8Array(vb);
  const wp = new Float32Array(nv * 3), wn = new Float32Array(nv * 3);
  for (let k = 0; k < nv; k++) {
    const x = gp[k * 3], y = gp[k * 3 + 1], z = gp[k * 3 + 2], e = 0.8;
    let nx = smp(x - e, y, z) - smp(x + e, y, z), ny = smp(x, y - e, z) - smp(x, y + e, z), nz = smp(x, y, z - e) - smp(x, y, z + e);
    const l = hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const X = OX + x * VS, Y = OY + y * VS, Z = OZ + z * VS;
    wp[k * 3] = vf[k * 4] = X; wp[k * 3 + 1] = vf[k * 4 + 1] = Y; wp[k * 3 + 2] = vf[k * 4 + 2] = Z;
    wn[k * 3] = nx; wn[k * 3 + 1] = ny; wn[k * 3 + 2] = nz;
    v8[k * 16 + 12] = round(nx * 127); v8[k * 16 + 13] = round(ny * 127); v8[k * 16 + 14] = round(nz * 127); v8[k * 16 + 15] = 127;
  }
  // bucket quads into the XZ culling grid
  const nq = sn.ni / 6, key = new Uint8Array(nq), cnt = new Uint32Array(CELLS * CELLS + 1);
  const lo = new Float32Array(CELLS * CELLS).fill(1e9), hi = new Float32Array(CELLS * CELLS).fill(-1e9);
  for (let q = 0; q < nq; q++) {
    const a = sn.idx[q * 6] * 3;
    const c = clamp(floor((wp[a] - OX) / CELLW), 0, CELLS - 1) + CELLS * clamp(floor((wp[a + 2] - OZ) / CELLW), 0, CELLS - 1);
    key[q] = c; cnt[c + 1]++;
    for (let j = 0; j < 6; j++) { const y = wp[sn.idx[q * 6 + j] * 3 + 1]; if (y < lo[c]) lo[c] = y; if (y > hi[c]) hi[c] = y; }
  }
  for (let c = 0; c < CELLS * CELLS; c++) cnt[c + 1] += cnt[c];
  const ib = new Uint32Array(sn.ni), fill = cnt.slice();
  for (let q = 0; q < nq; q++) { const o = fill[key[q]]++ * 6; for (let j = 0; j < 6; j++) ib[o + j] = sn.idx[q * 6 + j]; }
  return { vb, ib, nv, wp, wn, smp, start: cnt, lo, hi };
}

// ---------------------------------------------------------------- procedural meshes
function meshChunk(sd, sub = 2, det = sub > 2) {
  if (LV > 1 && sub > 1) sub--; // Low: a quarter of the triangles
  rseed(100 + sd);
  const pl = []; for (let i = 0; i < 4; i++) { const q = qRand(); pl.push([q[0], q[1], q[2], rr(0.8, 0.98)]); const l = hypot(q[0], q[1], q[2]) || 1; pl[i][0] /= l; pl[i][1] /= l; pl[i][2] /= l; }
  return icosphere(sub, (x, y, z) => {
    let r = 1 + (fbm(x * 1.6 + sd, y * 1.6, z * 1.6, 2) - 0.5) * 0.9 + (det ? (fbm(x * 4 + sd, y * 4, z * 4, 2) - 0.5) * 0.25 : 0);
    let px = x * r, py = y * r * 0.8, pz = z * r;
    for (const p of pl) { const d = px * p[0] + py * p[1] + pz * p[2] - p[3]; if (d > 0) { px -= p[0] * d; py -= p[1] * d; pz -= p[2] * d; } }
    return [px, py, pz];
  });
}

// mesh ids: 0 bow section, 1 stern section, 2 boiler, 3-5 rocks, 6 pebble, 7-8 torn plates, 9 coal, 10 rusticles,
// 11 double-bottom piece, 12 rattail, 13-20 animals that sit still
const M_BOILER = 2, M_ROCK = 3, M_PEBBLE = 6, M_PLATE = 7, M_COAL = 9, M_RUST = 10, M_BOTTOM = 11, M_FISH = 12;
const M_LP = 21;
const M_BRITTLE = 13, M_STAR = 14, M_LOBSTER = 15, M_ANEMONE = 16, M_CUCUMBER = 17, M_WHIP = 18, M_BUSH = 19, M_SPONGE = 20;
function buildMeshes() {
  return [meshBow(), meshStern(), meshBoiler(), meshChunk(1, 3), meshChunk(7, 3), meshChunk(13, 2), meshChunk(9, 1), meshPlate(1), meshPlate(2), meshChunk(5, 1), meshRusticles(),
    meshBottom(), meshRattail(), ...meshFauna(), meshLP()].map((m) => m.build());
}
// The animals recorded on and around the wreck [W9, W15]. The vertex aux picks the colour in the shader:
// 0 white, .2 orange, .4 pink, .6 gold, .8 pale yellow, 1 red. All are about 1 unit across and scaled when placed.
function meshFauna() {
  rseed(500);
  const arms = (m, n, len, r0, lift, aux) => { for (let i = 0; i < n; i++) { const a = i / n * TAU + rr(-0.15, 0.15), pts = []; for (let k = 0; k <= 4; k++) { const t = k / 4, b = a + sin(t * 3 + i) * 0.35 * t; pts.push([cos(b) * len * t, lift * (1 - t) + 0.02, sin(b) * len * t]); } m.tube(pts, (k) => r0 * (1 - k / 4.6), 4, true, () => aux); } };
  // brittle star: a small disc and five thin, snaking arms
  const brittle = new Mesh(); arms(brittle, 5, 0.5, 0.035, 0.03, 0.2); cyl(brittle, [0, 0, 0], [0, 0.05, 0], [0.09, 0.07], 0.2, 8);
  // sea star: five fat arms
  const star = new Mesh(); arms(star, 5, 0.5, 0.13, 0.1, 1);
  // squat lobster (Munidopsis): white, with a short body and two long claws held out in front
  const lob = new Mesh(); cyl(lob, [-0.2, 0.08, 0], [0.2, 0.08, 0], [0.05, 0.1, 0.09, 0.04], 0, 6);
  for (const sg of [-1, 1]) { lob.tube([[0.15, 0.08, sg * 0.05], [0.4, 0.1, sg * 0.2], [0.75, 0.06, sg * 0.12]], (k) => 0.03 - k * 0.006, 4, true, () => 0); for (let k = 0; k < 3; k++) lob.tube([[-0.05 + k * 0.08, 0.07, sg * 0.07], [-0.02 + k * 0.1, 0.1, sg * 0.3], [k * 0.12, 0, sg * 0.42]], 0.012, 3, true, () => 0); }
  // anemone: a column crowned with tentacles
  const ane = new Mesh(); cyl(ane, [0, 0, 0], [0, 0.5, 0], [0.22, 0.17, 0.2, 0.1], 0.4, 10);
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU, r = i % 2 ? 0.2 : 0.14; ane.tube([[cos(a) * r * 0.6, 0.45, sin(a) * r * 0.6], [cos(a) * r * 1.6, 0.66, sin(a) * r * 1.6], [cos(a) * r * 2.4, 0.6 + rr(0, 0.2), sin(a) * r * 2.4]], (k) => 0.03 - k * 0.011, 4, true, () => 0); }
  // sea cucumber
  const cuc = new Mesh(); cyl(cuc, [-0.5, 0.14, 0], [0.5, 0.14, 0.08], [0.05, 0.15, 0.17, 0.15, 0.06], 0.4, 8);
  // bamboo coral (Lepidisis): an unbranched whip
  const whip = new Mesh(); { const pts = []; for (let k = 0; k <= 8; k++) pts.push([sin(k * 0.5) * 0.08 * k / 8, k / 8, cos(k * 0.7) * 0.06 * k / 8]); whip.tube(pts, (k) => 0.018 * (1 - k / 10), 5, true, () => 0); }
  // Chrysogorgia: a small golden bush whose branches spiral up the stem
  const bush = new Mesh(); bush.tube([[0, 0, 0], [0, 0.5, 0], [0, 1, 0]], (k) => 0.025 - k * 0.008, 5, true, () => 0.6);
  for (let i = 0; i < 16; i++) { const a = i * 2.4, h = 0.15 + i * 0.05; bush.tube([[0, h, 0], [cos(a) * 0.2, h + 0.1, sin(a) * 0.2], [cos(a) * 0.36, h + 0.22, sin(a) * 0.36]], (k) => 0.012 - k * 0.004, 3, true, () => 0.6); }
  // cushion sponge
  const sponge = meshChunk(31, 1); sponge.aux.fill(0.8);
  return [brittle, star, lob, ane, cuc, whip, bush, sponge];
}
// rattail (grenadier): big head, body tapering to a long thin tail. Head at +x, 1 unit long
function meshRattail() {
  const m = new Mesh(), X = [0.5, 0.45, 0.35, 0.2, 0.02, -0.2, -0.5], H = [0.012, 0.07, 0.1, 0.095, 0.06, 0.03, 0.004], Wd = [0.012, 0.05, 0.06, 0.05, 0.03, 0.012, 0.003], rings = [];
  for (let i = 0; i < 7; i++) { const r = []; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; r.push(m.v(X[i], sin(a) * H[i] - 0.02 * (i < 4 ? 1 : 0), cos(a) * Wd[i])); } rings.push(r); }
  for (let i = 0; i < 6; i++) for (let k = 0; k < 8; k++) { const k2 = (k + 1) % 8; m.quad(rings[i][k], rings[i + 1][k], rings[i + 1][k2], rings[i][k2]); }
  return m;
}
// a low pressure cylinder torn from the forward end of one of the engines (97 in bore): an open-ended drum with
// its valve chest still on it
function meshLP() {
  const m = new Mesh(), r = ENGINE_D[0] / 2, l = 4.8 * FT; // 10.4 ft over the lagging, 9.6 ft tall [A7]
  m.tube([[0, -l, 0], [0, l, 0]], r, 22, false, () => 0.9); m.tube([[0, l, 0], [0, -l, 0]], r - 0.12, 22, true, () => 0.9);
  box(m, r - 0.1, r + 4.7 * FT, -l * 0.9, l * 0.9, -4.5 * FT, 4.5 * FT, 0.9); // its slide valve chest
  return m;
}
// one of the two pieces of double bottom, about 70 ft long, that fell from between the hull sections and lie
// upside down [W3, W5]: a slab with the bilge turned up along each side
function meshBottom() {
  const m = new Mesh(), l = 35 * FT, w = 11;
  box(m, -l, l, 0, 1.6, -w, w, 0.2);
  for (let x = -l + 1; x < l; x += 2.75) box(m, x - 0.05, x + 0.05, 1.6, 2.1, -w, w);
  return m;
}

// ---------------------------------------------------------------- placing the hull sections
const qRot = (q, x, y, z) => {
  const tx = q[1] * z - q[2] * y + q[3] * x, ty = q[2] * x - q[0] * z + q[3] * y, tz = q[0] * y - q[1] * x + q[3] * z;
  return [x + 2 * (q[1] * tz - q[2] * ty), y + 2 * (q[2] * tx - q[0] * tz), z + 2 * (q[0] * ty - q[1] * tx)];
};
for (const p of SITE.parts) {
  const h = p.heading * PI / 180;
  p.q = qMul(qAxis(0, 1, 0, atan2(-cos(h), -sin(h))), qMul(qAxis(0, 0, 1, p.pitch * PI / 180), qAxis(1, 0, 0, p.roll * PI / 180)));
  const r = qRot(p.q, ...p.pivot);
  p.pos = [p.at[0] - r[0], p.at[1] - r[1], p.at[2] - r[2]];
}
// ship coordinates of a section (as built) to world, through the section's damage
const toWorld = (p, x, y, z) => { const v = p.geom.warp(x, y, z), r = qRot(p.q, v[0], v[1], v[2]); return [r[0] + p.pos[0], r[1] + p.pos[1], r[2] + p.pos[2]]; };
const toShip = (p, x, y, z) => qRot([-p.q[0], -p.q[1], -p.q[2], p.q[3]], x - p.pos[0], y - p.pos[1], z - p.pos[2]);
const POIS = POI_DATA.map((d) => ({ ...d, at: toWorld(SITE.parts[d.part], ...d.at), view: toWorld(SITE.parts[d.part], ...d.view) }));
{ const b = SITE.boilers[1]; POIS.push({ ...POI_BOILERS, at: [b[0], 3, b[1]], view: [b[0] - 16, 7, b[1] - 20] }); }

// mud thrown up around the hull sections: ridges along the bow's flanks and ahead of the prow, a ring round the stern
function sitePrims() {
  const a = [], seg = (p, x0, z0, x1, z1, rad, h) => { const A = toWorld(p, x0, 0, z0), B = toWorld(p, x1, 0, z1); a.push(A[0], A[2], B[0], B[2], rad, h, 0, 0); };
  const bow = SITE.parts[0], st = SITE.parts[1], w = BEAM / 2;
  seg(bow, -7, -7, -7, 7, 8, 2.4);
  for (const sg of [-1, 1]) { seg(bow, 0, sg * 9, 55, sg * (w + 8), 8, 2.0); seg(bow, 55, sg * (w + 8), 120, sg * (w + 9), 9, 0.9); }
  for (const sg of [-1, 1]) seg(st, STERN0 - 10, sg * (w + 20), LOA + 8, sg * (w + 12), 11, 1.3);
  seg(st, LOA + 16, -14, LOA + 16, 14, 10, 1.2);
  return new Float32Array(a);
}

// Keeps the camera (radius r) out of the steel of each hull section, in ship coordinates. The bow is hollow: its
// plating, decks, bulkheads and funnel casings stop the camera, and every opening lets it through (hatches, the
// staircase shaft, the funnel uptakes, the tears). The stern's decks lie flat on one another, so it is one solid.
function hullCollide(r) {
  for (let i = 0; i < SITE.parts.length; i++) {
    const p = SITE.parts[i], q = p.q, g = p.geom, dx = F[CX] - p.pos[0], dy = F[CY] - p.pos[1], dz = F[CZ] - p.pos[2];
    // the camera in ship coordinates: rotate by the inverse of q
    let tx = -q[1] * dz + q[2] * dy + q[3] * dx, ty = -q[2] * dx + q[0] * dz + q[3] * dy, tz = -q[0] * dy + q[1] * dx + q[3] * dz;
    const lx = dx + 2 * (-q[1] * tz + q[2] * ty), ly = dy + 2 * (-q[2] * tx + q[0] * tz), lz = dz + 2 * (-q[0] * ty + q[1] * tx);
    if (lx < g.x0 - r || lx > g.x1 + r) continue;
    let px = 0, py = 0, pz = 0;
    const yb = g.unY ? g.unY(lx, ly) : ly;
    // machinery and other solid blocks: out the short way
    if (g.blocks) for (let k = 0; k < g.blocks.length; k++) {
      const b = g.blocks[k], ax = min(lx - b.x0, b.x1 - lx) + r, ay = min(yb - b.y0, b.y1 - yb) + r, az = min(lz - b.z0, b.z1 - lz) + r;
      if (ax <= 0 || ay <= 0 || az <= 0) continue;
      if (ax <= ay && ax <= az) px = lx - b.x0 < b.x1 - lx ? -ax : ax; else if (ay <= az) py = yb - b.y0 < b.y1 - yb ? -ay : ay; else pz = lz - b.z0 < b.z1 - lz ? -az : az;
    }
    if (g.solid && lx > g.solid - r) {
      const top = g.top(lx) + r; if (ly > top) continue;
      const hb = hullHalf(lx, ly < top - r ? ly : top - r) * g.wide(lx) + r; if (lz > hb || lz < -hb) continue;
      let d = hb - abs(lz); pz = lz < 0 ? -d : d;
      if (top - ly < d) { d = top - ly; py = d; pz = 0; }
      if (lx - g.solid + r < d) { d = lx - g.solid + r; px = -d; py = pz = 0; }
      if (g.x1 + r - lx < d) { px = g.x1 + r - lx; py = pz = 0; }
    } else if (!g.solid) {
      const y = yb, sh = sheer(lx), hb = hullHalf(lx, y), az = abs(lz), sg = lz < 0 ? -1 : 1;
      if (y < -r || y > DK.boat + sh + r || az > hb + r) continue;
      // side plating
      if (y < shellTop(lx) && az > hb - r && !g.gap(lx, y, sg)) pz = (az > hb ? hb + r - az : hb - r - az) * sg;
      // decks (not where the upper decks have collapsed at the tear)
      for (let k = 0; k < g.decks.length; k++) {
        const d = g.decks[k], e = y - d.lvl - sh;
        if (e > -r && e < r && lx > d.x0 && lx < d.x1 && az < hb && !(lx > BOW_END - 30 && d.lvl > DK.D) && g.deckEnd(lx, d.lvl + sh) && !inHole(d.holes, lx, lz, 0.25)) { py = e > 0 ? r - e : -r - e; break; }
      }
      // bulkheads and cross walls
      for (let k = 0; k < g.walls.length; k++) {
        const w = g.walls[k], e = lx - w.x;
        if (e > -r && e < r && y > w.y0 + sh - r && y < w.y1 + sh && az < hb && !(w.notch && az < FUN_W && y > DK.F)) px = e > 0 ? r - e : -r - e;
      }
      // partitions of the rooms
      if (g.panels) for (let k = 0; k < g.panels.length; k++) {
        const w = g.panels[k], e = y - w.lvl - sh; if (e < -r || e > w.h) continue;
        if (w.x0 === w.x1) { const f = lx - w.x0; if (f > -r && f < r && lz > w.z0 - r * 0.5 && lz < w.z1 + r * 0.5) px = f > 0 ? r - f : -r - f; }
        else { const f = lz - w.z0; if (f > -r && f < r && lx > w.x0 - r * 0.5 && lx < w.x1 + r * 0.5) pz = f > 0 ? r - f : -r - f; }
      }
      // funnel casings
      for (let k = 0; k < g.tubes.length; k++) {
        const c = g.tubes[k]; if (y < c.y0 + sh || y > c.y1 + sh) continue;
        const u = (lx - c.x) / c.a, w = lz / c.b, e = sqrt(u * u + w * w), m = r / ((c.a + c.b) / 2);
        if (e > 1 - m && e < 1 + m && e > 0.01) { const f = (e > 1 ? 1 + m : 1 - m) / e - 1; px = (lx - c.x) * f; pz = lz * f; }
      }
    }
    const d = sqrt(px * px + py * py + pz * pz); if (d < 1e-6) continue;
    // back to world
    tx = q[1] * pz - q[2] * py + q[3] * px; ty = q[2] * px - q[0] * pz + q[3] * py; tz = q[0] * py - q[1] * px + q[3] * pz;
    const wx = px + 2 * (q[1] * tz - q[2] * ty), wy = py + 2 * (q[2] * tx - q[0] * tz), wz = pz + 2 * (q[0] * ty - q[1] * tx);
    F[CX] += wx; F[CY] += wy; F[CZ] += wz;
    const vn = (F[VX] * wx + F[VY] * wy + F[VZ] * wz) / d;
    if (vn < 0) { F[VX] -= wx / d * vn; F[VY] -= wy / d * vn; F[VZ] -= wz / d * vn; }
  }
}

// ---------------------------------------------------------------- everything on the seabed
function makeWorld(D, T) {
  const nCells = CELLS * CELLS;
  const cellOf = (x, z) => clamp(floor((x - OX) / CELLW), 0, CELLS - 1) + CELLS * clamp(floor((z - OZ) / CELLW), 0, CELLS - 1);
  // seabed height under every grid column
  const hm = new Float32Array(NX * NZ);
  for (let z = 0; z < NZ; z++) for (let x = 0; x < NX; x++) {
    const c = x + NX * NY * z; let y = NY - 2;
    while (y > 0 && D[c + NX * y] <= 0) y--;
    const d = D[c + NX * y], da = D[c + NX * (y + 1)];
    hm[x + NX * z] = OY + (y + (d > 0 && da <= 0 ? d / (d - da) : 0)) * VS;
  }
  const hAt = (x, z) => {
    x = clamp((x - OX) / VS, 0, NX - 1.001); z = clamp((z - OZ) / VS, 0, NZ - 1.001);
    const ix = x | 0, iz = z | 0, i = ix + NX * iz, fx = x - ix;
    return mix(mix(hm[i], hm[i + 1], fx), mix(hm[i + NX], hm[i + NX + 1], fx), z - iz);
  };
  // instances: 12 floats each (position, scale, rotation, material, seed, fade distance, 1 for a hull section)
  const solids = [], solid = (mesh, x, y, z, sc, q, mat, seed, hull = 0) => { (solids[mesh] ||= []).push(x, y, z, sc, q[0], q[1], q[2], q[3], mat, seed, 0, hull); };
  const lists = [], list = (mesh, maxD) => { const L = { mesh, maxD, cells: Array.from({ length: nCells }, () => []) }; lists.push(L); return L; };
  const put = (L, x, y, z, sc, q, mat, seed) => L.cells[cellOf(x, z)].push(x, y, z, sc, q[0], q[1], q[2], q[3], mat, seed, L.maxD * 0.85, 0);
  const inHull = (x, z, m = 2) => SITE.parts.some((p) => { const l = toShip(p, x, 0, z); return l[0] > p.geom.x0 - m && l[0] < p.geom.x1 + m && abs(l[2]) < BEAM / 2 * p.geom.wide(l[0]) + m; });
  const yaw = () => qAxis(0, 1, 0, rnd() * TAU);

  // --- the hull sections and the boilers
  for (const p of SITE.parts) solid(p.mesh, p.pos[0], p.pos[1], p.pos[2], 1, p.q, 2, 0, 1);
  for (const b of SITE.boilers) solid(M_BOILER, b[0], hAt(b[0], b[1]) + 1.9, b[1], 1, qMul(qAxis(0, 1, 0, -b[2] * PI / 180), qAxis(0, 0, 1, rr(-0.15, 0.15))), 2, rnd());

  // --- named debris. No. 1 hatch cover, blown off when the bow struck, lies ahead of the prow (sources say 30 m
  // to a few hundred feet: 60 m is used) [W6, W9]. The two double-bottom pieces lie east of the hull sections [W3]
  // (their exact positions are only on copyrighted maps: est.)
  { const c = toWorld(SITE.parts[0], -60, 0, 4); solid(M_PLATE, c[0], hAt(c[0], c[2]) + 0.15, c[2], 3.3, qAxis(0, 1, 0, 0.7), 2, 0.3); }
  // the two forward low pressure cylinders lie in the debris with the boilers [W5, W6] (positions est.)
  for (const b of [[58, 374, 1.2], [99, 386, 2.6]]) solid(M_LP, b[0], hAt(b[0], b[1]) + 1.2, b[1], 1, qMul(qAxis(0, 1, 0, b[2]), qAxis(1, 0, 0, 1.35)), 2, rnd());
  for (const b of [[150, 70, 0.5], [128, 150, 2.1]]) solid(M_BOTTOM, b[0], hAt(b[0], b[1]) - 0.3, b[1], 1, qMul(qAxis(0, 1, 0, b[2]), qAxis(1, 0, 0, 0.06)), 2, 0);

  // --- debris field: densest round the stern, thinning along the line to the bow
  const bow = SITE.parts[0], st = SITE.parts[1];
  const sc0 = toWorld(st, (STERN0 + LOA) / 2, 0, 0), bc0 = toWorld(bow, BOW_END, 0, 0);
  const debris = (x, z) => {
    const ax = bc0[0] - sc0[0], az = bc0[2] - sc0[2], t = clamp(((x - sc0[0]) * ax + (z - sc0[2]) * az) / (ax * ax + az * az), 0, 1);
    const dl = hypot(x - sc0[0] - ax * t, z - sc0[2] - az * t), ds = hypot(x - sc0[0], z - sc0[2]);
    return max(exp(-ds * ds / 16000), 0.45 * exp(-dl * dl / 5000) * (1 - 0.6 * t));
  };
  rseed(21);
  const plates = [list(M_PLATE, 70), list(M_PLATE + 1, 70)], coal = list(M_COAL, 20);
  for (let i = 0; i < 60000; i++) {
    const x = rr(-REACH, REACH), z = rr(-REACH, REACH), dn = debris(x, z);
    if (rnd() > dn || inHull(x, z)) continue;
    const y = hAt(x, z);
    if (i % 5 === 0) { const s = 0.4 + 3.6 * pow(rnd(), 3); put(plates[i % 2], x, y + 0.06 * s, z, s, qMul(yaw(), qAxis(1, 0, 0, rr(-0.25, 0.25))), 2, rnd()); }
    else if (!(i % THIN)) put(coal, x, y + 0.02, z, rr(0.05, 0.2), qRand(), 2, rnd());
  }

  // --- stones dropped by icebergs, and pebbles
  rseed(22);
  const rocks = [list(M_ROCK, 80), list(M_ROCK + 1, 80), list(M_ROCK + 2, 80)], pebbles = list(M_PEBBLE, 24);
  for (let i = 0; i < 700; i++) {
    const x = rr(-REACH, REACH), z = rr(-REACH, REACH), s = 0.2 + 1.5 * pow(rnd(), 3);
    if (!inHull(x, z, 6)) put(rocks[i % 3], x, hAt(x, z) + s * 0.15, z, s, qRand(), 1, rnd());
  }
  for (let i = 0; i < 90000; i += THIN) {
    const x = rr(-REACH, REACH), z = rr(-REACH, REACH), s = 0.03 + 0.2 * pow(rnd(), 2);
    put(pebbles, x, hAt(x, z) + s * 0.2, z, s, qRand(), 1, rnd());
  }

  // --- rusticles: under every edge and down the sides
  rseed(23);
  const rus = list(M_RUST, 42);
  for (const p of SITE.parts) {
    const g = p.geom;
    for (let i = (g.x1 - g.x0) * 22 / THIN | 0; i > 0; i--) {
      const x = rr(g.x0 + 1, g.x1 - 1), sg = rnd() < 0.5 ? -1 : 1, top = shellTop(x), y = rnd() < 0.3 ? top - 0.03 : rr(1, top), h = hullHalf(x, y);
      if (h < 0.5 || g.gap(x, y, sg)) continue;
      const w = toWorld(p, x, y, sg * (h + 0.05));
      if (w[1] > hAt(w[0], w[2]) + 0.4) put(rus, w[0], w[1], w[2], rr(0.6, 1.7), p.q, 2, rnd());
    }
  }

  // --- animals that sit still [W9, W15]: brittle stars, sea cucumbers and sea stars on the mud, thickest near
  // the wreck; squat lobsters, anemones and more brittle stars on the decks; corals on the rails and high edges;
  // sponges on the plating
  rseed(25);
  const near = () => { const p = SITE.parts[rnd() < 0.6 ? 0 : 1], c = toWorld(p, rr(p.geom.x0, p.geom.x1), 0, 0), a = rnd() * TAU, d = rr(16, 90); return [c[0] + cos(a) * d, c[2] + sin(a) * d]; };
  const mudSpot = () => { const s = rnd() < 0.65 ? near() : [rr(-REACH, REACH), rr(-REACH, REACH)]; return inHull(s[0], s[1], 1) ? null : s; };
  const HOLES = [H1, H2, H3, F1, F2, STAIR];
  const deckSpot = (edge) => {
    const p = SITE.parts[rnd() < 0.7 ? 0 : 1], g = p.geom, x = rr(g.x0 + 2, g.x1 - 8), y = edge ? shellTop(x) : solidTop(x), h = hullHalf(x, y) - 0.3;
    const z = edge ? (rnd() < 0.5 ? -1 : 1) * (h + 0.3) : rr(-h, h);
    return h < 1 || (!edge && inHole(HOLES, x, z, -0.4)) || g.gap(x, y, z < 0 ? -1 : 1) ? null : [toWorld(p, x, y + 0.02, z), p.q];
  };
  const animals = (mesh, n, maxD, lo, hi, where) => {
    const L = list(mesh, maxD);
    for (let i = 0; i < n; i += THIN) {
      if (where === 0) { const s = mudSpot(); if (s) put(L, s[0], hAt(s[0], s[1]) + 0.01, s[1], rr(lo, hi), yaw(), 3, rnd()); }
      else { const s = deckSpot(where === 2); if (s) put(L, s[0][0], s[0][1], s[0][2], rr(lo, hi), qMul(s[1], yaw()), 3, rnd()); }
    }
  };
  animals(M_BRITTLE, 14000, 30, 0.2, 0.4, 0); animals(M_BRITTLE, 2500, 30, 0.2, 0.4, 1);
  animals(M_CUCUMBER, 2500, 34, 0.2, 0.4, 0); animals(M_STAR, 1500, 34, 0.18, 0.35, 0); animals(M_STAR, 400, 34, 0.18, 0.35, 1);
  animals(M_LOBSTER, 800, 28, 0.12, 0.2, 1); animals(M_ANEMONE, 380, 36, 0.2, 0.45, 1); animals(M_ANEMONE, 260, 36, 0.2, 0.45, 2);
  animals(M_WHIP, 260, 45, 0.5, 1.4, 2); animals(M_BUSH, 600, 42, 0.25, 0.5, 2); animals(M_BUSH, 350, 42, 0.25, 0.5, 1);
  { // sponges on the side plating
    const L = list(M_SPONGE, 26);
    for (let i = 0; i < 700; i += THIN) {
      const p = SITE.parts[rnd() < 0.7 ? 0 : 1], g = p.geom, x = rr(g.x0 + 1, g.x1 - 1), sg = rnd() < 0.5 ? -1 : 1, y = rr(2, shellTop(x)), h = hullHalf(x, y);
      if (h < 0.5 || g.gap(x, y, sg)) continue;
      const w = toWorld(p, x, y, sg * h);
      if (w[1] > hAt(w[0], w[2]) + 0.3) put(L, w[0], w[1], w[2], rr(0.08, 0.3), qRand(), 3, rnd());
    }
  }
  // --- rattails cruising slowly just off the bottom and round the wreck: centre, radius, phase, turn rate,
  // length (up to 0.91 m [W9]), seed
  rseed(26);
  const fish = [];
  // one or two always pass in front of each outside viewpoint
  for (const v of POIS) if (!v.name.startsWith('Inside')) for (let j = 0; j < 2; j++) {
    const R = rr(3.5, 7), cx = mix(v.view[0], v.at[0], 0.5 + j * 0.3) + rr(-2, 2), cz = mix(v.view[2], v.at[2], 0.5 + j * 0.3) + rr(-2, 2);
    fish.push(cx, max(mix(v.view[1], v.at[1], 0.5) + rr(-1, 1.5), hAt(cx, cz) + R * 0.2 + 1), cz, R, rnd() * TAU, (rnd() < 0.5 ? -1 : 1) * rr(0.15, 0.3) / R, rr(0.6, 0.91), rnd());
  }
  for (let i = 0; i < 170; i++) {
    const s = i < 140 ? near() : [rr(-REACH, REACH), rr(-REACH, REACH)], R = rr(5, 16);
    fish.push(s[0], hAt(s[0], s[1]) + rr(1.2, 5) + (i % 5 ? 0 : rr(6, 16)), s[1], R, rnd() * TAU, (rnd() < 0.5 ? -1 : 1) * rr(0.12, 0.3) / R, rr(0.45, 0.91), rnd());
  }

  // --- ground map: r rust staining beside the wreck, g coal, a current ripples
  const gm = new Uint8Array(MAPN * MAPN * 4);
  const ends = SITE.parts.map((p) => [toWorld(p, p.geom.x0, 0, 0), toWorld(p, p.geom.x1, 0, 0)]);
  for (let j = 0; j < MAPN; j++) for (let i = 0; i < MAPN; i++) {
    const x = (i + 0.5) / MAPN * NX * VS + OX, z = (j + 0.5) / MAPN * NZ * VS + OZ, o = (i + MAPN * j) * 4;
    let rust = 0;
    for (const [A, B] of ends) {
      const ax = B[0] - A[0], az = B[2] - A[2], t = clamp(((x - A[0]) * ax + (z - A[2]) * az) / (ax * ax + az * az), 0, 1);
      rust = max(rust, sstep(34, 12, hypot(x - A[0] - ax * t, z - A[2] - az * t)));
    }
    const dn = debris(x, z);
    gm[o] = max(rust, dn * 0.5) * 255; gm[o + 1] = clamp(dn * 1.3, 0, 1) * 255; gm[o + 3] = sstep(0.42, 0.6, fbm(x * 0.012, 3, z * 0.012, 3)) * 255;
  }

  // --- marine snow
  const snow = new Float32Array((9000 >> LV) * 4);
  for (let i = 0; i < snow.length; i++) snow[i] = rnd();

  // which piece the camera is beside, for the readout
  const where = (x, y, z) => {
    for (const p of SITE.parts) {
      const l = toShip(p, x, y, z);
      if (l[0] > p.geom.x0 - 40 && l[0] < p.geom.x1 + 40 && abs(l[2]) < 60) return `${p.name.toUpperCase()}    ${l[0] < 0 ? `${(-l[0]).toFixed(0)} m ahead of the stem` : `${l[0].toFixed(0)} m aft of the stem`}    ${abs(l[2]) < 1 ? 'on the centreline' : `${abs(l[2]).toFixed(0)} m to ${l[2] > 0 ? 'port' : 'starboard'}`}`;
    }
    return `${debris(x, z) > 0.15 ? 'DEBRIS FIELD' : 'OPEN SEABED'}    ${hypot(x - bc0[0], z - bc0[2]).toFixed(0)} m from the bow section    ${hypot(x - sc0[0], z - sc0[2]).toFixed(0)} m from the stern section`;
  };

  const sol = { data: [], ranges: [] }; let si = 0;
  for (let m = 0; m < solids.length; m++) { const a = solids[m] || []; sol.ranges.push([si, a.length / 12]); si += a.length / 12; for (let i = 0; i < a.length; i++) sol.data.push(a[i]); }
  const packC = (L) => {
    let n = 0; const start = new Uint32Array(nCells + 1);
    for (let c = 0; c < nCells; c++) { start[c] = n; n += L.cells[c].length / 12; }
    start[nCells] = n;
    const data = new Float32Array(n * 12), lo = new Float32Array(nCells).fill(1e9), hi = new Float32Array(nCells).fill(-1e9);
    let k = 0;
    for (let c = 0; c < nCells; c++) { const a = L.cells[c]; for (let i = 0; i < a.length; i += 12) { for (let j = 0; j < 12; j++) data[k++] = a[i + j]; lo[c] = min(lo[c], a[i + 1] - 3); hi[c] = max(hi[c], a[i + 1] + 3); } }
    return { mesh: L.mesh, maxD: L.maxD, data, n, start, lo, hi };
  };
  // deck-level outline of each section, for the mini map: x and half breadth every 3 m
  for (const p of SITE.parts) { p.outline = []; for (let x = p.geom.x0; x <= p.geom.x1; x += 3) p.outline.push(x, hullHalf(x, DK.C + sheer(x)) * p.geom.wide(x)); }
  return { solids: { data: new Float32Array(sol.data), ranges: sol.ranges }, scatter: lists.map(packC), gm, snow, hAt, where, fish: new Float32Array(fish) };
}
