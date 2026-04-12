import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-ledger-${Date.now()}`,
  status: 'done',
  app_name: 'LEDGER',
  tagline: 'Money that thinks for you',
  archetype: 'fintech-ai-dashboard',
  design_url: 'https://ram.zenbin.org/ledger',
  mock_url: 'https://ram.zenbin.org/ledger-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark AI-powered financial clarity app for solo founders. Inspired by Midday.ai on darkmodedesign.com. Deep blue-black palette #0B0D14, electric mint #4AE3A0, electric indigo #7B6CF5. 5 screens: Dashboard, Transactions, Invoices, Analytics, AI Insights.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
