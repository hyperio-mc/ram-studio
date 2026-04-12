import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-gilt-${Date.now()}`,
  status: 'done',
  app_name: 'GILT',
  tagline: 'The card that opens every door',
  archetype: 'luxury-fintech',
  design_url: 'https://ram.zenbin.org/gilt',
  mock_url: 'https://ram.zenbin.org/gilt-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Luxury concierge credit card app with warm ivory palette, editorial serif typography, curated venue discovery, personal concierge chat. Inspired by Atlas Card (godly.website) and Cardless (land-book.com).',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
