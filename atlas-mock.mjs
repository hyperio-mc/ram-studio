import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Atlas',
  tagline:   'Wealth, privately commanded',
  archetype: 'private-wealth-luxury',
  palette: {           // DARK theme (primary)
    bg:      '#070605',
    surface: '#0D0C0A',
    text:    '#F0EBE0',
    accent:  '#C8A96B',
    accent2: '#4A9B7A',
    muted:   'rgba(240,235,224,0.38)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F5F1EA',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#9B7A3A',
    accent2: '#3A7B5E',
    muted:   'rgba(26,23,20,0.42)',
  },
  screens: [
    {
      id: 'wealth', label: 'Wealth',
      content: [
        { type: 'metric', label: 'Total Net Worth', value: '$4,872,340', sub: '↑ +$38,210 (+0.79%) today vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Liquid',    value: '$248K' },
          { label: 'Invested',  value: '$3.9M' },
          { label: 'Credit',    value: '$0' },
        ]},
        { type: 'progress', items: [
          { label: 'YTD Performance vs S&P', pct: 76 },
          { label: 'Monthly Budget Used', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'star',    title: 'Vanguard ETF Dividend',          sub: 'Today',     badge: '+$1,240' },
          { icon: 'share',   title: 'Four Seasons Tokyo — Concierge', sub: 'Yesterday', badge: '-$8,400' },
          { icon: 'chart',   title: 'Goldman Sachs — Allocation',     sub: 'Mar 25',    badge: '+$24K' },
        ]},
        { type: 'text', label: 'Concierge Active', value: 'Tokyo dining at Saito confirmed — Apr 8 · 3 guests · Omakase' },
      ],
    },
    {
      id: 'portfolio', label: 'Portfolio',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '$3,924,100', sub: 'Managed by Goldman Sachs PWM · YTD +8.66%' },
        { type: 'metric-row', items: [
          { label: 'YTD Return',    value: '+$312K' },
          { label: 'vs S&P 500',   value: '+3.5%' },
          { label: 'Assets',       value: '14' },
        ]},
        { type: 'progress', items: [
          { label: 'Public Equities  52%',  pct: 52 },
          { label: 'Private Equity   18%',  pct: 18 },
          { label: 'Fixed Income     14%',  pct: 14 },
          { label: 'Real Estate      10%',  pct: 10 },
          { label: 'Alternatives      6%',  pct:  6 },
        ]},
        { type: 'tags', label: 'Top Holdings', items: ['VTSAX', 'BRK.B', 'AAPL', 'Gold ETF', 'RE Fund III'] },
      ],
    },
    {
      id: 'concierge', label: 'Concierge',
      content: [
        { type: 'metric', label: 'Active Request', value: 'Saito, Tokyo', sub: 'Apr 8 · 7:30 PM · 3 guests · Omakase · Confirmed' },
        { type: 'tags', label: 'Services', items: ['Fine Dining', 'Private Travel', 'Exclusive Events', 'Health & Wellness'] },
        { type: 'list', items: [
          { icon: 'star',     title: 'Wimbledon Royal Box',         sub: 'Jul 2024',  badge: '✓' },
          { icon: 'map',      title: 'Laucala Island — 10 nights',  sub: 'Dec 2023',  badge: '✓' },
          { icon: 'star',     title: 'Nobu Matsuhisa — 12 guests',  sub: 'Nov 2023',  badge: '✓' },
          { icon: 'play',     title: 'Le Bernardin, NYC',           sub: 'Sep 2023',  badge: '✓' },
        ]},
        { type: 'text', label: 'Your Concierge', value: 'Mei Yamamoto · Available 24/7 · Direct line active' },
      ],
    },
    {
      id: 'statements', label: 'Statements',
      content: [
        { type: 'metric', label: 'March 2026 Spend', value: '$24,830', sub: 'of $40,000 budget · 62% used' },
        { type: 'metric-row', items: [
          { label: 'Dining',  value: '$9,430' },
          { label: 'Travel',  value: '$7,690' },
          { label: 'Luxury',  value: '$5,480' },
        ]},
        { type: 'list', items: [
          { icon: 'star',    title: 'Saito Restaurant, Tokyo',      sub: 'Dining · Mar 26',  badge: '-$840' },
          { icon: 'map',     title: 'NetJets — Charter LAX-JFK',   sub: 'Travel · Mar 24',  badge: '-$14.2K' },
          { icon: 'heart',   title: 'Graff Diamonds, New York',    sub: 'Luxury · Mar 22',  badge: '-$6.4K' },
          { icon: 'chart',   title: 'Goldman Sachs — Interest',    sub: 'Income · Mar 20',  badge: '+$3.2K' },
          { icon: 'map',     title: 'The Ritz, Paris',             sub: 'Travel · Mar 18',  badge: '-$2.8K' },
        ]},
      ],
    },
    {
      id: 'membership', label: 'Membership',
      content: [
        { type: 'metric', label: 'ATLAS · Tier I · Private', value: 'James Whitmore', sub: 'Member since 2019 · **** **** **** 7291' },
        { type: 'progress', items: [
          { label: 'Travel Credits  $42K / $75K',  pct: 56 },
          { label: 'Event Access    8 / 20',        pct: 40 },
          { label: 'Annual Spend    $24.8K / $40K', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Concierge Requests', sub: 'Unlimited · 28 this year', badge: '∞' },
          { icon: 'calendar', title: 'Fine Dining Access', sub: '280+ curated restaurants',  badge: '✓' },
          { icon: 'zap',      title: 'Priority Travel',   sub: 'Jets, yachts & suites',      badge: '✓' },
        ]},
        { type: 'text', label: 'Renewal', value: 'Membership renews Jan 1, 2027 · Annual fee: $45,000' },
      ],
    },
  ],
  nav: [
    { id: 'wealth',     label: 'Wealth',     icon: 'home' },
    { id: 'portfolio',  label: 'Portfolio',  icon: 'chart' },
    { id: 'concierge',  label: 'Concierge',  icon: 'star' },
    { id: 'statements', label: 'Statements', icon: 'list' },
    { id: 'membership', label: 'Membership', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'atlas-mock', 'Atlas — Interactive Mock');
console.log('Mock live at:', result.url);
