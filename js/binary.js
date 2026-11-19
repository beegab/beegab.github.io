/* Binary flower renderer: flowers, butterflies and bees drawn with 1s and 0s.
   Some glyphs are "qubits": a 1 and a 0 overlaid in superposition. They
   collapse to a definite bit when a flower is measured (hovered). */
window.BG = (() => {
  const FONT = '"IBM Plex Mono", ui-monospace, monospace';

  // glyph tints, keyed by the color names used in projects.js
  const TINTS = {
    pink:   "#f2c6cf",
    lilac:  "#d8ccf0",
    butter: "#ece3a4",
    peach:  "#f2cfb2",
    sky:    "#c8dbee",
    coral:  "#f0a090",
    mint:   "#d4ebc2",
    snow:   "#eef0dc",
  };
  const STEM_TINT = "#b3c48c";
  const TYPES = ["daisy", "tulip", "lily", "rose", "star", "sunflower"];

  function hash(x, y, s) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function strSeed(str) {
    let h = 2166136261;
    for (let k = 0; k < str.length; k++) { h ^= str.charCodeAt(k); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Flower heads as density fields: (x, y) in head radii, y points down.
     Return 0 for empty, up to 1 for dense. */
  const HEADS = {
    daisy(x, y) {
      const r = Math.hypot(x, y), a = Math.atan2(y, x);
      if (r < 0.26) return 1;
      const e = 0.3 + 0.7 * Math.pow(Math.abs(Math.cos(a * 6)), 0.7);
      return r < e ? 0.5 + 0.5 * (1 - r / e) : 0;
    },
    star(x, y) {
      const r = Math.hypot(x, y), a = Math.atan2(y, x) + Math.PI / 2;
      if (r < 0.18) return 1;
      const e = 0.22 + 0.78 * Math.pow(Math.abs(Math.cos(a * 2.5)), 1.5);
      return r < e ? 0.45 + 0.55 * (1 - r / e) : 0;
    },
    sunflower(x, y) {
      const r = Math.hypot(x, y), a = Math.atan2(y, x);
      if (r < 0.42) return 0.85; // seed head
      const e = 0.5 + 0.5 * Math.pow(Math.abs(Math.cos(a * 9)), 0.9);
      return r < e ? 0.4 + 0.4 * (1 - r / e) : 0;
    },
    // side-view rose: a tight bud wrapped by separate flaring petals,
    // with gaps between them so it never reads as a solid disc
    rose(x, y) {
      const ell = (cx, cy, rx, ry, rot) => {
        const c = Math.cos(rot), s = Math.sin(rot);
        const u = ((x - cx) * c + (y - cy) * s) / rx, v = (-(x - cx) * s + (y - cy) * c) / ry;
        return u * u + v * v;
      };
      // bud with a notched top
      const bud = ell(0, -0.22, 0.32, 0.46, 0);
      if (bud < 1) {
        if (y < -0.5 && Math.abs(x) < 0.06) return 0; // notch between bud petals
        return 0.95;
      }
      if (bud < 1.45) return 0; // gap around the bud
      // two side petals curling outward
      for (const side of [-1, 1]) {
        const e = ell(side * 0.42, 0.02, 0.3, 0.55, side * 0.5);
        if (e < 1) return e > 0.55 ? 0.75 : 0.45;
      }
      // lower cupped petal
      const low = ell(0, 0.5, 0.55, 0.26, 0);
      if (low < 1 && y > 0.32) return 0.6;
      // sepals: two small points under the bloom
      for (const side of [-1, 1]) {
        if (ell(side * 0.32, 0.78, 0.22, 0.07, side * -0.5) < 1) return 0.7;
      }
      return 0;
    },
    // lily: six long pointed petals and stamens
    lily(x, y) {
      const r = Math.hypot(x, y), a = Math.atan2(y, x) + Math.PI / 2;
      if (r < 0.14) return 0.9;
      const lobe = Math.pow(Math.abs(Math.cos(a * 3)), 3);
      const e = 0.15 + 0.85 * lobe;
      if (r < e) return 0.4 + 0.5 * (1 - r / e) + (lobe > 0.97 ? 0.2 : 0); // midrib
      // stamens: thin rays between the petals
      const st = Math.abs(Math.sin(a * 3));
      if (st > 0.995 && r < 0.62) return 0.7;
      return 0;
    },
    tulip(x, y) {
      if (y < -1 || y > 0.85) return 0;
      const w = 0.72 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 0.05) / 0.82, 2)));
      if (Math.abs(x) > w) return 0;
      const top = -1 + 0.45 * Math.abs(Math.sin((x * Math.PI) / 0.6));
      if (y < top) return 0;
      const fold = Math.abs(Math.abs(x) - 0.3) < 0.05 ? 0.25 : 0;
      return 0.55 + 0.45 * (1 - Math.abs(x) / w) - fold;
    },
  };

  function makeSpec(p, i, R, L) {
    const seed = strSeed(p.id || String(i));
    const r = rng(seed);
    const type = HEADS[p.flower] ? p.flower : TYPES[i % TYPES.length];
    const tint = TINTS[p.color] || Object.values(TINTS)[i % 8];
    const leaves = [];
    const nl = 1 + Math.floor(r() * 2);
    let side = r() < 0.5 ? 1 : -1;
    for (let k = 0; k < nl; k++) {
      leaves.push({ s: 0.12 + r() * 0.4, side, len: R * (0.9 + r() * 0.7), elev: 0.35 + r() * 0.5 });
      side = -side;
    }
    return {
      seed, type, tint, R, L, leaves,
      bend: (r() - 0.5) * R * 1.3,
      hx: (r() - 0.5) * R * 0.8,
      tilt: (r() - 0.5) * 0.6,
    };
  }

  const stemX = (spec, s) => 2 * (1 - s) * s * spec.bend + s * s * spec.hx;

  // returns density and which part (0 = bloom, 1 = stem/leaf)
  function density(spec, lx, ly, stemW) {
    const { R, L } = spec;
    const dx = (lx - spec.hx) / R, dy = (ly + L) / R;
    if (dx * dx + dy * dy < 1.6) {
      const c = Math.cos(spec.tilt), s = Math.sin(spec.tilt);
      const d = HEADS[spec.type](dx * c - dy * s, dx * s + dy * c);
      if (d > 0) return [d, 0];
    }
    let best = 0;
    const s = -ly / L;
    if (s >= 0 && s <= 1 && Math.abs(lx - stemX(spec, s)) < stemW) best = 0.75;
    for (const lf of spec.leaves) {
      const ax = stemX(spec, lf.s), ay = -L * lf.s;
      const ux = lf.side * Math.cos(lf.elev), uy = -Math.sin(lf.elev);
      const rx = lx - ax, ry = ly - ay;
      const along = rx * ux + ry * uy;
      if (along <= 0 || along >= lf.len) continue;
      const curve = 0.12 * lf.len * Math.sin((Math.PI * along) / lf.len);
      const q = -rx * uy + ry * ux + curve * lf.side;
      const hw = lf.len * 0.2 * Math.sin((Math.PI * along) / lf.len);
      if (Math.abs(q) < hw) best = Math.max(best, Math.abs(q) < hw * 0.18 ? 0.8 : 0.35 + 0.3 * (1 - Math.abs(q) / hw));
    }
    return [best, 1];
  }

  /* Draws a flower into cache.canvas. Origin (ox, oy) is the base of the stem. */
  function renderFlower(spec, cache, t, o) {
    const { cw, ch, fs, collapsed } = o;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const maxLeaf = Math.max(0, ...spec.leaves.map((l) => l.len));
    const halfW = Math.ceil(Math.max(Math.abs(spec.hx) + spec.R * 1.15, maxLeaf + Math.abs(spec.bend) * 0.6) + cw * 2);
    const top = Math.ceil(spec.L + spec.R * 1.15 + ch * 2);
    const w = halfW * 2, h = top + Math.ceil(ch * 2);
    if (!cache.canvas) cache.canvas = document.createElement("canvas");
    const c = cache.canvas;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    }
    Object.assign(cache, { ox: halfW, oy: top, w, h });
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.font = `500 ${fs}px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const tick = Math.floor(t * 5);
    const cols = Math.ceil(w / cw), rows = Math.ceil(h / ch);
    const stemW = cw * 0.75;
    for (let cy = 0; cy < rows; cy++)
      for (let cx = 0; cx < cols; cx++) {
        const x = cx * cw + cw / 2, y = cy * ch + ch / 2;
        const [d, part] = density(spec, x - halfW, y - top, stemW);
        // halftone dropout: dense areas stay solid, edges break up into specks
        if (d <= 0 || hash(cx, cy, spec.seed) > Math.min(1, d * d * 1.6)) continue;
        const a = (0.28 + 0.72 * d) * (collapsed ? 1 : 0.82);
        g.fillStyle = part === 0 ? spec.tint : STEM_TINT;
        const qubit = hash(cx, cy, spec.seed + 2) < (part === 0 ? 0.16 : 0.07);
        let bit = hash(cx, cy, spec.seed + 1) < 0.5;
        if (!collapsed && hash(cx, cy, spec.seed + 7 + tick) < 0.025) bit = !bit; // bit flips
        if (qubit && !collapsed) {
          const k = 0.5 + 0.3 * Math.sin(t * 2.4 + hash(cx, cy, spec.seed + 3) * 6.283);
          g.globalAlpha = a * k; g.fillText("1", x, y);
          g.globalAlpha = a * (1 - k); g.fillText("0", x, y);
        } else {
          g.globalAlpha = a;
          g.fillText(bit ? "1" : "0", x, y);
        }
      }
    g.globalAlpha = 1;
    return cache;
  }

  /* Small creatures from a character mask.
     map: char -> [color, alpha, qubitChance] */
  function drawMask(g, rows, map, cx, cy, fs, cw, ch, t, seed) {
    g.font = `500 ${fs}px ${FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const w = rows[0].length, h = rows.length;
    const x0 = cx - (w * cw) / 2 + cw / 2, y0 = cy - (h * ch) / 2 + ch / 2;
    for (let r = 0; r < h; r++)
      for (let c = 0; c < w; c++) {
        const m = map[rows[r][c]];
        if (!m) continue;
        const [color, alpha, q = 0] = m;
        const x = x0 + c * cw, y = y0 + r * ch;
        g.fillStyle = color;
        if (hash(c, r, seed) < q) {
          const k = 0.5 + 0.3 * Math.sin(t * 3 + hash(c, r, seed + 1) * 6.28);
          g.globalAlpha = alpha * k; g.fillText("1", x, y);
          g.globalAlpha = alpha * (1 - k); g.fillText("0", x, y);
        } else {
          g.globalAlpha = alpha;
          g.fillText(hash(c, r, seed + 2 + Math.floor(t * 3)) < 0.5 ? "1" : "0", x, y);
        }
      }
    g.globalAlpha = 1;
  }

  const BUTTERFLY = [
    "WW...WW",
    "WAW.WAW",
    "WWWBWWW",
    ".WWBWW.",
    ".AW.WA.",
  ];
  const BEE = [
    ".ww....",
    "wwww...",
    ".YKYKYE",
    "YKYKYKY",
    ".YKYKY.",
  ];

  return { FONT, TINTS, STEM_TINT, TYPES, hash, rng, strSeed, makeSpec, stemX, renderFlower, drawMask, BUTTERFLY, BEE };
})();
