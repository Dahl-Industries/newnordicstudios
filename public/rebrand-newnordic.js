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
  const STORY_BLOCKS = [
    {
      title: "Pillar I: Brand Architecture & Narrative",
      items: [
        "Brand Guardianship: Defining the tone of voice and ensuring aesthetic consistency across every consumer touchpoint: from retail environments to digital media.",
        "Narrative Frameworks: Developing seasonal storytelling arcs and messaging pillars that resonate emotionally with target consumers.",
        "Innovation Strategy: Utilizing competitive research and trend analysis to guide long-term investment and business transformation.",
      ],
    },
    {
      title: "Pillar II: Performance Creative & UGC",
      items: [
        "Platform-Native Content: Creating, testing, and scaling high-retention short-form video (UGC) for Meta, TikTok, and Pinterest.",
        "Retention Strategy: Analyzing performance signals: CTR, hooks, and CPA, to iterate and improve output based on real-time data.",
        "360 Integrated Campaigns: Leading the execution of product launches and hero campaigns from initial insight to a global creative toolkit.",
      ],
    },
    {
      title: "Pillar III: Commercial Operations & Design",
      items: [
        "Tactile Design: Premium physical branding, from bespoke menu and packaging and label design and editorial layouts to sourcing sustainable branding materials.",
        "DTC Infrastructure: Building the operational backbone: connecting domains, customizing POS systems, and architecting e-commerce layouts.",
        'Commercialization: Managing the "ground-up" logistics: calculating landing costs, profit margins, and vendor relations to build sustainable revenue channels.',
      ],
    },
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
    [/\bParis, France\b/gi, "Stockholm, Sweden"],
    [/\bParis\b/gi, "Stockholm"],
    [/\bchapter\s*2\b/gi, ""],
    [/\bConcrete Club Studio\b/gi, BRAND],
    [/\bThe Concrete Club\b/gi, BRAND],
    [/\bConcrete Club\b/gi, BRAND],
    [/\bGa[ée]tan Pautler\b/gi, "Margret-Louise Allen"],
    [/\bfounded by New Nordic Studios Team\b/gi, "founded by Margret-Louise Allen"],
    [/\bfounded by Margret-Louise Allen Svedlund\b/gi, "founded by Margret-Louise Allen"],
    [/\bThe New Nordic Studios\b/gi, "New Nordic Studios"],
    [/The New Nordic is a collaboration based creative freelance collective founded by Margret-Louise Allen\.?/gi, BRAND_BLURB],
    [/The New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen\.?/gi, BRAND_BLURB],
    [/New Nordic Studios is a collaboration based social media agency founded by Margret-Louise Allen\.?/gi, BRAND_BLURB],
    [/New Nordic Studios is a collaboration based creative freelance collective founded by Margret-Louise Allen\.?/gi, BRAND_BLURB],
    [/\bselected projects\b/gi, "In Motion"],
    [/\bselected clients\b/gi, "In Motion"],
    [/\bartists\b/gi, "clients"],
    [/\bcreative freelance collective based in Paris\b/gi, "strategic social media studio"],
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
    style.textContent =
      ".intro__illu,.intro__illu>div,.intro__illu canvas,.home-projects .home-projects__row:nth-of-type(2){display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;}.home-projects .project-preview,.home-projects .project-preview *{pointer-events:none!important;cursor:default!important;}.home-projects .project-preview:focus{outline:none!important;}.home-projects .project-preview__image-hover{display:none!important;opacity:0!important;visibility:hidden!important;}.home-projects__row:hover .project-preview__image:not(:hover),.home-projects .project-preview__image,.home-projects .project-preview__image *{-webkit-filter:none!important;filter:none!important;}.home-projects .project-preview__image img{width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;}.overlay.is-home .overlay__step:first-of-type{display:none!important;}.contact .footer__links .footer__link:not(:first-child){margin-top:.25rem!important;}@media (max-width:47.99rem){body{overflow-x:hidden!important;}.page--index[data-v-2d54c737]{padding-bottom:0!important;}.overlay{display:none!important;}.header{padding:.75rem!important;}.header__content:nth-of-type(2){display:none!important;}.header__wrap{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:.35rem!important;}.header__text{display:none!important;}.header__right{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:.25rem!important;}.header__location,.header__nav,.header__link{font-size:.66rem!important;line-height:.92!important;white-space:nowrap!important;}.header__nav{display:flex!important;gap:.2rem!important;}.header__nav::after,.header__wrap::after,.header__right::after{content:none!important;display:none!important;}.intro{-webkit-clip-path:none!important;clip-path:none!important;height:auto!important;min-height:82svh!important;pointer-events:auto!important;position:relative!important;top:auto!important;}.intro__wrapper{align-items:flex-end!important;display:flex!important;height:auto!important;justify-content:flex-start!important;min-height:82svh!important;padding:5.5rem .75rem 1.5rem!important;position:relative!important;top:auto!important;transform:none!important;}.intro__grid{display:none!important;}.intro__title{bottom:auto!important;font-family:'TRJN DaVinci'!important;font-size:clamp(3.1rem,15.5vw,4.5rem)!important;left:auto!important;letter-spacing:-.04em!important;line-height:.88!important;margin:0!important;max-width:100%!important;position:relative!important;right:auto!important;top:auto!important;width:100%!important;}.intro__title>span{flex:0 0 auto!important;max-width:100%!important;}.intro__title>span:first-child{white-space:normal!important;}.intro__club{margin-top:.15rem!important;transform:none!important;}}";
    document.head.appendChild(style);
  };

  const applyStoryLayoutStyles = () => {
    if (document.getElementById("nns-story-pillars-style")) return;
    const style = document.createElement("style");
    style.id = "nns-story-pillars-style";
    style.textContent = `
      .overlay .overlay__step:nth-of-type(2) {
        display: none !important;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block] {
        align-items: flex-start !important;
        display: block !important;
        max-width: min(29rem, 100%);
        padding: 0 !important;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block]:first-of-type {
        grid-area: 6 / 4 / auto / span 4;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(2) {
        grid-area: 8 / 8 / auto / span 4;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(3) {
        grid-area: 12 / 4 / auto / span 4;
        max-width: min(31rem, 100%);
      }

      .nns-story-block {
        width: 100%;
      }

      .nns-story-block__title {
        display: block;
        margin-bottom: 1rem;
      }

      .nns-story-block__list {
        list-style: disc;
        margin: 0;
        padding-left: 1rem;
      }

      .nns-story-block__item + .nns-story-block__item {
        margin-top: 1.1rem;
      }

      .nns-story-block__item::marker {
        font-size: 0.7em;
      }

      .nns-story-block__label {
        font-weight: 700;
      }

      .nns-story-block__body {
        display: inline;
      }

      @media (max-width: 63.99rem) {
        .home-story {
          height: auto !important;
          margin-top: 0 !important;
          opacity: 1 !important;
        }

        .home-story__sticky {
          height: auto !important;
          padding: 5rem 1rem 4rem !important;
          position: relative !important;
        }

        .home-story__sticky .home-story-image {
          display: none !important;
        }

        .home-story__sticky .grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 2.5rem !important;
          height: auto !important;
          left: auto !important;
          position: relative !important;
          padding: 0 !important;
          top: auto !important;
          width: 100% !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block] {
          font-size: 0.68rem !important;
          line-height: 0.86rem !important;
          max-width: calc(100vw - 1.5rem) !important;
          overflow-wrap: anywhere !important;
          padding-right: 0.5rem !important;
          width: 100% !important;
          word-break: break-word !important;
        }

        .nns-story-block,
        .nns-story-block__list,
        .nns-story-block__item {
          width: 100% !important;
        }

        .nns-story-block__title {
          margin-bottom: 0.75rem !important;
        }

        .nns-story-block__item + .nns-story-block__item {
          margin-top: 0.85rem !important;
        }

        .nns-story-block__item {
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .nns-story-block__label {
          display: block !important;
        }

        .nns-story-block__body {
          display: block !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block]:first-of-type,
        .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(2),
        .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(3) {
          grid-area: auto !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const renderStoryBlock = (block) => {
    const items = block.items
      .map((item) => {
        const [label, ...rest] = item.split(": ");
        const body = rest.join(": ");
        return `<li class="nns-story-block__item"><span class="nns-story-block__label">${label}:</span><span class="nns-story-block__body"> ${body}</span></li>`;
      })
      .join("");

    return `<div class="nns-story-block"><span class="nns-story-block__title">${block.title}</span><ul class="nns-story-block__list">${items}</ul></div>`;
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

  let canonicalRules = null;
  const normalizeRules = () => {
    const container = document.querySelector(".home-rules .home-rules__container");
    if (!container) return;

    const ruleNodes = Array.from(container.querySelectorAll(".home-rules__row p"));
    if (!ruleNodes.length) return;

    if (!canonicalRules) {
      canonicalRules = ruleNodes
        .map((node) => {
          const text = (node.textContent || "").trim();
          const match = text.match(/^\((\d+)\)\s*/);
          if (!match) return null;
          const number = Number(match[1]);
          let body = text.replace(/^\(\d+\)\s*/, "");
          body = body
            .replace(/the concrete club/gi, "New Nordic Studios")
            .replace(/concrete club/gi, "New Nordic Studios")
            .replace(/the new nordic/gi, "New Nordic Studios")
            .replace(/new nordic studios studios/gi, "New Nordic Studios")
            .replace(/\bartists\b/gi, "clients");
          return { number, body };
        })
        .filter(Boolean);
    }

    const selected = canonicalRules
      .filter((rule) => rule.number !== 3 && rule.number !== 6)
      .slice(0, 4);

    let rows = Array.from(container.querySelectorAll(".home-rules__row"));
    if (rows.length < 2) {
      const needed = 2 - rows.length;
      for (let i = 0; i < needed; i += 1) {
        const row = document.createElement("div");
        row.className = "home-rules__row";
        container.appendChild(row);
      }
      rows = Array.from(container.querySelectorAll(".home-rules__row"));
    }

    rows.forEach((row, idx) => {
      if (idx < 2) {
        row.innerHTML = "";
      } else {
        row.remove();
      }
    });

    selected.forEach((rule, idx) => {
      const row = rows[Math.floor(idx / 2)];
      if (!row) return;
      const p = document.createElement("p");
      p.textContent = "(" + (idx + 1) + ") " + rule.body;
      row.appendChild(p);
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
    const nodes = Array.from(document.querySelectorAll(".home-story__text"));
    if (nodes.length < STORY_BLOCKS.length) return;

    nodes.slice(0, STORY_BLOCKS.length).forEach((node, index) => {
      const html = renderStoryBlock(STORY_BLOCKS[index]);
      node.setAttribute("data-nns-story-block", "true");
      if (node.innerHTML !== html) node.innerHTML = html;
    });
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
      nav.innerHTML = "";

      const studioLink = document.createElement("a");
      studioLink.className = "header__link";
      studioLink.textContent = "Studio,";
      studioLink.setAttribute("href", "/");

      const contactLink = document.createElement("a");
      contactLink.className = "header__link";
      contactLink.textContent = "Contact";
      contactLink.setAttribute("href", "/contact");

      nav.appendChild(studioLink);
      nav.appendChild(contactLink);
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
          .replace(/\s*,?\s*blog\s*,?\s*/gi, ", ")
          .replace(/\s+,/g, ",")
          .replace(/,\s*,/g, ",")
          .replace(/,\s*$/, "")
          .replace(/\s{2,}/g, " ")
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
        .replace(/\s+/g, " ")
        .replace(/\./g, "");

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
    applyStoryLayoutStyles();
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
