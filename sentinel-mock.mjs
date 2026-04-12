import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SENTINEL',
  tagline:   'API security intelligence, always watching',
  archetype: 'security-intelligence',
  palette: {
    bg:      '#010314',
    surface: '#070C22',
    text:    '#DFE1F4',
    accent:  '#5B6EF5',
    accent2: '#22D3B4',
    muted:   'rgba(107,112,148,0.5)',
  },
  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0D1140',
    accent:  '#5B6EF5',
    accent2: '#0BA896',
    muted:   'rgba(13,17,64,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'SECURITY POSTURE', value: '94', sub: '/ 100 · Excellent' },
        { type: 'metric-row', items: [{ label: 'API calls/hr', value: '1,247' }, { label: 'Threats', value: '3' }, { label: 'Uptime', value: '99.8%' }] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Unusual spike — /v2/auth/token', sub: '847 req/min · HIGH · 4 min ago', badge: 'HIGH' },
          { icon: 'alert', title: 'New IP range accessing /admin', sub: '203.0.113.0/24 · First seen today', badge: 'MED' },
          { icon: 'eye', title: 'Unrecognised client on /webhooks', sub: 'First access from EU-West-3', badge: 'NEW' },
        ]},
      ],
    },
    {
      id: 'flows', label: 'Flows',
      content: [
        { type: 'metric', label: 'LIVE DATA PATHWAYS', value: '12', sub: 'active encrypted flows' },
        { type: 'tags', label: 'Encryption Methods', items: ['AES-256', 'RSA-2048', 'ChaCha20', 'TLS 1.3'] },
        { type: 'progress', items: [
          { label: '/v2/auth/token  ·  AES-256', pct: 78 },
          { label: '/v2/payments/charge  ·  RSA-2048', pct: 45 },
          { label: '/v1/users/profile  ·  AES-256', pct: 55 },
          { label: '/v2/data/export  ·  ChaCha20', pct: 22 },
        ]},
      ],
    },
    {
      id: 'access', label: 'Access',
      content: [
        { type: 'metric', label: 'ANOMALY SCORE THIS HOUR', value: '38', sub: '↑ 22 pts from previous hour' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Brute Force', sub: '/v2/auth/login · 412 failed attempts · Score 92', badge: '92' },
          { icon: 'alert', title: 'Data Exfiltration', sub: '/v2/data/export · Large response body · Score 67', badge: '67' },
          { icon: 'zap', title: 'Rate Abuse', sub: '/v1/search · 3,200 req/hr single key · Score 55', badge: '55' },
          { icon: 'eye', title: 'New Attack Vector', sub: '/v2/webhooks · First from this region · Score 34', badge: '34' },
        ]},
      ],
    },
    {
      id: 'endpoints', label: 'Endpoints',
      content: [
        { type: 'metric-row', items: [{ label: 'Total', value: '94' }, { label: 'Secured', value: '89' }, { label: 'At Risk', value: '5' }] },
        { type: 'list', items: [
          { icon: 'lock', title: 'POST /v2/auth/token', sub: 'p50 48ms · p99 312ms · HIGH RISK', badge: '!' },
          { icon: 'check', title: 'GET /v2/users/{id}', sub: 'p50 12ms · p99 89ms · SECURE', badge: '✓' },
          { icon: 'check', title: 'POST /v2/payments', sub: 'p50 220ms · p99 890ms · SECURE', badge: '✓' },
          { icon: 'alert', title: 'GET /v1/search', sub: 'p50 34ms · p99 210ms · WARN', badge: '~' },
        ]},
      ],
    },
    {
      id: 'log', label: 'Audit Log',
      content: [
        { type: 'metric', label: 'TODAY · 30 MAR 2026', value: '47', sub: 'security events logged' },
        { type: 'list', items: [
          { icon: 'alert', title: 'THREAT_BLOCKED', sub: '14:32:07 · Brute force blocked on /auth/token', badge: '✕' },
          { icon: 'check', title: 'KEY_ROTATED', sub: '14:29:41 · API key rotated: sk_prod_...3x9f', badge: '⟳' },
          { icon: 'lock', title: 'FLOW_ENCRYPTED', sub: '14:21:18 · New flow secured: /v2/data/export', badge: '⌀' },
          { icon: 'zap', title: 'ANOMALY_RAISED', sub: '14:18:05 · Rate abuse detected: /v1/search', badge: '⚡' },
          { icon: 'check', title: 'SCAN_COMPLETE', sub: '14:12:33 · 94 endpoints scanned OK', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Home', icon: 'home' },
    { id: 'flows', label: 'Flows', icon: 'activity' },
    { id: 'access', label: 'Access', icon: 'eye' },
    { id: 'endpoints', label: 'Endpoints', icon: 'layers' },
    { id: 'log', label: 'Log', icon: 'list' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sentinel-mock', 'SENTINEL — Interactive Mock');
console.log('Mock live at:', result.url);
