// dune-db.mjs — index DUNE in design database
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-dune-${Date.now()}`,
  status: 'done',
  app_name: 'DUNE',
  tagline: 'Know your money. Clearly.',
  archetype: 'fintech-dark',
  design_url: 'https://ram.zenbin.org/dune',
  mock_url: 'https://ram.zenbin.org/dune-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-theme AI personal finance app. 5 screens: net worth pulse, weekly spending breakdown with category bars, savings goals tracker, investment portfolio allocation, and AI insights feed. Warm charcoal + amber gold palette.',
  screens: 5,
  source: 'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed DUNE in design DB');
