-- Guestbook storage. Applied once with:
--   npx.cmd wrangler d1 execute hennablog --remote --file=schema.sql

CREATE TABLE IF NOT EXISTS entries (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  message  TEXT NOT NULL,
  created  TEXT NOT NULL,
  -- Only a salted hash of the address, and only so posting can be rate
  -- limited. It cannot be turned back into an IP.
  ip_hash  TEXT
);

-- Newest first is the only way this table is ever read.
CREATE INDEX IF NOT EXISTS idx_entries_id ON entries (id DESC);

-- Rate limiting counts recent rows from one hash.
CREATE INDEX IF NOT EXISTS idx_entries_ip ON entries (ip_hash, created);
