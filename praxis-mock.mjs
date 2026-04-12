import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PRAXIS',
  tagline:   'Let agents run your money.',
  archetype: 'ai-autonomous-finance-dark',
  palette: {
    bg:      '#0B0C0F',
    surface: '#131519',
    text:    '#F2F3F5',
    accent:  '#A8FF3E',
    accent2: '#00D4FF',
    muted:   'rgba(242,243,245,0.50)',
  },
  lightPalette: {
    bg:      '#F5F7F2',
    surface: '#FFFFFF',
    text:    '#0D1000',
    accent:  '#5A9900',
    accent2: '#0077A8',
    muted:   'rgba(13,16,0,0.45)',
  },
  screens: [
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$158,420', sub: '▲ +$3,820 month-to-date' },
        { type: 'metric-row', items: [
          { label: 'Cash', value: '$52.1k' },
          { label: 'Invest', value: '$89.4k' },
          { label: 'Debt', value: '-$8k' },
        ]},
        { type: 'tags', label: 'Active Agents', items: ['◈ Budget Guardian', '◈ Auto-Save', '◈ Tax Tracker', '◈ DCA Pilot'] },
        { type: 'progress', items: [
          { label: 'Emergency Fund', pct: 74 },
          { label: 'Investment Goal', pct: 63 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Budget Guardian', sub: 'Flagged 3 charges — $48 saved', badge: '2m' },
          { icon: 'activity', title: 'Auto-Save', sub: 'Moved $300 to HYSA on payday', badge: '6h' },
        ]},
      ],
    },
    {
      id: 'cashflow', label: 'Flow',
      content: [
        { type: 'metric-row', items: [
          { label: 'Income', value: '$6,420' },
          { label: 'Expenses', value: '$2,140' },
          { label: 'Net', value: '+$4,280' },
        ]},
        { type: 'text', label: 'Monthly Trend', value: 'Spending down 18% vs March. Auto-Save swept $300 on payday. All categories within budget.' },
        { type: 'progress', items: [
          { label: 'Housing (34%)', pct: 34 },
          { label: 'Food (24%)', pct: 24 },
          { label: 'Software (14%)', pct: 14 },
          { label: 'Transport (10%)', pct: 10 },
        ]},
        { type: 'tags', label: 'vs Last Month', items: ['Income ▲ +12%', 'Spend ▼ -18%', 'Subscriptions ▼ -1'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'list', items: [
          { icon: 'zap', title: 'Budget Guardian', sub: '$634 saved · 2,401 checks · 9 flags', badge: 'LIVE' },
          { icon: 'activity', title: 'Auto-Save', sub: '$1,020 swept · 4.85% HYSA rate', badge: 'LIVE' },
          { icon: 'star', title: 'Tax Tracker', sub: '$4,100 tagged · Q2 est. $2,840', badge: 'LIVE' },
          { icon: 'chart', title: 'DCA Pilot', sub: '$400/mo · 14 buys · +18.4% return', badge: 'LIVE' },
        ]},
        { type: 'metric', label: 'Total Saved by Agents', value: '$634', sub: 'This month across all agents' },
      ],
    },
    {
      id: 'rules', label: 'Rules',
      content: [
        { type: 'metric', label: 'Automations', value: '7 active', sub: 'All rules running normally' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Payday Sweep', sub: 'Income > $1,500 → move 20% to HYSA', badge: 'ON' },
          { icon: 'alert', title: 'Subscription Guard', sub: 'Unused 30+ days → flag for cancel', badge: 'ON' },
          { icon: 'alert', title: 'Overspend Brake', sub: 'Food > $600/mo → alert + pause DCA', badge: 'ON' },
          { icon: 'check', title: 'Tax Tag', sub: 'Software/office merchants → deductible', badge: 'ON' },
          { icon: 'star', title: 'Goal Boost', sub: 'Net cash > avg +$500 → +$100 to goals', badge: 'ON' },
        ]},
      ],
    },
    {
      id: 'report', label: 'Report',
      content: [
        { type: 'metric', label: 'Financial Health Score', value: '96 / 100', sub: '▲ +6 points this week — your best ever' },
        { type: 'metric-row', items: [
          { label: 'Agent Saves', value: '$634' },
          { label: 'Net Flow', value: '+$4,280' },
          { label: 'Deductibles', value: '$4,100' },
        ]},
        { type: 'text', label: 'AI Summary', value: 'Your best week yet. Spending down 18%, all 4 goals advancing, Budget Guardian cancelled Hulu saving $7.99/mo.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Cancel Hulu', sub: 'Not used in 30 days · $7.99/mo', badge: '!' },
          { icon: 'alert', title: 'Q2 Tax Due', sub: '$2,840 due in 14 days', badge: '⚑' },
        ]},
        { type: 'tags', label: 'Highlights', items: ['Budget Guardian ✓', 'Auto-Save ✓', 'DCA Pilot ✓', 'Tax Tracker ✓'] },
      ],
    },
  ],
  nav: [
    { id: 'portfolio', label: 'Home', icon: 'home' },
    { id: 'cashflow',  label: 'Flow', icon: 'activity' },
    { id: 'agents',    label: 'Agents', icon: 'zap' },
    { id: 'rules',     label: 'Rules', icon: 'list' },
    { id: 'report',    label: 'Report', icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'praxis-mock',
});
const result = await publishMock(html, 'praxis-mock', 'PRAXIS — Interactive Mock');
console.log('Mock live at:', result.url);
