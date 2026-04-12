// ink-db.mjs — index INK in design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-ink-${Date.now()}`,
  status: 'done',
  app_name: 'INK',
  tagline: 'Write less. Mean more.',
  archetype: 'editorial-dark',
  design_url: 'https://ram.zenbin.org/ink',
  mock_url: 'https://ram.zenbin.org/ink-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark editorial writing & publishing platform. Inspired by Will Phan ultra-minimal dark portfolio and Karl.Works editorial typography on minimal.gallery. Soft violet accent #A78BFA, type-as-interface, Georgia serif headings on zinc-950 black. Counter-trend: warm humanized dark vs cold neon.',
  screens: 5,
  source: 'heartbeat',
  theme: 'dark',
});

rebuildEmbeddings(db);
console.log('Indexed INK in design DB');
