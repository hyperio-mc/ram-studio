import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'LOOM',
  tagline: 'build AI workflows visually',
  archetype: 'ai-workflow-builder',
  palette: {
    bg:      '#060810',
    surface: '#0D0F1E',
    text:    '#E4E8FF',
    accent:  '#7B6FFF',
    accent2: '#4AE8A4',
    muted:   'rgba(228,232,255,0.4)',
  },
  lightPalette: {
    bg:      '#F2F3FF',
    surface: '#FFFFFF',
    text:    '#060810',
    accent:  '#5B50E8',
    accent2: '#00A878',
    muted:   'rgba(6,8,16,0.4)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Executions Today', value: '12,847', sub: '▲ +18.4% vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Active Flows', value: '34' },
          { label: 'Avg Duration', value: '1.4s' },
          { label: 'Tokens Used', value: '4.2M' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Support Triage', sub: 'webhook → gpt-4o → jira', badge: '● 3.2K/day' },
          { icon: 'activity', title: 'Content Pipeline', sub: 'rss → summarize → slack', badge: '● 247/day' },
          { icon: 'alert', title: 'Code Review Bot', sub: 'github → claude → pr', badge: '⚡ 89/day' },
          { icon: 'share', title: 'Lead Enricher', sub: 'crm → research → email', badge: '○ Paused' },
        ]},
      ],
    },
    {
      id: 'canvas', label: 'Build',
      content: [
        { type: 'metric', label: 'Support Triage · Running', value: '3,204', sub: 'Executions today · 98.7% success' },
        { type: 'list', items: [
          { icon: 'zap', title: '⚡ Webhook', sub: 'HTTP Trigger · Entry point', badge: '↓' },
          { icon: 'filter', title: '⊕ Extract', sub: 'JSON Parser · Normalize data', badge: '↓' },
          { icon: 'star', title: '✦ GPT-4o', sub: 'AI · Classify & Route', badge: '●' },
          { icon: 'check', title: '◎ Jira + Slack', sub: 'Output · Create & Notify', badge: '↓' },
        ]},
        { type: 'tags', label: 'Model', items: ['gpt-4o-mini', 'claude-3', 'gemini-2', 'llama-3'] },
      ],
    },
    {
      id: 'runs', label: 'Runs',
      content: [
        { type: 'metric', label: 'Support Triage · Last 24h', value: '3,204', sub: '3,170 success · 34 failed · 98.9% OK' },
        { type: 'progress', items: [
          { label: 'Success rate', pct: 99 },
          { label: 'P95 latency  <2s', pct: 88 },
          { label: 'Token budget', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Run #3204', sub: '1.2s · 847 tokens', badge: '✓ OK' },
          { icon: 'check', title: 'Run #3203', sub: '0.9s · 621 tokens', badge: '✓ OK' },
          { icon: 'alert', title: 'Run #3202', sub: 'Timeout · API unreachable', badge: '✕' },
          { icon: 'check', title: 'Run #3201', sub: '2.1s · 1.2K tokens', badge: '✓ OK' },
        ]},
      ],
    },
    {
      id: 'node', label: 'Config',
      content: [
        { type: 'metric', label: 'GPT-4o Node · Connected', value: 'gpt-4o-mini', sub: 'OpenAI · Latest model' },
        { type: 'tags', label: 'Model', items: ['gpt-4o-mini', 'claude-3.5', 'gemini-2', 'llama-3'] },
        { type: 'progress', items: [
          { label: 'Temperature  0.2', pct: 20 },
          { label: 'Max Tokens  512', pct: 51 },
          { label: 'Top-p  0.9', pct: 90 },
        ]},
        { type: 'text', label: 'System Prompt', value: 'Classify the support ticket as: billing, technical, or account. Extract priority and sentiment. Respond only in JSON.' },
      ],
    },
    {
      id: 'hub', label: 'Hub',
      content: [
        { type: 'metric', label: 'Workflow Templates', value: '120+', sub: 'Ready to deploy · Updated weekly' },
        { type: 'list', items: [
          { icon: 'star', title: 'Smart Support Triage', sub: 'webhook → AI → Jira + Slack', badge: '3.2K' },
          { icon: 'star', title: 'AI Content Summarizer', sub: 'RSS → Summarize → Notion', badge: '1.8K' },
          { icon: 'code', title: 'GitHub PR Reviewer', sub: 'GitHub → AI review → Comment', badge: '1.4K' },
          { icon: 'activity', title: 'Lead Research Agent', sub: 'CRM → Web research → Email', badge: '920' },
        ]},
        { type: 'tags', label: 'New connectors', items: ['Claude 3.7', 'Perplexity', 'Linear', 'Resend'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Flows',  icon: 'home' },
    { id: 'canvas',    label: 'Build',  icon: 'layers' },
    { id: 'runs',      label: 'Runs',   icon: 'activity' },
    { id: 'node',      label: 'Config', icon: 'settings' },
    { id: 'hub',       label: 'Hub',    icon: 'grid' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'loom-mock', 'LOOM — Interactive Mock');
console.log('Mock live at:', result.url);
