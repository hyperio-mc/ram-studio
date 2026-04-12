import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const newEntry = {
  id: 'heartbeat-tendril-' + Date.now(),
  status: 'done',
  app_name: 'Tendril',
  tagline: 'small habits. exponential growth.',
  archetype: 'wellness-tracker',
  design_url: 'https://ram.zenbin.org/tendril',
  mock_url: 'https://ram.zenbin.org/tendril-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, newEntry);
rebuildEmbeddings(db);
console.log('Indexed Tendril in design DB');
