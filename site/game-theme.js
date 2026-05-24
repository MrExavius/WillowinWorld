(() => {
  const body = document.body;
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const metaThemeColor = document.getElementById("metaThemeColor");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function readStoredTheme() {
    try {
      const storedTheme = localStorage.getItem("willow-theme");
      return storedTheme === "dark" || storedTheme === "light" ? storedTheme : null;
    } catch (error) {
      return null;
    }
  }

  function writeStoredTheme(theme) {
    try {
      localStorage.setItem("willow-theme", theme);
    } catch (error) {
      // Theme switching still works when storage is blocked.
    }
  }

  function setTheme(theme, persist = true) {
    body.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    if (metaThemeColor) {
      metaThemeColor.content = body.classList.contains("nature-seed-page")
        ? theme === "dark" ? "#07162d" : "#f7fae8"
        : body.classList.contains("candy-shop-page")
          ? theme === "dark" ? "#211027" : "#fff3fa"
          : theme === "dark" ? "#031735" : "#fcfff2";
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
      themeToggle.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
    if (persist) writeStoredTheme(theme);
  }

  const initialTheme = readStoredTheme() || (prefersDark.matches ? "dark" : "light");
  setTheme(initialTheme, false);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      setTheme(body.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  if (!readStoredTheme() && typeof prefersDark.addEventListener === "function") {
    prefersDark.addEventListener("change", event => setTheme(event.matches ? "dark" : "light", false));
  }

  function initCursorMascot(options) {
    if (!body.classList.contains(options.pageClass)) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const mascot = document.createElement("div");
    mascot.className = options.mascotClass;
    mascot.setAttribute("aria-hidden", "true");

    const glow = document.createElement("span");
    glow.className = options.glowClass;

    const image = document.createElement("img");
    image.className = options.imageClass;
    image.src = options.src;
    image.width = options.imageWidth;
    image.height = options.imageHeight;
    image.alt = "";
    image.decoding = "async";

    mascot.append(glow, image);
    (document.querySelector(options.shellSelector) || body).appendChild(mascot);

    let frame = 0;
    let x = window.innerWidth * options.startX;
    let y = window.innerHeight * options.startY;
    let targetX = x;
    let targetY = y;
    let lastX = x;

    function render(time) {
      x += (targetX - x) * options.smoothing;
      y += (targetY - y) * options.smoothing;

      const bob = Math.sin(time * 0.005) * 5;
      const tilt = Math.max(-10, Math.min(10, (x - lastX) * 0.12));
      lastX = x;

      mascot.style.transform = `translate3d(${x}px, ${y + bob}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      frame = requestAnimationFrame(render);
    }

    function start() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    function stop() {
      mascot.classList.remove("is-active");
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    window.addEventListener("pointermove", event => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      targetX = Math.min(window.innerWidth - options.boundary, Math.max(options.boundary, event.clientX + options.offsetX));
      targetY = Math.min(window.innerHeight - options.boundary, Math.max(options.boundary, event.clientY + options.offsetY));
      mascot.classList.add("is-active");
      start();
    }, { passive: true });

    document.addEventListener("mouseleave", stop);
    window.addEventListener("blur", stop);
  }

  initCursorMascot({
    pageClass: "nature-seed-page",
    shellSelector: ".nature-seed-shell",
    mascotClass: "nature-cursor-mascot",
    glowClass: "nature-cursor-glow",
    imageClass: "nature-cursor-image",
    src: "../assets/Nature%20Seeds/Galvnie2.png",
    imageWidth: 500,
    imageHeight: 500,
    startX: 0.58,
    startY: 0.42,
    offsetX: 72,
    offsetY: 96,
    boundary: 54,
    smoothing: 0.11
  });

  initCursorMascot({
    pageClass: "candy-shop-page",
    shellSelector: ".candy-shop-shell",
    mascotClass: "candy-cursor-mascot",
    glowClass: "candy-cursor-glow",
    imageClass: "candy-cursor-image",
    src: "../assets/Candy%20Shop/site/mascot-cursor.png",
    imageWidth: 640,
    imageHeight: 640,
    startX: 0.62,
    startY: 0.42,
    offsetX: 86,
    offsetY: 88,
    boundary: 64,
    smoothing: 0.1
  });
})();
