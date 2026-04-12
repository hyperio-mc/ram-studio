// gather-mock.mjs — GATHER conference companion Svelte interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GATHER',
  tagline:   'Developer conference companion — schedule-first',
  archetype: 'event-companion',

  palette: {           // DARK variant (required)
    bg:      '#1A1410',
    surface: '#26201A',
    text:    '#F5F0EA',
    accent:  '#E8632A',
    accent2: '#B54820',
    muted:   'rgba(245,240,234,0.45)',
  },

  lightPalette: {      // LIGHT theme (primary — this is a light design)
    bg:      '#F9F7F5',
    surface: '#FFFFFF',
    text:    '#18140E',
    accent:  '#E8632A',
    accent2: '#B54820',
    muted:   'rgba(24,20,14,0.45)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text', label: 'MON 31 MAR · GATHER CONF', value: 'Day 1 Schedule' },
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '14' },
          { label: 'Tracks', value: '3' },
          { label: 'Speakers', value: '48' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '09:00 · Keynote: Building for the AI Era', sub: 'Main Hall · All Tracks', badge: '★' },
          { icon: 'eye',   title: '10:30 · Design Systems in the AI Age', sub: 'Hall A · DESIGN', badge: '♥' },
          { icon: 'code',  title: '10:30 · Rust at Scale', sub: 'Hall B · ENG' },
          { icon: 'chart', title: '13:30 · Product Design Metrics', sub: 'Hall A · PRODUCT', badge: '♥' },
          { icon: 'layers',title: '14:30 · Workshop: Design Tokens', sub: 'Hall B · DESIGN' },
        ]},
        { type: 'progress', items: [
          { label: 'Design Track', pct: 45 },
          { label: 'Engineering Track', pct: 30 },
          { label: 'Product Track', pct: 25 },
        ]},
      ],
    },
    {
      id: 'session', label: 'Session',
      content: [
        { type: 'text', label: 'DESIGN · HALL A · 11:00–11:45', value: 'Design Systems in the AI Age' },
        { type: 'metric-row', items: [
          { label: 'Duration', value: '45m' },
          { label: 'Room', value: 'Hall A' },
          { label: 'Capacity', value: '500' },
        ]},
        { type: 'text', label: 'Speaker', value: 'Sarah Chen · Design Systems Lead, Vercel' },
        { type: 'text', label: 'Synopsis', value: 'AI-powered tooling is reshaping how we build and maintain design systems. This talk explores how to architect component libraries that can be understood and extended by both humans and AI agents — without sacrificing clarity or cohesion.' },
        { type: 'tags', label: 'Topics', items: ['Design Systems', 'AI Tooling', 'Component APIs', 'Tokens'] },
        { type: 'list', items: [
          { icon: 'heart', title: 'Save to My Agenda', sub: 'Tap to add this session to your personal schedule', badge: '→' },
        ]},
      ],
    },
    {
      id: 'speakers', label: 'Speakers',
      content: [
        { type: 'text', label: 'DAY 1 · 16 SPEAKERS', value: 'Meet the Speakers' },
        { type: 'list', items: [
          { icon: 'user', title: 'Sarah Chen', sub: 'Design Systems Lead · Vercel · DESIGN', badge: '→' },
          { icon: 'user', title: 'Marcus Webb', sub: 'Staff Engineer · Stripe · ENG', badge: '→' },
          { icon: 'user', title: 'Priya Menon', sub: 'Head of Product · Figma · PRODUCT', badge: '→' },
          { icon: 'user', title: 'Jonas Kühn', sub: 'Accessibility Lead · Mozilla · DESIGN', badge: '→' },
          { icon: 'user', title: 'Ada Williams', sub: 'Platform Engineering · Cloudflare · ENG', badge: '→' },
          { icon: 'user', title: 'Leo Park', sub: 'Creative Director · Linear · DESIGN', badge: '→' },
        ]},
        { type: 'tags', label: 'Tracks', items: ['Design', 'Engineering', 'Product'] },
      ],
    },
    {
      id: 'agenda', label: 'Agenda',
      content: [
        { type: 'text', label: 'MON 31 MAR', value: 'My Agenda' },
        { type: 'metric-row', items: [
          { label: 'Saved', value: '5' },
          { label: 'Conflicts', value: '1' },
          { label: 'Hours', value: '3.5h' },
        ]},
        { type: 'list', items: [
          { icon: 'star',  title: '09:00 · Keynote: Building for the AI Era', sub: '60 min · Main Hall', badge: '♥' },
          { icon: 'eye',   title: '10:30 · Design Systems in the AI Age', sub: '45 min · Hall A · DESIGN', badge: '♥' },
          { icon: 'alert', title: '⚠ Conflict: Edge Runtime Patterns', sub: '45 min · Hall B · same time slot', badge: '!' },
          { icon: 'chart', title: '13:30 · Product Design Metrics', sub: '45 min · Hall A · PRODUCT', badge: '♥' },
          { icon: 'star',  title: '17:00 · Closing Keynote + Q&A', sub: '60 min · Main Hall', badge: '♥' },
        ]},
      ],
    },
    {
      id: 'venue', label: 'Venue',
      content: [
        { type: 'text', label: 'EDINBURGH CONVENTION CENTRE', value: 'Venue Map — Floor 1' },
        { type: 'metric-row', items: [
          { label: 'Rooms', value: '8' },
          { label: 'Active', value: '3' },
          { label: 'Next up', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'map',   title: 'Hall A — Active', sub: 'Design Systems in the AI Age · 80% full', badge: '●' },
          { icon: 'map',   title: 'Hall B — Active', sub: 'Rust at Scale · 60% full', badge: '●' },
          { icon: 'map',   title: 'Workshop 1 — Empty', sub: 'Available · Next session 12:30', badge: '○' },
          { icon: 'map',   title: 'Workshop 2 — Next Up', sub: 'Design Tokens Workshop starts 14:30', badge: '◐' },
          { icon: 'map',   title: 'Expo Hall', sub: 'Open all day · Sponsor booths + demos', badge: '○' },
        ]},
        { type: 'tags', label: 'Legend', items: ['● Active', '◐ Next up', '○ Empty'] },
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'calendar' },
    { id: 'session',  label: 'Session',  icon: 'play' },
    { id: 'speakers', label: 'Speakers', icon: 'user' },
    { id: 'agenda',   label: 'Agenda',   icon: 'list' },
    { id: 'venue',    label: 'Venue',    icon: 'map' },
  ],
};

console.log('⚙ Compiling Svelte mock…');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'gather-mock',
});

console.log('📤 Publishing mock…');

// Try ram.zenbin.org first, fallback to zenbin.org/p/
import https from 'https';

function deployMock(slug, html, subdomain) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({ title: `${design.appName} — Interactive Mock`, html }));
    const opts = {
      hostname: 'zenbin.org',
      path: `/v1/pages/${slug}?overwrite=true`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': body.length },
    };
    if (subdomain) opts.headers['X-Subdomain'] = subdomain;
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const url = subdomain ? `https://${subdomain}.zenbin.org/${slug}` : `https://zenbin.org/p/${slug}`;
          resolve({ ok: true, url, status: res.statusCode });
        } else {
          resolve({ ok: false, status: res.statusCode, body: d.slice(0,200) });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

let mockResult = await deployMock('gather-mock', html, 'ram');
if (!mockResult.ok) {
  console.log(`  ↳ ram subdomain at capacity (${mockResult.status}), using fallback…`);
  mockResult = await deployMock('gather-mock', html, null);
}

if (mockResult.ok) {
  console.log(`✓ Mock live at: ${mockResult.url}`);
} else {
  console.log(`✗ Mock publish failed: ${mockResult.status} — ${mockResult.body}`);
}

console.log('\n✅ GATHER mock complete');
console.log('   Mock:', mockResult.url || 'https://zenbin.org/p/gather-mock');
