import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

// DRIFTWOOD — Slow Living Journal App
// Warm organic dark palette: forest night + aged amber + sage green

const design = {
  appName:   'DRIFTWOOD',
  tagline:   'Slow living journal. A sanctuary for reflection.',
  archetype: 'health',
  palette: {
    bg:      '#0E1209',
    surface: '#1D2416',
    text:    '#F0E6C8',
    accent:  '#C4843A',
    accent2: '#4A7C59',
    muted:   'rgba(122,138,104,0.5)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: '🔥 Current streak', value: '47 days', sub: 'Sunday, March 22 · Keep going' },
        { type: 'metric-row', items: [
          { label: 'This month', value: '22' },
          { label: 'Total words', value: '14.2K' },
          { label: 'Avg/entry', value: '649w' },
        ]},
        { type: 'tags', label: "Today's mood", items: ['😌 Calm', '🌤 Good', '🌿 Grounded', '🌧 Heavy', '⚡ Charged'] },
        { type: 'text', label: "Today's entry", value: 'The morning light filters through the blinds, soft and unassuming. I lie still for a few minutes, listening to the birds outside.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Saturday, Mar 21', sub: 'Walked to the market. The peaches were perfectly ripe...', badge: '😌 412w' },
          { icon: 'star', title: 'Friday, Mar 20', sub: 'A difficult conversation I had been avoiding for weeks...', badge: '🌧 681w' },
          { icon: 'star', title: 'Thursday, Mar 19', sub: 'Cooked soup from scratch. Something slow and grounding.', badge: '🌿 203w' },
        ]},
      ],
    },
    {
      id: 'write', label: 'Write',
      content: [
        { type: 'tags', label: 'Mood', items: ['😌 Calm', '🌤 Good', '🌿 Grounded', '🌧 Heavy', '⚡ Charged'] },
        { type: 'text', label: 'Sunday, March 22', value: 'The morning light filters through the blinds, soft and unassuming. I lie still for a few minutes, listening to the birds outside.\n\nThere is something about Sundays that asks you to slow down. Not out of laziness — but reverence.\n\nI made coffee slowly. Poured it into the old ceramic mug. Sat by the window...' },
        { type: 'metric-row', items: [
          { label: 'Words', value: '274' },
          { label: 'Read time', value: '12 min' },
          { label: 'Status', value: '✓ Saved' },
        ]},
        { type: 'tags', label: 'Format', items: ['Bold', 'Italic', 'Quote', 'Em dash', '✦ Mark'] },
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'metric', label: 'March 2026', value: '22 entries', sub: '14,284 words written this month' },
        { type: 'progress', items: [
          { label: 'Week 1 (Mar 1–7)', pct: 57 },
          { label: 'Week 2 (Mar 8–14)', pct: 86 },
          { label: 'Week 3 (Mar 15–21)', pct: 100 },
          { label: 'Week 4 (Mar 22–28)', pct: 14 },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Sunday, Mar 22', sub: 'The morning light filters through...', badge: '😌 274w' },
          { icon: 'heart', title: 'Saturday, Mar 21', sub: 'Walked to the market. Peaches.', badge: '🌤 412w' },
          { icon: 'heart', title: 'Friday, Mar 20', sub: 'A difficult conversation, finally.', badge: '🌧 681w' },
          { icon: 'heart', title: 'Thursday, Mar 19', sub: 'Slow soup. Grounding presence.', badge: '🌿 203w' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: '🔥 Streak', value: '47 days', sub: 'Personal best — keep going, Simone' },
        { type: 'metric-row', items: [
          { label: 'Entries', value: '867' },
          { label: 'Words', value: '284K' },
          { label: 'Best day', value: 'Fri 20' },
        ]},
        { type: 'tags', label: 'Mood this month', items: ['😌 Calm 32%', '🌤 Good 27%', '🌿 Grounded 23%', '🌧 Heavy 18%'] },
        { type: 'progress', items: [
          { label: 'Morning (6–9am)', pct: 68 },
          { label: 'Evening (8–10pm)', pct: 24 },
          { label: 'Midday (12–2pm)', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'leaf', title: 'Nature', sub: 'Top theme this month', badge: '14 refs' },
          { icon: 'heart', title: 'Relationships', sub: 'Growing theme', badge: '11 refs' },
          { icon: 'star', title: 'Gratitude', sub: 'Consistent presence', badge: '8 refs' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Simone', value: 'Since Oct 2023', sub: 'Season 3 · Forest Night theme' },
        { type: 'metric-row', items: [
          { label: '🔥 Streak', value: '47d' },
          { label: '📝 Entries', value: '867' },
          { label: '✍️ Words', value: '284K' },
        ]},
        { type: 'text', label: 'My intention', value: '"Write every day, even when there is nothing to say. Especially then."' },
        { type: 'list', items: [
          { icon: 'bell', title: 'Daily reminder', sub: 'Notification settings', badge: '8:00 AM' },
          { icon: 'eye', title: 'Writing font', sub: 'Typography preference', badge: 'Serif' },
          { icon: 'settings', title: 'Theme', sub: 'Visual appearance', badge: 'Forest Night' },
          { icon: 'share', title: 'Backup & export', sub: 'Data & storage', badge: 'iCloud ✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'write',    label: 'Write',    icon: 'plus' },
    { id: 'timeline', label: 'Timeline', icon: 'calendar' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building DRIFTWOOD Svelte 5 mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
fs.writeFileSync('driftwood-mock.html', html);
console.log('Mock HTML saved locally (driftwood-mock.html)');
try {
  const result = await publishMock(html, 'driftwood-mock', 'DRIFTWOOD — Interactive Mock');
  if (result && result.url) {
    console.log('Mock live at:', result.url);
  } else {
    console.log('ZenBin publish result:', result);
  }
} catch (err) {
  console.log('ZenBin publish failed (quota):', err.message.slice(0, 80));
  console.log('driftwood-mock.html saved locally — will publish when quota resets Apr 23');
}
