import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PHASE',
  tagline:   'Time as an instrument. Work in phases.',
  archetype: 'deep-work-timer-dark',

  palette: {
    bg:      '#080808',
    surface: '#111110',
    text:    '#F5F1EA',
    accent:  '#F24E1E',
    accent2: '#FFD60A',
    muted:   'rgba(245,241,234,0.40)',
  },
  lightPalette: {
    bg:      '#F7F5F0',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#D63E10',
    accent2: '#B89800',
    muted:   'rgba(26,23,20,0.40)',
  },

  nav: [
    { label: 'Now',      icon: '⏱' },
    { label: 'Today',    icon: '📅' },
    { label: 'Log',      icon: '📋' },
    { label: 'Projects', icon: '◈' },
    { label: 'Insights', icon: '◎' },
  ],

  screens: [
    {
      id: 'now',
      name: 'Now',
      description: 'Active phase session — massive timer, phase context, end action',
      components: [
        // Phase type badge
        { type: 'badge', text: 'DEEP WORK', color: 'blue', style: 'mono-caps' },
        // Phase name — headline
        { type: 'hero-text', text: 'Writing', subtext: 'Draft 02 — Brand Manifesto', size: 'xl' },
        // Giant timer
        { type: 'stat-hero', value: '01:24:47', label: 'elapsed', color: 'accent2', font: 'mono', size: 'jumbo' },
        // Progress
        { type: 'progress-bar', value: 62, label: '62% of planned 2h 15m', color: 'accent2' },
        // Project row
        { type: 'info-row', icon: '◈', text: 'Brand Studio — Meridian Co.', tag: 'Billable', tagColor: 'green' },
        // Actions
        { type: 'action-row', actions: [
          { label: '⏸  Pause', style: 'ghost' },
          { label: 'End Phase ✓', style: 'primary' },
        ]},
      ],
    },
    {
      id: 'today',
      name: 'Today',
      description: 'Timeline of today — phases as typographic rows with color-coded types',
      components: [
        { type: 'header', title: 'Today', subtitle: 'Tuesday, Mar 31', meta: '4h 39m', metaColor: 'accent2' },
        { type: 'phase-list', items: [
          { time: '07:00', label: 'Morning Ritual',  type: 'RITUAL',    color: 'purple', dur: '0:30', done: true  },
          { time: '07:32', label: 'Writing',          type: 'DEEP WORK', color: 'blue',   dur: '1:24', done: true  },
          { time: '09:15', label: 'Client Review',   type: 'REVIEW',    color: 'accent', dur: '0:45', done: true  },
          { time: '10:10', label: 'Lunch Break',     type: 'BREAK',     color: 'green',  dur: '1:00', done: true  },
          { time: '11:15', label: 'Brand Identity',  type: 'DEEP WORK', color: 'blue',   dur: '—',    active: true},
          { time: '13:30', label: 'Admin / Email',   type: 'ADMIN',     color: 'muted',  dur: '—',    done: false },
          { time: '15:00', label: 'Design Review',   type: 'REVIEW',    color: 'accent', dur: '—',    done: false },
        ]},
      ],
    },
    {
      id: 'log',
      name: 'Log',
      description: 'Chronological phase history — color-coded cards with mono duration',
      components: [
        { type: 'header', title: 'Phase Log', subtitle: 'Recent activity' },
        { type: 'search-bar', placeholder: 'Search phases...' },
        { type: 'log-list', items: [
          { date: 'Today',     label: 'Writing',           type: 'DEEP WORK', color: 'blue',   dur: '1h 24m', proj: 'Meridian Co.' },
          { date: 'Today',     label: 'Client Review',    type: 'REVIEW',    color: 'accent', dur: '0h 45m', proj: 'Meridian Co.' },
          { date: 'Today',     label: 'Morning Ritual',   type: 'RITUAL',    color: 'purple', dur: '0h 30m', proj: '—' },
          { date: 'Yesterday', label: 'Visual Identity',  type: 'DEEP WORK', color: 'blue',   dur: '3h 10m', proj: 'Bloom Studio' },
          { date: 'Yesterday', label: 'Brand Strategy',   type: 'DEEP WORK', color: 'blue',   dur: '2h 05m', proj: 'Bloom Studio' },
        ]},
      ],
    },
    {
      id: 'projects',
      name: 'Projects',
      description: 'Project list — hours in giant 44px condensed mono, budget progress',
      components: [
        { type: 'header', title: 'Projects', subtitle: 'Active work' },
        { type: 'project-cards', items: [
          { name: 'Meridian Co.',   sub: 'Brand Identity & Strategy',    hours: '24.5', color: 'accent',  pct: 61,  budget: '40h'  },
          { name: 'Bloom Studio',   sub: 'Visual Identity System',        hours: '18.2', color: 'blue',    pct: 73,  budget: '25h'  },
          { name: 'PARA Lab',       sub: 'Product Design Consultation',   hours: '11.0', color: 'purple',  pct: 55,  budget: '20h'  },
          { name: 'Personal',       sub: 'Learning & Side Projects',      hours: '8.3',  color: 'green',   pct: null               },
        ]},
      ],
    },
    {
      id: 'insights',
      name: 'Insights',
      description: 'Weekly view — 38.2h in editorial 72px display, day bars, type breakdown',
      components: [
        { type: 'header', title: 'This Week', subtitle: '' },
        { type: 'stat-hero', value: '38.2', label: 'hours this week', color: 'fg', font: 'mono', size: 'jumbo' },
        { type: 'streak', value: '🔥 8 days', color: 'accent2' },
        { type: 'bar-chart', days: [
          { label: 'M', value: 6.2 },
          { label: 'T', value: 7.8, active: true },
          { label: 'W', value: 5.5 },
          { label: 'T', value: 8.1 },
          { label: 'F', value: 6.9 },
          { label: 'S', value: 3.2 },
          { label: 'S', value: 0   },
        ]},
        { type: 'breakdown-list', items: [
          { label: 'Deep Work', color: 'blue',   pct: 64, hours: '24.4h' },
          { label: 'Review',    color: 'accent', pct: 18, hours: '6.8h'  },
          { label: 'Admin',     color: 'muted',  pct: 10, hours: '3.9h'  },
          { label: 'Rituals',   color: 'purple', pct: 8,  hours: '3.0h'  },
        ]},
        { type: 'compare-banner', text: 'vs. last week', value: '+4.1h  ↑ 12%', color: 'green' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'phase-mock', 'PHASE — Interactive Mock');
console.log('Mock live at:', result.url);
