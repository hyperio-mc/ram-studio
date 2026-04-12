import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Solace',
  tagline:   'Your quiet corner for reflection',
  archetype: 'wellness-journal',
  palette: {
    bg:      '#2A1F1A',
    surface: '#3A2C25',
    text:    '#F0EAE2',
    accent:  '#C87860',
    accent2: '#7A9E82',
    muted:   'rgba(240,234,226,0.40)',
  },
  lightPalette: {
    bg:      '#F7F3EE',
    surface: '#FFFFFF',
    text:    '#1C1815',
    accent:  '#C87860',
    accent2: '#7A9E82',
    muted:   'rgba(92,68,52,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Good morning, Anika', value: '😌 Calm', sub: 'Today\'s mood · Tue, Apr 1' },
        { type: 'metric-row', items: [{ label: '🔥 Streak', value: '12d' }, { label: 'Entries', value: '87' }, { label: 'Mood avg', value: '87%' }] },
        { type: 'text', label: "Today's Prompt", value: '"Describe a moment this week where you felt most yourself."' },
        { type: 'list', items: [
          { icon: 'star', title: 'Yesterday — Happy 😊', sub: '"I finished the book I\'ve been meaning to read for months..."', badge: '✓' },
          { icon: 'heart', title: 'Sunday — Peaceful 😌', sub: '"Slow morning, coffee, rain on the windows..."', badge: '✓' },
        ]},
        { type: 'tags', label: 'Recent feelings', items: ['grateful', 'peaceful', 'hopeful', 'creative'] },
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric', label: 'April 1 · 😌 Calm', value: 'What made me smile today', sub: '142 words · 7 min read' },
        { type: 'text', label: 'Entry', value: 'I woke up to the smell of coffee already brewed — my partner had gotten up early. Something about that small gesture filled me with warmth all morning.\n\nLater, on my walk, I noticed the cherry blossoms are finally out. I stood under one for a few minutes just watching the petals fall...' },
        { type: 'tags', label: 'Tags', items: ['gratitude', 'nature', 'connection'] },
        { type: 'list', items: [
          { icon: 'plus', title: 'Add photo', sub: '0 photos attached', badge: '+' },
          { icon: 'star', title: 'Save Entry', sub: 'Tap to save to your journal', badge: '→' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [{ label: 'Entries', value: '23' }, { label: 'Positive', value: '87%' }, { label: 'Streak', value: '12d' }] },
        { type: 'progress', items: [
          { label: 'Great days', pct: 52 },
          { label: 'Okay days', pct: 35 },
          { label: 'Low days', pct: 13 },
        ]},
        { type: 'text', label: '✦ Pattern Found', value: 'You feel happiest on Wednesdays. Morning entries tend to be more positive.' },
        { type: 'tags', label: 'Common feelings', items: ['grateful', 'peaceful', 'creative', 'hopeful', 'energised', 'tender'] },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Weekly view', sub: 'See your mood by day of week', badge: '›' },
          { icon: 'chart', title: 'Monthly report', sub: 'April 2026 summary', badge: '›' },
        ]},
      ],
    },
    {
      id: 'breathe', label: 'Breathe',
      content: [
        { type: 'metric', label: '4-7-8 Breathing · Round 1 of 4', value: 'Inhale', sub: 'Calms the nervous system · 4 min session' },
        { type: 'metric-row', items: [{ label: 'Inhale', value: '4s' }, { label: 'Hold', value: '7s' }, { label: 'Exhale', value: '8s' }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Box Breathing', sub: '4×4 balance and clarity', badge: '▶' },
          { icon: 'eye', title: 'Body Scan', sub: '5 min deep unwind', badge: '▶' },
          { icon: 'zap', title: 'Quick Reset', sub: '2 min · any time', badge: '▶' },
        ]},
        { type: 'progress', items: [
          { label: 'Sessions today', pct: 25 },
          { label: 'Streak', pct: 80 },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Anika Reyes · Journaling since Jan 2025', value: 'Growth', sub: '87 entries · 23K words written' },
        { type: 'metric-row', items: [{ label: 'Entries', value: '87' }, { label: 'Words', value: '23K' }, { label: 'Streak', value: '12d' }] },
        { type: 'tags', label: 'Milestones', items: ['🌱 First Entry', '🔥 7-Day Streak', '🌸 Spring Writer', '📖 50 Entries', '✨ 30-Day Streak'] },
        { type: 'text', label: 'Quote', value: '"Growth begins the moment you start noticing." — Solace Insight' },
        { type: 'list', items: [
          { icon: 'bell', title: 'Reminders', sub: 'Daily at 9:00 AM', badge: '›' },
          { icon: 'share', title: 'Export Journal', sub: 'PDF or plain text', badge: '›' },
          { icon: 'lock', title: 'Privacy & Data', sub: 'All data stays on-device', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'journal',  label: 'Journal',  icon: 'edit' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'breathe',  label: 'Breathe',  icon: 'activity' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'solace-mock', 'Solace — Interactive Mock');
console.log('Mock live at:', result.url);
