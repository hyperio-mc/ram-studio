import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PATCH',
  tagline:   'Know your land.',
  archetype: 'precision-agriculture-dark',
  palette: {
    bg:      '#0A0F07',
    surface: '#111A0C',
    text:    '#E8F0E2',
    accent:  '#6ED940',
    accent2: '#E8B233',
    muted:   'rgba(232,240,226,0.45)',
  },
  // lightPalette omitted → auto-derived
  nav: [
    { id: 'map',      label: '🛰 Map' },
    { id: 'overview', label: '◫ Farm' },
    { id: 'sensors',  label: '🌱 Sensors' },
    { id: 'threats',  label: '⚠ Threats' },
    { id: 'yield',    label: '🌾 Yield' },
  ],
  screens: [
    {
      id: 'map',
      label: 'Field Map',
      hero: {
        eyebrow: '🛰 SATELLITE VIEW — NDVI MODE',
        title:   'Willow Creek Farm',
        subtitle: '847 acres · Henderson County · 4 zones active · 3 alerts',
        tag:     '⚠ Zone C Critical',
      },
      metrics: [
        { label: 'ZONE A',  value: '94', delta: 'Healthy',   up: true  },
        { label: 'ZONE B',  value: '71', delta: 'Stressed',  up: false },
        { label: 'ZONE C',  value: '48', delta: 'Critical',  up: false },
      ],
      alerts: [
        { icon: '⚠', msg: 'Zone C — Corn Rootworm detected above economic injury level', tag: 'CRITICAL', urgent: true },
        { icon: '⚡', msg: 'Zone B — Gray Leaf Spot risk elevated. Scout before Friday rain.', tag: 'WARNING', urgent: false },
        { icon: '🛰', msg: 'Zone D healthy (82). West Field NDVI stable this week.', tag: 'OK', urgent: false },
      ],
    },
    {
      id: 'overview',
      label: 'Farm Overview',
      hero: {
        eyebrow: '// SEASON HEALTH · SPRING 2026',
        title:   'Farm Overview',
        subtitle: 'Farm Score 78 · ▲ +4 pts this week · 847 acres under intelligence',
        tag:     '◈ AI insight ready',
      },
      metrics: [
        { label: 'SOIL MOISTURE', value: '68%',    delta: '7-day avg',   up: true  },
        { label: 'CROP STRESS',   value: '3 ZONES', delta: 'Zones B,C,D', up: false },
        { label: 'YIELD FCST',    value: '194 bu',  delta: '+12 vs avg',  up: true  },
      ],
      items: [
        { label: 'North Field (Zone A) — 212 ac', sub: 'Score 94 · Healthy · Nitrogen apply Thu', tag: '✓ Optimal' },
        { label: 'East Field (Zone B) — 180 ac',  sub: 'Score 71 · Moisture stress · Scout Fri', tag: '⚡ Stress' },
        { label: 'South Field (Zone C) — 156 ac', sub: 'Score 48 · Rootworm critical · Act now', tag: '⚠ Critical' },
        { label: 'West Field (Zone D) — 299 ac',  sub: 'Score 82 · Healthy · Routine scouting', tag: '✓ Good' },
      ],
    },
    {
      id: 'sensors',
      label: 'Sensor Detail',
      hero: {
        eyebrow: '🌱 NORTH FIELD · LIVE SENSORS',
        title:   'Soil Intelligence',
        subtitle: '212 acres · 6 active sensors · Last updated 4 minutes ago',
        tag:     '◈ AI recommendation',
      },
      metrics: [
        { label: 'MOISTURE', value: '68%',    delta: 'Optimal >60%', up: true  },
        { label: 'NITROGEN', value: '42 ppm', delta: 'Low — alert',  up: false },
        { label: 'SOIL pH',  value: '6.8',    delta: 'Ideal range',  up: true  },
      ],
      alerts: [
        { icon: '◈', msg: 'AI: Nitrogen deficiency confirmed. Apply 30 lbs/ac before Thursday rain event.', tag: 'ACTION', urgent: true },
        { icon: '◎', msg: 'Soil Temp 61°F at 4" depth — optimal for corn root development.', tag: 'OK', urgent: false },
        { icon: '◉', msg: 'Organic Carbon 3.2% — above county average. Healthy microbial activity.', tag: 'GOOD', urgent: false },
      ],
    },
    {
      id: 'threats',
      label: 'Pest & Disease',
      hero: {
        eyebrow: '⚠ THREAT INTELLIGENCE · ACTIVE',
        title:   '3 Threats Detected',
        subtitle: '1 critical · 1 warning · 1 watch · AI model updated 2h ago',
        tag:     '⚠ Immediate action',
      },
      items: [
        { label: '⚠ CRITICAL — Corn Rootworm · Zone C',      sub: 'Larval density above economic injury level. Immediate soil insecticide required.', tag: 'ACT NOW' },
        { label: '⚡ WARNING — Gray Leaf Spot · Zone B',      sub: 'High humidity + temp favorable. Scout fields before next rain event (Friday).', tag: 'SCOUT' },
        { label: 'ℹ WATCH — Aphid Population · Zones A, D',  sub: 'Low count. Continue weekly scouting. No intervention needed yet.', tag: 'MONITOR' },
        { label: '◈ AI Risk — Disease Pressure 3-Day',       sub: 'NE quadrant high risk window. Fungicide application recommended within 48 hrs.', tag: 'AI MODEL' },
      ],
    },
    {
      id: 'yield',
      label: 'Yield Forecast',
      hero: {
        eyebrow: '🌾 AI YIELD PROJECTION · 2026',
        title:   '194 bu/ac Forecast',
        subtitle: '87% confidence · ▲ +12 bu vs last season · Zone C risk = −8 bu potential',
        tag:     '✦ Season best forecast',
      },
      metrics: [
        { label: 'CONFIDENCE', value: '87%',    delta: 'High accuracy', up: true },
        { label: 'VS LAST YR', value: '+12 bu', delta: '182 → 194',     up: true },
        { label: 'RISK LOSS',  value: '−8 bu',  delta: 'Zone C pest',   up: false },
      ],
      items: [
        { label: 'Rainfall Scenario — 24" projected',  sub: '72% favorable index. On track for strong growing season.', tag: '72%' },
        { label: 'Fertilizer Rate — Optimal',          sub: '85% efficiency. N application this week critical for final push.', tag: '85%' },
        { label: 'Pest Pressure — Moderate',           sub: 'Zone C rootworm reducing yield by est. 8 bu/ac if untreated.', tag: '42%' },
        { label: '◈ Recommendation — ROI Opportunity', sub: 'Treat Zone C this week. Recover +8 bu/ac · Est. ROI $2,400/field.', tag: 'ACT' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'patch-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
