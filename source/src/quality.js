// ============================================================================
// quality level, chosen before anything is built
// ============================================================================
// LV: 0 High, 1 Medium, 2 Low. Medium and Low keep every 2nd / 4th pebble and piece of small debris;
// Low also drops anti-aliasing and uses coarser meshes, cheaper filtering and fewer backscatter steps.
// localStorage.wreck = "level,pixels,detail". wreckLoad is set while the world is built: still set on the next
// visit means that load crashed the tab, so this one runs a level lower.
const mob = matchMedia('(pointer:coarse)').matches, mem = navigator.deviceMemory;
const keep = (k, v) => { try { localStorage[k] = v; } catch {} };
let SV = [], LV, bad;
try { SV = (localStorage.wreck || '').split(','); bad = localStorage.wreckLoad; } catch {}
LV = SV[0] ? +SV[0] : mob ? (mem > 7 ? 1 : 2) : mem <= 4 ? 2 : 0;
if (bad && LV < 2) { SV = [++LV]; keep('wreck', LV); }
const THIN = 1 << LV, AA = LV > 1 ? 1 : 4, RAYN = LV > 1 ? 12 : 28;
