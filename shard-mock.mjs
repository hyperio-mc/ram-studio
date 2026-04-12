import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SHARD',
  tagline:   'Every transaction, visible.',
  archetype: 'payments-telemetry',
  palette: {
    bg:      '#020512',
    surface: '#071228',
    text:    '#E2EEFF',
    accent:  '#00D4FF',
    accent2: '#00E5A0',
    muted:   'rgba(226,238,255,0.4)',
  },
  lightPalette: {
    bg:      '#F0F5FF',
    surface: '#FFFFFF',
    text:    '#0A1635',
    accent:  '#0099CC',
    accent2: '#00A877',
    muted:   'rgba(10,22,53,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Volume (24h)', value: '$2.84M', sub: '↑ 12.4% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Transactions', value: '14.8K' },
          { label: 'Success Rate', value: '99.2%' },
          { label: 'Avg P99', value: '184ms' },
          { label: 'Errors', value: '118' },
        ]},
        { type: 'progress', items: [
          { label: 'Charge API', pct: 98 },
          { label: 'Webhook relay', pct: 100 },
          { label: 'Tokenization', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'P99 Latency Spike', sub: '/v1/payment_intents — 612ms', badge: '⚠' },
          { icon: 'check', title: 'Compliance check', sub: 'PCI-DSS v4.0 passing', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'transactions', label: 'Transactions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Today', value: '$2.84M' },
          { label: 'This week', value: '$18.2M' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '$1,240.00 — Succeeded', sub: 'Visa ···4242 · Shopify · 12s ago', badge: '✓' },
          { icon: 'check', title: '$89.50 — Succeeded', sub: 'MC ···8134 · Stripe · 1m ago', badge: '✓' },
          { icon: 'alert', title: '$340.00 — Refunded', sub: 'Amex ···0011 · 3m ago', badge: '↩' },
          { icon: 'zap', title: '$75.00 — Failed', sub: 'Visa ···6690 · card_declined · 5m', badge: '✗' },
          { icon: 'check', title: '$2,500.00 — Succeeded', sub: 'ACH Direct · Plaid · 8m ago', badge: '✓' },
          { icon: 'activity', title: '$450.00 — Processing', sub: 'Visa ···1123 · Stripe · 12m', badge: '⟳' },
        ]},
      ],
    },
    {
      id: 'endpoints', label: 'Endpoints',
      content: [
        { type: 'metric-row', items: [
          { label: 'Endpoints', value: '12' },
          { label: 'Degraded', value: '1' },
          { label: 'Avg P99', value: '312ms' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'POST /v1/payment_intents', sub: 'P99: 612ms · Err: 2.1% · 4.2K/h', badge: '⚠' },
          { icon: 'check', title: 'POST /v1/charges', sub: 'P99: 184ms · Err: 0.3% · 8.1K/h', badge: '✓' },
          { icon: 'check', title: 'GET /v1/customers', sub: 'P99: 96ms · Err: 0.0% · 12.4K/h', badge: '✓' },
          { icon: 'check', title: 'POST /v1/refunds', sub: 'P99: 140ms · Err: 0.8% · 820/h', badge: '✓' },
          { icon: 'check', title: 'GET /v1/events', sub: 'P99: 72ms · Err: 0.1% · 22K/h', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1' },
          { label: 'Warning', value: '3' },
          { label: 'Info', value: '7' },
          { label: 'Resolved', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'P99 Latency Spike', sub: '/v1/payment_intents · 612ms · 4m ago', badge: '!' },
          { icon: 'alert', title: 'Error Rate Elevated', sub: 'Adyen · 3.2% vs 0.8% baseline · 18m', badge: '⚠' },
          { icon: 'alert', title: 'Webhook Failures', sub: '12 events pending retry · 32m', badge: '⚠' },
          { icon: 'alert', title: 'Rate Limit Warning', sub: 'key_live_sk_...4a2c at 88% · 1h', badge: '⚠' },
        ]},
      ],
    },
    {
      id: 'integrations', label: 'Connect',
      content: [
        { type: 'metric', label: 'Connected providers', value: '4', sub: '$2.84M processed today' },
        { type: 'progress', items: [
          { label: 'Total capacity utilization', pct: 68 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Stripe', sub: '$1.42M · 8,240 txns · 142ms P99', badge: '✓' },
          { icon: 'alert', title: 'Adyen', sub: '$840K · 3,100 txns · 540ms P99', badge: '⚠' },
          { icon: 'check', title: 'Plaid', sub: '$420K · 2,180 txns · 88ms P99', badge: '✓' },
          { icon: 'check', title: 'Braintree', sub: '$178K · 1,302 txns · 196ms P99', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview',      label: 'Overview',  icon: 'activity' },
    { id: 'transactions',  label: 'Txns',      icon: 'zap' },
    { id: 'endpoints',     label: 'Endpoints', icon: 'grid' },
    { id: 'alerts',        label: 'Alerts',    icon: 'alert' },
    { id: 'integrations',  label: 'Connect',   icon: 'layers' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, 'shard-mock', 'SHARD — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (err) {
  console.error('Mock build failed:', err.message);
  process.exit(1);
}
