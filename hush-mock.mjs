// hush-mock.mjs — HUSH Svelte 5 interactive mock
// Dark midnight violet palette (primary) + light stone (secondary)

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'HUSH',
  tagline:   'sleep intelligence for people who overthink',
  archetype: 'sleep-wellness',

  // DARK palette (primary — midnight violet)
  palette: {
    bg:      '#07080D',
    surface: '#0F1117',
    text:    '#E8E6F0',
    accent:  '#8B7FFF',   // violet — sleep
    accent2: '#F0A040',   // amber — wake/morning
    muted:   'rgba(232,230,240,0.38)',
  },

  // LIGHT palette (secondary — soft daylight)
  lightPalette: {
    bg:      '#F5F4F8',
    surface: '#FFFFFF',
    text:    '#1A1624',
    accent:  '#6B60E8',   // darker violet for light bg
    accent2: '#C4820A',   // amber on light
    muted:   'rgba(26,22,36,0.42)',
  },

  screens: [
    {
      id: 'tonight',
      label: 'Tonight',
      content: [
        { type: 'metric', label: 'TONIGHT', value: '10:30 PM → 6:30 AM', sub: 'Thursday · March 26' },
        { type: 'metric-row', items: [
          { label: 'Wind-down', value: '47:32' },
          { label: 'Room temp', value: '18.5°C' },
          { label: 'Noise', value: '34 dB' },
        ]},
        { type: 'tags', label: 'Checklist', items: ['✓ No caffeine', '✓ Phone down', '✓ Lights dim', '□ Room cool'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Wind-down: 47 min left', sub: 'Room temperature ideal — 18.5°C', badge: '🌙 On track' },
          { icon: 'star',  title: 'Smart alarm set', sub: '6:30 AM ±20 min light sleep window', badge: '⏰ Ready' },
          { icon: 'map',   title: 'CBT-I: sleep restriction', sub: 'Stay awake until your window opens', badge: '📋 Tonight' },
          { icon: 'play',  title: '4-7-8 breathing guide', sub: 'Tap to start 5 min session', badge: '🌬 Relax' },
        ]},
        { type: 'text', label: '✦ HUSH note', value: 'Your body temperature drops naturally around 10:20 PM. That\'s your optimal sleep onset window.' },
      ],
    },
    {
      id: 'sleep',
      label: 'Last Night',
      content: [
        { type: 'metric', label: 'SLEEP QUALITY', value: '82 / 100', sub: '↑ +6 pts vs your average of 76' },
        { type: 'metric-row', items: [
          { label: 'Duration', value: '7h 24m' },
          { label: 'Efficiency', value: '87%' },
          { label: 'Wake-ups', value: '2×' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: 'Deep sleep: 28%', sub: '1h 58m — 12 min above your average', badge: '💜 +12 min' },
          { icon: 'heart', title: 'REM sleep: 22%', sub: '1h 32m — dream consolidation active', badge: '💙 Normal' },
          { icon: 'map',   title: 'Light sleep: 44%', sub: '3h 3m — transition phase', badge: '💚 Typical' },
          { icon: 'check', title: 'Awake: 6%', sub: '25 min — mostly near wake time', badge: '🌙 Normal' },
        ]},
        { type: 'text', label: '✦ Insight', value: 'Deep sleep was elevated — likely because you exercised yesterday. Exercise consistently improves deep sleep by 8 pts on average.' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'NIGHTLY JOURNAL', value: 'Before you sleep', sub: 'Wednesday entry' },
        { type: 'tags', label: 'Mood', items: ['😩', '😔', '😐', '🙂 ←', '😄'] },
        { type: 'tags', label: "Tonight's factors", items: ['🏃 exercise ✓', '📱 screens ✓', '☕ caffeine', '😰 stress', '🧘 meditation'] },
        { type: 'list', items: [
          { icon: 'check', title: 'On my mind', sub: 'Presentation tomorrow — kept going over slides. Trying box breathing.', badge: '✍️' },
          { icon: 'star',  title: 'One good thing', sub: "Coffee with Mia — hadn't laughed like that in weeks.", badge: '✦' },
          { icon: 'heart', title: '4-7-8 breathing', sub: 'Start 5-minute guided session', badge: '🌬 Start' },
        ]},
        { type: 'text', label: '✦ Journal insight', value: 'Stress tagged nights correlate with −5 pts sleep quality for you. The journal helps you spot the pattern before it becomes insomnia.' },
      ],
    },
    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric', label: '7-DAY AVERAGE', value: '77 / 100', sub: '↑ +4 points vs prior week' },
        { type: 'tags', label: 'This week', items: ['71 Mon', '68 Tue', '82 Wed', '79 Thu', '75 Fri', '84 Sat', '82 Sun'] },
        { type: 'list', items: [
          { icon: 'star',  title: '🏃 Exercise days', sub: 'Sleep quality improvement', badge: '+8 pts' },
          { icon: 'check', title: '📱 Screen time >2h', sub: 'Sleep quality impact', badge: '−6 pts' },
          { icon: 'heart', title: '☕ Caffeine after 2pm', sub: 'Delayed sleep onset', badge: '−5 pts' },
          { icon: 'map',   title: '🍷 Alcohol', sub: 'REM disruption', badge: '−7 pts' },
          { icon: 'play',  title: '🧘 Meditation', sub: 'Stress reduction benefit', badge: '+4 pts' },
        ]},
        { type: 'text', label: '✦ Streak', value: '🔥 5-day streak of 7+ hour nights — your best run this month. One more night to beat your record.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'YOUR SLEEP PROFILE', value: '8h goal / night', sub: 'Current avg: 7h 18m — 42 min below target' },
        { type: 'metric-row', items: [
          { label: 'Sleep debt', value: '2h 24m' },
          { label: 'Streak', value: '5 nights' },
          { label: 'Avg score', value: '77 pts' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Smart alarm: 6:30 AM ±20 min', sub: 'Wakes during lightest sleep phase', badge: '✓ On' },
          { icon: 'star',  title: 'Wind-down: 60 min routine', sub: 'Starts 9:30 PM — includes journal prompt', badge: '✓ On' },
          { icon: 'heart', title: 'Apple Health', sub: 'Heart rate, HRV, sleep stages', badge: '✓ Linked' },
          { icon: 'map',   title: 'Oura Ring Gen3', sub: 'Temperature, readiness score', badge: '✓ Linked' },
        ]},
        { type: 'text', label: '✦ HUSH note', value: 'HUSH uses CBT-I (Cognitive Behavioural Therapy for Insomnia) — clinically proven to outperform sleep medication long-term, with no dependency or side effects.' },
      ],
    },
  ],

  nav: [
    { id: 'tonight', label: 'Tonight', icon: 'star' },
    { id: 'sleep',   label: 'Sleep',   icon: 'check' },
    { id: 'journal', label: 'Journal', icon: 'heart' },
    { id: 'trends',  label: 'Trends',  icon: 'map'   },
    { id: 'profile', label: 'Profile', icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('hush-mock.html', html);
console.log(`✓ Saved hush-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'hush-mock', 'HUSH — Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  hush-mock.html saved locally — will publish Apr 23');
}
