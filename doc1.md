# Аудит сайта WillowinWorlds

## Паспорт проверки

| Поле | Значение |
|---|---|
| Сайт | `https://willowinworlds.com` |
| Репозиторий | `/home/mrexavius/Documents/GitHub/WillowinWorld` |
| Ветка | `35` |
| Проверенный commit | `5ac8791555899269422bd987d43d3e5cea8b9622` |
| Дата основного среза | 2026-11-10, Europe/Istanbul |
| Дата дополнения | 2026-11-11, Europe/Istanbul |
| Формат | Read-only аудит исходников, CI/CD, DNS и опубликованного сайта |
| Итог | **FAIL для строгого release gate; сам сайт доступен и основные сценарии работают** |

## Краткий вывод

Сайт не находится в аварийном состоянии. Главная страница и ключевые документы открываются, HTTP перенаправляется на HTTPS, `www` перенаправляется на основной домен, пользовательская страница 404 возвращает настоящий код 404, контактное окно, фильтры, тема и языковое меню работают. На проверенной главной странице не было ошибок консоли, а все 46 сетевых запросов завершились кодом 200.

Нулевых критических дефектов уровня P0 не найдено. Всего зафиксировано 28 находок: 7×P1, 11×P2 и 10×P3. Строгий допуск к релизу не пройден из-за семи P1:

1. меню полностью недоступно указателю при ширине 320 CSS px, а при увеличении текста до 200% часть элементов шапки уходит за экран;
2. игра Nature Seed помечена как выпущенная, но у пользователя нет ссылки на установку или магазин;
3. объявленные в `site/_headers` защитные HTTP-заголовки не применяются GitHub Pages;
4. публикация Pages не зависит от прохождения полного quality gate и может взять изменяемую ссылку на ветку вместо проверенного commit;
5. домен не принимает почту, но это не зафиксировано через Null MX, SPF `-all` и DMARC, поэтому домен хуже защищён от подмены отправителя.
6. production-ветка `35` публично не защищена: `protected:false`, repository rulesets отсутствуют;
7. польская, турецкая и татарская локали всё ещё показывают неработающий адрес `@willowinworlds.com`, хотя доменная почта не настроена.

Приоритетный вывод: сначала исправить адаптивную шапку, удалить старый контакт из локалей, защитить ветку `35` и сделать публикацию зависимой от полного gate. Затем закрыть продуктовый CTA, HTTP-заголовки, DNS-защиту почты и постоянную GitHub Pages domain verification. После этого выполнить повторную проверку на 320–390 px, при 200% текста и после реального деплоя.

## Шкала приоритетов

| Уровень | Значение |
|---|---|
| P0 | эксплуатация сайта невозможна, вероятна компрометация или потеря данных; исправлять немедленно |
| P1 | блокер релиза или существенный риск доступности, безопасности, продукта либо эксплуатации |
| P2 | заметный дефект, который нужно закрыть в ближайшем цикле |
| P3 | улучшение, технический долг или известное ограничение |
| NOT EVALUATED | доказательств недостаточно; это не PASS и не FAIL |

## Общая карта системы

```text
Посетитель
  -> HTTPS
  -> GitHub Pages / CDN
  -> статические HTML, CSS, JS и локальные изображения

Браузер
  -> localStorage: выбранная тема
  -> sessionStorage: черновик контактного сообщения
  -> mailto: willowinworlds@gmail.com

GitHub, ветка 35
  -> pages.yml
  -> публикация каталога site

Отдельно:
  -> site-quality.yml выполняет часть проверок
  -> DNS управляет доменом willowinworlds.com
```

На сайте нет серверного API, аккаунтов, базы данных, платежей, пользовательских загрузок или runtime-зависимостей от стороннего JavaScript. Это заметно уменьшает поверхность атаки. Контактная форма не отправляет данные на сервер сайта: она формирует `mailto:` и предлагает копирование текста.

## Сводка quality gates

| Gate | Результат | Основание |
|---|---|---|
| Доступность сайта | PASS | главная и основные документы доступны; пользовательская 404 работает |
| Функциональность | CONDITIONAL | основные сценарии работают, но menu/resize имеют блокирующий дефект |
| Accessibility / interaction | **FAIL** | меню вне экрана на 320 px; шапка обрезается при 200% текста |
| Продуктовый путь | **FAIL** | у выпущенной Nature Seed отсутствует install/store CTA |
| Производительность | CONDITIONAL PASS | хороший ограниченный Firefox-lab срез; нет CWV и полевых данных |
| Technical SEO / discovery | CONDITIONAL | базовая индексация проходит, но `lastmod`, social cards, RSS и AI crawler policy требуют исправления |
| Контент и локализация | CONDITIONAL | подтверждены ошибки русской локализации и старый почтовый адрес в PL/TR/TT |
| Security / privacy | CONDITIONAL | низкая поверхность атаки, но response headers, branch protection, domain verification и DNS mail policy не закрыты |
| CI/CD и release integrity | **FAIL** | деплой не привязан к успешному полному gate и точному SHA |
| Аналитика / Search Console | NOT EVALUATED | доступ к данным Search Console и полевой аналитике не предоставлен |
| Recovery | NOT EVALUATED | Git-история есть, но rollback/restore drill не показан |

## Реестр находок

| ID | Приоритет | Область | Статус |
|---|---:|---|---|
| AUD-01 | P1 | Accessibility / responsive header | подтверждено |
| AUD-02 | P1 | Продуктовый CTA Nature Seed | подтверждено |
| AUD-03 | P1 | HTTP security headers | подтверждено на production |
| AUD-04 | P1 | CI/CD gate и provenance | подтверждено в workflow |
| AUD-05 | P1 | DNS-защита неиспользуемой доменной почты | подтверждено DNS-проверкой |
| AUD-06 | P2 | Качество русской локализации | подтверждено выборкой |
| AUD-07 | P2 | Видимый бренд остался `WillowinWorld` | подтверждено |
| AUD-08 | P2 | Неканонические внутренние URL и старый домен | подтверждено / условно |
| AUD-09 | P2 | GitHub Actions закреплены не по полному SHA | подтверждено |
| AUD-10 | P2 | Skip link перехватывает pointer после Tab | подтверждено |
| AUD-11 | P3 | Контакт работает только через почтовое приложение | известное ограничение |
| AUD-12 | P3 | Minified build проверяется, но не публикуется | подтверждено |
| AUD-13 | P3 | Часть devlog-контента давно не обновлялась | наблюдение |
| AUD-14 | P1 | Старый неработающий email в локалях | подтверждено локально и на production |
| AUD-15 | P1 | Production-ветка `35` не защищена | подтверждено GitHub API |
| AUD-16 | P3 | В production опубликованы build tools и raw locale JSON | подтверждено на production |
| AUD-17 | P2 | Невидимые Easter egg buttons принимают pointer | подтверждено в Firefox и коде |
| AUD-18 | P2 | Promo claim нельзя доказательно проверить | подтверждено в клиентской логике |
| AUD-19 | P2 | Не сохранена GitHub Pages domain verification TXT | подтверждено authoritative DNS |
| AUD-20 | P3 | `security.txt` не содержит обязательный `Expires` | подтверждено по RFC 9116 |
| AUD-21 | P3 | GitHub не распознаёт security policy репозитория | подтверждено GitHub API |
| AUD-22 | P3 | Apex-домен не имеет IPv6 `AAAA` | подтверждено authoritative DNS |
| AUD-23 | P2 | Запрет AI-training не отражён в crawler policy | подтверждено |
| AUD-24 | P2 | Все 378 sitemap `lastmod` устарели | подтверждено source/live |
| AUD-25 | P2 | Social cards перекрывают текст и не локализованы | подтверждено визуально |
| AUD-26 | P3 | RSS теряет историю и использует ложные permalink GUID | подтверждено |
| AUD-27 | P3 | PWA manifest возвращает локализованных пользователей на EN | подтверждено |
| AUD-28 | P3 | В `scripts.js` остались недостижимые UI-ветки | подтверждено статически |

## Подробные находки

### AUD-01 — шапка не выдерживает 320 px и 200% текста

**Приоритет:** P1  
**Gate:** FAIL  
**Затронуто:** навигация, WCAG 2.2 Reflow и Resize Text

Наблюдение на production:

- при viewport 320 px кнопка меню имела `x=320.583`, ширину 44 px и правую границу `364.583`; видимая часть — 0 px;
- при 340 px видимо около 19.4 px кнопки, при 360 px — около 39.4 px, полностью она помещается только примерно с 375 px;
- `document.documentElement.scrollWidth` оставался равен 320 px, поэтому пользователь не может горизонтально прокрутить страницу до кнопки;
- при увеличении размера текста до 200% и viewport 1280 px блок действий шапки заканчивался на `x=1485`, а кнопка контакта — на `x=1377`, то есть обе выходили за правую границу 1280 px.

Связанный код:

- `site/index.html:252` — кнопка мобильного меню;
- `site/css/base.css:295` — flex-компоновка шапки;
- `site/css/base.css:303` — бренд без переноса;
- `site/css/base.css:421` — действия шапки;
- `site/css/responsive-tablet.css:42` — показ mobile menu toggle.

Риск: пользователь на узком экране не может открыть основную навигацию; при увеличенном тексте теряются интерактивные элементы. Это не только косметика.

Исправление:

1. разрешить центральной части шапки сжиматься через корректные `min-width: 0`, flex-basis и ограничения ширины бренда;
2. на узких экранах скрывать второстепенные действия раньше либо переносить их внутрь меню;
3. гарантировать, что toggle шириной не менее 44 px целиком находится внутри viewport;
4. отдельно проверить 320, 340, 360, 375 и 390 CSS px;
5. повторить проверку при 200% текста без горизонтальной прокрутки и потери функций.

Критерий закрытия: все интерактивные элементы полностью видимы и доступны клавиатурой/указателем на перечисленных ширинах и при 200% текста.

### AUD-02 — выпущенную игру нельзя установить

**Приоритет:** P1  
**Gate:** FAIL для пользовательского/маркетингового пути

`site/games/nature-seed.html:183` сообщает, что Nature Seed выпущена. В CTA на `site/games/nature-seed.html:184-186` доступны только **Download Assets** и **Release Notes**. Ссылки на Google Play, App Store, Steam, itch.io, прямую загрузку или другой подтверждённый канал установки не найдены ни на странице, ни в репозитории.

Риск: пользователь доходит до страницы выпущенной игры, но воронка заканчивается до установки. Это также создаёт противоречие между заявленным статусом и доступным действием.

Исправление — выбрать правдивый вариант:

- добавить проверенную ссылку на фактический магазин/установку и сделать её основным CTA; либо
- если публичного релиза ещё нет, убрать статус **Released** и заменить его фактическим статусом.

Критерий закрытия: основной CTA ведёт на работающую официальную страницу установки, либо текст больше не заявляет публичный релиз.

### AUD-03 — `site/_headers` не влияет на production

**Приоритет:** P1  
**Gate:** CONDITIONAL

В `site/_headers` объявлены CSP, HSTS, `X-Content-Type-Options`, защита от встраивания, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP и cache policy. На ответе production эти правила не обнаружены: GitHub Pages не применяет файл формата Netlify `_headers`.

В `site/index.html:28` есть CSP через `<meta http-equiv>`, что лучше полного отсутствия CSP, но meta-CSP не заменяет response headers. В частности, HSTS работает только как HTTP-заголовок, а директива CSP `frame-ancestors` не поддерживается в meta delivery.

Текущий риск ограничен тем, что сайт статический и не содержит аутентификации, платежей или чувствительных серверных операций. Однако фактическая защита слабее заявленной конфигурацией.

Исправление:

1. применять заголовки на реально обслуживающем edge/CDN или перейти на хостинг, который поддерживает их;
2. оставить meta-CSP как дополнительный слой, но не считать её заменой response CSP;
3. добавить post-deploy проверку `curl -sSI https://willowinworlds.com/`;
4. падать в CI, если обязательные заголовки отсутствуют;
5. проверять политику после каждого изменения хостинга.

Критерий закрытия: реальные production-ответы содержат утверждённый набор заголовков, и это автоматически проверяется после деплоя.

### AUD-04 — публикация не зависит от полного quality gate

**Приоритет:** P1  
**Gate:** FAIL

Наблюдения:

- `.github/workflows/pages.yml:3` запускает публикацию непосредственно на push в ветку `35`;
- checkout в `.github/workflows/pages.yml:22-25` использует изменяемую ссылку на ветку;
- `site-quality.yml` существует отдельно, поэтому его ошибка сама по себе не создаёт зависимости, блокирующей Pages job;
- workflow качества проверяет синтаксис `quality-check.mjs`, но не запускает полный `node site/tools/quality-check.mjs`;
- не найден единый проверенный артефакт, который после gate без пересборки передаётся в deployment;
- post-deploy smoke test и проверка заголовков отсутствуют;
- concurrency-защита публикации не подтверждена.

Риск: production может получить commit или артефакт, который не прошёл тот же набор проверок, на основании которого принимается решение о релизе.

Исправление:

1. объединить quality и deploy в один workflow либо сделать deploy явным зависимым job через `needs`;
2. checkout и artifact provenance привязать к `${{ github.sha }}`;
3. выполнить полный `node site/tools/quality-check.mjs`, CSS audit, sitemap check и необходимые browser smoke tests до upload;
4. публиковать ровно тот артефакт, который был проверен;
5. добавить `concurrency` для production;
6. после deploy проверить 200/301/404, canonical, security headers и ключевой пользовательский сценарий;
7. включить branch protection/ruleset по AUD-15 и требовать этот gate до изменения production-ветки.

Критерий закрытия: невозможно опубликовать SHA, который не прошёл обязательный gate; production smoke test фиксирует точный SHA.

### AUD-05 — доменная почта не используется, но это не объявлено в DNS

**Приоритет:** P1  
**Gate:** CONDITIONAL

Сайт использует `willowinworlds@gmail.com`. На момент проверки у `willowinworlds.com` не обнаружены MX, SPF и DMARC. Получение почты на адреса вида `name@willowinworlds.com` сейчас не настроено, а получатели не получают строгого DNS-сигнала о том, что домен не должен отправлять почту.

Если доменная почта действительно пока не нужна, рекомендуемая защитная конфигурация:

```dns
@       MX   0 .
@       TXT  "v=spf1 -all"
_dmarc  TXT  "v=DMARC1; p=reject; adkim=s; aspf=s"
```

**Важное ограничение:** перед подключением любого почтового сервиса Null MX и SPF `-all` нужно заменить настройками выбранного провайдера. Иначе легитимная доменная почта не будет работать. DNS-записи в рамках этого аудита не менялись.

Критерий закрытия: либо опубликована строгая политика «домен не отправляет и не принимает почту», либо настроен реальный провайдер с корректными MX/SPF/DKIM/DMARC и выполнен тест доставки.

### AUD-06 — машинный перевод проходит структуру, но не смысл

**Приоритет:** P2

На русской странице Nature Seed подтверждены неестественные или неверные формулировки:

- `site/ru/games/nature-seed.html:189` — «Розыгрыш» и «потратить ограниченный бюджет строки»;
- `site/ru/games/nature-seed.html:232` — «совершенный удар» и «количество строк» в неподходящем контексте;
- `site/ru/games/nature-seed.html:408` — «государственные активы» вместо смысла public materials/assets.

`site/tools/localize-site.mjs:714-743` использует `translate.googleapis.com` на этапе генерации. Автоматические проверки подтверждают структуру, placeholders и наличие строк, но не семантическую точность.

Не делается вывод, что ошибочны все 42 языковые версии: нативный аудит всех языков не выполнялся. Но подтверждённой выборки достаточно, чтобы не считать локализацию полностью готовой.

Исправление:

- завести утверждённый glossary для терминов игр, релиза и press kit;
- вручную вычитать RU и другие приоритетные рынки;
- хранить проверенные overrides, чтобы генератор не перезаписывал правки;
- добавить выборочные semantic review cases в release checklist.

### AUD-07 — видимое имя бренда осталось в единственном числе

**Приоритет:** P2

Несмотря на домен и новое имя `WillowinWorlds`, в видимой шапке и подвале всё ещё выводится `WillowinWorld`:

- `site/index.html:230`;
- `site/index.html:776`.

При этом title/aria-контекст уже использует множественное число. Несоответствие видно пользователю и воспроизводится на сгенерированных локалях.

Исправление: изменить единый источник шаблона/бренда на `WillowinWorlds`, регенерировать локали и добавить проверку, запрещающую старое видимое имя. Исторические упоминания в changelog не нужно менять.

### AUD-08 — внутренние ссылки создают дубли `index.html`; старый домен не перенаправляет

**Приоритет:** P2

Наблюдения:

- `https://willowinworlds.com/index.html` и `/ru/index.html` возвращают 200 вместо редиректа на slash URL;
- canonical у страниц корректно указывает предпочтительный URL;
- языковой переключатель и часть генерации используют пути с `index.html`;
- локальный `site/_redirects` не исполняется GitHub Pages;
- прежний домен `willowinworld.com` не имеет A/AAAA/CNAME и не разрешается.

Canonical снижает SEO-риск дублей, поэтому это не P1. Но внутренние ссылки должны сразу вести на канонические URL, чтобы не тратить crawl signals и не создавать несколько адресов одной страницы.

Старый домен является риском миграции только если он раньше был публичным, индексировался или использовался в материалах. Это исторически не подтверждено текущим аудитом. Если использовался, нужен долгосрочный 301 с каждой старой страницы на соответствующий новый URL.

### AUD-09 — actions закреплены на изменяемых major tags

**Приоритет:** P2

GitHub Actions в workflow используют теги major-версий, а не полные commit SHA. Это обычная и удобная конфигурация, но она слабее строгой supply-chain политики: содержимое тега может измениться без изменения файла workflow.

Исправление:

- закрепить сторонние actions по полному SHA и рядом оставить комментарий с версией;
- настроить контролируемые обновления;
- задать минимальные явные `permissions` каждому workflow;
- включить branch protection по AUD-15; environment approval и MFA проверить отдельно.

Сканирование секретов по всей Git-истории не выполнялось; targeted scan рабочего дерева явных ключей или токенов не нашёл.

### AUD-10 — skip link мешает смешанному keyboard/pointer сценарию

**Приоритет:** P2

На ширине 390 px после первого нажатия Tab ссылка перехода к содержимому появляется по центру сверху и остаётся сфокусированной. При попытке сразу нажать pointer-ом кнопку темы она перекрывает область клика; browser automation зафиксировал, что `.skip-link` перехватывает pointer events.

Код: `site/css/base.css:205-220`.

Сам skip link нужен и корректно является первым keyboard target. Исправлять нужно только геометрию/слой: размещать его так, чтобы он не перекрывал независимые действия шапки, либо корректно убирать после смены способа ввода без потери keyboard-доступности.

### AUD-11 — контактная форма не отправляет письмо внутри сайта

**Приоритет:** P3 / известное ограничение

Подтверждено:

- адрес на production — `willowinworlds@gmail.com`;
- диалог получает фокус, пустая отправка переводит фокус в обязательное поле Name;
- текст можно скопировать; status region сообщает «Contact message copied»;
- Escape закрывает диалог и возвращает фокус на кнопку;
- черновик сохраняется в `sessionStorage`.

Форма создаёт `mailto:`, поэтому фактическая отправка зависит от настроенного почтового клиента пользователя. Сайт не получает сообщение напрямую и не может подтвердить доставку. Это раскрыто в интерфейсе и имеет copy fallback, поэтому не классифицировано как P1.

Реальное письмо в Gmail во время аудита не отправлялось. Доставка, spam placement, длинные Unicode-сообщения и поведение разных mail clients — NOT EVALUATED.

### AUD-12 — minified output не является deploy artifact

**Приоритет:** P3

`node site/tools/build-minified.mjs` проходит, но Pages workflow загружает исходный каталог `site`, а не проверенный `site/dist`. Каталоги `site/dist` и `site/reports` игнорируются Git и отсутствуют в чистом checkout, поэтому они не раздувают production. На production запросы к `/dist/index.html` и `/reports/visual/index-desktop.png` вернули 404.

Это не текущий performance-блокер: CDN сжимает ответы, а измеренный lab-срез приемлем. Но сборка и публикация должны иметь одну понятную модель — либо deploy проверенного dist, либо удалить ложное ожидание, что dist используется.

### AUD-13 — свежесть части devlog-контента

**Приоритет:** P3

У трёх игр последние заметные обновления датированы 2026-07-31 при дате аудита 2026-11-10. Это не техническая ошибка. Если devlog должен демонстрировать активную разработку, стоит определить реальный cadence и не обещать частоту, которую команда не поддерживает.

### AUD-14 — старый неработающий email остался в PL/TR/TT

**Приоритет:** P1  
**Gate:** FAIL для контактного пути

Основной сайт уже использует `willowinworlds@gmail.com`, но переводы содержат старые доменные адреса:

- `site/tools/locales/pl.json:464` — `kontakt@willowinworlds.com`;
- `site/tools/locales/tr.json:464` — `Contact@willowinworlds.com`;
- `site/tools/locales/tt.json:464` — `Contact@willowinworlds.com`;
- `site/tools/locales/tt.json:1599` и `site/tt/index.html:746` — `контакт@willowinworlds.com` в FAQ.

Те же значения подтверждены на production в `pl/tr/tt/i18n-runtime.js` и на татарской главной. Они появляются как fallback при ошибке копирования; татарский FAQ показывает старый адрес постоянно. MX для домена отсутствует, поэтому сообщение на эти адреса не дойдёт.

Исправление:

1. заменить значения переводов на `willowinworlds@gmail.com`;
2. регенерировать PL/TR/TT runtime и HTML;
3. добавить quality check, запрещающий любые `@willowinworlds.com` в locale sources и public artifact, пока доменная почта не настроена;
4. проверить production через поиск по опубликованным HTML/JS.

Критерий закрытия: в public artifact нет ни одного адреса `@willowinworlds.com`, а все контактные сценарии указывают Gmail.

### AUD-15 — production-ветка `35` не защищена

**Приоритет:** P1  
**Gate:** FAIL

`.github/workflows/pages.yml:3-6` публикует каждый push в `35`. Публичный GitHub Branch API на 2026-11-11 вернул:

```json
{"name":"35","protected":false,"sha":"5ac8791555899269422bd987d43d3e5cea8b9622"}
```

Repository Rulesets API вернул пустой список `[]`. Это отдельная проблема от AUD-04: даже после улучшения workflow прямой push в production-ветку останется возможным без PR, review и required checks.

Исправление:

- создать ruleset для `35`;
- запретить direct push, force push и удаление ветки;
- требовать PR, review и успешный `Site Quality`;
- ограничить actors, которым разрешён production push;
- отдельно проверить environment approvals и default `GITHUB_TOKEN` permissions.

Критерий закрытия: API показывает активную защиту/ruleset, а безопасный тестовый direct push отклоняется до запуска deploy.

### AUD-16 — build tools и raw locale JSON опубликованы как часть сайта

**Приоритет:** P3

Pages workflow загружает весь `./site` (`.github/workflows/pages.yml:30-33`). Внутри `site/tools` находятся 53 файла общим размером около 8.6 MiB. Production отдаёт их напрямую:

- `/tools/quality-check.mjs` — 200;
- `/tools/localize-site.mjs` — 200, около 70 KiB;
- `/tools/locales/ru.json` — 200, около 255 KiB;
- `/_headers` и `/_redirects` — 200 как обычные файлы, хотя GitHub Pages их не применяет.

Явных секретов в этих файлах не найдено, поэтому это не классифицируется как уязвимость. Но deployment boundary включает внутренние генераторы, проверки и исходные словари, увеличивая артефакт и публичную поверхность без пользовательской функции.

Исправление: публиковать whitelist/dist-артефакт без `tools`, `reports`, неисполняемых hosting-конфигов и source-only файлов. Проверять отрицательный список post-deploy запросами, не полагаясь только на `.gitignore`.

### AUD-17 — невидимые Easter egg buttons кликабельны при выключенном Magic hunt

**Приоритет:** P2

`site/scripts.js:1740-1766` создаёт кнопки `.secret-glint`, устанавливает `tabIndex=-1` и `aria-hidden=true`, но оставляет click handler. `site/css/site-sections.css:940-1001` делает их прозрачными через `opacity:0`, однако не задаёт `pointer-events:none`; обычный `:hover` снова делает кнопку видимой. `collectSecret()` на `site/scripts.js:1693` не проверяет, включён ли `promo-hunt-active`.

В одной production-сессии Firefox наблюдались 13 прозрачных зон 46×46 px с computed `pointer-events:auto`. Playwright успешно нажал одну из них при выключенном Magic hunt. Такая кнопка вызывает `preventDefault`, `stopPropagation`, отмечает букву найденной и показывает toast.

Риск: случайный pointer/hover в пустой на вид области запускает скрытый сценарий и потенциально перехватывает клик по расположенному под ним содержимому.

Исправление:

- по умолчанию `.secret-glint { pointer-events: none; }`;
- включать `pointer-events:auto` только внутри `body.promo-hunt-active`;
- добавить guard в `collectSecret()`;
- проверить, что выключенный режим не оставляет focusable/clickable/hover targets.

### AUD-18 — promo claim нельзя доказательно проверить

**Приоритет:** P2  
**Gate:** CONDITIONAL до решения владельца акции

`site/scripts.js:193-225` обещает: «Promo codes are issued manually ... after a claim review». Claim ID создаётся полностью в браузере на `site/scripts.js:1641-1655` из timestamp и `Math.random()`, нигде не сохраняется и не подписывается. Любой человек может сформировать идентичный `mailto:` без прохождения hidden-word сценария.

В `legal.html`, `asset-usage.html` и privacy-тексте не найдены правила акции: платформа кода, количество, срок, страны/возраст, критерии выдачи, обработка claim email и порядок отказа не определены. Для части игр также нет публичного канала установки.

Риск: claim review не способен технически доказать прохождение сценария; возможны злоупотребления и ожидание награды, которую невозможно активировать.

Исправление — выбрать один вариант:

- если промокод имеет реальную ценность, опубликовать краткие правила, назначить owner/inventory/expiry и использовать проверяемое доказательство claim; либо
- сохранить статический сайт и переименовать действие в необязательный Easter egg/contact request без обещания промокода.

### AUD-19 — отсутствует постоянная GitHub Pages domain verification TXT

**Приоритет:** P2

Оба authoritative NS не вернули TXT для `_github-pages-challenge-mrexavius.willowinworlds.com`. GitHub рекомендует верифицировать custom domain и сохранять выданную TXT-запись, чтобы другой GitHub-пользователь не смог привязать домен после удаления репозитория, отключения Pages или иного unlink-события.

Это не означает, что домен сейчас захвачен: production работает, а authenticated-статус GitHub Settings не проверялся. Подтверждено именно отсутствие постоянного DNS-доказательства.

Исправление: выполнить GitHub Settings → Pages → Add/Verify domain, опубликовать точное выданное значение TXT и не удалять запись после появления статуса **Verified**.

### AUD-20 — `security.txt` не содержит обязательный `Expires`

**Приоритет:** P3

`site/.well-known/security.txt:1-4` и production-файл содержат `Contact`, `Preferred-Languages`, `Canonical` и `Policy`, но не `Expires`. RFC 9116 §2.5.5 требует ровно одно поле `Expires`; рекомендуемое значение — менее года в будущем. Локальный `site/tools/security-check.mjs:124` проверяет только контакт.

Исправление: добавить RFC3339 `Expires`, автоматическую проверку единственности и будущей даты, а также регулярное обновление до истечения срока.

### AUD-21 — GitHub не распознаёт security policy репозитория

**Приоритет:** P3

Политика находится в `site/SECURITY.md` и доступна посетителям сайта, но GitHub Community Profile API возвращает `files.security:null`. Для GitHub каноническая policy должна находиться в `.github/SECURITY.md`, корне или `docs/`.

Риск: исследователь в GitHub Security tab не видит ожидаемый маршрут сообщения и может открыть публичный issue.

Исправление: сделать `.github/SECURITY.md` либо корневой `SECURITY.md` каноническим, генерировать website-копию из него и отдельно включить private vulnerability reporting.

### AUD-22 — apex-домен не имеет IPv6 `AAAA`

**Приоритет:** P3

Оба authoritative NS вернули пустой ответ для `AAAA willowinworlds.com`; `curl -6` не смог разрешить host. GitHub Pages поддерживает четыре IPv6-адреса для apex и рекомендует сохранять `A` вместе с `AAAA`.

Риск ограничен IPv6-only клиентами без DNS64/NAT64. Обычный IPv4-доступ работает.

Исправление: после сверки с актуальной GitHub документацией добавить все четыре текущих Pages `AAAA`, не удаляя `A`, затем проверить HTTPS по IPv6. DNSSEC уже включён, поэтому изменение должно сохранять валидную подписанную цепочку.

### AUD-23 — запрет AI-training не отражён в crawler policy

**Приоритет:** P2

`site/asset-usage.html:52` и `site/legal.html:51` явно запрещают использовать ассеты для обучения AI/ML. Но `site/robots.txt:39-43` разрешает весь публичный сайт всем неуказанным ботам. Отдельно перечислены search/retrieval agents, но отсутствуют training controls для `GPTBot`, `ClaudeBot` и `Google-Extended`.

`robots.txt` сам по себе не выдаёт лицензию и не отменяет legal notice. Проблема в другом: compliant training crawlers не получают машиночитаемый сигнал, совпадающий с опубликованной политикой владельца.

Исправление после решения владельца scope:

- запретить training bots как минимум на `/assets/`, если запрет относится только к ассетам;
- использовать `Disallow: /`, если запрет должен охватывать весь public content;
- сохранить доступ `OAI-SearchBot`, `Claude-SearchBot` и user-requested agents, если нужна search discoverability.

Критерий закрытия: production `robots.txt` различает training и search/retrieval use cases; фактические crawler logs остаются NOT EVALUATED.

### AUD-24 — все 378 sitemap `lastmod` устарели после значимого commit

**Приоритет:** P2

Commit `5ac8791` изменил 378 public HTML-файлов, включая contact links и structured data, но не изменил `site/sitemap.xml`. Сейчас в sitemap находятся только:

- 7 записей с `2026-07-31`;
- 371 запись с `2026-09-10`.

Например, production `/games/candy-shop.html` и `/ru/games/candy-shop.html` имеют HTTP `Last-Modified: Tue, 10 Nov 2026 12:21:14 GMT`, а sitemap сообщает соответственно `2026-07-31` и `2026-09-10`.

Root cause:

- `site/tools/localize-site.mjs:1084-1089` записывает всем локалям одну константу;
- `site/tools/localization-config.mjs:3` фиксирует её как `2026-09-10`;
- English home/game dates в `site/tools/devlog-data.mjs:192-198` зависят только от devlog.

Google учитывает `lastmod`, только если он стабильно и проверяемо точен; изменение main content, structured data или links считается значимым. Текущий сигнал может быть проигнорирован. Ranking/crawl effect не измерен.

Исправление: вычислять per-URL дату последнего значимого изменения и падать в CI, если изменённый public HTML/structured data/link contract не обновил соответствующую sitemap entry.

### AUD-25 — social cards перекрывают текст и не локализованы

**Приоритет:** P2

Пять файлов `site/assets/og/*-1200x630.webp` имеют правильный размер 1200×630, но визуально собраны неверно:

- правый artwork перекрывает subtitle во всех пяти cards;
- на generic card artwork перекрывает конец большого заголовка;
- нижняя подпись всё ещё говорит `WillowinWorld` без финальной `s`;
- 41 локаль получает те же изображения со встроенным английским текстом.

Использование по 378 indexable pages: generic card — 210 страниц, каждая из четырёх game cards — 42 страницы. Метатеги локализованы, но bitmap copy — нет.

Риск: share preview обрезает ценностное сообщение и продолжает старый бренд. CTR не измерялся.

Исправление: сделать cards без встроенного текста либо перенести весь текст в гарантированную safe area; для локалей использовать универсальный text-free artwork или реальные localized variants. Проверить EN/RU/JA через preview tools целевых платформ.

### AUD-26 — RSS теряет историю и объявляет несуществующие permalink GUID

**Приоритет:** P3

В public game pages имеется 5 датированных `data-devlog-entry`, но `rss.xml` содержит 4 items. `site/tools/devlog-data.mjs:129-133` берёт только первую, самую новую запись каждой игры, поэтому более старая запись Nature Seed исчезает из feed.

Кроме того, `site/tools/devlog-data.mjs:216-217` создаёт GUID вида `#devlog-2026-09-10`, а HTML содержит только общий `id="devlog"`. В RSS 2.0 отсутствующий `isPermaLink` по умолчанию равен `true`, поэтому reader вправе считать несуществующий fragment открываемым permalink.

Исправление:

- дать каждой записи стабильный `id="devlog-YYYY-MM-DD"`;
- сохранять согласованную историю/window, а не только один item на игру;
- направлять `link` и GUID на существующий anchor либо использовать opaque GUID с `isPermaLink="false"`.

### AUD-27 — PWA manifest сбрасывает локаль на English

**Приоритет:** P3

`site/manifest.webmanifest` валиден, а все три icon path и четыре shortcut URL существуют. Но один общий manifest подключён к 378 indexable pages, включая 369 неанглийских. В нём:

- `start_url` равен `/` (`site/manifest.webmanifest:5`);
- description и shortcuts на `:4` и `:30-58` только английские;
- locale-specific start URL отсутствует.

В браузерах, использующих manifest при установке/сохранении сайта как приложения, запуск из RU/AR/другой локали возвращает английскую главную и показывает английские shortcuts.

Исправление: либо генерировать locale-specific manifest со своим `start_url`, `lang`, `dir` и shortcut labels, либо честно считать PWA English-only и не подключать manifest к неподдерживаемым локалям. Offline-режим сайт не обещает и в этой находке не оценивается.

### AUD-28 — в `scripts.js` есть недостижимые UI-ветки

**Приоритет:** P3

`site/scripts.js:13-19` ищет `magicState`, `qualityState`, `modePill`, `pauseMagic`, `lowMotion` и `disableMagic`; `site/scripts.js:2031` подписывает `[data-play]` на `startPlayMode()`. Ни один public HTML-файл не содержит эти IDs или `data-play`.

При этом play-mode и control-state ветки остаются распределены по canvas runtime, включая `startPlayMode()` на `site/scripts.js:1392`. Текущий ambient canvas работает, но эти состояния невозможно запустить через shipped UI и невозможно проверить как пользовательский сценарий.

Исправление: либо вернуть намеренные controls с keyboard/accessibility contract и browser tests, либо удалить недостижимые ветки. Не оставлять optional feature-код без владельца и entry point.

## Что подтверждено положительно

### Функциональность и доступность маршрутов

- production главная загрузилась с правильным title и без ошибок/предупреждений консоли;
- 46 из 46 запросов главной получили 200;
- `http://willowinworlds.com` делает один 301 на HTTPS;
- `https://www.willowinworlds.com` делает один 301 на основной apex-домен;
- неизвестный URL возвращает настоящий HTTP 404 и пользовательскую страницу `404 — Catch the Lost Stars | WillowinWorlds`;
- фильтр игр работает и объявляет результат «Showing 3 puzzle games.»;
- skip link является первым Tab target;
- контактный modal имеет роль диалога, фокус, required validation, Escape и возврат фокуса;
- английская, русская и арабская мобильные страницы структурно отрисовались без console errors;
- RTL-макет арабской версии включается;
- Nature Seed, Candy Shop, Paint Blasters, Ball is God?! и press kit не создали document-level horizontal overflow при 320 px (`scrollWidth=320`);
- CSS содержит режимы `prefers-reduced-motion`, reduced data и contrast preferences.

Это не является полной сертификацией WCAG: screen reader и реальная assistive technology не использовались.

### Static quality checks

Проверки запускались на временной копии, чтобы не изменять рабочее дерево:

| Команда | Результат |
|---|---|
| `node site/tools/quality-check.mjs` | PASS |
| `node site/tools/css-coverage-audit.mjs` | PASS |
| `node site/tools/update-sitemap-lastmod.mjs --check` | PASS |
| `node site/tools/build-minified.mjs` | PASS |
| `node site/tools/visual-check.mjs` | PASS |

Эти PASS означают только прохождение реализованных локальных контрактов. Они сами по себе не проверяют устаревшие translated email values, семантику sitemap `lastmod`, RSS permalink, visual overlap social cards или live branch protection. Отдельная проверка GitHub API зафиксирована в AUD-15.

`quality-check.mjs` подтвердил:

- внутренние ссылки;
- 41 локаль × 9 страниц и 1604 локализованные строки;
- синхронизацию devlog, RSS и `llms.txt`;
- SEO-контракт 379 HTML-страниц и 42 языковых маршрутов;
- локальный security baseline.

Visual check в LibreWolf 159.0.1-1 создал 20 контрольных кадров: 10 страниц на 1365×768 и 390×844. В набор вошли главная, press kit, четыре страницы игр, 404, privacy, legal и asset usage.

Дополнительный статический поиск не нашёл:

- пустых `href` или `action`;
- source maps в public tree;
- внешних runtime `script src`;
- runtime `fetch`, XHR или `sendBeacon`;
- явных ключей/токенов в рабочем дереве.

## Производительность

Измерение выполнялось в свежих Playwright Firefox-сессиях без CPU/network throttling. Это ограниченный lab-snapshot, а не Lighthouse и не field Core Web Vitals.

| Запуск | DOMContentLoaded | Load | responseEnd |
|---:|---:|---:|---:|
| 1 | 634 ms | 837 ms | 165 ms |
| 2 | 632 ms | 694 ms | 163 ms |
| 3 | 617 ms | 659 ms | 159 ms |

На каждый запуск: 46 ресурсов, суммарный browser-reported `transferSize` около 943,041 bytes; HTML — около 16,678 bytes.

Пять отдельных curl-навигаций главной:

| Метрика | Значения |
|---|---|
| TTFB | 0.283 / 0.151 / 0.175 / 0.140 / 0.148 s |
| Total | 0.291 / 0.159 / 0.182 / 0.147 / 0.155 s |
| HTML transfer | около 16,378 bytes |

Крупнейшие проверенные исходные файлы:

| Файл | Размер |
|---|---:|
| `site/index.html` | 83,882 bytes |
| `site/scripts.js` | 81,869 bytes |
| `site/css/base.css` | 30,433 bytes |
| `site/css/site-sections.css` | 22,296 bytes |
| `site/css/responsive-mobile.css` | 10,525 bytes |
| hero AVIF | 27,406 bytes |
| sketch WebP | 20,704 bytes |
| logo | 16,430 bytes |

Ответ главной показывал cache policy порядка `max-age=600`. Политики из `_headers` не применялись.

Не измерено:

- LCP, INP и CLS в Chrome UX Report или Search Console;
- Lighthouse mobile с throttling;
- реальные медленные устройства и сети;
- Chromium/WebKit cross-browser profile;
- долгосрочная cache hit ratio.

Поэтому performance gate — CONDITIONAL PASS, а не полный PASS.

## SEO и обнаружение

### Подтверждено

- `robots.txt`, sitemap и публичные страницы отвечают 200;
- sitemap содержит 378 канонических URL; пользовательская 404 в sitemap не входит;
- 379 HTML-файлов охватывают 42 языковых маршрута;
- на каждый URL сформировано 43 hreflang-ссылки: 42 языка плюс `x-default`;
- суммарно в sitemap проверено 16,254 hreflang-связи;
- страницы имеют self-canonical и index/follow;
- JSON-LD валиден в рамках локального контракта;
- статус и дата Nature Seed в structured data совпадают с видимым текстом;
- Google verification TXT был доступен в DNS;
- файл Yandex verification был доступен по публичному URL;
- `llms.txt`, RSS и devlog прошли существующую структурную проверку синхронизации; ограничения RSS описаны в AUD-26.

### Ограничения

- данные Google Search Console не читались;
- coverage, indexing, impressions, clicks и rich-result отчёты не подтверждены;
- analytics отсутствует по дизайну, поэтому конверсия CTA не измеряется;
- отсутствие analytics не является дефектом privacy, но measurement gate остаётся NOT EVALUATED;
- внутренние `index.html` URL требуют нормализации согласно AUD-08.

## Security, privacy и supply chain

### Положительное

- HTTPS включён;
- нет серверной аутентификации, аккаунтов, платежей и базы данных;
- runtime не загружает сторонние JavaScript-библиотеки;
- targeted scan не обнаружил очевидных секретов;
- privacy-текст соответствует наблюдаемому поведению: нет analytics/cookies/backend submission;
- `security.txt` и `SECURITY.md` доступны;
- контактный черновик хранится только в `sessionStorage`;
- DNSSEC включён: RDAP показывает `delegationSigned:true`, authoritative chain содержит DS;
- домен имеет registrar status `client transfer prohibited`;
- Git-история даёт базовую возможность отката статического сайта.

### Не подтверждено

- секреты во всей Git-истории;
- GitHub environment approvals, MFA, collaborators и default `GITHUB_TOKEN` permissions;
- private vulnerability reporting;
- MFA, auto-renew, recovery contacts и zone backup у регистратора;
- фактический rollback drill;
- резервное восстановление DNS и GitHub Pages;
- реальная доставка Gmail;
- spoofing test;
- response headers после edge-изменений.

Security gate остаётся CONDITIONAL до закрытия AUD-03, AUD-04, AUD-05, AUD-15, AUD-19, AUD-20 и AUD-21.

## UX, визуальная система и контент

Сильные стороны:

- единый визуальный язык, читаемая иерархия и понятная карточная структура;
- темы, локали, RTL и responsive preferences встроены без runtime-фреймворка;
- modal и game filters имеют доступные статусы;
- юридические и privacy-страницы легко доступны;
- 404 сохраняет стиль сайта и предлагает выход.

Основные UX-риски:

- потеря навигации на 320 px;
- отсутствие install CTA у выпущенной игры;
- несогласованный бренд `WillowinWorld` / `WillowinWorlds`;
- старый неработающий email в PL/TR/TT;
- перекрытый текст и старый бренд в social cards;
- невидимые pointer targets Easter egg вне активного режима;
- машинные формулировки снижают доверие в локалях;
- `mailto:` зависит от внешнего клиента и не даёт подтверждения отправки.

## План исправлений

### 0–1 день — блокеры

1. Исправить header reflow на 320–390 px и при 200% текста.
2. Убрать перекрытие header со стороны сфокусированного skip link.
3. Заменить старые PL/TR/TT адреса на `willowinworlds@gmail.com`, регенерировать сайт и запретить старый pattern в CI.
4. Защитить production-ветку `35` ruleset-ом с PR/review/required quality checks.
5. Добавить реальный install/store CTA Nature Seed либо исправить статус релиза.
6. Сделать deploy зависимым от полного quality gate и точного `github.sha`.
7. Добавить post-deploy smoke и проверку response headers.
8. Применять защитные заголовки на фактическом CDN/edge.
9. Если доменная почта не используется — после отдельной проверки опубликовать Null MX, SPF `-all` и DMARC reject.
10. Верифицировать custom domain в GitHub Pages и сохранить challenge TXT.

### Следующий цикл

1. Заменить видимый `WillowinWorld` на `WillowinWorlds` в источнике и регенерировать страницы.
2. Перевести внутренние ссылки на канонические slash URL.
3. Если старый домен использовался публично — восстановить его и настроить page-to-page 301.
4. Выполнить нативную вычитку RU, затем приоритетных локалей; закрепить glossary и overrides.
5. Пересобрать пять social cards без перекрытия, старого бренда и locale-dependent bitmap copy.
6. Исправить per-URL sitemap `lastmod` и RSS permalink/history.
7. Согласовать robots training policy с опубликованным запретом на AI-training.
8. Решить судьбу promo hunt: проверяемая акция с правилами либо Easter egg без обещания кода.
9. Закрепить actions по полным SHA и минимизировать workflow permissions.
10. Публиковать whitelist/dist без `site/tools`, `_headers` и `_redirects` как обычных файлов.
11. Добавить `Expires` в `security.txt` и канонический `.github/SECURITY.md`.
12. Исправить pointer gating Easter egg и убрать/восстановить недостижимые UI-controls.

### После стабилизации

1. Провести Chromium, WebKit, screen-reader и real-device regression.
2. Снять Lighthouse mobile и полевые CWV.
3. Проверить Search Console indexing/coverage и sitemap processing.
4. При необходимости аналитики выбрать privacy-aware схему только после явного продуктового решения.
5. Провести rollback/restore drill и зафиксировать короткий runbook.
6. Определить поддерживаемую частоту devlog.
7. Добавить IPv6 `AAAA` и проверить HTTPS по IPv6.
8. Если PWA остаётся продуктовой функцией, сделать locale-specific manifests/start URLs.

## Критерии повторного допуска

Релиз можно перевести из FAIL в PASS только когда подтверждены все пункты:

- [ ] toggle полностью видим и кликабелен на 320, 340, 360, 375 и 390 px;
- [ ] при 200% текста функции шапки не обрезаются и не теряются;
- [ ] keyboard, pointer и смешанный сценарий не конфликтуют со skip link;
- [ ] Nature Seed имеет правдивый статус и рабочий основной CTA;
- [ ] полный quality gate блокирует deploy;
- [ ] deployment использует точный проверенный SHA/артефакт;
- [ ] production smoke проходит после публикации;
- [ ] response security headers реально присутствуют;
- [ ] DNS mail policy соответствует фактической модели почты;
- [ ] public artifact не содержит старых адресов `@willowinworlds.com`;
- [ ] ветка `35` защищена от direct/force push и требует quality checks;
- [ ] GitHub Pages custom domain имеет сохранённую verification TXT;
- [ ] видимый бренд везде `WillowinWorlds`;
- [ ] social cards не перекрывают текст и не показывают старый бренд;
- [ ] выключенный Magic hunt не оставляет invisible pointer targets;
- [ ] sitemap `lastmod` соответствует значимым изменениям страниц;
- [ ] RSS GUID ведут на существующие anchors либо помечены `isPermaLink="false"`;
- [ ] приоритетные локали прошли человеческую проверку;
- [ ] не появилось новых console/network ошибок.

## Команды для воспроизведения

```bash
git -C /home/mrexavius/Documents/GitHub/WillowinWorld status --short --branch
git -C /home/mrexavius/Documents/GitHub/WillowinWorld rev-parse HEAD

node site/tools/quality-check.mjs
node site/tools/css-coverage-audit.mjs
node site/tools/update-sitemap-lastmod.mjs --check
node site/tools/build-minified.mjs
node site/tools/visual-check.mjs

curl -sSI https://willowinworlds.com/
curl -sSI http://willowinworlds.com/
curl -sSI https://www.willowinworlds.com/
curl -sSI https://willowinworlds.com/not-a-real-page-audit
curl -sS https://willowinworlds.com/.well-known/security.txt
curl -sSI https://willowinworlds.com/tools/localize-site.mjs

curl -sS https://api.github.com/repos/MrExavius/WillowinWorld/branches/35
curl -sS https://api.github.com/repos/MrExavius/WillowinWorld/rulesets
curl -sS https://api.github.com/repos/MrExavius/WillowinWorld/community/profile

dig willowinworlds.com MX +short
dig willowinworlds.com TXT +short
dig _dmarc.willowinworlds.com TXT +short
dig @launch1.spaceship.net TXT _github-pages-challenge-mrexavius.willowinworlds.com +short
dig @launch1.spaceship.net AAAA willowinworlds.com +short

rg -n -i '@willowinworlds\.com' site --glob '!dist/**' --glob '!reports/**'
rg -o '<lastmod>[^<]+' site/sitemap.xml | sort | uniq -c
rg -o '<item>' site/rss.xml | wc -l
rg -o 'data-devlog-entry' site/games/*.html | wc -l
```

Browser-проверки должны выполняться отдельными свежими сессиями на production и локальной копии, с фиксацией viewport, zoom/text size, console, network и DOM geometry.

Дополнение 2026-11-11 использовало только публичные GitHub API, authoritative DNS, RDAP, production URL и официальную документацию. Аутентифицированные настройки, платные сервисы и intrusive scans не использовались.

## Границы аудита

Этот документ не подтверждает:

- юридическое соответствие конкретной юрисдикции;
- полную WCAG 2.2 AA-сертификацию;
- безопасность GitHub/регистратора без доступа к настройкам аккаунтов;
- GitHub MFA, collaborators, environment approvals и private vulnerability reporting;
- фактический account-level статус custom-domain verification, хотя challenge TXT в DNS отсутствует;
- доставляемость Gmail без отправки реальных писем;
- позиции в поиске и данные Search Console;
- качество всех 42 языков;
- полевые Core Web Vitals;
- отсутствие секретов во всей истории репозитория;
- фактические crawler logs и соблюдение robots policy каждым AI-провайдером;
- наличие, количество, стоимость и правила выдачи реальных promo codes;
- social preview и CTR на каждой целевой платформе;
- PWA install/launch на всех браузерах;
- работоспособность на всех браузерах и реальных устройствах.

Отсутствие доказательств в этих областях обозначено как NOT EVALUATED, а не как PASS.

## Основные файлы-доказательства

- `.github/workflows/pages.yml`
- `.github/workflows/site-quality.yml`
- `site/index.html`
- `site/games/nature-seed.html`
- `site/ru/games/nature-seed.html`
- `site/tools/locales/pl.json`
- `site/tools/locales/tr.json`
- `site/tools/locales/tt.json`
- `site/css/base.css`
- `site/css/responsive-tablet.css`
- `site/css/responsive-mobile.css`
- `site/css/responsive-preferences.css`
- `site/scripts.js`
- `site/_headers`
- `site/_redirects`
- `site/robots.txt`
- `site/sitemap.xml`
- `site/rss.xml`
- `site/manifest.webmanifest`
- `site/.well-known/security.txt`
- `site/SECURITY.md`
- `site/legal.html`
- `site/asset-usage.html`
- `site/assets/og/*-1200x630.webp`
- `site/tools/quality-check.mjs`
- `site/tools/localize-site.mjs`
- `site/tools/localization-config.mjs`
- `site/tools/devlog-data.mjs`

## Нормативные ссылки

- W3C WCAG 2.2 — Reflow: <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>
- W3C WCAG 2.2 — Resize Text: <https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html>
- W3C CSP Level 3 — meta element: <https://www.w3.org/TR/CSP3/#meta-element>
- RFC 6797 — HTTP Strict Transport Security: <https://www.rfc-editor.org/rfc/rfc6797>
- RFC 7505 — Null MX: <https://www.rfc-editor.org/rfc/rfc7505>
- RFC 7208 — SPF: <https://www.rfc-editor.org/rfc/rfc7208>
- RFC 7489 — DMARC: <https://www.rfc-editor.org/rfc/rfc7489>
- RFC 9116 — `security.txt`: <https://www.rfc-editor.org/rfc/rfc9116>
- RSS 2.0 — GUID/permalink semantics: <https://www.rssboard.org/rss-specification>
- GitHub — hardening GitHub Actions: <https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#using-third-party-actions>
- GitHub — verifying a custom domain for Pages: <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages>
- GitHub — managing Pages DNS and IPv6: <https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site>
- GitHub — repository rulesets: <https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets>
- Google Search Central — sitemap `lastmod`: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- OpenAI crawler controls: <https://developers.openai.com/api/docs/bots.md>
- Anthropic crawler controls: <https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler>
- Google `Google-Extended`: <https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended>

---

Аудит фиксирует состояние указанного commit и production на даты основного среза и дополнения. Код сайта и внешние настройки в рамках этой работы не изменялись.
