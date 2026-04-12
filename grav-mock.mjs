import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GRAV',
  tagline:   'AI Relationship Intelligence',
  archetype: 'network-intelligence',
  palette: {           // dark theme
    bg:      '#030014',
    surface: '#0A0520',
    text:    '#F1F5F9',
    accent:  '#A78BFA',
    accent2: '#38BDF8',
    muted:   'rgba(148,163,184,0.5)',
  },
  lightPalette: {      // light theme
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1E1B4B',
    accent:  '#7C3AED',
    accent2: '#0284C7',
    muted:   'rgba(30,27,75,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Gravity Score', value: '847', sub: '↑ 23 pts this week' },
        { type: 'metric-row', items: [
          { label: 'Connections', value: '312' },
          { label: 'Signals', value: '18' },
          { label: 'Pending', value: '5' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Sara Okafor', sub: 'Head of Product · Stripe · Pull: 94%', badge: '94' },
          { icon: 'user', title: 'James Liu', sub: 'Partner · a16z · Pull: 89%', badge: '89' },
          { icon: 'user', title: 'Mia Torres', sub: 'Founder · Vercel · Pull: 82%', badge: '82' },
        ]},
        { type: 'text', label: 'AI Pulse', value: 'Your network is gaining momentum. 3 warm introductions are ready to send.' },
      ],
    },
    {
      id: 'network',
      label: 'Network',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '312' },
          { label: 'Dormant', value: '47' },
          { label: 'Avg Pull', value: '76%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Sara Okafor', sub: 'Stripe · Head of Product', badge: '94%' },
          { icon: 'star', title: 'James Liu', sub: 'a16z · Partner', badge: '89%' },
          { icon: 'star', title: 'Mia Torres', sub: 'Vercel · Founder', badge: '82%' },
          { icon: 'star', title: 'Ravi Patel', sub: 'Notion · PM Lead', badge: '78%' },
          { icon: 'user', title: 'Chen Wei', sub: 'OpenAI · Research', badge: '71%' },
        ]},
        { type: 'tags', label: 'Industry Focus', items: ['AI / ML', 'VC', 'Founders', 'SaaS', 'Dev Tools'] },
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'metric', label: 'Top Match', value: '97%', sub: 'Nina Arora · CTO @ Anthropic' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Nina Arora', sub: 'Anthropic · CTO · 3 mutual connections', badge: '97%' },
          { icon: 'zap', title: 'Dev Anand', sub: 'Sequoia · Partner · 4 mutual', badge: '91%' },
          { icon: 'zap', title: 'Lena Müller', sub: 'Figma · Design Lead · 2 mutual', badge: '86%' },
          { icon: 'zap', title: 'Omar Khalil', sub: 'YC · Group Partner · 6 mutual', badge: '80%' },
        ]},
        { type: 'text', label: 'Why These Matches', value: 'AI analyzes shared interests, warm path distance, and mutual connection quality to rank introductions.' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Network Health', value: '92/100' },
          { label: 'Response Rate', value: '78%' },
        ]},
        { type: 'progress', items: [
          { label: 'AI / ML Connections', pct: 34 },
          { label: 'VC & Investors', pct: 22 },
          { label: 'Founders', pct: 28 },
          { label: 'Product & Design', pct: 16 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Weak Ties Opportunity', sub: '47 dormant VC connections currently active', badge: '!' },
          { icon: 'heart', title: 'Introduction Bridge', sub: 'Sara can unlock 12 new founder connections', badge: '12' },
          { icon: 'activity', title: 'Industry Shift', sub: 'AI/ML up 8% this month in your network', badge: '↑' },
        ]},
      ],
    },
    {
      id: 'pulse',
      label: 'Pulse',
      content: [
        { type: 'text', label: 'AI Draft Ready', value: '"Hey Sara — congrats on the Stripe Series D. Would love to reconnect and explore potential synergies with what we\'re building."' },
        { type: 'list', items: [
          { icon: 'message', title: 'James Liu', sub: 'Coffee next week?', badge: '3' },
          { icon: 'check', title: 'Mia Torres', sub: 'Thanks for the intro!', badge: '✓' },
          { icon: 'message', title: 'Ravi Patel', sub: 'Would love to chat about...', badge: '1' },
          { icon: 'check', title: 'Chen Wei', sub: 'Following up on our convo', badge: '✓' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sent This Week', value: '7' },
          { label: 'Response Rate', value: '71%' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Your Gravity', value: '847', sub: 'Top 5% of all networks' },
        { type: 'metric-row', items: [
          { label: 'Network', value: '312' },
          { label: 'Streak', value: '14d' },
          { label: 'Rank', value: 'Top 5%' },
        ]},
        { type: 'tags', label: 'Gravity Fields', items: ['AI / ML', 'Startups', 'Product', 'VC Networks', 'B2B SaaS'] },
        { type: 'list', items: [
          { icon: 'settings', title: 'Notification Preferences', sub: 'Manage alerts', badge: '›' },
          { icon: 'eye', title: 'Privacy & Visibility', sub: 'Control who sees you', badge: '›' },
          { icon: 'layers', title: 'Integrations', sub: 'LinkedIn, Gmail, Calendar', badge: '›' },
          { icon: 'zap', title: 'Gravity Algorithm', sub: 'Customize your scoring', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'network',   label: 'Network',  icon: 'grid' },
    { id: 'discover',  label: 'Discover', icon: 'search' },
    { id: 'insights',  label: 'Insights', icon: 'activity' },
    { id: 'pulse',     label: 'Pulse',    icon: 'message' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'grav-mock', 'GRAV — Interactive Mock');
console.log('Mock live at:', result.url ?? `https://ram.zenbin.org/grav-mock`);
console.log('Status:', result.status);
