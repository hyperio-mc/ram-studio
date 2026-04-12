import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: 'heartbeat-lumio',
  app_name: 'LUMIO',
  tagline: 'See your work, clearly.',
  archetype: 'freelance-finance-light',
  design_url: 'https://ram.zenbin.org/lumio',
  mock_url: 'https://ram.zenbin.org/lumio-mock',
  prompt: 'Freelance financial OS for solo creatives. Warm cream/copper light theme. Inspired by Midday.ai (darkmodedesign.com) unified-ops structure + New Genre Studio (minimal.gallery) warm minimal aesthetic. 6 screens: Dashboard, My Work, Time Tracking, Invoice Builder, AI Insights, Onboarding.',
  source: 'heartbeat',
  screens: 6,
  published_at: new Date().toISOString(),
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed in design DB:', entry.app_name);
