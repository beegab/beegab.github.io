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
   wip         – true for a placeholder: shows "Work in progress" only
   demo        – optional { title, text }: with a link, shows a big
                 "play the demo" panel instead of image frames
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
    id: "opt-out",
    title: "Opt Out",
    blurb: "Real data broker profiles of real people, and the never-ending price of making them disappear.",
    description: [
      "Opt Out is a companion to Opt In. Where Opt In asks what people will give up to be seen, this piece asks what it costs to disappear, and who can afford to.",
      "To land, it has to be real. The profiles come from consenting volunteers, and from my own data. Data brokers already hold a startling amount: every address you've lived at, your phone numbers, your relatives and who they're connected to. In California alone, 581 data brokers are registered with the state. The wall rebuilds each volunteer's people-search profile in ones and zeros, past homes as a trail across a map, phone numbers stacking up, family as a constellation, and names the sites it came from: Spokeo, Whitepages, BeenVerified, Intelius, TruePeopleSearch, FastPeopleSearch, Radaris, CheckPeople, PublicDataUSA.",
      "Next to each profile, a receipt prints, and it never stops printing. Getting off a data broker isn't a one-time purchase. Brokers resell records to each other and keep refreshing from public records, so listings you remove come back, and new sites appear that never had your opt-out at all. That's why removal services are subscriptions: they re-scan and re-remove on a loop. DeleteMe charges $129 a year for one person, Incogni about $8 a month, Kanary $250 a year. Over five years that's $645 for DeleteMe and $1,250 for Kanary, and the protection stops the moment you stop paying.",
      "The cheaper route costs time, again and again. In a 2024 Consumer Reports study, manual opt-outs actually beat the paid services at first: about 70% of listings were gone within a week, while the services removed anywhere from 0% to 59%. But they don't stay gone. Every few months you search yourself again and start over: a form, a confirmation email and a wait for every single site. It's whack-a-mole, and the hours never add up to done.",
      "Even the best public fix is built around the repeat. California's free DROP platform sends one deletion request to every registered broker, and brokers have to keep checking and deleting every 45 days, because everyone knows the data comes back. But it only covers people who live in California.",
      "So the piece makes visitors play. Pay with time and the profile becomes a game of whack-a-mole: tap a listing to remove it and another pops up somewhere else, faster than you can keep up. Pay with money and the listings stay down, but only while the meter runs. Walk away and it all grows back. People who have to be public, for their work or their safety, are the easiest to find and the hardest to erase, while people with capital can pay the subscription forever. The public price of privacy isn't a price at all. It's rent.",
    ],
    tags: ["data brokers", "privacy", "installation", "inequality", "data"],
    status: "idea",
    flower: "tulip",
    color: "lilac",
    images: [
      { src: "images/opt-out-01-mirror.svg", alt: "Sketch of a volunteer's redacted people-search profile: a trail of past addresses across a map, stacked phone numbers, a constellation of relatives, and the people-search sites it was found on.", caption: "01 · The mirror: one volunteer's profile" },
      { src: "images/opt-out-02-receipt.svg", alt: "Sketch of a receipt titled Privacy, Rented, listing yearly removal-service prices and five-year totals, then manual opt-out checklists that keep repeating as listings reappear.", caption: "02 · The receipt: it never stops printing" },
      { src: "images/opt-out-03-whack-a-mole.svg", alt: "Sketch of a whack-a-mole board of people-search listings popping out of holes, with a hand tapping one away, a timer, removed and reappeared counters, and an option to pay $129 a year.", caption: "03 · Whack-a-mole: removed 41, reappeared 38" },
    ],
    links: [
      { label: "California data broker registry", href: "https://cppa.ca.gov/data_broker_registry" },
      { label: "Consumer Reports removal study", href: "https://innovation.consumerreports.org/new-report-data-defense-evaluating-people-search-site-removal-services/" },
      { label: "California DROP", href: "https://cppa.ca.gov/data_brokers" },
      { label: "Why data reappears (Privacy Guides)", href: "https://www.privacyguides.org/en/data-broker-removals/" },
    ],
  },
  {
    id: "opt-in",
    title: "Opt In",
    blurb: "An AR art installation that asks: will people trade their data to be seen?",
    description: [
      "Opt In is my first digital art project: an augmented reality installation about the trade between visibility and privacy.",
      "At an art exhibit, you almost want people to know who you are and what you do. So visitors can choose to opt in. Through an AR headset, facial recognition overlays each person who opted in with their name and what they do, so you can see who is who as you move through the room. The question underneath is simple: will people sacrifice their data for visibility?",
      "A live feed on a screen in the space tracks the answer in real time, showing what percentage of the people who attended chose to opt in.",
      "Then the piece flips. Everyone becomes a multicolored, hand-drawn figure, with no faces and no names. Visitors can share a secret, and it appears anonymously with a count of how many people are holding it. Unlike the overlay, which follows real people as they move, nothing here is tied to anyone: the figures are drawings, not tracked bodies, so a secret can never be traced back to a person.",
      "The installation moves back and forth between the two states: being known and being honest, identity and anonymity.",
    ],
    tags: ["AR", "installation", "privacy", "facial recognition", "data"],
    status: "idea",
    flower: "daisy",
    color: "pink",
    images: [
      { src: "images/opt-in-01-overlay.svg", alt: "Sketch of the headset view: three visitors who opted in are framed with name tags showing their name and what they do, while two private visitors appear as faint dashed outlines.", caption: "01 · The overlay: who chose to be seen" },
      { src: "images/opt-in-02-live-feed.svg", alt: "Sketch of a screen in the gallery reading 62% of tonight's visitors opted in, above a row of ones and zeros, one per visitor, with people watching from below.", caption: "02 · The live feed: the room's answer in real time" },
      { src: "images/opt-in-03-flip.svg?v=3", alt: "Sketch of the flipped view: anonymous secrets such as I'm starting over hang by dotted strings from a row of colored-in, faceless drawn figures, each secret with a tally of how many people hold it.", caption: "03 · The flip: secrets held by drawings, not people" },
    ],
  },
  {
    id: "dark-patterns",
    title: "Dark Patterns",
    blurb: "An interactive gallery of the design tricks that steer you. Try to escape each one.",
    description: [
      "Dark patterns are the design tricks that nudge us into choices we didn't mean to make: the cancel button that's impossible to find, the cookie banner where \"Accept all\" glows and \"Reject\" hides, the countdown timer that resets when you refresh. They aren't accidents. In a 2024 review of 642 subscription websites and apps by consumer protection authorities in 26 countries, nearly 76% used at least one possible dark pattern, and nearly 67% used more than one.",
      "This piece turns them into a game. Each level is a simple task with a trap built in, drawn from the patterns researchers have named and catalogued. Cancel a subscription and get lost in a maze of screens (hard to cancel). Decline cookies when the right button barely looks like a button (visual interference). Check out and find something you never chose already in your cart (sneaking), or a fee that appears on the last step (hidden costs). Say no and be told \"No thanks, I don't like saving money\" (confirmshaming). Race a timer that isn't real (fake urgency) for the \"last 2 in stock\" (fake scarcity). Untick a box that was checked for you (preselection), then read a double negative twice to understand what you're agreeing to (trick wording).",
      "A scoreboard keeps count of your time, your clicks and how many times you were tricked. After each level the interface flips, and the trick is shown in X-ray: the pattern's name, how it works on your attention, and where it's been documented.",
      "At the end you get a receipt of everything you almost agreed to. The point is to make the invisible visible: once you can name a pattern, you start seeing it everywhere, and it loses some of its power over you.",
      "The first five levels are playable now: a cookie banner, a pop-up offer, a checkout, a settings page and a subscription you have to cancel.",
    ],
    tags: ["interactive", "UX", "dark patterns", "consumer protection", "web"],
    status: "playable demo",
    flower: "sunflower",
    color: "coral",
    link: "dark-patterns.html",
    linkLabel: "Play the demo →",
    demo: { title: "Try to escape", text: "5 levels · about 3 minutes · works on your phone" },
    links: [
      { label: "Catalog of dark patterns (deceptive.design)", href: "https://www.deceptive.design/types" },
      { label: "FTC report: Bringing Dark Patterns to Light", href: "https://www.ftc.gov/reports/bringing-dark-patterns-light" },
      { label: "2024 review of 642 sites and apps (FTC)", href: "https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-icpen-gpen-announce-results-review-use-dark-patterns-affecting-subscription-services-privacy" },
    ],
  },
  {
    id: "mushroom-choir",
    title: "Mushroom Choir",
    blurb: "Work in progress.",
    description: [],
    tags: [],
    wip: true, // no images or sketch frames yet
    flower: "rose",
    color: "peach",
  },
  {
    id: "pixel-pond",
    title: "Pixel Pond",
    blurb: "Work in progress.",
    description: [],
    tags: [],
    wip: true, // no images or sketch frames yet
    flower: "star",
    color: "sky",
  },
  {
    id: "dream-seeds",
    title: "Dream Seeds",
    blurb: "Work in progress.",
    description: [],
    tags: [],
    wip: true, // no images or sketch frames yet
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
    blurb: "Work in progress.",
    description: [],
    tags: [],
    wip: true, // no images or sketch frames yet
    flower: "rose",
    color: "snow",
  },
];
