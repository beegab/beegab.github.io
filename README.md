# Brianna Gabaldon · beegab — Portfolio

My digital art portfolio: a garden grown from ones and zeros. Flowers, butterflies and bees are
drawn in binary over a soft-focus, film-grain background, and **every flower links
to one of my digital art ideas**.

Some glyphs are qubits: a 1 and a 0 overlaid in superposition, shimmering. Hover
a flower to *measure* it and its qubits collapse into definite bits.

No build tools, no frameworks: just HTML, CSS and JavaScript, so it runs on
GitHub Pages as is.

## Add or change a project

Open **`js/projects.js`** and edit the `PROJECTS` list. Each entry grows a flower:

```js
{
  id: "moth-lanterns",          // used in the URL, no spaces
  title: "Moth Lanterns",
  blurb: "Glowing paper moths that drift toward your cursor.",
  description: "Longer text.\n\nBlank line = new paragraph.",
  tags: ["interactive", "night"],
  status: "idea",               // idea · sketching · in progress · done
  flower: "tulip",              // daisy · tulip · lily · rose · star · sunflower
  color: "lilac",               // glyph tint: pink · lilac · butter · peach · sky · coral · mint · snow
  images: [{ src: "images/moth-1.png", alt: "Moth sketch", caption: "first sketch" }],
  link: "https://…",            // optional: an outside link shown on the project page
  linkLabel: "Get it on the App Store →", // optional: that button's text
  links: [{ label: "Read the thesis (PDF)", href: "files/thesis.pdf" }], // optional extra buttons
  page: "https://…",            // optional: make the flower go straight here instead
}
```

Change your name, alias, role line, tagline, About text and About links in `SITE` at the top of the same file.
Put artwork in the `images/` folder and documents such as PDFs in `files/`.

## Preview on your computer

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish with GitHub Pages

1. Create a new repository on GitHub (for example `portfolio`, or
   `<your-username>.github.io` if you want it at the root of your GitHub URL).
2. Push these files to the `main` branch.
3. In the repository, go to **Settings → Pages**, set **Source** to
   *Deploy from a branch*, choose `main` and `/ (root)`, and save.
4. After a minute your garden is live at
   `https://<your-username>.github.io/portfolio/`.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The garden page |
| `project.html` | The page each flower opens (`project.html?id=…`) |
| `about.html` | About me (text comes from `SITE.about` in `js/projects.js`) |
| `js/projects.js` | **Your projects: edit this one** |
| `js/garden.js` | Draws and animates the garden |
| `js/binary.js` | Draws flowers and creatures in 1s and 0s, plus the glyph tints |
| `js/project.js` | Fills in a project page |
| `js/about.js` | Fills in the About page |
| `css/style.css` | Styles for both pages |
