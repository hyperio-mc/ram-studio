import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DEPTH',
  tagline:   'AI organizational memory for engineering teams',
  archetype: 'ai-knowledge',
  palette: {
    bg:      '#080A12',
    surface: '#0F1120',
    text:    '#E0E2F4',
    accent:  '#818CF8',
    accent2: '#34D399',
    muted:   'rgba(158,163,192,0.42)',
  },
  lightPalette: {
    bg:      '#F4F5FF',
    surface: '#FFFFFF',
    text:    '#1A1B2E',
    accent:  '#6366F1',
    accent2: '#059669',
    muted:   'rgba(26,27,46,0.4)',
  },
  screens: [
    {
      id: 'home',
      label: 'Command Home',
      content: [
        { type: 'metric', label: '✦ Surfaced For You', value: 'Migrate auth to Clerk SDK', sub: 'DECISION · 2h ago · #backend-team' },
        { type: 'metric-row', items: [
          { label: 'Captures Today', value: '518' },
          { label: 'Decisions', value: '12' },
          { label: 'Runbooks', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'message', title: 'Kubernetes node scaling strategy', sub: '#infra · 14m ago', badge: 'DISCUSSION' },
          { icon: 'code', title: 'Remove legacy feature flags — PR #847', sub: '#code · 1h ago', badge: 'CODE' },
          { icon: 'check', title: 'v2.1 launch scope finalized', sub: '#product · 2h ago', badge: 'DECISION' },
        ]},
        { type: 'text', label: 'Signal', value: 'Your team is discussing API rate limits heavily today — 18 mentions across 4 channels, 6 engineers involved.' },
        { type: 'tags', label: 'Active Topics', items: ['Authentication', 'API Rate Limits', 'DB Optimization', 'CI/CD', 'Kubernetes'] },
      ],
    },
    {
      id: 'decision',
      label: 'Decision Detail',
      content: [
        { type: 'metric', label: 'DECISION — Verified', value: 'Migrate auth to Clerk SDK', sub: 'April 8, 2026 · #backend-team · 12 messages' },
        { type: 'text', label: '✦ DEPTH Summary', value: 'Team agreed to replace home-grown JWT with Clerk, citing maintenance burden and MFA requirements. Migration phased over 3 sprints; rollback plan required before cutting over production traffic.' },
        { type: 'list', items: [
          { icon: 'alert', title: '01 — JWT refresh bugs', sub: '3 production bugs/month caused by refresh logic', badge: 'REASON' },
          { icon: 'check', title: '02 — SOC 2 MFA requirement', sub: "Clerk's built-in MFA meets compliance without custom code", badge: 'REASON' },
          { icon: 'zap', title: '03 — Team velocity +20%', sub: 'Estimated gain on auth-related development tasks', badge: 'REASON' },
        ]},
        { type: 'tags', label: 'Related', items: ['JWT deprecation', 'Session cookies', 'OAuth scope audit', 'Clerk SDK'] },
        { type: 'metric-row', items: [
          { label: 'Discussion', value: '47m' },
          { label: 'PRs Linked', value: '3' },
          { label: 'Participants', value: '12' },
        ]},
      ],
    },
    {
      id: 'capture',
      label: 'Capture Sources',
      content: [
        { type: 'metric', label: '● Live Status', value: '4 sources active', sub: 'Last capture 23 seconds ago' },
        { type: 'list', items: [
          { icon: 'message', title: 'Slack', sub: '#eng · #backend · #product · 247 captures', badge: 'ACTIVE' },
          { icon: 'zap', title: 'Linear', sub: 'Workspace: Engineering · 84 captures', badge: 'ACTIVE' },
          { icon: 'code', title: 'GitHub', sub: 'hyperio-mc/api · hyperio-mc/web · 156 captures', badge: 'ACTIVE' },
          { icon: 'layers', title: 'Notion', sub: 'Engineering wiki · 31 captures', badge: 'ACTIVE' },
          { icon: 'play', title: 'Meetings', sub: 'Google Meet · Zoom', badge: 'CONNECT' },
        ]},
        { type: 'progress', items: [
          { label: 'Decision coverage', pct: 82 },
          { label: 'Runbook completeness', pct: 67 },
          { label: 'Context freshness', pct: 91 },
        ]},
      ],
    },
    {
      id: 'graph',
      label: 'Knowledge Graph',
      content: [
        { type: 'metric', label: 'Network Overview', value: '47 nodes · 83 connections', sub: 'Auth migration cluster is most connected' },
        { type: 'list', items: [
          { icon: 'star', title: 'Auth Migration', sub: '8 connections — most linked node', badge: 'DECISION' },
          { icon: 'layers', title: 'Clerk SDK Setup', sub: '5 connections — runbook + PRs', badge: 'RUNBOOK' },
          { icon: 'check', title: 'JWT Deprecation', sub: '5 connections — decision + 3 PRs', badge: 'DECISION' },
          { icon: 'message', title: '#backend-team', sub: '4 connections — source channel', badge: 'SOURCE' },
        ]},
        { type: 'tags', label: 'Node Types', items: ['Decisions (12)', 'Runbooks (8)', 'Discussions (27)', 'PRs (14)', 'Sources (6)'] },
      ],
    },
    {
      id: 'pulse',
      label: 'Team Pulse',
      content: [
        { type: 'metric', label: 'Health Score', value: '84 / 100', sub: 'Up 6% this week · Main gap: API docs at 43%' },
        { type: 'list', items: [
          { icon: 'user', title: 'Jordan L. — Backend', sub: '87 captures this week', badge: '#1' },
          { icon: 'user', title: 'Maya K. — Frontend', sub: '64 captures this week', badge: '#2' },
          { icon: 'user', title: 'Arjun R. — Infra', sub: '52 captures this week', badge: '#3' },
          { icon: 'user', title: 'Priya W. — Product', sub: '41 captures this week', badge: '#4' },
        ]},
        { type: 'progress', items: [
          { label: 'Authentication', pct: 88 },
          { label: 'API Rate Limits', pct: 72 },
          { label: 'DB Optimization', pct: 61 },
          { label: 'CI/CD Pipeline', pct: 44 },
        ]},
      ],
    },
    {
      id: 'query',
      label: 'AI Query',
      content: [
        { type: 'text', label: '✦ Your Question', value: 'Why did we choose Clerk over Auth0?' },
        { type: 'text', label: '✦ DEPTH Answer', value: 'Your team chose Clerk over Auth0 for three reasons: (1) Clerk\'s built-in MFA meets SOC 2 Type II requirements without custom code. (2) Auth0 pricing would increase ~3× at your scale. (3) Clerk\'s SDK has native Next.js integration, reducing migration complexity.' },
        { type: 'list', items: [
          { icon: 'search', title: 'What\'s the rollback plan if Clerk fails?', sub: 'Follow-up suggestion', badge: '→' },
          { icon: 'search', title: 'How long is the migration expected to take?', sub: 'Follow-up suggestion', badge: '→' },
          { icon: 'search', title: 'Which engineers are leading this?', sub: 'Follow-up suggestion', badge: '→' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total Answers', value: '1.2K' },
          { label: 'Confidence', value: '87%' },
          { label: 'Avg Sources', value: '4.8' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',     label: 'Home',    icon: 'home' },
    { id: 'capture',  label: 'Capture', icon: 'plus' },
    { id: 'graph',    label: 'Graph',   icon: 'layers' },
    { id: 'pulse',    label: 'Pulse',   icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'depth-mock', 'DEPTH — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/depth-mock');
