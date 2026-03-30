import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://concreteclub.studio";
const START_URL = new URL("/", ORIGIN);
const OUTPUT_DIR = path.resolve("public");
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const REBRAND_SCRIPT_PATH = path.join(OUTPUT_DIR, "rebrand-newnordic.js");
const REBRAND_SCRIPT_SRC = "/rebrand-newnordic.js";
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
    '<style id="nns-static-cleanup">.intro,.intro__wrapper{position:relative!important;overflow:hidden!important;isolation:isolate!important;background:#d6ccc4!important;background-color:#d6ccc4!important;color:#372d26!important;}.intro__wrapper>:not(.nns-smoke-layer){position:relative!important;z-index:1!important;}.nns-smoke-layer{position:absolute!important;inset:0!important;z-index:0!important;pointer-events:none!important;}.nns-smoke-layer canvas{width:100%!important;height:100%!important;display:block!important;}.intro *,.header,.header *,#overlay__intro,#overlay__intro *{color:#372d26!important;}.home-projects .home-projects__row:nth-of-type(2){display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;}.home-projects .project-preview,.home-projects .project-preview *{pointer-events:none!important;cursor:default!important;}.home-projects .project-preview:focus{outline:none!important;}.home-projects .project-preview__image-hover{display:none!important;opacity:0!important;visibility:hidden!important;}.home-projects__row:hover .project-preview__image:not(:hover),.home-projects .project-preview__image,.home-projects .project-preview__image *{-webkit-filter:none!important;filter:none!important;}.home-projects .project-preview__image img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}.overlay.is-home .overlay__step:first-of-type{display:none!important;}.contact .footer__links .footer__link:not(:first-child){margin-top:.25rem!important;}@media (max-width:47.99rem){.intro__title{font-size:clamp(3.75rem,16.5vw,5.5rem)!important;line-height:1.02!important;}.intro__title>span{flex:0 0 auto!important;}.intro__title>span:first-child{white-space:nowrap!important;}.intro__club{transform:none!important;}}</style>';

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
    "In today’s digital-first world, a brand’s online presence is more than just a marketing tool—it’s a direct reflection of its identity, credibility, and influence.",
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

const rebrandRuntimeScript = await readFile(path.resolve("public/rebrand-newnordic.js"), "utf8");

await crawl();
await applyRebrandToMirroredAssets();
await writeFile(REBRAND_SCRIPT_PATH, rebrandRuntimeScript, "utf8");
await applyRebrandToHtml(path.join(OUTPUT_DIR, "concreteclub.html"));
await copyFile(path.join(OUTPUT_DIR, "concreteclub.html"), path.resolve("index.html"));
await applyRebrandToHtml(path.resolve("index.html"));
console.log(`Done. Mirrored ${visited.size} URL(s).`);
