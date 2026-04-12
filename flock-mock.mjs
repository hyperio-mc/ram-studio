// flock-mock.mjs — Svelte interactive mock for FLOCK
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FLOCK',
  tagline:   'Your team + agents, one view',
  archetype: 'founder-os-ai-native-teams',

  palette: {  // DARK theme
    bg:      '#1A1A2E',
    surface: '#16213E',
    text:    '#E8EAF0',
    accent:  '#5B5EF0',
    accent2: '#F97316',
    muted:   'rgba(232,234,240,0.4)',
  },

  lightPalette: {  // LIGHT theme (primary)
    bg:      '#F7F5F1',
    surface: '#FFFFFF',
    text:    '#18181B',
    accent:  '#5B5EF0',
    accent2: '#F97316',
    muted:   'rgba(24,24,27,0.42)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'DAY COMPLETION', value: '54%', sub: '13 / 24 tasks · 4h 20m remaining' },
        { type: 'metric-row', items: [
          { label: 'HUMANS', value: '3' },
          { label: 'AGENTS', value: '4' },
          { label: 'DONE', value: '13' },
        ]},
        { type: 'text', label: 'TEAM STATUS', value: '4 agents + 3 humans have 24 tasks today. Day is running on pace.' },
        { type: 'list', items: [
          { icon: 'zap',   title: 'Analyst Agent',  sub: 'Q1 revenue analysis complete · 2m ago',     badge: 'Done' },
          { icon: 'user',  title: 'Sarah K.',        sub: 'Reviewing investor deck · In progress',     badge: 'Active' },
          { icon: 'alert', title: 'Pricing Agent',   sub: 'Needs decision: new tier at $299?',         badge: 'Review' },
        ]},
        { type: 'tags', label: 'QUICK ACTIONS', items: ['+ New Task', '▷ Run Agent', 'View Sprint'] },
      ],
    },
    {
      id: 'agents', label: 'Agents',
      content: [
        { type: 'metric-row', items: [
          { label: 'TASKS TODAY', value: '22' },
          { label: 'SAVED HOURS', value: '14.2h' },
          { label: 'RUNNING', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Analyst Agent',   sub: 'Q1 revenue deep-dive · done',           badge: '✓' },
          { icon: 'alert', title: 'Pricing Agent',   sub: 'Awaiting your decision · blocked',       badge: '⚠' },
          { icon: 'share', title: 'Outreach Agent',  sub: 'Sending 40 follow-ups · 28 sent',        badge: '70%' },
          { icon: 'code',  title: 'Docs Agent',      sub: 'API changelog draft · queued 15:00',     badge: '▷' },
        ]},
        { type: 'progress', items: [
          { label: 'Outreach', pct: 70 },
          { label: 'Overall',  pct: 59 },
        ]},
        { type: 'text', label: 'IDLE AGENTS', value: 'SEO Agent · Support Agent — ready to wake.' },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Q1 HEALTH SCORE', value: '72', sub: '2 of 4 objectives on track · AI forecast 68 EOQ' },
        { type: 'list', items: [
          { icon: 'check', title: 'Reach $500K ARR',   sub: '$424K · 84.8% · 3 KRs',      badge: '85%' },
          { icon: 'alert', title: 'Launch EU market',  sub: 'Legal 80% · Partnership 30%', badge: '55%' },
          { icon: 'check', title: 'Ship AI Agents v2', sub: 'Core shipped · UX in review', badge: '78%' },
          { icon: 'alert', title: 'NPS above 55',      sub: 'Current 41 · Gap: 14 pts',    badge: '36%' },
        ]},
        { type: 'progress', items: [
          { label: 'ARR',     pct: 85 },
          { label: 'EU',      pct: 55 },
          { label: 'Agents',  pct: 78 },
          { label: 'NPS',     pct: 36 },
        ]},
      ],
    },
    {
      id: 'finance', label: 'Finance',
      content: [
        { type: 'metric', label: 'ANNUAL RECURRING REVENUE', value: '$424K', sub: '↑ 8.2% MoM · Target $500K · 84.8%' },
        { type: 'metric-row', items: [
          { label: 'MRR',     value: '$35.3K' },
          { label: 'BURN/MO', value: '$18.4K' },
          { label: 'RUNWAY',  value: '18 mo' },
        ]},
        { type: 'progress', items: [
          { label: 'Salaries',       pct: 45 },
          { label: 'Infrastructure', pct: 26 },
          { label: 'Marketing',      pct: 19 },
          { label: 'Agent Credits',  pct: 10 },
        ]},
        { type: 'text', label: 'MONTHLY BURN', value: 'Oct $16K → Nov $17K → Dec $18K → Jan $17K → Feb $18K → Mar $18.4K' },
      ],
    },
    {
      id: 'sprint', label: 'Sprint',
      content: [
        { type: 'metric', label: 'SPRINT 13 VELOCITY', value: '38 / 64', sub: 'Mar 24 – Apr 4 · Day 5/10 · On pace' },
        { type: 'metric-row', items: [
          { label: 'HUMAN TEAM', value: '22 pts' },
          { label: 'AI AGENTS',  value: '16 pts' },
          { label: 'DONE',       value: '59%' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Pricing page redesign', sub: 'Sarah · 5 pts',         badge: '○' },
          { icon: 'check', title: 'AI agent billing hooks', sub: 'Analyst ⚡ · 8 pts',   badge: '✓' },
          { icon: 'star',  title: 'EU compliance audit',   sub: 'Legal ⚡ · 3 pts',      badge: '○' },
          { icon: 'check', title: 'Onboarding emails',     sub: 'Outreach ⚡ · 5 pts',   badge: '✓' },
          { icon: 'star',  title: 'Q1 board deck',         sub: 'You · 3 pts',           badge: '○' },
        ]},
        { type: 'progress', items: [
          { label: 'Human',  pct: 58 },
          { label: 'Agents', pct: 61 },
          { label: 'Sprint', pct: 59 },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'agents',  label: 'Agents',  icon: 'zap' },
    { id: 'goals',   label: 'Goals',   icon: 'eye' },
    { id: 'finance', label: 'Finance', icon: 'chart' },
    { id: 'sprint',  label: 'Sprint',  icon: 'play' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'flock-mock', 'FLOCK — Interactive Mock');
console.log('Mock live at:', result.url);
