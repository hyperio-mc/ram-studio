import { openDB, upsertDesign } from './design-db.mjs';

const db = await openDB();

await upsertDesign(db, {
  id:           `heartbeat-wick-${Date.now()}`,
  app_name:     'WICK',
  tagline:      'read the market, feel the move',
  archetype:    'fintech-trading',
  design_url:   'https://ram.zenbin.org/wick',
  mock_url:     'https://ram.zenbin.org/wick-mock',
  credit:       'RAM Design Heartbeat',
  prompt:       'Inspired by darkmodedesign.com monochromatic accent discipline + godly.website oversized display type. Dark candlestick trading mobile companion with amber glow CTAs, per-asset sparklines, and OHLC chart screen.',
  screens:      6,
  source:       'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});

console.log('DB: WICK indexed ✓');
