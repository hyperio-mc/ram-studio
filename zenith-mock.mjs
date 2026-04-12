// ZENITH — Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ZENITH',
  tagline:   'Command your AI fleet',
  archetype: 'ai-ops-command',

  // DARK theme (primary — PANE was light, rotating to dark)
  palette: {
    bg:      '#050810',
    surface: '#0C1220',
    text:    '#E8EEFF',
    accent:  '#00CFFF',
    accent2: '#8B5CF6',
    muted:   'rgba(232,238,255,0.40)',
  },

  lightPalette: {
    bg:      '#EFF3FF',
    surface: '#FFFFFF',
    text:    '#0A1628',
    accent:  '#0080CC',
    accent2: '#6B3FA0',
    muted:   'rgba(10,22,40,0.45)',
  },

  screens: [
    {
      id: 'command',
      label: 'Command',
      content: [
        { type: 'metric', label: 'Fleet Uptime', value: '99.7%', sub: '+0.2% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Active Agents', value: '12' },
          { label: 'Success Rate', value: '96.4%' },
          { label: 'Avg Latency', value: '312ms' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Nexus', sub: 'Orchestrator · GPT-4o · 342 tasks', badge: '●' },
          { icon: 'search', title: 'Scout', sub: 'Researcher · Claude 3.6 · 215 tasks', badge: '●' },
          { icon: 'code', title: 'Forge', sub: 'Code Writer · GPT-4o · 189 tasks', badge: '●' },
          { icon: 'chart', title: 'Prism', sub: 'Analyzer · Gemini 1.5 · 407 tasks', badge: '●' },
          { icon: 'star', title: 'Relay', sub: 'Dispatcher · warning · 278 tasks', badge: '⚠' },
        ]},
        { type: 'progress', items: [
          { label: 'Q2 Market Analysis (M-0042)', pct: 67 },
          { label: 'Codebase Refactor (M-0043)', pct: 23 },
          { label: 'Content Pipeline (M-0044)', pct: 89 },
          { label: 'Data Reconciliation (M-0045)', pct: 5 },
        ]},
      ],
    },
    {
      id: 'agents',
      label: 'Agents',
      content: [
        { type: 'text', label: 'Agent Profile', value: 'Nexus — Orchestrator · GPT-4o · Created Jan 14, 2026' },
        { type: 'metric-row', items: [
          { label: 'Tasks Total', value: '8,342' },
          { label: 'Today', value: '342' },
          { label: 'Success', value: '97.8%' },
        ]},
        { type: 'tags', label: 'Capabilities', items: ['Task routing', 'Agent coordination', 'Priority arbitration', 'Error recovery'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Scout', sub: 'Researcher · active · 98.8% uptime', badge: '●' },
          { icon: 'code', title: 'Forge', sub: 'Code Writer · active · 97.4% uptime', badge: '●' },
          { icon: 'chart', title: 'Prism', sub: 'Analyzer · active · 99.9% uptime', badge: '●' },
          { icon: 'star', title: 'Echo', sub: 'Summarizer · idle · 100% uptime', badge: '○' },
          { icon: 'zap', title: 'Relay', sub: 'Dispatcher · warning · 98.3% uptime', badge: '⚠' },
        ]},
      ],
    },
    {
      id: 'missions',
      label: 'Missions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Running', value: '4' },
          { label: 'Queued', value: '2' },
          { label: 'Done Today', value: '18' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Q2 Market Analysis', sub: 'Scout, Prism · running · 67% · ETA 2h 14m', badge: '▶' },
          { icon: 'code', title: 'Codebase Refactor', sub: 'Forge, Nexus · running · 23% · ETA 5h 40m', badge: '▶' },
          { icon: 'check', title: 'Content Pipeline', sub: 'Echo, Relay · finalizing · 89% · ETA 22m', badge: '⟳' },
          { icon: 'alert', title: 'Legal Doc Review', sub: 'Prism · running · 41% · CRITICAL priority', badge: '!' },
          { icon: 'list', title: 'Data Reconciliation', sub: 'Vault, Prism · queued · ~6h', badge: '◷' },
        ]},
        { type: 'progress', items: [
          { label: 'Q2 Market Analysis', pct: 67 },
          { label: 'Codebase Refactor', pct: 23 },
          { label: 'Content Pipeline', pct: 89 },
          { label: 'Legal Doc Review', pct: 41 },
        ]},
      ],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      content: [
        { type: 'metric-row', items: [
          { label: 'Critical', value: '0' },
          { label: 'Warning', value: '3' },
          { label: 'Resolved', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Relay: Elevated error rate', sub: '4.2% error rate (threshold 2%) · 09:31 UTC · active', badge: '⚠' },
          { icon: 'alert', title: 'Forge: Token budget at 78%', sub: '78% of daily allocation · 09:18 UTC · active', badge: '⚠' },
          { icon: 'alert', title: 'Nexus: Latency spike M-0042', sub: '890ms (3× baseline) · 08:54 UTC · active', badge: '⚠' },
          { icon: 'check', title: 'Vault: Memory index rebuilt', sub: '1,240 new entries indexed · 08:30 UTC · resolved', badge: '✓' },
          { icon: 'check', title: 'System: Claude 3.5→3.6 migration', sub: 'Scout + Echo migrated · 03:00 UTC · resolved', badge: '✓' },
        ]},
        { type: 'text', label: 'Alert Policy', value: 'Auto-throttle enabled for all agents above 2% error rate. Token budget alerts at 75% and 90% thresholds.' },
      ],
    },
    {
      id: 'deploy',
      label: 'Deploy',
      content: [
        { type: 'text', label: 'Step 2 of 4 — Model Configuration', value: 'Choose a foundation model for your new agent. Cost and latency estimates shown per model.' },
        { type: 'list', items: [
          { icon: 'zap', title: 'GPT-4o', sub: 'OpenAI · Fast + Versatile · ~280ms · $$', badge: '○' },
          { icon: 'star', title: 'Claude 3.6', sub: 'Anthropic · Reasoning + Long ctx · ~340ms · $$', badge: '●' },
          { icon: 'eye', title: 'Gemini 1.5 Pro', sub: 'Google · Multimodal · ~410ms · $$$', badge: '○' },
          { icon: 'activity', title: 'GPT-4o Mini', sub: 'OpenAI · Lightweight + Budget · ~140ms · $', badge: '○' },
        ]},
        { type: 'tags', label: 'Capabilities Enabled', items: ['Web Search', 'File I/O', 'Persistent Memory', 'Agent-to-Agent Comms'] },
        { type: 'metric-row', items: [
          { label: 'Agent Name', value: 'Spectra' },
          { label: 'Team', value: 'Ops' },
          { label: 'Model', value: 'Claude 3.6' },
        ]},
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Tasks', value: '12,847' },
          { label: 'Success', value: '96.4%' },
          { label: 'Spend', value: '$124.80' },
        ]},
        { type: 'progress', items: [
          { label: 'Prism (token cost)', pct: 26 },
          { label: 'Nexus (token cost)', pct: 19 },
          { label: 'Forge (token cost)', pct: 18 },
          { label: 'Scout (token cost)', pct: 15 },
          { label: 'Vault (token cost)', pct: 10 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'Q2 Market Analysis', sub: '847 tasks · 97.2% success · $14.30 · Running', badge: '▶' },
          { icon: 'code', title: 'Codebase Refactor', sub: '612 tasks · 94.8% success · $22.10 · Running', badge: '▶' },
          { icon: 'check', title: 'Content Pipeline', sub: '1,204 tasks · 98.5% success · $8.70 · Finalizing', badge: '⟳' },
        ]},
        { type: 'text', label: 'This Week', value: 'Task throughput up 18% vs last week. Token spend increased $12.40 due to Forge running larger refactor jobs. Fleet uptime steady at 99.1%.' },
      ],
    },
  ],

  nav: [
    { id: 'command',   label: 'Command',   icon: 'grid' },
    { id: 'agents',    label: 'Agents',    icon: 'user' },
    { id: 'missions',  label: 'Missions',  icon: 'layers' },
    { id: 'alerts',    label: 'Alerts',    icon: 'bell' },
    { id: 'deploy',    label: 'Deploy',    icon: 'plus' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'zenith-ops-mock', 'ZENITH — Interactive Mock');
console.log('Mock live at:', result.url);
