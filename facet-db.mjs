import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-facet-${Date.now()}`,
  status: 'done',
  app_name: 'FACET',
  tagline: 'Every material tells a story.',
  archetype: 'material-discovery',
  design_url: 'https://ram.zenbin.org/facet',
  mock_url: 'https://ram.zenbin.org/facet-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Material discovery & specification platform for architects and interior designers. Inspired by darkmodedesign.com geological texture trend (SaltBits, Mortons) and minimal.gallery editorial dark UI. Dark theme: deep charcoal, warm amber, natural material textures.',
  screens: 6,
  source: 'heartbeat',
});
rebuildEmbeddings(db);
console.log('Indexed in design DB ✓');
