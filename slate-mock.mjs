import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Slate',
  tagline:   'Every surface, perfectly specified.',
  archetype: 'material-design-tool',
  palette: {           // DARK theme
    bg:      '#0A0A0A',
    surface: '#141414',
    text:    '#F2EDE8',
    accent:  '#C9B99A',
    accent2: '#8C7F70',
    muted:   'rgba(242,237,232,0.35)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F5F2EE',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#8C6A40',
    accent2: '#B8956A',
    muted:   'rgba(26,22,20,0.4)',
  },
  screens: [
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'Total Materials', value: '48', sub: 'Across 6 boards' },
        { type: 'metric-row', items: [
          { label: 'Metals', value: '18' },
          { label: 'Fabrics', value: '12' },
          { label: 'Polymers', value: '10' },
          { label: 'Ceramic', value: '8' },
        ]},
        { type: 'tags', label: 'Filter by Finish', items: ['All', 'Matte', 'Satin', 'Gloss', 'Brush'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Matte Black Anodized', sub: 'Al 6061 · Type II · 12–25 µm', badge: '✓' },
          { icon: 'layers', title: 'Brushed Aluminum', sub: 'Al 5052 · Ra 0.8–1.6 µm', badge: '↻' },
          { icon: 'layers', title: 'Polished Brass', sub: 'Cu/Zn · Electropolish', badge: '↻' },
          { icon: 'layers', title: 'Forest Wool', sub: 'Merino 18µ · 100% natural', badge: '✓' },
        ]},
        { type: 'text', label: 'Recently Updated', value: 'Matte Black Anodized spec updated by KL · 2h ago' },
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'MATTE BLACK ANODIZED', value: 'Al 6061', sub: 'Type II Sulphuric Acid Anodize' },
        { type: 'progress', items: [
          { label: 'Roughness', pct: 88 },
          { label: 'Reflectance', pct: 12 },
          { label: 'UV Resistance', pct: 95 },
          { label: 'Hardness', pct: 72 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Thickness', sub: '12–25 µm', badge: 'spec' },
          { icon: 'check', title: 'Hardness', sub: '350–500 HV Vickers', badge: 'spec' },
          { icon: 'check', title: 'Seal', sub: 'Hot DI water 95°C / 20 min', badge: 'spec' },
          { icon: 'check', title: 'Standard', sub: 'MIL-A-8625F, ISO 7599', badge: 'spec' },
        ]},
        { type: 'text', label: 'Supplier', value: 'Anodize Labs Inc. · Net 30 · MOQ 50 pieces' },
      ],
    },
    {
      id: 'finish', label: 'Finishes',
      content: [
        { type: 'tags', label: 'Finish Type', items: ['MATTE', 'SATIN', 'GLOSS', 'BRUSH'] },
        { type: 'metric-row', items: [
          { label: 'Ra Min', value: '0.1µm' },
          { label: 'Ra Max', value: '3.2µm' },
          { label: 'Variants', value: '24' },
        ]},
        { type: 'progress', items: [
          { label: 'MATTE  · Roughness', pct: 88 },
          { label: 'SATIN  · Roughness', pct: 55 },
          { label: 'GLOSS  · Roughness', pct: 8 },
          { label: 'BRUSH  · Roughness', pct: 65 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'MATTE', sub: 'Type II Anodize · Low reflectance', badge: '●' },
          { icon: 'eye', title: 'SATIN', sub: '180–220 grit linear · Ra 0.8–1.6µm', badge: '●' },
          { icon: 'eye', title: 'GLOSS', sub: 'Electropolish + Bright Dip · Ra <0.1µm', badge: '●' },
          { icon: 'eye', title: 'BRUSH', sub: 'Rotary grain · 80–100 grit', badge: '●' },
        ]},
      ],
    },
    {
      id: 'spec', label: 'Spec',
      content: [
        { type: 'metric', label: 'Spec Sheet', value: '#MK-001', sub: 'Matte Black Anodized · Rev 3' },
        { type: 'list', items: [
          { icon: 'code', title: '01  PROCESS', sub: 'Type II Sulphuric Acid Anodize per MIL-A-8625F', badge: '→' },
          { icon: 'code', title: '02  THICKNESS', sub: '12–25 µm. Eddy-current probe verification', badge: '→' },
          { icon: 'code', title: '03  HARDNESS', sub: '350–500 HV. ISO 7599:2018 Class C', badge: '→' },
          { icon: 'code', title: '04  TOLERANCE', sub: 'Dimensional ±0.005 mm per surface', badge: '→' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Rev', value: 'v3' },
          { label: 'Updated', value: '2h ago' },
          { label: 'Standard', value: 'MIL-A' },
        ]},
        { type: 'text', label: 'Export', value: 'PDF spec sheet · JSON for PLM · RFQ template ready' },
      ],
    },
    {
      id: 'collab', label: 'Collab',
      content: [
        { type: 'metric', label: 'Project Board', value: 'NX-7', sub: '3 contributors · 4 materials in review' },
        { type: 'metric-row', items: [
          { label: 'Approved', value: '2' },
          { label: 'In Review', value: '2' },
          { label: 'Comments', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Matte Black Anodized', sub: 'Body shell · Approved by KL', badge: '✓' },
          { icon: 'check', title: 'Brushed Aluminum', sub: 'Heat sink · Approved by MR', badge: '✓' },
          { icon: 'alert', title: 'Polished Brass', sub: 'Lens ring · In review — SJ', badge: '↻' },
          { icon: 'alert', title: 'Cognac Leather', sub: 'Grip wrap · Sample pending', badge: '↻' },
        ]},
        { type: 'text', label: 'Latest Comment', value: 'KL: Brass ring approved. Verify anodize doesn\'t conflict with lens coating spec.' },
      ],
    },
  ],
  nav: [
    { id: 'library', label: 'Library',  icon: 'layers' },
    { id: 'detail',  label: 'Detail',   icon: 'eye' },
    { id: 'finish',  label: 'Finishes', icon: 'grid' },
    { id: 'spec',    label: 'Spec',     icon: 'code' },
    { id: 'collab',  label: 'Collab',   icon: 'share' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'slate-mock', 'Slate — Interactive Mock');
console.log('Mock live at:', result.url);
