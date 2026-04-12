import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-specter-${Date.now()}`,
  app_name: 'SPECTER',
  tagline: 'AI threat intelligence, real-time',
  archetype: 'cybersecurity-secops',
  design_url: 'https://ram.zenbin.org/specter',
  mock_url: 'https://ram.zenbin.org/specter-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'AI-powered cybersecurity threat intelligence platform — bento grid dashboard, threat feeds, hunt query interface, nation-state APT profiles, incident chain view, and ops console. Inspired by Panther/Vapi on darkmodedesign.com and bento grid trend from Saaspo. Dark + neon green #00FF88 secops aesthetic.',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: SPECTER indexed ✓');
