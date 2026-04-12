import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
const db = openDB();
upsertDesign(db, {
  id: 'heartbeat-still',
  app_name: 'STILL',
  tagline: 'your brain is not a server',
  archetype: 'wellness-mindfulness',
  design_url: 'https://zenbin.org/p/still',
  mock_url: 'https://ram.zenbin.org/still-mock',
  status: 'done',
  source: 'heartbeat',
  screens: 6,
  prompt: 'mindful state switching — stillness vs motion — recovery rituals — circadian rhythm — light linen theme',
  published_at: new Date().toISOString(),
});
rebuildEmbeddings(db);
console.log('STILL indexed in design DB');
