(() => {
  const root = document.documentElement;
  const body = document.body;
  const pageShell = document.querySelector(".page");
  const skipLink = document.querySelector(".skip-link");
  const canvas = document.getElementById("magicCanvas");
  const screenCtx = canvas.getContext("2d", { alpha: true });
  let ctx = screenCtx;
  const backgroundCache = document.createElement("canvas");
  const backgroundCacheCtx = backgroundCache.getContext("2d", { alpha: true });
  const themeToggle = document.getElementById("themeToggle");
  const themeState = document.getElementById("themeState");
  const magicState = document.getElementById("magicState");
  const qualityState = document.getElementById("qualityState");
  const modePill = document.getElementById("modePill");
  const pauseMagic = document.getElementById("pauseMagic");
  const lowMotion = document.getElementById("lowMotion");
  const disableMagic = document.getElementById("disableMagic");
  const successBadge = document.getElementById("successBadge");
  const toast = document.getElementById("toast");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const contactModal = document.getElementById("contactModal");
  const closeContact = document.getElementById("closeContact");
  const contactForm = document.getElementById("contactForm");
  const copyContactMessage = document.getElementById("copyContactMessage");
  const contactDraftStatus = document.getElementById("contactDraftStatus");
  const clearContactDraft = document.getElementById("clearContactDraft");
  const promoHuntToggle = document.getElementById("promoHuntToggle");
  const careersModal = document.getElementById("careersModal");
  const closeCareers = document.getElementById("closeCareers");
  const pressModal = document.getElementById("pressModal");
  const closePress = document.getElementById("closePress");
  const privacyModal = document.getElementById("privacyModal");
  const closePrivacy = document.getElementById("closePrivacy");
  const legalModal = document.getElementById("legalModal");
  const closeLegal = document.getElementById("closeLegal");
  const assetModal = document.getElementById("assetModal");
  const closeAsset = document.getElementById("closeAsset");
  const securityModal = document.getElementById("securityModal");
  const closeSecurity = document.getElementById("closeSecurity");
  const gameModal = document.getElementById("gameModal");
  const gameDialog = document.getElementById("gameDialog");
  const closeGame = document.getElementById("closeGame");
  const dismissGame = document.getElementById("dismissGame");
  const gameModalTitle = document.getElementById("gameModalTitle");
  const gameModalGenre = document.getElementById("gameModalGenre");
  const gameModalStatus = document.getElementById("gameModalStatus");
  const gameModalCopy = document.getElementById("gameModalCopy");
  const gameModalTags = document.getElementById("gameModalTags");
  const gameModalPillars = document.getElementById("gameModalPillars");
  const secretModal = document.getElementById("secretModal");
  const closeSecret = document.getElementById("closeSecret");
  const dismissSecret = document.getElementById("dismissSecret");
  const secretTitle = document.getElementById("secretTitle");
  const secretMessage = document.getElementById("secretMessage");
  const claimSecret = document.getElementById("claimSecret");
  const metaThemeColor = document.getElementById("metaThemeColor");
  const contactDraftKey = "willow-contact-draft";
  let contactDraftTimer = 0;
  const mascotImage = new Image();
  const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const colorSchemeLightQuery = window.matchMedia("(prefers-color-scheme: light)");
  const savedTheme = (() => {
    try {
      const theme = localStorage.getItem("willow-theme");
      return theme === "dark" || theme === "light" ? theme : null;
    } catch (error) {
      return null;
    }
  })();
  function timeBasedThemeFallback() {
    const hour = new Date().getHours();
    if (!Number.isFinite(hour)) return "dark";
    return hour >= 7 && hour < 19 ? "light" : "dark";
  }

  function resolveInitialTheme() {
    if (savedTheme) return savedTheme;
    if (colorSchemeQuery.matches) return "dark";
    if (colorSchemeLightQuery.matches) return "light";
    return timeBasedThemeFallback() || "dark";
  }

  const initialTheme = resolveInitialTheme();

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    time: 0,
    running: true,
    paused: false,
    disabled: false,
    lowMotion: false,
    lowData: false,
    playMode: false,
    completed: false,
    inactive: false,
    theme: initialTheme,
    quality: "Auto",
    particleCount: 70,
    pointer: { x: window.innerWidth * 0.58, y: window.innerHeight * 0.42, active: false, lastMove: 0, lastTrail: 0 },
    clickBursts: [],
    trails: [],
    particles: [],
    backgroundStars: [],
    cat: {
      x: window.innerWidth * 0.16,
      y: window.innerHeight * 0.74,
      targetX: window.innerWidth * 0.16,
      targetY: window.innerHeight * 0.74,
      homeX: window.innerWidth * 0.82,
      homeY: window.innerHeight * 0.76,
      eyeX: 0,
      eyeY: 0,
      headTilt: 0,
      cast: 0,
      blink: 0,
      nextBlink: 130,
      sleepTimer: 0,
      sleep: false,
      ready: false
    },
    connected: [],
    nextStar: 0,
    autoLineProgress: 0,
    lastFrame: performance.now(),
    lastDraw: 0,
    backgroundCacheKey: "",
    fpsScore: 60,
    rafId: null
  };

  const constellation = [
    { x: 0.12, y: 0.28 }, { x: 0.16, y: 0.62 }, { x: 0.22, y: 0.38 }, { x: 0.28, y: 0.62 }, { x: 0.32, y: 0.28 },
    { x: 0.40, y: 0.28 }, { x: 0.44, y: 0.62 }, { x: 0.50, y: 0.38 }, { x: 0.56, y: 0.62 }, { x: 0.60, y: 0.28 }
  ];

  const gameProfiles = {
    nature: {
      title: "Nature Seed",
      genre: "Draw-to-Solve Physics Puzzle",
      status: "Playable Vertical Prototype",
      copy: "A meditative mobile physics puzzle about drawing limited lines that become solid objects. Shape a safe route, bring the Water Drop and Seed together, and solve ten handcrafted vertical levels with as little ink as possible.",
      tags: ["Mobile", "Draw-to-Solve", "Line Physics", "10 Levels", "Relaxing Puzzle"],
      pillars: [
        "Draw a constrained physical route with a strict ink and line budget.",
        "Bring the Water Drop and Seed characters together through readable cause and effect.",
        "Replay compact levels to earn the best efficiency rating with fewer lines."
      ]
    },
    candy: {
      title: "Candy Shop",
      genre: "Casual Merge Puzzle",
      status: "Active Development",
      copy: "A cozy physics-based merge puzzle with a 13-stage candy chain, ten gameplay containers and eight special candy effects. Plan the next three drops, hold a piece and manage the shape of each container before the stack reaches the top.",
      tags: ["Mobile", "Candy Merge", "10 Containers", "8 Effects", "Cozy Game"],
      pillars: [
        "Read the landing preview and next-three queue before every drop.",
        "Merge matching pieces through a 13-stage chain toward the largest candy.",
        "Adapt to ten container rulesets and eight special effect families."
      ]
    },
    paint: {
      title: "Paint Blasters",
      genre: "Physics Puzzle / Arcade Hybrid",
      status: "Production Prototype",
      copy: "A color-destruction physics prototype where players assemble one of 35 projectile recipes, read seven block archetypes and dismantle a five-floor active tower through precise chain reactions.",
      tags: ["Mobile", "35 Recipes", "7 Block Types", "Physics Arcade", "Chain Reactions"],
      pillars: [
        "Combine three color ingredients into one of 35 defined projectile behaviors.",
        "Read seven block archetypes, structural weak points and reaction opportunities.",
        "Turn one deliberate shot into a colorful physics collapse across the active tower."
      ]
    },
    ball: {
      title: "Ball is God?!",
      genre: "Hardcore Arcade",
      status: "Active Production",
      copy: "A hardcore vertical tower arcade where horizontal drag rotates the world around the auto-falling Espa. Thread three platform gaps to trigger a combo smash, deploy a cooldown shield against lethal hits and let Karma reshape ten distinct locations.",
      tags: ["Mobile", "Tower Rotation", "Combo Smash", "Karma System", "10 Locations"],
      pillars: [
        "Rotate each tower with horizontal drag while Espa keeps falling and jumping.",
        "Skip three platforms to earn a smash, or spend the shield to survive a lethal mistake.",
        "Let Light, Neutral or Dark Karma alter telegraphs, aggression, bosses and story choices."
      ]
    }
  };

  const gameSecretRewards = [
    {
      key: "ball",
      phrase: "Ball is God?!",
      title: "Ball is God?! promo word found",
      message: "You found the hidden Ball is God?! word. Promo codes are issued manually by WillowinWorld after a claim review."
    },
    {
      key: "candy",
      phrase: "Candy Shop",
      title: "Candy Shop promo word found",
      message: "You found the hidden Candy Shop word. Promo codes are issued manually by WillowinWorld after a claim review."
    },
    {
      key: "paint",
      phrase: "Paint Blasters",
      title: "Paint Blasters promo word found",
      message: "You found the hidden Paint Blasters word. Promo codes are issued manually by WillowinWorld after a claim review."
    },
    {
      key: "seed",
      phrase: "Nature Seed",
      title: "Nature Seed promo word found",
      message: "You found the hidden Nature Seed word. Promo codes are issued manually by WillowinWorld after a claim review."
    }
  ].map(secret => ({
    ...secret,
    letters: secret.phrase.replace(/[^a-z]/gi, "").split(""),
    found: new Set(),
    rewarded: false
  }));

  const secretRewards = [gameSecretRewards[Math.floor(Math.random() * gameSecretRewards.length)]];

  const sectionSecretSpots = [
    [4, 14], [96, 16], [5, 32], [95, 36], [6, 50], [94, 54],
    [8, 70], [92, 74], [11, 88], [89, 92], [18, 7], [82, 8],
    [18, 96], [82, 96], [3, 84], [97, 86], [9, 60], [91, 62]
  ];

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection && connection.saveData);
  const slowNetwork = Boolean(connection && /(^slow-2g$|^2g$|^3g$)/i.test(connection.effectiveType || ""));
  const smallScreen = window.matchMedia("(max-width: 640px)").matches;

  state.lowData = saveData || slowNetwork;

  if (prefersReduced) {
    state.lowMotion = true;
    state.quality = "Low";
    body.classList.add("low-motion");
  }

  if (state.lowData) {
    state.quality = "Low";
    body.classList.add("low-data");
  }

  if (smallScreen) {
    state.particleCount = 24;
  } else if (state.lowMotion || state.lowData) {
    state.particleCount = 18;
  }

  body.setAttribute("data-theme", initialTheme);
  root.style.colorScheme = initialTheme === "dark" ? "dark" : "light";
  if (metaThemeColor) metaThemeColor.content = initialTheme === "dark" ? "#031735" : "#fcfff2";

  const cssCache = new Map();
  const cachedCssVariables = [
    "--moon",
    "--muted",
    "--cyan",
    "--green",
    "--gold",
    "--rose",
    "--violet",
    "--blue"
  ];

  function refreshCssCache() {
    const styles = getComputedStyle(body);
    cssCache.clear();
    cachedCssVariables.forEach(name => cssCache.set(name, styles.getPropertyValue(name).trim()));
  }

  function css(name) {
    return cssCache.get(name) || getComputedStyle(body).getPropertyValue(name).trim();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function getContactDraft() {
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const type = String(formData.get("type") || "General").trim();
    const message = String(formData.get("message") || "").trim();
    const subject = type + " inquiry from " + (name || "WillowinWorld visitor");
    const body =
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Inquiry type: " + type + "\n\n" +
      message;
    return {
      href: "mailto:contact@willowinworld.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body),
      plainText: "To: contact@willowinworld.com\nSubject: " + subject + "\n\n" + body
    };
  }

  function setContactDraftStatus(message) {
    if (contactDraftStatus) contactDraftStatus.textContent = message;
  }

  function readContactDraft() {
    try {
      const saved = sessionStorage.getItem(contactDraftKey);
      if (!saved) return null;
      const draft = JSON.parse(saved);
      return draft && typeof draft === "object" ? draft : null;
    } catch (error) {
      return null;
    }
  }

  function persistContactDraft() {
    window.clearTimeout(contactDraftTimer);
    const formData = new FormData(contactForm);
    const draft = {
      name: String(formData.get("name") || "").slice(0, 80),
      email: String(formData.get("email") || "").slice(0, 120),
      type: String(formData.get("type") || "General"),
      message: String(formData.get("message") || "").slice(0, 1200)
    };
    const hasContent = Boolean(draft.name.trim() || draft.email.trim() || draft.message.trim() || draft.type !== "General");
    try {
      if (hasContent) {
        sessionStorage.setItem(contactDraftKey, JSON.stringify(draft));
        setContactDraftStatus("Draft saved in this browser tab.");
      } else {
        sessionStorage.removeItem(contactDraftKey);
        setContactDraftStatus("Draft stays in this browser tab while you work.");
      }
    } catch (error) {
      setContactDraftStatus("Draft is available until this page closes.");
    }
  }

  function scheduleContactDraft() {
    window.clearTimeout(contactDraftTimer);
    contactDraftTimer = window.setTimeout(persistContactDraft, 220);
  }

  function restoreContactDraft() {
    const draft = readContactDraft();
    if (!draft) return;
    ["name", "email", "type", "message"].forEach(fieldName => {
      const field = contactForm.elements.namedItem(fieldName);
      if (!field || typeof draft[fieldName] !== "string") return;
      if (fieldName === "type" && ![...field.options].some(option => option.value === draft[fieldName])) return;
      field.value = draft[fieldName];
    });
    setContactDraftStatus("Draft restored from this browser tab.");
  }

  function resetContactDraft() {
    window.clearTimeout(contactDraftTimer);
    contactForm.reset();
    try {
      sessionStorage.removeItem(contactDraftKey);
    } catch (error) {
      // The form still clears when storage is unavailable.
    }
    setContactDraftStatus("Draft cleared. New text will save in this tab.");
    const nameField = contactForm.elements.namedItem("name");
    if (nameField) nameField.focus();
  }

  async function copyText(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("aria-hidden", "true");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    fallback.style.pointerEvents = "none";
    document.body.append(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    if (!copied) throw new Error("Clipboard copy was rejected.");
  }

  function updateLabels() {
    if (magicState) magicState.textContent = state.disabled ? "Static" : state.playMode ? "Play" : state.paused ? "Paused" : state.lowMotion || state.lowData ? "Low" : "Ambient";
    if (qualityState) qualityState.textContent = state.quality;
    if (modePill) modePill.textContent = state.disabled ? "STATIC" : state.lowMotion || state.lowData ? "LOW" : state.playMode ? "PLAY" : "AUTO";
    if (themeState) themeState.textContent = state.theme === "dark" ? "Night Magic" : "Daylight";
    if (pauseMagic) pauseMagic.textContent = state.paused ? "Resume Magic" : "Pause Magic";
    if (lowMotion) lowMotion.textContent = state.lowMotion ? "Full Magic" : "Low Motion";
    if (disableMagic) disableMagic.textContent = state.disabled ? "Enable Magic" : "Disable Magic";
  }

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    const maxDpr = state.lowMotion || state.lowData ? 1.2 : state.width < 760 ? 1.15 : state.width > 1760 || state.height > 980 ? 1.45 : 1.65;
    state.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    canvas.style.width = state.width + "px";
    canvas.style.height = state.height + "px";
    backgroundCache.width = canvas.width;
    backgroundCache.height = canvas.height;
    screenCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    backgroundCacheCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    state.backgroundCacheKey = "";
    seedScene();
    placeCat();
  }

  function targetFrameInterval() {
    if (state.lowMotion || state.lowData) return 1000 / 31;
    if (state.width < 760 || state.height < 620) return 1000 / 31;
    return 0;
  }

  function seedScene() {
    const compact = state.width < 760;
    const nightCount = state.lowMotion ? 34 : compact ? 38 : 92;
    const dayCount = state.lowMotion ? 18 : compact ? 24 : 48;
    const starCount = state.theme === "dark" ? nightCount : dayCount;
    state.backgroundStars = Array.from({ length: starCount }, (_, i) => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height * 0.9,
      r: 0.8 + Math.random() * 1.7,
      twinkle: Math.random() * Math.PI * 2,
      depth: 0.25 + Math.random() * 0.75,
      repel: 0
    }));

    state.particles = Array.from({ length: state.particleCount }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.08 - Math.random() * 0.18,
      r: 1 + Math.random() * 2.4,
      hue: Math.random()
    }));
  }

  function scenePoint(star) {
    const isMobile = state.width < 700;
    const scale = Math.min(state.width, state.height) * (isMobile ? 0.78 : 0.7);
    const left = isMobile ? state.width * 0.17 : state.width * 0.56;
    const top = isMobile ? state.height * 0.16 : state.height * 0.15;
    return {
      x: left + star.x * scale,
      y: top + star.y * scale
    };
  }

  function drawCloudBank(clouds, fill, shade) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.beginPath();
    clouds.forEach(([x, y, r], index) => {
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (index === clouds.length - 1) ctx.closePath();
    });
    ctx.fill();
    if (shade) {
      ctx.globalAlpha = 0.44;
      ctx.strokeStyle = shade;
      ctx.lineWidth = Math.max(10, state.width * 0.012);
      ctx.lineCap = "round";
      ctx.beginPath();
      clouds.forEach(([x, y, r], index) => {
        if (!index) ctx.moveTo(x - r * 0.62, y + r * 0.18);
        ctx.quadraticCurveTo(x, y - r * 0.34, x + r * 0.72, y + r * 0.22);
      });
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawStorybookArches(w, h, dark) {
    const paper = dark ? "rgba(226,246,239,0.34)" : "rgba(255,254,232,0.88)";
    const wash = dark ? "rgba(71,177,224,0.22)" : "rgba(49,190,231,0.34)";
    const bands = [
      [-w * 0.24, h * 0.56, w * 0.04, h * 0.02, w * 0.25, -h * 0.05, w * 0.5, h * 0.34],
      [w * 0.18, h * 0.22, w * 0.34, -h * 0.18, w * 0.62, -h * 0.04, w * 0.9, h * 0.34],
      [w * 0.56, h * 0.5, w * 0.66, h * 0.08, w * 0.94, h * 0.08, w * 1.16, h * 0.5]
    ];

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    bands.forEach((band, i) => {
      ctx.beginPath();
      ctx.moveTo(band[0], band[1]);
      ctx.bezierCurveTo(band[2], band[3], band[4], band[5], band[6], band[7]);
      ctx.strokeStyle = wash;
      ctx.lineWidth = Math.max(64, w * (0.09 - i * 0.012));
      ctx.stroke();
      ctx.strokeStyle = paper;
      ctx.lineWidth = Math.max(24, w * (0.034 - i * 0.003));
      ctx.globalAlpha = i === 1 ? 0.74 : 0.92;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  }

  function drawStorybookClouds(w, h, dark) {
    const cloud = dark ? "rgba(231,246,239,0.38)" : "rgba(255,254,235,0.92)";
    const tint = dark ? "rgba(83,191,232,0.32)" : "rgba(104,214,243,0.4)";
    drawCloudBank([
      [-w * 0.03, h * 0.18, w * 0.13],
      [w * 0.08, h * 0.22, w * 0.12],
      [w * 0.16, h * 0.32, w * 0.14],
      [w * 0.03, h * 0.4, w * 0.16]
    ], cloud, tint);
    drawCloudBank([
      [w * 1.01, h * 0.15, w * 0.13],
      [w * 0.9, h * 0.2, w * 0.12],
      [w * 0.82, h * 0.32, w * 0.15],
      [w * 0.98, h * 0.4, w * 0.17]
    ], cloud, tint);
  }

  function drawHillLayer(w, h, base, fill, lift, phase) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, h + 20);
    ctx.lineTo(-w * 0.08, base);
    for (let x = -w * 0.08; x <= w * 1.12; x += w * 0.12) {
      const roll = Math.sin(x * 0.008 + phase) * lift;
      ctx.quadraticCurveTo(x + w * 0.06, base - lift - roll, x + w * 0.12, base + roll * 0.32);
    }
    ctx.lineTo(w * 1.12, h + 20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawStreamPath(w, h, stroke, width, offset) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(-w * 0.16, h * (0.92 + offset));
    ctx.bezierCurveTo(w * 0.12, h * (0.64 + offset), w * 0.28, h * (1.03 + offset), w * 0.48, h * (0.84 + offset));
    ctx.bezierCurveTo(w * 0.64, h * (0.68 + offset), w * 0.82, h * (1.03 + offset), w * 1.18, h * (0.76 + offset));
    ctx.stroke();
    ctx.restore();
  }

  function drawPaintedValley(w, h, dark, now) {
    const sway = state.lowMotion ? 0 : Math.sin(now * 0.00024) * 0.01;
    drawHillLayer(w, h, h * 0.72, dark ? "rgba(8,91,137,0.4)" : "rgba(125,221,186,0.54)", h * 0.13, 0.3);
    drawHillLayer(w, h, h * 0.79, dark ? "rgba(4,66,115,0.62)" : "rgba(20,181,188,0.54)", h * 0.11, 1.6);
    drawHillLayer(w, h, h * 0.88, dark ? "rgba(1,42,88,0.84)" : "rgba(25,137,209,0.64)", h * 0.095, 2.7);
    drawStreamPath(w, h, dark ? "rgba(6,125,190,0.48)" : "rgba(20,165,221,0.56)", Math.max(90, w * 0.11), sway);
    drawStreamPath(w, h, dark ? "rgba(225,246,239,0.78)" : "rgba(255,254,231,0.94)", Math.max(24, w * 0.032), sway);
    drawStreamPath(w, h, dark ? "rgba(95,206,241,0.34)" : "rgba(83,200,235,0.4)", Math.max(8, w * 0.011), sway + 0.028);
  }

  function drawWillowLeaf(x, y, rx, ry, angle, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawWillowFrame(w, h, dark) {
    const bark = dark ? "rgba(1,21,53,0.86)" : "rgba(65,107,83,0.58)";
    const leaves = dark
      ? ["rgba(3,42,82,0.94)", "rgba(67,152,164,0.58)", "rgba(146,228,142,0.34)"]
      : ["rgba(31,161,116,0.76)", "rgba(113,202,79,0.72)", "rgba(7,160,168,0.58)"];
    ctx.save();
    ctx.strokeStyle = bark;
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(8, w * 0.012);
    ctx.beginPath();
    ctx.moveTo(w * 1.06, -h * 0.08);
    ctx.bezierCurveTo(w * 0.94, h * 0.08, w * 0.96, h * 0.24, w * 0.83, h * 0.5);
    ctx.stroke();
    ctx.lineWidth *= 0.48;
    [[0.96,0.11,0.86,0.16],[0.94,0.22,0.82,0.28],[0.89,0.34,0.78,0.38],[0.09,0.98,0.13,0.77]].forEach(([ax, ay, bx, by]) => {
      ctx.beginPath();
      ctx.moveTo(w * ax, h * ay);
      ctx.quadraticCurveTo(w * ((ax + bx) * 0.5), h * (ay - 0.035), w * bx, h * by);
      ctx.stroke();
    });
    ctx.restore();

    [
      [0.89,0.15,-0.8,0], [0.83,0.18,0.66,1], [0.86,0.28,-0.7,2], [0.79,0.31,0.72,0],
      [0.83,0.39,-0.66,1], [0.76,0.4,0.66,2], [0.06,0.9,-0.56,0], [0.11,0.82,0.4,1],
      [0.14,0.91,0.82,2], [0.18,0.78,-0.32,0]
    ].forEach(([x, y, a, color], i) => {
      const scale = Math.max(0.76, Math.min(1.24, w / 1240));
      drawWillowLeaf(w * x, h * y, (10 + i % 3 * 3) * scale, (28 + i % 4 * 5) * scale, a, leaves[color]);
    });
  }

  function drawBackground(now, options = {}) {
    const drawDynamicLeaves = options.dynamicLeaves !== false;
    const w = state.width;
    const h = state.height;
    const dark = state.theme === "dark";
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    if (dark) {
      sky.addColorStop(0, "rgba(7, 17, 31, 0.92)");
      sky.addColorStop(0.58, "rgba(11, 28, 53, 0.60)");
      sky.addColorStop(1, "rgba(6, 12, 22, 0.94)");
    } else {
      sky.addColorStop(0, "rgba(255, 247, 220, 0.88)");
      sky.addColorStop(0.46, "rgba(232, 247, 255, 0.72)");
      sky.addColorStop(1, "rgba(241, 251, 236, 0.88)");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    drawStorybookArches(w, h, dark);
    drawStorybookClouds(w, h, dark);

    const orbX = w * 0.78;
    const orbY = h * 0.16;
    const orbR = Math.max(44, Math.min(88, w * 0.065));
    if (dark) {
      const moonGlow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR * 4.4);
      moonGlow.addColorStop(0, "rgba(223,245,255,0.34)");
      moonGlow.addColorStop(0.36, "rgba(113,231,255,0.11)");
      moonGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR * 4.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(238, 249, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(7, 17, 31, 0.22)";
      ctx.beginPath();
      ctx.arc(orbX + orbR * 0.28, orbY - orbR * 0.12, orbR * 0.94, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const sunGlow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR * 4.8);
      sunGlow.addColorStop(0, "rgba(255,255,255,0.72)");
      sunGlow.addColorStop(0.28, "rgba(255,211,110,0.34)");
      sunGlow.addColorStop(1, "rgba(255,211,110,0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR * 4.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(orbX, orbY);
      ctx.rotate(now * 0.00008);
      ctx.strokeStyle = "rgba(255, 190, 74, 0.28)";
      ctx.lineWidth = 3;
      for (let i = 0; i < 18; i++) {
        const a = (Math.PI * 2 * i) / 18;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (orbR + 16), Math.sin(a) * (orbR + 16));
        ctx.lineTo(Math.cos(a) * (orbR + 38), Math.sin(a) * (orbR + 38));
        ctx.stroke();
      }
      ctx.restore();

      const sunBody = ctx.createRadialGradient(orbX - orbR * 0.25, orbY - orbR * 0.25, 0, orbX, orbY, orbR);
      sunBody.addColorStop(0, "#fff8cf");
      sunBody.addColorStop(0.45, "#ffd36e");
      sunBody.addColorStop(1, "#f2a83b");
      ctx.fillStyle = sunBody;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
      ctx.fill();
    }

    drawCastle(w, h, dark);
    drawPaintedValley(w, h, dark, now);
    drawWillowFrame(w, h, dark);
    if (drawDynamicLeaves) drawWillowLeaves(now, dark);
  }

  function drawCachedBackground(now) {
    const cacheKey = [
      state.width,
      state.height,
      state.dpr,
      state.theme,
      state.lowMotion ? "low" : "full"
    ].join(":");

    if (state.backgroundCacheKey !== cacheKey) {
      ctx = backgroundCacheCtx;
      backgroundCacheCtx.clearRect(0, 0, state.width, state.height);
      drawBackground(now, { dynamicLeaves: false });
      ctx = screenCtx;
      state.backgroundCacheKey = cacheKey;
    }

    screenCtx.drawImage(backgroundCache, 0, 0, state.width, state.height);
    drawWillowLeaves(now, state.theme === "dark");
  }

  function drawCastle(w, h, dark) {
    const baseY = h * 0.77;
    const x = w * (w < 700 ? 0.72 : 0.78);
    const scale = Math.min(1.18, Math.max(0.62, w / 1160));
    ctx.save();
    ctx.translate(x, baseY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = dark ? 0.46 : 0.42;
    ctx.fillStyle = dark ? "#07518a" : "#168ce0";
    ctx.strokeStyle = dark ? "rgba(229,247,239,0.12)" : "rgba(255,254,232,0.24)";
    ctx.lineWidth = 4;
    const towers = [
      [-158, -144, 44, 144],
      [-92, -254, 72, 254],
      [10, -182, 54, 182],
      [88, -118, 42, 118]
    ];
    towers.forEach(([tx, ty, tw, th], i) => {
      ctx.fillRect(tx, ty, tw, th);
      ctx.strokeRect(tx, ty, tw, th);
      ctx.beginPath();
      ctx.moveTo(tx - 14, ty);
      ctx.lineTo(tx + tw / 2, ty - (i === 1 ? 72 : 52));
      ctx.lineTo(tx + tw + 14, ty);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tx + tw * 0.5, ty - (i === 1 ? 70 : 51));
      ctx.lineTo(tx + tw * 0.5, ty - (i === 1 ? 108 : 82));
      ctx.quadraticCurveTo(tx + tw * 0.74, ty - (i === 1 ? 101 : 77), tx + tw * 0.92, ty - (i === 1 ? 89 : 66));
      ctx.lineTo(tx + tw * 0.5, ty - (i === 1 ? 88 : 65));
      ctx.closePath();
      ctx.fillStyle = dark ? "rgba(3,23,53,0.92)" : "rgba(7,93,163,0.7)";
      ctx.fill();
      ctx.fillStyle = dark ? "#07518a" : "#168ce0";
    });
    ctx.fillRect(-176, -92, 316, 92);
    ctx.strokeRect(-176, -92, 316, 92);
    ctx.globalAlpha = dark ? 0.24 : 0.3;
    ctx.fillStyle = dark ? "rgba(255,248,223,0.7)" : "rgba(255,254,232,0.86)";
    for (let i = 0; i < 7; i += 1) {
      const wx = -138 + i * 42;
      ctx.beginPath();
      ctx.moveTo(wx, -30);
      ctx.lineTo(wx, -57);
      ctx.quadraticCurveTo(wx + 7, -70, wx + 14, -57);
      ctx.lineTo(wx + 14, -30);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawWillowLeaves(now, dark) {
    const count = state.lowMotion ? 8 : 18;
    ctx.save();
    for (let i = 0; i < count; i++) {
      const t = now * 0.00008 + i * 1.73;
      const x = ((i * 173 + Math.sin(t) * 24 + now * 0.006) % (state.width + 120)) - 60;
      const y = state.height * (0.22 + ((i * 37) % 66) / 100) + Math.cos(t * 1.7) * 16;
      ctx.translate(x, y);
      ctx.rotate(Math.sin(t) * 0.9);
      ctx.globalAlpha = dark ? 0.16 : 0.2;
      ctx.fillStyle = i % 3 === 0 ? css("--green") : css("--cyan");
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 14, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    }
    ctx.restore();
  }

  function drawGrass(now, dark) {
    const bladeCount = state.lowMotion ? 34 : Math.min(120, Math.floor(state.width / 11));
    const baseY = state.height + 8;
    ctx.save();
    for (let i = 0; i < bladeCount; i++) {
      const x = (i / bladeCount) * state.width + Math.sin(i * 18.2) * 8;
      const height = 28 + (i % 7) * 5 + Math.sin(now * 0.001 + i) * 5;
      const sway = Math.sin(now * 0.0014 + i * 0.6) * (dark ? 5 : 7);
      ctx.strokeStyle = dark ? "rgba(23, 71, 51, 0.38)" : "rgba(79, 157, 89, 0.44)";
      ctx.lineWidth = 1.4 + (i % 3) * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.quadraticCurveTo(x + sway * 0.35, baseY - height * 0.55, x + sway, baseY - height);
      ctx.stroke();
    }

    const ground = ctx.createLinearGradient(0, state.height - 120, 0, state.height);
    ground.addColorStop(0, "rgba(0,0,0,0)");
    ground.addColorStop(1, dark ? "rgba(9, 35, 27, 0.26)" : "rgba(105, 194, 124, 0.24)");
    ctx.fillStyle = ground;
    ctx.fillRect(0, state.height - 120, state.width, 120);
    ctx.restore();
  }

  function drawStars(now) {
    const cyan = css("--cyan");
    const violet = css("--violet");
    const gold = css("--gold");
    const green = css("--green");
    const px = state.pointer.x;
    const py = state.pointer.y;
    const dark = state.theme === "dark";
    state.backgroundStars.forEach(star => {
      const dx = star.x - px;
      const dy = star.y - py;
      const dist = Math.hypot(dx, dy);
      if (!state.lowMotion && dist < 90) {
        const push = (90 - dist) / 90;
        star.x += (dx / (dist || 1)) * push * 0.8;
        star.y += (dy / (dist || 1)) * push * 0.8;
      }
      const alphaBase = dark ? 0.26 : 0.12;
      const alpha = alphaBase + Math.sin(now * 0.002 * star.depth + star.twinkle) * 0.2 + star.depth * (dark ? 0.28 : 0.18);
      ctx.globalAlpha = Math.max(dark ? 0.12 : 0.06, Math.min(dark ? 0.92 : 0.48, alpha));
      ctx.fillStyle = dark ? (star.depth > 0.65 ? cyan : violet) : (star.depth > 0.65 ? gold : green);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawParticles(now, dt) {
    if (state.lowMotion || state.disabled) return;
    const colors = [css("--cyan"), css("--violet"), css("--rose"), css("--gold")];
    state.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.x += Math.sin(now * 0.001 + p.y * 0.01) * 0.04 * dt;
      if (p.y < -20) {
        p.y = state.height + 20;
        p.x = Math.random() * state.width;
      }
      if (p.x < -20) p.x = state.width + 20;
      if (p.x > state.width + 20) p.x = -20;
      ctx.globalAlpha = 0.18 + p.hue * 0.34;
      ctx.fillStyle = colors[Math.floor(p.hue * colors.length) % colors.length];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function placeCat() {
    const cat = state.cat;
    const mobile = state.width < 700;
    const x = mobile ? state.width * 0.18 : state.width * 0.82;
    const y = mobile ? state.height * 0.82 : state.height * 0.76;
    cat.homeX = x;
    cat.homeY = y;
    if (!cat.ready) {
      cat.x = x;
      cat.y = y;
      cat.targetX = x;
      cat.targetY = y;
      cat.ready = true;
      return;
    }
    cat.x = Math.max(state.width * 0.08, Math.min(state.width * 0.92, cat.x));
    cat.y = Math.max(state.height * 0.18, Math.min(state.height * 0.9, cat.y));
  }

  function updateCat(now, dt) {
    const cat = state.cat;
    const mobile = state.width < 700;
    const pointerFresh = state.pointer.active && now - state.pointer.lastMove < 3600 && !state.lowMotion;
    const idleX = cat.homeX;
    const idleY = cat.homeY;
    const followOffsetX = mobile ? 20 : 72;
    const followOffsetY = mobile ? 74 : 96;

    if (state.playMode) {
      cat.targetX = state.width * (mobile ? 0.18 : 0.78);
      cat.targetY = state.height * (mobile ? 0.82 : 0.74);
    } else if (pointerFresh) {
      cat.targetX = state.pointer.x + followOffsetX;
      cat.targetY = state.pointer.y + followOffsetY;
    } else {
      cat.targetX = idleX;
      cat.targetY = idleY;
    }

    const minX = state.width * 0.08;
    const minY = state.height * (mobile ? 0.22 : 0.18);
    cat.targetX = Math.max(minX, Math.min(state.width * 0.92, cat.targetX));
    cat.targetY = Math.max(minY, Math.min(state.height * 0.9, cat.targetY));
    const chase = state.playMode ? 0.045 : pointerFresh ? 0.052 : 0.026;
    cat.x += (cat.targetX - cat.x) * chase * (dt / 16.67);
    cat.y += (cat.targetY - cat.y) * chase * (dt / 16.67);

    const dx = state.pointer.x - cat.x;
    const dy = state.pointer.y - cat.y + 150;
    const dist = Math.hypot(dx, dy) || 1;
    const maxEye = 5;
    const targetEyeX = pointerFresh ? (dx / dist) * maxEye : 0;
    const targetEyeY = pointerFresh ? (dy / dist) * 3 : 0;
    cat.eyeX += (targetEyeX - cat.eyeX) * 0.14;
    cat.eyeY += (targetEyeY - cat.eyeY) * 0.14;
    cat.headTilt += ((pointerFresh ? Math.max(-0.13, Math.min(0.13, dx / 1200)) : 0) - cat.headTilt) * 0.08;

    cat.nextBlink -= dt / 16.67;
    if (cat.nextBlink <= 0) {
      cat.blink = 7;
      cat.nextBlink = 150 + Math.random() * 190;
    }
    if (cat.blink > 0) cat.blink -= dt / 16.67;
    cat.sleepTimer = pointerFresh || state.playMode || cat.cast > 0 ? 0 : cat.sleepTimer + dt / 16.67;
    cat.sleep = cat.sleepTimer > 760;
    if (cat.cast > 0) cat.cast -= dt / 16.67;
  }

  function drawCat(now) {
    const w = state.width;
    const mobile = w < 700;
    const cat = state.cat;
    const x = cat.x;
    const y = cat.y;
    const dark = state.theme === "dark";
    const breathe = Math.sin(now * 0.0022) * 3;
    const casting = state.playMode || state.completed || state.clickBursts.length > 0 || cat.cast > 0;
    if (mascotImage.complete && mascotImage.naturalWidth) {
      const imageScale = mobile ? 0.34 : Math.min(0.48, Math.max(0.36, w / 3200));
      const drawW = 640 * imageScale;
      const drawH = 640 * imageScale;
      const tilt = Math.sin(now * 0.0009) * 0.02 + cat.headTilt * 0.25;

      ctx.save();
      ctx.translate(x, y + breathe);
      ctx.rotate(tilt);
      ctx.globalAlpha = state.theme === "dark" ? 0.2 : 0.16;
      ctx.fillStyle = css("--cyan");
      ctx.beginPath();
      ctx.ellipse(0, drawH * 0.18, drawW * 0.36, drawH * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = state.theme === "dark" ? 0.96 : 0.9;
      ctx.drawImage(mascotImage, -drawW * 0.5, -drawH * 0.72, drawW, drawH);

      if (casting && !state.lowMotion) {
        const castPower = Math.max(0, Math.min(1, cat.cast / 55));
        const staffX = drawW * 0.28;
        const staffY = -drawH * 0.5;
        const glowR = 22 + castPower * 32 + Math.sin(now * 0.012) * 5;
        const grad = ctx.createRadialGradient(staffX, staffY, 0, staffX, staffY, glowR * 3);
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(0.22, "rgba(255,79,115,0.55)");
        grad.addColorStop(0.62, "rgba(113,231,255,0.18)");
        grad.addColorStop(1, "rgba(255,79,115,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(staffX, staffY, glowR * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      return;
    }
    const mascotCastPower = Math.max(0, Math.min(1, cat.cast / 55));
    const cream = "#fff8df";
    const logoScale = mobile ? 0.46 : Math.min(0.68, Math.max(0.52, w / 1900));
    const mascotColor = dark ? "#031532" : "#13243f";

    ctx.save();
    ctx.translate(x, y + breathe);
    ctx.scale(logoScale, logoScale);
    ctx.rotate(Math.sin(now * 0.0009) * 0.018);

    ctx.save();
    ctx.globalAlpha = dark ? 0.23 : 0.18;
    ctx.fillStyle = css("--cyan");
    ctx.beginPath();
    ctx.ellipse(18, 108, 220, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = mascotColor;
    ctx.lineWidth = 42;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(126, 58);
    ctx.bezierCurveTo(214, 74, 282, 34, 328, -18);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = mascotColor;
    ctx.beginPath();
    ctx.moveTo(-100, 72);
    ctx.bezierCurveTo(-156, -14, -138, -118, -54, -164);
    ctx.bezierCurveTo(36, -214, 162, -182, 212, -78);
    ctx.bezierCurveTo(260, 20, 196, 92, 90, 112);
    ctx.bezierCurveTo(12, 126, -58, 114, -100, 72);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-152, -24);
    ctx.bezierCurveTo(-96, -132, 14, -196, 172, -220);
    ctx.bezierCurveTo(112, -154, 30, -96, -94, -50);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-92, -170);
    ctx.bezierCurveTo(-30, -306, 86, -384, 272, -396);
    ctx.bezierCurveTo(232, -292, 148, -214, 12, -174);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(38, -392);
    ctx.bezierCurveTo(128, -358, 198, -292, 242, -204);
    ctx.bezierCurveTo(120, -206, 28, -252, -40, -336);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(0, -132);
    ctx.rotate(cat.headTilt * 1.6);
    ctx.translate(0, 132);
    ctx.strokeStyle = cream;
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(-108, -206);
    ctx.lineTo(-38, -304);
    ctx.lineTo(50, -226);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(38, -254);
    ctx.lineTo(136, -318);
    ctx.lineTo(224, -238);
    ctx.stroke();

    const mascotBlink = cat.sleep ? 0.08 : cat.blink > 0 ? 0.14 : 1;
    ctx.save();
    ctx.translate(cat.eyeX, cat.eyeY);
    ctx.scale(1, mascotBlink);
    ctx.strokeStyle = cream;
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(-28, -94, 33, 0.12, Math.PI - 0.12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(88, -96, 33, 0.12, Math.PI - 0.12);
    ctx.stroke();
    ctx.restore();

    if (cat.sleep) {
      ctx.fillStyle = cream;
      ctx.font = "bold 28px sans-serif";
      ctx.fillText("z", 172, -214);
      ctx.fillText("z", 198, -252);
    }

    ctx.strokeStyle = cream;
    ctx.lineWidth = 6;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(-40, 0, 38, Math.PI * 1.08, Math.PI * 1.72);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = "#8f263b";
    ctx.lineWidth = 48;
    ctx.beginPath();
    ctx.moveTo(-104, 102);
    ctx.bezierCurveTo(-16, -18, 92, -122, 230, -244);
    ctx.stroke();
    ctx.strokeStyle = "#bd4053";
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(-96, 98);
    ctx.bezierCurveTo(-10, -14, 98, -116, 224, -234);
    ctx.stroke();
    ctx.strokeStyle = "#8f263b";
    ctx.lineWidth = 48;
    ctx.beginPath();
    ctx.moveTo(206, -220);
    ctx.bezierCurveTo(230, -278, 282, -288, 312, -244);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = mascotColor;
    ctx.strokeStyle = cream;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-106, -6, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(126, -84, 39, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (casting && !state.lowMotion) {
      const staffX = 238;
      const staffY = -250;
      const glowR = 54 + mascotCastPower * 48 + Math.sin(now * 0.012) * 7;
      const grad = ctx.createRadialGradient(staffX, staffY, 0, staffX, staffY, glowR * 2.2);
      grad.addColorStop(0, "rgba(255,255,255,0.92)");
      grad.addColorStop(0.24, "rgba(255,79,115,0.72)");
      grad.addColorStop(0.62, "rgba(113,231,255,0.22)");
      grad.addColorStop(1, "rgba(255,79,115,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(staffX, staffY, glowR * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css("--cyan");
      ctx.globalAlpha = 0.42 + mascotCastPower * 0.32;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(staffX, staffY, glowR, now * 0.004, now * 0.004 + Math.PI * 1.45);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawConstellation(now) {
    const points = constellation.map(scenePoint);
    const connectedCount = state.connected.length;
    if (!state.playMode && !state.completed && !state.disabled) {
      state.autoLineProgress += state.lowMotion ? 0.0008 : 0.0016;
      if (state.autoLineProgress > 1) state.autoLineProgress = 0;
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = state.completed ? css("--rose") : css("--cyan");
    ctx.shadowColor = state.completed ? css("--rose") : css("--cyan");
    ctx.shadowBlur = state.completed ? 22 : 12;
    ctx.lineWidth = 2.5;

    const drawLimit = state.playMode || state.completed ? connectedCount : Math.floor(state.autoLineProgress * 8);
    for (let i = 1; i < Math.min(points.length, drawLimit); i++) {
      ctx.globalAlpha = state.playMode || state.completed ? 0.92 : 0.16;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
    }

    if (state.completed) {
      const arcA = points[1];
      const arcB = points[8];
      ctx.globalAlpha = 0.86 + Math.sin(now * 0.006) * 0.14;
      ctx.strokeStyle = css("--rose");
      ctx.beginPath();
      ctx.moveTo(arcA.x + 18, arcA.y + 24);
      ctx.bezierCurveTo(
        arcA.x + 120, arcA.y + 96,
        arcB.x - 120, arcB.y + 96,
        arcB.x - 18, arcB.y + 24
      );
      ctx.stroke();
      drawPortal(points[4].x + (points[5].x - points[4].x) * 0.5, points[4].y + 52, now);
    }

    points.forEach((p, i) => {
      const active = i < connectedCount || i === state.nextStar || state.completed;
      const pulse = Math.sin(now * 0.006 + i) * 0.5 + 0.5;
      ctx.globalAlpha = active ? 0.95 : 0.38;
      ctx.fillStyle = active ? css("--moon") : css("--muted");
      ctx.shadowColor = active ? css("--cyan") : "transparent";
      ctx.shadowBlur = active ? 16 + pulse * 10 : 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 5.4 + pulse * 1.8 : 3.6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawPortal(x, y, now) {
    ctx.save();
    const r = 62 + Math.sin(now * 0.004) * 6;
    ctx.translate(x, y);
    ctx.rotate(now * 0.0008);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, r * 2.2);
    g.addColorStop(0, "rgba(255,255,255,0.22)");
    g.addColorStop(0.25, "rgba(113,231,255,0.38)");
    g.addColorStop(0.55, "rgba(142,111,255,0.24)");
    g.addColorStop(1, "rgba(113,231,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css("--cyan");
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.72 - i * 0.18;
      ctx.beginPath();
      ctx.ellipse(0, 0, r + i * 16, r * 0.72 + i * 12, i * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawMagicTrails(now) {
    if (state.lowMotion || state.disabled) return;
    state.trails = state.trails.filter(trail => now - trail.t < 900);
    if (state.trails.length < 2) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < state.trails.length; i++) {
      const a = state.trails[i - 1];
      const b = state.trails[i];
      const age = now - b.t;
      const alpha = Math.max(0, 1 - age / 900);
      if (Math.abs(a.x - b.x) > 180 || Math.abs(a.y - b.y) > 180) continue;
      ctx.globalAlpha = alpha * 0.32;
      ctx.strokeStyle = state.theme === "dark" ? css("--cyan") : css("--green");
      ctx.shadowColor = state.theme === "dark" ? css("--cyan") : css("--gold");
      ctx.shadowBlur = 18 * alpha;
      ctx.lineWidth = 1 + alpha * 4;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - 10 * alpha, b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBursts(now) {
    state.clickBursts = state.clickBursts.filter(burst => {
      const age = now - burst.t;
      const life = burst.life || 1100;
      if (age > life) return false;
      const p = age / life;
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.strokeStyle = burst.color;
      ctx.fillStyle = burst.color;
      ctx.shadowColor = burst.color;
      ctx.shadowBlur = 24 * (1 - p);

      const wave = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, 220 * p + 20);
      wave.addColorStop(0, "rgba(255,255,255,0)");
      wave.addColorStop(0.45, burst.wave || "rgba(113,231,255,0.10)");
      wave.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = wave;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, 220 * p + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = burst.color;
      const sparks = burst.sparks || 16;
      for (let i = 0; i < sparks; i++) {
        const a = (Math.PI * 2 * i) / sparks + p * 3.4 + burst.seed;
        const r = 10 + p * (burst.radius || 92);
        ctx.beginPath();
        ctx.arc(burst.x + Math.cos(a) * r, burst.y + Math.sin(a) * r, Math.max(0.2, 3.6 * (1 - p)), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = burst.color;
      ctx.lineWidth = 2.5 * (1 - p);
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, 14 + p * (burst.radius || 92), 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = (1 - p) * 0.46;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, 30 + p * (burst.radius || 92) * 1.35, Math.PI * p, Math.PI * p + Math.PI * 1.25);
      ctx.stroke();
      ctx.restore();
      return true;
    });
  }

  function render(now) {
    const frameInterval = targetFrameInterval();
    if (frameInterval && state.lastDraw && now - state.lastDraw < frameInterval) {
      state.rafId = requestAnimationFrame(render);
      return;
    }
    state.lastDraw = now;
    const dt = Math.min(48, now - state.lastFrame);
    state.lastFrame = now;
    state.time = now;
    state.fpsScore = state.fpsScore * 0.94 + (1000 / Math.max(16, dt)) * 0.06;
    if (!state.lowMotion && state.fpsScore < 28 && now > 4500) {
      state.lowMotion = true;
      state.quality = "Low";
      body.classList.add("low-motion");
      state.backgroundCacheKey = "";
      seedScene();
      updateLabels();
    }

    ctx.clearRect(0, 0, state.width, state.height);
    updateCat(now, dt);
    drawCachedBackground(now);
    drawStars(now);
    drawConstellation(now);
    drawParticles(now, dt);
    drawMagicTrails(now);
    drawCat(now);
    drawBursts(now);

    if (state.lowMotion) {
      state.rafId = null;
      return;
    }

    if (state.running && !state.inactive && !state.paused && !state.disabled) {
      state.rafId = requestAnimationFrame(render);
    } else {
      state.rafId = null;
    }
  }

  function startLoop() {
    if (!state.running || state.inactive || state.paused || state.disabled) return;
    if (state.rafId) return;
    state.lastFrame = performance.now();
    state.lastDraw = 0;
    state.rafId = requestAnimationFrame(render);
  }

  function startLoopAfterFirstPaint() {
    const delay = state.lowMotion ? 360 : 900;
    const schedule = () => window.setTimeout(startLoop, delay);
    if ("requestAnimationFrame" in window) {
      requestAnimationFrame(() => requestAnimationFrame(schedule));
      return;
    }
    schedule();
  }

  function setTheme(theme, persist = true) {
    state.theme = theme;
    body.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    state.backgroundCacheKey = "";
    refreshCssCache();
    document.querySelectorAll("[data-logo-theme]").forEach(logo => {
      const darkLogo = "assets/willowinworld-logo.webp";
      const lightLogo = "assets/willowinworld-logo-day.webp";
      const darkSrcset = "assets/responsive/willowinworld-logo-256.webp 256w, assets/responsive/willowinworld-logo-512.webp 512w, assets/willowinworld-logo.webp 1024w";
      const lightSrcset = "assets/responsive/willowinworld-logo-day-256.webp 256w, assets/responsive/willowinworld-logo-day-512.webp 512w, assets/willowinworld-logo-day.webp 1024w";
      logo.src = theme === "dark" ? darkLogo : lightLogo;
      logo.srcset = theme === "dark" ? darkSrcset : lightSrcset;
      logo.sizes = logo.getAttribute("data-logo-sizes") || "(max-width: 760px) 44px, 52px";
    });
    if (metaThemeColor) metaThemeColor.content = theme === "dark" ? "#031735" : "#fcfff2";
    if (persist) {
      try {
        localStorage.setItem("willow-theme", theme);
      } catch (error) {
        // Local files can run in stricter browser contexts; theme still works without storage.
      }
    }
    if (state.width && state.height) seedScene();
    updateLabels();
  }

  function startPlayMode() {
    state.disabled = false;
    state.paused = false;
    state.playMode = true;
    state.completed = false;
    state.connected = [];
    state.nextStar = 0;
    state.cat.cast = 58;
    body.classList.remove("magic-off");
    updateLabels();
    showToast("A star path awakened.");
    successBadge.classList.remove("is-visible");
    startLoop();
  }

  function completeConstellation() {
    state.completed = true;
    state.playMode = false;
    state.connected = constellation.map((_, i) => i);
    state.cat.cast = 88;
    successBadge.classList.add("is-visible");
    showToast("Magic unlocked");
    window.setTimeout(() => successBadge.classList.remove("is-visible"), 4200);
    updateLabels();
  }

  function handlePointerMove(event) {
    const point = getEventPoint(event);
    state.pointer.x = point.x;
    state.pointer.y = point.y;
    state.pointer.active = true;
    state.pointer.lastMove = performance.now();
    if (!state.lowMotion) startLoop();
    if (!state.lowMotion && !state.disabled && state.pointer.lastMove - state.pointer.lastTrail > 34) {
      state.pointer.lastTrail = state.pointer.lastMove;
      state.trails.push({ x: point.x, y: point.y, t: state.pointer.lastMove });
      if (state.trails.length > 48) state.trails.shift();
    }
  }

  function handlePointerLeave() {
    state.pointer.active = false;
    state.pointer.lastMove = 0;
    state.pointer.lastTrail = 0;
    state.trails.length = 0;
  }

  function setCircleBurst(burst) {
    state.clickBursts[0] = burst;
    state.clickBursts.length = 1;
  }

  function handlePointerDown(event) {
    const target = event.target;
    if (target instanceof Element && target.closest("button, a, input, textarea, select, .modal-dialog")) return;
    const point = getEventPoint(event);
    state.pointer.x = point.x;
    state.pointer.y = point.y;
    state.pointer.active = true;
    state.pointer.lastMove = performance.now();
    state.cat.cast = state.playMode ? 62 : 38;
    startLoop();
    if (!state.disabled && !state.lowMotion) {
      setCircleBurst({
        x: point.x,
        y: point.y,
        t: performance.now(),
        color: Math.random() > 0.5 ? css("--cyan") : css("--rose"),
        wave: state.theme === "dark" ? "rgba(113,231,255,0.12)" : "rgba(255,211,110,0.16)",
        sparks: 18,
        radius: 110,
        seed: Math.random() * Math.PI * 2
      });
    }

    if (!state.playMode || state.completed) return;
    const expected = scenePoint(constellation[state.nextStar]);
    const radius = state.width < 700 ? 42 : 34;
    if (Math.hypot(point.x - expected.x, point.y - expected.y) <= radius) {
      state.connected.push(state.nextStar);
      state.nextStar += 1;
      state.cat.cast = 70;
      setCircleBurst({ x: expected.x, y: expected.y, t: performance.now(), color: css("--cyan"), wave: "rgba(113,231,255,0.18)", sparks: 22, radius: 118, seed: Math.random() * Math.PI * 2 });
      if (state.nextStar >= constellation.length) completeConstellation();
    } else {
      setCircleBurst({ x: point.x, y: point.y, t: performance.now(), color: css("--rose"), wave: "rgba(255,79,115,0.15)", sparks: 14, radius: 76, seed: Math.random() * Math.PI * 2 });
    }
  }

  function getEventPoint(event) {
    const source = event.touches && event.touches[0] ? event.touches[0] : event.changedTouches && event.changedTouches[0] ? event.changedTouches[0] : event;
    return { x: source.clientX, y: source.clientY };
  }

  function addSecretBurst(point) {
    if (state.lowMotion || state.disabled) return;
    setCircleBurst({
      x: point.x,
      y: point.y,
      t: performance.now(),
      color: Math.random() > 0.45 ? css("--cyan") : css("--gold"),
      wave: state.theme === "dark" ? "rgba(113,231,255,0.18)" : "rgba(255,211,110,0.2)",
      sparks: 24,
      radius: 126,
      seed: Math.random() * Math.PI * 2
    });
  }

  let activeGameTrigger = null;
  let activeInfoTrigger = null;
  let activeContactTrigger = null;
  const infoModals = {
    careers: { modal: careersModal, closeButton: closeCareers },
    press: { modal: pressModal, closeButton: closePress },
    privacy: { modal: privacyModal, closeButton: closePrivacy },
    legal: { modal: legalModal, closeButton: closeLegal },
    asset: { modal: assetModal, closeButton: closeAsset },
    security: { modal: securityModal, closeButton: closeSecurity }
  };

  function renderGameProfile(key) {
    const profile = gameProfiles[key];
    if (!profile) return false;

    gameDialog.dataset.game = key;
    gameModalTitle.textContent = profile.title;
    gameModalGenre.textContent = profile.genre;
    gameModalStatus.textContent = profile.status;
    gameModalCopy.textContent = profile.copy;
    gameModalTags.replaceChildren();
    profile.tags.forEach(label => {
      const tag = document.createElement("li");
      tag.className = "tag";
      tag.textContent = label;
      gameModalTags.append(tag);
    });
    gameModalPillars.replaceChildren();
    profile.pillars.forEach(text => {
      const pillar = document.createElement("li");
      pillar.textContent = text;
      gameModalPillars.append(pillar);
    });
    return true;
  }

  function openGameDetails(key, trigger) {
    if (!renderGameProfile(key)) return;
    activeGameTrigger = trigger || document.activeElement;
    gameModal.hidden = false;
    gameModal.classList.add("is-open");
    syncModalLock();
    window.setTimeout(() => closeGame.focus(), 30);
  }

  function closeGameDetails(restoreFocus = true) {
    if (!gameModal.classList.contains("is-open")) return;
    gameModal.classList.remove("is-open");
    gameModal.hidden = true;
    syncModalLock();
    if (restoreFocus && activeGameTrigger && typeof activeGameTrigger.focus === "function") {
      activeGameTrigger.focus();
    }
  }

  function openInfoModal(key, trigger) {
    const entry = infoModals[key];
    if (!entry || !entry.modal) return;
    const nextTrigger = trigger || document.activeElement;
    const triggerInsideOpenModal = nextTrigger instanceof Element && Boolean(nextTrigger.closest(".modal.is-open"));
    closeGameDetails(false);
    closeContactModal(false);
    closeSecretReward();
    closeInfoModals(false);
    if (!triggerInsideOpenModal) activeInfoTrigger = nextTrigger;
    entry.modal.hidden = false;
    entry.modal.classList.add("is-open");
    syncModalLock();
    window.setTimeout(() => (entry.closeButton || entry.modal).focus(), 30);
  }

  function closeInfoModal(key, restoreFocus = true) {
    const entry = infoModals[key];
    if (!entry || !entry.modal || !entry.modal.classList.contains("is-open")) return;
    entry.modal.classList.remove("is-open");
    entry.modal.hidden = true;
    syncModalLock();
    if (restoreFocus && activeInfoTrigger && typeof activeInfoTrigger.focus === "function") {
      activeInfoTrigger.focus();
    }
  }

  function closeInfoModals(restoreFocus = true) {
    Object.keys(infoModals).forEach(key => closeInfoModal(key, false));
    if (restoreFocus && activeInfoTrigger && typeof activeInfoTrigger.focus === "function") {
      activeInfoTrigger.focus();
    }
  }

  function getOpenModal() {
    const infoModal = Object.values(infoModals)
      .map(entry => entry.modal)
      .find(modal => modal && modal.classList.contains("is-open"));
    return [contactModal, infoModal, gameModal, secretModal].find(modal => modal && modal.classList.contains("is-open")) || null;
  }

  function trapModalFocus(event) {
    if (event.key !== "Tab") return;
    const modal = getOpenModal();
    if (!modal) return;
    const focusable = [...modal.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])")]
      .filter(element => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!modal.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function syncModalLock() {
    const infoModalOpen = Object.values(infoModals)
      .some(entry => entry.modal && entry.modal.classList.contains("is-open"));
    const modalOpen =
      contactModal.classList.contains("is-open") ||
      infoModalOpen ||
      gameModal.classList.contains("is-open") ||
      secretModal.classList.contains("is-open");
    body.classList.toggle("modal-open", modalOpen);
    [pageShell, skipLink].forEach(layer => {
      if (!layer) return;
      layer.inert = modalOpen;
      if (modalOpen) {
        layer.setAttribute("aria-hidden", "true");
      } else {
        layer.removeAttribute("aria-hidden");
      }
    });
  }

  function createPromoClaimId(secret) {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `WILLOW-${secret.key.toUpperCase()}-${stamp}-${random}`;
  }

  function buildPromoClaimHref(secret, claimId) {
    const subject = encodeURIComponent(`Promo claim - ${secret.phrase}`);
    const body = encodeURIComponent(
      "Hi WillowinWorld,\n\n" +
      "I found the hidden promo word on the WillowinWorld website.\n\n" +
      `Claim phrase: ${secret.phrase}\n` +
      `Claim ID: ${claimId}\n\n` +
      "I understand this does not reveal a real promo code on the website and that the studio reviews claims manually.\n"
    );
    return `mailto:contact@willowinworld.com?subject=${subject}&body=${body}`;
  }

  function openSecretReward(secret) {
    const claimId = createPromoClaimId(secret);
    secretTitle.textContent = secret.title;
    secretMessage.textContent = `${secret.message} Claim phrase: ${secret.phrase}. Claim ID: ${claimId}.`;
    if (claimSecret) {
      claimSecret.href = buildPromoClaimHref(secret, claimId);
      claimSecret.textContent = "Request Promo Code";
    }
    secretModal.hidden = false;
    secretModal.classList.add("is-open");
    syncModalLock();
    window.setTimeout(() => (claimSecret || dismissSecret).focus(), 30);
  }

  function closeSecretReward() {
    secretModal.classList.remove("is-open");
    secretModal.hidden = true;
    syncModalLock();
  }

  function unlockSecret(secret, point) {
    if (secret.rewarded) return;
    secret.rewarded = true;
    state.completed = true;
    state.playMode = false;
    state.connected = constellation.map((_, i) => i);
    state.nextStar = constellation.length;
    state.cat.cast = 96;
    addSecretBurst(point);
    showToast("A hidden portal answered.");
    openSecretReward(secret);
    startLoop();
  }

  function collectSecret(secret, index, glint, event) {
    if (secret.found.has(index) || secret.rewarded) return;
    event.preventDefault();
    event.stopPropagation();
    secret.found.add(index);
    glint.classList.add("is-found");
    const point = getEventPoint(event);
    state.pointer.x = point.x;
    state.pointer.y = point.y;
    state.pointer.active = true;
    state.pointer.lastMove = performance.now();
    state.cat.cast = 72;
    addSecretBurst(point);
    if (secret.found.size >= secret.letters.length) {
      unlockSecret(secret, point);
    } else {
      showToast("Hidden letters: " + secret.found.size + "/" + secret.letters.length);
    }
    startLoop();
  }

  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function syncSecretHuntMode(active) {
    body.classList.toggle("promo-hunt-active", active);
    if (promoHuntToggle) {
      promoHuntToggle.setAttribute("aria-pressed", String(active));
      promoHuntToggle.textContent = active ? "End magic hunt" : "Magic hunt";
    }
    document.querySelectorAll(".secret-glint").forEach(glint => {
      const letter = glint.dataset.letter || glint.textContent.trim();
      glint.tabIndex = active ? 0 : -1;
      glint.setAttribute("aria-hidden", active ? "false" : "true");
      glint.setAttribute(
        "aria-label",
        active ? `Hidden promo letter ${letter}` : "Hidden promo letter"
      );
    });
  }

  function initSecrets() {
    const surfaces = shuffled(
      [...document.querySelectorAll("main .section")].filter(surface => (
        surface.offsetParent !== null &&
        window.getComputedStyle(surface).display !== "none"
      ))
    );
    const spots = shuffled(sectionSecretSpots);
    if (!surfaces.length || !spots.length) return;

    secretRewards.forEach((secret, secretIndex) => {
      const letters = shuffled(secret.letters.map((letter, index) => ({ letter, index })));
      letters.forEach(({ letter, index }, order) => {
        const surface = surfaces[(order + secretIndex) % surfaces.length];
        const spot = spots[(order * 5 + secretIndex) % spots.length];
        const glint = document.createElement("button");
        glint.type = "button";
        glint.className = "secret-glint";
        glint.textContent = letter;
        glint.tabIndex = -1;
        glint.dataset.letter = letter;
        glint.setAttribute("aria-hidden", "true");
        glint.setAttribute("aria-label", "Hidden promo letter");
        glint.style.setProperty("--glint-x", spot[0] + "%");
        glint.style.setProperty("--glint-y", spot[1] + "%");
        glint.style.setProperty("--glint-delay", -((index + secretIndex * 2) % 9) * 0.54 + "s");
        glint.addEventListener("click", event => collectSecret(secret, index, glint, event));
        surface.append(glint);
      });
    });

    syncSecretHuntMode(false);
  }

  function openMenu() {
    body.classList.add("menu-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close menu");
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }

  function openContact(trigger) {
    closeGameDetails(false);
    closeInfoModals(false);
    closeMenu();
    activeContactTrigger = trigger || document.activeElement;
    contactModal.hidden = false;
    contactModal.classList.add("is-open");
    const requestedType = trigger && trigger.dataset ? trigger.dataset.contactType : "";
    const typeField = contactForm.elements.namedItem("type");
    if (typeField && requestedType) {
      typeField.value = requestedType;
      scheduleContactDraft();
    }
    syncModalLock();
    window.setTimeout(() => document.getElementById("name").focus(), 30);
  }

  function closeContactModal(restoreFocus = true) {
    if (!contactModal.classList.contains("is-open")) return;
    contactModal.classList.remove("is-open");
    contactModal.hidden = true;
    syncModalLock();
    if (restoreFocus && activeContactTrigger && typeof activeContactTrigger.focus === "function") {
      activeContactTrigger.focus();
    }
  }

  function initGameDetails() {
    document.querySelectorAll("[data-game]").forEach(button => {
      button.addEventListener("click", () => openGameDetails(button.dataset.game, button));
    });
    closeGame.addEventListener("click", () => closeGameDetails());
    dismissGame.addEventListener("click", () => closeGameDetails());
    gameModal.addEventListener("click", event => {
      if (event.target === gameModal) closeGameDetails();
    });
  }

  function initCardShine() {
    if (state.lowMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.querySelectorAll(".game-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--shine-x", ((event.clientX - bounds.left) / bounds.width) * 100 + "%");
        card.style.setProperty("--shine-y", ((event.clientY - bounds.top) / bounds.height) * 100 + "%");
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--shine-x");
        card.style.removeProperty("--shine-y");
      });
    });
  }

  function initReveals() {
    const targets = [];
    const seen = new Set();

    function queueReveal(target, delay) {
      if (!target || seen.has(target)) return;
      seen.add(target);
      target.setAttribute("data-reveal", "");
      target.style.setProperty("--reveal-delay", delay + "ms");
      targets.push(target);
    }

    function queueRevealGroup(rootSelector, selector, step, maxDelay) {
      document.querySelectorAll(rootSelector).forEach(root => {
        root.querySelectorAll(selector).forEach((target, index) => {
          queueReveal(target, Math.min(index * step, maxDelay));
        });
      });
    }

    document.querySelectorAll("main .section .section-head").forEach(target => queueReveal(target, 0));
    queueRevealGroup("#games", ".game-card", 64, 320);
    queueRevealGroup("#studio", ".principle", 68, 408);
    queueRevealGroup("#systems", ".system-card", 58, 348);
    queueRevealGroup("#about", ".about-grid > *", 86, 172);
    queueRevealGroup("#process", ".step", 70, 420);
    queueRevealGroup("#devlog", ".devlog-card", 76, 304);
    queueRevealGroup("#faq", ".faq-item", 54, 378);
    queueReveal(document.querySelector(".final-cta .container"), 0);

    if (state.lowMotion || !("IntersectionObserver" in window)) {
      targets.forEach(target => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12%", threshold: 0.12 });

    targets.forEach(target => observer.observe(target));
  }

  function initActiveNavigation() {
    const navLinks = [...mainNav.querySelectorAll('a[href^="#"]')];
    const sectionLinks = new Map(navLinks.map(link => [link.getAttribute("href").slice(1), link]));
    const sections = [...sectionLinks.keys()]
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    function setActiveSection(id) {
      navLinks.forEach(link => {
        const active = link === sectionLinks.get(id);
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: "-34% 0px -55%", threshold: 0 });

    sections.forEach(section => observer.observe(section));
  }

  function initGameAnimationVisibility() {
    const gameCards = document.querySelectorAll(".game-card");
    if (!gameCards.length || !("IntersectionObserver" in window)) return;

    gameCards.forEach(card => card.classList.add("is-animation-paused"));

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.classList.toggle("is-animation-paused", !entry.isIntersecting);
      });
    }, { rootMargin: "260px 0px", threshold: 0.01 });

    gameCards.forEach(card => observer.observe(card));
  }

  function initFilters() {
    document.querySelectorAll(".game-filters").forEach(group => {
      const filters = [...group.querySelectorAll("[data-filter]")];
      if (!filters.length) return;

      const controlsId = filters[0].getAttribute("aria-controls");
      const grid = controlsId ? document.getElementById(controlsId) : group.parentElement.querySelector(".games-grid");
      if (!grid) return;

      const cards = [...grid.querySelectorAll(".game-card")];
      const status = group.parentElement.querySelector("[data-filter-status]");
      const updateFilter = activeButton => {
        const filter = activeButton.dataset.filter;
        let visibleCount = 0;
        filters.forEach(btn => {
          const active = btn === activeButton;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-pressed", String(active));
        });
        cards.forEach(card => {
          const tags = card.dataset.tags || "";
          const visible = filter === "All" || tags.includes(filter);
          card.classList.toggle("is-hidden", !visible);
          if (visible) visibleCount += 1;
        });
        if (status) {
          status.textContent = filter === "All"
            ? ""
            : "Showing " + visibleCount + " " + filter.toLowerCase() + " game" + (visibleCount === 1 ? "." : "s.");
        }
      };

      filters.forEach(button => {
        button.addEventListener("click", () => updateFilter(button));
      });
    });
  }

  function initFaq() {
    document.querySelectorAll(".faq-item").forEach((item, index) => {
      const button = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      if (!button || !answer) return;
      const buttonId = `faq-question-${index + 1}`;
      const answerId = `faq-answer-${index + 1}`;
      button.id = buttonId;
      button.setAttribute("aria-controls", answerId);
      answer.id = answerId;
      answer.setAttribute("role", "region");
      answer.setAttribute("aria-labelledby", buttonId);
      answer.hidden = true;
      answer.inert = true;

      button.addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        window.clearTimeout(item.faqCloseTimer);
        window.cancelAnimationFrame(item.faqOpenFrame);
        if (open) {
          answer.hidden = false;
          answer.inert = false;
          item.faqOpenFrame = window.requestAnimationFrame(() => {
            item.classList.add("is-open");
            item.faqOpenFrame = 0;
          });
        } else {
          item.classList.remove("is-open");
          answer.inert = true;
          item.faqCloseTimer = window.setTimeout(() => {
            if (!item.classList.contains("is-open")) answer.hidden = true;
          }, 320);
        }
        button.setAttribute("aria-expanded", String(open));
      });
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", event => {
        if (link.hasAttribute("data-open-contact")) return;
        const id = link.getAttribute("href");
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        closeMenu();
        target.scrollIntoView({ behavior: state.lowMotion ? "auto" : "smooth", block: "start" });
      });
    });
  }

  function initDeepLinkStability() {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (!target) return;
    window.addEventListener("load", () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => target.scrollIntoView({ behavior: "auto", block: "start" }));
      });
    }, { once: true });
  }

  function initControls() {
    document.querySelectorAll("[data-play]").forEach(button => button.addEventListener("click", startPlayMode));
    document.querySelectorAll("[data-open-contact]").forEach(button => button.addEventListener("click", event => {
      event.preventDefault();
      openContact(button);
    }));
    document.querySelectorAll("[data-open-info]").forEach(button => {
      button.addEventListener("click", () => openInfoModal(button.dataset.openInfo, button));
    });

    themeToggle.addEventListener("click", () => {
      setTheme(state.theme === "dark" ? "light" : "dark");
      startLoop();
    });
    if (promoHuntToggle) {
      promoHuntToggle.addEventListener("click", () => {
        const active = !body.classList.contains("promo-hunt-active");
        syncSecretHuntMode(active);
        showToast(active ? "Hidden letters are awake." : "Magic hunt paused.");
      });
    }
    if (pauseMagic) {
      pauseMagic.addEventListener("click", () => {
        state.paused = !state.paused;
        state.disabled = false;
        body.classList.toggle("magic-off", state.paused);
        updateLabels();
        if (!state.paused) startLoop();
      });
    }
    if (lowMotion) {
      lowMotion.addEventListener("click", () => {
        state.lowMotion = !state.lowMotion;
        state.quality = state.lowMotion || state.lowData ? "Low" : "Auto";
        body.classList.toggle("low-motion", state.lowMotion);
        state.backgroundCacheKey = "";
        seedScene();
        updateLabels();
        if (!state.paused && !state.disabled) startLoop();
      });
    }
    if (disableMagic) {
      disableMagic.addEventListener("click", () => {
        state.disabled = !state.disabled;
        state.paused = false;
        state.playMode = false;
        body.classList.toggle("magic-off", state.disabled);
        updateLabels();
        if (state.disabled) {
          ctx.clearRect(0, 0, state.width, state.height);
          drawCachedBackground(performance.now());
          drawStars(performance.now());
          drawConstellation(performance.now());
          drawCat(performance.now());
        } else {
          startLoop();
        }
      });
    }

    menuToggle.addEventListener("click", () => body.classList.contains("menu-open") ? closeMenu() : openMenu());
    closeContact.addEventListener("click", closeContactModal);
    contactModal.addEventListener("click", event => {
      if (event.target === contactModal) closeContactModal();
    });
    Object.entries(infoModals).forEach(([key, entry]) => {
      if (!entry.modal || !entry.closeButton) return;
      entry.closeButton.addEventListener("click", () => closeInfoModal(key));
      entry.modal.addEventListener("click", event => {
        if (event.target === entry.modal) closeInfoModal(key);
      });
    });
    closeSecret.addEventListener("click", closeSecretReward);
    dismissSecret.addEventListener("click", closeSecretReward);
    secretModal.addEventListener("click", event => {
      if (event.target === secretModal) closeSecretReward();
    });
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      persistContactDraft();
      const draft = getContactDraft();
      window.location.href = draft.href;
      showToast("Email draft requested. If it did not open, use Copy message.");
      closeContactModal();
    });
    if (copyContactMessage) {
      copyContactMessage.addEventListener("click", async () => {
        if (!contactForm.reportValidity()) return;
        try {
          await copyText(getContactDraft().plainText);
          showToast("Contact message copied.");
        } catch (error) {
          showToast("Copy was blocked. Use contact@willowinworld.com.");
        }
      });
    }
    contactForm.addEventListener("input", scheduleContactDraft);
    contactForm.addEventListener("change", scheduleContactDraft);
    if (clearContactDraft) clearContactDraft.addEventListener("click", resetContactDraft);
    window.addEventListener("keydown", event => {
      trapModalFocus(event);
      if (event.key === "Escape") {
        closeMenu();
        closeContactModal();
        closeGameDetails();
        closeInfoModals();
        closeSecretReward();
      }
    });
  }

  function initPerformanceVisibility() {
    document.addEventListener("visibilitychange", () => {
      state.inactive = document.hidden;
      if (!state.inactive) startLoop();
    });
    if (!savedTheme && typeof colorSchemeQuery.addEventListener === "function") {
      colorSchemeQuery.addEventListener("change", event => {
        setTheme(event.matches ? "dark" : "light", false);
      });
    }
  }

  let resizeScheduled = false;
  function scheduleResize() {
    if (resizeScheduled) return;
    resizeScheduled = true;
    window.requestAnimationFrame(() => {
      resizeScheduled = false;
      resize();
      if (state.lowMotion) startLoop();
    });
  }

  window.addEventListener("resize", scheduleResize, { passive: true });
  window.addEventListener("mousemove", handlePointerMove, { passive: true });
  window.addEventListener("touchmove", handlePointerMove, { passive: true });
  document.addEventListener("mouseleave", handlePointerLeave);
  window.addEventListener("blur", handlePointerLeave);
  window.addEventListener("mouseout", event => {
    if (!event.relatedTarget && !event.toElement) handlePointerLeave();
  });
  window.addEventListener("click", handlePointerDown);
  window.addEventListener("touchend", handlePointerDown, { passive: true });
  mascotImage.addEventListener("load", startLoop, { once: true });
  mascotImage.addEventListener("error", () => body.classList.add("mascot-image-missing"), { once: true });
  mascotImage.src = "assets/magic-cat-mascot.webp";

  refreshCssCache();
  restoreContactDraft();
  initControls();
  initGameDetails();
  initSecrets();
  initFilters();
  initFaq();
  initSmoothAnchors();
  initDeepLinkStability();
  initCardShine();
  initReveals();
  initActiveNavigation();
  initGameAnimationVisibility();
  initPerformanceVisibility();
  setTheme(initialTheme, false);
  resize();
  startLoopAfterFirstPaint();
})();
