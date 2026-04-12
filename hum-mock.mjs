import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'HUM',
  tagline: 'Music for the way you feel',
  archetype: 'media',
  palette: {
    bg:      '#111209',
    surface: '#191C11',
    text:    '#F0EDE0',
    accent:  '#A3E635',
    accent2: '#E535B7',
    muted:   'rgba(240,237,224,0.45)',
  },
  lightPalette: {
    bg:      '#F5F5ED',
    surface: '#FFFFFF',
    text:    '#1A1C11',
    accent:  '#5A8C0A',
    accent2: '#B01894',
    muted:   'rgba(26,28,17,0.45)',
  },
  screens: [
    {
      id: 'now',
      label: 'Now Playing',
      content: [
        { type: 'metric', label: 'Melt Into You · Aroha Ngata', value: '1:42 / 4:28', sub: 'Album: Frequencies · 38% played · Now playing in HUM' },
        { type: 'metric-row', items: [
          { label: 'Duration',  value: '4:28' },
          { label: 'Progress',  value: '38%' },
          { label: 'Bitrate',   value: '320kbps' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Now Playing', sub: 'Melt Into You — Aroha Ngata — Frequencies', badge: '▶ LIVE' },
          { icon: 'activity', title: 'Up Next',     sub: 'Slow Burn — Aroha Ngata — 3:52',           badge: 'NEXT'   },
          { icon: 'activity', title: 'Queue',        sub: 'Signal & Noise, Morning Glass, Open Water', badge: '+3'    },
        ]},
        { type: 'tags', label: 'Controls', items: ['⏮ Prev', '⏸ Pause', '⏭ Next', '♡ Like', '+ Queue'] },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'your music.', value: '342 albums', sub: '4,891 tracks · 18.4 days of listening · 6 playlists' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Frequencies',       sub: 'Aroha Ngata · 12 tracks · 2024',            badge: '▶' },
          { icon: 'star',     title: 'Midnight Code',     sub: 'Orbital Drift · 9 tracks · 2023',           badge: '▶' },
          { icon: 'star',     title: 'Golden Hours',      sub: 'Sable Creek · 14 tracks · 2024',            badge: '▶' },
          { icon: 'star',     title: 'Root System',       sub: 'Fern & Moss · 11 tracks · 2023',            badge: '▶' },
          { icon: 'star',     title: 'Velvet Static',     sub: 'Coeur de Bois · 8 tracks · 2024',           badge: '▶' },
        ]},
        { type: 'tags', label: 'Filter', items: ['ALBUMS', 'ARTISTS', 'TRACKS', 'PLAYLISTS'] },
      ],
    },
    {
      id: 'radio',
      label: 'Radio',
      content: [
        { type: 'metric', label: 'discover.', value: 'HUM Radio', sub: 'LIVE · Electronic · Ambient · Indie · 2,847 listening now' },
        { type: 'list', items: [
          { icon: 'activity', title: 'HUM Radio',    sub: 'Electronic · Ambient · Indie · LIVE · 2,847 now',   badge: 'LIVE'   },
          { icon: 'activity', title: 'Indie Folk',   sub: 'Station · 1.2k listening',                          badge: '▶'      },
          { icon: 'activity', title: 'Electronic',   sub: 'Station · 3.4k listening · active now',             badge: '▶ NOW' },
          { icon: 'activity', title: 'R&B / Soul',   sub: 'Station · 2.1k listening',                          badge: '▶'      },
          { icon: 'activity', title: 'Jazz',         sub: 'Station · 890 listening',                           badge: '▶'      },
        ]},
        { type: 'tags', label: 'Mood', items: ['Deep Work', 'Workout', 'Wind Down', 'Commute'] },
      ],
    },
    {
      id: 'artist',
      label: 'Artist',
      content: [
        { type: 'metric', label: 'AROHA NGATA', value: '3.4M listeners', sub: 'Monthly listeners · Indie/Electronic · Auckland, NZ' },
        { type: 'progress', items: [
          { label: 'Melt Into You — 4.2M plays',   pct: 100 },
          { label: 'Signal & Noise — 3.1M plays',  pct: 74  },
          { label: 'Slow Burn — 2.8M plays',        pct: 67  },
          { label: 'Morning Glass — 2.2M plays',    pct: 52  },
          { label: 'Open Water — 1.9M plays',       pct: 45  },
        ]},
        { type: 'tags', label: 'Actions', items: ['FOLLOW', 'SHUFFLE', 'Radio', 'Discography'] },
      ],
    },
    {
      id: 'playlist',
      label: 'Playlist',
      content: [
        { type: 'metric', label: 'Late Night Session', value: '18 tracks', sub: '1h 12m · Curated by you · Currently: Melt Into You' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Melt Into You',       sub: 'Aroha Ngata · 4:28',     badge: '▶ NOW'  },
          { icon: 'activity', title: 'Neon Rain',           sub: 'Orbital Drift · 5:12',   badge: '#2'     },
          { icon: 'activity', title: 'Amber Field',         sub: 'Sable Creek · 3:44',     badge: '#3'     },
          { icon: 'activity', title: 'Root & Branch',       sub: 'Fern & Moss · 4:58',     badge: '#4'     },
          { icon: 'activity', title: 'Velvet Underground',  sub: 'Coeur de Bois · 6:01',   badge: '#5'     },
          { icon: 'activity', title: 'Open Window',         sub: 'Blue Mesa · 3:28',       badge: '#6'     },
        ]},
        { type: 'tags', label: 'Controls', items: ['▶ PLAY', 'SHUFFLE', 'Edit', 'Share'] },
      ],
    },
    {
      id: 'party',
      label: 'Party',
      content: [
        { type: 'metric', label: 'listening party. LIVE', value: '8 people', sub: 'Now: Melt Into You · 1:42 / 4:28 · 6 reactions · Party chat active' },
        { type: 'metric-row', items: [
          { label: 'Listening',  value: '8' },
          { label: 'Reactions',  value: '22' },
          { label: 'In chat',    value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Orbital Drift',  sub: 'this breakdown is 🔥 — just now',       badge: '🔥 5'  },
          { icon: 'activity', title: 'Fern & Moss',    sub: 'been on repeat for days — 1m ago',      badge: '✨ 3'  },
          { icon: 'activity', title: 'Sable Creek',    sub: 'turn this up!!! — 2m ago',              badge: '💚 8'  },
          { icon: 'activity', title: 'Coeur de Bois',  sub: 'Aroha never misses — 4m ago',           badge: '🎵 2'  },
        ]},
        { type: 'tags', label: 'React', items: ['🔥', '✨', '💚', '🎵', '⚡'] },
      ],
    },
  ],
  nav: [
    { id: 'now',     label: 'NOW',     icon: '▶' },
    { id: 'library', label: 'LIBRARY', icon: '⊞' },
    { id: 'radio',   label: 'RADIO',   icon: '◎' },
    { id: 'artist',  label: 'ARTIST',  icon: '◉' },
    { id: 'party',   label: 'PARTY',   icon: '◈' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'hum-mock', 'HUM — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/hum-mock`);
