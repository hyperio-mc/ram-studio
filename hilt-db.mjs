import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-hilt-${Date.now()}`,
  app_name: 'HILT',
  tagline: 'Get a grip on your wealth',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/hilt',
  mock_url: 'https://ram.zenbin.org/hilt-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Deep navy wealth OS — bento grid dashboard, lived-in financial data, dark navy + old gold palette. Inspired by darkmodedesign.com Revolut navy aesthetic + godly.website bento grid showcase.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: HILT indexed ✓');
