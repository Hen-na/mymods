/**
 * Genius proxy — a Cloudflare Worker.
 *
 * Why this exists: the Genius access token identifies the account, not the
 * data. In the page anyone could lift it from view-source and spend the rate
 * limit under your name, and genius.com refuses cross-site requests from a
 * browser anyway. So the token lives here, as a Worker secret.
 *
 * What it returns: the song's description and its annotations — the line-by-line
 * notes Genius users write. NOT the lyrics: the Genius API does not serve them
 * on any plan, because their agreements with publishers do not allow it.
 *
 * Annotations quote the line they explain, so the number of them is capped:
 * a handful of quoted lines is commentary, a hundred of them would be the song.
 *
 * Deploy: see worker/README.md
 */

import { listEntries, addEntry, deleteEntry } from './guestbook.js';

/* Add or remove sites here — these are the only origins the proxy answers.
 *
 * The http:// entries are a stopgap. GitHub Pages cannot issue a certificate
 * for heppa.online while its DNS still points at a non-GitHub address, so the
 * site currently loads over plain http and the browser sends that as its
 * origin. Once the stray A record is gone and "Enforce HTTPS" is on, delete
 * the two http lines and redeploy — the site will never be on them again. */
const ALLOWED_ORIGINS = [
  'https://www.heppa.online',
  'https://heppa.online',
  'http://www.heppa.online',
  'http://heppa.online',
  'http://localhost:8099'
];

/**
 * How many annotations to keep. Most referents Genius returns carry no written
 * annotation at all, so the request asks for a lot and this is what survives
 * the filter. The page shows a handful of these at a time, picked at random.
 * Kept well short of a whole song on purpose: these are quoted lines with
 * commentary, not a way to reassemble the lyrics.
 */
const MAX_ANNOTATIONS = 25;

/* Referents per API page. 50 is the maximum Genius allows. */
const PER_PAGE = 50;

/* Songs do not change. A day of edge cache keeps the rate limit comfortable. */
const CACHE_SECONDS = 60 * 60 * 24;

/**
 * Bump this whenever the shape of the response changes. Without it a deploy
 * would keep serving yesterday's answers — in the old format — for a full day.
 */
const CACHE_VERSION = 'v2';

const API = 'https://api.genius.com';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, origin, cacheSeconds) {
  const cache = cacheSeconds === undefined ? CACHE_SECONDS : cacheSeconds;
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache > 0 ? 'public, max-age=' + cache : 'no-store',
      ...corsHeaders(origin)
    }
  });
}

function genius(path, token) {
  return fetch(API + path, {
    headers: { Authorization: 'Bearer ' + token },
    cf: { cacheTtl: CACHE_SECONDS }
  }).then((response) => response.json());
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: allowed ? 204 : 403, headers: allowed ? corsHeaders(origin) : {} });
    }
    if (!allowed) {
      // No CORS headers on purpose: an unknown site gets nothing usable.
      return new Response('Forbidden', { status: 403 });
    }
    const url = new URL(request.url);

    /* ---------------------------------------------------------- guestbook -- */
    // Same Worker, second job. The site talks to <worker>/guestbook.
    if (url.pathname === '/guestbook') {
      if (!env.DB) {
        return json({ error: 'no_database', detail: 'D1 binding DB is missing' }, 500, origin, 0);
      }

      try {
        if (request.method === 'GET') {
          return json({ entries: await listEntries(env) }, 200, origin, 0);
        }

        if (request.method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const result = await addEntry(env, request, body);
          return json(result, result.ok ? 200 : (result.status || 400), origin, 0);
        }

        if (request.method === 'DELETE') {
          const result = await deleteEntry(env, request, url.searchParams.get('id'));
          return json(result, result.ok ? 200 : (result.status || 403), origin, 0);
        }
      } catch (error) {
        return json({ error: 'guestbook_failed', detail: String(error).slice(0, 200) }, 500, origin, 0);
      }

      return new Response('Method not allowed', { status: 405 });
    }

    /* ------------------------------------------------------------ genius -- */
    if (!env.GENIUS_TOKEN) {
      return json({ error: 'no_key', detail: 'GENIUS_TOKEN secret is not set' }, 500, origin);
    }

    const artist = (url.searchParams.get('artist') || '').trim().slice(0, 120);
    const track = (url.searchParams.get('track') || '').trim().slice(0, 120);

    if (!artist || !track) {
      return json({ error: 'bad_request', detail: 'artist and track are required' }, 400, origin);
    }

    const cacheKey = new Request(
      'https://genius.cache/' + CACHE_VERSION +
      '/' + encodeURIComponent(artist.toLowerCase()) +
      '/' + encodeURIComponent(track.toLowerCase())
    );
    const cache = caches.default;

    const cached = await cache.match(cacheKey);
    if (cached) {
      return json(await cached.json(), 200, origin);
    }

    try {
      // 1. Find the song.
      const found = await genius('/search?q=' + encodeURIComponent(artist + ' ' + track), env.GENIUS_TOKEN);

      if (found?.meta?.status === 401) {
        return json({ error: 'bad_token' }, 401, origin);
      }

      const hits = found?.response?.hits || [];
      const song = hits.find((hit) => hit.type === 'song')?.result;
      if (!song) {
        return json({ error: 'not_found' }, 404, origin);
      }

      // 2. Full record, for the "About" text.
      const detail = await genius('/songs/' + song.id + '?text_format=plain', env.GENIUS_TOKEN);
      const full = detail?.response?.song || {};

      // 3. The annotations themselves.
      const referents = await genius(
        '/referents?song_id=' + song.id + '&text_format=plain&per_page=' + PER_PAGE,
        env.GENIUS_TOKEN
      );

      const annotations = (referents?.response?.referents || [])
        .map((referent) => ({
          fragment: (referent.fragment || '').trim(),
          note: (referent.annotations?.[0]?.body?.plain || '').trim()
        }))
        .filter((item) => item.fragment && item.note)
        .slice(0, MAX_ANNOTATIONS);

      const description = (full.description?.plain || '').trim();

      // Credits: producers and writers come as their own fields, everything
      // else — mastering, mixing, art direction, video — sits in
      // custom_performances, whatever the song's contributors filled in.
      const names = (list) => (list || []).map((entry) => entry?.name).filter(Boolean).slice(0, 6);
      const credits = [];

      if (full.producer_artists?.length) {
        credits.push({ role: 'Produced by', names: names(full.producer_artists) });
      }
      if (full.writer_artists?.length) {
        credits.push({ role: 'Written by', names: names(full.writer_artists) });
      }
      (full.custom_performances || []).forEach((performance) => {
        const people = names(performance.artists);
        if (performance.label && people.length) {
          credits.push({ role: performance.label, names: people });
        }
      });

      // What this song borrows from, and what borrowed from it.
      const relationships = (full.song_relationships || [])
        .filter((item) => (item.songs || []).length && item.relationship_type)
        .map((item) => ({
          type: item.relationship_type,
          songs: item.songs.slice(0, 3).map((other) => ({
            title: other.title || '',
            artist: other.primary_artist?.name || '',
            url: other.url || ''
          }))
        }))
        .slice(0, 5);

      const body = {
        title: song.title || track,
        artist: song.primary_artist?.name || artist,
        url: song.url || '',
        art: song.song_art_image_url || song.header_image_url || '',
        released: full.release_date_for_display || '',
        // "?" is the placeholder Genius stores when a song has no description.
        description: description === '?' ? '' : description,
        album: full.album ? { name: full.album.name || '', url: full.album.url || '' } : null,
        recordedAt: full.recording_location || '',
        credits: credits.slice(0, 12),
        relationships,
        media: (full.media || [])
          .filter((item) => item.url && item.provider)
          .map((item) => ({ provider: item.provider, url: item.url }))
          .slice(0, 4),
        annotations
      };

      ctx.waitUntil(cache.put(cacheKey, json(body, 200, origin).clone()));
      return json(body, 200, origin);
    } catch (error) {
      return json({ error: 'upstream_unreachable' }, 502, origin);
    }
  }
};
