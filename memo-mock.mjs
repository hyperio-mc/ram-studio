import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Memo',
  tagline:   'Your team, in writing.',
  archetype: 'async-communication',
  palette: {
    bg:      '#1C1A17',
    surface: '#252220',
    text:    '#FAF8F4',
    accent:  '#C0392B',
    accent2: '#4A7C6F',
    muted:   'rgba(250,248,244,0.42)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1A17',
    accent:  '#C0392B',
    accent2: '#4A7C6F',
    muted:   'rgba(28,26,23,0.42)',
  },
  screens: [
    {
      id: 'inbox', label: 'Inbox',
      content: [
        { type: 'metric-row', items: [
          { label: 'Unread',  value: '4'    },
          { label: 'Spaces',  value: '5'    },
          { label: 'Read Rate', value: '89%' },
        ]},
        { type: 'list', items: [
          { icon: 'message', title: 'Q2 Brand Refresh — Final Notes',  sub: 'Ravi M. · Design Lead · 11:32 am',  badge: '●' },
          { icon: 'message', title: 'Sprint 12 retrospective',         sub: 'Yuna K. · Product · 10:14 am',      badge: '●' },
          { icon: 'message', title: 'API rate limit upgrade path',     sub: 'Theo R. · Engineering · Yesterday',  badge: ''  },
          { icon: 'message', title: 'Launch week comms draft',         sub: 'Sera L. · Growth · Tuesday',         badge: ''  },
        ]},
        { type: 'tags', label: 'Active Spaces', items: ['Design Studio', 'Product Drops', 'Engineering', 'All Hands'] },
      ],
    },
    {
      id: 'reader', label: 'Read Memo',
      content: [
        { type: 'metric', label: 'Q2 Brand Refresh — Final Notes', value: 'Ravi M.', sub: 'Design Lead · Today 11:32 am' },
        { type: 'text', label: 'Memo', value: 'Attached the updated type scale. The Recoleta pairing with Instrument Sans is landing well — see the specimen PDF.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Lock headline weight at 700 for h1', sub: 'Typography decision', badge: '1' },
          { icon: 'check', title: 'Confirm warm-red as primary accent',  sub: 'Color decision',     badge: '2' },
          { icon: 'check', title: 'Icon set: stroke-only, 1.5px weight', sub: 'Icon decision',      badge: '3' },
        ]},
        { type: 'tags', label: 'Tags', items: ['Brand', 'Q2 2026', 'Design System'] },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Memos Sent',   value: '34'   },
          { label: 'Avg Read',     value: '2.4m' },
          { label: 'Open Rate',    value: '91%'  },
        ]},
        { type: 'progress', items: [
          { label: 'Q2 Brand Refresh',       pct: 94 },
          { label: 'Sprint 12 retrospective', pct: 87 },
          { label: 'Launch week comms draft', pct: 79 },
          { label: 'API rate limit notes',    pct: 65 },
        ]},
        { type: 'metric', label: 'Best Day', value: 'Thursday', sub: '91% read rate on avg' },
      ],
    },
    {
      id: 'write', label: 'Write',
      content: [
        { type: 'text', label: 'New Memo', value: 'Q3 Creative Direction Brief — Following last week\'s strategy session, here are the creative principles for Q3.' },
        { type: 'tags', label: 'Recipients', items: ['Design', 'Product', '+ Add'] },
        { type: 'metric-row', items: [
          { label: 'Words',   value: '127'  },
          { label: 'Est. read', value: '~1m' },
          { label: 'Spaces',  value: '2'    },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'brand-type-scale-v3.pdf', sub: '1.2 MB attached', badge: '📎' },
        ]},
      ],
    },
    {
      id: 'spaces', label: 'Spaces',
      content: [
        { type: 'list', items: [
          { icon: 'layers', title: 'Design Studio',   sub: 'Brand, UI, creative direction · 24 memos', badge: '24' },
          { icon: 'zap',    title: 'Product Drops',   sub: 'Launch updates, roadmap · 8 memos',        badge: '8'  },
          { icon: 'chart',  title: 'Growth & Data',   sub: 'Analytics, experiments · 5 memos',         badge: '5'  },
          { icon: 'code',   title: 'Engineering',     sub: 'Infra, deploys, tech notes · 16 memos',    badge: '16' },
          { icon: 'bell',   title: 'All Hands',       sub: 'Company-wide announcements · 3 memos',     badge: '3'  },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Memos', value: '56'  },
          { label: 'Members',     value: '12'  },
          { label: 'Active',      value: '5'   },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'inbox',   label: 'Inbox',   icon: 'message' },
    { id: 'reader',  label: 'Read',    icon: 'eye'     },
    { id: 'signals', label: 'Signals', icon: 'activity' },
    { id: 'write',   label: 'Write',   icon: 'plus'    },
    { id: 'spaces',  label: 'Spaces',  icon: 'grid'    },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'memo');
const result = await publishMock(built, 'memo-mock', 'Memo — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/memo-mock`);
