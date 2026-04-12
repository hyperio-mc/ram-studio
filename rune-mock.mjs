import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const design = {
  appName:   'Rune',
  tagline:   'Zero-config secret management for teams',
  archetype: 'developer-security',
  palette: {
    bg:      '#06080F',
    surface: '#101822',
    text:    '#E1E7F0',
    accent:  '#34D399',
    accent2: '#818CF8',
    muted:   'rgba(77,107,128,0.4)',
  },
  lightPalette: {
    bg:      '#F5F7FA',
    surface: '#FFFFFF',
    text:    '#111827',
    accent:  '#059669',
    accent2: '#6366F1',
    muted:   'rgba(17,24,39,0.4)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Vault Health', value: '98', sub: '/100 — 2 secrets expiring' },
        { type: 'metric-row', items: [{ label: 'Total Secrets', value: '247' }, { label: 'Environments', value: '4' }] },
        { type: 'metric-row', items: [{ label: 'Rotations', value: '12' }, { label: 'Access Today', value: '1.4K' }] },
        { type: 'text', label: 'Recent Activity', value: 'deploy-bot read DATABASE_URL (prod) · 2m ago' },
        { type: 'list', items: [
          { icon: 'check', title: 'deploy-bot READ DATABASE_URL', sub: 'prod · 2 min ago', badge: '✓' },
          { icon: 'check', title: 'ci-runner READ STRIPE_KEY', sub: 'staging · 8 min ago', badge: '✓' },
          { icon: 'alert', title: 'ip:203.x.x.1 DENIED JWT_SECRET', sub: 'prod · 1 hr ago', badge: '⚠' },
        ]},
      ],
    },
    {
      id: 'envs', label: 'Environments',
      content: [
        { type: 'list', items: [
          { icon: 'check', title: 'production', sub: '84 secrets · 1,847 deploys', badge: 'LIVE' },
          { icon: 'star', title: 'staging', sub: '82 secrets · 433 deploys', badge: 'REVIEW' },
          { icon: 'code', title: 'development', sub: '79 secrets · 2,104 deploys', badge: 'DEV' },
          { icon: 'check', title: 'test', sub: '52 secrets · 891 deploys', badge: 'TEST' },
        ]},
        { type: 'progress', items: [
          { label: 'production health', pct: 100 },
          { label: 'staging health', pct: 96 },
          { label: 'development health', pct: 89 },
          { label: 'test health', pct: 95 },
        ]},
      ],
    },
    {
      id: 'secrets', label: 'Secrets',
      content: [
        { type: 'tags', label: 'Environment', items: ['prod', 'staging', 'dev', 'test'] },
        { type: 'list', items: [
          { icon: 'lock', title: 'DATABASE_URL', sub: '•••••••••••• · accessed 2m', badge: 'DB' },
          { icon: 'lock', title: 'REDIS_URL', sub: '•••••••••••• · accessed 2m', badge: 'DB' },
          { icon: 'alert', title: 'JWT_SECRET', sub: '•••••••••••• · exp in 7d', badge: '7d' },
          { icon: 'lock', title: 'STRIPE_SECRET_KEY', sub: '•••••••••••• · accessed 8m', badge: '3P' },
          { icon: 'lock', title: 'OPENAI_API_KEY', sub: '•••••••••••• · exp in 30d', badge: '30d' },
          { icon: 'lock', title: 'ANTHROPIC_API_KEY', sub: '•••••••••••• · accessed 3h', badge: '3P' },
        ]},
      ],
    },
    {
      id: 'log', label: 'Access Log',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Read', 'Write', 'Denied'] },
        { type: 'list', items: [
          { icon: 'check', title: 'deploy-bot READ DATABASE_URL', sub: '09:41:02 · prod', badge: 'OK' },
          { icon: 'check', title: 'ci-runner READ STRIPE_KEY', sub: '09:39:18 · staging', badge: 'OK' },
          { icon: 'check', title: 'karan.d WRITE OPENAI_KEY', sub: '09:30:44 · dev', badge: 'OK' },
          { icon: 'alert', title: 'ip:203.x.x.1 DENIED JWT_SECRET', sub: '09:17:21 · prod', badge: '⚠' },
          { icon: 'zap', title: 'rotation-svc ROTATED JWT_SECRET', sub: '08:41:00 · prod', badge: '↻' },
        ]},
      ],
    },
    {
      id: 'integrations', label: 'Integrations',
      content: [
        { type: 'text', label: 'Connected', value: '4 active integrations' },
        { type: 'list', items: [
          { icon: 'check', title: 'GitHub Actions', sub: 'CI/CD secret injection', badge: '●' },
          { icon: 'check', title: 'Vercel', sub: 'Env sync on deploy', badge: '●' },
          { icon: 'check', title: 'Slack', sub: 'Rotation & alert notifications', badge: '●' },
          { icon: 'alert', title: 'Datadog', sub: 'Anomaly alerts — review config', badge: '!' },
        ]},
        { type: 'text', label: 'Available to Connect', value: 'AWS Secrets Manager · HashiCorp Vault · Terraform · Kubernetes · Railway' },
      ],
    },
  ],
  nav: [
    { id: 'overview',      label: 'Overview',  icon: 'home' },
    { id: 'envs',          label: 'Envs',       icon: 'layers' },
    { id: 'secrets',       label: 'Secrets',    icon: 'lock' },
    { id: 'log',           label: 'Log',        icon: 'list' },
    { id: 'integrations',  label: 'Connect',    icon: 'share' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

// Save locally
const localPath = path.join(__dirname, 'rune-mock.html');
fs.writeFileSync(localPath, html);
console.log('Mock HTML saved locally:', localPath, `(${(html.length/1024).toFixed(0)}KB)`);

// Try to publish
try {
  const result = await publishMock(html, 'rune-mock', 'Rune — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (e) {
  console.log('Publish blocked (page limit):', e.message.slice(0, 80));
  console.log('Mock saved to:', localPath);
}
