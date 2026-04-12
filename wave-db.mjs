// wave-db.mjs — Index WAVE in the design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-wave-${Date.now()}`,
  status: 'done',
  app_name: 'WAVE',
  tagline: 'Your signal in the noise.',
  archetype: 'podcast-dark-retro-terminal-violet-phosphor',
  design_url: 'https://ram.zenbin.org/wave',
  mock_url: 'https://ram.zenbin.org/wave-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-theme podcast discovery & player. Inspired by Format Podcasts on darkmodedesign.com, Chus Retro OS Portfolio on minimal.gallery, and Awwwards Fluid Glass winner. Near-black #0A0A0F, violet #A78BFA, phosphor green #34D399. Five screens: Discover, Now Playing with retro OS window chrome, Episodes, Queue, Library.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ WAVE indexed in design DB');
