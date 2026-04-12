/**
 * design-db.mjs
 * RAM Design Studio — Design Vector Database
 *
 * Two-layer search:
 *   Layer 1: SQLite FTS5 — keyword/phrase recall
 *   Layer 2: TF-IDF cosine similarity — ranked relevance
 *
 * No external API needed. All computation is local.
 *
 * Usage:
 *   import { openDB, upsertDesign, searchDesigns, getAllDesigns } from './design-db.mjs';
 *   const db = openDB();
 *   const results = searchDesigns(db, 'dark sleep recovery app');
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, 'designs.db');

// ─── Schema ───────────────────────────────────────────────────────────────────

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS designs (
    id           TEXT PRIMARY KEY,
    app_name     TEXT NOT NULL,
    tagline      TEXT DEFAULT '',
    archetype    TEXT DEFAULT '',
    prompt       TEXT DEFAULT '',
    design_url   TEXT DEFAULT '',
    mock_url     TEXT DEFAULT '',
    credit       TEXT DEFAULT '',
    published_at TEXT DEFAULT '',
    submitted_at TEXT DEFAULT '',
    screens      INTEGER DEFAULT 10,
    source       TEXT DEFAULT 'heartbeat',
    search_text  TEXT DEFAULT '',
    embedding    TEXT DEFAULT '[]'
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS designs_fts USING fts5(
    app_name, tagline, archetype, prompt, search_text,
    content='designs',
    content_rowid='rowid',
    tokenize='unicode61 remove_diacritics 1'
  );

  CREATE TRIGGER IF NOT EXISTS designs_ai AFTER INSERT ON designs BEGIN
    INSERT INTO designs_fts(rowid, app_name, tagline, archetype, prompt, search_text)
    VALUES (new.rowid, new.app_name, new.tagline, new.archetype, new.prompt, new.search_text);
  END;

  CREATE TRIGGER IF NOT EXISTS designs_ad AFTER DELETE ON designs BEGIN
    INSERT INTO designs_fts(designs_fts, rowid, app_name, tagline, archetype, prompt, search_text)
    VALUES ('delete', old.rowid, old.app_name, old.tagline, old.archetype, old.prompt, old.search_text);
  END;

  CREATE TRIGGER IF NOT EXISTS designs_au AFTER UPDATE ON designs BEGIN
    INSERT INTO designs_fts(designs_fts, rowid, app_name, tagline, archetype, prompt, search_text)
    VALUES ('delete', old.rowid, old.app_name, old.tagline, old.archetype, old.prompt, old.search_text);
    INSERT INTO designs_fts(rowid, app_name, tagline, archetype, prompt, search_text)
    VALUES (new.rowid, new.app_name, new.tagline, new.archetype, new.prompt, new.search_text);
  END;
`;

// ─── Open / init DB ───────────────────────────────────────────────────────────

export function openDB(dbPath = DB_PATH) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

// ─── TF-IDF vectoriser ────────────────────────────────────────────────────────

/** Build a vocabulary-weighted term-frequency vector from text. */
function tokenise(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function buildVector(tokens, vocab) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] ?? 0) + 1;
  const vec = new Float32Array(vocab.size);
  let i = 0;
  for (const term of vocab) {
    vec[i++] = (tf[term] ?? 0) / (tokens.length || 1);
  }
  return vec;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Build corpus vocabulary from all designs in DB
function buildVocab(db) {
  const rows = db.prepare('SELECT search_text FROM designs').all();
  const df = {};
  const docs = rows.map(r => {
    const tokens = new Set(tokenise(r.search_text));
    for (const t of tokens) df[t] = (df[t] ?? 0) + 1;
    return tokens;
  });
  const n = rows.length || 1;
  // IDF-weight: keep terms that appear in <80% of docs (discriminative)
  const vocab = new Set(Object.entries(df)
    .filter(([, v]) => v / n < 0.8 && v >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 512)
    .map(([k]) => k));
  return vocab;
}

/** Build a searchable text blob from a design entry. */
export function buildSearchText(entry) {
  return [
    entry.app_name,
    entry.tagline,
    entry.archetype,
    entry.prompt,
    entry.credit,
    entry.source,
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

// ─── Upsert a design ─────────────────────────────────────────────────────────

export function upsertDesign(db, entry) {
  const searchText = buildSearchText(entry);

  // Recompute embedding for this entry only (will be updated during rebuildEmbeddings)
  // For now store placeholder — run rebuildEmbeddings() after bulk inserts
  const stmt = db.prepare(`
    INSERT INTO designs
      (id, app_name, tagline, archetype, prompt, design_url, mock_url,
       credit, published_at, submitted_at, screens, source, search_text, embedding)
    VALUES
      (@id, @app_name, @tagline, @archetype, @prompt, @design_url, @mock_url,
       @credit, @published_at, @submitted_at, @screens, @source, @search_text, @embedding)
    ON CONFLICT(id) DO UPDATE SET
      app_name     = excluded.app_name,
      tagline      = excluded.tagline,
      archetype    = excluded.archetype,
      prompt       = excluded.prompt,
      design_url   = excluded.design_url,
      mock_url     = excluded.mock_url,
      credit       = excluded.credit,
      published_at = excluded.published_at,
      submitted_at = excluded.submitted_at,
      screens      = excluded.screens,
      source       = excluded.source,
      search_text  = excluded.search_text,
      embedding    = excluded.embedding
  `);

  // Coerce every value to a SQLite-safe primitive
  const str = v => (v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
  const num = v => (v == null ? 10 : Number(v) || 10);

  stmt.run({
    id:           str(entry.id) || `design-${Date.now()}`,
    app_name:     str(entry.app_name),
    tagline:      str(entry.tagline),
    archetype:    str(entry.archetype),
    prompt:       str(entry.prompt),
    design_url:   str(entry.design_url),
    mock_url:     str(entry.mock_url),
    credit:       str(entry.credit),
    published_at: str(entry.published_at),
    submitted_at: str(entry.submitted_at || entry.published_at),
    screens:      num(entry.screens),
    source:       str(entry.source) || 'heartbeat',
    search_text:  searchText,
    embedding:    '[]',
  });
}

// ─── Rebuild all embeddings (call after bulk upserts) ─────────────────────────

export function rebuildEmbeddings(db) {
  const vocab  = buildVocab(db);
  const rows   = db.prepare('SELECT id, search_text FROM designs').all();
  const update = db.prepare('UPDATE designs SET embedding = ? WHERE id = ?');

  const batchUpdate = db.transaction(() => {
    for (const row of rows) {
      const tokens = tokenise(row.search_text);
      const vec    = buildVector(tokens, vocab);
      update.run(JSON.stringify(Array.from(vec)), row.id);
    }
  });
  batchUpdate();
  return { vocab: vocab.size, designs: rows.length };
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Search designs using two-pass ranking:
 *   Pass 1 — FTS5 keyword recall (fast)
 *   Pass 2 — TF-IDF cosine re-ranking (accurate)
 *
 * Falls back to full scan if FTS returns nothing.
 *
 * @param {Database} db
 * @param {string}   query       Natural-language query
 * @param {object}   opts
 * @param {number}   opts.limit  Max results (default 8)
 * @param {string}   opts.archetype  Filter by archetype (optional)
 * @returns {Array}  Ranked design objects with .score field
 */
export function searchDesigns(db, query, opts = {}) {
  const { limit = 8, archetype } = opts;

  // ── Pass 1: FTS recall ────────────────────────────────────────────────────
  let candidates = [];
  try {
    const ftsQ = query
      .replace(/['"*]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1)
      .map(t => `"${t}"`)
      .join(' OR ');

    const ftsRows = db.prepare(`
      SELECT d.*, bm25(designs_fts) AS fts_score
      FROM designs_fts
      JOIN designs d ON d.rowid = designs_fts.rowid
      WHERE designs_fts MATCH ?
      ${archetype ? 'AND d.archetype = ?' : ''}
      ORDER BY fts_score
      LIMIT 50
    `).all(...[ftsQ, archetype].filter(Boolean));

    candidates = ftsRows;
  } catch {}

  // Fallback: full table scan if FTS found nothing
  if (candidates.length === 0) {
    candidates = db.prepare(`
      SELECT * FROM designs
      ${archetype ? 'WHERE archetype = ?' : ''}
    `).all(...[archetype].filter(Boolean));
  }

  if (candidates.length === 0) return [];

  // ── Pass 2: TF-IDF cosine re-ranking ─────────────────────────────────────
  const vocab = buildVocab(db);
  const queryVec = buildVector(tokenise(query), vocab);

  const scored = candidates.map(row => {
    let storedEmb = [];
    try { storedEmb = JSON.parse(row.embedding ?? '[]'); } catch {}

    let cosSim = 0;
    if (storedEmb.length === vocab.size) {
      cosSim = cosine(queryVec, new Float32Array(storedEmb));
    } else {
      // Embedding stale or missing — compute on the fly
      const vec = buildVector(tokenise(row.search_text ?? ''), vocab);
      cosSim = cosine(queryVec, vec);
    }

    // Blend: 60% cosine + 40% FTS BM25 (normalised 0-1)
    const ftsSim  = row.fts_score ? Math.min(1, Math.abs(row.fts_score) / 10) : 0;
    const score   = cosSim * 0.6 + ftsSim * 0.4;

    const { embedding, fts_score, search_text, ...clean } = row;
    return { ...clean, score: +score.toFixed(4) };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllDesigns(db, opts = {}) {
  const { archetype, source, limit = 500 } = opts;
  const wheres = [];
  const params = [];
  if (archetype) { wheres.push('archetype = ?'); params.push(archetype); }
  if (source)    { wheres.push('source = ?');    params.push(source); }
  const where = wheres.length ? 'WHERE ' + wheres.join(' AND ') : '';
  return db.prepare(`
    SELECT id, app_name, tagline, archetype, design_url, mock_url, published_at, credit
    FROM designs ${where}
    ORDER BY published_at DESC
    LIMIT ?
  `).all(...params, limit);
}

export function getDesign(db, idOrName) {
  return db.prepare(
    `SELECT * FROM designs WHERE id = ? OR app_name = ? COLLATE NOCASE LIMIT 1`
  ).get(idOrName, idOrName);
}

export function deleteDesign(db, id) {
  return db.prepare('DELETE FROM designs WHERE id = ?').run(id);
}

export function designCount(db) {
  return db.prepare('SELECT COUNT(*) as n FROM designs').get().n;
}

// ─── Stop words ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','as','is','was','are','were','be','been','being','have',
  'has','had','do','does','did','will','would','could','should','may',
  'might','shall','can','need','this','that','these','those','it','its',
  'i','me','my','we','our','you','your','he','she','they','them','their',
  'what','which','who','when','where','how','all','each','every','both',
  'more','most','other','some','such','no','not','so','yet','both','just',
  'design','app','application','platform','tool','using','use','based',
  'inspired','new','now','also','well','via',
]);
