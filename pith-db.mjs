import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-pith-${Date.now()}`,
  status: 'done',
  app_name: 'PITH',
  tagline: 'Distilled Insights Reader',
  archetype: 'productivity',
  design_url: 'https://ram.zenbin.org/pith',
  mock_url: 'https://ram.zenbin.org/pith-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Warm editorial light-mode distilled insights reader. Inspired by minimal.gallery typographic minimalism and land-book.com LangChain structured content cards. 5 screens: Today digest, Article reader with pull-quote insight block, Saved highlights, Topics explorer, Weekly stats.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
