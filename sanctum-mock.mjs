import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SANCTUM',
  tagline:   'A ritual for deep work',
  archetype: 'productivity-focus',
  palette: {           // DARK theme (primary)
    bg:      '#09090E',
    surface: '#13141C',
    text:    '#E8E6F0',
    accent:  '#D4A853',
    accent2: '#8B6FD4',
    muted:   'rgba(232,230,240,0.42)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F4F2EE',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#B8882E',
    accent2: '#6B52B5',
    muted:   'rgba(26,24,24,0.42)',
  },
  screens: [
    {
      id: 'sanctuary', label: 'Sanctuary',
      content: [
        { type: 'metric', label: 'Current Streak', value: '14 days', sub: 'Best: 21 days · Total: 312 hours focused' },
        { type: 'metric-row', items: [
          { label: 'Sessions',   value: '3 today' },
          { label: 'Depth Avg',  value: '82%' },
          { label: 'This Week',  value: '6 sessions' },
        ]},
        { type: 'text',   label: "Today's Intention", value: '"Ship the component library and design review."' },
        { type: 'list', items: [
          { icon: 'check', title: 'Morning Block',   sub: '7:30 – 9:15 AM',  badge: '94% depth' },
          { icon: 'play',  title: 'Design Sprint',   sub: '10:00 – 12:00',   badge: 'Active'    },
          { icon: 'calendar', title: 'Evening Review', sub: '4:00 – 4:45 PM', badge: '45m'      },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 85 },
          { label: 'Tue', pct: 92 },
          { label: 'Wed', pct: 70 },
          { label: 'Thu', pct: 88 },
          { label: 'Fri', pct: 60 },
          { label: 'Sat', pct: 0  },
          { label: 'Sun', pct: 0  },
        ]},
      ],
    },
    {
      id: 'ritual', label: 'Ritual',
      content: [
        { type: 'text',  label: 'Project', value: '◉  Sanctum Design System' },
        { type: 'tags',  label: 'Duration', items: ['25 m', '45 m', '1 h ✓', '1.5 h', '2 h'] },
        { type: 'text',  label: 'Intention', value: '"Ship the component tokens PR"' },
        { type: 'tags',  label: 'Ambient Mode', items: ['◌ Silent', '◉ Ember ✓', '⧖ Rain'] },
        { type: 'metric', label: 'Ready to begin', value: '1h session', sub: 'Sanctum Design System · Ember mode' },
      ],
    },
    {
      id: 'chamber', label: 'Chamber',
      content: [
        { type: 'metric', label: 'Time Remaining', value: '37:22', sub: 'Sanctum Design System · 62% elapsed' },
        { type: 'metric-row', items: [
          { label: 'Depth',    value: '91%'    },
          { label: 'Flow',     value: 'Entered' },
          { label: 'Elapsed',  value: '22:38'  },
        ]},
        { type: 'text',   label: 'Intention', value: '"Ship the component tokens PR"' },
        { type: 'tags',   label: 'Controls', items: ['✎ Note', '⏸ Pause', '■ End'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Quick Note', sub: 'Tokenized spacing: 4/8/16/24/32px', badge: 'just now' },
          { icon: 'star', title: 'Quick Note', sub: 'Review dark surface hierarchy',     badge: '8m ago'   },
        ]},
      ],
    },
    {
      id: 'harvest', label: 'Harvest',
      content: [
        { type: 'metric', label: 'Session Depth Score', value: '87', sub: 'out of 100 · Design Sprint · 1h 00m' },
        { type: 'metric-row', items: [
          { label: 'Time Focused', value: '1h 00m' },
          { label: 'Notes',        value: '4'       },
          { label: 'Flow State',   value: 'Entered' },
        ]},
        { type: 'text', label: 'What did you complete?', value: '✅  Shipped component tokens PR' },
        { type: 'list', items: [
          { icon: 'star', title: 'Tokenized spacing scale',     sub: '4/8/16/24/32px',      badge: '✓' },
          { icon: 'star', title: 'Dark surface hierarchy',      sub: 'Need follow-up',       badge: '→' },
          { icon: 'star', title: 'Export tokens as CSS + JSON', sub: 'Done',                 badge: '✓' },
          { icon: 'star', title: 'Naming convention review',    sub: 'With Tomas tomorrow',  badge: '→' },
        ]},
      ],
    },
    {
      id: 'codex', label: 'Codex',
      content: [
        { type: 'text', label: '✦ Pattern Insight', value: 'You focus deepest between 7–9 AM. Sessions over 90m reduce depth by 18%.' },
        { type: 'metric-row', items: [
          { label: 'Best Window', value: '7–9 AM' },
          { label: 'Best Day',    value: 'Monday' },
          { label: 'Avg Depth',   value: '82%'    },
          { label: 'Top Session', value: '94%'    },
        ]},
        { type: 'progress', items: [
          { label: 'Wk 1', pct: 78 },
          { label: 'Wk 2', pct: 85 },
          { label: 'Wk 3', pct: 62 },
          { label: 'Wk 4', pct: 90 },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Design Sprint',    sub: 'Today · 1h 00m',      badge: '87%' },
          { icon: 'check', title: 'Morning Block',    sub: 'Today · 1h 45m',      badge: '94%' },
          { icon: 'check', title: 'Strategy Review',  sub: 'Yesterday · 45m',     badge: '78%' },
          { icon: 'check', title: 'Deep Reading',     sub: 'Sat Mar 22 · 2h 10m', badge: '91%' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'sanctuary', label: 'Sanctuary', icon: 'home'     },
    { id: 'ritual',    label: 'Ritual',    icon: 'layers'   },
    { id: 'chamber',   label: 'Chamber',   icon: 'eye'      },
    { id: 'harvest',   label: 'Harvest',   icon: 'star'     },
    { id: 'codex',     label: 'Codex',     icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sanctum-mock', 'SANCTUM — Interactive Mock');
console.log('Mock live at:', result.url);
