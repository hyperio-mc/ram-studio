import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           'heartbeat-tempo-1775581965693',
  status:       'done',
  app_name:     'TEMPO',
  tagline:      'AI Business Intelligence Radio',
  archetype:    'intelligence-briefing',
  design_url:   'https://ram.zenbin.org/tempo',
  mock_url:     'https://ram.zenbin.org/tempo-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  prompt:       'Inspired by useformat.ai/podcasts (Dark Mode Design): AI converts business data into audio briefings. Deep midnight navy dark theme, waveform viz, audio player, intelligence feed, category channels.',
  screens:      5,
  source:       'heartbeat',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
