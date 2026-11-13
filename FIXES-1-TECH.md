# Что исправить на сайте willowinworlds.com — часть 1: техника

- **Область:** деплой и CI, безопасность, сборка, доступность (WCAG 2.2 AA), валидность HTML, страница 404, JavaScript, CSS, PWA и RSS, производительность.
- **Часть 2:** [FIXES-2-CONTENT-SEO-SOCIAL.md](FIXES-2-CONTENT-SEO-SOCIAL.md) — Nature Seed и площадки, соцсети, SEO, локализация, тексты, юридическое.
- **Состояние на 13.11.2026:** ветка `35`, HEAD `b7a0fc8` (код `site/` совпадает с `5ac8791`). Прод https://willowinworlds.com задеплоен из этого же кода 13.11.2026.
- **Сайт не менялся.** Это только список работ.

## Откуда список

- **Источники.** 10 аудитов из `docs/`:
  - `doc1.md` — 10–11.11, сделан по текущему коду;
  - `doc3.txt`…`doc11.txt` — 3–8.11, сделаны по экспорту кода до смены домена;
  - `doc1.txt` и `doc2.txt` пустые.
  
  Плюс 10 сканов от 8.11 (`docs/scan1.txt`…`scan10.txt`): PageSpeed, GTmetrix, W3C, WAVE, MDN Observatory, securityheaders, deadlinkchecker, Rich Results, SSL Labs.
- **Как проверялось.** Около 390 сырых находок объединены по дублям. Каждая проверена против текущего кода и прода: curl, запуск инструментов сайта на копии, Firefox и Playwright на копии. Ошибочные и устаревшие советы аудитов собраны в разделе «Не делать» в конце файла.
- **Что изменилось после аудитов.** 10.11 домен в коде сменили на `willowinworlds.com`, контактную почту — на `willowinworlds@gmail.com`. Поэтому все находки про старый домен закрыты, в том числе 378 «битых ссылок» из deadlinkchecker.

## Как читать блок

- **Группа (префикс ID):**
  - **A** — деплой, безопасность, сборка, CI;
  - **B** — доступность, HTML, страница 404;
  - **C1** — JavaScript, CSS, PWA, RSS;
  - **C2** — производительность.
- **Приоритет:**
  - **P0** — сломан основной путь пользователя (таких нет);
  - **P1** — блокер релиза;
  - **P2** — закрыть в ближайшем цикле;
  - **P3** — полировка и техдолг.
- **Статус:**
  - ПОДТВЕРЖДЕНО;
  - ЧАСТИЧНО — верна только часть утверждения;
  - ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА — статически не проверить;
  - РЕШЕНИЕ ВЛАДЕЛЬЦА — выбор за вами, а не дефект кода.
- **«Где сейчас»** — номера строк текущего HEAD.
- Почти любая правка шаблона страницы требует перегенерации 41 локали (`node site/tools/localize-site.mjs`) и затем `node site/tools/quality-check.mjs`.

## Сводка

| Группа | P0 | P1 | P2 | P3 | Всего |
|---|---:|---:|---:|---:|---:|
| A — Деплой, безопасность, сборка, CI | 0 | 2 | 8 | 15 | 25 |
| B — Доступность, HTML, 404 | 0 | 2 | 9 | 14 | 25 |
| C1 — JS, CSS, PWA, RSS | 0 | 1 | 2 | 23 | 26 |
| C2 — Производительность | 0 | 0 | 3 | 13 | 16 |
| **Итого** | **0** | **5** | **22** | **65** | **92** |

**Сканы от 8.11, до смены домена:**

| Сканер | Результат | Что за этим стоит |
|---|---|---|
| PageSpeed | mobile 97, desktop 100; Accessibility 100, SEO 100 | — |
| GTmetrix | 74% | — |
| securityheaders | **F** | см. A-04 |
| MDN Observatory | **C**, 55/100 | см. A-04 |
| SSL Labs | B | на стороне GitHub Pages |
| WAVE | 18 ошибок | это inline SVG без `aria-hidden`, см. B-17; контрастных ошибок 0 |
| W3C | 1 error, 9 warnings | см. B-18, B-19 |
| Rich Results | без ошибок | — |

## Порядок работ

1. **A-08.** Разрешить в `security-check` ссылки на площадки и соцсети. Без этого не сделать два P1 из части 2.
2. **C1-01.** Невалидный `#хеш` в адресе вешает вкладку. Правка на 1–3 строки.
3. **B-08.** Корневые пути на странице 404.
4. **B-01.** Шапка на ширине 320 px и при 200% текста.
5. **A-01 и A-03.** Деплой только после полного `quality-check`. Затем **A-02** — правила для ветки `35`.
6. **Доступность, P2:**
   - C1-03 — skip link и якоря;
   - C1-02 — Escape и фокус;
   - B-03, B-04;
   - B-05 — кнопка паузы анимаций;
   - B-06 — видимый фокус;
   - B-07;
   - B-09…B-12 — страница 404.
7. **Производительность, P2:**
   - C2-01 — иконки по 65–108 КБ в слоте 46 px;
   - C2-02 — тяжёлые картинки карточек;
   - C2-03 — вспышка тёмной темы.
8. **Решения владельца:**
   - A-04 — заголовки безопасности: остаться на GitHub Pages как есть или поставить CDN;
   - A-11 — деплоить ли `dist` (от этого зависят A-05…A-07);
   - A-09 и A-10 — DNS: почтовая политика домена и верификация домена в GitHub Pages.
9. **P3** — по мере сил.

## Все пункты

| ID | P | Статус | Что не так |
|---|---|---|---|
| A-01 | P1 | ПОДТВЕРЖДЕНО | Публикация на прод не зависит от проверок (нет gate, нет `needs`, нет concurrency, нет smoke) |
| A-08 | P1 | ПОДТВЕРЖДЕНО | `security-check` запрещает любые внешние `https`-ссылки — блокирует кнопку «Play» и соцсети |
| B-01 | P1 | ПОДТВЕРЖДЕНО | Шапка не помещается на 320 px и при 200% текста (AUD-01) |
| B-08 | P1 | ПОДТВЕРЖДЕНО | Страница 404 на вложенных URL ломается: без стилей и игры, «Home» ведёт в тупик |
| C1-01 | P1 | ПОДТВЕРЖДЕНО | Некорректный URL-фрагмент (`/#1`, `/#a=b`, `/#%25`) обрывает инициализацию и подвешивает вкладку |
| A-02 | P2 | ПОДТВЕРЖДЕНО | Production-ветка `35` не защищена |
| A-03 | P2 | ПОДТВЕРЖДЕНО | CI `Site Quality` не запускает полный `quality-check`: нет `link-check` и `localize-site --check` |
| A-04 | P2 | ПОДТВЕРЖДЕНО | HTTP-заголовки безопасности на проде не отправляются (ограничение GitHub Pages) |
| A-05 | P2 | ПОДТВЕРЖДЕНО | Минификатор CSS ломает `calc()` с `+` и описательные селекторы с `:is()` (только `dist`) |
| A-06 | P2 | ПОДТВЕРЖДЕНО | Минификатор HTML склеивает слова между соседними `<span>` (только `dist`) |
| A-07 | P2 | ПОДТВЕРЖДЕНО | `css/home-polish-2026.css` не входит в сборку и в списки проверок (на проде файл отдаётся) |
| A-09 | P2 | ПОДТВЕРЖДЕНО | У `willowinworlds.com` нет MX/SPF/DMARC: домен можно подделывать в почте |
| A-10 | P2 | ПОДТВЕРЖДЕНО | Нет постоянной TXT-записи верификации домена GitHub Pages |
| B-03 | P2 | ПОДТВЕРЖДЕНО | Skip link перехватывает pointer после Tab (AUD-10) |
| B-04 | P2 | ПОДТВЕРЖДЕНО | Невидимые кнопки Easter egg кликабельны при выключенном Magic hunt (AUD-17) |
| B-05 | P2 | ПОДТВЕРЖДЕНО | Нельзя остановить постоянную анимацию (WCAG 2.2.2, уровень A) |
| B-06 | P2 | ПОДТВЕРЖДЕНО | Фокус на ссылках потерян: подсвечивается только слабым фоном (WCAG 1.4.11) |
| B-07 | P2 | ПОДТВЕРЖДЕНО | Фокус теряется после закрытия формы контакта, открытой из Careers |
| B-09 | P2 | ПОДТВЕРЖДЕНО | На 404 невидимые кнопки остаются в Tab-порядке и кликабельны |
| B-10 | P2 | ПОДТВЕРЖДЕНО | На 404 глобальный перехват Space и клавиш ломает кнопки и повторяется при удержании |
| B-11 | P2 | ПОДТВЕРЖДЕНО | 404: часть интерфейса обрезана без прокрутки, нет масштабирования |
| B-12 | P2 | ПОДТВЕРЖДЕНО | На 404 весь HUD — aria-live и переписывается каждый кадр |
| C1-02 | P2 | ПОДТВЕРЖДЕНО | Escape уводит фокус и прокрутку к устаревшему триггеру info-окна |
| C1-03 | P2 | ПОДТВЕРЖДЕНО | Skip link и внутренние якоря: фокус не переносится, URL и история не обновляются |
| C2-01 | P2 | ПОДТВЕРЖДЕНО | Страницы игр и 404: иконка/логотип 44–46 px грузится полноразмерным файлом с `fetchpriority="high"` и preload |
| C2-02 | P2 | ПОДТВЕРЖДЕНО | Главная: тяжёлые растровые картинки карточек игр без адаптивных вариантов (вес страницы 1.49 MB) |
| C2-03 | P2 | ПОДТВЕРЖДЕНО | Тема определяется в конце `body`: тёмная заглушка на первом кадре, затем переключение и повторная загрузка логотипа |
| A-11 | P3 | ПОДТВЕРЖДЕНО | `dist` не является артефактом деплоя: сборка и публикация живут по разным моделям |
| A-12 | P3 | ПОДТВЕРЖДЕНО | Сборка удаляет `dist` до готовности новой версии; `minifyJs` только обрезает строки |
| A-13 | P3 | ПОДТВЕРЖДЕНО | Ни одна проверка не смотрит на собранный `dist` |
| A-14 | P3 | ПОДТВЕРЖДЕНО | Покрытие проверок: `security-check` и `visual-check` не видят локали; `link-check` пропускает `#`-якоря |
| A-15 | P3 | ПОДТВЕРЖДЕНО | На проде опубликованы служебные файлы: `tools/`, `deploy/`, `_headers`, `_redirects`, `QUALITY_CHECKS.md` |
| A-16 | P3 | ПОДТВЕРЖДЕНО | GitHub Actions закреплены на major-тегах, у `site-quality.yml` нет `permissions` |
| A-17 | P3 | ПОДТВЕРЖДЕНО | `security.txt` без обязательного поля `Expires` |
| A-18 | P3 | ПОДТВЕРЖДЕНО | GitHub не распознаёт политику безопасности репозитория |
| A-19 | P3 | ПОДТВЕРЖДЕНО | У apex-домена нет `AAAA` |
| A-20 | P3 | ПОДТВЕРЖДЕНО | В nginx-конфиге блок `types` без AVIF, ICO, JSON, JPEG (конфиг не используется) |
| A-21 | P3 | ПОДТВЕРЖДЕНО | Версии `?v=` и дата локализации обновляются вручную |
| A-22 | P3 | ПОДТВЕРЖДЕНО | Ограничения CSP (`trusted-types 'none'`, `frame-src/media-src/connect-src 'none'`) нигде не задокументированы |
| A-23 | P3 | ЧАСТИЧНО | Нет автотестов поведения (меню, фокус, модалки, 404-игра) |
| A-24 | P3 | ЧАСТИЧНО | Хеш `sha256-...` в CSP относится к JSON-LD и ничего не защищает |
| A-25 | P3 | ЧАСТИЧНО | Домен и почта в инструментах: централизовано, остался один хвост |
| B-14 | P3 | ПОДТВЕРЖДЕНО | Мобильное меню: Escape не возвращает фокус на кнопку меню |
| B-15 | P3 | ПОДТВЕРЖДЕНО | Секретная награда не возвращает фокус |
| B-16 | P3 | ПОДТВЕРЖДЕНО | Языковой переключатель: Escape и клик снаружи не закрывают, видимая «EN» не входит в имя |
| B-17 | P3 | ПОДТВЕРЖДЕНО | WAVE «Missing alternative text ×18» — это 18 inline `<svg>` без `aria-hidden` |
| B-18 | P3 | ПОДТВЕРЖДЕНО | W3C Nu: `section#about` и 7 `article.faq-item` «без заголовка» (8 предупреждений) |
| B-19 | P3 | ПОДТВЕРЖДЕНО | W3C Nu: устаревший `<meta http-equiv="content-language">` |
| B-20 | P3 | ПОДТВЕРЖДЕНО | 404: canvas без текстовой альтернативы, toast без live-region, aria-label паузы устарел |
| B-22 | P3 | ПОДТВЕРЖДЕНО | 404: resize без debounce, canvas пуст до следующего кадра, звёзды пересоздаются |
| B-23 | P3 | ПОДТВЕРЖДЕНО | 404.js: переполнение `maxDrops` и мёртвое поле `cat.caughtTime` |
| B-24 | P3 | ЧАСТИЧНО | 404: холостой цикл отрисовки в idle |
| B-25 | P3 | ЧАСТИЧНО | 404: подготовка спрайтов на главном потоке — влияние мало |
| B-26 | P3 | ЧАСТИЧНО | 404: при ошибке загрузки спрайта цикл кадров падает |
| B-27 | P3 | ЧАСТИЧНО | 404: игровой цикл не учитывает `prefers-reduced-motion` — но 2.2.2 не нарушен |
| B-28 | P3 | ЧАСТИЧНО | `aria-current="page"` на ссылках секций |
| C1-05 | P3 | ПОДТВЕРЖДЕНО | RSS теряет историю и содержит ложные permalink GUID |
| C1-06 | P3 | ПОДТВЕРЖДЕНО | Один общий manifest возвращает установленное приложение на английскую главную |
| C1-07 | P3 | ПОДТВЕРЖДЕНО | В `scripts.js` остались недостижимые UI-ветки (~150 строк) |
| C1-08 | P3 | ПОДТВЕРЖДЕНО | FAQ без JavaScript остаётся свёрнутым |
| C1-09 | P3 | ПОДТВЕРЖДЕНО | Смена темы ОС перезаписывает ручной выбор в текущей сессии |
| C1-10 | P3 | ПОДТВЕРЖДЕНО | Fallback копирования использует устаревший `document.execCommand("copy")` |
| C1-11 | P3 | ПОДТВЕРЖДЕНО | Режим сниженных эффектов определяется один раз и только там, где есть `navigator.connection` |
| C1-12 | P3 | ПОДТВЕРЖДЕНО | `backdrop-filter` везде без `-webkit-` префикса |
| C1-13 | P3 | ПОДТВЕРЖДЕНО | На hover карточки devlog анимируется `padding` (reflow) |
| C1-14 | P3 | ЧАСТИЧНО | `handlePointerDown` подписан и на `click`, и на `touchend` |
| C1-15 | P3 | ЧАСТИЧНО | 404-игра: направление «залипает», если кнопку или клавишу отпустили вне кнопки или окна |
| C1-16 | P3 | ЧАСТИЧНО | Мёртвый CSS: найдены 4 класса и 1 id без единой ссылки в разметке и JS |
| C1-17 | P3 | ЧАСТИЧНО | Главная перекрашивается вторым слоем `home-polish-2026.css`, часть правил дублируется между играми |
| C1-18 | P3 | ЧАСТИЧНО | `Inter` указан первым в стеке шрифтов, но не подключён |
| C1-19 | P3 | ЧАСТИЧНО | Факты об играх дублируются в нескольких местах |
| C1-21 | P3 | ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА | Залипающий `:hover` на сенсорных устройствах |
| C1-22 | P3 | ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА | Прокрутка фона под модальным окном на iOS Safari |
| C1-23 | P3 | ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА | Мелкий шрифт: 31 фиксированное объявление меньше 12 px |
| C1-24 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | `color-mix()` везде без запасного значения |
| C1-25 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | PWA `display: standalone` без offline-стратегии |
| C1-26 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | `scripts.js` — монолит на 2199 строк |
| C1-27 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Адрес в `mailto:` виден сборщикам спама |
| C1-28 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Нет аналитики и мониторинга ошибок |
| C2-04 | P3 | ПОДТВЕРЖДЕНО | 17 render-blocking CSS-файлов на главной (12 на страницах игр, 18 на press-kit, 8 на legal/privacy/asset-usage) |
| C2-05 | P3 | ПОДТВЕРЖДЕНО | `scripts.js` и `game-theme.js` без `defer` и без минификации; минифицированный `dist` не публикуется |
| C2-06 | P3 | ПОДТВЕРЖДЕНО | Главная: три изображения с `fetchpriority="high"` + preload sketch; painted-слой невидим первые ~4.3 s |
| C2-07 | P3 | ПОДТВЕРЖДЕНО | Press-kit и страницы игр: `srcset` смешивает `previews/` и `downloads/` для миниатюр 76 px |
| C2-08 | P3 | ПОДТВЕРЖДЕНО | 404-игра: работа каждый кадр и синхронная обработка спрайтов |
| C2-09 | P3 | ПОДТВЕРЖДЕНО | `content-visibility: auto` с фиксированным `contain-intrinsic-size: 720px` |
| C2-10 | P3 | ПОДТВЕРЖДЕНО | Принудительный reflow, длинные задачи и немоноскомпозитные анимации на главной (по сканам) |
| C2-11 | P3 | ЧАСТИЧНО | Ленивая загрузка в первом экране: только `nature-seed.html:146` |
| C2-12 | P3 | ЧАСТИЧНО | Курсор-маскот: rAF-цикл не засыпает; `getBoundingClientRect` в `initCardShine` (только десктоп) |
| C2-13 | P3 | ЧАСТИЧНО | Бесконечные CSS-анимации: пауза вне экрана есть на главной, нет на страницах игр, press-kit и 404 |
| C2-14 | P3 | ЧАСТИЧНО | Canvas главной: порог деградации FPS 28 при лимите 30, цикл не засыпает; память при больших DPR ограничена |
| C2-15 | P3 | ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА | `backdrop-filter` (37 blur-деклараций) без мобильного fallback; поломка на iOS Safari не подтверждена |
| C2-16 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Кэш: GitHub Pages отдаёт `cache-control: max-age=600` для всего; настроить нельзя |


## P1 — блокеры

### A-01 [P1] Публикация на прод не зависит от проверок (нет gate, нет `needs`, нет concurrency, нет smoke)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `.github/workflows/pages.yml:3-6` (deploy на каждый push в `35`), `:22-25` (`actions/checkout` с `ref: "35"`, не `github.sha`), `:30-33` (грузится весь `./site`), единственный job `deploy` без `needs`, без `concurrency`, без шага проверки ответа после деплоя. `site-quality.yml` отдельный workflow (`on: push/pull_request/schedule`), красный результат деплой не останавливает.
- Проблема: любой push в `35` (в том числе с ошибкой в ссылках, локалях, SEO или с утечкой запрещённого файла) сразу уходит на прод; нет привязки деплоя к проверенному SHA.
- Как исправить: в `pages.yml` добавить job `quality` (checkout, `actions/setup-node` v22, `node site/tools/quality-check.mjs`), у `deploy` поставить `needs: quality`; убрать `ref: "35"` (по умолчанию при push берётся `github.sha`); добавить `concurrency: {group: pages, cancel-in-progress: false}`; после деплоя шаг `curl -fsSI` на `/` (200) и на заведомо несуществующий URL (ожидать 404). Проверка заголовков безопасности после деплоя имеет смысл только после решения по A-04.
- Критерий готовности: `rg -n 'needs:|quality-check.mjs|concurrency' .github/workflows/pages.yml` показывает все три; тестовый push с намеренно битой ссылкой в служебной ветке/форке завершается красным job `quality` без запуска `deploy`.
- Источники: AUD-04, doc11-09 (CI-конфиги есть, но неполные), doc7a-16

### A-08 [P1] `security-check` запрещает любые внешние `https`-ссылки — блокирует кнопку «Play» и соцсети
- Статус: ПОДТВЕРЖДЕНО. Проверено 13.11 на копии: одна ссылка `https://willowinworlds.itch.io/nature-seed` в `index.html` → `index.html: unsafe href URL …`, проверка падает. Группа A получила тот же результат со ссылкой на Google Play.
- Где сейчас: `site/tools/security-check.mjs:152-159`. Атрибуты `href|src|action`, начинающиеся с `http(s):`, `//`, `javascript:` или `data:text/html`, считаются ошибкой. Исключение одно: `href`, начинающийся с `${siteOrigin}/`. Отдельно строка `:142` запрещает тексты-заглушки «Telegram/Discord/X placeholder» — эту строку не трогать. Проверяются 10 корневых страниц (`:64-75`). Проверка запускается в CI (`site-quality.yml:36-37`) и в `quality-check`.
- Проблема: обе главные продуктовые правки красят проверки — кнопка «Play» у Nature Seed (D2-01, часть 2) и ссылки на соцсети (D1-01, часть 2). Сейчас красный только CI, потому что деплой не ждёт проверок. После A-01 это станет жёстким блокером. CSP обычные `<a href>` не ограничивает, так что запрет избыточен.
- Как исправить: в `:154-156` пропускать `href` со схемой `https:`, если `new URL(url).hostname` входит в явный список: `willowinworlds.itch.io`, `gamejolt.com`, `www.indiexpo.net`, `www.youtube.com`, `www.tiktok.com`, `www.instagram.com`, `www.threads.com`, `www.facebook.com`, `x.com`, `www.reddit.com`, `vk.ru`, `t.me`. Для `src`, `action` и `http:` запрет оставить. Список держать в одном месте, рядом с наборами соцсетей (см. часть 2, «Соцсети: раскладка по локалям»). Делать первым, до D2-01 и D1-01.
- Критерий готовности: копия с `href="https://willowinworlds.itch.io/nature-seed"` проходит `node site/tools/security-check.mjs`; `href="https://evil.example/"` и любой внешний `src` по-прежнему дают ошибку.
- Источники: doc4-03, doc10-32; повторно проверено основной сессией 13.11. Приоритет поднят с P2: это предусловие двух P1 из части 2.

### B-01 [P1] Шапка не помещается на 320 px и при 200% текста (AUD-01)
- Статус: ПОДТВЕРЖДЕНО (по docs/doc1.md, не перепроверялось)
- Где сейчас: `site/index.html:252` (menu toggle), `site/css/base.css:295,303,421`, `site/css/responsive-tablet.css:42`
- Проблема: на 320 px кнопка меню целиком за правым краем (x=320.58, ширина 44), горизонтальной прокрутки нет — основную навигацию не открыть; при 200% текста действия шапки уходят за 1280 px. WCAG 1.4.4 / 1.4.10.
- Как исправить: см. doc1 AUD-01 — `min-width:0` у центральной части шапки и ограничение ширины бренда (`base.css:303`), второстепенные действия переносить в меню на узких экранах, toggle 44 px целиком внутри viewport.
- Критерий готовности: на 320/340/360/375/390 px и при 200% текста `document.getElementById('menuToggle').getBoundingClientRect().right <= innerWidth`, все действия шапки достижимы.
- Источники: AUD-01

### B-08 [P1] Страница 404 на вложенных URL ломается: без стилей и игры, «Home» ведёт в тупик
- Статус: ПОДТВЕРЖДЕНО на проде 13.11.
- Где сейчас: `site/404.html:9-12,20-21,28,44,73-77,90,101` — пути относительные (`404.css`, `404.js`, `favicon.ico`, `assets/…`, `index.html`). `site/404.js:19` — `assetBase = "assets/404/"`. Что видно на проде:
  - `/games/nonexistent-page` отдаёт 404.html, но `/games/404.css` → 404, то есть стиль не грузится;
  - «Home» ведёт на `/games/index.html`, а это снова 404;
  - на `/ru/<любой путь>` «Home» ведёт на `/ru/index.html`, то есть на RU-главную, а не на корень;
  - `/404.css` → 200.
- Проблема: все 41 локаль и страницы игр лежат в подпапках. Любая битая ссылка внутри `/games/…` или `/<lang>/…` показывает голый HTML без оформления и без игры, а кнопка возврата снова даёт 404. Для посетителя это единственный путь выбраться после ошибки. `<base>` использовать нельзя: CSP `base-uri 'none'` (`404.html:7`).
- Как исправить: в `404.html` перейти на корневые пути: `/404.css`, `/404.js`, `/favicon.ico`, `/assets/…`, `href="/"` вместо `index.html`. В `404.js:19` поставить `"/assets/404/"`. В `404.css` нет `url()`. После правки прогнать `security-check` и `seo-check`.
- Критерий готовности: `curl -s https://willowinworlds.com/games/missing/page | rg 'href="/404.css"'` находит строку; страница открывается со стилями, «Home» ведёт на `/`.
- Источники: doc9-05, doc5-21 (это же D1-02 из проверки SEO); повторно проверено основной сессией 13.11. Приоритет поднят с P2: ломается путь восстановления на всех вложенных URL.

### C1-01 [P1] Некорректный URL-фрагмент (`/#1`, `/#a=b`, `/#%25`) обрывает инициализацию и подвешивает вкладку
- Статус: ПОДТВЕРЖДЕНО (тяжелее, чем в аудитах: они описывали «пропали анимации», на деле — зависание)
- Где сейчас: `site/scripts.js:2021` (`document.querySelector(window.location.hash)`), `:2010` (то же для `a[href^="#"]`), порядок инициализации `:2184-2198`, `state.width: 0` на `:90`, бесконечный цикл `:540` (`for (x = -w*0.08; x <= w*1.12; x += w*0.12)` при `w = 0`); затронуты все 42 страницы со `scripts.js` (главная + 41 локаль); прод `https://willowinworlds.com/scripts.js` идентичен локальному.
- Проблема: `querySelector("#1")` бросает `SyntaxError`, поэтому `initCardShine`, `initReveals`, `initActiveNavigation`, `initGameAnimationVisibility`, `initPerformanceVisibility`, `setTheme` и главное `resize()` (`:2197`) не выполняются, `state.width` остаётся 0. Загрузка `magic-cat-mascot.webp` (`:2178`) запускает `startLoop` → `render` → `drawBackground` → `drawPaintedValley` → `drawHillLayer(w=0)`, где шаг цикла равен 0, и вкладка зависает. Любой человек может опубликовать ссылку, замораживающую вкладку посетителя.
- Как проверено: Firefox 159, `index.html#1`, `#a=b`, `#%25` — `pageerror: SyntaxError: Document.querySelector: '#N' is not a valid selector`, затем `page.evaluate` не отвечает 3 с (`TIMEOUT`), на `#games` страница отзывчива; в той же копии с одной добавленной строкой `if (!w) return;` в `drawHillLayer` на `#1` зависания нет. `#:~:text=` браузеры из `location.hash` убирают, его это не касается.
- Как исправить: (1) `:2021` → `let target; try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }` (`decodeURIComponent` тоже бросает на одиноком `%`); (2) `:2010` → `document.getElementById(id.slice(1))`; (3) защита от нулевого размера: `if (!state.width || !state.height) return;` в начале `render()` (`:1305`) — `innerWidth === 0` возможен и без хеша, например в скрытом iframe или WebView.
- Критерий готовности: открыть `/#1`, `/#a=b`, `/#%25` в Firefox и Chrome — вкладка отзывчива, в консоли нет `SyntaxError`, `document.getElementById('magicCanvas').width > 300`.
- Источники: doc4-35, doc5-06, doc9-03 (часть про hash)


## P2 — ближайший цикл

### A-02 [P2] Production-ветка `35` не защищена
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: GitHub API на 2026-11-13 (без авторизации): `GET /repos/MrExavius/WillowinWorld/branches/35` -> `"protected": false`; `GET /repos/MrExavius/WillowinWorld/rulesets` -> `[]`. Репозиторий публичный.
- Проблема: прямой push, force-push и удаление ветки `35` возможны без PR и без required checks; ветка = прод.
- Как исправить: GitHub Settings -> Rules -> Rulesets: для `35` запретить force-push и удаление, потребовать статус-проверку `Site Quality` (после A-01/A-03 это один и тот же gate). Требование PR/review для одного владельца необязательно (лишнее трение, опционально).
- Критерий готовности: `curl -s https://api.github.com/repos/MrExavius/WillowinWorld/branches/35 | rg protected` даёт `true` (или `rulesets` непустой).
- Источники: AUD-15. Приоритет понижен с P1: репозиторий, судя по API, у одного владельца, а основной риск (деплой без проверок) закрывает A-01; P1 вернуть, если появятся коллабораторы.

### A-03 [P2] CI `Site Quality` не запускает полный `quality-check`: нет `link-check` и `localize-site --check`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `.github/workflows/site-quality.yml:22-49`. CI выполняет `node --check` только для 11 файлов (нет `link-check`, `localize-site`, `localization-config`, `visual-check`), затем `security-check`, `css-coverage-audit` (только отчёт, никогда не падает), `sync-devlogs --check`, `seo-check`, `build-minified`. Не запускаются `node site/tools/link-check.mjs` и `node site/tools/localize-site.mjs --check`; сам `quality-check.mjs` (`site/tools/quality-check.mjs:3-22`) только проверяется на синтаксис (`site-quality.yml:33`). Копия на моей стороне: `node site/tools/quality-check.mjs` проходит (link, localize 41x9, devlog, SEO 379 страниц, security).
- Проблема: битая ссылка или рассинхрон 41 локали с английским источником проходят CI зелёным. Сборка `build-minified` проходит, но результат никто не проверяет (см. A-13).
- Как исправить: заменить шаги проверок одним `run: node site/tools/quality-check.mjs` (он агрегирует все те же проверки плюс два недостающих), `css-coverage-audit` оставить отдельным информационным шагом. Права: добавить `permissions: {contents: read}` (см. A-16).
- Критерий готовности: `rg -n 'quality-check.mjs' .github/workflows/site-quality.yml` показывает `run:`-шаг (не `--check`); искусственно испорченная ссылка в копии ветки даёт красный CI.
- Источники: AUD-04, doc3-29, doc7a-16, doc11-09. Не проверено: прогон на Node 22 (локально Node 26); инструменты используют только встроенные модули Node.

### A-04 [P2] HTTP-заголовки безопасности на проде не отправляются (ограничение GitHub Pages)
- Статус: ПОДТВЕРЖДЕНО (само исправление — РЕШЕНИЕ ВЛАДЕЛЬЦА: смена хостинга/CDN)
- Где сейчас: `curl -sSI https://willowinworlds.com/` (2026-11-13): `server: GitHub.com`, `access-control-allow-origin: *`, `cache-control: max-age=600`; нет `strict-transport-security`, `content-security-policy`, `x-frame-options`, `x-content-type-options`, `referrer-policy`, `permissions-policy`. `http://willowinworlds.com/` отвечает 301 на https. Файлы `site/_headers`, `site/deploy/nginx-security.conf`, `apache-security.htaccess` на Pages не применяются. Есть только meta-CSP (`site/index.html:28`, одинаковая на `/` и `/ru/`); в meta невозможны `frame-ancestors`, `report-uri`, `report-to`, `sandbox`, а HSTS/XFO/XCTO вообще только заголовками. Отсюда scan7 grade F, scan6 55/100 (C).
- Проблема: защита слабее заявленной в `site/SECURITY.md` («`_headers` and `deploy/nginx-security.conf` provide the stronger HTTP-header layer»). Реальный риск мал: сайт статический, без аккаунтов, платежей, форм и сторонних скриптов (clickjacking и downgrade на витрине малозначимы), HTTPS-редирект работает. Нет и канала отчётов о нарушениях CSP (невозможен в meta).
- Как исправить: минимум без смены хостинга: в `site/SECURITY.md` и `site/QUALITY_CHECKS.md` написать, что на GitHub Pages заголовки не отправляются, действует только meta-CSP, `_headers`/`deploy/*` нужны лишь при переезде. Опционально (тяжёлое, решение владельца): поставить перед Pages прокси/CDN, умеющий добавлять заголовки, или переехать на хостинг с поддержкой `_headers` (формат файла уже подходит Netlify/Cloudflare Pages; не проверялось). При переезде в `_headers` заменить `/assets/*` immutable на короткий TTL (см. A-21) и добавить проверку заголовков после деплоя (шаг из A-01). Не гнаться за правилами сканеров вроде `default-src 'none'` (scan6).
- Критерий готовности: либо `curl -sSI https://willowinworlds.com/ | rg -i 'strict-transport|content-security|x-frame|x-content-type'` показывает 4 заголовка, либо в SECURITY.md явно записано, что их нет и почему.
- Источники: AUD-03, doc4-22, doc7a-04, doc10-10, doc6-14, doc11-49, doc5-27, doc8-26 (часть про отчётность), doc8-15 (TTL 600 с на всех файлах, см. также «Передать»), scan6, scan7. Заодно scan7/scan6: `access-control-allow-origin: *` и отсутствие COOP/COEP/CORP, на Pages не меняются.

### A-05 [P2] Минификатор CSS ломает `calc()` с `+` и описательные селекторы с `:is()` (только `dist`)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/tools/build-minified.mjs:89` (`.replace(/\s*([{}:;,>+~])\s*/g, "$1")`). Сборка на копии: `dist/css/*.css` содержит 27 выражений `calc()` без пробелов вокруг `+` в 8 файлах (`calc(100%+4px)`, `calc(var(--header-h)+28px)`, `calc(90ms+(var(--nav-index) * 62ms))`; источники `css/base.css:92,401,570,579,599,1246`, `candy-page.css:37-38`, `home-card-base.css:4`, `keyframes.css`, `press-kit.css:450`, `responsive-desktop.css:4`, `responsive-tablet.css:35,98`, `site-sections.css:917`). В CSS `+` в `calc()` обязан иметь пробелы с обеих сторон, иначе объявление отбрасывается: пропадают отступ героя под шапкой, `scroll-padding/margin-top`, позиции выпадающих элементов, задержки анимации меню. Дополнительно (в отчётах не было): `:` в классе `[{}:;,>+~]` схлопывает пробел перед `:is()` -> `.update-list :is(span,time)` превращается в `.update-list:is(span,time)` (`css/game-content.css:43`), и `.game-detail-page :is(...):focus-visible` (`css/game-content.css:300`, фокус-кольца навигации и кнопок на страницах игр) перестаёт совпадать.
- Проблема: сборка проходит зелёной (A-13), но результат с поломанной вёрсткой. На проде не воспроизводится (отдаётся исходный CSS). Визуально в браузере не проверялось, вывод по спецификации CSS и тексту `dist`.
- Как исправить: изменить строку 89 на `.replace(/\s*([{};,])\s*/g, "$1")`. Проверено на копии: 0 сломанных `calc` из 69, `.update-list :is(span,time)` сохраняется.
- Критерий готовности: `rg -P 'calc\((?:[^;{}()]|\([^()]*\))*[^\s(]\+[^\s)]' site/dist --glob '*.css'` не выводит ничего (до исправления находит `base.css`, `candy-page.css`, `keyframes.css`, `responsive-tablet.css`).
- Источники: doc9-01, doc4-04, doc5-02, doc10-12. Приоритет понижен с P1 (отчёты): `dist` не публикуется; P0 при переходе на `dist`.

### A-06 [P2] Минификатор HTML склеивает слова между соседними `<span>` (только `dist`)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/tools/build-minified.mjs:80` (`.replace(/>\s+</g, "><")`). `site/index.html:656` `<span class="title-line">From first hook</span> <span class="title-line">to polished mobile release.</span>` в `dist/index.html` получает `</span><span` без пробела; то же на `:678` ("Latest dev notes," / "no digging."). Паттерн есть на 42 страницах (84 вхождения: EN и 41 локаль). `.title-line` становится `display:block` только при `min-width: 921px` (`css/home-polish-2026.css:189,237`), на 920 px и меньше слова склеиваются ("hookto").
- Проблема: заголовки двух секций главной читаются без пробела на мобильных/планшетных ширинах, если когда-либо публиковать `dist`. На проде не воспроизводится (отдаётся исходный HTML).
- Как исправить: `.replace(/>\s+</g, "> <")` (пробел сохраняется, потеря размера небольшая). Проверено на копии: в `dist/index.html` остаётся `From first hook</span> <span class="title-line">`.
- Критерий готовности: `rg -c '</span><span class="title-line">' site/dist/index.html` даёт `0`.
- Источники: doc10-02, doc4-04 (часть про HTML). Утверждение «`content: "A : B"` -> `"A:B"`» (doc4-04) не воспроизводится: в текущих CSS нет строк с такими символами (проверено скриптом по `css/*.css`, `motion.css`, `404.css`: 0).

### A-07 [P2] `css/home-polish-2026.css` не входит в сборку и в списки проверок (на проде файл отдаётся)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: подключён на 42 главных (`site/index.html:53`, `body class="home-polish-2026"` на `:217`; EN + 41 локаль); отсутствует в `cssFiles` (`site/tools/build-minified.mjs:27-51`), `cssFileNames` (`site/tools/security-check.mjs:9-31`), `cssFiles` (`site/tools/css-coverage-audit.mjs:7-30`). Сборка на копии: `dist/css/home-polish-2026.css` не существует, на него ссылаются 42 страницы `dist` (проверка локальных ссылок по `dist`: 2 уникальных отсутствующих пути, остальные 0). Прод: `curl -sSI https://willowinworlds.com/css/home-polish-2026.css` -> 200 `text/css`. Ещё `dist` теряет `SECURITY.md` (на него указывает `security.txt` `Policy:`) и `yandex_d08a3b38c62144a2.html`.
- Проблема: на проде проблемы нет; `dist` теряет главный слой стилей главной (23 КБ). Файл не попадает в security-check (проверка `@import`/внешних `url()`) и CSS-аудит.
- Как исправить: добавить `"css/home-polish-2026.css"` в три списка (после `responsive-preferences.css`); для `dist` при необходимости добавить `SECURITY.md` и `yandex_d08a3b38c62144a2.html` в `staticFiles`. Проверено: после добавления в копии `dist` ссылок на отсутствующие ресурсы нет.
- Критерий готовности: `rg -c 'home-polish-2026.css' site/tools/build-minified.mjs site/tools/security-check.mjs site/tools/css-coverage-audit.mjs` даёт по 1 в каждом файле; `ls site/dist/css/home-polish-2026.css` существует.
- Источники: doc9-02, doc4-06, doc10-01, doc10-14, doc11-07

### A-09 [P2] У `willowinworlds.com` нет MX/SPF/DMARC: домен можно подделывать в почте
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: DNS на 2026-11-13: `dig +short MX willowinworlds.com` пусто; TXT на apex только `google-site-verification=...` (нет `v=spf1`); `dig +short TXT _dmarc.willowinworlds.com` пусто. Контакт сайта: `willowinworlds@gmail.com`.
- Проблема: письма «от @willowinworlds.com» получатели не отвергают; репутационный риск фишинга от имени студии. Прямого ущерба посетителям сайта нет.
- Как исправить: в DNS у регистратора добавить, если домен не использует почту: `@ MX 0 .`, `@ TXT "v=spf1 -all"`, `_dmarc TXT "v=DMARC1; p=reject; adkim=s; aspf=s"`. Если планируется доменная почта, вместо этого настроить провайдера (MX/SPF/DKIM/DMARC).
- Критерий готовности: `dig +short TXT willowinworlds.com | rg spf1` и `dig +short TXT _dmarc.willowinworlds.com` возвращают записи.
- Источники: AUD-05. Приоритет понижен с P1: нет признаков злоупотребления, домен для почты не используется; P1, если на домене появится почтовый ящик или будут жалобы на фишинг.

### A-10 [P2] Нет постоянной TXT-записи верификации домена GitHub Pages
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `dig +short TXT _github-pages-challenge-mrexavius.willowinworlds.com` на 2026-11-13 пусто (совпадает с doc1).
- Проблема: при отвязке домена от Pages (удаление репозитория, смена настроек) другой пользователь GitHub мог бы привязать `willowinworlds.com` к своему репозиторию (domain takeover). Сейчас сайт работает, угроза потенциальная.
- Как исправить: GitHub Settings -> Pages -> Add/Verify domain, опубликовать выданную TXT-запись и не удалять её после статуса Verified.
- Критерий готовности: `dig +short TXT _github-pages-challenge-mrexavius.willowinworlds.com` возвращает значение; в Settings -> Pages домен Verified (статус в GitHub не проверялся, нужна авторизация).
- Источники: AUD-19

### B-03 [P2] Skip link перехватывает pointer после Tab (AUD-10)
- Статус: ПОДТВЕРЖДЕНО (по docs/doc1.md)
- Где сейчас: `site/css/base.css:205-220`
- Проблема: на 390 px сфокусированный skip link по центру сверху перекрывает кнопку темы; клик мышью/касанием уходит в ссылку.
- Как исправить: сместить `.skip-link` (например `left:12px`, без `translate(-50%)`) так, чтобы не лежать над `.header-actions` на узких экранах; keyboard-доступность сохранить.
- Критерий готовности: при сфокусированном skip link на 390 px `document.elementFromPoint(центр #themeToggle) === #themeToggle`.
- Источники: AUD-10

### B-04 [P2] Невидимые кнопки Easter egg кликабельны при выключенном Magic hunt (AUD-17)
- Статус: ПОДТВЕРЖДЕНО (по docs/doc1.md)
- Где сейчас: `site/scripts.js:1740-1766` (создание `.secret-glint`), `scripts.js:1693` (`collectSecret`), `site/css/site-sections.css:940-1001`
- Проблема: 13 прозрачных зон 46×46 px с `pointer-events:auto`; клик по пустому месту отмечает букву, показывает toast и глушит клик по контенту под ними. Кнопки `tabIndex=-1` и `aria-hidden` — с клавиатуры в охоту играть нельзя (связано с AUD-18, РЕШЕНИЕ ВЛАДЕЛЬЦА: игра для всех или декор).
- Как исправить: `.secret-glint{pointer-events:none}` по умолчанию, `body.promo-hunt-active .secret-glint{pointer-events:auto}`; guard `promo-hunt-active` в `collectSecret()`.
- Критерий готовности: при выключенном Magic hunt `getComputedStyle(glint).pointerEvents === 'none'` у всех `.secret-glint`.
- Источники: AUD-17; doc4-29 (pointer-only, см. «Отклонено»)

### B-05 [P2] Нельзя остановить постоянную анимацию (WCAG 2.2.2, уровень A)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: в `site/index.html` нет `#pauseMagic`, `#lowMotion`, `#disableMagic` (0 вхождений и в `games/*.html`), а `scripts.js:18-20,400-402,2054-2081` их ждёт; `<canvas id="magicCanvas">` `index.html:219`; `infinite` — 33 объявления в CSS главной (`nature-scene.css` 13, `home-ball-card.css` 8, `home-paint-card.css` 7, `home-candy-card.css` 3, `base.css` 1, `site-sections.css` 1); те же анимации на press-kit и страницах игр
- Проблема: измерено в Firefox 1280×800 — 20 бесконечных CSS-анимаций идут >5 с параллельно с контентом, кнопки паузы нет. Единственная защита — `prefers-reduced-motion` (`responsive-preferences.css:55-67` + `body.low-motion`, `scripts.js:240-244`): с ним 0 анимаций. Ручные классы покрывают мало: `body.magic-off`/`low-motion` ставят паузу только `.ambient-only` (`base.css:195-198`, `animation-play-state` не наследуется) — в тесте остаётся 16 из 20 (анимации карточки Nature Seed), как и `secretHuntPulse` (`site-sections.css:1011-1013,1024-1028`). Простое возвращение кнопки не решит задачу. Число «более 60» неточно: 33 на главной, 78 во всех `css/*.css`.
- Как исправить: (1) вернуть одну кнопку «Pause animation» (`id="pauseMagic"`, `aria-pressed`, подпись во всех локалях) рядом с `#themeToggle`; (2) расширить `base.css:195`: `body.magic-off *, body.magic-off *::before, body.magic-off *::after { animation-play-state: paused !important; }`. Смягчающий фактор для приоритета: `prefers-reduced-motion`, автопауза карточек вне экрана (`initGameAnimationVisibility`), пауза в скрытой вкладке.
- Критерий готовности: после нажатия кнопки `document.getAnimations().filter(a=>a.playState==='running'&&a.effect.getComputedTiming().iterations===Infinity).length === 0`, canvas не рисует.
- Источники: doc5-04, doc9-13

### B-06 [P2] Фокус на ссылках потерян: подсвечивается только слабым фоном (WCAG 1.4.11)
- Статус: ПОДТВЕРЖДЕНО (но для `.asset-link` / `.related-world-link` — НЕ подтверждено, см. ниже)
- Где сейчас: `site/css/base.css:414-419` (`.main-nav a:focus-visible`, `outline:none`), `base.css:771-776` (`.hero-worlds a`), `site/css/home-polish-2026.css:584-587` (`.contact-draft-row button`), `site/css/game-shell.css:167-174` (`.game-detail-nav a`, `.game-theme-toggle` — на `press-kit.html` не перекрыто), `site/404.css:216-223` (`.pill`, `.icon-pill`)
- Проблема: измерено Tab-проходом (Firefox): главная — 10 из 27 стопов без outline (6 пунктов меню + 4 ссылки hero-worlds), press-kit — 7 из 31, 404 — 9 из 10, страницы игр — 0. Контраст сфокусированного и обычного состояния по пикселям: меню 1.12:1 и 1.23:1 (две темы), hero-worlds 1.65:1 и 1.79:1, пилюли 404 1.01–1.17:1 — ниже 3:1. `.asset-link`/`.related-world-link` с `outline:none` перекрыты правилом `game-content.css:300-303` (3px outline) — у них проблемы нет. Утверждение doc3-16 «нет `:focus-visible`» неверно: есть `base.css:465-471` (`outline:2px solid var(--cyan)`).
- Как исправить: удалить `outline: none;` в перечисленных правилах (или добавить селекторы в группу `base.css:465-470`); для 404 — `.pill:focus-visible,.icon-pill:focus-visible,.control-option:focus-visible{outline:2px solid var(--cyan);outline-offset:3px}`.
- Критерий готовности: Tab-проход по `index.html`, `press-kit.html`, `404.html`: у каждого стопа `getComputedStyle(el).outlineStyle !== 'none'`.
- Источники: doc5-10, doc3-16

### B-07 [P2] Фокус теряется после закрытия формы контакта, открытой из Careers
- Статус: ПОДТВЕРЖДЕНО (общее утверждение doc8-13/doc7a-07 «фокус не возвращается нигде» НЕ подтверждено)
- Где сейчас: `site/scripts.js:1786-1801` (`openContact`: `closeInfoModals(false)` выполняется раньше `activeContactTrigger = trigger || document.activeElement`, то есть триггер — кнопка уже скрытой модалки), `scripts.js:1803-1811`; кнопка `index.html:876`
- Проблема: Playwright: «Careers / Collaboration» → «Open Contact Form» → ✕ (`#closeContact`) → `document.activeElement` = BODY. Прямые сценарии работают: Privacy → ✕ → ссылка «Privacy»; шапка «Contact studio» → ✕ или Escape → та же кнопка. Escape в сценарии Careers → Contact возвращает фокус на «Careers» только случайно (см. B-13).
- Как исправить: в `openContact` до `closeInfoModals(false)` вычислить начальный триггер: `activeContactTrigger = trigger && trigger.closest(".modal") ? (activeInfoTrigger || activeGameTrigger) : trigger;`.
- Критерий готовности: Careers → Open Contact Form → ✕: `document.activeElement` — кнопка «Careers / Collaboration».
- Источники: doc10-06, doc8-13, doc7a-07

### B-09 [P2] На 404 невидимые кнопки остаются в Tab-порядке и кликабельны
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/404.css:278-303` (`.overlay{pointer-events:none}`, но `.error-panel{pointer-events:auto}`; в `playing`/`paused` только `opacity:0`, строки 289-293), `404.css:231-254` (`.hud` в idle — `opacity:0`, без `visibility`)
- Проблема: измерено: в `playing` кнопки «Start game · Space», «Back to home», «Mouse», «Keyboard» имеют opacity 0, но получают Tab-фокус (невидимый, WCAG 2.4.7); `elementFromPoint` над невидимой «Start game» возвращает эту кнопку, клик перезапускает игру (повторный toast «Catch stars…»). В idle невидимы и фокусируемы «Pause» и «Back to home» из HUD.
- Как исправить: `visibility:hidden` для `.overlay` в `playing`/`paused` и для `.hud` вне `playing/paused/gameover` (с `transition: visibility 0s 260ms`, чтобы не ломать затухание).
- Критерий готовности: в `playing` Tab не попадает на элементы `#startOverlay`, `mouse.click` по месту «Start game» не вызывает `startGame`.
- Источники: doc10-28

### B-10 [P2] На 404 глобальный перехват Space и клавиш ломает кнопки и повторяется при удержании
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/404.js:1018-1033` (`keyDown` на `window`: `preventDefault()` для Space, A, D, стрелок без проверки цели, `event.repeat`, модификаторов; `p` и `t` переключают паузу и тему без проверок)
- Проблема: измерено: фокус на «Keyboard», Space → игра стартует, режим не меняется (`aria-pressed` остаётся `false`); удержание Space на кнопке темы → `playing, paused, playing, paused`. Enter работает. Одиночные буквенные горячие клавиши P/T/A/D без отключения — WCAG 2.1.4. `Ctrl/Alt/Meta+клавиша` тоже подавляется (влияние на браузерные сочетания — ТРЕБУЕТ БРАУЗЕРА).
- Как исправить: в начале `keyDown`: `if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;`; для Space — `if (event.target.closest("button, a")) return;`.
- Критерий готовности: Tab на «Keyboard», Space → `aria-pressed="true"`, `data-game-state` не меняется; удержание Space не переключает паузу.
- Источники: doc9-12, doc4-08, doc10-15, doc5-42, doc11-34 (часть про Space)

### B-11 [P2] 404: часть интерфейса обрезана без прокрутки, нет масштабирования
- Статус: ПОДТВЕРЖДЕНО (утверждение doc4-34, что недоступна кнопка возврата, — ЧАСТИЧНО: верхняя «Home» всегда видна)
- Где сейчас: `site/404.css:39-53` (`html, body{overflow:hidden}`), `404.css:70-80` (`.lost-stars-page`: fixed, `overflow:hidden`, `touch-action:none`, `user-select:none`), `404.css:278` (`.overlay` без прокрутки), `404.css:1012-1032` (`min-height` 500+ px), `404.css:1034,1069` (`overflow:auto` только при ≤920 px)
- Проблема: измерено (Playwright): ширина ≥921 px и высота ниже ≈700 px — карточка с кнопками, переключателем Mouse/Keyboard и подсказками не влезает и не прокручивается: 1366×600 — вне окна переключатель и подсказки; 1280×480 — ещё и «Start game»/«Back to home» в карточке; верхние «Home» и «Start game» остаются. Попадают 1920×1080 при 200% (960×540), 1440×900 при 150%. Без переключателя Keyboard игра с клавиатуры недоступна. Ширина ≤920 px прокручивается. `touch-action:none` на всей странице отключает щипок-зум — ТРЕБУЕТ УСТРОЙСТВА. `scrollbar-width:none` (doc7b-05) значения не имеет: `body` и так не прокручивается.
- Как исправить: добавить `overflow:auto` в `.overlay` (`404.css:278`, сейчас только в media ≤920) и при необходимости `place-items:safe center`; `touch-action:none` и `user-select:none` перенести с `.lost-stars-page` (строки 78-79) на `.lost-stars-canvas`.
- Критерий готовности: при 960×540 `#startOverlay` имеет `overflow-y:auto`, «Back to home» достижима прокруткой; щипок-зум работает на текстовой карточке (устройство).
- Источники: doc7b-04, doc4-34, doc10-25, doc7b-05 (часть)

### B-12 [P2] На 404 весь HUD — aria-live и переписывается каждый кадр
- Статус: ПОДТВЕРЖДЕНО (механизм); озвучка ТРЕБУЕТ СКРИНРИДЕРА
- Где сейчас: `site/404.html:83` (`<div class="hud" aria-live="polite">`), `site/404.js:243-253` (`updateHud` пишет `textContent` в 5 полей безусловно), `404.js:725` (вызов из `update()` каждый кадр)
- Проблема: за ~3 с игры 96 мутаций DOM внутри live-региона при неизменных значениях (`0, 0, x1, 3, None`) — в реальном браузере сотни в секунду; риск потока объявлений у скринридеров.
- Как исправить: убрать `aria-live` с `.hud`; в `updateHud` писать поле только при изменении (`if (el.textContent !== v) el.textContent = v`); события (жизнь, рекорд, конец игры) — через один `role="status"` (см. B-20).
- Критерий готовности: `MutationObserver` на `.hud` за 3 с игры без изменения счёта фиксирует 0 мутаций.
- Источники: doc4-09, doc10-29, doc11-34 (часть про HUD)

### C1-02 [P2] Escape уводит фокус и прокрутку к устаревшему триггеру info-окна
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:1501` (`activeInfoTrigger`), `:1583-1588` (`closeInfoModals` восстанавливает фокус безусловно), `:2133-2141` (Escape вызывает `closeContactModal(); …; closeInfoModals(); closeSecretReward();`), `:1673-1677` (`closeSecretReward` фокус не возвращает).
- Проблема: `activeInfoTrigger` не обнуляется после закрытия. Воспроизведено в Firefox 159: открыть и закрыть «Privacy» в футере, прокрутить вверх, нажать Esc — фокус переходит на футерную ссылку «Privacy», `scrollY` = 7105. Esc, закрывающий окно «Contact studio», тоже заканчивается на «Privacy», а не на кнопке «Contact studio». Это нарушает порядок фокуса (WCAG 2.4.3) для клавиатуры и скринридера.
- Как исправить: в `closeInfoModal` (`:1578-1580`) и `closeInfoModals` (`:1585-1587`) после `.focus()` добавить `activeInfoTrigger = null;`; во вторую функцию восстанавливать фокус только если окно действительно было открыто. В `closeSecretReward` вернуть фокус на элемент, открывший награду.
- Критерий готовности: сценарий выше — после второго Esc `document.activeElement` и `scrollY` не меняются; Esc на контактном окне возвращает фокус на «Contact studio».
- Источники: doc5-05, doc6-12 (проверенная цепочка «Contact → другое окно → Esc» сводится к тому же устаревшему триггеру)

### C1-03 [P2] Skip link и внутренние якоря: фокус не переносится, URL и история не обновляются
- Статус: ПОДТВЕРЖДЕНО двумя независимыми проверками (Firefox 159, Playwright на копии).
- Где сейчас: `site/scripts.js:2005-2017`. `initSmoothAnchors` вешает на все `a[href^="#"]`, включая `.skip-link` (`index.html:218`), `preventDefault()` и `scrollIntoView` — без истории и без переноса фокуса. Цель `<main id="main-content">` на месте (`index.html:257`).
- Проблема:
  - Tab → Enter на «Skip to main content» оставляет фокус на самой ссылке, `location.hash` пуст, следующий Tab уходит в шапку. Пропустить шапку нельзя (WCAG 2.4.1).
  - Клик по пункту меню не меняет URL: ссылку на раздел не скопировать, кнопки «назад» и «вперёд» не работают.
  - На press kit и страницах игр (там нет `scripts.js`) skip link работает нативно.
- Как исправить: плавная прокрутка уже есть в CSS — `css/base.css:91-92` (`scroll-behavior: smooth`, `scroll-padding-top`); при reduced-motion она отключается (`responsive-preferences.css:59`).
  - Основной вариант: в `initSmoothAnchors` оставить только закрытие меню по клику (`link.addEventListener("click", closeMenu)`), а `preventDefault` и `scrollIntoView` убрать.
  - Минимальный вариант только для skip link, проверен на копии: после `if (link.hasAttribute("data-open-contact")) return;` добавить `if (link.classList.contains("skip-link")) return;`.
- Критерий готовности: Tab → Enter на skip link даёт `location.hash === "#main-content"`, следующий Tab попадает внутрь `main`; клик «Games» в меню меняет URL, кнопка «назад» возвращает обратно.
- Источники: doc4-36, doc5-09; doc7b-11 опровергнут (цель skip link есть). Объединены C1-03 и B-02.

### C2-01 [P2] Страницы игр и 404: иконка/логотип 44–46 px грузится полноразмерным файлом с `fetchpriority="high"` и preload
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/games/nature-seed.html:91` (preload `Icon-site.webp`), `:109` (topbar `<img ... fetchpriority="high">`); то же `candy-shop.html:90,108`, `paint-blasters.html:90,108`, `ball-is-god.html:90,108`. Слот 46×46 px: `site/css/game-shell.css:106-108`. Размеры файлов: `Icon-site.webp` 108 108 B, `picon1.webp` 101 018 B, `icon_playmarket.webp` 91 332 B, `icon1.webp` 65 616 B. Готовые 192-px версии уже есть: `assets/responsive/{nature-seed,candy-shop,paint-blasters,ball-is-god}-icon-192.webp` (8.5–13.7 KiB по scan1). `site/404.html:21`: `assets/willowinworld-logo.webp` 137 076 B (1024×1024) в слоте 44 px (`site/404.css:157-159`), тоже `fetchpriority="high"`.
- Проблема: на каждой из 4 игровых страниц (и в 41 локали) два high-priority preload в `<head>`: hero AVIF и иконка в 65–108 KB для 46-px значка; иконка конкурирует с LCP-изображением на медленной сети. Сырая находка doc4-25 называла только Nature Seed и Paint Blasters — реально все четыре; конкретная причина (размер иконки) в сырых находках не названа.
- Как исправить: в EN-шаблонах `games/*.html` заменить `src` topbar-иконки и `href` preload на `../assets/responsive/<game>-icon-192.webp` (или убрать preload иконки); в `404.html:21` взять `assets/responsive/willowinworld-logo-64.webp` (есть). Затем `node site/tools/localize-site.mjs` (локали генерируются из EN, есть `--check`).
- Критерий готовности: `rg 'rel="preload"[^>]*(Icon-site|picon1|icon_playmarket|icon1)\.webp' site/games/*.html` — пусто; `stat -c%s` файла топбар-иконки ≤ 15 000 B.
- Источники: doc4-25 (с поправкой «все четыре»), doc10-27 (аналог на главной — см. C2-06)

### C2-02 [P2] Главная: тяжёлые растровые картинки карточек игр без адаптивных вариантов (вес страницы 1.49 MB)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/index.html` (карточки игр, ~стр. 300–520; 59 `<img>`, из них 56 `loading="lazy"`, `width`/`height` везде есть, `srcset` только у 5 + 1 `<picture>`). Размеры: `assets/Paint Blasters/site/back.webp` 153 278 B (=149.7 KiB, 760×1361; на проде `content-length: 153278`), `Nature Seeds/Galvnie_1_1-site.webp` 116 426 B, `Paint Blasters/site/hero_blasters.webp` 111 508 B, `modul.webp` 80 580 B, `Galvnie_1_0-site.webp` 71 338 B, `blasters.webp` 67 534 B — итого 600 664 B на шесть файлов; `Candy Shop/site/back_glavnie_1..10.webp` 362 452 B; `Ball is God/site/cloud-1..16.webp` 108 788 B. Причина: портретные источники (0.56) показываются в горизонтальных карточках через `object-fit: cover` (`site/css/home-paint-card.css:66-72`), видна меньшая часть пикселей.
- Проблема: по скану 8 ноября Lighthouse оценивает экономию «Improve image delivery» в 764 KiB (mobile) / 1,055 KiB (desktop) из ~1.26–1.32 MiB; Total Page Size 1.49 MB. Картинки ниже первого экрана и lazy, поэтому LCP/CLS не страдают (CLS 0), но расходуется мобильный трафик. Гипотеза doc3-02/doc11-28 про hero не подтвердилась (см. «Отклонено»).
- Как исправить: один раз переэкспортировать шесть крупнейших + 10 candy-фонов в показываемый размер/пропорцию (~2× CSS-ширины, например 669 px) и/или добавить AVIF + `srcset` по образцу `assets/responsive/` (конвейер уже есть для hero). Начать с `back.webp` и `Galvnie_1_1-site.webp` (≈ −150 KiB по оценке PSI).
- Критерий готовности: `stat -c%s "site/assets/Paint Blasters/site/back.webp"` ≤ 70 000; повторный PSI mobile — «Improve image delivery» < 200 KiB.
- Источники: scan1, scan2, scan3 (Improve image delivery / Properly size images / aspect ratio), doc5-18 (структура: 59/56/5), doc3-02 (частично)

### C2-03 [P2] Тема определяется в конце `body`: тёмная заглушка на первом кадре, затем переключение и повторная загрузка логотипа
- Статус: ПОДТВЕРЖДЕНО (механизм и лишний запрос); длительность вспышки — ТРЕБУЕТ БРАУЗЕРА
- Где сейчас: `site/index.html:217` (`<body ... data-theme="dark">` жёстко в разметке), `:228` (логотип `fetchpriority="high"`, тёмный `src`); `site/scripts.js:66-87` (`resolveInitialTheme`: сохранённая тема → `prefers-color-scheme` → время суток), `:2196` (`setTheme(initialTheme, false)` — последнее выражение скрипта), `:1365-1376` (смена `logo.src`/`srcset` на `-day-` вариант); `index.html:1104` скрипт в конце `body` без `defer`. Раннего инлайн-скрипта темы нет; CSP (`index.html:28`) разрешает только `script-src 'self'` и один sha256. Для страниц игр то же: `site/game-theme.js:84`.
- Проблема: у посетителей со светлой темой (сохранённой или системной) первый кадр рисуется тёмным, затем после выполнения `scripts.js` (в scan1 — длинные задачи с ~1.5 s при FCP 1.3 s) переключается на светлую; логотип грузится дважды (в scan1/scan2 в списках загрузок одновременно `willowinworld-logo-256.webp` и `willowinworld-logo-day-256.webp`, 16.0 и 15.7 KiB). Это объясняет сырую гипотезу doc8-66 («возможен FOUC»).
- Как исправить: вынести расчёт темы из `scripts.js:66-87` в крошечный внешний `site/theme-init.js` (~10 строк) и подключить его первым в `<body>` как `<script src="theme-init.js"></script>` — он выставляет `document.body.dataset.theme` и нужный `src` логотипа до первой отрисовки; `'self'` в CSP это разрешает, хеш не нужен. Править EN-шаблоны + `node site/tools/localize-site.mjs`.
- Критерий готовности: Chrome DevTools, эмуляция `prefers-color-scheme: light`, пустой кэш — в Network нет запроса `willowinworld-logo-256.webp` (тёмный), в filmstrip нет тёмного первого кадра.
- Источники: doc8-66, scan1, scan2 (оба варианта логотипа в загрузках)


## P3 — полировка и техдолг (65)

<details>
<summary>Развернуть 65 пунктов P3</summary>

### A-11 [P3] `dist` не является артефактом деплоя: сборка и публикация живут по разным моделям
- Статус: ПОДТВЕРЖДЕНО (выбор варианта — РЕШЕНИЕ ВЛАДЕЛЬЦА)
- Где сейчас: `.github/workflows/pages.yml:30-33` грузит `./site`; `site/dist` в `.gitignore`; `site-quality.yml:48-49` собирает `dist` только в runner и выбрасывает; на проде `/dist/index.html` и `/reports/css-coverage.json` 404. Lab-показатели без минификации приемлемы (PSI mobile 97, desktop 100 по scan1/scan2).
- Проблема: сборка тратит время CI и показывает «успех» над результатом, которого никто не использует и который сейчас неработоспособен (A-05..A-07).
- Как исправить: вариант 1 (дешевле, рекомендуется): оставить деплой исходного `site/`, из CI убрать `build-minified` и не считать `dist` релизным артефактом (или исправить A-05..A-07 и оставить как опцию). Вариант 2: деплоить `dist` после исправления A-05..A-07, A-12, A-13 и вместе с A-15 (белый список файлов).
- Критерий готовности: решение записано в `site/QUALITY_CHECKS.md`; в `pages.yml` и `site-quality.yml` модель сборки одна.
- Источники: AUD-12

### A-12 [P3] Сборка удаляет `dist` до готовности новой версии; `minifyJs` только обрезает строки
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/tools/build-minified.mjs:110` (`await rm(outRoot, ...)` первым действием, затем копирование и запись `:115-130`); `:94-100` `minifyJs` обрезает пробелы строк и убирает пустые (экономия около 12%: 81 869 -> 72 159 байт для `scripts.js`). Синтаксис `dist/scripts.js`, `404.js`, `game-theme.js`, `ru/i18n-runtime.js` валиден (`node --check`), многострочных template literal в исходниках нет.
- Проблема: при сбое посередине остаётся неполный `dist`; имя `minifyJs` вводит в заблуждение. На прод не влияет (A-11).
- Как исправить: собирать в `dist.tmp` и переименовывать после успеха (3 строки: `outRoot` -> `outRoot + ".tmp"`, затем `rm` и `rename`); `minifyJs` переименовать в `normalizeJs`. Имеет смысл только при выборе варианта 2 в A-11.
- Критерий готовности: при искусственной ошибке (отсутствует файл из `sourceFiles`) предыдущий `dist` остаётся нетронутым.
- Источники: doc4-05, doc10-03, doc10-13

### A-13 [P3] Ни одна проверка не смотрит на собранный `dist`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/tools/link-check.mjs:9` явно пропускает `dist`; `quality-check.mjs:3-22` не запускает сборку и проверяет только синтаксис `build-minified.mjs`; `seo-check`/`security-check`/`css-coverage-audit` читают исходники; `visual-check.mjs:113` снимает `file://`-копию исходников; в CI (`site-quality.yml:48-49`) сборка запускается, результат не проверяется. Из-за этого A-05..A-07 прошли незамеченными.
- Проблема: любая поломка сборщика невидима. Актуально только если выбран вариант 2 в A-11.
- Как исправить: после `build-minified` добавить в CI два дешёвых шага: `! rg -P 'calc\((?:[^;{}()]|\([^()]*\))*[^\s(]\+[^\s)]' site/dist --glob '*.css'` и проверку «каждый локальный `href|src` из HTML в `dist` существует» (скрипт около 15 строк; прототип в `work-A/dist-refs.mjs` нашёл ровно 2 пропавших пути до исправления A-07 и 0 после).
- Критерий готовности: намеренно испорченный `calc` или удалённый файл из списков сборки красит CI.
- Источники: doc9-04, doc4-07, doc5-03, doc10-04

### A-14 [P3] Покрытие проверок: `security-check` и `visual-check` не видят локали; `link-check` пропускает `#`-якоря
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/tools/security-check.mjs:64-75` проверяет 10 корневых страниц (41 локаль и 41x9 страниц не проверяются; `seo-check` и `link-check` локали покрывают, `localize-site --check` гарантирует, что они совпадают с генерацией из английских). `visual-check.mjs:11-22,24-27,113`: 10 страниц, 2 размера (1365x768, 390x844), `file://`, проверка только размера файла и «не пустой снимок», без сбора ошибок консоли и без ar/ja/ru; в CI и `quality-check` не запускается (только синтаксис). `link-check.mjs:37` пропускает ссылки `#...`, `:55` молча пропускает адреса с пробелами, `:64-72` не проверяет внешние. Проверено скриптом: 1932 ссылок вида `href="#id"` в 380 HTML, 0 битых, то есть нынешних дефектов нет.
- Проблема: ограничения инструментов, не дефект данных; ошибка в локали или якоре останется незамеченной.
- Как исправить: минимум — в `security-check.mjs` добавить в `htmlPages` локализованные главные через `translatedLocales`/`outputFile` (как в `seo-check.mjs:21`), в `link-check.mjs:37` заменить `url.startsWith("#")` на `url === "#"`. Расширение `visual-check` на ar/ja/ru и сбор console errors — опционально (нужен другой драйвер браузера).
- Критерий готовности: `node site/tools/security-check.mjs` в копии с внешним скриптом в `ru/index.html` падает; `href="#missing"` в любой странице даёт ошибку `link-check`.
- Источники: doc4-38, doc5-54, doc10-21, doc11-43

### A-15 [P3] На проде опубликованы служебные файлы: `tools/`, `deploy/`, `_headers`, `_redirects`, `QUALITY_CHECKS.md`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `.github/workflows/pages.yml:30-33` публикует весь `site`. Прод (2026-11-13): `/deploy/nginx-security.conf` 200, `/QUALITY_CHECKS.md` 200, `/SECURITY.md` 200 (нужен для `security.txt`), `/yandex_d08a3b38c62144a2.html` 200 (нужен для Yandex); по доп. данным AUD-16 также `/tools/*.mjs`, `/tools/locales/*.json`, `/_headers`, `/_redirects` -> 200. На эти пути не ссылается ни одна страница, `sitemap`, `llms.txt`, скрипты. Репозиторий публичный, секретов в файлах не найдено.
- Проблема: лишние ~8,6 МБ в артефакте и ложное впечатление, что `_headers`/`deploy/*` действуют (A-04). Раскрытия секретов нет, код и так открыт в GitHub.
- Как исправить: перед `upload-pages-artifact` добавить шаг `rsync -a --exclude tools --exclude deploy --exclude dist --exclude reports --exclude _headers --exclude _redirects --exclude QUALITY_CHECKS.md site/ _site/` и поставить `path: ./_site` (оставить `SECURITY.md` и `yandex_...html`).
- Критерий готовности: `curl -sSI https://willowinworlds.com/tools/quality-check.mjs` и `/_headers` -> 404.
- Источники: AUD-16, doc5-36 (три набора заголовков: директивы CSP во всех трёх и в meta совпадают, проверено скриптом; различается только `frame-ancestors`, которого в meta быть не может; на Pages не применяется ни один), doc8-70

### A-16 [P3] GitHub Actions закреплены на major-тегах, у `site-quality.yml` нет `permissions`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `pages.yml:23,28,31,37` (`checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`), `site-quality.yml:15,18` (`checkout@v4`, `setup-node@v4`); `site-quality.yml` без блока `permissions`; `.github/dependabot.yml` нет.
- Проблема: слабее строгой supply-chain политики, но используются только действия самого GitHub. Права токена в `pages.yml` заданы явно (`contents: read, pages: write, id-token: write`).
- Как исправить: в `site-quality.yml` добавить `permissions: {contents: read}`; закрепить действия по полному SHA с комментарием версии и добавить `.github/dependabot.yml` для `github-actions` (опционально).
- Критерий готовности: `rg -n 'permissions' .github/workflows/site-quality.yml` находит блок.
- Источники: AUD-09. Приоритет понижен с P2: действия только первого порядка (`actions/*`).

### A-17 [P3] `security.txt` без обязательного поля `Expires`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/.well-known/security.txt:1-4` (Contact, Preferred-Languages, Canonical, Policy); прод отдаёт те же 4 строки; `site/tools/security-check.mjs:124` проверяет только `Contact`. RFC 9116 требует ровно одно поле `Expires`.
- Проблема: файл не соответствует RFC 9116; сканеры его не примут.
- Как исправить: добавить строку `Expires: <дата не позднее чем через год, формат RFC 3339>` и в `security-check.mjs` одну проверку `requireMatch("security.txt", files.securityTxt, /^Expires:\s*\d{4}-\d{2}-\d{2}T/m)`; в `QUALITY_CHECKS.md` записать ежегодное продление.
- Критерий готовности: `curl -s https://willowinworlds.com/.well-known/security.txt | rg '^Expires:'`.
- Источники: AUD-20, doc5-53

### A-18 [P3] GitHub не распознаёт политику безопасности репозитория
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: политика лежит в `site/SECURITY.md`; `GET /repos/MrExavius/WillowinWorld/community/profile` (2026-11-13) не содержит `security` (health 14%: нет README, license и др.).
- Проблема: во вкладке Security репозитория нет маршрута сообщений об уязвимостях.
- Как исправить: добавить `.github/SECURITY.md` с контактом и ссылкой на `https://willowinworlds.com/SECURITY.md` (5 строк); включить private vulnerability reporting в Settings.
- Критерий готовности: `curl -s https://api.github.com/repos/MrExavius/WillowinWorld/community/profile | rg security`.
- Источники: AUD-21

### A-19 [P3] У apex-домена нет `AAAA`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `dig +short AAAA willowinworlds.com` на 2026-11-13 пусто; `A` — 4 адреса GitHub Pages (185.199.108-111.153).
- Проблема: IPv6-only клиенты без DNS64 не открывают сайт; почти не влияет на обычных пользователей.
- Как исправить: после сверки с документацией GitHub Pages добавить его 4 `AAAA`-адреса рядом с `A`, не удаляя `A` (DNSSEC включён, запись должна быть подписана).
- Критерий готовности: `curl -6 -sSI https://willowinworlds.com/` отвечает.
- Источники: AUD-22

### A-20 [P3] В nginx-конфиге блок `types` без AVIF, ICO, JSON, JPEG (конфиг не используется)
- Статус: ПОДТВЕРЖДЕНО (только в конфиге; прод не затронут)
- Где сейчас: `site/deploy/nginx-security.conf:41-51` перечисляет html, css, js, webmanifest, xml, txt, svg, webp, png. В `site` используются 9 `.avif`, `favicon.ico`, 42 `.json`; jpg нет. Прод (GitHub Pages): `.avif` -> `image/avif`, `languages.json` -> `application/json`, `favicon.ico` -> `image/vnd.microsoft.icon`.
- Проблема: при реальном использовании этого конфига `types {}` заменит стандартную карту, и AVIF/JSON/ICO получат `default_type`.
- Как исправить: в блок `types` добавить `image/avif avif; image/x-icon ico; application/json json;` (или `include mime.types;`). Делать только вместе с переездом (A-04).
- Критерий готовности: `curl -sSI <host>/assets/responsive/nature-seed-hero-720.avif | rg -i content-type` -> `image/avif`.
- Источники: doc9-14, doc4-23, doc10-22, doc5-24

### A-21 [P3] Версии `?v=` и дата локализации обновляются вручную
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: ссылки вида `css/home-polish-2026.css?v=20260731-10` (`site/index.html:53`), `scripts.js?v=20260801-1`; `scripts.js` менялся в коммите 2026-11-10, CSS 2026-09-23, версии в HTML старше. `site/tools/localization-config.mjs:3` `localizationLastModified = "2026-09-10"`. Картинки `assets/...` без `?v=` вообще (0 из 85 ссылок на главной).
- Проблема: на проде TTL 600 с, поэтому устаревший файл виден максимум 10 минут; вред минимален. Станет проблемой при долгом кэше (A-04, `_headers` с `immutable` на `/assets/*` при стабильных именах файлов, doc4-13, оставил бы старые картинки на год).
- Как исправить: пока TTL 600 с — ничего. При включении долгого кэша сначала ввести content-hash в имена или `?v=` из хеша файла, и только потом `immutable`; `1y` без версионирования не использовать.
- Критерий готовности: решение о версионировании принято до применения `_headers`/CDN-правил.
- Источники: doc11-10, doc4-13 (латентно: конфиг не применяется), doc7b-22 (рекомендация `immutable` противоречит doc4-13; не принимать). Дата `lastmod` в sitemap — в «Передать».

### A-22 [P3] Ограничения CSP (`trusted-types 'none'`, `frame-src/media-src/connect-src 'none'`) нигде не задокументированы
- Статус: ПОДТВЕРЖДЕНО (намеренное ограничение, не дефект)
- Где сейчас: meta-CSP `site/index.html:28` и `deploy/nginx-security.conf:4`; в `iframe`, `video`, `audio` на сайте сейчас 0 вхождений; `rg -i trusted site/SECURITY.md site/QUALITY_CHECKS.md` ничего не находит.
- Проблема: будущий YouTube-трейлер, HTML5-видео или виджет с `innerHTML` будет молча заблокирован; разработчик может ослабить всю CSP.
- Как исправить: 3-4 строки в `site/SECURITY.md`: что запрещено и где править (мета во всех страницах + `_headers`/`deploy/*`), и что для видео предпочтительна обложка со ссылкой.
- Критерий готовности: `rg -n -i 'trusted-types|frame-src' site/SECURITY.md` находит абзац.
- Источники: doc4-21, doc5-51, doc8-52

### A-23 [P3] Нет автотестов поведения (меню, фокус, модалки, 404-игра)
- Статус: ЧАСТИЧНО (тестов нет; но утверждение о Playwright и «lock-файле» неверно)
- Где сейчас: в репозитории нет `test/`, `*.test.*`, `*.spec.*`, `package.json` и lock-файла; все инструменты используют только встроенные модули Node (`rg 'from "(?!node:|\./)' site/tools` пусто); `visual-check.mjs` запускает `firefox`/`chromium` из PATH напрямую, Playwright не используется.
- Проблема: регрессии поведения (меню на 320 px AUD-01, skip link AUD-10, Escape/фокус в модалках, 404-игра) ловятся только вручную. Закреплять версии Playwright не требуется: его нет.
- Как исправить: опционально; осмысленно после исправления AUD-01/AUD-10 и только если владелец готов добавить зависимость (Playwright + lock-файл). Дешёвая замена: ручной чек-лист в `QUALITY_CHECKS.md`.
- Критерий готовности: один smoke-сценарий в CI (меню открывается и закрывается на 360 px) красный до исправления AUD-01.
- Источники: doc6-08, doc8-37, doc5-33

### A-24 [P3] Хеш `sha256-...` в CSP относится к JSON-LD и ничего не защищает
- Статус: ЧАСТИЧНО (избыточность подтверждена; рассинхрон meta/nginx и «потенциальный P0» нет)
- Где сейчас: хеш `sha256-2IcittCIYqCRdKrw9U2GpqXqT274A5Z6YZzDD5+z4Ak=` совпадает в `index.html:28`, `_headers:2`, `deploy/nginx-security.conf:4`, `apache-security.htaccess`, и в meta всех 41 локалей (прод: `/` и `/ru/` содержат тот же хеш); совпадает с хешем JSON-LD английской главной, но 0 из 41 локалей имеют собственный JSON-LD с этим хешем. Блок `application/ld+json` (`index.html:54`) не исполняется, поэтому `script-src` к нему не применяется (по спецификации CSP; на страницах игр JSON-LD уже есть без хеша). `security-check.mjs:89-98,126-132` проверяет хеш только для `index.html`.
- Проблема: лишняя синхронизация хеша в 4 конфигах и проверка; никакого блокирования JSON-LD нет. Старое расхождение хешей (`u6eIf...` в локалях против `kS14...`) в текущем коде исправлено.
- Как исправить: (опционально) убрать `'sha256-...'` из `script-src` в `index.html`, `_headers`, `deploy/nginx-security.conf`, `deploy/apache-security.htaccess`, удалить блок хеш-проверки в `security-check.mjs:126-132`, пересобрать локали `node site/tools/localize-site.mjs`.
- Критерий готовности: `rg -c 'sha256-' site/index.html site/_headers site/deploy` даёт 0; `node site/tools/quality-check.mjs` проходит.
- Источники: doc5-35, doc4-18, doc8-26 (хеш без inline-скрипта), doc11-18 (часть про хеш), doc7b-19, doc6-07 (последние два см. «Отклонено»)

### A-25 [P3] Домен и почта в инструментах: централизовано, остался один хвост
- Статус: ЧАСТИЧНО
- Где сейчас: `siteOrigin` и `contactEmail` теперь задаются один раз в `site/tools/localization-config.mjs:1-2` и импортируются в `seo-check`, `security-check`, `link-check`, `localize-site`, `devlog-data`. Остаётся строка с почтой в тексте `site/tools/localize-site.mjs:472` (`"Copy was blocked. Use willowinworlds@gmail.com."`). `willowinworld.com` (ед. число) в `site/` 0 вхождений.
- Проблема: смена почты потребует правки второй строки; охранной проверки от возврата старого домена нет.
- Как исправить: опционально: в `quality-check.mjs` или CI шаг `! rg -n 'willowinworld\.com' site --glob '!dist/**'` (одной строкой, `willowinworlds.com` не совпадает); строку почты на `:472` не трогать без смены контакта.
- Критерий готовности: шаг в CI проходит и падает при подстановке `willowinworld.com` в любой файл.
- Источники: doc11-30

### B-14 [P3] Мобильное меню: Escape не возвращает фокус на кнопку меню
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:1780-1784` (`closeMenu`), `scripts.js:2135-2136`
- Проблема: при 420 px фокус на «Home» в меню → Escape → `document.activeElement` = BODY (ссылка скрыта `visibility`); следующий Tab идёт на `#themeToggle`.
- Как исправить: в обработчике Escape: `if (body.classList.contains("menu-open")) { closeMenu(); menuToggle.focus(); }`.
- Критерий готовности: Escape в открытом меню → `document.activeElement.id === 'menuToggle'`.
- Источники: doc10-24

### B-15 [P3] Секретная награда не возвращает фокус
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:1673-1678` (`closeSecretReward` без возврата фокуса), открытие `scripts.js:1659-1671`
- Проблема: триггер — невидимая pointer-кнопка (`aria-hidden`, `tabIndex=-1`, `scripts.js:1752-1765`), после закрытия фокус остаётся на BODY. Влияет в основном на пользователей мыши; с клавиатуры в охоту не попасть (см. B-04).
- Как исправить: возвращать фокус на `#promoHuntToggle` (или сохранённый opener, если он в DOM).
- Критерий готовности: после закрытия окна награды `document.activeElement` — не BODY.
- Источники: doc10-07

### B-16 [P3] Языковой переключатель: Escape и клик снаружи не закрывают, видимая «EN» не входит в имя
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: разметка генерируется `site/tools/localize-site.mjs:987` (`<summary aria-label="Choose language"><span aria-hidden="true">EN</span>`), обработчиков в `scripts.js` нет
- Проблема: Playwright: Enter открывает список из 42 ссылок; Escape и клик вне — `details.open` остаётся `true`. Видимая надпись «EN» скрыта и не входит в доступное имя «Choose language» — управление голосом «нажать EN» не сработает (WCAG 2.5.3).
- Как исправить: имя вида `Choose language (EN)`; в `scripts.js` закрывать `details` по Escape и клику вне (≤8 строк); правка в генераторе и `node site/tools/localize-site.mjs`.
- Критерий готовности: Escape и клик вне закрывают `.language-switcher details`; `summary` accessible name содержит «EN».
- Источники: doc5-43, doc7a-18 (часть)

### B-17 [P3] WAVE «Missing alternative text ×18» — это 18 inline `<svg>` без `aria-hidden`
- Статус: ПОДТВЕРЖДЕНО (причина найдена)
- Где сейчас: `site/index.html:284,343` (`svg.nature-route`), `560,565,570,575,580,585,590,595` (иконки `.principle .card-icon`), `613-620` (иконки `.system-card .card-icon`); также `press-kit.html` — 1 такой `svg`, `games/nature-seed.html` — 2
- Проблема: все 59 `<img>` на главной имеют `alt` (5 непустых + 54 пустых = ровно WAVE «Alternative text 5» и «Null or empty 54»); `<area>` и `input[type=image]` нет. Остаётся 2+8+8 = 18 декоративных `svg` без имени — это и есть 18 ошибок (AIM 6.7). В `w9-scans.md` сводка WAVE сдвинута: фактически Errors 18, **Contrast Errors 0** (не 3), Alerts 3 (Redundant link), Features 108, Structure 82, ARIA 148 — совпадает с разделами деталей в `docs/scan5.txt`.
- Как исправить: добавить `aria-hidden="true"` этим `<svg>` в `index.html` (и в `press-kit.html`, `games/nature-seed.html`), затем `node site/tools/localize-site.mjs`.
- Критерий готовности: повторный WAVE — 0 errors; локально 0 `<svg>` без `aria-hidden` в `index.html` (regex).
- Источники: scan5 (18 Missing alternative text; «3 Contrast Errors» опровергнуто)

### B-18 [P3] W3C Nu: `section#about` и 7 `article.faq-item` «без заголовка» (8 предупреждений)
- Статус: ПОДТВЕРЖДЕНО (строки совпадают со scan4 на HEAD и на проде)
- Где сейчас: `site/index.html:625-628` (`<section id="about">`, `h2` лежит внутри вложенного `<article class="soft-card about-copy">`, строка 627), `index.html:724,728,732,736,740,744,748` (`<article class="faq-item">` с `<button>`)
- Проблема: валидатор считает `article`/`section` без h2–h6 ошибкой структуры; пользовательского эффекта нет.
- Как исправить: 7× `<article class="faq-item">` → `<div class="faq-item">` (CSS/JS по классу: `site-sections.css:316`, `scripts.js:1866,1968`); `<article class="soft-card about-copy">` → `<div>`. `section` не менять на `div` (`.section:first-of-type`, `responsive-tablet.css:97`). Затем `node site/tools/localize-site.mjs` (42 локали).
- Критерий готовности: vnu без «Section lacks heading» / «Article lacks heading» (vnu локально не установлен — не запускался).
- Источники: scan4 (#2-9)

### B-19 [P3] W3C Nu: устаревший `<meta http-equiv="content-language">`
- Статус: ПОДТВЕРЖДЕНО (РЕШЕНИЕ ВЛАДЕЛЬЦА: тег, вероятно, намеренный)
- Где сейчас: `site/index.html:5` и ещё 377 HTML-файлов; вставка `site/tools/localize-site.mjs:998` (зачистка `:572`, `:992`); `site/tools/seo-check.mjs:137-139` его ТРЕБУЕТ
- Проблема: единственная «Error» в scan4; язык уже задан `<html lang="en" dir="ltr">` (`index.html:2`), браузерам тег не нужен. Причину намеренного добавления не проверял.
- Как исправить: либо оставить и принять предупреждение, либо удалить вставку в `localize-site.mjs:998` и проверку в `seo-check.mjs:137-139` и перегенерировать (диф — по одной строке в 378 файлах).
- Критерий готовности: `rg -l 'http-equiv="content-language"' site --glob '*.html'` пусто (если решено убрать).
- Источники: scan4 (#1)

### B-20 [P3] 404: canvas без текстовой альтернативы, toast без live-region, aria-label паузы устарел
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/404.html:17` (canvas: только `class,id,width,height,style`), `404.html:98` (`#gameToast` без `role`/`aria-live`; измерено `null`), `404.html:30` (`aria-label="Pause game"`) + `site/404.js:234-241` (`setMode` меняет текст на «Resume», aria-label не трогает; измерено «Resume / Pause game»)
- Проблема: у canvas нет имени (1.1.1); «Game over. Score N.» и «Close dodge» (`404.js:318`, `:709`, `showToast`) не озвучиваются; имя кнопки паузы не совпадает с видимым текстом (2.5.3, 4.1.2). Смягчение: правила описаны текстом (`404.html:39-41`), в `<main aria-label>` есть имя области, а «Home» всегда доступна — потому P3.
- Как исправить: `aria-hidden="true"` на canvas (или `role="img" aria-label="Game field"`); `role="status"` на `#gameToast`; в `setMode` обновлять `aria-label` у `.icon-pill`.
- Критерий готовности: в DOM `#gameToast[role=status]`, у canvas есть имя или `aria-hidden`, при паузе aria-label совпадает с «Resume».
- Источники: doc8-02, doc3-21, doc8-58, doc11-34 (часть про aria-label)

### B-22 [P3] 404: resize без debounce, canvas пуст до следующего кадра, звёзды пересоздаются
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/404.js:1047` (`resize` → `fitCanvas`), `404.js:198-212` (`canvas.width=` очищает; `makeBackgroundStars()` — 44–120 случайных звёзд)
- Проблема: измерено: после каждого из 6 `resize` альфа canvas в точке (50,50) = 0 (пусто); в idle следующий кадр через ~260 мс (`nextFrameDelay`, `404.js:972-977`) — мерцание; фон перетасовывается.
- Как исправить: вызвать `draw()` в конце `fitCanvas()`; throttle по rAF; не пересоздавать звёзды, если размер почти не изменился.
- Критерий готовности: сразу после `resize` альфа canvas > 0.
- Источники: doc8-47, doc11-17, doc6-13

### B-23 [P3] 404.js: переполнение `maxDrops` и мёртвое поле `cat.caughtTime`
- Статус: ПОДТВЕРЖДЕНО (косметика, исправлять не обязательно)
- Где сейчас: `site/404.js:405-406` (проверка до волны из 1-3 объектов), `404.js:592,346,724` (`caughtTime` пишется и убывает, в `draw` не читается)
- Проблема: максимум на 2-3 объекта больше лимита — игрового эффекта нет; `caughtTime` — неиспользуемое состояние.
- Как исправить: не требуется; при желании удалить три строки `caughtTime`.
- Критерий готовности: —
- Источники: doc10-08, doc8-42

### B-24 [P3] 404: холостой цикл отрисовки в idle
- Статус: ЧАСТИЧНО
- Где сейчас: `site/404.js` — `state.running:true` без изменений, `frame()` всегда зовёт `queueFrame()` (`:998-1006`), задержки 260/420/800 мс (`:972-977`)
- Проблема: в idle перерисовывается статичная сцена (`motionTime = playing ? state.time : 0`, `404.js:731`): измерено 8–19 вызовов rAF за 5 с в Firefox headless. «Пауза вне viewport» (IntersectionObserver) не нужна: canvas полноэкранный fixed (`404.css:70-80`). Скрытая вкладка: таймер 800 мс → rAF, но браузер не вызывает rAF в фоне — отрисовки нет (doc10-16 ЧАСТИЧНО).
- Как исправить: необязательно — не планировать кадр в idle после первой отрисовки, перезапуск из `setMode`/`fitCanvas`.
- Критерий готовности: в idle `requestAnimationFrame` не вызывается без ввода.
- Источники: doc3-10, doc11-16, doc10-16

### B-25 [P3] 404: подготовка спрайтов на главном потоке — влияние мало
- Статус: ЧАСТИЧНО
- Где сейчас: `site/404.js:90-146` (`processSprite`: `getImageData`, flood-fill, trim, `toDataURL`)
- Проблема: измерено (десктопный Firefox): 20 `getImageData` = 6 мс, 5 `toDataURL` = 18 мс — около 24 мс. Спрайты `assets/404/*_clean.webp` уже с прозрачным фоном (альфа углового пикселя = 0 у `stay`, `star1`, `blackhole`, `heart` из 10), flood-fill (`:96-139`) ничего не заливает. Эффект на слабых телефонах — ТРЕБУЕТ УСТРОЙСТВА.
- Как исправить: необязательно — оставить только trim или запечь обрезку при публикации.
- Критерий готовности: в `404.js` нет `getImageData` (если решено убирать).
- Источники: doc9-08, doc6-04, doc11-15

### B-26 [P3] 404: при ошибке загрузки спрайта цикл кадров падает
- Статус: ЧАСТИЧНО (механизм из отчёта неверный, последствие реальное)
- Где сейчас: `site/404.js:33-37` (только `load`), `404.js:823-837` и `:894-903` (`drawImage(images[key])` как запасной вариант)
- Проблема: «`getImageData(0,0,0,0)` бросит» неверно — `processSprite` вызывается только на `load`. Но `drawImage` битого `<img>` бросает `InvalidStateError`: Playwright с `route.abort()` для `stay`/`star1` — 1 pageerror «Passed-in image is "broken"», `frame()` падает до `queueFrame()`, игра замирает.
- Как исправить: в `drawImageContained` `if (!image.complete || !image.naturalWidth) return;` (1 строка).
- Критерий готовности: при заблокированном спрайте нет pageerror и игра идёт дальше.
- Источники: doc8-22

### B-27 [P3] 404: игровой цикл не учитывает `prefers-reduced-motion` — но 2.2.2 не нарушен
- Статус: ЧАСТИЧНО
- Где сейчас: `site/404.css:1222-1230` (все CSS-анимации выключены; измерено 0 бесконечных), `site/404.js:524` (`createBurst` — 8 частиц), в цикле проверки нет (`matchMedia` только `:375,524`)
- Проблема: падающие объекты в canvas анимируются и при reduce, но только после явного Start/Space и с паузой (P, Space, кнопка); в idle сцена статична. Остаётся пожелание по 2.3.3 (AAA), а не дефект.
- Как исправить: необязательно — при reduce уменьшить скорость и отключить частицы.
- Критерий готовности: —
- Источники: doc8-21, doc7b-13

### B-28 [P3] `aria-current="page"` на ссылках секций
- Статус: ЧАСТИЧНО
- Где сейчас: `site/scripts.js:1893-1899` (`initActiveNavigation`)
- Проблема: утверждение «несколько ссылок» неверно — измерено при скролле, всегда ровно одна ссылка (`#home → #games → #studio`; `index.html=page` в списке языков корректен). Значение `page` для якорей неточно: ARIA предлагает `location`.
- Как исправить: `scripts.js:1898` — `"page"` → `"location"`.
- Критерий готовности: `document.querySelector('.main-nav a[aria-current]').getAttribute('aria-current') === 'location'`.
- Источники: doc7a-11

### C1-05 [P3] RSS теряет историю и содержит ложные permalink GUID
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/tools/devlog-data.mjs:129-133` (`parseDevlogEntries(...)[0]` — по одной записи на игру), `:217` (`<guid>…#devlog-2026-09-10</guid>`); `site/rss.xml` (4 `<item>`); `site/games/*.html` — 5 `data-devlog-entry` (в `nature-seed.html` две) и 0 `id="devlog-…"`. Прод `rss.xml` совпадает с репозиторием. `xmllint --noout` — well-formed.
- Проблема: старая запись Nature Seed не попадает в ленту; без `isPermaLink="false"` читалки считают GUID открываемой ссылкой на несуществующий фрагмент.
- Как исправить: `devlog-data.mjs:217` → `<guid isPermaLink="false">…</guid>` (одна строка). Для истории — отдельная функция, отдающая все записи для RSS (остальные потребители `loadLatestDevlogs` не трогать). Затем перегенерировать `rss.xml` штатным `sync-devlogs.mjs` (в этом аудите не запускался, он пишет в `site/`).
- Критерий готовности: `rg -c '<item>' site/rss.xml` = 5; `rg 'isPermaLink="false"' site/rss.xml` находит все GUID.
- Источники: AUD-26

### C1-06 [P3] Один общий manifest возвращает установленное приложение на английскую главную
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/manifest.webmanifest:4` (description только EN), `:5` (`"start_url": "/"`), `:30-58` (shortcuts только EN); подключён на 378 страницах (`<link rel="manifest">` есть и в `ru/index.html`); `lang`/`dir` в манифесте нет. Прод идентичен.
- Проблема: запуск установленной PWA из RU/AR/другой локали открывает EN-главную с английскими ярлыками. Service worker и offline-режима нет (`rg serviceWorker` по JS — пусто, CSP `worker-src 'none'`), так что PWA — лишь ярлык.
- Как исправить: минимально — принять как известное ограничение и записать в `site/QUALITY_CHECKS.md`. Опционально (тяжелее): генератор `localize-site.mjs` отдаёт `<lang>/manifest.webmanifest` со своими `start_url`, `scope`, `lang`, `dir` и переведёнными shortcuts.
- Критерий готовности: решение зафиксировано; при варианте с генератором `rg '"start_url"' site/ru/manifest.webmanifest` показывает `/ru/…`.
- Источники: AUD-27

### C1-07 [P3] В `scripts.js` остались недостижимые UI-ветки (~150 строк)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:13-20` (ссылки на `magicState`, `qualityState`, `modePill`, `pauseMagic`, `lowMotion`, `disableMagic`), `:396-402` (`updateLabels`), `:1392-1416` (`startPlayMode`, `completeConstellation` вместе с таймером `successBadge` на `:1411`), `:1467-1479` (ветка `playMode`), `:2031`, `:2054-2085` (обработчики), `gameProfiles` `:142-185` + `openGameDetails`/`initGameDetails` `:1537-1552`, `:1813-1819` + разметка `index.html:1053-1080`. `rg 'data-play|data-game=|id="(magicState|qualityState|modePill|pauseMagic|lowMotion|disableMagic)"' site --glob '*.html'` — пусто.
- Проблема: эти состояния нельзя запустить из интерфейса и нечем проверить; `state.playMode` всегда `false`, поэтому гонка таймера `success-badge` (doc11-36) и «ложный промах созвездия» (doc4-12) недостижимы. Строки («Pause Magic», «Enable Magic» и др.) при этом живут в словарях локалей (`tools/locales/*.json`, `<lang>/i18n-runtime.js`).
- Как исправить: удалить ветки и связанные строки словарей, регенерировать локали, прогнать `quality-check.mjs`/`site-quality.yml`. Либо вернуть осмысленные элементы управления с клавиатурным контрактом и тестом. Не оставлять код без точки входа.
- Критерий готовности: `rg -n 'data-play|magicState|pauseMagic|gameProfiles' site/scripts.js` пусто, проверки качества проходят.
- Источники: AUD-28, doc5-37, doc11-33, doc11-36

### C1-08 [P3] FAQ без JavaScript остаётся свёрнутым
- Статус: ПОДТВЕРЖДЕНО (приоритет снижен с P1: затрагивает только отключённый или сломанный JS)
- Где сейчас: `site/css/site-sections.css:366-378` (`.faq-answer { grid-template-rows: 0fr }`, раскрытие только по `.faq-item.is-open`); `site/index.html:725-750` (ответы в разметке без `hidden`); `site/scripts.js` `initFaq` ставит `is-open`.
- Проблема: Firefox 159 с выключенным JS: высота `.faq-answer` = 0, `overflow: hidden`, кнопки «вопросов» ничего не делают. Текст есть в HTML (для поисковиков доступен). Остальной контент без JS виден (см. «Отклонено», doc9-03).
- Как исправить: CSP (`index.html:28`, `style-src 'self'`) блокирует inline `<style>` в `<noscript>`, поэтому правка через JS-класс: в `initFaq` добавлять `item.classList.add("is-js")`, а в CSS свернуть только `.faq-item.is-js .faq-answer` (две строки CSS, одна JS, HTML 378 страниц не трогается).
- Критерий готовности: с отключённым JS `getBoundingClientRect().height` у `.faq-answer` больше 0; с JS поведение прежнее.
- Источники: doc7b-26

### C1-09 [P3] Смена темы ОС перезаписывает ручной выбор в текущей сессии
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:66-73` (`savedTheme` читается один раз), `:2150-2154` (`if (!savedTheme && …) colorSchemeQuery.addEventListener("change", …)`); `site/game-theme.js:92-94` (то же через `readStoredTheme()` при старте).
- Проблема: если при загрузке выбора не было, слушатель остаётся и после ручного переключения; когда ОС сменит тему (например по расписанию), открытая страница переключится вопреки выбору. После перезагрузки приоритет у `localStorage`.
- Как исправить: в обоих обработчиках в начале проверять текущее хранилище: `try { if (localStorage.getItem("willow-theme")) return; } catch {}`.
- Критерий готовности: открыть страницу, вручную переключить тему, сменить тему ОС — оформление не меняется.
- Источники: doc9-07, doc4-37

### C1-10 [P3] Fallback копирования использует устаревший `document.execCommand("copy")`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:377-393` (`copyText`; `execCommand` на `:390`), вызывающий код с обработкой отказа `:2120-2129` (toast на `:2126`: «Copy was blocked. Use willowinworlds@gmail.com.»).
- Проблема: ветка выполняется только если нет `navigator.clipboard.writeText` (небезопасный контекст, очень старые WebView); на HTTPS-проде почти недостижима. Отказ уже обрабатывается и показывает адрес.
- Как исправить: ничего обязательного; код оставить как есть (для старых WebView он единственный путь).
- Критерий готовности: не требуется.
- Источники: doc7a-15

### C1-11 [P3] Режим сниженных эффектов определяется один раз и только там, где есть `navigator.connection`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/scripts.js:232-262` (`prefersReduced`, `smallScreen`, `saveData` читаются один раз, слушателя `change` у них нет), `:1316-1324` (автопереход в `lowMotion` по FPS необратим); `site/game-theme.js:9-10` (`navigator.connection || mozConnection || webkitConnection`); FAQ `site/index.html:730` («reduces effects when Save-Data is enabled»).
- Проблема: `navigator.connection` есть в Chromium; в Safari и Firefox `lowData` всегда `false`, заявление FAQ верно только там, где сигнал доступен. Включение reduced-motion в ОС при открытой странице подхватывается только после перезагрузки.
- Как исправить: допустимо принять как известное ограничение. Дёшево (3 строки): подписать `matchMedia("(prefers-reduced-motion: reduce)")` на `change` и выставлять `state.lowMotion`. Менять текст FAQ не стоит: это правка 42 локалей.
- Критерий готовности: переключение reduced-motion в ОС на открытой главной останавливает ambient-canvas без перезагрузки.
- Источники: doc10-26, doc11-35

### C1-12 [P3] `backdrop-filter` везде без `-webkit-` префикса
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `rg -c 'backdrop-filter' site/css site/motion.css` → 37 объявлений (32 с blur/saturate, 5 `none`), `-webkit-backdrop-filter` — 0; примеры: `css/base.css:286`, `:675`, `:1219`, `css/home-polish-2026.css:276`, `css/ball-page.css:387`.
- Проблема: Safari до 18 понимает только префиксный вариант: на старых iPhone стеклянные панели теряют размытие, а полупрозрачный фон может ухудшить читаемость. Долю таких устройств не измеряли.
- Как исправить: перед каждым `backdrop-filter: X;` вставить `-webkit-backdrop-filter: X;` (механически, `sed`/скрипт по `site/css/*.css`); автопрефиксер и новая зависимость не нужны. Часть про влияние на FPS и отключение на мобильных — у группы C2; для справки: в `responsive-mobile.css` `backdrop-filter` не отключается, `prefers-reduced-transparency` обработан только в `css/home-polish-2026.css:981`.
- Критерий готовности: `rg -c 'backdrop-filter' site/css` и `rg -c '\-webkit-backdrop-filter' site/css` дают равные числа.
- Источники: doc5-20, doc7b-14, doc8-24 (CSS-часть)

### C1-13 [P3] На hover карточки devlog анимируется `padding` (reflow)
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/css/home-polish-2026.css:481` (`transition: background .25s var(--ease), padding .25s var(--ease)`), `:501-503` и `:928-930` (`.devlog-card:hover { padding-inline: … }`).
- Проблема: каждая анимация hover пересчитывает layout; эффект декоративный. В разделе 2 того же отчёта этот пункт назван положительным (противоречие в источнике).
- Как исправить: убрать `padding .25s var(--ease)` из `transition` и `padding-inline` из hover либо заменить на `transform: translateX(8px)` у содержимого.
- Критерий готовности: DevTools Performance: hover по `.devlog-card` не даёт Layout.
- Источники: doc11-37

### C1-14 [P3] `handlePointerDown` подписан и на `click`, и на `touchend`
- Статус: ЧАСТИЧНО (двойная подписка есть; «ложный промах» недостижим)
- Где сейчас: `site/scripts.js:2176-2177`, обработчик `:1444-1479`.
- Проблема: один тап запускает функцию дважды, а `touchend` срабатывает и после обычной прокрутки пальцем: появляется декоративная вспышка и просыпается цикл `startLoop`. Сценарий аудита (звезда засчитана и тут же даёт промах) требует `state.playMode`, а он включается только `[data-play]`, которого в HTML нет (см. C1-07). На устройстве не проверялось.
- Как исправить: удалить строку `:2177` (`touchend`); `click` на касаниях приходит сам.
- Критерий готовности: на эмуляции касания один тап даёт один вызов `handlePointerDown`.
- Источники: doc4-12, doc5-07

### C1-15 [P3] 404-игра: направление «залипает», если кнопку или клавишу отпустили вне кнопки или окна
- Статус: ЧАСТИЧНО.
- Где сейчас: `site/404.js:1055-1074` — `pointerup`/`pointercancel` слушаются только на самой кнопке; `:1036-1039` — клавиши сбрасываются только по `keyup`; `:1076-1080` — `visibilitychange` ставит паузу, но `state.keys` не сбрасывает; обработчика `blur` нет. Кнопки управления показываются при `max-width: 560px` (`404.css:1159`).
- Проблема: на касаниях браузер сам «захватывает» указатель, поэтому там прилипания нет. Остаются два случая: мышь в узком окне и смена вкладки (или потеря фокуса) с зажатой клавишей. Тогда `state.keys.left/right` остаётся `true`, и после Resume кот едет сам.
- Как исправить: одна строка — `["pointerup", "pointercancel", "blur"].forEach(t => window.addEventListener(t, () => { state.keys.left = state.keys.right = false; }));`, плюс тот же сброс в обработчике `visibilitychange`.
- Критерий готовности: в окне ≤560 px зажать кнопку, увести мышь и отпустить вне неё — кот останавливается; после переключения вкладки с зажатой A кот стоит.
- Источники: doc8-04, doc10-30. Объединены C1-15 и B-21.

### C1-16 [P3] Мёртвый CSS: найдены 4 класса и 1 id без единой ссылки в разметке и JS
- Статус: ЧАСТИЧНО (масштаб «13 155 строк возможно лишних» не подтвердился)
- Где сейчас: `site/tools/css-coverage-audit.mjs` (запущен в копии): 545 class-селекторов, 10 id; без ссылок — `.brand-slogan-lockup` (`css/base.css:730`, `motion.css:8`), `.devlog-actions` (`css/site-sections.css:305`), `.game-progress` и `.game-progress-track` (`css/game-components.css:33-88`, `css/home-polish-2026.css:309`), `#game-cluster` (`css/home-polish-2026.css:263`, `css/base.css:1011-1027`). Всего в `css/` 13 155 строк (+ `motion.css`, `404.css`). Скрипт ищет подстроки и не охватывает `404.css`, а также правила, которые перекрыты другими.
- Проблема: небольшой хвост неиспользуемых правил, вреда для пользователя нет.
- Как исправить: удалить перечисленные правила (десятки строк); большие переписывания не нужны. Скрипт пишет `site/reports/`, поэтому запускать в копии.
- Критерий готовности: повторный запуск в копии показывает 0 неиспользуемых классов из списка.
- Источники: doc3-01

### C1-17 [P3] Главная перекрашивается вторым слоем `home-polish-2026.css`, часть правил дублируется между играми
- Статус: ЧАСТИЧНО (структура подтверждена, дефекта нет; опционально)
- Где сейчас: `site/css/home-polish-2026.css` — 987 строк, 213 селекторов `body.home-polish-2026 …`, перекрывает `css/site-sections.css` (пример: `.devlog-card` — `site-sections.css:267` и `home-polish-2026.css:463`); игровые страницы имеют отдельные `nature/candy/paint/ball-page.css` (по 1000–1900 строк) и общие `*-hero-layout` в `responsive-tablet.css:206-224`. `candyBg1…10` в `css/keyframes.css:213-270` — десять похожих по 5 строк, но это осознанный crossfade.
- Проблема: придётся помнить, какое правило побеждает; изменение страницы игры затрагивает несколько файлов.
- Как исправить: договорённость «правим исходное правило, а не добавляем слой поверх»; переписывать не нужно.
- Критерий готовности: не требуется (процессное решение).
- Источники: doc5-40, doc11-42, doc11-41

### C1-18 [P3] `Inter` указан первым в стеке шрифтов, но не подключён
- Статус: ЧАСТИЧНО (в аудите назывались `ball/candy/paint-page.css`; сейчас — `base.css` и `404.css`)
- Где сейчас: `site/css/base.css:54` (`--font: Inter, ui-sans-serif, system-ui, …`), `site/404.css:47`; `@font-face`/`@import` в CSS нет, CSP `font-src 'none'`.
- Проблема: `Inter` применится только у тех, у кого он установлен в системе; у остальных вид зависит от системного шрифта ОС. Дефекта отображения нет, но стек вводит в заблуждение.
- Как исправить: убрать `Inter,` из двух мест (если нужен именно Inter — подключать своим `@font-face` и менять `font-src`; для сайта без внешних ресурсов это лишнее).
- Критерий готовности: `rg -n 'Inter' site/css site/404.css` пусто.
- Источники: doc8-27

### C1-19 [P3] Факты об играх дублируются в нескольких местах
- Статус: ЧАСТИЧНО
- Где сейчас: `site/scripts.js:142-185` (`gameProfiles`), `site/tools/devlog-data.mjs:7-50` (`gameDevlogSources`), JSON-LD и текст в `index.html`/`games/*.html`, `llms.txt`.
- Проблема: `gameProfiles` в `scripts.js` вообще не используется интерфейсом (недостижимое окно игры, C1-07), поэтому реально расходиться могут JSON-LD, HTML и `devlog-data.mjs`; `seo-check.mjs` проверяет часть согласованности.
- Как исправить: удалить `gameProfiles` вместе с C1-07; общую модель GameCatalog не вводить (для четырёх игр это избыточно), при необходимости расширить `seo-check.mjs`.
- Критерий готовности: `rg -n 'gameProfiles' site/scripts.js` пусто.
- Источники: doc4-19

### C1-21 [P3] Залипающий `:hover` на сенсорных устройствах
- Статус: ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА
- Где сейчас: `rg -c ':hover' site/css site/motion.css` — 54 строки, `@media (hover: hover)` — 0 (в аудите было 45); `css/home-card-base.css:31-39` (`.game-card:hover { transform: translateY(-8px) }`), `css/home-polish-2026.css:297` (`-6px`).
- Проблема: на iPhone карточка может оставаться приподнятой после касания; эффект косметический. Простая обёртка в `(hover: hover)` ломает эффекты на гибридных устройствах.
- Как исправить: для карточек игр и devlog перенести декоративный hover в `@media (hover: hover) and (pointer: fine)` и продублировать на `:focus-visible` (там, где его ещё нет).
- Критерий готовности: реальный iPhone и Android: после тапа по карточке она не остаётся приподнятой.
- Источники: doc5-14

### C1-22 [P3] Прокрутка фона под модальным окном на iOS Safari
- Статус: ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА
- Где сейчас: `site/css/base.css:200-203` (`body.modal-open, body.menu-open { overflow: hidden }`), `site/scripts.js:1621-1642` (`syncModalLock` ставит `inert` на страницу, но не блокирует прокрутку html).
- Проблема: поведение `overflow: hidden` на `body` в iOS Safari зависит от версии; на десктопе при его включении полоса прокрутки исчезает и контент сдвигается. Проверить без устройства нельзя.
- Как исправить: если на устройстве воспроизведётся — добавить `overflow: hidden` для `html:has(body.modal-open)` (по образцу `html:has(...)` из `base.css:96`).
- Критерий готовности: на iPhone при открытом окне свайп не двигает фон.
- Источники: doc8-53

### C1-23 [P3] Мелкий шрифт: 31 фиксированное объявление меньше 12 px
- Статус: ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА (метрика подтверждена, дефект не доказан)
- Где сейчас: `font-size` в px/rem/em по `css/*.css`, `motion.css`, `404.css` без `clamp()`: 146 объявлений, 31 меньше 12 px, 76 меньше 14 px (в аудите 121/28/64); примеры: `css/responsive-mobile.css:171-183` (0.68rem), `:277`, `:334` (0.66rem), `404.css:1175` (11px); самое мелкое — `css/base.css:1293` (`.language-option-code`, 0.58rem, но элемент `aria-hidden`).
- Проблема: часть подписей на мобильных может быть трудночитаемой; это показатель риска, а не доказанная ошибка.
- Как исправить: ручная проверка на реальном телефоне, при 200% текста и крупном шрифте ОС; поднять только действительно информативные подписи.
- Критерий готовности: подписи со смыслом (`.nature-hero-stats small` и аналоги) читаемы на телефоне 360 px.
- Источники: doc5-16

### C1-24 [P3] `color-mix()` везде без запасного значения
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: 267 вхождений `color-mix(` в `site/css/*.css`, `motion.css`, `404.css` (в аудите 157/173); минимальная поддерживаемая версия браузеров нигде не записана (`rg` по `QUALITY_CHECKS.md`, `PRODUCT.md` — пусто).
- Проблема: браузер без `color-mix()` (Safari до 16.2, Chrome до 111) отбросит всё объявление, то есть рамки и фоны; таких версий в 2026 году очень мало.
- Как исправить: записать минимальную версию (например Safari 16.2+, Chrome 111+) в `QUALITY_CHECKS.md`; запасные цвета не добавлять без решения о поддержке более старых браузеров.
- Критерий готовности: минимум браузеров записан.
- Источники: doc5-41

### C1-25 [P3] PWA `display: standalone` без offline-стратегии
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: `site/manifest.webmanifest:7`; service worker нет (`rg serviceWorker` по JS пусто; CSP `worker-src 'none'`).
- Проблема: установленный ярлык без сети не работает; ожидание «приложения» может не совпасть с реальностью. Для витрины студии это нормально.
- Как исправить: ничего не добавлять (SW без сценария не нужен); при желании — убрать `display: standalone` (станет `browser`), либо принять как есть вместе с C1-06.
- Критерий готовности: решение владельца записано.
- Источники: doc4-47

### C1-26 [P3] `scripts.js` — монолит на 2199 строк
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА (в аудите doc8 говорилось «4000+ строк» — неверно)
- Где сейчас: `site/scripts.js` — 2199 строк, 42 страницы; отдельно `game-theme.js` (291), `404.js` (1093).
- Проблема: темы, canvas, модальные окна, FAQ, контакт и фильтры живут в одном замыкании с общим состоянием; реальный вред виден в C1-01 (сбой одной подсистемы ломает остальные). Само по себе разделение не обязательно.
- Как исправить: сначала закрыть C1-01 и C1-07; разделение на модули и фреймворк не требуются.
- Критерий готовности: не требуется.
- Источники: doc4-48, doc8-60

### C1-27 [P3] Адрес в `mailto:` виден сборщикам спама
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: `site/index.html` — 18 ссылок `mailto:willowinworlds@gmail.com` (например `:762`, `:789`, `:795`, `:877`).
- Проблема: адрес в HTML попадает в базы спамеров; отчёт сам считает статус-кво приемлемым. Адрес старого домена `contact@willowinworld.com` в `site/` уже отсутствует (см. «Отклонено»).
- Как исправить: оставить; JS-обфускацию добавлять только при реальном росте спама, потому что она ломает ссылку без JS.
- Критерий готовности: не требуется.
- Источники: doc3-14

### C1-28 [P3] Нет аналитики и мониторинга ошибок
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: `site/index.html:922` («no analytics scripts, advertising pixels, tracking cookies»), CSP `connect-src 'none'` (`index.html:28`), `site/scripts.js` отправок не делает.
- Проблема: воронка и JS-ошибки не видны (C1-01 такой тип ошибки как раз пропустил бы); при этом это сознательный приватный выбор, зафиксированный в тексте политики.
- Как исправить: если владелец захочет измерения — выбрать аналитику без cookie и обновить privacy-текст и CSP; иначе принять. Для ошибок на проде есть вариант без отправки данных — только ручная проверка в браузере после релиза.
- Критерий готовности: решение владельца записано.
- Источники: doc11-25, doc8-83

### C2-04 [P3] 17 render-blocking CSS-файлов на главной (12 на страницах игр, 18 на press-kit, 8 на legal/privacy/asset-usage)
- Статус: ПОДТВЕРЖДЕНО (структура); эффект — по скану 8 ноября
- Где сейчас: `site/index.html:37-53` — 17 `<link rel="stylesheet">` (`css/base.css` … `css/home-polish-2026.css`, плюс `motion.css`); `games/*.html:91-102` — 12; `press-kit.html` — 18; одинаково во всех 41 локали (проверено счётчиком по `*/index.html`, `*/games/*.html`, `*/press-kit.html`). Суммарно по 17 файлам главной: 173 919 B raw, ≈ 39 KB gzip -9 (локальный подсчёт); на проде `css/base.css` 7 043 B gzip (curl). Файлы не минифицированы (`css/base.css` 1 360 строк).
- Проблема: по scan1/scan2 Lighthouse оценивает экономию блокировки рендера в 1,160 ms (mobile, Slow 4G) / 380 ms (desktop) при общем весе блокирующих ресурсов 70.7 KiB (с `scripts.js`). Но Perf 97/100, FCP 1.3 s, LCP 1.7 s; на HTTP/2 (Fastly) 17 мелких запросов идут параллельно. Это оставшаяся лабораторная возможность, а не дефект; сырые P1 (doc11-06) завышены.
- Как исправить: расширить `site/tools/build-minified.mjs` (сейчас только минифицирует каждый файл отдельно) конкатенацией CSS каждого шаблона в порядке каскада (в `motion.css` есть `@layer motion` — порядок сохранить) и публиковать `site/dist` вместо `./site` (`.github/workflows/pages.yml:33`). Это общий с AUD-12 шаг сборки (группа A).
- Критерий готовности: `rg -c '<link rel="stylesheet"' site/dist/index.html` ≤ 2; PSI mobile «Render blocking requests» < 300 ms.
- Источники: doc3-04, doc5-19, doc7a-09, doc11-06, scan1, scan2 (render-blocking), AUD-12

### C2-05 [P3] `scripts.js` и `game-theme.js` без `defer` и без минификации; минифицированный `dist` не публикуется
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/index.html:1104` `<script src="scripts.js?v=20260801-1"></script>`; `site/games/*.html` (`game-theme.js?v=20260801-1`: `nature-seed.html:442`, `candy-shop.html:419`, `paint-blasters.html:411`, `ball-is-god.html:629`). `scripts.js` 81 869 B / 2 199 строк, gzip -9 19 858 B; `.github/workflows/pages.yml:33` `path: ./site`; `site/dist` в `.gitignore:20`.
- Проблема: scan1 включает `scripts.js` в render-blocking (20.5 KiB, 450 ms) и «Minify JavaScript» −4.3 KiB. Реальная выгода мала: минификатор проекта на локальном `site/dist` (сборка 10 ноября) даёт `scripts.js` 72 167 B, gzip 19 073 B против 19 982 B (≈ −0.9 KB gzip; замер на копии, прод не затрагивался).
- Как исправить: добавить `defer` к `<script src="scripts.js...">` и `game-theme.js` (скрипт уже последний в `body`, порядок выполнения и `document.currentScript?.src` на `scripts.js:4`/`game-theme.js:4` сохраняются; для classic defer-скрипта `currentScript` задан). Минификацию имеет смысл включать только вместе с публикацией `dist` (C2-04 / AUD-12).
- Критерий готовности: `rg 'scripts.js' site/index.html` содержит `defer`; `scripts.js` исчезает из списка render-blocking в PSI.
- Источники: doc11-27, scan1, scan2, scan3 (Minify JavaScript), AUD-12

### C2-06 [P3] Главная: три изображения с `fetchpriority="high"` + preload sketch; painted-слой невидим первые ~4.3 s
- Статус: ПОДТВЕРЖДЕНО (разметка); влияние на LCP — ТРЕБУЕТ БРАУЗЕРА
- Где сейчас: `site/index.html:36` (preload `nature-seed-sketch-720.webp`, high), `:228` (логотип, high), `:279` (sketch, high), `:282` (painted `<img>` в `<picture>` с AVIF-источником `:281`, high). `.nature-level-painted { opacity: 0 }` (`site/css/nature-scene.css:102-105`), keyframes `naturePaintCycle` держат `opacity: 0` на 0–31% цикла 14 s (`site/css/keyframes.css:34-39`, `--nature-cycle: 14s` `nature-scene.css:3,49`) ≈ первые 4.3 s.
- Проблема: painted-слой (по scan1 `nature-seed-hero-720.avif` 27 KiB; на широком экране AVIF до 87 KB) загружается с высоким приоритетом, хотя на экране его нет; он конкурирует с LCP-кандидатом (sketch 20.7 KB) и логотипом. Утверждение doc10-27 про «preload painted-версии» неточно: preload один (sketch). LCP-элемент в сканах не указан (GTmetrix: «LCP element 1,240 ms, N/A»); по коду кандидаты — sketch-изображение или текст `h1`. Ни один кандидат не lazy.
- Как исправить: снять `fetchpriority="high"` с `:282` (painted); логотип `:228` оставить, если замер покажет, что он не мешает. Правка в EN `index.html` + `localize-site.mjs`.
- Критерий готовности: DevTools Network (mobile preset): в Priority у painted AVIF не «High»; LCP не хуже прежнего (PSI mobile ≤ 1.7 s).
- Источники: doc10-27, doc4-25 (по главной), scan1

### C2-07 [P3] Press-kit и страницы игр: `srcset` смешивает `previews/` и `downloads/` для миниатюр 76 px
- Статус: ПОДТВЕРЖДЕНО (по расчёту выбора браузера); фактический выбор — ТРЕБУЕТ БРАУЗЕРА
- Где сейчас: `site/press-kit.html` (8 `srcset` с `downloads/`), например `srcset="assets/previews/nature-seed/…icon.webp 360w, assets/downloads/nature-seed/…icon.webp 1024w" sizes="(max-width: 760px) 34vw, 76px"`; слот `site/css/game-content.css:282-288` (76×76 px); `games/nature-seed.html:238` и ещё 27 таких `srcset` (кандидат `downloads/…1600w`, `sizes="(max-width: 560px) 44vw, 28vw"`). Размеры: `downloads/nature-seed/…game-icon.webp` 213 626 B против `previews/…` 25 748 B.
- Проблема: при `sizes` 34vw на телефоне шириной ~390 px слот ≈ 132 CSS px; при DPR ≥ 2.75 нужно >360 px, и браузер берёт `downloads/…1024w` (до ~200 KB) для миниатюры 76 px. Все эти `<img>` lazy, то есть расход только при прокрутке. Остальные подозрения doc8-64/65 не подтвердились (см. «Отклонено»).
- Как исправить: добавить промежуточный 720w-превью в `assets/previews/` и поставить его в `srcset` вместо `downloads/…`; `downloads/` оставить только в `href` (`<a class="asset-link" … download>`).
- Критерий готовности: `rg -o 'srcset="[^"]*downloads/' site/press-kit.html` — пусто.
- Источники: doc8-46

### C2-08 [P3] 404-игра: работа каждый кадр и синхронная обработка спрайтов
- Статус: ПОДТВЕРЖДЕНО (путь вызова); длительности — ТРЕБУЕТ БРАУЗЕРА
- Где сейчас: `site/404.js:243-253` `updateHud()` пишет 5 `textContent`, вызывается из `update()` (`:725`) каждый кадр (`frame()` `:998-1005`); `:728-779` `drawBackground()`/`drawGround()` заново строят градиенты и кривые Безье каждый кадр (`:732`, `:742`, `:764`); `:90-146` `processSprite()` на `load` каждого из 10 `Image` (`:35-37`): `getImageData`, flood-fill, `trimTransparentCanvas`, `toDataURL("image/png")` в `src` превью (`:144`), всё в главном потоке.
- Проблема: лишняя нагрузка CPU/GPU на странице ошибки; в простое цикл уже замедлен (`nextFrameDelay` `:972-977`: 260 ms в idle/gameover, 420 ms на паузе, 800 ms при `document.hidden`), поэтому «цикл не засыпает» (doc8-35) в целом неверно: непрерывно он работает только в режиме `playing` и в видимой вкладке. Время обработки спрайтов не измерено.
- Как исправить: (минимум) кэшировать последние значения HUD и писать только при изменении; рисовать статичный фон один раз в offscreen-canvas и перерисовывать при `resize`; спрайты — `canvas.toBlob`/`createObjectURL` вместо `toDataURL`. Оффлайн-обрезка ассетов — опционально.
- Критерий готовности: Performance-профиль 404 в режиме `playing`: время `drawBackground`+`updateHud` на кадр снижено (замер до/после).
- Источники: doc8-19, doc8-20, doc8-23, doc8-25, doc8-35

### C2-09 [P3] `content-visibility: auto` с фиксированным `contain-intrinsic-size: 720px`
- Статус: ПОДТВЕРЖДЕНО (факт); CLS — не измерено
- Где сейчас: `site/css/responsive-mobile.css:690-698` (`@supports (content-visibility: auto)` для `.timeline, .devlog-grid, .asset-list, .press-window-grid, .brand-rules`, без media-условия); на главной `.timeline` и `.devlog-grid` возвращены в `visible` (`site/css/home-polish-2026.css:413-414, 459-460`), поэтому эффект остаётся на страницах игр и press-kit. Прочий `contain`: `site/css/home-ball-card.css:45` `contain: paint` (в сырой находке doc3-12 указан неверный файл `ball-page.css`), `site/css/ball-page.css:450` `contain: none`.
- Проблема: высота блоков разная, подстановка 720 px даёт скачок полосы прокрутки при подходе к блоку. На главной CLS 0 по сканам; на страницах игр и press-kit PSI/Lighthouse не запускались.
- Как исправить: `contain-intrinsic-size: auto 720px` в `responsive-mobile.css:697` (браузер запоминает фактическую высоту). Добавлять новое `contain` без замера не нужно.
- Критерий готовности: `rg 'contain-intrinsic-size: 720px' site/css/responsive-mobile.css` — пусто; Lighthouse CLS страницы игры = 0.
- Источники: doc7b-03, doc3-12

### C2-10 [P3] Принудительный reflow, длинные задачи и немоноскомпозитные анимации на главной (по сканам)
- Статус: ПОДТВЕРЖДЕНО (по скану 8 ноября; код согласуется); влияние малое
- Где сейчас: forced reflow по scan1/scan2: `scripts.js:105:25` 61 ms (mobile) / 89 ms (desktop) — это чтение `window.innerWidth` в инициализации `state` (`site/scripts.js:105`); `:277:65` 31/39 ms — `getPropertyValue` в `refreshCssCache()` (`site/scripts.js:274-278`), вызывается из `setTheme` на старте (`:1365-1370`, `:2196`). Длинные задачи (scan1) 68, 62, 52 ms около 1.5–1.65 s (выполнение `scripts.js` после таймера 900 ms `startLoopAfterFirstPaint` `:1355-1362`). Non-composited animations (64 элемента): `transition` на `color`/`border-color`, `filter` на `.brand-w` (`site/css/base.css:348-361`), `stroke-dashoffset` у `natureDrawRoute` (`site/css/nature-scene.css:132`, `keyframes.css:93`).
- Проблема: TBT 30 ms (mobile) и 0 ms (desktop) по scan1/scan2; GTmetrix TBT 352 ms при другом профиле (Seattle, Lighthouse 12.6.1), см. противоречие scan «TBT». Чтение `innerWidth` на старте только переносит неизбежный первый layout.
- Как исправить: действий не требуется; при желании свернуть `refreshCssCache()` в один вызов `getComputedStyle` (уже так) и вынести `window.innerWidth` в ленивый расчёт — выигрыш в пределах десятков миллисекунд на throttled CPU. Не трогать анимации `brand-w`.
- Критерий готовности: повторный PSI mobile — TBT ≤ 30 ms и «Forced reflow» ≤ 60 ms суммарно.
- Источники: scan1 (Forced reflow / long tasks / non-composited), scan2, scan3 (Reduce JavaScript execution time), кандидаты [perf][P2] в w9-scans

### C2-11 [P3] Ленивая загрузка в первом экране: только `nature-seed.html:146`
- Статус: ЧАСТИЧНО
- Где сейчас: `site/games/nature-seed.html:146` — `<img loading="lazy" class="nature-level nature-level-sketch" src="../assets/Nature%20Seeds/Galvnie_3_0-site.webp" width="1440" height="810">` в `.nature-hero-bg` (фон первого экрана; 90 386 B; непрозрачность 0.72, `site/css/nature-page.css:366-370`). Painted-слой рядом (`:149`) eager, `fetchpriority="high"`, AVIF-preload. Остальные страницы: `candy-shop.html:173` (`candy-bg-10` — видимый верхний слой, eager, `<picture>` AVIF), `paint-blasters.html:169` (`paint-bg`, eager), `ball-is-god.html:166` (`ball-bg`, eager) — lazy у них только скрытые слои стека и облака. На главной lazy у 56 из 59 `<img>`, eager: логотип `:228`, sketch `:279`, painted `:282`.
- Проблема: утверждение doc8-05 («то же на candy/paint/ball») не подтверждено — подтверждается только Nature Seed; sketch-фон страницы lazy, что может задержать его появление (браузер не находит его сканером предзагрузки). Влияние на LCP не измерено; painted-слой с preload перекрывает его по ходу цикла.
- Как исправить: убрать `loading="lazy"` в EN `games/nature-seed.html:146`, затем `node site/tools/localize-site.mjs`.
- Критерий готовности: `rg 'loading="lazy" class="nature-level nature-level-sketch" src="../assets/Nature%20Seeds/Galvnie_3_0' site/games/nature-seed.html` — пусто.
- Источники: doc8-05, doc3-17 (см. «Отклонено»)

### C2-12 [P3] Курсор-маскот: rAF-цикл не засыпает; `getBoundingClientRect` в `initCardShine` (только десктоп)
- Статус: ЧАСТИЧНО
- Где сейчас: `site/game-theme.js:130-203` `initCursorMascot`: создаётся только при `(hover: hover) and (pointer: fine)`, без `prefers-reduced-motion` и без low-data (`:138-140`); после первого `pointermove` (`:191-198`) `render` (`:167-177`) каждый кадр пишет `transform`, цикл останавливается только `mouseleave`/`blur`/`document.hidden` (`:183-190`, `:199-203`). `will-change: transform, opacity` стоит на `.nature/.candy/.paint/.ball/.press-cursor-mascot` (`nature-page.css:998`, `candy-page.css:13`, `paint-page.css:786`, `ball-page.css:840`, `press-kit.css:736`). `site/scripts.js:1824-1836` `initCardShine`: на `pointermove` читает `getBoundingClientRect()` и пишет 2 CSS-переменные; тоже только fine pointer и не lowMotion.
- Проблема: подтверждено — цикл не останавливается в покое (покачивание `Math.sin(time…)` пишется в DOM каждый кадр); не подтверждено — «обновление на каждом pointermove» (doc8-34): обработчик `pointermove` только сохраняет цель, DOM пишется в rAF, на touch-устройствах маскот не создаётся. Для `getBoundingClientRect` (doc4-27) метрик нет; события pointermove склеиваются по кадрам.
- Как исправить: опционально, десктоп; остановить цикл при `|target − current| < 0.5` и неподвижной цели, покачивание перенести в CSS-анимацию.
- Критерий готовности: DevTools Performance при неподвижном курсоре над страницей игры — нет кадров rAF.
- Источники: doc10-17, doc5-12 (часть про маскот), doc8-34, doc4-27

### C2-13 [P3] Бесконечные CSS-анимации: пауза вне экрана есть на главной, нет на страницах игр, press-kit и 404
- Статус: ЧАСТИЧНО
- Где сейчас: всего 95 вхождений `infinite` и 98 `@keyframes` (`404.css` 17, `nature-scene.css` 13, `press-kit.css` 11, `paint-page.css` 11, `nature-page.css` 9, `ball-page.css` 9, `home-ball-card.css` 8, `home-paint-card.css` 7, `candy-page.css` 5, `home-candy-card.css` 3). Уже реализовано: `site/scripts.js:1916-1930` `initGameAnimationVisibility` (IntersectionObserver, `rootMargin: 260px`) ставит `.is-animation-paused` на `.game-card` вне экрана → `animation-play-state: paused` (`site/css/home-card-base.css:~108-116`); `body.low-motion .ambient-only`/`magic-off` — пауза (`site/css/base.css:196-198`); `prefers-reduced-motion` — 1 итерация (`site/css/responsive-preferences.css:53-66`); на ≤760 px декоративные слои `display: none` (`responsive-preferences.css:2-9`). `ball-menu-sun` с `moonFloat 8s` — `site/css/ball-page.css:200` (также `press-kit.css:251`, `nature-page.css:478`).
- Проблема: на страницах игр/press-kit анимации hero и фона работают всегда, пока вкладка видима; рекомендация doc3-09 («IntersectionObserver») уже выполнена для главной. Оценка «5–15% батареи/час» в отчёте не измерена; в фоновых вкладках браузеры сами останавливают кадры, поэтому часть утверждения неверна. Число композитных слоёв (doc8-62) — только DevTools → Layers.
- Как исправить: опционально; переиспользовать тот же класс паузы для hero-блоков на страницах игр. Без замера не менять.
- Критерий готовности: DevTools Rendering → Layers на странице игры: число слоёв и FPS при прокрутке (замер до/после).
- Источники: doc3-09, doc11-39, doc8-62 (+ doc3-05 как анимационная часть)

### C2-14 [P3] Canvas главной: порог деградации FPS 28 при лимите 30, цикл не засыпает; память при больших DPR ограничена
- Статус: ЧАСТИЧНО (механика подтверждена; частота ложных срабатываний — ТРЕБУЕТ УСТРОЙСТВА)
- Где сейчас: `site/scripts.js:423-427` — лимит `1000/31` мс при ширине <760, высоте <620, `lowMotion` или `lowData`; `:1315-1316` — `fpsScore = fpsScore*0.94 + 0.06*(1000/max(16, dt))`, при `fpsScore < 28 && now > 4500` включается `lowMotion` (`:1317-1323`); цикл тогда рисует один кадр и останавливается (`:1335-1338`); возврат — кнопкой «Full Magic» (`:2063-2072`), автоматически нет. В обычном режиме `render` перепланирует себя всегда (`:1340-1342`); `startLoop` из `pointermove` (`:1424`) возвращается сразу, если `rafId` уже есть (`:1349`) — перезапуска «на каждом движении» (doc5-12) нет. Пауза: `visibilitychange` (`:2146-2149`); старт после первой отрисовки с задержкой 900 ms (`:1355-1362`); `devicePixelRatio` ограничен 1.15–1.65 (`:407-409`) → doc10-09 смягчён; два полноэкранных canvas (`:11`, основной).
- Проблема: на устройстве с честными 30 fps запас до порога 2 fps; любые просадки (при 60 Гц отрисовка идёт каждые 2 тика ≈ 33.3 ms = 30 fps; порог 28 fps ≈ 35.7 ms, то есть достаточно, чтобы примерно каждая седьмая отрисовка заняла 3 тика, расчёт мой, не замер) переводят страницу в статичный фон до перезагрузки (корректная деградация, не поломка). По scan1 (эмуляция Moto G Power, Slow 4G) TBT 30 ms, CLS 0, Perf 97; реальных замеров INP/памяти/батареи на слабом Android нет.
- Как исправить: порог сделать относительным к лимиту кадров (например `limit ? 24 : 28`), одна строка в `scripts.js:1316`; остальное — не менять без замера на устройстве.
- Критерий готовности: на реальном Android среднего класса и в DevTools с 4× CPU throttling `body.low-motion` не включается без перегрузки в первые 10 s.
- Источники: doc5-11, doc5-12 (часть про canvas), doc10-09, doc3-05, doc4-24, doc11-26, doc7a-17 (данные теперь есть частично: scan1–3 + doc1)

### C2-15 [P3] `backdrop-filter` (37 blur-деклараций) без мобильного fallback; поломка на iOS Safari не подтверждена
- Статус: ТРЕБУЕТ БРАУЗЕРА/УСТРОЙСТВА (количество и места подтверждены)
- Где сейчас: 42 декларации `backdrop-filter` (37 `blur(...)`, 5 `none`) в `css/*.css` и `404.css`: `base.css` 7 (`.site-header` `:286`, `.eyebrow` `:675`, `.hero-portal-badge` `:845`, `.magic-hud` `:924`, `.soft-card` `:1055`, `.language-switcher summary` `:1219`, `.language-options` `:1260`), `ball-page.css` 7, `404.css` 5, `nature-page.css` 4, `site-sections.css` 3 (`.system-card` `:37`, `.site-footer` `:441`, `.modal` `:527`), `press-kit.css` 3, `paint-page.css` 3, `home-polish-2026.css` 3 (`.filter-btn` `:276`, `.final-cta .container` `:613`), `candy-page.css` 3, `nature-scene.css` 2, `home-card-base.css` 1, `game-shell.css` 1. В DOM главной ≈ 43 элемента (в т.ч. 16 `.eyebrow`, 8 `.system-card`, 5 `.filter-btn`, шапка, подвал). Смягчения: `prefers-reduced-transparency` отключает blur только у `.site-header`, `.filter-btn`, `.final-cta .container` на главной (`home-polish-2026.css:981-987`); `-webkit-backdrop-filter` в CSS нет (0 вхождений; для Safari <18 это значит отсутствие blur, версию проверить по caniuse — в этой сессии не проверял); отключений на мобильных и `@supports` для blur нет.
- Проблема: по сырой находке doc3-08 (отчёт ставил «критическое») возможны сбои WebContent на iOS Safari из-за множества blur-слоёв. Внешние WebKit-баги не открывались, поведение на устройстве не воспроизведено, в сканах поломок нет → по доказательствам это P3; поднять до P2/P1 при воспроизведении на iPhone.
- Как исправить: сначала проверка на iPhone (iOS 17.5–18.x): главная, модалки, шапка, 404; при проблеме — `@media (max-width: 760px) { .eyebrow, .system-card, … { backdrop-filter: none } }` с непрозрачной заливкой только для конкретных селекторов, не по всему сайту.
- Критерий готовности: Safari Web Inspector на реальном iPhone — нет перезагрузки вкладки при 2-минутной прокрутке главной и Ball is God.
- Источники: doc3-08, doc4-26, doc7b-01, doc5-17 (число блюров/`mix-blend-mode` 32/`position: fixed` 27 по моему подсчёту; у отчёта 20/18 — расхождение не разбирал), doc11-38, doc11-26

### C2-16 [P3] Кэш: GitHub Pages отдаёт `cache-control: max-age=600` для всего; настроить нельзя
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: прод (curl 13 ноября): `/` → `HTTP/2 200`, `cache-control: max-age=600`, `content-encoding: gzip`, `server: GitHub.com`; `css/base.css?v=20260801-2` → `max-age=600`, gzip 7 043 B; `assets/Paint Blasters/site/back.webp` → `max-age=600`, 153 278 B; условный GET с `If-None-Match` → `HTTP/2 304`. Конфиги `site/_headers:14-15` (`/assets/*` год, `immutable`) и `site/deploy/nginx-security.conf:25-27` (`expires 1y`) на проде не применяются.
- Проблема: сканы (scan1–3) показывают «Use efficient cache lifetimes» 1,334 / 1,369 KiB и 1.28 MB; на деле повторный визит после 10 минут стоит условных запросов с ETag/304, а не повторной загрузки. Риск «годовой кэш без версий» (doc9-09, doc10-18, doc5-13) на проде не воспроизводится — он появится только при переезде на nginx/CDN с этими правилами; тогда имена в `assets/` без хеша станут проблемой. Ручные `?v=` непоследовательны (на главной 6 из 18 стилей/скриптов версионированы, 12 нет; `site-sections.css` с `?v=` на главной и без на страницах игр `games/{ball-is-god,candy-shop,paint-blasters}.html:96`, `nature-seed.html:97`), при TTL 600 s это безвредно.
- Как исправить: на GitHub Pages ничего; если нужен длинный TTL — поставить CDN/прокси с Cache Rules (решение за владельцем, оно же закрывает заголовки безопасности из группы A) и до этого ввести хеши/`?v=` для `assets/` из одного источника.
- Критерий готовности: `curl -sSI https://willowinworlds.com/assets/willowinworld-logo.webp | rg -i cache-control` показывает TTL ≥ 1 день только для версионированных URL.
- Источники: scan1, scan2, scan3, scan7 (max-age=600), doc9-09, doc10-18, doc5-13

</details>

## Объединённые дубли

- B-02 — объединено с C1-03
- B-13 — объединено с C1-02
- B-21 — объединено с C1-15
- C1-04 — объединено с D2-07 (часть 2)
- C1-20 — объединено с C2-03

## Не делать: аудиты ошибались или это уже исправлено

Советы старых аудитов, которые при проверке 13.11 оказались неверными, устаревшими или уже выполненными. По одной строке: ID находки — вердикт — почему.

<details>
<summary>A — Деплой, безопасность, сборка, CI (19)</summary>

- doc3-26 — ИСПРАВЛЕНО: `sync-devlogs.mjs --check` уже в CI (`site-quality.yml:42-43`) и в `quality-check.mjs:19`.
- doc3-27 — ИСПРАВЛЕНО: `security-check` (внешние `src`) в CI (`site-quality.yml:36-37`), pre-commit-хук не нужен; хуков в `.git/hooks` нет.
- doc3-28 — НЕ ПОДТВЕРЖДЕНО: гипотетический регресс-риск без конкретных нарушений.
- doc6-03 — ИСПРАВЛЕНО: страницы локалей генерируются `localize-site.mjs`, `--check` подтверждает синхронность (`Localization check passed: 41 locales × 9 pages`); пробел в CI закрывает A-03.
- doc6-07 — НЕ ПОДТВЕРЖДЕНО: хеш в CSP нужен не для JS (`script-src 'self'`, скрипты внешние), а только для JSON-LD (см. A-24).
- doc7b-19 — ИСПРАВЛЕНО/НЕ ПОДТВЕРЖДЕНО: «P0 разные хеши в meta и nginx» — сейчас хеш одинаковый (`2Icitt...`) в meta (прод `/`, `/ru/`), `_headers`, nginx, apache; блок JSON-LD CSP не блокирует; nginx на проде не применяется.
- doc11-18 — ИСПРАВЛЕНО: все 41 локаль несут тот же хеш, что nginx; остаточная избыточность в A-24.
- doc7b-20 — НЕ ПОДТВЕРЖДЕНО как дефект: `X-Frame-Options` вместе с `frame-ancestors` — намеренное дублирование; на проде оба не отправляются (A-04).
- doc7b-21 — НЕ ПРИМЕНИМО: `expires -1` для HTML только в nginx/`_headers`; на проде Pages отдаёт `max-age=600`.
- doc7b-22 — НЕ ПРИМЕНИМО и вредно: `immutable` на `/assets/` при стабильных именах без версий оставит старые картинки (см. A-21).
- doc7b-27 — НЕ ПОДТВЕРЖДЕНО как дефект: HSTS-preload лежит как опциональный сниппет (`deploy/hsts-preload-*`), на Pages HSTS не отправляется; решение отложено вместе с A-04.
- doc8-09 — ИСПРАВЛЕНО: `curl -sSI https://willowinworlds.com/nonexistent-xyz-audit` -> `HTTP/2 404` с телом `404.html` (6164 байта).
- doc8-67 — ИСПРАВЛЕНО: `/assets/downloads/candy-shop/candy-shop-cozy-candy-merge-puzzle-game-icon.webp` -> `200 image/webp`.
- doc8-70 — ИСПРАВЛЕНО/НЕ ПРИМЕНИМО: `.htaccess` корня нет; `deploy/apache-security.htaccess` содержимое известно, на Pages не применяется (A-15).
- doc10-31 — НЕ ПОДТВЕРЖДЕНО: в `site/assets` 374 файла (362 webp, 9 avif, 3 png), исходников (`.kra`, `.psb` и др.) нет; опционально security-check перевести с deny-list на allow-list `webp|avif|png`.
- doc11-09 — НЕ ПОДТВЕРЖДЕНО: CI есть (`.github/workflows/site-quality.yml`, `pages.yml`), но неполный и не гейтит деплой (A-01, A-03).
- doc11-11 — НЕ ПОДТВЕРЖДЕНО в части «при сборке»: неофициальный `translate.googleapis.com` (`client=gtx`) вызывается только при ручном `localize-site.mjs --translate` (`tools/localize-site.mjs:21,735-736,810,847`); ни `build-minified`, ни CI, ни `--check` сети не используют. Плановый dry-run в CI не нужен.
- doc11-40 — НЕ ПОДТВЕРЖДЕНО как дефект: regex-преобразования `translateHtml`/`addLocaleMetadata` (`tools/localize-site.mjs:931,990`) работают на текущем шаблоне, `localize-site --check` и `seo-check` проходят; отчёт сам советует не менять.
- scan «Кандидат» deploy-ci P1 (повторить deadlinkchecker после смены домена) — ИСПРАВЛЕНО/не воспроизводится: в `site/` 0 вхождений `willowinworld.com`, прод отдаётся из текущего HEAD (установлено брифом).

</details>

<details>
<summary>B — Доступность, HTML, 404 (20)</summary>

- doc3-06, doc8-12, doc7a-07 (часть про trap) — НЕ ПОДТВЕРЖДЕНО: `trapModalFocus` `scripts.js:1597-1619`, вызов `scripts.js:2134`; на время модалки `pageShell` и skip link получают `inert` + `aria-hidden` (`scripts.js:1621-1636`); Playwright: Tab-цикл остаётся внутри Careers и Contact.
- doc8-13 (общее) — НЕ ПОДТВЕРЖДЕНО: возврат фокуса есть (`scripts.js:1572-1581,1803-1811`; Privacy ✕ → «Privacy», шапка Contact ✕ → «Contact studio»); реальные дефекты — B-07, B-13, B-15.
- doc7a-06 — НЕ ПОДТВЕРЖДЕНО: `index.html:335` `<p class="filter-status" data-filter-status role="status" aria-live="polite">`, текст пишется в `scripts.js:1929-1965`.
- doc7b-11 — НЕ ПОДТВЕРЖДЕНО: `<main id="main-content">` есть (`index.html:257`); на `press-kit.html` и страницах игр свои цели; реальная проблема — B-02.
- doc7b-12 — НЕ ПОДТВЕРЖДЕНО: `aria-label=""` — 0 во всех HTML; «пустые» значения — артефакт выгрузки (`aria-labelledby`).
- doc8-32 — НЕ ПОДТВЕРЖДЕНО: `initFaq` (`scripts.js:1967-1980`) задаёт `id` и `aria-controls`; измерено `faq-answer-1…7`.
- doc8-33 — НЕ ПОДТВЕРЖДЕНО: при выключенном JS на 404 `h1`, текст и три ссылки «Home/Back to home» видны (статический HTML).
- doc8-55 — НЕ ПОДТВЕРЖДЕНО: `<img … aria-label>` — 0 во всех HTML.
- doc8-56 — НЕ ПОДТВЕРЖДЕНО как дефект: `index.html:244` `aria-label="Switch theme" title="Night Magic / Daylight"` — `title` не дублирует имя.
- doc8-59 — НЕ ПОДТВЕРЖДЕНО: 42 `role="img"` во всех HTML, все с `aria-label`/`aria-labelledby`.
- doc3-16 — НЕ ПОДТВЕРЖДЕНО в формулировке (`:focus-visible` есть, `base.css:465-471`); реальные пробелы — B-06.
- doc3-07 — НЕ ПОДТВЕРЖДЕНО: заявленные пары по расчёту ≥5.79:1 (`#466b68` на `#fffeeb`), Lighthouse Accessibility 100 (scan1/2, правило контраста в пройденных), WAVE Contrast Errors = 0 (см. B-17).
- scan5 «Contrast Errors 3» — НЕ ПОДТВЕРЖДЕНО: ошибка чтения сводки WAVE; 3 — это Alerts (Redundant link, не ошибки).
- doc4-31 — НЕ ПОДТВЕРЖДЕНО: отложенный `focus()` (30 мс, `scripts.js:1543,1569,1670,1800`) вызывается на `display:none` (`.modal{display:none}`, `site-sections.css:519-524`) — no-op; уложиться в 30 мс вручную нельзя.
- doc4-29 — НЕ ПОДТВЕРЖДЕНО (неактуально): режим созвездия запускает только `[data-play]` (`scripts.js:2031`), такого элемента нет ни в одном HTML; pointer-only остался у Easter egg (B-04).
- doc7b-05 — НЕ ПОДТВЕРЖДЕНО как отдельный дефект: `scrollbar-width:none` стоит на `html, body` (`404.css:48-53`), которые и так `overflow:hidden`; `.overlay` (≤920 px) имеет обычную прокрутку; см. B-11.
- doc6-11 — НЕ ПОДТВЕРЖДЕНО (touch targets): кнопки управления 76×76 px (`404.css:799-801`), пилюли ≥42 px (>24 px по 2.5.8); контраст 404 см. «Не проверено».
- scan4 #10 (inline script нарушает CSP) — НЕ ПОДТВЕРЖДЕНО: sha256 JSON-LD в `script-src` (`index.html:28`) совпадает с текущим содержимым `#structuredData` (`2IcittCIYqCRdKrw9U2GpqXqT274A5Z6YZzDD5+z4Ak=`; на проде тот же, HTML идентичен; хэш совпадал и в коммитах ed3f60e, 95d32e7); `ld+json` — блок данных, не исполняется; предупреждение — особенность vnu.
- doc4-30 — см. «Не проверено» (гипотеза без файлов).
- doc7a-18 — частично закрыто B-16, остальное в «Не проверено».

</details>

<details>
<summary>C1 — JS, CSS, PWA, RSS (21)</summary>

- doc3-18 — НЕ ПОДТВЕРЖДЕНО: все touch/mouse/pointermove-слушатели passive (`scripts.js:1831`, `:2169-2170`, `:2177`; `game-theme.js:191-197`; `404.js:1049-1052`); слушателей `wheel`/`scroll` нет.
- doc9-03 (часть «без JS контент скрыт») — НЕ ПОДТВЕРЖДЕНО: `data-reveal` ставит сам JS (`scripts.js:1846`), в HTML его нет (`rg -c data-reveal` по прод-странице пусто); Firefox 159 без JS: 0 элементов с `data-reveal`, `opacity` блока = 1. Часть про хеш — в C1-01.
- doc4-14, doc6-06, doc11-02 — ИСПРАВЛЕНО: `rg -l 'willowinworld\.com' site` (без `dist`) = 0 файлов; контакт сейчас `willowinworlds@gmail.com` (`scripts.js:1656`, `:2126`, `index.html`); доставка писем не проверялась (см. «Не проверено»).
- doc4-20 — НЕ ПОДТВЕРЖДЕНО: `getContext` не проверяется (`scripts.js:9`, `:12`), но `setTransform` вызывается только в `resize()` (`:416-417`), а меню, FAQ, контакт и фильтры инициализируются раньше (`:2184-2193` против `:2197`); `magicCanvas` есть на всех 42 страницах со `scripts.js`.
- doc5-15 — НЕ ПОДТВЕРЖДЕНО: `css/base.css:228-233` задаёт `font: inherit`, у `body` размер не меняется, в Firefox 159 вычисленный размер поля `#name` = 16px (автозум iOS не включается).
- doc5-39 — НЕ ПОДТВЕРЖДЕНО как дефект: весь `motion.css` обёрнут в `@layer motion` (`motion.css:1`, `:35`), не одно правило; перекрывающих неслойных правил для `.detail-card`, `.devlog-card`, `.press-window`, `.cover-title` не найдено; стоит помнить, что слойные правила всегда проигрывают неслойным.
- doc7a-03, doc7b-25, doc8-01 — НЕ ПОДТВЕРЖДЕНО: без JS контактное окно скрыто (`index.html:803`, `hidden`), но прямая ссылка есть в `#contact` (`index.html:756`, `:762`) и ещё в пяти местах, пункт меню «Contact» ведёт на `#contact`; `form-action 'none'` не мешает, так как форма никогда не отправляется (`preventDefault` и `window.location.href = mailto:` — `scripts.js:2110-2118`), `navigate-to` в CSP не существует. Остаточное ограничение «письмо зависит от почтового клиента» — AUD-11.
- doc7a-14 — НЕ ПОДТВЕРЖДЕНО: `initCursorMascot` вызывается один раз на страницу, слушатели ставятся один раз (`game-theme.js:136-215`), повторной инициализации и SPA-навигации нет; rAF останавливается на `mouseleave`, `blur`, `visibilitychange`.
- doc7b-15 — НЕ ПОДТВЕРЖДЕНО: `100vw` в `404.css` (`:73`, `:133`, `:236`, …) на странице с `html, body { overflow: hidden }` и `scrollbar-width: none`, полосы прокрутки нет, обрезки нет.
- doc8-06 — НЕ ПОДТВЕРЖДЕНО: `viewport-fit=cover` действительно нет (`index.html:6`), но тогда браузер сам вписывает страницу в безопасную область, перекрытия выемкой нет; `env(safe-area-inset-*)` в CSS есть (`css/base.css:1193-1194`, `:1324`), просто даёт 0.
- doc8-28 — НЕ ПОДТВЕРЖДЕНО: `overflow: hidden` на 404 осознанный (полноэкранная игра), но на `max-width: 920px` `.overlay` получает `overflow: auto` (`404.css:1034`, `:1069`), а для низких десктопов есть компактная раскладка (`:1012`).
- doc8-36 — НЕ ПОДТВЕРЖДЕНО: сборка скриптовая — `site/tools/localize-site.mjs`, `tools/locales/*.json`, `sync-devlogs.mjs`; миграция на Astro/Hugo не нужна.
- doc8-48 — НЕ ПОДТВЕРЖДЕНО: все запрашиваемые элементы есть в `404.html` (`data-theme-toggle`, `data-touch-left/right`, `data-start-game`, `lostStarsCanvas`); риск только при будущей правке разметки.
- doc8-49 — НЕ ПОДТВЕРЖДЕНО: `dt` ограничен `clamp(…, 0.001, 0.033)` (`404.js:1000`), `lastFrame` сбрасывается при `visibilitychange` (`:1078`).
- doc8-50 — НЕ ПОДТВЕРЖДЕНО: `404.css` подключён только в `404.html` (1 страница из всех), конфликта `:root` с другими страницами быть не может.
- doc8-54 — НЕ ПОДТВЕРЖДЕНО: заголовок `#gameModalTitle` в разметке не пуст («WillowinWorlds game», `index.html:1062`), окно `hidden` и без триггеров (`data-game` нет).
- doc8-57 — НЕ ПОДТВЕРЖДЕНО: `initFaq` согласованно ставит `hidden`/`inert` и `is-open` (`scripts.js:1967-2002`), закрытие по таймеру 320 мс возвращает `hidden`.
- doc8-61 — НЕ ПОДТВЕРЖДЕНО: нет доказательств; страничные CSS (`ball/candy/nature/paint-page.css`, `press-kit.css`, `home-polish-2026.css`) подключены только на своих страницах (по 42), порядок подключения статичен.
- doc8-68 — НЕ ПОДТВЕРЖДЕНО: 101 одноимённый файл в `assets/previews` и `assets/downloads` — это намеренные превью и оригиналы (пример: 360×203, 5 692 Б против 1600×900, 77 394 Б).
- doc8-73 — НЕ ПОДТВЕРЖДЕНО: `rss.xml` well-formed (`xmllint --noout`), на проде идентичен репозиторию, `Content-Type: application/xml`; смысловые проблемы ленты — C1-05.
- doc8-84 — ИСПРАВЛЕНО: `meta theme-color` обновляется при смене темы — `scripts.js:1378` (`metaThemeColor.content = …`) и `game-theme.js:44-57`.

</details>

<details>
<summary>C2 — Производительность (13)</summary>

- doc3-02 — НЕ ПОДТВЕРЖДЕНО: мобильный hero берёт 720w (`index.html:281-282`, `sizes="(max-width: 760px) 94vw, 50vw"`; в scan1 `nature-seed-hero-720.avif` 27 KiB), 1376w — только для широких экранов; LCP по скану 8 ноября 1.7 s (mobile) / 0.5 s (desktop) / 1.2 s (GTmetrix).
- doc11-28 — ИСПРАВЛЕНО: AVIF на главной уже используется (`<picture>` с `type="image/avif"`, `index.html:280-283`); WebP 176 KB (`nature-seed-hero-1376.webp` 175 786 B) остался только как fallback.
- doc3-11 — НЕ ПОДТВЕРЖДЕНО как дефект: `<picture>` AVIF+WebP на hero главной и страниц игр есть; остальное WebP-only — не отображается лишь в Safari <14 / Firefox <65 (аудитория пренебрежимо мала); fallback в PNG/JPEG — решение владельца, не доработка.
- doc3-13, doc7b-02 — НЕ ПОДТВЕРЖДЕНО: `will-change` только на пяти курсорах-маскотах (`nature-page.css:998`, `candy-page.css:13`, `paint-page.css:786`, `ball-page.css:840`, `press-kit.css:736`; маскот создаётся JS только на десктопе, см. C2-12) и на `.starfield::before/::after` в `404.css:102`, где слои анимируются бесконечно (`starfieldDrift` 36 s) — `will-change` там уместен; на «карточках и секциях» и статичных слоях не стоит.
- doc3-17 — НЕ ПОДТВЕРЖДЕНО: на главной lazy у 56 из 59 изображений (три eager — логотип, sketch, painted — в первом экране); на `ball-is-god.html` 10 одинаковых `level-medallion-256.webp` без lazy — один запрос на 9 786 B. (Единственный реальный случай lazy в hero — C2-11.)
- doc3-22 — НЕ ПОДТВЕРЖДЕНО: во всех папках игр (`Nature Seeds`, `Candy Shop`, `Paint Blasters`, `Ball is God/site`) каждый файл упомянут в HTML/CSS/JS по имени; не привязаны только 34 файла (17 `previews/` + 17 `downloads/`, 1 129 362 B) персонажей Ball is God в `assets/downloads/ball-is-god` и `assets/previews/ball-is-god`; на скорость страниц не влияют (в страницы не включены), вопрос архива — решение владельца (поиск по basename, без анализа динамически собираемых путей).
- doc8-63 — НЕ ПОДТВЕРЖДЕНО: в `404.css` нет `clip-path` и `mask` вообще (поиск по файлу пустой); `.nature-menu-leaf` относится к `nature-page.css`, не к 404.
- doc8-64 — НЕ ПОДТВЕРЖДЕНО: в EN-страницах (`index.html`, `press-kit.html`, `404.html`, `games/*.html`) все `<img>` имеют `width` и `height` (0 без размеров).
- doc8-65 — НЕ ПОДТВЕРЖДЕНО: все `<img>`/`<source>` со `srcset` в `index.html`, `press-kit.html`, `games/*.html` имеют `sizes` (0 без `sizes`).
- doc7a-17 — ИСПРАВЛЕНО частично: лабораторные данные появились — scan1–3 (8 ноября) и doc1.md (Firefox lab); полевых данных нет (см. «Не проверено»).
- Кандидат scan3 «DOM 974 элемента, max child 42 (`div.language-options`)» — НЕ ПОДТВЕРЖДЕНО как дефект: 1 019 открывающих тегов в `index.html` вместе с `<head>`; 42 дочерних — список локалей (41 язык + EN); Lighthouse: Low.
- Кандидат scan3 «GTmetrix тестировал `http://willowinworlds.com/`» — не дефект: редирект на HTTPS 2 ms, платформенное (GitHub Pages).
- Кандидат scan1/scan2 «изображения с неверным соотношением сторон (16) / low resolution» — учтён в C2-02 (первопричина — `object-fit: cover` над портретными источниками); отдельной правки не требует.

</details>


## Не проверено

<details>
<summary>A — Деплой, безопасность, сборка, CI</summary>

- scan10 SSL Labs grade B на 4 IP GitHub Pages: причина (протоколы/шифры) в выгрузке не показана; TLS на Pages управляется GitHub и со стороны репозитория не меняется. Мой curl согласует TLS 1.3 (`TLS_AES_128_GCM_SHA256`), старые протоколы не пробовались (это был бы сканер). Перепроверять на ssllabs.com вручную и только если владелец перейдёт на другой хостинг/CDN.
- Прогон `quality-check.mjs` и сборки на Node 22 (как в CI): только Node 26.13.0.
- Визуальный эффект сломанных `calc()` и `:is()` в браузере: оценено по тексту `dist` и спецификации CSS.
- GitHub Settings (environment approvals, MFA, default `GITHUB_TOKEN` permissions, private vulnerability reporting, статус Verified домена): нужна авторизация.
- Регистратор (MFA, auto-renew, backup зоны) — вне репозитория.

</details>

<details>
<summary>B — Доступность, HTML, 404</summary>

- Озвучка HUD, toast и canvas скринридерами (NVDA/VoiceOver/TalkBack): их нет в окружении — B-12, B-20 только по DOM и мутациям.
- Щипок-зум и жесты на 404 (`touch-action:none`) и перформанс `processSprite` на слабом телефоне: нужны реальные устройства (B-11, B-25).
- Контраст 404 (градиенты, светлая тема: `--muted` `#496579` на `--bg-2` `#8fcdea` = 3.53:1 — лежит ли текст на этом фоне, не проверял) и фокус полей формы в светлой теме (`site-sections.css:885-889`): нет axe/WebAIM.
- W3C Nu повторно: vnu не установлен, предупреждения проверены по коду и строкам scan4, не валидатором.
- doc4-30 (hover/цвет/анимация как единственный способ): гипотеза без файлов; клавиатурный проход главной (27 стопов, модалки, фильтр, FAQ) других проблем не показал, полного аудита нет.
- Влияние `Ctrl/Alt+клавиша` на браузерные сочетания при перехвате `keyDown` (B-10) — нужен браузер с ручной проверкой.
- Только Firefox 1573 headless на локальной копии; Chrome/Safari, 41 локаль (генерируются из тех же шаблонов) и качество содержания `alt` не проверялись.

</details>

<details>
<summary>C1 — JS, CSS, PWA, RSS</summary>

- Реальная доставка писем на `willowinworlds@gmail.com` и поведение почтовых клиентов при `mailto:` — отправка вне задания (см. AUD-11).
- W3C Feed Validator для `rss.xml` — внешний сервис, не запускался; проверена только well-formedness через `xmllint`.
- Воспроизведение C1-01 в Chrome/Safari — проверен только Firefox 159; по коду (цикл с нулевым шагом) поведение в других движках тождественно.
- Поведение на реальных iPhone/Android (залипающий hover, блокировка прокрутки, префикс `backdrop-filter`, вспышка темы, мелкий шрифт) — нужны устройства (C1-20…C1-23).
- Предложенные правки C1-02, C1-03, C1-08 не применялись и не тестировались (сайт не меняется).
- `quality-check.mjs`, `seo-check.mjs`, `link-check.mjs` не запускались (группа A, пишут в репозиторий или проверяют другое).

</details>

<details>
<summary>C2 — Производительность</summary>

- Реальные LCP/INP/CLS (CrUX, Search Console) — полевых данных нет; LCP-элемент главной и страниц игр в сканах не указан.
- Lighthouse на страницах игр, press-kit и 404 — по брифу не запускался; сканы покрывают только главную.
- iOS Safari: падение WebContent при `backdrop-filter`, версия Safari для безпрефиксного `backdrop-filter` (по caniuse) — нужен iPhone; ссылки на WebKit bugs (#271340, #279637, #277848) не открывал.
- Стоимость canvas/частиц/анимаций на слабом Android (INP, память, батарея, ложные срабатывания порога 28 fps) — нужно устройство.
- Длительность вспышки тёмной темы (C2-03) и фактический выбор кандидата `srcset` на DPR 3 (C2-07) — нужен браузер.
- Число композитных слоёв (doc8-62) — DevTools Layers.
- Выборочно проверено число CSS-файлов по 41 локали; полные diff локалей не делал.
- Различия моих счётчиков `mix-blend-mode` (32), `position: fixed` (27) и отчёта doc5-17 (20/18) не разбирал.

</details>


---

Проверка 13.11.2026: основная сессия плюс независимые проверки по областям. Ничего в `site/` не менялось. Инструменты сайта запускались только на копиях во временной папке.
