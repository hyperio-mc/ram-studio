// PYRE — Svelte 5 Interactive Mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PYRE',
  tagline:   'Measure what moves people',
  archetype: 'brand-analytics',
  palette: {           // DARK — cinematic ember aesthetic
    bg:      '#080204',
    surface: '#130A0E',
    text:    '#F0E6D3',
    accent:  '#D4871C',
    accent2: '#7B4A2A',
    muted:   'rgba(240,230,211,0.38)',
  },
  lightPalette: {      // LIGHT — warm parchment
    bg:      '#F7F3ED',
    surface: '#FFFFFF',
    text:    '#1A1210',
    accent:  '#B8701A',
    accent2: '#7B4A2A',
    muted:   'rgba(26,18,16,0.42)',
  },
  screens: [
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric', label: 'Brand Health', value: '87', sub: '↑ 4 pts · This week' },
        { type: 'metric-row', items: [
          { label: 'Reach', value: '12.4M' },
          { label: 'Sentiment', value: '8.3' },
          { label: 'Velocity', value: '×3.1' },
        ]},
        { type: 'tags', label: 'Active Channels', items: ['Instagram','TikTok','YouTube','X','LinkedIn'] },
        { type: 'list', items: [
          { icon: 'zap',   title: 'The Origin Story — Video',  sub: 'instagram · tiktok · youtube', badge: '2.4M' },
          { icon: 'star',  title: 'Founder Q&A — Live Replay', sub: 'youtube · x.com',              badge: '847K' },
          { icon: 'share', title: 'Product Comparison',        sub: 'instagram',                    badge: '312K' },
        ]},
        { type: 'text', label: 'AI Signal', value: 'Product reveal format outperforming standard content by 3.2× this week.' },
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric', label: 'Top Asset Reach', value: '2.4M', sub: 'The Origin Story · ↑ 184%' },
        { type: 'progress', items: [
          { label: 'The Origin Story',   pct: 100 },
          { label: 'Founder Q&A Live',   pct: 72 },
          { label: 'Behind the Build',   pct: 54 },
          { label: 'Product Comparison', pct: 38 },
          { label: 'Community Spotlight',pct: 26 },
        ]},
        { type: 'text', label: 'Format Insight', value: 'Short-form video under 60s generates 4.1× the engagement of your next-best format. Completion rate 78% (2.3× platform avg).' },
      ],
    },
    {
      id: 'creative', label: 'Creative',
      content: [
        { type: 'metric-row', items: [
          { label: 'Published', value: '31' },
          { label: 'Avg CTR', value: '5.8%' },
          { label: 'Avg Saves', value: '14K' },
        ]},
        { type: 'tags', label: 'Format Types', items: ['Video','Story','Reel','Carousel','Live'] },
        { type: 'list', items: [
          { icon: 'play',    title: 'The Origin Story',     sub: 'VIDEO · Apr 1',   badge: '8.2%' },
          { icon: 'play',    title: 'Founder Q&A',          sub: 'VIDEO · Mar 29',  badge: '6.1%' },
          { icon: 'eye',     title: 'Build Process',        sub: 'REEL · Mar 27',   badge: '5.4%' },
          { icon: 'grid',    title: 'Product Comparison',   sub: 'CAROUSEL · Mar 25', badge: '3.8%' },
        ]},
        { type: 'text', label: 'Format Intelligence', value: 'Video generates 4.1× more saves than carousel. Reels outperform Stories on completion rate this quarter.' },
      ],
    },
    {
      id: 'channels', label: 'Channels',
      content: [
        { type: 'metric', label: 'Total Reach', value: '4.8M', sub: 'All platforms · ↑ 18% vs last week' },
        { type: 'progress', items: [
          { label: 'Instagram',  pct: 79 },
          { label: 'TikTok',     pct: 58 },
          { label: 'YouTube',    pct: 37 },
          { label: 'X / Twitter',pct: 23 },
          { label: 'LinkedIn',   pct: 14 },
        ]},
        { type: 'metric-row', items: [
          { label: 'IG × TT Overlap', value: '28%' },
          { label: 'TT × YT Overlap', value: '17%' },
          { label: 'Cross-Platform',  value: '9%' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'AI Observations', value: '3', sub: 'This week · High confidence' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Short-form video is your breakout format',    sub: '4.1× avg engagement · 85% confidence',  badge: '▶' },
          { icon: 'user',     title: 'New cohort: 25–34 age group surging',         sub: '+44% followers · Mar 15 inflection',     badge: '◎' },
          { icon: 'calendar', title: 'Tuesday 7–9pm is your peak window',           sub: '3.2× more reach · 91% confidence',       badge: '◷' },
        ]},
        { type: 'text', label: 'Recommended Action', value: 'Shift 3 weekly posts to Tue 7–9pm format window for projected +68% reach lift.' },
        { type: 'progress', items: [
          { label: 'Format Insight Confidence',   pct: 85 },
          { label: 'Audience Confidence',         pct: 78 },
          { label: 'Timing Confidence',           pct: 91 },
        ]},
      ],
    },
    {
      id: 'report', label: 'Report',
      content: [
        { type: 'metric', label: 'Week 13 · Apr 1–7 2026', value: '87', sub: 'Brand Score · ↑ 4 pts' },
        { type: 'metric-row', items: [
          { label: 'Total Reach',    value: '4.8M' },
          { label: 'New Follows',    value: '28.4K' },
          { label: 'Top CTR',        value: '8.2%' },
        ]},
        { type: 'text', label: 'AI Summary', value: 'Week 13 marks your strongest organic performance on record. The Origin Story video drove outsized reach — 2.4M in 5 days — aided by optimal Tuesday 7pm publish timing. New 25–34 audience cohort is accelerating. Recommend doubling down on founder-led video while this format window is open.' },
        { type: 'list', items: [
          { icon: 'play',  title: 'The Origin Story',   sub: 'VIDEO', badge: '2.4M' },
          { icon: 'play',  title: 'Founder Q&A Live',   sub: 'VIDEO', badge: '847K' },
          { icon: 'eye',   title: 'Behind the Build',   sub: 'STORY', badge: '612K' },
        ]},
        { type: 'tags', label: 'Export', items: ['Share Link','Download PDF','Email Digest'] },
      ],
    },
  ],
  nav: [
    { id: 'pulse',    label: 'Pulse',    icon: 'activity' },
    { id: 'signals',  label: 'Signals',  icon: 'zap' },
    { id: 'creative', label: 'Creative', icon: 'grid' },
    { id: 'channels', label: 'Channels', icon: 'layers' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'report',   label: 'Report',   icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'pyre-mock',
});

const result = await publishMock(html, 'pyre-mock', 'PYRE — Interactive Mock');
console.log('Mock live at:', result.url);
