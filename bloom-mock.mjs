import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import { readFileSync, writeFileSync } from 'fs';

const design = {
  appName:   'BLOOM',
  tagline:   'Customer success for DTC brands',
  archetype: 'brand-success-platform',

  // ── LIGHT palette (primary — warm cream + forest green) ──────────────────
  lightPalette: {
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#1A1914',
    accent:  '#2A5A3A',   // forest green
    accent2: '#D4884A',   // warm amber
    muted:   'rgba(26,25,20,0.44)',
  },

  // ── DARK palette ─────────────────────────────────────────────────────────
  palette: {
    bg:      '#0F1A13',
    surface: '#172013',
    text:    '#E8EDE0',
    accent:  '#6BBF8A',   // sage green lightened for dark bg
    accent2: '#E8A368',   // amber lightened for dark bg
    muted:   'rgba(232,237,224,0.42)',
  },

  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Brand portfolio · Mon 24 March', value: '84', sub: 'Avg health score ↑ 3pts this week · 12 active brands' },
        { type: 'metric-row', items: [
          { label: 'Active', value: '12' },
          { label: 'Healthy', value: '9' },
          { label: 'At Risk', value: '3' },
          { label: 'Onboarded', value: '94%' },
        ]},
        { type: 'text', label: '⚠ Needs attention', value: '3 brands show declining health signals in the last 14 days. Soilborn Foods (44), Nomad Supply Co. (68), Drift & Thread (55).' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Maison Colette', sub: 'Food & Beverage · Health 91 · Healthy', badge: '91' },
          { icon: 'activity', title: 'Verdant Skincare', sub: 'Beauty · Health 88 · Healthy', badge: '88' },
          { icon: 'activity', title: 'Crux Coffee', sub: 'Food & Beverage · Health 76 · Monitor', badge: '76' },
          { icon: 'alert', title: 'Nomad Supply Co.', sub: 'Apparel · Health 68 · Monitor ↓', badge: '68' },
          { icon: 'alert', title: 'Soilborn Foods', sub: 'CPG / Organic · Health 44 · At Risk ⚠', badge: '44' },
        ]},
      ],
    },
    {
      id: 'brands', label: 'Brands',
      content: [
        { type: 'metric', label: 'All brands · 12 active', value: '6 shown', sub: 'Sorted by health score · Filter active' },
        { type: 'tags', label: 'Filter', items: ['All', 'Healthy', 'Monitor', 'At Risk', 'New'] },
        { type: 'list', items: [
          { icon: 'star',   title: 'Maison Colette', sub: 'Food & Beverage · Active 8 months', badge: '91' },
          { icon: 'star',   title: 'Verdant Skincare', sub: 'Beauty & Personal Care · Active 1yr', badge: '88' },
          { icon: 'check',  title: 'Crux Coffee', sub: 'Food & Beverage · Active 5 months', badge: '76' },
          { icon: 'activity', title: 'Drift & Thread', sub: 'Fashion / DTC · Onboarding now', badge: '55' },
          { icon: 'alert',  title: 'Nomad Supply Co.', sub: 'Outdoor & Apparel · Active 3mo', badge: '68' },
          { icon: 'alert',  title: 'Soilborn Foods', sub: 'CPG / Organic · Active 6wk', badge: '44' },
        ]},
        { type: 'text', label: 'AI Note', value: 'Healthy brands (>80) show 34% higher reorder rates this quarter vs monitor/at-risk brands.' },
      ],
    },
    {
      id: 'onboard', label: 'Onboard',
      content: [
        { type: 'metric', label: 'Soilborn Foods · Onboarding', value: '50%', sub: 'Step 3 of 6 · In progress · Due 28 March' },
        { type: 'progress', items: [
          { label: 'Overall completion', pct: 50 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '1. Brand intake form', sub: 'Completed 12 Mar · 8 min', badge: '✓' },
          { icon: 'check', title: '2. Founder discovery call', sub: 'Completed 15 Mar · 32 min', badge: '✓' },
          { icon: 'zap',   title: '3. Brand audit & positioning', sub: 'In progress · Due 28 Mar ← active', badge: '↻' },
          { icon: 'eye',   title: '4. Strategy deck review', sub: 'Pending step 3 completion', badge: '…' },
          { icon: 'eye',   title: '5. Launch plan alignment', sub: 'Not started', badge: '…' },
          { icon: 'eye',   title: '6. Go-live & handoff', sub: 'Not started', badge: '…' },
        ]},
        { type: 'text', label: 'Continue', value: 'Tap step 3 to continue the brand audit. AI-drafted positioning summary ready for review.' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'AI Portfolio Intelligence · Updated 2h ago', value: '3 signals', sub: 'Across 12 brands · Powered by Bloom AI' },
        { type: 'list', items: [
          { icon: 'chart',    title: 'Healthy brands growing 34% faster', sub: 'Score >80 → avg 3 reorders/60 days. Maison Colette leads.', badge: '↑' },
          { icon: 'alert',    title: '3 brands showing churn signals', sub: 'Low engagement <14 days. Outreach recommended now.', badge: '⚠' },
          { icon: 'activity', title: 'CPG onboarding 40% faster', sub: 'New 6-step flow cuts avg time to 18 days (was 30).', badge: '✓' },
        ]},
        { type: 'text', label: 'Category breakdown', value: 'Food & Bev 88% · Skincare 75% · Apparel 61% · CPG Organic 49%' },
        { type: 'progress', items: [
          { label: 'Food & Beverage', pct: 88 },
          { label: 'Skincare / Beauty', pct: 75 },
          { label: 'Apparel / Fashion', pct: 61 },
          { label: 'CPG / Organic', pct: 49 },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Maison Colette · Brand profile', value: '91', sub: 'Health score ↑ trending · Food & Beverage · DTC · Active 8 months' },
        { type: 'metric-row', items: [
          { label: 'NPS', value: '74' },
          { label: 'Orders', value: '1.2K' },
          { label: 'Avg Resp', value: '4h' },
        ]},
        { type: 'text', label: 'Recent activity', value: 'Q1 strategy review completed (2 days ago). Founder call 28 min (5 days ago). New product brief submitted (1 week ago).' },
        { type: 'list', items: [
          { icon: 'check',    title: 'Q1 strategy review completed', sub: '2 days ago', badge: '✓' },
          { icon: 'message',  title: 'Founder check-in call (28 min)', sub: '5 days ago', badge: '→' },
          { icon: 'calendar', title: 'New product brief submitted', sub: '1 week ago', badge: '→' },
          { icon: 'chart',    title: 'Monthly insights report sent', sub: '2 weeks ago', badge: '→' },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Ada Lively · Head of Brand Success', value: 'Pro', sub: '12 brand seats · Team of 4 · Billing renews April 1' },
        { type: 'tags', label: 'Integrations', items: ['Shopify ✓', 'Klaviyo ✓', 'Notion ✓', 'HubSpot ○'] },
        { type: 'list', items: [
          { icon: 'user',     title: 'Profile & preferences', sub: 'Ada Lively · head@brandstudio.co', badge: '›' },
          { icon: 'bell',     title: 'Notifications', sub: 'Email + in-app · risk alerts on', badge: '›' },
          { icon: 'lock',     title: 'Security & 2FA', sub: 'Enabled · last login today', badge: '›' },
          { icon: 'layers',   title: 'Team members (4)', sub: 'CSM · Strategist · Analyst · PM', badge: '›' },
          { icon: 'settings', title: 'Plan — Pro 12 seats', sub: 'Billing & invoices · Upgrade →', badge: '›' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'brands',   label: 'Brands',   icon: 'layers' },
    { id: 'onboard',  label: 'Onboard',  icon: 'check' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'profile',  label: 'Profile',  icon: 'star' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

// Save locally regardless of publish status
writeFileSync('/workspace/group/design-studio/bloom-mock.html', html);
console.log('bloom-mock.html saved locally (' + Math.round(html.length / 1024) + 'KB)');

// Try to publish (may fail if ZenBin at capacity)
try {
  const result = await publishMock(html, 'bloom-mock', 'BLOOM — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (e) {
  console.warn('Mock publish skipped (ZenBin at capacity):', e.message || String(e).slice(0, 80));
}
