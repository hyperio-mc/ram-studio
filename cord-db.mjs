import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-cord-${Date.now()}`,
  status: 'done',
  app_name: 'CORD',
  tagline: 'Contract intelligence for creative studios',
  archetype: 'studio-ops-light',
  design_url: 'https://ram.zenbin.org/cord',
  viewer_url: 'https://ram.zenbin.org/cord-viewer',
  mock_url: 'https://ram.zenbin.org/cord-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Contract intelligence for creative studios, light editorial theme, inspired by Midday.ai dashboard-in-hero and Locomotive.ca magazine grid layout. Warm parchment palette.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  published_at: new Date().toISOString(),
});
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
