/**
 * STILLPOINT — Svelte interactive mock
 * Dark focus-session app. Cinematic near-black, ice-blue accent, warm amber.
 */
import https from 'https';
import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';

// Publish without X-Subdomain (uses main zenbin.org/p/ namespace)
function publishPage(slug, html, title) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ title: title || slug, html });
    const body    = Buffer.from(payload);
    const req = https.request({
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ ok: true, url: `https://zenbin.org/p/${slug}`, status: res.statusCode });
        } else {
          reject(new Error(`ZenBin ${res.statusCode}: ${d.slice(0,300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const design = {
  appName:   'STILLPOINT',
  tagline:   'Enter the stillness.',
  archetype: 'focus-session',

  palette: {           // DARK
    bg:      '#06060E',
    surface: '#0D0D1E',
    text:    '#EDE8E0',
    accent:  '#8BB8FF',
    accent2: '#C4A882',
    muted:   'rgba(237,232,224,0.35)',
  },
  lightPalette: {      // LIGHT
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    text:    '#1A1816',
    accent:  '#3A7BD5',
    accent2: '#9B7A4C',
    muted:   'rgba(26,24,22,0.40)',
  },

  screens: [
    {
      id: 'ready', label: 'Ready',
      content: [
        { type: 'metric', label: 'SESSION TYPE', value: 'Deep Work', sub: 'focused, uninterrupted' },
        { type: 'metric', label: 'DURATION', value: '90', sub: 'minutes · tap to adjust' },
        { type: 'text',   label: 'Intention', value: 'enter the stillness. silence all motion.' },
        { type: 'tags',   label: 'Quick durations', items: ['45 min', '60 min', '90 min', '120 min'] },
        { type: 'metric', label: 'LAST SESSION', value: '3h 20m', sub: 'yesterday · score 91' },
        { type: 'progress', items: [{ label: 'Weekly goal', pct: 68 }] },
      ],
    },
    {
      id: 'session', label: 'In Session',
      content: [
        { type: 'metric', label: 'REMAINING', value: '28:44', sub: 'deep work · session 3' },
        { type: 'progress', items: [{ label: 'Session progress', pct: 68 }] },
        { type: 'text', label: 'Ambient', value: '"stillness is where clarity is born"' },
        { type: 'metric-row', items: [
          { label: 'Depth', value: '94%' },
          { label: 'Distractions', value: '0' },
          { label: 'Flow', value: '●●●○' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'PAUSE', sub: 'hold the session', badge: '⏸' },
          { icon: 'alert', title: 'END SESSION', sub: 'complete early', badge: '◻' },
        ]},
      ],
    },
    {
      id: 'break', label: 'Break',
      content: [
        { type: 'metric', label: 'BREAK', value: '05:00', sub: 'short break · motion time' },
        { type: 'text',   label: 'Prompt', value: 'surface. breathe. move. return.' },
        { type: 'metric-row', items: [
          { label: 'Sets done', value: '3/4' },
          { label: 'Streak', value: '7 days' },
          { label: 'Today', value: '3h 20m' },
        ]},
        { type: 'text', label: 'Intention', value: 'What will you focus on next?' },
        { type: 'tags', label: 'Quick actions', items: ['Breathe', 'Stretch', 'Water', 'Walk'] },
        { type: 'progress', items: [{ label: 'Long break threshold', pct: 75 }] },
      ],
    },
    {
      id: 'complete', label: 'Complete',
      content: [
        { type: 'metric', label: 'SESSION COMPLETE', value: '✓', sub: 'you held the stillness' },
        { type: 'metric-row', items: [
          { label: 'Focused', value: '1h 30m' },
          { label: 'Score', value: '94' },
          { label: 'Streak', value: '7 days' },
        ]},
        { type: 'progress', items: [
          { label: 'Focus depth', pct: 94 },
          { label: 'Session goal', pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Personal best depth', sub: 'score of 94 — new record', badge: '🏆' },
          { icon: 'activity', title: 'Streak extended',     sub: '7 consecutive days',        badge: '●' },
        ]},
        { type: 'metric', label: 'TOTAL TODAY', value: '3h 20m', sub: 'across 3 sessions' },
      ],
    },
    {
      id: 'log', label: 'Log',
      content: [
        { type: 'metric', label: 'THIS WEEK', value: '18h', sub: 'deep work time' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 60 },
          { label: 'Tue', pct: 38 },
          { label: 'Wed', pct: 80 },
          { label: 'Thu', pct: 90 },
          { label: 'Fri', pct: 50 },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Deep Work · 1h 30m', sub: 'Today 9:00 AM · score 94',    badge: '94' },
          { icon: 'calendar', title: 'Writing · 1h',       sub: 'Today 7:10 AM · score 87',    badge: '87' },
          { icon: 'calendar', title: 'Deep Work · 2h',     sub: 'Yesterday 3 PM · score 91',   badge: '91' },
          { icon: 'calendar', title: 'Reading · 45m',      sub: 'Yesterday 8 AM · score 78',   badge: '78' },
        ]},
      ],
    },
    {
      id: 'self', label: 'Self',
      content: [
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '247' },
          { label: 'Streak', value: '7 days' },
          { label: 'Total', value: '312h' },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Focus duration',    sub: '90 minutes',  badge: '→' },
          { icon: 'settings', title: 'Short break',       sub: '5 minutes',   badge: '→' },
          { icon: 'settings', title: 'Long break',        sub: '20 minutes',  badge: '→' },
          { icon: 'settings', title: 'Sessions per set',  sub: '4 sessions',  badge: '→' },
        ]},
        { type: 'tags', label: 'Ambient', items: ['Focus sounds ✓', 'Break prompts ✓', 'Lock screen', 'Notifications'] },
        { type: 'progress', items: [{ label: 'Monthly goal progress', pct: 72 }] },
      ],
    },
  ],

  nav: [
    { id: 'ready',    label: 'Focus',   icon: 'zap'      },
    { id: 'session',  label: 'Session', icon: 'activity' },
    { id: 'break',    label: 'Break',   icon: 'eye'      },
    { id: 'complete', label: 'Done',    icon: 'check'    },
    { id: 'log',      label: 'Log',     icon: 'list'     },
    { id: 'self',     label: 'Self',    icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishPage('stillpoint-mock', html, 'STILLPOINT — Interactive Mock');
console.log('Mock live at:', result.url);
