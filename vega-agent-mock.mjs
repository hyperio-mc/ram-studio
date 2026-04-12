// vega-agent-mock.mjs — VEGA Agent Orchestration Console interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VEGA',
  tagline:   'The operating layer for agentic companies',
  archetype: 'agent-orchestration',
  palette: {
    bg:      '#080C14',
    surface: '#0F1521',
    text:    '#E6EDF8',
    accent:  '#4F87FF',
    accent2: '#00E5A0',
    muted:   'rgba(92,107,130,0.6)',
  },
  lightPalette: {
    bg:      '#F5F7FA',
    surface: '#FFFFFF',
    text:    '#0E1521',
    accent:  '#3366EE',
    accent2: '#00A870',
    muted:   'rgba(60,70,90,0.45)',
  },
  screens: [
    {
      id: 'fleet', label: 'Fleet',
      content: [
        { type: 'metric', label: 'Agent Fleet', value: '16 Active', sub: '12 online · 3 paused · 1 incident' },
        { type: 'metric-row', items: [
          { label: 'Throughput', value: '1,847/hr' },
          { label: 'Error rate', value: '0.12%' },
          { label: 'Avg latency', value: '284ms' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Orion — claude-3-7-sonnet', sub: '847 tasks · 312ms avg · 99.2% uptime', badge: 'ONLINE' },
          { icon: 'activity', title: 'Atlas — gpt-4o-mini', sub: '1,204 tasks · 178ms avg · 98.8% uptime', badge: 'BUSY' },
          { icon: 'activity', title: 'Cygnus — claude-3-haiku', sub: '2,810 tasks · 98ms avg · 99.9% uptime', badge: 'ONLINE' },
          { icon: 'alert', title: 'Vela — mistral-large', sub: '62 tasks · 445ms avg · retry loop', badge: '⚠ ALERT' },
          { icon: 'activity', title: 'Lyra — gemini-2.0-flash', sub: '390 tasks · 220ms avg · 97.4% uptime', badge: 'ONLINE' },
        ]},
        { type: 'progress', items: [
          { label: 'Orion capacity', pct: 82 },
          { label: 'Atlas capacity', pct: 61 },
          { label: 'Cygnus capacity', pct: 94 },
        ]},
      ],
    },
    {
      id: 'flows', label: 'Flows',
      content: [
        { type: 'metric', label: 'Active Pipelines', value: '3 Running', sub: 'Customer · DevOps · Finance' },
        { type: 'metric-row', items: [
          { label: 'Pipeline ops', value: 'Customer' },
          { label: 'Throughput', value: '23/hr' },
          { label: 'Health', value: '99.1%' },
        ]},
        { type: 'list', items: [
          { icon: 'filter', title: 'Intake → Classifier', sub: 'Orion · 23 items/hr · 0 queue', badge: '● Live' },
          { icon: 'filter', title: 'Classifier → Resolver', sub: 'Atlas · 19 items/hr · 4 queue', badge: '● Live' },
          { icon: 'filter', title: 'Escalation Branch', sub: 'Lyra · 2 items/hr · low priority', badge: '● Idle' },
          { icon: 'check', title: 'Resolver → Closer', sub: 'Cygnus · resolved 847 today', badge: '● Live' },
        ]},
        { type: 'text', label: 'Pipeline Health', value: '1,847 tasks/hr · 0.12% error · 284ms avg · Vela auto-paused (retry loop detected)' },
      ],
    },
    {
      id: 'monitor', label: 'Monitor',
      content: [
        { type: 'metric', label: 'Orion — Detail', value: '847 tasks', sub: 'claude-3-7-sonnet · online · 99.2% uptime' },
        { type: 'metric-row', items: [
          { label: 'Avg latency', value: '312ms' },
          { label: 'Uptime', value: '99.2%' },
          { label: 'Errors', value: '6 today' },
        ]},
        { type: 'progress', items: [
          { label: 'Task completion rate', pct: 98 },
          { label: 'Context efficiency', pct: 76 },
          { label: 'Cost vs budget', pct: 41 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '09:41 — Classified 14 support tickets', sub: 'Tool: classify · 312ms', badge: '✓' },
          { icon: 'check', title: '09:38 — Drafted resolution #8821', sub: 'Tool: generate · 890ms', badge: '✓' },
          { icon: 'alert', title: '09:35 — Escalated #8819 (neg sentiment)', sub: 'Tool: escalate · 280ms', badge: '↑' },
          { icon: 'check', title: '09:31 — Resolved 7 tier-1 requests', sub: 'Tool: resolve_batch · 1.2s', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'deploy', label: 'Deploy',
      content: [
        { type: 'metric', label: 'Deploy Agent', value: 'New Agent', sub: 'Configure and launch a new autonomous agent' },
        { type: 'tags', label: 'Base Model', items: ['claude-3-7-sonnet', 'gpt-4o-mini', 'gemini-2.0', 'llama-3.3'] },
        { type: 'text', label: 'Role / System Prompt', value: 'You are a customer support specialist. Classify incoming tickets, draft responses for Tier 1, and escalate Tier 2+ with context summary.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Send emails', sub: 'Permission granted', badge: '✓ ON' },
          { icon: 'check', title: 'Access CRM (read)', sub: 'Permission granted', badge: '✓ ON' },
          { icon: 'check', title: 'Escalate to human', sub: 'Permission granted', badge: '✓ ON' },
          { icon: 'lock', title: 'Charge payment', sub: 'Requires manual approval', badge: '✗ OFF' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Deploy mode', value: 'Sandbox' },
          { label: 'Max tokens', value: '200K' },
          { label: 'Retry limit', value: '3×' },
        ]},
      ],
    },
    {
      id: 'incidents', label: 'Incidents',
      content: [
        { type: 'metric', label: 'Incident Feed', value: '1 Critical', sub: '1 warning · 1 info · 1 resolved today' },
        { type: 'list', items: [
          { icon: 'alert', title: '⚠ CRITICAL — Vela retry loop', sub: '09:41 · 3 retries/90s · auto-paused · $0.00 spent post-pause', badge: 'CRIT' },
          { icon: 'alert', title: '⚠ WARNING — Atlas token spike', sub: '09:28 · 3.2× normal usage · reviewing', badge: 'WARN' },
          { icon: 'zap', title: 'INFO — Fleet auto-scaled +2', sub: '09:15 · Cygnus cloned × 2 on load spike', badge: 'INFO' },
          { icon: 'check', title: 'RESOLVED — Orion context reset', sub: '08:55 · Cleared + resumed · no data loss', badge: 'OK' },
        ]},
        { type: 'metric-row', items: [
          { label: 'MTTR today', value: '4.2 min' },
          { label: 'Auto-resolved', value: '87%' },
          { label: 'Paged human', value: '2×' },
        ]},
        { type: 'text', label: 'Vela Incident Detail', value: 'Agent entered infinite retry loop on task #9041 (classify_ticket). Invocation count exceeded threshold (3 retries in 90s). Auto-paused to prevent runaway spend. Manual restart required.' },
      ],
    },
  ],
  nav: [
    { id: 'fleet',     label: 'Fleet',    icon: 'grid' },
    { id: 'flows',     label: 'Flows',    icon: 'share' },
    { id: 'monitor',   label: 'Monitor',  icon: 'activity' },
    { id: 'deploy',    label: 'Deploy',   icon: 'plus' },
    { id: 'incidents', label: 'Alerts',   icon: 'bell' },
  ],
};

console.log('Building VEGA Agent Orchestration mock...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'vega-mock', 'VEGA — Agent Orchestration Console Mock');
console.log('Mock live at:', result.url);
