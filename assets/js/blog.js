/* ==========================================================================
   Blog desktop. Plain ES5-ish, no dependencies, same as the rest of the site.

   Three jobs:
     1. a tiny window manager — drag, focus, shade, maximize, close
     2. the page content — posts, counter, guestbook
     3. the desktop icons that open the windows again

   Posts come from assets/data/posts.js (window.BLOG_POSTS).
   The counter and the guestbook are honest about what they are: this page has
   no server, so both live in the visitor's own browser.
   ========================================================================== */
(function () {
  'use strict';

  var posts = Array.isArray(window.BLOG_POSTS) ? window.BLOG_POSTS : [];

  /* Below this width the stylesheet lays the windows out in flow, so dragging
     is switched off rather than fighting the layout. */
  var FLOW_LAYOUT = window.matchMedia('(max-width: 820px)');

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) { return iso || ''; }
    return date.toLocaleDateString(undefined, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  /* ---------------------------------------------------------- paragraphs -- */
  // Post text is plain text — pasting HTML into posts.js would be a way to
  // break the page, so it is never parsed as markup. The one exception is a
  // link written [like this](https://example.com): the anchor is built from
  // DOM nodes, and the URL is checked before it is used.
  var LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

  function safeHref(url) {
    // http(s), mail, and same-site paths only. Anything else (javascript:,
    // data:, …) is dropped and the label is left as plain text.
    return /^(https?:\/\/|mailto:|#|\.{0,2}\/|[\w.-]+\.(html|jar|png|webp))/i.test(url) ? url : null;
  }

  function paragraph(text) {
    var node = element('p');
    var cursor = 0;
    var match;

    LINK_PATTERN.lastIndex = 0;
    while ((match = LINK_PATTERN.exec(text)) !== null) {
      if (match.index > cursor) {
        node.appendChild(document.createTextNode(text.slice(cursor, match.index)));
      }

      var href = safeHref(match[2]);
      if (href) {
        var link = element('a', null, match[1]);
        link.href = href;
        if (/^https?:/i.test(href)) { link.target = '_blank'; link.rel = 'noopener'; }
        node.appendChild(link);
      } else {
        node.appendChild(document.createTextNode(match[1]));
      }

      cursor = match.index + match[0].length;
    }

    node.appendChild(document.createTextNode(text.slice(cursor)));
    return node;
  }

  /* ======================================================= window manager == */
  var desktop = document.querySelector('.desktop');
  var windows = [].slice.call(document.querySelectorAll('.window'));
  var topZ = 10;

  function focusWindow(win) {
    if (win.classList.contains('active')) { return; }
    windows.forEach(function (other) {
      other.classList.toggle('inactive', other !== win);
      other.classList.toggle('active', other === win);
    });
    topZ += 1;
    win.style.zIndex = topZ;
  }

  /* ------------------------------------------------------------ dragging -- */
  function startDrag(win, event) {
    if (FLOW_LAYOUT.matches) { return; }
    if (event.button !== undefined && event.button !== 0) { return; }
    if (event.target.closest('.tb-btns')) { return; }   // buttons are not a handle

    var bar = event.currentTarget;
    var rect = win.getBoundingClientRect();
    var host = desktop.getBoundingClientRect();

    // Offset of the grab point inside the window, kept constant while moving.
    var grabX = event.clientX - rect.left;
    var grabY = event.clientY - rect.top;

    // A maximized window snaps back to its own size the moment it is dragged.
    if (win.classList.contains('maximized')) {
      win.classList.remove('maximized');
      grabX = Math.min(grabX, win.offsetWidth - 40);
    }

    focusWindow(win);
    win.classList.add('dragging');

    function move(moveEvent) {
      var left = moveEvent.clientX - host.left - grabX;
      var top = moveEvent.clientY - host.top - grabY;

      // Keep a grabbable strip on screen: the window can hang off an edge, but
      // never so far that its title bar becomes unreachable.
      var maxLeft = desktop.clientWidth - 60;
      var maxTop = desktop.clientHeight - 26;
      win.style.left = Math.max(-(win.offsetWidth - 60), Math.min(left, maxLeft)) + 'px';
      win.style.top = Math.max(0, Math.min(top, maxTop)) + 'px';
    }

    function end() {
      win.classList.remove('dragging');
      growDesktop();
      bar.removeEventListener('pointermove', move);
      bar.removeEventListener('pointerup', end);
      bar.removeEventListener('pointercancel', end);
      if (bar.hasPointerCapture && bar.hasPointerCapture(event.pointerId)) {
        bar.releasePointerCapture(event.pointerId);
      }
    }

    // Capture on the bar so the drag survives the pointer outrunning the window.
    if (bar.setPointerCapture) { bar.setPointerCapture(event.pointerId); }
    bar.addEventListener('pointermove', move);
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);

    event.preventDefault();
  }

  /* ------------------------------------------------------------ resizing -- */
  // Only windows carrying a [data-resize] grip can be resized — right now that
  // is blog.exe alone, since it is the only one with enough in it to be worth
  // making bigger. Width goes on the window, height on the scrolling body.
  function wireResize(win) {
    var grip = win.querySelector('[data-resize]');
    var body = win.querySelector('.win-body');
    if (!grip || !body) { return; }

    grip.addEventListener('pointerdown', function (event) {
      if (FLOW_LAYOUT.matches) { return; }
      if (event.button !== undefined && event.button !== 0) { return; }

      var startX = event.clientX;
      var startY = event.clientY;
      var startWidth = win.offsetWidth;
      var startHeight = body.offsetHeight;

      focusWindow(win);
      win.classList.add('resizing');
      win.classList.remove('maximized');

      function move(moveEvent) {
        var width = startWidth + (moveEvent.clientX - startX);
        var height = startHeight + (moveEvent.clientY - startY);

        // Never smaller than usable, never wider than what is left of the desktop.
        win.style.width = Math.max(300, Math.min(width, desktop.clientWidth - win.offsetLeft - 8)) + 'px';
        body.style.maxHeight = 'none';
        body.style.height = Math.max(140, height) + 'px';
      }

      function end() {
        win.classList.remove('resizing');
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', end);
        grip.removeEventListener('pointercancel', end);
        if (grip.hasPointerCapture && grip.hasPointerCapture(event.pointerId)) {
          grip.releasePointerCapture(event.pointerId);
        }
        growDesktop();
      }

      if (grip.setPointerCapture) { grip.setPointerCapture(event.pointerId); }
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', end);
      grip.addEventListener('pointercancel', end);

      event.preventDefault();
      event.stopPropagation();
    });
  }

  /* ------------------------------------------------------ window controls -- */
  function wireWindow(win) {
    var bar = win.querySelector('.title-bar');
    if (!bar) { return; }

    bar.addEventListener('pointerdown', function (event) { startDrag(win, event); });
    // Double-clicking the title bar rolls the window up, as it always did.
    bar.addEventListener('dblclick', function (event) {
      if (event.target.closest('.tb-btns')) { return; }
      win.classList.toggle('shaded');
      growDesktop();
    });

    win.addEventListener('pointerdown', function () { focusWindow(win); });

    var shade = win.querySelector('[data-act="shade"]');
    var max = win.querySelector('[data-act="max"]');
    var close = win.querySelector('[data-act="close"]');

    if (shade) {
      shade.addEventListener('click', function () { win.classList.toggle('shaded'); growDesktop(); });
    }
    if (max) {
      max.addEventListener('click', function () {
        win.classList.toggle('maximized');
        win.classList.remove('shaded');
        focusWindow(win);
        growDesktop();
      });
    }
    if (close) {
      close.addEventListener('click', function () { win.hidden = true; growDesktop(); });
    }

    wireResize(win);
  }

  windows.forEach(wireWindow);
  if (windows.length) { focusWindow(windows[0]); }

  /* ------------------------------------------------------------- layout --- */
  // Windows carry their intended spot in data-x / data-y. On load and on resize
  // those get clamped into the desktop, so nothing opens off-screen on a
  // narrower display, and the desktop is grown to fit the lowest window.
  // A window the visitor has dragged is left exactly where they put it.
  // The desktop clips what overflows it, so it has to be at least as tall as the
  // lowest window — including one the visitor has just dragged downwards.
  function growDesktop() {
    if (FLOW_LAYOUT.matches) { desktop.style.minHeight = ''; return; }

    var lowest = 0;
    windows.forEach(function (win) {
      if (!win.hidden) { lowest = Math.max(lowest, win.offsetTop + win.offsetHeight); }
    });
    desktop.style.minHeight = (lowest + 20) + 'px';
  }

  function layoutWindows() {
    if (FLOW_LAYOUT.matches) { desktop.style.minHeight = ''; return; }

    var width = desktop.clientWidth;

    windows.forEach(function (win) {
      if (win.dataset.moved || win.hidden) { return; }
      var x = parseInt(win.dataset.x, 10) || 0;
      var y = parseInt(win.dataset.y, 10) || 0;
      win.style.left = Math.max(8, Math.min(x, width - win.offsetWidth - 8)) + 'px';
      win.style.top = y + 'px';
    });

    growDesktop();
  }

  // Once dragged, a window stops being repositioned by the layout pass.
  windows.forEach(function (win) {
    win.addEventListener('pointerdown', function (event) {
      if (event.target.closest('.title-bar') && !event.target.closest('.tb-btns')) {
        win.dataset.moved = '1';
      }
    });
  });

  layoutWindows();
  window.addEventListener('resize', layoutWindows);

  /* --------------------------------------------------------- desktop icons -- */
  // Icons either open a window (data-open) or are plain links to other pages.
  [].forEach.call(document.querySelectorAll('[data-open]'), function (icon) {
    icon.addEventListener('click', function (event) {
      event.preventDefault();
      var win = document.getElementById(icon.dataset.open);
      if (!win) { return; }
      win.hidden = false;
      win.classList.remove('shaded');
      focusWindow(win);
      layoutWindows();
      if (FLOW_LAYOUT.matches) { win.scrollIntoView({ block: 'start' }); }
    });
  });

  /* ------------------------------------------------------------- wallpaper -- */
  var WALLPAPER_KEY = 'hen_na_wallpaper';

  function applyWallpaper(name) {
    document.body.classList.toggle('wallpaper-stars', name === 'stars');
  }

  try { applyWallpaper(localStorage.getItem(WALLPAPER_KEY)); } catch (error) { /* no storage */ }

  var wallpaperToggle = document.getElementById('wallpaper-toggle');
  if (wallpaperToggle) {
    wallpaperToggle.addEventListener('click', function (event) {
      event.preventDefault();
      var next = document.body.classList.contains('wallpaper-stars') ? 'teal' : 'stars';
      applyWallpaper(next);
      try { localStorage.setItem(WALLPAPER_KEY, next); } catch (error) { /* no storage */ }
    });
  }

  /* ============================================================== content == */
  function renderPosts() {
    var host = document.getElementById('posts');
    if (!host) { return; }

    if (!posts.length) {
      host.appendChild(element('p', null, 'No entries yet.'));
      return;
    }

    posts.forEach(function (post, index) {
      var article = element('article', 'post');

      var head = element('div', 'post-head');
      head.appendChild(element('h2', null, post.title));
      var time = element('time', 'post-date', formatDate(post.date));
      time.dateTime = post.date;
      head.appendChild(time);
      article.appendChild(head);

      // "Current mood / listening to" — the header every diary entry had.
      if (post.mood || post.music) {
        var meta = element('p', 'post-meta');
        if (post.mood) {
          meta.appendChild(element('b', null, 'Current mood: '));
          meta.appendChild(document.createTextNode(post.mood));
        }
        if (post.mood && post.music) { meta.appendChild(document.createTextNode('  ·  ')); }
        if (post.music) {
          meta.appendChild(element('b', null, 'Listening to: '));
          meta.appendChild(document.createTextNode(post.music));
        }
        article.appendChild(meta);
      }

      (post.body || []).forEach(function (text) {
        article.appendChild(paragraph(text));
      });

      host.appendChild(article);
      if (index < posts.length - 1) { host.appendChild(element('hr', 'rainbow-hr')); }
    });
  }

  // A real count of this browser's visits, not a made-up global number.
  function renderCounter() {
    var host = document.getElementById('counter');
    if (!host) { return; }

    var visits = 1;
    try {
      visits = (parseInt(localStorage.getItem('hen_na_visits'), 10) || 0) + 1;
      localStorage.setItem('hen_na_visits', String(visits));
    } catch (error) {
      visits = 1;   // private window, blocked storage — show one and move on
    }

    var digits = String(Math.min(visits, 999999));
    while (digits.length < 6) { digits = '0' + digits; }

    host.textContent = '';
    digits.split('').forEach(function (digit) { host.appendChild(element('b', null, digit)); });
  }

  /* ------------------------------------------------------------ guestbook -- */
  var GUESTBOOK_KEY = 'hen_na_guestbook';
  var MAX_ENTRIES = 25;

  function readGuestbook() {
    try {
      var parsed = JSON.parse(localStorage.getItem(GUESTBOOK_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function renderGuestbook() {
    var list = document.getElementById('gb-entries');
    if (!list) { return; }

    var entries = readGuestbook();
    list.textContent = '';

    if (!entries.length) {
      list.appendChild(element('li', 'gb-entry', 'Nobody has signed yet. Be the first!'));
      return;
    }

    entries.forEach(function (entry) {
      var item = element('li', 'gb-entry');
      item.appendChild(element('b', null, entry.name));
      item.appendChild(document.createTextNode(' — '));
      var time = element('time', null, formatDate(entry.date));
      time.dateTime = entry.date;
      item.appendChild(time);
      item.appendChild(element('p', null, entry.message));
      list.appendChild(item);
    });
  }

  function wireGuestbook() {
    var form = document.getElementById('gb-form');
    if (!form) { return; }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = (form.elements.name.value || '').trim().slice(0, 40);
      var message = (form.elements.message.value || '').trim().slice(0, 500);
      if (!name || !message) { return; }

      var entries = readGuestbook();
      entries.unshift({ name: name, message: message, date: new Date().toISOString() });
      try {
        localStorage.setItem(GUESTBOOK_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
      } catch (error) {
        /* Storage unavailable: the entry still shows for this pageview. */
      }

      form.reset();
      renderGuestbook();
    });
  }

  /* ------------------------------------------------------------ cd player -- */
  // Type in the Track field and the player looks the song up, then fills in the
  // artist and the sleeve from the picked result.
  //
  // The lookup is the iTunes Search API: no key, no account, and it allows
  // browser requests directly — which Genius and Musixmatch both do not, and
  // whose keys could not be kept secret on a static page anyway. Nothing is
  // requested until someone actually types.
  var SEARCH_URL = 'https://itunes.apple.com/search?media=music&entity=song&limit=8&term=';
  var NOW_PLAYING_KEY = 'hen_na_nowplaying';

  var artistOut = document.getElementById('cd-artist');
  var trackInput = document.getElementById('cd-track');
  var resultList = document.getElementById('cd-results');
  var cover = document.getElementById('cd-cover');

  var results = [];
  var highlighted = -1;
  var searchTimer = 0;
  var inFlight = null;

  function showNowPlaying(artist, track, art) {
    if (artistOut) { artistOut.textContent = artist || '—'; }
    if (trackInput) { trackInput.value = track || ''; }
    if (cover) {
      if (art) { cover.src = art; cover.hidden = false; }
      else { cover.removeAttribute('src'); cover.hidden = true; }
    }
  }

  function closeResults() {
    if (!resultList) { return; }
    resultList.hidden = true;
    resultList.textContent = '';
    if (trackInput) { trackInput.setAttribute('aria-expanded', 'false'); }
    results = [];
    highlighted = -1;
  }

  function highlight(index) {
    var items = resultList.children;
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-selected', String(i === index));
    }
    highlighted = index;
    if (items[index] && items[index].scrollIntoView) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  function choose(index) {
    var hit = results[index];
    if (!hit) { return; }

    showNowPlaying(hit.artist, hit.track, hit.art);
    closeResults();

    try {
      localStorage.setItem(NOW_PLAYING_KEY, JSON.stringify(hit));
    } catch (error) {
      /* No storage — the pick still stands for this pageview. */
    }
  }

  function note(text) {
    resultList.textContent = '';
    resultList.appendChild(element('li', 'cd-note', text));
    resultList.hidden = false;
  }

  function renderResults() {
    resultList.textContent = '';

    results.forEach(function (hit, index) {
      var item = element('li');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');

      if (hit.thumb) {
        var art = document.createElement('img');
        art.src = hit.thumb;
        art.alt = '';
        art.loading = 'lazy';
        item.appendChild(art);
      }

      var text = element('span', 'cd-r-text');
      text.appendChild(element('span', 'cd-r-track', hit.track));
      text.appendChild(element('span', 'cd-r-artist', hit.artist));
      item.appendChild(text);

      // mousedown, not click: the input's blur would close the list first.
      item.addEventListener('mousedown', function (event) {
        event.preventDefault();
        choose(index);
      });
      item.addEventListener('mouseenter', function () { highlight(index); });

      resultList.appendChild(item);
    });

    resultList.hidden = false;
    trackInput.setAttribute('aria-expanded', 'true');
    highlighted = -1;
  }

  // Opened straight from disk (file://) the page has no real origin, so the
  // browser blocks the plain fetch outright. The API also answers as JSONP, and
  // a <script> tag is not subject to that restriction — so that is the fallback,
  // and it is what makes search work on a double-clicked file as well as on the
  // live site.
  var jsonpSeq = 0;

  function jsonp(url) {
    return new Promise(function (resolve, reject) {
      var name = 'cdSearch' + (++jsonpSeq);
      var script = document.createElement('script');
      var timer = window.setTimeout(function () { finish(); reject(new Error('timeout')); }, 9000);

      function finish() {
        window.clearTimeout(timer);
        try { delete window[name]; } catch (error) { window[name] = undefined; }
        if (script.parentNode) { script.parentNode.removeChild(script); }
      }

      window[name] = function (data) { finish(); resolve(data); };
      script.onerror = function () { finish(); reject(new Error('network')); };
      script.src = url + '&callback=' + name;
      document.head.appendChild(script);
    });
  }

  function requestSearch(query) {
    var url = SEARCH_URL + encodeURIComponent(query);

    // On file:// there is no point trying fetch at all — it always fails.
    if (location.protocol === 'file:') { return jsonp(url); }

    if (inFlight) { inFlight.abort(); }
    inFlight = typeof AbortController === 'function' ? new AbortController() : null;

    return fetch(url, inFlight ? { signal: inFlight.signal } : undefined)
      .then(function (response) {
        if (!response.ok) { throw new Error('search failed'); }
        return response.json();
      })
      .catch(function (error) {
        if (error && error.name === 'AbortError') { throw error; }
        return jsonp(url);   // blocked or offline — try the script route
      });
  }

  function search(query) {
    requestSearch(query)
      .then(function (data) {
        results = (data.results || []).map(function (row) {
          var thumb = row.artworkUrl100 || row.artworkUrl60 || '';
          return {
            track: row.trackName || '',
            artist: row.artistName || '',
            thumb: thumb,
            // The size lives in the filename, so a bigger sleeve is a swap away.
            art: thumb ? thumb.replace('100x100bb', '300x300bb') : ''
          };
        }).filter(function (hit) { return hit.track && hit.artist; });

        if (!results.length) { note('nothing found'); return; }
        renderResults();
      })
      .catch(function (error) {
        if (error && error.name === 'AbortError') { return; }
        results = [];
        note('search unavailable');
      });
  }

  function wireCdPlayer() {
    if (!trackInput || !resultList) { return; }

    trackInput.addEventListener('input', function () {
      var query = trackInput.value.trim();
      window.clearTimeout(searchTimer);

      if (query.length < 2) { closeResults(); return; }
      // Debounced: one request after the typing stops, not one per keystroke.
      searchTimer = window.setTimeout(function () { search(query); }, 320);
    });

    trackInput.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeResults(); return; }
      if (resultList.hidden || !results.length) { return; }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        highlight((highlighted + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        highlight((highlighted - 1 + results.length) % results.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        choose(highlighted >= 0 ? highlighted : 0);
      }
    });

    trackInput.addEventListener('blur', function () {
      window.setTimeout(closeResults, 120);
    });
  }

  /* -------------------------------------------------------- transport keys -- */
  // Nothing is played — there is no audio here and never was. The keys move the
  // needle and press in, which is all a CD Player on a webpage ever did.
  function wireTransport() {
    var keys = document.querySelector('.cd-keys');
    var needle = document.getElementById('cd-seek');
    var playKey = document.getElementById('cd-play');
    if (!keys || !needle) { return; }

    var position = 0;      // 0-100, where the needle sits
    var ticker = 0;

    function place() {
      needle.style.left = 'calc(' + position + '% - ' + (position / 100 * 8) + 'px)';
    }

    function stopTicking() {
      window.clearInterval(ticker);
      ticker = 0;
      if (playKey) {
        playKey.setAttribute('aria-pressed', 'false');
        playKey.innerHTML = '&#9654;';
        playKey.setAttribute('aria-label', 'Play');
      }
    }

    function startTicking() {
      if (ticker) { return; }
      ticker = window.setInterval(function () {
        position = Math.min(100, position + 0.9);
        place();
        if (position >= 100) { stopTicking(); }
      }, 400);
      if (playKey) {
        playKey.setAttribute('aria-pressed', 'true');
        playKey.innerHTML = '&#10074;&#10074;';
        playKey.setAttribute('aria-label', 'Pause');
      }
    }

    keys.addEventListener('click', function (event) {
      var key = event.target.closest('[data-cd]');
      if (!key) { return; }
      var action = key.dataset.cd;

      if (action === 'play') {
        if (ticker) { stopTicking(); } else { startTicking(); }
      } else if (action === 'stop') {
        stopTicking();
        position = 0;
        place();
      } else if (action === 'rew') {
        position = Math.max(0, position - 8);
        place();
      } else if (action === 'ff') {
        position = Math.min(100, position + 8);
        place();
      } else if (action === 'rec') {
        key.classList.add('blinking');
        window.setTimeout(function () { key.classList.remove('blinking'); }, 500);
      }
    });

    place();
  }

  // On load: the visitor's own pick wins, otherwise whatever the author set in
  // window.BLOG_NOW_PLAYING ("Artist — Track").
  function renderNowPlaying() {
    if (!artistOut || !trackInput) { return; }

    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(NOW_PLAYING_KEY) || 'null');
    } catch (error) {
      saved = null;
    }

    if (saved && saved.track) {
      showNowPlaying(saved.artist, saved.track, saved.art);
      return;
    }

    var playing = typeof window.BLOG_NOW_PLAYING === 'string' ? window.BLOG_NOW_PLAYING.trim() : '';
    if (!playing) { showNowPlaying('', '', ''); return; }

    // Hyphen, en dash or em dash, whichever the author typed.
    var split = playing.split(/\s+[—–-]\s+/);
    showNowPlaying(split[0] || playing, split.slice(1).join(' - '), '');
  }

  renderPosts();
  renderCounter();
  renderGuestbook();
  wireGuestbook();
  renderNowPlaying();
  wireCdPlayer();
  wireTransport();

})();
