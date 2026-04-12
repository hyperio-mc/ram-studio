import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FEND',
  tagline:   'See every threat before it lands',
  archetype: 'security-intelligence',
  palette: {
    bg:      '#080B10',
    surface: '#0E1219',
    text:    '#E2E8F4',
    accent:  '#F97316',
    accent2: '#38BDF8',
    muted:   'rgba(226,232,244,0.45)',
  },
  lightPalette: {
    bg:      '#F7F8FA',
    surface: '#FFFFFF',
    text:    '#0D1117',
    accent:  '#EA6C10',
    accent2: '#0284C7',
    muted:   'rgba(13,17,23,0.45)',
  },
  screens: [
    {
      id: 'threat-center',
      label: 'Threat Center',
      content: [
        { type: 'metric', label: 'Threats Today', value: '2,847', sub: '▲ 14% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Critical', value: '38' },
          { label: 'High',     value: '217' },
          { label: 'Medium',   value: '891' },
          { label: 'Resolved', value: '8.2K' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'SQL Injection Blocked',    sub: 'api.prod.us-east-1 · 2m ago',  badge: 'CRIT' },
          { icon: 'alert', title: 'Brute Force on SSH :22',  sub: 'worker-node-14 · 7m ago',       badge: 'HIGH' },
          { icon: 'eye',   title: 'Anomalous S3 Access',     sub: 'eu-central-1 · 11m ago',        badge: 'MED' },
        ]},
        { type: 'tags', label: 'Active Rules', items: ['SQL Injection', 'Port Scan', 'Cred Stuffing', 'MFA Failure', 'Privilege Esc'] },
      ],
    },
    {
      id: 'live-feed',
      label: 'Live Feed',
      content: [
        { type: 'list', items: [
          { icon: 'zap',    title: 'Privilege Escalation',   sub: 'k8s-cluster-prod · CRITICAL',  badge: 'BLOCK' },
          { icon: 'alert',  title: 'SQL Injection Pattern',  sub: 'api.prod.us-east · CRITICAL',  badge: 'BLOCK' },
          { icon: 'alert',  title: 'Cred Stuffing Burst',   sub: 'auth.service.prod · HIGH',      badge: 'ALERT' },
          { icon: 'eye',    title: 'Port Scan Detected',    sub: 'worker-node-14 · HIGH',         badge: 'ALERT' },
          { icon: 'filter', title: 'Tor Exit Node Access',  sub: 'cdn-edge-3 · MEDIUM',           badge: 'MON' },
          { icon: 'bell',   title: 'Repeated MFA Failure',  sub: 'user:jdoe · LOW',              badge: 'LOG' },
        ]},
        { type: 'text', label: 'Detection Engine', value: '342 active rules monitoring 143 protected assets across 6 regions.' },
      ],
    },
    {
      id: 'asset-map',
      label: 'Asset Map',
      content: [
        { type: 'metric-row', items: [
          { label: 'Protected', value: '143' },
          { label: 'At Risk',   value: '38' },
          { label: 'Critical',  value: '9' },
        ]},
        { type: 'progress', items: [
          { label: 'api.prod.us-east-1',  pct: 95 },
          { label: 'auth.service.prod',   pct: 82 },
          { label: 'k8s-cluster-prod',    pct: 78 },
          { label: 'postgres-primary',    pct: 44 },
          { label: 'eu-central-1-storage',pct: 38 },
          { label: 'bastion.vpn.prod',    pct: 5  },
        ]},
        { type: 'text', label: 'Risk Score', value: 'Higher scores indicate more frequent rule hits and unresolved incidents on that asset.' },
      ],
    },
    {
      id: 'rules-engine',
      label: 'Rules Engine',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active',   value: '342' },
          { label: 'Staged',   value: '28' },
          { label: 'Disabled', value: '14' },
          { label: 'Uptime',   value: '99.4%' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'Privilege Escalation', sub: 'R-0103 · AuthN · 4 hits',    badge: 'CRIT' },
          { icon: 'alert',  title: 'SQL Injection',        sub: 'R-0091 · Injection · 38 hits', badge: 'CRIT' },
          { icon: 'alert',  title: 'Cred Stuffing',        sub: 'R-0067 · AuthN · 217 hits',   badge: 'HIGH' },
          { icon: 'eye',    title: 'Port Scan',            sub: 'R-0044 · Network · 12 hits',  badge: 'HIGH' },
          { icon: 'filter', title: 'Tor Exit Node',        sub: 'R-0088 · Network · 6 hits',   badge: 'MED' },
          { icon: 'bell',   title: 'MFA Failure ×5',       sub: 'R-0019 · AuthN · 89 hits',    badge: 'LOW' },
        ]},
      ],
    },
    {
      id: 'team-intel',
      label: 'Team Intel',
      content: [
        { type: 'metric', label: 'Mean Time to Detect', value: '4.2m', sub: '▼ 18% improvement vs last week' },
        { type: 'list', items: [
          { icon: 'user',   title: 'Amara Keita',   sub: 'Incident Lead · 3 cases',   badge: 'LIVE' },
          { icon: 'user',   title: 'Priya Singh',   sub: 'Threat Analyst · 7 cases',  badge: 'LIVE' },
          { icon: 'user',   title: 'Leo Marchetti', sub: 'Forensics · 2 cases',       badge: 'LIVE' },
          { icon: 'user',   title: 'Sofia Reyes',   sub: 'Cloud Security · 4 cases',  badge: 'ON-CALL' },
          { icon: 'user',   title: 'Jin-ho Park',   sub: 'Red Team · 0 cases',        badge: 'STANDBY' },
        ]},
        { type: 'tags', label: 'Active Channels', items: ['#incident-war-room', '#soc-alerts', '#forensics', '#cloud-sec'] },
      ],
    },
  ],
  nav: [
    { id: 'threat-center', label: 'Feed',   icon: 'activity' },
    { id: 'asset-map',     label: 'Assets', icon: 'layers' },
    { id: 'rules-engine',  label: 'Rules',  icon: 'filter' },
    { id: 'live-feed',     label: 'Events', icon: 'zap' },
    { id: 'team-intel',    label: 'Team',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'fend-mock', 'FEND — Interactive Mock');
console.log('Mock live at:', result.url);
