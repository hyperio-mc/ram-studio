import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-breve-${Date.now()}`,
  app_name: 'BREVE',
  tagline: 'Creative briefs, client sign-off, done.',
  archetype: 'creative-workflow',
  design_url: 'https://ram.zenbin.org/breve',
  mock_url: 'https://ram.zenbin.org/breve-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Design a creative brief & client collaboration platform — inspired by bento-grid card layouts from land-book.com 2026 and warm Mocha Mousse cream palette from siteinspire.com. Light theme, editorial typography, asymmetric card hierarchy.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: BREVE indexed ✓');
