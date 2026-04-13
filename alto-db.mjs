import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id:           `heartbeat-alto-${Date.now()}`,
  app_name:     'ALTO',
  tagline:      'Wealth, clearly.',
  archetype:    'personal-finance',
  design_url:   'https://ram.zenbin.org/alto',
  mock_url:     'https://ram.zenbin.org/alto-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Warm editorial minimalism for personal wealth tracking — bento dashboard, serif × sans typography, cream palette. Inspired by minimal.gallery warm minimalism + saaspo.com bento grid + lapa.ninja story-driven sections.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: ALTO indexed ✓');
