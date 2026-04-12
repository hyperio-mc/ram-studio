import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-draft-${Date.now()}`,
  status: 'done',
  app_name: 'DRAFT',
  tagline: 'Your AI writing companion',
  archetype: 'productivity-ai',
  design_url: 'https://ram.zenbin.org/draft',
  mock_url: 'https://ram.zenbin.org/draft-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme AI writing OS. Warm cream palette, cobalt blue accent. Ghost text AI suggestions, session tracking, tone analysis, writing insights dashboard. Inspired by Cushion.so and JetBrains Air minimalism.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});

rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
