// assay-mock.mjs — ASSAY Svelte 5 interactive mock
// Light clinical ice-blue + deep navy + electric blue
// Inspired by ZettaJoule (Awwwards HM) + Mixpanel (Godly.website)

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'ASSAY',
  tagline:   'precision biomedical research platform',
  archetype: 'healthtech-research',

  // DARK palette (toggle — deep navy + electric blue)
  palette: {
    bg:      '#060E1A',
    surface: '#0D1830',
    text:    '#E8F2FF',
    accent:  '#4B82F6',
    accent2: '#06C9B0',
    muted:   'rgba(232,242,255,0.42)',
  },

  // LIGHT palette (primary — clinical ice-blue, ZettaJoule-inspired)
  lightPalette: {
    bg:      '#EBF3FF',
    surface: '#FFFFFF',
    text:    '#0A1628',
    accent:  '#1155EE',
    accent2: '#00B8A0',
    muted:   'rgba(10,22,40,0.48)',
  },

  screens: [
    {
      id: 'overview',
      label: 'Overview',
      content: [
        { type: 'metric', label: '01 / DASHBOARD · MAR 28, 2026', value: 'Research Overview', sub: '12 active trials · 847 subjects enrolled · 3 open alerts · Weekly activity up 14%' },
        { type: 'metric-row', items: [
          { label: 'ACTIVE TRIALS', value: '12'   },
          { label: 'ENROLLED',      value: '847'  },
          { label: 'ALERTS',        value: '3'    },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'PHOENIX-3',  sub: 'Phase II · 234/300 subjects', badge: '+8.4%' },
          { icon: 'activity', title: 'AURORA-1',   sub: 'Phase III · 312/340 subjects', badge: '+12.1%' },
          { icon: 'alert',    title: 'DELTA-7',    sub: 'Phase I · 48/80 subjects', badge: '−2.3%' },
          { icon: 'star',     title: 'VEGA-2',     sub: 'Preclinical · 253 cells', badge: '+5.7%' },
        ]},
        { type: 'text', label: 'AI SUMMARY', value: 'PHOENIX-3 showing strongest efficacy signal. Consider expanding cohort by 30 subjects.' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 72 },
          { label: 'Tue', pct: 85 },
          { label: 'Wed', pct: 63 },
          { label: 'Thu', pct: 90 },
          { label: 'Fri', pct: 78 },
        ]},
      ],
    },
    {
      id: 'trials',
      label: 'Trials',
      content: [
        { type: 'metric', label: '02 / TRIALS · 3 ENROLLING', value: 'Active Trials', sub: 'Phase I through Phase III across 4 concurrent studies' },
        { type: 'list', items: [
          { icon: 'chart',  title: 'PHOENIX-3',  sub: 'Phase II · 234/300 enrolled · Day 47', badge: '78.4%' },
          { icon: 'chart',  title: 'AURORA-1',   sub: 'Phase III · 312/340 enrolled · Day 183', badge: '91.2%' },
          { icon: 'alert',  title: 'DELTA-7',    sub: 'Phase I · 48/80 enrolled · Day 12', badge: '34.1%' },
        ]},
        { type: 'progress', items: [
          { label: 'PHOENIX-3 enrolment', pct: 78 },
          { label: 'AURORA-1 enrolment',  pct: 92 },
          { label: 'DELTA-7 enrolment',   pct: 60 },
        ]},
        { type: 'tags', label: 'TRIAL STAGES', items: ['Pre-clinical', 'Phase I', 'Phase II ✦', 'Phase III'] },
        { type: 'metric-row', items: [
          { label: 'AVG EFFICACY', value: '67.9%' },
          { label: 'TOTAL DAYS',  value: '242' },
          { label: 'SAE COUNT',   value: '2' },
        ]},
      ],
    },
    {
      id: 'markers',
      label: 'Markers',
      content: [
        { type: 'metric', label: '03 / BIOMARKERS · PHOENIX-3', value: 'Biomarker Tracker', sub: 'Real-time values with 7-day trends and normal reference ranges' },
        { type: 'list', items: [
          { icon: 'activity', title: 'IL-6 · 4.2 pg/mL',   sub: 'Interleukin-6 · Normal: < 7.0 · 7d trend', badge: '+0.3' },
          { icon: 'check',    title: 'CRP · 0.8 mg/L',     sub: 'C-Reactive Protein · Normal: < 3.0',        badge: '−0.2' },
          { icon: 'alert',    title: 'TNF-α · 12.1 pg/mL', sub: 'Tumor Necrosis Factor · Normal: < 20.0',    badge: '+1.4' },
          { icon: 'chart',    title: 'CD4 · 743 cells/μL', sub: 'CD4+ T Cell Count · Normal: 500–1200',      badge: '+24' },
        ]},
        { type: 'progress', items: [
          { label: 'IL-6 vs normal limit',   pct: 60 },
          { label: 'CRP vs normal limit',    pct: 27 },
          { label: 'TNF-α vs normal limit',  pct: 61 },
          { label: 'CD4 in target range',    pct: 81 },
        ]},
        { type: 'tags', label: 'STATUS', items: ['Normal', 'Borderline ⚠', 'Tracking', 'All Markers'] },
      ],
    },
    {
      id: 'analysis',
      label: 'Analysis',
      content: [
        { type: 'metric', label: '04 / AI INSIGHTS · GENERATED 09:41', value: 'AI Analysis', sub: 'PHOENIX-3 shows significant efficacy improvement. Recommend accelerating Phase III.' },
        { type: 'progress', items: [
          { label: 'Efficacy signal confidence',  pct: 94 },
          { label: 'Safety profile confidence',   pct: 87 },
          { label: 'Protocol adherence score',    pct: 91 },
          { label: 'Data completeness',           pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'SIGNAL: IL-6 suppression', sub: 'Correlates with XR-448 dosage increase · Detected 2h ago', badge: '94%' },
          { icon: 'alert',  title: 'ANOMALY: Subject 047',     sub: 'Atypical CRP elevation — review recommended · 5h ago',     badge: 'REVIEW' },
          { icon: 'chart',  title: 'TREND: CD4 recovery rate', sub: 'Outperforming Phase II baseline by 31% · 8h ago',           badge: '+31%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'SIGNALS',   value: '8'   },
          { label: 'ANOMALIES', value: '2'   },
          { label: 'TRENDS',    value: '5'   },
        ]},
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric', label: '05 / TEAM · 3 ACTIVE NOW', value: 'Research Team', sub: '8 team members online · 4 investigators · 2 coordinators · 2 scientists' },
        { type: 'list', items: [
          { icon: 'user', title: 'Dr. Kovacs',  sub: 'Principal Investigator · PHOENIX-3 · online now', badge: '●' },
          { icon: 'user', title: 'Sarah Lin',   sub: 'Clinical Statistician · AURORA-1 · online now',   badge: '●' },
          { icon: 'user', title: 'Marc Reyes',  sub: 'Data Coordinator · DELTA-7 · away 2h',            badge: '○' },
          { icon: 'user', title: 'Aiko Tanaka', sub: 'Lab Scientist · PHOENIX-3 · online now',          badge: '●' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Dr. Kovacs updated efficacy endpoint analysis',    sub: '9:41 AM', badge: 'DK' },
          { icon: 'check',    title: 'Sarah Lin reviewed AURORA-1 interim data',        sub: '9:22 AM', badge: 'SL' },
          { icon: 'check',    title: 'Aiko Tanaka added 12 new biomarker readings',     sub: '8:55 AM', badge: 'AT' },
          { icon: 'alert',    title: 'Marc Reyes submitted DELTA-7 SAE report',         sub: '8:30 AM', badge: 'MR' },
        ]},
        { type: 'metric-row', items: [
          { label: 'ONLINE',  value: '8'   },
          { label: 'UPDATES', value: '24'  },
          { label: 'PENDING', value: '3'   },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'overview',  label: 'Overview', icon: 'home'     },
    { id: 'trials',    label: 'Trials',   icon: 'activity' },
    { id: 'markers',   label: 'Markers',  icon: 'chart'    },
    { id: 'analysis',  label: 'Analysis', icon: 'zap'      },
    { id: 'team',      label: 'Team',     icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'assay-mock', 'ASSAY — Interactive Mock');
console.log('Mock live at:', result.url);

fs.writeFileSync('assay-mock.html', html);
console.log('✓ Saved assay-mock.html locally');
