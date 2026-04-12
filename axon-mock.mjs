// axon-mock.mjs — Svelte interactive mock for AXON
// AXON — AI Workflow Router
// Theme: DARK — electric teal + violet on deep charcoal

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Axon',
  tagline:   'Route your AI workflows',
  archetype: 'ai-automation',
  palette: {           // DARK theme
    bg:      '#0D0E12',
    surface: '#13151C',
    text:    '#F0F1F5',
    accent:  '#00D4AA',
    accent2: '#7B61FF',
    muted:   'rgba(240,241,245,0.45)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F2F3F7',
    surface: '#FFFFFF',
    text:    '#0F1014',
    accent:  '#009B7A',
    accent2: '#5B43CC',
    muted:   'rgba(15,16,20,0.42)',
  },
  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric', label: 'Active Workflows', value: '3 / 7', sub: '12 tasks completed today · 98.2% uptime' },
        { type: 'metric-row', items: [
          { label: 'Uptime', value: '98.2%' },
          { label: 'Runs/mo', value: '1,240' },
          { label: 'Avg Latency', value: '4.2s' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'PR Review Assistant', sub: 'github → claude → linear · Running · Step 2/3', badge: 'RUN' },
          { icon: 'layers',   title: 'Daily Standup Summarizer', sub: 'slack → gpt-4 → notion · Queued · 9:00 AM', badge: 'QUE' },
          { icon: 'alert',    title: 'Sentry → Jira Auto-Ticket', sub: 'sentry → claude → jira · Failed · Auth error', badge: 'ERR' },
          { icon: 'check',    title: 'Deploy Monitor', sub: 'github → claude · Success · 0.8s · 8:47 AM', badge: '✓' },
          { icon: 'check',    title: 'Weekly Report Compiler', sub: 'sheets → gpt-4 → slack · Success · Fri 5pm', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'PR Review Assistant', value: 'Running', sub: 'github → claude → linear · Step 2/3 · 4.2s elapsed' },
        { type: 'tags', label: 'Pipeline', items: ['GH: Done', 'Claude: Running', 'Linear: Pending'] },
        { type: 'text', label: 'Live Output (Claude 3.5)', value: 'This PR introduces a new caching layer. Solid implementation. Two issues: 1. Race condition in cache invalidation. 2. Missing error boundary on timeout.' },
        { type: 'progress', items: [
          { label: 'Workflow progress', pct: 66 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Running · 9:41 AM', sub: 'Step 2/3 — Claude analyzing PR #142...', badge: 'NOW' },
          { icon: 'check',    title: 'Success · Yesterday 4:22 PM', sub: 'Completed in 3.1s — Posted to linear/ENG-891', badge: '3.1s' },
          { icon: 'check',    title: 'Success · Yesterday 11:04 AM', sub: 'Completed in 2.8s — Posted to linear/ENG-887', badge: '2.8s' },
          { icon: 'alert',    title: 'Failed · Mar 24, 9:00 AM', sub: 'Auth error: token expired at step 3', badge: '1.2s' },
        ]},
      ],
    },
    {
      id: 'integrations', label: 'Integrations',
      content: [
        { type: 'metric', label: 'Connected Tools', value: '8 of 11', sub: '3 more available to connect' },
        { type: 'tags', label: 'Filter', items: ['All', 'AI Models', 'Code', 'PM', 'Comms'] },
        { type: 'list', items: [
          { icon: 'code',    title: 'GitHub', sub: 'Connected · 12 workflows use this', badge: '12' },
          { icon: 'activity',title: 'Slack', sub: 'Connected · 8 workflows use this', badge: '8' },
          { icon: 'star',    title: 'Claude 3.5 Sonnet', sub: 'Connected · 23 workflows use this', badge: '23' },
          { icon: 'list',    title: 'Linear', sub: 'Connected · 6 workflows use this', badge: '6' },
          { icon: 'layers',  title: 'Notion', sub: 'Connected · 4 workflows use this', badge: '4' },
          { icon: 'alert',   title: 'Sentry', sub: 'Connected · 3 workflows use this', badge: '3' },
          { icon: 'zap',     title: 'Zapier', sub: 'Not connected · Available to add', badge: '+' },
          { icon: 'code',    title: 'HuggingFace', sub: 'Not connected · Available to add', badge: '+' },
        ]},
      ],
    },
    {
      id: 'build', label: 'Build',
      content: [
        { type: 'metric', label: 'New Workflow', value: 'Draft', sub: 'Define trigger + steps to automate your pipeline' },
        { type: 'tags', label: 'Trigger Type', items: ['Schedule', 'Webhook', 'Manual', 'Event'] },
        { type: 'list', items: [
          { icon: 'calendar', title: 'Step 1: GitHub', sub: 'Get pull requests · Trigger: PR opened', badge: '1' },
          { icon: 'star',     title: 'Step 2: Claude 3.5 Sonnet', sub: 'Analyze and summarize PR diff', badge: '2' },
          { icon: 'activity', title: 'Step 3: Slack', sub: 'Post summary to #dev-updates', badge: '3' },
        ]},
        { type: 'text', label: 'AI Suggestion', value: 'Add a Linear step to auto-create tasks from Claude\'s analysis output. This would complete the full review-to-issue pipeline.' },
      ],
    },
    {
      id: 'activity', label: 'Activity',
      content: [
        { type: 'metric', label: 'Today\'s Activity', value: '18 events', sub: '14 successes · 3 errors · 1 running' },
        { type: 'tags', label: 'Filter', items: ['All', 'Running', 'Success', 'Failed', 'Triggered'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'PR Review Assistant · 9:41 AM', sub: 'Workflow started — Analyzing PR #142 (Step 2/3)', badge: 'RUN' },
          { icon: 'check',    title: 'Daily Standup · 9:38 AM', sub: 'Completed in 2.4s — Posted summary to #standup', badge: '✓' },
          { icon: 'alert',    title: 'Sentry → Jira · 9:32 AM', sub: 'Failed at step 3 — Auth error: Jira token expired', badge: '✗' },
          { icon: 'calendar', title: 'Daily Standup Trigger · 9:00 AM', sub: 'Scheduled trigger fired — Collecting Slack messages', badge: 'TRG' },
          { icon: 'check',    title: 'PR Review Assistant · 8:54 AM', sub: 'Completed in 3.1s — Posted to linear/ENG-892', badge: '✓' },
          { icon: 'check',    title: 'Deploy Monitor · 8:47 AM', sub: 'Completed in 0.8s — No issues found in prod', badge: '✓' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Home',       icon: 'home' },
    { id: 'activity',     label: 'Activity',   icon: 'activity' },
    { id: 'build',        label: 'Build',      icon: 'plus' },
    { id: 'integrations', label: 'Tools',      icon: 'layers' },
    { id: 'detail',       label: 'Detail',     icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'axon-mock', 'Axon — Interactive Mock');
console.log('Mock live at:', result.url);
