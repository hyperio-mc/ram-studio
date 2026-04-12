// wave-mock.mjs — Svelte interactive mock for WAVE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WAVE',
  tagline:   'Your signal in the noise.',
  archetype: 'podcast-dark-retro-terminal',
  palette: {
    bg:      '#0A0A0F',
    surface: '#141420',
    text:    '#F0EEF5',
    accent:  '#A78BFA',
    accent2: '#34D399',
    muted:   'rgba(240,238,245,0.4)',
  },
  lightPalette: {
    bg:      '#F4F2FA',
    surface: '#FFFFFF',
    text:    '#1A1628',
    accent:  '#7C3AED',
    accent2: '#059669',
    muted:   'rgba(26,22,40,0.45)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'text',   label: 'Trending',  value: 'Top podcasts in Design & Tech this week.' },
        { type: 'metric', label: 'Featured',   value: 'Design Therapy', sub: 'Ep.48 · The Figma Variable Problem · 52 min' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Design Therapy',  sub: 'The Figma Variable Problem · 52m',  badge: '#01' },
          { icon: 'code',     title: 'WIRED',           sub: 'The AI Act Explained · 41m',         badge: '#02' },
          { icon: 'layers',   title: '99% Invisible',   sub: 'Font Wars · 28m',                    badge: '#03' },
          { icon: 'zap',      title: 'Rework',          sub: 'Hiring is Guessing · 34m',           badge: '#04' },
          { icon: 'activity', title: 'Changelog',       sub: 'The Python Effect · 67m',            badge: '#05' },
        ]},
        { type: 'tags', label: 'Categories', items: ['🧠 Design','💻 Tech','🌱 Health','💸 Finance','🎙 Culture'] },
      ],
    },
    {
      id: 'now-playing', label: 'Now Playing',
      content: [
        { type: 'metric', label: 'Now Playing', value: 'Design Therapy · Ep.48', sub: 'The Figma Variable Problem' },
        { type: 'metric-row', items: [
          { label: 'Progress', value: '27:04' },
          { label: 'Total',    value: '52:00' },
          { label: 'Speed',    value: '1.25×' },
        ]},
        { type: 'progress', items: [
          { label: 'Episode progress', pct: 52 },
        ]},
        { type: 'text', label: 'Waveform',  value: 'Retro OS window chrome with traffic-light dots. Violet waveform bars show played sections; phosphor playhead marks current position.' },
        { type: 'tags', label: 'Controls', items: ['⏮ Prev','−15s','⏸ Pause','+30s','⏭ Next'] },
      ],
    },
    {
      id: 'episodes', label: 'Episodes',
      content: [
        { type: 'metric', label: 'Design Therapy', value: '48 Episodes', sub: 'Sarah Chen · 12K followers · Weekly' },
        { type: 'list', items: [
          { icon: 'play',  title: 'Ep 48 · The Figma Variable Problem',   sub: '52 min · NEW',  badge: '▶'  },
          { icon: 'play',  title: 'Ep 47 · Designing for Gen Z Attention', sub: '44 min · NEW',  badge: '▶'  },
          { icon: 'play',  title: 'Ep 46 · The Death of the Portfolio',    sub: '38 min',        badge: '↓'  },
          { icon: 'play',  title: 'Ep 45 · AI Won\'t Replace You, Yet',   sub: '61 min',        badge: '▶'  },
          { icon: 'check', title: 'Ep 44 · Dark Mode Economics',           sub: '29 min · ✓',   badge: '↺'  },
        ]},
        { type: 'tags', label: 'Filter', items: ['All','Newest','Downloaded','Played'] },
      ],
    },
    {
      id: 'queue', label: 'Queue',
      content: [
        { type: 'metric', label: 'Queue', value: '7 episodes', sub: '4h 23m total runtime' },
        { type: 'text',   label: 'Now Playing', value: 'Design Therapy Ep.48 · 27:04 / 52:00' },
        { type: 'list', items: [
          { icon: 'list', title: 'Designing for Gen Z Attention', sub: 'Design Therapy · 44m', badge: '2' },
          { icon: 'list', title: 'The AI Act Explained',          sub: 'WIRED · 41m',          badge: '3' },
          { icon: 'list', title: 'Font Wars',                     sub: '99% Invisible · 28m',  badge: '4' },
          { icon: 'list', title: 'Hiring is Guessing',            sub: 'Rework · 34m',         badge: '5' },
          { icon: 'list', title: 'The Python Effect',             sub: 'Changelog · 67m',      badge: '6' },
        ]},
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'This Week', value: '6h 18m', sub: 'Listening time across 5 podcasts' },
        { type: 'metric-row', items: [
          { label: 'Subscribed', value: '6'    },
          { label: 'Downloaded', value: '14'   },
          { label: 'Streak',     value: '12d'  },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Design Therapy',  sub: 'Sarah Chen · 48 eps',    badge: '●' },
          { icon: 'heart', title: '99% Invisible',   sub: 'Roman Mars · 602 eps',   badge: '●' },
          { icon: 'heart', title: 'WIRED',           sub: 'WIRED Editors · 88 eps', badge: '●' },
          { icon: 'heart', title: 'Rework',          sub: 'Basecamp · 116 eps',     badge: '●' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 30 }, { label: 'Tue', pct: 54 },
          { label: 'Wed', pct: 22 }, { label: 'Thu', pct: 68 },
          { label: 'Fri', pct: 80 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'discover',    label: 'Discover', icon: 'search'   },
    { id: 'now-playing', label: 'Playing',  icon: 'play'     },
    { id: 'episodes',    label: 'Episodes', icon: 'list'     },
    { id: 'queue',       label: 'Queue',    icon: 'layers'   },
    { id: 'library',     label: 'Library',  icon: 'heart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'wave-mock', 'WAVE — Interactive Mock');
console.log('Mock live at:', result.url);
