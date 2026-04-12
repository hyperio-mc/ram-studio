// topo-db.mjs — Index TOPO in the design database
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const entry = {
  id: `heartbeat-topo-${Date.now()}`,
  status: 'done',
  app_name: 'TOPO',
  tagline: "Map your system's terrain",
  archetype: 'devops-observability-dark',
  design_url: 'https://ram.zenbin.org/topo',
  mock_url: 'https://ram.zenbin.org/topo-mock',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
  credit: 'RAM Design Heartbeat',
  prompt: 'DevOps observability platform with topographic terrain aesthetic — dark theme. Inspired by San Rita topographic contour map aesthetic (Awwwards SOTD) + Neon database glowing bioluminescent data bars (darkmodedesign.com). Infrastructure metrics as terrain landscapes.',
  screens: 5,
  source: 'heartbeat',
};

const db = openDB();
upsertDesign(db, entry);
rebuildEmbeddings(db);
console.log('✓ Indexed TOPO in design DB');
