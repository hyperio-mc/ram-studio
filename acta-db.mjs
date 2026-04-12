import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-acta-${Date.now()}`,
  app_name: 'ACTA',
  tagline: 'Creative sprint velocity for studios',
  archetype: 'studio-sprint-tracker',
  design_url: 'https://ram.zenbin.org/acta',
  mock_url: 'https://ram.zenbin.org/acta-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark chapter-based creative sprint tracker for design studios. Inspired by Linear: Change (chapter-scroll architecture, weight-590 Inter, Redaction serif) and Lusion.co (electric cobalt #1A2FFB, massive type, lavender-white surfaces). Projects as Acts, sprints as chapters. 6 screens.',
  screens: 6,
  source: 'heartbeat',
  status: 'done',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
