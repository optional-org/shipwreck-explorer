// ============================================================================
// WGSL sources for the wreck site: seabed, lamp lighting, wreck materials, marine snow, backscatter
// ============================================================================
// There is no sunlight at 3,800 m. Everything is lit by the submersible's lamp bar (one soft spot just above the
// camera) and fades with the water's absorption on the way out and back. The "survey light" (g.env.x) is not real:
// it lights the whole site evenly and thins the water so the wreck can be seen as a whole.
const wf = (v) => Number(v).toFixed(4);

// ---------------------------------------------------------------- seabed density (compute)
// A gently rolling plain of mud. P holds pairs of vec4: (ax, az, bx, bz), (radius, height, 0, 0): a ridge or a
// hollow along a segment, used for the mud ploughed up around the hull sections.
const W_DENS = W_NOISE + /*wgsl*/`
struct U { n: vec4u, o: vec4f, c: vec4u };
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read_write> D: array<f32>;
@group(0) @binding(2) var<storage, read> P: array<vec4f>;
fn seg2(p: vec2f, a: vec2f, b: vec2f) -> f32 { let pa = p - a; let ba = b - a; let h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0., 1.); return length(pa - ba * h); }
fn dens(p: vec3f) -> f32 {
  var h = 2.4 * (fbm(vec3f(p.xz * .005, 3.), 3) - .5) + .7 * (fbm(vec3f(p.xz * .03, 9.), 3) - .5) + .25 * (fbm(vec3f(p.xz * .13, 5.), 2) - .5);
  for (var i = 0u; i < u.c.x; i++) {
    let a = P[i * 2u]; let b = P[i * 2u + 1u];
    let r = seg2(p.xz, a.xy, a.zw) / b.x;
    h += b.y * exp(-r * r);
  }
  return h - p.y;
}
@compute @workgroup_size(4, 4, 4) fn main(@builtin(global_invocation_id) id: vec3u) {
  if (any(id >= u.n.xyz)) { return; }
  var d = dens(u.o.xyz + vec3f(id) * u.o.w);
  if (id.x == 0u || id.z == 0u || id.x == u.n.x - 1u || id.z == u.n.z - 1u || id.y == u.n.y - 1u) { d = -1.; }
  D[id.x + u.n.x * (id.y + u.n.y * id.z)] = d;
}
`;

// ---------------------------------------------------------------- shared scene code
const S_G = /*wgsl*/`
struct G { vp: mat4x4f, lp: vec4f, ld: vec4f, x0: vec4f, x1: vec4f, cam: vec4f, right: vec4f, up: vec4f, fwd: vec4f, env: vec4f, res: vec4f, mis: vec4f };
// water: light lost per metre (red goes first), lamp colour, the haze of the survey light
const SIG = vec3f(.080, .030, .026);
const LAMP = vec3f(1., .97, .90);
const HAZE = vec3f(.006, .017, .024);
const LOW = ${LV > 1};
fn sat(x: f32) -> f32 { return clamp(x, 0., 1.); }
fn ss(a: f32, b: f32, x: f32) -> f32 { let t = clamp((x - a) / (b - a), 0., 1.); return t * t * (3. - 2. * t); }
fn ign(p: vec2f) -> f32 { return fract(52.9829189 * fract(dot(p, vec2f(.06711056, .00583715)))); }
fn hs(x: f32) -> f32 { return fract(sin(x * 127.1) * 43758.5453); }
fn fin(c: vec3f) -> vec4f { return vec4f(min(max(c, vec3f(0.)), vec3f(40.)), 1.); }
`;
// needs `g`: the water's extinction, the lamp's light arriving at a point, the survey light on a surface
const S_L = /*wgsl*/`
fn sg() -> vec3f { return SIG * mix(1., .2, g.env.x); }
fn lampE(p: vec3f) -> vec3f {
  let v = p - g.lp.xyz; let d2 = dot(v, v); let d = sqrt(d2);
  let spot = ss(.36, .92, dot(v / d, g.ld.xyz));
  return LAMP * (g.lp.w * (spot * .96 + .04) / (d2 + 9.)) * exp(-sg() * d);
}
fn survey(n: vec3f) -> vec3f {
  return g.env.x * (vec3f(.15, .19, .23) * (.35 + .65 * (n.y * .5 + .5)) + vec3f(.40, .42, .40) * sat(dot(n, vec3f(.42, .85, .32))));
}
fn fog(c: vec3f, wp: vec3f) -> vec3f {
  let d = distance(wp, g.cam.xyz);
  // under the survey light the far seabed fades into the same haze as the open water behind it
  let T = exp(-sg() * d) * (1. - g.env.x * ss(110., 240., d));
  return c * T + HAZE * g.env.x * (1. - T.b);
}
`;

const S_B = S_G + /*wgsl*/`
@group(0) @binding(0) var<uniform> g: G;
@group(0) @binding(1) var sR: sampler;
@group(0) @binding(2) var sC: sampler;
@group(0) @binding(3) var tD: texture_2d<f32>;
@group(0) @binding(4) var tM: texture_2d<f32>;
fn qrot(q: vec4f, v: vec3f) -> vec3f { return v + 2. * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
` + S_L;

// ---------------------------------------------------------------- solid meshes (seabed, rocks, wreck)
// Instance: a = position + scale, b = rotation, c = material, seed, fade distance, 1 for a hull section (which
// is shaded in ship coordinates, not offset by its seed).
// Materials: 0 seabed mud, 1 rock, 2 wreck, 3 animals. On the wreck the vertex aux picks the surface: 0 bare steel, .2 shell
// plating, .4 deck, .6 deckhouse wall, .8 bronze, 1 dark opening, .1 wood, .3 tiles, .5 leaded glass, .7 enamel, .9 machinery. The wreck is shaded in ship coordinates
// (x metres aft of the stem, y metres above the keel), so paint lines and portholes sit where the ship had them.
const W_SOLID = S_B + /*wgsl*/`
struct VI { @location(0) p: vec3f, @location(1) n: vec4f, @location(2) a: vec4f, @location(3) b: vec4f, @location(4) c: vec4f };
struct VO { @builtin(position) cp: vec4f, @location(0) wp: vec3f, @location(1) n: vec3f, @location(2) op: vec3f, @location(3) on: vec3f,
  @location(4) @interpolate(flat) m: vec4f, @location(5) @interpolate(flat) q: vec4f, @location(6) ao: f32 };
@vertex fn vs(i: VI) -> VO {
  var o: VO;
  var sc = i.a.w;
  if (i.c.z > 0.) { sc *= 1. - ss(i.c.z * .7, i.c.z, distance(i.a.xyz, g.cam.xyz) / g.mis.z); }
  let w = i.a.xyz + qrot(i.b, i.p * sc);
  o.cp = g.vp * vec4f(w, 1.); o.wp = w; o.n = qrot(i.b, i.n.xyz); o.op = i.p * i.a.w + i.c.y * 37. * (1. - i.c.w); o.on = i.n.xyz;
  o.m = i.c; o.q = i.b; o.ao = i.n.w;
  return o;
}
struct TP { h: f32, c: f32, n: vec3f };
fn tri(p: vec3f, n: vec3f, s: f32) -> TP {
  var w = pow(abs(n), vec3f(4.)); w /= (w.x + w.y + w.z);
  let x = textureSample(tD, sR, p.zy * s); let y = textureSample(tD, sR, p.xz * s); let z = textureSample(tD, sR, p.xy * s);
  var o: TP;
  o.h = x.b * w.x + y.b * w.y + z.b * w.z;
  o.c = x.a * w.x + y.a * w.y + z.a * w.z;
  let a = x.rg * 2. - 1.; let b = y.rg * 2. - 1.; let c = z.rg * 2. - 1.;
  o.n = vec3f(0., a.y, a.x) * w.x + vec3f(b.x, 0., b.y) * w.y + vec3f(c.x, c.y, 0.) * w.z;
  return o;
}
// the deck line rises toward the bow and the stern
fn sheer(x: f32) -> f32 { let f = max(1. - x / ${wf(SHEER_F[1])}, 0.); let a = max((x - ${wf(SHEER_A[1])}) / ${wf(LOA - SHEER_A[1])}, 0.); return ${wf(SHEER_F[0])} * f * f + ${wf(SHEER_A[0])} * a * a; }
// the bow section's two bends (ship.js): how far the hull at x hangs below its as-built line
fn drop(x: f32) -> f32 { return ${wf(BEND[0][1])} * max(${wf(BEND[0][0])} - x, 0.) + ${wf(BEND[1][1])} * max(${wf(BEND[1][0])} - x, 0.); }
// rows of portholes: height above the keel amidships, spacing along the hull
const NPORT = ${PORT_ROWS.length};
const PORT = array<vec2f, ${PORT_ROWS.length}>(${PORT_ROWS.map((r) => `vec2f(${wf(r[0])}, ${wf(r[1])})`).join(', ')});
// x = glass, y = rim
fn ports(x: f32, y: f32) -> vec2f {
  var m = vec2f(0.);
  let ys = y - sheer(x);
  for (var k = 0; k < NPORT; k++) {
    let dy = ys - PORT[k].x;
    if (abs(dy) < .5) {
      let cx = (floor(x / PORT[k].y) + .5) * PORT[k].y;
      if (hs(cx * .37 + f32(k) * 3.1) > .14) {
        let r = length(vec2f(x - cx, dy));
        m = vec2f(1. - ss(.17, .2, r), ss(.17, .2, r) * (1. - ss(.25, .29, r)));
      }
    }
  }
  return m;
}
@fragment fn fs(i: VO, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  let mat = i32(i.m.x + .5); let fl_ = select(-1., 1., ff);
  let on = normalize(i.on) * fl_; let n0 = normalize(i.n) * fl_;
  let dist = length(i.wp - g.cam.xyz);
  let A = tri(i.op, on, .1); let B = tri(i.op, on, .43); let C = tri(i.op, on, 1.9); let F = tri(i.op, on, 6.7); let fk = ss(10., 1.5, dist);
  let big = textureSample(tD, sR, i.op.xz * .013 + i.op.y * .021).a;
  let gm = textureSample(tM, sC, i.wp.xz / ${wf(NX * VS)} + .5);
  let st = textureSample(tD, sR, vec2f((i.op.x + i.op.z) * .21, i.op.y * .03));
  let st2 = textureSample(tD, sR, vec2f((i.op.x - i.op.z) * .9, i.op.y * .09));
  let hgt = A.h * .5 + B.h * .35 + C.h * .15;
  let flt = ss(.72, .93, n0.y);
  var bump = 1.; var gloss = .06; var alb = vec3f(0.); var rip = 0.; var cb = 1.; // cb: how much of the coarse relief
  let mud = mix(vec3f(.27, .24, .20), vec3f(.44, .40, .34), sat(A.c * 1.4 - .2)) * (.62 + .6 * hgt);
  if (mat == 0) {
    // abyssal mud: pale grey-beige ooze, pocked by burrowing animals, rippled by the bottom current in places,
    // stained with rust and scattered with coal near the wreck
    alb = mud * mix(1., .55 + .6 * F.h, fk);
    alb = mix(alb, vec3f(.21, .10, .045) * (.6 + .7 * B.h), gm.r * .75 * ss(.2, .6, B.c + gm.r * .5));
    alb = mix(alb, vec3f(.05, .05, .05), .45 * gm.g * ss(.5, .7, big));
    rip = flt * gm.a * ss(26., 5., dist) * cos((i.wp.x * .8 + i.wp.z * .35) * 19. + A.c * 14.) * .5;
    bump = .5;
  } else if (mat == 1) {
    // boulders dropped by icebergs: dark stone under a film of silt
    alb = mix(vec3f(.04, .04, .045), vec3f(.12, .11, .10), sat(A.c * 1.5 - .25)) * (.35 + 1.1 * hgt) * mix(1., .6 + .8 * F.h, fk);
    alb = mix(alb, mud * .7, flt * .6);
    bump = 1.5;
  } else if (mat == 3) {
    // animals: colour picked by the mesh
    let k = i32(i.ao * 5. + .5);
    alb = vec3f(.72, .70, .66);
    if (k == 1) { alb = vec3f(.74, .34, .14); } else if (k == 2) { alb = vec3f(.66, .40, .46); } else if (k == 3) { alb = vec3f(.74, .52, .16); } else if (k == 4) { alb = vec3f(.66, .60, .40); } else if (k == 5) { alb = vec3f(.58, .12, .08); }
    alb *= .7 + .5 * C.h;
    bump = .2; gloss = .25;
  } else {
    let k = i32(i.ao * 10. + .5);
    // height above the keel as built, for the hull sections
    let sy = i.op.y + drop(i.op.x) * i.m.w;
    let wall = 1. - abs(on.y);
    let hw = i.op.x + i.op.z; // distance along a wall, whichever way it runs
    let near = ss(45., 8., dist);
    // rust: dark brown plate, orange runs of rusticles down every vertical face, pitted and scaly close up
    var rust = mix(vec3f(.085, .04, .02), vec3f(.33, .15, .05), sat(B.c * 1.4 - .15));
    rust = mix(rust, vec3f(.50, .25, .085), ss(.48, .72, st.a * .6 + st2.b * .5) * .75 * wall);
    rust *= (.5 + .8 * hgt) * mix(1., .5 + 1. * F.h, fk);
    let pm = ss(.56, .70, big * .6 + A.c * .5) * .5;
    alb = rust; bump = .9; cb = .15;
    if (k == 2) {
      // shell plating. As built: red antifouling below the waterline, black topsides to the sheer line at C deck,
      // a thin yellow band along it, white above. Plate seams with their rows of rivets, and portholes.
      let ys = sy - sheer(i.op.x) - ${wf(DK.C)};
      var paint = select(vec3f(.022, .022, .026), vec3f(.24, .055, .04), sy < ${wf(WL)});
      paint = mix(paint, vec3f(.34, .34, .31), step(0., ys));
      paint = mix(paint, vec3f(.42, .30, .05), step(abs(ys), .12));
      alb = mix(rust, paint * (.6 + .7 * B.h), pm);
      let sq = fract(sy / 1.83); let sx = fract((i.op.x + floor(sy / 1.83) * 3.) / 9.14);
      let sd = min(sq, 1. - sq) * 1.83;
      alb *= 1. - .4 * near * max(ss(.035, .0, sd), ss(.008, .0, min(sx, 1. - sx)));
      let rv = ss(.3, .12, abs(fract(i.op.x / .14) - .5)) * ss(.035, .012, abs(sd - .075)) * ss(9., 2.5, dist);
      alb = mix(alb, alb * 1.7 + .015, rv);
      var p = ports(i.op.x, sy) * ss(90., 30., dist);
      // the big windows of B deck along the superstructure (spacing est.)
      let wx = fract(i.op.x / 2.3);
      if (ys > 3.65 && ys < 4.75 && i.op.x > ${wf(SUP0 + 2)} && i.op.x < ${wf(SUP1 - 2)} && wx > .22 && wx < .78) { p = vec2f(1., 0.) * ss(90., 30., dist); }
      alb = mix(alb, vec3f(.30, .24, .10), p.y * .8);
      alb = mix(alb, vec3f(.006, .008, .01), p.x);
      gloss = mix(gloss, .7, p.x);
    } else if (k == 4) {
      // deck: steel plates (the planking has been eaten away), seams showing through the silt close up
      alb = mix(rust * .7, vec3f(.13, .10, .07) * (.5 + .8 * B.h), ss(.5, .65, A.c) * .5);
      let dx = fract(i.op.x / 2.44); let dz = fract(i.op.z / 1.22);
      alb *= 1. - .35 * ss(20., 5., dist) * max(ss(.012, .0, min(dx, 1. - dx)), ss(.02, .0, min(dz, 1. - dz)));
    } else if (k == 6) {
      // deckhouse and partition walls: what is left of the white paint
      alb = mix(rust, vec3f(.30, .30, .27) * (.55 + .6 * B.h), pm * .7);
    } else if (k == 8) {
      // bronze and brass: dull gold going green
      alb = mix(vec3f(.30, .21, .07), vec3f(.07, .16, .13), ss(.5, .68, B.c)) * (.6 + .6 * B.h);
      gloss = .3; bump = .4;
    } else if (k == 10) {
      alb = vec3f(.004); bump = 0.; gloss = 0.;
    } else if (k == 1) {
      // wood that survives: dark panelling in framed panels, teak
      let pw = fract(hw / .62); let ph = fract(i.op.y / 1.15);
      alb = mix(vec3f(.10, .045, .025), vec3f(.26, .12, .06), sat(B.c * 1.3 - .1)) * (.6 + .5 * C.h);
      alb *= 1. - .5 * max(ss(.05, .0, min(pw, 1. - pw)), ss(.04, .0, min(ph, 1. - ph))) * wall * near;
      alb = mix(alb, rust, ss(.6, .75, big * .5 + A.c * .5) * .35);
      gloss = .22; bump = .5;
    } else if (k == 3) {
      // glazed tiles, 6 in square: off-white with a blue-green frieze
      let t = vec2f(hw, i.op.y) / .152; let ti = floor(t); let tf = fract(t);
      let row = ti.y - 8. * floor(ti.y / 8.);
      let tc = mix(vec3f(.52, .54, .50), vec3f(.07, .27, .31), step(4.5, row) * step(row, 6.5) * step(.25, hs(ti.x * .37 + ti.y)));
      alb = mix(tc * (.8 + .3 * C.h), vec3f(.04), max(ss(.07, .0, min(tf.x, 1. - tf.x)), ss(.07, .0, min(tf.y, 1. - tf.y))) * ss(16., 4., dist));
      // a century of grime
      alb = mix(alb * .62, mud * .35, ss(.42, .7, B.c * .6 + big * .4) * .45);
      gloss = .5; bump = .12; cb = 0.;
    } else if (k == 5) {
      // leaded glass: small panes in a diamond lattice
      let q = vec2f(hw, i.op.y) / .11;
      let lead = max(ss(.42, .5, abs(fract(q.x + q.y) - .5)), ss(.42, .5, abs(fract(q.x - q.y) - .5)));
      alb = mix(vec3f(.28, .34, .31) * (.7 + .5 * B.h), vec3f(.015), lead * ss(16., 4., dist));
      gloss = .8; bump = .1; cb = 0.;
    } else if (k == 7) {
      // white enamel, rust-stained
      alb = mix(vec3f(.40, .40, .37), rust, ss(.45, .7, B.c) * .65);
      gloss = .6; bump = .2;
    } else if (k == 9) {
      // machinery: black where the oil and paint hold, rust elsewhere
      alb = mix(rust * .7, vec3f(.025, .025, .03), ss(.38, .6, A.c));
      gloss = .3;
    }
    // silt settles on everything that faces up
    alb = mix(alb, mud * .5, flt * ss(.3, .6, B.c * .5 + big * .5) * .5 * f32(k != 10));
  }
  let N = normalize(qrot(i.q, normalize(on + ((A.n * .85 + B.n * .65) * cb + C.n * .45 * ss(60., 12., dist) + F.n * .5 * fk) * bump + vec3f(.8, 0., .35) * rip)));
  let lv = g.lp.xyz - i.wp; let L = normalize(lv); let V = normalize(g.cam.xyz - i.wp);
  let E = lampE(i.wp);
  let ndl = sat(dot(N, L)) * ss(-.15, .15, dot(n0, L));
  var c = alb * (E * ndl + survey(N));
  c += E * pow(sat(dot(N, normalize(V + L))), mix(10., 70., gloss)) * gloss * ndl * 1.8;
  return fin(fog(c, i.wp));
}
`;

// ---------------------------------------------------------------- rattails
// Instance: a = centre of the fish's circuit + its radius, b = phase, turn rate, length, seed
const W_FISH = S_B + /*wgsl*/`
struct VI { @location(0) p: vec3f, @location(1) n: vec4f, @location(2) a: vec4f, @location(3) b: vec4f };
struct VO { @builtin(position) cp: vec4f, @location(0) wp: vec3f, @location(1) n: vec3f, @location(2) op: vec3f };
@vertex fn vs(i: VI) -> VO {
  var o: VO;
  let t = g.cam.w; let R = i.a.w; let ta = t * i.b.y + i.b.x;
  let P = i.a.xyz + vec3f(R * cos(ta), .5 * sin(ta * 1.7 + i.b.w * 9.), R * .7 * sin(ta));
  let T = normalize(vec3f(-R * sin(ta), 0., R * .7 * cos(ta))) * sign(i.b.y);
  let S = normalize(cross(vec3f(0., 1., 0.), T)); let Up = cross(T, S);
  var l = i.p * i.b.z;
  // a slow wave runs down the long tail
  l.z += sin(t * 2.4 + i.b.w * 50. + i.p.x * 6.) * .1 * i.b.z * (.5 - i.p.x);
  let w = P + T * l.x + Up * l.y + S * l.z;
  o.cp = g.vp * vec4f(w, 1.); o.wp = w; o.n = T * i.n.x + Up * i.n.y + S * i.n.z; o.op = i.p;
  return o;
}
@fragment fn fs(i: VO, @builtin(front_facing) ff: bool) -> @location(0) vec4f {
  let n = normalize(i.n) * select(-1., 1., ff);
  // grey-brown back, pale belly, a dark eye
  var alb = mix(vec3f(.42, .42, .44), vec3f(.13, .12, .12), ss(-.03, .05, i.op.y));
  alb = mix(alb, vec3f(.01), ss(.03, .018, length(i.op.xy - vec2f(.39, .02))));
  let L = normalize(g.lp.xyz - i.wp); let V = normalize(g.cam.xyz - i.wp);
  let E = lampE(i.wp);
  var c = alb * (E * (.2 + .8 * sat(dot(n, L))) + survey(n)) + E * pow(sat(dot(n, normalize(V + L))), 30.) * .25;
  return fin(fog(c, i.wp));
}
`;

// ---------------------------------------------------------------- marine snow (additive sprites)
// Flecks of organic debris sinking through the lamp light, in a box that follows the camera.
const W_SPR = S_B + /*wgsl*/`
struct VO { @builtin(position) cp: vec4f, @location(0) uv: vec2f, @location(1) @interpolate(flat) col: vec3f };
@vertex fn vsSnow(@builtin(vertex_index) vi: u32, @location(0) a: vec4f) -> VO {
  var o: VO; let q = vec2f(f32(vi & 1u), f32(vi >> 1u)) * 2. - 1.; let t = g.cam.w;
  let B = 26.;
  var p = a.xyz * B + vec3f(t * .05, -t * .012, t * .03) + .12 * vec3f(sin(t * .3 + a.x * 60.), sin(t * .23 + a.y * 50.), cos(t * .27 + a.z * 70.));
  p = g.cam.xyz + (fract((p - g.cam.xyz) / B + .5) - .5) * B;
  let d = length(p - g.cam.xyz);
  let sz = .004 + .022 * a.w * a.w * a.w;
  let w = p + (g.right.xyz * q.x + g.up.xyz * q.y) * max(sz, d * .0011);
  o.cp = g.vp * vec4f(w, 1.); o.uv = q;
  let fade = ss(B * .5, B * .32, d) * ss(.3, 1.2, d) * min(1., sz / (d * .0011));
  o.col = (lampE(p) * .10 + survey(vec3f(0., 1., 0.)) * .25) * fade * exp(-sg() * d) * mix(vec3f(1.), vec3f(.8, 1., .95), a.w);
  return o;
}
@fragment fn fsSnow(i: VO) -> @location(0) vec4f {
  let m = ss(1., .2, length(i.uv));
  return vec4f(min(max(i.col * m * m, vec3f(0.)), vec3f(8.)), 0.);
}
`;

// ---------------------------------------------------------------- lamp light scattered back by the water (half res)
const W_RAYS = S_G + W_FS + /*wgsl*/`
@group(0) @binding(0) var<uniform> g: G;
@group(0) @binding(1) var tDp: texture_depth${AA > 1 ? '_multisampled' : ''}_2d;
` + S_L + /*wgsl*/`
@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let dp = textureLoad(tDp, vec2i(fc.xy) * 2, 0);
  let uv = fc.xy * 2. * g.res.zw;
  let nd = vec2f(uv.x * 2. - 1., 1. - uv.y * 2.);
  let rv = g.fwd.xyz + g.right.xyz * (nd.x * g.right.w) + g.up.xyz * (nd.y * g.up.w);
  let rl = length(rv); let rd = rv / rl;
  let zl = g.fwd.w / max(dp, 1e-6);
  let tm = min(zl * rl, 45.);
  let j = ign(fc.xy);
  var acc = vec3f(0.);
  // steps get longer with distance: most of the glow is near the lamp
  for (var n = 0; n < ${RAYN}; n++) {
    let u = (f32(n) + j) / ${RAYN}.;
    let t = tm * u * u;
    acc += lampE(g.cam.xyz + rd * t) * exp(-sg() * t) * (2. * tm * u / ${RAYN}.);
  }
  return vec4f(min(acc * vec3f(.7, .9, 1.) * g.mis.y, vec3f(20.)), zl);
}
`;

// ---------------------------------------------------------------- final composite
const W_POST = S_G + W_FS + /*wgsl*/`
@group(0) @binding(0) var<uniform> g: G;
@group(0) @binding(1) var sC: sampler;
@group(0) @binding(2) var tS: texture_2d<f32>;
@group(0) @binding(3) var tR: texture_2d<f32>;
@group(0) @binding(4) var tB: texture_2d<f32>;
@group(0) @binding(5) var tDp: texture_depth${AA > 1 ? '_multisampled' : ''}_2d;
@group(0) @binding(6) var tA: texture_2d<f32>;
fn sat3(x: vec3f) -> vec3f { return clamp(x, vec3f(0.), vec3f(1.)); }
fn tmap(x: vec3f) -> vec3f { return sat3((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14)); }
@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let px = vec2i(fc.xy);
  let uv = fc.xy * g.res.zw;
  let dp = textureLoad(tDp, px, 0);
  let zf = g.fwd.w / max(dp, 1e-6);
  // depth-aware upsample of the half-res backscatter
  let h = fc.xy * .5 - .5; let b = floor(h); let f = h - b; let bi = vec2i(b);
  let mx = vec2i(textureDimensions(tR)) - 1;
  var acc = vec3f(0.); var ws = 0.;
  for (var k = 0; k < 4; k++) {
    let o = vec2i(k & 1, k >> 1);
    let r = textureLoad(tR, clamp(bi + o, vec2i(0), mx), 0);
    let bw = mix(1. - f.x, f.x, f32(o.x)) * mix(1. - f.y, f.y, f32(o.y));
    let w = (bw + .02) / (.02 + abs(r.a - zf) / zf);
    acc += r.rgb * w; ws += w;
  }
  var c = textureLoad(tS, px, 0).rgb + acc / ws;
  // open water under the survey light
  if (dp <= 0.) { c += HAZE * g.env.x; }
  let bl = textureSampleLevel(tB, sC, uv, 0.).rgb;
  c = mix(c, bl, .06) + bl * .03;
  // the camera's iris: close to a surface the lamps would burn the picture out, so the exposure follows the
  // average brightness of the frame (read from the smallest bloom level)
  var lum = 0.;
  for (var k = 0; k < 9; k++) { lum += dot(textureSampleLevel(tA, sC, vec2f(.2 + .3 * f32(k % 3), .2 + .3 * f32(k / 3)), 0.).rgb, vec3f(.2126, .7152, .0722)); }
  c *= g.mis.x * clamp(pow(.2 / max(lum / 9. * g.mis.x, 1e-3), .8), .03, 1.3);
  let q = uv - .5;
  c *= 1. - dot(q, q) * .55;
  c = tmap(c);
  c = pow(max(c, vec3f(0.)), vec3f(1. / 2.2));
  let n = ign(fc.xy) + ign(fc.xy + 37.) - 1.;
  return vec4f(c + n / 255., 1.);
}
`;
