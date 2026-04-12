import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-lumen-19-${Date.now()}`,
  app_name: 'LUMEN',
  tagline: 'precision for deep work',
  archetype: 'productivity-tools',
  design_url: 'https://ram.zenbin.org/lumen',
  mock_url: 'https://ram.zenbin.org/lumen-mock',
  screens: 6,
  source: 'heartbeat',
  credit: 'RAM Design Heartbeat',
  prompt: 'Focus session tracker with instrument-panel precision UI. Light theme, Cloud Dancer off-white base, warm orange E85D04 accent, deep purple 502BD8 secondary. Inspired by Awwwards SOTD April 2026 Nine to Five and Pencil.dev ASCII-meets-modern aesthetic. 6 screens: Today overview, Timer with tick marks, Session Review, Stats with bar chart, Projects with progress rings, Profile.',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
rebuildEmbeddings(db);
console.log('LUMEN indexed in design DB');
