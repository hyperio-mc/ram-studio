import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WEFT',
  tagline:   'Async Writing Studio for Distributed Teams',
  archetype: 'knowledge-distillation-light',

  palette: {           // DARK theme
    bg:      '#14120E',
    surface: '#1C1A14',
    text:    '#F0EDE6',
    accent:  '#A07DE8',
    accent2: '#E8932D',
    muted:   'rgba(240,237,230,0.4)',
  },

  lightPalette: {      // LIGHT theme (primary)
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#18171A',
    accent:  '#7C5CBF',
    accent2: '#E07D2D',
    muted:   'rgba(24,23,26,0.38)',
  },

  screens: [
    {
      id: 'studio', label: 'Studio',
      content: [
        { type: 'metric', label: 'Words This Week', value: '3,840', sub: '76% of 5,000 goal · 🔥 14-day streak' },
        { type: 'metric-row', items: [
          { label: 'Threads',  value: '12' },
          { label: 'Entries',  value: '284' },
          { label: 'Sessions', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Q2 Product Strategy',          sub: '820 words · updated 2h ago',     badge: '✦' },
          { icon: 'layers', title: 'Team Retro — Feb Sprint',      sub: '540 words · updated yesterday',   badge: '○' },
          { icon: 'search', title: 'UX Research Synthesis',        sub: '1,240 words · updated 3d ago',    badge: '○' },
          { icon: 'user',   title: 'Personal OKRs draft',          sub: '310 words · updated 5d ago',      badge: '○' },
        ]},
        { type: 'tags', label: 'Active Tags', items: ['Strategy', 'Research', 'Retro', 'Personal', 'Design'] },
      ],
    },
    {
      id: 'capture', label: 'Capture',
      content: [
        { type: 'text', label: 'Draft', value: 'The Q2 strategy needs a clearer north star. Right now the team is pulling in three directions — we need to crystallise the primary bet before the offsite...' },
        { type: 'tags', label: 'Suggested Tags', items: ['Strategy', 'Alignment', 'Leadership', 'Q2'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Relates to: "Team Vision" thread',       sub: '3 semantic matches found',         badge: '⟳' },
          { icon: 'eye',    title: 'Theme: "Alignment" appears 9× this week', sub: 'Your top theme this sprint',       badge: '◈' },
          { icon: 'plus',   title: 'Suggest: "Q2 Alignment" cluster',         sub: 'AI recommends grouping these',     badge: '⊕' },
        ]},
      ],
    },
    {
      id: 'threads', label: 'Threads',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',    value: '12' },
          { label: 'Archived',  value: '8' },
          { label: 'Avg Depth', value: '6.2' },
        ]},
        { type: 'progress', items: [
          { label: 'Q2 Product Strategy (3,820w)',   pct: 76 },
          { label: 'UX Research Synthesis (7,200w)', pct: 91 },
          { label: 'Team Retro Feb (1,540w)',        pct: 52 },
          { label: 'Personal OKRs (940w)',           pct: 28 },
          { label: 'Hiring Matrix (620w)',           pct: 18 },
        ]},
        { type: 'list', items: [
          { icon: 'star',    title: 'Q2 Product Strategy',    sub: '8 entries · 12 days active',  badge: '76%' },
          { icon: 'search',  title: 'UX Research Synthesis',  sub: '14 entries · 21 days active', badge: '91%' },
          { icon: 'chart',   title: 'Team Retro — Feb',       sub: '5 entries · 6 days active',   badge: '52%' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'AI Weekly Digest', value: '7 sessions', sub: 'Week of 24 March · 3,840 words written' },
        { type: 'progress', items: [
          { label: 'Alignment', pct: 84 },
          { label: 'Strategy',  pct: 68 },
          { label: 'Prioritisation', pct: 52 },
          { label: 'Team health', pct: 32 },
          { label: 'Process', pct: 24 },
        ]},
        { type: 'text', label: 'AI Synthesis', value: 'You consistently circle back to alignment and prioritisation. The thread "Q2 Strategy" is your most active — consider a structured distillation session this week.' },
        { type: 'list', items: [
          { icon: 'share', title: 'Q2 Strategy ⟷ Team Retro',      sub: '88% semantic overlap',   badge: '88%' },
          { icon: 'share', title: 'Personal OKRs ⟷ Q2 Strategy',   sub: '62% semantic overlap',   badge: '62%' },
        ]},
      ],
    },
    {
      id: 'archive', label: 'Archive',
      content: [
        { type: 'metric', label: 'Total Archive', value: '284 entries', sub: '14 months · 12 active threads' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Q2 north star — thinking out loud',      sub: 'Today · 47w · Strategy',        badge: '●' },
          { icon: 'calendar', title: 'Retro debrief — what we learned',        sub: 'Mar 27 · 312w · Retro',         badge: '○' },
          { icon: 'calendar', title: 'User interview #6 synthesis',            sub: 'Mar 26 · 620w · Research',      badge: '○' },
          { icon: 'calendar', title: 'Morning pages — team structure clarity', sub: 'Mar 25 · 210w · Personal',      badge: '○' },
          { icon: 'calendar', title: 'Engineering capacity vs ambition',       sub: 'Mar 24 · 380w · Strategy',      badge: '○' },
          { icon: 'calendar', title: 'End of month — what moved forward?',     sub: 'Feb 28 · 480w · Retro',         badge: '○' },
        ]},
        { type: 'tags', label: 'Filter by Tag', items: ['Strategy', 'Retro', 'Research', 'Personal', 'Design', 'Process'] },
      ],
    },
  ],

  nav: [
    { id: 'studio',   label: 'Studio',   icon: 'home'     },
    { id: 'capture',  label: 'Capture',  icon: 'plus'     },
    { id: 'threads',  label: 'Threads',  icon: 'layers'   },
    { id: 'insights', label: 'Insights', icon: 'activity' },
    { id: 'archive',  label: 'Archive',  icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'weft-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
