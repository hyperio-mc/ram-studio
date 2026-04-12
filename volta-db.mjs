import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: 'heartbeat-volta-travel-1775593059170',
  status: 'done',
  app_name: 'VOLTA',
  tagline: 'Journeys, elevated.',
  archetype: 'luxury-travel-concierge',
  design_url: 'https://ram.zenbin.org/volta-travel',
  mock_url: 'https://ram.zenbin.org/volta-travel-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark luxury travel intelligence app — editorial photography, uppercase spatial labels (DINING/HOTELS/CONCIERGE), invite-only tier system, concierge request threads. Inspired by Atlas Card via godly.website.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
