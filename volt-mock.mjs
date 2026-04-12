import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VOLT',
  tagline:   'live wire. dead threats.',
  archetype: 'security-observability',
  palette: {
    bg:      '#080B12',
    surface: '#0F1420',
    text:    '#E2E8F4',
    accent:  '#00CFFF',
    accent2: '#FF4D2E',
    muted:   'rgba(226,232,244,0.42)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#0087CC',
    accent2: '#D93A1A',
    muted:   'rgba(13,17,23,0.45)',
  },
  screens: [
    {
      id: 'feed', label: 'Live Feed',
      content: [
        { type: 'metric', label: 'Active Incidents', value: '3', sub: 'SSH · DNS · Port scan' },
        { type: 'metric-row', items: [
          { label: 'Events/60s', value: '247' },
          { label: 'Blocked IPs', value: '12' },
          { label: 'Policies', value: '6' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'SSH brute force attempt', sub: '185.234.219.44 → DB-01:22 · ×14 in 8s', badge: 'CRIT' },
          { icon: 'alert', title: 'Unusual outbound DNS',    sub: '10.0.3.88 → *.onion.resolver',           badge: 'HIGH' },
          { icon: 'alert', title: 'Port scan detected',      sub: '203.0.113.77 → 10.0.0.0/24 · 21 ports', badge: 'HIGH' },
          { icon: 'zap',   title: 'Certificate pinning bypass', sub: 'mobile-client → api.internal',        badge: 'MED' },
          { icon: 'check', title: 'New device enrolled',     sub: 'MacBook-Pro-7A → IAM service',           badge: 'LOW' },
        ]},
      ],
    },
    {
      id: 'map', label: 'Network Map',
      content: [
        { type: 'metric-row', items: [
          { label: 'Nodes',    value: '47' },
          { label: 'Active',   value: '44' },
          { label: 'Anomalies', value: '3' },
          { label: 'Blocked',  value: '12' },
        ]},
        { type: 'text', label: 'Topology Status', value: 'DB-01 under active attack. AUTH node reporting elevated auth failures. SEARCH showing anomalous traffic patterns. All other nodes normal.' },
        { type: 'list', items: [
          { icon: 'alert',    title: 'DB-01',    sub: 'Critical — SSH brute force active',  badge: '!' },
          { icon: 'alert',    title: 'AUTH',     sub: 'High — Elevated auth failures',       badge: '⚠' },
          { icon: 'star',     title: 'SEARCH',   sub: 'Medium — Anomalous traffic pattern',  badge: '~' },
          { icon: 'check',    title: 'API-GW',   sub: 'Normal — All checks passing',         badge: '✓' },
          { icon: 'check',    title: 'CDN',      sub: 'Normal — All checks passing',         badge: '✓' },
          { icon: 'check',    title: 'WORKER',   sub: 'Normal — All checks passing',         badge: '✓' },
        ]},
      ],
    },
    {
      id: 'incident', label: 'Incident',
      content: [
        { type: 'metric', label: 'INC-0041 · SSH Brute Force', value: '1,847', sub: 'attempts in 4m 17s — CRITICAL' },
        { type: 'progress', items: [
          { label: 'Attack intensity', pct: 92 },
          { label: 'Response coverage', pct: 68 },
          { label: 'Risk score', pct: 87 },
        ]},
        { type: 'tags', label: 'Attacker Profile', items: ['AS9009 M247', 'Romania', '47 prior incidents', 'SSH scanner'] },
        { type: 'list', items: [
          { icon: 'alert', title: 'Block IP immediately',   sub: 'Add 185.234.219.44 to blocklist', badge: '→' },
          { icon: 'share', title: 'Create Jira ticket',     sub: 'Open incident ticket',             badge: '→' },
          { icon: 'bell',  title: 'Page on-call engineer',  sub: 'PagerDuty · P1 severity',         badge: '→' },
        ]},
      ],
    },
    {
      id: 'policies', label: 'Policies',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active Rules', value: '6' },
          { label: 'Hits Today',   value: '70' },
          { label: 'Auto-blocks',  value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'lock',   title: 'Block repeated SSH fails',    sub: 'IF auth_fail > 10/30s → BLOCK · 47 hits', badge: 'ON' },
          { icon: 'lock',   title: 'DNS anomaly — TLD watchlist', sub: 'IF dns.tld IN watchlist → QUARANTINE · 3 hits', badge: 'ON' },
          { icon: 'filter', title: 'API rate limit enforcement',  sub: 'IF http_429 > 500/min → THROTTLE · 12 hits', badge: 'ON' },
          { icon: 'user',   title: 'New device trust check',      sub: 'IF device.known = false → MFA + LOG · 8 hits', badge: 'ON' },
          { icon: 'map',    title: 'GeoIP block — OFAC list',    sub: 'Paused — 0 hits',  badge: 'OFF' },
          { icon: 'eye',    title: 'TOR exit node blocklist',     sub: 'Paused — 0 hits',  badge: 'OFF' },
        ]},
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total events', value: '3,847' },
          { label: 'Auto-blocked', value: '1,204' },
          { label: 'Needs review', value: '23' },
          { label: 'Critical',     value: '7' },
        ]},
        { type: 'text', label: 'Today · Mar 24', value: 'Peak attack activity between 09:00–10:00. SSH brute force spike at 09:41 — ongoing. DNS anomaly resolved at 07:31. Credential stuffing blocked at 03:11.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'INC-0041 SSH Brute Force — DB-01',        sub: 'Today 09:41 · Active',     badge: 'CRIT' },
          { icon: 'alert', title: 'INC-0040 DNS Exfiltration Attempt',       sub: 'Today 07:23 · Resolved',   badge: 'HIGH' },
          { icon: 'alert', title: 'INC-0039 Credential Stuffing Attack',     sub: 'Today 03:11 · Blocked',    badge: 'HIGH' },
          { icon: 'zap',   title: 'INC-0038 API Abuse — Rate Limit',         sub: 'Today 01:55 · Throttled',  badge: 'MED' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'feed',      label: 'Feed',      icon: 'activity' },
    { id: 'map',       label: 'Map',       icon: 'map' },
    { id: 'incident',  label: 'Incident',  icon: 'alert' },
    { id: 'policies',  label: 'Policies',  icon: 'layers' },
    { id: 'timeline',  label: 'Timeline',  icon: 'calendar' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'volt-mock', 'VOLT — Interactive Mock');
console.log('Mock live at:', result.url);
