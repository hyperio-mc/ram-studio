import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-mend-${Date.now()}`,
  status: 'done',
  app_name: 'MEND',
  tagline: 'Recovery intelligence for smart wearables',
  archetype: 'health-wearable-light',
  design_url: 'https://ram.zenbin.org/mend',
  viewer_url: 'https://ram.zenbin.org/mend-viewer',
  mock_url: 'https://ram.zenbin.org/mend-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by Dribbble #1 popular "Smart Ring App — Health Tracking Mobile UI" (12.8k views) and Dawn AI mental health (lapa.ninja). Light theme. Warm parchment #F5F2EC base with forest green #3E6B4A accent and terra cotta #C4714A. Editorial serif number hierarchy, organic HRV wave visualizations, sleep hypnogram, AI focus windows, insights feed. 5 screens.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
});

rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
