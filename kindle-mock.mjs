import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KINDLE',
  tagline:   'Your emotional performance OS',
  archetype: 'emotional-wellness-dark',
  palette: {
    bg:      '#0C0A07',
    surface: '#161210',
    text:    '#F0E8D5',
    accent:  '#D4943A',
    accent2: '#7A5BBF',
    muted:   'rgba(240,232,213,0.4)',
  },
  lightPalette: {
    bg:      '#FBF7F0',
    surface: '#FFFFFF',
    text:    '#1A120A',
    accent:  '#C4831A',
    accent2: '#6B4DAF',
    muted:   'rgba(26,18,10,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Current State', value: 'Focused', sub: '& Energized · 70% confidence' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '68ms' },
          { label: 'Sleep', value: '7.4h' },
          { label: 'Focus', value: '84%' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily Rhythm — Active', pct: 62 },
          { label: 'Intentions Complete', pct: 60 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '20 min deep work block', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Evening reflection', sub: 'Completed', badge: '✓' },
          { icon: 'circle', title: 'No screens after 10pm', sub: 'Pending' },
        ]},
        { type: 'text', label: 'Kindle Note', value: 'You\'re 31% higher on days with a morning focus block.' },
      ],
    },
    {
      id: 'log', label: 'Log',
      content: [
        { type: 'tags', label: 'Emotional State', items: ['✦ Joyful', '◎ Calm', '◉ Focused', '◈ Anxious', '◇ Grateful', '◔ Tired', '◑ Creative', '○ Sad'] },
        { type: 'metric', label: 'Intensity', value: '7', sub: 'out of 10' },
        { type: 'progress', items: [{ label: 'Intensity Level', pct: 70 }] },
        { type: 'tags', label: 'Context', items: ['Work', 'Post-exercise', 'Social', 'Morning', 'Rest'] },
        { type: 'text', label: 'Note', value: 'Add a note about this moment...' },
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Deep Work Mode', value: '23:17', sub: 'remaining — 90 min Deep session' },
        { type: 'tags', label: 'Session Type', items: ['25 min', 'Deep ✓', 'Flow'] },
        { type: 'tags', label: 'Ambient Sound', items: ['♪ Forest ✓', '♬ Rain', '∿ Ocean', '· White'] },
        { type: 'progress', items: [
          { label: 'Session Progress', pct: 74 },
          { label: 'Focus Score Today', pct: 84 },
        ]},
        { type: 'text', label: 'Session Note', value: 'Stay in flow. Notifications muted. Forest ambience active.' },
      ],
    },
    {
      id: 'trends', label: 'Trends',
      content: [
        { type: 'metric-row', items: [
          { label: 'Mon', value: '5' },
          { label: 'Wed', value: '8' },
          { label: 'Fri', value: '9' },
          { label: 'Sun', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Deep work sessions', sub: 'Correlation: 84%', badge: '+2.1' },
          { icon: 'star', title: 'Sleep quality', sub: 'Correlation: 72%', badge: '+1.8' },
          { icon: 'alert', title: 'Screen time >3hrs', sub: 'Correlation: 56%', badge: '-1.4' },
          { icon: 'zap', title: 'Exercise', sub: 'Correlation: 48%', badge: '+1.2' },
        ]},
        { type: 'text', label: 'AI Pattern', value: 'You score 31% higher on days with a morning focus block before 9am.' },
        { type: 'metric-row', items: [
          { label: 'Day Streak', value: '12 🔥' },
          { label: 'Focus Streak', value: '5 ◉' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Me',
      content: [
        { type: 'metric', label: 'Alex Rivera', value: 'Level 7', sub: 'Emotional Athlete · 41 days active' },
        { type: 'progress', items: [{ label: 'XP to Level 8', pct: 63 }] },
        { type: 'metric-row', items: [
          { label: 'Check-ins', value: '41' },
          { label: 'Focus hrs', value: '68' },
          { label: 'Insights', value: '127' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '7:00 AM — Morning check-in', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: '9:00 AM — Deep focus block', sub: 'Completed', badge: '✓' },
          { icon: 'circle', title: '1:00 PM — Midday mood log', sub: 'Pending' },
          { icon: 'circle', title: '9:00 PM — Evening reflection', sub: 'Pending' },
        ]},
        { type: 'text', label: 'KINDLE Gold', value: 'Unlock AI coaching & advanced pattern analysis. Upgrade to Gold.' },
      ],
    },
  ],
  nav: [
    { id: 'today', label: 'Today', icon: 'home' },
    { id: 'log',   label: 'Log',   icon: 'heart' },
    { id: 'focus', label: 'Focus', icon: 'zap' },
    { id: 'trends',label: 'Trends',icon: 'activity' },
    { id: 'profile',label: 'Me',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kindle-mock', 'KINDLE — Interactive Mock');
console.log('Mock live at:', result.url);
