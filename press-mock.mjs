// press-mock.mjs — Svelte interactive mock for PRESS
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG = 'press';

const design = {
  appName:   'PRESS',
  tagline:   'Your Editorial Morning Brief',
  archetype: 'editorial-briefing',
  palette: {           // dark theme (inverted editorial — dark ink)
    bg:      '#1A1510',
    surface: '#252018',
    text:    '#F5F0E6',
    accent:  '#E8600F',
    accent2: '#6B9AC4',
    muted:   'rgba(245,240,230,0.4)',
  },
  lightPalette: {      // light theme (primary — warm newsprint)
    bg:      '#F5F0E6',
    surface: '#FDFAF3',
    text:    '#1A1510',
    accent:  '#C8440C',
    accent2: '#2A4A6B',
    muted:   'rgba(26,21,16,0.45)',
  },
  screens: [
    {
      id: 'front-page',
      label: 'Front Page',
      content: [
        { type: 'metric', label: 'MORNING EDITION', value: 'APR 7', sub: 'Tuesday · Vol. MCMXXVI · No. 97' },
        { type: 'metric-row', items: [
          { label: 'NEW STORIES', value: '94' },
          { label: 'UNREAD', value: '47' },
          { label: 'BEATS', value: '5' },
        ]},
        { type: 'tags', label: 'TOP BEAT', items: ['AI & TECH', 'CLIMATE', 'MARKETS', 'SCIENCE'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'The Mirror Problem', sub: 'AI Models Begin Writing Their Own Training Data', badge: '12 min' },
          { icon: 'chart', title: 'Europe Hits 30°C in March', sub: 'Third year of record temperatures', badge: '5 min' },
          { icon: 'activity', title: 'Fed Holds Rates Steady', sub: 'Markets rally on committee signals', badge: '6 min' },
        ]},
        { type: 'text', label: 'LEAD STORY EXCERPT', value: 'Stanford researchers document a compounding feedback loop in large language model training — what they call the "Mirror Problem." New findings show 23% factual drift after just two recursive cycles.' },
      ],
    },
    {
      id: 'read',
      label: 'Read',
      content: [
        { type: 'metric', label: 'AI & TECH  ·  STANFORD BEAT', value: '"The Mirror Problem"', sub: 'Sarah Chen · 12 min read · 3 hours ago' },
        { type: 'text', label: 'LEAD', value: 'When a language model trains on its own outputs, something subtle begins to shift. Stanford\'s Human-Centered AI Institute calls this the Mirror Problem — a recursive feedback loop where errors compound across cycles.' },
        { type: 'metric-row', items: [
          { label: 'READ TIME', value: '12 min' },
          { label: 'SOURCES', value: '8' },
          { label: 'SHARES', value: '2.8K' },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Audio Briefing', sub: '4 min · AI-narrated summary available', badge: '▶' },
          { icon: 'star', title: 'Save to Beats', sub: 'Add to your AI & Tech reading list', badge: '⊟' },
          { icon: 'share', title: 'Share Story', sub: 'Send to 3 colleagues', badge: '⊕' },
        ]},
        { type: 'text', label: 'PULL QUOTE', value: '"The model begins to believe its own mistakes — we found a 23% drift in factual accuracy after two training cycles." — Dr. Marcus Webb, Stanford HAI' },
      ],
    },
    {
      id: 'beats',
      label: 'Beats',
      content: [
        { type: 'metric', label: 'YOUR EDITORIAL BOARD', value: '5 Beats', sub: '94 sources · 47 unread stories today' },
        { type: 'progress', items: [
          { label: 'Artificial Intelligence', pct: 78 },
          { label: 'Global Markets', pct: 62 },
          { label: 'Climate & Environment', pct: 45 },
          { label: 'Science & Discovery', pct: 33 },
          { label: 'Politics & Policy', pct: 24 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Artificial Intelligence', sub: '27 new today · 14 sources', badge: '27' },
          { icon: 'chart',    title: 'Global Markets',          sub: '31 new today · 18 sources', badge: '31' },
          { icon: 'activity', title: 'Climate & Environment',   sub: '8 new today · 9 sources',  badge: '8'  },
          { icon: 'star',     title: 'Science & Discovery',     sub: '5 new today · 7 sources',  badge: '5'  },
        ]},
      ],
    },
    {
      id: 'digest',
      label: 'Digest',
      content: [
        { type: 'metric', label: 'WEEKLY EDITION', value: 'Mar 31 — Apr 7', sub: 'Your curated Sunday digest' },
        { type: 'metric-row', items: [
          { label: 'ARTICLES', value: '94' },
          { label: 'HRS READ', value: '12' },
          { label: 'SAVED',    value: '34' },
        ]},
        { type: 'progress', items: [
          { label: 'AI & Tech', pct: 78 },
          { label: 'Markets', pct: 62 },
          { label: 'Climate', pct: 45 },
          { label: 'Science', pct: 33 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: "Editor's Pick", sub: '"The Mirror Problem" — read 2,847 times', badge: '✦' },
          { icon: 'eye',  title: 'Most Shared',   sub: 'Europe Hits 30°C in March — 4.1K shares', badge: '↑' },
          { icon: 'heart', title: 'Most Saved',   sub: 'Webb Telescope Water Vapor Finding', badge: '⊟' },
        ]},
        { type: 'text', label: 'READING STREAK', value: '14 consecutive days of morning reading. You\'re in the top 8% of PRESS readers by consistency.' },
      ],
    },
    {
      id: 'sources',
      label: 'Sources',
      content: [
        { type: 'metric', label: 'YOUR EDITORIAL SOURCES', value: '94 Sources', sub: '5 beats · last updated today' },
        { type: 'list', items: [
          { icon: 'check', title: 'The Financial Times',    sub: 'Markets, Policy · 28 articles this week', badge: '#1' },
          { icon: 'check', title: 'MIT Technology Review', sub: 'AI & Tech · 24 articles this week',       badge: '#2' },
          { icon: 'check', title: 'Nature',                sub: 'Science, Research · 18 articles',         badge: '#3' },
          { icon: 'check', title: 'Carbon Brief',          sub: 'Climate · 12 articles this week',         badge: '#4' },
        ]},
        { type: 'tags', label: 'DELIVERY PREFERENCES', items: ['7:00 AM Daily', 'Audio On', 'English (UK)', 'Detailed'] },
        { type: 'metric-row', items: [
          { label: 'DELIVERY', value: '7AM' },
          { label: 'STREAK',   value: '14d' },
          { label: 'SAVED',    value: '34' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'front-page', label: 'Front Page', icon: 'layers' },
    { id: 'read',       label: 'Read',       icon: 'eye' },
    { id: 'beats',      label: 'Beats',      icon: 'grid' },
    { id: 'digest',     label: 'Digest',     icon: 'calendar' },
    { id: 'sources',    label: 'Sources',    icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, `${SLUG}-mock`, `${design.appName} — Interactive Mock`);
console.log('Mock live at:', result.url);
