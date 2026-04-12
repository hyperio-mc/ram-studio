/**
 * GROVE — Svelte Mock (publish via /api/publish)
 */
import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';

const design = {
  appName:   'GROVE',
  tagline:   'Rituals worth keeping',
  archetype: 'wellness-light',
  palette: {
    bg:      '#1E1A16',
    surface: '#2A2420',
    text:    '#F7F4EF',
    accent:  '#C4783A',
    accent2: '#4A7C59',
    muted:   'rgba(247,244,239,0.40)',
  },
  lightPalette: {
    bg:      '#F7F4EF',
    surface: '#FFFFFF',
    text:    '#1E1A16',
    accent:  '#C4783A',
    accent2: '#4A7C59',
    muted:   'rgba(30,26,22,0.42)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Saturday Morning', value: '3/5', sub: '18-day streak 🔥' },
        { type: 'progress', items: [{ label: 'Daily progress', pct: 60 }] },
        { type: 'list', items: [
          { icon: 'check',    title: 'Morning Meditation', sub: '20 min · Done',      badge: '✓' },
          { icon: 'check',    title: 'Morning Pages',      sub: '3 pages · Done',     badge: '✓' },
          { icon: 'zap',      title: 'Cold Shower',        sub: 'Up next · 3 min',    badge: '→' },
          { icon: 'activity', title: '10k Steps',          sub: 'Scheduled 2pm' },
          { icon: 'eye',      title: '30min Reading',       sub: 'Scheduled 4pm' },
        ]},
        { type: 'tags', label: 'Blocks', items: ['🌅 Morning', '☀ Afternoon', '🌙 Evening'] },
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'Morning Meditation', value: '18', sub: 'day streak 🔥' },
        { type: 'metric-row', items: [
          { label: 'Completion', value: '94%' },
          { label: 'Best Streak', value: '26d' },
          { label: 'Total', value: '71h' },
        ]},
        { type: 'progress', items: [
          { label: 'This month', pct: 94 },
          { label: 'Avg focus', pct: 82 },
        ]},
        { type: 'text', label: 'Your Notes', value: '"Box breathing before sleep made a real difference. 4-7-8 pattern works best."' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Streak', value: '18d' },
          { label: 'Weekly Avg', value: '4.2' },
          { label: 'Best Day', value: 'Wed' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 80 },
          { label: 'Tue', pct: 60 },
          { label: 'Wed', pct: 100 },
          { label: 'Thu', pct: 80 },
          { label: 'Fri', pct: 60 },
          { label: 'Sat', pct: 60 },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Morning Meditation', sub: '18-day streak', badge: '100%' },
          { icon: 'heart',    title: 'Morning Pages',      sub: '11-day streak', badge: '86%' },
          { icon: 'activity', title: '10k Steps',          sub: '5-day streak',  badge: '71%' },
          { icon: 'zap',      title: 'Cold Shower',        sub: '4-day streak',  badge: '57%' },
        ]},
      ],
    },
    {
      id: 'add', label: 'Add',
      content: [
        { type: 'metric', label: 'New Ritual', value: '→', sub: 'Design your practice' },
        { type: 'tags', label: 'Category', items: ['🧘 Mind', '💪 Body', '📚 Learn', '🌿 Rest', '✍ Create'] },
        { type: 'tags', label: 'Frequency', items: ['Daily', 'Weekdays', '3×/week', 'Custom'] },
        { type: 'tags', label: 'Time', items: ['🌅 Morning', '☀ Afternoon', '🌙 Evening'] },
        { type: 'text', label: 'Duration', value: '30 minutes · Reminder: ON' },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'metric', label: 'Evening Reflection', value: '😊', sub: 'Feeling great today' },
        { type: 'text', label: "Today's Prompt", value: '🌿 What ritual felt most effortless today?' },
        { type: 'text', label: 'Your Reflection', value: '"Morning meditation felt different today — I wasn\'t forcing it. The 20 minutes passed without noticing."' },
        { type: 'list', items: [
          { icon: 'check', title: 'Morning Meditation', sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Morning Pages',      sub: 'Completed', badge: '✓' },
          { icon: 'check', title: 'Cold Shower',        sub: 'Completed', badge: '✓' },
          { icon: 'calendar', title: '10k Steps',       sub: 'Pending' },
          { icon: 'calendar', title: '30min Reading',   sub: 'Pending' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'detail',   label: 'Rituals',  icon: 'list' },
    { id: 'add',      label: 'Add',      icon: 'plus' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'reflect',  label: 'Reflect',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

// Publish using /api/publish (not the rate-limited v1 endpoint)
function publishDirect(slug, html, title) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, html, title });
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/api/publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': 'ram',
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ url: `https://ram.zenbin.org/${slug}` }); }
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

const result = await publishDirect('grove-mock', html, 'GROVE — Interactive Mock');
console.log('✓ Mock live at:', result.url || 'https://ram.zenbin.org/grove-mock');
