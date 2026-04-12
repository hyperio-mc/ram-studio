import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import https from 'https';

const design = {
  appName:   'COVE',
  tagline:   'Private team documentation hub',
  archetype: 'productivity-tools',
  palette: {           // DARK theme
    bg:      '#040810',
    surface: '#0A1220',
    text:    '#E8EEF8',
    accent:  '#00D4FF',
    accent2: '#9B59FF',
    muted:   'rgba(122,148,196,0.4)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F5F7FC',
    surface: '#FFFFFF',
    text:    '#0D1929',
    accent:  '#0090C8',
    accent2: '#6B35E8',
    muted:   'rgba(13,25,41,0.4)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Active Spaces', value: '4', sub: 'Product · Eng · Design · Onboarding' },
        { type: 'metric-row', items: [
          { label: 'Docs', value: '142' },
          { label: 'Online', value: '3' },
          { label: 'Edits today', value: '26' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Product Roadmap', sub: 'Updated 3m ago · 5 members', badge: '●' },
          { icon: 'code',   title: 'Engineering Wiki', sub: 'Updated 1h ago · 8 members', badge: '●' },
          { icon: 'star',   title: 'Design System', sub: 'Updated 2h ago · 4 members', badge: '●' },
          { icon: 'user',   title: 'Onboarding', sub: 'Updated 1d ago · 12 members', badge: '' },
        ]},
        { type: 'progress', items: [
          { label: 'Q2 Roadmap completion', pct: 65 },
          { label: 'Onboarding redesign', pct: 90 },
          { label: 'API Reference v2', pct: 40 },
        ]},
      ],
    },
    {
      id: 'docs', label: 'Docs',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Pinned', 'Drafts', 'Shared'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Q2 2025 Roadmap', sub: 'Strategy · 3m ago', badge: '📌' },
          { icon: 'calendar', title: 'Sprint 14 Notes', sub: 'Meeting · 1h ago', badge: '📌' },
          { icon: 'code',  title: 'Architecture Decisions', sub: 'Tech · 2h ago', badge: '' },
          { icon: 'search', title: 'User Research Synthesis', sub: 'Research · 4h ago', badge: '' },
          { icon: 'list',  title: 'API Reference v2.4', sub: 'Docs · 1d ago', badge: '' },
          { icon: 'star',  title: 'Retrospective Mar 2025', sub: 'Meeting · 2d ago', badge: '' },
        ]},
      ],
    },
    {
      id: 'doc-view', label: 'Document',
      content: [
        { type: 'metric', label: 'Q2 2025 Roadmap', value: '3 OBJs', sub: 'Updated 3m ago · Alex Kim' },
        { type: 'text', label: 'Overview', value: 'Ship 3 major features by June 30. Focus: collaboration, performance, and onboarding redesign.' },
        { type: 'progress', items: [
          { label: 'OBJ-1 · Real-time Collaboration', pct: 65 },
          { label: 'OBJ-2 · Performance v2', pct: 20 },
          { label: 'OBJ-3 · Onboarding Redesign', pct: 90 },
        ]},
        { type: 'tags', label: 'Tags', items: ['Strategy', 'Q2', 'Product', 'Active'] },
        { type: 'list', items: [
          { icon: 'message', title: 'Jin Lee', sub: '2 comments on this doc', badge: '💬' },
          { icon: 'eye',     title: 'Alex Kim · Maya Reyes', sub: 'Viewing now', badge: '●' },
        ]},
      ],
    },
    {
      id: 'search', label: 'Search',
      content: [
        { type: 'metric', label: 'Search', value: '14', sub: 'results for "roadmap"' },
        { type: 'list', items: [
          { icon: 'layers',  title: 'Q2 2025 Roadmap', sub: 'Product · 5 matches', badge: '5' },
          { icon: 'layers',  title: 'Q3 Roadmap Draft', sub: 'Product · 3 matches', badge: '3' },
          { icon: 'calendar', title: 'Roadmap Review Notes', sub: 'Engineering · 2 matches', badge: '2' },
          { icon: 'list',    title: 'Mobile Roadmap 2025', sub: 'Mobile · 8 matches', badge: '8' },
          { icon: 'grid',    title: 'Stakeholder Deck', sub: 'Strategy · 1 match', badge: '1' },
        ]},
        { type: 'tags', label: 'Recent', items: ['auth flow', 'sprint 14', 'API v2', 'retro'] },
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Members', value: '8' },
          { label: 'Online', value: '3' },
          { label: 'This week', value: '47' },
        ]},
        { type: 'list', items: [
          { icon: 'user',     title: 'Alex Kim · Admin', sub: 'Q2 Roadmap · online now', badge: '●' },
          { icon: 'user',     title: 'Maya Reyes · Editor', sub: 'API Docs · online now', badge: '●' },
          { icon: 'user',     title: 'Jin Lee · Editor', sub: 'Sprint Notes · online now', badge: '●' },
          { icon: 'user',     title: 'Tom Bridges · Viewer', sub: 'Last seen 2h ago', badge: '' },
          { icon: 'user',     title: 'Sara Roth · Editor', sub: 'Last seen 4h ago', badge: '' },
        ]},
        { type: 'tags', label: 'Spaces', items: ['Product', 'Engineering', 'Design', 'Onboarding'] },
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Home',   icon: 'home' },
    { id: 'docs',    label: 'Docs',   icon: 'list' },
    { id: 'doc-view', label: 'Doc',   icon: 'eye' },
    { id: 'search',  label: 'Search', icon: 'search' },
    { id: 'team',    label: 'Team',   icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });

// Delete old slot first
await new Promise((resolve) => {
  const req = https.request({
    hostname: 'zenbin.org', path: '/v1/pages/cove-mock', method: 'DELETE',
    headers: { 'X-Subdomain': 'ram' }
  }, res => { res.resume(); res.on('end', resolve); });
  req.on('error', resolve);
  req.end();
});

const result = await publishMock(html, 'cove-mock', 'COVE — Interactive Mock');
console.log('Mock live at:', result.url);
