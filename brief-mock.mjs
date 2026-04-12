import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Brief',
  tagline:   'Design specs that write themselves',
  archetype: 'productivity-design-tools-ai',
  palette: {                        // DARK theme
    bg:      '#1A1714',
    surface: '#252118',
    text:    '#F7F4EE',
    accent:  '#E07040',
    accent2: '#6B8FFF',
    muted:   'rgba(247,244,238,0.38)',
  },
  lightPalette: {                   // LIGHT theme (primary)
    bg:      '#F7F4EE',
    surface: '#FFFFFE',
    text:    '#1A1714',
    accent:  '#C4521C',
    accent2: '#3B6EF8',
    muted:   'rgba(26,23,20,0.42)',
  },
  screens: [
    {
      id: 'specs',
      label: 'Specs',
      content: [
        { type: 'metric', label: 'Spec Coverage', value: '74%', sub: '37 of 50 sections complete across 5 docs' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '3' },
          { label: 'In Review', value: '1' },
          { label: 'AI Draft', value: '2' },
        ]},
        { type: 'text', label: 'AI Alert', value: '3 specs need attention — edge cases detected in S-001, S-003' },
        { type: 'list', items: [
          { icon: 'layers', title: 'S-001 Onboarding Flow',      sub: 'Maya · 2h ago · 72% done',   badge: 'Active' },
          { icon: 'layers', title: 'S-002 Navigation System',    sub: 'Kai · 1d ago · 89% done',    badge: 'Review' },
          { icon: 'zap',    title: 'S-003 Component Library v2', sub: 'AI generated · 41% done',    badge: 'AI' },
          { icon: 'check',  title: 'S-004 Empty States',         sub: 'You · 3d ago · 100% done',   badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Flows coverage',  pct: 82 },
          { label: 'States coverage', pct: 67 },
          { label: 'Errors coverage', pct: 45 },
          { label: 'Copy coverage',   pct: 91 },
        ]},
      ],
    },
    {
      id: 'brief',
      label: 'Brief',
      content: [
        { type: 'metric', label: 'S-001 Onboarding Flow', value: '72%', sub: '10 of 14 sections complete · Updated 2h ago' },
        { type: 'text', label: 'AI Detected', value: '2 missing edge cases — empty state + timeout not yet specified' },
        { type: 'list', items: [
          { icon: 'check',    title: '01 Overview & Goals',   sub: 'Complete',     badge: '✓' },
          { icon: 'check',    title: '02 User Journey Map',   sub: 'Complete',     badge: '✓' },
          { icon: 'check',    title: '03 Screen Flows',       sub: 'Complete',     badge: '✓' },
          { icon: 'activity', title: '04 Component States',   sub: '68% done',     badge: '…' },
          { icon: 'zap',      title: '05 Error Handling',     sub: 'AI draft 22%', badge: 'AI' },
          { icon: 'alert',    title: '06 Copy & Microcopy',   sub: 'Not started',  badge: '!' },
        ]},
        { type: 'tags', label: 'Spec Tags', items: ['Onboarding', 'Flow', 'Mobile', 'v2.0', 'MVP'] },
        { type: 'text', label: 'Recent Comments', value: '3 open comments from Maya, Kai, and you on this spec' },
      ],
    },
    {
      id: 'components',
      label: 'Components',
      content: [
        { type: 'metric', label: 'Component Coverage', value: '75%', sub: '36 of 48 components fully specced' },
        { type: 'metric-row', items: [
          { label: 'Specced', value: '36' },
          { label: 'AI draft', value: '8' },
          { label: 'Empty', value: '12' },
        ]},
        { type: 'text', label: 'Warning', value: '12 components have no spec — AI can generate first drafts instantly' },
        { type: 'list', items: [
          { icon: 'check',  title: 'C-014 Button',      sub: '5 states · fully specced',  badge: '100%' },
          { icon: 'activity',title: 'C-022 Input Field', sub: '8 states · 6 specced',     badge: '75%' },
          { icon: 'check',  title: 'C-031 Modal',       sub: '4 states · fully specced',  badge: '100%' },
          { icon: 'alert',  title: 'C-038 Toast',       sub: '6 states · 2 specced',      badge: '33%' },
          { icon: 'alert',  title: 'C-047 Data Table',  sub: '7 states · not started',    badge: '0%' },
        ]},
        { type: 'progress', items: [
          { label: 'Button',      pct: 100 },
          { label: 'Input Field', pct: 75  },
          { label: 'Modal',       pct: 100 },
          { label: 'Toast',       pct: 33  },
          { label: 'Data Table',  pct: 0   },
        ]},
      ],
    },
    {
      id: 'review',
      label: 'Review',
      content: [
        { type: 'metric', label: 'Pending Reviews', value: '2', sub: '1 awaiting your approval · 1 you sent out' },
        { type: 'text', label: 'Awaiting Your Review', value: 'S-002 Navigation System sent by Kai Chen · 1 day ago' },
        { type: 'list', items: [
          { icon: 'eye',    title: 'S-002 Navigation System',   sub: 'Kai Chen · 1d ago',  badge: 'Pending' },
          { icon: 'check',  title: 'S-001 Onboarding Flow',     sub: 'You approved · 3d',  badge: 'Done' },
          { icon: 'alert',  title: 'S-003 Component Library',   sub: 'Maya: changes req.', badge: 'Changes' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Approved', value: '8' },
          { label: 'Pending',  value: '2' },
          { label: 'Changes',  value: '3' },
        ]},
        { type: 'tags', label: 'Reviewers', items: ['Maya', 'Kai', 'Alex', 'Leo', '+ Invite'] },
      ],
    },
    {
      id: 'stream',
      label: 'Stream',
      content: [
        { type: 'metric', label: "Today's Activity", value: '7', sub: '3 AI suggestions · 3 edits · 1 review request' },
        { type: 'text', label: 'AI Digest', value: 'S-001 has 2 new AI-detected edge cases ready for review' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'AI: 2 edge cases added',      sub: 'S-001 · 11:02 AM',        badge: 'AI' },
          { icon: 'check',    title: 'Section 02 completed',        sub: 'Maya · S-001 · 10:44 AM', badge: '✓' },
          { icon: 'eye',      title: 'Review requested',            sub: 'Kai → S-002 · 9:31 AM',   badge: '◎' },
          { icon: 'layers',   title: 'Component C-048 added',       sub: 'Needs spec · 8:15 AM',    badge: '!' },
          { icon: 'check',    title: 'S-001 approved by Kai',       sub: 'Yesterday · Sections 1–3',badge: '✓' },
          { icon: 'zap',      title: 'AI draft generated: S-003',   sub: 'Yesterday',               badge: 'AI' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'AI', 'You', 'Team', 'Reviews'] },
      ],
    },
  ],
  nav: [
    { id: 'specs',      label: 'Specs',   icon: 'layers'   },
    { id: 'brief',      label: 'Brief',   icon: 'list'     },
    { id: 'components', label: 'Comps',   icon: 'grid'     },
    { id: 'review',     label: 'Review',  icon: 'eye'      },
    { id: 'stream',     label: 'Stream',  icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'brief-specs-mock', 'Brief — Interactive Mock');
console.log('Mock live at:', result.url);
