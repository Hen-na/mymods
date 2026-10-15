/* ==========================================================================
   Тир-лист: раскладывает assets/data/tiers.js по ступеням и помнит, что уже
   пройдено.

   Отметки лежат в localStorage этого браузера — не на сервере. Значит они
   переживают закрытие вкладки, обновление страницы и новый деплой сайта, но
   принадлежат одному устройству: на телефоне будет свой список. Для личной
   галочки «посмотрела» этого достаточно, а главное — ничего не надо чинить,
   когда у домена опять что-нибудь отвалится.
   ========================================================================== */
(function () {
  'use strict';

  var levels = Array.isArray(window.TIER_LEVELS) ? window.TIER_LEVELS : [];
  var items = Array.isArray(window.TIER_ITEMS) ? window.TIER_ITEMS : [];

  var STORE_KEY = 'hen_na_seen';

  var root = document.getElementById('tiers');
  if (!root || !levels.length) { return; }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  /* --------------------------------------------------------------- память -- */
  // Запись опознаётся по названию и году, а не по номеру в списке: иначе
  // достаточно вставить одну строку выше — и все отметки съедут на соседей.
  function idOf(item) {
    if (item.id) { return String(item.id); }
    var base = String(item.title || '') + ' ' + String(item.year || '');
    return base.toLowerCase()
      .replace(/[^a-z0-9Ѐ-ӿ]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function loadSeen() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (error) {
      // Приватное окно или запрещённые данные сайта: страница работает, просто
      // ничего не запоминает.
      return [];
    }
  }

  var seen = {};
  loadSeen().forEach(function (id) { seen[id] = true; });

  function saveSeen() {
    var list = [];
    Object.keys(seen).forEach(function (id) { if (seen[id]) { list.push(id); } });
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (error) { /* некуда писать — отметка живёт до перезагрузки */ }
  }

  /* -------------------------------------------------------------- карточка -- */
  function card(item) {
    var id = idOf(item);
    var pick = element('li', 'pick');
    pick.dataset.id = id;

    var poster = element('div', 'poster');
    // Название лежит под картинкой всегда: если картинка не придёт, оно само
    // окажется на виду, и вместо битого квадрата будет аккуратная плитка.
    poster.appendChild(element('span', 'poster-text', item.title || ''));

    if (item.poster) {
      var image = element('img');
      image.src = item.poster;
      image.alt = '';
      image.loading = 'lazy';
      // Картинка не пришла — убираем её и снимаем метку, чтобы вернулись
      // подпись и запасная плитка с названием.
      image.addEventListener('error', function () {
        if (image.parentNode) { image.parentNode.removeChild(image); }
        pick.classList.remove('has-art');
      });
      poster.appendChild(image);
      pick.classList.add('has-art');
    }
    // Значок ветки: айтишные позиции пришли отдельным списком, и без пометки
    // они потерялись бы среди мультиков своего уровня.
    if (item.tag) { poster.appendChild(element('span', 'pick-tag', item.tag)); }
    pick.appendChild(poster);

    var title = element('span', 'pick-title', item.title || '');
    if (item.kind || item.year) {
      var parts = [];
      if (item.kind) { parts.push(item.kind); }
      if (item.year) { parts.push(item.year); }
      title.appendChild(element('span', 'pick-kind', parts.join(' · ')));
    }
    pick.appendChild(title);

    var label = element('label', 'seen');
    var box = element('input');
    box.type = 'checkbox';
    box.checked = !!seen[id];
    label.appendChild(box);
    label.appendChild(element('span', 'box'));
    label.appendChild(element('span', 'seen-label', 'смотрела'));
    pick.appendChild(label);

    if (item.vocab) {
      var tip = element('div', 'tip glass');
      tip.appendChild(element('b', null, item.title || ''));
      tip.appendChild(document.createTextNode(item.vocab));
      pick.appendChild(tip);
    }

    pick.classList.toggle('is-seen', !!seen[id]);

    box.addEventListener('change', function () {
      seen[id] = box.checked;
      pick.classList.toggle('is-seen', box.checked);
      saveSeen();
      count();
    });

    return pick;
  }

  /* ---------------------------------------------------------------- сборка -- */
  function build() {
    var byLevel = {};
    levels.forEach(function (level) { byLevel[level.id] = []; });

    items.forEach(function (item) {
      // Запись с неизвестным уровнем не теряется молча — она едет в первую
      // ступень, где её сразу видно и легко поправить.
      var bucket = byLevel[item.level] ? item.level : levels[0].id;
      byLevel[bucket].push(item);
    });

    levels.forEach(function (level) {
      var section = element('section', 'tier glass');
      section.id = 'tier-' + level.id;
      section.dataset.level = level.id;

      var head = element('header', 'tier-head');
      head.appendChild(element('span', 'tier-badge', level.name));
      head.appendChild(element('span', 'tier-cefr', level.cefr || ''));
      if (level.note) { head.appendChild(element('span', 'tier-note', level.note)); }

      var tally = element('span', 'tier-count');
      tally.appendChild(element('b', null, '0'));
      tally.appendChild(document.createTextNode(' из ' + byLevel[level.id].length));
      head.appendChild(tally);
      section.appendChild(head);

      if (!byLevel[level.id].length) {
        section.appendChild(element('p', 'tier-empty', 'Пока пусто.'));
      } else {
        var list = element('ul', 'tier-items');
        byLevel[level.id].forEach(function (item) { list.appendChild(card(item)); });
        section.appendChild(list);
      }

      root.appendChild(section);
    });
  }

  /* ---------------------------------------------------------------- счёт -- */
  // Название ступени по её id — нужно для подписи к куску полосы.
  var levelName = {};
  levels.forEach(function (level) { levelName[level.id] = level.name; });

  // Человек мог попросить систему не анимировать ничего — тогда всё ниже
  // просто проставляет конечные значения.
  var CALM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  // Последнее посчитанное состояние — его читает отложенная первая отрисовка.
  var latest = { parts: [], done: 0 };

  function paintTrack(track, parts, done) {
    parts.forEach(function (part, index) {
      var seg = track.children[index];
      if (!seg) { return; }
      var share = done ? (part.ticked / done) * 100 : 0;
      seg.style.width = share + '%';
      seg.title = levelName[part.level] + ': ' + part.ticked + ' из ' + part.total +
        ' — ' + Math.round(share) + '% отмеченного';
      // Пустую ступень убираем и из поля зрения читалки, и из-под курсора.
      seg.setAttribute('aria-hidden', 'true');
      seg.hidden = false;
    });
  }

  // Блик, пробегающий по полосе после каждой отметки. Класс снимается по
  // окончании, иначе второй клик подряд не перезапустил бы анимацию.
  var litTimer = 0;
  function lightUp(rail) {
    if (CALM && CALM.matches) { return; }
    rail.classList.remove('is-lit');
    void rail.offsetWidth;                 // перезапуск: заставляем пересчитать
    rail.classList.add('is-lit');
    window.clearTimeout(litTimer);
    litTimer = window.setTimeout(function () { rail.classList.remove('is-lit'); }, 800);
  }

  // Цифра не прыгает, а добегает до нового значения. Шагов немного: на счёт
  // до сотни хватает, а глазу этого достаточно, чтобы заметить движение.
  var figureFrom = 0;
  var figureTimer = 0;
  function showFigure(figure, done, all) {
    function put(value) {
      figure.textContent = String(value);
      figure.appendChild(element('small', null, ' из ' + all));
    }

    if (CALM && CALM.matches) { figureFrom = done; put(done); return; }

    var from = figureFrom;
    figureFrom = done;
    if (from === done) { put(done); return; }

    var started = 0;
    window.cancelAnimationFrame(figureTimer);

    function step(now) {
      if (!started) { started = now; }
      var k = Math.min(1, (now - started) / 420);
      // Замедление к концу — то же ощущение, что у выезжающей полосы.
      var eased = 1 - Math.pow(1 - k, 3);
      put(Math.round(from + (done - from) * eased));
      if (k < 1) { figureTimer = window.requestAnimationFrame(step); }
    }
    figureTimer = window.requestAnimationFrame(step);
  }

  function count() {
    var done = 0;
    var all = 0;
    var parts = [];

    [].forEach.call(root.querySelectorAll('.tier'), function (section) {
      var picks = section.querySelectorAll('.pick').length;
      var ticked = section.querySelectorAll('.pick.is-seen').length;
      var tally = section.querySelector('.tier-count b');
      if (tally) { tally.textContent = String(ticked); }
      done += ticked;
      all += picks;
      parts.push({ level: section.dataset.level, ticked: ticked, total: picks });
    });

    var figure = document.getElementById('progress-figure');
    var track = document.getElementById('progress-track');
    var rail = document.getElementById('progress-rail');

    if (figure) { showFigure(figure, done, all); }

    // Полоса занята целиком всегда: она показывает не сколько пройдено — это
    // написано цифрой выше, — а из чего пройденное состоит. Доля считается от
    // отмеченного, а не от всего списка, поэтому куски делят между собой всю
    // длину, и меняется только их соотношение. Отметишь первую вещь — полоса
    // сразу одного цвета во всю ширину; это и значит «пока только старт».
    //
    // Куски не пересоздаются, а живут всё время — по одному на ступень, пустые
    // просто нулевой ширины. Это и есть вся анимация: браузеру есть от какого
    // значения вести ширину к какому. Пока они собирались заново на каждый
    // клик, переходу не за что было зацепиться, и полоса дёргалась скачком.
    if (track) {
      latest.parts = parts;
      latest.done = done;

      if (track.children.length !== parts.length) {
        track.textContent = '';
        parts.forEach(function (part) {
          var seg = element('span', 'progress-seg');
          seg.dataset.level = part.level;
          seg.style.width = '0%';
          track.appendChild(seg);
        });
        // Ширины ставятся следующим кадром, иначе браузер посчитает их
        // начальными и первый заход появится рывком, без выезда. Рисуем по
        // latest, а не по снимку: во вкладке, которая лежит в фоне, кадра
        // можно ждать сколько угодно, и за это время человек успеет наотмечать
        // — снимок тогда затёр бы свежие доли старыми.
        requestAnimationFrame(function () { paintTrack(track, latest.parts, latest.done); });
      } else {
        paintTrack(track, parts, done);
      }
    }

    if (rail) { lightUp(rail); }

    // Полоса перестала быть индикатором выполнения и стала разбивкой, так что
    // и роль у неё теперь картинки с подписью, а не прогрессбара: иначе
    // читалка объявляла бы «100 процентов» при одной отмеченной позиции.
    if (rail) {
      rail.setAttribute('aria-label', parts.filter(function (part) {
        return part.ticked;
      }).map(function (part) {
        return levelName[part.level] + ' ' + part.ticked + ' из ' + part.total;
      }).join(', ') || 'ничего не отмечено');
    }
  }

  build();
  count();
})();
