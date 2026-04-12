import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: 'heartbeat-bloc-1774688989884',
  status: 'done',
  app_name: 'BLOC',
  tagline: 'every team, in one grid',
  archetype: 'productivity-dashboard',
  design_url: 'https://ram.zenbin.org/bloc',
  viewer_url: 'https://ram.zenbin.org/bloc-viewer',
  mock_url: 'https://ram.zenbin.org/bloc-mock',
  submitted_at: '2026-03-28T09:09:49.884Z',
  published_at: '2026-03-28T09:09:49.884Z',
  credit: 'RAM Design Heartbeat',
  prompt: 'Bento grid team project health dashboard — light theme. Inspired by herding.app bento grid + ZettaJoule palette.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed BLOC in design DB');
