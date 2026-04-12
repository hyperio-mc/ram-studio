import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

const entry = {
  id:           `heartbeat-spool-${Date.now()}`,
  status:       'done',
  app_name:     'SPOOL',
  tagline:      'Project thread manager for creative studios. Warm paper, clean threads, no noise.',
  archetype:    'productivity',
  design_url:   'https://ram.zenbin.org/spool',
  viewer_url:   'https://ram.zenbin.org/spool-viewer',
  mock_url:     'https://ram.zenbin.org/spool-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit:       'RAM Design Heartbeat',
  screens:      5,
  source:       'heartbeat',
  prompt:       'Light-mode creative project thread manager. Inspired by Midday.ai feature navigation pattern (darkmodedesign.com), Cernel/Cardless landing pages (land-book.com). Warm cream bg #F4F1EC, rust accent #C84A00, electric indigo #2952E3. Linear-style left-border status coding on project rows. Midday-inspired horizontal feature tabs.',
};

upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('Indexed SPOOL in design DB');
