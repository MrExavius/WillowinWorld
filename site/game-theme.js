(() => {
  const body = document.body;
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeState = document.getElementById("themeState");
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
      metaThemeColor.content = theme === "dark" ? "#031735" : "#fcfff2";
    }
    if (themeState) {
      themeState.textContent = theme === "dark" ? "Night" : "Day";
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
})();
