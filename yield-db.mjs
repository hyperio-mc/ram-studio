import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-yield-${Date.now()}`,
  status: 'done',
  app_name: 'Yield',
  tagline: 'Know exactly where your money comes from',
  archetype: 'finance-analytics-dashboard',
  design_url: 'https://ram.zenbin.org/yield',
  mock_url: 'https://ram.zenbin.org/yield-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Revenue intelligence dashboard for indie makers — dark theme. Inspired by Midday.ai (darkmodedesign.com) + Equals GTM analytics (land-book.com) + Mixpanel (godly.website). Quiet Clarity: monospace number typography, electric violet/mint accent system, floating cards on near-black.',
  screens: 5,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB');
