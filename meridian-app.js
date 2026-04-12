#!/usr/bin/env node
// meridian-app.js
// MERIDIAN — AI signal intelligence for growth teams
// Inspired by: Equals (land-book.com) — warm editorial palette + serif type for analytics
// Theme: LIGHT — cream whites, soft yellow, muted mauve, near-black

const fs = require('fs');

const W = 390, H = 844;

const P = {
  bg:      '#F8F5EF',
  surface: '#FFFFFF',
  warm:    '#FBF0CC',
  mauve:   '#B89BB8',
  sage:    '#9EB09A',
  clay:    '#C4856A',
  ink:     '#272320',
  dim:     '#8A8580',
  border:  '#E8E3DB',
  rule:    '#D9D4CB',
};

function rect(x,y,w,h,fill,r=0) {
  return { type:'rect', x, y, w, h, fill, r };
}
function text(content, x, y, size, fill, weight='regular', align='left', font='serif') {
  return { type:'text', content: String(content), x, y, size, fill, weight, align, font };
}
function line(x1,y1,x2,y2,stroke,width=1) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: width };
}
function circle(cx,cy,r,fill) {
  return { type:'circle', cx, cy, r, fill };
}

function navBar(activeLabel) {
  const items = [
    { label: 'Overview', icon: '◈' },
    { label: 'Signals',  icon: '⬡' },
    { label: 'Channels', icon: '◑' },
    { label: 'Insights', icon: '✦' },
  ];
  const layers = [
    rect(0, H-72, W, 72, P.surface),
    line(0, H-72, W, H-72, P.border),
  ];
  const itemW = W / items.length;
  items.forEach((item, i) => {
    const cx = itemW * i + itemW/2;
    const isActive = item.label === activeLabel;
    layers.push(text(item.icon, cx, H-50, isActive?18:16, isActive?P.ink:P.dim, 'regular', 'center', 'sans'));
    layers.push(text(item.label, cx, H-32, 10, isActive?P.ink:P.dim, isActive?'semibold':'regular', 'center', 'sans'));
    if (isActive) {
      layers.push(rect(cx-20, H-74, 40, 2, P.mauve, 1));
    }
  });
  return layers;
}

function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', W/2, 16, 14, P.ink, 'medium', 'center', 'sans'),
    text('...', W-24, 16, 10, P.dim, 'regular', 'right', 'sans'),
  ];
}

function screenOverview() {
  return [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
    text('Meridian', 20, 62, 13, P.mauve, 'medium', 'left', 'sans'),
    text('Good morning, Rakis', 20, 84, 22, P.ink, 'bold', 'left', 'serif'),
    text('March 31, 2026', 20, 104, 12, P.dim, 'regular', 'left', 'sans'),
    circle(W-30, 78, 14, P.warm),
    text('~', W-30, 84, 12, P.ink, 'regular', 'center', 'sans'),
    line(20, 118, W-20, 118, P.rule),
    // Hero metric card
    rect(20, 130, W-40, 110, P.warm, 12),
    text('Total Signal Score', 36, 152, 11, P.dim, 'regular', 'left', 'sans'),
    text('94.2', 36, 196, 52, P.ink, 'bold', 'left', 'serif'),
    text('/ 100', 118, 196, 20, P.dim, 'regular', 'left', 'serif'),
    text('+ 3.1 from last week', 36, 224, 11, P.sage, 'medium', 'left', 'sans'),
    circle(W-90, 192, 3, P.rule),
    circle(W-78, 186, 3, P.rule),
    circle(W-66, 180, 3, P.rule),
    circle(W-54, 174, 3, P.rule),
    circle(W-42, 168, 3, P.rule),
    circle(W-30, 176, 5, P.clay),
    // Metrics
    text('KEY METRICS', 20, 260, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 270, W-20, 270, P.rule),
    rect(20,  278, 110, 72, P.surface, 10),
    text('Conversions', 32, 296, 9, P.dim, 'regular', 'left', 'sans'),
    text('2,841', 32, 322, 20, P.ink, 'bold', 'left', 'serif'),
    text('+12%', 32, 338, 10, P.sage, 'medium', 'left', 'sans'),
    rect(138, 278, 110, 72, P.surface, 10),
    text('Drop-off', 150, 296, 9, P.dim, 'regular', 'left', 'sans'),
    text('18.4%', 150, 322, 20, P.ink, 'bold', 'left', 'serif'),
    text('-2.1%', 150, 338, 10, P.clay, 'medium', 'left', 'sans'),
    rect(256, 278, 110, 72, P.surface, 10),
    text('Engagement', 268, 296, 9, P.dim, 'regular', 'left', 'sans'),
    text('6.2m', 268, 322, 20, P.ink, 'bold', 'left', 'serif'),
    text('+8%', 268, 338, 10, P.sage, 'medium', 'left', 'sans'),
    // Active signals
    text('ACTIVE SIGNALS', 20, 370, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 380, W-20, 380, P.rule),
    rect(20, 390, W-40, 56, P.surface, 10),
    circle(38, 418, 5, P.clay),
    text('Email re-engage spike', 52, 410, 13, P.ink, 'medium', 'left', 'serif'),
    text('Anomaly', 52, 426, 10, P.dim, 'regular', 'left', 'sans'),
    text('2h ago', W-30, 418, 10, P.dim, 'regular', 'right', 'sans'),
    rect(20, 454, W-40, 56, P.surface, 10),
    circle(38, 482, 5, P.sage),
    text('Homepage CTR improving', 52, 474, 13, P.ink, 'medium', 'left', 'serif'),
    text('Trend', 52, 490, 10, P.dim, 'regular', 'left', 'sans'),
    text('4h ago', W-30, 482, 10, P.dim, 'regular', 'right', 'sans'),
    rect(20, 518, W-40, 56, P.surface, 10),
    circle(38, 546, 5, P.mauve),
    text('Mobile cart abandonment', 52, 538, 13, P.ink, 'medium', 'left', 'serif'),
    text('Alert', 52, 554, 10, P.dim, 'regular', 'left', 'sans'),
    text('6h ago', W-30, 546, 10, P.dim, 'regular', 'right', 'sans'),
    ...navBar('Overview'),
  ];
}

function screenSignals() {
  return [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
    text('Signal Feed', 20, 68, 22, P.ink, 'bold', 'left', 'serif'),
    text('AI-detected patterns and anomalies', 20, 88, 12, P.dim, 'regular', 'left', 'sans'),
    // Filter pills
    rect(20, 100, 68, 24, P.ink, 12),
    text('All', 54, 116, 11, P.bg, 'medium', 'center', 'sans'),
    rect(96, 100, 68, 24, P.surface, 12),
    text('Anomaly', 130, 116, 11, P.dim, 'regular', 'center', 'sans'),
    rect(172, 100, 68, 24, P.surface, 12),
    text('Trend', 206, 116, 11, P.dim, 'regular', 'center', 'sans'),
    rect(248, 100, 68, 24, P.surface, 12),
    text('Alert', 282, 116, 11, P.dim, 'regular', 'center', 'sans'),
    line(0, 134, W, 134, P.rule),
    // Card 1 — Anomaly
    rect(20, 146, W-40, 158, P.surface, 12),
    rect(32, 160, 68, 18, '#FDF0E8', 4),
    text('ANOMALY', 66, 172, 9, P.clay, 'bold', 'center', 'sans'),
    rect(W-60, 156, 36, 24, P.warm, 8),
    text('9.4', W-42, 171, 13, P.ink, 'bold', 'center', 'serif'),
    text('Email re-engagement spike', 32, 194, 14, P.ink, 'bold', 'left', 'serif'),
    text('Open rates on dormant segment up 340%', 32, 212, 10, P.dim, 'regular', 'left', 'sans'),
    text('following Tuesday campaign. Subject line', 32, 226, 10, P.dim, 'regular', 'left', 'sans'),
    text('A/B test winner likely the cause.', 32, 240, 10, P.dim, 'regular', 'left', 'sans'),
    text('Today, 2:14 am', 32, 262, 10, P.dim, 'regular', 'left', 'sans'),
    text('Investigate', W-32, 262, 11, P.mauve, 'medium', 'right', 'sans'),
    line(20, 284, W-20, 284, P.border),
    // Card 2 — Trend
    rect(20, 314, W-40, 158, P.surface, 12),
    rect(32, 328, 68, 18, '#EFF5EE', 4),
    text('TREND', 66, 340, 9, P.sage, 'bold', 'center', 'sans'),
    rect(W-60, 320, 36, 24, P.warm, 8),
    text('7.1', W-42, 335, 13, P.ink, 'bold', 'center', 'serif'),
    text('Homepage scroll depth improving', 32, 360, 14, P.ink, 'bold', 'left', 'serif'),
    text('Users scrolling 40% further since last nav', 32, 378, 10, P.dim, 'regular', 'left', 'sans'),
    text('update. Hero section engagement up', 32, 392, 10, P.dim, 'regular', 'left', 'sans'),
    text('across all devices.', 32, 406, 10, P.dim, 'regular', 'left', 'sans'),
    text('Today, 6:30 am', 32, 428, 10, P.dim, 'regular', 'left', 'sans'),
    text('Investigate', W-32, 428, 11, P.mauve, 'medium', 'right', 'sans'),
    line(20, 452, W-20, 452, P.border),
    // Card 3 — Alert
    rect(20, 482, W-40, 158, P.surface, 12),
    rect(32, 496, 68, 18, '#F5EFF5', 4),
    text('ALERT', 66, 508, 9, P.mauve, 'bold', 'center', 'sans'),
    rect(W-60, 488, 36, 24, P.warm, 8),
    text('8.8', W-42, 503, 13, P.ink, 'bold', 'center', 'serif'),
    text('Mobile checkout drop-off alert', 32, 528, 14, P.ink, 'bold', 'left', 'serif'),
    text('Step 2 abandonment rose from 22% to 31%', 32, 546, 10, P.dim, 'regular', 'left', 'sans'),
    text('on iOS. No recent deploy — possible', 32, 560, 10, P.dim, 'regular', 'left', 'sans'),
    text('payment UI regression.', 32, 574, 10, P.dim, 'regular', 'left', 'sans'),
    text('Yesterday, 11:52 pm', 32, 596, 10, P.dim, 'regular', 'left', 'sans'),
    text('Investigate', W-32, 596, 11, P.mauve, 'medium', 'right', 'sans'),
    ...navBar('Signals'),
  ];
}

function screenChannels() {
  return [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
    text('Channel Health', 20, 68, 22, P.ink, 'bold', 'left', 'serif'),
    text('Signal performance by source', 20, 88, 12, P.dim, 'regular', 'left', 'sans'),
    // Donut ring
    circle(W/2, 186, 68, P.warm),
    circle(W/2, 186, 44, P.bg),
    text('Overall', W/2, 180, 10, P.dim, 'regular', 'center', 'sans'),
    text('76.2', W/2, 198, 22, P.ink, 'bold', 'center', 'serif'),
    circle(W/2, 120, 6, P.sage),
    circle(W/2+50, 140, 6, P.clay),
    circle(W/2+64, 194, 6, P.mauve),
    circle(W/2+30, 244, 6, P.dim),
    circle(W/2-40, 250, 6, P.rule),
    text('CHANNEL BREAKDOWN', 20, 278, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 288, W-20, 288, P.rule),
    // Organic Search
    rect(20, 296, W-40, 76, P.surface, 10),
    text('Organic Search', 32, 314, 13, P.ink, 'medium', 'left', 'serif'),
    text('38% of traffic', 32, 330, 10, P.dim, 'regular', 'left', 'sans'),
    text('87', W-32, 320, 18, P.ink, 'bold', 'right', 'serif'),
    text('+4', W-32, 336, 10, P.sage, 'medium', 'right', 'sans'),
    rect(32, 348, W-72, 8, P.border, 4),
    rect(32, 348, Math.round((87/100)*(W-72)), 8, P.sage, 4),
    // Email
    rect(20, 380, W-40, 76, P.surface, 10),
    text('Email', 32, 398, 13, P.ink, 'medium', 'left', 'serif'),
    text('24% of traffic', 32, 414, 10, P.dim, 'regular', 'left', 'sans'),
    text('94', W-32, 404, 18, P.ink, 'bold', 'right', 'serif'),
    text('+11', W-32, 420, 10, P.sage, 'medium', 'right', 'sans'),
    rect(32, 432, W-72, 8, P.border, 4),
    rect(32, 432, Math.round((94/100)*(W-72)), 8, P.clay, 4),
    // Paid Social
    rect(20, 464, W-40, 76, P.surface, 10),
    text('Paid Social', 32, 482, 13, P.ink, 'medium', 'left', 'serif'),
    text('18% of traffic', 32, 498, 10, P.dim, 'regular', 'left', 'sans'),
    text('61', W-32, 488, 18, P.ink, 'bold', 'right', 'serif'),
    text('-3', W-32, 504, 10, P.clay, 'medium', 'right', 'sans'),
    rect(32, 516, W-72, 8, P.border, 4),
    rect(32, 516, Math.round((61/100)*(W-72)), 8, P.mauve, 4),
    // Direct
    rect(20, 548, W-40, 76, P.surface, 10),
    text('Direct', 32, 566, 13, P.ink, 'medium', 'left', 'serif'),
    text('12% of traffic', 32, 582, 10, P.dim, 'regular', 'left', 'sans'),
    text('78', W-32, 572, 18, P.ink, 'bold', 'right', 'serif'),
    text('+2', W-32, 588, 10, P.sage, 'medium', 'right', 'sans'),
    rect(32, 600, W-72, 8, P.border, 4),
    rect(32, 600, Math.round((78/100)*(W-72)), 8, P.dim, 4),
    ...navBar('Channels'),
  ];
}

function screenInsights() {
  return [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
    text('AI Insights', 20, 68, 22, P.ink, 'bold', 'left', 'serif'),
    text('Weekly synthesis from Meridian', 20, 88, 12, P.mauve, 'regular', 'left', 'sans'),
    line(20, 102, W-20, 102, P.rule),
    // Main card
    rect(20, 112, W-40, 190, P.warm, 14),
    text('* WEEKLY READ', 32, 132, 9, P.clay, 'bold', 'left', 'sans'),
    text('Your email channel is', 32, 158, 17, P.ink, 'bold', 'left', 'serif'),
    text('outperforming the market', 32, 178, 17, P.ink, 'bold', 'left', 'serif'),
    text('by a significant margin.', 32, 198, 17, P.ink, 'bold', 'left', 'serif'),
    line(32, 210, W-32, 210, P.rule),
    text('Open rates at 41.2%, industry avg 22%.', 32, 228, 10, P.dim, 'regular', 'left', 'sans'),
    text('Revisit send-time optimization to extend.', 32, 242, 10, P.dim, 'regular', 'left', 'sans'),
    text('Read full analysis', 32, 260, 11, P.mauve, 'medium', 'left', 'sans'),
    text('Generated by Meridian AI - Mar 31', W-32, 284, 9, P.dim, 'regular', 'right', 'sans'),
    // More signals
    text('MORE SIGNALS', 20, 322, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 332, W-20, 332, P.rule),
    // Recommendation card
    rect(20, 342, W-40, 100, P.surface, 12),
    rect(32, 356, 2, 56, P.mauve, 1),
    text('RECOMMENDATION', 42, 370, 9, P.mauve, 'bold', 'left', 'sans'),
    text('Reduce paid social budget', 42, 390, 13, P.ink, 'bold', 'left', 'serif'),
    text('ROI below threshold 3 weeks. Reallocate', 42, 408, 10, P.dim, 'regular', 'left', 'sans'),
    text('15% to email channel.', 42, 422, 10, P.dim, 'regular', 'left', 'sans'),
    text('->', W-36, 396, 20, P.mauve, 'bold', 'right', 'serif'),
    // Forecast card
    rect(20, 452, W-40, 100, P.surface, 12),
    rect(32, 466, 2, 56, P.sage, 1),
    text('FORECAST', 42, 480, 9, P.sage, 'bold', 'left', 'sans'),
    text('Q2 conversion rate +18%', 42, 500, 13, P.ink, 'bold', 'left', 'serif'),
    text('Based on current signal momentum', 42, 518, 10, P.dim, 'regular', 'left', 'sans'),
    text('and historical patterns.', 42, 532, 10, P.dim, 'regular', 'left', 'sans'),
    text('^', W-36, 506, 20, P.sage, 'bold', 'right', 'serif'),
    ...navBar('Insights'),
  ];
}

function screenAlerts() {
  return [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
    text('Alert Config', 20, 68, 22, P.ink, 'bold', 'left', 'serif'),
    text('Smart thresholds powered by AI', 20, 88, 12, P.dim, 'regular', 'left', 'sans'),
    rect(20, 106, W-40, 70, P.surface, 12),
    text('3 active alerts', 32, 126, 14, P.ink, 'medium', 'left', 'sans'),
    text('All running on AI-adaptive thresholds', 32, 144, 11, P.dim, 'regular', 'left', 'sans'),
    circle(W-48, 141, 22, P.warm),
    text('3', W-48, 148, 18, P.ink, 'bold', 'center', 'serif'),
    text('CONFIGURED ALERTS', 20, 196, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 206, W-20, 206, P.rule),
    // Alert 1
    rect(20, 216, W-40, 64, P.surface, 10),
    circle(36, 248, 5, P.clay),
    text('Conversion drop', 52, 236, 13, P.ink, 'medium', 'left', 'serif'),
    text('< 2.1%  -  Email', 52, 252, 10, P.dim, 'regular', 'left', 'sans'),
    rect(W-62, 240, 38, 18, P.ink, 9),
    circle(W-33, 249, 7, P.surface),
    text('ON', W-55, 251, 8, P.bg, 'bold', 'center', 'sans'),
    // Alert 2
    rect(20, 288, W-40, 64, P.surface, 10),
    circle(36, 320, 5, P.mauve),
    text('Score anomaly', 52, 308, 13, P.ink, 'medium', 'left', 'serif'),
    text('> 15%  -  All channels', 52, 324, 10, P.dim, 'regular', 'left', 'sans'),
    rect(W-62, 312, 38, 18, P.ink, 9),
    circle(W-33, 321, 7, P.surface),
    text('ON', W-55, 323, 8, P.bg, 'bold', 'center', 'sans'),
    // Alert 3
    rect(20, 360, W-40, 64, P.surface, 10),
    circle(36, 392, 5, P.sage),
    text('Budget warning', 52, 380, 13, P.ink, 'medium', 'left', 'serif'),
    text('> 90%  -  Paid Social', 52, 396, 10, P.dim, 'regular', 'left', 'sans'),
    rect(W-62, 384, 38, 18, P.ink, 9),
    circle(W-33, 393, 7, P.surface),
    text('ON', W-55, 395, 8, P.bg, 'bold', 'center', 'sans'),
    // Alert 4 (off)
    rect(20, 432, W-40, 64, P.surface, 10),
    circle(36, 464, 5, P.rule),
    text('Churn signal', 52, 452, 13, P.dim, 'medium', 'left', 'serif'),
    text('> 8%  -  CRM', 52, 468, 10, P.dim, 'regular', 'left', 'sans'),
    rect(W-62, 456, 38, 18, P.border, 9),
    circle(W-55, 465, 7, P.surface),
    text('OFF', W-40, 467, 8, P.dim, 'bold', 'center', 'sans'),
    // Add alert button
    rect(20, 510, W-40, 44, P.ink, 12),
    text('+ Add New Alert', W/2, 536, 13, P.warm, 'semibold', 'center', 'sans'),
    // AI note
    rect(20, 564, W-40, 50, P.warm, 10),
    text('* Meridian AI tunes thresholds automatically', 32, 582, 10, P.clay, 'regular', 'left', 'sans'),
    text('based on your signal history. Overrides apply.', 32, 596, 10, P.clay, 'regular', 'left', 'sans'),
    ...navBar('Overview'),
  ];
}

const screens = [
  { id: 'overview',  name: 'Overview',  layers: screenOverview() },
  { id: 'signals',   name: 'Signals',   layers: screenSignals() },
  { id: 'channels',  name: 'Channels',  layers: screenChannels() },
  { id: 'insights',  name: 'Insights',  layers: screenInsights() },
  { id: 'alerts',    name: 'Alerts',    layers: screenAlerts() },
];

const pen = {
  version: '2.8',
  meta: {
    name: 'MERIDIAN — Signal Intelligence',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    description: 'AI-powered signal analytics for growth teams. Light editorial palette inspired by Equals on land-book.com. Warm cream, soft yellow, muted mauve, serif display type for calm data intelligence.',
    palette: {
      primary:    P.ink,
      secondary:  P.dim,
      accent:     P.mauve,
      accent2:    P.sage,
      background: P.bg,
    },
  },
  canvas: { width: W, height: H, background: P.bg },
  screens,
};

fs.writeFileSync('meridian.pen', JSON.stringify(pen, null, 2));
console.log('meridian.pen written -', screens.length, 'screens');
