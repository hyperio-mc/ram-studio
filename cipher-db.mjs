import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-cipher-${Date.now()}`,
  status: 'done',
  app_name: 'CIPHER',
  tagline: 'see every threat before it sees you',
  archetype: 'security-intelligence',
  design_url: 'https://ram.zenbin.org/cipher',
  mock_url: 'https://ram.zenbin.org/cipher-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by Isidor.ai binary-as-decoration aesthetic on minimal.gallery. Dark security intel platform. Binary strings as ambient texture, electric green #00FF88 on near-black #040608. 5 screens: Dashboard, Threats, Assets, Intel Feed, Incidents.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});
rebuildEmbeddings(db);
console.log('Indexed CIPHER in design DB');
