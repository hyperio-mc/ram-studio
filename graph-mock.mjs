import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GRAPH',
  tagline:   'knowledge graph intelligence for developers',
  archetype: 'developer-tools',

  palette: {
    bg:      '#080C16',
    surface: '#121C36',
    text:    '#E2E8F0',
    accent:  '#22D3EE',
    accent2: '#818CF8',
    muted:   'rgba(100,116,139,0.45)',
  },

  lightPalette: {
    bg:      '#F1F5FB',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#0891B2',
    accent2: '#6366F1',
    muted:   'rgba(15,23,42,0.4)',
  },

  screens: [
    {
      id: 'dashboard', label: 'Dashboard',
      content: [
        { type: 'metric',     label: 'Total Nodes',  value: '1.4M', sub: '+2,341 today' },
        { type: 'metric-row', items: [
          { label: 'EDGES',   value: '8.7M' },
          { label: 'GRAPHS',  value: '23' },
          { label: 'QUERIES', value: '7.2M' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'product-catalog',     sub: '245K nodes · 1.2M edges',  badge: 'active' },
          { icon: 'activity', title: 'user-relationships',  sub: '88K nodes · 3.4M edges',   badge: 'active' },
          { icon: 'layers',   title: 'supply-chain-v2',     sub: '12K nodes · 67K edges',    badge: 'build' },
        ]},
        { type: 'text', label: 'Recent Activity', value: 'Indexed 2,341 nodes · Query executed 847ms · Schema updated +3 edge types' },
        { type: 'progress', items: [
          { label: 'Products cluster', pct: 78 },
          { label: 'Users cluster',    pct: 64 },
          { label: 'Supply cluster',   pct: 43 },
        ]},
      ],
    },
    {
      id: 'query', label: 'Query',
      content: [
        { type: 'metric',     label: 'Last Query',   value: '847ms',  sub: '2,341 rows returned' },
        { type: 'metric-row', items: [
          { label: 'TOTAL',   value: '2.3K' },
          { label: 'SUCCESS', value: '99.8%' },
          { label: 'AVG MS',  value: '312' },
        ]},
        { type: 'tags', label: 'Language', items: ['cypher', 'gremlin', 'sparql', 'graphql'] },
        { type: 'list', items: [
          { icon: 'code',   title: 'MATCH (p:Product)→(c:Category)', sub: '2,341 rows · 847ms', badge: 'OK' },
          { icon: 'code',   title: 'MATCH (u:User)-[:PURCHASED]→()', sub: '14K rows · 1,203ms', badge: 'OK' },
          { icon: 'alert',  title: 'MATCH (n)-[*3..8]->(m)',         sub: '0 rows · 4,201ms',   badge: 'SLOW' },
        ]},
        { type: 'text', label: 'Saved Query', value: 'MATCH (p:Product)-[r:IN_CATEGORY]->(c:Category) WHERE p.price > 500 RETURN p.name, p.price, c.name ORDER BY p.price DESC LIMIT 50' },
      ],
    },
    {
      id: 'schema', label: 'Schema',
      content: [
        { type: 'metric-row', items: [
          { label: 'NODE TYPES', value: '7' },
          { label: 'REL TYPES',  value: '12' },
          { label: 'INDEXES',    value: '18' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Product',  sub: 'id · name · price · sku',       badge: '245K' },
          { icon: 'layers', title: 'Category', sub: 'id · name · parent',            badge: '1.2K' },
          { icon: 'layers', title: 'User',     sub: 'id · email · tier',             badge: '88K' },
          { icon: 'layers', title: 'Brand',    sub: 'id · name · country',           badge: '320' },
        ]},
        { type: 'tags', label: 'Relationships', items: ['IN_CATEGORY','MADE_BY','PURCHASED','REVIEWED','TAGGED_AS'] },
        { type: 'progress', items: [
          { label: 'IN_CATEGORY  245K edges', pct: 82 },
          { label: 'MADE_BY      245K edges', pct: 82 },
          { label: 'PURCHASED    1.4M edges', pct: 100 },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric',     label: 'Health Score',    value: '94',   sub: 'graph connectivity optimal' },
        { type: 'metric-row', items: [
          { label: 'PATTERNS', value: '4' },
          { label: 'ORPHANS',  value: '44' },
          { label: 'CYCLES',   value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'star',    title: 'Clustered Communities', sub: '3 distinct user clusters · 2.3K nodes', badge: 'NEW' },
          { icon: 'zap',     title: 'Hub Nodes',            sub: '12 high-connectivity products',         badge: '' },
          { icon: 'alert',   title: 'Orphan Nodes',         sub: '44 disconnected items found',           badge: 'ACT' },
          { icon: 'alert',   title: 'Cycle Detected',       sub: 'Product→Brand→Product chain',           badge: 'WARN' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday',    pct: 51 },
          { label: 'Wednesday', pct: 58 },
          { label: 'Friday',    pct: 87 },
          { label: 'Sunday',    pct: 100 },
        ]},
      ],
    },
    {
      id: 'api', label: 'API',
      content: [
        { type: 'metric',     label: 'Plan',          value: 'Pro',   sub: '10M queries / month' },
        { type: 'progress', items: [
          { label: 'Queries    7.2M / 10M',    pct: 72 },
          { label: 'Bandwidth  148GB / 500GB', pct: 30 },
          { label: 'Storage    2.4TB / 10TB',  pct: 24 },
        ]},
        { type: 'list', items: [
          { icon: 'lock', title: 'production',  sub: 'gph_sk_••••••••••••4f2a · read/write', badge: 'live' },
          { icon: 'lock', title: 'staging',     sub: 'gph_sk_••••••••••••9c1b · read only',  badge: 'live' },
          { icon: 'lock', title: 'ci-pipeline', sub: 'gph_sk_••••••••••••7e3d · read only',  badge: 'off' },
        ]},
        { type: 'text', label: 'Webhook', value: 'https://api.yourapp.com/graph-hooks — events: node.created · edge.created' },
      ],
    },
  ],

  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home' },
    { id: 'query',     label: 'Query',   icon: 'code' },
    { id: 'schema',    label: 'Schema',  icon: 'layers' },
    { id: 'insights',  label: 'Insights',icon: 'activity' },
    { id: 'api',       label: 'API',     icon: 'key' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html         = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result       = await publishMock(html, 'graph-mock', 'GRAPH — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/graph-mock`);
