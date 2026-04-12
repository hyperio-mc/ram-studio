// cast-mock.mjs — Svelte interactive mock for CAST
// CAST — AI-powered podcast analytics platform
// Theme: DARK — pure near-black + phosphor teal

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CAST',
  tagline:   'AI-powered podcast analytics for serious creators.',
  archetype: 'media-analytics',
  palette: {           // DARK theme (phosphor teal on near-black)
    bg:      '#060609',
    surface: '#0D0D12',
    text:    '#E8EBF4',
    accent:  '#00E0A0',
    accent2: '#8B5CF6',
    muted:   'rgba(232,235,244,0.38)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F5F9F7',
    surface: '#FFFFFF',
    text:    '#0A1A14',
    accent:  '#00A873',
    accent2: '#7C3AED',
    muted:   'rgba(10,26,20,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Listens', value: '1.24M', sub: '+18.4% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Subscribers', value: '28.6K' },
          { label: 'Episodes', value: '48' },
          { label: 'Avg. Rating', value: '4.8★' },
        ]},
        { type: 'progress', items: [
          { label: 'W6 Listens', pct: 67 },
          { label: 'W7 Listens', pct: 82 },
          { label: 'W8 Listens', pct: 100 },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Tue 6–8 PM releases get 23% more first-day listens. Schedule your next episode accordingly.' },
        { type: 'list', items: [
          { icon: 'play', title: '#47 — The AI Systems Podcast', sub: '84.2K listens · 38 min avg · Top episode', badge: 'TOP' },
          { icon: 'play', title: '#48 — Building AI at Scale', sub: '12.4K listens · 52 min · Published today', badge: 'NEW' },
        ]},
      ],
    },
    {
      id: 'episodes', label: 'Episodes',
      content: [
        { type: 'metric', label: 'This Month', value: '3 episodes', sub: '164.4K total listens' },
        { type: 'list', items: [
          { icon: 'play', title: '#48 — Building AI Systems at Scale', sub: '12.4K · 52 min · Apr 8', badge: 'NEW' },
          { icon: 'star', title: '#47 — The AI Systems Podcast', sub: '84.2K · 38 min · Apr 1', badge: '★' },
          { icon: 'play', title: '#46 — Open Source LLM Deep Dive', sub: '41.8K · 61 min · Mar 25', badge: null },
          { icon: 'play', title: '#45 — Prompt Engineering 2026', sub: '38.1K · 44 min · Mar 18', badge: null },
          { icon: 'play', title: '#44 — Vector DBs Explained', sub: '29.7K · 55 min · Mar 11', badge: null },
        ]},
        { type: 'tags', label: 'Categories', items: ['AI', 'Engineering', 'Research', 'Tools', 'Open Source'] },
      ],
    },
    {
      id: 'audience', label: 'Audience',
      content: [
        { type: 'metric', label: 'Avg Retention', value: '70%', sub: 'listeners complete the average episode' },
        { type: 'metric-row', items: [
          { label: 'New Subs', value: '+4.2K' },
          { label: 'Churn', value: '0.8%' },
          { label: 'Completion', value: '61%' },
        ]},
        { type: 'progress', items: [
          { label: 'Spotify', pct: 44 },
          { label: 'Apple Podcasts', pct: 30 },
          { label: 'Google Podcasts', pct: 17 },
          { label: 'Other', pct: 9 },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'New York', sub: '182K listens · Top city', badge: '#1' },
          { icon: 'map', title: 'London', sub: '134K listens', badge: '#2' },
          { icon: 'map', title: 'San Francisco', sub: '98K listens', badge: '#3' },
          { icon: 'map', title: 'Berlin', sub: '61K listens', badge: '#4' },
        ]},
      ],
    },
    {
      id: 'ai', label: 'AI',
      content: [
        { type: 'metric', label: 'Growth Score', value: '87/100', sub: 'Top 8% of podcasts in your category' },
        { type: 'list', items: [
          { icon: 'zap',     title: 'Release Timing', sub: 'Tue 7PM releases get 23% more first-day listens', badge: '→' },
          { icon: 'eye',     title: 'Title Optimizer', sub: 'Numbers in titles get 31% more day-one clicks', badge: '→' },
          { icon: 'play',    title: 'Clip Suggestion', sub: '2:14–2:48 in ep #47 has peak engagement', badge: '→' },
          { icon: 'user',    title: 'Guest Matcher', sub: 'Fans of #46 also follow Latent Space — reach out', badge: '→' },
        ]},
        { type: 'tags', label: 'Trending', items: ['#llms', '#agents', '#rag', '#fine-tuning', '#multimodal'] },
        { type: 'text', label: 'Weekly Summary', value: 'Your episode velocity and audience retention put you in strong growth territory. Consider a mid-week drop to capture Thursday commuters.' },
      ],
    },
    {
      id: 'distribution', label: 'Distribution',
      content: [
        { type: 'metric', label: 'Total Reach', value: '5 platforms', sub: '28.6K subscribers across all directories' },
        { type: 'list', items: [
          { icon: 'play',   title: 'Spotify', sub: '12.6K subscribers · +8.4% this month', badge: '+8%' },
          { icon: 'heart',  title: 'Apple Podcasts', sub: '8.6K subscribers · +3.1% this month', badge: '+3%' },
          { icon: 'search', title: 'Google Podcasts', sub: '4.9K subscribers · +6.7% this month', badge: '+7%' },
          { icon: 'star',   title: 'Overcast', sub: '1.8K subscribers · +1.2% this month', badge: '+1%' },
          { icon: 'share',  title: 'Pocket Casts', sub: '0.7K subscribers · +4.8% this month', badge: '+5%' },
        ]},
        { type: 'text', label: 'Tip', value: 'Submit to Pocket Casts Featured editorial for an estimated +40% subscriber visibility boost this quarter.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',     label: 'Home',       icon: 'home' },
    { id: 'episodes',     label: 'Episodes',   icon: 'play' },
    { id: 'audience',     label: 'Audience',   icon: 'chart' },
    { id: 'ai',           label: 'AI',         icon: 'zap' },
    { id: 'distribution', label: 'Distribute', icon: 'share' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cast-mock', `${design.appName} — Interactive Mock`);
console.log('Mock live at:', result.url);
