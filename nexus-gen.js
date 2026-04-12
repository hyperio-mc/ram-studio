// NEXUS — AI Agent Orchestration Platform
// Inspired by: Runlayer (land-book.com) and LangChain (land-book.com) — enterprise MCP/agent tooling trend
// Dark theme: near-black bg, electric blue accent, teal highlights

const fs = require('fs');

const SLUG = 'nexus';
const APP_NAME = 'Nexus';
const TAGLINE = 'Command your agents';
const ARCHETYPE = 'ai-agent-orchestration';

const palette = {
  background: '#0A0B0F',
  surface: '#12141A',
  surfaceAlt: '#1A1D27',
  border: '#1F2230',
  text: '#E8EAF0',
  textMuted: 'rgba(232,234,240,0.45)',
  accent: '#4F6EF7',
  accentGlow: 'rgba(79,110,247,0.2)',
  accent2: '#00D4AA',
  accent2Glow: 'rgba(0,212,170,0.15)',
  warning: '#F5A623',
  danger: '#E8445A',
  success: '#00D4AA',
};

function makeScreen(id, label, elements) {
  return { id, label, elements };
}

const screens = [
  makeScreen('dashboard', 'Dashboard', [
    {
      type: 'header',
      title: 'Agent Control Center',
      subtitle: 'Sun, Mar 22 · 14:32 UTC',
      badge: { label: '12 active', color: palette.accent2 }
    },
    {
      type: 'metric-row',
      items: [
        { label: 'Active Runs', value: '12', delta: '+3', trend: 'up', color: palette.accent2 },
        { label: 'Queued', value: '47', delta: '+12', trend: 'up', color: palette.accent },
        { label: 'Failed 24h', value: '2', delta: '-5', trend: 'down', color: palette.danger },
        { label: 'Avg Latency', value: '1.4s', delta: '-0.2s', trend: 'down', color: palette.accent },
      ]
    },
    {
      type: 'agent-status-grid',
      label: 'Agent Fleet',
      agents: [
        { name: 'Analyst-01', status: 'running', task: 'Summarize Q1 reports', runtime: '2m 14s', progress: 72 },
        { name: 'Scraper-07', status: 'running', task: 'Web extraction pipeline', runtime: '5m 02s', progress: 48 },
        { name: 'Writer-03', status: 'idle', task: 'Last: Draft press release', runtime: '–', progress: 0 },
        { name: 'Classifier-02', status: 'error', task: 'Token limit exceeded', runtime: '0m 04s', progress: 8 },
      ]
    },
    {
      type: 'run-feed',
      label: 'Recent Runs',
      items: [
        { id: 'run-892', agent: 'Analyst-01', status: 'success', duration: '1m 48s', timestamp: '14:28' },
        { id: 'run-891', agent: 'Classifier-02', status: 'error', duration: '0m 04s', timestamp: '14:24' },
        { id: 'run-890', agent: 'Scraper-07', status: 'success', duration: '6m 11s', timestamp: '14:17' },
        { id: 'run-889', agent: 'Writer-03', status: 'success', duration: '2m 33s', timestamp: '14:02' },
      ]
    },
  ]),

  makeScreen('fleet', 'Fleet', [
    {
      type: 'header',
      title: 'Agent Fleet',
      subtitle: '8 agents configured',
      action: { label: '+ New Agent', color: palette.accent }
    },
    {
      type: 'filter-tabs',
      items: ['All', 'Running', 'Idle', 'Error']
    },
    {
      type: 'agent-list',
      agents: [
        { name: 'Analyst-01', type: 'LLM Chain', model: 'GPT-4o', status: 'running', runs: 892, successRate: '98.7%', color: palette.accent2 },
        { name: 'Scraper-07', type: 'Browser Agent', model: 'Claude 3.5', status: 'running', runs: 342, successRate: '94.1%', color: palette.accent },
        { name: 'Writer-03', type: 'LLM Chain', model: 'GPT-4o', status: 'idle', runs: 1204, successRate: '99.2%', color: palette.accent2 },
        { name: 'Classifier-02', type: 'Embedding', model: 'text-embed-3', status: 'error', runs: 5511, successRate: '97.8%', color: palette.danger },
        { name: 'Router-01', type: 'Orchestrator', model: 'Claude Opus', status: 'idle', runs: 227, successRate: '100%', color: palette.accent },
        { name: 'Monitor-01', type: 'Evaluator', model: 'GPT-4o-mini', status: 'idle', runs: 3890, successRate: '99.9%', color: palette.accent2 },
      ]
    },
  ]),

  makeScreen('run-detail', 'Run Log', [
    {
      type: 'run-header',
      runId: 'run-892',
      agent: 'Analyst-01',
      status: 'success',
      started: '14:26:08',
      duration: '1m 48s',
      tokens: '12,440',
      cost: '$0.037'
    },
    {
      type: 'trace-timeline',
      label: 'Execution Trace',
      steps: [
        { step: 'Init', duration: '0.04s', status: 'ok', detail: 'Loaded context + 3 tools' },
        { step: 'Retrieve', duration: '0.31s', status: 'ok', detail: 'Fetched 12 document chunks' },
        { step: 'Reason', duration: '52.4s', status: 'ok', detail: 'LLM call · 8,342 tok' },
        { step: 'Tool Use', duration: '14.2s', status: 'ok', detail: 'calc_summary × 3' },
        { step: 'Final LLM', duration: '41.8s', status: 'ok', detail: '4,098 tok · output ready' },
        { step: 'Output', duration: '0.02s', status: 'ok', detail: 'Saved to /outputs/run-892' },
      ]
    },
    {
      type: 'output-preview',
      label: 'Output Preview',
      content: 'Q1 revenue up 18% YoY to $4.2M. Customer acquisition cost down 12%. Churn rate improved from 3.4% → 2.1%. Key driver: enterprise segment grew 42%...'
    },
    {
      type: 'eval-scores',
      label: 'Evaluations',
      scores: [
        { name: 'Faithfulness', value: 0.94 },
        { name: 'Relevance', value: 0.98 },
        { name: 'Completeness', value: 0.87 },
      ]
    }
  ]),

  makeScreen('agent-detail', 'Agent', [
    {
      type: 'agent-profile',
      name: 'Analyst-01',
      type: 'LLM Chain',
      model: 'GPT-4o',
      status: 'running',
      created: 'Jan 14, 2026',
      description: 'Summarizes financial documents, earnings calls, and quarterly reports into structured insights.'
    },
    {
      type: 'perf-chart',
      label: '7-Day Performance',
      data: [
        { day: 'Mon', runs: 42, errors: 0 },
        { day: 'Tue', runs: 67, errors: 1 },
        { day: 'Wed', runs: 55, errors: 0 },
        { day: 'Thu', runs: 89, errors: 2 },
        { day: 'Fri', runs: 76, errors: 1 },
        { day: 'Sat', runs: 31, errors: 0 },
        { day: 'Sun', runs: 18, errors: 0 },
      ]
    },
    {
      type: 'config-list',
      label: 'Configuration',
      items: [
        { key: 'Model', value: 'gpt-4o-2024-11-20' },
        { key: 'Temperature', value: '0.2' },
        { key: 'Max Tokens', value: '16,384' },
        { key: 'Memory', value: 'Pinecone (Top-12)' },
        { key: 'Tools', value: 'calc_summary, fetch_ticker, date_range' },
        { key: 'Timeout', value: '120s' },
      ]
    },
  ]),

  makeScreen('mcps', 'MCPs', [
    {
      type: 'header',
      title: 'MCP Integrations',
      subtitle: 'Model Context Protocol connections',
      badge: { label: '5 connected', color: palette.accent }
    },
    {
      type: 'mcp-list',
      items: [
        { name: 'filesystem', version: '1.2.0', status: 'active', calls24h: 1204, description: 'Local file read/write access' },
        { name: 'web-search', version: '2.0.1', status: 'active', calls24h: 342, description: 'Brave Search API integration' },
        { name: 'github', version: '1.1.3', status: 'active', calls24h: 89, description: 'Repo read, PR creation, issue mgmt' },
        { name: 'postgres', version: '0.9.2', status: 'active', calls24h: 2890, description: 'Production DB read-only access' },
        { name: 'slack', version: '1.0.0', status: 'active', calls24h: 47, description: 'Post to #ai-outputs channel' },
        { name: 'notion', version: '0.8.1', status: 'degraded', calls24h: 12, description: 'Workspace knowledge base sync' },
      ]
    },
    {
      type: 'cta',
      label: 'Browse MCP Registry →',
      sublabel: '200+ available integrations',
      color: palette.accent
    }
  ])
];

// Build pen JSON
const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    slug: SLUG,
    theme: 'dark',
    created: new Date().toISOString(),
    inspiration: 'Runlayer (land-book.com) — enterprise MCP/agent orchestration trend; Linear UI refresh (darkmodedesign.com) — calm, consistent dark interfaces',
  },
  palette,
  screens,
  nav: [
    { id: 'dashboard', label: 'Overview', icon: 'grid' },
    { id: 'fleet', label: 'Fleet', icon: 'layers' },
    { id: 'run-detail', label: 'Runs', icon: 'activity' },
    { id: 'agent-detail', label: 'Agent', icon: 'zap' },
    { id: 'mcps', label: 'MCPs', icon: 'code' },
  ]
};

fs.writeFileSync('/workspace/group/design-studio/nexus.pen', JSON.stringify(pen, null, 2));
console.log('✓ nexus.pen written');
console.log(`  Screens: ${screens.length}`);
console.log(`  Theme: dark`);
console.log(`  Inspiration: Runlayer (land-book) + Linear UI refresh (darkmodedesign.com)`);
