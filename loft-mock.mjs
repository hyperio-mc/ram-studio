import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LOFT',
  tagline:   'Studio project workspace',
  archetype: 'studio-management',

  palette: {           // dark theme (required)
    bg:      '#1C1917',
    surface: '#292524',
    text:    '#F5F0EB',
    accent:  '#C2714A',
    accent2: '#4A7C6F',
    muted:   'rgba(245,240,235,0.45)',
  },

  lightPalette: {      // light theme
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C2714A',
    accent2: '#4A7C6F',
    muted:   'rgba(28,25,23,0.45)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Monthly Revenue', value: '£42,000', sub: '↑ 12% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '8' },
          { label: 'Due Soon', value: '3' },
          { label: 'Overdue', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Verdana Brand Identity', sub: 'Due Apr 14 · 68% complete', badge: '68%' },
          { icon: 'chart', title: 'Opal Website Redesign', sub: 'Due Apr 22 · At Risk', badge: '34%' },
          { icon: 'star', title: 'Milo Campaign Kit', sub: 'Due Apr 30 · On Track', badge: '82%' },
        ]},
        { type: 'text', label: 'Next Deadline', value: 'Verdana final assets — Mon Apr 14, 5 files outstanding' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '8' },
          { label: 'On Hold', value: '2' },
          { label: 'Done', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Verdana Brand Identity', sub: 'Branding · £8,400 · Apr 14', badge: 'Active' },
          { icon: 'alert', title: 'Opal Website Redesign', sub: 'Digital · £14,200 · Apr 22', badge: 'Risk' },
          { icon: 'check', title: 'Milo Campaign Kit', sub: 'Marketing · £5,600 · Apr 30', badge: 'Active' },
          { icon: 'layers', title: 'Nova Annual Report', sub: 'Editorial · £11,000 · May 6', badge: 'Active' },
          { icon: 'filter', title: 'Prism Packaging', sub: 'Print · £6,800 · May 18', badge: 'Hold' },
        ]},
      ],
    },
    {
      id: 'brief',
      label: 'Brief',
      content: [
        { type: 'metric', label: 'Verdana Brand Identity', value: '68%', sub: 'On Track · Due Apr 14' },
        { type: 'text', label: 'Client Context', value: 'Verdana Inc. is a sustainable materials startup rebranding after Series A. Full visual identity reflecting circular design principles.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Primary + secondary logo suite', sub: 'In progress', badge: '→' },
          { icon: 'check', title: 'Brand guidelines (40pp PDF)', sub: 'In progress', badge: '→' },
          { icon: 'check', title: 'Business stationery pack', sub: 'Not started', badge: '○' },
          { icon: 'check', title: 'Social media templates', sub: 'Not started', badge: '○' },
        ]},
        { type: 'tags', label: 'Creative Direction', items: ['Earthy', 'Premium', 'Minimal', 'Serif Type'] },
      ],
    },
    {
      id: 'assets',
      label: 'Assets',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Files', value: '24' },
          { label: 'This Week', value: '7' },
          { label: 'Size', value: '128 MB' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Logo Primary.svg', sub: 'SVG · 24 KB · Updated today', badge: 'SVG' },
          { icon: 'layers', title: 'Brand Guide.pdf', sub: 'PDF · 3.2 MB · Updated yesterday', badge: 'PDF' },
          { icon: 'grid', title: 'Patterns.zip', sub: 'ZIP · 12 MB · Added this week', badge: 'ZIP' },
          { icon: 'layers', title: 'Stationery.pdf', sub: 'PDF · 8.1 MB · Added this week', badge: 'PDF' },
        ]},
        { type: 'tags', label: 'File Types', items: ['SVG', 'PDF', 'ZIP', 'KEY', 'PNG'] },
      ],
    },
    {
      id: 'schedule',
      label: 'Schedule',
      content: [
        { type: 'metric', label: 'Today — Apr 13', value: '5', sub: 'meetings and milestones' },
        { type: 'list', items: [
          { icon: 'user', title: 'Verdana Client Presentation', sub: '9:00 · 60 min', badge: '9am' },
          { icon: 'activity', title: 'Milo Asset Review', sub: '11:30 · 45 min', badge: '11:30' },
          { icon: 'message', title: 'Opal Status Call', sub: '14:00 · 30 min', badge: '2pm' },
          { icon: 'check', title: 'Nova Copy Sign-Off', sub: '15:00 · 90 min', badge: '3pm' },
          { icon: 'user', title: 'Team Check-in', sub: '17:00 · 30 min', badge: '5pm' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Monthly Revenue', value: '£42,000', sub: '↑ 12% · Best month this quarter' },
        { type: 'metric-row', items: [
          { label: 'Margin', value: '62%' },
          { label: 'Hours', value: '184h' },
          { label: 'Rating', value: '4.9★' },
        ]},
        { type: 'progress', items: [
          { label: 'Jana K.', pct: 85 },
          { label: 'Reza M.', pct: 62 },
          { label: 'Theo B.', pct: 94 },
          { label: 'Safi L.', pct: 48 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Verdana Inc.', sub: 'Top client · £12,400 revenue', badge: '#1' },
          { icon: 'star', title: 'Opal Agency', sub: '£9,800 · 3 active projects', badge: '#2' },
          { icon: 'star', title: 'Milo Beverages', sub: '£7,200 · 1 active project', badge: '#3' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',     icon: 'home' },
    { id: 'projects',  label: 'Projects', icon: 'list' },
    { id: 'brief',     label: 'Brief',    icon: 'layers' },
    { id: 'assets',    label: 'Assets',   icon: 'grid' },
    { id: 'schedule',  label: 'Schedule', icon: 'calendar' },
    { id: 'insights',  label: 'Insights', icon: 'chart' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'loft-mock', 'LOFT — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/loft-mock`);
