import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VAULT',
  tagline:   'Your most important thoughts, held in darkness.',
  archetype: 'private-archive-dark',

  palette: {
    bg:      '#030303',
    surface: '#0D0C0B',
    text:    '#E6E1D6',
    accent:  '#FFE566',
    accent2: '#2DD4BF',
    muted:   'rgba(230,225,214,0.45)',
  },
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FDFCF9',
    text:    '#1A1810',
    accent:  '#A87D00',
    accent2: '#0F8A7A',
    muted:   'rgba(26,24,16,0.45)',
  },

  nav: [
    { label: 'Entries',  icon: '◈' },
    { label: 'Open',     icon: '✦' },
    { label: 'Write',    icon: '✏' },
    { label: 'Search',   icon: '⌕' },
    { label: 'Security', icon: '⬡' },
  ],

  screens: [
    {
      id:          'entries',
      name:        'Entries',
      description: 'Archive list — 12 sealed entries as typographic events with category tags and timestamps',
      components: [
        { type: 'header', title: 'VAULT', subtitle: '12 sealed', titleStyle: 'mono-caps-lg', star: true },
        { type: 'section-label', text: 'Entries', count: '12 sealed' },
        { type: 'entry-list', items: [
          { title: 'On loneliness and distance', date: '2026.04.01', tag: 'REFLECT', locked: true,  tagColor: 'accent'  },
          { title: 'The Lisbon conversation',    date: '2026.03.28', tag: 'MEMORY',  locked: true,  tagColor: 'default' },
          { title: 'Things I will not say',      date: '2026.03.22', tag: 'DRAFT',   locked: false, tagColor: 'muted'   },
          { title: 'Architecture of trust',      date: '2026.03.15', tag: 'REFLECT', locked: true,  tagColor: 'accent'  },
          { title: 'Inventory of fears',         date: '2026.03.08', tag: 'LIST',    locked: false, tagColor: 'accent2' },
          { title: 'Letter to 2019 self',        date: '2026.02.14', tag: 'LETTER',  locked: true,  tagColor: 'default' },
        ]},
        { type: 'bottom-strip', left: '⊕ NEW ENTRY', leftColor: 'accent', right: '04.01 · 08:56:34' },
      ],
    },
    {
      id:          'open',
      name:        'Open',
      description: 'Single entry — giant display title, prose body, mono timestamp',
      components: [
        { type: 'back-row', left: '← VAULT', right: '◈ SEALED', rightColor: 'accent' },
        { type: 'display-title', lines: ['On loneliness', 'and distance.'], size: 'xl' },
        { type: 'divider' },
        { type: 'meta-row', date: '2026.04.01 · 23:14', tag: 'REFLECT', tagColor: 'accent' },
        { type: 'divider' },
        { type: 'prose', paragraphs: [
          'There is a particular quality to the silence between people who once spoke every thought aloud.',
          'I have been cataloguing the distance. Not in miles — in the number of things I no longer mention.',
          'If distance is the measure of what we withhold, then proximity must be the practice of disclosure.',
        ]},
        { type: 'bottom-strip', left: '143 words', right: '✏ EDIT  ⊗ DELETE', rightColor: 'muted' },
      ],
    },
    {
      id:          'write',
      name:        'Write',
      description: 'Compose interface — category tags, ghost title, candle cursor blink',
      components: [
        { type: 'action-row', left: '✕', right: 'SEAL', rightStyle: 'accent-pill' },
        { type: 'meta-label', text: '2026.04.01 · Now' },
        { type: 'category-pills', items: ['REFLECT', 'MEMORY', 'LETTER', 'LIST', 'DRAFT'], active: 0 },
        { type: 'divider' },
        { type: 'title-input', placeholder: 'Title.', cursor: true },
        { type: 'divider' },
        { type: 'body-input', placeholder: 'Begin anywhere. This is yours alone.\n\nWrite whatever wants to surface.\nNo one is watching.\n\n▌' },
        { type: 'format-toolbar', items: ['B', 'I', '"', '—', '☰', '✦'] },
        { type: 'bottom-strip', left: '0 words', right: '04.01 · 09:11:02' },
      ],
    },
    {
      id:          'search',
      name:        'Search',
      description: 'Full-text search across sealed entries — candle-yellow match highlights',
      components: [
        { type: 'header', title: 'Search', star: true },
        { type: 'search-bar', value: 'loneliness', withCursor: true },
        { type: 'divider' },
        { type: 'result-count', text: '3 RESULTS' },
        { type: 'search-results', items: [
          { title: 'On loneliness and distance',  date: '2026.04.01', match: '"...particular quality to the silence..."', locked: true  },
          { title: 'The Lisbon conversation',     date: '2026.03.28', match: '"...when loneliness becomes familiar..."',  locked: true  },
          { title: 'Architecture of trust',       date: '2026.03.15', match: '"...loneliness as a structural force..."',  locked: true  },
        ]},
        { type: 'bottom-strip', left: 'RECENT: Lisbon  fears  letter', right: '04.01 · 09:18:44' },
      ],
    },
    {
      id:          'security',
      name:        'Security',
      description: 'AES-256 lock status, biometric toggles, decoy mode, danger zone',
      components: [
        { type: 'header', title: 'Security', star: true, starColor: 'accent2' },
        { type: 'status-hero', icon: '⬡', label: 'VAULT SECURED', sub: 'AES-256 · all 12 entries encrypted', color: 'accent2' },
        { type: 'section-label', text: 'Authentication' },
        { type: 'toggle-list', items: [
          { label: 'Face ID',           sub: 'Instant unlock on open',          on: true,  color: 'accent2' },
          { label: 'Passcode fallback', sub: '6-digit code if biometric fails',  on: true,  color: 'accent'  },
          { label: 'Auto-lock',         sub: 'After 30 seconds of inactivity',   on: true,  color: 'accent2' },
          { label: 'Decoy mode',        sub: 'Show empty vault if forced',        on: false, color: 'danger'  },
        ]},
        { type: 'danger-row', label: 'Wipe all entries', sub: 'Permanently destroy all contents' },
        { type: 'action-row-plain', label: 'Export encrypted backup', sub: '.vault file · AES-256', arrowColor: 'accent' },
        { type: 'bottom-strip', left: 'LAST UNLOCKED\n04.01 · 09:11:02', right: '04.01 · 09:22:15' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'vault-mock', 'VAULT — Interactive Mock');
console.log('Mock live at:', result.url);
