// shore-mock.mjs — Svelte interactive mock for SHORE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SHORE',
  tagline:   'Every meeting, turned into momentum',
  archetype: 'ai-productivity',

  palette: {           // DARK theme
    bg:      '#0D1614',
    surface: '#162420',
    text:    '#E8F0EE',
    accent:  '#2FBF8E',
    accent2: '#E8713A',
    muted:   'rgba(232,240,238,0.4)',
  },
  lightPalette: {      // LIGHT theme (primary)
    bg:      '#F5F2ED',
    surface: '#FFFFFF',
    text:    '#1A1917',
    accent:  '#1B6B5A',
    accent2: '#D4613A',
    muted:   'rgba(26,25,23,0.45)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Focus Score', value: '82', sub: '↑ +6 from last month' },
        { type: 'metric-row', items: [
          { label: 'Meetings', value: '3' },
          { label: 'Actions', value: '12' },
          { label: 'Decisions', value: '9' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Weekly Standup', sub: '9:00 AM · Done · 4 decisions', badge: '✓' },
          { icon: 'activity', title: 'Product Sync', sub: '10:30 AM · Live · 18 min in', badge: '●' },
          { icon: 'calendar', title: 'Design Review', sub: '2:00 PM · Upcoming · 6 people', badge: '→' },
        ]},
        { type: 'text', label: 'Open Actions', value: '12 open across 3 meetings today. 3 flagged as high priority.' },
      ],
    },
    {
      id: 'meeting',
      label: 'Meeting',
      content: [
        { type: 'text', label: '✦ AI Summary', value: 'Team aligned on Q2 launch (May 12). Three risks flagged: API limits, design handoff delays, and GTM approval. Marcus to lead risk mitigation by Friday.' },
        { type: 'metric-row', items: [
          { label: 'Decisions', value: '4' },
          { label: 'Actions', value: '6' },
          { label: 'Sentiment', value: '82%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Launch date: May 12', sub: 'Unanimous agreement', badge: '✓' },
          { icon: 'check', title: 'API fallback approved', sub: 'Proposed by Ali', badge: '✓' },
          { icon: 'alert', title: 'GTM copy pending', sub: 'No owner assigned · Blocker', badge: '⚠' },
        ]},
        { type: 'progress', items: [
          { label: 'Actions assigned', pct: 83 },
          { label: 'Decisions logged', pct: 100 },
          { label: 'Blockers resolved', pct: 33 },
        ]},
      ],
    },
    {
      id: 'patterns',
      label: 'Patterns',
      content: [
        { type: 'metric', label: 'Decisions This Week', value: '23', sub: '↑ 28% vs last week' },
        { type: 'tags', label: 'Rising Topics', items: ['Launch Readiness ↑3×', 'API Stability ↑new', 'Team Capacity →', 'Customer Asks ↓'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Design handoff delay', sub: '3 of 4 recent meetings · impacts launch', badge: '⚠' },
          { icon: 'alert', title: 'GTM copy unowned', sub: '6 days unresolved · no assignee', badge: '⚠' },
          { icon: 'star', title: 'API risk plan created', sub: 'Owner: Marcus · In progress', badge: '↑' },
        ]},
        { type: 'text', label: 'Signal', value: 'Launch Readiness is the dominant theme — appearing in 8 of 11 meetings this fortnight with rising urgency.' },
      ],
    },
    {
      id: 'actions',
      label: 'Actions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open', value: '12' },
          { label: 'Done', value: '31' },
          { label: 'Overdue', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Write Q2 rollout brief', sub: 'You · due Today · High', badge: '!' },
          { icon: 'zap', title: 'Competitor audit review', sub: 'Marcus · due Today · High', badge: '!' },
          { icon: 'list', title: 'Risk mitigation draft', sub: 'Marcus · due Fri · Medium', badge: '·' },
          { icon: 'list', title: 'Update launch checklist', sub: 'Ali · due Fri · Medium', badge: '·' },
          { icon: 'list', title: 'GTM copy first pass', sub: 'Unassigned · due Mon · Low', badge: '○' },
        ]},
        { type: 'text', label: 'From', value: '8 meetings this week. 3 items unassigned — tap to assign owners.' },
      ],
    },
    {
      id: 'pulse',
      label: 'Team Pulse',
      content: [
        { type: 'metric', label: 'Meeting Health', value: '82', sub: '↑ +6 from last month — Excellent' },
        { type: 'metric-row', items: [
          { label: 'Avg Duration', value: '38m' },
          { label: 'Action Rate', value: '94%' },
          { label: 'Completion', value: '71%' },
        ]},
        { type: 'progress', items: [
          { label: 'Ali K.', pct: 88 },
          { label: 'You', pct: 82 },
          { label: 'Marcus T.', pct: 74 },
          { label: 'Priya S.', pct: 62 },
          { label: 'Ben L.', pct: 48 },
        ]},
        { type: 'tags', label: 'This Month', items: ['11 meetings', '74 decisions', '127 actions', '82% captured'] },
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',    icon: 'home' },
    { id: 'meeting', label: 'Meeting',  icon: 'play' },
    { id: 'patterns',label: 'Patterns', icon: 'activity' },
    { id: 'actions', label: 'Actions',  icon: 'list' },
    { id: 'pulse',   label: 'Pulse',    icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'shore-mock', 'SHORE — Interactive Mock');
console.log('Mock live at:', result.url);
