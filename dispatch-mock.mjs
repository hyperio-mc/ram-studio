import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DISPATCH',
  tagline:   'Your AI agent orchestration layer.',
  archetype: 'ai-agent-orchestration-dark',
  palette: {
    bg:      '#080B0F',
    surface: '#111720',
    text:    '#E4ECF5',
    accent:  '#00D4AA',
    accent2: '#5B8AF0',
    muted:   'rgba(228,236,245,0.4)',
  },
  lightPalette: {
    bg:      '#F4F6FA',
    surface: '#FFFFFF',
    text:    '#0D1420',
    accent:  '#009B7D',
    accent2: '#3B6FD4',
    muted:   'rgba(13,20,32,0.45)',
  },
  nav: [
    { id: 'hub',     label: '⬡ Hub' },
    { id: 'agents',  label: '▶ Agents' },
    { id: 'queue',   label: '≡ Queue' },
    { id: 'history', label: '◷ History' },
    { id: 'config',  label: '⊙ Config' },
  ],
  screens: [
    {
      id: 'hub',
      label: 'Command Center',
      hero: {
        eyebrow: '◉ DISPATCH v2.4.1 · UTC 16:17:35',
        title:   'Command Center',
        subtitle: '5 agents online · 3 tasks running · 60% capacity',
        tag:     '47 tasks today · 94% success',
      },
      metrics: [
        { label: 'TASKS TODAY',   value: '47',   delta: '+12',   up: true },
        { label: 'SUCCESS RATE',  value: '94%',  delta: '44/47', up: true },
        { label: 'AVG DURATION',  value: '2.3m', delta: '-18s',  up: true },
      ],
      alerts: [
        { icon: '▶', msg: 'Analyst-3: Q4 report · 72% · 4 min remain',  tag: 'Running', urgent: false },
        { icon: '▶', msg: 'Writer-2: Blog draft · 41% · 9 min remain',   tag: 'Running', urgent: false },
        { icon: '✗', msg: 'Search-4: Competitor intel — failed at 0:45',  tag: 'Failed',  urgent: true },
      ],
    },
    {
      id: 'agents',
      label: 'Agent Fleet',
      hero: {
        eyebrow: '// FLEET STATUS',
        title:   'Agent Fleet',
        subtitle: '5 agents · 3 running · 2 idle · 1 queued',
        tag:     '60% capacity',
      },
      items: [
        { label: 'Analyst-3 · claude-opus-4.5', sub: '▶ Running: Q4 report · 72% · ETA 4m · $0.28', tag: 'Running' },
        { label: 'Writer-2 · gpt-4o',           sub: '▶ Running: Blog draft · 41% · ETA 9m · $0.09', tag: 'Running' },
        { label: 'Coder-1 · claude-opus-4.5',   sub: '● Idle · Last: Auth refactor · 16:14 · $0.44',  tag: 'Idle' },
        { label: 'Search-4 · perplexity-pro',   sub: '⧖ Queued: Fintech intel · waiting',            tag: 'Queued' },
        { label: 'Vision-5 · gemini-2.0',       sub: '● Idle · Last: Brand audit · 15:52 · $0.06',    tag: 'Idle' },
      ],
    },
    {
      id: 'queue',
      label: 'Dispatch Task',
      hero: {
        eyebrow: '// NEW TASK',
        title:   'Dispatch',
        subtitle: 'Write competitive analysis: Stripe, Adyen, Checkout.com',
        tag:     '◉ Smart route: Analyst-3 + Search-4',
      },
      items: [
        { label: 'Agent: Analyst-3 ✓',   sub: 'claude-opus-4.5 · Research specialist', tag: 'selected' },
        { label: 'Agent: Search-4 ✓',    sub: 'perplexity-pro · Web research',          tag: 'selected' },
        { label: 'Priority: Normal',      sub: 'Low / Normal / High / Critical',         tag: 'priority' },
        { label: 'Stream output: ON',     sub: 'Real-time terminal output enabled',      tag: 'option' },
        { label: 'Est: $0.18–$0.35 · ~6m', sub: '▶ Dispatch Task',                     tag: 'cta' },
      ],
    },
    {
      id: 'history',
      label: 'Live Run',
      hero: {
        eyebrow: '// LIVE · run #47',
        title:   'Analyst-3 Running',
        subtitle: 'Fintech competitive analysis · 2:14 elapsed · 72%',
        tag:     '● Action: write — generating output...',
      },
      items: [
        { label: '[16:17:01] search: "Stripe pricing model 2026"',     sub: '✓ Done', tag: 'done' },
        { label: '[16:17:08] read: stripe.com/docs/billing',            sub: '✓ Done', tag: 'done' },
        { label: '[16:17:22] search: "Adyen vs Stripe developer API"',  sub: '✓ Done', tag: 'done' },
        { label: '[16:18:12] analyze: synthesizing comparison table',   sub: '✓ Done', tag: 'done' },
        { label: '[16:19:02] write: generating Section 3 output... ▋',  sub: 'Live',   tag: 'live' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'dispatch-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
