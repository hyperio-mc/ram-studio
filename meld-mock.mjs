import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MELD',
  tagline:   'Privacy-first data pipeline monitor',
  archetype: 'developer-monitoring',
  palette: {
    bg:      '#060C18',
    surface: '#0D1625',
    text:    '#E0E8F8',
    accent:  '#3A82FF',
    accent2: '#22C55E',
    muted:   'rgba(94,120,160,0.5)',
  },
  lightPalette: {
    bg:      '#F1F5FB',
    surface: '#FFFFFF',
    text:    '#0D1829',
    accent:  '#1D5FCC',
    accent2: '#16A349',
    muted:   'rgba(13,24,41,0.42)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Events Processed', value: '2,847,391', sub: '▲ 14.2% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Sources', value: '12' },
          { label: 'Avg Latency', value: '38ms' },
          { label: 'Success', value: '99.7%' },
        ]},
        { type: 'progress', items: [
          { label: 'Success rate', pct: 99 },
          { label: 'Throughput', pct: 72 },
          { label: 'Schema health', pct: 86 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'shopify.orders → warehouse.db', sub: '240 eps · 12ms', badge: 'LIVE' },
          { icon: 'zap',      title: 'stripe.events → analytics.pipe', sub: '85 eps · 8ms',   badge: 'LIVE' },
          { icon: 'alert',    title: 'auth.failed → alerts.queue',    sub: '344 eps · 45ms',  badge: 'WARN' },
          { icon: 'layers',   title: 'postgres.sync → data.lake',     sub: '1.2k eps · 4ms',  badge: 'LIVE' },
        ]},
      ],
    },
    {
      id: 'sources',
      label: 'Sources',
      content: [
        { type: 'metric-row', items: [
          { label: 'Online', value: '11' },
          { label: 'Idle', value: '1' },
          { label: 'Errors', value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'share',    title: 'Shopify Orders',  sub: '240 eps · E-commerce',  badge: 'LIVE' },
          { icon: 'zap',      title: 'Stripe Events',   sub: '85 eps · Payments',     badge: 'LIVE' },
          { icon: 'layers',   title: 'PostgreSQL Main', sub: '1.2k eps · Database',   badge: 'LIVE' },
          { icon: 'alert',    title: 'Auth Service',    sub: '340 eps · Internal API', badge: 'WARN' },
          { icon: 'chart',    title: 'Analytics DB',    sub: '520 eps · Database',    badge: 'LIVE' },
          { icon: 'user',     title: 'Salesforce CRM',  sub: '0 eps · CRM',           badge: 'IDLE' },
        ]},
      ],
    },
    {
      id: 'event-log',
      label: 'Event Log',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Errors', 'Warns', 'Info'] },
        { type: 'metric-row', items: [
          { label: 'Rate', value: '2.8k/m' },
          { label: 'Errors', value: '8' },
          { label: 'Warns', value: '24' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'shopify.order #58230 → warehouse', sub: 'schema:v3 · 2.1kb · 12ms',    badge: 'INFO' },
          { icon: 'check',    title: 'stripe.charge.ok → analytics',     sub: 'amt:$142.00 · u_83kxp',        badge: 'INFO' },
          { icon: 'alert',    title: 'auth.latency spike /login',         sub: 'p99:890ms · limit:500ms',      badge: 'WARN' },
          { icon: 'alert',    title: 'auth.failed brute-force detect',   sub: 'ip:192.168.x · 44/s',          badge: 'ERR'  },
          { icon: 'check',    title: 'pg.batch_insert → data.lake',      sub: 'rows:1,240 · tbl:events',      badge: 'INFO' },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '2' },
          { label: 'Warning', value: '5' },
          { label: 'Info', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',    title: 'Brute-force detected',       sub: 'Auth Service · 3m ago',        badge: 'CRIT' },
          { icon: 'alert',    title: 'Auth latency critical',      sub: 'Auth Service · 8m ago',        badge: 'CRIT' },
          { icon: 'eye',      title: 'Slow query on orders table', sub: 'PostgreSQL · 12m ago',         badge: 'WARN' },
          { icon: 'layers',   title: 'Schema drift — v3 field',    sub: 'Shopify Orders · 1h ago',      badge: 'WARN' },
          { icon: 'zap',      title: 'Throughput burst spike',     sub: 'Stripe Events · 2h ago',       badge: 'WARN' },
        ]},
        { type: 'text', label: 'Auto-resolve', value: 'Alerts auto-close after 24h if conditions normalise. Critical alerts page on-call.' },
      ],
    },
    {
      id: 'schema',
      label: 'Schema',
      content: [
        { type: 'text', label: 'Active mapping', value: 'shopify.orders v3.2 (28 fields) → warehouse.db v2.8 (24 fields)' },
        { type: 'progress', items: [
          { label: 'Field coverage', pct: 86 },
          { label: 'Type compatibility', pct: 95 },
          { label: 'Null safety', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'check',  title: 'order_id → id',               sub: 'INT · exact match',          badge: '✓' },
          { icon: 'check',  title: 'created_at → timestamp',      sub: 'DATETIME · exact match',     badge: '✓' },
          { icon: 'check',  title: 'customer_email → user_email', sub: 'VARCHAR · renamed',          badge: '✓' },
          { icon: 'alert',  title: 'shipping_address → address',  sub: 'TEXT · transform needed',    badge: '⚠' },
          { icon: 'alert',  title: 'shipping_instructions → —',   sub: 'TEXT · no mapping defined',  badge: '✗' },
        ]},
        { type: 'tags', label: 'Status', items: ['24 mapped', '3 transform', '1 unmapped'] },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'Plan', value: 'PRO', sub: 'amir@company.io · 12 sources' },
        { type: 'list', items: [
          { icon: 'lock',     title: 'Data Masking',    sub: 'Auto-redact PII in event payloads', badge: 'ON' },
          { icon: 'lock',     title: 'Encrypt at Rest', sub: 'AES-256 for all stored events',    badge: 'ON' },
          { icon: 'bell',     title: 'Schema Alerts',   sub: 'Notify on drift or new fields',    badge: 'ON' },
          { icon: 'code',     title: 'Debug Mode',      sub: 'Verbose logging (perf impact)',    badge: 'OFF' },
          { icon: 'share',    title: 'Share Analytics', sub: 'Help improve MELD',               badge: 'OFF' },
        ]},
        { type: 'text', label: 'Version', value: 'MELD v2.4.1 · Privacy-first data sync · 12 Apr 2026' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',  label: 'Home',    icon: 'home'     },
    { id: 'sources',    label: 'Sources', icon: 'layers'   },
    { id: 'event-log',  label: 'Log',     icon: 'activity' },
    { id: 'alerts',     label: 'Alerts',  icon: 'bell'     },
    { id: 'settings',   label: 'Config',  icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'meld-mock', 'MELD — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/meld-mock');
