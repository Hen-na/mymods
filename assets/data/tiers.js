/* ==========================================================================
   ТИР-ЛИСТ: что смотреть, читать и во что играть, чтобы росла английская
   лексика. Составлен Клодом, разложен по ступеням от A1 до C2.

   ЭТО ЕДИНСТВЕННЫЙ ФАЙЛ, КОТОРЫЙ НУЖНО ПРАВИТЬ. Добавила запись — обновила
   страницу — она на месте. Ничего пересобирать не надо.

   Шаблон одной записи (копируй целиком, вставляй куда нужно):

     {
       level:  'start',                      // start / base / mid / adv / boss
       title:  'Название',
       kind:   'сериал',                     // фильм / сериал / игра / книга / канал…
       year:   2004,                         // 0 — не показывать
       tag:    '',                           // 'айти' рисует значок на постере
       poster: 'https://…/poster.jpg',       // пусто — будет плитка с названием
       vocab:  'Что за лексика и почему этот уровень.'   // всплывает при наведении
     },

   Порядок внутри уровня — такой же, как здесь: что выше, то левее.

   Постеры — ссылки на картинки статей Википедии. Если какая-то перестанет
   открываться, на её месте появится плитка с названием: страница не сломается.
   Надёжнее всего со временем скачать картинки в assets/images/posters/ и
   писать сюда короткий путь вместо ссылки.
   ========================================================================== */

/* Уровни. Трогать нужно, только если захочется переименовать или добавить
   ступень; id используются в поле level выше и в адресах вида #tier-start. */
window.TIER_LEVELS = [
  { id: 'start', name: 'Старт',          cefr: 'A1–A2', note: 'можно смотреть уже сейчас' },
  { id: 'base',  name: 'Уверенная база', cefr: 'A2–B1' },
  { id: 'mid',   name: 'Средний',        cefr: 'B1–B2' },
  { id: 'adv',   name: 'Продвинутый',    cefr: 'B2–C1' },
  { id: 'boss',  name: 'Очень высокий',  cefr: 'C1–C2', note: 'боссы' }
];

window.TIER_ITEMS = [
  {
    level:  "start",
    title:  "Bluey",
    kind:   "сериал",
    year:   2018,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/4/48/Bluey_%282018_TV_series%29_title_card.jpg/330px-Bluey_%282018_TV_series%29_title_card.jpg",
    vocab:  "Австралийский мультсериал. Речь простая и бытовая, а смешно бывает и взрослым."
  },
  {
    level:  "start",
    title:  "Pokémon",
    kind:   "сериал",
    year:   1997,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/330px-International_Pok%C3%A9mon_logo.svg.png",
    vocab:  "Первые сезоны: много повторяющихся фраз и простых конструкций."
  },
  {
    level:  "start",
    title:  "Toy Story",
    kind:   "фильм",
    year:   1995,
    poster: "https://upload.wikimedia.org/wikipedia/en/1/13/Toy_Story.jpg",
    vocab:  "Чёткая речь, а сюжет ты наверняка уже знаешь — поэтому понимать проще."
  },
  {
    level:  "start",
    title:  "Shrek",
    kind:   "фильм",
    year:   2001,
    poster: "https://upload.wikimedia.org/wikipedia/en/7/7b/Shrek_%282001_animated_feature_film%29.jpg",
    vocab:  "Чёткая речь, а сюжет ты наверняка уже знаешь — поэтому понимать проще."
  },
  {
    level:  "start",
    title:  "Monsters, Inc.",
    kind:   "фильм",
    year:   2001,
    poster: "https://upload.wikimedia.org/wikipedia/en/6/63/Monsters_Inc.JPG",
    vocab:  "Чёткая речь, а сюжет ты наверняка уже знаешь — поэтому понимать проще."
  },
  {
    level:  "start",
    title:  "Pokémon FireRed / Emerald",
    kind:   "игра",
    year:   2004,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/a/a7/Pokemon_LeafGreen_box.jpg/330px-Pokemon_LeafGreen_box.jpg",
    vocab:  "Короткие простые диалоги, читаешь сколько угодно — никто не торопит."
  },
  {
    level:  "start",
    title:  "Stardew Valley",
    kind:   "игра",
    year:   2016,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/413150/library_600x900.jpg",
    vocab:  "Короткие простые диалоги, читаешь сколько угодно — никто не торопит."
  },
  {
    level:  "start",
    title:  "Minecraft на английском",
    kind:   "игра",
    year:   2011,
    poster: "",
    vocab:  "Самый дешёвый лайфхак: просто переключи язык, и бытовые слова (craft, furnace, enchant) запомнятся сами."
  },
  {
    level:  "start",
    title:  "Human Resource Machine",
    kind:   "игра",
    year:   2015,
    tag:    "айти",
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/375820/library_600x900.jpg",
    vocab:  "Головоломки про программирование офисных работяг. Текста мало, он простой и смешной, а слова input, output, jump, copy, loop запоминаются через практику."
  },
  {
    level:  "start",
    title:  "7 Billion Humans",
    kind:   "игра",
    year:   2018,
    tag:    "айти",
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/792100/library_600x900.jpg",
    vocab:  "Продолжение Human Resource Machine: то же программирование человечками, тот же минимум простого текста."
  },
  {
    level:  "start",
    title:  "CommitStrip",
    kind:   "комикс",
    year:   2011,
    tag:    "айти",
    poster: "",
    vocab:  "Короткие комиксы про будни разработчиков. Пара фраз на картинку — понятно даже с минимальным словарём."
  },
  {
    level:  "base",
    title:  "Gravity Falls",
    kind:   "сериал",
    year:   2012,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/c/c2/Gravity_Falls_logo.png/330px-Gravity_Falls_logo.png",
    vocab:  "Раз это фаворит — пересмотри в оригинале. Знакомый сюжет очень помогает, а ещё в титрах спрятаны шифры."
  },
  {
    level:  "base",
    title:  "Avatar: The Last Airbender",
    kind:   "сериал",
    year:   2005,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Avatar_The_Last_Airbender_logo.svg/330px-Avatar_The_Last_Airbender_logo.svg.png",
    vocab:  "Внятная речь, отличная история, лексика от простой до «мудрёной» у Айро."
  },
  {
    level:  "base",
    title:  "Phineas and Ferb",
    kind:   "сериал",
    year:   2007,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/6/6e/Phineas_and_Ferb_logo.svg/330px-Phineas_and_Ferb_logo.svg.png",
    vocab:  "Много повторяющихся шаблонных фраз — как раз из таких и вырастают устойчивые конструкции."
  },
  {
    level:  "base",
    title:  "Scooby-Doo",
    kind:   "сериал",
    year:   1969,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Scooby_doo_logo.png/330px-Scooby_doo_logo.png",
    vocab:  "Много повторяющихся шаблонных фраз — как раз из таких и вырастают устойчивые конструкции."
  },
  {
    level:  "base",
    title:  "Friends",
    kind:   "сериал",
    year:   1994,
    poster: "",
    vocab:  "Классика для изучающих: энциклопедия разговорных фраз на каждый день."
  },
  {
    level:  "base",
    title:  "Undertale",
    kind:   "игра",
    year:   2015,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/391540/library_600x900.jpg",
    vocab:  "Много текста, но он простой и с юмором."
  },
  {
    level:  "base",
    title:  "Portal",
    kind:   "игра",
    year:   2007,
    poster: "https://upload.wikimedia.org/wikipedia/en/9/9f/Portal_standalonebox.jpg",
    vocab:  "Много текста, но он простой и с юмором. Озвучка очень чёткая."
  },
  {
    level:  "base",
    title:  "Chrono Trigger",
    kind:   "игра",
    year:   1995,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/613830/library_600x900.jpg",
    vocab:  "Много текста, но он простой и с юмором."
  },
  {
    level:  "base",
    title:  "Zelda: Ocarina of Time",
    kind:   "игра",
    year:   1998,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/5/57/The_Legend_of_Zelda_Ocarina_of_Time.jpg/330px-The_Legend_of_Zelda_Ocarina_of_Time.jpg",
    vocab:  "Много текста, но он простой и с юмором."
  },
  {
    level:  "base",
    title:  "The IT Crowd",
    kind:   "сериал",
    year:   2006,
    tag:    "айти",
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/The_IT_Crowd_title_card.jpg/330px-The_IT_Crowd_title_card.jpg",
    vocab:  "Британский ситком про двух айтишников в подвале. Тот самый источник «Have you tried turning it off and on again?». Технической лексики немного, но атмосфера бесценна."
  },
  {
    level:  "base",
    title:  "xkcd",
    kind:   "комикс",
    year:   2005,
    tag:    "айти",
    poster: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Xkcd_philosophy.png",
    vocab:  "Легендарные комиксы про IT, математику и науку. Если шутка не дошла — на explainxkcd.com её разбирают, и это само по себе отличное чтение."
  },
  {
    level:  "base",
    title:  "Linus Tech Tips",
    kind:   "канал",
    year:   2008,
    tag:    "айти",
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/2018_Linus_Tech_Tips_logo.svg/330px-2018_Linus_Tech_Tips_logo.svg.png",
    vocab:  "Железо, сборки, тесты. Говорят бодро, но понятно, с кучей шуток."
  },
  {
    level:  "base",
    title:  "r/talesfromtechsupport",
    kind:   "форум",
    tag:    "айти",
    poster: "",
    vocab:  "Истории из техподдержки. Живой рабочий сленг айтишников от первого лица."
  },
  {
    level:  "base",
    title:  "r/ProgrammerHumor",
    kind:   "форум",
    tag:    "айти",
    poster: "",
    vocab:  "Мемы про программирование. Короткие подписи, зато сплошной профессиональный сленг."
  },
  {
    level:  "base",
    title:  "Resident Evil 5",
    kind:   "игра",
    year:   2009,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/21690/library_600x900.jpg",
    vocab:  "Диалоги короткие и боевые: «Watch out!», «Cover me!». Всё озвучено, говорят чётко. Сложнее записки и документы — там биологическая и военная лексика, уже ближе к B2."
  },
  {
    level:  "mid",
    title:  "Over the Garden Wall",
    kind:   "сериал",
    year:   2014,
    poster: "https://upload.wikimedia.org/wikipedia/en/8/82/Over_the_Garden_Wall_%28animated_miniseries%29_poster.jpg",
    vocab:  "Короткий мини-сериал, по вайбу очень близок к Gravity Falls. Язык немного поэтичный и старомодный."
  },
  {
    level:  "mid",
    title:  "The Simpsons",
    kind:   "сериал",
    year:   1989,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/The_Simpsons_yellow_logo.svg/330px-The_Simpsons_yellow_logo.svg.png",
    vocab:  "Сезоны 2–9: много культурных отсылок, через них учишь не только язык, но и контекст."
  },
  {
    level:  "mid",
    title:  "Futurama",
    kind:   "сериал",
    year:   1999,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Futurama_1999_logo.svg/330px-Futurama_1999_logo.svg.png",
    vocab:  "Много культурных отсылок, через них учишь не только язык, но и контекст."
  },
  {
    level:  "mid",
    title:  "Stranger Things",
    kind:   "сериал",
    year:   2016,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Stranger_Things_logo.png/330px-Stranger_Things_logo.png",
    vocab:  "Ностальгия по 80-м и подростковый сленг."
  },
  {
    level:  "mid",
    title:  "The Office (US)",
    kind:   "сериал",
    year:   2005,
    poster: "",
    vocab:  "Офисная лексика и неловкий юмор. Речь естественная, почти без актёрской подачи."
  },
  {
    level:  "mid",
    title:  "Back to the Future",
    kind:   "фильм",
    year:   1985,
    poster: "https://upload.wikimedia.org/wikipedia/en/d/d2/Back_to_the_Future.jpg",
    vocab:  "Культовая вещь, на которую постоянно ссылаются в интернете."
  },
  {
    level:  "mid",
    title:  "Ghostbusters",
    kind:   "фильм",
    year:   1984,
    poster: "https://upload.wikimedia.org/wikipedia/en/2/2f/Ghostbusters_%281984%29_theatrical_poster.png",
    vocab:  "Культовая вещь, на которую постоянно ссылаются в интернете."
  },
  {
    level:  "mid",
    title:  "Star Wars: оригинальная трилогия",
    kind:   "фильм",
    year:   1977,
    poster: "https://upload.wikimedia.org/wikipedia/en/8/87/StarWarsMoviePoster1977.jpg",
    vocab:  "Культовая вещь, на которую постоянно ссылаются в интернете."
  },
  {
    level:  "mid",
    title:  "Home Alone",
    kind:   "фильм",
    year:   1990,
    poster: "https://upload.wikimedia.org/wikipedia/en/7/76/Home_alone_poster.jpg",
    vocab:  "Культовая вещь, на которую постоянно ссылаются в интернете."
  },
  {
    level:  "mid",
    title:  "Fallout 3 / New Vegas",
    kind:   "игра",
    year:   2008,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/22370/library_600x900.jpg",
    vocab:  "Много диалогов с выбором ответа — значит, приходится реально понимать, что говорят."
  },
  {
    level:  "mid",
    title:  "Star Wars: KOTOR",
    kind:   "игра",
    year:   2003,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/208580/library_600x900.jpg",
    vocab:  "Много диалогов с выбором ответа — значит, приходится реально понимать, что говорят."
  },
  {
    level:  "mid",
    title:  "Mass Effect",
    kind:   "игра",
    year:   2007,
    poster: "https://upload.wikimedia.org/wikipedia/en/e/e8/MassEffect.jpg",
    vocab:  "Много диалогов с выбором ответа — значит, приходится реально понимать, что говорят."
  },
  {
    level:  "mid",
    title:  "Portal 2",
    kind:   "игра",
    year:   2011,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900.jpg",
    vocab:  "Много диалогов с выбором ответа, очень чёткая озвучка."
  },
  {
    level:  "mid",
    title:  "The Walking Dead (Telltale)",
    kind:   "игра",
    year:   2012,
    poster: "https://upload.wikimedia.org/wikipedia/en/3/31/The_Walking_Dead%2C_Season_One_cover.jpeg",
    vocab:  "Много диалогов с выбором ответа, да ещё и на таймере — понимать надо сразу."
  },
  {
    level:  "mid",
    title:  "Silicon Valley",
    kind:   "сериал",
    year:   2014,
    tag:    "айти",
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/3/33/Silicon_valley_title.png/330px-Silicon_valley_title.png",
    vocab:  "Сатира про стартап. Плотная техническая лексика, но всё обыгрывается через комедию."
  },
  {
    level:  "mid",
    title:  "Darknet Diaries",
    kind:   "подкаст",
    year:   2017,
    tag:    "айти",
    poster: "https://upload.wikimedia.org/wikipedia/en/6/6a/Darknet_Diaries_podcast_artwork.jpg",
    vocab:  "Реальные истории взломов, утечек и социальной инженерии. Рассказано живо и с иронией, а для инфобеза это вообще клад."
  },
  {
    level:  "mid",
    title:  "Kevin Fang",
    kind:   "канал",
    tag:    "айти",
    poster: "",
    vocab:  "Анимированные разборы громких сбоев и падений сервисов. Смешно и при этом подробно про DNS, BGP, балансировщики и так далее."
  },
  {
    level:  "mid",
    title:  "Fireship",
    kind:   "канал",
    tag:    "айти",
    poster: "",
    vocab:  "Технологии «за 100 секунд». Очень быстро и саркастично — хорошо тренирует слух."
  },
  {
    level:  "mid",
    title:  "Hacknet",
    kind:   "игра",
    year:   2015,
    tag:    "айти",
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/365450/library_600x900.jpg",
    vocab:  "Взламываешь через терминал настоящими командами. Технический английский в деле, а не в учебнике."
  },
  {
    level:  "mid",
    title:  "Shenzhen I/O",
    kind:   "игра",
    year:   2016,
    tag:    "айти",
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/504210/library_600x900.jpg",
    vocab:  "Приходится читать выдуманные, но очень реалистичные даташиты, плюс смешная рабочая переписка."
  },
  {
    level:  "mid",
    title:  "Mr. Robot",
    kind:   "сериал",
    year:   2015,
    tag:    "айти",
    poster: "",
    vocab:  "Уже не комедия, но по технической реалистичности хакерских сцен ему мало равных."
  },
  {
    level:  "mid",
    title:  "Resident Evil 6",
    kind:   "игра",
    year:   2012,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/221040/library_600x900.jpg",
    vocab:  "То же, что в пятой части, но кат-сцен и разговоров заметно больше, а четыре кампании дают разных персонажей с разной манерой речи. Добавляется военный жаргон."
  },
  {
    level:  "mid",
    title:  "Resident Evil Requiem",
    kind:   "игра",
    poster: "https://upload.wikimedia.org/wikipedia/en/1/15/Resident_Evil_Requiem_Cover_Art.jpg",
    vocab:  "Возврат к медленному survival horror: боевых выкриков меньше, атмосферных диалогов и записок больше. Героиня — аналитик ФБР, так что ждём лексику расследований и криминалистики."
  },
  {
    level:  "adv",
    title:  "Rick and Morty",
    kind:   "сериал",
    year:   2013,
    poster: "",
    vocab:  "Быстро, много сленга, научных терминов и импровизации."
  },
  {
    level:  "adv",
    title:  "BoJack Horseman",
    kind:   "сериал",
    year:   2014,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/BoJack_Horseman_Logo.svg/330px-BoJack_Horseman_Logo.svg.png",
    vocab:  "Постоянная игра слов и взрослые темы. Уровень сложности обманчиво высокий для мультфильма."
  },
  {
    level:  "adv",
    title:  "Arcane",
    kind:   "сериал",
    year:   2021,
    poster: "",
    vocab:  "Красиво, плотные диалоги, разные манеры речи у персонажей."
  },
  {
    level:  "adv",
    title:  "Breaking Bad",
    kind:   "сериал",
    year:   2008,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Breaking_Bad_logo.svg/330px-Breaking_Bad_logo.svg.png",
    vocab:  "Быстрая умная речь. Американский вариант — в пару к британскому Шерлоку."
  },
  {
    level:  "adv",
    title:  "Sherlock (BBC)",
    kind:   "сериал",
    year:   2010,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/4/4d/Sherlock_titlecard.jpg/330px-Sherlock_titlecard.jpg",
    vocab:  "Британская быстрая умная речь — хороший контраст к американской."
  },
  {
    level:  "adv",
    title:  "Doctor Who",
    kind:   "сериал",
    year:   1963,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/d/d1/Doctor_Who_title_card.png/330px-Doctor_Who_title_card.png",
    vocab:  "Британская быстрая умная речь — хороший контраст к американской."
  },
  {
    level:  "adv",
    title:  "The Matrix",
    kind:   "фильм",
    year:   1999,
    poster: "https://upload.wikimedia.org/wikipedia/en/d/db/The_Matrix.png",
    vocab:  "Цитаты разошлись на мемы — услышишь их потом везде."
  },
  {
    level:  "adv",
    title:  "Pulp Fiction",
    kind:   "фильм",
    year:   1994,
    poster: "https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg",
    vocab:  "Цитаты разошлись на мемы — услышишь их потом везде."
  },
  {
    level:  "adv",
    title:  "Fight Club",
    kind:   "фильм",
    year:   1999,
    poster: "https://upload.wikimedia.org/wikipedia/en/f/fc/Fight_Club_poster.jpg",
    vocab:  "Цитаты разошлись на мемы — услышишь их потом везде."
  },
  {
    level:  "adv",
    title:  "The Big Lebowski",
    kind:   "фильм",
    year:   1998,
    poster: "https://upload.wikimedia.org/wikipedia/en/3/35/Biglebowskiposter.jpg",
    vocab:  "Цитаты разошлись на мемы — услышишь их потом везде."
  },
  {
    level:  "adv",
    title:  "Deus Ex",
    kind:   "игра",
    year:   2000,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/6910/library_600x900.jpg",
    vocab:  "Нуарные метафоры и заговоры — текст заметно плотнее обычного игрового."
  },
  {
    level:  "adv",
    title:  "Max Payne",
    kind:   "игра",
    year:   2001,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/204100/library_600x900.jpg",
    vocab:  "Нуарные метафоры сплошным потоком: вся игра держится на закадровом монологе."
  },
  {
    level:  "adv",
    title:  "Red Dead Redemption 2",
    kind:   "игра",
    year:   2018,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg",
    vocab:  "Акценты Дикого Запада и речь позапрошлого века."
  },
  {
    level:  "adv",
    title:  "Baldur's Gate",
    kind:   "игра",
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg",
    vocab:  "Фэнтезийная лексика и очень много текста для чтения."
  },
  {
    level:  "adv",
    title:  "Night in the Woods",
    kind:   "игра",
    year:   2017,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/481510/library_600x900.jpg",
    vocab:  "Самая сложная игра списка, хотя выглядит милой. Озвучки нет, читаешь в своём темпе, но язык живой: подростковый провинциальный сленг, сарказм, игра слов, чаты. Плюс стихи и сны с метафорами, разговоры про депрессию, деньги и закрытые заводы. Со словарём."
  },
  {
    level:  "adv",
    title:  "The Daily WTF",
    kind:   "сайт",
    year:   2004,
    tag:    "айти",
    poster: "",
    vocab:  "Истории о чудовищном коде и абсурдных решениях в компаниях. Много профессионального жаргона."
  },
  {
    level:  "adv",
    title:  "Доклады с DEF CON",
    kind:   "конференция",
    year:   1993,
    tag:    "айти",
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Defcon.jpg/330px-Defcon.jpg",
    vocab:  "Многие выступления одновременно глубокие и очень смешные. Спикеры говорят быстро и с разными акцентами."
  },
  {
    level:  "adv",
    title:  "BOFH",
    kind:   "рассказы",
    year:   1992,
    tag:    "айти",
    poster: "",
    vocab:  "Цикл про злобного сисадмина, который издевается над пользователями. Британский сленг плюс админская лексика."
  },
  {
    level:  "boss",
    title:  "Monty Python",
    kind:   "сериал",
    year:   1969,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/c/cd/Monty_Python%27s_Flying_Circus_Title_Card.png/330px-Monty_Python%27s_Flying_Circus_Title_Card.png",
    vocab:  "Британский юмор, построенный на тонкой игре слов."
  },
  {
    level:  "boss",
    title:  "Blackadder",
    kind:   "сериал",
    year:   1983,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/b/b2/Ba4.jpg/330px-Ba4.jpg",
    vocab:  "Британский юмор, построенный на тонкой игре слов."
  },
  {
    level:  "boss",
    title:  "Fawlty Towers",
    kind:   "сериал",
    year:   1975,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/d/d6/Fawlty_Towers_title_card.jpg/330px-Fawlty_Towers_title_card.jpg",
    vocab:  "Британский юмор, построенный на тонкой игре слов."
  },
  {
    level:  "boss",
    title:  "The Wire",
    kind:   "сериал",
    year:   2002,
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/The_Wire_logo.svg/330px-The_Wire_logo.svg.png",
    vocab:  "Балтиморский уличный сленг. Даже носители включают субтитры."
  },
  {
    level:  "boss",
    title:  "Peaky Blinders",
    kind:   "сериал",
    year:   2013,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/e/e8/Peaky_Blinders_titlecard.jpg/330px-Peaky_Blinders_titlecard.jpg",
    vocab:  "Бирмингемский акцент. Отличная тренировка для слуха."
  },
  {
    level:  "boss",
    title:  "Snatch",
    kind:   "фильм",
    year:   2000,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/a/a7/Snatch_ver4.jpg/330px-Snatch_ver4.jpg",
    vocab:  "Кокни и воровской жаргон на предельной скорости."
  },
  {
    level:  "boss",
    title:  "Lock, Stock and Two Smoking Barrels",
    kind:   "фильм",
    year:   1998,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/e/e9/Lock%2C_Stock_and_Two_Smoking_Barrels_2.jpg/330px-Lock%2C_Stock_and_Two_Smoking_Barrels_2.jpg",
    vocab:  "Кокни и воровской жаргон на предельной скорости."
  },
  {
    level:  "boss",
    title:  "Trainspotting",
    kind:   "фильм",
    year:   1996,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/7/71/Trainspotting_ver2.jpg/330px-Trainspotting_ver2.jpg",
    vocab:  "Шотландский акцент — самый тяжёлый вход из всех британских."
  },
  {
    level:  "boss",
    title:  "Twin Peaks",
    kind:   "сериал",
    year:   1990,
    poster: "https://upload.wikimedia.org/wikipedia/en/e/e6/Peaks2.jpg",
    vocab:  "Странный сюрреалистичный диалог: слова простые, смысл — нет."
  },
  {
    level:  "boss",
    title:  "Deadwood",
    kind:   "сериал",
    year:   2004,
    poster: "https://thumb.wikimedia.org/wikipedia/en/thumb/1/18/Deadwood_titleimage.jpg/330px-Deadwood_titleimage.jpg",
    vocab:  "Архаичный, очень цветистый язык — ругань построена как барочная проза."
  },
  {
    level:  "boss",
    title:  "Disco Elysium",
    kind:   "игра",
    year:   2019,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/632470/library_600x900.jpg",
    vocab:  "По сути интерактивный роман. Огромный объём литературного текста и редкая лексика. Пройдёшь без словаря — можно считать, что язык покорён."
  },
  {
    level:  "boss",
    title:  "Planescape: Torment",
    kind:   "игра",
    year:   1999,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/466300/library_600x900.jpg",
    vocab:  "Интерактивный роман: огромный объём литературного текста и редкая лексика."
  },
  {
    level:  "boss",
    title:  "Sunless Sea",
    kind:   "игра",
    year:   2015,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/304650/library_600x900.jpg",
    vocab:  "Интерактивный роман: огромный объём литературного текста и редкая лексика."
  },
  {
    level:  "boss",
    title:  "Pentiment",
    kind:   "игра",
    year:   2022,
    poster: "https://cdn.cloudflare.steamstatic.com/steam/apps/1205520/library_600x900.jpg",
    vocab:  "Интерактивный роман: огромный объём литературного текста и редкая лексика."
  },
  {
    level:  "boss",
    title:  "Эссе Джеймса Миккенса",
    kind:   "эссе",
    year:   2013,
    tag:    "айти",
    poster: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/James_Mickens.png/330px-James_Mickens.png",
    vocab:  "Особенно «The Night Watch» и «This World of Ours». Профессор Гарварда пишет о системном программировании и криптографии в стиле стендапа. Плотность метафор и редких слов запредельная, но смешно до слёз."
  },
  {
    level:  "boss",
    title:  "Первоапрельские RFC",
    kind:   "спецификация",
    year:   1990,
    tag:    "айти",
    poster: "",
    vocab:  "RFC 1149 (IP через почтовых голубей) и RFC 2324 (протокол управления кофеварками, откуда «418 I'm a teapot»). Написаны настоящим формальным языком спецификаций — заодно привыкаешь к стилю реальных RFC."
  }
];
