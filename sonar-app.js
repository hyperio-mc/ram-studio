'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'sonar';
const NAME  = 'SONAR';
const W     = 390;
const H     = 844;

// ── Palette — "Cockpit Black" ────────────────────────────────────────────────
const BG    = '#080A0F';
const SURF  = '#0E1018';
const CARD  = '#131620';
const LINE  = '#1E2230';
const ACC   = '#06B6D4';   // cyan
const ACC2  = '#F59E0B';   // amber
const WARN  = '#EF4444';   // red
const TEXT  = '#E2E8F0';
const MUT   = 'rgba(226,232,240,0.45)';
const DIM   = 'rgba(226,232,240,0.18)';
const GRID  = 'rgba(6,182,212,0.07)';
const HAIR  = 'rgba(6,182,212,0.22)';

// ── Primitives ───────────────────────────────────────────────────────────────
let EL = 0;
function id() { return `el-${++EL}`; }

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: id(), type: 'rect',
    x, y, width: w, height: h, fill,
    rx: opts.rx || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    id: id(), type: 'text',
    x, y, content, fontSize: size, fill,
    fontWeight: opts.fw || 400,
    fontFamily: opts.font || 'IBM Plex Mono',
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: id(), type: 'circle',
    cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    id: id(), type: 'line',
    x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw || 1,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

// ── Shared components ─────────────────────────────────────────────────────────
function gridOverlay() {
  const els = [];
  // Horizontal hairlines every 40px
  for (let y = 0; y <= H; y += 40) {
    els.push(line(0, y, W, y, GRID, { sw: 0.5, opacity: 1 }));
  }
  // Vertical hairlines every 40px
  for (let x = 0; x <= W; x += 40) {
    els.push(line(x, 0, x, H, GRID, { sw: 0.5, opacity: 1 }));
  }
  return els;
}

function statusBar(statusText) {
  return [
    rect(0, 0, W, 44, SURF),
    text(16, 28, 'SONAR', 11, ACC, { fw: 700, ls: 3 }),
    circle(W - 60, 22, 4, ACC, { opacity: 0.9 }),
    text(W - 52, 28, 'LIVE', 9, ACC, { fw: 600, ls: 2 }),
    text(W - 16, 28, '9:41', 10, MUT, { anchor: 'end' }),
    line(0, 44, W, 44, LINE, { sw: 0.5 }),
  ];
}

function navBar(active) {
  const tabs = [
    { label: 'CTRL',  x: 39  },
    { label: 'STRM',  x: 117 },
    { label: 'ANLY',  x: 195 },
    { label: 'AGNT',  x: 273 },
    { label: 'SYSS',  x: 351 },
  ];
  const els = [
    rect(0, H - 64, W, 64, SURF),
    line(0, H - 64, W, H - 64, LINE, { sw: 0.5 }),
  ];
  tabs.forEach(t => {
    const isActive = t.label === active;
    els.push(text(t.x, H - 28, t.label, 8, isActive ? ACC : DIM, { anchor: 'middle', fw: isActive ? 700 : 400, ls: 1.5 }));
    if (isActive) els.push(rect(t.x - 16, H - 64, 32, 2, ACC));
  });
  return els;
}

// Callout line: draws a hairline from (x1,y1) to elbow then to label
function callout(x1, y1, x2, y2, labelText, side = 'right') {
  const els = [];
  const mx = (x1 + x2) / 2;
  els.push(line(x1, y1, mx, y1, HAIR, { sw: 0.5 }));
  els.push(line(mx, y1, x2, y2, HAIR, { sw: 0.5 }));
  const anchor = side === 'right' ? 'start' : 'end';
  const lx = side === 'right' ? x2 + 4 : x2 - 4;
  els.push(circle(x1, y1, 2, HAIR));
  els.push(circle(x2, y2, 1.5, ACC, { opacity: 0.6 }));
  els.push(text(lx, y2 + 4, labelText, 7, ACC, { opacity: 0.7, anchor, ls: 0.5 }));
  return els;
}

// Mini waveform bar
function waveBar(x, y, w, amplitude, color) {
  const els = [];
  const barW = 2;
  const gap  = 1.5;
  const count = Math.floor(w / (barW + gap));
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const h2 = Math.max(2, amplitude * (0.2 + 0.8 * Math.abs(Math.sin(t * Math.PI * 6 + i * 0.3))));
    els.push(rect(x + i * (barW + gap), y - h2, barW, h2 * 2, color, { rx: 1, opacity: 0.75 + 0.25 * Math.sin(i) }));
  }
  return els;
}

// ── Screen 1: Mission Control ─────────────────────────────────────────────────
function screenMissionControl() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...gridOverlay());
  els.push(...statusBar('LIVE'));

  // Section label
  els.push(text(16, 64, 'MISSION CONTROL', 8, ACC, { fw: 700, ls: 3, opacity: 0.9 }));
  els.push(line(16, 70, 160, 70, ACC, { sw: 0.5, opacity: 0.3 }));

  // Large metric — Active Calls
  els.push(rect(16, 76, W - 32, 90, CARD, { rx: 4, stroke: LINE, sw: 0.5 }));
  els.push(text(28, 103, 'ACTIVE CALLS', 8, MUT, { ls: 2 }));
  els.push(text(28, 138, '247', 44, TEXT, { fw: 700, font: 'IBM Plex Mono' }));
  els.push(text(108, 138, '.3K', 22, ACC, { fw: 500 }));
  // Status dot
  els.push(circle(W - 44, 110, 6, ACC, { opacity: 0.9 }));
  els.push(circle(W - 44, 110, 12, ACC, { opacity: 0.2 }));
  els.push(text(W - 44, 140, 'NOMINAL', 7, ACC, { anchor: 'middle', ls: 2 }));

  // Waveform strip inside metric card
  els.push(...waveBar(28, 155, W - 72, 8, ACC));
  els.push(line(16, 166, W - 16, 166, LINE, { sw: 0.5 }));

  // Three metric mini-cards
  const metrics = [
    { label: 'AVG LATENCY', value: '82ms', sub: '↓12ms', color: ACC2 },
    { label: 'TRANSCRIBED', value: '99.2%', sub: 'accuracy', color: ACC },
    { label: 'ERRORS',      value: '3',    sub: '↓67%',   color: WARN },
  ];
  const mW = (W - 48) / 3;
  metrics.forEach((m, i) => {
    const mx = 16 + i * (mW + 8);
    const my = 178;
    els.push(rect(mx, my, mW, 68, CARD, { rx: 3, stroke: LINE, sw: 0.5 }));
    els.push(text(mx + 10, my + 18, m.label, 6.5, MUT, { ls: 1 }));
    els.push(text(mx + 10, my + 44, m.value, 20, m.color, { fw: 700 }));
    els.push(text(mx + 10, my + 58, m.sub, 8, MUT));
  });

  // Callout annotations on metrics
  els.push(...callout(mW / 2 + 16, 212, 6, 192, '← P95', 'left'));
  els.push(...callout(W - 16 - mW / 2, 212, W - 4, 192, 'CRIT', 'right'));

  // Regional feed — scrollable list area
  els.push(text(16, 266, 'REGIONAL STREAMS', 8, MUT, { ls: 2 }));
  els.push(line(16, 272, W - 16, 272, LINE, { sw: 0.5 }));

  const regions = [
    { name: 'US-EAST-1',     calls: '89', load: 0.72, status: ACC  },
    { name: 'EU-WEST-2',     calls: '61', load: 0.55, status: ACC  },
    { name: 'AP-SOUTH-1',    calls: '43', load: 0.88, status: ACC2 },
    { name: 'US-WEST-2',     calls: '38', load: 0.31, status: ACC  },
    { name: 'SA-EAST-1',     calls: '16', load: 0.41, status: ACC  },
  ];
  regions.forEach((r, i) => {
    const ry = 280 + i * 52;
    els.push(rect(16, ry, W - 32, 46, CARD, { rx: 3, stroke: LINE, sw: 0.5 }));
    els.push(circle(30, ry + 14, 3.5, r.status, { opacity: 0.9 }));
    els.push(text(42, ry + 18, r.name, 9, TEXT, { fw: 600, font: 'IBM Plex Mono' }));
    els.push(text(42, ry + 32, r.calls + ' active calls', 8, MUT));
    // Load bar
    const barX = W - 100;
    els.push(rect(barX, ry + 10, 72, 6, LINE, { rx: 3 }));
    els.push(rect(barX, ry + 10, Math.round(72 * r.load), 6, r.status, { rx: 3, opacity: 0.85 }));
    els.push(text(barX + 76, ry + 17, Math.round(r.load * 100) + '%', 7.5, r.status, { anchor: 'start' }));
    els.push(line(16, ry + 46, W - 16, ry + 46, LINE, { sw: 0.3 }));
  });

  // Callout on load bar
  els.push(...callout(W - 100 + 72 * 0.88, 306, W - 8, 268, 'HIGH', 'right'));

  els.push(...navBar('CTRL'));
  return els;
}

// ── Screen 2: Active Streams ──────────────────────────────────────────────────
function screenActiveStreams() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...gridOverlay());
  els.push(...statusBar('LIVE'));

  els.push(text(16, 64, 'ACTIVE STREAMS', 8, ACC, { fw: 700, ls: 3 }));
  els.push(line(16, 70, 155, 70, ACC, { sw: 0.5, opacity: 0.3 }));

  // Search bar
  els.push(rect(16, 76, W - 32, 36, CARD, { rx: 4, stroke: ACC, sw: 0.5, opacity: 1 }));
  els.push(text(32, 99, '▶ FILTER STREAMS', 9, MUT, { ls: 1 }));
  els.push(text(W - 32, 99, '⌘K', 9, ACC, { anchor: 'end' }));

  // Live call cards
  const calls = [
    { id: 'STR-00291', agent: 'ARIA-7',  duration: '4:23', sentiment: 0.82, status: 'ACTIVE',  lang: 'EN-US' },
    { id: 'STR-00288', agent: 'NOVA-2',  duration: '1:07', sentiment: 0.61, status: 'ACTIVE',  lang: 'ES-MX' },
    { id: 'STR-00285', agent: 'ARIA-7',  duration: '7:14', sentiment: 0.34, status: 'FLAGGED', lang: 'EN-GB' },
    { id: 'STR-00279', agent: 'ECHO-1',  duration: '2:55', sentiment: 0.78, status: 'ACTIVE',  lang: 'FR-FR' },
    { id: 'STR-00274', agent: 'NOVA-2',  duration: '0:43', sentiment: 0.90, status: 'ACTIVE',  lang: 'DE-DE' },
    { id: 'STR-00268', agent: 'CODA-3',  duration: '9:11', sentiment: 0.22, status: 'FLAGGED', lang: 'EN-US' },
  ];

  calls.forEach((c, i) => {
    const cy = 120 + i * 96;
    const statusColor = c.status === 'FLAGGED' ? WARN : ACC;
    const sentColor   = c.sentiment > 0.7 ? ACC : c.sentiment > 0.45 ? ACC2 : WARN;

    els.push(rect(16, cy, W - 32, 90, CARD, { rx: 4, stroke: c.status === 'FLAGGED' ? WARN : LINE, sw: 0.5 }));
    // Header row
    els.push(text(28, cy + 18, c.id, 9, TEXT, { fw: 700, font: 'IBM Plex Mono' }));
    els.push(text(28, cy + 32, c.agent, 8, statusColor, { fw: 600 }));
    // Duration
    els.push(text(W - 28, cy + 18, c.duration, 10, TEXT, { anchor: 'end', fw: 600, font: 'IBM Plex Mono' }));
    els.push(text(W - 28, cy + 32, c.lang, 8, MUT, { anchor: 'end' }));
    // Status badge
    els.push(rect(W - 28 - 50, cy + 40, 50, 16, statusColor, { rx: 2, opacity: 0.15 }));
    els.push(text(W - 28 - 50 + 25, cy + 51, c.status, 7, statusColor, { anchor: 'middle', fw: 700, ls: 1 }));
    // Waveform
    els.push(...waveBar(28, cy + 65, 180, 6, statusColor));
    // Sentiment gauge bar
    const gx = 220;
    els.push(text(gx, cy + 52, 'SENT', 6.5, MUT, { ls: 1 }));
    els.push(rect(gx, cy + 56, 80, 5, LINE, { rx: 2 }));
    els.push(rect(gx, cy + 56, Math.round(80 * c.sentiment), 5, sentColor, { rx: 2, opacity: 0.9 }));
    els.push(text(gx + 84, cy + 62, Math.round(c.sentiment * 100) + '%', 7, sentColor));

    if (i < 5) els.push(line(16, cy + 90, W - 16, cy + 90, LINE, { sw: 0.3 }));
  });

  // Callout on flagged stream
  els.push(...callout(W - 28 - 50 + 25, 305, W + 2, 283, 'ALERT', 'right'));

  els.push(...navBar('STRM'));
  return els;
}

// ── Screen 3: Voice Analytics ─────────────────────────────────────────────────
function screenVoiceAnalytics() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...gridOverlay());
  els.push(...statusBar('LIVE'));

  els.push(text(16, 64, 'VOICE ANALYTICS', 8, ACC, { fw: 700, ls: 3 }));
  els.push(line(16, 70, 152, 70, ACC, { sw: 0.5, opacity: 0.3 }));

  // Time range selector
  const ranges = ['1H', '6H', '24H', '7D'];
  const rW = 44;
  ranges.forEach((r, i) => {
    const active = i === 2;
    const rx = 16 + i * (rW + 4);
    els.push(rect(rx, 76, rW, 24, active ? ACC : CARD, { rx: 3, stroke: active ? ACC : LINE, sw: 0.5 }));
    els.push(text(rx + rW / 2, 92, r, 8, active ? BG : MUT, { anchor: 'middle', fw: active ? 700 : 400, ls: 1 }));
  });

  // Large waveform visualization
  els.push(rect(16, 108, W - 32, 110, CARD, { rx: 4, stroke: LINE, sw: 0.5 }));
  els.push(text(28, 124, 'CALL VOLUME — 24H', 7.5, MUT, { ls: 1.5 }));
  // Draw waveform bars as volume chart
  const chartW = W - 56;
  const bars = 48;
  for (let i = 0; i < bars; i++) {
    const t = i / bars;
    const baseVol = 0.3 + 0.4 * Math.sin(t * Math.PI * 2);
    const vol = Math.max(0.05, baseVol + 0.15 * Math.sin(t * Math.PI * 11));
    const bH = Math.round(vol * 60);
    const bx = 28 + i * (chartW / bars);
    const isNow = i === 40;
    const col = isNow ? ACC2 : ACC;
    els.push(rect(bx, 212 - bH, Math.floor(chartW / bars) - 1, bH, col, { rx: 1, opacity: isNow ? 1 : 0.6 }));
  }
  // X-axis labels
  els.push(text(28, 220, '00:00', 6.5, DIM));
  els.push(text(W / 2, 220, '12:00', 6.5, DIM, { anchor: 'middle' }));
  els.push(text(W - 28, 220, '24:00', 6.5, DIM, { anchor: 'end' }));
  // Callout on peak
  const peakX = 28 + 22 * (chartW / bars);
  els.push(...callout(peakX, 140, peakX + 40, 128, 'PEAK 3PM', 'right'));

  // Sentiment timeline
  els.push(text(16, 238, 'SENTIMENT DISTRIBUTION', 8, MUT, { ls: 2 }));
  els.push(line(16, 244, W - 16, 244, LINE, { sw: 0.5 }));

  const sentBands = [
    { label: 'POSITIVE', pct: 0.58, color: ACC  },
    { label: 'NEUTRAL',  pct: 0.29, color: ACC2 },
    { label: 'NEGATIVE', pct: 0.13, color: WARN },
  ];
  let bandX = 16;
  sentBands.forEach(b => {
    const bW = Math.round((W - 32) * b.pct);
    els.push(rect(bandX, 252, bW - 2, 28, b.color, { opacity: 0.25 }));
    els.push(rect(bandX, 252, bW - 2, 2, b.color, { opacity: 0.9 }));
    els.push(text(bandX + bW / 2, 270, Math.round(b.pct * 100) + '%', 10, b.color, { anchor: 'middle', fw: 700 }));
    bandX += bW;
  });
  sentBands.forEach((b, i) => {
    const lx = 16 + i * 116;
    els.push(circle(lx + 6, 294, 4, b.color, { opacity: 0.8 }));
    els.push(text(lx + 14, 298, b.label, 7.5, MUT, { ls: 1 }));
  });

  // Top intents
  els.push(text(16, 318, 'TOP CALL INTENTS', 8, MUT, { ls: 2 }));
  els.push(line(16, 324, W - 16, 324, LINE, { sw: 0.5 }));

  const intents = [
    { label: 'Billing inquiry',      pct: 0.28, n: '1,243' },
    { label: 'Technical support',    pct: 0.22, n: '976'   },
    { label: 'Account management',   pct: 0.18, n: '799'   },
    { label: 'Product information',  pct: 0.14, n: '621'   },
    { label: 'Complaint / escalate', pct: 0.09, n: '399'   },
  ];
  intents.forEach((it, i) => {
    const iy = 332 + i * 52;
    els.push(text(16, iy + 14, it.label, 9, TEXT));
    els.push(text(W - 16, iy + 14, it.n, 9, MUT, { anchor: 'end', font: 'IBM Plex Mono' }));
    els.push(rect(16, iy + 22, W - 32, 8, LINE, { rx: 4 }));
    els.push(rect(16, iy + 22, Math.round((W - 32) * it.pct), 8, ACC, { rx: 4, opacity: 0.75 }));
  });

  els.push(...navBar('ANLY'));
  return els;
}

// ── Screen 4: Agent Library ───────────────────────────────────────────────────
function screenAgentLibrary() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...gridOverlay());
  els.push(...statusBar('LIVE'));

  els.push(text(16, 64, 'AGENT LIBRARY', 8, ACC, { fw: 700, ls: 3 }));
  els.push(line(16, 70, 145, 70, ACC, { sw: 0.5, opacity: 0.3 }));
  els.push(text(W - 16, 64, '+ NEW', 8, ACC2, { anchor: 'end', fw: 700, ls: 2 }));

  const agents = [
    { name: 'ARIA-7',  role: 'Customer Support',   calls: 1204, rating: '98.2%', voice: 'Neutral F', active: true  },
    { name: 'NOVA-2',  role: 'Sales Qualification', calls: 887,  rating: '94.7%', voice: 'Warm M',    active: true  },
    { name: 'ECHO-1',  role: 'Appointment Booking', calls: 612,  rating: '97.1%', voice: 'Neutral F', active: true  },
    { name: 'CODA-3',  role: 'Technical Triage',    calls: 441,  rating: '91.3%', voice: 'Deep M',    active: false },
    { name: 'MIRA-5',  role: 'Collections',         calls: 309,  rating: '89.6%', voice: 'Firm F',    active: false },
  ];

  agents.forEach((a, i) => {
    const ay = 78 + i * 120;
    els.push(rect(16, ay, W - 32, 114, CARD, { rx: 4, stroke: LINE, sw: 0.5 }));

    // Agent identifier — like a "spec plate"
    els.push(rect(24, ay + 10, 56, 56, BG, { rx: 4, stroke: a.active ? ACC : LINE, sw: 1 }));
    // Stylized waveform icon
    for (let j = 0; j < 5; j++) {
      const bh = [10, 20, 28, 18, 8][j];
      els.push(rect(31 + j * 10, ay + 38 - bh / 2, 6, bh, a.active ? ACC : MUT, { rx: 1, opacity: 0.8 }));
    }
    els.push(text(52, ay + 76, a.voice, 6.5, MUT, { anchor: 'middle', ls: 0.5 }));

    // Agent details
    els.push(text(92, ay + 24, a.name, 13, a.active ? TEXT : MUT, { fw: 700, font: 'IBM Plex Mono' }));
    els.push(text(92, ay + 40, a.role, 8.5, MUT));

    // Active indicator
    const activeColor = a.active ? ACC : DIM;
    els.push(circle(W - 36, ay + 22, 5, activeColor, { opacity: 0.9 }));
    els.push(text(W - 28, ay + 26, a.active ? 'ON' : 'OFF', 7, activeColor, { fw: 700, ls: 1 }));

    // Stats row
    els.push(line(92, ay + 52, W - 24, ay + 52, LINE, { sw: 0.4 }));
    els.push(text(92, ay + 68, 'CALLS', 6.5, DIM, { ls: 1.5 }));
    els.push(text(92, ay + 82, a.calls.toLocaleString(), 11, TEXT, { fw: 600, font: 'IBM Plex Mono' }));
    els.push(text(180, ay + 68, 'ACCURACY', 6.5, DIM, { ls: 1.5 }));
    els.push(text(180, ay + 82, a.rating, 11, a.active ? ACC : MUT, { fw: 600, font: 'IBM Plex Mono' }));

    // Tech callout lines (engineering diagram style)
    els.push(line(80, ay + 37, 90, ay + 37, HAIR, { sw: 0.5 }));
    els.push(circle(80, ay + 37, 1.5, HAIR));
    els.push(text(12, ay + 41, '→', 7, HAIR, { opacity: 0.6 }));
  });

  els.push(...navBar('AGNT'));
  return els;
}

// ── Screen 5: Transcripts ─────────────────────────────────────────────────────
function screenTranscripts() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...gridOverlay());
  els.push(...statusBar('LIVE'));

  els.push(text(16, 64, 'TRANSCRIPT — STR-00291', 8, ACC, { fw: 700, ls: 2 }));
  els.push(line(16, 70, W - 16, 70, LINE, { sw: 0.5 }));

  // Call header
  els.push(rect(16, 76, W - 32, 50, CARD, { rx: 4, stroke: LINE, sw: 0.5 }));
  els.push(text(28, 96, 'ARIA-7  ↔  +1 (555) 021-4422', 9, TEXT, { fw: 600, font: 'IBM Plex Mono' }));
  els.push(text(28, 114, 'Duration: 4:23  ·  Sentiment: 82%  ·  EN-US', 8, MUT));
  els.push(circle(W - 36, 101, 5, ACC, { opacity: 0.9 }));
  els.push(circle(W - 36, 101, 12, ACC, { opacity: 0.15 }));

  // Waveform header strip
  els.push(rect(16, 132, W - 32, 32, BG, { stroke: LINE, sw: 0.5 }));
  els.push(...waveBar(24, 148, W - 48, 7, ACC));
  // Playhead
  els.push(rect(16 + Math.round((W - 32) * 0.61), 132, 1.5, 32, ACC2));
  els.push(text(16 + Math.round((W - 32) * 0.61), 176, '2:41', 7, ACC2, { anchor: 'middle' }));

  // Transcript messages
  const msgs = [
    { speaker: 'ARIA-7', time: '0:04', text: 'Thank you for calling support. My name is Aria. How can I help you today?', agent: true, sentiment: 0.9 },
    { speaker: 'CALLER', time: '0:12', text: "Hi, I'm having trouble with my invoice — it shows a charge I don't recognize.", agent: false, sentiment: 0.55 },
    { speaker: 'ARIA-7', time: '0:24', text: "I understand, let me pull up your account. Could you verify the last four digits of your card?", agent: true, sentiment: 0.85 },
    { speaker: 'CALLER', time: '0:38', text: "It's 4491. And the charge was on March 28th for $149.", agent: false, sentiment: 0.5 },
    { speaker: 'ARIA-7', time: '0:52', text: 'Found it — that appears to be an annual subscription renewal. I can process a refund if you like.', agent: true, sentiment: 0.88 },
    { speaker: 'CALLER', time: '1:08', text: 'Yes please, that would be great!', agent: false, sentiment: 0.92 },
  ];

  let ty = 188;
  msgs.forEach((m, i) => {
    const isAgent = m.agent;
    const bubbleW  = 280;
    const bx = isAgent ? 16 : W - 16 - bubbleW;
    const lineCount = Math.ceil(m.text.length / 42);
    const bH = 18 + lineCount * 14 + 10;

    // Bubble bg
    els.push(rect(bx, ty, bubbleW, bH, isAgent ? CARD : SURF, { rx: 4, stroke: isAgent ? LINE : ACC, sw: 0.5, opacity: 1 }));
    // Sentiment micro bar
    const sentCol = m.sentiment > 0.75 ? ACC : m.sentiment > 0.5 ? ACC2 : WARN;
    els.push(rect(bx + bubbleW - 4, ty, 3, bH, sentCol, { rx: 1, opacity: 0.5 }));

    // Speaker label + time
    els.push(text(bx + 8, ty + 13, m.speaker, 7.5, isAgent ? ACC : MUT, { fw: 700, ls: 1 }));
    els.push(text(bx + bubbleW - 8, ty + 13, m.time, 7, DIM, { anchor: 'end', font: 'IBM Plex Mono' }));

    // Text (wrap manually)
    const words = m.text.split(' ');
    let line2 = ''; let lRow = 0;
    words.forEach(w => {
      if ((line2 + w).length > 40) {
        els.push(text(bx + 8, ty + 26 + lRow * 13, line2.trim(), 8, TEXT));
        line2 = w + ' '; lRow++;
      } else { line2 += w + ' '; }
    });
    if (line2.trim()) els.push(text(bx + 8, ty + 26 + lRow * 13, line2.trim(), 8, TEXT));

    ty += bH + 8;
  });

  // Highlight keyword callout
  els.push(rect(16, ty + 8, W - 32, 30, CARD, { rx: 3, stroke: ACC2, sw: 0.5 }));
  els.push(text(28, ty + 28, '⚡ KEYWORDS: invoice · refund · renewal · card', 7.5, ACC2));

  els.push(...navBar('STRM'));
  return els;
}

// ── Screen 6: System Config ───────────────────────────────────────────────────
function screenSystemConfig() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...gridOverlay());
  els.push(...statusBar('LIVE'));

  els.push(text(16, 64, 'SYSTEM CONFIG', 8, ACC, { fw: 700, ls: 3 }));
  els.push(line(16, 70, 140, 70, ACC, { sw: 0.5, opacity: 0.3 }));

  // System health header
  els.push(rect(16, 78, W - 32, 54, CARD, { rx: 4, stroke: LINE, sw: 0.5 }));
  els.push(circle(28, 105, 8, ACC, { opacity: 0.2 }));
  els.push(circle(28, 105, 4, ACC));
  els.push(text(44, 100, 'SYSTEM OPERATIONAL', 10, TEXT, { fw: 600 }));
  els.push(text(44, 116, 'All services nominal — uptime 99.98%', 8, MUT));
  els.push(text(W - 24, 100, '↑ 99.98%', 9, ACC, { anchor: 'end', fw: 700 }));
  // Mini sparkline
  for (let i = 0; i < 20; i++) {
    const sh = 4 + Math.random() * 4;
    els.push(rect(W - 24 - (20 - i) * 5, 116, 3, sh, ACC, { opacity: 0.5, rx: 1 }));
  }

  // Config sections
  const sections = [
    {
      title: 'TRANSCRIPTION ENGINE',
      params: [
        { key: 'model',           val: 'whisper-v4-turbo',   type: 'string' },
        { key: 'language_detect', val: 'auto',               type: 'bool'   },
        { key: 'diarization',     val: 'enabled',            type: 'bool'   },
        { key: 'word_timestamps', val: 'true',               type: 'bool'   },
      ],
    },
    {
      title: 'VOICE SYNTHESIS',
      params: [
        { key: 'provider',        val: 'elevenlabs-v3',      type: 'string' },
        { key: 'latency_target',  val: '80ms',               type: 'num'    },
        { key: 'streaming',       val: 'enabled',            type: 'bool'   },
      ],
    },
    {
      title: 'ROUTING & FAILOVER',
      params: [
        { key: 'primary_region',  val: 'us-east-1',          type: 'string' },
        { key: 'fallback',        val: 'eu-west-2',           type: 'string' },
        { key: 'timeout',         val: '3500ms',              type: 'num'    },
        { key: 'retry_limit',     val: '3',                   type: 'num'    },
      ],
    },
  ];

  let sy = 140;
  sections.forEach(sec => {
    els.push(text(16, sy + 12, sec.title, 7, ACC, { fw: 700, ls: 2 }));
    els.push(line(16, sy + 16, W - 16, sy + 16, LINE, { sw: 0.5 }));
    sy += 22;

    sec.params.forEach(p => {
      els.push(rect(16, sy, W - 32, 30, CARD, { rx: 3, stroke: LINE, sw: 0.3 }));
      els.push(text(28, sy + 19, p.key, 8.5, MUT, { font: 'IBM Plex Mono' }));
      // Value chip
      const valCol = p.type === 'bool' ? (p.val === 'enabled' || p.val === 'true' ? ACC : WARN) : TEXT;
      els.push(rect(W - 120, sy + 8, 108, 16, BG, { rx: 3, stroke: LINE, sw: 0.5 }));
      els.push(text(W - 64, sy + 19, p.val, 8, valCol, { anchor: 'middle', font: 'IBM Plex Mono', fw: 600 }));
      sy += 34;
    });
    sy += 8;
  });

  // Footer note
  els.push(line(16, sy + 4, W - 16, sy + 4, LINE, { sw: 0.5 }));
  els.push(text(16, sy + 18, 'config v2.14.1  ·  last sync 09:41:03 UTC', 7.5, DIM));

  els.push(...navBar('SYSS'));
  return els;
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Mission Control',  fn: screenMissionControl  },
  { name: 'Active Streams',   fn: screenActiveStreams   },
  { name: 'Voice Analytics',  fn: screenVoiceAnalytics  },
  { name: 'Agent Library',    fn: screenAgentLibrary    },
  { name: 'Transcripts',      fn: screenTranscripts     },
  { name: 'System Config',    fn: screenSystemConfig    },
].map(s => {
  EL = 0;
  const elements = s.fn();
  return { name: s.name, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"/>`, elements };
});

const totalEl = screens.reduce((a, s) => a + s.elements.length, 0);

const pen = {
  version:  '2.8',
  metadata: {
    name:      'SONAR — Voice intelligence, decoded',
    author:    'RAM',
    date:      new Date().toISOString().slice(0, 10),
    theme:     'dark',
    heartbeat: 21,
    elements:  totalEl,
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEl} elements`);
console.log(`Written: ${SLUG}.pen`);
