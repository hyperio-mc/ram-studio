// SONA — Svelte Interactive Mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Sona',
  tagline:   'Speak freely, hear clearly',
  archetype: 'ai-voice-wellness-journal',
  palette: {
    bg:      '#111009',
    surface: '#1C1916',
    text:    '#EDE9E3',
    accent:  '#F07550',
    accent2: '#9D82FF',
    muted:   'rgba(237,233,227,0.44)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#E8603A',
    accent2: '#7C5CFC',
    muted:   'rgba(28,25,23,0.44)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Day Streak', value: '23', sub: '🔥 Personal best' },
        { type: 'metric-row', items: [
          { label: 'This Week', value: '7 notes' },
          { label: 'Avg Mood', value: 'Calm' },
          { label: 'AI Insights', value: '12' },
        ]},
        { type: 'tags', label: 'How are you now?', items: ['✨ Energised', '😌 Calm', '😔 Low', '😤 Stressed', '🤔 Uncertain'] },
        { type: 'text', label: "Yesterday's Insight", value: '"You mentioned feeling overwhelmed three times — all before 11am. Your afternoon entries were notably calmer."' },
        { type: 'list', items: [
          { icon: 'mic', title: 'Hold to speak', sub: 'What\'s on your mind?', badge: '●' },
        ]},
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric', label: 'Total Entries', value: '47', sub: 'Since March 2026' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning clarity despite the chaos', sub: '8:42 AM · 1m 47s · Energised', badge: '●' },
          { icon: 'activity', title: 'Lunch walk: processing the meeting', sub: '12:15 PM · 3m 12s · Reflective', badge: '' },
          { icon: 'activity', title: 'Anticipating the week ahead', sub: 'Yesterday · 7:50 AM · Anxious', badge: '●' },
          { icon: 'activity', title: 'Breakthrough in the design review', sub: 'Yesterday · 1:30 PM · Excited', badge: '●' },
          { icon: 'activity', title: 'End of day wind-down', sub: 'Yesterday · 8:12 PM · Calm', badge: '' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Calm', 'Stressed', 'Grateful', 'Excited'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'This Week in Feeling', value: 'Increasingly Calm', sub: '↑ Stress patterns fading Thu–Sat' },
        { type: 'metric-row', items: [
          { label: 'Entries', value: '12' },
          { label: 'Peak Mood', value: 'Joyful' },
          { label: 'Avg Length', value: '2m 41s' },
        ]},
        { type: 'progress', items: [
          { label: 'Work / focus',     pct: 68 },
          { label: 'Relationships',    pct: 44 },
          { label: 'Body & sleep',     pct: 36 },
          { label: 'Creative output',  pct: 28 },
          { label: 'Uncertainty',      pct: 24 },
        ]},
        { type: 'text', label: 'AI Observation', value: 'Your calmest entries happen after physical activity (3 correlations found). You use "overwhelmed" most on Tuesdays before 10am.' },
      ],
    },
    {
      id: 'listen', label: 'Listen',
      content: [
        { type: 'metric', label: 'Weekly Audio Digest', value: 'Week 14', sub: '8m 24s · 5 chapters' },
        { type: 'metric-row', items: [
          { label: 'Progress', value: '42%' },
          { label: 'Speed', value: '1.2×' },
          { label: 'Chapter', value: '2 of 5' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Opening — your emotional snapshot', sub: '0:00 · Complete', badge: '✓' },
          { icon: 'play',  title: 'The tension of Mon & Tue', sub: '1:42 · Now playing', badge: '▶' },
          { icon: 'list',  title: 'Turning point — Wednesday afternoon', sub: '3:10 · Upcoming', badge: '' },
          { icon: 'heart', title: 'What your body was telling you', sub: '5:28 · Upcoming', badge: '' },
          { icon: 'star',  title: 'Closing — patterns to carry forward', sub: '7:01 · Upcoming', badge: '' },
        ]},
        { type: 'text', label: 'Now Playing', value: '"On Tuesday you said — \'I keep feeling like I\'m running behind before the day even starts.\' This appeared in 4 of your 12 entries."' },
      ],
    },
    {
      id: 'grow', label: 'Grow',
      content: [
        { type: 'text', label: "This Week's Letter", value: '"Dear Mira — this was a week of quiet transformation. You began it braced for collision and ended it standing straighter."' },
        { type: 'progress', items: [
          { label: 'Speak 2+ min / day',          pct: 71 },
          { label: 'Name a feeling each morning',  pct: 85 },
          { label: 'End-of-day reflection',        pct: 42 },
          { label: 'Weekly gratitude entry',       pct: 100 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'The Overwhelm Pattern', sub: 'You\'ve mentioned overwhelm 8 times this week, always before noon.', badge: '↑' },
          { icon: 'heart', title: 'Your Best Moment', sub: 'Friday 3:20pm had your highest joy marker — what made it stand out?', badge: '★' },
          { icon: 'star',  title: 'Forward Motion', sub: 'What would you change about how you start your mornings next week?', badge: '→' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'journal',  label: 'Journal',  icon: 'list'     },
    { id: 'insights', label: 'Insights', icon: 'activity' },
    { id: 'listen',   label: 'Listen',   icon: 'play'     },
    { id: 'grow',     label: 'Grow',     icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sona-mock', 'Sona — Interactive Mock');
console.log('Mock live at:', result.url);
