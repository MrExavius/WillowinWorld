import { spawnSync } from "node:child_process";

const commands = [
  ["node", ["--check", "site/scripts.js"]],
  ["node", ["--check", "site/game-theme.js"]],
  ["node", ["--check", "site/404.js"]],
  ["node", ["--check", "site/tools/update-sitemap-lastmod.mjs"]],
  ["node", ["--check", "site/tools/build-minified.mjs"]],
  ["node", ["--check", "site/tools/css-coverage-audit.mjs"]],
  ["node", ["--check", "site/tools/link-check.mjs"]],
  ["node", ["--check", "site/tools/visual-check.mjs"]],
  ["node", ["site/tools/link-check.mjs"]],
  ["node", ["site/tools/security-check.mjs"]]
];

let failed = false;

for (const [cmd, args] of commands) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) failed = true;
}

const externalChecks = [
  "Lighthouse desktop/mobile on production URL",
  "WebPageTest with mobile profile",
  "WAVE accessibility scan",
  "Keyboard-only and screen reader smoke test",
  "SecurityHeaders.com after deployment",
  "Google CSP Evaluator against deployed headers",
  "OWASP ZAP baseline scan against staging/production",
  "Google Rich Results Test for home, press kit and every game page",
  "Search Console sitemap/canonical indexing inspection",
  "Real Android and iOS device pass"
];

console.log("\nLocal browser check available:");
console.log("- node site/tools/visual-check.mjs");

console.log("\nExternal checks that require deployed URL, account access or real devices:");
externalChecks.forEach(item => console.log(`- ${item}`));

process.exit(failed ? 1 : 0);
