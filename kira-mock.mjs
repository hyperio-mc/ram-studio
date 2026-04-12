import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KIRA',
  tagline:   'creator intelligence, amplified',
  archetype: 'creator-analytics',
  palette: {
    bg:      '#0C1120',
    surface: '#111827',
    text:    '#F8FAFC',
    accent:  '#3A82FF',
    accent2: '#A855F7',
    muted:   'rgba(148,163,184,0.4)',
  },
  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#2563EB',
    accent2: '#7C3AED',
    muted:   'rgba(15,23,42,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Total Views', value: '4.28M', sub: '↑ 23.4% vs last period' },
        { type: 'metric-row', items: [
          { label: 'Subscribers', value: '284K' },
          { label: 'Watch Time',  value: '1.9M h' },
          { label: 'Revenue',     value: '$12.4K' },
        ]},
        { type: 'progress', items: [
          { label: 'Subscribers', pct: 72 },
          { label: 'Watch Time',  pct: 61 },
          { label: 'Revenue',     pct: 84 },
          { label: 'Engagement',  pct: 55 },
        ]},
        { type: 'list', items: [
          { icon: 'play',   title: 'How I built a $10K side hustle', sub: '142K views', badge: '🔥' },
          { icon: 'chart',  title: 'Creator toolkit 2026',           sub: '89K views',  badge: '📈' },
        ]},
      ],
    },
    {
      id: 'content',
      label: 'Content',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Posts', value: '247' },
          { label: 'Avg Views',   value: '17.3K' },
          { label: 'Top CTR',     value: '12.8%' },
        ]},
        { type: 'list', items: [
          { icon: 'play',    title: '$10K side hustle build',       sub: '142K views · CTR 14.2%', badge: '🔥' },
          { icon: 'play',    title: 'Creator toolkit 2026',         sub: '89K views · CTR 11.8%',  badge: '📈' },
          { icon: 'zap',     title: 'Morning productivity routine', sub: '67K views · CTR 9.4%',   badge: '⚡' },
          { icon: 'activity',title: 'Live Q&A — growth hacks',     sub: '31K views · CTR 6.1%',   badge: '🔴' },
          { icon: 'play',    title: '2026 content strategy',        sub: '24K views · CTR 7.3%',   badge: '🎙' },
        ]},
        { type: 'tags', label: 'Content Types', items: ['Video', 'Short', 'Live', 'Podcast'] },
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      content: [
        { type: 'metric', label: 'Subscribers', value: '284,127', sub: '+1,247 this month' },
        { type: 'progress', items: [
          { label: '18–24 yrs', pct: 31 },
          { label: '25–34 yrs', pct: 31 },
          { label: '35–44 yrs', pct: 22 },
          { label: '45+ yrs',   pct: 16 },
        ]},
        { type: 'list', items: [
          { icon: 'map',  title: 'United States',  sub: '42% of audience', badge: '🇺🇸' },
          { icon: 'map',  title: 'United Kingdom', sub: '18% of audience', badge: '🇬🇧' },
          { icon: 'map',  title: 'Canada',         sub: '12% of audience', badge: '🇨🇦' },
          { icon: 'map',  title: 'Australia',      sub: '8% of audience',  badge: '🇦🇺' },
        ]},
      ],
    },
    {
      id: 'revenue',
      label: 'Revenue',
      content: [
        { type: 'metric', label: 'Monthly Revenue', value: '$12,480', sub: '↑ $892 vs last month' },
        { type: 'progress', items: [
          { label: 'AdSense (42%)',       pct: 42 },
          { label: 'Sponsorships (38%)',  pct: 38 },
          { label: 'Memberships (13%)',   pct: 13 },
          { label: 'Merch (7%)',          pct: 7  },
        ]},
        { type: 'metric-row', items: [
          { label: 'AdSense',      value: '$5,240' },
          { label: 'Sponsorship',  value: '$4,800' },
          { label: 'Members',      value: '$1,680' },
        ]},
        { type: 'text', label: 'Next Payout', value: '$4,120 pending · Apr 15, 2026 · AdSense + Sponsorships' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Creator Score', value: '87/100', sub: '↑ 4 pts from last week' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Post 6–8 PM EST',          sub: 'Audience 2.4× more active on weekday evenings', badge: '⏰' },
          { icon: 'eye',    title: 'Add video chapters',        sub: '34% higher watch time with chapters enabled',   badge: '📖' },
          { icon: 'star',   title: 'Refresh 3 thumbnails',      sub: '12K+ monthly views unlocked with new thumbs',  badge: '🎯' },
          { icon: 'heart',  title: 'Boost reply rate to 25%',   sub: '1.8× faster growth vs 12% current rate',       badge: '💬' },
        ]},
        { type: 'tags', label: 'Insight Categories', items: ['Timing', 'Retention', 'Discovery', 'Community'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home'     },
    { id: 'content',   label: 'Content',  icon: 'play'     },
    { id: 'audience',  label: 'Audience', icon: 'user'     },
    { id: 'revenue',   label: 'Revenue',  icon: 'chart'    },
    { id: 'insights',  label: 'Insights', icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kira-mock', 'KIRA — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/kira-mock`);
