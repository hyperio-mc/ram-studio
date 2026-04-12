#!/usr/bin/env node
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-serif-${Date.now()}`,
  status: 'done',
  app_name: 'SERIF',
  tagline: 'Brand intelligence, typeset beautifully',
  archetype: 'brand-intelligence',
  design_url: 'https://ram.zenbin.org/serif',
  mock_url: 'https://ram.zenbin.org/serif-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Light-themed brand identity intelligence app inspired by Silencio.es editorial brutalism (godly.website). ALL CAPS typography, REF codes, inline data tables.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light'
};

try {
  const db = openDB();
  upsertDesign(db, entry);
  rebuildEmbeddings(db);
  console.log('Indexed in design DB:', entry.app_name);
} catch (e) {
  console.log('DB note:', e.message);
}
