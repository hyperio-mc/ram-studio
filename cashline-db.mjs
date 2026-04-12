import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const now = new Date().toISOString();
const db = openDB();

upsertDesign(db, {
  id: `heartbeat-cashline-${Date.now()}`,
  status: 'done',
  app_name: 'Cashline',
  tagline: 'Cash flow intelligence for independent consultants',
  archetype: 'finance-intelligence',
  design_url: 'https://ram.zenbin.org/cashline',
  mock_url: 'https://ram.zenbin.org/cashline-mock',
  submitted_at: now,
  published_at: now,
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-first cash flow dashboard for solopreneurs inspired by Midday.ai (godly.website) and Linear agent-tasks UX paradigm — light theme with warm cream palette and proactive AI signals screen',
  screens: 5,
  source: 'heartbeat'
});

rebuildEmbeddings(db);
console.log('✓ Cashline indexed in design DB');
