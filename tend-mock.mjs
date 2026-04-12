// tend-mock.mjs — TEND Svelte 5 interactive mock
// Dark organic forest palette (primary) + light warm parchment (secondary)
// "Presence without performance. Connection without capture."

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'TEND',
  tagline:   'presence without performance',
  archetype: 'slow-social',

  // DARK palette (primary — forest floor)
  palette: {
    bg:      '#0B0C09',
    surface: '#131510',
    text:    '#E4E0D6',
    accent:  '#6B9A72',   // forest sage
    accent2: '#C49040',   // warm honey amber
    muted:   'rgba(228,224,214,0.38)',
  },

  // LIGHT palette (secondary — warm parchment)
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#1A1C17',
    accent:  '#4A7A52',   // darker sage for light bg
    accent2: '#9B6E20',   // amber on light
    muted:   'rgba(26,28,23,0.42)',
  },

  screens: [
    {
      id: 'present',
      label: 'Present',
      content: [
        { type: 'metric', label: 'PRESENT NOW', value: '4 people', sub: 'No alerts sent · Quiet by design' },
        { type: 'tags', label: 'Status', items: ['◉ Maya — Walking', '◉ Tom — Reading', '◉ Lena — Coffee', '◉ Rohan — WFH'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Maya',  sub: 'Walking in Battersea Park · 14 min',      badge: '◉ Here' },
          { icon: 'check', title: 'Tom',   sub: 'Reading — quiet time · 2 min',            badge: '◉ Here' },
          { icon: 'heart', title: 'Lena',  sub: 'Having coffee · 31 min',                  badge: '◉ Here' },
          { icon: 'map',   title: 'Rohan', sub: 'Working from home · 1 hour',              badge: '◉ Here' },
          { icon: 'play',  title: 'Wren',  sub: 'Offline · last seen yesterday',           badge: '— Away' },
        ]},
        { type: 'text', label: '✦ Tend note', value: 'Tend never notifies you when someone becomes present. You check in when you\'re ready — not when the app demands it.' },
      ],
    },

    {
      id: 'tend',
      label: 'Tend',
      content: [
        { type: 'metric', label: 'YOUR GARDEN', value: '4 close people', sub: 'Relationship health · No follower counts' },
        { type: 'metric-row', items: [
          { label: 'Tom',   value: '94%' },
          { label: 'Maya',  value: '88%' },
          { label: 'Rohan', value: '67%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Tom · partner · 4y',        sub: 'Last contact: today — connection strong',     badge: '● 94%' },
          { icon: 'star',  title: 'Maya · close friend · 3y',  sub: 'Last contact: 2 days ago — all good',         badge: '● 88%' },
          { icon: 'map',   title: 'Rohan · colleague · 1.5y',  sub: 'Last contact: 7 days ago — gentle drift',     badge: '◑ 67%' },
          { icon: 'heart', title: 'Lena · old flatmate · 5y',  sub: 'Last contact: 12 days ago — needs tending',   badge: '○ 42%' },
        ]},
        { type: 'text', label: '↗ Tend nudge', value: 'Lena is drifting — it\'s been 12 days. A short message could matter more than you think.' },
      ],
    },

    {
      id: 'moment',
      label: 'Moment',
      content: [
        { type: 'metric', label: 'SHARE A MOMENT', value: 'No likes. No counts.', sub: 'They\'ll simply know you shared this' },
        { type: 'tags', label: 'Mood', items: ['Quiet', 'Noticing', 'Grateful', 'Wondering', 'Here'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Tom shared a moment',   sub: 'The coffee this morning was perfect · 8:42 AM',    badge: '◌ Seen' },
          { icon: 'heart', title: 'Maya shared a moment',  sub: 'First rain of spring ☁️ · Yesterday',              badge: '◌ Seen' },
          { icon: 'map',   title: 'Lena shared a moment',  sub: 'Found my old notebook · 2 days ago',               badge: '◌ Seen' },
          { icon: 'check', title: 'You shared a moment',   sub: 'Late afternoon light · 3 days ago',                badge: '◌ Sent' },
        ]},
        { type: 'text', label: '✦ How it works', value: 'No likes, no view counts, no comments. Moments are small signals of presence — not performances. Tap + to share something unhurried.' },
      ],
    },

    {
      id: 'thread',
      label: 'Thread',
      content: [
        { type: 'metric', label: 'SLOW EXCHANGE', value: 'Maya', sub: 'No read receipts · Take your time' },
        { type: 'tags', label: 'This thread', items: ['close friend', '3 years', 'present now', 'unhurried'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'Maya · Mar 24', sub: 'Thinking about that walk last autumn. Should do it again.', badge: '↩ Her' },
          { icon: 'check', title: 'You · Mar 24',  sub: 'Yes. Before it gets too warm. I miss when things felt slower.', badge: '↪ You' },
          { icon: 'heart', title: 'Maya · Mar 25', sub: 'That\'s the whole thing, isn\'t it. Slow is the point.',     badge: '↩ Her' },
          { icon: 'map',   title: 'You · Today',   sub: 'Saturday morning?',                                          badge: '↪ You' },
        ]},
        { type: 'text', label: '✦ Thread note', value: 'Tend doesn\'t show when messages are read. Write when you\'re ready. Reply when you can. There\'s no urgency here.' },
      ],
    },

    {
      id: 'ground',
      label: 'Ground',
      content: [
        { type: 'metric', label: 'YOUR ROOTS', value: '84 moments', sub: '4 people · 12 threads · growing slowly' },
        { type: 'metric-row', items: [
          { label: 'Moments', value: '84'  },
          { label: 'Threads', value: '12'  },
          { label: 'Years',   value: '3.2' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '📍 Hampstead walk · October',  sub: 'With Maya — first cold day of autumn 2025',   badge: 'Oct 2025' },
          { icon: 'check', title: '☕ Sunday morning ritual',     sub: 'With Tom — 44 mornings logged',               badge: 'Ongoing'  },
          { icon: 'heart', title: '🌧 First rain of spring',      sub: 'Maya shared · you were both outside',         badge: 'Mar 2026' },
          { icon: 'map',   title: '📖 Slow reading circle',       sub: 'With Lena, Tom — 3 books, 6 sessions',        badge: 'Jan 2026' },
        ]},
        { type: 'text', label: '✦ From the ground', value: '"Slow is the point." — Maya, March 25. Tend stores your memories so you remember what matters. Not to optimise you.' },
      ],
    },
  ],

  nav: [
    { id: 'present', label: 'Present', icon: 'star'  },
    { id: 'tend',    label: 'Tend',    icon: 'heart' },
    { id: 'moment',  label: 'Moment',  icon: 'map'   },
    { id: 'thread',  label: 'Thread',  icon: 'check' },
    { id: 'ground',  label: 'Ground',  icon: 'play'  },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

fs.writeFileSync('tend-mock.html', html);
console.log(`✓ Saved tend-mock.html — ${(html.length / 1024).toFixed(0)}KB`);

try {
  const result = await publishMock(html, 'tend-mock', 'TEND — presence without performance · Interactive Mock');
  if (result && result.url) {
    console.log('✓ Mock live at:', result.url);
  } else {
    console.log('⚠ Published, no URL:', JSON.stringify(result));
  }
} catch (err) {
  console.log('✗ ZenBin publish failed:', err.message.slice(0, 100));
  console.log('  tend-mock.html saved locally — will publish when quota resets Apr 23');
}
