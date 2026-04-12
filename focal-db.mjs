import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: 'heartbeat-focal',
  app_name: 'FOCAL',
  tagline: 'The studio OS for independent photographers',
  archetype: 'photography-studio',
  design_url: 'https://ram.zenbin.org/focal',
  mock_url: 'https://ram.zenbin.org/focal-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Dark warm photographer studio OS. Warm charcoal bg, film-gold accent, aperture-ring status badges, contact-sheet gallery.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed in design DB');
