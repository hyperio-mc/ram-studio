import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'AURUM',
  tagline:   'Personal Wealth Intelligence',
  archetype: 'fintech-premium-light',

  palette: {            // Dark theme
    bg:      '#0E0C08',
    surface: '#1C1810',
    text:    '#FAF8F3',
    accent:  '#C49A3C',
    accent2: '#3D7A65',
    muted:   'rgba(250,248,243,0.40)',
  },

  lightPalette: {       // Light theme (primary)
    bg:      '#FAF8F3',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#9B7B3D',
    accent2: '#2F5D4E',
    muted:   'rgba(92,78,58,0.40)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Net Worth', value: '$4.28M', sub: '↑ +$164K this month · +8.4% YTD' },
        { type: 'metric-row', items: [
          { label: 'Equities', value: '$2.05M' },
          { label: 'Real Estate', value: '$1.20M' },
          { label: 'Private', value: '$600K' },
          { label: 'Cash', value: '$429K' },
        ]},
        { type: 'progress', items: [
          { label: 'Equities 48%', pct: 48 },
          { label: 'Real Estate 28%', pct: 28 },
          { label: 'Private 14%', pct: 14 },
          { label: 'Cash 10%', pct: 10 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'NetJets Charter', sub: 'Travel · Atlas Card', badge: '-$4,200' },
          { icon: 'chart', title: 'Dividend: AAPL', sub: 'Investment Income', badge: '+$1,240' },
          { icon: 'heart', title: 'Nobu Tokyo', sub: 'Dining · Atlas Card', badge: '-$680' },
        ]},
        { type: 'text', label: '✦ AI Insight', value: 'Equities outperformed target by 2.1%. Consider rebalancing $120K into private credit. Est. tax impact: $18K.' },
      ],
    },
    {
      id: 'accounts', label: 'Accounts',
      content: [
        { type: 'metric', label: 'Total Across 7 Accounts', value: '4 Institutions', sub: 'JPMorgan · Goldman · Blackstone · BofA' },
        { type: 'list', items: [
          { icon: 'layers', title: 'JPMorgan Private', sub: 'Wealth Management', badge: '$2.84M' },
          { icon: 'zap',    title: 'Atlas Card',       sub: 'Premium Credit',    badge: '-$12.8K' },
          { icon: 'map',    title: 'Blackstone RE',    sub: 'Real Estate Fund',  badge: '$1.20M' },
          { icon: 'chart',  title: 'Goldman Sachs',    sub: 'Investment',        badge: '$420K' },
          { icon: 'home',   title: 'BofA Private',     sub: 'Checking',          badge: '$429K' },
        ]},
        { type: 'tags', label: 'Asset Classes', items: ['Equities', 'Real Estate', 'Private Credit', 'Cash', 'Art'] },
      ],
    },
    {
      id: 'moves', label: 'Money Moves',
      content: [
        { type: 'metric-row', items: [
          { label: 'In', value: '+$64.5K' },
          { label: 'Out', value: '-$28.3K' },
          { label: 'Net', value: '+$36.2K' },
        ]},
        { type: 'progress', items: [
          { label: 'Travel 29%', pct: 29 },
          { label: 'Dining 17%', pct: 17 },
          { label: 'Property 23%', pct: 23 },
          { label: 'Services 11%', pct: 11 },
          { label: 'Other 20%', pct: 20 },
        ]},
        { type: 'list', items: [
          { icon: 'share',    title: 'Nobu Tokyo',       sub: 'Dining · 2h ago',       badge: '-$680' },
          { icon: 'activity', title: 'AAPL Dividend',    sub: 'Income · Today',         badge: '+$1,240' },
          { icon: 'play',     title: 'NetJets Charter',  sub: 'Travel · Yesterday',     badge: '-$4,200' },
          { icon: 'user',     title: 'JPM Advisory Fee', sub: 'Wealth Mgmt · Mar 27',   badge: '-$2,500' },
          { icon: 'home',     title: 'RE Rental Income', sub: 'Passive · Mar 25',       badge: '+$8,500' },
        ]},
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Wealth Goals', value: '3 / 5 On Track', sub: '2 goals need attention' },
        { type: 'progress', items: [
          { label: 'Lake Como Villa — 67%', pct: 67 },
          { label: 'Early Retirement — 53%', pct: 53 },
          { label: 'Art Collection — 88%', pct: 88 },
          { label: 'Yacht Charter — 40%', pct: 40 },
          { label: 'Philanthropy — 22%', pct: 22 },
        ]},
        { type: 'tags', label: 'Goal Status', items: ['On Track ✓', 'On Track ✓', 'Ahead ↑', 'Behind ↓', 'On Track ✓'] },
        { type: 'text', label: 'Priority Goal', value: 'Lake Como Villa: $3.2M target by Q4 2028. Currently $2.14M saved (67%). On current pace, you arrive Q2 2028 — ahead of schedule.' },
      ],
    },
    {
      id: 'concierge', label: 'AI Concierge',
      content: [
        { type: 'metric', label: 'AURUM AI', value: 'Your Advisor', sub: 'End-to-end encrypted · Data stays in vault' },
        { type: 'tags', label: 'Quick Actions', items: ['Rebalance Review', 'Tax Harvest', 'Monthly Summary', 'Estate Check'] },
        { type: 'list', items: [
          { icon: 'message', title: 'Should I rebalance?', sub: 'Equity at 48% — 3pts above target. Trim $120K.', badge: 'AI' },
          { icon: 'message', title: 'Villa timeline?', sub: 'Hit $3.2M by Q2 2028 at current savings rate.', badge: 'AI' },
          { icon: 'message', title: 'Tax exposure?', sub: 'Est. $18K on rebalancing. Consider Q4 harvest.', badge: 'AI' },
        ]},
        { type: 'text', label: 'Latest Insight', value: 'Your net worth grew 8.4% YTD — outperforming your 6% target. The excess return is primarily driven by tech equity positions. Consider locking in gains before Q2.' },
      ],
    },
  ],

  nav: [
    { id: 'overview',   label: 'Overview',  icon: 'eye'      },
    { id: 'accounts',   label: 'Accounts',  icon: 'layers'   },
    { id: 'moves',      label: 'Moves',     icon: 'activity' },
    { id: 'goals',      label: 'Goals',     icon: 'star'     },
    { id: 'concierge',  label: 'AI Guide',  icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'aurum-mock', 'AURUM — Interactive Mock');
console.log('Mock live at:', result.url);
