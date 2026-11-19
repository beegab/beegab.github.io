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


  /* ---------- hover effects ----------
     Each takes one glyph's context and returns how to move / light it:
     { ox, oy, glow (0..1), scramble, alpha, measured, ghost } */
  const ease = (k) => 1 - Math.exp(-k);
  const HOVER_FX = {
    // a measurement wave spreads out; qubits collapse as it passes
    ripple(c) {
      const wave = Math.exp(-((c.dist - c.ht * 240) ** 2) / (2 * c.band * c.band));
      return { ox: c.ux * wave * 4 + Math.sin(c.t * 2.2 + c.h * 6.28) * 1.2,
        oy: c.uy * wave * 4 - wave * 3 + Math.cos(c.t * 1.8 + c.h * 6.28) * 1.2,
        glow: wave, scramble: wave > 0.3, measured: c.dist < c.ht * 240 };
    },
    // the bloom opens up and breathes
    bloom(c) {
      if (!c.isHead) return { measured: true };
      const k = 0.16 * ease(c.ht * 5) + 0.03 * Math.sin(c.t * 3);
      return { ox: (c.x - c.hcx) * k, oy: (c.y - c.hcy) * k, glow: 0.2 * ease(c.ht * 5) + (Math.sin(c.t * 3 + c.h * 6) > 0.85 ? 0.4 : 0), measured: true };
    },
    // scrambled until a scan line passes top to bottom and decrypts it
    decode(c) {
      const rel = c.y - (c.hcy - c.R * 1.3 + c.ht * 320);
      if (rel > 12) return { scramble: true, alpha: 0.5, measured: false };
      if (rel > -12) return { glow: 1 - Math.abs(rel) / 12, scramble: true, measured: true };
      return { measured: true };
    },
    // digits drip downward like digital rain
    rain(c) {
      const drop = (c.t * 1.1 + c.h) % 1, e = ease(c.ht * 4);
      return { oy: (drop * 12 - 3) * e, alpha: 1 - drop * 0.6 * e, scramble: drop < 0.15, glow: drop < 0.08 ? 0.6 : 0, measured: true };
    },
    // bursts apart, then springs back together
    scatter(c) {
      const amp = 34 * Math.exp(-c.ht * 3) * (0.4 + c.h);
      return { ox: (c.ux + (c.h - 0.5) * 0.9) * amp, oy: (c.uy + (c.h2 - 0.5) * 0.9) * amp,
        glow: Math.exp(-c.ht * 3) * 0.8, scramble: c.ht < 0.5, measured: c.ht > 0.4 };
    },
    // a breeze rolls through; taller parts sway more
    wind(c) {
      const e = ease(c.ht * 3), gust = Math.sin(c.y * 0.045 - c.t * 4.5);
      return { ox: gust * 7 * e * (0.3 + c.heightFrac), oy: Math.cos(c.x * 0.05 - c.t * 3) * 1.5 * e,
        glow: gust > 0.92 ? 0.35 : 0, measured: true };
    },
    // rows tear sideways with a chromatic split
    glitch(c) {
      const bandRow = Math.floor(c.cy / 3), frame = Math.floor(c.t * 9);
      const burst = hash(bandRow, frame, c.seed) < (c.ht < 0.35 ? 0.6 : 0.2);
      return { ox: burst ? (hash(bandRow, frame + 1, c.seed) - 0.5) * 24 : 0, ghost: burst, scramble: burst, glow: burst ? 0.25 : 0, measured: true };
    },
    // a heartbeat of rings, over and over
    pulse(c) {
      const period = 0.9, ph = (c.ht % period) / period;
      const wave = Math.exp(-((c.dist - ph * c.R * 1.8) ** 2) / (2 * c.band * c.band)) * (1 - ph * 0.5);
      return { ox: c.ux * wave * 3, oy: c.uy * wave * 3, glow: wave, scramble: wave > 0.5, measured: true };
    },
    // the bloom slowly turns like a dial
    spin(c) {
      if (!c.isHead) return { measured: true };
      const a = c.ht * 1.1 * (1 - Math.min(1, c.dist / (c.R * 1.4)) * 0.4);
      const dx = c.x - c.hcx, dy = c.y - c.hcy;
      return { ox: dx * Math.cos(a) - dy * Math.sin(a) - dx, oy: dx * Math.sin(a) + dy * Math.cos(a) - dy, glow: 0.1, measured: true };
    },
    // digits push away from your cursor
    repel(c) {
      if (c.mx == null) return { measured: true };
      const dx = c.x - c.mx, dy = c.y - c.my, d = Math.hypot(dx, dy) || 1, r0 = 70;
      if (d > r0) return { measured: true };
      const f = (r0 - d) / r0;
      return { ox: (dx / d) * f * 24, oy: (dy / d) * f * 24, glow: f, scramble: f > 0.5, measured: true };
    },
    // random digits flash and twinkle
    sparkle(c) {
      const on = hash(c.cx, c.cy, c.seed + Math.floor(c.t * 6)) < 0.07;
      return { oy: on ? -2 : 0, glow: on ? 1 : 0, scramble: on, alpha: on ? 1 : 0.75, measured: true };
    },
    // the bloom slowly melts down the stem
    melt(c) {
      if (!c.isHead) return { measured: true };
      const drip = (0.3 + c.h * c.h * 1.4) * 22 * ease(c.ht * 1.2);
      return { oy: drip, alpha: 1 - Math.min(0.5, drip / 60), scramble: c.h2 < 0.05, measured: true };
    },
  };
  // decode + glitch + sparkle: scrambled, decrypted top to bottom while rows
  // tear sideways, then it keeps twinkling with the odd glitch
  HOVER_FX.signal = (c) => {
    const dec = HOVER_FX.decode(c);
    const bandRow = Math.floor(c.cy / 3), frame = Math.floor(c.t * 9);
    const decoding = c.y > c.hcy - c.R * 1.3 + c.ht * 320 - 40; // still near or ahead of the scan
    const burst = hash(bandRow, frame, c.seed) < (decoding ? 0.3 : 0.06);
    const done = dec.measured && !decoding;
    const twinkle = done && hash(c.cx, c.cy, c.seed + Math.floor(c.t * 6)) < 0.06;
    return {
      ox: burst ? (hash(bandRow, frame + 1, c.seed) - 0.5) * (decoding ? 24 : 12) : 0,
      oy: twinkle ? -2 : 0,
      ghost: burst,
      scramble: dec.scramble || burst || twinkle,
      glow: Math.max(dec.glow || 0, burst ? 0.25 : 0, twinkle ? 1 : 0),
      alpha: dec.alpha != null ? dec.alpha : twinkle ? 1 : 0.85,
      measured: dec.measured,
    };
  };
  const EFFECTS = Object.keys(HOVER_FX);

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
    // hover effect (see HOVER_FX below)
    const hov = o.hover;
    const fx = hov ? HOVER_FX[hov.effect] || HOVER_FX.ripple : null;
    const hcx = halfW + spec.hx, hcy = top - spec.L;
    const band = Math.max(10, spec.R * 0.22);
    const fastTick = Math.floor(t * 14);
    const env = { t, ht: hov ? hov.t : 0, hcx, hcy, R: spec.R, L: spec.L, top, band, seed: spec.seed, fastTick,
      mx: hov && hov.mx != null ? hov.mx : null, my: hov && hov.my != null ? hov.my : null };
    for (let cy = 0; cy < rows; cy++)
      for (let cx = 0; cx < cols; cx++) {
        let x = cx * cw + cw / 2, y = cy * ch + ch / 2;
        const [d, part] = density(spec, x - halfW, y - top, stemW);
        // halftone dropout: dense areas stay solid, edges break up into specks
        if (d <= 0 || hash(cx, cy, spec.seed) > Math.min(1, d * d * 1.6)) continue;
        let measured = collapsed, glow = 0, scramble = false, alphaMul = 1, ghost = false;
        if (fx) {
          const dist = Math.hypot(x - hcx, y - hcy);
          const r = fx({ ...env, x, y, cx, cy, dist, ux: dist > 0 ? (x - hcx) / dist : 0, uy: dist > 0 ? (y - hcy) / dist : 0,
            h: hash(cx, cy, spec.seed + 3), h2: hash(cx, cy, spec.seed + 5), isHead: part === 0,
            heightFrac: Math.max(0, Math.min(1, (top - y) / (spec.L + spec.R))) });
          x += r.ox || 0; y += r.oy || 0;
          glow = r.glow || 0; scramble = !!r.scramble; ghost = !!r.ghost;
          if (r.alpha != null) alphaMul = r.alpha;
          if (r.measured != null) measured = r.measured;
        }
        const a = Math.max(0, Math.min(1, (0.28 + 0.72 * d) * (measured ? 1 : 0.82) * alphaMul + glow * 0.5));
        const base = part === 0 ? spec.tint : STEM_TINT;
        const qubit = hash(cx, cy, spec.seed + 2) < (part === 0 ? 0.16 : 0.07);
        let bit = hash(cx, cy, spec.seed + 1) < 0.5;
        if (!measured && hash(cx, cy, spec.seed + 7 + tick) < 0.025) bit = !bit; // bit flips
        if (scramble) bit = hash(cx, cy, spec.seed + 11 + fastTick) < 0.5;
        else if (hov && hash(cx, cy, spec.seed + 13 + tick) < 0.03) bit = !bit; // a little life while hovered
        if (ghost) { // chromatic split for the glitch effect
          g.globalAlpha = a * 0.45;
          g.fillStyle = "#ff7aa2"; g.fillText(bit ? "1" : "0", x + 2.5, y);
          g.fillStyle = "#7ad7ff"; g.fillText(bit ? "1" : "0", x - 2.5, y);
        }
        g.fillStyle = glow > 0.55 ? "#ffffff" : base;
        if (qubit && !measured) {
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

  /* Text links: on hover, letters scramble into 1s and 0s and resolve back
     left to right. Only touches plain-text elements. */
  function scrambleOnHover(root = document) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.querySelectorAll(".corner.link, .btn").forEach((el) => {
      if (el.dataset.scramble || el.children.length) return;
      el.dataset.scramble = "1";
      const text = el.textContent;
      el.setAttribute("aria-label", el.getAttribute("aria-label") || text);
      // keep the width steady while letters change
      el.style.minWidth = el.getBoundingClientRect().width + "px";
      let raf = 0;
      const run = () => {
        cancelAnimationFrame(raf);
        const start = performance.now(), dur = 420;
        const step = (now) => {
          const p = Math.min(1, (now - start) / dur);
          el.textContent = [...text].map((chr, i) => {
            if (/\s|[|⟩→↗←·]/.test(chr)) return chr;
            return i / text.length < p ? chr : Math.random() < 0.5 ? "1" : "0";
          }).join("");
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      };
      el.addEventListener("mouseenter", run);
      el.addEventListener("focus", run);
    });
  }

  return { FONT, TINTS, STEM_TINT, TYPES, EFFECTS, hash, rng, strSeed, makeSpec, stemX, renderFlower, drawMask, scrambleOnHover, BUTTERFLY, BEE };
})();
