import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'EMBER',
  tagline:   'Your podcast, deeply understood',
  archetype: 'audio-intelligence',
  palette: {
    bg:      '#0D0907',
    surface: '#1E1009',
    text:    '#E8D5C4',
    accent:  '#C45E1A',
    accent2: '#F0A030',
    muted:   'rgba(232,213,196,0.40)',
  },
  lightPalette: {
    bg:      '#FAF5F0',
    surface: '#FFFFFF',
    text:    '#2A1A0E',
    accent:  '#C45E1A',
    accent2: '#E8821A',
    muted:   'rgba(42,26,14,0.45)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'AI FOR YOU', value: '4 new picks', sub: '97% · 94% · 91% · 89% match scores' },
        { type: 'tags', label: 'Trending Genres', items: ['Business', 'AI & Tech', 'Science', 'Philosophy', 'Health'] },
        { type: 'list', items: [
          { icon: 'play',  title: 'Mental Models That Work', sub: 'The Knowledge Project · 1h 12m',   badge: '◈ 97%' },
          { icon: 'play',  title: 'Founder Lessons 2026',   sub: 'Y Combinator · 54m',               badge: '◈ 94%' },
          { icon: 'play',  title: 'Sleep Optimization',     sub: 'Huberman Lab · 2h 04m',            badge: '◈ 91%' },
          { icon: 'play',  title: 'Naval Ravikant Returns', sub: 'Tim Ferriss Show · 3h 11m',        badge: '◈ 89%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'TRENDING NOW', value: 'Hard Fork' },
          { label: 'EP COUNT',    value: '#247'       },
          { label: 'GENRE',       value: 'Tech'       },
        ]},
      ],
    },
    {
      id: 'episode', label: 'Episode Detail',
      content: [
        { type: 'metric', label: 'NOW PLAYING', value: 'Mental Models That Work', sub: 'The Knowledge Project · Ep. 92 · 1h 12m' },
        { type: 'metric-row', items: [
          { label: 'PROGRESS', value: '29:14' },
          { label: 'REMAINING', value: '43:20' },
          { label: 'MATCH', value: '97%' },
        ]},
        { type: 'progress', items: [
          { label: 'Playback progress', pct: 40 },
        ]},
        { type: 'text', label: 'AI INSIGHTS PREVIEW', value: '"Inversion is the most powerful mental model — ask what you want to avoid, not what you want." — Shane Parrish, 7:02\n\n3 key ideas · 2 quotes · 1 action item extracted.' },
        { type: 'tags', label: 'Episode Tags', items: ['Mental Models', 'Decision Making', 'Charlie Munger', 'Inversion'] },
      ],
    },
    {
      id: 'insights', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'EPISODE', value: 'Mental Models That Work', sub: 'The Knowledge Project · 3 ideas · 2 quotes · 1 action' },
        { type: 'list', items: [
          { icon: 'star', title: 'Inversion thinking',          sub: '0:00–8:42 · Ask what leads to failure first',         badge: '01' },
          { icon: 'star', title: 'Second-order consequences',   sub: '12:15–24:30 · Go deeper than first-order effects',    badge: '02' },
          { icon: 'star', title: 'Circle of competence',        sub: '31:00–48:20 · Know what you know — and what you don\'t', badge: '03' },
        ]},
        { type: 'text', label: 'NOTABLE QUOTE', value: '"Inversion is the most powerful mental model — ask what you want to avoid, not what you want." — Shane Parrish, 7:02' },
        { type: 'text', label: 'ACTION ITEM', value: 'Write down 3 decisions you regret and apply inversion to each one. Ask: what would I have needed to avoid this outcome?' },
        { type: 'list', items: [
          { icon: 'play', title: 'Decision Making 101',    sub: 'Related episode · 58m', badge: '▷' },
          { icon: 'play', title: 'Charlie Munger on Models', sub: 'Related episode · 1h 24m', badge: '▷' },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Listening Stats',
      content: [
        { type: 'metric', label: 'LISTENING TIME · 30 DAYS', value: '48 hrs', sub: '+18% vs last month · 5.6 episodes/wk avg' },
        { type: 'metric-row', items: [
          { label: 'EPISODES',    value: '37'   },
          { label: 'SHOWS',       value: '12'   },
          { label: 'AI INSIGHTS', value: '184'  },
          { label: 'STREAK',      value: '21d 🔥' },
        ]},
        { type: 'progress', items: [
          { label: 'MON — 2.6h', pct: 55 },
          { label: 'TUE — 3.8h', pct: 80 },
          { label: 'WED — 4.3h', pct: 90 },
          { label: 'THU — 3.1h', pct: 65 },
          { label: 'FRI — 4.8h', pct: 100 },
          { label: 'SAT — 2.1h', pct: 45 },
          { label: 'SUN — 3.3h (today)', pct: 70 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'The Knowledge Project', sub: '12.4h this month',    badge: '#1' },
          { icon: 'chart', title: 'Huberman Lab',          sub: '8.2h this month',     badge: '#2' },
          { icon: 'chart', title: 'Y Combinator',          sub: '6.1h this month',     badge: '#3' },
          { icon: 'chart', title: 'Lex Fridman Podcast',   sub: '5.8h this month',     badge: '#4' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'AI TASTE PROFILE', value: 'Alex Kim', sub: 'Deep-dives on mental models, longevity, AI, and indie business. Prefers 45–90 min. Morning listener.' },
        { type: 'metric-row', items: [
          { label: 'THIS MONTH', value: '48h'  },
          { label: 'EPISODES',  value: '37'   },
          { label: 'INSIGHTS',  value: '184'  },
          { label: 'STREAK',    value: '21d'  },
        ]},
        { type: 'progress', items: [
          { label: 'Business & Startups',  pct: 34 },
          { label: 'Science & Health',     pct: 28 },
          { label: 'Technology & AI',      pct: 22 },
          { label: 'Philosophy & Ideas',   pct: 11 },
          { label: 'News & Politics',      pct: 5  },
        ]},
        { type: 'tags', label: 'Preferences', items: ['AI Insights ON', 'Auto-next ON', 'High quality', 'Reminder 8:00 AM'] },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'episode',  label: 'Episode',  icon: 'play'   },
    { id: 'insights', label: 'Insights', icon: 'star'   },
    { id: 'stats',    label: 'Stats',    icon: 'chart'  },
    { id: 'profile',  label: 'Profile',  icon: 'user'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 Ember mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'ember-mock', 'EMBER — Interactive Mock');
console.log('Mock live at:', result.url);
