import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MURMUR',
  tagline:   'Your product intelligence, spoken weekly.',
  archetype: 'audio-intelligence',
  palette: {           // DARK theme
    bg:      '#0E0A08',
    surface: '#1A1410',
    text:    '#EFE8DC',
    accent:  '#D4522A',
    accent2: '#8B6F47',
    muted:   'rgba(239,232,220,0.28)',
  },
  lightPalette: {      // LIGHT theme (warm parchment)
    bg:      '#F7F4EE',
    surface: '#FFFFFF',
    text:    '#1C1A18',
    accent:  '#D4522A',
    accent2: '#8B6F47',
    muted:   'rgba(28,26,24,0.12)',
  },
  screens: [
    {
      id: 'briefing', label: "Today's Briefing",
      content: [
        { type: 'metric', label: 'Episode 147', value: '12:34', sub: 'Today\'s briefing · 38% played' },
        { type: 'metric-row', items: [
          { label: 'Signals', value: '2.4k' },
          { label: 'Critical', value: '38' },
          { label: 'This week', value: '+127' },
        ]},
        { type: 'text', label: 'Now playing', value: 'This week in product — 3 critical signals from support + NPS dip analysis.' },
        { type: 'list', items: [
          { icon: 'activity', title: '0:00 — Intro & weekly summary', sub: 'Signal overview' },
          { icon: 'alert', title: '2:14 — Support ticket surge', sub: 'Checkout friction · 34 mentions', badge: '🔴' },
          { icon: 'chart', title: '5:48 — NPS trend analysis', sub: 'Down 4 pts vs last month', badge: '🟡' },
          { icon: 'star', title: '9:22 — Feature request clusters', sub: 'Bulk export · 61 votes', badge: '🔵' },
        ]},
        { type: 'tags', label: 'Topics', items: ['Checkout', 'NPS', 'Feature Req', 'Retention'] },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Episode archive', value: '147', sub: 'Episodes published since launch' },
        { type: 'list', items: [
          { icon: 'play', title: 'EP.147 — This week in product', sub: 'Today · 12:34', badge: 'New' },
          { icon: 'play', title: 'EP.146 — Onboarding drop-off', sub: 'Last Thursday · 9:12', badge: '38%' },
          { icon: 'check', title: 'EP.145 — Feature velocity & churn', sub: '2 weeks ago · 14:05', badge: '✓' },
          { icon: 'check', title: 'EP.144 — Q1 retro: wins & misses', sub: '3 weeks ago · 18:22', badge: '✓' },
          { icon: 'star', title: 'EP.143 — Support storm learnings', sub: 'Mar 13 · 11:48', badge: '★' },
        ]},
        { type: 'progress', items: [
          { label: 'This week listening', pct: 38 },
          { label: 'Monthly completion', pct: 87 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total signals', value: '2,401' },
          { label: 'Critical', value: '38' },
          { label: 'New this week', value: '+127' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Checkout flow causes drop-off at step 3', sub: 'FRICTION · EP.147 · 34 mentions', badge: '🔴' },
          { icon: 'chart', title: 'NPS trending down — pricing sensitivity', sub: 'SENTIMENT · EP.147 · 18 mentions', badge: '🟡' },
          { icon: 'star', title: 'Bulk export requested by 23% of power users', sub: 'FEATURE REQ · EP.147 · 61 votes', badge: '🔵' },
          { icon: 'heart', title: 'New search feature getting strong positive signal', sub: 'WIN · EP.146 · 12 mentions', badge: '🟢' },
          { icon: 'alert', title: 'Mobile app crash on iOS 17.4', sub: 'BUG · EP.147 · 8 reports', badge: '🔴' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Friction', 'Sentiment', 'Feature', 'Win', 'Bug'] },
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric-row', items: [
          { label: 'Connected', value: '6' },
          { label: 'Records', value: '2.8k' },
          { label: 'Last sync', value: '2h ago' },
        ]},
        { type: 'list', items: [
          { icon: 'message', title: 'Intercom', sub: 'Support tickets · 1,204 records', badge: '✓' },
          { icon: 'star', title: 'Delighted', sub: 'NPS surveys · 380 records', badge: '✓' },
          { icon: 'list', title: 'Notion', sub: 'Meeting notes · 94 records', badge: '✓' },
          { icon: 'filter', title: 'Typeform', sub: 'User research · 211 records', badge: '⚠' },
          { icon: 'zap', title: 'Slack #feedback', sub: 'Team signals · 876 records', badge: '✓' },
          { icon: 'alert', title: 'G2 Reviews', sub: 'Public reviews · Error', badge: '✗' },
        ]},
      ],
    },
    {
      id: 'voice', label: 'Voice',
      content: [
        { type: 'text', label: 'Narrator', value: 'Sage — Calm, authoritative. Your weekly product briefing delivered with clarity.' },
        { type: 'list', items: [
          { icon: 'play', title: 'Sage', sub: 'Calm, authoritative · Currently selected', badge: '✓' },
          { icon: 'play', title: 'Harper', sub: 'Warm, conversational', badge: '' },
          { icon: 'play', title: 'Atlas', sub: 'Crisp, professional', badge: '' },
        ]},
        { type: 'progress', items: [
          { label: 'Speed: 1.25×', pct: 62 },
          { label: 'Episode length target', pct: 75 },
        ]},
        { type: 'tags', label: 'AI Focus Areas', items: ['Churn risk', 'Feature gaps', 'Friction', 'Wins'] },
        { type: 'metric', label: 'Next episode', value: 'Thursday 8:30 AM', sub: 'Sage · 12–15 min · Auto-generated' },
      ],
    },
  ],
  nav: [
    { id: 'briefing', label: 'Briefing', icon: 'play' },
    { id: 'library', label: 'Library', icon: 'list' },
    { id: 'insights', label: 'Insights', icon: 'eye' },
    { id: 'sources', label: 'Sources', icon: 'layers' },
    { id: 'voice', label: 'Voice', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'murmur-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
