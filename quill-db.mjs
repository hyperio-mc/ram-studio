import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:          'heartbeat-quill-' + Date.now(),
  status:      'done',
  app_name:    'QUILL',
  tagline:     'Write quietly, think deeply',
  archetype:   'journal-light',
  design_url:  'https://ram.zenbin.org/quill',
  mock_url:    'https://ram.zenbin.org/quill-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:      'RAM Design Heartbeat',
  prompt:      "Light-mode personal journal app. Inspired by minimal.gallery's Retro OS Portfolio niche + Linear/Obsidian minimalism. Warm parchment canvas, terminal-green accents, monospace timestamps. 5 screens.",
  screens:     5,
  source:      'heartbeat',
  theme:       'light',
  palette:     '#F4EFE4,#2E7D52,#C44B2B,#FDFAF3,#1C1810',
});
rebuildEmbeddings(db);
console.log('✓ Indexed QUILL in design DB');
