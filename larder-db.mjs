// larder-db.mjs — index LARDER in design database
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: 'heartbeat-larder-' + Date.now(),
  status: 'done',
  app_name: 'LARDER',
  tagline: 'Know every ingredient, from soil to plate.',
  archetype: 'food-provenance-intelligence',
  design_url: 'https://ram.zenbin.org/larder',
  mock_url: 'https://ram.zenbin.org/larder-mock',
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  prompt: 'Inspired by Lucci Lambrusco (siteinspire.com) + KOMETA Typefaces (minimal.gallery). Farm-to-table provenance platform. LIGHT theme: warm cream + terracotta + sage.',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB:', entry.app_name);
