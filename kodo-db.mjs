import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-kodo',
  app_name: 'Kōdo',
  tagline: 'Engineering intelligence, always on',
  archetype: 'developer-tools',
  design_url: 'https://ram.zenbin.org/kodo',
  mock_url: 'https://ram.zenbin.org/kodo-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark-mode engineering intelligence platform inspired by Neon.com and Midday.ai. DORA metrics dashboard, PR velocity, incident command, team throughput with AI noise reduction. Horizontal data-rail + pulsing status ring.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
