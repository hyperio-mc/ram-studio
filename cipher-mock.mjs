import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CIPHER',
  tagline:   'Know who sees your data.',
  archetype: 'security-ai',
  palette: {
    bg:      '#070B12',
    surface: '#111A2C',
    text:    '#E2EBF8',
    accent:  '#00FF94',
    accent2: '#6366F1',
    muted:   'rgba(122,147,184,0.4)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0A1628',
    accent:  '#059669',
    accent2: '#4F46E5',
    muted:   'rgba(10,22,40,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Privacy Score', value: '87 / 100', sub: '3 issues need attention' },
        { type: 'metric-row', items: [
          { label: 'Apps Audited', value: '47' },
          { label: 'Threats Blocked', value: '128' },
          { label: 'Vaults', value: '6' },
        ]},
        { type: 'text', label: 'CIPHER AI · Alert', value: 'Instagram accessed your clipboard 14 times this week without user interaction. Recommend revoking clipboard permission.' },
        { type: 'list', items: [
          { icon: 'map', title: 'Location Access', sub: 'All apps · Protected', badge: 'OK' },
          { icon: 'eye', title: 'Camera & Mic', sub: '1 app flagged', badge: '! ALERT' },
          { icon: 'user', title: 'Contacts Sync', sub: '3 apps · Protected', badge: 'OK' },
          { icon: 'activity', title: 'Background Data', sub: '2 apps flagged', badge: '!! HIGH' },
        ]},
      ],
    },
    {
      id: 'perms', label: 'Permissions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '3' },
          { label: 'Warning', value: '8' },
          { label: 'Safe', value: '36' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Instagram', sub: 'Camera · Mic · Location · Contacts', badge: 'CRITICAL' },
          { icon: 'alert', title: 'TikTok', sub: 'Camera · Mic · Location · Clipboard', badge: 'CRITICAL' },
          { icon: 'eye', title: 'Spotify', sub: 'Mic · Location', badge: 'WARNING' },
          { icon: 'map', title: 'Google Maps', sub: 'Location · Camera · Contacts', badge: 'WARNING' },
          { icon: 'check', title: 'Signal', sub: 'Camera · Mic · Contacts', badge: 'SAFE' },
          { icon: 'check', title: 'Notion', sub: 'Camera', badge: 'SAFE' },
        ]},
      ],
    },
    {
      id: 'vault', label: 'Vault',
      content: [
        { type: 'metric', label: 'Encryption', value: 'AES-256', sub: 'Zero-knowledge · All sealed' },
        { type: 'metric-row', items: [
          { label: 'Passwords', value: '284' },
          { label: 'Documents', value: '43' },
          { label: 'IDs', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'lock', title: 'Passwords', sub: '284 entries · Sealed', badge: 'LOCKED' },
          { icon: 'lock', title: 'Health Data', sub: '12 records · Sealed', badge: 'LOCKED' },
          { icon: 'lock', title: 'Financial', sub: '67 items · Sealed', badge: 'LOCKED' },
          { icon: 'lock', title: 'Identity', sub: '8 IDs · Sealed', badge: 'LOCKED' },
        ]},
        { type: 'progress', items: [
          { label: 'Encryption Strength', pct: 100 },
          { label: 'Vault Integrity', pct: 100 },
          { label: 'Key Rotation', pct: 87 },
        ]},
      ],
    },
    {
      id: 'alerts', label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '11' },
          { label: 'Critical', value: '2' },
          { label: 'Resolved', value: '128' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Instagram clipboard access', sub: 'Just now · Without user action', badge: 'CRITICAL' },
          { icon: 'alert', title: 'TikTok background location', sub: '4m ago · While app in background', badge: 'CRITICAL' },
          { icon: 'eye', title: 'Spotify mic access', sub: '22m ago · During playback', badge: 'WARNING' },
          { icon: 'user', title: 'New device login', sub: '1h ago · MacBook Pro · SF', badge: 'INFO' },
          { icon: 'activity', title: 'VPN briefly disconnected', sub: '2h ago · 34s unprotected', badge: 'WARNING' },
          { icon: 'check', title: 'Permission audit complete', sub: '6h ago · 47 apps reviewed', badge: 'INFO' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'VPN Status', value: 'Protected', sub: 'ProtonVPN · Netherlands · 35ms' },
        { type: 'tags', label: 'Privacy Controls', items: ['Ad Tracking: OFF', 'Behavioral: OFF', 'VPN: ON', 'E2E Backup: ON'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Ad Tracking', sub: 'Blocked across all apps', badge: 'OFF' },
          { icon: 'check', title: 'Behavioral Profiling', sub: 'Opt-out active', badge: 'OFF' },
          { icon: 'alert', title: 'Cross-App Data Sharing', sub: '3 apps requesting', badge: 'REVIEW' },
          { icon: 'check', title: 'iCloud Backup Encryption', sub: 'End-to-end encrypted', badge: 'ON' },
          { icon: 'activity', title: 'Data Broker Opt-outs', sub: '47 of 52 removed', badge: '90%' },
        ]},
        { type: 'progress', items: [
          { label: 'Data Broker Removal', pct: 90 },
          { label: 'Permission Coverage', pct: 94 },
          { label: 'Breach Exposure', pct: 12 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Home',    icon: 'home' },
    { id: 'perms',   label: 'Perms',   icon: 'shield' },
    { id: 'vault',   label: 'Vault',   icon: 'lock' },
    { id: 'alerts',  label: 'Alerts',  icon: 'bell' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cipher-mock', 'CIPHER — Interactive Mock');
console.log('Mock live at:', result.url);
