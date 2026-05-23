CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'image/jpeg',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
