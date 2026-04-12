import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPECTRA',
  tagline:   'Signal intelligence for audio engineers.',
  archetype: 'audio-analysis-dark',
  palette: {
    bg:      '#080B0F',
    surface: '#141B22',
    text:    '#EAF0F7',
    accent:  '#1DDBA6',
    accent2: '#FF7B42',
    muted:   'rgba(143,160,178,0.45)',
  },
  lightPalette: {
    bg:      '#F4F7FA',
    surface: '#FFFFFF',
    text:    '#0D1A26',
    accent:  '#0A9E78',
    accent2: '#D95C1F',
    muted:   'rgba(13,26,38,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Live Dashboard',
      content: [
        { type: 'metric', label: 'LUFS Loudness', value: '-14.2', sub: 'Target: -14 LUFS broadcast' },
        { type: 'metric-row', items: [
          { label: 'Sample Rate', value: '48kHz' },
          { label: 'Bit Depth',   value: '24bit' },
          { label: 'Peak',        value: '-1.8dB' },
        ]},
        { type: 'progress', items: [
          { label: 'Left Channel', pct: 82 },
          { label: 'Right Channel', pct: 78 },
        ]},
        { type: 'text', label: 'Active Preset', value: 'Broadcast Mastering — High Shelf +2dB · Low Cut 60Hz' },
        { type: 'metric', label: 'Session Time', value: '1:24:37', sub: 'Since 08:17 AM' },
        { type: 'tags', label: 'Transport', items: ['● REC', 'MONITOR ON', '48kHz', '24bit'] },
      ],
    },
    {
      id: 'spectrum',
      label: 'Spectrum',
      content: [
        { type: 'metric', label: 'Peak Frequency', value: '82 Hz', sub: '+3.2 dB from baseline' },
        { type: 'metric-row', items: [
          { label: 'Harmonic', value: '164Hz' },
          { label: 'Level',    value: '+3.2dB' },
          { label: 'Bands',    value: '56' },
        ]},
        { type: 'tags', label: 'View Mode', items: ['FFT', '1/3 Oct', 'RTA'] },
        { type: 'progress', items: [
          { label: 'Sub (20–60Hz)', pct: 92 },
          { label: 'Bass (60–250Hz)', pct: 85 },
          { label: 'Low Mid (250–2k)', pct: 60 },
          { label: 'Mid (2k–6k)', pct: 45 },
          { label: 'High (6k–20k)', pct: 30 },
        ]},
        { type: 'text', label: 'Averaging', value: 'Fast — responds quickly to transients' },
      ],
    },
    {
      id: 'bands',
      label: 'EQ Bands',
      content: [
        { type: 'tags', label: 'Preset', items: ['Broadcast Mastering', 'Reset All'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Low Cut', sub: '60 Hz · Q 0.70 · ON',    badge: 'HPF' },
          { icon: 'activity', title: 'Low Shelf', sub: '120 Hz · +3.0 dB · ON', badge: '+3' },
          { icon: 'activity', title: 'Band 1',  sub: '280 Hz · +4.5 dB · ON',  badge: '+4.5' },
          { icon: 'activity', title: 'Band 2',  sub: '3.8 kHz · -2.0 dB · ON', badge: '-2' },
          { icon: 'activity', title: 'High Shelf', sub: '10 kHz · -1.5 dB · ON', badge: '-1.5' },
        ]},
        { type: 'text', label: 'EQ Curve', value: 'Broad low-end boost, presence dip, clean air shelf — optimised for podcast broadcast.' },
      ],
    },
    {
      id: 'sessions',
      label: 'Sessions',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total',    value: '38h' },
          { label: 'Avg',      value: '3h 11m' },
          { label: 'Projects', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Broadcast Mix · Final', sub: 'Today · 1:24 · -14.2 LUFS', badge: 'REC' },
          { icon: 'check',    title: 'Podcast Ep.47 Edit',    sub: 'Yesterday · 2:08 · -16.0 LUFS', badge: 'DONE' },
          { icon: 'check',    title: 'Ambient Session A',     sub: 'Mar 29 · 0:45 · -18.3 LUFS',  badge: 'DONE' },
          { icon: 'check',    title: 'Interview Cleanup',     sub: 'Mar 28 · 1:12 · -15.8 LUFS',  badge: 'DONE' },
          { icon: 'check',    title: 'Sound Design FX',       sub: 'Mar 27 · 3:30 · -20.1 LUFS',  badge: 'DONE' },
        ]},
      ],
    },
    {
      id: 'export',
      label: 'Export',
      content: [
        { type: 'text', label: 'Session', value: 'Broadcast Mix · Final — 1h 24min · 48kHz / 24bit' },
        { type: 'tags', label: 'Format', items: ['WAV ✓', 'FLAC', 'MP3', 'AAC'] },
        { type: 'tags', label: 'Sample Rate', items: ['44.1kHz', '48kHz ✓', '88.2kHz', '96kHz'] },
        { type: 'list', items: [
          { icon: 'share',   title: 'Save to Files', sub: 'WAV · ~500MB · Downloads folder', badge: '✓' },
          { icon: 'message', title: 'Share Link',    sub: '7-day expiry · View-only access',  badge: '' },
        ]},
        { type: 'metric', label: 'Export Ready', value: '~500MB', sub: 'WAV 48kHz 24bit stereo' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Live',     icon: 'activity' },
    { id: 'spectrum',  label: 'Spectrum', icon: 'chart' },
    { id: 'bands',     label: 'Bands',    icon: 'layers' },
    { id: 'sessions',  label: 'Sessions', icon: 'list' },
    { id: 'export',    label: 'Export',   icon: 'share' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'spectra-mock', 'SPECTRA — Interactive Mock');
console.log('Mock live at:', result.url);
