/* Адрес Cloudflare Worker с гостевой книгой. Пусто — блок с записями на
   главной просто не появляется. Как поднять: worker/README.md
   Пример: window.GUESTBOOK_API = 'https://genius-proxy.ТВОЙ-ЛОГИН.workers.dev'; */
window.GUESTBOOK_API = 'https://genius-proxy.osked7002.workers.dev';

/* ==========================================================================
   The one place release data lives. Both the front page and the version
   archive read this file, so nothing has to be edited in two places.

   To publish a new release:
     1. drop the jars in assets/downloads/
     2. add an entry at the TOP of the array below (newest first)
   Nothing else needs touching — the pages build themselves from this list.
   ========================================================================== */
window.LIDAR_VERSIONS = [
  {
    version: '1.0.0',
    date: '2026-08-09',          // ISO, rendered per the visitor's locale
    minecraft: '26.2',
    loader: '0.19.3+',
    fabricApi: '0.156.0+26.2',
    java: '25',
    size: '31 KB',
    jar: 'assets/downloads/lidar-scanner-1.0.0.jar',
    sources: 'assets/downloads/lidar-scanner-1.0.0-sources.jar',
    summary: 'First public build. Everything the scanner does today shipped in this release.',
    changes: [
      'LiDAR Scanner item, added to the vanilla Tools & Utilities creative tab',
      'Hold-RMB scanning: expanding red pulse, beam and cone sampling on one clock',
      'Point cloud of up to 200 000 points with a 6000-tick memory and ring-buffer recycling',
      'Mob silhouettes sampled from each entity\'s own render model and pose',
      'Depth colouring across a 32-block red-to-violet gradient',
      'Scanner HUD with status, range, live point count and a memory bar',
      'Vision toggle bound to R'
    ]
  }
];
