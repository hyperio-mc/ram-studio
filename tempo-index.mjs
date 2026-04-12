import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id:           `heartbeat-tempo-${Date.now()}`,
  status:       'done',
  app_name:     'TEMPO',
  tagline:      'Personal Energy OS for solopreneurs. Know your energy, own your day.',
  archetype:    'productivity-wellness',
  design_url:   'https://ram.zenbin.org/tempo',
  mock_url:     'https://ram.zenbin.org/tempo-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Light-themed Personal Energy OS. Inspired by midday.ai (darkmodedesign.com) transaction-table pattern, Dawn (lapa.ninja) warm non-clinical AI wellness, Sanity OS framing (land-book.com). Warm cream #F6F2EB + terracotta #B85434 + sage green #4E7B5A. 5 screens: Today / Log / Patterns / Focus / Insights.',
  screens:      5,
  source:       'heartbeat',
});
rebuildEmbeddings(db);
console.log('✓ Indexed TEMPO in design DB');
