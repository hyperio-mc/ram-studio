/**
 * FUSE — Index in design database
 */
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-fuse-${Date.now()}`,
  status: 'done',
  app_name: 'FUSE',
  tagline: 'Motion templates for obsessive creators',
  archetype: 'creative-marketplace-dark',
  design_url: 'https://ram.zenbin.org/fuse',
  mock_url: 'https://ram.zenbin.org/fuse-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark editorial motion template marketplace. Masonry browse grid inspired by DarkModeDesign.com "108 Supply". ALL-CAPS trending screen from "Muradov". Near-black + chartreuse palette. 5 screens.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
  palette: '#090909,#CDFF47,#8B6EFF,#FF6B5B,#47FFCC',
});

rebuildEmbeddings(db);
console.log('✓ FUSE indexed in design DB');
