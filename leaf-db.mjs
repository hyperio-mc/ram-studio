import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-leaf-${Date.now()}`,
  status: 'done',
  app_name: 'Leaf',
  tagline: 'Your reading life, beautifully kept',
  archetype: 'reading-companion',
  design_url: 'https://ram.zenbin.org/leaf',
  mock_url: 'https://ram.zenbin.org/leaf-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Reading companion app — warm parchment light theme inspired by minimal.gallery Litbix + KOMETA Typefaces editorial typography. Playfair Display serif, terracotta accent.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
