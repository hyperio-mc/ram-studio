import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-ledge-${Date.now()}`,
  status: 'done',
  app_name: 'Ledge',
  tagline: 'Your wealth, in focus',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/ledge',
  mock_url: 'https://ram.zenbin.org/ledge-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme personal investment portfolio tracker — warm parchment palette, emerald accent for gains, bento-grid feature layout. Inspired by Equals GTM analytics on landbook.com editorial number hero, and Midday.ai bento grid inverted to light mode.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB');
