import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LUCID',
  tagline:   'Your founder clarity layer',
  archetype: 'founder-wellness-productivity-light',
  palette: {
    bg:      '#1A1714',
    surface: '#242018',
    text:    '#F7F4EF',
    accent:  '#E8502A',
    accent2: '#2FA86A',
    muted:   'rgba(247,244,239,0.4)',
  },
  lightPalette: {
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#E8502A',
    accent2: '#2FA86A',
    muted:   'rgba(26,23,20,0.45)',
  },
  screens: [
    {
      id: 'clarity', label: 'Clarity',
      content: [
        { type: 'metric', label: "Today's Clarity", value: '91', sub: '+8 vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Energy', value: '88%' },
          { label: 'Focus', value: '94%' },
          { label: 'Recovery', value: '76%' },
        ]},
        { type: 'progress', items: [
          { label: 'Energy', pct: 88 },
          { label: 'Focus', pct: 94 },
          { label: 'Recovery', pct: 76 },
          { label: 'Mood', pct: 91 },
        ]},
        { type: 'text', label: 'AI Nudge', value: 'Your clearest hour is 10–11am. Block it now.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Deep Work — Product Strategy', sub: '9:00 – 10:30am · 90 min', badge: 'Done' },
          { icon: 'activity', title: 'Team Sync — Roadmap Q2', sub: '10:45 – 11:15am · Now', badge: 'Now' },
          { icon: 'calendar', title: 'Writing — Weekly Review', sub: '2:00 – 3:00pm · 60 min', badge: 'Later' },
        ]},
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Deep Focus Session', value: '24:18', sub: 'Product Vision Doc' },
        { type: 'metric-row', items: [
          { label: 'Focus Score', value: '94' },
          { label: 'Distractions', value: '0' },
          { label: 'Flow', value: 'Active' },
        ]},
        { type: 'text', label: 'AI Context', value: "You're in flow. Highest focus score this week. Block distractions for 24 more mins." },
        { type: 'list', items: [
          { icon: 'check', title: 'Product Strategy — 90 min', sub: '9:00am · Score: 96 · 0 distractions', badge: '96' },
          { icon: 'eye', title: 'Email triage — 20 min', sub: '8:30am · Score: 71 · 3 distractions', badge: '71' },
        ]},
        { type: 'tags', label: 'Session', items: ['Pomodoro 2/4', 'Flow State', 'Deep Work'] },
      ],
    },
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'metric-row', items: [
          { label: 'MRR', value: '$18K' },
          { label: 'Runway', value: '14mo' },
          { label: 'Users', value: '2.8K' },
          { label: 'Churn', value: '1.8%' },
        ]},
        { type: 'progress', items: [
          { label: 'Visitors → Signup', pct: 62 },
          { label: 'Signup → Trial', pct: 44 },
          { label: 'Trial → Paid', pct: 22 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Enterprise trial — Acme Corp', sub: '2h ago', badge: 'New' },
          { icon: 'zap', title: 'Stripe: 3 new subscriptions', sub: '5h ago · +$297/mo', badge: '+$' },
          { icon: 'alert', title: 'Churn alert: user_4829', sub: '11h ago · downgraded', badge: '!' },
          { icon: 'heart', title: 'Product Hunt launch', sub: 'Yesterday · +340 signups', badge: 'PH' },
        ]},
      ],
    },
    {
      id: 'habits', label: 'Habits',
      content: [
        { type: 'metric-row', items: [
          { label: 'Done Today', value: '8/9' },
          { label: 'Week Score', value: '89%' },
        ]},
        { type: 'progress', items: [
          { label: 'Sleep 8h', pct: 95 },
          { label: 'Morning pages', pct: 88 },
          { label: 'Workout 30 min', pct: 78 },
          { label: 'No meetings 9–11', pct: 72 },
          { label: 'Deep work block', pct: 93 },
          { label: 'Read 20 min', pct: 99 },
        ]},
        { type: 'text', label: 'AI Pattern', value: 'You skip workouts when sleep is under 7h. Protect sleep to keep your 7-day streak alive.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Reading', sub: 'Top streak', badge: '48d' },
          { icon: 'star', title: 'Morning pages', sub: 'Second streak', badge: '31d' },
          { icon: 'star', title: 'Deep work', sub: 'Third streak', badge: '21d' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Weekly Avg Clarity', value: '78', sub: '+12 vs previous week' },
        { type: 'text', label: 'AI Weekly Synthesis', value: "You had your clearest week since January. 3 deep-work sessions crossed 90 min — a new record. Sleep quality is your only limiting factor." },
        { type: 'list', items: [
          { icon: 'chart', title: 'Focus peaks Tue & Thu', sub: '91 avg — best scheduling windows', badge: '↑' },
          { icon: 'zap', title: 'Morning pages +14pt', sub: 'Clarity boost on journal days', badge: '+14' },
          { icon: 'alert', title: 'Late meetings drain recovery', sub: '-22pt next-day clarity impact', badge: '!' },
          { icon: 'star', title: 'MRR aligns with focus days', sub: 'Best revenue = 3+ focus hours', badge: '✦' },
        ]},
        { type: 'tags', label: 'Next Week Actions', items: ['Block 9–11am', 'Sleep ritual', 'Tue writing AM'] },
      ],
    },
  ],
  nav: [
    { id: 'clarity',  label: 'Clarity',  icon: 'eye'      },
    { id: 'focus',    label: 'Focus',    icon: 'activity' },
    { id: 'pulse',    label: 'Pulse',    icon: 'chart'    },
    { id: 'habits',   label: 'Habits',   icon: 'check'    },
    { id: 'insights', label: 'AI',       icon: 'star'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lucid-mock', 'LUCID — Interactive Mock');
console.log('Mock live at:', result.url);
