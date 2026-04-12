import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'RITUAL',
  tagline: 'where drops meet discipline',
  archetype: 'drop-culture-wellness',
  palette: {
    bg: '#0C0A08',
    surface: '#141210',
    text: '#F0EBE3',
    accent: '#E8843A',
    accent2: '#FF4D2E',
    muted: 'rgba(240,235,227,0.45)',
  },
  lightPalette: {
    bg: '#F5F0E8',
    surface: '#FFFFFF',
    text: '#1A1410',
    accent: '#C26820',
    accent2: '#E03018',
    muted: 'rgba(26,20,16,0.50)',
  },
  screens: [
    {
      id: 'drop',
      label: "Today's Drop",
      content: [
        { type: 'metric', label: 'DROP NO.031', value: 'OBSIDIAN RUNNER', sub: 'Opens in 2h 14m · $185 · Limited' },
        { type: 'metric-row', items: [
          { label: 'STREAK', value: '14d' },
          { label: 'COMPLETION', value: '92%' },
          { label: 'TIER', value: 'VOID' },
        ]},
        { type: 'text', label: 'RITUAL QUALIFIER', value: 'Your 14-day streak unlocks early access to this drop. Obsidian tier gets guaranteed allocation.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Morning Run', sub: '5.2km · 28min', badge: '✓' },
          { icon: 'check', title: 'Cold Plunge', sub: '3 min session', badge: '✓' },
          { icon: 'activity', title: 'Breathwork', sub: '10 min · Pending' },
          { icon: 'zap', title: 'Strength', sub: '45 min · Pending' },
        ]},
        { type: 'progress', items: [
          { label: 'Today', pct: 50 },
          { label: 'Streak Goal', pct: 47 },
        ]},
      ],
    },
    {
      id: 'rituals',
      label: 'My Rituals',
      content: [
        { type: 'metric-row', items: [
          { label: 'STREAK', value: '14' },
          { label: 'RATE', value: '92%' },
          { label: 'SESSIONS', value: '189' },
        ]},
        { type: 'progress', items: [
          { label: 'Cold Plunge', pct: 92 },
          { label: 'Morning Run', pct: 87 },
          { label: 'Breathwork', pct: 65 },
          { label: 'Strength', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Cold Plunge', sub: 'MON WED FRI SUN · 14d streak', badge: '🔥' },
          { icon: 'activity', title: 'Morning Run', sub: 'DAILY · 14d streak', badge: '🔥' },
          { icon: 'heart', title: 'Breathwork', sub: 'MON–FRI · 6d streak', badge: '⚡' },
          { icon: 'zap', title: 'Strength', sub: '3×/week · 78% rate', badge: '💪' },
        ]},
      ],
    },
    {
      id: 'calendar',
      label: 'Drop Calendar',
      content: [
        { type: 'metric', label: 'NEXT DROP', value: 'MAR 31', sub: 'PHANTOM SLIDE · RITUAL COLLAB' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'PHANTOM SLIDE', sub: 'MAR 31 · 10:00 AM EST · Limited', badge: '⚡' },
          { icon: 'calendar', title: 'VOID RUNNER II', sub: 'APR 03 · Darkroom × RITUAL', badge: '○' },
          { icon: 'calendar', title: 'EMBER JACKET', sub: 'APR 10 · RITUAL Apparel · Limited', badge: '⚡' },
          { icon: 'calendar', title: 'SHADOW CAP', sub: 'APR 17 · Member Only', badge: '🖤' },
        ]},
        { type: 'tags', label: 'CATEGORIES', items: ['Footwear', 'Apparel', 'Collab', 'Accessory'] },
        { type: 'text', label: 'YOUR ACCESS', value: 'VOID TIER: Early window 2h before public. 3× raffle weight on all drops.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'MARCUS KIM', value: 'OBSIDIAN TIER', sub: '@marcusk · Member since Jan 2026' },
        { type: 'metric-row', items: [
          { label: 'STREAK', value: '14' },
          { label: 'WINS', value: '12' },
          { label: 'RANK', value: '#34' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'IRON WILL', sub: '14 day streak', badge: '🔥' },
          { icon: 'star', title: 'COLD MASTER', sub: '30 cold plunges', badge: '❄️' },
          { icon: 'heart', title: 'DROP HUNTER', sub: '10 wins', badge: '👟' },
          { icon: 'check', title: 'FIRST MOVER', sub: 'Early access unlocked', badge: '⚡' },
        ]},
        { type: 'progress', items: [
          { label: 'Next Tier Progress', pct: 47 },
          { label: 'Monthly Ritual Goal', pct: 82 },
        ]},
      ],
    },
    {
      id: 'detail',
      label: 'Drop Detail',
      content: [
        { type: 'metric', label: 'DROP NO.031', value: 'OBSIDIAN RUNNER', sub: 'Midnight Colorway · $185 USD · Primeknit + Carbon' },
        { type: 'tags', label: 'DETAILS', items: ['OBR-031-MID', 'US 6–14', 'Lifestyle', 'Limited'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Ritual Qualifier', sub: 'Unlocked via 14-day streak', badge: '✓' },
          { icon: 'star', title: 'VOID Tier Early Access', sub: '2h before public opens', badge: '✓' },
          { icon: 'bell', title: 'Alert Active', sub: 'Notifying at 10:00 AM EST', badge: '🔔' },
        ]},
        { type: 'text', label: 'STORY', value: 'The Obsidian Runner is built for those who move in darkness. Midnight Colorway exclusively available to VOID and Obsidian members who complete the full morning stack 14 days consecutive.' },
        { type: 'metric-row', items: [
          { label: 'RETAIL', value: '$185' },
          { label: 'TIER REQ', value: 'VOID' },
          { label: 'OPENS', value: '2H 14M' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'drop', label: 'Drop', icon: 'zap' },
    { id: 'rituals', label: 'Rituals', icon: 'activity' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'detail', label: 'Detail', icon: 'star' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, 'ritual-mock', 'RITUAL — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch(e) {
  console.error('Mock build error:', e.message);
}
