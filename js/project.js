/* Renders a single project page from js/projects.js using ?id=... */
(() => {
  const BG = window.BG;
  const SITE = window.SITE || {};
  const list = window.PROJECTS || [];
  const id = new URLSearchParams(location.search).get("id");
  const i = list.findIndex((p) => p.id === id);
  const root = document.getElementById("project");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* Image carousel: opens over the page, arrows / keys / swipe to move. */
  function makeCarousel(images) {
    const dlg = el("dialog", "carousel");
    dlg.setAttribute("aria-label", "Image viewer");
    const stage = el("div", "carousel-stage");
    const img = document.createElement("img");
    stage.append(img);
    const prev = el("button", "carousel-nav prev", "←");
    const next = el("button", "carousel-nav next", "→");
    prev.setAttribute("aria-label", "Previous image");
    next.setAttribute("aria-label", "Next image");
    const close = el("button", "carousel-close", "×");
    close.setAttribute("aria-label", "Close");
    const bar = el("div", "carousel-bar");
    const count = el("span", "carousel-count");
    const cap = el("span", "carousel-cap");
    bar.append(count, cap);
    dlg.append(close, prev, stage, next, bar);
    document.body.append(dlg);

    let at = 0, opener = null;
    const many = images.length > 1;
    prev.hidden = next.hidden = !many;
    const show = (k) => {
      at = (k + images.length) % images.length;
      const im = images[at];
      img.src = im.src; img.alt = im.alt || "";
      count.textContent = many ? `${String(at + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}` : "";
      cap.textContent = im.caption || "";
      // warm the neighbours so moving feels instant
      [at + 1, at - 1].forEach((n) => { const pre = new Image(); pre.src = images[(n + images.length) % images.length].src; });
    };
    prev.addEventListener("click", () => show(at - 1));
    next.addEventListener("click", () => show(at + 1));
    close.addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => { if (e.target === dlg || e.target === stage) dlg.close(); });
    dlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show(at - 1); }
    });
    let sx = null;
    stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
      sx = null;
    });
    dlg.addEventListener("close", () => { document.body.classList.remove("no-scroll"); if (opener) opener.focus(); });
    return {
      open(k, from) {
        opener = from || null;
        show(k);
        document.body.classList.add("no-scroll");
        dlg.showModal();
        (many ? next : close).focus();
      },
    };
  }

  if (i < 0) {
    root.append(el("p", "label", "|∅⟩"), el("h1", "title", "Not yet observed"),
      el("p", "desc", "We couldn't find that project. Head back to the garden and choose another flower."));
    return;
  }

  const p = list[i];
  document.title = `${p.title} · ${SITE.name || "Portfolio"}`;

  // hero flower, rendered in ones and zeros
  const small = innerWidth < 600;
  const spec = BG.makeSpec(p, i, small ? 80 : 96, small ? 190 : 250);
  document.documentElement.style.setProperty("--accent", spec.tint);
  const cache = {};
  const fig = el("div", "hero");
  fig.setAttribute("aria-hidden", "true");
  const hero = document.createElement("canvas");
  fig.append(hero, el("span", "hero-cap", "hover to measure"));
  let measured = false, hoverAt = 0, t = 0, lastDraw = -1;
  fig.addEventListener("pointerenter", () => { measured = true; hoverAt = performance.now() / 1000; lastDraw = -1; });
  fig.addEventListener("pointerleave", () => { measured = false; lastDraw = -1; });
  const effect = BG.effectFor(SITE.hoverEffect || "mixed", i); // same effect as this flower in the garden
  let hmx = null, hmy = null;
  fig.addEventListener("pointermove", (e) => { const rc = hero.getBoundingClientRect(); hmx = e.clientX - rc.left; hmy = e.clientY - rc.top; });
  const opts = () => ({ fs: 10, cw: 10 * 0.64, ch: 10 * 0.92, collapsed: measured,
    hover: measured && !reduce ? { t: t - hoverAt, effect, mx: hmx, my: hmy } : null });
  const paint = () => {
    BG.renderFlower(spec, cache, t, opts());
    const g = hero.getContext("2d");
    hero.width = cache.canvas.width; hero.height = cache.canvas.height;
    hero.style.width = cache.w + "px"; hero.style.height = cache.h + "px";
    g.drawImage(cache.canvas, 0, 0);
  };
  const loop = (now) => {
    t = now / 1000;
    if (lastDraw < 0 || (!reduce && (measured || t - lastDraw > 0.1))) { paint(); lastDraw = t; }
    requestAnimationFrame(loop);
  };
  const go = () => requestAnimationFrame(loop);
  if (document.fonts && document.fonts.load)
    Promise.race([document.fonts.load('500 12px "IBM Plex Mono"'), new Promise((r) => setTimeout(r, 1200))]).then(go, go);
  else go();

  const head = el("div", "card-head");
  const titles = el("div", "titles");
  titles.append(el("p", "label", `|${i.toString(2).padStart(4, "0")}⟩ · No. ${String(i + 1).padStart(2, "0")}`), el("h1", "title", p.title));
  if (p.blurb) titles.append(el("p", "blurb", p.blurb));
  const meta = el("div", "meta");
  if (p.status) meta.append(el("span", "chip status", p.status));
  (p.tags || []).forEach((tg) => meta.append(el("span", "chip", tg)));
  titles.append(meta);
  head.append(fig, titles);
  root.append(head);

  const desc = Array.isArray(p.description) ? p.description : String(p.description || "").split(/\n\s*\n/);
  desc.filter(Boolean).forEach((para) => root.append(el("p", "desc", para)));

  const gallery = el("div", "gallery");
  if (p.images && p.images.length) {
    gallery.classList.toggle("single", p.images.length === 1);
    if (p.gallery) gallery.classList.add(p.gallery);
    const viewer = makeCarousel(p.images);
    p.images.forEach((im, k) => {
      const f = el("figure", "frame");
      const img = document.createElement("img");
      img.src = im.src; img.alt = im.alt || ""; img.loading = "lazy";
      // click an image to open the carousel at that image
      const zoom = document.createElement("a");
      zoom.href = im.src;
      zoom.setAttribute("aria-label", `View image ${k + 1} of ${p.images.length}${im.caption ? ": " + im.caption : ""}`);
      zoom.addEventListener("click", (e) => { e.preventDefault(); viewer.open(k, zoom); });
      zoom.append(img);
      f.append(zoom);
      if (im.caption) f.append(el("figcaption", null, im.caption));
      gallery.append(f);
    });
  } else {
    for (let k = 0; k < 3; k++) {
      const f = el("div", "frame empty");
      f.append(el("span", null, k === 1 ? "Sketches forthcoming" : ""));
      gallery.append(f);
    }
  }
  root.append(gallery);

  const buttons = [];
  if (p.link) buttons.push({ label: p.linkLabel || "View elsewhere →", href: p.link, main: true });
  (p.links || []).forEach((l, k) => buttons.push({ label: `${l.label} ↗`, href: l.href, main: !p.link && k === 0 }));
  if (buttons.length) {
    const row = el("div", "link-row");
    buttons.forEach((b) => {
      const a = el("a", b.main ? "btn link-btn" : "btn", b.label);
      a.href = b.href; a.target = "_blank"; a.rel = "noopener";
      row.append(a);
    });
    root.append(row);
  }

  const nav = document.getElementById("neighbors");
  if (list.length > 1) {
    const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
    const mk = (q, label) => {
      const a = el("a", "btn", label);
      a.href = q.page || `project.html?id=${encodeURIComponent(q.id)}`;
      if (/^https?:\/\//.test(q.page || "")) { a.target = "_blank"; a.rel = "noopener"; a.textContent += " ↗"; }
      return a;
    };
    nav.append(mk(prev, `← ${prev.title}`), mk(next, `${next.title} →`));
  }
  if (BG.scrambleOnHover) BG.scrambleOnHover();
})();
