import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-seam-${Date.now()}`,
  status: 'queued',
  app_name: 'SEAM',
  tagline: 'Client-to-cash, seamlessly',
  archetype: 'freelance-ops-platform',
  design_url: 'https://ram.zenbin.org/seam',
  mock_url: 'https://ram.zenbin.org/seam-mock',
  submitted_at: new Date().toISOString(),
  published_at: null,
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-theme freelance ops platform. Inspired by SUTÉRA multi-reality UI (Awwwards SOTD Mar 28 2026) + midday.ai clean founder-finance SaaS structure. Warm paper whites (#F5F3EF), indigo (#4F46E5) + emerald (#059669) accents. 6 screens: Overview dashboard with AI insight banner, Contracts pipeline with left accent lines, Invoice studio, Cash flow bar chart, Client hub with relationship health bars, New invoice creation with AI pre-fill.',
  screens: 6,
  source: 'heartbeat',
  theme: 'light',
  palette: '#F5F3EF / #4F46E5 / #059669',
});
rebuildEmbeddings(db);
console.log('Indexed SEAM in design DB');
