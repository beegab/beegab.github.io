/* About page, filled from SITE in js/projects.js */
(() => {
  const BG = window.BG;
  const SITE = window.SITE || {};
  const root = document.getElementById("about");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  if (SITE.name) document.title = `About · ${SITE.name}`;

  // a single lily in ones and zeros
  const small = innerWidth < 600;
  const spec = BG.makeSpec({ id: "about-beegab", flower: "lily", color: "snow" }, 0, small ? 80 : 96, small ? 190 : 250);
  const cache = {};
  const fig = el("div", "hero");
  fig.setAttribute("aria-hidden", "true");
  const hero = document.createElement("canvas");
  fig.append(hero, el("span", "hero-cap", "hover to measure"));
  let measured = false, lastDraw = -1;
  fig.addEventListener("pointerenter", () => { measured = true; lastDraw = -1; });
  fig.addEventListener("pointerleave", () => { measured = false; lastDraw = -1; });
  const paint = (t) => {
    BG.renderFlower(spec, cache, t, { fs: 10, cw: 6.4, ch: 9.2, collapsed: measured });
    hero.width = cache.canvas.width; hero.height = cache.canvas.height;
    hero.style.width = cache.w + "px"; hero.style.height = cache.h + "px";
    hero.getContext("2d").drawImage(cache.canvas, 0, 0);
  };
  const loop = (now) => {
    const t = now / 1000;
    if (lastDraw < 0 || (!reduce && t - lastDraw > 0.1)) { paint(t); lastDraw = t; }
    requestAnimationFrame(loop);
  };
  const go = () => requestAnimationFrame(loop);
  if (document.fonts && document.fonts.load)
    Promise.race([document.fonts.load('500 12px "IBM Plex Mono"'), new Promise((r) => setTimeout(r, 1200))]).then(go, go);
  else go();

  const head = el("div", "card-head");
  const titles = el("div", "titles");
  titles.append(el("p", "label", "|0⟩ · About"), el("h1", "title", SITE.name || "About"));
  if (SITE.alias) titles.append(el("p", "blurb", `a.k.a. ${SITE.alias}`));
  head.append(fig, titles);
  root.append(head);

  const about = Array.isArray(SITE.about) ? SITE.about : String(SITE.about || "").split(/\n\s*\n/);
  about.filter(Boolean).forEach((para) => root.append(el("p", "desc", para)));

  if (SITE.links && SITE.links.length) {
    const nav = el("div", "about-links");
    SITE.links.forEach((l) => {
      const a = el("a", "btn", `${l.label} →`);
      a.href = l.href;
      if (/^https?:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; }
      nav.append(a);
    });
    root.append(nav);
  }

  const back = el("a", "btn about-work", "See the work →");
  back.href = "index.html";
  root.append(back);
})();
