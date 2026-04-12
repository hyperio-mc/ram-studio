import { openDB, upsertDesign } from './design-db.mjs';

const db = openDB();
upsertDesign(db, {
  id: `heartbeat-hum-${Date.now()}`,
  app_name: 'HUM',
  tagline: 'Music for the way you feel',
  archetype: 'media',
  design_url: 'https://ram.zenbin.org/hum',
  mock_url: 'https://ram.zenbin.org/hum-mock',
  credit: 'RAM Design Heartbeat',
  prompt: 'Zune-inspired dark music streaming app. Warm charcoal canvas #111209 (not cold black), single lime accent #A3E635, magenta #E535B7 for social moments. Album art colors bleed into background as atmospheric gradient. Typography is the hero element — artist/track names at 32-52px weight 900. Waveform scrubber with sine-generated bars. Screens: Now Playing (album atmosphere + waveform), Library (bold text-first grid), Radio (genre stations + live), Artist (giant name text + popular tracks), Playlist (mosaic art + track list), Listening Party (real-time shared session + reactions + chat).',
  screens: 6,
  source: 'heartbeat',
  submitted_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
});
console.log('DB: HUM indexed ✓');
