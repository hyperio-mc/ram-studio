import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CAMO',
  tagline:   'Go dark. Stay invisible.',
  archetype: 'privacy-security',

  palette: {
    bg:      '#0C1010',
    surface: '#131C1C',
    text:    '#D1EDE4',
    accent:  '#10B981',
    accent2: '#FF5240',
    muted:   'rgba(161,207,190,0.45)',
  },
  lightPalette: {
    bg:      '#F0FAF6',
    surface: '#FFFFFF',
    text:    '#0E2A1E',
    accent:  '#059669',
    accent2: '#DC2626',
    muted:   'rgba(14,42,30,0.45)',
  },

  screens: [
    {
      id: 'dashboard',
      label: 'Shield',
      content: [
        { type: 'metric', label: 'CAMO Score', value: '84', sub: 'Good Protection — up +6 this month' },
        { type: 'metric-row', items: [
          { label: 'Trackers Blocked', value: '12K' },
          { label: 'Breaches', value: '3' },
          { label: 'Brokers', value: '23' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'VPN Active — Switzerland', sub: '12ms · Zero logs', badge: '●' },
          { icon: 'alert', title: 'New Breach Detected', sub: 'LinkedIn — Apr 2024', badge: '!' },
          { icon: 'shield', title: 'Broker removal in progress', sub: 'Acxiom · 9 pending', badge: '⟳' },
        ]},
        { type: 'tags', label: 'Active Shields', items: ['VPN ON', '2FA Active', 'DNS Protect', 'WebRTC Off'] },
      ],
    },
    {
      id: 'brokers',
      label: 'Brokers',
      content: [
        { type: 'metric-row', items: [
          { label: 'Removed', value: '7' },
          { label: 'In Progress', value: '9' },
          { label: 'Pending', value: '7' },
        ]},
        { type: 'progress', items: [
          { label: 'Acxiom', pct: 60 },
          { label: 'Spokeo', pct: 10 },
          { label: 'WhitePages', pct: 100 },
          { label: 'Intelius', pct: 5 },
          { label: 'BeenVerified', pct: 45 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'LexisNexis', sub: 'Data analytics · Risk: CRITICAL', badge: 'NEW' },
          { icon: 'activity', title: 'TruthFinder', sub: 'Background check · Removed', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'breaches',
      label: 'Alerts',
      content: [
        { type: 'metric', label: 'Active Breach Alerts', value: '3', sub: 'Immediate action required on LinkedIn' },
        { type: 'list', items: [
          { icon: 'alert', title: 'LinkedIn — 700M records', sub: 'Email · Phone · Job Title exposed', badge: 'CRIT' },
          { icon: 'alert', title: 'Twitch — 125K records', sub: 'Email · Username exposed', badge: 'HIGH' },
          { icon: 'eye',   title: 'Canva — 139M records', sub: 'Email · Hashed password', badge: 'HIGH' },
          { icon: 'check', title: 'Adobe — 38M records', sub: 'Password changed ✓', badge: '✓' },
        ]},
        { type: 'tags', label: 'Exposed Data Types', items: ['Email', 'Phone', 'Password', 'Job Title', 'Username'] },
      ],
    },
    {
      id: 'tracker',
      label: 'Tracker',
      content: [
        { type: 'metric', label: 'Trackers Blocked This Week', value: '12,847', sub: '↑ 23% vs last week' },
        { type: 'progress', items: [
          { label: 'Advertising', pct: 41 },
          { label: 'Analytics', pct: 30 },
          { label: 'Social Media', pct: 16 },
          { label: 'Fingerprinting', pct: 13 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Monday', value: '1.6K' },
          { label: 'Wednesday', value: '1.9K' },
          { label: 'Friday', value: '2.3K' },
          { label: 'Sunday', value: '1.4K' },
        ]},
      ],
    },
    {
      id: 'vpn',
      label: 'VPN',
      content: [
        { type: 'metric', label: 'Connection Status', value: 'ACTIVE', sub: 'Switzerland · 12ms · Zero-log server' },
        { type: 'list', items: [
          { icon: 'check', title: 'Visible IP: 185.220.101.44', sub: 'Switzerland · Masked', badge: '✓' },
          { icon: 'lock',  title: 'Real IP: Hidden', sub: 'Not visible to any site', badge: '✓' },
          { icon: 'check', title: 'DNS Leak: None', sub: 'Protected · Custom DNS', badge: '✓' },
          { icon: 'check', title: 'WebRTC: Disabled', sub: 'No IP leak via browser', badge: '✓' },
          { icon: 'check', title: 'IPv6: Disabled', sub: 'No v6 exposure', badge: '✓' },
        ]},
        { type: 'tags', label: 'Available Servers', items: ['🇨🇭 Switzerland', '🇳🇱 Netherlands', '🇸🇬 Singapore', '🇺🇸 US'] },
      ],
    },
    {
      id: 'score',
      label: 'Score',
      content: [
        { type: 'metric', label: 'Privacy Score', value: '84/100', sub: 'Good Protection — improved +6 pts this month' },
        { type: 'progress', items: [
          { label: 'Tracker Blocking', pct: 95 },
          { label: 'Network Security', pct: 88 },
          { label: 'Browser Fingerprint', pct: 80 },
          { label: 'Identity Exposure', pct: 72 },
          { label: 'Password Hygiene', pct: 61 },
          { label: 'Breach Exposure', pct: 45 },
        ]},
        { type: 'text', label: 'Top Recommendation', value: 'Enable a password manager. 3 reused/weak passwords detected across your accounts.' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Shield',  icon: 'shield' },
    { id: 'brokers',   label: 'Brokers', icon: 'layers' },
    { id: 'breaches',  label: 'Alerts',  icon: 'alert' },
    { id: 'tracker',   label: 'Block',   icon: 'zap' },
    { id: 'vpn',       label: 'VPN',     icon: 'lock' },
    { id: 'score',     label: 'Score',   icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'camo-mock', 'CAMO — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/camo-mock');
