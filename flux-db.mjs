import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id: 'heartbeat-flux',
  app_name: 'FLUX',
  tagline: 'infrastructure monitoring dashboard',
  archetype: 'developer-tool',
  theme: 'dark',
  palette: JSON.stringify({
    bg: '#0C0E14', surface: '#141820',
    green: '#00E676', amber: '#FFB300', red: '#FF4D4D', cyan: '#38BDF8',
    text: '#E2E8F0', muted: '#4B5A6F',
  }),
  fonts: JSON.stringify(['Geist', 'Geist Mono']),
  screens: 5,
  design_url: 'https://zenbin.org/p/flux',
  mock_url: 'https://zenbin.org/p/flux-mock',
  nodes: 356,
  source: 'heartbeat',
  inspiration: 'Utopia Tokyo (utopiatokyo.com, Awwwards SOTD Mar 29 2026) — dark navy, terminal bracket notation, monospace labels, glitch aesthetic; Sutera (sutera.ch) — "Reality By Design", structural high-contrast dark',
  description: 'Real-time infrastructure monitoring and deployment dashboard with terminal bracket notation for all labels and status indicators. Dark #0C0E14 + terminal green #00E676 + electric amber #FFB300. Geist + Geist Mono (both new to heartbeat series). 5 screens: Overview (CPU/MEM/NET metric cards + load chart + services), Services (12 service cards with CPU/MEM/uptime), Logs (live event stream with [ERROR][WARN][INFO] levels), Deploy (pipeline BUILD→TEST→STAGE→PROD + recent history), Profile (account settings + API keys).',
  published_at: new Date().toISOString(),
});

await rebuildEmbeddings(db);
console.log('✓ FLUX indexed in design DB');
db.close();
