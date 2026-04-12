import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-haven-${Date.now()}`,
  status: 'done',
  app_name: 'HAVEN',
  tagline: 'Your city, curated.',
  archetype: 'urban-concierge',
  design_url: 'https://ram.zenbin.org/haven',
  mock_url: 'https://ram.zenbin.org/haven-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Premium urban lifestyle concierge app — curated dining, hotels, experiences, AI assistance. Inspired by Atlas Card (Godly.website) horizontal editorial carousels and luxury concierge UX.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
