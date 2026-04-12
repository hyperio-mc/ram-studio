import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG = 'gleam';

const design = {
  appName:   'GLEAM',
  tagline:   'Creator analytics for independent voices',
  archetype: 'creator-analytics',
  palette: {
    bg:      '#1A1210',
    surface: '#221A16',
    text:    '#FAF7F2',
    accent:  '#D97706',
    accent2: '#9A3412',
    muted:   'rgba(250,247,242,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#D97706',
    accent2: '#9A3412',
    muted:   'rgba(26,24,24,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Subscribers', value: '12,847' },
          { label: 'Open Rate', value: '41.2%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'New Posts', value: '6' },
          { label: 'Revenue MRR', value: '$1,840' },
        ]},
        { type: 'progress', items: [
          { label: 'The Art of Slow Growth', pct: 92 },
          { label: 'What Readers Actually Want', pct: 78 },
          { label: 'Building in Public: Month 6', pct: 62 },
        ]},
        { type: 'text', label: 'This Week', value: 'Your best open rate in 3 months. Consistency is compounding.' },
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      content: [
        { type: 'metric', label: 'Total Subscribers', value: '12,847', sub: '+124 this week' },
        { type: 'metric-row', items: [
          { label: 'Free', value: '10,209' },
          { label: 'Paid', value: '2,638' },
        ]},
        { type: 'progress', items: [
          { label: 'United States', pct: 42 },
          { label: 'United Kingdom', pct: 18 },
          { label: 'Canada', pct: 12 },
          { label: 'Australia', pct: 8 },
        ]},
        { type: 'tags', label: 'How They Found You', items: ['Direct 38%', 'Twitter 28%', 'Word of mouth 19%', 'Search 15%'] },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      content: [
        { type: 'metric-row', items: [
          { label: 'Published', value: '47' },
          { label: 'Avg Opens', value: '4.1K' },
          { label: 'Avg Rate', value: '38%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Why Consistency Beats Virality', sub: '8,249 opens · 61%', badge: '🏆' },
          { icon: 'activity', title: 'The Art of Slow Growth', sub: '4,821 opens · 52%', badge: '↑' },
          { icon: 'chart', title: 'What Readers Actually Want', sub: '3,940 opens · 47%', badge: '↑' },
        ]},
        { type: 'tags', label: 'By Format', items: ['Long-form essay', 'Interview', 'Link roundup', 'Short take'] },
      ],
    },
    {
      id: 'revenue',
      label: 'Revenue',
      content: [
        { type: 'metric', label: 'Monthly Recurring Revenue', value: '$1,840', sub: '+$212 from last month · ↑ 13%' },
        { type: 'progress', items: [
          { label: 'Paid subscriptions', pct: 72 },
          { label: 'Founding members', pct: 17 },
          { label: 'Sponsorships', pct: 9 },
          { label: 'Tips', pct: 2 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Churn Rate', value: '1.8%' },
          { label: 'Avg LTV', value: '$54.20' },
        ]},
        { type: 'text', label: 'Insight', value: 'At this growth rate, $3K MRR is achievable by Q3 without changing your publishing cadence.' },
      ],
    },
    {
      id: 'growth',
      label: 'Growth',
      content: [
        { type: 'metric-row', items: [
          { label: 'Net New', value: '+124' },
          { label: 'Viral Coeff', value: '1.08' },
          { label: 'Churn', value: '−18' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Morgan K.', sub: '28 referrals this month', badge: '🥇' },
          { icon: 'user', title: 'Sam Okafor', sub: '19 referrals this month', badge: '🥈' },
          { icon: 'user', title: 'Priya Singh', sub: '15 referrals this month', badge: '🥉' },
        ]},
        { type: 'text', label: 'Viral loop', value: 'Your k-factor of 1.08 means each subscriber brings in 1.08 more on average — a self-sustaining growth loop.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Elena Voss', value: 'PRO', sub: 'Member since Jan 2025' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Heartbeat Score', sub: 'Publishing consistency index', badge: '94/100' },
          { icon: 'calendar', title: 'Consistency Streak', sub: 'Weeks published without a miss', badge: '47' },
          { icon: 'star', title: 'Best Open Rate', sub: 'All-time record', badge: '61%' },
        ]},
        { type: 'tags', label: 'Connected', items: ['Stripe ✓', 'Substack Import ✓', 'Mailchimp —'] },
        { type: 'text', label: 'Plan', value: 'GLEAM Pro · Billed annually · Renews Jan 2027' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'audience',  label: 'Audience', icon: 'user' },
    { id: 'content',   label: 'Content',  icon: 'layers' },
    { id: 'revenue',   label: 'Revenue',  icon: 'chart' },
    { id: 'profile',   label: 'Profile',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, `${SLUG}-mock`, `${design.appName} — Interactive Mock`);
console.log(`Mock: ${result.status} → https://ram.zenbin.org/${SLUG}-mock`);
