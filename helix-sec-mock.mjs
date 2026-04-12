import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Helix',
  tagline:   'Every commit, watched.',
  archetype: 'developer-security-ai',
  palette: {
    bg:      '#050B1A',
    surface: '#0D1829',
    text:    '#DFE3F4',
    accent:  '#7B5CFA',
    accent2: '#36D9B4',
    muted:   'rgba(223,227,244,0.45)',
  },
  lightPalette: {
    bg:      '#F0F2FF',
    surface: '#FFFFFF',
    text:    '#0A0D1A',
    accent:  '#5B3FD9',
    accent2: '#0DB899',
    muted:   'rgba(10,13,26,0.45)',
  },
  screens: [
    {
      id: 'pulse',
      label: 'Pulse',
      content: [
        { type: 'metric', label: 'Security Pulse', value: '94', sub: '↑ 3 pts · scanned 2 min ago' },
        { type: 'metric-row', items: [
          { label: 'Critical', value: '2' },
          { label: 'High', value: '7' },
          { label: 'Resolved', value: '41' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'api-gateway', sub: '⎇ main · score 97', badge: '97' },
          { icon: 'alert', title: 'auth-service', sub: '⎇ feat/oauth · score 78', badge: '78' },
          { icon: 'check', title: 'ml-pipeline', sub: '⎇ main · score 91', badge: '91' },
        ]},
      ],
    },
    {
      id: 'vulns',
      label: 'Vulns',
      content: [
        { type: 'text', label: 'Open Issues', value: '11 vulnerabilities · sorted by risk' },
        { type: 'list', items: [
          { icon: 'alert', title: 'SQL Injection', sub: 'CVE-2024-8291 · sequelize@6.37', badge: 'CRIT' },
          { icon: 'alert', title: 'Prototype Pollution', sub: 'CVE-2024-7104 · lodash@4.17.20', badge: 'HIGH' },
          { icon: 'alert', title: 'Improper Input', sub: 'CWE-89 · express@4.18.2', badge: 'HIGH' },
          { icon: 'alert', title: 'Path Traversal', sub: 'CVE-2024-6521 · multer@1.4.5', badge: 'MED' },
        ]},
      ],
    },
    {
      id: 'review',
      label: 'Review',
      content: [
        { type: 'text', label: 'File', value: 'src/db/query.ts · line 142' },
        { type: 'text', label: 'Vulnerability', value: 'Unsanitized `id` interpolated directly into raw SQL. Attacker can inject arbitrary SQL via user input.' },
        { type: 'metric', label: 'AI Confidence', value: '97%', sub: 'CVE-2024-8291 · Critical' },
        { type: 'tags', label: 'Fix', items: ['Use parameterized queries', 'db.query(sql, [id])'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Auto-Fix Available', sub: 'AI-generated parameterized query fix', badge: '→' },
        ]},
      ],
    },
    {
      id: 'intel',
      label: 'Intel',
      content: [
        { type: 'text', label: 'Threat Level', value: '⚠ ELEVATED — New zero-day in Node.js vm module (CVE-2025-0182)' },
        { type: 'progress', items: [
          { label: 'SQL Injection', pct: 82 },
          { label: 'XSS', pct: 64 },
          { label: 'Path Traversal', pct: 48 },
          { label: 'SSRF', pct: 35 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Exploit attempt blocked', sub: 'api-gateway · 1 min ago', badge: '!' },
          { icon: 'alert', title: 'Suspicious dep added', sub: 'pr/1482 · 14 min ago', badge: '!' },
          { icon: 'check', title: 'Dependency patched', sub: 'axios@1.8.4 · 2 hr ago', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric', label: 'Team Score', value: '88', sub: '5 members · 3 repos active' },
        { type: 'list', items: [
          { icon: 'user', title: 'Kira Patel', sub: 'Lead Eng · 4 repos', badge: '96' },
          { icon: 'user', title: 'Omar Diaz', sub: 'Backend · 3 repos', badge: '88' },
          { icon: 'user', title: 'Nia Chen', sub: 'DevOps · 5 repos', badge: '91' },
          { icon: 'user', title: 'Lev Morin', sub: 'Frontend · 2 repos', badge: '79' },
          { icon: 'user', title: 'Sasha Kim', sub: 'ML Eng · 3 repos', badge: '85' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'pulse',  label: 'Pulse',  icon: 'activity' },
    { id: 'vulns',  label: 'Vulns',  icon: 'alert' },
    { id: 'review', label: 'Review', icon: 'eye' },
    { id: 'intel',  label: 'Intel',  icon: 'zap' },
    { id: 'team',   label: 'Team',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'helix-security-mock', 'Helix — Interactive Mock');
console.log('Mock live at:', result.url);
