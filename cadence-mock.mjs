import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CADENCE',
  tagline:   'Schedule with your biology.',
  archetype: 'cognitive-performance-scheduler',
  palette: {
    bg:      '#0E100F',
    surface: 'rgba(255,255,255,0.07)',
    text:    '#F0EDE8',
    accent:  '#5FB8A7',
    accent2: '#E07B50',
    muted:   'rgba(240,237,232,0.45)',
  },
  lightPalette: {
    bg:      '#F5F1EC',
    surface: 'rgba(255,255,255,0.80)',
    text:    '#1A1512',
    accent:  '#3E7B6E',
    accent2: '#C4572A',
    muted:   'rgba(26,21,18,0.44)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Readiness Score', value: '84/100', sub: 'Optimal · Peak window opens in 28 min' },
        { type: 'metric-row', items: [
          { label: 'Focus Today', value: '2h 14m' },
          { label: 'Sleep Score', value: '82' },
          { label: 'Meetings', value: '3' },
        ]},
        { type: 'text', label: 'Energy Forecast', value: 'Peak zone active 9–11:30 AM. Post-lunch dip 1–3 PM. Second wind 3:30 PM.' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'Deep Work · 10:00 – 11:30 AM', sub: 'Next optimal block · 90 min', badge: '96' },
          { icon: 'users',    title: 'Team Sync · 2:00 PM',          sub: 'Scheduled in dip zone',       badge: '—'  },
          { icon: 'activity', title: 'HRV Check-in · 9:00 AM',       sub: 'Calibration complete',        badge: '✓'  },
        ]},
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Session Elapsed', value: '34:22', sub: 'Deep Work · 38% complete · 55 min remaining' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '68 ms' },
          { label: 'Coherence', value: 'High' },
          { label: 'Distracts', value: '1' },
        ]},
        { type: 'tags', label: 'Ambient State', items: ['⚡ Flow', 'Focused', 'Low noise'] },
        { type: 'text', label: 'Session Intent', value: 'Finish product spec draft — Cadence v2.0' },
        { type: 'progress', items: [
          { label: 'Session Progress', pct: 38 },
        ]},
      ],
    },
    {
      id: 'weekly', label: 'Weekly',
      content: [
        { type: 'metric', label: 'Week of Mar 26 – Apr 1', value: '13.4h', sub: 'Total focus time · ↑ 12% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Peak Sessions', value: '11' },
          { label: 'Meeting Load', value: '34%' },
          { label: 'Best Day', value: 'Mon' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon · Focus Quality 88%', pct: 88 },
          { label: 'Tue · Focus Quality 82%', pct: 82 },
          { label: 'Wed · Focus Quality 79%', pct: 79 },
          { label: 'Thu · Focus Quality 65%', pct: 65 },
          { label: 'Fri · Focus Quality 74%', pct: 74 },
          { label: 'Sun (Today) · 84%',       pct: 84 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Weekly Pattern', value: '42 min', sub: 'You peak earlier than the average knowledge worker' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'You peak 42 min earlier than average',    sub: 'Chronotype analysis across 14 days',           badge: '✦' },
          { icon: 'moon',     title: 'Sleep consistency improving',              sub: 'Variance down 18 min · +12% coherence',        badge: '↑' },
          { icon: 'alert',    title: 'Thursday meetings cost 2.4h of peak',     sub: 'Consider blocking Thu mornings for deep work',  badge: '!' },
          { icon: 'activity', title: 'Post-lunch walk = 38% output boost',      sub: '15 min walk at 1pm raises 3pm energy to 0.72', badge: '↑' },
        ]},
        { type: 'text', label: 'Cadence Recommends', value: 'Block 9–11:30 AM Tue–Thu as protected Deep Work. You have lost 6.8h of peak time to meetings this month.' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Chronotype', value: 'Morning Lion', sub: 'Top 18% for morning peak clarity · 14-day streak' },
        { type: 'metric-row', items: [
          { label: 'Peak Window', value: '9–11:30 AM' },
          { label: 'Sleep Target', value: '10:45 PM' },
          { label: 'Streak', value: '14 days' },
        ]},
        { type: 'list', items: [
          { icon: 'clock',    title: 'Session length',      sub: '90 min',        badge: '→' },
          { icon: 'pause',    title: 'Break duration',      sub: '15 min',        badge: '→' },
          { icon: 'star',     title: 'Daily focus goal',    sub: '4 hours',       badge: '→' },
          { icon: 'calendar', title: 'Calendar sync',       sub: 'Google Cal',    badge: '✓' },
          { icon: 'bell',     title: 'Notifications',       sub: 'Gentle nudges', badge: '→' },
        ]},
        { type: 'text', label: 'Next Calibration', value: 'Recalibrate in 11 days to refine your energy model as your schedule shifts.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'focus',    label: 'Focus',    icon: 'zap'      },
    { id: 'weekly',   label: 'Weekly',   icon: 'calendar' },
    { id: 'insights', label: 'Insights', icon: 'activity' },
    { id: 'profile',  label: 'Profile',  icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cadence-mock', 'CADENCE — Interactive Mock');
console.log('Mock live at:', result.url);
