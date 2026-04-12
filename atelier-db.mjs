import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-atelier-${Date.now()}`,
  status: 'done',
  app_name: 'Atelier',
  tagline: 'Client portal for creative studios',
  archetype: 'editorial-light-studio',
  design_url: 'https://ram.zenbin.org/atelier',
  viewer_url: 'https://ram.zenbin.org/atelier-viewer',
  mock_url: 'https://ram.zenbin.org/atelier-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Editorial light studio client portal for independent brand designers. Warm cream palette (#F4EEE3), rust/terracotta accent (#C85230), large editorial display caps. 5 screens: Dashboard, Project, Deliverables, Feedback, Studio Profile. Inspired by Isa De Burgh + KO Collective on minimal.gallery.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB:', entry.app_name);
