import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LOOP',
  tagline:   'close the feedback loop',
  archetype: 'analytics-platform',
  palette: {
    bg:      '#09090B',
    surface: '#19191F',
    text:    '#F4F4F5',
    accent:  '#F97316',
    accent2: '#8B5CF6',
    muted:   'rgba(244,244,245,0.38)',
  },
  lightPalette: {
    bg:      '#F8F7F5',
    surface: '#FFFFFF',
    text:    '#1A1A1C',
    accent:  '#EA580C',
    accent2: '#7C3AED',
    muted:   'rgba(26,26,28,0.42)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'Sessions',   value: '24,891' },
          { label: 'Completion', value: '68.3%'  },
          { label: 'NPS Score',  value: '94'     },
        ]},
        { type: 'metric', label: 'Avg Session Duration', value: '3m 42s', sub: 'Up from 3m 08s last week' },
        { type: 'progress', items: [
          { label: '/dashboard',  pct: 100 },
          { label: '/settings',   pct: 50  },
          { label: '/reports',    pct: 35  },
          { label: '/onboard',    pct: 24  },
        ]},
        { type: 'tags', label: 'Flags this week', items: ['Rage Clicks ×203', 'Dead Ends ×88', 'Exit Intent ×142'] },
        { type: 'text', label: 'AI Note', value: 'Email verification step is the #1 drop-off point. 28% of users abandon at this step — 419 sessions affected.' },
      ],
    },
    {
      id: 'sessions',
      label: 'Sessions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',    value: '24,891' },
          { label: 'Flagged',  value: '1,204'  },
          { label: 'Live now', value: '38'     },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'S-7821 · user@acme.com',    sub: '6m 14s · 12 pages · rage-click ×3', badge: '42' },
          { icon: 'eye',      title: 'S-7820 · Anonymous',         sub: '1m 08s · 3 pages · dead-end',       badge: '78' },
          { icon: 'activity', title: 'S-7819 · dev@loop.ai',       sub: '12m 33s · 28 pages',                badge: '91' },
          { icon: 'alert',    title: 'S-7818 · hello@co.io',       sub: '3m 55s · 7 pages · rage-click',    badge: '61' },
          { icon: 'user',     title: 'S-7816 · cto@startup.vc',    sub: '9m 22s · 19 pages',                badge: '88' },
        ]},
        { type: 'tags', label: 'Active filters', items: ['All sessions', 'This week', 'Any device'] },
      ],
    },
    {
      id: 'funnels',
      label: 'Funnels',
      content: [
        { type: 'metric', label: 'Signup → Activation', value: '68.3%', sub: '1,824 users entered this funnel' },
        { type: 'progress', items: [
          { label: 'Visit signup page',   pct: 100 },
          { label: 'Enter email',         pct: 83  },
          { label: 'Verify email',        pct: 60  },
          { label: 'Complete profile',    pct: 48  },
          { label: 'First action',        pct: 34  },
          { label: 'Activate feature',    pct: 27  },
        ]},
        { type: 'tags', label: 'AI drop-off tags', items: ['email verify ⚠ −27%', 'profile form ⚠ −21%', 'first action −30%'] },
        { type: 'text', label: 'AI Recommendation', value: 'Biggest opportunity: reduce email verification friction. Even a 10% improvement here adds ~276 activated users per week.' },
      ],
    },
    {
      id: 'insights',
      label: 'AI Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1'  },
          { label: 'Opportnty',value: '3'  },
          { label: 'Patterns', value: '8'  },
        ]},
        { type: 'list', items: [
          { icon: 'alert',  title: 'Email verify losing 28% of users',    sub: 'CRITICAL · 419 users · rage-click pattern detected',    badge: '!' },
          { icon: 'zap',    title: 'Power users activate 4× faster',       sub: 'OPPORTUNITY · 612 users · profile fill in <90s',          badge: '↑' },
          { icon: 'eye',    title: 'Mobile rage-clicks on nav icon',        sub: 'PATTERN · 2,093 users · target too small on mobile',     badge: '?' },
          { icon: 'chart',  title: 'Sunday traffic has highest NPS',        sub: 'TREND · NPS 94 vs 81 weekday avg · power-user segment', badge: '↗' },
        ]},
        { type: 'text', label: 'Generated', value: 'Synthesized from 24,891 sessions recorded between Apr 6–13 2026. Updated every 6 hours.' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',     value: '6'  },
          { label: 'Shared',     value: '12' },
          { label: 'Scheduled',  value: '3'  },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Weekly Funnel Summary',      sub: 'Weekly · Mon 09:00 · 4 recipients',    badge: 'SENT'  },
          { icon: 'bell',     title: 'AI Insights Digest',          sub: 'Daily · 08:00 · 8 recipients',         badge: 'LIVE'  },
          { icon: 'alert',    title: 'Rage Click Alert',            sub: 'Realtime trigger · 2 recipients',      badge: 'ON'    },
          { icon: 'calendar', title: 'Quarterly Deep Dive',         sub: 'Manual · Last: Apr 1 · 12 recipients', badge: 'DRAFT' },
          { icon: 'check',    title: 'Cohort Retention Analysis',   sub: 'Monthly · 1st · 6 recipients',         badge: 'SENT'  },
        ]},
        { type: 'tags', label: 'Export formats', items: ['PDF', 'CSV', 'Slack', 'Email', 'Webhook'] },
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview', icon: 'grid'     },
    { id: 'sessions',  label: 'Sessions', icon: 'eye'      },
    { id: 'funnels',   label: 'Funnels',  icon: 'filter'   },
    { id: 'insights',  label: 'Insights', icon: 'zap'      },
    { id: 'reports',   label: 'Reports',  icon: 'share'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'loop-mock', `${design.appName} — Interactive Mock`);
console.log('Mock:', result.status, '→ https://ram.zenbin.org/loop-mock');
