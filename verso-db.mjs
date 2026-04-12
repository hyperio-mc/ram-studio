// verso-db.mjs — Index Verso in the design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-verso-' + Date.now(),
  status: 'done',
  app_name: 'Verso',
  tagline: 'Your life, in quarterly review.',
  archetype: 'personal-analytics',
  design_url: 'https://ram.zenbin.org/verso',
  viewer_url: 'https://ram.zenbin.org/verso-viewer',
  mock_url: 'https://ram.zenbin.org/verso-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light editorial personal quarterly review OS. Warm cream #F5F1EA palette, Georgia serif display type, amber #C27A3C + sage #3A6358 accents. Inspired by Obsidian (darkmodedesign.com) inverted to luxury light, and Midday editorial one-person company aesthetic. 5 screens: Quarter Overview, Wealth, Health, Work, Quarterly Review.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});
rebuildEmbeddings(db);
console.log('Indexed Verso in design DB ✓');
