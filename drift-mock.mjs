import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Drift',
  tagline:   'Market intelligence, without the noise',
  archetype: 'market-intelligence-light',
  palette: {
    bg:      '#1B1918',
    surface: '#2A2522',
    text:    '#F6F3EE',
    accent:  '#E8623A',
    accent2: '#3B7DD8',
    muted:   'rgba(246,243,238,0.4)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1B1918',
    accent:  '#E8623A',
    accent2: '#3B7DD8',
    muted:   'rgba(27,25,24,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric-row', items: [
          { label: 'SaaS Index', value: '+4.2%' },
          { label: 'AI Tools',   value: '+11.7%' },
          { label: 'DevOps',     value: '-1.3%' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Notion',   sub: 'Productivity',   badge: '↑ +3 updates' },
          { icon: 'chart', title: 'Linear',   sub: 'Dev Tools',       badge: 'New pricing' },
          { icon: 'chart', title: 'Coda',     sub: 'Productivity',    badge: '↓ -2.1%' },
          { icon: 'chart', title: 'Obsidian', sub: 'Knowledge Mgmt',  badge: '→ No change' },
        ]},
        { type: 'tags', label: 'Markets', items: ['SaaS', 'Dev Tools', 'Productivity', 'AI'] },
      ],
    },
    {
      id: 'rivals', label: 'Rivals',
      content: [
        { type: 'metric', label: 'Linear — Est. Users', value: '82K', sub: '+12% QoQ' },
        { type: 'metric-row', items: [
          { label: 'Pricing', value: '$8/mo' },
          { label: 'NPS Score', value: '71' },
          { label: 'Reviews', value: '4.6★' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',  title: 'New pricing tier',        sub: 'Mar 29 · Added Plus at $8/seat',   badge: 'Pricing' },
          { icon: 'code', title: 'GitHub deep integration', sub: 'Mar 25 · Auto issue from PRs',     badge: 'Feature' },
          { icon: 'star', title: 'Mobile app v3.2 shipped', sub: 'Mar 18 · Offline mode added',      badge: 'Product' },
        ]},
        { type: 'text', label: 'Intel Summary', value: 'Linear is accelerating on enterprise with new pricing and deep GitHub integration. Primary threat vector for Jira migration plays.' },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'New Signals Today', value: '24', sub: '+9 vs yesterday' },
        { type: 'list', items: [
          { icon: 'alert',   title: 'Notion acquires Clay CRM', sub: 'TechCrunch · 2h ago', badge: 'M&A' },
          { icon: 'zap',     title: 'Linear Cycles 2.0',        sub: 'Product Hunt · 4h ago', badge: 'Feature' },
          { icon: 'message', title: 'Ask HN: Obsidian vs Notion', sub: 'HN · 6h ago',        badge: 'Community' },
          { icon: 'star',    title: '340 new Coda reviews',     sub: 'G2 · 8h ago · 3.9★',  badge: 'Reviews' },
          { icon: 'code',    title: 'Linear CLI 10K stars',     sub: 'GitHub · 12h ago',     badge: 'OSS' },
        ]},
        { type: 'tags', label: 'Filter', items: ['High', 'Pricing', 'Feature', 'Press'] },
      ],
    },
    {
      id: 'trends', label: 'Trends',
      content: [
        { type: 'text', label: 'Key Insight', value: 'Linear gained +32pts share in 6 months while Coda declined steadily. AI-powered features driving product-led switch.' },
        { type: 'progress', items: [
          { label: 'Linear',  pct: 74 },
          { label: 'Notion',  pct: 66 },
          { label: 'Coda',    pct: 22 },
          { label: 'Obsidian',pct: 38 },
        ]},
        { type: 'progress', items: [
          { label: 'AI Features',      pct: 88 },
          { label: 'Integrations',     pct: 74 },
          { label: 'Mobile Apps',      pct: 62 },
          { label: 'Enterprise Deals', pct: 45 },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '4', sub: '0 snoozed' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Pricing change detected', sub: 'Linear raised prices 15% on Pro', badge: '2h' },
          { icon: 'eye',   title: 'New competitor entered',  sub: 'Felt.app entered Dev Tools on G2', badge: '6h' },
          { icon: 'bell',  title: 'Share threshold crossed', sub: 'Notion dropped below 30%',        badge: '1d' },
          { icon: 'check', title: 'Weekly digest ready',     sub: '7-day report compiled',           badge: '2d' },
        ]},
        { type: 'tags', label: 'Alert Types', items: ['Pricing', 'Share', 'Review', 'Funding', 'Feature'] },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Home',    icon: 'home'     },
    { id: 'rivals',   label: 'Rivals',  icon: 'eye'      },
    { id: 'signals',  label: 'Signals', icon: 'activity' },
    { id: 'trends',   label: 'Trends',  icon: 'chart'    },
    { id: 'alerts',   label: 'Alerts',  icon: 'bell'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'drift-mock', 'Drift — Interactive Mock');
console.log('Mock live at:', result.url);
