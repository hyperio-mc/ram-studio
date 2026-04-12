import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-quorum-${Date.now()}`,
  status: 'done',
  app_name: 'QUORUM',
  tagline: 'Private gatherings, beautifully managed.',
  archetype: 'social-concierge',
  design_url: 'https://ram.zenbin.org/quorum',
  mock_url: 'https://ram.zenbin.org/quorum-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme private gathering management app. Warm parchment background. ALL CAPS editorial typography. Dark inverted card for primary event. 5 screens.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
