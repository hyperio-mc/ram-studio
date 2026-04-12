// meridian-mock.mjs — Svelte interactive mock for MERIDIAN
// MERIDIAN — read the signal, not the noise.
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MERIDIAN',
  tagline:   'read the signal, not the noise.',
  archetype: 'analytics-saas',
  palette: {
    bg:      '#1A1814',
    surface: '#252118',
    text:    '#F8F5EF',
    accent:  '#B89BB8',
    accent2: '#9EB09A',
    muted:   'rgba(248,245,239,0.40)',
  },
  lightPalette: {
    bg:      '#F8F5EF',
    surface: '#FFFFFF',
    text:    '#272320',
    accent:  '#B89BB8',
    accent2: '#9EB09A',
    muted:   'rgba(39,35,32,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Total Signal Score', value: '94.2', sub: '↑ +3.1 from last week' },
        { type: 'metric-row', items: [{ label: 'Conversions', value: '2,841' }, { label: 'Drop-off', value: '18.4%' }, { label: 'Engagement', value: '6.2m' }] },
        { type: 'text', label: 'Active Signals', value: '' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Email re-engage spike', sub: 'Anomaly · 2h ago', badge: '9.4' },
          { icon: 'activity', title: 'Homepage CTR improving', sub: 'Trend · 4h ago', badge: '7.1' },
          { icon: 'bell', title: 'Mobile cart abandonment', sub: 'Alert · 6h ago', badge: '8.8' },
        ]},
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Anomaly', 'Trend', 'Alert'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Email re-engagement spike', sub: 'Open rates on dormant segment up 340% after campaign', badge: '9.4' },
          { icon: 'eye', title: 'Homepage scroll depth improving', sub: 'Users scrolling 40% further since last nav update', badge: '7.1' },
          { icon: 'alert', title: 'Mobile checkout drop-off', sub: 'Step 2 abandonment rose from 22% to 31% on iOS', badge: '8.8' },
        ]},
      ],
    },
    {
      id: 'channels', label: 'Channels',
      content: [
        { type: 'metric', label: 'Overall Signal Health', value: '76.2', sub: 'Across all channels' },
        { type: 'progress', items: [
          { label: 'Organic Search · 38% traffic', pct: 87 },
          { label: 'Email · 24% traffic', pct: 94 },
          { label: 'Paid Social · 18% traffic', pct: 61 },
          { label: 'Direct · 12% traffic', pct: 78 },
        ]},
        { type: 'metric-row', items: [{ label: 'Top Channel', value: 'Email' }, { label: 'Weakest', value: 'Paid' }] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Weekly Read · Email Channel', value: '41.2%', sub: 'Open rate — industry avg 22%' },
        { type: 'text', label: 'AI Synthesis', value: 'Your email channel is outperforming the market by a significant margin. Revisit send-time optimization to extend this advantage.' },
        { type: 'list', items: [
          { icon: 'share', title: 'Reduce paid social budget', sub: 'ROI below threshold 3 weeks. Reallocate 15% to email.', badge: '→' },
          { icon: 'chart', title: 'Q2 conversion rate +18%', sub: 'Based on current signal momentum and historical patterns.', badge: '↑' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Alerts', value: '3', sub: 'AI-adaptive thresholds' },
        { type: 'list', items: [
          { icon: 'check', title: 'Conversion drop  < 2.1%', sub: 'Email channel · Active', badge: 'ON' },
          { icon: 'check', title: 'Score anomaly  ± 15%', sub: 'All channels · Active', badge: 'ON' },
          { icon: 'check', title: 'Budget warning  > 90%', sub: 'Paid Social · Active', badge: 'ON' },
          { icon: 'settings', title: 'Churn signal  > 8%', sub: 'CRM · Paused', badge: 'OFF' },
        ]},
        { type: 'text', label: 'Note', value: 'Meridian AI tunes thresholds automatically based on your signal history.' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'signals',  label: 'Signals',  icon: 'zap' },
    { id: 'channels', label: 'Channels', icon: 'chart' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'meridian-mock', 'MERIDIAN — Interactive Mock');
console.log('Mock live at:', result.url);
