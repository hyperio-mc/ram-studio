import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-brim-${Date.now()}`,
  status: 'done',
  app_name: 'BRIM',
  tagline: 'Your money, finally intelligent.',
  archetype: 'fintech-ai-dark',
  design_url: 'https://ram.zenbin.org/brim',
  mock_url: 'https://ram.zenbin.org/brim-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by darkmodedesign.com Muradov portfolio — electric violet on near-black, bold condensed display type, 3D device mockups. Dark AI-powered personal finance app with 5 screens: dashboard, spending pulse, portfolio intelligence, BRIM AI insights hub, goals tracker.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
