import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const entry = {
  id: `heartbeat-vanta-${Date.now()}`,
  status: 'done',
  app_name: 'VANTA',
  tagline: 'AI model control room',
  archetype: 'developer-tools',
  design_url: 'https://ram.zenbin.org/vanta',
  mock_url: 'https://ram.zenbin.org/vanta-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-mode AI model registry. Warm dark palette (#0E0D0C), chartreuse accent (#C8FF00), monospace editorial. 5 screens: Discovery, Model Detail, Side-by-Side Compare, Deploy, Usage Analytics.',
  screens: 5,
  source: 'heartbeat',
};

upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
