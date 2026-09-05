/* ==========================================================================
   Blog entries. Newest first — add a new object at the top and it appears.

   These first two are STARTER DRAFTS written from the mod's source: rewrite
   them in your own voice, they are only here so the layout has something real
   to hold. "mood" and "music" are the old blog convention; set them to
   whatever you like, or delete the fields and the line disappears.
   ========================================================================== */
/* Shown in the CD Player window. Format: 'Artist — Track'. Leave it empty and
   the player just says there is nothing playing. */
window.BLOG_NOW_PLAYING = '';

window.BLOG_POSTS = [
  {
    date: '2026-09-05',
    title: 'The site got a time machine',
    mood: 'nostalgic',
    music: '',
    body: [
      'Ripped out about 1.2 MB of libraries from the old template — jQuery, Bootstrap, Owl Carousel, ' +
      'MixItUp, an accordion script that was never even called. Everything it actually did now fits in ' +
      'one stylesheet and one 16 KB script.',

      'Then I put the whole thing in glass. Sky, grass, bubbles, gel buttons, window frames — and not ' +
      'one image file: it is all gradients. The scanner demo lives in an Aero window now, and the point ' +
      'cloud only lights up around your cursor, so you paint the room in by moving the mouse.',

      'And this page, because a site without a blog is just a brochure. No frameworks here either. ' +
      'View source if you like, there is not much to see.'
    ]
  },
  {
    date: '2026-08-09',
    title: 'LiDAR Scanner 1.0.0 is out',
    mood: 'wired',
    music: '',
    body: [
      'First public build. Hold right mouse button and the scanner fires 110 raycasts a tick into an ' +
      'expanding ring, and every surface they touch becomes a point that hangs around for 6000 ticks ' +
      'before fading. The world itself renders black, so the cloud is the only thing you can see.',

      'The part I am happiest with is boring: the points live in flat primitive arrays with a ring ' +
      'cursor and a long-keyed index that collapses repeat hits onto the same slot. 200 000 points, a ' +
      'few megabytes, and drawing them is a straight array walk with no per-point objects.',

      'Mobs are sampled from their own render model, so a spider keeps its legs and a creeper its four ' +
      'feet. Nothing about the entity is touched — it is read, and points are written. That is all.',

      'Grab it from the versions page. Fabric, Minecraft 26.2, CC0 — do whatever you want with it.'
    ]
  }
];
