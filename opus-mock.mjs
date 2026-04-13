import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'OPUS',
  tagline:   'The portfolio journal for serious designers',
  archetype: 'portfolio-creative',

  palette: {               // Dark theme (required)
    bg:      '#1C1917',
    surface: '#24201E',
    text:    '#FAF8F4',
    accent:  '#B5673E',
    accent2: '#3D5A80',
    muted:   'rgba(250,248,244,0.4)',
  },
  lightPalette: {          // Light theme (warm cream editorial)
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#B5673E',
    accent2: '#3D5A80',
    muted:   'rgba(28,25,23,0.4)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Active Projects', value: '4', sub: 'Brand, UI, Type, Print' },
        { type: 'metric-row', items: [
          { label: 'Week Views', value: '1,247' },
          { label: 'Contacts', value: '23' },
          { label: 'Complete', value: '78%' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Helios Brand Identity', sub: 'Client · 78% done', badge: '●' },
          { icon: 'grid',   title: 'Orbital Dashboard UI',  sub: 'Client · 42% done', badge: '●' },
          { icon: 'star',   title: 'Editorial Typeface',    sub: 'Personal · 23% done', badge: '○' },
        ]},
        { type: 'progress', items: [
          { label: 'Helios Brand Identity', pct: 78 },
          { label: 'Orbital Dashboard', pct: 42 },
          { label: 'Typeface Project', pct: 23 },
        ]},
        { type: 'text', label: 'Recent', value: 'Added 3 case studies to Helios · 2h ago' },
      ],
    },
    {
      id: 'project', label: 'Project',
      content: [
        { type: 'metric', label: 'Helios Brand Identity', value: '78%', sub: 'Helios Studio · In Progress' },
        { type: 'tags', label: 'Project Tags', items: ['Branding', 'Identity', 'Typography', 'Print-ready'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Primary wordmark', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Brand colour system', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Typography pairing', sub: 'Completed', badge: '✓' },
          { icon: 'star',  title: 'Icon & symbol set', sub: 'In progress', badge: '○' },
          { icon: 'eye',   title: 'Brand guidelines PDF', sub: 'Pending', badge: '○' },
        ]},
        { type: 'text', label: 'Process Note', value: '"Client wants warmth but authority — the terracotta accent strikes that balance between approachable and premium."' },
        { type: 'progress', items: [{ label: 'Overall completion', pct: 78 }] },
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'metric', label: 'Design Journal', value: '28', sub: 'entries written' },
        { type: 'list', items: [
          { icon: 'heart',    title: 'On Negative Space', sub: 'April 10 · 4 min read', badge: '✦' },
          { icon: 'eye',      title: 'Typography as personality', sub: 'April 7 · 6 min read', badge: '' },
          { icon: 'activity', title: 'Working with difficult clients', sub: 'April 4 · 8 min read', badge: '' },
          { icon: 'star',     title: 'The brief is never the brief', sub: 'March 30 · 5 min read', badge: '' },
        ]},
        { type: 'tags', label: 'Mood Tags', items: ['reflective', 'theory', 'craft', 'critique'] },
        { type: 'text', label: 'Featured Excerpt', value: '"The most powerful design decisions are often what you choose to remove. White space is not empty — it is the breath between notes that makes music meaningful."' },
      ],
    },
    {
      id: 'gallery', label: 'Gallery',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Pieces', value: '28' },
          { label: 'Public', value: '8' },
          { label: 'Archived', value: '20' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Branding', 'UI', 'Typography', 'Print'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Helios Identity System',  sub: 'Branding · 2026', badge: '★' },
          { icon: 'grid',   title: 'Orbital Dashboard UI',    sub: 'UI Design · 2026', badge: '★' },
          { icon: 'star',   title: 'Canela Type Study',       sub: 'Typography · 2025', badge: '' },
          { icon: 'share',  title: 'Almanac Print Series',    sub: 'Print · 2025', badge: '' },
        ]},
        { type: 'text', label: 'Gallery Note', value: 'Curated to show range across brand, UI, and typographic work — visible to portfolio visitors.' },
      ],
    },
    {
      id: 'share', label: 'Share',
      content: [
        { type: 'metric', label: 'Portfolio Live', value: '1,247', sub: 'views this week' },
        { type: 'metric-row', items: [
          { label: 'Unique Visitors', value: '84' },
          { label: 'Contacts', value: '23' },
          { label: 'Rating', value: '4.9★' },
        ]},
        { type: 'list', items: [
          { icon: 'eye',      title: 'Selected Work', sub: '8 items · visible', badge: 'ON' },
          { icon: 'user',     title: 'About & Process', sub: '1 page · visible', badge: 'ON' },
          { icon: 'layers',   title: 'Case Studies', sub: '4 items · hidden', badge: 'OFF' },
          { icon: 'calendar', title: 'Archive', sub: '20 items · hidden', badge: 'OFF' },
        ]},
        { type: 'text', label: 'Your URL', value: 'opus.portfolio/aaronchrisfield — Copy or share your QR code to send to clients.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Work',    icon: 'layers' },
    { id: 'journal',   label: 'Journal', icon: 'heart' },
    { id: 'gallery',   label: 'Gallery', icon: 'grid' },
    { id: 'share',     label: 'Share',   icon: 'share' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'opus-mock', 'OPUS — Interactive Portfolio Journal Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/opus-mock`);
