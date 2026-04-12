import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TEMPO',
  tagline:   'AI Business Intelligence Radio',
  archetype: 'intelligence-briefing',

  palette: {
    bg:      '#090A10',
    surface: '#111520',
    text:    '#EDE9FF',
    accent:  '#8660FF',
    accent2: '#FF6B6B',
    muted:   'rgba(237,233,255,0.22)',
  },
  lightPalette: {
    bg:      '#F4F2FF',
    surface: '#FFFFFF',
    text:    '#0D0A1A',
    accent:  '#6B44F0',
    accent2: '#FF4D4D',
    muted:   'rgba(13,10,26,0.4)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',   label: 'NOW PLAYING',  value: 'Product Weekly #47 — AI-generated from 284 signals' },
        { type: 'metric', label: 'NPS Score',     value: '72',   sub: '↑ +4 vs last week' },
        { type: 'metric-row', items: [
          { label: 'Churn Risk', value: '3.2%' },
          { label: 'Activation', value: '68%' },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Feature Adoption Deep Dive',   sub: '4:12 · Product',   badge: 'NEW' },
          { icon: 'play', title: 'Q1 Churn Analysis',            sub: '6:30 · Growth',    badge: '' },
          { icon: 'play', title: 'Leadership Alignment Brief',   sub: '3:50 · Leaders',   badge: '' },
        ]},
      ],
    },
    {
      id: 'player', label: 'Playing',
      content: [
        { type: 'metric', label: 'Brief Duration', value: '16:00', sub: 'Product Weekly #47' },
        { type: 'tags',   label: 'Signal Sources', items: ['Mixpanel', 'Zendesk', 'Slack'] },
        { type: 'progress', items: [
          { label: 'Listened',  pct: 36 },
          { label: 'AI Quality', pct: 92 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Feature adoption by cohort', sub: 'Chapter 1 · 0:00' },
          { icon: 'check', title: 'Support ticket spike analysis', sub: 'Chapter 2 · 5:20' },
          { icon: 'star',  title: 'Competitor movement signals',  sub: 'Chapter 3 · 10:44' },
        ]},
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today',   value: '12' },
          { label: 'Week',    value: '284' },
          { label: 'Quality', value: '4.8★' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'NPS spike: Enterprise segment', sub: '+11 pts after Tuesday release', badge: '+' },
          { icon: 'alert', title: 'Churn risk: 4 accounts flagged',  sub: 'Usage down >40% in 7 days',    badge: '!' },
          { icon: 'chart', title: 'Feature adoption inflection',    sub: 'Bulk export hit 12% DAU',        badge: '↑' },
          { icon: 'check', title: 'Activation rate: new high',      sub: 'Week 3 at 68% — 6-month best',  badge: '↑' },
          { icon: 'star',  title: 'Support volume: −22% WoW',       sub: 'Docs revamp working',            badge: '↓' },
        ]},
      ],
    },
    {
      id: 'weekly', label: 'Weekly',
      content: [
        { type: 'text', label: 'Week of', value: 'Apr 7 — Apr 13, 2025' },
        { type: 'metric-row', items: [
          { label: 'Signals', value: '284' },
          { label: 'Briefs',  value: '12' },
          { label: 'Quality', value: '4.8★' },
        ]},
        { type: 'progress', items: [
          { label: 'Product',    pct: 80 },
          { label: 'Growth',     pct: 95 },
          { label: 'Leadership', pct: 60 },
          { label: 'CX',        pct: 75 },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Product Weekly',    sub: '4 briefs · 16 min avg', badge: '◈' },
          { icon: 'play', title: 'Growth Weekly',     sub: '6 briefs · 22 min avg', badge: '◈' },
          { icon: 'play', title: 'Leadership Digest', sub: '3 briefs · 10 min avg', badge: '◈' },
          { icon: 'play', title: 'CX Report',         sub: '5 briefs · 18 min avg', badge: '◈' },
        ]},
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Briefs', value: '47' },
          { label: 'Hours',        value: '13h' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Product Weekly #47',     sub: 'Apr 7 · 16:00 · 284 signals', badge: '✓' },
          { icon: 'check', title: 'Growth Deep Dive',       sub: 'Apr 5 · 22:14 · 198 signals', badge: '✓' },
          { icon: 'play',  title: 'Exec Brief — Q1 Close',  sub: 'Apr 3 · 11:30 · 156 signals', badge: '' },
          { icon: 'play',  title: 'CX Trend Report',        sub: 'Apr 1 · 18:42 · 210 signals', badge: '' },
          { icon: 'play',  title: 'Product Weekly #46',     sub: 'Mar 31 · 14:20 · 267 signals', badge: '' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'player',  label: 'Playing', icon: 'play' },
    { id: 'signals', label: 'Signals', icon: 'activity' },
    { id: 'weekly',  label: 'Weekly',  icon: 'calendar' },
    { id: 'library', label: 'Library', icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'tempo-mock', 'TEMPO — Interactive Mock');
console.log('Mock live at:', result.url);
