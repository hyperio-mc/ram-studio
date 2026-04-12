import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BEACON',
  tagline:   'Your Signal, Live',
  archetype: 'creator-analytics',

  palette: {            // DARK theme
    bg:      '#080808',
    surface: '#111111',
    text:    '#FFFFFF',
    accent:  '#00FF88',
    accent2: '#FF6B35',
    muted:   'rgba(255,255,255,0.35)',
  },
  lightPalette: {       // LIGHT theme
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0A0A0A',
    accent:  '#00B860',
    accent2: '#E55A25',
    muted:   'rgba(10,10,10,0.4)',
  },

  screens: [
    {
      id: 'pulse',
      label: 'Pulse',
      content: [
        { type: 'metric', label: 'Total Reach', value: '284,719', sub: '↑ 12.4% vs last 7 days' },
        { type: 'metric-row', items: [
          { label: 'Posts', value: '47' },
          { label: 'Engages', value: '8.2K' },
          { label: 'Saves', value: '1.4K' },
        ]},
        { type: 'tags', label: 'Live Signals', items: ['Twitter/X +482', 'Instagram +1.2K', 'Newsletter 38%', 'YouTube +892'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Twitter / X', sub: '+482 new follows', badge: '2m' },
          { icon: 'eye', title: 'Instagram', sub: '+1.2K views', badge: '8m' },
          { icon: 'mail', title: 'Newsletter', sub: '38% open rate', badge: '1h' },
          { icon: 'play', title: 'YouTube', sub: '+892 views', badge: '3h' },
        ]},
      ],
    },
    {
      id: 'content',
      label: 'Content',
      content: [
        { type: 'text', label: 'Top Post', value: '"Why I quit my job to build in public" — 48.2K views, 6.8% engagement' },
        { type: 'metric-row', items: [
          { label: 'Views', value: '48.2K' },
          { label: 'Saves', value: '892' },
          { label: 'Rate', value: '6.8%' },
        ]},
        { type: 'progress', items: [
          { label: 'Twitter / X', pct: 68 },
          { label: 'Newsletter', pct: 52 },
          { label: 'Instagram', pct: 39 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'My first $10K month', sub: '12.1K views · 9.2% engage', badge: '↑' },
          { icon: 'star', title: '5 tools that changed how I ship', sub: '8.4K views · 5.1% engage', badge: '→' },
          { icon: 'heart', title: 'The moment I almost gave up', sub: '6.2K views · 7.8% engage', badge: '↑' },
        ]},
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      content: [
        { type: 'metric', label: 'Total Audience', value: '84K', sub: 'Across all platforms' },
        { type: 'progress', items: [
          { label: 'Twitter / X  — 41.2K', pct: 49 },
          { label: 'Instagram — 22.8K', pct: 27 },
          { label: 'Newsletter — 12.1K', pct: 14 },
          { label: 'YouTube — 7.9K', pct: 9 },
        ]},
        { type: 'text', label: '🔮 AI Insight', value: 'Newsletter growing 3× faster than your average — lean in here.' },
        { type: 'metric-row', items: [
          { label: 'New this week', value: '+892' },
          { label: 'Avg per day', value: '+127' },
          { label: 'Best day', value: 'Tue' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'progress', items: [
          { label: '100K Reach — 12 days left', pct: 85 },
          { label: '50 Posts — 4 days left', pct: 94 },
          { label: '10K Newsletter — 28 days left', pct: 79 },
          { label: '$5K Revenue — 45 days left', pct: 56 },
        ]},
        { type: 'metric-row', items: [
          { label: 'On Track', value: '3' },
          { label: 'At Risk', value: '1' },
          { label: 'Done', value: '7' },
        ]},
        { type: 'text', label: 'Next milestone', value: '"50 Posts" milestone just 3 posts away — you\'re ahead of schedule!' },
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '3', sub: 'Needs your attention' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Viral post detected', sub: '"Why I quit…" up 4.8× in 2h', badge: 'HIGH' },
          { icon: 'alert', title: 'Instagram reach fell', sub: 'Down 34% — post at 6–8pm', badge: 'MED' },
          { icon: 'bell', title: 'Newsletter near 10K', sub: '103 subscribers from goal', badge: 'INFO' },
          { icon: 'star', title: 'Best time to post', sub: 'Tue & Thu at 7pm = +22%', badge: 'TIP' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'pulse',    label: 'Pulse',   icon: 'activity' },
    { id: 'content',  label: 'Content', icon: 'layers' },
    { id: 'audience', label: 'Audience',icon: 'user' },
    { id: 'goals',    label: 'Goals',   icon: 'chart' },
    { id: 'alerts',   label: 'Alerts',  icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'beacon-mock', 'BEACON — Interactive Mock');
console.log('Mock live at:', result.url);
