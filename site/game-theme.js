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

  function initNatureCursorMascot() {
    if (!body.classList.contains("nature-seed-page")) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const mascot = document.createElement("div");
    mascot.className = "nature-cursor-mascot";
    mascot.setAttribute("aria-hidden", "true");

    const glow = document.createElement("span");
    glow.className = "nature-cursor-glow";

    const image = document.createElement("img");
    image.className = "nature-cursor-image";
    image.src = "../assets/Nature%20Seeds/Galvnie2.png";
    image.width = 500;
    image.height = 500;
    image.alt = "";
    image.decoding = "async";

    mascot.append(glow, image);
    (document.querySelector(".nature-seed-shell") || body).appendChild(mascot);

    let frame = 0;
    let x = window.innerWidth * 0.58;
    let y = window.innerHeight * 0.42;
    let targetX = x;
    let targetY = y;
    let lastX = x;

    function render(time) {
      x += (targetX - x) * 0.11;
      y += (targetY - y) * 0.11;

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
      targetX = Math.min(window.innerWidth - 54, Math.max(54, event.clientX + 72));
      targetY = Math.min(window.innerHeight - 54, Math.max(54, event.clientY + 96));
      mascot.classList.add("is-active");
      start();
    }, { passive: true });

    document.addEventListener("mouseleave", stop);
    window.addEventListener("blur", stop);
  }

  initNatureCursorMascot();
})();
