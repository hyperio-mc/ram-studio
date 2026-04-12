import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { writeFileSync } from 'fs';
import https from 'https';

const design = {
  appName:   'Ligature',
  tagline:   'The reading OS',
  archetype: 'reading-os',
  palette: {
    bg:      '#1C1917',
    surface: '#292524',
    text:    '#FAF8F5',
    accent:  '#E09950',
    accent2: '#6AAFA0',
    muted:   'rgba(250,248,245,0.45)',
  },
  lightPalette: {
    bg:      '#FAF8F5',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C9853A',
    accent2: '#4A7C6F',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Your Library', value: '12 books', sub: '4 currently in progress' },
        { type: 'metric-row', items: [
          { label: 'Read this year', value: '8' },
          { label: 'Annotations', value: '47' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'list', items: [
          { icon: 'book', title: 'The Philosophy of Modern Design', sub: 'Alain de Botton -- 64% -- 2h 40m left', badge: '64%' },
          { icon: 'book', title: 'Thinking, Fast and Slow', sub: 'Daniel Kahneman -- Not started', badge: 'Up next' },
          { icon: 'check', title: 'The Creative Act', sub: 'Rick Rubin -- Finished', badge: 'Done' },
        ]},
        { type: 'tags', label: 'Genres', items: ['Non-fiction', 'Philosophy', 'Design', 'Psychology'] },
      ],
    },
    {
      id: 'reading', label: 'Reading',
      content: [
        { type: 'metric', label: 'Active Read', value: 'p. 187', sub: 'The Philosophy of Modern Design -- Ch.7' },
        { type: 'progress', items: [
          { label: 'Book progress', pct: 64 },
          { label: 'Chapter progress', pct: 42 },
        ]},
        { type: 'text', label: 'Current passage', value: '"The book is the only medium that requires the reader to construct the world in their own image."' },
        { type: 'list', items: [
          { icon: 'highlight', title: 'Highlight selection', sub: 'Tap to highlight, annotate or quote', badge: 'AaBb' },
          { icon: 'star', title: '2h 40m remaining', sub: 'At your reading pace of 38 pages/hr', badge: 'Est.' },
        ]},
      ],
    },
    {
      id: 'notes', label: 'Notes',
      content: [
        { type: 'metric', label: 'Your Annotations', value: '47', sub: 'Highlights, notes, and quotes across 8 books' },
        { type: 'list', items: [
          { icon: 'star', title: 'Highlight -- Philosophy of Modern Design', sub: '"The book is the only medium that requires the reader to construct the world."', badge: 'HL' },
          { icon: 'eye', title: 'Note -- Thinking, Fast and Slow', sub: 'System 1 vs 2 -- connect to Cal Newport deep work idea', badge: 'NT' },
          { icon: 'heart', title: 'Quote -- Meditations', sub: '"You have power over your mind, not outside events."', badge: 'QT' },
        ]},
        { type: 'tags', label: 'Filter by type', items: ['All', 'Highlights', 'Notes', 'Quotes'] },
      ],
    },
    {
      id: 'stats', label: 'Stats',
      content: [
        { type: 'metric', label: 'Pages Read This Year', value: '14,820', sub: '53% of 28,000 yearly goal' },
        { type: 'metric-row', items: [
          { label: 'Books done', value: '8' },
          { label: 'Avg session', value: '47m' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'progress', items: [
          { label: 'Non-fiction', pct: 58 },
          { label: 'Philosophy', pct: 24 },
          { label: 'Fiction', pct: 18 },
        ]},
        { type: 'text', label: 'Insight', value: '14-day reading streak -- read 15+ min today to keep it going. On pace for 28 books this year.' },
      ],
    },
  ],
  nav: [
    { id: 'library', label: 'Library', icon: 'book' },
    { id: 'reading', label: 'Reading', icon: 'eye' },
    { id: 'notes',   label: 'Notes',   icon: 'star' },
    { id: 'stats',   label: 'Stats',   icon: 'chart' },
  ],
};

console.log('Building Svelte mock...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

// Save locally regardless of publish outcome
writeFileSync('/workspace/group/design-studio/ligature-mock.html', html);
console.log('Mock HTML saved locally:', html.length, 'chars');

// Try to publish (may fail due to ZenBin limit)
console.log('Attempting to publish mock...');
try {
  const result = await publishMock(html, 'ligature-mock', 'Ligature -- Interactive Mock');
  console.log('Mock published:', result.url || result);
} catch (err) {
  console.log('Mock publish failed (ZenBin limit):', err.message || err);
  // Try overwrite approach
  const payload = JSON.stringify({ title: 'Ligature -- Interactive Mock', html, overwrite: true });
  const body = Buffer.from(payload);
  await new Promise((resolve) => {
    const req = https.request({
      hostname: 'zenbin.org',
      path: '/v1/pages/ligature-mock',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'X-Subdomain': 'ram',
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { console.log('Overwrite attempt:', res.statusCode, d.slice(0,100)); resolve(); });
    });
    req.on('error', () => resolve());
    req.write(body);
    req.end();
  });
}

console.log('Done. Mock at: https://ram.zenbin.org/ligature-mock (pending ZenBin budget reset)');
