import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

// BASTION — Personal Data Vault & Identity Shield
// Inspired by: Evervault (godly.website) + Linear dark minimal (darkmodedesign.com)
// Palette: cosmic void navy + violet glow + cyan shield

const design = {
  appName:   'BASTION',
  tagline:   'Your Personal Data Vault & Identity Shield',
  archetype: 'productivity',
  palette: {
    bg:      '#07070F',    // cosmic void navy — Evervault-inspired
    surface: '#13132A',    // card / panel background
    text:    '#E0E0F0',    // lavender-white text
    accent:  '#6D28D9',    // deep violet — encryption/vault
    accent2: '#A78BFA',    // light lavender glow
    muted:   'rgba(112,112,160,0.5)',  // muted lavender
  },
  screens: [
    {
      id: 'shield', label: 'Shield',
      content: [
        { type: 'metric', label: 'Shield Score', value: '94', sub: 'Excellent · Fully Protected' },
        { type: 'metric-row', items: [
          { label: 'Vault Items', value: '247' },
          { label: 'Breaches', value: '0' },
          { label: 'Monitored', value: '14' },
        ]},
        { type: 'text', label: '⚔ Status', value: 'Your digital identity is fully protected. Last scan completed 2 minutes ago with no threats detected.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Identity verified', sub: 'Google account · 2 min ago', badge: '✓ Secure' },
          { icon: 'alert', title: 'New login detected', sub: 'MacBook Pro · 1h ago', badge: '⚠ Review' },
          { icon: 'check', title: 'Password rotated', sub: 'github.com · 3h ago', badge: '↺ Updated' },
        ]},
        { type: 'tags', label: 'Quick Actions', items: ['Scan Now', 'Add Item', 'View Vault', 'Alerts'] },
      ],
    },
    {
      id: 'vault', label: 'Vault',
      content: [
        { type: 'metric', label: 'Total Items', value: '247', sub: 'Fully encrypted · AES-256' },
        { type: 'tags', label: 'Categories', items: ['All', 'Logins', 'Cards', 'Notes', 'Keys'] },
        { type: 'list', items: [
          { icon: 'globe', title: 'github.com', sub: 'admin@rakis.dev · Updated 2d ago', badge: '💪 Strong' },
          { icon: 'globe', title: 'figma.com', sub: 'ram@studio.io · Updated 5d ago', badge: '💪 Strong' },
          { icon: 'star',  title: 'Visa ending 4821', sub: 'Expires 09/2027', badge: '💳 Saved' },
          { icon: 'code',  title: 'SSH Key (MacBook)', sub: 'RSA 4096 · Jan 2026', badge: '🔑 Active' },
          { icon: 'alert', title: 'vercel.com', sub: 'Expires soon · Weak password', badge: '🔴 Weak' },
        ]},
        { type: 'progress', items: [
          { label: 'Strong passwords', pct: 87 },
          { label: 'With 2FA enabled', pct: 72 },
          { label: 'Recently updated', pct: 54 },
        ]},
      ],
    },
    {
      id: 'threats', label: 'Threats',
      content: [
        { type: 'metric', label: 'Active Threats', value: '4', sub: '1 critical · 2 high · 1 review' },
        { type: 'text', label: '🚨 BREACH DETECTED', value: 'Your email was found in the "CloudServe" breach (Mar 2026). 2.4M accounts affected. Change passwords immediately.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Data Breach', sub: 'CloudServe leak · 2.4M accounts', badge: '🚨 Critical' },
          { icon: 'alert', title: 'Weak password', sub: 'netflix.com · Less than 8 chars', badge: '🔴 High' },
          { icon: 'alert', title: 'Password reuse', sub: 'Used on 4 other sites', badge: '🔴 High' },
          { icon: 'eye',   title: 'Unknown login', sub: 'Seoul, KR · 3d ago', badge: '👁 Review' },
          { icon: 'alert', title: '2FA missing', sub: 'paypal.com · Required', badge: '🔴 High' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Critical', value: '1' },
          { label: 'High', value: '2' },
          { label: 'Resolved', value: '12' },
        ]},
      ],
    },
    {
      id: 'identity', label: 'Identity',
      content: [
        { type: 'metric', label: 'Identity Score', value: '94', sub: 'Verified · 5 connected accounts' },
        { type: 'text', label: '◎ Your Digital Identity', value: 'Rakis · admin@rakis.dev · Shield Score 94/100. 4 accounts verified, 1 pending review.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Google',  sub: 'admin@rakis.dev · Primary', badge: '✓ Verified' },
          { icon: 'check', title: 'GitHub',  sub: 'rakis-dev · Developer', badge: '✓ Linked' },
          { icon: 'check', title: 'Figma',   sub: 'ram@studio.io · Design', badge: '✓ Linked' },
          { icon: 'alert', title: 'Vercel',  sub: 'team@workspace.dev · Review needed', badge: '⚠ Review' },
          { icon: 'alert', title: 'Twitter', sub: '@ramdesigns_ · Unverified', badge: '⊘ None' },
        ]},
        { type: 'tags', label: 'Actions', items: ['+ Connect Account', 'Export Identity', 'Share Proof'] },
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric', label: '30-Day Shield Score', value: '94', sub: '▲ +8 improvement this month' },
        { type: 'progress', items: [
          { label: 'Email exposure', pct: 2 },
          { label: 'Phone number', pct: 0 },
          { label: 'Name + address', pct: 12 },
          { label: 'Financial data', pct: 0 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Strong', value: '214' },
          { label: 'Weak', value: '18' },
          { label: 'Reused', value: '15' },
        ]},
        { type: 'text', label: '◈ AI Insight', value: 'Your security posture improved significantly this month. Rotating 3 more weak passwords would push your score to 98.' },
        { type: 'tags', label: 'Time Range', items: ['7D', '30D', '90D', '1Y'] },
      ],
    },
  ],
  nav: [
    { id: 'shield',   label: 'Shield',   icon: 'check' },
    { id: 'vault',    label: 'Vault',    icon: 'lock' },
    { id: 'threats',  label: 'Threats',  icon: 'alert' },
    { id: 'identity', label: 'Identity', icon: 'user' },
    { id: 'analytics',label: 'Analytics',icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('🔐 Building BASTION Svelte 5 interactive mock...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log(`   Compiled: ${Math.round(html.length / 1024)}KB`);
const result = await publishMock(html, 'bastion-mock', 'BASTION — Interactive Mock');
console.log('✓ Mock live at:', result.url);
