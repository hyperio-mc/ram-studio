// reed-db.mjs — index REED in the design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-reed-${Date.now()}`,
  status: 'done',
  app_name: 'REED',
  tagline: 'Your river of long reads',
  archetype: 'reading-intelligence',
  design_url: 'https://ram.zenbin.org/reed',
  mock_url: 'https://ram.zenbin.org/reed-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Deep reading & annotation mobile app — dark theme. Inspired by Current — A River of Reading on Land-book (10 saves, Mar 2026) and Obsidian on DarkModeDesign. Near-black canvas #0D0F0C, sage green accent, amber highlights, editorial serif typography, reading queue with river metaphor, immersive reading mode with inline annotation, weekly stats dashboard.',
  screens: 6,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed REED in design DB');
