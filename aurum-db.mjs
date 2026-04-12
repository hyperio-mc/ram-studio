import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-aurum-${Date.now()}`,
  status: 'done',
  app_name: 'AURUM',
  tagline: 'Personal Wealth Intelligence',
  archetype: 'fintech-premium-light',
  design_url: 'https://ram.zenbin.org/aurum',
  mock_url: 'https://ram.zenbin.org/aurum-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by Atlas Card on godly.website (ultra-premium invite-only fintech with luxury editorial positioning) and Midday.ai on darkmodedesign.com (structured financial data for founders). LIGHT theme — warm ivory, antique gold, forest green. 6 screens: splash, overview, accounts, money moves, wealth goals, AI concierge.',
  screens: 6,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed AURUM in design DB');
