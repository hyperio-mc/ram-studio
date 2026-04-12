import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-lucid-${Date.now()}`,
  status: 'done',
  app_name: 'LUCID',
  tagline: 'Your founder clarity layer.',
  archetype: 'founder-wellness-productivity-light',
  design_url: 'https://ram.zenbin.org/lucid',
  mock_url: 'https://ram.zenbin.org/lucid-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Founder clarity OS — LIGHT theme. AI-powered focus sessions, cognitive clarity scoring, business pulse, habits. Warm ivory #F7F4EF, electric coral #E8502A, sage green #2FA86A, lavender AI #7B6EF6.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
