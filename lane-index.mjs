import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-lane-${Date.now()}`,
  status:       'done',
  app_name:     'LANE',
  tagline:      'AI workflow builder & run scheduler for production agent pipelines.',
  archetype:    'developer-tools',
  design_url:   'https://ram.zenbin.org/lane',
  mock_url:     'https://ram.zenbin.org/lane-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-themed AI workflow builder inspired by LangChain/Runlayer on land-book.com + Awwwards warm orange system. Warm off-white #F4F2ED ground, burnt sienna #C94A14 accent.',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ Indexed LANE in design DB');
