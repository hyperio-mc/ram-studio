import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SHADE',
  tagline:   'cloud cost intelligence',
  archetype: 'devops-finops',
  palette: {           // DARK theme
    bg:      '#020514',
    surface: '#0C1228',
    text:    '#D4D7F5',
    accent:  '#7066F5',
    accent2: '#22D3EE',
    muted:   'rgba(107,114,168,0.4)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F0F2FF',
    surface: '#FFFFFF',
    text:    '#0A0E2A',
    accent:  '#5A5DF0',
    accent2: '#0BB8D4',
    muted:   'rgba(10,14,42,0.4)',
  },
  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: 'Month-to-Date Spend', value: '$47,284', sub: '↑ 12.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'EC2', value: '$18.2K' },
          { label: 'S3', value: '$6.1K' },
          { label: 'RDS', value: '$11.4K' },
        ]},
        { type: 'progress', items: [
          { label: 'EC2 Compute', pct: 39 },
          { label: 'RDS Database', pct: 24 },
          { label: 'CloudFront', pct: 12 },
          { label: 'Lambda', pct: 9 },
        ]},
        { type: 'text', label: 'AI Insight', value: 'EC2 spend trending 22% over budget. Reserved Instance recommendation could save $4,200/mo.' },
      ],
    },
    {
      id: 'services',
      label: 'Services',
      content: [
        { type: 'metric', label: 'Total Cloud Spend', value: '$47.3K', sub: 'Across 8 active services' },
        { type: 'tags', label: 'Filter by Environment', items: ['Production', 'Staging', 'Dev', 'Data'] },
        { type: 'list', items: [
          { icon: 'chart', title: 'EC2 Compute · us-east-1', sub: '$12,441 · +8% MoM', badge: '39%' },
          { icon: 'chart', title: 'RDS Aurora · us-east-1', sub: '$8,220 · +21% MoM', badge: '24%' },
          { icon: 'chart', title: 'CloudFront · Global', sub: '$5,890 · -2% MoM', badge: '12%' },
          { icon: 'chart', title: 'Lambda · us-east-1', sub: '$4,120 · +5% MoM', badge: '9%' },
          { icon: 'chart', title: 'S3 Storage · Global', sub: '$6,100 · -3% MoM', badge: '13%' },
        ]},
      ],
    },
    {
      id: 'anomaly',
      label: 'Anomaly',
      content: [
        { type: 'metric', label: 'Active Anomalies', value: '3', sub: '2 critical · 1 medium' },
        { type: 'list', items: [
          { icon: 'alert', title: 'EC2 Spike · us-east-1', sub: 'Expected $420 · Actual $1,428', badge: '⚠ CRIT' },
          { icon: 'alert', title: 'Lambda Cold Starts', sub: 'Expected $12 · Actual $89', badge: 'HIGH' },
          { icon: 'alert', title: 'S3 Egress Surge', sub: 'Expected $0.80 · Actual $4.20', badge: 'MED' },
        ]},
        { type: 'text', label: 'AI Insight', value: 'EC2 anomaly correlates with prod deploy in us-east at 14:23 UTC. Recommend reviewing auto-scaling policies.' },
      ],
    },
    {
      id: 'forecast',
      label: 'Forecast',
      content: [
        { type: 'metric', label: 'Projected Month-End', value: '$61,400', sub: '87% confidence · ↑ $14.1K over current' },
        { type: 'metric-row', items: [
          { label: 'Oct', value: '$28K' },
          { label: 'Nov', value: '$34K' },
          { label: 'Dec', value: '$41K' },
        ]},
        { type: 'progress', items: [
          { label: 'Reserved Instances', pct: 63 },
          { label: 'Right-size EC2', pct: 28 },
          { label: 'S3 Lifecycle', pct: 9 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Reserved Instances', sub: 'Quick Win · Save $4,200/mo', badge: '✓' },
          { icon: 'zap', title: 'Right-size EC2 ×12', sub: 'Moderate · Save $1,840/mo', badge: '→' },
          { icon: 'zap', title: 'S3 Lifecycle Rules', sub: 'Easy · Save $620/mo', badge: '→' },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'Alert Summary', value: '2 Active', sub: '5 resolved this week' },
        { type: 'list', items: [
          { icon: 'bell', title: 'Daily Spend > $2,500', sub: 'Policy active · All regions', badge: 'ON' },
          { icon: 'bell', title: 'Anomaly 2.5× baseline', sub: 'Policy active · ML-powered', badge: 'ON' },
          { icon: 'bell', title: 'Budget 80% Reached', sub: 'Monthly · Slack + PagerDuty', badge: 'ON' },
          { icon: 'bell', title: 'New Service Created', sub: 'Policy paused', badge: 'OFF' },
        ]},
        { type: 'tags', label: 'Channels', items: ['Slack #cloud-costs', 'PagerDuty', 'Email Digest'] },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'services', label: 'Services', icon: 'layers' },
    { id: 'anomaly',  label: 'Anomaly',  icon: 'alert' },
    { id: 'forecast', label: 'Forecast', icon: 'activity' },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'shade-mock', 'SHADE — Cloud Cost Intelligence Mock');
console.log('✓ Mock live at:', result.url);
