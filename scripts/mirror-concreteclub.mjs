import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://concreteclub.studio";
const START_URL = new URL("/", ORIGIN);
const OUTPUT_DIR = path.resolve("public");
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const REBRAND_SCRIPT_PATH = path.join(OUTPUT_DIR, "rebrand-newnordic.js");
const REBRAND_SCRIPT_SRC = "/rebrand-newnordic.js?v=20260331c";
const BRAND_FAVICON_URL = "/favicon.ico?v=1";
const BRAND_OG_IMAGE_URL = "/favicon-n.png?v=1";
const TEXT_FILE_EXTENSIONS = new Set([".mjs", ".js", ".css", ".html", ".json", ".svg"]);

const queue = [START_URL.href];
const visited = new Set();

const TEXT_TYPES = [
  "text/",
  "application/javascript",
  "application/x-javascript",
  "application/json",
  "application/xml",
  "image/svg+xml",
];

const isTextContent = (contentType) =>
  TEXT_TYPES.some((prefix) => contentType.includes(prefix));

const shouldQueueUrl = (url) => {
  if (url.origin !== ORIGIN) return false;

  const pathname = url.pathname;
  if (pathname === "/") return true;
  if (pathname.startsWith("/_nuxt/")) return true;

  // Keep same-origin assets that are direct files (fonts, icons, etc.).
  return /\.[a-z0-9]+$/i.test(pathname);
};

const normalizeUrl = (raw, base) => {
  if (!raw) return null;

  const cleaned = raw
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\u002F/g, "/")
    .replace(/&amp;/g, "&");

  if (!cleaned) return null;
  if (cleaned.includes("${") || cleaned.includes("%7B")) return null;
  if (
    cleaned.startsWith("data:") ||
    cleaned.startsWith("mailto:") ||
    cleaned.startsWith("javascript:") ||
    cleaned.startsWith("tel:") ||
    cleaned.startsWith("#")
  ) {
    return null;
  }

  try {
    const url = new URL(cleaned, base);
    url.hash = "";
    url.search = "";

    return shouldQueueUrl(url) ? url : null;
  } catch {
    return null;
  }
};

const outputPathFor = (url) => {
  if (url.pathname === "/") {
    return path.join(OUTPUT_DIR, "concreteclub.html");
  }

  const relative = url.pathname.replace(/^\/+/, "");
  return path.join(OUTPUT_DIR, relative);
};

const extractCandidates = (text) => {
  const found = new Set();

  const push = (value) => {
    if (!value) return;
    found.add(value);
  };

  for (const match of text.matchAll(
    /(?:src|href|content|poster|data-src|data-href)=["']([^"']+)["']/gi,
  )) {
    push(match[1]);
  }

  for (const match of text.matchAll(/srcset=["']([^"']+)["']/gi)) {
    const entries = match[1].split(",").map((item) => item.trim().split(/\s+/)[0]);
    for (const entry of entries) push(entry);
  }

  for (const match of text.matchAll(/url\(([^)]+)\)/gi)) {
    push(match[1]);
  }

  for (const match of text.matchAll(/import\((['"`])([^'"`]+)\1\)/g)) {
    push(match[2]);
  }

  for (const match of text.matchAll(/from\s+(['"`])([^'"`]+)\1/g)) {
    push(match[2]);
  }

  // Catch plain quoted asset paths in minified bundles.
  for (const match of text.matchAll(/(['"`])(\/?_nuxt\/[^'"`]+?)\1/g)) {
    push(match[2]);
  }

  return [...found];
};

const crawl = async () => {
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next || visited.has(next)) continue;

    visited.add(next);

    const url = new URL(next);
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT },
      redirect: "follow",
    });

    if (!response.ok) {
      console.warn(`Skip ${url.href} -> ${response.status}`);
      continue;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const binary = Buffer.from(await response.arrayBuffer());

    const filePath = outputPathFor(url);
    await mkdir(path.dirname(filePath), { recursive: true });

    if (isTextContent(contentType)) {
      const text = binary.toString("utf8").replaceAll(ORIGIN, "");
      await writeFile(filePath, text, "utf8");

      for (const raw of extractCandidates(text)) {
        const normalized = normalizeUrl(raw, url);
        if (!normalized) continue;

        const href = normalized.href;
        if (!visited.has(href)) {
          queue.push(href);
        }
      }
    } else {
      await writeFile(filePath, binary);
    }

    console.log(`Saved ${url.pathname} -> ${path.relative(process.cwd(), filePath)}`);
  }
};

const applyRebrandToHtml = async (filePath) => {
  let html = await readFile(filePath, "utf8");

  html = html
    .replaceAll(
      "Concrete Club Studio — Creative freelance collective based in Paris",
      "New Nordic Studios",
    )
    .replaceAll(
      "The Concrete Club is a collaboration based creative freelance collective founded by Gaétan Pautler. ",
      "Helping businesses grow through strategic and engaging social media.",
    )
    .replaceAll("Concrete Club Studio", "New Nordic Studios")
    .replaceAll("The Concrete Club", "New Nordic Studios")
    .replaceAll("Gaétan Pautler", "New Nordic Studios Team")
    .replaceAll("content=\"@antinomystudio\"", "content=\"@newnordicstudios\"")
    .replaceAll(
      "https://www.datocms-assets.com/77158/1665153025-favicon.png",
      BRAND_FAVICON_URL,
    )
    .replaceAll(
      "https://www.datocms-assets.com/77158/1693398607-og-image.png",
      BRAND_OG_IMAGE_URL,
    );

  html = html
    .replace(
      /<meta[^>]+(?:property="og:image"|name="twitter:image(?::src)?")[^>]*>/gi,
      "",
    )
    .replace(
      /<meta\s+hid="twitter:card"\s+name="twitter:card"[^>]*>/gi,
      '<meta hid="twitter:card" name="twitter:card" content="summary">',
    )
    .replaceAll('b.twitterCard="summary_large_image";', 'b.twitterCard="summary";')
    .replaceAll(
      'b.image={url:"https:\\u002F\\u002Fwww.datocms-assets.com\\u002F77158\\u002F1693398607-og-image.png"};',
      `b.image={url:"${BRAND_OG_IMAGE_URL}"};`,
    )
    .replaceAll(
      'favicon:{url:"https:\\u002F\\u002Fwww.datocms-assets.com\\u002F77158\\u002F1665153025-favicon.png"}',
      `favicon:{url:"${BRAND_FAVICON_URL}"}`,
    );

  const faviconLinks =
    '<link rel="icon" type="image/x-icon" href="/favicon.ico?v=1"><link rel="icon" type="image/png" href="/favicon-n.png?v=1"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=1">';
  html = html
    .replace(/<link\s+rel="icon"[^>]*>/gi, "")
    .replace(/<link\s+rel="apple-touch-icon"[^>]*>/gi, "");
  if (!html.includes('/favicon.ico')) {
    html = html.replace("</head>", `  ${faviconLinks}\n</head>`);
  }

  const staticCleanupStyle =
    '<style id="nns-static-cleanup">.intro,.intro__wrapper{background:#d6ccc4!important;background-color:#d6ccc4!important;color:#372d26!important;}.intro *,.header,.header *,#overlay__intro,#overlay__intro *{color:#372d26!important;}.home-projects .home-projects__row:nth-of-type(2){display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}.home-projects .project-preview,.home-projects .project-preview *{pointer-events:none!important;cursor:default!important;}.home-projects .project-preview:focus{outline:none!important;}.home-projects .project-preview__image-hover{display:none!important;opacity:0!important;visibility:hidden!important;}.home-projects__row:hover .project-preview__image:not(:hover),.home-projects .project-preview__image,.home-projects .project-preview__image *{-webkit-filter:none!important;filter:none!important;}.home-projects .project-preview__image img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}.overlay.is-home .overlay__step:first-of-type{display:none!important;}.contact .footer__links .footer__link:not(:first-child){margin-top:.25rem!important;}@media (max-width:47.99rem){.intro__title{font-size:clamp(3.75rem,16.5vw,5.5rem)!important;line-height:1.02!important;}.intro__title>span{flex:0 0 auto!important;}.intro__title>span:first-child{white-space:nowrap!important;}.intro__club{transform:none!important;}}</style>';

  if (!html.includes('id="nns-static-cleanup"')) {
    html = html.replace("</head>", `  ${staticCleanupStyle}\n</head>`);
  }

  if (!html.includes(REBRAND_SCRIPT_SRC)) {
    html = html.replace(
      "</body>",
      `  <script src="${REBRAND_SCRIPT_SRC}" defer></script>\n</body>`,
    );
  }

  await writeFile(filePath, html, "utf8");
};

const STATIC_REPLACEMENTS = [
  ["Concrete Club Studio — Creative freelance collective based in Paris", "New Nordic Studios"],
  [
    "The Concrete Club is a collaboration based creative freelance collective founded by Gaétan Pautler. ",
    "New Nordic Studios is a collaboration based creative freelance collective founded by Margret-Louise Allen.",
  ],
  [
    "The New Nordic is a collaboration based creative freelance collective founded by Margret-Louise Allen.",
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
  [
    "The New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen.",
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
  [
    "The New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen",
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
  [
    "The New Nordic is a collaboration based creative freelance collective founded by Margret-Louise Allen",
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
  [
    " The New Nordic is a collaboration based creative freelance collective founded by Margret-Louise Allen. ",
    " New Nordic Studios is a full stack creative consultancy firm. ",
  ],
  ["The Concrete Club is about making it simpler and more damn fun!", "New Nordic Studios is about creating bold, strategic social media."],
  ["Concrete Club Studio", "New Nordic Studios"],
  ["Concrete Club", "New Nordic Studios"],
  ["The Concrete Club", "New Nordic Studios"],
  ["Gaétan Pautler", "Margret-Louise Allen"],
  ["GAETAN PAUTLER", "MARGRET-LOUISE ALLEN"],
  ["Antinomy studio", "New Nordic Studios"],
  ["Antinomy Studio", "New Nordic Studios"],
  ["Paris, France", "Stockholm, Sweden"],
  ["Paris, Worldwide", "Stockholm, Worldwide"],
  ["chapter 2", ""],
  ["Chapter 2", ""],
  ["Europe/Paris", "Europe/Stockholm"],
  ["blog.gaetanpautler.com", "www.newnordicstudios.com"],
  [
    "https://images.squarespace-cdn.com/content/v1/67c8dcdef69fa27c95a46082/bfe61038-8892-4762-b617-f14a052a572c/favicon.ico?format=100w",
    "/favicon.ico?v=1",
  ],
  ["https://www.datocms-assets.com/77158/1665153025-favicon.png", BRAND_FAVICON_URL],
  ["https://www.datocms-assets.com/77158/1693398607-og-image.png", BRAND_OG_IMAGE_URL],
  ["© All rights reserved — Concrete Club Studio, 2022", "© All rights reserved — New Nordic Studios, 2026"],
  ["New Nordic Club", "New Nordic Studios"],
  ["Selected projects", "In Motion"],
  ["SELECTED PROJECTS", "IN MOTION"],
  ["Selected clients", "In Motion"],
  ["SELECTED CLIENTS", "IN MOTION"],
  [
    "WITH OVER 10 YEARS OF INDUSTRY EXPERIENCE, I LIKE TO JOIN FORCES WITH MY ARTIST FRIENDS TO REFINE THE BORDER BETWEEN DIGITAL AND ANALOG WORLDS.",
    "A multi-disciplinary creative studio bridging the gap between high-level heritage strategy and the fast-paced digital landscape. From brand guardianship to performance-led content, we build visual ecosystems that endure.",
  ],
];

const STATIC_REGEX_REPLACEMENTS = [
  [/\bConcrete\s*Club\s*Studio\b/gi, "New Nordic Studios"],
  [/\bConcrete\s*Club\b/gi, "New Nordic Studios"],
  [/\bConcrete\s*club\b/gi, "New Nordic Studios"],
  [/\bConcrete\b/gi, "New Nordic"],
  [/Ga\\xE9tan Pautler/gi, "Margret-Louise Allen"],
  [/\bGa[ée]tan Pautler\b/gi, "Margret-Louise Allen"],
  [/\bGAETAN PAUTLER\b/g, "MARGRET-LOUISE ALLEN"],
  [/\bParis,\s*France\b/gi, "Stockholm, Sweden"],
  [/\bParis,\s*Worldwide\b/gi, "Stockholm, Worldwide"],
  [/\bchapter\s*2\b/gi, ""],
  [/\bNew Nordic Club\b/gi, "New Nordic Studios"],
  [/\bThe New Nordic Studios\b/gi, "New Nordic Studios"],
  [/\bSelected projects\b/gi, "In Motion"],
  [/\bSelected clients\b/gi, "In Motion"],
  [/\bClub\b/g, "Studios"],
  [
    /The New Nordic is a collaboration based creative freelance collective founded by Margret-Louise Allen\.?/gi,
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
  [
    /New Nordic Studios is a collaboration based creative freelance collective founded by Margret-Louise Allen\.?/gi,
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
  [
    /New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen\.?/gi,
    "New Nordic Studios is a full stack creative consultancy firm.",
  ],
];

const applyStringReplacements = (input) => {
  let out = input;
  for (const [search, replacement] of STATIC_REPLACEMENTS) {
    out = out.split(search).join(replacement);
  }
  for (const [pattern, replacement] of STATIC_REGEX_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
};

const walkFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full)));
    } else {
      files.push(full);
    }
  }
  return files;
};

const applyRebrandToMirroredAssets = async () => {
  const files = await walkFiles(OUTPUT_DIR);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!TEXT_FILE_EXTENSIONS.has(ext)) continue;

    const info = await stat(file);
    if (!info.isFile()) continue;

    const original = await readFile(file, "utf8");
    const updated = applyStringReplacements(original);
    if (updated !== original) {
      await writeFile(file, updated, "utf8");
    }
  }
};

const rebrandRuntimeScript = `
(() => {
  const BRAND = "New Nordic Studios";
  const HERO_BACKGROUND = "#d6ccc4";
  const HERO_TEXT = "#372d26";
  const HERO_COPY =
    "New Nordic Studios is a full stack creative consultancy firm.";
  const BRAND_BLURB =
    "New Nordic Studios is a full stack creative consultancy firm.";
  const CTA_URL = "https://meetings-eu1.hubspot.com/margret-louise";
  const CONTACT_BLURB =
    "Eager to explore a collaboration?<br><br>contact@newnordicstudios.com<br>+46 72 322 2185";
  const STORY_PARAGRAPHS = [
    "A multi-disciplinary creative studio bridging the gap between high-level heritage strategy and the fast-paced digital landscape. From brand guardianship to performance-led content, we build visual ecosystems that endure.",
    "We don't just design; we build the systems, stories, and performance-led UGC streams that define modern market leaders. From seasonal storytelling arcs to high-retention video assets, we bridge the gap between aesthetic excellence and measurable revenue.",
    `Pillar I: Brand Architecture & Narrative
Brand Guardianship: Defining the tone of voice and ensuring aesthetic consistency across every consumer touchpoint: from retail environments to digital media.

Narrative Frameworks: Developing seasonal storytelling arcs and messaging pillars that resonate emotionally with target consumers.

Innovation Strategy: Utilizing competitive research and trend analysis to guide long-term investment and business transformation.

Pillar II: Performance Creative & UGC
Platform-Native Content: Creating, testing, and scaling high-retention short-form video (UGC) for Meta, TikTok, and Pinterest.

Retention Strategy: Analyzing performance signals: CTR, hooks, and CPA, to iterate and improve output based on real-time data.

360 Integrated Campaigns: Leading the execution of product launches and hero campaigns from initial insight to a global creative toolkit.

Pillar III: Commercial Operations & Design
Tactile Design: Premium physical branding, from bespoke menu and packaging and label design and editorial layouts to sourcing sustainable branding materials.

DTC Infrastructure: Building the operational backbone: connecting domains, customizing POS systems, and architecting e-commerce layouts.

Commercialization: Managing the "ground-up" logistics: calculating landing costs, profit margins, and vendor relations to build sustainable revenue channels.`,
  ];
  const CLIENT_CARD_BASE_NAMES = ["01", "02", "03", "04", "05", "06", "07", "08"];
  const CLIENT_CARD_EXTENSIONS = [
    "jpg",
    "JPG",
    "jpeg",
    "JPEG",
    "png",
    "PNG",
    "webp",
    "WEBP",
  ];
  const clientCardAvailability = {};

  const textReplacements = [
    [/\\bParis, France\\b/gi, "Stockholm, Sweden"],
    [/\\bParis\\b/gi, "Stockholm"],
    [/\\bchapter\\s*2\\b/gi, ""],
    [/\\bConcrete Club Studio\\b/gi, BRAND],
    [/\\bThe Concrete Club\\b/gi, BRAND],
    [/\\bConcrete Club\\b/gi, BRAND],
    [/\\bGa[ée]tan Pautler\\b/gi, "Margret-Louise Allen"],
    [/\\bfounded by New Nordic Studios Team\\b/gi, "founded by Margret-Louise Allen"],
    [/\\bfounded by Margret-Louise Allen Svedlund\\b/gi, "founded by Margret-Louise Allen"],
    [/\\bThe New Nordic Studios\\b/gi, "New Nordic Studios"],
    [/The New Nordic is a collaboration based creative freelance collective founded by Margret-Louise Allen\\.?/gi, BRAND_BLURB],
    [/The New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen\\.?/gi, BRAND_BLURB],
    [/New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen\\.?/gi, BRAND_BLURB],
    [/New Nordic Studios is a collaboration based creative freelance collective founded by Margret-Louise Allen\\.?/gi, BRAND_BLURB],
    [/\bselected projects\b/gi, "In Motion"],
    [/\bselected clients\b/gi, "In Motion"],
    [/\bartists\b/gi, "clients"],
    [/\\bcreative freelance collective based in Paris\\b/gi, "strategic social media studio"],
  ];

  const forceMeta = () => {
    document.title = BRAND;
    const sets = [
      ["meta[name='description']", HERO_COPY],
      ["meta[property='og:title']", BRAND],
      ["meta[name='twitter:title']", BRAND],
      ["meta[property='og:description']", HERO_COPY],
      ["meta[name='twitter:description']", HERO_COPY],
      ["meta[property='og:site_name']", BRAND],
      ["meta[name='twitter:card']", "summary"],
    ];

    sets.forEach(([selector, content]) => {
      const node = document.querySelector(selector);
      if (node) node.setAttribute("content", content);
    });

    document
      .querySelectorAll(
        "meta[property='og:image'],meta[name='twitter:image'],meta[name='twitter:image:src']",
      )
      .forEach((node) => node.remove());

    const ensureLink = (rel, href, type = "") => {
      let node = type
        ? document.head.querySelector("link[rel='" + rel + "'][type='" + type + "']")
        : document.head.querySelector("link[rel='" + rel + "']");
      if (!node) {
        node = document.createElement("link");
        node.setAttribute("rel", rel);
        if (type) node.setAttribute("type", type);
        document.head.appendChild(node);
      }
      node.setAttribute("href", href);
    };

    document.querySelectorAll("link[rel*='icon']").forEach((node) => {
      const rel = (node.getAttribute("rel") || "").toLowerCase();
      if (rel.includes("apple-touch-icon")) {
        node.setAttribute("href", "/apple-touch-icon.png?v=1");
      } else if (rel.includes("icon")) {
        const type = (node.getAttribute("type") || "").toLowerCase();
        if (type === "image/png") {
          node.setAttribute("href", "/favicon-n.png?v=1");
        } else {
          node.setAttribute("href", "/favicon.ico?v=1");
        }
      }
    });

    ensureLink("icon", "/favicon.ico?v=1", "image/x-icon");
    ensureLink("icon", "/favicon-n.png?v=1", "image/png");
    ensureLink("apple-touch-icon", "/apple-touch-icon.png?v=1");
  };

  const applyVisualCleanup = () => {
    if (document.getElementById("nns-cleanup-style")) return;
    const style = document.createElement("style");
    style.id = "nns-cleanup-style";
    style.textContent = ".intro__illu,.intro__illu>div,.intro__illu canvas,.home-projects .home-projects__row:nth-of-type(2){display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;}.home-projects .project-preview,.home-projects .project-preview *{pointer-events:none!important;cursor:default!important;}.home-projects .project-preview:focus{outline:none!important;}.home-projects .project-preview__image-hover{display:none!important;opacity:0!important;visibility:hidden!important;}.home-projects__row:hover .project-preview__image:not(:hover),.home-projects .project-preview__image,.home-projects .project-preview__image *{-webkit-filter:none!important;filter:none!important;}.home-projects .project-preview__image img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}.overlay.is-home .overlay__step:first-of-type{display:none!important;}.contact .footer__links .footer__link:not(:first-child){margin-top:.25rem!important;}";
    document.head.appendChild(style);
  };

  const forceHeroPalette = () => {
    const rawPath = window.location.pathname || "/";
    const path = rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;
    if (path !== "/") return;

    const backgroundNodes = document.querySelectorAll(".intro, .intro__wrapper");
    backgroundNodes.forEach((node) => {
      node.style.setProperty("background", HERO_BACKGROUND, "important");
      node.style.setProperty("background-color", HERO_BACKGROUND, "important");
      node.style.setProperty("color", HERO_TEXT, "important");
    });

    const textNodes = document.querySelectorAll(
      ".intro, .intro *, .header, .header *, #overlay__intro, #overlay__intro *",
    );
    textNodes.forEach((node) => {
      node.style.setProperty("color", HERO_TEXT, "important");
    });
  };

  const forceClientCardImages = () => {
    CLIENT_CARD_BASE_NAMES.forEach((name) => {
      CLIENT_CARD_EXTENSIONS.forEach((ext) => {
        const src = "/client-cards/" + name + "." + ext;
        if (src in clientCardAvailability) return;
        clientCardAvailability[src] = null;
        const probe = new Image();
        probe.onload = () => {
          clientCardAvailability[src] = true;
        };
        probe.onerror = () => {
          clientCardAvailability[src] = false;
        };
        probe.src = src;
      });
    });

    const cards = Array.from(document.querySelectorAll(".home-projects .project-preview"));
    if (!cards.length) return;

    cards.slice(0, CLIENT_CARD_BASE_NAMES.length).forEach((card, index) => {
      const name = CLIENT_CARD_BASE_NAMES[index];
      if (!name) return;
      const desiredSrc = CLIENT_CARD_EXTENSIONS
        .map((ext) => "/client-cards/" + name + "." + ext)
        .find((src) => clientCardAvailability[src] === true);
      if (!desiredSrc) return;

      const images = Array.from(card.querySelectorAll("img"));
      images.forEach((img) => {
        if (img.getAttribute("data-nns-custom-src") === desiredSrc) return;
        img.setAttribute("src", desiredSrc);
        img.setAttribute("srcset", desiredSrc);
        img.removeAttribute("sizes");
        img.setAttribute("data-nns-custom-src", desiredSrc);
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.objectPosition = "center";
      });

      const sources = Array.from(card.querySelectorAll("source"));
      sources.forEach((source) => {
        source.setAttribute("srcset", desiredSrc);
      });
    });
  };

  const toggleHomeIntroOverlayLabel = () => {
    const rawPath = window.location.pathname || "/";
    const path = rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;
    const isHomePage = path === "/";
    const introStep = document.querySelector(".overlay .overlay__step:first-of-type");
    if (!introStep) return;

    if (!isHomePage) {
      introStep.style.removeProperty("display");
      return;
    }

    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const threshold = window.innerHeight * 0.65;
    if (y < threshold) {
      introStep.style.setProperty("display", "none", "important");
    } else {
      introStep.style.removeProperty("display");
    }
  };

  const makeClientCardsStatic = () => {
    document.querySelectorAll(".home-projects .project-preview").forEach((card) => {
      card.setAttribute("aria-disabled", "true");
      card.setAttribute("tabindex", "-1");
      if ("disabled" in card) {
        card.disabled = true;
      }
    });

    if (!window.__nnsProjectCardsLocked) {
      document.addEventListener(
        "click",
        (event) => {
          const target = event.target;
          if (target && target.closest && target.closest(".home-projects .project-preview")) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        true,
      );
      window.__nnsProjectCardsLocked = true;
    }
  };

  const keepOnlyFirstProjectsPage = () => {
    const rows = document.querySelectorAll(".home-projects .home-projects__row");
    rows.forEach((row, index) => {
      if (index > 0) row.remove();
    });

    const counters = document.querySelectorAll(".overlay .overlay-home, .overlay .grid__text");
    counters.forEach((el) => {
      if (/(selected projects|selected clients|in motion)/i.test(el.textContent || "")) {
        const html = (el.innerHTML || "")
          .replace(/selected projects/gi, "In Motion")
          .replace(/selected clients/gi, "In Motion")
          .replace(/2-2/g, "1-1")
          .replace(/1-2/g, "1-1");
        if (html !== el.innerHTML) el.innerHTML = html;
        const text = (el.textContent || "")
          .replace(/selected projects/gi, "In Motion")
          .replace(/selected clients/gi, "In Motion")
          .replace(/2-2/g, "1-1")
          .replace(/1-2/g, "1-1");
        if (text !== el.textContent) el.textContent = text;
      }
    });
  };

  const normalizeRules = () => {
    const container = document.querySelector(".home-rules .home-rules__container");
    if (!container) return;

    let rows = Array.from(container.querySelectorAll(".home-rules__row"));
    if (!rows.length) return;

    rows.forEach((row) => {
      row.innerHTML = "";
      row.style.setProperty("display", "none", "important");
    });
  };

  const applyText = (root) => {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      const raw = node.nodeValue;
      if (!raw || !raw.trim()) return;
      let next = raw;
      for (const [pattern, replacement] of textReplacements) {
        next = next.replace(pattern, replacement);
      }
      if (next !== raw) node.nodeValue = next;
    });
  };

  const forceTopContent = () => {
    const rawPath = window.location.pathname || "/";
    const path = rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;
    const isContactPage = path === "/contact";
    const isHomePage = path === "/";

    const headings = Array.from(document.querySelectorAll("h1, h2, [role='heading']"));
    if (!isContactPage && !isHomePage) {
      const heroHeading = headings.find((el) => el.textContent && el.textContent.trim().length > 5);
      if (heroHeading) heroHeading.textContent = BRAND;
    }

    const ctaCandidates = Array.from(document.querySelectorAll("a, button"));
    ctaCandidates.forEach((el) => {
      const t = (el.textContent || "").trim().toLowerCase();
      if (t === "book now" || t === "let's talk" || t === "lets talk") {
        if (el.tagName === "A") {
          el.setAttribute("href", CTA_URL);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        }
        el.textContent = "Book now";
      }
    });
  };

  const forceStoryParagraphs = () => {
    const nodes = Array.from(document.querySelectorAll(".home-story__text > div, .home-story__text"));
    if (nodes.length < 3) return;

    for (let i = 0; i < 3; i += 1) {
      const node = nodes[i];
      if (!node) continue;
      if (i < 2) {
        node.textContent = STORY_PARAGRAPHS[i];
      } else {
        node.innerHTML = STORY_PARAGRAPHS[i].replace(/\n/g, "<br>");
      }
    }
  };

  const forceFixedLabels = () => {
    document.querySelectorAll(".header__text").forEach((headerBlurb) => {
      headerBlurb.textContent = BRAND_BLURB;
    });

    const location = document.querySelector(".header__location");
    if (location) {
      const raw = location.textContent || "";
      const parts = raw.split("—");
      const timePart = parts.length > 1 ? parts[1].trim() : "";
      location.textContent = timePart
        ? "Stockholm, Sweden — " + timePart
        : "Stockholm, Sweden";
    }

    // Ensure top-right nav reads exactly: "Studio, Contact"
    const navs = Array.from(document.querySelectorAll(".header__nav"));
    navs.forEach((nav) => {
      const navLinks = Array.from(nav.querySelectorAll(".header__link"));
      if (navLinks[0]) {
        navLinks[0].textContent = "Studio,";
        navLinks[0].setAttribute("href", "/");
        navLinks[0].removeAttribute("target");
        navLinks[0].removeAttribute("rel");
      }
      if (navLinks[1]) {
        navLinks[1].textContent = "Contact";
        navLinks[1].setAttribute("href", "/contact");
        navLinks[1].removeAttribute("target");
        navLinks[1].removeAttribute("rel");
      }
    });

    // Replace contact-page left blurb with provided copy.
    const collab = document.querySelector(".footer__collab p");
    if (collab) {
      collab.innerHTML = CONTACT_BLURB;
      collab.style.textTransform = "none";
      collab.style.whiteSpace = "normal";
    }

    // Update footer credits on contact page.
    document.querySelectorAll(".footer__credit").forEach((credit) => {
      const labelNode = credit.querySelector(".footer__label");
      const nameNode = credit.querySelector(".footer__name");
      const label = (labelNode?.textContent || "").trim().toLowerCase();
      if (!nameNode) return;

      if (label === "illustrations") {
        nameNode.textContent = "New Nordic Studios";
      }
      if (label === "development") {
        nameNode.textContent = "Dahl Industries AB";
      }
    });

    // Remove "chapter 2" from the home overlay label.
    document.querySelectorAll(".overlay-home").forEach((el) => {
      const text = (el.textContent || "").toLowerCase();
      if (text.includes("chapter 2")) {
        el.innerHTML = " Stockholm, Worldwide ";
      }
    });

    const copyright = Array.from(document.querySelectorAll(".footer__copyright p, p")).find(
      (el) => (el.textContent || "").toLowerCase().includes("all rights reserved"),
    );
    if (copyright) {
      copyright.textContent = "© All rights reserved — New Nordic Studios, 2026";
    }

    // Remove "Blog" from nav text and links entirely.
    document.querySelectorAll("a, button, span, p").forEach((el) => {
      const text = (el.textContent || "").trim();
      if (!text) return;

      if (/^blog$/i.test(text)) {
        el.remove();
        return;
      }

      if (text.toLowerCase().includes("blog")) {
        el.textContent = text
          .replace(/\\s*,?\\s*blog\\s*,?\\s*/gi, ", ")
          .replace(/\\s+,/g, ",")
          .replace(/,\\s*,/g, ",")
          .replace(/,\\s*$/, "")
          .replace(/\\s{2,}/g, " ")
          .trim();
      }
    });

    document.querySelectorAll("a[href]").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href.includes("blog")) a.remove();
    });

    // Rebuild middle socials to exactly: Email, Instagram, LinkedIn.
    const desiredSocials = ["email", "instagram", "linkedin"];
    const socialLabels = {
      email: "Email",
      instagram: "Instagram",
      linkedin: "LinkedIn",
    };

    if (!window.__nnsSocialCache) window.__nnsSocialCache = {};
    const socialCache = window.__nnsSocialCache;
    socialCache.email = {
      href: "mailto:contact@newnordicstudios.com",
      target: "",
      rel: "",
    };
    socialCache.instagram = {
      href: "https://www.instagram.com/swedishnewyorker",
      target: "_blank",
      rel: "noopener noreferrer",
    };
    socialCache.linkedin = {
      href: "https://www.linkedin.com/in/margret-louiseallen/",
      target: "_blank",
      rel: "noopener noreferrer",
    };

    document.querySelectorAll(".footer__links a[href]").forEach((a) => {
      const key = ((a.textContent || "").trim().toLowerCase())
        .replace(/\\s+/g, " ")
        .replace(/\\./g, "");

      if (!desiredSocials.includes(key)) return;

      if (key !== "email" && key !== "instagram" && key !== "linkedin") {
        socialCache[key] = {
          href: a.getAttribute("href") || "",
          target: a.getAttribute("target") || "_blank",
          rel: a.getAttribute("rel") || "noopener noreferrer",
        };
      }
    });

    document.querySelectorAll(".footer__links ul").forEach((ul) => {
      const available = desiredSocials.filter((key) => socialCache[key]?.href);
      if (!available.length) return;

      ul.innerHTML = "";
      available.forEach((key) => {
        const li = document.createElement("li");
        li.className = "footer__link";

        const a = document.createElement("a");
        a.textContent = socialLabels[key];
        a.setAttribute("href", socialCache[key].href);

        if ((socialCache[key].href || "").toLowerCase().startsWith("mailto:")) {
          a.removeAttribute("target");
          a.removeAttribute("rel");
        } else {
          a.setAttribute("target", socialCache[key].target);
          a.setAttribute("rel", socialCache[key].rel);
        }

        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  };

  const applyAll = (root = document.body) => {
    forceMeta();
    applyVisualCleanup();
    forceHeroPalette();
    if (root) applyText(root);
    keepOnlyFirstProjectsPage();
    makeClientCardsStatic();
    forceClientCardImages();
    toggleHomeIntroOverlayLabel();
    normalizeRules();
    forceTopContent();
    forceStoryParagraphs();
    forceFixedLabels();
  };

  const boot = () => {
    // Keep this lightweight so we do not interfere with Nuxt hydration/render timing.
    applyAll();
    setTimeout(() => applyAll(), 800);
    setTimeout(() => applyAll(), 2000);
    setTimeout(() => applyAll(), 3500);
    if (!window.__nnsOverlayLabelScrollBound) {
      window.addEventListener("scroll", toggleHomeIntroOverlayLabel, { passive: true });
      window.__nnsOverlayLabelScrollBound = true;
    }
    setInterval(() => {
      applyText(document.body);
      keepOnlyFirstProjectsPage();
      makeClientCardsStatic();
      forceClientCardImages();
      toggleHomeIntroOverlayLabel();
      forceStoryParagraphs();
      normalizeRules();
      forceFixedLabels();
      forceHeroPalette();
    }, 400);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
`.trimStart();

await crawl();
await applyRebrandToMirroredAssets();
await writeFile(REBRAND_SCRIPT_PATH, rebrandRuntimeScript, "utf8");
await applyRebrandToHtml(path.join(OUTPUT_DIR, "concreteclub.html"));
await copyFile(path.join(OUTPUT_DIR, "concreteclub.html"), path.resolve("index.html"));
await applyRebrandToHtml(path.resolve("index.html"));
console.log(`Done. Mirrored ${visited.size} URL(s).`);
