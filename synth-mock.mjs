import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SYNTH',
  tagline:   'Voice Intelligence Platform',
  archetype: 'ai-analytics',
  palette: {
    bg:      '#0B0C14',
    surface: '#12131F',
    text:    '#E8E5FF',
    accent:  '#7C5CFC',
    accent2: '#22D3EE',
    muted:   'rgba(139,135,196,0.45)',
  },
  lightPalette: {
    bg:      '#F3F2FF',
    surface: '#FFFFFF',
    text:    '#1A1040',
    accent:  '#6D44F0',
    accent2: '#0891B2',
    muted:   'rgba(26,16,64,0.4)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'AI Health Score', value: '94.2', sub: '/ 100 — Excellent' },
        { type: 'metric-row', items: [
          { label: 'Calls Today', value: '2,847' },
          { label: 'Avg Duration', value: '3:42' },
          { label: 'Sentiment', value: '78%' },
        ]},
        { type: 'progress', items: [
          { label: 'Billing Questions', pct: 68 },
          { label: 'Tech Support', pct: 52 },
          { label: 'Cancellations', pct: 31 },
          { label: 'New Features', pct: 22 },
        ]},
        { type: 'text', label: 'Live Activity', value: '23 active calls right now — peak hour traffic detected.' },
      ],
    },
    {
      id: 'calls', label: 'Call List',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'Sarah Mitchell', sub: '#8842 · 4:23 · Billing', badge: 'Resolved' },
          { icon: 'alert', title: 'James Chen', sub: '#8841 · 7:11 · Tech Support', badge: 'Escalated' },
          { icon: 'activity', title: 'Maria Santos', sub: '#8840 · 2:56 · New Feature', badge: 'Resolved' },
          { icon: 'bell', title: 'David Park', sub: '#8839 · 1:34 · General', badge: 'Callback' },
          { icon: 'alert', title: 'Emma Wilson', sub: '#8838 · 5:48 · Cancellation', badge: 'Flagged' },
        ]},
        { type: 'tags', label: 'Active Filters', items: ['All Calls', 'Today', 'Sorted: Recent'] },
      ],
    },
    {
      id: 'detail', label: 'Call Detail',
      content: [
        { type: 'metric', label: 'Sentiment Score', value: '+31%', sub: 'Improved across call · Sarah Mitchell' },
        { type: 'progress', items: [
          { label: 'Sentiment Lift', pct: 91 },
          { label: 'Resolution Confidence', pct: 96 },
          { label: 'Script Adherence', pct: 88 },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Agent (0:04)', sub: 'Hello, thank you for calling Synth Support…', badge: 'Agent' },
          { icon: 'message', title: 'Customer (0:12)', sub: 'I have a question about my billing statement…', badge: 'User' },
          { icon: 'play', title: 'Agent (0:22)', sub: 'Of course! I can see your account…', badge: 'Agent' },
          { icon: 'check', title: 'Resolution (4:18)', sub: 'Issue resolved — plan upgrade offered', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Resolution Rate', value: '87%' },
          { label: 'Avg Handle', value: '3:42' },
          { label: 'Escalation', value: '4.8%' },
          { label: 'CES Score', value: '2.1' },
        ]},
        { type: 'progress', items: [
          { label: 'Positive Sentiment', pct: 78 },
          { label: 'Script Adherence', pct: 84 },
          { label: 'First Call Resolution', pct: 71 },
          { label: 'AI Coach Score', pct: 92 },
        ]},
        { type: 'tags', label: 'Top Topics', items: ['Billing (34%)', 'Support (28%)', 'Cancels (18%)', 'Features (12%)'] },
        { type: 'text', label: 'Period', value: 'Last 30 days · 84,720 calls analyzed · 219 agents monitored' },
      ],
    },
    {
      id: 'insights', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'Anomaly Detected', value: '340%', sub: 'Cancellation intent spike Tue 14:00-16:00' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Billing clarity improving', sub: 'Resolution rate rose from 71% → 87% after script update', badge: 'High' },
          { icon: 'alert', title: 'Agent ID 4421 flagged', sub: 'Below-average empathy score across 234 calls', badge: 'Medium' },
          { icon: 'star', title: 'Upsell signal detected', sub: '143 customers asked about analytics — none offered upgrade', badge: '$4.2K' },
        ]},
        { type: 'text', label: 'Coach Recommendation', value: 'Schedule tone coaching for 3 agents. Estimated impact: +6 point resolution rate lift within 2 weeks.' },
      ],
    },
    {
      id: 'integrations', label: 'Setup',
      content: [
        { type: 'metric', label: 'Workspace', value: 'Pro', sub: '2,847 / 5,000 monthly calls used (57%)' },
        { type: 'list', items: [
          { icon: 'check', title: 'Salesforce CRM', sub: '2,847 contacts synced', badge: 'Active' },
          { icon: 'check', title: 'Zendesk', sub: 'Ticket creation enabled', badge: 'Active' },
          { icon: 'check', title: 'Slack', sub: 'Alerts → #synth-alerts', badge: 'Active' },
          { icon: 'check', title: 'Zapier', sub: '12 automations running', badge: 'Active' },
          { icon: 'settings', title: 'Webhooks API', sub: '3 active endpoints configured', badge: 'Active' },
        ]},
        { type: 'tags', label: 'AI Model', items: ['GPT-4o Voice', 'Fine-tuned', 'Auto-coaching ON'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',     icon: 'home' },
    { id: 'calls',        label: 'Calls',    icon: 'activity' },
    { id: 'analytics',    label: 'Insights', icon: 'chart' },
    { id: 'integrations', label: 'Setup',    icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'synth-mock', 'SYNTH — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/synth-mock');
