import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ORB',
  tagline:   'AI Media Intelligence',
  archetype: 'media-analytics',
  palette: {
    bg:      '#0D1117',
    surface: '#141920',
    text:    '#E8EDF5',
    accent:  '#E8B999',
    accent2: '#4BADA9',
    muted:   'rgba(232,237,245,0.45)',
  },
  lightPalette: {
    bg:      '#F5F7FA',
    surface: '#FFFFFF',
    text:    '#1A1F2E',
    accent:  '#C4824A',
    accent2: '#2B8C88',
    muted:   'rgba(26,31,46,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Reach', value: '2.4M' },
          { label: 'Engagement', value: '8.7%' },
          { label: 'Articles', value: '89' },
        ]},
        { type: 'progress', items: [
          { label: 'Newsletter', pct: 94 },
          { label: 'Blog', pct: 87 },
          { label: 'YouTube', pct: 72 },
          { label: 'Podcast', pct: 61 },
        ]},
        { type: 'text', label: '⚡ AI Signal', value: '"Remote work content is trending +240% among your 25–34 audience this week."' },
        { type: 'metric', label: 'TOP CHANNEL', value: 'Newsletter', sub: '↑ 18% vs prior period' },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'The AI Workspace Revolution', sub: 'Newsletter · 2h ago', badge: 'Trending' },
          { icon: 'chart',    title: 'Q1 Productivity Report 2026', sub: 'Blog · 1d ago',       badge: 'Growing'  },
          { icon: 'play',     title: 'Remote First in 2026 (Video)', sub: 'YouTube · 3d ago',   badge: 'Viral'    },
          { icon: 'star',     title: '5 Tools Every Remote Team Needs', sub: 'Blog · 5d ago',   badge: 'Stable'   },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg Read Time', value: '4m 12s' },
          { label: 'Share Rate',    value: '3.2%' },
        ]},
      ],
    },
    {
      id: 'audience',
      label: 'Audience',
      content: [
        { type: 'metric-row', items: [
          { label: 'Returning',  value: '68%'  },
          { label: 'Subscribed', value: '12.4K' },
          { label: 'New',        value: '6,200' },
        ]},
        { type: 'progress', items: [
          { label: '18–24 yrs', pct: 18 },
          { label: '25–34 yrs', pct: 38 },
          { label: '35–44 yrs', pct: 27 },
          { label: '45–54 yrs', pct: 12 },
          { label: '55+ yrs',   pct: 5  },
        ]},
        { type: 'tags', label: 'Reader Interests', items: ['Remote Work', 'AI Tools', 'Productivity', 'Leadership', 'Finance'] },
        { type: 'metric', label: 'PEAK READING', value: '8–10am', sub: 'Mon–Fri, consistent' },
      ],
    },
    {
      id: 'signals',
      label: 'Signals',
      content: [
        { type: 'metric', label: 'SIGNALS TODAY', value: '3', sub: 'New since yesterday' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Remote work +240%', sub: '25–34 cohort · 94% confidence', badge: 'Act' },
          { icon: 'alert',  title: 'Newsletter open rate ↓', sub: 'Monday sends · 87% confidence', badge: 'Risk' },
          { icon: 'eye',    title: 'Video > Article for finance', sub: 'Repurpose Q1 Report · 91%',  badge: 'Opp' },
          { icon: 'filter', title: 'Optimal length shifting', sub: '800–1,200 words · 78% conf.',   badge: 'FYI' },
        ]},
      ],
    },
    {
      id: 'distribute',
      label: 'Distribute',
      content: [
        { type: 'metric-row', items: [
          { label: 'Scheduled', value: '4' },
          { label: 'Drafts',    value: '2' },
          { label: 'Live',      value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'message', title: 'Morning Briefing Email',     sub: '8:00am · Newsletter', badge: '70%' },
          { icon: 'code',    title: 'AI Tools Round-up Article',  sub: '12:00pm · Blog',      badge: '🕐' },
          { icon: 'play',    title: 'Remote Podcast Ep.14',       sub: '3:00pm · Podcast',    badge: 'Draft' },
          { icon: 'share',   title: 'Q1 Recap Video (Short)',     sub: '6:00pm · YouTube',    badge: '🕐' },
        ]},
        { type: 'progress', items: [
          { label: 'Newsletter health', pct: 94 },
          { label: 'Blog health',       pct: 87 },
        ]},
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'PLAN', value: 'Pro', sub: '14 days remaining' },
        { type: 'list', items: [
          { icon: 'message', title: 'Mailchimp Newsletter', sub: 'Connected',   badge: '✓' },
          { icon: 'code',    title: 'WordPress Blog',       sub: 'Connected',   badge: '✓' },
          { icon: 'play',    title: 'YouTube Channel',      sub: 'Connected',   badge: '✓' },
          { icon: 'star',    title: 'Spotify Podcasts',     sub: 'Not connected', badge: '+' },
        ]},
        { type: 'tags', label: 'Notifications', items: ['AI Signals', 'Weekly Digest', 'Trending Alerts'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',  label: 'Home',     icon: 'home'     },
    { id: 'content',    label: 'Content',  icon: 'layers'   },
    { id: 'audience',   label: 'Audience', icon: 'user'     },
    { id: 'signals',    label: 'Signals',  icon: 'zap'      },
    { id: 'distribute', label: 'Publish',  icon: 'share'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'orb-mock', 'ORB — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/orb-mock`);
