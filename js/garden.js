/* The binary garden. Flowers come from js/projects.js. */
(() => {
  const BG = window.BG;
  const SITE = window.SITE || {};
  const projects = window.PROJECTS || [];

  const canvas = document.getElementById("garden");
  const ctx = canvas.getContext("2d");
  const tip = document.getElementById("tip");
  const hud = document.querySelector(".hud");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CREAM = "#e8edc4";

  let W = 0, H = 0, dpr = 1, fs = 11, cw = 7, ch = 10, topLimit = 200;
  let bg = null, grainPat = null;
  let flowers = [], butterflies = [], bees = [], bits = [];
  let hovered = null, armed = null, lastPointer = "mouse";
  let t = 0, hoverStart = 0, mouseX = null, mouseY = null;

  // hover effects: SITE.hoverEffect = "mixed" gives every flower a different
  // one (to compare), or set it to a single name like "ripple" for all of them
  const fxChoice = SITE.hoverEffect || "mixed";
  const effectFor = (i) => BG.effectFor(fxChoice, i);

  const hrefFor = (p) => p.page || `project.html?id=${encodeURIComponent(p.id)}`;
  const isExternal = (p) => /^https?:\/\//.test(p.page || "");
  const openProject = (p) => {
    if (isExternal(p)) window.open(p.page, "_blank", "noopener");
    else location.href = hrefFor(p);
  };

  /* ---------- header + list ---------- */
  if (SITE.name) {
    document.title = [`${SITE.name}${SITE.alias ? " · " + SITE.alias : ""}`, SITE.role].filter(Boolean).join(" — ");
    document.getElementById("siteTitle").textContent = SITE.name;
  }
  if (SITE.alias || SITE.role)
    document.getElementById("siteLabel").textContent = [SITE.alias, SITE.role].filter(Boolean).join(" · ");
  if (SITE.tagline) document.getElementById("siteTagline").textContent = SITE.tagline;

  /* The name: decodes from 1s and 0s with a brief glitch, then twinkles while
     hovered. Purely decorative: it isn't a link and does nothing on click. */
  (function gentleName(el) {
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const letters = [...text].map((ch) => {
      const sp = document.createElement("span");
      sp.className = "nl";
      sp.textContent = ch;
      sp.setAttribute("aria-hidden", "true");
      el.append(sp);
      return sp;
    }).filter((sp) => sp.textContent.trim());
    let raf = 0, sparkTimer = 0, hovering = false;
    const bit = () => (Math.random() < 0.5 ? "1" : "0");
    const decode = () => {
      cancelAnimationFrame(raf);
      el.classList.remove("glitch"); void el.offsetWidth; el.classList.add("glitch");
      const start = performance.now(), dur = 700;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        letters.forEach((sp, i) => {
          const done = i / letters.length < p;
          sp.classList.toggle("scr", !done);
          if (!done) sp.dataset.bit = bit();
        });
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const sparkle = () => {
      if (!hovering) return;
      const picks = letters.slice().sort(() => Math.random() - 0.5).slice(0, 3);
      picks.forEach((sp) => {
        sp.classList.add("spark");
        if (Math.random() < 0.5) { sp.classList.add("scr"); sp.dataset.bit = bit(); }
        setTimeout(() => sp.classList.remove("spark", "scr"), 320);
      });
      sparkTimer = setTimeout(sparkle, 650 + Math.random() * 400);
    };
    el.addEventListener("mouseenter", () => { hovering = true; decode(); clearTimeout(sparkTimer); sparkTimer = setTimeout(sparkle, 800); });
    el.addEventListener("mouseleave", () => {
      hovering = false;
      clearTimeout(sparkTimer);
      letters.forEach((sp) => sp.classList.remove("spark"));
    });
  })(document.getElementById("siteTitle"));
  const countEl = document.getElementById("count");
  if (countEl) countEl.textContent = `n = ${String(projects.length).padStart(2, "0")}`;

  const listEl = document.getElementById("projectList");
  projects.forEach((p, i) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = hrefFor(p);
    if (isExternal(p)) { a.target = "_blank"; a.rel = "noopener"; }
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = i.toString(2).padStart(4, "0");
    num.style.color = BG.TINTS[p.color] || CREAM;
    const name = document.createElement("span");
    name.textContent = p.title;
    a.append(num, name);
    const hl = () => setHover(flowers.find((f) => f.p === p) || null);
    a.addEventListener("mouseenter", hl);
    a.addEventListener("focus", hl);
    a.addEventListener("mouseleave", () => setHover(null));
    a.addEventListener("blur", () => setHover(null));
    li.append(a);
    listEl.append(li);
  });

  const panel = document.getElementById("panel");
  const listBtn = document.getElementById("listBtn");
  const togglePanel = (open) => {
    panel.hidden = !open;
    listBtn.setAttribute("aria-expanded", String(open));
  };
  // the list drops down from whichever control opened it
  listBtn.addEventListener("click", () => { panel.classList.remove("from-top"); togglePanel(panel.hidden); });
  document.getElementById("cornerList").addEventListener("click", () => { panel.classList.add("from-top"); togglePanel(panel.hidden); });
  document.getElementById("closePanel").addEventListener("click", () => togglePanel(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape") togglePanel(false); });

  /* ---------- sizing ---------- */
  function resize() {
    W = innerWidth || document.documentElement.clientWidth;
    H = innerHeight || document.documentElement.clientHeight;
    if (!W || !H) { setTimeout(resize, 100); return; }
    dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    fs = Math.round(Math.max(8, Math.min(11, W / 130)));
    cw = fs * 0.64;
    ch = fs * 0.92;
    topLimit = hud.getBoundingClientRect().bottom + 56; // breathing room under the name
    buildBackground();
    buildGrain();
    layoutFlowers();
    seedCritters();
  }

  /* ---------- soft-focus background ---------- */
  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function blob(g, x, y, r, hex, a) {
    const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, rgba(hex, a));
    rg.addColorStop(0.55, rgba(hex, a * 0.45));
    rg.addColorStop(1, rgba(hex, 0));
    g.fillStyle = rg;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function buildBackground() {
    bg = document.createElement("canvas");
    bg.width = canvas.width; bg.height = canvas.height;
    const g = bg.getContext("2d");
    g.scale(dpr, dpr);
    const M = Math.max(W, H);

    const lin = g.createLinearGradient(0, 0, 0, H);
    lin.addColorStop(0, "#2b3a2a");
    lin.addColorStop(0.55, "#1d291e");
    lin.addColorStop(1, "#101710");
    g.fillStyle = lin;
    g.fillRect(0, 0, W, H);

    // out-of-focus foliage and a warm light leak
    [
      [0.78, 0.12, 0.55, "#c9c58c", 0.5],
      [0.12, 0.3, 0.45, "#5f7c46", 0.6],
      [0.5, 0.72, 0.6, "#3c5534", 0.75],
      [0.95, 0.7, 0.35, "#80915a", 0.4],
      [0.3, 0.02, 0.3, "#a3ad78", 0.3],
      [0.02, 0.95, 0.35, "#6b4b52", 0.35],
      [0.62, 0.42, 0.22, "#d9d6a6", 0.12],
    ].forEach(([x, y, r, c, a]) => blob(g, x * W, y * H, r * M, c, a));

    // bokeh
    const r = BG.rng(5);
    for (let i = 0; i < 10; i++) {
      const x = r() * W, y = r() * H * 0.8, rad = 14 + r() * 50;
      const rg = g.createRadialGradient(x, y, 0, x, y, rad);
      const a = 0.04 + r() * 0.08;
      rg.addColorStop(0, rgba("#ecebc0", a));
      rg.addColorStop(0.75, rgba("#ecebc0", a * 0.9));
      rg.addColorStop(1, rgba("#ecebc0", 0));
      g.fillStyle = rg;
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
    }

    // vignette
    const vg = g.createRadialGradient(W / 2, H / 2, M * 0.25, W / 2, H / 2, M * 0.75);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.5)");
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    // editorial tick marks along the edges
    g.font = `10px ${BG.FONT}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = rgba("#e8edc4", 0.35);
    let k = 0;
    for (let x = 60; x < W - 60; x += 22, k++) {
      g.fillText(k % 4 === 0 ? "|" : "-", x, 14);
      g.fillText(k % 4 === 0 ? "|" : "-", x, H - 12);
    }
  }

  function buildGrain() {
    const n = 160;
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const g = c.getContext("2d");
    const img = g.createImageData(n, n);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() < 0.5 ? 0 : 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.random() * 28;
    }
    g.putImageData(img, 0, 0);
    grainPat = ctx.createPattern(c, "repeat");
  }

  /* ---------- flowers ---------- */
  function layoutFlowers() {
    const n = projects.length;
    flowers = [];
    if (!n) return;
    const r = BG.rng(11);
    let cols = Math.max(Math.min(n, 2), Math.min(n, Math.floor(W / 250)));
    const rows = Math.ceil(n / cols);
    cols = Math.ceil(n / rows);
    const colW = W / cols;
    const field = H - topLimit;
    // size blooms to the space: every flower needs roughly a (2.6R)² patch to stay clear
    const fit = Math.sqrt((W * field) / n) / 2.6;
    const R0 = Math.max(26, Math.min(130, fit));
    // plant blooms one at a time in the biggest open space left ("best candidate"
    // sampling), so the garden fills evenly at any screen size, with no empty patches
    const order = projects.map((_, i) => i);
    for (let k = order.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1));
      [order[k], order[j]] = [order[j], order[k]];
    }
    const placed = [];
    for (const i of order) {
      const p = projects[i];
      const typeGuess = p.flower || BG.TYPES[i % BG.TYPES.length];
      const R = R0 * (0.75 + r() * 0.45) * (typeGuess === "sunflower" ? 1.08 : 1);
      const by = H + 6 - r() * Math.min(70, field * 0.12); // stems planted at slightly different depths
      const xLo = R + 10, xHi = Math.max(xLo, W - R - 10);
      const yLo = topLimit + R, yHi = Math.max(yLo, by - R * 2.4);
      let best = { x: (xLo + xHi) / 2, y: (yLo + yHi) / 2 }, bestScore = -Infinity;
      for (let k = 0; k < 90; k++) {
        const x = xLo + r() * (xHi - xLo), y = yLo + r() * (yHi - yLo);
        // distance to the nearest bloom's edge; the frame counts as a soft neighbour
        let score = Math.min(x - xLo, xHi - x, y - yLo, yHi - y) + R * 0.7;
        for (const q of placed) score = Math.min(score, Math.hypot(x - q.x, y - q.y) - (R + q.R) * 1.12);
        if (score > bestScore) { bestScore = score; best = { x, y }; }
      }
      placed.push({ x: best.x, y: best.y, R });
      const spec = BG.makeSpec(p, i, R, Math.max(R * 2.2, by - best.y));
      flowers.push({ p, spec, x: best.x - spec.hx, y: by, cache: {}, phase: r() * 6.28, next: 0, effect: effectFor(i) });
    }

    // push blooms apart (sideways and up/down) so every flower stays visible
    const headOf = (f) => ({ x: f.x + f.spec.hx, y: f.y - f.spec.L });
    const clampFlower = (f) => {
      const R = f.spec.R;
      f.x = Math.max(R - f.spec.hx + 8, Math.min(W - R - f.spec.hx - 8, f.x));
      const maxL = Math.max(R * 2.2, f.y - (topLimit + R)); // keep the bloom below the header
      f.spec.L = Math.max(R * 2.2, Math.min(maxL, f.spec.L));
    };
    for (let pass = 0; pass < 120; pass++) {
      let moved = false;
      for (let a = 0; a < flowers.length; a++)
        for (let b = a + 1; b < flowers.length; b++) {
          const A = flowers[a], B = flowers[b], ha = headOf(A), hb = headOf(B);
          const need = (A.spec.R + B.spec.R) * 1.08;
          let dx = hb.x - ha.x, dy = hb.y - ha.y, dist = Math.hypot(dx, dy);
          if (dist >= need) continue;
          if (dist < 1) { dx = a % 2 ? 1 : -1; dy = 0.5; dist = Math.hypot(dx, dy); }
          const push = (need - dist) / 2, ux = dx / dist, uy = dy / dist;
          A.x -= ux * push; B.x += ux * push;
          A.spec.L += uy * push; B.spec.L -= uy * push; // moving a head up means a longer stem
          moved = true;
        }
      flowers.forEach(clampFlower);
      if (!moved) break;
    }
    flowers.sort((a, b) => (a.y - a.spec.L) - (b.y - b.spec.L));
  }

  const swayOf = (f) => (reduce ? 0 : Math.sin(t * 0.9 + f.phase) * 0.022);

  function headWorld(f) {
    const a = swayOf(f), hx = f.spec.hx, hy = -f.spec.L;
    return { x: f.x + hx * Math.cos(a) - hy * Math.sin(a), y: f.y + hx * Math.sin(a) + hy * Math.cos(a) };
  }

  function drawFlower(f) {
    // the hovered flower animates every frame; the rest refresh a few times a second
    if (f === hovered || t >= f.next || !f.cache.canvas) {
      const c0 = f.cache;
      const hover = f === hovered && !reduce
        ? { t: t - hoverStart, effect: f.effect,
            mx: mouseX == null || c0.ox == null ? null : mouseX - f.x + c0.ox,
            my: mouseY == null || c0.oy == null ? null : mouseY - f.y + c0.oy }
        : null;
      BG.renderFlower(f.spec, f.cache, t, { cw, ch, fs, collapsed: f === hovered, hover });
      f.next = t + 0.09 + Math.random() * 0.05;
    }
    const c = f.cache;
    // soft glow behind the bloom
    const h = headWorld(f), gr = f.spec.R * (f === hovered ? 2 : 1.6);
    const halo = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, gr);
    halo.addColorStop(0, rgba(f.spec.tint, f === hovered ? 0.2 : 0.1));
    halo.addColorStop(1, rgba(f.spec.tint, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(h.x - gr, h.y - gr, gr * 2, gr * 2);
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(swayOf(f));
    ctx.drawImage(c.canvas, -c.ox, -c.oy, c.w, c.h);
    ctx.restore();
    if (f === hovered) drawBrackets(f);
  }

  // viewfinder brackets around a measured flower
  function drawBrackets(f) {
    const h = headWorld(f), R = f.spec.R * 1.15, k = Math.min(16, R * 0.3);
    ctx.strokeStyle = rgba("#e8edc4", 0.7);
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = h.x + sx * R, y = h.y + sy * R;
      ctx.moveTo(x - sx * k, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y - sy * k);
    }
    ctx.stroke();
  }

  function flowerAt(mx, my) {
    for (let i = flowers.length - 1; i >= 0; i--) {
      const f = flowers[i], h = headWorld(f);
      if (Math.hypot(mx - h.x, my - h.y) < f.spec.R * 1.05) return f;
      const s = (f.y - my) / f.spec.L;
      if (s >= 0 && s <= 1 && Math.abs(mx - (f.x + BG.stemX(f.spec, s))) < 10) return f;
    }
    return null;
  }

  /* ---------- critters ---------- */
  const tintList = Object.values(BG.TINTS);

  function seedCritters() {
    const r = Math.random;
    butterflies = Array.from({ length: Math.max(3, Math.round(W / 320)) }, (_, i) => {
      const b = { x: r() * W, y: topLimit * 0.6 + r() * H * 0.4, vx: 0, vy: 0, phase: r() * 6, tint: tintList[(i * 3) % tintList.length], seed: i * 31 };
      newButterflyTarget(b);
      return b;
    });
    bees = Array.from({ length: Math.max(2, Math.round(W / 450)) }, (_, i) => {
      const b = { x: r() * W, y: H * 0.6, vx: 0, vy: 0, phase: r() * 6, seed: 900 + i };
      pickBeeFlower(b);
      return b;
    });
  }

  function newButterflyTarget(b) {
    if (flowers.length && Math.random() < 0.45) {
      const f = flowers[Math.floor(Math.random() * flowers.length)], h = headWorld(f);
      b.tx = h.x; b.ty = h.y - f.spec.R * 1.3;
    } else {
      b.tx = 30 + Math.random() * (W - 60);
      b.ty = topLimit * 0.5 + Math.random() * (H * 0.75 - topLimit * 0.5);
    }
    b.timer = 3 + Math.random() * 5;
  }

  function pickBeeFlower(b) {
    b.flower = flowers.length ? flowers[Math.floor(Math.random() * flowers.length)] : null;
    b.timer = 2.5 + Math.random() * 4;
  }

  function steer(o, tx, ty, accel, damp, max, dt) {
    o.vx += (tx - o.x) * accel * dt;
    o.vy += (ty - o.y) * accel * dt;
    const k = Math.pow(damp, dt);
    o.vx *= k; o.vy *= k;
    const v = Math.hypot(o.vx, o.vy);
    if (v > max) { o.vx *= max / v; o.vy *= max / v; }
    o.x += o.vx * dt; o.y += o.vy * dt;
  }

  /* ---------- loop ---------- */
  function update(dt) {
    for (const b of butterflies) {
      steer(b, b.tx, b.ty, 0.9, 0.35, 85, dt);
      b.y += Math.sin(t * 4 + b.phase) * 28 * dt;
      b.timer -= dt;
      if (b.timer < 0 || Math.hypot(b.tx - b.x, b.ty - b.y) < 12) newButterflyTarget(b);
    }
    for (const b of bees) {
      let tx = b.x, ty = b.y;
      if (b.flower) {
        const h = headWorld(b.flower), R = b.flower.spec.R;
        tx = h.x + Math.cos(t * 2.2 + b.phase) * R * 0.9;
        ty = h.y - R * 0.4 + Math.sin(t * 4.4 + b.phase) * R * 0.35;
      }
      steer(b, tx, ty, 3, 0.2, 170, dt);
      b.timer -= dt;
      if (b.timer < 0 && b.flower !== hovered) pickBeeFlower(b);
    }
    for (const p of bits) {
      p.vy += 40 * dt; p.vx *= Math.pow(0.4, dt);
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    }
    bits = bits.filter((p) => p.life > 0);
  }

  function draw() {
    if (!bg) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const f of flowers) drawFlower(f);

    const bfs = fs * 0.9, bcw = cw * 0.9, bch = ch * 0.85;
    for (const b of butterflies) {
      const flap = 0.3 + 0.7 * Math.abs(Math.cos(t * 6 + b.phase));
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(flap * (b.vx < 0 ? -1 : 1), 1);
      BG.drawMask(ctx, BG.BUTTERFLY, {
        W: [b.tint, 0.85, 0.3], A: ["#fffbe8", 1], B: [CREAM, 0.6],
      }, 0, 0, bfs, bcw, bch, t, b.seed);
      ctx.restore();
    }
    for (const b of bees) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.scale(b.vx < 0 ? -1 : 1, 1);
      const wing = Math.floor(t * 20) % 2 ? 0.75 : 0.35;
      BG.drawMask(ctx, BG.BEE, {
        Y: [BG.TINTS.butter, 1], K: [BG.TINTS.butter, 0.35], w: [CREAM, wing, 0.6], E: ["#ffffff", 1],
      }, 0, 0, fs * 0.75, cw * 0.75, ch * 0.7, t, b.seed);
      ctx.restore();
    }

    ctx.font = `500 ${fs}px ${BG.FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const p of bits) {
      ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.globalAlpha = 1;

    // film grain
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    const ox = reduce ? 0 : Math.floor(Math.random() * 160), oy = reduce ? 0 : Math.floor(Math.random() * 160);
    ctx.translate(-ox, -oy);
    ctx.fillStyle = grainPat;
    ctx.fillRect(0, 0, canvas.width + 160, canvas.height + 160);
    ctx.restore();

    if (hovered) positionTip();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) * (reduce ? 0.35 : 1);
    last = now;
    t += dt;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  /* ---------- tooltip + interaction ---------- */
  function setHover(f) {
    if (f === hovered) return;
    const prev = hovered;
    hovered = f;
    if (prev) prev.next = 0;
    canvas.style.cursor = f ? "pointer" : "default";
    if (!f) { tip.hidden = true; armed = null; return; }
    f.next = 0; // re-render now, collapsed
    hoverStart = t;
    tip.innerHTML = "";
    const idx = projects.indexOf(f.p);
    const state = document.createElement("small");
    const fxIdx = BG.EFFECTS.indexOf(f.effect) + 1;
    state.textContent = fxChoice === "mixed"
      ? `|${idx.toString(2).padStart(4, "0")}⟩ · effect ${String(fxIdx).padStart(2, "0")}: ${f.effect}`
      : `|${idx.toString(2).padStart(4, "0")}⟩ measured`;
    const title = document.createElement("strong");
    title.textContent = f.p.title;
    const blurb = document.createElement("span");
    blurb.textContent = f.p.blurb || "";
    const hint = document.createElement("em");
    const site = isExternal(f.p) ? new URL(f.p.page).hostname.replace(/^www\./, "") : "";
    hint.textContent = lastPointer === "touch"
      ? (site ? `Tap again to visit ${site} ↗` : "Tap again to open →")
      : (site ? `Visit ${site} ↗` : "View project →");
    tip.append(state, title, blurb, hint);
    tip.style.setProperty("--accent", f.spec.tint);
    tip.hidden = false;
    let best = null, bd = Infinity;
    for (const b of bees) {
      const d = Math.hypot(b.x - f.x, b.y - f.y);
      if (d < bd) { bd = d; best = b; }
    }
    if (best) { best.flower = f; best.timer = 4; }
    positionTip();
  }

  function positionTip() {
    const h = headWorld(hovered), R = hovered.spec.R * 1.15;
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = h.x - tw / 2;
    left = Math.max(12, Math.min(innerWidth - tw - 12, left));
    let y = h.y - R - th - 14;
    const below = y < 8;
    tip.classList.toggle("below", below);
    if (below) y = h.y + R + 14;
    tip.style.transform = `translate(${Math.round(left)}px, ${Math.round(y)}px)`;
    tip.style.setProperty("--arrow", `${Math.round(h.x - left)}px`);
  }

  const toLocal = (e) => {
    const rect = canvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  canvas.addEventListener("pointerdown", (e) => { lastPointer = e.pointerType; });
  canvas.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    lastPointer = e.pointerType;
    [mouseX, mouseY] = toLocal(e);
    setHover(flowerAt(mouseX, mouseY));
  });
  canvas.addEventListener("pointerleave", (e) => { if (e.pointerType !== "touch") setHover(null); });
  canvas.addEventListener("click", (e) => {
    const [mx, my] = toLocal(e);
    const f = flowerAt(mx, my);
    if (!f) {
      setHover(null);
      for (let i = 0; i < 16; i++) {
        const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 90;
        bits.push({ x: mx, y: my, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 0.9 + Math.random() * 0.7,
          ch: Math.random() < 0.5 ? "1" : "0", c: tintList[i % tintList.length] });
      }
      return;
    }
    if (lastPointer === "touch" && armed !== f) {
      hovered = null;
      setHover(f);
      armed = f;
      return;
    }
    openProject(f.p);
  });

  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { setHover(null); resize(); }, 120); });

  // start once the mono font is ready so the glyphs render in it
  if (BG.scrambleOnHover) BG.scrambleOnHover();
  // ?debug exposes flower positions for layout checks
  if (/[?&]debug\b/.test(location.search)) window.gardenDebug = () => flowers.map((f) => ({ title: f.p.title, x: Math.round(f.x + f.spec.hx), y: Math.round(f.y - f.spec.L), R: Math.round(f.spec.R) }));
  const start = () => { resize(); requestAnimationFrame(frame); };
  if (document.fonts && document.fonts.load) {
    Promise.race([document.fonts.load(`500 12px "IBM Plex Mono"`), new Promise((r) => setTimeout(r, 1200))]).then(start, start);
  } else start();
})();
