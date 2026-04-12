import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-kern-crm-${Date.now()}`,
  status: 'done',
  app_name: 'Kern CRM',
  tagline: 'Your work, in focus',
  archetype: 'ai-native-crm',
  design_url: 'https://ram.zenbin.org/kern-crm',
  mock_url: 'https://ram.zenbin.org/kern-crm-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-native CRM for indie founders. Folk CRM + PostHog warm palette. Light cream theme. 5 screens.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
