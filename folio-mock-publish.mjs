import { buildMock, generateSvelteComponent } from './svelte-mock-builder.mjs';
import https from 'https';
import fs from 'fs';

const SLUG = 'folio-mock';

const config = JSON.parse(fs.readFileSync('/workspace/group/design-studio/community-config.json', 'utf8'));

const design = {
  appName:   'Folio',
  tagline:   'The smart ledger for solo operators',
  archetype: 'finance-productivity',
  palette: {
    bg:      '#1A1818',
    surface: '#252220',
    text:    '#FAFAF8',
    accent:  '#4E9B73',
    accent2: '#3E8DC0',
    muted:   'rgba(250,250,248,0.4)',
  },
  lightPalette: {
    bg:      '#FAFAF8',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#3D7A5C',
    accent2: '#3273C8',
    muted:   'rgba(26,24,24,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'March Revenue', value: '$18,450', sub: '↑ 23% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Billed', value: '$24.1K' },
          { label: 'Outstanding', value: '$5.6K' },
          { label: 'Projects', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Invoice #047 paid', sub: 'Orchard Studio · $4,200', badge: 'PAID' },
          { icon: 'bell', title: 'Invoice #046 sent', sub: 'Montague Labs · $2,800', badge: '…' },
          { icon: 'alert', title: 'Invoice #045 overdue', sub: 'TechFuel Inc · $1,650', badge: '!' },
        ]},
      ],
    },
    {
      id: 'projects', label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '7' },
          { label: 'Closing', value: '2' },
          { label: 'Budget Used', value: '54%' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Orchard Studio', sub: 'Brand Identity · $12K', badge: '70%' },
          { icon: 'code',   title: 'Montague Labs', sub: 'Web + Dev · $18.5K', badge: '45%' },
          { icon: 'play',   title: 'Raven Creative', sub: 'Motion · $6.5K', badge: '20%' },
          { icon: 'eye',    title: 'TechFuel Inc', sub: 'UI Audit · $3.2K', badge: '90%' },
        ]},
      ],
    },
    {
      id: 'invoices', label: 'Invoices',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Sent', value: '$24,100' },
          { label: 'Paid', value: '$18,450' },
          { label: 'Outstanding', value: '$5,650' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '#047 · Orchard Studio', sub: 'Mar 18 · $4,200', badge: '✓' },
          { icon: 'share', title: '#046 · Montague Labs', sub: 'Mar 16 · $2,800', badge: '…' },
          { icon: 'alert', title: '#045 · TechFuel Inc', sub: 'Mar 12 · $1,650', badge: '!' },
          { icon: 'check', title: '#044 · Velvet Print', sub: 'Mar 09 · $4,800', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'clients', label: 'Clients',
      content: [
        { type: 'metric', label: 'Relationships', value: '8 clients', sub: '$94K lifetime value' },
        { type: 'list', items: [
          { icon: 'user', title: 'Orchard Studio', sub: 'Since 2024 · 5 projects', badge: '$28K' },
          { icon: 'user', title: 'Montague Labs', sub: 'Since 2025 · 3 projects', badge: '$18K' },
          { icon: 'user', title: 'TechFuel Inc', sub: 'Since 2023 · 8 projects', badge: '$14K' },
        ]},
        { type: 'progress', items: [
          { label: 'Orchard Studio', pct: 100 },
          { label: 'Montague Labs', pct: 65 },
          { label: 'TechFuel Inc', pct: 50 },
        ]},
      ],
    },
    {
      id: 'time', label: 'Time',
      content: [
        { type: 'metric', label: 'This Week', value: '31.5 hrs', sub: '89% billable rate' },
        { type: 'progress', items: [
          { label: 'Monday', pct: 94 },
          { label: 'Tuesday', pct: 75 },
          { label: 'Wednesday', pct: 100 },
          { label: 'Thursday', pct: 69 },
          { label: 'Friday', pct: 56 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Brand guidelines v2', sub: 'Orchard · 09:00–11:30', badge: '2.5h' },
          { icon: 'activity', title: 'Homepage wireframes', sub: 'Montague · 12:00–14:00', badge: '2h' },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric', label: 'Q1 2026', value: '$51,200', sub: '↑ 31% vs Q4 2025' },
        { type: 'metric-row', items: [
          { label: 'Invoices', value: '16' },
          { label: 'Avg Invoice', value: '$3.2K' },
          { label: 'Collection', value: '91%' },
        ]},
        { type: 'progress', items: [
          { label: 'Orchard Studio', pct: 100 },
          { label: 'Montague Labs', pct: 82 },
          { label: 'TechFuel Inc', pct: 64 },
          { label: 'Velvet Print', pct: 59 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'projects', label: 'Projects', icon: 'layers' },
    { id: 'invoices', label: 'Invoices', icon: 'list' },
    { id: 'clients',  label: 'Clients',  icon: 'user' },
    { id: 'time',     label: 'Time',     icon: 'activity' },
    { id: 'reports',  label: 'Reports',  icon: 'chart' },
  ],
};

// Step 1: delete an old page to make room
function zenRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const req = https.request({
      hostname: 'zenbin.org',
      path,
      method,
      headers: {
        'X-Subdomain': 'ram',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// delete one of the oldest drafts to free a slot
const oldSlugs = ['draft-mock', 'kite-mock', 'bask-mock', 'flare-mock', 'aeon-mock', 'sanctum-mock'];
let freed = false;
for (const s of oldSlugs) {
  const r = await zenRequest('DELETE', `/v1/pages/${s}`);
  console.log('DELETE', s, '->', r.status, r.body.slice(0, 60));
  if (r.status === 200 || r.status === 204) { freed = true; break; }
}

if (!freed) {
  // Try overwriting anyway
  console.log('Could not free a slot, trying direct overwrite...');
}

// Build and publish mock
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

// publish directly
const payload = Buffer.from(JSON.stringify({ html, title: 'Folio — Interactive Mock' }));
const res = await new Promise((resolve, reject) => {
  const req = https.request({
    hostname: 'zenbin.org',
    path: `/v1/pages/${SLUG}?overwrite=true`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'X-Subdomain': 'ram',
    },
  }, r => {
    let d = ''; r.on('data', c => d += c);
    r.on('end', () => resolve({ status: r.statusCode, body: d }));
  });
  req.on('error', reject);
  req.write(payload);
  req.end();
});

console.log('Mock publish:', res.status, res.body.slice(0, 120));
if (res.status === 200 || res.status === 201) {
  console.log('Mock live at: https://ram.zenbin.org/' + SLUG);
} else {
  console.log('Mock publish failed:', res.body);
}
