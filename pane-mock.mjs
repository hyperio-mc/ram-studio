// PANE — Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PANE',
  tagline:   'Your retro-windowed AI workspace',
  archetype: 'ai-knowledge-os',

  // LIGHT theme (primary — STRIDE was dark, rotating to light)
  palette: {
    bg:      '#1A1714',
    surface: '#221F1B',
    text:    '#F2EDE4',
    accent:  '#E0603A',
    accent2: '#5B8EFF',
    muted:   'rgba(242,237,228,0.42)',
  },

  lightPalette: {
    bg:      '#F5F1EB',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#C04B2C',
    accent2: '#4A6FE3',
    muted:   'rgba(26,23,20,0.42)',
  },

  screens: [
    {
      id: 'desktop',
      label: 'Desktop',
      content: [
        { type: 'text', label: 'Good morning, Rakis', value: '3 windows open · AI ready · 12 sources indexed' },
        {
          type: 'metric-row',
          items: [
            { label: 'Open Windows', value: '3' },
            { label: 'Sources', value: '42' },
            { label: 'AI Queries', value: '127' },
          ],
        },
        {
          type: 'list',
          items: [
            { icon: 'layers', title: 'Neural Interfaces Research', sub: 'Document · 2,847 words · 2 min ago', badge: 'ACTIVE' },
            { icon: 'list',   title: 'Source Library', sub: 'Library · 42 sources · 8 unread', badge: '8 new' },
            { icon: 'message',title: 'AI Chat — GPT-5 Turbo', sub: 'Terminal · Thinking...', badge: '●' },
          ],
        },
        {
          type: 'tags',
          label: 'Quick Open',
          items: ['New Document', 'Search All', 'Import PDF', 'Ask AI ✦'],
        },
        {
          type: 'list',
          items: [
            { icon: 'layers', title: 'Climate Policy Draft', sub: 'Today · 3,200 words', badge: '' },
            { icon: 'star',   title: 'arxiv:2401.09981', sub: 'Yesterday · Paper', badge: '★' },
            { icon: 'user',   title: 'Interview Notes — Dr. Park', sub: 'Monday · Note', badge: '' },
          ],
        },
      ],
    },
    {
      id: 'research',
      label: 'Research',
      content: [
        { type: 'metric', label: 'Neural Interfaces Research', value: '2,847', sub: 'words · 11 min read' },
        {
          type: 'text',
          label: 'Document excerpt',
          value: 'Recent advances in high-density electrode arrays have enabled unprecedented signal resolution. Chronic implant studies (Park et al., 2024) demonstrate 94% signal retention across 18-month periods...',
        },
        {
          type: 'list',
          items: [
            { icon: 'zap',    title: 'AI: Conflicting claim found', sub: 'Park et al. vs Yoo 2023 — add qualification?', badge: '!' },
            { icon: 'search', title: '3 related papers on glial scarring', sub: 'Click to explore sources', badge: '3' },
            { icon: 'eye',    title: 'Simplify paragraph 2?', sub: 'AI suggestion · for broader audience', badge: 'AI' },
          ],
        },
        {
          type: 'tags',
          label: 'Sources in use',
          items: ['Park 2024', 'Yoo 2023', 'Lin 2022', 'FDA 2026', '+3 more'],
        },
        {
          type: 'metric-row',
          items: [
            { label: 'Words', value: '2.8K' },
            { label: 'Sources', value: '7' },
            { label: 'Read time', value: '11m' },
          ],
        },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'Source Library', value: '42', sub: 'sources indexed' },
        {
          type: 'metric-row',
          items: [
            { label: 'Unread', value: '8' },
            { label: 'Starred', value: '11' },
            { label: 'PDFs', value: '29' },
          ],
        },
        {
          type: 'list',
          items: [
            { icon: 'star',  title: 'Chronic Neural Interface Stability', sub: 'Park et al. 2024 · Nature Neuroscience', badge: '★' },
            { icon: 'layers',title: 'Glial Response Mitigation via Coating', sub: 'Yoo, Chen, Petrov 2023 · JNE', badge: '✓' },
            { icon: 'user',  title: 'Interview Notes — Dr. Park', sub: 'Personal · Mar 24, 2026', badge: '★' },
            { icon: 'search',title: 'FDA Breakthrough Device Designation', sub: 'fda.gov · Mar 12, 2026', badge: 'new' },
          ],
        },
        { type: 'tags', label: 'Filter by tag', items: ['BCI', 'neuroscience', 'glial', 'regulatory', 'interview'] },
      ],
    },
    {
      id: 'ai-chat',
      label: 'AI Chat',
      content: [
        { type: 'metric', label: 'AI Terminal', value: 'GPT-5', sub: 'Turbo · 127K context · Temp 0.7' },
        {
          type: 'list',
          items: [
            { icon: 'user',    title: 'compare BCI degradation curves', sub: 'You · 09:38', badge: '>' },
            { icon: 'zap',     title: 'Park 2024: 6% / 18mo · Yoo 2023: 18% / 12mo · Lin 2022: 31% / 6mo', sub: 'AI · 89 tokens', badge: '$' },
            { icon: 'user',    title: 'draft synthesis paragraph', sub: 'You · 09:41', badge: '>' },
            { icon: 'activity',title: 'Drafting synthesis...', sub: 'AI · streaming now', badge: '●' },
          ],
        },
        { type: 'text', label: 'Active model', value: 'Context window: 127,420 / 128,000 tokens used. Session #4 · 4 exchanges.' },
        {
          type: 'tags',
          label: 'Quick commands',
          items: ['Summarise', 'Find conflicts', 'Draft section', 'Cite sources', 'Ask follow-up'],
        },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        {
          type: 'metric-row',
          items: [
            { label: 'Sources read', value: '34' },
            { label: 'Words written', value: '18.4K' },
            { label: 'AI queries', value: '127' },
            { label: 'Citing rate', value: '92%' },
          ],
        },
        {
          type: 'progress',
          items: [
            { label: 'Academic papers', pct: 68 },
            { label: 'Web articles', pct: 19 },
            { label: 'Personal notes', pct: 13 },
          ],
        },
        {
          type: 'list',
          items: [
            { icon: 'search',   title: 'Compare BCI degradation curves', sub: '09:38 · 89 tokens', badge: 'AI' },
            { icon: 'search',   title: 'Summarise Park 2024 key findings', sub: '08:15 · 210 tokens', badge: 'AI' },
            { icon: 'activity', title: 'Find contradictions in my claims', sub: 'Yesterday · 143 tokens', badge: 'AI' },
          ],
        },
        {
          type: 'metric-row',
          items: [
            { label: 'Avg session', value: '47m' },
            { label: 'Best day', value: 'Wed' },
            { label: 'Streak', value: '12d' },
          ],
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'PANE Preferences', value: 'v1.0', sub: 'Appearance settings' },
        {
          type: 'tags',
          label: 'Theme',
          items: ['Light ✓', 'Dark', 'System'],
        },
        {
          type: 'tags',
          label: 'Window style',
          items: ['Retro OS ✓', 'Minimal', 'Floating'],
        },
        {
          type: 'tags',
          label: 'Accent colour',
          items: ['Terracotta ✓', 'Electric Blue', 'Forest', 'Violet', 'Amber'],
        },
        {
          type: 'list',
          items: [
            { icon: 'check', title: 'Show OS menubar', sub: 'Enabled · Classic macOS-style menu bar', badge: 'ON' },
            { icon: 'check', title: 'Monospace AI output', sub: 'Enabled · JetBrains Mono for all AI responses', badge: 'ON' },
            { icon: 'check', title: 'Window dot controls', sub: 'Enabled · Traffic light close/min/max buttons', badge: 'ON' },
          ],
        },
        { type: 'text', label: 'PANE v1.0.0', value: 'Design by RAM · March 2026 · Inspired by Minimal Gallery retro OS trend' },
      ],
    },
  ],

  nav: [
    { id: 'desktop',  label: 'Desktop', icon: 'grid' },
    { id: 'research', label: 'Research', icon: 'layers' },
    { id: 'library',  label: 'Library',  icon: 'list' },
    { id: 'ai-chat',  label: 'AI Chat',  icon: 'message' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pane-mock', 'PANE — Interactive Mock');
console.log('Mock live at:', result.url);
