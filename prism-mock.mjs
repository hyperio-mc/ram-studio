/**
 * PRISM — Interactive Svelte Mock
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PRISM',
  tagline:   'Clarity in every signal',
  archetype: 'content-intelligence',
  palette: {
    bg:      '#080A12',
    surface: '#1A1E2E',
    text:    '#E8E4F4',
    accent:  '#7B50FF',
    accent2: '#FF4D7E',
    muted:   'rgba(232,228,244,0.4)',
  },
  lightPalette: {
    bg:      '#F4F2FF',
    surface: '#FFFFFF',
    text:    '#160E30',
    accent:  '#6B3FEF',
    accent2: '#E83D6B',
    muted:   'rgba(22,14,48,0.45)',
  },
  screens: [
    {
      id: 'signal', label: 'Signal',
      content: [
        { type: 'metric', label: 'Total Reach', value: '2.4M', sub: '+18.3% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Views',   value: '847K' },
          { label: 'Listens', value: '312K' },
          { label: 'CVR',     value: '8.2%'  },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'The 5AM Ritual Rethink', sub: 'Podcast · 842K reach', badge: '+24%' },
          { icon: 'star',     title: 'Why Slow Content Wins',  sub: 'Article · 391K reach',  badge: '+11%' },
          { icon: 'share',    title: 'Thread: AI in creative flow', sub: 'Social · 287K reach', badge: '+8%' },
        ]},
      ],
    },
    {
      id: 'content', label: 'Content',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Podcast', 'Article', 'Social'] },
        { type: 'list', items: [
          { icon: 'play',   title: 'The 5AM Ritual Rethink',     sub: 'Ep 47 · 842K reach', badge: '95' },
          { icon: 'eye',    title: 'Why Slow Content Wins',       sub: 'Article · 391K reach', badge: '88' },
          { icon: 'share',  title: 'Thread: AI creative flow',    sub: 'Social · 287K reach', badge: '83' },
          { icon: 'play',   title: 'Deep Work Is Dead',           sub: 'Ep 46 · 204K reach', badge: '79' },
          { icon: 'eye',    title: 'Attention Economy Map',       sub: 'Article · 178K reach', badge: '74' },
        ]},
      ],
    },
    {
      id: 'audience', label: 'Audience',
      content: [
        { type: 'metric', label: 'Audience Overlap', value: '74%', sub: '3 active segments' },
        { type: 'progress', items: [
          { label: 'Creators — 12.4K', pct: 38 },
          { label: 'Builders — 10.1K', pct: 31 },
          { label: 'Learners — 10.1K', pct: 31 },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Creators', sub: 'Podcast-first, high engagement', badge: '38%' },
          { icon: 'code',   title: 'Builders', sub: 'Articles, conversion-ready',     badge: '31%' },
          { icon: 'layers', title: 'Learners', sub: 'Social, share amplifiers',        badge: '31%' },
        ]},
      ],
    },
    {
      id: 'peaks', label: 'Peaks',
      content: [
        { type: 'metric', label: 'Peak Window', value: 'Thu 7PM', sub: '3.2× avg engagement' },
        { type: 'progress', items: [
          { label: '6am–10am', pct: 28 },
          { label: '10am–2pm', pct: 62 },
          { label: '2pm–6pm',  pct: 80 },
          { label: '6pm–10pm', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Mon 10:00 AM', sub: 'Attention Economy Map',        badge: '→' },
          { icon: 'calendar', title: 'Wed 2:00 PM',  sub: 'Deep Work Is Dead',             badge: '→' },
          { icon: 'zap',      title: 'Thu 7:00 PM',  sub: 'New Episode — power window',   badge: '↗' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'AI Signals', value: '4', sub: 'Surfaced from 847K data points' },
        { type: 'text', label: 'Key Signal', value: 'Thu 7PM publishes generate 3.8× more subscriptions than Mon morning drops.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Hooks work harder',  sub: 'Questions retain 34% longer',         badge: '↑' },
          { icon: 'alert',    title: 'Format mismatch',    sub: 'Articles beat threads in conversion',  badge: '⚡' },
          { icon: 'chart',    title: 'Cross-post gap',     sub: 'LinkedIn 2× X click-through',          badge: '⊞' },
          { icon: 'zap',      title: 'Cadence effect',     sub: '3+ pieces/week compounds growth',      badge: '✦' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'signal',   label: 'Signal',   icon: 'activity' },
    { id: 'content',  label: 'Content',  icon: 'grid'     },
    { id: 'audience', label: 'Audience', icon: 'eye'      },
    { id: 'peaks',    label: 'Peaks',    icon: 'zap'      },
    { id: 'insights', label: 'Insights', icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline:  design.tagline,
});
const result = await publishMock(html, 'prism-mock', 'PRISM — Interactive Mock');
console.log('Mock live at:', result.url);
