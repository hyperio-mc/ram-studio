import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HALO',
  tagline:   'Grow your podcast with editorial intelligence',
  archetype: 'analytics',
  palette: {           // DARK fallback
    bg:      '#1A1410',
    surface: '#2A2018',
    text:    '#FBF7F0',
    accent:  '#B5622A',
    accent2: '#E8924A',
    muted:   'rgba(251,247,240,0.38)',
  },
  lightPalette: {      // LIGHT theme (primary)
    bg:      '#FBF7F0',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#B5622A',
    accent2: '#E8924A',
    muted:   'rgba(26,20,16,0.42)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'This Week', value: '48,210', sub: 'total listens · +12.4% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Subscribers', value: '12.4K' },
          { label: 'Avg Listen',  value: '23m 40s' },
          { label: 'Revenue',     value: '$1,840' },
        ]},
        { type: 'text', label: 'Latest Episode', value: 'EP 147 — The Future of Voice Search w/ Dr. Sarah Okonkwo · 4,820 listens' },
        { type: 'progress', items: [
          { label: 'Mon',  pct: 62 },
          { label: 'Tue',  pct: 58 },
          { label: 'Wed',  pct: 74 },
          { label: 'Thu',  pct: 81 },
          { label: 'Fri',  pct: 69 },
          { label: 'Sat',  pct: 76 },
          { label: 'Today',pct: 44 },
        ]},
        { type: 'text', label: 'Trending Insight', value: '"Voice is the next frontier for brand storytelling." · Spotify Podcast Charts' },
      ],
    },
    {
      id: 'episodes', label: 'Episodes',
      content: [
        { type: 'metric', label: 'Now Playing', value: 'EP 147', sub: 'The Future of Voice Search · 19:24 / 54:22' },
        { type: 'list', items: [
          { icon: 'play',  title: 'Intro & Guest Background',  sub: '0:00  ·  Chapter 1', badge: '' },
          { icon: 'play',  title: 'State of Voice Assistants', sub: '8:14  ·  Chapter 2', badge: '' },
          { icon: 'activity', title: 'Voice SEO Strategies',  sub: '19:24 ·  Chapter 3',  badge: '▶ Now' },
          { icon: 'play',  title: 'Brand Voice Identity',     sub: '32:10 ·  Chapter 4', badge: '' },
          { icon: 'play',  title: 'The 2026 Prediction',      sub: '44:05 ·  Chapter 5', badge: '' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Speed', value: '1.0×' },
          { label: 'Completion', value: '73%' },
        ]},
      ],
    },
    {
      id: 'audience', label: 'Audience',
      content: [
        { type: 'metric', label: 'New Subscribers', value: '+340', sub: 'this week · ↑28% vs prev week' },
        { type: 'progress', items: [
          { label: 'Spotify',        pct: 44 },
          { label: 'Apple Podcasts', pct: 31 },
          { label: 'Google',         pct: 14 },
          { label: 'Other',          pct: 11 },
        ]},
        { type: 'metric-row', items: [
          { label: '25–34 Core', value: '41%' },
          { label: 'US',         value: '52%' },
          { label: 'Completion', value: '73%' },
        ]},
        { type: 'list', items: [
          { icon: 'map',    title: 'United States',   sub: '52% of listeners', badge: '🇺🇸' },
          { icon: 'map',    title: 'United Kingdom',  sub: '18% of listeners', badge: '🇬🇧' },
          { icon: 'map',    title: 'Canada',          sub: '11% of listeners', badge: '🇨🇦' },
          { icon: 'map',    title: 'Australia',       sub: '8% of listeners',  badge: '🇦🇺' },
        ]},
      ],
    },
    {
      id: 'revenue', label: 'Revenue',
      content: [
        { type: 'metric', label: 'April Revenue', value: '$1,840', sub: '+$220 vs last month · +13.6%' },
        { type: 'progress', items: [
          { label: 'Sponsorships',     pct: 65 },
          { label: 'Listener Support', pct: 21 },
          { label: 'Course Upsell',    pct: 10 },
          { label: 'Merch',            pct:  4 },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Descript Studio',  sub: '4 episodes · $28 CPM', badge: '$600' },
          { icon: 'star',   title: 'Headliner.app',    sub: '2 episodes · $22 CPM', badge: '$400' },
          { icon: 'star',   title: 'Adobe Podcast',    sub: '1 episode  · $20 CPM', badge: '$200' },
        ]},
        { type: 'text', label: 'CPM Insight', value: 'Your CPM of $26 is 2.1× the podcast industry average.' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'THE VOICE LAB', value: '4.8★', sub: '147 episodes · 12.4K listeners · $1,840 this month' },
        { type: 'metric-row', items: [
          { label: 'Episodes', value: '147' },
          { label: 'Listeners', value: '12.4K' },
          { label: 'Revenue', value: '$1,840' },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'RSS Feed',             sub: 'Active distribution', badge: '●' },
          { icon: 'share',    title: 'Distribution',         sub: '8 platforms connected', badge: '' },
          { icon: 'code',     title: 'Auto-Transcription',   sub: 'Enabled for all episodes', badge: '✓' },
          { icon: 'chart',    title: 'Analytics Plan',       sub: 'Pro tier · Full access', badge: 'PRO' },
        ]},
        { type: 'tags', label: 'Plan', items: ['HALO Pro', '$29/month', 'Unlimited episodes', 'Custom domain'] },
      ],
    },
  ],
  nav: [
    { id: 'home',     label: 'Home',     icon: 'home'     },
    { id: 'episodes', label: 'Episodes', icon: 'play'     },
    { id: 'audience', label: 'Audience', icon: 'user'     },
    { id: 'revenue',  label: 'Revenue',  icon: 'chart'    },
    { id: 'profile',  label: 'Profile',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'halo-mock', design.appName + ' — Podcast Growth Intelligence');
console.log('Mock live at:', result.url);
