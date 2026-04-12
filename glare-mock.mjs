import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GLARE',
  tagline:   'Creator intelligence, amplified',
  archetype: 'creator-analytics',

  palette: {  // DARK — electric chartreuse on near-black
    bg:      '#050507',
    surface: '#0C0C11',
    text:    '#FFFFFF',
    accent:  '#CAFF33',
    accent2: '#FF4F6A',
    muted:   'rgba(255,255,255,0.45)',
  },
  lightPalette: {
    bg:      '#F8FAF0',
    surface: '#FFFFFF',
    text:    '#0A0A0E',
    accent:  '#6B8E00',
    accent2: '#D93257',
    muted:   'rgba(10,10,14,0.4)',
  },

  screens: [
    {
      id: 'command', label: 'Command',
      content: [
        { type: 'metric', label: 'Total Reach', value: '1.4M', sub: 'April to date — +18% vs last month' },
        { type: 'metric-row', items: [
          { label: 'New fans', value: '12.4K' },
          { label: 'Retention', value: '94%' },
          { label: 'Revenue', value: '$8,240' },
        ]},
        { type: 'text', label: 'Trend', value: 'Weekly reach up 18% — YouTube Shorts algorithm boosting distribution beyond your subscriber base.' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'YouTube short hit 280K views', sub: 'Today · +180K above baseline',   badge: '🔥' },
          { icon: 'activity', title: 'Substack open rate spike — 67%', sub: 'Today · Best in 90 days', badge: '↑' },
          { icon: 'share',  title: 'Instagram Reel reshared 1,200×', sub: 'Yesterday',                   badge: 'Viral' },
        ]},
      ],
    },
    {
      id: 'reach', label: 'Reach',
      content: [
        { type: 'metric', label: 'Monthly Reach', value: '1,412,008', sub: '↑ 18.2% vs last 30 days' },
        { type: 'progress', items: [
          { label: 'YouTube',   pct: 48 },
          { label: 'Instagram', pct: 30 },
          { label: 'Substack',  pct: 14 },
          { label: 'Podcast',   pct: 8  },
        ]},
        { type: 'text', label: 'Top Source', value: 'YouTube Shorts Algorithm — 68% of new subscribers this month discovered you through algorithm-surfaced Shorts.' },
        { type: 'tags', label: 'Active Platforms', items: ['YouTube', 'Instagram', 'Substack', 'Podcast'] },
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'April Revenue', value: '$8,240', sub: '↑ 32% vs March · On track for $10,800' },
        { type: 'progress', items: [
          { label: 'YouTube AdSense',  pct: 38 },
          { label: 'Substack Paid',    pct: 30 },
          { label: 'Sponsorships',     pct: 20 },
          { label: 'Digital Products', pct: 12 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Sponsor — TechFlow',  sub: 'Today',   badge: '+$800' },
          { icon: 'activity', title: 'YouTube payout',      sub: 'Apr 10',  badge: '+$1,560' },
          { icon: 'heart',    title: 'Substack billing',    sub: 'Apr 8',   badge: '+$620' },
        ]},
      ],
    },
    {
      id: 'content', label: 'Content',
      content: [
        { type: 'metric-row', items: [
          { label: 'Posts this month', value: '24' },
          { label: 'Avg engagement',  value: '18%' },
          { label: 'Top format',      value: 'Shorts' },
        ]},
        { type: 'list', items: [
          { icon: 'play',   title: 'I built an app in 48 hours',        sub: 'YouTube · 280K views · 18% eng', badge: '🔥' },
          { icon: 'eye',    title: 'The creator economy is broken',      sub: 'Substack · 94K · 67% open',     badge: '★' },
          { icon: 'heart',  title: 'Morning routine for makers',         sub: 'Instagram · 142K · 12%',         badge: '↗' },
          { icon: 'star',   title: 'How I made $8K in April',            sub: 'YouTube · 98K · 24%',            badge: '💰' },
          { icon: 'check',  title: 'One tool changed everything',        sub: 'Substack · 61K · 55%',           badge: '✓' },
        ]},
        { type: 'text', label: 'GLARE Insight', value: 'Upload 2× more Shorts. Your best ROI per hour of production is YouTube Shorts — 3× higher than long-form.' },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'Signal Score', value: '94', sub: 'Excellent momentum — top 5% of creators' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Viral window open',         sub: 'Post a follow-up Short now — 15× velocity', badge: 'HIGH' },
          { icon: 'bell',   title: 'Best posting time in 2h',   sub: 'Sat 11AM — your audience peaks',             badge: 'MID' },
          { icon: 'activity', title: '+1,247 subs in 6 hours',  sub: 'Above 99th percentile surge',                badge: 'HIGH' },
          { icon: 'alert',  title: 'IG engagement dip',         sub: 'Down 18% — try a carousel',                  badge: 'MID' },
          { icon: 'star',   title: 'Format opportunity',        sub: '15–30s Shorts → 3× reach in your niche',    badge: 'TIP' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Me',
      content: [
        { type: 'metric-row', items: [
          { label: 'All-time reach',  value: '24.8M' },
          { label: 'Total earned',    value: '$94K' },
          { label: 'Content pieces',  value: '1,240' },
        ]},
        { type: 'tags', label: 'Connected Platforms', items: ['YouTube', 'Instagram', 'Substack', 'Podcast'] },
        { type: 'list', items: [
          { icon: 'bell',     title: 'Notifications',         sub: 'Alerts & digests',             badge: '›' },
          { icon: 'settings', title: 'Connected Platforms',   sub: 'YouTube, Instagram, Substack', badge: '›' },
          { icon: 'star',     title: 'Subscription',          sub: 'Pro — $19/month',              badge: '›' },
          { icon: 'share',    title: 'Export Reports',        sub: 'CSV, PDF, API',                badge: '›' },
          { icon: 'code',     title: 'AI Insights',           sub: 'Powered by GLARE AI',          badge: '›' },
          { icon: 'lock',     title: 'Privacy & Data',        sub: 'Control your data',            badge: '›' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'command', label: 'Home',    icon: 'home' },
    { id: 'reach',   label: 'Reach',   icon: 'activity' },
    { id: 'revenue', label: 'Revenue', icon: 'chart' },
    { id: 'content', label: 'Content', icon: 'grid' },
    { id: 'profile', label: 'Me',      icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'glare-mock', 'GLARE — Interactive Mock');
console.log('Mock live at:', result.url);
