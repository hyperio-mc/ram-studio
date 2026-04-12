import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ZEST',
  tagline:   'AI pipeline intelligence',
  archetype: 'revenue-intelligence',

  palette: {
    bg:      '#080A0F',
    surface: '#161C28',
    text:    '#E2E8F0',
    accent:  '#F59E0B',
    accent2: '#3B82F6',
    muted:   'rgba(100,116,139,0.6)',
  },
  lightPalette: {
    bg:      '#F8F7F4',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#D97706',
    accent2: '#2563EB',
    muted:   'rgba(15,23,42,0.4)',
  },

  screens: [
    {
      id: 'pipeline', label: 'Pipeline',
      content: [
        { type: 'metric', label: 'Total Pipeline Value', value: '$4.2M', sub: '▲ 18.4% vs last quarter' },
        { type: 'metric-row', items: [
          { label: 'Active Deals', value: '47' },
          { label: 'Avg Size',     value: '$89K' },
          { label: 'Win Rate',     value: '34%' },
        ]},
        { type: 'progress', items: [
          { label: 'Prospecting  $820K',  pct: 19 },
          { label: 'Qualified    $1.1M',  pct: 26 },
          { label: 'Proposal     $780K',  pct: 19 },
          { label: 'Negotiation  $940K',  pct: 22 },
          { label: 'Closed Won   $560K',  pct: 13 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'DataFlow Inc', sub: 'Proposal viewed 3× this week', badge: '🔥' },
          { icon: 'chart',    title: 'Acme Corp',    sub: 'Email opened — Q2 pricing',    badge: '↑' },
          { icon: 'check',    title: 'BlueOcean LLC',sub: 'Closed Won · $210K ARR',       badge: '✓' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'Top Opportunity', value: 'DataFlow Inc', sub: '88% close probability · Est. Apr 28' },
        { type: 'metric-row', items: [
          { label: 'Email Opens', value: '12×' },
          { label: 'Meetings',    value: '3' },
          { label: 'Doc Views',   value: '8×' },
        ]},
        { type: 'text', label: 'AI Recommendation', value: 'Send DataFlow a 12-month contract proposal to accelerate Q2 close. Engagement signals are at peak — optimal timing window is now.' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'SkyNet AI — At Risk',         sub: '32 days no contact · Re-engage now',     badge: '⚠' },
          { icon: 'zap',      title: 'Vertex Labs — Follow Up',     sub: '5 days since last contact',              badge: '!' },
          { icon: 'calendar', title: 'BlueOcean — Contract Expiry', sub: 'Renewal risk in 18 days',                badge: '↻' },
        ]},
        { type: 'tags', label: 'Signal Types', items: ['Email Opens', 'Meetings', 'Doc Views', 'CRM Updates', 'Website Visits'] },
      ],
    },
    {
      id: 'forecast', label: 'Forecast',
      content: [
        { type: 'metric-row', items: [
          { label: 'Committed', value: '$1.2M' },
          { label: 'Best Case', value: '$1.8M' },
        ]},
        { type: 'progress', items: [
          { label: 'Sarah Li · $420K target',   pct: 92 },
          { label: 'Marcus K. · $380K target',  pct: 71 },
          { label: 'Raj J. · $340K target',     pct: 85 },
          { label: 'Tom C. · $290K target',     pct: 58 },
        ]},
        { type: 'metric', label: 'Q2 Quota Attainment', value: '78%', sub: '$1.12M of $1.44M goal' },
        { type: 'list', items: [
          { icon: 'user',   title: 'Sarah Li',   sub: '$420K · 92% attainment', badge: '★' },
          { icon: 'user',   title: 'Marcus K.',  sub: '$380K · 71% attainment', badge: '↑' },
          { icon: 'user',   title: 'Raj J.',     sub: '$340K · 85% attainment', badge: '★' },
          { icon: 'user',   title: 'Tom C.',     sub: '$290K · 58% attainment', badge: '↓' },
        ]},
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'DataFlow Inc',  sub: 'Proposal viewed (3rd time) · 2m ago',      badge: '🔥' },
          { icon: 'message',  title: 'Acme Corp',     sub: 'Email opened — Q2 pricing · 18m ago',      badge: '📧' },
          { icon: 'calendar', title: 'Vertex Labs',   sub: 'Meeting booked · Apr 15, 2pm · 1h ago',    badge: '🤝' },
          { icon: 'alert',    title: 'SkyNet AI',     sub: 'No contact 32 days — at risk · 2h ago',    badge: '⚠' },
          { icon: 'check',    title: 'BlueOcean LLC', sub: 'Closed Won · $210K ARR · 3h ago',          badge: '✅' },
          { icon: 'star',     title: 'NewWave SaaS',  sub: 'New deal · $95K opportunity · 1d ago',     badge: '➕' },
        ]},
        { type: 'tags', label: 'Filter Events', items: ['All', 'Hot Signals', 'Meetings', 'Closed', 'At Risk'] },
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Sarah Li — VP of Sales', value: 'Pro Plan', sub: 'Acme Co. · CRM synced ✓' },
        { type: 'list', items: [
          { icon: 'bell',     title: 'Smart Alerts',        sub: 'Notify on AI signal changes',    badge: 'ON' },
          { icon: 'calendar', title: 'Weekly AI Report',    sub: 'Sent every Monday 8am',          badge: 'ON' },
          { icon: 'zap',      title: 'Auto-qualify Leads',  sub: 'AI scores inbound leads',        badge: 'OFF' },
        ]},
        { type: 'tags', label: 'Integrations', items: ['Salesforce ✓', 'HubSpot ✓', 'Slack ✓', 'Gmail ✓', '+ Add'] },
        { type: 'text', label: 'AI Model', value: 'ZEST Intelligence v2.1 — Trained on 10M+ revenue signals. Updates weekly with your CRM data.' },
      ],
    },
  ],

  nav: [
    { id: 'pipeline', label: 'Pipeline', icon: 'chart' },
    { id: 'insights', label: 'Insights', icon: 'zap' },
    { id: 'forecast', label: 'Forecast', icon: 'activity' },
    { id: 'activity', label: 'Activity', icon: 'bell' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'zest-mock', 'ZEST — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/zest-mock');
