import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ARCH',
  tagline:   'Architecture studio · project & commission tracker',
  archetype: 'architecture-studio',

  palette: {
    // Dark palette required — warm inverted version for dark mode
    bg:      '#1A1612',
    surface: '#221F1A',
    text:    '#F0EBE4',
    accent:  '#C4614A',
    accent2: '#4A7B6F',
    muted:   'rgba(240,235,228,0.40)',
  },

  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1E1A16',
    accent:  '#C4614A',
    accent2: '#4A7B6F',
    muted:   'rgba(30,26,22,0.40)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Active Commissions', value: '7', sub: 'Architecture studio projects' },
        { type: 'metric-row', items: [
          { label: 'In Progress', value: '4' },
          { label: 'Under Review', value: '2' },
          { label: 'Completed YTD', value: '18' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Villa Cortile',  sub: 'Planning permit approved · 2h ago',  badge: 'Permit' },
          { icon: 'layers',   title: 'Museum Annex',   sub: 'New render batch uploaded · 5h ago', badge: 'Renders' },
          { icon: 'eye',      title: 'The Crescent',   sub: 'Client feedback received · 1d ago',  badge: 'Review' },
          { icon: 'activity', title: 'Park Pavilion',  sub: 'Structural drawings updated · 2d ago',badge: 'Drawings' },
        ]},
        { type: 'progress', items: [
          { label: 'Lucia M.', pct: 85 },
          { label: 'Marco F.', pct: 60 },
          { label: 'Elena R.', pct: 90 },
        ]},
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Residential', 'Civic', 'Commercial'] },
        { type: 'list', items: [
          { icon: 'home',   title: 'Villa Cortile',  sub: 'Residential · Rome — 72% complete',  badge: '72%' },
          { icon: 'layers', title: 'Museum Annex',   sub: 'Civic · Milan — 45% complete',       badge: '45%' },
          { icon: 'star',   title: 'The Crescent',   sub: 'Residential · Florence — 88% done',  badge: '88%' },
          { icon: 'map',    title: 'Park Pavilion',  sub: 'Civic · Bologna — 28% complete',     badge: '28%' },
        ]},
      ],
    },
    {
      id: 'detail',
      label: 'Project Detail',
      content: [
        { type: 'metric', label: 'Museum Annex', value: '45%', sub: 'Design Development phase' },
        { type: 'metric-row', items: [
          { label: 'Floor Area', value: '2,800 m²' },
          { label: 'Budget', value: '€4.2M' },
        ]},
        { type: 'progress', items: [
          { label: 'Schematic Design', pct: 100 },
          { label: 'Design Development', pct: 45 },
          { label: 'Construction Docs', pct: 0 },
        ]},
        { type: 'tags', label: 'Documents', items: ['Plans', 'Sections', 'Elevations', 'Renders'] },
        { type: 'text', label: 'Site', value: 'Civic · Milan · Ground Floor + Annex' },
      ],
    },
    {
      id: 'schedule',
      label: 'Schedule',
      content: [
        { type: 'metric', label: 'April 2026', value: 'Week 15', sub: '6 upcoming milestones' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'DD Drawings Submission',      sub: 'Museum Annex · Apr 14',  badge: 'Due' },
          { icon: 'user',     title: 'Structural Engineer Review',   sub: 'Villa Cortile · Apr 17', badge: 'Meeting' },
          { icon: 'check',    title: 'Client Design Sign-off',       sub: 'The Crescent · Apr 21',  badge: 'Approval' },
          { icon: 'chart',    title: 'Budget Reconciliation',        sub: 'Museum Annex · Apr 24',  badge: 'Finance' },
          { icon: 'activity', title: 'Schematic Review Workshop',    sub: 'Park Pavilion · Apr 28', badge: 'Workshop' },
        ]},
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Capacity', value: '68%' },
          { label: 'Avg Load', value: '4.2' },
          { label: 'On Leave', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Lucia Marchetti',  sub: 'Principal Architect · 3 projects',    badge: '●' },
          { icon: 'user', title: 'Marco Ferretti',   sub: 'Associate · Residential · 2 projects', badge: '●' },
          { icon: 'user', title: 'Elena Russo',      sub: 'Associate · Civic · 2 projects',       badge: '●' },
          { icon: 'user', title: 'Tommaso Conti',    sub: 'Senior Architect · 1 project',         badge: '●' },
          { icon: 'user', title: 'Sofia Bianchi',    sub: 'Junior Architect · 1 project',         badge: '●' },
          { icon: 'user', title: 'Davide Leone',     sub: 'Technical Director · 3 projects',      badge: '●' },
        ]},
      ],
    },
    {
      id: 'brief',
      label: 'Commission Brief',
      content: [
        { type: 'metric', label: 'New Brief · 2026', value: 'Residential', sub: 'Private commission' },
        { type: 'list', items: [
          { icon: 'user',     title: 'Client',    sub: 'Rossi Family Estate',          badge: '→' },
          { icon: 'map',      title: 'Location',  sub: 'Umbria, Italy',                badge: '→' },
          { icon: 'home',     title: 'Programme', sub: 'Private Villa · 5 bed',        badge: '→' },
          { icon: 'layers',   title: 'Site Area', sub: '3,200 m² · Sloping terrain',   badge: '→' },
          { icon: 'chart',    title: 'Budget',    sub: '€2.8M indicative',             badge: '→' },
          { icon: 'calendar', title: 'Deadline',  sub: 'Schematic by Sep 2026',        badge: '→' },
        ]},
        { type: 'tags', label: 'Action', items: ['Accept Brief', 'Pass'] },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'projects',  label: 'Projects',  icon: 'layers' },
    { id: 'detail',    label: 'Detail',    icon: 'grid' },
    { id: 'schedule',  label: 'Schedule',  icon: 'calendar' },
    { id: 'team',      label: 'Team',      icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'arch-mock', 'ARCH — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/arch-mock`);
