import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import {
  alternateLinks,
  localizationLastModified,
  localizedPages,
  locales,
  outputFile,
  pageUrl,
  siteOrigin,
  sourceLocale,
  translatedLocales
} from "./localization-config.mjs";
import { gameDevlogSources, loadLatestDevlogs } from "./devlog-data.mjs";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const translationRoot = join(siteRoot, "tools", "locales");
const translateMissing = process.argv.includes("--translate");
const checkOnly = process.argv.includes("--check");
const refreshLocales = new Set((process.argv.find(argument => argument.startsWith("--refresh="))?.split("=")[1] || "").split(",").filter(Boolean));
const batchSize = 20;
const translationConcurrency = 4;
const translationRetries = 4;
const nonLatinLocaleCodes = new Set([
  "ar", "hy", "bn", "bg", "zh-hans", "zh-hant", "el", "he", "hi", "ja", "ko", "fa", "kk", "ru", "th", "tt", "uk", "ur"
]);

const alternateStart = "<!-- locale-alternates:start -->";
const alternateEnd = "<!-- locale-alternates:end -->";
const switcherStart = "<!-- locale-switcher:start -->";
const switcherEnd = "<!-- locale-switcher:end -->";
const sitemapStart = "<!-- localized-pages:start -->";
const sitemapEnd = "<!-- localized-pages:end -->";

const metaTranslationKeys = new Set([
  "description",
  "og:title",
  "og:description",
  "og:image:alt",
  "twitter:title",
  "twitter:description",
  "twitter:image:alt"
]);

const translatableAttributes = new Set(["aria-label", "aria-description", "title", "placeholder", "alt"]);
const structuredDataSkippedKeys = new Set([
  "@context",
  "@type",
  "@id",
  "url",
  "item",
  "image",
  "logo",
  "email",
  "dateModified",
  "mainEntityOfPage",
  "itemListOrder",
  "numberOfItems",
  "position"
]);

const protectedExactText = new Set([
  "WillowinWorld",
  "Nature Seed",
  "Candy Shop",
  "Paint Blasters",
  "Ball is God?!",
  "Ball is God",
  "Espa",
  "Water Drop",
  "Seed",
  "Miras",
  "Revla",
  "Shash",
  "Shish",
  "Shush",
  "Lurya",
  "Vladus",
  "Luren",
  "Don Yagon",
  "Hah",
  "Hih",
  "Varon",
  "Goga",
  "Khleya",
  "White",
  "Susya",
  "Heh",
  "Frisha",
  "Gigo",
  "Giga",
  "Askold",
  "Musya",
  "Kuren",
  "Dusya",
  "Ena",
  "Dyo",
  "Tria",
  "Tessera",
  "Pente",
  "Eksi",
  "Epta",
  "Ohto",
  "Ennea",
  "Deka",
  "Zetun",
  "Candy Book",
  "Match-3",
  "Unity",
  "WebP",
  "UI/UX",
  "HUD",
  "VFX",
  "PanelOver",
  "illo",
  "w",
  "in",
  "orld",
  "OAI-SearchBot",
  "PerplexityBot",
  "Claude-SearchBot",
  "ChatGPT-User",
  "Perplexity-User",
  "Claude-User"
]);

const manualTranslationOverrides = Object.freeze({
  hy: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Ինդի շարժական գլուխկոտրուկների և արկադային խաղերի ստուդիա",
    "Physics Puzzle / Arcade Hybrid": "Ֆիզիկական գլուխկոտրուկ / արկադային հիբրիդ"
  }),
  cs: Object.freeze({
    "Hardcore Vertical Descent Arcade": "Hardcore arkáda s vertikálním sestupem"
  }),
  da: Object.freeze({
    "Hardcore Vertical Descent Arcade": "Hardcore arkadespil med lodret nedstigning",
    "Spotlight · Nature Seed release": "Fokus · Nature Seed-udgivelse",
    "WillowinWorld - Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld - Uafhængigt studie for mobile puzzle- og arkadespil",
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Uafhængigt studie for mobile puzzle- og arkadespil"
  }),
  nl: Object.freeze({
    "Open Nature Seed devlog": "Open het devlog van Nature Seed",
    "Open Candy Shop devlog": "Open het devlog van Candy Shop",
    "Open Paint Blasters devlog": "Open het devlog van Paint Blasters",
    "Open Ball is God?! devlog": "Open het devlog van Ball is God?!"
  }),
  fil: Object.freeze({
    "Ball is God Development Build": "Bersiyon para sa pagbuo ng Ball is God",
    "Night Magic / Daylight": "Mahikang Gabi / Liwanag ng Araw",
    "Spotlight · Nature Seed release": "Tampok · Paglabas ng Nature Seed",
    "Prototype": "Prototipo",
    "First prototype": "Unang prototipo",
    "Released": "Inilabas",
    "Polish": "Pagpapakinis",
    "Live Care": "Patuloy na suporta",
    "Latest dev notes,": "Pinakabagong tala sa pagbuo,",
    "no digging.": "nang hindi na naghahanap.",
    "Level 2 restoration and stability pass": "Pagpapanumbalik ng Level 2 at pagpapahusay ng katatagan",
    "Production menu and HUD pass": "Pagpapahusay sa production menu at HUD",
    "Physics and effect stability pass": "Pagpapahusay sa katatagan ng pisika at mga epekto",
    "Clear draft": "Burahin ang draft",
    "Descent cleared": "Nakumpleto ang pagbaba",
    "Production state": "Kalagayan ng produksyon"
  }),
  fi: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Riippumaton mobiilipulma- ja arcadepelistudio",
    "Color Destruction Physics Puzzle": "Värintuhoon perustuva fysiikkapulma",
    "Hardcore Vertical Descent Arcade": "Haastava pystysuoran laskeutumisen arcadepeli",
    "Night Magic / Daylight": "Yön taika / Päivänvalo"
  }),
  hu: Object.freeze({
    "Hardcore Vertical Descent Arcade": "Nehéz függőleges ereszkedésű arcade",
    "Night Magic / Daylight": "Éjszakai varázs / Nappali fény"
  }),
  hi: Object.freeze({
    "Showing {count}: {filter}": "{filter} श्रेणी में {count} गेम दिखाए जा रहे हैं"
  }),
  ja: Object.freeze({
    "Polish": "仕上げ",
    "Live Care": "継続運用",
    "Latest dev notes,": "最新の開発情報を、",
    "no digging.": "探す手間なく。",
    "Level 2 restoration and stability pass": "レベル2の復元と安定性改善",
    "Production menu and HUD pass": "本番用メニューとHUDの改善",
    "Physics and effect stability pass": "物理挙動とエフェクトの安定性改善",
    "Clear draft": "下書きを消去",
    "Descent cleared": "降下クリア",
    "Player character": "プレイヤーキャラクター",
    "Production state": "制作状況"
  }),
  no: Object.freeze({
    "Ball is God?! - Hardcore Vertical Descent Arcade Game": "Ball is God?! - Hardcore arkadespill med vertikal nedstigning",
    "Ball is God?! | Vertical Descent Tower Arcade Game": "Ball is God?! | Arkadespill med roterende tårn og vertikal nedstigning",
    "Candy Shop - Cozy Candy Merge Puzzle Game": "Candy Shop - Koselig puslespill med sammenslåing av godteri",
    "Hardcore Vertical Descent Arcade": "Hardcore arkadespill med vertikal nedstigning",
    "Paint Blasters - Color Destruction Physics Puzzle Game": "Paint Blasters - Fysikkpuslespill med fargeødeleggelse",
    "Spotlight · Nature Seed release": "I fokus · Nature Seed-lansering",
    "WillowinWorld - Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld - Uavhengig studio for mobile pusle- og arkadespill",
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Uavhengig studio for mobile pusle- og arkadespill"
  }),
  ro: Object.freeze({
    "Ball is God?! - Hardcore Vertical Descent Arcade Game": "Ball is God?! - Joc arcade hardcore cu coborâre verticală",
    "Cozy Physics Merge Puzzle": "Puzzle relaxant de fizică și combinare",
    "Hardcore Vertical Descent Arcade": "Arcade hardcore cu coborâre verticală",
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Studio indie de jocuri mobile puzzle și arcade"
  }),
  ru: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Инди-студия мобильных головоломок и аркад",
    "Nature Seed | Relaxing Draw-to-Solve Physics Puzzle Game": "Nature Seed | Уютная физическая головоломка с рисованием",
    "Nature Seed is a released draw-to-solve physics puzzle from WillowinWorld. Released on 10 September 2026, it reunites Water Drop and Seed across 10 levels.": "Nature Seed — вышедшая физическая головоломка от WillowinWorld: игра вышла 10 сентября 2026 года и соединяет Water Drop и Seed на 10 уровнях.",
    "Candy Shop | Cozy Candy Merge Puzzle Game for Mobile": "Candy Shop | Уютная мобильная головоломка со слиянием сладостей",
    "Paint Blasters | Color-Mixing Physics Puzzle Arcade": "Paint Blasters | Аркадная физическая головоломка о смешении цветов",
    "Ball is God?! | Vertical Descent Tower Arcade Game": "Ball is God?! | Аркада с вращением башни и вертикальным спуском",
    "WillowinWorld Press Kit | Game Facts, Assets & Contact": "Пресс-кит WillowinWorld | Игры, материалы и контакты",
    "Indie mobile game studio": "Инди-студия мобильных игр",
    "Small games. Living worlds.": "Небольшие игры. Живые миры.",
    "Tactile puzzle and arcade games where every draw, drop, shot and fall changes the world.": "Тактильные головоломки и аркады, где каждый штрих, бросок, выстрел и падение меняют мир.",
    "Explore games": "Смотреть игры",
    "Contact studio": "Связаться со студией",
    "Request updates": "Следить за обновлениями",
    "Press kit": "Пресс-кит",
    "Current spotlight: Nature Seed restoration preview": "В центре внимания: восстановление мира Nature Seed",
    "Current spotlight · Draw-to-Solve": "В центре внимания · Рисуй и решай",
    "Spotlight · Nature Seed release": "В центре · Релиз Nature Seed",
    "Connect": "Соединить",
    "Bloom": "Расцвет",
    "Nature Seed is a released mobile draw-to-solve physics puzzle about spending a limited line budget to bring Water Drop and Seed together. Released on 10 September 2026, its 10 launch levels connect physical strokes, efficiency stars, persistent progress and watercolor restoration.": "Nature Seed — вышедшая мобильная физическая головоломка: рисуйте путь с ограниченным запасом чернил, чтобы соединить Water Drop и Seed. Игра вышла 10 сентября 2026 года под названием Nature Seed; 10 стартовых уровней объединяют физические линии, рейтинг эффективности, постоянный прогресс и восстановление акварельного мира.",
    "Nature Seed is a released mobile draw-to-solve puzzle about drawing limited lines that become physical objects. Released on 10 September 2026, its ten launch levels ask players to bring Water Drop and Seed together, then improve the route for a better efficiency rating.": "Nature Seed — вышедшая мобильная головоломка, где ограниченные линии становятся физическими объектами. Игра вышла 10 сентября 2026 года; десять стартовых уровней предлагают соединить Water Drop и Seed, а затем улучшить маршрут ради более высокой оценки эффективности.",
    "Released 10 September 2026 as Nature Seed. The launch build contains 10 levels, line-efficiency stars, persistent progress and stable physical line generation.": "Выпущено 10 сентября 2026 г. как Nature Seed. Стартовая сборка содержит 10 уровней, звезды эффективности линий, постоянный прогресс и стабильное физическое создание линий.",
    "The game released under the title Nature Seed with ten launch levels, line-efficiency stars, persistent progress and watercolor restoration rewards.": "Игра вышла под названием Nature Seed с десятью стартовыми уровнями, звездами за эффективность линии, постоянным прогрессом и наградами за восстановление акварельного мира.",
    "Nature Seed launched under its final title with 10 handcrafted levels, line-efficiency stars, persistent progress and watercolor restoration rewards.": "Nature Seed вышла под финальным названием с 10 вручную созданными уровнями, звездами за эффективность линии, постоянным прогрессом и наградами за восстановление акварельного мира.",
    "Four worlds. One touch away.": "Четыре мира. Одно касание — и вы внутри.",
    "Draw physical paths, merge candy, build color shots or rotate a divine tower. Each game begins with one readable mobile action.": "Рисуйте физические пути, объединяйте сладости, собирайте цветные выстрелы или вращайте божественную башню. В основе каждой игры — одно понятное мобильное действие.",
    "One action. One living world.": "Одно действие. Целый живой мир.",
    "Each game starts with one touch rule—draw, drop, mix or dodge—then adds character, clear feedback and consequences players can read without a manual.": "Каждая игра начинается с одного жеста — нарисовать, бросить, смешать или уклониться, — а затем раскрывается через характер, ясную обратную связь и понятные без инструкции последствия.",
    "Playful Interaction": "Живое взаимодействие",
    "Mobile-first UX": "Мобильный UX с первого дня",
    "Satisfying Feedback": "Выразительная обратная связь",
    "Cozy Depth": "Уют с глубиной",
    "2D Art Direction": "Выразительный 2D-стиль",
    "Living Worlds": "Живые миры",
    "Systems with charm, weight and replayability.": "Системы с характером, весом и реиграбельностью.",
    "A small studio for tactile mobile worlds.": "Небольшая студия живых мобильных миров.",
    "From first hook": "От первой идеи",
    "to polished mobile release.": "до отполированного мобильного релиза.",
    "Feel Test": "Проверка ощущений",
    "Polish": "Полировка",
    "Live Care": "Поддержка после релиза",
    "Latest dev notes,": "Последние обновления —",
    "no digging.": "сразу по делу.",
    "Level 2 restoration and stability pass": "Восстановление уровня 2 и повышение стабильности",
    "Production menu and HUD pass": "Обновление меню и HUD",
    "Physics and effect stability pass": "Стабилизация физики и эффектов",
    "The newest dated note from each game page, grounded in the playable systems now inside the Unity builds.": "Свежая датированная запись по каждой игре — только о системах, которые уже работают в текущих Unity-сборках.",
    "Quick answers for players, press and publishers.": "Короткие ответы для игроков, прессы и издателей.",
    "Talk to WillowinWorld.": "Поговорите с WillowinWorld.",
    "Draw a path. Bring them together.": "Нарисуйте путь. Соедините их.",
    "The line is not decoration. It becomes the puzzle.": "Линия — не украшение. Она становится частью головоломки.",
    "Drop sweets. Build bigger treats.": "Бросайте сладости. Собирайте всё более крупные угощения.",
    "Every container rewrites the puzzle.": "Каждый контейнер меняет правила головоломки.",
    "Mix three colors. Break the tower.": "Смешайте три цвета. Разрушьте башню.",
    "The recipe decides the shot.": "Рецепт определяет выстрел.",
    "Rotate the tower. Become the impact.": "Вращайте башню. Сами станьте ударом.",
    "Studio home": "Главная студии",
    "UI + Cast": "Интерфейс + Персонажи",
    "Drop": "Падение",
    "Dodge": "Уклониться",
    "Decide": "Выбор",
    "Active Production · Ten Locations": "В активной разработке · Десять локаций",
    "Build status": "Статус версии",
    "Active production": "В активной разработке",
    "Magic hunt": "Охота за магией",
    "End magic hunt": "Завершить охоту за магией",
    "Enable Magic": "Включить магию",
    "Hidden promo letter": "Скрытая промо-буква",
    "Hidden promo letter {letter}": "Скрытая промо-буква {letter}",
    "Karma changes more than the dialogue.": "Карма меняет не только диалоги.",
    "The descent now has a face before the first drop.": "У спуска появилось лицо ещё до первого падения.",
    "Nature Seed press and creator assets": "Материалы Nature Seed для прессы и авторов",
    "Candy Shop press and creator assets": "Материалы Candy Shop для прессы и авторов",
    "Paint Blasters press and creator assets": "Материалы Paint Blasters для прессы и авторов",
    "Ball is God?! press and creator assets": "Материалы Ball is God?! для прессы и авторов"
  }),
  es: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Estudio indie de juegos móviles de puzles y arcade",
    "Nature Seed | Relaxing Draw-to-Solve Physics Puzzle Game": "Nature Seed | Relajante puzle de física para dibujar y resolver",
    "Candy Shop | Cozy Candy Merge Puzzle Game for Mobile": "Candy Shop | Acogedor puzle móvil de fusión de dulces",
    "Paint Blasters | Color-Mixing Physics Puzzle Arcade": "Paint Blasters | Puzle arcade de física y mezcla de colores",
    "Ball is God?! | Vertical Descent Tower Arcade Game": "Ball is God?! | Arcade de descenso vertical y torre giratoria",
    "WillowinWorld Press Kit | Game Facts, Assets & Contact": "Kit de prensa de WillowinWorld | Juegos, recursos y contacto",
    "Indie mobile game studio": "Estudio indie de juegos móviles",
    "Small games. Living worlds.": "Juegos pequeños. Mundos vivos.",
    "Tactile puzzle and arcade games where every draw, drop, shot and fall changes the world.": "Puzles y arcades táctiles donde cada trazo, caída, disparo y descenso transforma el mundo.",
    "Explore games": "Explorar juegos",
    "Contact studio": "Contactar con el estudio",
    "Request updates": "Seguir las novedades",
    "Press kit": "Kit de prensa",
    "Current spotlight · Draw-to-Solve": "En portada · Dibuja para resolver",
    "Spotlight · Nature Seed release": "En portada · Lanzamiento de Nature Seed",
    "Nature Seed is a released mobile draw-to-solve physics puzzle about spending a limited line budget to bring Water Drop and Seed together. Released on 10 September 2026, its 10 launch levels connect physical strokes, efficiency stars, persistent progress and watercolor restoration.": "Nature Seed es un puzle de física para móviles ya lanzado: dibuja un camino con tinta limitada para reunir a Water Drop y Seed. Lanzado el 10 de septiembre de 2026, sus 10 niveles iniciales combinan trazos físicos, estrellas de eficiencia, progreso persistente y restauración en acuarela.",
    "Four worlds. One touch away.": "Cuatro mundos. A un solo toque.",
    "Draw physical paths, merge candy, build color shots or rotate a divine tower. Each game begins with one readable mobile action.": "Traza caminos físicos, fusiona dulces, crea disparos de color o gira una torre divina. Cada juego nace de una acción móvil clara.",
    "One action. One living world.": "Una acción. Todo un mundo vivo.",
    "Each game starts with one touch rule—draw, drop, mix or dodge—then adds character, clear feedback and consequences players can read without a manual.": "Cada juego parte de un gesto —dibujar, soltar, mezclar o esquivar— y suma personalidad, respuesta clara y consecuencias que se entienden sin manual.",
    "Playful Interaction": "Interacción viva",
    "Mobile-first UX": "UX móvil desde el inicio",
    "Satisfying Feedback": "Respuesta satisfactoria",
    "Cozy Depth": "Profundidad acogedora",
    "2D Art Direction": "Dirección artística 2D",
    "Living Worlds": "Mundos vivos",
    "Systems with charm, weight and replayability.": "Sistemas con encanto, peso y rejugabilidad.",
    "A small studio for tactile mobile worlds.": "Un pequeño estudio de mundos móviles táctiles.",
    "From first hook": "De la primera idea",
    "to polished mobile release.": "a un lanzamiento móvil pulido.",
    "Feel Test": "Prueba de sensaciones",
    "Polish": "Pulido",
    "Live Care": "Soporte continuo",
    "Latest dev notes,": "Últimas novedades de desarrollo,",
    "no digging.": "sin rodeos.",
    "Level 2 restoration and stability pass": "Restauración del nivel 2 y mejoras de estabilidad",
    "Production menu and HUD pass": "Actualización del menú y el HUD",
    "Physics and effect stability pass": "Mejoras de estabilidad en físicas y efectos",
    "The newest dated note from each game page, grounded in the playable systems now inside the Unity builds.": "La actualización fechada más reciente de cada juego, basada en sistemas que ya funcionan dentro de las builds de Unity.",
    "Quick answers for players, press and publishers.": "Respuestas rápidas para jugadores, prensa y editoras.",
    "Talk to WillowinWorld.": "Habla con WillowinWorld.",
    "Draw a path. Bring them together.": "Traza un camino. Reúne a los dos.",
    "The line is not decoration. It becomes the puzzle.": "La línea no adorna: se convierte en el puzle.",
    "Drop sweets. Build bigger treats.": "Suelta dulces. Crea delicias más grandes.",
    "Every container rewrites the puzzle.": "Cada recipiente cambia las reglas del puzle.",
    "Mix three colors. Break the tower.": "Mezcla tres colores. Derriba la torre.",
    "The recipe decides the shot.": "La receta define el disparo.",
    "Rotate the tower. Become the impact.": "Gira la torre. Conviértete en el impacto.",
    "Studio home": "Inicio del estudio",
    "Drop": "Caer",
    "Dodge": "Esquivar",
    "Decide": "Decidir",
    "Active Production · Ten Locations": "En desarrollo activo · Diez localizaciones",
    "Build status": "Estado de la versión",
    "Active production": "En desarrollo activo",
    "Karma changes more than the dialogue.": "El karma cambia mucho más que los diálogos.",
    "The descent now has a face before the first drop.": "El descenso ya tiene rostro antes de la primera caída.",
    "Nature Seed press and creator assets": "Recursos de Nature Seed para prensa y creadores",
    "Candy Shop press and creator assets": "Recursos de Candy Shop para prensa y creadores",
    "Paint Blasters press and creator assets": "Recursos de Paint Blasters para prensa y creadores",
    "Ball is God?! press and creator assets": "Recursos de Ball is God?! para prensa y creadores"
  }),
  pt: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Estúdio indie de jogos mobile de quebra-cabeça e arcade",
    "Nature Seed | Relaxing Draw-to-Solve Physics Puzzle Game": "Nature Seed | Quebra-cabeça relaxante de física e desenho",
    "Candy Shop | Cozy Candy Merge Puzzle Game for Mobile": "Candy Shop | Quebra-cabeça mobile de combinar doces",
    "Paint Blasters | Color-Mixing Physics Puzzle Arcade": "Paint Blasters | Arcade de física e mistura de cores",
    "Ball is God?! | Vertical Descent Tower Arcade Game": "Ball is God?! | Arcade de descida vertical e torre giratória",
    "WillowinWorld Press Kit | Game Facts, Assets & Contact": "Kit de imprensa WillowinWorld | Jogos, materiais e contato",
    "Indie mobile game studio": "Estúdio indie de jogos mobile",
    "Small games. Living worlds.": "Pequenos jogos. Mundos vivos.",
    "Tactile puzzle and arcade games where every draw, drop, shot and fall changes the world.": "Quebra-cabeças e arcades táteis em que cada traço, queda, disparo e descida transforma o mundo.",
    "Explore games": "Explorar jogos",
    "Contact studio": "Falar com o estúdio",
    "Request updates": "Acompanhar novidades",
    "Press kit": "Kit de imprensa",
    "Current spotlight · Draw-to-Solve": "Em destaque · Desenhe para resolver",
    "Spotlight · Nature Seed release": "Em destaque · Lançamento de Nature Seed",
    "Nature Seed is a released mobile draw-to-solve physics puzzle about spending a limited line budget to bring Water Drop and Seed together. Released on 10 September 2026, its 10 launch levels connect physical strokes, efficiency stars, persistent progress and watercolor restoration.": "Nature Seed é um quebra-cabeça de física para dispositivos móveis já lançado: desenhe um caminho com tinta limitada para unir Water Drop e Seed. Lançado em 10 de setembro de 2026, seus 10 níveis iniciais combinam traços físicos, estrelas de eficiência, progresso persistente e restauração em aquarela.",
    "Four worlds. One touch away.": "Quatro mundos. A um toque de distância.",
    "Draw physical paths, merge candy, build color shots or rotate a divine tower. Each game begins with one readable mobile action.": "Desenhe caminhos físicos, combine doces, monte disparos coloridos ou gire uma torre divina. Cada jogo começa com uma ação mobile fácil de entender.",
    "One action. One living world.": "Uma ação. Um mundo inteiro vivo.",
    "Each game starts with one touch rule—draw, drop, mix or dodge—then adds character, clear feedback and consequences players can read without a manual.": "Cada jogo parte de um gesto — desenhar, soltar, misturar ou desviar — e acrescenta personalidade, resposta clara e consequências que dispensam manual.",
    "Playful Interaction": "Interação viva",
    "Mobile-first UX": "UX mobile desde o início",
    "Satisfying Feedback": "Resposta satisfatória",
    "Cozy Depth": "Profundidade aconchegante",
    "2D Art Direction": "Direção de arte 2D",
    "Living Worlds": "Mundos vivos",
    "Systems with charm, weight and replayability.": "Sistemas com charme, peso e rejogabilidade.",
    "A small studio for tactile mobile worlds.": "Um pequeno estúdio de mundos mobile táteis.",
    "From first hook": "Da primeira ideia",
    "to polished mobile release.": "ao lançamento mobile refinado.",
    "Feel Test": "Teste de sensação",
    "Polish": "Polimento",
    "Live Care": "Suporte contínuo",
    "Latest dev notes,": "Últimas notas de desenvolvimento,",
    "no digging.": "sem enrolação.",
    "Level 2 restoration and stability pass": "Restauração do nível 2 e melhorias de estabilidade",
    "Production menu and HUD pass": "Atualização do menu e do HUD",
    "Physics and effect stability pass": "Melhorias de estabilidade na física e nos efeitos",
    "The newest dated note from each game page, grounded in the playable systems now inside the Unity builds.": "A atualização mais recente de cada jogo, baseada em sistemas que já funcionam nas builds atuais de Unity.",
    "Quick answers for players, press and publishers.": "Respostas rápidas para jogadores, imprensa e publishers.",
    "Talk to WillowinWorld.": "Fale com a WillowinWorld.",
    "Draw a path. Bring them together.": "Desenhe um caminho. Una os dois.",
    "The line is not decoration. It becomes the puzzle.": "A linha não é enfeite: ela se torna parte do quebra-cabeça.",
    "Drop sweets. Build bigger treats.": "Solte doces. Crie delícias maiores.",
    "Every container rewrites the puzzle.": "Cada recipiente muda as regras do quebra-cabeça.",
    "Mix three colors. Break the tower.": "Misture três cores. Derrube a torre.",
    "The recipe decides the shot.": "A receita define o disparo.",
    "Rotate the tower. Become the impact.": "Gire a torre. Torne-se o impacto.",
    "Studio home": "Início do estúdio",
    "Drop": "Cair",
    "Dodge": "Desviar",
    "Decide": "Decidir",
    "Active Production · Ten Locations": "Em desenvolvimento ativo · Dez locais",
    "Build status": "Estado da versão",
    "Active production": "Em desenvolvimento ativo",
    "Karma changes more than the dialogue.": "O karma muda muito mais que os diálogos.",
    "The descent now has a face before the first drop.": "A descida agora tem um rosto antes da primeira queda.",
    "Nature Seed press and creator assets": "Materiais de Nature Seed para imprensa e criadores",
    "Candy Shop press and creator assets": "Materiais de Candy Shop para imprensa e criadores",
    "Paint Blasters press and creator assets": "Materiais de Paint Blasters para imprensa e criadores",
    "Ball is God?! press and creator assets": "Materiais de Ball is God?! para imprensa e criadores"
  }),
  de: Object.freeze({
    "Nature Seed is a released draw-to-solve physics puzzle from WillowinWorld. Released on 10 September 2026, it reunites Water Drop and Seed across 10 levels.": "Nature Seed ist ein veröffentlichtes Physikrätsel von WillowinWorld. Es erschien am 10. September 2026 und vereint Water Drop und Seed in 10 Levels.",
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Indie-Studio für mobile Puzzle- und Arcade-Spiele",
    "Hardcore Vertical Descent Arcade": "Hardcore-Arcade mit vertikalem Abstieg"
  }),
  ar: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | استوديو مستقل لألعاب الألغاز والأركيد على الهاتف",
    "Canonical English source": "المصدر الإنجليزي الأساسي"
  }),
  fa: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | استودیوی مستقل بازی‌های پازل و آرکید موبایل"
  }),
  kk: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Мобильді басқатырғыштар мен аркада ойындарының тәуелсіз студиясы"
  }),
  ms: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Studio Bebas Permainan Teka-teki dan Arked Mudah Alih"
  }),
  sw: Object.freeze({
    "WillowinWorld | Indie Mobile Puzzle & Arcade Game Studio": "WillowinWorld | Studio Huru ya Michezo ya Simu ya Mafumbo na Arcade"
  }),
  sv: Object.freeze({
    "Spotlight · Nature Seed release": "Fokus · Nature Seed-lansering"
  })
});

const explicitRuntimeStrings = Object.freeze([
  "Language",
  "Choose language",
  "Showing {count}: {filter}",
  "Hidden letters: {found}/{total}",
  "Static",
  "Play",
  "Paused",
  "Low",
  "Ambient",
  "Auto",
  "Night Magic",
  "Daylight",
  "Resume Magic",
  "Pause Magic",
  "Full Magic",
  "Low Motion",
  "Enable Magic",
  "Disable Magic",
  "A star path awakened.",
  "Magic unlocked",
  "Request Promo Code",
  "A hidden portal answered.",
  "End magic hunt",
  "Magic hunt",
  "Hidden promo letter",
  "Hidden promo letter {letter}",
  "Close menu",
  "Open menu",
  "Hidden letters are awake.",
  "Magic hunt paused.",
  "Email draft requested. If it did not open, use Copy message.",
  "Contact message copied.",
  "Copy was blocked. Use contact@willowinworld.com.",
  "Draft saved in this browser tab.",
  "Draft stays in this browser tab while you work.",
  "Draft is available until this page closes.",
  "Draft restored from this browser tab.",
  "Draft cleared. New text will save in this tab.",
  "Switch to light theme",
  "Switch to dark theme",
  "WillowinWorld is an independent mobile game studio creating four physics-led puzzle and arcade games with tactile controls, readable systems and expressive 2D worlds.",
  "Site language",
  "Canonical English source",
  "Games",
  "Genres",
  "Current status",
  "Latest development notes",
  "Published",
  "Studio and press",
  "Studio home",
  "Press kit",
  "Media asset usage",
  "Feeds and policies",
  "Devlog RSS feed",
  "XML sitemap",
  "Language index",
  "Privacy policy",
  "Legal notice",
  "Contact",
  "Email WillowinWorld",
  ...gameDevlogSources.flatMap(game => [game.status, game.machineSummary, ...game.genres])
]);

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&mdash;", "—")
    .replaceAll("&ndash;", "–");
}

function encodeHtml(value, attribute = false) {
  let encoded = String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  if (attribute) encoded = encoded.replaceAll("\"", "&quot;");
  return encoded;
}

function normalizedText(value) {
  return decodeHtml(value).replace(/\s+/g, " ").trim();
}

function mailtoTextFields(value) {
  if (!/^mailto:/i.test(value || "")) return [];
  try {
    const url = new URL(decodeHtml(value));
    return ["subject", "body"]
      .map(key => url.searchParams.get(key))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function localizeMailto(value, translations) {
  if (!/^mailto:/i.test(value || "")) return value;
  try {
    const url = new URL(decodeHtml(value));
    for (const key of ["subject", "body"]) {
      const current = url.searchParams.get(key);
      if (!current) continue;
      const translated = translations[normalizedText(current)];
      if (translated) url.searchParams.set(key, translated);
    }
    return encodeHtml(url.href, true);
  } catch {
    return value;
  }
}

function shouldTranslate(value) {
  const text = normalizedText(value);
  if (!text || protectedExactText.has(text)) return false;
  if (!/\p{L}/u.test(text)) return false;
  if (/^(?:https?:\/\/|mailto:|tel:|data:)/i.test(text)) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return false;
  if (/^[\w.-]+\.(?:html|webp|avif|png|jpg|jpeg|svg|xml|txt|css|js)$/i.test(text)) return false;
  if (/^(?:#[\w-]+|[A-Z0-9]{1,4})$/.test(text)) return false;
  return true;
}

function stripGeneratedBlocks(html) {
  return html
    .replace(new RegExp(`\\s*${alternateStart}[\\s\\S]*?${alternateEnd}`, "g"), "")
    .replace(new RegExp(`\\s*${switcherStart}[\\s\\S]*?${switcherEnd}`, "g"), "")
    .replace(/\s*<meta\b[^>]*http-equiv=["']content-language["'][^>]*>/gi, "");
}

function pageSourceHash(pageSources) {
  const hash = createHash("sha256");
  for (const page of localizedPages) hash.update(page.file).update("\0").update(pageSources.get(page.file)).update("\0");
  return hash.digest("hex");
}

function collectStructuredStrings(value, parentKey, result) {
  if (Array.isArray(value)) {
    value.forEach(item => collectStructuredStrings(item, parentKey, result));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (structuredDataSkippedKeys.has(key)) continue;
    if (typeof child === "string") {
      if (shouldTranslate(child)) result.add(normalizedText(child));
    } else {
      collectStructuredStrings(child, key || parentKey, result);
    }
  }
}

function collectStrings(html) {
  const result = new Set();
  let visible = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (script, content) => {
    if (/type=["']application\/ld\+json["']/i.test(script)) {
      try {
        collectStructuredStrings(JSON.parse(content), "", result);
      } catch (error) {
        throw new Error(`Invalid JSON-LD while collecting translations: ${error.message}`);
      }
    }
    return "";
  });
  visible = visible
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "");

  for (const match of visible.matchAll(/>\s*([^<>]*?\p{L}[^<>]*?)\s*</gu)) {
    if (shouldTranslate(match[1])) result.add(normalizedText(match[1]));
  }

  for (const tag of visible.match(/<[^>]+>/g) || []) {
    if (/^<meta\b/i.test(tag)) {
      const key = tag.match(/\b(?:name|property)=(["'])([\s\S]*?)\1/i)?.[2]?.toLowerCase();
      const content = tag.match(/\bcontent=(["'])([\s\S]*?)\1/i)?.[2];
      if (key && metaTranslationKeys.has(key) && content && shouldTranslate(content)) {
        result.add(normalizedText(content));
      }
    }
    for (const [, name, , value] of tag.matchAll(/\b([\w-]+)=(["'])([\s\S]*?)\2/g)) {
      if (name.toLowerCase() === "href") {
        mailtoTextFields(value).forEach(field => {
          if (shouldTranslate(field)) result.add(normalizedText(field));
        });
      }
      if (translatableAttributes.has(name.toLowerCase()) && shouldTranslate(value)) {
        result.add(normalizedText(value));
      }
    }
  }
  return result;
}

async function collectRuntimeStrings() {
  const result = new Set(explicitRuntimeStrings);
  const source = await readFile(join(siteRoot, "scripts.js"), "utf8");
  const start = source.indexOf("const gameProfiles =");
  const end = source.indexOf("const sectionSecretSpots =", start);
  if (start < 0 || end < 0) throw new Error("scripts.js: unable to locate game profile localization block");
  const block = source.slice(start, end);
  for (const match of block.matchAll(/"((?:\\.|[^"\\])*)"/g)) {
    const value = JSON.parse(`"${match[1]}"`);
    if (value && /\p{L}/u.test(value) && !protectedExactText.has(value)) result.add(value);
  }
  return result;
}

async function readTranslationMemory(locale, sourceHash) {
  const path = join(translationRoot, `${locale.code}.json`);
  try {
    const parsed = JSON.parse(await readFile(path, "utf8"));
    return {
      path,
      locale: locale.code,
      sourceHash,
      translations: parsed && typeof parsed.translations === "object" ? parsed.translations : {}
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return { path, locale: locale.code, sourceHash, translations: {} };
  }
}

function protectedTermPattern(term, flags = "u") {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, flags);
}

function protectTerms(value) {
  const replacements = [];
  let protectedValue = value;
  for (const placeholder of new Set(value.match(/\{[^{}]+\}/g) || [])) {
    const token = `__W${replacements.length}__`;
    protectedValue = protectedValue.replaceAll(placeholder, token);
    replacements.push({ token, term: placeholder });
  }
  const exactOnlyFragments = new Set(["illo", "w", "in", "orld"]);
  [...protectedExactText]
    .sort((left, right) => right.length - left.length)
    .forEach(term => {
      if (exactOnlyFragments.has(term) && value !== term) return;
      const pattern = protectedTermPattern(term, "gu");
      if (!pattern.test(protectedValue)) return;
      pattern.lastIndex = 0;
      const token = `__W${replacements.length}__`;
      protectedValue = protectedValue.replace(pattern, (match, prefix) => `${prefix}${token}`);
      replacements.push({ token, term });
    });
  return { protectedValue, replacements };
}

function restoreTerms(value, replacements) {
  let restored = value;
  replacements.forEach(({ token, term }) => {
    const tokenIndex = token.match(/\d+/)?.[0];
    const tolerantToken = tokenIndex ? new RegExp(`__\\s*W\\s*${tokenIndex}\\s*__`, "gi") : null;
    restored = tolerantToken
      ? restored.replace(tolerantToken, term)
      : restored.replaceAll(token, term).replaceAll(token.toLowerCase(), term);
  });
  return restored;
}

function wait(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

async function fetchTranslation(url, attempt = 0) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
    if (response.ok) return response;
    if (attempt >= translationRetries || ![429, 500, 502, 503, 504].includes(response.status)) {
      throw new Error(`Translation endpoint returned ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (attempt >= translationRetries) throw error;
  }
  await wait(500 * (2 ** attempt));
  return fetchTranslation(url, attempt + 1);
}

async function requestTranslations(locale, entries) {
  const protectedEntries = entries.map(entry => ({ ...entry, ...protectTerms(entry.text) }));
  const markerFor = index => `⟦${String(index).padStart(3, "0")}⟧`;
  const singleEntry = protectedEntries.length === 1;
  const query = singleEntry
    ? protectedEntries[0].protectedValue
    : protectedEntries.map((entry, index) => `${markerFor(index)} ${entry.protectedValue}`).join("\n");
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", locale.translateCode || locale.htmlLang || locale.code);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", query);

  const response = await fetchTranslation(url);
  const body = await response.json();
  const combined = Array.isArray(body?.[0]) ? body[0].map(segment => segment?.[0] || "").join("") : "";
  const byId = new Map();
  if (singleEntry && combined.trim()) {
    const entry = protectedEntries[0];
    byId.set(entry.id, restoreTerms(combined.trim(), entry.replacements));
    return byId;
  }
  for (const [entryIndex, entry] of protectedEntries.entries()) {
    const marker = markerFor(entryIndex);
    const start = combined.indexOf(marker);
    if (start < 0) continue;
    const valueStart = start + marker.length;
    const laterMarkers = protectedEntries
      .map((candidate, candidateIndex) => combined.indexOf(markerFor(candidateIndex), valueStart))
      .filter(index => index >= 0);
    const end = laterMarkers.length ? Math.min(...laterMarkers) : combined.length;
    const translated = restoreTerms(combined.slice(valueStart, end).trim(), entry.replacements);
    if (translated) byId.set(entry.id, translated);
  }

  const missing = entries.filter(entry => !byId.get(entry.id));
  if (missing.length && entries.length > 1) {
    for (const entry of missing) {
      const retry = await requestTranslations(locale, [entry]);
      if (retry.get(entry.id)) byId.set(entry.id, retry.get(entry.id));
    }
  }
  const stillMissing = entries.filter(entry => !byId.get(entry.id));
  if (stillMissing.length) throw new Error(`Translation response omitted ${stillMissing.map(entry => entry.id).join(", ")}`);
  return byId;
}

function protectedTermsIn(value) {
  const exactOnlyFragments = new Set(["illo", "w", "in", "orld"]);
  return [...protectedExactText].filter(term => {
    if (exactOnlyFragments.has(term)) return value === term;
    return protectedTermPattern(term).test(value);
  });
}

function containsUnexpectedEnglishRun(locale, translation) {
  if (!nonLatinLocaleCodes.has(locale.code)) return false;
  let candidate = translation;
  const exactOnlyFragments = new Set(["illo", "w", "in", "orld"]);
  for (const term of protectedExactText) {
    if (!exactOnlyFragments.has(term)) candidate = candidate.replace(protectedTermPattern(term, "gu"), "$1 ");
  }
  return /\b[A-Za-z][A-Za-z'-]*(?:\s+[A-Za-z][A-Za-z'-]*){3,}\b/.test(candidate);
}

function translationNeedsRepair(locale, source, translation) {
  if (!translation || typeof translation !== "string") return true;
  if (/WILLOW(?:PROTECTED|PLACEHOLDER)|__W\d+__|⟦|⟧/iu.test(translation)) return true;
  const placeholders = source.match(/\{[^{}]+\}/g) || [];
  if (placeholders.some(placeholder => !translation.includes(placeholder))) return true;
  if (!source.includes("\n") && translation.includes("\n")) return true;
  if (translation === source && source.length >= 24 && source.trim().split(/\s+/).length >= 4) return true;
  if (translation.length > Math.max(160, source.length * 4.5)) return true;
  if (source.length > 24 && translation.length < Math.max(4, source.length * 0.08)) return true;
  if (containsUnexpectedEnglishRun(locale, translation)) return true;
  return protectedTermsIn(source).some(term => !translation.includes(term));
}

async function repairTranslations(locale, memory, requiredStrings) {
  const suspect = [...requiredStrings].filter(source => translationNeedsRepair(locale, source, memory.translations[source]));
  if (!suspect.length) return 0;
  if (!translateMissing) {
    const examples = suspect.slice(0, 3)
      .map(source => `${JSON.stringify(source)} => ${JSON.stringify(memory.translations[source])}`)
      .join("; ");
    throw new Error(`${locale.code}: ${suspect.length} translations need repair (${examples}); run node site/tools/localize-site.mjs --translate`);
  }

  console.log(`${locale.code}: repairing ${suspect.length} translations individually`);
  let completed = 0;
  for (let start = 0; start < suspect.length; start += translationConcurrency) {
    const wave = suspect.slice(start, start + translationConcurrency);
    const translated = await Promise.all(wave.map((source, index) => {
      const entry = { id: `repair_${start + index}`, text: source };
      return requestTranslations(locale, [entry]).then(result => [source, result.get(entry.id)]);
    }));
    translated.forEach(([source, value]) => {
      memory.translations[source] = value;
    });
    completed += translated.length;
    await writeFile(memory.path, `${JSON.stringify({
      locale: locale.code,
      sourceHash: memory.sourceHash,
      translations: memory.translations
    }, null, 2)}\n`);
    if (completed % 40 === 0 || completed === suspect.length) console.log(`${locale.code}: repaired ${completed}/${suspect.length}`);
  }

  const remaining = suspect.filter(source => translationNeedsRepair(locale, source, memory.translations[source]));
  if (remaining.length) {
    const examples = remaining.slice(0, 3).map(source => `${JSON.stringify(source)} => ${JSON.stringify(memory.translations[source])}`).join("; ");
    throw new Error(`${locale.code}: ${remaining.length} translations remain invalid after repair (${examples})`);
  }
  return suspect.length;
}

async function fillMissingTranslations(locale, memory, requiredStrings) {
  const missing = [...requiredStrings].filter(key => !memory.translations[key]);
  if (missing.length && !translateMissing) {
    throw new Error(`${locale.code}: ${missing.length} translations are missing; run node site/tools/localize-site.mjs --translate`);
  }

  if (missing.length) {
    console.log(`${locale.code}: translating ${missing.length} new strings`);
    const batches = [];
    for (let start = 0; start < missing.length; start += batchSize) batches.push(missing.slice(start, start + batchSize));
    let completed = 0;
    for (let start = 0; start < batches.length; start += translationConcurrency) {
      const wave = batches.slice(start, start + translationConcurrency);
      const translatedWaves = await Promise.all(wave.map((batch, waveIndex) => {
        const entries = batch.map((text, index) => ({ id: `s${waveIndex}_${index}`, text }));
        return requestTranslations(locale, entries).then(translated => ({ entries, translated }));
      }));
      translatedWaves.forEach(({ entries, translated }) => {
        entries.forEach(entry => {
          memory.translations[entry.text] = translated.get(entry.id);
        });
        completed += entries.length;
      });
      console.log(`${locale.code}: ${completed}/${missing.length}`);
      await writeFile(memory.path, `${JSON.stringify({
        locale: locale.code,
        sourceHash: memory.sourceHash,
        translations: memory.translations
      }, null, 2)}\n`);
    }
  }
  const repaired = await repairTranslations(locale, memory, requiredStrings);
  return missing.length > 0 || repaired > 0;
}

function translateValue(value, translations, attribute = false) {
  const key = normalizedText(value);
  const translated = translations[key];
  if (!translated) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  return `${leading}${encodeHtml(translated, attribute)}${trailing}`;
}

function translateStructuredValue(value, key, translations) {
  if (Array.isArray(value)) return value.map(item => translateStructuredValue(item, key, translations));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [
      childKey,
      structuredDataSkippedKeys.has(childKey) ? child : translateStructuredValue(child, childKey, translations)
    ]));
  }
  if (typeof value === "string" && !structuredDataSkippedKeys.has(key) && translations[normalizedText(value)]) {
    return translations[normalizedText(value)];
  }
  return value;
}

function localizeStructuredUrls(value, locale, key = "") {
  if (Array.isArray(value)) return value.map(item => localizeStructuredUrls(item, locale, key));
  if (value && typeof value === "object") {
    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    const isOrganization = types.includes("Organization");
    return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [
      childKey,
      isOrganization && childKey === "url" ? child : localizeStructuredUrls(child, locale, childKey)
    ]));
  }
  if (typeof value !== "string" || !value.startsWith(`${siteOrigin}/`)) return value;
  if (value.startsWith(`${siteOrigin}/assets/`) || value === `${siteOrigin}/#studio`) return value;
  const url = new URL(value);
  url.pathname = url.pathname === "/" ? `/${locale.code}/` : `/${locale.code}${url.pathname}`;
  return url.href;
}

function setStructuredLanguage(value, locale) {
  const objects = Array.isArray(value?.["@graph"]) ? value["@graph"] : [value];
  objects.forEach(object => {
    const types = Array.isArray(object?.["@type"]) ? object["@type"] : [object?.["@type"]];
    if (types.some(type => ["WebSite", "WebPage", "VideoGame"].includes(type))) {
      object.inLanguage = locale.htmlLang;
    }
  });
  return value;
}

function translateHtml(html, locale, translations) {
  let output = html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, content) => {
    const parsed = JSON.parse(content);
    let localized = translateStructuredValue(parsed, "", translations);
    localized = localizeStructuredUrls(localized, locale);
    localized = setStructuredLanguage(localized, locale);
    const openTag = script.match(/^<script\b[^>]*>/i)?.[0] || '<script type="application/ld+json">';
    return `${openTag}\n${JSON.stringify(localized, null, 2)}\n</script>`;
  });

  const protectedBlocks = [];
  output = output.replace(/<(?:script|style|svg)\b[^>]*>[\s\S]*?<\/(?:script|style|svg)>/gi, block => {
    const token = `___WILLOW_PROTECTED_${protectedBlocks.length}___`;
    protectedBlocks.push(block);
    return token;
  });

  output = output.replace(/>\s*([^<>]*?\p{L}[^<>]*?)\s*</gu, match => {
    const open = match.indexOf(">") + 1;
    const close = match.lastIndexOf("<");
    return `${match.slice(0, open)}${translateValue(match.slice(open, close), translations)}${match.slice(close)}`;
  });

  output = output.replace(/<[^>]+>/g, tag => {
    if (/^<meta\b/i.test(tag)) {
      const key = tag.match(/\b(?:name|property)=(["'])([\s\S]*?)\1/i)?.[2]?.toLowerCase();
      if (key && metaTranslationKeys.has(key)) {
        tag = tag.replace(/\bcontent=(["'])([\s\S]*?)\1/i, (match, quote, value) => `content=${quote}${translateValue(value, translations, true)}${quote}`);
      }
    }
    return tag.replace(/\b([\w-]+)=(["'])([\s\S]*?)\2/g, (match, name, quote, value) => {
      if (name.toLowerCase() === "href" && /^mailto:/i.test(value)) {
        return `${name}=${quote}${localizeMailto(value, translations)}${quote}`;
      }
      if (!translatableAttributes.has(name.toLowerCase())) return match;
      return `${name}=${quote}${translateValue(value, translations, true)}${quote}`;
    });
  });

  protectedBlocks.forEach((block, index) => {
    output = output.replace(`___WILLOW_PROTECTED_${index}___`, block);
  });
  return output;
}

function renderLanguageSwitcher(locale, page, translations = {}, standalone = false) {
  const links = locales.map(target => {
    const current = target.code === locale.code ? ' aria-current="page"' : "";
    const currentFile = outputFile(locale, page);
    const targetFile = outputFile(target, page);
    const href = relative(dirname(currentFile), targetFile).replaceAll("\\", "/");
    return `<a href="${href}" lang="${target.htmlLang}" hreflang="${target.hreflang}"${current}><span class="language-option-label" dir="auto">${target.label}</span><span class="language-option-code" aria-hidden="true">${target.hreflang}</span></a>`;
  }).join("");
  const navigationLabel = translations.Language || "Language";
  const chooseLabel = translations["Choose language"] || "Choose language";
  const className = standalone ? "language-switcher language-switcher--standalone" : "language-switcher";
  return `${switcherStart}\n  <nav class="${className}" aria-label="${encodeHtml(navigationLabel, true)}"><details><summary aria-label="${encodeHtml(chooseLabel, true)}"><span aria-hidden="true">${locale.shortLabel}</span></summary><div class="language-options">${links}</div></details></nav>\n  ${switcherEnd}`;
}

function addLocaleMetadata(html, locale, page, translations = {}) {
  let output = html
    .replace(/\s*<meta\b[^>]*http-equiv=["']content-language["'][^>]*>/gi, "")
    .replace(/<html\b[^>]*>/i, `<html lang="${locale.htmlLang}" dir="${locale.direction}">`)
    .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${pageUrl(locale, page)}">`)
    .replace(/<meta\b[^>]*property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${pageUrl(locale, page)}">`)
    .replace(/<meta\b[^>]*property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="${locale.ogLocale}">`);

  output = output.replace(/(<meta\b[^>]*charset=["'][^"']+["'][^>]*>)/i, `$1\n  <meta http-equiv="content-language" content="${locale.htmlLang}">`);
  const themeTogglePattern = /(<button\b[^>]*\bid=["']themeToggle["'][^>]*>[\s\S]*?<\/button>)/i;
  if (themeTogglePattern.test(output)) {
    output = output.replace(themeTogglePattern, `$1\n          ${renderLanguageSwitcher(locale, page, translations)}`);
  } else {
    output = output.replace(/(<body\b[^>]*>)/i, `$1\n  ${renderLanguageSwitcher(locale, page, translations, true)}`);
  }
  return output;
}

function rewriteSharedResourceUrls(html, page) {
  const depthPrefix = page.kind === "game" ? "../" : "../";
  const gameSourcePrefix = page.kind === "game" ? "../" : "";
  const sharedRoots = ["assets/", "css/", "motion.css", "scripts.js", "game-theme.js", "favicon.ico", "manifest.webmanifest", "rss.xml", "404.css", "404.js", ".well-known/"];

  function rewriteOne(value) {
    if (!value || /^(?:https?:|mailto:|tel:|data:|blob:|#|\/)/i.test(value)) return value;
    const queryIndex = value.search(/[?#]/);
    const path = queryIndex >= 0 ? value.slice(0, queryIndex) : value;
    const suffix = queryIndex >= 0 ? value.slice(queryIndex) : "";
    if (page.kind === "game") {
      if (sharedRoots.some(root => path.startsWith(`${gameSourcePrefix}${root}`))) return `${depthPrefix}${path}${suffix}`;
      return value;
    }
    if (sharedRoots.some(root => path.startsWith(root))) return `${depthPrefix}${path}${suffix}`;
    if (path === "404.html") return `/404.html${suffix}`;
    return value;
  }

  return html.replace(/\b(href|src|poster|action|data-logo-light|data-logo-dark|srcset|imagesrcset|data-logo-light-srcset|data-logo-dark-srcset)=(["'])([\s\S]*?)\2/gi, (match, name, quote, value) => {
    const localized = /srcset/i.test(name)
      ? value.split(",").map(candidate => {
        const parts = candidate.trim().split(/\s+/);
        parts[0] = rewriteOne(parts[0]);
        return parts.join(" ");
      }).join(", ")
      : rewriteOne(value);
    return `${name}=${quote}${localized}${quote}`;
  });
}

function renderLocalizedPage(source, locale, page, translations) {
  let output = translateHtml(source, locale, translations);
  output = addLocaleMetadata(output, locale, page, translations);
  output = rewriteSharedResourceUrls(output, page);
  const runtimePath = `${page.kind === "game" ? "../i18n-runtime.js" : "i18n-runtime.js"}?v=${localizationLastModified.replaceAll("-", "")}`;
  output = output.replace(/(<\/body>)/i, `  <script src="${runtimePath}"></script>\n$1`);
  return `${output.trim()}\n`;
}

function addStructuredLanguage(html, locale) {
  return html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, (script, content) => {
    const parsed = setStructuredLanguage(JSON.parse(content), locale);
    const openTag = script.match(/^<script\b[^>]*>/i)?.[0] || '<script type="application/ld+json">';
    return `${openTag}\n${JSON.stringify(parsed, null, 2)}\n</script>`;
  });
}

function renderEnglishPage(source, page) {
  return `${addLocaleMetadata(addStructuredLanguage(source, sourceLocale), sourceLocale, page).trim()}\n`;
}

function renderSitemapAlternates(page) {
  return alternateLinks(page)
    .map(link => `    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />`)
    .join("\n");
}

function renderLocalizedSitemap(existing) {
  let clean = existing
    .replace(new RegExp(`\\s*${sitemapStart}[\\s\\S]*?${sitemapEnd}`, "g"), "")
    .replace(/\s*<xhtml:link\b[^>]*\/>/g, "");

  if (!/xmlns:xhtml=/.test(clean)) {
    clean = clean.replace(/(<urlset\b[^>]*)(>)/, `$1\n        xmlns:xhtml="http://www.w3.org/1999/xhtml"$2`);
  }

  for (const page of localizedPages) {
    const canonical = pageUrl(sourceLocale, page);
    const block = (clean.match(/<url>[\s\S]*?<\/url>/g) || [])
      .find(candidate => candidate.includes(`<loc>${canonical}</loc>`));
    if (!block) throw new Error(`sitemap.xml: missing English canonical block for ${canonical}`);
    const enriched = block.replace(/(<loc>[^<]+<\/loc>)/, `$1\n${renderSitemapAlternates(page)}`);
    clean = clean.replace(block, enriched);
  }

  const entries = translatedLocales.flatMap(locale => localizedPages.map(page => [
    "  <url>",
    `    <loc>${pageUrl(locale, page)}</loc>`,
    renderSitemapAlternates(page),
    `    <lastmod>${localizationLastModified}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    "  </url>"
  ].join("\n"))).join("\n");
  return clean.replace(/\s*<\/urlset>\s*$/, `\n  ${sitemapStart}\n${entries}\n  ${sitemapEnd}\n</urlset>\n`);
}

function escapeMarkdown(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}

function localizedPage(locale, file) {
  const page = localizedPages.find(candidate => candidate.file === file);
  if (!page) throw new Error(`Unable to resolve localized page ${file}`);
  return pageUrl(locale, page);
}

function renderLocalizedLlms(locale, translations, updates) {
  const t = source => translations[source] || source;
  const sentence = value => /[.!?。！？]$/.test(value.trim()) ? value.trim() : `${value.trim()}.`;
  const games = gameDevlogSources.map(game => {
    const genres = game.genres.map(genre => escapeMarkdown(t(genre))).join(", ");
    return `- [${escapeMarkdown(game.name)}](${localizedPage(locale, game.file)}): ${escapeMarkdown(t(game.machineSummary))} ${escapeMarkdown(t("Genres"))}: ${genres}. ${escapeMarkdown(t("Current status"))}: ${escapeMarkdown(sentence(t(game.status)))}`;
  }).join("\n");
  const devlogs = [...updates]
    .sort((left, right) => right.timestamp - left.timestamp)
    .map(update => `- [${escapeMarkdown(update.name)} — ${escapeMarkdown(t(update.title))}](${localizedPage(locale, update.file)}#devlog): ${escapeMarkdown(t("Published"))} ${update.published}. ${escapeMarkdown(t(update.summary))}`)
    .join("\n");

  return `# WillowinWorld — ${locale.label}

> ${escapeMarkdown(t("WillowinWorld is an independent mobile game studio creating four physics-led puzzle and arcade games with tactile controls, readable systems and expressive 2D worlds."))}

${escapeMarkdown(t("Site language"))}: ${locale.label}. ${escapeMarkdown(t("Canonical English source"))}: https://willowinworld.com/llms.txt

## ${escapeMarkdown(t("Games"))}

${games}

## ${escapeMarkdown(t("Latest development notes"))}

${devlogs}

## ${escapeMarkdown(t("Studio and press"))}

- [${escapeMarkdown(t("Studio home"))}](${localizedPage(locale, "index.html")})
- [${escapeMarkdown(t("Press kit"))}](${localizedPage(locale, "press-kit.html")})
- [${escapeMarkdown(t("Media asset usage"))}](${localizedPage(locale, "asset-usage.html")})

## ${escapeMarkdown(t("Feeds and policies"))}

- [${escapeMarkdown(t("Devlog RSS feed"))}](${siteOrigin}/rss.xml)
- [${escapeMarkdown(t("XML sitemap"))}](${siteOrigin}/sitemap.xml)
- [${escapeMarkdown(t("Language index"))}](${siteOrigin}/languages.json)
- [${escapeMarkdown(t("Privacy policy"))}](${localizedPage(locale, "privacy.html")})
- [${escapeMarkdown(t("Legal notice"))}](${localizedPage(locale, "legal.html")})

## ${escapeMarkdown(t("Contact"))}

- [${escapeMarkdown(t("Email WillowinWorld"))}](mailto:contact@willowinworld.com)
`;
}

function renderLanguageIndex() {
  return `${JSON.stringify({
    schemaVersion: 1,
    defaultLanguage: sourceLocale.htmlLang,
    lastModified: localizationLastModified,
    languages: locales.map(locale => ({
      code: locale.htmlLang,
      hreflang: locale.hreflang,
      name: locale.label,
      direction: locale.direction,
      home: pageUrl(locale, localizedPages[0]),
      llms: locale.code === sourceLocale.code
        ? `${siteOrigin}/llms.txt`
        : `${siteOrigin}/${locale.code}/llms.txt`
    }))
  }, null, 2)}\n`;
}

function renderRuntimeScript(locale, translations, runtimeStrings) {
  const dictionary = Object.fromEntries([...runtimeStrings]
    .filter(source => translations[source] && translations[source] !== source)
    .sort((left, right) => left.localeCompare(right, "en"))
    .map(source => [source, translations[source]]));
  const filterTranslations = Object.fromEntries(["Arcade", "Puzzle", "Physics", "Cozy"]
    .map(source => [source, translations[source] || source]));
  const labels = {
    showing: translations["Showing {count}: {filter}"] || "Showing {count}: {filter}",
    hidden: translations["Hidden letters: {found}/{total}"] || "Hidden letters: {found}/{total}",
    promoLetter: translations["Hidden promo letter {letter}"] || "Hidden promo letter {letter}"
  };
  return `(() => {
  const dictionary = Object.freeze(${JSON.stringify(dictionary)});
  const filterTranslations = Object.freeze(${JSON.stringify(filterTranslations)});
  const attributes = ["aria-label", "aria-description", "title", "placeholder"];
  const normalize = value => String(value || "").replace(/\\s+/g, " ").trim();
  function translate(value) {
    const normalized = normalize(value);
    if (dictionary[normalized]) return dictionary[normalized];
    let match = normalized.match(/^Hidden letters:\\s*(\\d+)\\/(\\d+)$/i);
    if (match) return ${JSON.stringify(labels.hidden)}.replace("{found}", match[1]).replace("{total}", match[2]);
    match = normalized.match(/^Hidden promo letter\\s+(.+)$/i);
    if (match) return ${JSON.stringify(labels.promoLetter)}.replace("{letter}", match[1]);
    match = normalized.match(/^Showing\\s+(\\d+)\\s+(.+?)\\s+games?\\.?$/i);
    if (match) {
      const filterKey = match[2].charAt(0).toUpperCase() + match[2].slice(1);
      const localizedFilter = filterTranslations[filterKey] || match[2];
      return ${JSON.stringify(labels.showing)}.replace("{count}", match[1]).replace("{filter}", localizedFilter);
    }
    return value;
  }
  function translateTextNode(node) {
    const translated = translate(node.nodeValue);
    if (translated === node.nodeValue) return;
    const leading = node.nodeValue.match(/^\\s*/)?.[0] || "";
    const trailing = node.nodeValue.match(/\\s*$/)?.[0] || "";
    node.nodeValue = leading + translated + trailing;
  }
  function translateElement(element) {
    attributes.forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      const current = element.getAttribute(attribute);
      const translated = translate(current);
      if (translated !== current) element.setAttribute(attribute, translated);
    });
  }
  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateElement(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
      else translateElement(node);
      node = walker.nextNode();
    }
  }
  window.WillowI18n = Object.freeze({ locale: ${JSON.stringify(locale.htmlLang)}, t: translate });
  translateTree(document.body);
  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === "characterData") translateTextNode(record.target);
      if (record.type === "attributes") translateElement(record.target);
      record.addedNodes.forEach(translateTree);
    });
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
})();
`;
}

async function writeIfChanged(path, content) {
  let current = "";
  try {
    current = await readFile(path, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (current === content) return false;
  if (checkOnly) throw new Error(`${path.slice(siteRoot.length)} is stale; run node site/tools/localize-site.mjs`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
  return true;
}

const pageSources = new Map();
const requiredStrings = new Set();
for (const page of localizedPages) {
  const source = stripGeneratedBlocks(await readFile(join(siteRoot, page.file), "utf8"));
  pageSources.set(page.file, source);
  const pageStrings = collectStrings(source);
  pageStrings.forEach(value => requiredStrings.add(value));
}
const runtimeStrings = await collectRuntimeStrings();
runtimeStrings.forEach(value => requiredStrings.add(value));

const sourceHash = pageSourceHash(pageSources);
await mkdir(translationRoot, { recursive: true });
const memories = new Map();
for (const locale of translatedLocales) {
  const memory = await readTranslationMemory(locale, sourceHash);
  if (refreshLocales.has(locale.code)) memory.translations = {};
  for (const [source, translation] of Object.entries(manualTranslationOverrides[locale.code] || {})) {
    if (!requiredStrings.has(source)) throw new Error(`${locale.code}: manual translation override has no source string: ${source}`);
    memory.translations[source] = translation;
  }
  await fillMissingTranslations(locale, memory, requiredStrings);
  for (const [source, translation] of Object.entries(manualTranslationOverrides[locale.code] || {})) {
    if (!requiredStrings.has(source)) throw new Error(`${locale.code}: manual translation override has no source string: ${source}`);
    memory.translations[source] = translation;
  }
  memory.translations = Object.fromEntries([...requiredStrings].sort((a, b) => a.localeCompare(b, "en")).map(key => [key, memory.translations[key]]));
  const serialized = `${JSON.stringify({ locale: locale.code, sourceHash, translations: memory.translations }, null, 2)}\n`;
  await writeIfChanged(memory.path, serialized);
  memories.set(locale.code, memory.translations);
}

const latestDevlogs = await loadLatestDevlogs();

for (const page of localizedPages) {
  const source = pageSources.get(page.file);
  await writeIfChanged(join(siteRoot, page.file), renderEnglishPage(source, page));
  for (const locale of translatedLocales) {
    const path = join(siteRoot, outputFile(locale, page));
    await writeIfChanged(path, renderLocalizedPage(source, locale, page, memories.get(locale.code)));
  }
}

for (const locale of translatedLocales) {
  await writeIfChanged(
    join(siteRoot, locale.code, "i18n-runtime.js"),
    renderRuntimeScript(locale, memories.get(locale.code), runtimeStrings)
  );
  await writeIfChanged(
    join(siteRoot, locale.code, "llms.txt"),
    renderLocalizedLlms(locale, memories.get(locale.code), latestDevlogs)
  );
}

await writeIfChanged(join(siteRoot, "languages.json"), renderLanguageIndex());

const sitemapPath = join(siteRoot, "sitemap.xml");
await writeIfChanged(sitemapPath, renderLocalizedSitemap(await readFile(sitemapPath, "utf8")));

console.log(`Localization ${checkOnly ? "check passed" : "generated"}: ${translatedLocales.length} locales × ${localizedPages.length} pages; ${requiredStrings.size} source strings.`);
