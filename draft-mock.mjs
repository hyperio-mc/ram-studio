import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DRAFT',
  tagline:   'Your AI writing companion',
  archetype: 'productivity-ai',
  palette: {
    bg:      '#1A1612',
    surface: '#231E19',
    text:    '#F8F5F1',
    accent:  '#4A7BFF',
    accent2: '#F59E0B',
    muted:   'rgba(248,245,241,0.4)',
  },
  lightPalette: {
    bg:      '#F8F5F1',
    surface: '#FFFFFF',
    text:    '#1A1612',
    accent:  '#2A5BF5',
    accent2: '#F59E0B',
    muted:   'rgba(26,22,18,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Current streak', value: '14d', sub: '🔥 Keep it going!' },
        { type: 'metric-row', items: [
          { label: 'Words today', value: '340' },
          { label: 'Goal', value: '500' },
          { label: 'Sessions', value: '2' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily word goal', pct: 68 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Product Launch Essay', sub: '1,240 words · 68% done', badge: '▶' },
          { icon: 'list', title: 'Quarterly Review Notes', sub: '480 words · paused 2h ago', badge: '⏸' },
        ]},
        { type: 'tags', label: 'Prompts for today', items: ['Reflect on a risk taken', 'Describe your ideal morning', 'A decision you almost missed'] },
        { type: 'text', label: 'AI tip', value: '⟡  You write 3× more when you start before 10am.' },
      ],
    },
    {
      id: 'canvas',
      label: 'Write',
      content: [
        { type: 'metric', label: 'Current session', value: '1,240', sub: 'words · 24m writing' },
        { type: 'text', label: 'Writing canvas', value: 'The morning I decided to launch was a Thursday.\n\nNot because the product was ready — it wasn\'t, not really — but because I\'d been waiting for ready my entire career and ready never came.\n\nThe cursor blinked. I stared. Then I hit Publish.' },
        { type: 'text', label: '⟡ AI suggestion (tap to accept)', value: '"And somehow, that was enough."' },
        { type: 'tags', label: 'Quick actions', items: ['Accept ghost text', 'Expand paragraph', 'Shorten sentence', 'Add emotion'] },
        { type: 'metric-row', items: [
          { label: 'Tone', value: 'Reflective' },
          { label: 'Read time', value: '~5m' },
        ]},
      ],
    },
    {
      id: 'sessions',
      label: 'Sessions',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'Product Launch Essay', sub: '1,240 words · 48m · Today', badge: 'active' },
          { icon: 'list', title: 'Quarterly Review Notes', sub: '480 words · 22m · Today', badge: 'paused' },
          { icon: 'check', title: 'Team Retrospective', sub: '2,100 words · 1h 12m · Yesterday', badge: '✓' },
          { icon: 'check', title: 'Personal Journal #42', sub: '680 words · 18m · Apr 5', badge: '✓' },
          { icon: 'check', title: 'Feature Brief: Search', sub: '3,400 words · 2h 8m · Apr 4', badge: '✓' },
        ]},
        { type: 'metric-row', items: [
          { label: 'This week', value: '8,060' },
          { label: 'Avg session', value: '42m' },
          { label: 'Streak', value: '14d' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Words/week', value: '8,060' },
          { label: 'Streak', value: '14d' },
          { label: 'Peak time', value: '9:30am' },
        ]},
        { type: 'progress', items: [
          { label: 'Reflective', pct: 82 },
          { label: 'Analytical', pct: 64 },
          { label: 'Conversational', pct: 71 },
          { label: 'Persuasive', pct: 48 },
        ]},
        { type: 'text', label: '⟡ AI insight', value: 'You write 3× longer when you start before 10am. Try scheduling deep-work blocks in the morning.' },
        { type: 'tags', label: 'Best days', items: ['Wednesday', 'Friday', 'Sunday'] },
        { type: 'metric', label: 'Best single session', value: '2,100', sub: 'words in one go (last Thursday)' },
      ],
    },
    {
      id: 'ai-companion',
      label: 'AI',
      content: [
        { type: 'tags', label: 'Writing voice', items: ['Conversational ✓', 'Academic', 'Journalistic', 'Creative'] },
        { type: 'progress', items: [
          { label: 'Ghost text suggestions', pct: 100 },
          { label: 'Tone alerts', pct: 100 },
          { label: 'Session summaries', pct: 0 },
          { label: 'Auto-save drafts', pct: 100 },
        ]},
        { type: 'metric', label: 'AI tokens used this week', value: '42K', sub: 'of 100K monthly limit' },
        { type: 'text', label: 'AI memory', value: 'DRAFT remembers your preferred tone, recurring themes, and writing patterns to personalise suggestions.' },
        { type: 'tags', label: 'Remembered themes', items: ['product launches', 'personal growth', 'team leadership', 'retrospectives'] },
      ],
    },
  ],
  nav: [
    { id: 'today',        label: 'Today',    icon: 'home'     },
    { id: 'canvas',       label: 'Write',    icon: 'activity' },
    { id: 'sessions',     label: 'Sessions', icon: 'list'     },
    { id: 'insights',     label: 'Insights', icon: 'chart'    },
    { id: 'ai-companion', label: 'AI',       icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'draft-mock', 'DRAFT — Interactive Mock');
console.log('Mock live at:', result.url);
