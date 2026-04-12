import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SCOUT',
  tagline:   'AI product analytics for indie dev teams',
  archetype: 'analytics-saas',
  palette: {
    bg:      '#1A1625',
    surface: '#231E35',
    text:    '#F0EEFF',
    accent:  '#8B70FF',
    accent2: '#FF6B35',
    muted:   'rgba(240,238,255,0.40)',
  },
  lightPalette: {
    bg:      '#F7F5F0',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#6B4EFF',
    accent2: '#FF6B35',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'text', label: 'Scout AI', value: 'Signups up 34% since last Tuesday — likely driven by the new pricing page copy.' },
        { type: 'metric-row', items: [
          { label: 'Visitors', value: '3,847' },
          { label: 'Signups',  value: '127'   },
          { label: 'MRR',      value: '$4,210' },
        ]},
        { type: 'metric', label: 'Activation Rate', value: '28.3%', sub: '↓ 3.1% vs yesterday' },
        { type: 'progress', items: [
          { label: 'page_view',        pct: 92 },
          { label: 'signup_completed', pct: 34 },
          { label: 'upgrade_clicked',  pct: 18 },
          { label: 'feature_used',     pct: 67 },
        ]},
      ],
    },
    {
      id: 'funnels',
      label: 'Funnels',
      content: [
        { type: 'text', label: 'Signup Funnel', value: 'Last 7 days · 3.3% overall conversion rate' },
        { type: 'progress', items: [
          { label: 'Landing Page (3,847)',    pct: 100 },
          { label: 'Pricing Page (1,923)',    pct: 50  },
          { label: 'Signup Started (847)',    pct: 22  },
          { label: 'Email Verified (541)',    pct: 14  },
          { label: 'Onboarding Done (127)',   pct: 3   },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Adding social proof to the pricing page could reduce the 50% drop at step 2.' },
      ],
    },
    {
      id: 'ai',
      label: 'AI',
      content: [
        { type: 'text', label: 'Scout AI Copilot', value: 'Ask anything about your users, events, or funnels in plain English.' },
        { type: 'list', items: [
          { icon: 'zap',     title: 'Why did signups spike on Tuesday?', sub: 'Traced to 2.1× traffic spike on /pricing at 2:14 PM' },
          { icon: 'chart',   title: 'Which features do activated users use first?', sub: '84% → dashboard_viewed, 61% → import_csv, 44% → invite' },
          { icon: 'filter',  title: 'What is our biggest dropoff?', sub: '50% drop between Landing Page → Pricing Page' },
        ]},
        { type: 'tags', label: 'Suggested prompts', items: ['Show me top dropoff points', 'Compare this week vs last', 'Which cohort retains best?'] },
      ],
    },
    {
      id: 'sessions',
      label: 'Sessions',
      content: [
        { type: 'metric', label: 'Live Right Now', value: '23', sub: 'users actively browsing' },
        { type: 'list', items: [
          { icon: 'user',  title: 'alice@startup.io',   sub: '8 pages · upgrade_clicked',  badge: 'New'  },
          { icon: 'user',  title: 'bob@demo.co',        sub: '3 pages · signup_completed',  badge: 'New'  },
          { icon: 'user',  title: 'carol@design.co',    sub: '14 pages · feature_used',     badge: '↑'    },
          { icon: 'user',  title: 'dan@techcorp.com',   sub: '6 pages · export_csv',        badge: ''     },
          { icon: 'user',  title: 'eve@solo.dev',       sub: '2 pages · page_view',         badge: ''     },
        ]},
      ],
    },
    {
      id: 'events',
      label: 'Events',
      content: [
        { type: 'text', label: 'Event Explorer', value: 'Last 7 days · 8 tracked events' },
        { type: 'list', items: [
          { icon: 'activity', title: 'page_view',           sub: '48.2K events',  badge: '+12%' },
          { icon: 'check',    title: 'signup_completed',    sub: '892 events',    badge: '+34%' },
          { icon: 'zap',      title: 'upgrade_clicked',     sub: '241 events',    badge: '+8%'  },
          { icon: 'star',     title: 'feature_used',        sub: '6.1K events',   badge: '-5%'  },
          { icon: 'share',    title: 'invite_teammate',     sub: '127 events',    badge: '+44%' },
          { icon: 'play',     title: 'session_start',       sub: '3.8K events',   badge: '+15%' },
        ]},
      ],
    },
    {
      id: 'setup',
      label: 'Setup',
      content: [
        { type: 'text', label: 'Get Started', value: '2 of 5 steps completed — you\'re almost there!' },
        { type: 'progress', items: [
          { label: 'Install SDK',       pct: 100 },
          { label: 'Track first event', pct: 100 },
          { label: 'Set up a funnel',   pct: 0   },
          { label: 'Invite teammate',   pct: 0   },
          { label: 'Connect Scout AI',  pct: 0   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Steps Done', value: '2/5' },
          { label: 'Events',     value: '48K' },
          { label: 'SDK',        value: 'v2.1' },
        ]},
        { type: 'tags', label: 'Next Steps', items: ['Set up funnel', 'Invite teammate', 'Connect AI'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',   icon: 'activity' },
    { id: 'funnels',  label: 'Funnels', icon: 'filter'   },
    { id: 'ai',       label: 'AI',      icon: 'zap'      },
    { id: 'sessions', label: 'Live',    icon: 'eye'      },
    { id: 'events',   label: 'Events',  icon: 'layers'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'scout-mock', 'SCOUT — Interactive Mock');
console.log('Mock live at:', result.url);
