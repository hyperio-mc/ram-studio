import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-opus-${Date.now()}`,
  app_name: 'OPUS',
  tagline: 'The portfolio journal for serious designers',
  archetype: 'portfolio-creative',
  design_url: 'https://ram.zenbin.org/opus',
  viewer_url: 'https://ram.zenbin.org/opus-viewer',
  mock_url: 'https://ram.zenbin.org/opus-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Heartbeat #500: editorial creative portfolio journal. Light warm cream palette inspired by minimal.gallery serif renaissance and Notion (Saaspo). Terracotta + steel blue accents. Asymmetric masonry gallery, editorial journal entries, project tracking with deliverable checklist.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: OPUS indexed ✓');
