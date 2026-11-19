/* Dark Patterns: a playable demo.
   Each level is a small made-up website with real dark patterns built in.
   When a level ends, the stage flips to an "X-ray" naming the tricks. */
(() => {
  /* ---------- tiny DOM helper ---------- */
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v === true) n.setAttribute(k, "");
      else n.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) {
      if (kid == null || kid === false) continue;
      n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return n;
  };
  const money = (n) => `$${n.toFixed(2)}`;

  /* ---------- the patterns, as named in the research ---------- */
  const PATTERNS = {
    "Visual interference": "The choice the company wants is big, bright and obvious. The one you want is small, grey or disguised as plain text.",
    "Preselection": "The option that benefits the company is already chosen for you. Doing nothing means agreeing.",
    "Confirmshaming": "The way out is worded to make you feel foolish or guilty for taking it.",
    "Fake urgency": "A countdown or deadline that isn't real, there to rush you before you can think.",
    "Fake scarcity": "\"Only 2 left\" and \"14 people are viewing this\" make an item seem rarer and more wanted than it is.",
    "Sneaking": "Something you never chose is slipped into your cart or agreement.",
    "Hidden costs": "Fees appear only at the last step, after you've already put in the time.",
    "Trick wording": "Double negatives and tangled phrasing get you to agree to the opposite of what you meant.",
    "Hard to cancel": "Signing up takes one click. Leaving takes a maze of screens, offers and warnings.",
    "Nagging": "The same request keeps interrupting you, hoping you'll give in to make it stop.",
  };

  /* ---------- game state ---------- */
  const stage = document.getElementById("stage");
  const goalEl = document.getElementById("goal");
  const hud = {
    level: document.getElementById("hudLevel"),
    time: document.getElementById("hudTime"),
    clicks: document.getElementById("hudClicks"),
    tricked: document.getElementById("hudTricked"),
  };
  const state = { idx: -1, clicks: 0, tricked: 0, elapsed: 0, levelStart: 0, levelClicks: 0, running: false, results: [], cleanup: null };

  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };
  const now = () => performance.now();
  const totalTime = () => state.elapsed + (state.running ? now() - state.levelStart : 0);
  setInterval(() => { hud.time.textContent = fmt(totalTime()); }, 250);

  stage.addEventListener("click", (e) => {
    if (!state.running) return;
    if (!(e.target.closest("button, input, select, label, a"))) return; // count real interactions only
    state.clicks++;
    state.levelClicks++;
    hud.clicks.textContent = state.clicks;
  }, true);

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let flipTimer = 0;
  const flipTo = (build) => {
    clearTimeout(flipTimer);
    const swap = () => {
      stage.innerHTML = "";
      stage.append(build());
      stage.scrollTop = 0;
    };
    if (reduceMotion) { swap(); return; }
    stage.classList.remove("flip-in");
    stage.classList.add("flip-out");
    setTimeout(() => {
      swap();
      stage.classList.remove("flip-out");
      stage.classList.add("flip-in");
      // always end face-up, even if the animation never gets to run
      flipTimer = setTimeout(() => stage.classList.remove("flip-in"), 400);
    }, 320);
  };

  /* ---------- level 1: cookie banner ---------- */
  const cookies = {
    title: "The cookie banner",
    goal: "Read the article without sharing your data with anyone.",
    patterns: ["Visual interference", "Preselection"],
    render(ui, done) {
      ui.append(
        h("div", { class: "ui-nav" }, h("span", { class: "ui-logo" }, "Daily Brew"),
          h("div", { class: "ui-links" }, h("span", {}, "News"), h("span", {}, "Recipes"), h("span", {}, "Gear"))),
        h("div", { class: "ui-body" },
          h("p", { class: "ui-h1" }, "Why your morning coffee tastes better outside"),
          h("div", { class: "ui-img" }), h("div", { class: "ui-bar" }), h("div", { class: "ui-bar", style: "width:92%" }),
          h("div", { class: "ui-bar", style: "width:84%" }), h("div", { class: "ui-bar", style: "width:96%" })),
      );
      const banner = h("div", { class: "cb", role: "dialog", "aria-label": "Cookie consent" },
        h("p", { class: "cb-title" }, "We value your privacy"),
        h("p", { class: "cb-text" }, "We and our 847 partners store and access information on your device to personalise ads and content, measure performance, and develop and improve our services. By clicking \"Accept all\" you consent to all of the above."),
        h("div", { class: "cb-actions" },
          h("button", { class: "ui-btn-primary", onclick: () => done({ escaped: false, detail: "You clicked \"Accept all\". It was the only button that looked like a button.", almost: ["Sharing your browsing with 847 advertising partners"] }) }, "Accept all"),
          h("button", { class: "ui-link-faint", onclick: () => manage() }, "Manage options")));
      ui.append(banner);

      const manage = () => {
        const cats = [
          ["Strictly necessary", "Required for the site to work.", true, true],
          ["Performance", "Measure how you use the site.", true],
          ["Personalisation", "Tailor content to your interests.", true],
          ["Advertising", "Show you relevant ads across the web.", true],
          ["Our 847 partners", "Share data with trusted vendors under legitimate interest.", true],
        ];
        const switches = [];
        const list = cats.map(([name, desc, on, locked]) => {
          const sw = h("input", { type: "checkbox", class: "ui-switch", "aria-label": name, checked: on, disabled: locked });
          if (!locked) switches.push([name, sw]);
          return h("div", { class: "ui-toggle" }, h("div", {}, h("b", {}, name), h("small", {}, desc)), sw);
        });
        const finish = () => {
          const still = switches.filter(([, sw]) => sw.checked).map(([n]) => n);
          if (!still.length) done({ escaped: true, detail: "You switched off every toggle that was turned on for you, one by one." });
          else done({ escaped: false, detail: "Some switches were already on, and you saved without turning them all off.", almost: still.map((n) => `${n} tracking`) });
        };
        const modal = h("div", { class: "ui-modal-bg" },
          h("div", { class: "ui-modal", role: "dialog", "aria-label": "Privacy preferences" },
            h("div", { class: "ui-modal-body" },
              h("p", { class: "cb-title" }, "Privacy preferences"),
              h("p", { class: "cb-text", style: "margin:6px 0 10px" }, "Choose how we use your data. You can change this at any time in Settings."),
              list,
              h("p", { class: "ui-fine", style: "margin-top:14px" }, "Some partners process data on the basis of legitimate interest, which you can object to in each partner's settings. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal. Data may be transferred to countries outside your region."),
              h("button", { class: "ui-link-faint", style: "margin-top:8px", onclick: () => done({ escaped: true, detail: "You found \"Reject all\", hidden in grey at the bottom of the fine print." }) }, "Reject all")),
            h("div", { class: "ui-modal-foot" },
              h("button", { class: "ui-btn-secondary", onclick: finish }, "Confirm my choices"),
              h("button", { class: "ui-btn-primary", onclick: () => done({ escaped: false, detail: "\"Accept all\" followed you into the settings, still the brightest thing on the screen.", almost: ["Sharing your browsing with 847 advertising partners"] }) }, "Accept all"))));
        banner.remove();
        ui.append(modal);
      };
    },
  };

  /* ---------- level 2: the pop-up offer ---------- */
  const popup = {
    title: "The pop-up offer",
    goal: "Close the pop-up without signing up for anything.",
    patterns: ["Confirmshaming", "Fake urgency", "Nagging"],
    render(ui, done) {
      ui.append(
        h("div", { class: "ui-nav" }, h("span", { class: "ui-logo" }, "Clay & Co."),
          h("div", { class: "ui-links" }, h("span", {}, "Mugs"), h("span", {}, "Plates"), h("span", {}, "Sale"))),
        h("div", { class: "ui-body" }, h("p", { class: "ui-h1" }, "Handmade ceramics"), h("div", { class: "ui-img" }),
          h("div", { class: "ui-bar" }), h("div", { class: "ui-bar", style: "width:80%" })));
      let secs = 30;
      const timer = h("span", { class: "po-timer" }, "Offer ends in 00:30");
      const ext = h("span", { class: "po-ext" });
      const close = h("button", { class: "po-close", "aria-label": "Close", onclick: () => done({ escaped: true, detail: "You found the close button. It faded in, tiny and grey, a few seconds after the pop-up appeared." }) }, "✕");
      const body = h("div", { class: "po" },
        h("p", { class: "po-kicker" }, "WAIT! DON'T GO YET"),
        h("p", { class: "po-title" }, "Get 20% off your first order"),
        timer, ext,
        h("div", {}, h("button", { class: "ui-btn-primary", style: "width:100%", onclick: () => askEmail() }, "YES! Give me 20% off")),
        h("p", { style: "margin:14px 0 0" }, h("button", { class: "ui-link-faint", style: "font-size:13px", onclick: () => done({ escaped: true, detail: "You got out, but only by clicking a button that made you say you'd rather pay full price." }) }, "No thanks, I'd rather pay full price")));
      const modal = h("div", { class: "ui-modal-bg" }, h("div", { class: "ui-modal" }, close, body));
      ui.append(modal);
      const tick = setInterval(() => {
        secs--;
        if (secs <= 0) { secs = 30; ext.textContent = "Extended just for you!"; }
        timer.textContent = `Offer ends in 00:${String(secs).padStart(2, "0")}`;
      }, 1000);
      const reveal = setTimeout(() => close.classList.add("show"), 4000);
      const askEmail = () => {
        body.innerHTML = "";
        body.append(
          h("p", { class: "po-kicker" }, "ALMOST THERE"),
          h("p", { class: "po-title", style: "font-size:24px" }, "Enter your email to unlock 20% off"),
          h("input", { class: "ui-input", type: "email", placeholder: "you@example.com", "aria-label": "Email" }),
          h("button", { class: "ui-btn-primary", style: "width:100%", onclick: () => done({ escaped: false, detail: "You traded your email for a discount on something you came to browse.", almost: ["Daily marketing emails from Clay & Co.", "Your email shared with \"selected partners\""] }) }, "Unlock my discount"),
          h("p", { style: "margin:14px 0 0" }, h("button", { class: "ui-link-faint", style: "font-size:13px", onclick: () => done({ escaped: true, detail: "You backed out at the last step, after saying yes once already." }) }, "No thanks, I don't like saving money")));
      };
      return () => { clearInterval(tick); clearTimeout(reveal); };
    },
  };

  /* ---------- level 3: checkout ---------- */
  const checkout = {
    title: "The checkout",
    goal: "Buy one mug and pay only its $12.00 sticker price.",
    patterns: ["Sneaking", "Preselection", "Hidden costs", "Fake scarcity"],
    render(ui, done) {
      const s = { protect: true, donate: true, ship: "express" };
      const SHIP = { express: ["Express (1–2 days)", 6.99], standard: ["Standard (5–7 days)", 4.99], pickup: ["Store pickup", 0] };
      const fee = () => (s.ship === "pickup" ? 0 : 2.49);
      const viewers = h("span", {}, "14");
      const scarce = setInterval(() => { viewers.textContent = String(9 + Math.floor(Math.random() * 11)); }, 2000);
      const nav = h("div", { class: "ui-nav" }, h("span", { class: "ui-logo" }, "Clay & Co."), h("div", { class: "ui-links" }, h("span", {}, "Cart (1)")));
      const body = h("div", { class: "ui-body" });
      ui.append(nav, body);

      const cart = () => {
        body.innerHTML = "";
        const protect = h("input", { type: "checkbox", checked: s.protect, onchange: (e) => { s.protect = e.target.checked; paintTotal(); } });
        const donate = h("input", { type: "checkbox", checked: s.donate, onchange: (e) => { s.donate = e.target.checked; paintTotal(); } });
        const ship = h("select", { class: "co-select", "aria-label": "Shipping", onchange: (e) => { s.ship = e.target.value; paintTotal(); } },
          Object.entries(SHIP).map(([k, [name, p]]) => h("option", { value: k, selected: s.ship === k }, `${name} · ${p ? money(p) : "Free"}`)));
        const total = h("span");
        const paintTotal = () => { total.textContent = money(12 + (s.protect ? 4.99 : 0) + (s.donate ? 1 : 0) + SHIP[s.ship][1]); };
        paintTotal();
        body.append(
          h("p", { class: "ui-h1" }, "Your cart"),
          h("div", { class: "co-grid" },
            h("div", { class: "co-card" },
              h("div", { class: "co-row" }, h("b", {}, "Speckled ceramic mug"), h("b", {}, "$12.00")),
              h("p", { style: "margin:4px 0 0" }, h("span", { class: "co-badge" }, "🔥 Only 2 left!"), " ", h("span", { class: "ui-fine" }, viewers, " people are viewing this right now")),
              h("div", { class: "co-row" }, h("label", {}, protect, "Mug Protection Plan · 2 years"), h("span", { class: "ui-fine" }, "$4.99")),
              h("div", { class: "co-row" }, h("label", {}, donate, "Add a $1.00 donation to our community fund"), h("span", { class: "ui-fine" }, "$1.00"))),
            h("div", { class: "co-card" }, h("div", { class: "co-row" }, h("span", {}, "Delivery"), ship),
              h("div", { class: "co-row co-total" }, h("span", {}, "Total"), total)),
            h("button", { class: "ui-btn-primary", onclick: review }, "Continue to payment")));
      };

      const review = () => {
        body.innerHTML = "";
        const lines = [["Speckled ceramic mug", 12]];
        if (s.protect) lines.push(["Mug Protection Plan", 4.99]);
        if (s.donate) lines.push(["Donation", 1]);
        lines.push([SHIP[s.ship][0], SHIP[s.ship][1]]);
        if (fee()) lines.push(["Service fee", fee()]);
        const total = lines.reduce((a, [, p]) => a + p, 0);
        body.append(
          h("p", { class: "ui-h1" }, "Review & pay"),
          h("div", { class: "co-card" },
            lines.map(([n, p]) => h("div", { class: "co-row" }, h("span", {}, n), h("span", {}, p ? money(p) : "Free"))),
            h("div", { class: "co-row co-total" }, h("span", {}, "Total"), h("span", {}, money(total))),
            h("p", { class: "ui-fine", style: "margin:10px 0 0" }, "A service fee applies to all delivery orders. ",
              h("button", { class: "ui-link", style: "font-size:11px", onclick: cart }, "Edit cart"), " to change your delivery method.")),
          h("button", { class: "ui-btn-primary", style: "margin-top:16px", onclick: () => {
            const extras = lines.filter(([, p], i) => i > 0 && p > 0).map(([n, p]) => `${n} · ${money(p)}`);
            if (Math.abs(total - 12) < 0.001) done({ escaped: true, detail: "You unticked two boxes that were ticked for you, and switched to the one delivery option without a surprise fee." });
            else done({ escaped: false, detail: `You paid ${money(total)} for a $12.00 mug.`, almost: extras });
          } }, `Place order · ${money(total)}`));
      };
      cart();
      return () => clearInterval(scarce);
    },
  };

  /* ---------- level 4: email settings ---------- */
  const settings = {
    title: "The settings page",
    goal: "Turn off marketing emails, data sharing and the weekly digest.",
    patterns: ["Trick wording", "Preselection"],
    render(ui, done) {
      const a = h("input", { type: "checkbox", checked: true, id: "s-a" });
      const b = h("input", { type: "checkbox", checked: true, id: "s-b" });
      const c = h("input", { type: "checkbox", checked: true, id: "s-c" });
      ui.append(
        h("div", { class: "ui-nav" }, h("span", { class: "ui-logo" }, "Daily Brew"), h("div", { class: "ui-links" }, h("span", {}, "Account"))),
        h("div", { class: "ui-body" },
          h("p", { class: "ui-h1" }, "Communication preferences"),
          h("p", { class: "cb-text" }, "We only want to send you things you love."),
          h("div", { class: "co-card", style: "margin-top:16px" },
            h("label", { class: "st-item", for: "s-a" }, a, "Uncheck this box if you would prefer not to receive marketing emails."),
            h("label", { class: "st-item", for: "s-b" }, b, "Check this box if you do not want us to not share your information with our trusted partners."),
            h("label", { class: "st-item", for: "s-c", style: "border:0" }, c, "Uncheck this box if you don't want to miss out on our weekly digest.")),
          h("button", { class: "ui-btn-primary", style: "margin-top:18px", onclick: () => {
            // what each box actually means
            const emails = a.checked;          // checked = keep receiving emails
            const sharing = b.checked;         // "don't want us to not share" = do share
            const digest = !c.checked;         // unchecking = "don't want to miss out" = subscribe
            const almost = [];
            if (emails) almost.push("Marketing emails");
            if (sharing) almost.push("Sharing your information with partners");
            if (digest) almost.push("The weekly digest");
            if (!almost.length) done({ escaped: true, detail: "You decoded all three. The trick: the third box had to stay checked to keep the digest off." });
            else done({ escaped: false, detail: `You got ${3 - almost.length} of 3 right. Double negatives turned \"no\" into \"yes\".`, almost });
          } }, "Save preferences")));
    },
  };

  /* ---------- level 5: cancel a subscription ---------- */
  const cancel = {
    title: "The cancellation",
    goal: "Cancel your WatchHaus Premium subscription ($17.99 a month).",
    patterns: ["Hard to cancel", "Nagging", "Confirmshaming", "Visual interference"],
    render(ui, done) {
      let screens = 1;
      const nav = h("div", { class: "ui-nav" }, h("span", { class: "ui-logo" }, "WatchHaus"),
        h("div", { class: "ui-links" }, h("span", {}, "Home"), h("span", {}, "Browse"),
          h("button", { onclick: () => account() }, "Account")));
      const body = h("div", { class: "ui-body" });
      ui.append(nav, body);
      const go = (fn) => () => { screens++; fn(); ui.scrollTop = 0; };
      const stay = (detail, almost) => done({ escaped: false, detail: `${detail} You went ${screens} screens deep. Signing up took one.`, almost });

      const home = () => {
        body.innerHTML = "";
        body.append(
          h("div", { class: "cx-upsell" }, h("div", {}, h("b", {}, "Go Ultra"), h("div", { style: "font-size:13px;opacity:.85" }, "4K, 6 screens, and more.")), h("button", {}, "Upgrade")),
          h("p", { class: "ui-h1", style: "margin-top:22px" }, "Continue watching"),
          h("div", { class: "ui-img", style: "height:120px" }), h("div", { class: "ui-bar" }), h("div", { class: "ui-bar", style: "width:70%" }));
      };
      const account = go(() => {
        body.innerHTML = "";
        body.append(
          h("p", { class: "ui-h1" }, "Account"),
          h("div", { class: "co-card" },
            h("div", { class: "co-row" }, h("span", {}, "Email"), h("span", { class: "ui-fine" }, "you@example.com")),
            h("div", { class: "co-row" }, h("span", {}, "Plan"), h("b", {}, "Premium · $17.99/mo"))),
          h("div", { style: "display:flex;gap:12px;align-items:center;margin-top:16px;flex-wrap:wrap" },
            h("button", { class: "ui-btn-primary" }, "Change plan"),
            h("button", { class: "ui-link-faint", onclick: manage }, "Manage membership")));
      });
      const manage = go(() => {
        body.innerHTML = "";
        body.append(
          h("p", { class: "ui-h1" }, "Manage membership"),
          h("button", { class: "cx-option rec", onclick: () => stay("You paused instead of cancelling. Pauses end automatically, and billing starts again.", ["$17.99/month again in 3 months"]) },
            h("b", {}, "Pause membership (recommended)"), h("small", {}, "Take a break for up to 3 months. Keep everything.")),
          h("button", { class: "cx-option", onclick: () => stay("You switched plans instead of leaving.", ["A cheaper plan, still billed every month"]) },
            h("b", {}, "Switch to Basic with ads"), h("small", {}, "$7.99/mo")),
          h("p", { style: "margin-top:18px" }, h("button", { class: "ui-link-faint", style: "font-size:13px", onclick: offer }, "Continue to cancel")));
      });
      const offer = go(() => {
        body.innerHTML = "";
        body.append(
          h("div", { style: "text-align:center;padding-top:10px" },
            h("p", { class: "po-kicker" }, "BEFORE YOU GO"),
            h("p", { class: "ui-h1" }, "Stay for 50% off"),
            h("p", { class: "cb-text" }, "Get 3 months of Premium for just $8.99/month."),
            h("button", { class: "ui-btn-primary", style: "margin:18px 0 10px", onclick: () => stay("You took the retention offer.", ["3 months at $8.99, then back to $17.99/month"]) }, "Claim my 50% off"),
            h("div", {}, h("button", { class: "ui-link-faint", onclick: survey }, "No, continue to cancel"))));
      });
      const survey = go(() => {
        body.innerHTML = "";
        const cont = h("button", { class: "ui-btn-primary", disabled: true, style: "margin-top:16px", onclick: final }, "Continue");
        const reasons = ["It's too expensive", "I don't watch enough", "I'm switching to another service", "Other"];
        body.append(
          h("p", { class: "ui-h1" }, "Why are you leaving?"),
          h("p", { class: "cb-text" }, "Your answer is required to continue."),
          h("div", { class: "co-card", style: "margin-top:12px" },
            reasons.map((r) => h("label", { class: "cx-radio" }, h("input", { type: "radio", name: "why", onchange: () => { cont.disabled = false; } }), r))),
          cont);
      });
      const final = go(() => {
        body.innerHTML = "";
        body.append(
          h("p", { class: "ui-h1" }, "Are you sure?"),
          h("p", { class: "cb-text" }, "If you cancel, you'll lose:"),
          h("ul", { class: "cx-loss" }, h("li", {}, "Your watch history and recommendations"), h("li", {}, "All 4 profiles"), h("li", {}, "Every download on your devices")),
          h("div", { style: "display:flex;gap:12px;align-items:center;flex-wrap:wrap" },
            h("button", { class: "ui-btn-primary", onclick: () => stay("At the last step, you kept your membership.", ["$17.99/month, indefinitely"]) }, "Keep my membership"),
            h("button", { class: "ui-btn-secondary", onclick: () => done({ escaped: true, detail: `You cancelled. It took ${screens} screens, a retention offer, a required survey and a guilt trip. Signing up took one click.` }) }, "Finish cancellation")));
      });
      home();
    },
  };

  const LEVELS = [cookies, popup, checkout, settings, cancel];

  /* ---------- flow ---------- */
  const intro = () => {
    goalEl.textContent = "";
    hud.level.textContent = `0/${LEVELS.length}`;
    stage.innerHTML = "";
    stage.append(h("div", { class: "dp-card" },
      h("p", { class: "label" }, "Dark Patterns · a playable demo"),
      h("h1", {}, "Try to escape"),
      h("p", {}, "Five everyday tasks: a cookie banner, a pop-up, a checkout, a settings page and a cancellation. Each one is a made-up website with real dark patterns built in."),
      h("p", {}, "Do exactly what the goal says. We'll count your time, your clicks, and how many times you were tricked. After each level, the screen flips to show you the trick."),
      h("button", { class: "btn", onclick: () => startLevel(0) }, "Start →")));
  };

  const startLevel = (i) => {
    state.idx = i;
    const lv = LEVELS[i];
    hud.level.textContent = `${i + 1}/${LEVELS.length}`;
    goalEl.textContent = lv.goal;
    flipTo(() => {
      const ui = h("div", { class: "ui" });
      let ended = false;
      const done = (res) => {
        if (ended) return;
        ended = true;
        endLevel(res);
      };
      state.cleanup = lv.render(ui, done) || null;
      state.levelStart = now();
      state.levelClicks = 0;
      state.running = true;
      return ui;
    });
  };

  const endLevel = (res) => {
    const lv = LEVELS[state.idx];
    const ms = now() - state.levelStart;
    state.elapsed += ms;
    state.running = false;
    if (state.cleanup) { state.cleanup(); state.cleanup = null; }
    if (!res.escaped) { state.tricked++; hud.tricked.textContent = state.tricked; }
    state.results.push({ title: lv.title, escaped: res.escaped, almost: res.almost || [], ms, clicks: state.levelClicks, patterns: lv.patterns });
    goalEl.textContent = "";
    const last = state.idx === LEVELS.length - 1;
    flipTo(() => h("div", { class: "dp-card" },
      h("p", { class: "label" }, `Level ${state.idx + 1} of ${LEVELS.length} · X-ray`),
      h("h2", {}, lv.title),
      h("span", { class: `dp-verdict ${res.escaped ? "escaped" : "tricked"}` }, res.escaped ? "Escaped" : "Tricked"),
      h("p", {}, res.detail),
      res.almost && res.almost.length ? [h("p", { style: "margin-bottom:4px" }, "You agreed to:"), h("ul", { class: "dp-almost" }, res.almost.map((a) => h("li", {}, a)))] : null,
      h("div", { class: "dp-patterns" }, lv.patterns.map((p) => h("div", { class: "dp-pattern" }, h("h3", {}, p), h("p", {}, PATTERNS[p])))),
      h("p", { class: "dp-stats" }, `${fmt(ms)} · ${state.levelClicks} clicks`),
      h("button", { class: "btn", onclick: () => (last ? receipt() : startLevel(state.idx + 1)) }, last ? "See your receipt →" : "Next level →")));
  };

  const receipt = () => {
    const seen = new Set(state.results.flatMap((r) => r.patterns));
    const agreed = state.results.flatMap((r) => r.almost);
    flipTo(() => h("div", { class: "dp-card" },
      h("div", { class: "dp-receipt" },
        h("h2", {}, "YOUR RECEIPT"),
        h("p", { class: "sub" }, "dark patterns · demo"),
        h("hr"),
        state.results.map((r) => h("div", { class: `row ${r.escaped ? "" : "tricked"}` }, h("span", {}, r.title), h("span", {}, r.escaped ? "escaped" : "tricked"))),
        h("hr"),
        h("div", { class: "row" }, h("span", {}, "Time spent"), h("span", {}, fmt(state.elapsed))),
        h("div", { class: "row" }, h("span", {}, "Clicks"), h("span", {}, String(state.clicks))),
        h("div", { class: "row" }, h("span", {}, "Times tricked"), h("span", {}, `${state.tricked} of ${LEVELS.length}`)),
        h("div", { class: "row" }, h("span", {}, "Patterns you met"), h("span", {}, String(seen.size))),
        agreed.length ? [h("hr"), h("p", { class: "note" }, "You agreed to:"), agreed.map((a) => h("p", { class: "note" }, `· ${a}`))] : null,
        h("hr"),
        h("p", { class: "thanks" }, "NOW THAT YOU CAN NAME THEM,"),
        h("p", { class: "thanks", style: "margin-top:2px" }, "YOU'LL SEE THEM EVERYWHERE.")),
      h("div", { class: "dp-end-actions" },
        h("button", { class: "btn", onclick: () => location.reload() }, "Play again"),
        h("a", { class: "btn", href: "project.html?id=dark-patterns" }, "Back to the project"))));
  };

  intro();
})();
