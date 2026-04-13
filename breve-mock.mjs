import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'BREVE',
  tagline:   'Creative briefs, client sign-off, done.',
  archetype: 'creative-workflow',
  palette: {
    bg:      '#1A1410',
    surface: '#231C17',
    text:    '#F5EDE5',
    accent:  '#C05A2A',
    accent2: '#4A7C6F',
    muted:   'rgba(245,237,229,0.4)',
  },
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1714',
    accent:  '#C05A2A',
    accent2: '#4A7C6F',
    muted:   'rgba(28,23,20,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric-row', items: [
          { label: 'Pending', value: '4' },
          { label: 'Approved', value: '12' },
          { label: 'Revisions', value: '2' },
          { label: 'Satisfaction', value: '98%' },
        ]},
        { type: 'text', label: 'Active Briefs', value: 'Spring Campaign — Ecohaus · In Review' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Spring Campaign — Ecohaus', sub: 'Ecohaus GmbH · In Review', badge: '●' },
          { icon: 'check',    title: 'Product Launch Deck',       sub: 'Fable Foods · Approved',  badge: '✓' },
          { icon: 'alert',    title: 'Social Media Refresh',      sub: 'Marble Co. · Revisions',  badge: '!' },
        ]},
        { type: 'progress', items: [
          { label: 'Client Satisfaction', pct: 98 },
          { label: 'Briefs Used (4/10)',  pct: 40 },
        ]},
      ],
    },
    {
      id: 'builder',
      label: 'Brief Builder',
      content: [
        { type: 'metric', label: 'Step 1 of 4', value: 'Basics', sub: 'Project name, client, deadline' },
        { type: 'tags', label: 'Progress', items: ['Basics', 'Goals', 'Assets', 'Review'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Project Name',    sub: 'Spring Campaign — Ecohaus', badge: '✓' },
          { icon: 'user',  title: 'Client',          sub: 'Ecohaus GmbH',              badge: '✓' },
          { icon: 'calendar', title: 'Deadline',     sub: 'April 30, 2026',            badge: '✓' },
        ]},
        { type: 'tags', label: 'Deliverables', items: ['Social Pack', 'Brand Film', 'Key Visual'] },
        { type: 'text', label: 'Description', value: 'Seasonal campaign for Spring 2026 product line targeting eco-conscious millennials. Focus on sustainability messaging and warm natural visuals.' },
      ],
    },
    {
      id: 'review',
      label: 'Client Review',
      content: [
        { type: 'metric', label: 'Feedback Thread', value: '3', sub: 'comments on Spring Campaign' },
        { type: 'list', items: [
          { icon: 'message', title: 'Ana Weber · 2h ago',  sub: 'Can we push the palette warmer — more terracotta?', badge: '●' },
          { icon: 'message', title: 'Rakis D. · 1h ago',   sub: 'Updating to SW Worn Brick + Natural Linen. Sharing swatch set.', badge: '●' },
          { icon: 'check',   title: 'Ana Weber · 30m ago', sub: 'Perfect. Approved 👏', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Brief Completion', pct: 100 },
          { label: 'Client Sign-off',  pct: 100 },
        ]},
        { type: 'tags', label: 'Sections', items: ['Overview', 'Goals', 'Assets', 'Timeline'] },
      ],
    },
    {
      id: 'assets',
      label: 'Asset Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Files', value: '14' },
          { label: 'Storage', value: '3.8G' },
          { label: 'Shared', value: '6' },
        ]},
        { type: 'list', items: [
          { icon: 'star',   title: 'Ecohaus_Logo_Final.svg', sub: 'SVG · 2 versions · Logo',   badge: '↓' },
          { icon: 'eye',    title: 'Hero_Photo_01.jpg',      sub: 'JPG · 4.2 MB · Photo',      badge: '↓' },
          { icon: 'layers', title: 'Brand_Type.ttf',         sub: 'FONT · Typography',          badge: '↓' },
          { icon: 'share',  title: 'Brief_v2.pdf',           sub: 'DOC · Client brief',         badge: '↓' },
        ]},
        { type: 'tags', label: 'File Types', items: ['All', 'Logos', 'Photos', 'Fonts', 'Docs'] },
        { type: 'progress', items: [{ label: 'Storage used (3.8 / 10 GB)', pct: 38 }] },
      ],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: [
        { type: 'metric', label: 'Next Milestone', value: 'Apr 17', sub: 'Mood-board delivery — 4 days away' },
        { type: 'list', items: [
          { icon: 'check',    title: 'Kickoff call',           sub: 'Apr 10 · Done',                  badge: '✓' },
          { icon: 'check',    title: 'Brief approved',         sub: 'Apr 13 · Done',                  badge: '✓' },
          { icon: 'activity', title: 'Mood-board delivery',    sub: 'Apr 17 · Due in 4 days',         badge: '!' },
          { icon: 'zap',      title: 'First design round',     sub: 'Apr 22 · Upcoming',              badge: '·' },
          { icon: 'alert',    title: 'Client revision window', sub: 'Apr 26 · Upcoming',              badge: '·' },
          { icon: 'star',     title: 'Final delivery',         sub: 'Apr 30 · Deadline',              badge: '·' },
        ]},
        { type: 'progress', items: [{ label: 'Project progress', pct: 33 }] },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      content: [
        { type: 'metric', label: 'Studio Plan · €29/mo', value: 'Studio', sub: 'Renews May 1, 2026' },
        { type: 'progress', items: [{ label: 'Briefs used (4 of 10)', pct: 40 }] },
        { type: 'list', items: [
          { icon: 'settings', title: 'Studio Name', sub: 'Rakis Design Studio', badge: '›' },
          { icon: 'map',      title: 'Time Zone',   sub: 'UTC+2, Berlin',       badge: '›' },
          { icon: 'filter',   title: 'Currency',    sub: 'EUR €',               badge: '›' },
        ]},
        { type: 'tags', label: 'Notifications on', items: ['Comments', 'Approvals', 'Deadlines'] },
        { type: 'text', label: 'Signed in as', value: 'rakis@rakisdesign.com' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home'     },
    { id: 'builder',   label: 'Briefs',  icon: 'list'     },
    { id: 'review',    label: 'Review',  icon: 'star'     },
    { id: 'assets',    label: 'Assets',  icon: 'layers'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'breve-mock', 'BREVE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/breve-mock`);
