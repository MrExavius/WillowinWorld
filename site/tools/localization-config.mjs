export const siteOrigin = "https://willowinworld.com";
export const localizationLastModified = "2026-08-01";

export const locales = Object.freeze([
  Object.freeze({
    code: "en",
    htmlLang: "en",
    hreflang: "en",
    ogLocale: "en_US",
    label: "English",
    shortLabel: "EN",
    direction: "ltr",
    ollamaName: "English"
  }),
  Object.freeze({
    code: "ru",
    htmlLang: "ru",
    hreflang: "ru",
    ogLocale: "ru_RU",
    label: "Русский",
    shortLabel: "RU",
    direction: "ltr",
    ollamaName: "Russian"
  }),
  Object.freeze({
    code: "es",
    htmlLang: "es",
    hreflang: "es",
    ogLocale: "es_ES",
    label: "Español",
    shortLabel: "ES",
    direction: "ltr",
    ollamaName: "neutral international Spanish"
  }),
  Object.freeze({
    code: "pt",
    htmlLang: "pt-BR",
    hreflang: "pt",
    ogLocale: "pt_BR",
    label: "Português",
    shortLabel: "PT",
    direction: "ltr",
    ollamaName: "Brazilian Portuguese"
  })
]);

export const sourceLocale = locales[0];
export const translatedLocales = Object.freeze(locales.slice(1));

export const localizedPages = Object.freeze([
  Object.freeze({ file: "index.html", path: "", kind: "home", priority: "1.0", changefreq: "weekly" }),
  Object.freeze({ file: "games/nature-seed.html", path: "games/nature-seed.html", kind: "game", priority: "0.85", changefreq: "weekly" }),
  Object.freeze({ file: "games/candy-shop.html", path: "games/candy-shop.html", kind: "game", priority: "0.85", changefreq: "weekly" }),
  Object.freeze({ file: "games/paint-blasters.html", path: "games/paint-blasters.html", kind: "game", priority: "0.85", changefreq: "weekly" }),
  Object.freeze({ file: "games/ball-is-god.html", path: "games/ball-is-god.html", kind: "game", priority: "0.85", changefreq: "weekly" }),
  Object.freeze({ file: "press-kit.html", path: "press-kit.html", kind: "press", priority: "0.65", changefreq: "monthly" }),
  Object.freeze({ file: "privacy.html", path: "privacy.html", kind: "policy", priority: "0.25", changefreq: "yearly" }),
  Object.freeze({ file: "legal.html", path: "legal.html", kind: "policy", priority: "0.25", changefreq: "yearly" }),
  Object.freeze({ file: "asset-usage.html", path: "asset-usage.html", kind: "policy", priority: "0.25", changefreq: "yearly" })
]);

export function pageUrl(locale, page) {
  const localePrefix = locale.code === sourceLocale.code ? "" : `${locale.code}/`;
  return `${siteOrigin}/${localePrefix}${page.path}`;
}

export function outputFile(locale, page) {
  return locale.code === sourceLocale.code ? page.file : `${locale.code}/${page.file}`;
}

export function alternateLinks(page) {
  return [
    ...locales.map(locale => ({ hreflang: locale.hreflang, href: pageUrl(locale, page) })),
    { hreflang: "x-default", href: pageUrl(sourceLocale, page) }
  ];
}
