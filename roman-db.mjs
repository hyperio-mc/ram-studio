import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-roman-${Date.now()}`,
  app_name:     'ROMAN',
  tagline:      'Your reading life, beautifully kept',
  archetype:    'editorial-reader',
  design_url:   'https://ram.zenbin.org/roman',
  mock_url:     'https://ram.zenbin.org/roman-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Design a literary reading tracker app inspired by the Kinfolk editorial aesthetic from minimal.gallery — warm paper palette, serif typography, generous whitespace, print-magazine layout grid applied to mobile. Counter to the dark/animation-heavy trend documented on saaspo.com. Light theme.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: ROMAN indexed ✓');
