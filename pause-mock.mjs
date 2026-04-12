import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PAUSE',
  tagline:   'Daily Reflection & Journaling',
  archetype: 'wellness',

  palette: {
    bg:      '#2A2724',
    surface: '#333028',
    text:    '#F8F6F1',
    accent:  '#5A8A6E',
    accent2: '#C4876A',
    muted:   'rgba(248,246,241,0.4)',
  },
  lightPalette: {
    bg:      '#F8F6F1',
    surface: '#FFFFFF',
    text:    '#1E1C18',
    accent:  '#5A8A6E',
    accent2: '#C4876A',
    muted:   'rgba(30,28,24,0.4)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'SUNDAY, APRIL 12', value: 'What does quiet\nfeel like today?', sub: 'Tap to begin your reflection' },
        { type: 'tags', label: 'HOW ARE YOU?', items: ['😌 Calm', '🤔 Unsure', '😔 Heavy', '✨ Hopeful', '😴 Tired'] },
        { type: 'text', label: 'YESTERDAY', value: '"The need to have the answer before I begin."  — Saturday, Apr 11' },
        { type: 'text', label: 'WRITING STREAK', value: 'No streaks. No reminders unless you want them. Just a quiet space to return to.' },
        { type: 'list', items: [
          { icon: 'edit-3', title: 'Begin writing', sub: 'Open the blank page', badge: '→' },
          { icon: 'bookmark', title: 'Today\'s saved prompt', sub: '"What are you avoiding thinking about?"', badge: 'use' },
        ]},
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric-row', items: [
          { label: 'ENTRIES', value: '47' },
          { label: 'THIS MONTH', value: '11' },
          { label: 'WORDS', value: '18.4k' },
        ]},
        { type: 'tags', label: 'FILTER', items: ['All', 'April', 'March', 'February'] },
        { type: 'list', items: [
          { icon: 'file-text', title: 'Saturday, Apr 11', sub: '"The need to have the answer…" · 312 words', badge: '5m' },
          { icon: 'file-text', title: 'Friday, Apr 10',   sub: '"Sitting with uncertainty…" · 208 words',   badge: '3m' },
          { icon: 'file-text', title: 'Thursday, Apr 9',  sub: '"What I noticed on the walk…" · 445 words',  badge: '7m' },
          { icon: 'file-text', title: 'Wednesday, Apr 8', sub: '"The need to have the answer…" · 288 words', badge: '4m' },
          { icon: 'file-text', title: 'Tuesday, Apr 7',   sub: '"Returning to something quiet…" · 190 words', badge: '3m' },
        ]},
      ],
    },
    {
      id: 'reflect',
      label: 'Reflect',
      content: [
        { type: 'metric', label: 'WEEK OF APRIL 7–12', value: 'You wrote 5 of 7 days.', sub: 'No judgment — just what happened.' },
        { type: 'tags', label: 'DAYS', items: ['M ✓', 'T ✓', 'W ✓', 'T ✓', 'F ✓', 'S —', 'S —'] },
        { type: 'text', label: 'THIS WEEK IN YOUR WORDS', value: '"The need to have the answer before I begin."  — Tuesday, April 8' },
        { type: 'progress', items: [
          { label: 'Letting go',    pct: 60 },
          { label: 'Quiet moments', pct: 40 },
          { label: 'Becoming',      pct: 40 },
          { label: 'Returning',     pct: 20 },
        ]},
        { type: 'text', label: 'A WORD THAT KEPT RETURNING', value: '"quiet" — appeared in 4 of your 5 entries this week' },
      ],
    },
    {
      id: 'prompts',
      label: 'Prompts',
      content: [
        { type: 'metric', label: 'SAVED PROMPTS', value: '12 saved', sub: '84 total prompts available' },
        { type: 'tags', label: 'CATEGORY', items: ['All', 'Morning', 'Evening', 'Hard days', 'Gratitude'] },
        { type: 'list', items: [
          { icon: 'bookmark', title: 'What are you avoiding thinking about?', sub: 'Depth · Used 3 times',    badge: '★' },
          { icon: 'bookmark', title: 'Who did you think about today, and why?', sub: 'Relationships · Used 1x', badge: '★' },
          { icon: 'circle',   title: 'What would you tell your past self?',     sub: 'Reflection · New',       badge: '+' },
          { icon: 'circle',   title: 'Describe the light in the room right now.', sub: 'Presence · New',       badge: '+' },
          { icon: 'circle',   title: 'What does rest mean to you today?',       sub: 'Rest · Morning',         badge: '+' },
        ]},
      ],
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      content: [
        { type: 'metric', label: 'WELCOME TO PAUSE', value: 'What brings you\nhere today?', sub: 'No right answer. Just yours.' },
        { type: 'list', items: [
          { icon: 'sun',         title: 'Process my thoughts',    sub: 'A place to think out loud',         badge: '→' },
          { icon: 'moon',        title: 'Track how I\'m feeling', sub: 'Quiet emotional awareness',         badge: '→' },
          { icon: 'feather',     title: 'Just write, regularly',  sub: 'Build a gentle practice',           badge: '→' },
          { icon: 'compass',     title: 'I\'m not sure yet',      sub: 'That\'s the right place to start',  badge: '→' },
        ]},
        { type: 'text', label: 'HOW PAUSE IS DIFFERENT', value: 'No streaks · No badges · No rings · Private by default · Works offline' },
      ],
    },
    {
      id: 'write',
      label: 'Write',
      content: [
        { type: 'metric', label: 'SATURDAY, APRIL 11', value: 'What brings you\nback to this?', sub: 'Prompt · Tap to change' },
        { type: 'text', label: 'YOUR ENTRY', value: 'There is something about the early morning light through the east window that makes everything feel provisional. Not unfinished — just not yet decided. I keep returning to this quality of uncertainty, the way it...' },
        { type: 'text', label: 'WRITING', value: '142 words · 5 min read · Apr 11' },
        { type: 'tags', label: 'TOOLBAR', items: ['B', 'I', '"', '—', '···'] },
        { type: 'list', items: [
          { icon: 'save',    title: 'Save draft',   sub: 'Auto-saved 2 min ago',    badge: '✓' },
          { icon: 'check',   title: 'Finish entry', sub: 'Mark complete for today',  badge: '→' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'sun' },
    { id: 'journal', label: 'Journal', icon: 'book' },
    { id: 'reflect', label: 'Reflect', icon: 'activity' },
    { id: 'prompts', label: 'Prompts', icon: 'bookmark' },
    { id: 'write',   label: 'Write',   icon: 'edit-3' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'pause');
const result = await publishMock(built, 'pause');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/pause-mock`);
