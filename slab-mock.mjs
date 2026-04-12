import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SLAB',
  tagline:   "The independent publisher's studio",
  archetype: 'content-publishing',
  palette: {
    bg:      '#1A1714',
    surface: '#24201C',
    text:    '#F5F0E8',
    accent:  '#C4511A',
    accent2: '#3D6B4F',
    muted:   'rgba(245,240,232,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#C4511A',
    accent2: '#3D6B4F',
    muted:   'rgba(26,23,20,0.4)',
  },
  screens: [
    {
      id: 'feed',
      label: 'Feed',
      content: [
        { type: 'metric', label: 'Morning Edition', value: 'The Quiet Revolution', sub: 'Feature · 4,821 readers · 8 min' },
        { type: 'list', items: [
          { icon: 'star',  title: 'The Quiet Revolution',         sub: '12,841 reads · Longform',  badge: '↑ #1'  },
          { icon: 'eye',   title: 'Writing as Infrastructure',    sub: '9,204 reads · Essay',      badge: '↑ #2'  },
          { icon: 'heart', title: 'Notes from the Field',         sub: '6,831 reads · Dispatch',   badge: '#3'    },
          { icon: 'share', title: 'On Algorithmic Memory',        sub: '4,320 reads · Culture',    badge: '#4'    },
        ]},
        { type: 'tags', label: 'Categories', items: ['Longform', 'Essays', 'Dispatch', 'Culture', 'Reviews'] },
      ],
    },
    {
      id: 'write',
      label: 'Write',
      content: [
        { type: 'metric-row', items: [
          { label: 'Words', value: '847'   },
          { label: 'Read',  value: '4m'    },
          { label: 'Grade', value: '11'    },
          { label: 'Score', value: '94%'   },
        ]},
        { type: 'text', label: 'Current Draft', value: 'The Quiet Revolution in Independent Media — Something is shifting in how we read. In 2026, the independent newsletter has become something more than a side project.' },
        { type: 'tags', label: 'Formatting', items: ['Bold', 'Italic', 'Heading', 'Quote', 'Link', 'Image'] },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric-row', items: [
          { label: 'Reads',     value: '47.8K'  },
          { label: 'New Subs',  value: '1,204'  },
          { label: 'Open Rate', value: '58%'    },
          { label: 'CTR',       value: '12.4%'  },
        ]},
        { type: 'progress', items: [
          { label: 'Email Open Rate',    pct: 58 },
          { label: 'Click-Through',      pct: 12 },
          { label: 'Full-Read Rate',     pct: 74 },
          { label: 'Subscriber Growth',  pct: 24 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'The Quiet Revolution',       sub: '12,841 reads',  badge: '+18%' },
          { icon: 'chart', title: 'Writing as Infrastructure',  sub: '9,204 reads',   badge: '+12%' },
          { icon: 'chart', title: 'Notes from the Field',       sub: '6,831 reads',   badge: '+8%'  },
        ]},
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',   value: '4,821' },
          { label: 'Paid',    value: '1,012' },
          { label: 'Free',    value: '3,614' },
          { label: 'Gifted',  value: '195'   },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Maria Santos',     sub: 'Paid · $9/mo · 2h ago',      badge: '$'  },
          { icon: 'user', title: 'Dev Patel',         sub: 'Free · 4h ago',              badge: '○'  },
          { icon: 'user', title: 'Claire Fontaine',   sub: 'Paid · $9/mo · Yesterday',  badge: '$'  },
          { icon: 'user', title: 'Tariq Ibrahim',     sub: 'Gifted · 1yr · 2d ago',     badge: '♡'  },
          { icon: 'user', title: 'Sophie Chen',       sub: 'Paid · $9/mo · 3d ago',     badge: '$'  },
        ]},
      ],
    },
    {
      id: 'revenue',
      label: 'Revenue',
      content: [
        { type: 'metric', label: 'Monthly Recurring Revenue', value: '$9,108', sub: '↑ +$1,204 this month · ARR $109K' },
        { type: 'metric-row', items: [
          { label: 'Paid Subs',    value: '$9,108' },
          { label: 'Tips',         value: '$284'   },
          { label: 'Sponsors',     value: '$1,200' },
          { label: 'Courses',      value: '$540'   },
        ]},
        { type: 'progress', items: [
          { label: 'Annual Goal ($150K)', pct: 71 },
          { label: 'Paid conversion',     pct: 21 },
          { label: 'Retention rate',      pct: 94 },
        ]},
        { type: 'text', label: 'Next Payout', value: '$8,642.40 · Scheduled May 1, 2026 · via Stripe' },
      ],
    },
  ],
  nav: [
    { id: 'feed',     label: 'Feed',    icon: 'home'     },
    { id: 'write',    label: 'Write',   icon: 'code'     },
    { id: 'stats',    label: 'Stats',   icon: 'chart'    },
    { id: 'audience', label: 'Readers', icon: 'user'     },
    { id: 'revenue',  label: 'Revenue', icon: 'zap'      },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'slab-mock', 'SLAB — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/slab-mock`);
