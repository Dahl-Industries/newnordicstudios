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
  const MOBILE_BREAKPOINT_QUERY = "(max-width: 47.99rem)";

  const getNormalizedPath = () => {
    const rawPath = window.location.pathname || "/";
    return rawPath.endsWith("/") && rawPath !== "/" ? rawPath.slice(0, -1) : rawPath;
  };

  const isHomePage = () => getNormalizedPath() === "/";

  const isMobileViewport = () =>
    typeof window.matchMedia === "function" &&
    window.matchMedia(MOBILE_BREAKPOINT_QUERY).matches;

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

      .home-story {
        height: 220vh !important;
      }

      .home-projects {
        margin-top: 0 !important;
        position: relative !important;
        z-index: 6 !important;
      }

      .home-story__sticky {
        align-items: stretch !important;
      }

      .home-story__sticky .grid {
        height: 100% !important;
        left: 0 !important;
        padding:
          clamp(4.75rem, 9vh, 6.5rem)
          clamp(2rem, 3.25vw, 3.75rem)
          clamp(4.5rem, 11vh, 7rem) !important;
        width: 100% !important;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block] {
        align-items: flex-start !important;
        display: block !important;
        font-size: clamp(0.92rem, 0.89rem + 0.12vw, 1rem) !important;
        line-height: clamp(1.12rem, 1.06rem + 0.18vw, 1.24rem) !important;
        justify-self: start !important;
        max-width: min(24.5rem, 100%);
        padding: 0 !important;
        width: 100% !important;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block]:first-of-type {
        grid-area: 4 / 4 / auto / span 4;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(2) {
        grid-area: 7 / 8 / auto / span 4;
        justify-self: end !important;
      }

      .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(3) {
        grid-area: 10 / 4 / auto / span 5;
        max-width: min(26rem, 100%);
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
          padding:
            max(2.4rem, calc(env(safe-area-inset-top) + 1.1rem))
            0
            max(4.5rem, calc(env(safe-area-inset-bottom) + 2.9rem)) !important;
        }

        .home-story__sticky {
          height: auto !important;
          padding: 0 !important;
          position: relative !important;
        }

        .home-story__sticky .home-story-image {
          display: none !important;
        }

        .home-story__sticky .grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 2.35rem !important;
          height: auto !important;
          left: auto !important;
          position: relative !important;
          padding: 0 1.15rem !important;
          top: auto !important;
          width: 100% !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block] {
          font-size: 0.66rem !important;
          line-height: 0.94rem !important;
          max-width: min(17.5rem, calc(100vw - 2.3rem)) !important;
          overflow-wrap: anywhere !important;
          padding-right: 0 !important;
          width: 100% !important;
          word-break: break-word !important;
        }

        .nns-story-block,
        .nns-story-block__list,
        .nns-story-block__item {
          width: 100% !important;
        }

        .nns-story-block__title {
          margin-bottom: 0.85rem !important;
        }

        .nns-story-block__item + .nns-story-block__item {
          margin-top: 0.95rem !important;
        }

        .nns-story-block__item {
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .nns-story-block__list {
          padding-left: 1rem !important;
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

  const applyMobileAnimationStyles = () => {
    if (document.getElementById("nns-mobile-animation-style")) return;
    const style = document.createElement("style");
    style.id = "nns-mobile-animation-style";
    style.textContent = `
      @media (max-width: 47.99rem) {
        .page--index[data-v-2d54c737] {
          padding-bottom: 0 !important;
        }

        .intro {
          background: ${HERO_BACKGROUND} !important;
          background-color: ${HERO_BACKGROUND} !important;
          -webkit-clip-path: none !important;
          clip-path: none !important;
          height: 100dvh !important;
          min-height: 100dvh !important;
          inset: 0 0 auto 0 !important;
          opacity: var(--nns-mobile-hero-opacity, 1) !important;
          pointer-events: auto !important;
          position: fixed !important;
          width: 100% !important;
          will-change: opacity !important;
          z-index: 4 !important;
        }

        .intro__wrapper {
          background: ${HERO_BACKGROUND} !important;
          background-color: ${HERO_BACKGROUND} !important;
          display: block !important;
          height: 100dvh !important;
          min-height: 100dvh !important;
          padding: 0 !important;
          position: relative !important;
          top: auto !important;
          transform: none !important;
        }

        .intro__grid {
          display: none !important;
        }

        .intro__title {
          bottom: max(2.1rem, calc(env(safe-area-inset-bottom) + 1.15rem)) !important;
          font-size: clamp(3rem, 13.1vw, 4.35rem) !important;
          left: 0.875rem !important;
          letter-spacing: -0.045em !important;
          line-height: 0.9 !important;
          max-width: min(19.5rem, calc(100vw - 1.75rem)) !important;
          position: absolute !important;
          right: auto !important;
          top: auto !important;
          transform:
            translate3d(var(--nns-mobile-title-x, 0px), var(--nns-mobile-title-y, 0px), 0)
            scale(var(--nns-mobile-title-scale, 1)) !important;
          transform-origin: left bottom !important;
          will-change: transform !important;
          width: auto !important;
        }

        .intro__club {
          margin-top: 0.06em !important;
          transform: none !important;
        }

        .home-story {
          background: #212121 !important;
          background-color: #212121 !important;
          height: auto !important;
          margin-top: 100dvh !important;
          padding:
            max(2.4rem, calc(env(safe-area-inset-top) + 1.1rem))
            0
            max(4.85rem, calc(env(safe-area-inset-bottom) + 3.2rem)) !important;
          position: relative !important;
          z-index: 5 !important;
        }

        .home-projects {
          margin-top: 0 !important;
        }

        .home-story__sticky {
          background: transparent !important;
          background-color: transparent !important;
          height: auto !important;
          min-height: 0 !important;
          padding: 0 !important;
          position: relative !important;
          top: auto !important;
        }

        .home-story__sticky .home-story-image {
          display: none !important;
        }

        .home-story__sticky .grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 2.2rem !important;
          height: auto !important;
          left: auto !important;
          padding: 0 1.15rem !important;
          position: relative !important;
          top: auto !important;
          transform: none !important;
          width: 100% !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block] {
          font-size: 0.63rem !important;
          line-height: 0.93rem !important;
          max-width: min(16.85rem, calc(100vw - 2.3rem)) !important;
          overflow-wrap: anywhere !important;
          padding: 0 !important;
          width: 100% !important;
          word-break: break-word !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block]:first-of-type {
          margin-right: auto !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(2) {
          margin-left: auto !important;
        }

        .home-story__sticky .grid .home-story__text[data-nns-story-block]:nth-of-type(3) {
          margin-right: auto !important;
        }

        .nns-story-block {
          max-width: 16.85rem !important;
        }

        .nns-story-block__title {
          margin-bottom: 0.78rem !important;
        }

        .nns-story-block__list {
          padding-left: 0.95rem !important;
        }

        .nns-story-block__item + .nns-story-block__item {
          margin-top: 0.92rem !important;
        }

        .nns-story-block__label,
        .nns-story-block__body {
          display: block !important;
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
    if (!isHomePage()) return;

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

  const maintainMobileHeroPalette = () => {
    if (window.__nnsMobileHeroPaletteBound) {
      window.__nnsRequestMobileHeroSync?.();
      return;
    }

    const clearMobileTitleOverrides = () => {
      const title = document.querySelector(".intro__title");
      const club = document.querySelector(".intro__club");
      if (title) {
        title.style.removeProperty("transform");
      }
      if (club) {
        club.style.removeProperty("margin-left");
        club.style.removeProperty("transform");
        club.style.removeProperty("translate");
      }
    };

    const applyMobileTitleState = ({ shiftX = 0, shiftY = 0, scale = 1, opacity = 1 } = {}) => {
      document.documentElement.style.setProperty("--nns-mobile-title-x", shiftX + "px");
      document.documentElement.style.setProperty("--nns-mobile-title-y", shiftY + "px");
      document.documentElement.style.setProperty("--nns-mobile-title-scale", String(scale));
      document.documentElement.style.setProperty("--nns-mobile-hero-opacity", String(opacity));

      const title = document.querySelector(".intro__title");
      const club = document.querySelector(".intro__club");
      if (title) {
        title.style.setProperty(
          "transform",
          `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${scale})`,
          "important",
        );
      }
      if (club) {
        club.style.setProperty("margin-left", "0", "important");
        club.style.setProperty("transform", "none", "important");
        club.style.setProperty("translate", "none", "important");
      }
    };

    const resetMobileHeroMotion = ({ clearOverrides = false } = {}) => {
      applyMobileTitleState();
      window.__nnsMobileTitleMetrics = null;
      if (clearOverrides) clearMobileTitleOverrides();
    };

    const syncMobileTitleMotion = () => {
      if (!isHomePage() || !isMobileViewport()) {
        resetMobileHeroMotion({ clearOverrides: true });
        return;
      }

      const title = document.querySelector(".intro__title");
      if (!title) return;

      const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const cached = window.__nnsMobileTitleMetrics;

      if (
        !cached ||
        cached.viewportWidth !== viewportWidth ||
        cached.viewportHeight !== viewportHeight
      ) {
        const titleLeft = title.offsetLeft || Math.round(title.getBoundingClientRect().left);
        const titleWidth = title.offsetWidth || Math.round(title.getBoundingClientRect().width);
        const maxShiftX = Math.min(
          Math.round(viewportWidth * 0.38),
          Math.max(0, viewportWidth - titleLeft - titleWidth + Math.round(viewportWidth * 0.06)),
        );
        const maxShiftY = Math.min(72, Math.round(viewportHeight * 0.12));
        window.__nnsMobileTitleMetrics = {
          maxShiftX,
          maxShiftY,
          viewportHeight,
          viewportWidth,
        };
      }

      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const topResetZone = Math.max(12, Math.round(viewportHeight * 0.018));
      if (y <= topResetZone) {
        resetMobileHeroMotion();
        return;
      }

      const effectiveY = Math.max(0, y - topResetZone);
      const progress = Math.max(
        0,
        Math.min(effectiveY / Math.max((viewportHeight || 1) - topResetZone, 1), 1),
      );
      const shiftX = (window.__nnsMobileTitleMetrics?.maxShiftX || 0) * progress;
      const shiftY = -(window.__nnsMobileTitleMetrics?.maxShiftY || 0) * progress;
      const scale = 1 - progress * 0.045;
      const opacity = 1 - progress * 0.08;

      applyMobileTitleState({ shiftX, shiftY, scale, opacity });
    };

    const syncPalette = () => {
      if (isHomePage() && isMobileViewport()) {
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        if (y <= window.innerHeight * 1.15) {
          forceHeroPalette();
        }
      }

      syncMobileTitleMotion();
    };

    const requestSync = () => {
      if (window.__nnsMobileHeroPaletteFrame) return;
      window.__nnsMobileHeroPaletteFrame = window.requestAnimationFrame(() => {
        window.__nnsMobileHeroPaletteFrame = 0;
        syncPalette();
      });
    };

    window.addEventListener("scroll", requestSync, { passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    window.addEventListener("orientationchange", requestSync);
    window.__nnsMobileHeroPaletteBound = true;
    window.__nnsRequestMobileHeroSync = requestSync;
    requestSync();
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
    applyMobileAnimationStyles();
    forceHeroPalette();
    maintainMobileHeroPalette();
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
    const runMaintenance = () => {
      applyText(document.body);
      keepOnlyFirstProjectsPage();
      makeClientCardsStatic();
      forceClientCardImages();
      toggleHomeIntroOverlayLabel();
      forceStoryParagraphs();
      normalizeRules();
      forceFixedLabels();
      forceHeroPalette();
      maintainMobileHeroPalette();
    };

    // Keep this lightweight so we do not interfere with Nuxt hydration/render timing.
    applyAll();
    setTimeout(() => applyAll(), 800);
    setTimeout(() => applyAll(), 2000);
    setTimeout(() => applyAll(), 3500);
    if (!window.__nnsOverlayLabelScrollBound) {
      window.addEventListener("scroll", toggleHomeIntroOverlayLabel, { passive: true });
      window.__nnsOverlayLabelScrollBound = true;
    }

    if (!window.__nnsMaintenanceBound) {
      const scheduleMaintenance = () => {
        if (window.__nnsMaintenanceScheduled) return;
        window.__nnsMaintenanceScheduled = window.requestAnimationFrame(() => {
          window.__nnsMaintenanceScheduled = 0;
          runMaintenance();
        });
      };

      const observer = new MutationObserver(scheduleMaintenance);
      observer.observe(document.body, {
        characterData: true,
        childList: true,
        subtree: true,
      });

      window.__nnsMaintenanceObserver = observer;
      window.__nnsMaintenanceBound = true;
      window.__nnsScheduleMaintenance = scheduleMaintenance;
    }

    window.__nnsScheduleMaintenance?.();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
