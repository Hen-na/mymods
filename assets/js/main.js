/* ==========================================================================
   Site behaviour — plain ES2015+, no dependencies.
   Replaces jQuery, Popper, Bootstrap JS, Owl Carousel, ScrollReveal,
   Waypoints, CounterUp, imgFix, MixItUp, accordions and AOS.

   Release data comes from assets/data/versions.js (window.LIDAR_VERSIONS).
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var releases = Array.isArray(window.LIDAR_VERSIONS) ? window.LIDAR_VERSIONS : [];

  /* ------------------------------------------------- latest release data -- */
  // Every "1.0.0", "26.2", download href and so on on the page is written from
  // the first entry of the release list, so a new release only has to be added
  // in one file.
  function fileName(path) {
    return String(path || '').split('/').pop();
  }

  function applyLatest() {
    var latest = releases[0];
    if (!latest) { return; }

    var values = {
      version: latest.version,
      minecraft: latest.minecraft,
      loader: latest.loader,
      fabricApi: latest.fabricApi,
      java: latest.java,
      size: latest.size,
      jarName: fileName(latest.jar)
    };

    Array.prototype.forEach.call(document.querySelectorAll('[data-latest]'), function (el) {
      var value = values[el.dataset.latest];
      if (value) { el.textContent = value; }
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-latest-jar]'), function (el) {
      if (latest.jar) { el.href = latest.jar; }
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-latest-sources]'), function (el) {
      if (latest.sources) { el.href = latest.sources; }
      el.hidden = !latest.sources;
    });
  }

  /* ------------------------------------------------------ version archive -- */
  function formatDate(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) { return iso || ''; }
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  function specRow(term, value) {
    var row = document.createElement('div');
    row.appendChild(element('dt', null, term));
    row.appendChild(element('dd', null, value));
    return row;
  }

  function downloadLink(href, label, primary) {
    var link = element('a', 'btn ' + (primary ? 'btn-primary' : 'btn-ghost'));
    link.href = href;
    link.setAttribute('download', '');

    if (primary) {
      var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', '#i-down');
      icon.setAttribute('aria-hidden', 'true');
      icon.appendChild(use);
      link.appendChild(icon);
    }

    // Wrapped, not a bare text node: .btn > * is what lifts content above the
    // gel highlight, and a text node cannot be lifted.
    link.appendChild(element('span', null, label));
    return link;
  }

  function renderRelease(release, isLatest) {
    var item = element('li', 'release glass reveal' + (isLatest ? ' is-latest' : ''));

    var head = element('div', 'release-head');
    var title = element('h2', null, 'v' + release.version);
    var badge = element('span', 'badge ' + (isLatest ? 'badge-latest' : 'badge-legacy'),
      isLatest ? 'Latest' : 'Legacy');

    title.appendChild(badge);
    head.appendChild(title);

    if (release.date) {
      var time = element('time', 'release-date', formatDate(release.date));
      time.dateTime = release.date;
      head.appendChild(time);
    }

    item.appendChild(head);

    if (release.summary) { item.appendChild(element('p', 'release-summary', release.summary)); }

    var specs = element('dl', 'specs release-specs');
    specs.appendChild(specRow('Minecraft', release.minecraft));
    specs.appendChild(specRow('Fabric Loader', release.loader));
    if (release.fabricApi) { specs.appendChild(specRow('Fabric API', release.fabricApi)); }
    if (release.java) { specs.appendChild(specRow('Java', release.java)); }
    if (release.size) { specs.appendChild(specRow('Size', release.size)); }
    item.appendChild(specs);

    if (release.changes && release.changes.length) {
      item.appendChild(element('h3', 'changes-title', isLatest ? 'In this build' : 'Changes'));
      var list = element('ul', 'changes');
      release.changes.forEach(function (line) { list.appendChild(element('li', null, line)); });
      item.appendChild(list);
    }

    var actions = element('div', 'release-actions');
    if (release.jar) {
      actions.appendChild(downloadLink(release.jar, fileName(release.jar), isLatest));
    }
    if (release.sources) {
      actions.appendChild(downloadLink(release.sources, 'Sources', false));
    }
    item.appendChild(actions);

    return item;
  }

  function renderArchive() {
    var list = document.getElementById('version-list');
    if (!list) { return; }

    if (!releases.length) {
      list.parentNode.replaceChild(
        element('p', 'muted', 'No releases published yet.'), list);
      return;
    }

    releases.forEach(function (release, index) {
      list.appendChild(renderRelease(release, index === 0));
    });

    // Only one release so far: say so instead of leaving the page looking cut off.
    if (releases.length === 1) {
      var note = element('p', 'archive-note muted',
        'That is the whole history so far — ' + releases[0].version + ' is the first public build. '
        + 'Older releases will be listed here as newer ones replace them.');
      list.parentNode.appendChild(note);
    }
  }

  applyLatest();
  renderArchive();

  /* ------------------------------------------------------ scroll reveal -- */
  // Runs after the archive is built, so generated cards animate in too.
  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-visible'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el, index) {
      el.style.transitionDelay = (index % 3) * 90 + 'ms';
      revealer.observe(el);
    });
  }


  /* ------------------------------------------------------- guestbook bubble -- */
  // The newest signatures, shown as speech bubbles in the sidebar. The address
  // comes from assets/data/versions.js; with none set the block simply never
  // appears, so the page is unchanged for anyone not running the Worker.
  var GUESTBOOK_API = (typeof window.GUESTBOOK_API === 'string' && window.GUESTBOOK_API.trim())
    ? window.GUESTBOOK_API.trim().replace(/\/+$/, '') + '/guestbook'
    : '';
  // How many bubbles stand open; the rest wait behind the "more" button.
  var BUBBLES_SHOWN = 3;

  // SQLite writes datetime('now') as "2026-09-05 18:20:00" — UTC, but with no
  // marker saying so. Handed to the browser as-is it would be read as local
  // time and land hours off, so the zone is spelled out before parsing.
  function signedAt(value) {
    var raw = String(value || '').trim();
    if (!raw) { return null; }

    var iso = raw.replace(' ', 'T');
    if (!/(Z|[+-]\d{2}:?\d{2})$/i.test(iso)) { iso += 'Z'; }

    var date = new Date(iso);
    if (isNaN(date.getTime())) { return null; }

    return {
      iso: date.toISOString(),
      label: date.toLocaleString(undefined, {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      })
    };
  }

  function bubbleItem(entry) {
    var item = element('li', 'bubble');
    item.appendChild(element('p', 'bubble-text', entry.message));

    var foot = element('p', 'bubble-who');
    foot.appendChild(element('span', 'bubble-name', entry.name));

    var stamp = signedAt(entry.created);
    if (stamp) {
      var when = element('time', 'bubble-when', stamp.label);
      when.dateTime = stamp.iso;
      foot.appendChild(when);
    }

    item.appendChild(foot);
    return item;
  }

  function renderBubbles() {
    var block = document.getElementById('gb-bubble');
    var list = document.getElementById('gb-bubble-list');
    var note = document.getElementById('gb-bubble-note');
    var more = document.getElementById('gb-bubble-more');
    if (!block || !list || !GUESTBOOK_API) { return; }

    function say(text) {
      if (!note) { return; }
      note.textContent = text;
      note.hidden = !text;
    }

    // "Sign it" has to be reachable whether or not anybody has signed yet —
    // an empty guestbook is precisely when the invitation matters — so the
    // block appears as soon as there is a guestbook to point at, and only the
    // list inside it waits for the answer.
    block.hidden = false;

    fetch(GUESTBOOK_API)
      .then(function (response) { return response.json(); })
      .then(function (data) {
        var entries = data.entries || [];
        list.textContent = '';

        if (!entries.length) {
          say('Nobody has signed it yet — be the first.');
          return;
        }
        say('');

        entries.forEach(function (entry, index) {
          var item = bubbleItem(entry);
          // Everything past the fold is built now and merely hidden: the whole
          // list arrived in one response, so "more" costs an attribute rather
          // than a second request.
          if (index >= BUBBLES_SHOWN) { item.hidden = true; }
          list.appendChild(item);
        });

        if (!more || entries.length <= BUBBLES_SHOWN) { return; }

        var label = more.querySelector('span') || more;
        var rest = entries.length - BUBBLES_SHOWN;
        var open = false;

        label.textContent = rest + ' more';
        more.hidden = false;
        more.addEventListener('click', function () {
          open = !open;
          for (var i = BUBBLES_SHOWN; i < list.children.length; i += 1) {
            list.children[i].hidden = !open;
          }
          label.textContent = open ? 'Show fewer' : rest + ' more';
        });
      })
      .catch(function () {
        // Unreachable. The block stays, because the link to the guestbook is
        // still good — only the signatures are missing.
        say('Signatures are not loading right now.');
      });
  }

  renderBubbles();

  /* -------------------------------------------------- active nav marker -- */
  var sections = document.querySelectorAll('section[id]');
  // The sidebar is the whole navigation now. Links without a hash are included
  // so a plain "index.html" entry drops its highlight once a section takes over.
  var navLinks = document.querySelectorAll('.side-nav a');

  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        Array.prototype.forEach.call(navLinks, function (link) {
          var hash = (link.getAttribute('href') || '').split('#')[1];
          link.classList.toggle('active', hash === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Array.prototype.forEach.call(sections, function (section) { spy.observe(section); });
  }

  /* --------------------------------------------- LiDAR point-cloud demo -- */
  // A miniature of what the mod does: the cursor *is* the scanner. A pulse
  // expands from wherever the pointer is, lights up only the geometry it
  // crosses there, and those points fade out over the next few seconds — so
  // moving the mouse paints the room in. Hue follows depth, exactly like the
  // in-game colour table.
  var canvas = document.getElementById('lidar-canvas');

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var points = buildRoom();
    var dpr = 1;
    var width = 0;
    var height = 0;
    var running = false;
    var frame = 0;
    var start = 0;

    function buildRoom() {
      // A corridor of five planes plus a couple of floating blocks, sampled on a
      // jittered grid so the result reads as scanned surfaces, not as noise.
      var list = [];
      var random = mulberry32(20261003);

      var planes = [
        { o: [-9, -3.2, 2], u: [0, 0, 26], v: [0, 6.4, 0] },   // left wall
        { o: [9, -3.2, 2], u: [0, 0, 26], v: [0, 6.4, 0] },    // right wall
        { o: [-9, -3.2, 2], u: [18, 0, 0], v: [0, 0, 26] },    // floor
        { o: [-9, 3.2, 2], u: [18, 0, 0], v: [0, 0, 26] },     // ceiling
        { o: [-9, -3.2, 28], u: [18, 0, 0], v: [0, 6.4, 0] }   // back wall
      ];

      planes.forEach(function (plane) {
        for (var i = 0; i < 800; i++) {
          var a = random();
          var b = random();
          list.push({
            x: plane.o[0] + plane.u[0] * a + plane.v[0] * b,
            y: plane.o[1] + plane.u[1] * a + plane.v[1] * b,
            z: plane.o[2] + plane.u[2] * a + plane.v[2] * b,
            lit: -1e9
          });
        }
      });

      // Two blocks in the corridor, so the sweep has something to wrap around.
      [[-3.4, -2.2, 11, 2.2], [4.2, -2.6, 18, 3]].forEach(function (box) {
        for (var i = 0; i < 420; i++) {
          var face = Math.floor(random() * 5);
          var a = random() * box[3];
          var b = random() * box[3];
          var p = { x: box[0], y: box[1], z: box[2], lit: -1e9 };
          if (face === 0) { p.x += a; p.y += b; }
          else if (face === 1) { p.x += a; p.y += b; p.z += box[3]; }
          else if (face === 2) { p.z += a; p.y += b; }
          else if (face === 3) { p.z += a; p.y += b; p.x += box[3]; }
          else { p.x += a; p.z += b; p.y += box[3]; }
          list.push(p);
        }
      });

      return list;
    }

    // Small deterministic PRNG, so the cloud looks the same on every load.
    function mulberry32(seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Until the visitor moves the mouse the scan sits in the middle of the hero.
      if (!pointerMoved) {
        pointer.x = width / 2;
        pointer.y = height / 2;
      }
    }

    var SWEEP_SECONDS = 1.2;   // matches the mod's repeating pulse, slowed for the web
    var MEMORY_SECONDS = 5;    // points fade instead of living 6000 ticks

    // How far from the cursor the scan reaches. Everything outside stays dark,
    // so the pointer reads as a torch rather than a global light switch.
    function revealRadius() {
      return Math.min(Math.max(Math.min(width, height) * 0.34, 120), 300);
    }

    // Cursor in canvas space. Starts at the centre so the hero is not empty
    // before the visitor has moved the mouse.
    var pointer = { x: 0, y: 0, active: true };
    var pointerMoved = false;

    var stage = document.getElementById('scan-stage');

    function trackPointer(event) {
      var box = canvas.getBoundingClientRect();
      if (!pointerMoved && stage) { stage.classList.add('scanned'); }   // retires the hint
      pointerMoved = true;
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      // Only scan while the pointer is actually over the canvas.
      pointer.active = pointer.x >= 0 && pointer.x <= box.width
        && pointer.y >= 0 && pointer.y <= box.height;
    }

    window.addEventListener('pointermove', trackPointer, { passive: true });
    window.addEventListener('pointerdown', trackPointer, { passive: true });
    document.addEventListener('pointerleave', function () { pointer.active = false; });

    /* Colour strings are the expensive part of the loop: building and parsing
       an hsla() string per point, thousands of times a frame, costs more than
       the drawing does. Hue and fade are quantised into a small table instead,
       built once. */
    var HUES = 30;
    var FADES = 8;
    function buildPalette(lightness) {
      var table = [];
      for (var h = 0; h < HUES; h++) {
        for (var f = 0; f < FADES; f++) {
          table.push('hsla(' + Math.round(h / (HUES - 1) * 265) + ', 100%, ' + lightness + '%, ' +
                     (0.85 * (1 - f / FADES)).toFixed(2) + ')');
        }
      }
      return table;
    }

    var palette = buildPalette(58);
    // Freshly lit points flare brighter — but keep their depth colour, which is
    // the whole point of the gradient.
    var freshPalette = buildPalette(78);

    /* The sweep reads the same at 30fps and costs half as much as at 60. */
    var FRAME_MS = 1000 / 30;
    var lastFrame = 0;

    function draw(now) {
      if (!running) { return; }

      if (now - lastFrame < FRAME_MS) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;

      var time = (now - start) / 1000;
      // Sized so the corridor fills the window frame it now sits in.
      var focal = Math.max(width, height, 520) * 0.42;
      var cx = width / 2;
      var cy = height / 2;
      var reveal = revealRadius();
      var ring = (time % SWEEP_SECONDS) / SWEEP_SECONDS * reveal;
      var band = reveal * 0.18;

      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        if (p.z <= 0.6) { continue; }

        var sx = cx + p.x * focal / p.z;
        var sy = cy - p.y * focal / p.z;
        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) { continue; }

        // Points light up only where the pulse from the cursor reaches them:
        // inside the expanding ring, or in the bright core right under it.
        if (pointer.active) {
          var reach = Math.hypot(sx - pointer.x, sy - pointer.y);
          if (reach < reveal && (Math.abs(reach - ring) < band || reach < 16)) { p.lit = time; }
        }

        var age = time - p.lit;
        if (age > MEMORY_SECONDS) { continue; }

        // Table lookup instead of building a colour string per point.
        var hueStep = (Math.min(p.z / 28, 1) * (HUES - 1)) | 0;      // red near, violet far
        var fadeStep = (age / MEMORY_SECONDS * FADES) | 0;
        if (fadeStep >= FADES) { fadeStep = FADES - 1; }

        var slot = hueStep * FADES + fadeStep;
        ctx.fillStyle = age < 0.12 ? freshPalette[slot] : palette[slot];
        ctx.fillRect(sx, sy, p.z < 12 ? 2 : 1.4, p.z < 12 ? 2 : 1.4);
      }

      frame = window.requestAnimationFrame(draw);
    }

    var inView = true;

    function play() {
      if (running) { return; }
      running = true;
      start = performance.now();
      // The clock restarts with the loop, so stale timestamps are cleared too.
      points.forEach(function (p) { p.lit = -1e9; });
      frame = window.requestAnimationFrame(draw);
    }

    function pause() {
      running = false;
      window.cancelAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      // One static frame: everything lit, no animation loop.
      start = performance.now();
      points.forEach(function (p) { p.lit = 0; });
      running = true;
      draw(start);
      pause();
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          if (inView && !document.hidden) { play(); } else { pause(); }
        });
      }, { threshold: 0.05 }).observe(canvas);
    } else {
      play();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { pause(); } else if (inView && !reduceMotion) { play(); }
    });
  }

})();
