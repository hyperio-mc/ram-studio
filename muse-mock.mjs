import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MUSE',
  tagline:   'Brief to beautiful.',
  archetype: 'creative-ai',
  palette: {
    bg:      '#1A1714',
    surface: '#242018',
    text:    '#F6F3EE',
    accent:  '#D4410C',
    accent2: '#5B4FE8',
    muted:   'rgba(246,243,238,0.45)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#141210',
    accent:  '#D4410C',
    accent2: '#5B4FE8',
    muted:   'rgba(20,18,16,0.4)',
  },
  screens: [
    {
      id: 'studio', label: 'Studio',
      content: [
        { type: 'metric', label: 'Nike AW26 Campaign', value: '62%', sub: 'On track · 2 days until deadline' },
        { type: 'metric-row', items: [
          { label: 'Active Briefs', value: '4' },
          { label: 'AI Assets', value: '47' },
          { label: 'Revisions', value: '12' },
        ]},
        { type: 'text', label: 'MUSE AI · Insight', value: '3 creative directions ready for Nike AW26. Lead concept "Motion as Emotion" scored 94/100 against brand criteria.' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Nike AW26', sub: 'Motion campaign · 62%', badge: 'DUE 2d' },
          { icon: 'layers',   title: 'Spotify Wrapped', sub: 'Brand identity · 38%', badge: 'BEHIND' },
          { icon: 'check',    title: 'Figma Conference', sub: 'Keynote visuals · 92%', badge: 'AHEAD' },
          { icon: 'calendar', title: "Levi's Summer", sub: 'Scoping phase · 15%', badge: 'NEW' },
        ]},
        { type: 'tags', label: 'Active Skills', items: ['Concepting', 'Motion', 'Typography', 'Brand ID', 'Social'] },
      ],
    },
    {
      id: 'brief', label: 'Brief',
      content: [
        { type: 'metric', label: 'AI Brief Score', value: '94 / 100', sub: 'Strong creative clarity · 3 directions generated' },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Motion as Emotion',   sub: 'Visceral slow-motion · raw, human', badge: '94 ✓' },
          { icon: 'activity', title: 'Urban Kinetics',    sub: 'City texture + athlete blur', badge: '87' },
          { icon: 'eye',    title: 'Silence Before Speed', sub: 'Stillness → explosion contrast', badge: '81' },
        ]},
        { type: 'text', label: 'Original Brief', value: '"Capture the feeling of unstoppable forward motion across 5 continents, 5 stories, one truth." — Nike Brand Strategy AW26' },
        { type: 'tags', label: 'Mood Palette', items: ['Burnt Sienna', 'Near Black', 'Warm Ivory', 'Electric Indigo', 'Off White'] },
        { type: 'progress', items: [
          { label: 'Brand alignment', pct: 94 },
          { label: 'Audience fit', pct: 88 },
          { label: 'Creative risk', pct: 72 },
        ]},
      ],
    },
    {
      id: 'assets', label: 'Assets',
      content: [
        { type: 'metric-row', items: [
          { label: 'Approved', value: '28' },
          { label: 'In Review', value: '11' },
          { label: 'Draft', value: '8' },
        ]},
        { type: 'text', label: 'MUSE AI', value: 'Generate new Nike AW26 assets: describe your concept and MUSE will produce hero visuals, social crops and motion guides in ~40 seconds.' },
        { type: 'list', items: [
          { icon: 'eye',    title: 'Hero_v1.jpg',       sub: '4096×2732 · APPROVED', badge: '✓ OK' },
          { icon: 'play',   title: 'Motion_reel.mp4',   sub: '4K · 0:24 · REVIEW',  badge: '⟳ REV' },
          { icon: 'grid',   title: 'Social_16x9.png',   sub: '1920×1080 · APPROVED', badge: '✓ OK' },
          { icon: 'layers', title: 'Type_display.ai',   sub: 'Illustrator · DRAFT',  badge: '✎ DFT' },
        ]},
        { type: 'tags', label: 'Asset Types', items: ['Visual', 'Video', 'Social', 'Typography', 'Motion'] },
      ],
    },
    {
      id: 'feedback', label: 'Feedback',
      content: [
        { type: 'metric', label: 'Client NPS Score', value: '94', sub: '3 annotation notes · 1 revision round remaining' },
        { type: 'text', label: 'MUSE AI · Summary', value: '"Client is strong on composition. 2 notes on color saturation, 1 on cropping for Instagram format. Suggest revision brief: saturation -15%, 2 crop variants."' },
        { type: 'list', items: [
          { icon: 'message', title: 'Sarah K. · Nike Brand Lead', sub: 'Orange a bit hot — pull back 15%', badge: '1h' },
          { icon: 'message', title: 'Tom B. · Creative Director', sub: 'Crop tight for square format', badge: '2h' },
          { icon: 'star',    title: 'MUSE AI · Auto-summary', sub: 'Revision est: 20 min · 2 changes', badge: 'AI' },
        ]},
        { type: 'tags', label: 'Review Status', items: ['Awaiting revision', 'Round 2', 'Client: Nike'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Client NPS', value: '94' },
          { label: 'Avg Delivery', value: '3.2d' },
          { label: 'AI Assets', value: '47' },
        ]},
        { type: 'progress', items: [
          { label: 'Nike AW26', pct: 62 },
          { label: 'Spotify Wrapped', pct: 38 },
          { label: 'Figma Conference', pct: 92 },
          { label: "Levi's Summer", pct: 15 },
        ]},
        { type: 'text', label: 'AI Recommendation', value: 'Spotify Wrapped is at risk. Recommend reallocating 1 senior designer from Figma (ahead of schedule) to recover the timeline.' },
        { type: 'list', items: [
          { icon: 'chart',    title: 'Nike AW26',        sub: 'On track · deadline in 2d', badge: 'OK' },
          { icon: 'alert',    title: 'Spotify Wrapped',  sub: 'Behind schedule · risk flag', badge: 'RISK' },
          { icon: 'check',    title: 'Figma Conf',       sub: '92% · ahead of schedule', badge: 'GREAT' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'studio',   label: 'Studio',   icon: 'grid' },
    { id: 'brief',    label: 'Brief',    icon: 'layers' },
    { id: 'assets',   label: 'Assets',   icon: 'star' },
    { id: 'feedback', label: 'Feedback', icon: 'message' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'muse-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
