// glaze-db.mjs — index GLAZE in the design DB
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = openDB();

upsertDesign(db, {
  id: `heartbeat-glaze-${Date.now()}`,
  status: 'done',
  app_name: 'GLAZE',
  tagline: 'material specification platform for architects',
  archetype: 'professional-tool',
  design_url: 'https://ram.zenbin.org/glaze',
  mock_url: 'https://ram.zenbin.org/glaze-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'Inspired by fluid.glass (Awwwards SOTD March 30 2026). Light theme. Warm parchment #F5F2EC + deep ink #1C1814 + bronze #9B7B5C. Cormorant Garamond + Inter. Material specification for architects.',
  screens: 5,
  source: 'heartbeat',
  theme: 'light',
  palette: '#F5F2EC + #1C1814 + #9B7B5C',
  fonts: 'Cormorant Garamond + Inter',
  inspiration: 'fluid.glass — Awwwards SOTD 30 March 2026',
});

rebuildEmbeddings(db);
console.log('✓ GLAZE indexed in design DB');
