import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id: `heartbeat-worth-${Date.now()}`,
  app_name: 'WORTH',
  tagline: 'your money, as a story',
  archetype: 'personal-finance',
  design_url: 'https://ram.zenbin.org/worth',
  mock_url: 'https://ram.zenbin.org/worth-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Warm-editorial personal finance intelligence app. Light theme. Land-Book cream palette, bento grid layout, Instrument Serif typography, forest green accent. 6 screens: Overview, Accounts, Spending, Investments, Goals, Insights.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: WORTH indexed ✓');
