// carta-mock-publish.mjs — build Svelte mock and publish via /api/create
import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import { openDB, upsertDesign, rebuildEmbeddings } from './design-db.mjs';
import { readFileSync, writeFileSync } from 'fs';
import https from 'https';

const SLUG = 'carta-mock';
const SUBDOMAIN = 'ram';

function zenbinCreate(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ slug, title, content: html });
    const buf  = Buffer.from(body);
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     '/api/create',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Content-Length': buf.length,
        'X-Subdomain':    subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log('  ZenBin status:', res.statusCode, d.slice(0, 120));
        try { resolve({ ok: res.statusCode < 300, url: `https://${subdomain}.zenbin.org/${slug}`, raw: JSON.parse(d) }); }
        catch { resolve({ ok: res.statusCode < 300, url: `https://${subdomain}.zenbin.org/${slug}`, raw: d }); }
      });
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

const design = {
  appName:   'CARTA',
  tagline:   'Your Reading Life, Composed',
  archetype: 'editorial-reader',
  palette: {
    bg:      '#1A1510',
    surface: '#231E18',
    text:    '#F5F0E6',
    accent:  '#C4632A',
    accent2: '#3E8055',
    muted:   'rgba(245,240,230,0.4)',
  },
  lightPalette: {
    bg:      '#F5F0E6',
    surface: '#FFFDF8',
    text:    '#1A1510',
    accent:  '#8B3B1F',
    accent2: '#2B5E3A',
    muted:   'rgba(26,21,16,0.45)',
  },
  screens: [
    {
      id: 'shelf', label: 'Shelf',
      content: [
        { type: 'metric', label: 'Currently Reading', value: 'Piranesi', sub: 'Susanna Clarke · Page 187 of 272 (69%)' },
        { type: 'progress', items: [{ label: 'Chapter Progress', pct: 69 }] },
        { type: 'metric-row', items: [
          { label: 'Day Streak', value: '12' },
          { label: 'Books 2025', value: '34' },
          { label: 'Pages Read', value: '8.4K' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'James', sub: 'Percival Everett · Mar 18', badge: '★★★★★' },
          { icon: 'check', title: 'Small Things Like These', sub: 'Claire Keegan · Mar 8', badge: '★★★★' },
          { icon: 'check', title: 'Normal People', sub: 'Sally Rooney · Feb 28', badge: '★★★★★' },
        ]},
      ],
    },
    {
      id: 'reading', label: 'Reading',
      content: [
        { type: 'metric', label: 'Now Reading', value: 'Piranesi', sub: 'Susanna Clarke · 2020 · Fantasy / Mystery' },
        { type: 'progress', items: [{ label: 'Page 187 of 272', pct: 69 }] },
        { type: 'list', items: [
          { icon: 'check', title: 'The First Vestibule', sub: 'pp. 1–42', badge: '✓' },
          { icon: 'check', title: 'The Drowned Halls', sub: 'pp. 43–91', badge: '✓' },
          { icon: 'check', title: 'The Other', sub: 'pp. 92–147', badge: '✓' },
          { icon: 'check', title: 'The Prophet', sub: 'pp. 148–187', badge: '✓' },
          { icon: 'eye', title: 'A Revelation of Statues', sub: 'pp. 188–234 — up next', badge: '→' },
        ]},
        { type: 'metric-row', items: [
          { label: 'This Week', value: '3h 15m' },
          { label: 'Sessions', value: '4/7d' },
          { label: 'Avg Pace', value: '32 pp/h' },
        ]},
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'text', label: 'Your Reading Year', value: 'A Year Built to Compound · 34 books read in 2025 through March' },
        { type: 'metric-row', items: [
          { label: 'Books Read', value: '34' },
          { label: 'Pages', value: '8.4K' },
          { label: 'Hours', value: '62h' },
          { label: 'Streak', value: '12d' },
        ]},
        { type: 'progress', items: [
          { label: 'Literary Fiction (41%)', pct: 41 },
          { label: 'Non-Fiction (24%)', pct: 24 },
          { label: 'Fantasy & Sci-Fi (18%)', pct: 18 },
          { label: 'Mystery (12%)', pct: 12 },
        ]},
        { type: 'metric', label: 'Monthly Goal', value: '4.3 books/mo', sub: 'Target: 4 books/month · On track for 48 books in 2025' },
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'Filter by Genre', items: ['All', 'Literary', 'Fiction', 'Non-Fiction', 'Fantasy', 'Mystery'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Intermezzo', sub: 'Sally Rooney · Based on your reading history', badge: '+' },
          { icon: 'star', title: 'The Women', sub: 'Kristin Hannah · Trending in your network', badge: '+' },
          { icon: 'star', title: 'All Fours', sub: 'Miranda July · Booker longlist 2025', badge: '+' },
          { icon: 'star', title: 'Orbital', sub: 'Samantha Harvey · Booker Prize winner', badge: '+' },
        ]},
      ],
    },
    {
      id: 'notes', label: 'Notes',
      content: [
        { type: 'metric', label: 'Your Highlights', value: '47 notes', sub: 'Across 23 books in your library' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Piranesi', sub: '"I looked out upon the Hall of the Heart-Shaped Column. The light had a quality of late afternoon — golden, slow…"', badge: 'p.124' },
          { icon: 'heart', title: 'James', sub: '"The world has become exhausting in its demands upon the soul. We forget we have one."', badge: 'p.89' },
          { icon: 'heart', title: 'Small Things Like These', sub: '"What small things can make the world turn over. What small things have always made the world turn over."', badge: 'p.112' },
        ]},
        { type: 'text', label: 'Add a Note', value: 'Tap + to capture a highlight from what you\'re reading right now' },
      ],
    },
  ],
  nav: [
    { id: 'shelf',    label: 'Shelf',    icon: 'grid' },
    { id: 'reading',  label: 'Reading',  icon: 'list' },
    { id: 'stats',    label: 'Stats',    icon: 'chart' },
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'notes',    label: 'Notes',    icon: 'heart' },
  ],
};

console.log('Building Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Compiling mock HTML...');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: SLUG,
});

// Save locally
writeFileSync('/workspace/group/design-studio/carta-mock.html', html);
console.log('  Saved carta-mock.html locally');

// Publish via /api/create
console.log('Publishing via /api/create...');
const result = await zenbinCreate(SLUG, 'CARTA — Interactive Mock', html, SUBDOMAIN);
console.log('Mock result:', result.ok ? '✓ Published' : '✗ Failed', result.url);

// Step E: Design DB index
console.log('Indexing in design DB...');
try {
  const entry = JSON.parse(readFileSync('/workspace/group/design-studio/carta-entry.json', 'utf8'));
  const db = openDB();
  upsertDesign(db, {
    ...entry,
    mock_url: result.url || `https://ram.zenbin.org/${SLUG}`,
  });
  rebuildEmbeddings(db);
  console.log('Indexed in design DB ✓');
} catch (e) {
  console.error('DB index error:', e.message);
}

console.log('\n✓ All done');
console.log(`Mock: ${result.url}`);
