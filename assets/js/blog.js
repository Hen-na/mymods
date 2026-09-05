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

      (post.body || []).forEach(function (paragraph) {
        article.appendChild(element('p', null, paragraph));
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
  // Set window.BLOG_NOW_PLAYING in assets/data/posts.js to fill this in.
  function renderNowPlaying() {
    var artistOut = document.getElementById('cd-artist');
    var trackOut = document.getElementById('cd-track');
    if (!artistOut || !trackOut) { return; }

    var playing = typeof window.BLOG_NOW_PLAYING === 'string' ? window.BLOG_NOW_PLAYING.trim() : '';
    if (!playing) {
      artistOut.textContent = '—';
      trackOut.textContent = 'nothing right now';
      return;
    }

    var split = playing.split(/\s+[—-]\s+/);   // "Artist — Track" or "Artist - Track"
    artistOut.textContent = split[0] || playing;
    trackOut.textContent = split.slice(1).join(' - ') || '—';
  }

  renderPosts();
  renderCounter();
  renderGuestbook();
  wireGuestbook();
  renderNowPlaying();

})();
