/* ============================================================
   EDIT THIS FILE TO GROW YOUR GARDEN
   ------------------------------------------------------------
   Every entry in PROJECTS becomes a flower in the garden.

   id          – short unique name, used in the page URL (no spaces)
   title       – shown in the tooltip and on the project page
   blurb       – one short line for the hover tooltip
   description – longer text for the project page
                 (separate paragraphs with a blank line)
   tags        – little labels shown on the project page
   status      – e.g. "idea", "sketching", "in progress", "done"
   flower      – daisy | tulip | lily | rose | star | sunflower
   color       – glyph tint: pink | lilac | butter | peach | sky | coral | mint | snow
   images      – optional list of { src, alt, caption } (put files in /images)
   gallery     – optional: "phones" lays tall phone screenshots four across
   link        – optional external link (App Store, Instagram, itch.io, etc.)
   linkLabel   – optional text for that link's button
   links       – optional list of extra buttons: { label, href }
                 (e.g. PDFs in /files); they open in a new tab
   page        – optional: send the flower somewhere else entirely
                 instead of the built-in project page (outside
                 websites open in a new tab)
   ============================================================ */

window.SITE = {
  name: "Brianna Gabaldon",
  alias: "beegab",
  role: "Portfolio",
  tagline: "Ideas and works in progress. Click on a flower to explore a project.",

  // Flower hover effects. A list rotates through those effects flower by flower.
  // Available: ripple, bloom, decode, rain, scatter, wind, glitch, pulse, spin,
  // repel, sparkle, melt, and signal (decode + glitch + sparkle combined).
  // Use one name (e.g. "glitch") for every flower, or "mixed" to cycle through
  // all of them with the effect named in each tooltip.
  hoverEffect: ["decode", "glitch", "sparkle", "signal"],

  // About page (about.html). One string per paragraph.
  about: [
    "I've always loved the place where technology meets people: technology not as the point, but as a tool for how we live, connect and look after one another.",
    "That thread runs through everything I do. It started with a B.S. in computer science at Virginia Tech, carried into an M.S. in Global Security, Conflict and Cybercrime at NYU, and keeps pulling me toward new intersections. Public interest technology and cybersecurity are my specialties. My NYU thesis, which earned distinction, looked at how cybersecurity frameworks built for big companies leave small New York businesses behind.",
    "Beyond that, I'm simply a lover of technology: experimenting with it, building with it and learning from it.",
    "You'll also find me at the McCarren Demonstration Garden, Free Food Harlem and the East Williamsburg Cinema Club, or writing on Substack.",
  ],
  // Links shown on the About page: { label, href }
  links: [
    { label: "Substack", href: "https://substack.com/@beegabaldon" },
    { label: "Stamped on the App Store", href: "https://apps.apple.com/us/app/stamped-a-passport-for-life/id6779494313" },
    { label: "Q+U", href: "https://qplusu.com" },
  ],
};

window.PROJECTS = [
  {
    id: "stamped",
    title: "Stamped: A Passport for Life",
    blurb: "A digital passport for shows, films, books, meals and everything you do.",
    description: [
      "Living in New York, I found myself up to so much: shows, films, dinners, readings, classes, long walks across the city. I wanted a way to log all of it, to remember what I'd done and keep track of what I wanted to do next, and nothing held all of it in one place.",
      "So I built Stamped, a multi-dimensional app for our multi-dimensional lives. Every experience becomes a stamp in a personal passport: shows, films, books, albums, games, meals, or anything else, like a hike or a class. Each stamp holds the date, the place and who you were with.",
      "Plans live next to memories. Stamped, Up Next and Interested sit side by side, so the concert you're going to, the book you want to read and the class you'd like to take are all in one place.",
      "It's social without being loud. You can tag friends whether or not they use the app, follow people who share your interests, plan things together, and choose exactly what each follower can see.",
      "Also inside: a wall of all your stamps, Top Picks, a Collection for owned vinyl and Blu-rays, and a calendar view of your year.",
    ],
    tags: ["iOS app", "design", "development", "lifestyle"],
    status: "live on the App Store",
    flower: "rose",
    color: "peach",
    gallery: "phones", // tall phone screenshots sit four across
    images: [
      { src: "images/stamped-01-stamp.jpg", alt: "Stamped screen for a single stamp: a Phoebe Bridgers concert at the Hollywood Bowl, with who you went with and photos.", caption: "A stamp" },
      { src: "images/stamped-02-all-stamps.jpg", alt: "Stamped's All stamps wall, with Top Picks and a grid of stamps for films, books, albums and events.", caption: "All your stamps" },
      { src: "images/stamped-03-recap.jpg", alt: "Stamped's Week in Review recap card showing six stamps from the past week, ready to share.", caption: "Week in Review" },
      { src: "images/stamped-04-profile.jpg", alt: "A Stamped profile with stamp count, your people, and a Week in Review summary.", caption: "Profile" },
    ],
    link: "https://apps.apple.com/us/app/stamped-a-passport-for-life/id6779494313",
    linkLabel: "Get it on the App Store →",
  },
  {
    id: "q-plus-u",
    title: "Q+U",
    blurb: "A post-quantum security startup I co-founded: getting businesses ready for the quantum era.",
    description:
      "Q+U helps organizations find encryption that quantum computers will break, then plans each migration by business, legal and technical risk. It began by winning the Harmoniqs Quantum Hackathon.",
    tags: ["startup", "quantum", "cybersecurity"],
    status: "co-founder",
    flower: "star",
    color: "sky",
    page: "https://qplusu.com", // opens the Q+U site in a new tab
  },
  {
    id: "human-architecture-of-cyber-risk",
    title: "The Human Architecture of Cyber Risk",
    blurb: "My M.S. thesis on how micro-businesses really stay secure, and why our frameworks miss it.",
    description: [
      "Sixty percent of breaches involve a human element. Every cybersecurity report names that number, and almost none of them solve for it. My thesis asks what that looks like for the smallest businesses: two people, a handful of apps, and no IT department.",
      "Micro-businesses run on relational, conversational logic. Security knowledge doesn't live in written policies; it lives in texts, forwarded emails and the shared instinct of people who work side by side. Frameworks built for 20,000-person institutions are good at one-time setup (turn on MFA, patch the laptops) but miss the daily practice: noticing that an email looks off, knowing when to pause and ask.",
      "I studied this through a case study of KinKa Plant Shop, a two-person retail business in New York City, applying Functional Mission Analysis–Cyber to the whole operation, alongside network analysis, text analysis and clustering of more than 10,000 incidents in the Verizon community breach database. Micro-business sectors sit on the edges of the threat landscape, speak a different vocabulary of risk (cards, payments and skimming, not exploited vulnerabilities) and are targets of opportunity rather than choice.",
      "The evidence points to three shifts: redesign frameworks around the actual incident profile, redesign training around conversational knowledge sharing, and deliver it through locally trusted intermediaries. Designing cyber resilience for micro-businesses begins by meeting them where they actually live: in conversation, in trust, and in the cadence of two people who run a business together.",
    ],
    tags: ["research", "cybersecurity", "public interest tech", "NYU"],
    status: "M.S. thesis · with distinction",
    flower: "tulip",
    color: "peach",
    images: [
      { src: "images/human-architecture-poster.png", alt: "Research poster for The Human Architecture of Cyber Risk, summarizing the problem, reframe, KinKa Plant Shop case study, findings and policy implications.", caption: "Research poster, April 2026" },
    ],
    links: [
      { label: "Read the thesis (PDF)", href: "files/human-architecture-of-cyber-risk-thesis.pdf" },
      { label: "Poster (PDF)", href: "files/human-architecture-of-cyber-risk-poster.pdf" },
    ],
  },
  {
    id: "moth-lanterns",
    title: "Moth Lanterns",
    blurb: "Glowing paper moths that drift toward your cursor.",
    description:
      "An interactive night scene where tiny pixel moths gather around whatever light you carry.\n\nIdea: each moth has its own personality — some shy, some bold — and they remember where you've been.",
    tags: ["interactive", "night", "generative"],
    status: "idea",
    flower: "tulip",
    color: "lilac",
  },
  {
    id: "opt-in",
    title: "Opt In",
    blurb: "An AR art installation that asks: will people trade their data to be seen?",
    description: [
      "Opt In is my first digital art project: an augmented reality installation about the trade between visibility and privacy.",
      "At an art exhibit, you almost want people to know who you are and what you do. So visitors can choose to opt in. Through an AR headset, facial recognition overlays each person who opted in with their name and what they do, so you can see who is who as you move through the room. The question underneath is simple: will people sacrifice their data for visibility?",
      "A live feed on a screen in the space tracks the answer in real time, showing what percentage of the people who attended chose to opt in.",
      "Then the piece flips. The room becomes a visualization of everyone as multicolored, hand-drawn figures, with no faces and no names. Visitors can share a secret, and it appears anonymously, showing how many people around you are holding which secrets. The installation moves back and forth between the two: being known and being honest, identity and anonymity.",
    ],
    tags: ["AR", "installation", "privacy", "facial recognition", "data"],
    status: "idea",
    flower: "daisy",
    color: "pink",
    images: [
      { src: "images/opt-in-01-overlay.svg", alt: "Sketch of the headset view: three visitors who opted in are framed with name tags showing their name and what they do, while two private visitors appear as faint dashed outlines.", caption: "01 · The overlay: who chose to be seen" },
      { src: "images/opt-in-02-live-feed.svg", alt: "Sketch of a screen in the gallery reading 62% of tonight's visitors opted in, above a row of ones and zeros, one per visitor, with people watching from below.", caption: "02 · The live feed: the room's answer in real time" },
      { src: "images/opt-in-03-flip.svg", alt: "Sketch of the flipped view: faceless multicolored figures connected by dotted lines to anonymous secrets such as I'm starting over, each with a count of how many people hold it.", caption: "03 · The flip: anonymous secrets, no faces" },
    ],
  },
  {
    id: "tiny-weather",
    title: "Tiny Weather",
    blurb: "A pocket-sized sky that mirrors the real forecast.",
    description:
      "A 64×64 pixel window whose clouds, rain and sunsets follow the live weather where you are.",
    tags: ["data art", "pixel"],
    status: "idea",
    flower: "sunflower",
    color: "butter",
  },
  {
    id: "mushroom-choir",
    title: "Mushroom Choir",
    blurb: "Click the mushrooms and they sing in harmony.",
    description:
      "A musical toy: a ring of pixel mushrooms, each one a note. Play them together and the forest floor lights up.",
    tags: ["sound", "toy"],
    status: "in progress",
    flower: "rose",
    color: "peach",
  },
  {
    id: "pixel-pond",
    title: "Pixel Pond",
    blurb: "Koi made of pixels swimming through your photos.",
    description:
      "Upload a photo and it becomes a pond. The fish nibble the colors and slowly rearrange the picture.",
    tags: ["photo", "generative"],
    status: "idea",
    flower: "star",
    color: "sky",
  },
  {
    id: "dream-seeds",
    title: "Dream Seeds",
    blurb: "Type a dream and watch it grow into a plant.",
    description:
      "Every word becomes a leaf, petal or root. Long dreams grow tall vines; short ones bloom fast.",
    tags: ["text", "generative"],
    status: "idea",
    flower: "lily",
    color: "coral",
  },
  {
    id: "starlight-postcards",
    title: "Starlight Postcards",
    blurb: "Animated pixel postcards to send to friends.",
    description:
      "A series of looping postcards — sleepy towns, glowing greenhouses, rooftop picnics — each one hiding a secret detail.",
    tags: ["illustration", "loop"],
    status: "sketching",
    flower: "lily",
    color: "mint",
  },
  {
    id: "honey-archive",
    title: "Honey Archive",
    blurb: "A beehive where every cell holds a tiny memory.",
    description:
      "A honeycomb gallery: each hexagon is a little drawing, and the bees carry new ones in over time.",
    tags: ["gallery", "collection"],
    status: "idea",
    flower: "rose",
    color: "snow",
  },
];
