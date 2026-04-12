import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'MERIDIAN',
  tagline:   'AI-Native Code Review Intelligence',
  archetype: 'productivity',
  palette: {
    bg:      '#08090A',
    surface: '#181A1E',
    text:    '#E2E4E9',
    accent:  '#5E6AD2',
    accent2: '#9B59B6',
    muted:   'rgba(82,87,107,0.65)',
  },
  screens: [
    {
      id: 'queue', label: 'PR Queue',
      content: [
        { type: 'metric', label: 'Open Pull Requests', value: '14', sub: '5 need review · 3 AI agents active' },
        { type: 'metric-row', items: [
          { label: 'Open',     value: '14' },
          { label: 'Review',   value: '5' },
          { label: 'AI Live',  value: '3' },
          { label: 'Approved', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'code',   title: '#847 streaming response via WebSocket', sub: 'AI-reviewed · perf · backend · 12m ago', badge: '◐ Review'    },
          { icon: 'alert',  title: '#846 fix: auth token refresh race',     sub: 'sam · bug · auth · 1h ago',              badge: '● Open'      },
          { icon: 'layers', title: '#845 chore: upgrade react-query v5',    sub: 'priya · deps · 2h ago',                  badge: '● Open'      },
          { icon: 'check',  title: '#844 feat: bento grid dashboard v2',    sub: 'AI-reviewed · ui · 4h ago',              badge: '✓ Approved'  },
          { icon: 'eye',    title: '#843 refactor: API middleware',          sub: 'jordan · refactor · 6h ago',             badge: '○ Draft'     },
        ]},
        { type: 'text', label: 'AI Triage', value: 'AI triaged 3 PRs in the last hour. #847 flagged for performance review, #846 flagged for security review.' },
      ],
    },
    {
      id: 'diff', label: 'Diff View',
      content: [
        { type: 'metric', label: 'PR #847 — feat: streaming chunks', value: '◐', sub: '+184 / −23 lines · 3 files · AI-reviewed' },
        { type: 'tags', label: 'Files', items: ['ws-handler.ts', 'api/stream.ts', '+1 more'] },
        { type: 'list', items: [
          { icon: 'code',  title: '+  const buf = new StreamBuffer()',       sub: 'Line 49 — added',   badge: '+ add'    },
          { icon: 'code',  title: '+  for await (const chunk of req.body)',  sub: 'Line 50 — added',   badge: '+ add'    },
          { icon: 'code',  title: '+    buf.append(chunk)',                  sub: 'Line 51 — added',   badge: '+ add'    },
          { icon: 'alert', title: '-  const data = await req.json()',        sub: 'Line 47 — removed', badge: '- remove' },
          { icon: 'alert', title: '-  socket.send(JSON.stringify(data))',    sub: 'Line 48 — removed', badge: '- remove' },
        ]},
        { type: 'text', label: 'AI Suggestion — Line 50', value: 'Consider error handling for malformed chunks. Wrap the loop body in try/catch to prevent socket crashes on bad input.' },
        { type: 'tags', label: 'Actions', items: ['Approve PR', 'Request Changes', 'Comment'] },
      ],
    },
    {
      id: 'agents', label: 'AI Agents',
      content: [
        { type: 'metric', label: 'Agent Swarm Status', value: '3', sub: 'Running · 9 completed · 2 queued · LIVE' },
        { type: 'metric-row', items: [
          { label: 'Running',   value: '3' },
          { label: 'Completed', value: '9' },
          { label: 'Queued',    value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Reviewer-1',  sub: 'Analyzing PR #847 ws-handler.ts semantic review',   badge: '72% ⟳' },
          { icon: 'activity', title: 'Reviewer-2',  sub: 'Security scan PR #846 auth token refresh flow',     badge: '45% ⟳' },
          { icon: 'activity', title: 'Triager-1',   sub: 'Auto-labeling 4 incoming PRs from main queue',      badge: '88% ⟳' },
          { icon: 'zap',      title: 'Reviewer-3',  sub: 'Deps analysis PR #845 react-query v5 compat',       badge: '◌ Queue' },
          { icon: 'zap',      title: 'Summarizer',  sub: 'Weekly sprint summary 7 merged PRs',                badge: '◌ Queue' },
        ]},
        { type: 'progress', items: [
          { label: 'Reviewer-1 — PR #847', pct: 72 },
          { label: 'Reviewer-2 — PR #846', pct: 45 },
          { label: 'Triager-1 — Queue',    pct: 88 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Sprint 44 — Velocity', value: '87%', sub: 'Merge rate · 52 PRs merged · Sprint best' },
        { type: 'metric-row', items: [
          { label: 'Cycle Time', value: '4.2h' },
          { label: 'Review Lag', value: '1.8h' },
          { label: 'Merged',     value: '52' },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'AI Impact — 47 auto-reviews',   sub: '94% accuracy · 3.1h saved this sprint',  badge: '⟡ AI' },
          { icon: 'activity', title: 'Cycle time improved 18%',       sub: 'From 5.1h avg to 4.2h this sprint',      badge: '↓ 18%' },
          { icon: 'activity', title: 'Review lag down 31%',           sub: 'AI assist enabled faster first-touch',   badge: '↓ 31%' },
          { icon: 'check',    title: 'All time best merge rate',       sub: '87% vs 75% last sprint',                 badge: '↑ Best' },
        ]},
        { type: 'progress', items: [
          { label: 'kai — 18 reviews',   pct: 100 },
          { label: 'priya — 15 reviews', pct: 83  },
          { label: 'sam — 12 reviews',   pct: 67  },
          { label: 'alex — 11 reviews',  pct: 61  },
        ]},
      ],
    },
    {
      id: 'settings', label: 'Settings',
      content: [
        { type: 'metric', label: 'Kai Vasquez — Admin', value: 'KV', sub: 'kai@acme.corp · Workspace: acme-corp' },
        { type: 'tags', label: 'AI Agents', items: ['Auto-triage: ON', 'AI Review: ON', 'Security: OFF', 'Model: Opus 4'] },
        { type: 'list', items: [
          { icon: 'code',    title: 'GitHub',  sub: 'Connected to acme-corp/platform',       badge: '● Live'    },
          { icon: 'message', title: 'Slack',   sub: 'Connected to #engineering-reviews',     badge: '● Live'    },
          { icon: 'layers',  title: 'Linear',  sub: 'Not connected — click to integrate',    badge: 'Connect →' },
        ]},
        { type: 'text', label: 'About', value: 'MERIDIAN v1.0.0 — AI-Native Code Review Intelligence. Built with Claude Opus 4 agents. © 2026 Acme Corp.' },
      ],
    },
  ],
  nav: [
    { id: 'queue',    label: 'Queue',   icon: 'list'     },
    { id: 'diff',     label: 'Diff',    icon: 'code'     },
    { id: 'agents',   label: 'Agents',  icon: 'activity' },
    { id: 'insights', label: 'Insights',icon: 'chart'    },
    { id: 'settings', label: 'Settings',icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for MERIDIAN...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'meridian2-mock', 'MERIDIAN — AI-Native Code Review · Interactive Mock');
console.log('Mock live at:', result.url);
