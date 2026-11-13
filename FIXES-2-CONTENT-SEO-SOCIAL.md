# Что исправить на сайте willowinworlds.com — часть 2: Nature Seed, соцсети, SEO, тексты

- **Область:** где играть в Nature Seed, ссылки на соцсети, SEO и структурированные данные, локализация, тексты и UX, юридические страницы, внешние профили студии.
- **Часть 1:** [FIXES-1-TECH.md](FIXES-1-TECH.md) — деплой, безопасность, доступность, JS/CSS, производительность. Там же описано, откуда список и как его проверяли.
- **Состояние на 13.11.2026:** ветка `35`, HEAD `b7a0fc8`; прод задеплоен из этого же кода.
- **Сайт не менялся.** Это только список работ.
- **Главная зависимость.** Внешние ссылки (площадки, соцсети, YouTube) сейчас валят проверку `security-check`. Поэтому начинать нужно с **A-08** из части 1.

## Как читать блок

- **Группа (префикс ID):**
  - **D1** — SEO, соцсети, юридическое;
  - **D2** — локализация, тексты, UX и продуктовые кнопки;
  - **S** — площадки и внешние профили (найдено при проверке 13.11).
- **Приоритеты и статусы** — как в части 1.
- Почти любая правка текста требует перегенерации 41 локали (`node site/tools/localize-site.mjs`) и затем `node site/tools/quality-check.mjs`.

## Сводка

| Группа | P0 | P1 | P2 | P3 | Всего |
|---|---:|---:|---:|---:|---:|
| D2 — Локализация, тексты, UX | 0 | 1 | 6 | 20 | 27 |
| S — Площадки и профили | 0 | 0 | 1 | 1 | 2 |
| D1 — SEO, соцсети, юридическое | 0 | 1 | 4 | 10 | 15 |
| **Итого** | **0** | **2** | **11** | **31** | **44** |

## Порядок работ

1. **A-08** из части 1 — разрешить внешние ссылки в `security-check`.
2. **D2-01.** Кнопка «Play free» у Nature Seed → itch.io, плюс Game Jolt и indiexpo.
3. **S-01.** Согласовать факты о Nature Seed между сайтом и площадками: платформа, дата, описание, формулировка про арт.
4. **D1-01.** Ссылки на соцсети по локалям, `sameAs`, `twitter:site` — раскладка ниже.
5. **D2-03.** Мёртвые адреса почты в fi, pl, tr, tt. Работы на минуты.
6. **D2-06.** Видимое имя бренда в шапке и подвале — «WillowinWorlds».
7. **D2-02 и D2-04.** Ошибки перевода: «Розыгрыш», «Polnisch», «Активы», склейки в татарской локали.
8. **D2-05.** Не закрывать окно контакта, пока посетитель может скопировать текст.
9. **D2-07.** Решение по промо-охоте.
10. **D1-03, D1-04, D1-06, D1-07:** картинки для соцсетей (OG), robots.txt и запрет AI-обучения, privacy/legal, Search Console.
11. **S-02.** Профили на площадках и в соцсетях должны ссылаться на сайт.
12. **P3** — по мере сил.

## Nature Seed: где играть (проверено 13.11.2026)

| Площадка | Ссылка | Что видно на странице |
|---|---|---|
| itch.io | https://willowinworlds.itch.io/nature-seed | Released, HTML5, Unity, Free, кнопка «Run game»; AI Disclosure: AI Assisted — Graphics; ссылки на сайт нет |
| Game Jolt | https://gamejolt.com/games/nature-seed/1100526 | v1.0.0 «about 2 months ago», Free, кнопка «Play»; 6 просмотров, 1 подписчик, постов нет; ссылки на сайт нет |
| indiexpo | https://www.indiexpo.net/en/games/nature-seed | Full Version, Mobile Friendly, WebGL, дата September 18, 2026, 24 игрока; ссылка «Website» на сайт есть |

Страниц в Google Play и App Store нет. На сайте ни одна из трёх площадок не упоминается. Что делать — в D2-01 и S-01.

## Соцсети: раскладка по локалям

Список аккаунтов дал владелец 13.11.2026. Сами страницы аккаунтов я не открывал, кроме Reddit.

### Наборы ссылок (в порядке показа)

| # | EN (по умолчанию) | RU | ES |
|---|---|---|---|
| 1 | YouTube https://www.youtube.com/@WillowinWorlds | Telegram https://t.me/WillowinWorlds | YouTube https://www.youtube.com/@WillowinWorlds_ES |
| 2 | TikTok https://www.tiktok.com/@willowinworlds | YouTube https://www.youtube.com/@WillowinWorlds_RU | TikTok https://www.tiktok.com/@willowinworlds_es |
| 3 | Instagram https://www.instagram.com/willowinworlds/ | TikTok https://www.tiktok.com/@willowinworlds_ru | Instagram https://www.instagram.com/willowinworlds_es_pr/ |
| 4 | Threads https://www.threads.com/@willowinworlds | Instagram https://www.instagram.com/willowinworlds_ru/ | Threads https://www.threads.com/@willowinworlds_es |
| 5 | Facebook (группа) https://www.facebook.com/groups/willowinworlds | Threads https://www.threads.com/@willowinworlds_ru | Facebook — группа из EN (своей нет) |
| 6 | X https://x.com/willowinworlds | X — общий | X — общий |
| 7 | Reddit https://www.reddit.com/user/WillowinWorlds/ | Reddit — общий | Reddit — общий |
| 8 | VK https://vk.ru/willowinworlds | VK — общий | VK — общий |

**Правила владельца:**
- X, Reddit и VK — один аккаунт на все локали.
- VK всегда последний.
- Если у региона нет своего аккаунта на платформе, показывается EN-аккаунт.

**Мои решения (можно поменять):**
- **Порядок.** Сначала видео (YouTube, TikTok), потом картинки (Instagram), потом текст и сообщества (Threads, Facebook), потом общие (X, Reddit), последним VK.
- **RU-набор.** Первым Telegram — основной канал новостей для русскоязычной аудитории.
- **Facebook в RU-наборе не показывается.** Facebook заблокирован в РФ с 2022 года, а англоязычная группа там мало полезна.

### Какой набор в какой локали

| Набор | Локали | Почему |
|---|---|---|
| RU | `ru`, `kk`, `uz`, `hy`, `tt` (5) | языки стран СНГ и России |
| ES | `es` (es-ES), `es-419`, `pt` (pt-BR), `pt-pt` (4) | испанский и близкий к нему португальский («ES+PR») |
| EN | корень `/` и `ar`, `bn`, `bg`, `zh-hans`, `zh-hant`, `cs`, `da`, `nl`, `fil`, `fi`, `fr`, `de`, `el`, `he`, `hi`, `hu`, `id`, `it`, `ja`, `ko`, `ms`, `no`, `fa`, `pl`, `ro`, `sw`, `sv`, `th`, `tr`, `uk`, `ur`, `vi` (33) | по умолчанию |

**Вопросы к владельцу:**
1. **`uk`.** По правилу «близкие языки» сюда подошёл бы RU-набор. Я рекомендую EN: Украина вышла из СНГ в 2018 году, VK там заблокирован с 2017 года, и русскоязычные каналы этой аудитории скорее навредят. По той же причине для `uk` можно скрыть VK.
2. **`bg`.** Болгарский близок к русскому, но Болгария не в СНГ, а в ЕС. Оставлен EN-набор.
3. **«PR» в «ES+PR».** Если это Пуэрто-Рико, а не португальский, то `pt` и `pt-pt` вернуть в EN-набор.

### Где и как показывать

- **Где:**
  - подвал главной и подвалы 4 страниц игр;
  - строка «Follow WillowinWorlds» в блоке `#contact` на главной;
  - в press kit — «Official channels»: хэндлы текстом (журналисту удобно копировать) плюс ссылки на три площадки Nature Seed.
- **У игр в разработке:** рядом с кнопками «Request updates» (это mailto, D2-10) можно поставить «Follow on YouTube / TikTok» из набора текущей локали.
- **Структурированные данные:** в `sameAs` у Organization — все профили всех трёх языков плюс профили студии на itch.io, Game Jolt и indiexpo. `sameAs` от языка страницы не зависит.
- **Мета-тег:** `twitter:site` = `@willowinworlds` на всех страницах.
- **Разметка:** обычные ссылки, без виджетов и встраиваний; иконки — локальные SVG с `aria-hidden="true"` и видимой подписью или `aria-label`.
- **Что останется как есть:** CSP менять не нужно; privacy-текст останется правдой, достаточно одной фразы о сторонних платформах (D1-01).

## Все пункты

| ID | P | Статус | Что не так |
|---|---|---|---|
| D2-01 | P1 | ПОДТВЕРЖДЕНО | Nature Seed «Released», но на сайте нет ссылки, где в неё играть (AUD-02) — а площадки есть |
| D1-01 | P1 | ПОДТВЕРЖДЕНО | На сайте нет ни одной ссылки на соцсети студии и нет `sameAs` в Organization |
| D2-02 | P2 | ПОДТВЕРЖДЕНО | Системные ошибки машинного перевода ключевых слов в приоритетных локалях (AUD-06 и дубли) |
| D2-03 | P2 | ПОДТВЕРЖДЕНО | Мёртвый контактный адрес остался в PL/TR/TT и ещё в FI (AUD-14, расширено) |
| D2-04 | P2 | ПОДТВЕРЖДЕНО | Татарская локаль: латиница приклеена к кириллице (55 вхождений) |
| D2-05 | P2 | ПОДТВЕРЖДЕНО | После отправки контактной формы окно закрывается, а подсказка «use Copy message» указывает на закрытое окно |
| D2-06 | P2 | ПОДТВЕРЖДЕНО | Видимый бренд в шапке и подвале остался «WillowinWorld» (AUD-07) |
| D2-07 | P2 | ПОДТВЕРЖДЕНО | Промо-«охота» обещает промокод без правил; claim ID нельзя проверить (AUD-18) |
| S-01 | P2 | ПОДТВЕРЖДЕНО | Факты о Nature Seed на сайте расходятся с площадками |
| D1-03 | P2 | ПОДТВЕРЖДЕНО | Social cards (OG/Twitter): перекрытие текста, старый бренд, одинаковая карточка у 210 страниц; WebP-only |
| D1-04 | P2 | ПОДТВЕРЖДЕНО | robots.txt не отражает запрет AI-обучения из legal/asset-usage |
| D1-06 | P2 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Privacy/Legal: не названы оператор и страна, нет даты, нет абзаца о детях, хостинга и срока хранения писем |
| D1-07 | P2 | ТРЕБУЕТ ДОСТУПА К SEARCH CONSOLE | Индексация не подтверждена: Search Console, покрытие, Paint Blasters в выдаче |
| D2-08 | P3 | ПОДТВЕРЖДЕНО | Динамические английские строки не попадают в словарь рантайма: сообщение фильтра пресс-кита и текст промо-окна |
| D2-09 | P3 | ПОДТВЕРЖДЕНО | Фильтр «In Development» в пресс-ките не включает Candy Shop |
| D2-10 | P3 | ПОДТВЕРЖДЕНО | Разные CTA у трёх игр в разработке; «Request updates» — это mailto, а не подписка |
| D2-11 | P3 | ПОДТВЕРЖДЕНО | Свежесть devlog: у трёх игр последняя запись 31 июля, у Nature Seed — 10 сентября (AUD-13) |
| D2-12 | P3 | ПОДТВЕРЖДЕНО | Контакт работает только через mailto (AUD-11, известное ограничение) |
| D2-13 | P3 | ПОДТВЕРЖДЕНО | Раздел «Development journey» повторяет «Devlog» на страницах игр |
| D2-14 | P3 | ПОДТВЕРЖДЕНО | Внутренние термины на публичных страницах игр |
| D2-15 | P3 | ПОДТВЕРЖДЕНО | Правила использования ассетов сформулированы по-разному в трёх местах |
| D2-16 | P3 | ПОДТВЕРЖДЕНО | Непереведённые английские остатки в локалях (память переводов хранит идентичные строки) |
| D2-17 | P3 | ПОДТВЕРЖДЕНО | Страница 404 только на английском |
| D2-18 | P3 | ЧАСТИЧНО | Ссылки mailto в локалях: пробелы закодированы как `+` вместо `%20` (новая находка) |
| D2-19 | P3 | ЧАСТИЧНО | Генератор переводов: неофициальный endpoint, повторы на постоянных ошибках, запись памяти без атомарности |
| D2-20 | P3 | ЧАСТИЧНО | Переключатель языков: 41 ссылка в одном `<details>` (UX-полировка) |
| D2-21 | P3 | ЧАСТИЧНО | В RTL-страницах названия игр на латинице без `lang="en"`/`dir="ltr"` |
| D2-22 | P3 | ТРЕБУЕТ БРАУЗЕРА | RTL: физические `text-align: left` и почти нет RTL-оверрайдов |
| D2-23 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Нет сведений о людях, стране и юрлице; «Careers / Collaboration» без вакансий |
| D2-24 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Пресс-кит: нет монетизации, рейтинга, команды, ссылок на магазины; нет ZIP, размеров, embed-кода |
| D2-25 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | На сайте нет видео или GIF геймплея и ссылки на трейлер |
| D2-26 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Нет отдельного канала поддержки и сообщений об ошибках для игроков |
| D2-27 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | 42 локали при отсутствии человеческой вычитки: разрастание стоимости сопровождения |
| S-02 | P3 | ПОДТВЕРЖДЕНО | Внешние профили не ведут на сайт (правки вне репозитория) |
| D1-08 | P3 | ПОДТВЕРЖДЕНО | Sitemap `lastmod` не отражает реальных правок (371 URL = 2026-09-10, 7 = 2026-07-31) |
| D1-09 | P3 | ПОДТВЕРЖДЕНО | Внутренние ссылки ведут на `…/index.html`, хотя canonical — `…/` |
| D1-10 | P3 | ПОДТВЕРЖДЕНО | `seo-check` пропустит страницу с `noindex, nofollow` |
| D1-11 | P3 | ПОДТВЕРЖДЕНО | H1 на страницах игр — слоган, название игры только в eyebrow и `<title>` |
| D1-12 | P3 | ЧАСТИЧНО | hreflang только в sitemap и переключателе (body), в `<head>` его нет |
| D1-13 | P3 | ЧАСТИЧНО | Дубли title/description между `es` и `es-419` |
| D1-14 | P3 | ЧАСТИЧНО | Черновик контактной формы в `sessionStorage`: уточнить формулировку privacy |
| D1-15 | P3 | ЧАСТИЧНО | Press-kit: политика ассетов без прямой ссылки на asset-usage и без запрета AI-обучения |
| D1-16 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Email студии открыт в HTML и JSON-LD на всех 378 страницах |
| D1-18 | P3 | РЕШЕНИЕ ВЛАДЕЛЬЦА | Стратегия индексации 42 локалей при автоматических переводах |


## P1 — блокеры

### D2-01 [P1] Nature Seed «Released», но на сайте нет ссылки, где в неё играть (AUD-02) — а площадки есть
- Статус: ПОДТВЕРЖДЕНО (код и прод). Площадки назвал владелец 13.11.2026; все три проверены 13.11 — игра бесплатна и запускается в браузере:
  - itch.io https://willowinworlds.itch.io/nature-seed — «Released», Platforms: HTML5, кнопка «Run game»;
  - Game Jolt https://gamejolt.com/games/nature-seed/1100526 — v1.0.0, «Free», кнопка «Play»;
  - indiexpo https://www.indiexpo.net/en/games/nature-seed — «Play», «Full Version», «Mobile Friendly».
- Где сейчас:
  - `site/games/nature-seed.html:183` — «Released 10 September 2026»;
  - `:185-186` — CTA «Download Assets» → `#download-assets` и «Release Notes»;
  - `:310` — «Platform target: iOS / Android»;
  - `:312` — «Primary CTA: Open release materials»;
  - JSON-LD `:60-84` (`gamePlatform: "Mobile"`, `datePublished: "2026-09-10"`);
  - карточка на главной `site/index.html:338-376`;
  - press kit `site/press-kit.html:156,189`;
  - `site/llms.txt:5` («no public price, store availability… is claimed»).
  - На всём сайте 0 упоминаний itch.io, Game Jolt и indiexpo.
- Проблема: игрок читает «Released», но перейти к игре не может — главная кнопка ведёт к медиафайлам. Это главный разрыв воронки, хотя игра доступна бесплатно в один клик.
- Как исправить:
  1. A-08 (часть 1): разрешить хосты `willowinworlds.itch.io`, `gamejolt.com`, `www.indiexpo.net` — иначе проверки упадут.
  2. `games/nature-seed.html:185`: основной CTA «Play free in your browser» → itch.io (самая известная инди-площадка, игра запускается прямо на странице). Рядом вторичные кнопки «Game Jolt» и «indiexpo». «Download Assets» сделать вторичной и переименовать в «Press assets».
  3. Карточка на главной: рядом с «Explore Nature Seed» кнопка «Play free».
  4. `press-kit.html:156,189`: строка «Where to play: itch.io · Game Jolt · indiexpo (free, web)». Поле «Target platforms» привести к реальной платформе (см. S-01).
  5. `llms.txt:5`: убрать «no public price, store availability… claimed», добавить «Free web build on itch.io, Game Jolt and indiexpo» со ссылками.
  6. JSON-LD `VideoGame` (`games/nature-seed.html:60-84`):
     - `gamePlatform` — реальная платформа (см. S-01);
     - `sameAs` — три URL площадок;
     - `offers` — `{ "@type": "Offer", "price": "0", "priceCurrency": "USD", "url": "<itch-URL>" }`.
     - `SoftwareApplication` не добавлять: его запрещает `seo-check.mjs:184`. Этот пункт поглощает D1-17.
  7. Перевести подписи новых кнопок в `site/tools/locales/*.json`, затем `node site/tools/localize-site.mjs` и `quality-check`.
- Критерий готовности: `rg -n 'href="https://willowinworlds.itch.io/nature-seed"' site/games/nature-seed.html site/ru/games/nature-seed.html site/index.html` находит ссылки; `node site/tools/quality-check.mjs` проходит; на проде кнопка «Play» на странице игры ведёт на itch.io.
- Источники: AUD-02, doc3-23, doc9-15, doc4-01, doc5-01, doc6-09, doc7b-16, doc8-44, doc10-05, doc11-03; D1-17, D2-24 (часть про магазины), D2-25 (часть про внешние ссылки).

### D1-01 [P1] На сайте нет ни одной ссылки на соцсети студии и нет `sameAs` в Organization
- Статус: ПОДТВЕРЖДЕНО 13.11. Во всех HTML 0 ссылок на соцсети; в Organization (`site/index.html:59-75`) нет `sameAs`; нет `twitter:site`. Список аккаунтов дал владелец 13.11.2026 — раздел «Соцсети: раскладка по локалям» ниже.
- Где сейчас:
  - подвал главной `site/index.html:769-800`;
  - блок `#contact` `site/index.html:756-764`;
  - подвалы игр `site/games/*.html` (`<footer class="game-footer">`, например `nature-seed.html:427-441`);
  - строка Contact в press kit `site/press-kit.html:126`.
  - У `press-kit.html`, `legal.html`, `privacy.html` и `asset-usage.html` подвала нет.
- Проблема: в PRODUCT.md сайт назван «canonical discovery surface» студии, но с него нельзя перейти ни в один из 17 каналов и ни на одну из 3 площадок с игрой. Поисковики и пресса не получают подтверждения, что эти аккаунты принадлежат студии.
  - Технический блокер: `security-check.mjs:152-159` падает на любой внешней ссылке. Поэтому сначала нужно сделать A-08 (часть 1).
  - Проверка D1 утверждала, что «реальные ссылки проверка не трогает». Это неверно: строка 142 запрещает только тексты-заглушки, а строки 152-159 запрещают любые внешние `https`. Проверено на копии.
- Как исправить:
  1. A-08 — список разрешённых хостов.
  2. Наборы ссылок EN/RU/ES и карту «локаль → набор» хранить одной структурой в `site/tools/localization-config.mjs`. EN-шаблоны содержат EN-набор, `localize-site.mjs` подставляет RU- или ES-набор в свои локали. Таблица — в разделе ниже.
  3. Где показывать:
     - подвал главной и подвалы 4 страниц игр;
     - строка «Follow WillowinWorlds» в `#contact`;
     - в press kit — список «Official channels», где хэндлы написаны текстом, чтобы журналист мог их скопировать.
     - Для legal/privacy/asset-usage — по желанию.
  4. Разметка:
     - обычные `<a href>`: никаких виджетов, встраиваний и картинок со сторонних серверов;
     - иконки — локальные inline SVG с `aria-hidden="true"`, иначе WAVE снова даст ошибки (см. B-17);
     - у каждой ссылки видимый текст или `aria-label` вида «WillowinWorlds on YouTube»;
     - цель касания не меньше 44 px;
     - `target="_blank"` не обязателен; если он нужен — только с `rel="noopener noreferrer"`.
  5. JSON-LD Organization (`index.html:59-75`): `sameAs` со всеми профилями всех трёх языков, плюс Reddit, VK, Telegram, группа Facebook, X и профили студии на площадках (`https://willowinworlds.itch.io/`, `https://gamejolt.com/@WillowinWorlds`, `https://www.indiexpo.net/en/users/WillowinWorlds`). `sameAs` не зависит от языка страницы.
  6. На все страницы добавить `<meta name="twitter:site" content="@willowinworlds">` через генератор.
  7. В `privacy.html` одна фраза: ссылки ведут на сторонние платформы со своими политиками, сайт не загружает виджеты соцсетей.
  8. `node site/tools/localize-site.mjs`, затем `node site/tools/quality-check.mjs`.
- Критерий готовности:
  - `rg -c 'vk.ru/willowinworlds' site/index.html site/ru/index.html site/ja/index.html` даёт ≥1 в каждом (VK показывается всем);
  - `rg -c 't.me/WillowinWorlds' site/ru/index.html` ≥1, а в `site/index.html` — 0;
  - `rg -c '"sameAs"' site/index.html` = 1;
  - `quality-check` проходит;
  - Rich Results Test главной — без ошибок.
- Источники: doc5-55, doc7b-28, doc3-15, doc8-86, scan9; D2-25 (часть про соцсети). Приоритет поднят с P2: сайт — единственная точка входа студии, а выхода из него в каналы нет.


## P2 — ближайший цикл

### D2-02 [P2] Системные ошибки машинного перевода ключевых слов в приоритетных локалях (AUD-06 и дубли)
- Статус: ПОДТВЕРЖДЕНО (расширено: причина найдена, масштаб посчитан).
- Где сейчас (по одному `файл:строка` на пример; источник слова одноклеточный, без контекста, уходит в Google `translate_a/single`):
  1. «Draw» (название механики Nature Seed, `site/games/nature-seed.html:189`) переведено как розыгрыш/лотерея: `ru/games/nature-seed.html:189` «Розыгрыш», `es/...:189` и `es-419/...:189` «Sorteo», `pt/...` и `pt-pt/...` «Sorteio», `fr/...` «Tirage au sort», `tr/...` «Çekiliş». Всего 22 из 41 локалей (bg, el, es, es-419, fa, fr, hu «Döntetlen», hy, kk, ko, ms, no, pl, pt, pt-pt, ro «Remiză», ru, tr, uk, uz, zh-hans, zh-hant); `zh-hans/games/nature-seed.html:7` в description: «通过抽奖来解决» (решается лотереей). Ключ: `site/tools/locales/ru.json:555`. Не как лотерея слово переведено в 19 локалях: ar, bn, cs, da, de, fi, fil, he, hi, id, it, ja, nl, sv, sw, th, tt, ur, vi.
  2. «Polish» (название этапа, `site/index.html:666`) переведено как национальность/язык: `de/index.html:666` «Polnisch», `fr/index.html:666` «Polonais», `tr/index.html:666` «Lehçe». Правильно только в es, fil, ja, pt, ru (36 из 41 неверны).
  3. «Assets» (пресс-кит, `site/press-kit.html:62,114`) переведено как финансовые активы: `ru/press-kit.html:62,114` «Активы», es «Activos», pt «Ativos», fr «Actifs», de «Vermögenswerte» (`de/press-kit.html:62,114`), ja «資産», tr «Varlıklar» (`site/tools/locales/<lang>.json:181`). FAQ «Can public assets be used?» (`games/nature-seed.html:408`): ru «государственные активы», de «öffentliche Vermögenswerte», fr «biens publics», es «bienes públicos», tr «Kamu varlıkları» (то же в `ru/games/{paint-blasters:378,candy-shop:386,ball-is-god:596}.html`).
  4. `site/index.html:615` «Mascots with idle life…»: `ru/index.html:615` «Талисманы с праздной жизнью», `de/index.html:615` «mit müßigem Leben», es «vida ociosa», fr «vie oisive»; `index.html:662` «shortest playable proof with real input, feedback…»: `ru/index.html:662` «кратчайшее игровое доказательство… отзывами», es «aportes, comentarios»; `games/nature-seed.html:232` «stroke»: `ru/...:232` «совершенный удар», `es/...:232` и `es-419/index.html:367` «golpe cometido».
  5. `nl/games/ball-is-god.html:7` в description «laad combo-shits» (вместо «combo smashes»), попадает в сниппет поиска; `ru/press-kit.html:183` «Текущее отведение» (Current spotlight), `:198` «Уиллоу W» (знак бренда «Willow W» транслитерирован), `:112,133` «Информационный бюллетень» вместо «Справка/Factsheet» (слово «Пресс-кит» переведено верно: `ru/press-kit.html:26,57`); «Production prototype»: `ru/press-kit.html:158,357` «Серийный прототип» против `ru/games/paint-blasters.html:210` «Производственный прототип»; `fr/index.html:243,761,1079` «Contacter l'atelier» (Contact studio).
  Названия игр и бренда в тексте не переводятся (проверено по ru, ja, ar: ни транслита `Нейчер/ネイチャー…`, ни перевода); исключение только «Уиллоу W».
- Проблема: на лицевых строках для издателей и игроков (название механики выпущенной игры, этап производства, навигация пресс-кита, FAQ) смысл искажён; русская и другие версии выглядят ненадёжно. Нативная вычитка всех 41 локали не делалась; не делаю вывод, что неверны все.
- Как исправить: минимально исправить значения в `site/tools/locales/{ru,es,es-419,pt,pt-pt,de,fr,ja,tr}.json` для ключей «Draw», «Polish», «Assets», «Can public assets be used?», «Mascots with idle life, reactions and emotional clarity.», «Build the shortest playable proof…», «Current spotlight», «Factsheet», «Willow W, portal mood and tactile motion.», «Production prototype», ключа description с `combo smashes` (nl), затем `node site/tools/localize-site.mjs`. Если когда-нибудь запускается `--refresh=<lang>` (`localize-site.mjs:1279`), то правки нужно дублировать в `manualTranslationOverrides` (`localize-site.mjs:130`), иначе они обнулятся. Более надёжно (опционально, нужна сеть): переписать неоднозначные английские источники («Polish» → «Final polish pass», «Draw» → «Draw a line», «Assets» → «Press files», «stroke» → «line») и перегенерировать. Глоссарий — файл из 15-20 строк, на который ссылается ревью.
- Критерий готовности: `cd site && rg -n "<h3>(Polnisch|Polonais|Lehçe)</h3>" de/index.html fr/index.html tr/index.html; rg -n "Розыгрыш|государственные активы|combo-shits" ru nl --glob '*.html'` — пусто.
- Источники: AUD-06, doc4-11, doc5-22, doc9-10, doc10-19, doc11-12 (ru-часть), doc8-14 (часть: качество не проверено, но выборка показала системные ошибки).

### D2-03 [P2] Мёртвый контактный адрес остался в PL/TR/TT и ещё в FI (AUD-14, расширено)
- Статус: ПОДТВЕРЖДЕНО (код и прод; расширено ещё одной локалью).
- Где сейчас: `site/tools/locales/{pl,tr,tt,fi}.json:464` (ключ «Copy was blocked. Use willowinworlds@gmail.com.») и `tt.json:1599`; `site/tt/index.html:746` (FAQ), `site/{pl,tr,tt,fi}/i18n-runtime.js`. Новое относительно doc1: `site/tools/locales/fi.json:464` даёт `contact@wilowinworld.com` (опечатка и в домене), прод `https://willowinworlds.com/fi/i18n-runtime.js` содержит эту строку. Из 123 переводов предложений с адресом неверны ровно 5 (fi, pl, tr, tt ×2).
- Проблема: Google «перевёл» сам адрес `willowinworlds@gmail.com`; в `protectedExactText` (`localize-site.mjs:65`) его нет, поэтому ошибка повторится при любой регенерации. Мёртвый адрес показан в fallback при блокировке копирования (pl, tr, tt, fi) и постоянно в татарском FAQ. Приоритет понижен до P2 относительно doc1 (четыре вторичные локали; в трёх адрес виден только при сбое копирования), но правка занимает минуты.
- Как исправить: заменить значения в пяти записях на `willowinworlds@gmail.com`; добавить `"willowinworlds@gmail.com"` в `protectedExactText` (`localize-site.mjs`, рядом с `"WillowinWorlds"`); `node site/tools/localize-site.mjs`; добавить проверку в `site/tools/quality-check.mjs`/`seo-check.mjs` на `@willowinworlds\.com|wilowinworld` в публичных файлах. В копии замена + регенерация убирает все неверные адреса.
- Критерий готовности: `rg -n "@willowinworlds\.com|wilowinworld" site --glob '!dist/**' --glob '!reports/**'` — пусто (сейчас 10 строк в 9 файлах).
- Источники: AUD-14, наблюдение fi (новое), doc8-69 (старый домен: см. «Отклонено»).

### D2-04 [P2] Татарская локаль: латиница приклеена к кириллице (55 вхождений)
- Статус: ПОДТВЕРЖДЕНО.
- Где сейчас: `site/tt/index.html:325` «Eachәрбер уен», `:466` «Sevenиде блок архетипына», `:785` «ostгалтылган йолдызлар», `:959` «Legalридик детальләрне ябу», `:980` «Legalридик контакт», `:1038` «onsаваплы ачу»; `site/tt/games/nature-seed.html:269` «Eachәрбер»; всего 55 совпадений по `tt/*.html` (index 14, press-kit 4, legal 2, privacy 2, игры 37) и 56 записей в `site/tools/locales/tt.json`. В ru, uk, bg таких склеек 0, в kk 1. Прод — тот же HEAD.
- Проблема: на странице видны «слова» вроде «onsаваплы» вместо осмысленного татарского; это ломает и доверие, и проверку `containsUnexpectedEnglishRun` (`localize-site.mjs:784`), которая склейки без пробелов не видит. Часть вхождений (`Seedны`, `WillowinWorldsга`) — допустимые «бренд + суффикс».
- Как исправить: вручную поправить 56 значений в `site/tools/locales/tt.json` (или временно убрать `tt` из переключателя и sitemap до вычитки — тяжелее, нужна правка `localization-config.mjs` и hreflang всех страниц); `node site/tools/localize-site.mjs`.
- Критерий готовности: `rg -o --no-filename "\b[A-Za-z]{2,}[Ѐ-ӿ]+" site/tt --glob '*.html' | rg -v "^(Seed|WillowinWorlds|Shop|God|Blasters|GDD)" | wc -l` = 0 (сейчас 39; «бренд+суффикс» исключён).
- Источники: doc4-11 (часть про татарский), частично doc5-22.

### D2-05 [P2] После отправки контактной формы окно закрывается, а подсказка «use Copy message» указывает на закрытое окно
- Статус: ПОДТВЕРЖДЕНО (по коду).
- Где сейчас: `site/scripts.js:2110-2118`: после `window.location.href = draft.href` идёт `showToast("Email draft requested. If it did not open, use Copy message.")` и сразу `closeContactModal()`; кнопка «Copy message» лежит внутри закрывшегося окна (`site/index.html:844`); тост живёт 2600 мс (`scripts.js:288-290`). Черновик сохраняется в `sessionStorage` (`scripts.js:336`), поэтому пользователь может заново открыть «Contact», но подсказка этого не говорит. Поля Name и Email обязательны (`index.html:821,825`).
- Проблема: на десктопе без почтового клиента ничего не происходит, подсказка исчезает через 2,6 с, а кнопка недоступна; это основной путь для издателей и прессы (см. D2-12).
- Как исправить: не вызывать `closeContactModal()` в обработчике submit (`scripts.js:2117`) и вместо тоста писать в `contactDraftStatus` (`setContactDraftStatus`, строка 309) «Email app requested. If nothing opened, press Copy message or write to willowinworlds@gmail.com»; новую строку добавить в `explicitRuntimeStrings` (`localize-site.mjs:439`) и перегенерировать. Минимальный вариант: оставить закрытие, но заменить текст тоста на «…reopen Contact and press Copy message».
- Критерий готовности: в браузере без обработчика mailto после «Send» видна подсказка с копированием, пока окно открыто; статически: `sed -n 2110,2118p site/scripts.js` не содержит `closeContactModal()`.
- Источники: doc9-06, doc5-08 (часть про закрытие окна), doc7a-05 (fallback); см. D2-12 (mailto-only).

### D2-06 [P2] Видимый бренд в шапке и подвале остался «WillowinWorld» (AUD-07)
- Статус: ПОДТВЕРЖДЕНО (по doc1; дублей в сырых находках нет).
- Где сейчас: `site/index.html:230` и `:776` (`<span class="brand-w brand-w-world">W</span>orld</span>`); 42 файла (`index.html` + 41 локаль) содержат эту разметку без `s`.
- Проблема: название студии везде «WillowinWorlds», а видимая вордмарка пишет единственное число.
- Как исправить: добавить `s` в вордмарку в `site/index.html:230,776`, `node site/tools/localize-site.mjs`, добавить запрет на старое видимое имя в проверку.
- Критерий готовности: `rg -l 'brand-w-world">W</span>orld</span>' site --glob '*.html' --glob '!dist/**' | wc -l` = 0 (сейчас 42).
- Источники: AUD-07.

### D2-07 [P2] Промо-«охота» обещает промокод без правил; claim ID нельзя проверить (AUD-18)
- Статус: ПОДТВЕРЖДЕНО; что делать — РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас:
  - `site/index.html:786` — кнопка «Magic hunt» в подвале;
  - `:1098` — «Request Promo Code» (mailto);
  - `site/scripts.js:193-225` — «Promo codes are issued manually by WillowinWorlds after a claim review»;
  - `:1641-1656` — claim ID собирается из времени и `Math.random()`.
  - В `privacy.html`, `legal.html`, `asset-usage.html` и `press-kit.html` слов promo и claim нет.
- Проблема:
  - промокод обещан без условий: на что он (игра бесплатна, см. D2-01), кто получит, сколько, до какого срока, вправе ли студия отказать;
  - письмо-заявка содержит email — это персональные данные, о которых privacy молчит;
  - claim ID может сгенерировать кто угодно.
  - Технический дефект невидимых кнопок охоты — B-04 (часть 1).
- Как исправить, на выбор:
  - (а) опубликовать краткие правила: абзац в окне секрета, раздел в `legal.html`, строка про письма-заявки в `privacy.html`;
  - (б) оставить пасхалку без обещания кода: убрать «Promo codes are issued…» из четырёх `message` (`scripts.js:197,203,209,215`), а «Request Promo Code» в `index.html:1098` заменить на «Send a note».
  - После любого варианта — `node site/tools/localize-site.mjs`.
- Критерий готовности: `rg -n "Promo codes are issued" site/scripts.js site/index.html` пусто, либо `rg -i promo site/legal.html site/privacy.html` даёт ≥1.
- Источники: AUD-18, D1-05, doc5-32.

### S-01 [P2] Факты о Nature Seed на сайте расходятся с площадками
- Статус: ПОДТВЕРЖДЕНО 13.11 (сайт и три страницы площадок); какой вариант канонический — РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас:
  - Платформа. Сайт: «Platform target: iOS / Android» (`games/nature-seed.html:310`), «Target platforms: iOS and Android» (`press-kit.html:189`), `gamePlatform: "Mobile"` (`games/nature-seed.html:72`). Площадки: браузерная Unity WebGL/HTML5-версия (itch.io «Platforms: HTML5», «Touch-Friendly»; indiexpo «available as a WebGL browser game», «Mobile Friendly»). Страниц в Google Play или App Store нет.
  - Дата. Сайт: «Released 10 September 2026» (`games/nature-seed.html:7,12,23,74,183`, `press-kit.html:156,257,260`, `llms.txt:9,16`). indiexpo: «September 18, 2026». Game Jolt: v1.0.0 «about 2 months ago».
  - Описание. Сайт: Water Drop и Seed, линия с ограниченными чернилами, 10 уровней, звёзды, восстановление акварельного леса. itch.io и Game Jolt: «obstacles, moving hazards, wind, portals… unlock customization options». indiexpo: «draw paths, platforms, ramps, barriers».
  - Цена. `llms.txt:5` пишет, что цена и доступность в магазинах не заявлены. На деле игра бесплатна на трёх площадках.
  - Графика. На itch.io указано «AI Disclosure: AI Assisted — Graphics». На сайте: alt «Nature Seed hand-drawn physics level background» (`games/nature-seed.html:327`), «watercolor» в текстах; в PRODUCT.md бренд описан как «handcrafted».
- Проблема: пресса и игроки, сравнивая сайт и страницу игры, видят разные платформу, дату и механику. Формулировка «hand-drawn» рядом с раскрытием AI-графики на itch.io подрывает доверие.
- Как исправить: владелец выбирает одну каноническую версию — платформа, дата первого публичного релиза, 3-4 ключевые механики, формулировка про арт. Затем синхронизировать:
  - сайт: EN-шаблоны, затем `localize-site.mjs`;
  - `llms.txt`;
  - JSON-LD: `gamePlatform`, `datePublished`;
  - страницы на itch.io, Game Jolt и indiexpo.
  - Про арт: убрать «hand-drawn» из alt или написать честно (например, «painted-style level background»). В press kit добавить строку про использование AI-инструментов, совпадающую с раскрытием на itch.io.
  - Если iOS и Android только в планах — писать «Web (desktop & mobile browser); iOS/Android planned».
- Критерий готовности: на сайте и на трёх площадках одинаковые платформа, дата и ключевые механики; `rg -n "iOS / Android|iOS and Android" site/games/nature-seed.html site/press-kit.html` пусто или помечено «planned».
- Источники: проверка площадок основной сессией 13.11; связано с D2-01, D1-03 (OG-карточки).

### D1-03 [P2] Social cards (OG/Twitter): перекрытие текста, старый бренд, одинаковая карточка у 210 страниц; WebP-only
- Статус: ПОДТВЕРЖДЕНО (визуальная часть — по AUD-25; охват и теги — проверены мной); поддержка WebP конкретными площадками — ТРЕБУЕТ УСТРОЙСТВА
- Где сейчас: `site/assets/og/*-1200x630.webp` (5 файлов); `og:image`/`twitter:image` во всех 378 страницах (подсчёт: generic `willowinworld-og-1200x630.webp` — 210 страниц = home, press-kit, privacy, legal, asset-usage × 42; каждая из 4 game-карточек — 42 страницы). `og:image:width/height/alt` есть, `og:image:type` нет. Прод: `/assets/og/willowinworld-og-1200x630.webp` → 200, `image/webp`, 41 960 B.
- Проблема: при шаринге превью обрезает слоган (artwork перекрывает subtitle, во всех 5 картинках), подпись остаётся «WillowinWorld» без `s`, текст встроен на английском для всех 42 локалей; press-kit/legal/privacy показывают то же превью, что и главная. Что часть площадок не показывает WebP, отчёты утверждают без источников — статически не проверить.
- Как исправить: одним заходом перерисовать 5 карточек (без встроенного текста либо весь текст в safe area, бренд «WillowinWorlds») и сразу экспортировать JPEG 1200×630 (при смене формата обновить путь в генераторе/шаблонах и добавить `og:image:type`); отдельную карточку для press-kit — по желанию. Проверить превью EN/RU/JA в Telegram, Facebook Sharing Debugger, LinkedIn Post Inspector, X.
- Критерий готовности: `curl -sI <og:image URL>` → 200 и ожидаемый `content-type`; визуальный просмотр 5 файлов без перекрытия; превью в целевых площадках.
- Источники: AUD-25, doc8-07, doc5-48, doc8-85, doc8-87.

### D1-04 [P2] robots.txt не отражает запрет AI-обучения из legal/asset-usage
- Статус: ПОДТВЕРЖДЕНО (прод `robots.txt` идентичен репозиторному); объём запрета — РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: `site/legal.html:51` и `site/asset-usage.html:52` (запрет использовать ассеты для обучения AI/ML), `site/index.html:967` (то же в окне Legal); `site/robots.txt:1-37` (группы только для OAI-SearchBot, PerplexityBot, Claude-SearchBot, ChatGPT-User, Perplexity-User, Claude-User), `site/robots.txt:39-43` (`User-agent: *` → `Allow: /`).
- Проблема: добросовестные краулеры обучения (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, Meta-ExternalAgent, Bytespider) не получают машиночитаемого сигнала, совпадающего с юридическим текстом. `robots.txt` не лицензия и не остановит недобросовестных, но это стандартный сигнал.
- Как исправить: добавить в `site/robots.txt` одну группу с этими `User-agent` и `Disallow: /assets/` (запрет в legal относится к ассетам; картинки лежат только в `/assets/`); если владелец хочет закрыть и тексты — `Disallow: /`. Группы search/retrieval не трогать. `seo-check.mjs:264-293` проверяет только именованные search-группы и `*`, добавление новых групп его не ломает.
- Критерий готовности: `curl -s https://willowinworlds.com/robots.txt | rg -A1 "GPTBot|ClaudeBot|Google-Extended"` показывает `Disallow`; `node site/tools/seo-check.mjs` проходит.
- Источники: AUD-23, doc5-26.

### D1-06 [P2] Privacy/Legal: не названы оператор и страна, нет даты, нет абзаца о детях, хостинга и срока хранения писем
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА (пробелы текста ПОДТВЕРЖДЕНЫ)
- Где сейчас: `site/privacy.html:46-58` (нет оператора, даты обновления, абзаца про детей, срока хранения писем, маршрута запросов на удаление/доступ, упоминания хостинга — прод отдаётся `server: GitHub.com`); `site/legal.html:46-58` (владелец — «WillowinWorlds», без имени, юрлица, страны). Единственный маршрут — mailto «Privacy contact» (`privacy.html:57`).
- Проблема: страница честно описывает код, но не отвечает «кто обрабатывает мой email и как долго» — это снижает доверие издателей/прессы и обычно требуется магазинам и регуляторам (GDPR/COPPA и т. п.); отчёты называют это гипотезой, юридического заключения здесь нет. Политика мобильных приложений для сторов в `site/` отсутствует (нужна, когда появятся страницы в магазинах).
- Как исправить: владелец решает, что публиковать (имя/юрлицо/страна или осознанная анонимность, срок хранения писем, формулировка про детей); затем 3-4 коротких пункта в `site/privacy.html` и строка владельца в `site/legal.html`, дата «Last updated: …»; перегенерировать 41 локаль (`node site/tools/localize-site.mjs`).
- Критерий готовности: `rg -n "Last updated" site/privacy.html` и `rg -n -i "children" site/privacy.html` находят текст; `node site/tools/seo-check.mjs` проходит.
- Источники: doc5-25, doc11-19, doc11-20.

### D1-07 [P2] Индексация не подтверждена: Search Console, покрытие, Paint Blasters в выдаче
- Статус: ТРЕБУЕТ ДОСТУПА К SEARCH CONSOLE.
- Где сейчас: подтверждение Google для домена есть в DNS (TXT `google-site-verification=…` на apex, 13.11); Yandex подтверждён файлом `site/yandex_d08a3b38c62144a2.html` (на проде 200). Sitemap объявлен в `robots.txt:45`, на проде `sitemap.xml` отдаёт 200, в нём 378 URL.
- Проблема: без отчётов не видно, сколько из 378 URL проиндексировано, есть ли ошибки hreflang и почему `/games/paint-blasters.html` не нашёлся в выдаче (doc7b-29, сам отчёт называет проверку неполной). Все 378 битых ссылок из scan8 — старый домен до миграции 10.11, поэтому нужно один раз убедиться, что Google переиндексировал новый домен.
- Как исправить: кода не нужно. В Search Console, свойство-домен `willowinworlds.com`:
  - отправить `https://willowinworlds.com/sitemap.xml`;
  - сделать URL Inspection для `/games/paint-blasters.html`, `/ru/`, `/fil/`, `/es-419/`;
  - посмотреть отчёт «Страницы» и международный таргетинг.
  - Затем повторить deadlinkchecker по новому домену.
- Критерий готовности: sitemap в статусе «Success», число проиндексированных страниц сопоставлено с 378; deadlinkchecker без DNS-ошибок.
- Источники: doc3-03, doc8-10, doc7b-29, scan8.


## P3 — полировка и техдолг (31)

<details>
<summary>Развернуть 31 пунктов P3</summary>

### D2-08 [P3] Динамические английские строки не попадают в словарь рантайма: сообщение фильтра пресс-кита и текст промо-окна
- Статус: ПОДТВЕРЖДЕНО (регулярка выполнена в node; промо-текст по коду, в браузере не запускался).
- Где сейчас: `site/game-theme.js:126` формирует «Showing 2 Arcade game worlds.», а регулярка рантайма `^Showing\s+(\d+)\s+(.+?)\s+games?\.?$` (генерируется в `localize-site.mjs:1197`, лежит во всех 41 `i18n-runtime.js`) такую строку не распознаёт (проверено: false); строка `scripts.js:1957` («Showing 2 arcade games.») распознаётся (true). Фильтры пресс-кита: `site/press-kit.html:219-229` (прод `game-theme.js:126` идентичен). Второй случай: `scripts.js:1662` ставит `textContent = "${secret.message} Claim phrase: ${secret.phrase}. Claim ID: ${claimId}."`; в словаре есть только `secret.message` и «… promo word found», а склеенной строки и слов «Claim phrase»/«Claim ID» нет (проверено на ru), значит текст промо-окна остаётся английским во всех локалях. Кроме того `filterTranslations` покрывает только Arcade, Puzzle, Physics, Cozy; Mobile, Magic, In Development подставятся по-английски внутри локализованного шаблона.
- Проблема: aria-live сообщение при выборе фильтра на 41 локали остаётся английским; окно награды наполовину английское.
- Как исправить: `site/game-theme.js:126` заменить на формат `scripts.js` (`Showing ${visibleCount} ${filter.toLowerCase()} game${visibleCount === 1 ? "." : "s."}`); для промо-окна разделить строку на три фрагмента, каждый из которых — ключ словаря («Claim phrase», «Claim ID» добавить в `explicitRuntimeStrings`, `localize-site.mjs:439`); перегенерировать.
- Критерий готовности: `node -e 'console.log(/^Showing\s+(\d+)\s+(.+?)\s+games?\.?$/i.test("Showing 2 arcade games."))'` — true для реального вывода `game-theme.js`; в браузере на `ru/press-kit.html` клик по «Arcade» даёт русскую строку.
- Источники: doc9-11, doc4-16, doc11-29.

### D2-09 [P3] Фильтр «In Development» в пресс-ките не включает Candy Shop
- Статус: ПОДТВЕРЖДЕНО (найдено при проверке doc5-57).
- Где сейчас: кнопка `site/press-kit.html:227`; карточка Candy Shop `site/press-kit.html:272` (`data-tags="… Concept Prototype"`, без «In Development»), хотя её статус `:301` «Active Development»; у Paint Blasters и Ball is God тег есть. Тот же набор тегов в `site/index.html:378` (там такой кнопки нет). Сопоставление по подстроке (`game-theme.js`, `tags.includes(filter)`) само по себе не ломается: ложных совпадений в текущих тегах нет.
- Проблема: фильтр показывает 2 игры в разработке из 3.
- Как исправить: добавить `In Development` в `data-tags` Candy Shop в `site/press-kit.html:272` и `site/index.html:378`, `node site/tools/localize-site.mjs`.
- Критерий готовности: `rg -o 'data-tags="[^"]*"' site/press-kit.html | rg -c "In Development"` = 3 (сейчас 2).
- Источники: doc5-57 (часть про хрупкость тегов; «фильтры бесполезны» — продуктовое мнение, не проверялось).

### D2-10 [P3] Разные CTA у трёх игр в разработке; «Request updates» — это mailto, а не подписка
- Статус: ПОДТВЕРЖДЕНО.
- Где сейчас: `site/games/candy-shop.html:148` «Request Candy Shop updates», `paint-blasters.html:154` «Request Paint Blasters updates», `ball-is-god.html:151` «Request Development Build»; карточки `site/index.html:417,473,540` и `site/press-kit.html:311,367,434` — «Request updates» (`mailto:…?subject=Follow%20… Development`, `aria-label` «Request … development updates»); у Candy Shop факт «Primary CTA: Request development updates» (`candy-shop.html:288`).
- Проблема: три разных формулировки у одной ситуации; «Request» не объясняет, что откроется почтовое приложение; «Request Development Build» обещает доступ к сборке.
- Как исправить: единый шаблон «Email for <Game> updates» на трёх страницах (`candy-shop.html:148`, `paint-blasters.html:154`, `ball-is-god.html:151`) и подпись «opens your email app» рядом, как `index.html:841`; вишлист/уведомления — только после появления страницы в магазине (см. D2-01), backend не нужен.
- Критерий готовности: `rg -n 'btn-primary" href="mailto' site/games/*.html | cut -c1-160` показывает три кнопки одного шаблона.
- Источники: doc3-19, doc10-36, doc6-09 (часть про «Request update»), doc10-11 (единая структура верхнего блока игр — не проверял как требование), doc5-01 (часть про конкурирующие CTA и FAQ — продуктовое мнение).

### D2-11 [P3] Свежесть devlog: у трёх игр последняя запись 31 июля, у Nature Seed — 10 сентября (AUD-13)
- Статус: ПОДТВЕРЖДЕНО (наблюдение, не техническая ошибка).
- Где сейчас: `site/index.html:686` (10 September 2026), `:692,698,704` (31 July 2026) и `data-published` в `site/games/*.html`; на 2026-11-13 это 64 и 105 дней. Раздел обещает «Latest dev notes» (`index.html:680`).
- Проблема: посетитель-издатель видит давно не обновлявшуюся ленту.
- Как исправить: публиковать короткие реальные заметки (`site/tools/sync-devlogs.mjs`), даты не менять без реальных изменений.
- Критерий готовности: `rg -o 'data-published="[0-9-]+"' site/games/*.html | sort -t'"' -k2 | tail -1` показывает дату не старше 14 дней.
- Источники: AUD-13, doc4-44, doc10-38, doc11-21, doc5-32 (часть про свежесть).

### D2-12 [P3] Контакт работает только через mailto (AUD-11, известное ограничение)
- Статус: ПОДТВЕРЖДЕНО (по doc1 и коду).
- Где сейчас: `site/scripts.js:2110-2118`, `getContactDraft` `scripts.js:291-307`, поле `maxlength="1200"` `index.html:839`; раскрыто в `index.html:841`. Новое: письмо до 1200 кириллических символов кодируется `encodeURIComponent` примерно в 7200 символов ссылки (Outlook усекает около 2000 — по внешнему источнику отчёта, на устройстве не проверялось: ТРЕБУЕТ УСТРОЙСТВА).
- Проблема: без настроенного почтового клиента запрос не уходит, сайт не получает подтверждения.
- Как исправить: сначала D2-05; серверная форма (Formspree и подобные) — опционально, потребует ослабить `connect-src 'none'`/`form-action 'none'` в meta CSP на всех страницах; уменьшение лимита `maxlength` или «копировать текст и открывать mailto только с темой» — вариант, который отчёт doc5 рекомендовал.
- Критерий готовности: тест в Gmail/Outlook/iOS Mail с длинным русским сообщением (не выполнялся).
- Источники: AUD-11, doc4-33, doc6-02, doc7a-05, doc11-05 (хранилище — `sessionStorage`, `scripts.js:315,336`; «localStorage» в doc11 неверно), doc5-08 (обязательные поля, лимит).

### D2-13 [P3] Раздел «Development journey» повторяет «Devlog» на страницах игр
- Статус: ПОДТВЕРЖДЕНО.
- Где сейчас: `site/games/nature-seed.html:357-372` («Development journey») против `:411-424` («What changed and when»): Summer 2025, December 2025, February 2026, March, April, 10 September 2026 есть в обоих; на других играх так же: `candy-shop.html:342` и `:398` («GDD expansion»), `paint-blasters.html:333-334` и `:387-388`.
- Проблема: два списка почти дословно дублируют друг друга, лишний объём для перевода (41 локаль).
- Как исправить: удалить секцию «Development journey» (или оставить только devlog) в четырёх `site/games/*.html` и перегенерировать локали.
- Критерий готовности: `rg -c "Development journey" site/games/*.html` — нули.
- Источники: doc11-48.

### D2-14 [P3] Внутренние термины на публичных страницах игр
- Статус: ПОДТВЕРЖДЕНО.
- Где сейчас: «Primary CTA» как строка фактов: `site/games/nature-seed.html:312`, `candy-shop.html:288`, `paint-blasters.html:311`, `ball-is-god.html:472`; «GDD» в публичных таймлайнах: `nature-seed.html:361,421`, `candy-shop.html:266,342,397-398`, `paint-blasters.html:333-334,387-388,391`; «Unity builds» `site/index.html:680`. «Publisher angle» (`games/*.html:277,300,302,461`, `press-kit.html:150`) — осознанный блок для издателей, не дефект, но в переводах даёт «Угол издателя»/«Verlagswinkel» (см. D2-02).
- Проблема: внутренний жаргон и подпись «Primary CTA» (Open release materials) на публичных страницах.
- Как исправить: `Primary CTA` → `Next step`, `GDD` → `design document`, «Unity builds» → «playable builds»; регенерация.
- Критерий готовности: `rg -c "Primary CTA|GDD" site/games site/index.html --glob '*.html'` = 0.
- Источники: doc5-56.

### D2-15 [P3] Правила использования ассетов сформулированы по-разному в трёх местах
- Статус: ПОДТВЕРЖДЕНО.
- Где сейчас: `site/index.html:1000` (модалка: «articles, posts, pitch references, coverage, wishlists, store mockups and publisher review notes»), `site/asset-usage.html:50` («articles, videos, social posts, publisher review decks and store-page mockups»), `site/press-kit.html:470` («press articles, publisher review decks, store-reference mockups, creator coverage…»): «videos» нет в модалке, «wishlists» нет на странице.
- Проблема: разные списки разрешённого в политике; формулировки переводятся 41 раз независимо.
- Как исправить: один текст на три места (модалка со ссылкой на `asset-usage.html`); юридическую сторону (какой вариант верный) решает D1/владелец.
- Критерий готовности: список разрешённых применений одинаков в трёх файлах.
- Источники: doc5-38.

### D2-16 [P3] Непереведённые английские остатки в локалях (память переводов хранит идентичные строки)
- Статус: ПОДТВЕРЖДЕНО (масштаб: приоритетные ru, es, pt, fr почти чисты).
- Где сейчас: в `site/tools/locales/*.json` ~218 многословных строк идентичны английскому ключу (fil 85, ja 23, sv 12, da 10, no 8, el 8, cs 7). Примеры: `ja/games/ball-is-god.html:515,529` «Vertical descent worlds», «Story arcade backgrounds» (`ja.json:1516,1354`), `ja/games/candy-shop.html:151` aria-label «Candy Shop highlights» (`ja.json:356`) и `:368` «Hardcore tower arcade» (`ja.json:719`); `zh-hans/games/*.html:111-112` aria-label «Game page navigation» (`zh-hans.json:684`); `pl/index.html:226,772` aria-label «WillowinWorlds home» (`pl.json:1566`); `de/index.html` «Candy Merge», «Game Devlogs» (`de.json:318,679`); `fil/index.html:810` «Close contact form», `fil/press-kit.html:59`, `fil/llms.txt:21` «Studio at pindutin» (ошибка: «pindutin» — нажимать кнопку; `fil.json:1363`).
- Проблема: часть aria-label и видимых строк осталась английской; у скринридера в ja/zh-hans/pl английские метки.
- Как исправить: перевести значения вручную в соответствующих `locales/*.json` (приоритет ja, zh-hans, pl, de, затем остальные), перегенерировать; опционально — в `localize-site.mjs` печатать предупреждение об идентичных значениях.
- Критерий готовности: `rg -n '"Game page navigation": "Game page navigation"|"Candy Shop highlights": "Candy Shop highlights"|"WillowinWorlds home": "WillowinWorlds home"' site/tools/locales` — пусто.
- Источники: doc8-18 (часть: рантайм alt не переводит, но build-время `localize-site.mjs:48` переводит alt; остаточные английские alt: fil «Espa dialogue portrait» и др., ja «Goga dialogue portrait»), doc11-12 (часть про fil).

### D2-17 [P3] Страница 404 только на английском
- Статус: ПОДТВЕРЖДЕНО.
- Где сейчас: `site/404.html:2` (`<html lang="en">`), `:8,39`; локальных 404 в `site/<lang>/` нет; GitHub Pages отдаёт один `/404.html` для любого неверного пути.
- Проблема: пользователь на `/ru/…` или `/ar/…` получает английскую страницу-игру.
- Как исправить: в `site/404.js` определить локаль по первому сегменту пути (список в `site/languages.json`) и подменить 8-10 строк интерфейса для 3-5 приоритетных языков; либо оставить как есть (ограничение Pages).
- Критерий готовности: в браузере `/ru/no-such-page` показывает русский заголовок.
- Источники: doc8-38.

### D2-18 [P3] Ссылки mailto в локалях: пробелы закодированы как `+` вместо `%20` (новая находка)
- Статус: ЧАСТИЧНО (статически подтверждено, поведение клиентов не проверялось: ТРЕБУЕТ УСТРОЙСТВА).
- Где сейчас: `site/tools/localize-site.mjs:542-554` (`localizeMailto`): `url.searchParams.set(...)` переписывает всю строку запроса в форме `application/x-www-form-urlencoded`. Пример: `ru/games/candy-shop.html:148` → `?subject=Candy+Shop+%D0%BE…`, в английском оригинале `%20`. Затронуто 311 HTML-файлов (в `ru/index.html` 14 из 18 mailto, `ar` 14, `es` 14, `ja` 4). По RFC 6068 `+` в mailto — буквальный плюс; часть клиентов покажет «Candy+Shop+обновления» в теме и «Hi+WillowinWorlds» в теле.
- Проблема: тема и текст письма от главных CTA («Request updates», «Publisher contact») могут выглядеть испорченными у русскоязычных, арабских и других пользователей.
- Как исправить: одна строка перед `return` в `localizeMailto`: `url.search = url.searchParams.toString().replaceAll("+", "%20");`, затем `node site/tools/localize-site.mjs`. В копии: после правки файлов с `+` в subject/body — 0 из 311.
- Критерий готовности: `rg -l 'mailto:[^"]*[?&](subject|body)=[^"]*\+' site --glob '*.html' --glob '!dist/**' | wc -l` = 0 (сейчас 311).
- Источники: новое (связано с doc8-69, но тот исходный пункт не подтверждён: кодирование UTF-8 корректное).

### D2-19 [P3] Генератор переводов: неофициальный endpoint, повторы на постоянных ошибках, запись памяти без атомарности
- Статус: ЧАСТИЧНО (все три технические утверждения верны, но влияют только на ручную регенерацию, прод не затронут; формулировка «P1» у doc4-10 завышена).
- Где сейчас: `site/tools/localize-site.mjs:735-740` (`translate.googleapis.com/translate_a/single`, `client=gtx`, маркеры `⟦000⟧`), `:714-725` (исключение для нерепитабельного статуса ловится общим `catch` и повторяется до 4 раз), `:829,869` (`writeFile` памяти переводов напрямую). Рекомендация doc4-10 «прод не зависит от переводчика, словари версионируются» уже выполнена: все переводы лежат в `site/tools/locales/*.json` в git, `--check` работает офлайн (запущено в копии: passed).
- Проблема: при изменении endpoint новые строки не переведутся, при сбое записи JSON придётся `git checkout`.
- Как исправить (опционально): не ловить статусы вне `[429, 500, 502, 503, 504]` общим `catch`; писать JSON через временный файл и `rename`; endpoint оставить, пока устраивает.
- Критерий готовности: n/a (опциональная гигиена).
- Источники: doc4-10, doc10-20, doc4-15, doc10-35, doc4-17 (часть про стоимость сопровождения). Побочный факт для группы A: `.github/workflows/site-quality.yml` не запускает `node site/tools/localize-site.mjs --check` и не делает `node --check` для `localize-site.mjs`/`localization-config.mjs`.

### D2-20 [P3] Переключатель языков: 41 ссылка в одном `<details>` (UX-полировка)
- Статус: ЧАСТИЧНО.
- Где сейчас: `site/index.html:250` (`<details>`, 42 `<a>`, у каждой `lang` и `hreflang`); стили `site/css/base.css:1243-1262, 1328-1342`: свёрнут по умолчанию (кнопка «EN» 42×42), на мобильном открывается панелью в 2 колонки с прокруткой, пункты высотой 40 px. Все 15 498 ссылок переключателя по 371 странице ведут на существующие файлы. Автоопределения языка нет (`rg navigator.language` — 0; автоматическое перенаправление для SEO не рекомендуется).
- Проблема: утверждение «занимает место» неверно; верно только то, что список плоский (без группировки/поиска).
- Как исправить: опционально 5-8 приоритетных языков + «More languages»; ненужно для 1-й итерации.
- Критерий готовности: n/a (решение по UX).
- Источники: doc3-25, doc6-01, doc7a-10, doc7a-13, doc8-29, doc8-82.

### D2-21 [P3] В RTL-страницах названия игр на латинице без `lang="en"`/`dir="ltr"`
- Статус: ЧАСТИЧНО (отсутствие `lang`-обёрток подтверждено; визуальный эффект — ТРЕБУЕТ БРАУЗЕРА).
- Где сейчас: `site/ar/games/ball-is-god.html:105,107,109` и ещё 14 текстовых узлов с «Ball is God?!» (всего 17), `lang="en"` нет (`lang=` встречается только у ссылок переключателя). Пример из аудита («в `<h1>`») неточен: `<h1>` на арабской странице (`:147`) названия не содержит. Концевая пунктуация «?!» в RTL-контексте может визуально переставляться.
- Проблема: возможна неверная озвучка скринридером и перестановка «?!» в RTL; масштаб «~200 мест» не подсчитан.
- Как исправить: в генераторе для `ar, fa, he, ur` оборачивать защищённые имена в `<span lang="en" dir="ltr">…</span>` (требует правки `localize-site.mjs`); или принять как известное ограничение.
- Критерий готовности: визуальная проверка `/ar/games/ball-is-god.html` в браузере (не выполнялась).
- Источники: doc8-40 (doc8-41 про alt отклонён).

### D2-22 [P3] RTL: физические `text-align: left` и почти нет RTL-оверрайдов
- Статус: ТРЕБУЕТ БРАУЗЕРА (код подтверждает, зеркало не снималось).
- Где сейчас: единственное RTL-правило во всех стилях — `site/css/base.css:1316` (`html[dir="rtl"] .language-options`); `text-align: left` у FAQ-вопросов `site/css/site-sections.css:330`, у кнопок подвала `:399` и у заголовка FAQ `site/css/home-polish-2026.css:162`; 256 строк с `left/right/margin-left/padding-left` в `site/css/*.css`. RTL-локали: ar, fa, he, ur (`dir="rtl"` есть на всех, включая `he`), 36 страниц. `hyphens`, `:lang()`, `forced-colors` в CSS отсутствуют (`rg` — 0), эффект на CJK/контраст не доказан.
- Проблема: в арабских/ивритских страницах FAQ и подвал выравниваются влево; декоративные элементы не зеркалятся.
- Как исправить: заменить `text-align: left` на `text-align: start` в трёх селекторах; остальное — по скриншотам ar/he.
- Критерий готовности: `rg -n "text-align:\s*left" site/css` — пусто и визуальная проверка ar/he FAQ и подвала.
- Источники: doc11-08, doc8-75, doc11-47 (forced-colors — к группе B).

### D2-23 [P3] Нет сведений о людях, стране и юрлице; «Careers / Collaboration» без вакансий
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас: секция About есть (`site/index.html:625-642`), но без имён, страны, юрлица и текущего приоритета; подвал `© 2026 WillowinWorlds`; факты студии `site/press-kit.html:122-127` (Studio, Focus, Portfolio, Contact); кнопка уже переименована в «Careers / Collaboration» (`index.html:796`), окно «Open roles and collaboration tracks» с тегами «2D artists, Unity developers…» (`index.html:850-877`) всё ещё может читаться как набор.
- Проблема: слабый сигнал доверия для издателей; формулировка «Open roles» без вакансий.
- Как исправить: владелец решает, что публиковать (имя основателя, страна, юрлицо); заголовок окна → «Collaboration tracks».
- Критерий готовности: решение владельца; затем строка в `press-kit.html` «Studio facts».
- Источники: doc5-29, doc6-15 (утверждение «нет блока About» неточно: он есть, нет людей и фокуса), doc5-32 (часть про Careers).

### D2-24 [P3] Пресс-кит: нет монетизации, рейтинга, команды, ссылок на магазины; нет ZIP, размеров, embed-кода
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас: `site/press-kit.html:188-193` (platforms, previews, private by request, contact path); публичные ассеты: 101 файл, 8,1 МБ в `site/assets/downloads`; ZIP, размеров файлов и embed-кода на странице нет; группировка есть частично («Game download kits» `press-kit.html:456`).
- Проблема: факты для издателя и удобства журналиста отсутствуют; пользу (журналист скачивает по одному) отчёты не доказывали.
- Как исправить: добавить только подтверждённые строки в «Factsheet» (монетизация, возрастной рейтинг, команда) после решения владельца; ZIP/размеры — опционально.
- Критерий готовности: решение владельца.
- Источники: doc5-31, doc8-39, doc8-78, doc8-79, doc8-81.

### D2-25 [P3] На сайте нет видео или GIF геймплея и ссылки на трейлер
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас: `<video>`, `.gif` и `<iframe>` на сайте нет; в meta CSP стоят `media-src 'none'` и `frame-src 'none'`. YouTube-каналы у студии есть (D1-01).
- Проблема: геймплей показан только CSS-имитациями и текстом.
- Как исправить: самый дешёвый путь — ссылка на ролик на YouTube с локальной картинкой-обложкой; `youtube.com` уже будет в списке разрешённых хостов после A-08. Встраивание через iframe потребует ослабить CSP на 378 страницах — не рекомендуется.
- Критерий готовности: решение владельца.
- Источники: doc5-30. Часть про соцсети и магазины перенесена в D1-01 и D2-01.

### D2-26 [P3] Нет отдельного канала поддержки и сообщений об ошибках для игроков
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас: единственный адрес `willowinworlds@gmail.com`; в контакте сказано «We welcome player feedback» (`site/index.html:759`); страницы помощи нет.
- Проблема: актуально после появления игры в магазине (D2-01).
- Как исправить: после D2-01 — адрес поддержки или короткая страница «Help».
- Критерий готовности: решение владельца.
- Источники: doc5-34.

### D2-27 [P3] 42 локали при отсутствии человеческой вычитки: разрастание стоимости сопровождения
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА.
- Где сейчас: 378 URL в `site/sitemap.xml` (42 локали × 9 страниц; `rg -c "<loc>"` = 378), 16 254 `xhtml:link`; переводы Google MT без вычитки; системные ошибки подтверждены в D2-02 и D2-04.
- Проблема: чем больше локалей, тем дороже исправлять термины.
- Как исправить: сначала D2-02/D2-03/D2-04 для ru, es, pt, de, fr, ja, tr; тяжёлый вариант (tiers, `noindex` для непроверенных) — опционально и меняет hreflang всех страниц.
- Критерий готовности: решение владельца.
- Источники: doc4-17, doc7a-02, doc8-14.

### S-02 [P3] Внешние профили не ведут на сайт (правки вне репозитория)
- Статус: ПОДТВЕРЖДЕНО 13.11 (публичные страницы); X не проверялся.
- Где сейчас:
  - Game Jolt: ни страница игры, ни профиль `@WillowinWorlds` не ссылаются на сайт; на странице игры написано «Nothing has been posted… yet».
  - itch.io: на странице игры ссылки на сайт нет.
  - indiexpo: ссылка «Website» → `https://willowinworlds.com/` есть.
  - Reddit u/WillowinWorlds: аккаунт с 18.09.2026, 0 постов, 38 comment karma, нет описания и ссылки на сайт.
  - X: по doc11-22 в описании «Nature Seed - in development» — не проверено.
  - Хэндл Instagram ES — `willowinworlds_es_pr`, а у TikTok и Threads ES — `_es`. Это разные хэндлы для одной аудитории; менять не обязательно, но на сайте брать точные значения из таблицы ниже.
- Проблема: связь работает только в одну сторону, а после D1-01 — ни в одну, если профили молчат о сайте. Поисковикам и людям полезны взаимные ссылки «профиль ↔ сайт».
- Как исправить:
  - в описание каждого профиля добавить ссылку на сайт своей локали: EN → `https://willowinworlds.com/`, RU → `https://willowinworlds.com/ru/`, ES → `https://willowinworlds.com/es/` или `/es-419/`;
  - на itch.io (раздел More information / ссылки) и в описании игры на Game Jolt — ссылки на сайт и на `/games/nature-seed.html`;
  - в профиле Reddit — описание и ссылка на сайт;
  - статус Nature Seed во всех описаниях привести к тому, что на сайте.
- Критерий готовности: ручная проверка каждого профиля.
- Источники: проверка основной сессией 13.11; doc11-22.

### D1-08 [P3] Sitemap `lastmod` не отражает реальных правок (371 URL = 2026-09-10, 7 = 2026-07-31)
- Статус: ПОДТВЕРЖДЕНО (priority в AUD-24 — P2, понижен: у сайта 9 уникальных страниц, поле — подсказка, ущерб — потеря сигнала, не ошибка индексации)
- Где сейчас: `site/sitemap.xml` (378 `<lastmod>`, 378 `<priority>`, 378 `<changefreq>`); источник даты `site/tools/localization-config.mjs:3` (`localizationLastModified = "2026-09-10"`) и `site/tools/localize-site.mjs:1088` (одна константа для всех локализаций); английские даты — `site/tools/devlog-data.mjs` (только devlog). 7 английских URL (`/press-kit.html`, `/privacy.html`, `/legal.html`, `/asset-usage.html`, `/games/candy-shop.html`, `/games/paint-blasters.html`, `/games/ball-is-god.html`) имеют 2026-07-31, а их локализованные копии — 2026-09-10. Коммит `5ac8791` изменил 378 HTML, но sitemap не менял (AUD-24).
- Проблема: Google использует `lastmod` только при доказуемой точности; константа и расхождение «близнецов» снижают доверие к полю. `priority`/`changefreq` Google игнорирует (безвредны).
- Как исправить: самый маленький шаг — убрать `<lastmod>` у локализованных записей (`localize-site.mjs:1088`) и держать его только у английских URL через существующий `update-sitemap-lastmod.mjs`; либо считать дату из `git log -1 --format=%cs -- <файл>` на сборке. На `priority`/`changefreq` время не тратить.
- Критерий готовности: `rg -c "<lastmod>" site/sitemap.xml` соответствует выбранному правилу; `node site/tools/update-sitemap-lastmod.mjs --check` и `seo-check.mjs` проходят.
- Источники: AUD-24, doc4-41, doc5-45, doc11-44.

### D1-09 [P3] Внутренние ссылки ведут на `…/index.html`, хотя canonical — `…/`
- Статус: ПОДТВЕРЖДЕНО (priority в AUD-08 — P2, понижен: canonical и sitemap корректны, дубль решается canonical)
- Где сейчас: 2314 вхождений `href="…index.html"` в 295 HTML-файлах (переключатель языков на главных `site/<lang>/index.html`, «Back to home» в `privacy.html`/играх: `games/nature-seed.html` и др.); прод: `/index.html` и `/ru/index.html` → 200 (без редиректа); `site/_redirects` на GitHub Pages не работает.
- Проблема: у одной страницы два доступных адреса; canonical (`/`, `/ru/`) снимает риск индексации, но внутренние ссылки размывают сигналы и счётчики.
- Как исправить: в `renderLanguageSwitcher` (`site/tools/localize-site.mjs:976-982`) и в шаблонах (`privacy.html`, `games/*.html`, `404.html`) вести на `./`, `../`, `/` вместо `index.html`; перегенерировать локали.
- Критерий готовности: `rg -c 'href="[^"]*index\.html"' site --glob '*.html' --glob '!dist/**' --glob '!reports/**'` → 0 совпадений.
- Источники: AUD-08, doc4-42, doc5-44, doc8-03 (часть про canonical/`index.html`; домен исправлен).

### D1-10 [P3] `seo-check` пропустит страницу с `noindex, nofollow`
- Статус: ПОДТВЕРЖДЕНО (текущие 378 страниц — `index, follow`, дефекта на проде нет; это дыра в тесте)
- Где сейчас: `site/tools/seo-check.mjs:158` (`!robots.includes("index") || !robots.includes("follow")` — `"noindex, nofollow"` содержит обе подстроки).
- Проблема: случайный `noindex, nofollow` на индексируемой странице пройдёт CI (`.github/workflows/site-quality.yml:46`).
- Как исправить: разбирать значение как список директив: `const d = robots.split(",").map(s => s.trim()); if (!d.includes("index") || !d.includes("follow")) fail(...)`.
- Критерий готовности: на копии страницы с `content="noindex, nofollow"` `node site/tools/seo-check.mjs` завершается с ошибкой.
- Источники: doc10-33.

### D1-11 [P3] H1 на страницах игр — слоган, название игры только в eyebrow и `<title>`
- Статус: ПОДТВЕРЖДЕНО
- Где сейчас: `site/games/nature-seed.html:181` («Draw a path. Bring them together.»; название в `<div class="eyebrow">` на `:180`), `candy-shop.html:144`, `paint-blasters.html:150`, `ball-is-god.html:147`.
- Проблема: пользователь скринридера при навигации по заголовкам слышит слоган без названия; для поиска название есть в `<title>` и `<meta>`, ущерб мал.
- Как исправить: в 4 исходных страницах игр поместить название в H1 (слоган — в `<p>` или в тот же H1 вторым `<span>`); перегенерировать локали.
- Критерий готовности: `rg -o '<h1[^>]*>.*?</h1>' site/games/nature-seed.html` содержит «Nature Seed».
- Источники: doc5-49.

### D1-12 [P3] hreflang только в sitemap и переключателе (body), в `<head>` его нет
- Статус: ЧАСТИЧНО (факт верен, вывод «не работает» — нет: sitemap — полноценный способ, кластер полный и взаимный, `x-default` есть)
- Где сейчас: `site/sitemap.xml` (43 альтернативы у каждого из 378 URL); `site/tools/seo-check.mjs:163-164` намеренно запрещает дубль в `<head>` («hreflang must use the authoritative sitemap cluster»); `site/tools/localize-site.mjs:570` удаляет старые head-блоки. Ссылки `<a hreflang>` в body — только подсказка для пользователя, поисковик их как аннотации не использует, но и не должен.
- Проблема: для Google дефекта нет. Возможное ухудшение склейки языков в Bing/Yandex (сайт верифицирован в Yandex) — не проверено, зависит от документации поисковиков.
- Как исправить: ничего, пока Search Console/Yandex Webmaster не покажут проблем. Если владелец захочет страховку: в `addLocaleMetadata` (`localize-site.mjs:990`) выводить 43 `<link rel="alternate" hreflang>` (~4 КБ на страницу, 378 страниц) и снять запрет в `seo-check.mjs:163-164` — два источника истины, не рекомендуется без подтверждённой проблемы.
- Критерий готовности: для текущего состояния — `rg -c "xhtml:link" site/sitemap.xml` = 16254 (378 × 43); для страховки — `rg -c 'rel="alternate" hreflang' site/index.html` = 43.
- Источники: doc8-16, doc11-24.

### D1-13 [P3] Дубли title/description между `es` и `es-419`
- Статус: ЧАСТИЧНО
- Где сейчас: `site/es/` и `site/es-419/`: description совпадает у 9 из 9 страниц, title — у 3 (`privacy.html`, `legal.html`, `asset-usage.html`); главная, press-kit и 4 игры по title различаются. `seo-check.mjs:151-155` ищет дубли только внутри одной локали, поэтому не ловит. Различие регионов задано в hreflang (`es-ES` → `/es/`, `es` → `/es-419/`).
- Проблема: близкие региональные варианты с одинаковыми сниппетами; ущерб минимален, различие уже заявлено hreflang.
- Как исправить: при желании уникализировать 3 title и 9 description в `site/tools/locales/es-419.json`; иначе принять как есть.
- Критерий готовности: сравнение `<title>`/`<meta description>` у `es/privacy.html` и `es-419/privacy.html` показывает различия.
- Источники: doc11-32.

### D1-14 [P3] Черновик контактной формы в `sessionStorage`: уточнить формулировку privacy
- Статус: ЧАСТИЧНО (механизм подтверждён; риск ограничен и в основном описан)
- Где сейчас: `site/scripts.js:313-340` (чтение/запись `sessionStorage`; имя ≤80, email ≤120, сообщение ≤1200), `:368` (очистка кнопкой сброса); `site/privacy.html:52` («kept in session storage so a reload does not erase your work… can be cleared in the form and is removed when the browser tab session ends»). Все скрипты — `self` + хеши по CSP; `innerHTML`/`eval`/`fetch` запрещены `security-check.mjs:162-163`, сторонних скриптов нет.
- Проблема: текст верно называет перезагрузку и очистку; не названы восстановление закрытой вкладки браузером и копирование данных в дубль вкладки (стандартная семантика `sessionStorage`, в браузере не проверял). На общем компьютере чужой черновик может вернуться. Отключение автосохранения и автоочистка после mailto — не нужны (спекулятивно).
- Как исправить: добавить в `site/privacy.html:52` одно предложение: «It may reappear if your browser restores or duplicates the tab; use Clear draft on shared computers»; перегенерировать локали.
- Критерий готовности: `rg -n "restores or duplicates" site/privacy.html`; поведение — в браузере (перезагрузка, восстановление вкладки, дубль).
- Источники: doc4-39, doc8-31.

### D1-15 [P3] Press-kit: политика ассетов без прямой ссылки на asset-usage и без запрета AI-обучения
- Статус: ЧАСТИЧНО
- Где сейчас: `site/press-kit.html:466-476` (раздел `#asset-policy` сразу под загрузками `:450-454`, но без микро-строки под каждым файлом; текст: «Full asset usage summary is available from the WillowinWorlds footer as an on-page Asset Usage window» — ссылки на `asset-usage.html` нет; пункта про AI-обучение нет, он есть в `asset-usage.html:52` и `legal.html:51`).
- Проблема: пресса, скачав файл, видит правила не рядом, а в окне футера; запрет AI-обучения не повторён там, где берут файлы. Формулировка условий — юридическое решение владельца.
- Как исправить: в `press-kit.html:476` заменить фразу на ссылку на `asset-usage.html` и добавить пункт про AI-обучение в список `:468-473`; перегенерировать локали.
- Критерий готовности: `rg -n "asset-usage.html" site/press-kit.html` находит ссылку; `rg -n -i "train" site/press-kit.html` находит пункт.
- Источники: doc8-80.

### D1-16 [P3] Email студии открыт в HTML и JSON-LD на всех 378 страницах
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: `willowinworlds@gmail.com` в 378 из 380 HTML (в `site/index.html` 21 раз, в JSON-LD `site/index.html:64`, в `scripts.js` для формы). Старый адрес `contact@willowinworld.com` в `site/` 0 раз.
- Проблема: адрес собирают парсеры; но весь контакт сайта — это mailto (нет бэкенда, `form-action 'none'`), поэтому скрытие адреса ломает единственный канал связи. Влияние на спам не измерено.
- Как исправить: ничего (рекомендуемый вариант A); отдельный «press»-адрес — только если владелец решит.
- Критерий готовности: решение владельца.
- Источники: doc5-52, doc8-30, doc8-51.

### D1-18 [P3] Стратегия индексации 42 локалей при автоматических переводах
- Статус: РЕШЕНИЕ ВЛАДЕЛЬЦА
- Где сейчас: все 378 страниц `index, follow` и в sitemap; тексты локалей — из `site/tools/locales/*.json` + автоперевод в `site/tools/localize-site.mjs` (`requestTranslations`, `fetchTranslation`). Качество переводов — тема группы D2.
- Проблема: слабый перевод в поисковой выдаче; отчёт сам не утверждает нарушения политик Google. Массовый `noindex` без согласования с sitemap/hreflang/canonical — ошибка.
- Как исправить: ничего кодом; начать с редакторской проверки главных рынков (RU, ES, DE, PT-BR, JA…) и решения, какие локали остаются индексируемыми, по данным Search Console (D1-07).
- Критерий готовности: решение владельца по списку индексируемых локалей.
- Источники: doc4-43.

</details>

## Объединённые дубли

- D1-02 — объединено с B-08 (часть 1)
- D1-05 — объединено с D2-07
- D1-17 — объединено с D2-01

## Не делать: аудиты ошибались или это уже исправлено

Советы старых аудитов, которые при проверке 13.11 оказались неверными, устаревшими или уже выполненными. По одной строке: ID находки — вердикт — почему.

<details>
<summary>D2 — Локализация, тексты, UX (15)</summary>

- doc10-37, doc11-31 — ИСПРАВЛЕНО/НЕ ПОДТВЕРЖДЕНО: `tr/press-kit.html`, `sv/press-kit.html`, `fil/press-kit.html` и игры `{fil,sv,tr}/games/ball-is-god.html` лежат в git и на проде отдают 200 (`curl`), все 15 498 ссылок переключателя ведут на существующие файлы (скрипт по 371 странице), 41 локаль × 9 страниц + `llms.txt` присутствуют.
- doc7b-06 — НЕ ПОДТВЕРЖДЕНО как дефект: `lang="fil"` при `hreflang="tl"` задано сознательно (`site/tools/localization-config.mjs:117-124`, `tl` — код ISO 639-1, на который опирается hreflang).
- doc7b-07 — ИСПРАВЛЕНО: `pt` теперь `htmlLang`/`hreflang` = `pt-BR` (`localization-config.mjs:293-296`), несовпадения нет.
- doc7b-08, doc5-46 — НЕ ПОДТВЕРЖДЕНО: `es-419` → `hreflang="es"`, Испания → `es-ES`, `pt-BR`/`pt-PT` разведены, дублей нет (`localization-config.mjs:348-363`); общий `pt` не нужен — решение, а не баг.
- doc7b-10 — НЕ ПОДТВЕРЖДЕНО: `site/he/index.html:2` `<html lang="he" dir="rtl">`, как у ar, fa, ur.
- doc7a-12 — НЕ ПОДТВЕРЖДЕНО: `site/scripts.js:297` подставляет `"WillowinWorlds visitor"` при пустом имени, поле Name обязательное (`index.html:821`), двойного пробела нет.
- doc7a-01, doc8-17 — НЕ ПОДТВЕРЖДЕНО как дефект: словарь рантайма — 107-135 динамических строк, статический HTML переведён; удаление `i18n-runtime.js` со всех страниц сломает перевод `aria-label`/`title` переключателя темы (`game-theme.js:63-64`) и тосты. Замер нагрузки — группа C2.
- doc7a-08 — НЕ ПОДТВЕРЖДЕНО: в статическом HTML 41 локали нет английских строк из словаря рантайма (скрипт по 9 страницам × 41), перезаписать авторский текст нечего; механизм по замыслу работает только с точным совпадением.
- doc7b-18 — НЕ ПОДТВЕРЖДЕНО как дефект: черновик в `sessionStorage` сознательно, раскрыт в `site/privacy.html:52`; смена на `localStorage` изменила бы privacy-заявление.
- doc8-18 — НЕ ПОДТВЕРЖДЕНО: `alt` переводится при сборке (`localize-site.mjs:48`); остаточные английские `alt` — единицы (см. D2-16).
- doc8-41 — НЕ ПОДТВЕРЖДЕНО как дефект: имя игры в `alt` (`ar/games/ball-is-god.html:108`) не должно переводиться, а `lang` в `alt` не работает.
- doc8-69 — ИСПРАВЛЕНО: ни одной ссылки на `willowinworld.com`; mailto на `ar/` ведут на `willowinworlds@gmail.com` с корректным UTF-8 percent-encoding (но с `+` вместо `%20`: D2-18).
- doc8-76 — НЕ ПОДТВЕРЖДЕНО: символов-стрелок `›‹→←»«` в HTML, JS и `content:` в CSS нет (`rg` — 0).
- doc8-77 — НЕ ПОДТВЕРЖДЕНО: `Intl.DateTimeFormat` в `scripts.js`/`game-theme.js`/`404.js` нет; даты статически локализованы (`ar/index.html:686` «10 سبتمبر 2026»).
- doc11-13 — НЕ ПОДТВЕРЖДЕНО как пользовательский дефект: «Low Motion»→«Низкая съемка» (`ru`), «Auto»→«汽車» (`zh-hant`), «Enable Magic»→«Enable Magia» (`es`) лежат в словарях, но элементов `#lowMotion`, `#disableMagic`, `#qualityState` в HTML нет (`rg` — 0), строки не показываются.

</details>

<details>
<summary>D1 — SEO, соцсети, юридическое (17)</summary>

- doc4-02, doc6-05, doc10-23, doc11-01, doc11-04, scan8 (378 DNS-ошибок) — ИСПРАВЛЕНО: в `site/`, `site/tools/locales`, `dist`, `reports` 0 вхождений `willowinworld.com`; canonical/og/sitemap/robots/JSON-LD на `willowinworlds.com`, прод это подтверждает; все 378 провалов scan8 — на старом домене, который не резолвится и из сайта больше не вызывается (нужна лишь перепроверка deadlinkchecker; 301 со старого домена невозможен на GitHub Pages и нужен лишь если он когда-либо был публичным — см. «Не проверено»).
- doc4-45, doc8-72, doc8-11 — ИСПРАВЛЕНО/НЕ ПОДТВЕРЖДЕНО: `robots.txt` (200) и `sitemap.xml` (200) на проде получены и идентичны репозиторию; в robots нет `Disallow` локалей (только `/private/`, `/admin/`, `/api/`); sitemap объявлен в `robots.txt:45`, ссылка из `<head>` не нужна.
- doc8-03 (часть «canonical не совпадает с путём файла») — НЕ ПОДТВЕРЖДЕНО как P1: canonical `/ar/` соответствует директории-URL, который GitHub Pages обслуживает из `ar/index.html`; остаток — дубль `/index.html`, см. D1-09.
- doc8-08 — НЕ ПОДТВЕРЖДЕНО: `x-default` есть в sitemap у каждого из 378 URL (`alternateLinks`, `localization-config.mjs:494-499`); в `<a hreflang>` переключателя он не имеет смысла.
- doc8-74, doc11-46 — НЕ ПОДТВЕРЖДЕНО как дефект: `fil/` → hreflang `tl` и `es-419/` → `es` — осознанное сопоставление (по документации Google язык — ISO 639-1, регион — ISO 3166-1 alpha-2, поэтому `es-419` как регион не годится; `es-ES` отдан `/es/`); `lang` и `hreflang` совпадать не обязаны.
- doc6-10 — НЕ ПОДТВЕРЖДЕНО: `seo-check.mjs:206-223` проверяет полноту, взаимность и число hreflang в sitemap для каждой страницы; запускается в CI (`.github/workflows/site-quality.yml:46`).
- doc7b-23 — НЕ ПОДТВЕРЖДЕНО: `creativeWorkStatus` в schema.org — Text/DefinedTerm, свободный текст допустим; предложенные `InStock`/`OutOfStock` — значения `ItemAvailability`, к этому полю не относятся; значения совпадают с видимым статусом, и `seo-check.mjs` сверяет их с AI-профилем.
- doc7b-24 — НЕ ПОДТВЕРЖДЕНО: `gamePlatform: "Mobile"` — допустимый Text, отчёт сам называет риск нулевым.
- doc7b-09 — НЕ ПОДТВЕРЖДЕНО как дефект: `<meta http-equiv="content-language">` (`site/index.html:5`) генерируется намеренно (`localize-site.mjs:998`), вреда нет.
- doc8-71 — НЕ ПОДТВЕРЖДЕНО как дефект: у `404.html` `noindex`, а canonical по контракту быть не должен (`seo-check.mjs:131-133`); отсутствие og-тегов на noindex-странице несущественно.
- doc5-23 — НЕ ПОДТВЕРЖДЕНО: прод отдаёт для несуществующего пути код 404 (`/games/x-nonexistent` → 404); `/404.html` напрямую = 200 намеренно (ссылка «Lost Stars» `site/index.html:785`, игра) и закрыта `noindex`; проблема в другом — D1-02.
- doc5-50 (часть «описания длиннее 160 символов у 229 страниц») — НЕ ПОДТВЕРЖДЕНО как дефект: у меня 233 из 378 > 160 символов, лимиты `seo-check.mjs:141-144` намеренно шире (EN ≤180, локали ≤250); Google укорачивает сниппет сам.
- doc10-34 — НЕ ПОДТВЕРЖДЕНО как дефект: границы длины title/description в `seo-check.mjs:141-144` широкие и учитывают CJK через `compactScript` (`:140`); блокируют сборку только при крайних значениях.
- doc11-23 — НЕ ПОДТВЕРЖДЕНО: FAQ-контент есть (`site/index.html:714`, `games/nature-seed.html:400`), `FAQPage` нет и намеренно запрещён (`seo-check.mjs:185`); выгоды от разметки не доказано (Google с 2023 г. ограничил расширенные FAQ-результаты авторитетными госсайтами и сайтами здравоохранения — по памяти документации, не перепроверял).
- doc11-45 — НЕ ПОДТВЕРЖДЕНО как дефект: image-sitemap на 5 URL (36 изображений) — факт; конкретной проблемы отчёт не называет.
- doc4-46 — НЕ ПОДТВЕРЖДЕНО как дефект: сам отчёт рекомендует оставить генерацию `llms.txt` как есть; файл есть и корректен (прод — домен `willowinworlds.com`).
- doc11-50 — НЕ ПОДТВЕРЖДЕНО как дефект: папки `site/assets/Nature Seeds`, `Ball is God`, `Candy Shop`, `Paint Blasters` содержат пробелы, `Nature%20Seeds/Icon-site.webp` на проде = 200 (126 страниц ссылаются); это косметика, переименование — риск без выгоды.

</details>


## Не проверено

<details>
<summary>D2 — Локализация, тексты, UX</summary>

- doc3-20 (обрезка длинных переводов в узких кнопках): текст статический, а не подставляется рантаймом; визуальную проверку 41 локали на устройствах не делал.
- doc3-24 (длина главной на мобильном): UX-гипотеза без метрик.
- Нативная вычитка переводов: по ключевым строкам просмотрены ru, es, es-419, pt, pt-pt, de, fr, ja, tr, nl, tt, zh-hans, fi, fil, sv, cs; остальные локали (ar, fa, he, ko и др.) не вычитывались.
- Поведение `+` в mailto и усечение длинных mailto в реальных клиентах (D2-12, D2-18): нужен телефон/клиент.
- Визуальное зеркалирование RTL и порядок «?!» в арабском (D2-21, D2-22): нужен браузер.
- Живой прод: выполнено 9 GET (4 статуса press-kit/игры fil, `game-theme.js`, `ru/games/nature-seed.html`, `games/nature-seed.html`, `fi/i18n-runtime.js`); остальное проверено по коду HEAD, который задеплоен.

</details>

<details>
<summary>D1 — SEO, соцсети, юридическое</summary>

- doc11-22 (в X-профиле «Nature Seed - in development» при релизе на сайте) — внешний профиль, вне репозитория; по брифу GET только к проду сайта. Владельцу: сверить био X и остальных соцсетей со статусом «Released 2026-09-10».
- Принимает ли Teams/Slack/Discord/X WebP в `og:image` (doc5-48, doc8-07) — нужны реальные площадки; в D1-03 решается заменой на JPEG.
- Поведение `sessionStorage` при восстановлении вкладки/дубле (doc4-39) — нужен браузер.
- Верификация Google Search Console, индексация и выдача (doc3-03, doc8-10, doc7b-29) — нужен аккаунт; в D1-07.
- Использовался ли `willowinworld.com` публично раньше (нужен ли 301 со старого домена) — знает только владелец; сайт-сторона ничего не может сделать на GitHub Pages.
- Заявления отчётов о «+5-15 % трафика» от `x-default`, влиянии на спам, доверии издателей — не измерялись.
- Нужна ли политика приватности приложения для магазинов (doc5-25) — пока страниц в магазинах нет.

</details>

<details>
<summary>S — площадки и профили</summary>

- Страницы аккаунтов TikTok, Instagram, Threads, YouTube, X, VK, Telegram и Facebook не открывались: список дал владелец. Reddit, itch.io, Game Jolt и indiexpo открыты 13.11.
- Описание профиля X (doc11-22: «Nature Seed - in development») не проверялось.

</details>


---

Проверка 13.11.2026: основная сессия плюс независимые проверки по областям. Ничего в `site/` не менялось. Инструменты сайта запускались только на копиях во временной папке.
