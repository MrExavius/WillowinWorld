/* WillowinWorlds: sets body[data-theme] before first paint. Same order as game-theme.js and scripts.js: saved theme, system preference, time of day. */
(() => {
  let theme = null;
  try {
    const saved = localStorage.getItem("willow-theme");
    if (saved === "dark" || saved === "light") theme = saved;
  } catch (error) {
    // Blocked storage: fall back to the system preference.
  }
  if (!theme) {
    const matches = query => window.matchMedia(query).matches;
    const hour = new Date().getHours();
    theme = matches("(prefers-color-scheme: dark)") ? "dark"
      : matches("(prefers-color-scheme: light)") ? "light"
        : hour >= 7 && hour < 19 ? "light" : "dark";
  }
  if (document.body) document.body.dataset.theme = theme;
})();
