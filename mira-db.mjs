import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-mira-${Date.now()}`,
  status: 'done',
  app_name: 'Mira',
  tagline: 'Think clearly, feel grounded',
  archetype: 'wellness-productivity',
  design_url: 'https://ram.zenbin.org/mira',
  mock_url: 'https://ram.zenbin.org/mira-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Cognitive wellness tracker mobile app — light theme. Inspired by Dawn (evidence-based AI for mental health, Lapa Ninja) + Amie calendar app (Godly.website). Computational warmth: clinical data precision meets human softness.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});

rebuildEmbeddings(db);
console.log('Indexed Mira in design DB');
