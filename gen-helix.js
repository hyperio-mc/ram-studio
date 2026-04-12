const fs = require('fs');

const BG = '#070710';
const SURFACE = '#0F0F1E';
const SURFACE2 = '#161628';
const TEXT = '#E4E4F0';
const MUTED = 'rgba(228,228,240,0.4)';
const ACCENT = '#7B5CFF';
const ACCENT2 = '#2EE5C8';
const DANGER = '#FF4F6A';
const WARM = '#F59E2B';

function statusBar(fill = BG) {
  return `
    <rect x="0" y="0" width="390" height="44" fill="${fill}"/>
    <text x="20" y="26" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="700" fill="${TEXT}" text-anchor="start">9:41</text>
    <text x="370" y="25" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="400" fill="${MUTED}" text-anchor="end">⚡ 84%</text>`;
}

function bottomNav(active) {
  const items = [
    { id:'tonight', label:'Tonight', icon:'🌙' },
    { id:'trends', label:'Trends', icon:'📈' },
    { id:'wake', label:'Wake', icon:'☀️' },
    { id:'settings', label:'Goals', icon:'🎯' },
  ];
  const w = 390 / items.length;
  return items.map((it, i) => {
    const x = i * w + w / 2;
    const isActive = it.id === active;
    return `
      <rect x="${i*w}" y="786" width="${w}" height="58" fill="${SURFACE}"/>
      <text x="${x}" y="810" font-family="system-ui,-apple-system,sans-serif" font-size="20" text-anchor="middle">${it.icon}</text>
      <text x="${x}" y="830" font-family="system-ui,-apple-system,sans-serif" font-size="10" font-weight="${isActive?'700':'400'}" fill="${isActive?ACCENT:MUTED}" text-anchor="middle" letter-spacing="1">${it.label.toUpperCase()}</text>
      ${isActive ? `<rect x="${x-16}" y="783" width="32" height="3" fill="${ACCENT}" rx="1.5"/>` : ''}
    `;
  }).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1: Tonight — Wind-down prep
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  // Ghost large waveform behind content
  const wavePoints = Array.from({length: 20}, (_, i) => {
    const x = i * (390/19);
    const amp = 18 + Math.sin(i * 0.8) * 12 + Math.cos(i * 1.3) * 8;
    return `${x},${240 - amp}`;
  }).join(' ');
  const wavePath2 = Array.from({length: 20}, (_, i) => {
    const x = i * (390/19);
    const amp = 12 + Math.sin(i * 1.1 + 1) * 10 + Math.cos(i * 0.7) * 6;
    return `${x},${240 + amp}`;
  }).join(' ');

  const rituals = [
    { emoji: '📵', label: 'Screen-free', checked: true },
    { emoji: '🌡️', label: 'Room temp 18°C', checked: true },
    { emoji: '🍵', label: 'No caffeine', checked: false },
    { emoji: '🧘', label: '5-min breathwork', checked: false },
  ];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect x="0" y="0" width="390" height="844" fill="${BG}"/>
      ${statusBar(BG)}

      <!-- Ghost decorative waveform -->
      <polyline points="${wavePoints}" fill="none" stroke="${ACCENT}" stroke-width="1.5" opacity="0.08"/>
      <polyline points="${wavePath2}" fill="none" stroke="${ACCENT2}" stroke-width="1.5" opacity="0.06"/>

      <!-- Header -->
      <text x="20" y="74" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="700" fill="${ACCENT}" letter-spacing="3">TONIGHT</text>
      <text x="20" y="104" font-family="Georgia,'Times New Roman',serif" font-size="32" font-weight="700" fill="${TEXT}">Wind Down</text>
      <text x="20" y="126" font-family="system-ui,-apple-system,sans-serif" font-size="14" fill="${MUTED}">Target bedtime 10:30 PM — 47 min</text>

      <!-- Sleep score ring -->
      <circle cx="195" cy="220" r="64" fill="none" stroke="${SURFACE2}" stroke-width="10"/>
      <circle cx="195" cy="220" r="64" fill="none" stroke="${ACCENT}" stroke-width="10" stroke-dasharray="${2*Math.PI*64*0.78} ${2*Math.PI*64*(1-0.78)}" stroke-dashoffset="${2*Math.PI*64*0.25}" stroke-linecap="round"/>
      <circle cx="195" cy="220" r="64" fill="none" stroke="${ACCENT2}" stroke-width="4" stroke-dasharray="${2*Math.PI*64*0.28} ${2*Math.PI*64*(1-0.28)}" stroke-dashoffset="${2*Math.PI*64*0.28+2*Math.PI*64*0.5}" stroke-linecap="round" opacity="0.5"/>
      <text x="195" y="212" font-family="Georgia,serif" font-size="38" font-weight="700" fill="${TEXT}" text-anchor="middle">78</text>
      <text x="195" y="232" font-family="system-ui,sans-serif" font-size="11" fill="${MUTED}" text-anchor="middle" letter-spacing="2">READINESS</text>

      <!-- Section label -->
      <text x="20" y="316" font-family="system-ui,-apple-system,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">SLEEP RITUALS</text>

      ${rituals.map((r, i) => {
        const y = 335 + i * 64;
        const done = r.checked;
        return `
          <rect x="20" y="${y}" width="350" height="52" fill="${SURFACE}" rx="12"/>
          <rect x="20" y="${y}" width="350" height="52" fill="${done ? ACCENT : 'transparent'}" rx="12" opacity="${done ? 0.06 : 0}"/>
          <text x="44" y="${y+31}" font-family="system-ui,sans-serif" font-size="20" text-anchor="middle">${r.emoji}</text>
          <text x="64" y="${y+30}" font-family="system-ui,-apple-system,sans-serif" font-size="15" font-weight="${done?'600':'400'}" fill="${done?TEXT:MUTED}">${r.label}</text>
          <!-- Checkbox -->
          <rect x="330" y="${y+15}" width="22" height="22" fill="${done?ACCENT:'transparent'}" stroke="${done?ACCENT:MUTED}" stroke-width="1.5" rx="6"/>
          ${done ? `<text x="341" y="${y+31}" font-family="system-ui,sans-serif" font-size="13" fill="#fff" text-anchor="middle">✓</text>` : ''}
        `;
      }).join('')}

      <!-- CTA -->
      <rect x="20" y="601" width="350" height="54" fill="${ACCENT}" rx="27"/>
      <text x="195" y="633" font-family="system-ui,-apple-system,sans-serif" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">Start Sleep Session</text>

      ${bottomNav('tonight')}
    </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2: Live Session — sleep in progress
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  // Animated-looking waveform for active REM tracking
  const stages = [
    { label: 'Awake', h: 8 },
    { label: 'Light', h: 28 },
    { label: 'Deep', h: 52 },
    { label: 'REM',  h: 38 },
  ];

  // Build waveform
  const totalW = 350;
  const waveH = 120;
  const waveY = 360;
  const segments = 60;
  const waveData = Array.from({length: segments}, (_, i) => {
    const t = i / segments;
    // Mix of sleep stage heights
    const stageT = t * 3.5;
    const stageIdx = Math.min(3, Math.floor(stageT));
    const stageH = stages[stageIdx].h;
    const nextH = stages[Math.min(3, stageIdx+1)].h;
    const blend = stageT - Math.floor(stageT);
    const h = stageH + (nextH - stageH) * blend + Math.sin(i*0.8)*4;
    return { x: 20 + i*(totalW/segments), h };
  });

  const pathD = waveData.map((p,i) => `${i===0?'M':'L'}${p.x},${waveY + waveH/2 - p.h/2}`).join(' ') +
    waveData.slice().reverse().map((p,i) => ` L${p.x},${waveY + waveH/2 + p.h/2}`).join('') + ' Z';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect x="0" y="0" width="390" height="844" fill="${BG}"/>

      <!-- Ambient glow -->
      <ellipse cx="195" cy="300" rx="160" ry="100" fill="${ACCENT}" opacity="0.04"/>
      <ellipse cx="195" cy="300" rx="100" ry="60" fill="${ACCENT2}" opacity="0.05"/>

      ${statusBar(BG)}

      <!-- "Recording" pulse indicator -->
      <circle cx="20" cy="68" r="5" fill="${DANGER}"/>
      <circle cx="20" cy="68" r="5" fill="${DANGER}" opacity="0.3">
        <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="34" y="73" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="${DANGER}" letter-spacing="2">TRACKING</text>

      <!-- Stage label -->
      <text x="195" y="130" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${ACCENT2}" letter-spacing="3" text-anchor="middle">CURRENT STAGE</text>
      <text x="195" y="180" font-family="Georgia,serif" font-size="48" font-weight="700" fill="${TEXT}" text-anchor="middle">REM</text>
      <text x="195" y="210" font-family="system-ui,sans-serif" font-size="14" fill="${MUTED}" text-anchor="middle">Rapid Eye Movement · Cycle 2</text>

      <!-- Timer -->
      <text x="195" y="268" font-family="Georgia,serif" font-size="60" font-weight="700" fill="${ACCENT}" text-anchor="middle" letter-spacing="-2">4h 23m</text>
      <text x="195" y="300" font-family="system-ui,sans-serif" font-size="13" fill="${MUTED}" text-anchor="middle">elapsed · goal 7h 30m</text>

      <!-- Waveform -->
      <path d="${pathD}" fill="${ACCENT}" opacity="0.15"/>
      ${waveData.filter((_, i) => i % 3 === 0).map(p => 
        `<line x1="${p.x}" y1="${waveY+waveH/2-p.h/2}" x2="${p.x}" y2="${waveY+waveH/2+p.h/2}" stroke="${ACCENT}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>`
      ).join('')}

      <!-- Stage timeline chips -->
      <text x="20" y="512" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">STAGE TIMELINE</text>
      ${stages.map((s, i) => {
        const colors = [TEXT, ACCENT2, ACCENT, WARM];
        return `
          <rect x="${20 + i*88}" y="524" width="80" height="48" fill="${SURFACE}" rx="10"/>
          <rect x="${20 + i*88}" y="524" width="80" height="3" fill="${colors[i]}" rx="1.5"/>
          <text x="${60 + i*88}" y="546" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${colors[i]}" text-anchor="middle" letter-spacing="1">${s.label.toUpperCase()}</text>
          <text x="${60 + i*88}" y="562" font-family="system-ui,sans-serif" font-size="12" fill="${TEXT}" text-anchor="middle">${[12,38,72,31][i]}m</text>
        `;
      }).join('')}

      <!-- Vitals row -->
      <rect x="20" y="596" width="165" height="72" fill="${SURFACE}" rx="14"/>
      <text x="40" y="622" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="1">HEART RATE</text>
      <text x="40" y="652" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${ACCENT2}">58</text>
      <text x="76" y="649" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">bpm</text>

      <rect x="205" y="596" width="165" height="72" fill="${SURFACE}" rx="14"/>
      <text x="225" y="622" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="1">HRV</text>
      <text x="225" y="652" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${WARM}">42</text>
      <text x="261" y="649" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">ms</text>

      <!-- Wake button -->
      <rect x="20" y="690" width="350" height="52" fill="${SURFACE}" stroke="${MUTED}" stroke-width="1" rx="26"/>
      <text x="195" y="721" font-family="system-ui,sans-serif" font-size="15" font-weight="600" fill="${MUTED}" text-anchor="middle">☀️  Set Wake Alarm</text>

      ${bottomNav('tonight')}
    </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3: Wake — morning report
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  // Sleep cycle arc chart
  const cycles = [
    { label: 'Awake', pct: 0.05, color: TEXT },
    { label: 'Light',  pct: 0.35, color: ACCENT2 },
    { label: 'Deep',   pct: 0.25, color: ACCENT },
    { label: 'REM',    pct: 0.35, color: WARM },
  ];
  const cx = 195, cy = 240, r = 80;
  let arcStart = -Math.PI/2;
  const arcPaths = cycles.map(c => {
    const sweep = 2 * Math.PI * c.pct;
    const x1 = cx + r * Math.cos(arcStart);
    const y1 = cy + r * Math.sin(arcStart);
    const x2 = cx + r * Math.cos(arcStart + sweep);
    const y2 = cy + r * Math.sin(arcStart + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    arcStart += sweep;
    return `<path d="${path}" fill="${c.color}" opacity="0.8"/>`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect x="0" y="0" width="390" height="844" fill="${BG}"/>
      ${statusBar(BG)}

      <!-- Glow -->
      <ellipse cx="195" cy="200" rx="140" ry="90" fill="${WARM}" opacity="0.04"/>

      <!-- Header -->
      <text x="20" y="74" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${WARM}" letter-spacing="3">GOOD MORNING</text>
      <text x="20" y="104" font-family="Georgia,serif" font-size="30" font-weight="700" fill="${TEXT}">Last Night's Report</text>
      <text x="20" y="126" font-family="system-ui,sans-serif" font-size="14" fill="${MUTED}">Mon 7 Apr  ·  10:38 PM → 6:52 AM</text>

      <!-- Pie chart -->
      ${arcPaths}
      <circle cx="${cx}" cy="${cy}" r="48" fill="${BG}"/>
      <text x="${cx}" y="${cy-8}" font-family="Georgia,serif" font-size="32" font-weight="700" fill="${TEXT}" text-anchor="middle">82</text>
      <text x="${cx}" y="${cy+12}" font-family="system-ui,sans-serif" font-size="10" fill="${MUTED}" text-anchor="middle" letter-spacing="2">SCORE</text>

      <!-- Legend -->
      ${cycles.map((c, i) => {
        const lx = i < 2 ? 20 + i*180 : 20 + (i-2)*180;
        const ly = i < 2 ? 334 : 366;
        return `
          <rect x="${lx}" y="${ly-10}" width="10" height="10" fill="${c.color}" rx="2"/>
          <text x="${lx+16}" y="${ly}" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">${c.label} ${Math.round(c.pct*100)}%</text>
        `;
      }).join('')}

      <!-- Sleep summary cards -->
      <text x="20" y="412" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">SUMMARY</text>

      ${[
        { label: 'Total Sleep', val: '7h 14m', sub: '▲ 22m vs avg', color: ACCENT2 },
        { label: 'Deep Sleep',  val: '1h 49m', sub: '● Within target', color: ACCENT },
        { label: 'Efficiency',  val: '91%',    sub: '▲ Excellent',  color: WARM },
        { label: 'Cycles',      val: '4',      sub: 'Complete cycles', color: TEXT },
      ].map((item, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 20 + col * 185;
        const y = 424 + row * 92;
        return `
          <rect x="${x}" y="${y}" width="170" height="78" fill="${SURFACE}" rx="14"/>
          <rect x="${x}" y="${y}" width="170" height="3" fill="${item.color}" rx="1.5"/>
          <text x="${x+16}" y="${y+26}" font-family="system-ui,sans-serif" font-size="11" fill="${MUTED}" letter-spacing="1">${item.label.toUpperCase()}</text>
          <text x="${x+16}" y="${y+56}" font-family="Georgia,serif" font-size="26" font-weight="700" fill="${TEXT}">${item.val}</text>
          <text x="${x+16}" y="${y+70}" font-family="system-ui,sans-serif" font-size="11" fill="${item.color}">${item.sub}</text>
        `;
      }).join('')}

      <!-- Insight card -->
      <rect x="20" y="620" width="350" height="72" fill="${SURFACE}" rx="14"/>
      <text x="40" y="645" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="${ACCENT}">💡  Sleep Insight</text>
      <text x="40" y="666" font-family="system-ui,sans-serif" font-size="13" fill="${TEXT}">Your REM was 14% above average.</text>
      <text x="40" y="682" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">Great for memory consolidation.</text>

      <!-- Share / Log -->
      <rect x="20" y="706" width="165" height="50" fill="${ACCENT}" rx="25"/>
      <text x="102" y="736" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">Share Report</text>
      <rect x="205" y="706" width="165" height="50" fill="${SURFACE}" rx="25"/>
      <text x="287" y="736" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="${MUTED}" text-anchor="middle">Log Note</text>

      ${bottomNav('wake')}
    </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 4: Trends — weekly patterns
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const scores = [74, 81, 69, 88, 76, 82, 78];
  const maxScore = 100;
  const barW = 36;
  const barMaxH = 160;
  const barBaseY = 340;
  const barStartX = 20 + (350 - days.length * (barW + 10)) / 2;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect x="0" y="0" width="390" height="844" fill="${BG}"/>
      ${statusBar(BG)}

      <!-- Header -->
      <text x="20" y="74" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${ACCENT}" letter-spacing="3">THIS WEEK</text>
      <text x="20" y="104" font-family="Georgia,serif" font-size="30" font-weight="700" fill="${TEXT}">Sleep Trends</text>
      <text x="20" y="126" font-family="system-ui,sans-serif" font-size="14" fill="${MUTED}">Mar 31 – Apr 6  ·  7 nights</text>

      <!-- Avg score -->
      <rect x="20" y="144" width="350" height="80" fill="${SURFACE}" rx="16"/>
      <text x="40" y="170" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">WEEKLY AVERAGE</text>
      <text x="40" y="208" font-family="Georgia,serif" font-size="40" font-weight="700" fill="${ACCENT}">78.3</text>
      <text x="116" y="204" font-family="system-ui,sans-serif" font-size="14" fill="${MUTED}">/ 100</text>
      <text x="300" y="196" font-family="system-ui,sans-serif" font-size="13" fill="${ACCENT2}" text-anchor="end">▲ +3.1 vs last week</text>

      <!-- Bar chart section -->
      <text x="20" y="250" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">NIGHTLY SCORES</text>

      ${days.map((d, i) => {
        const score = scores[i];
        const h = (score / maxScore) * barMaxH;
        const x = barStartX + i * (barW + 10);
        const y = barBaseY - h;
        const isToday = i === 6;
        const barColor = isToday ? ACCENT : `${ACCENT}40`;
        const textColor = isToday ? ACCENT : MUTED;
        return `
          <rect x="${x}" y="${barBaseY - barMaxH}" width="${barW}" height="${barMaxH}" fill="${SURFACE}" rx="8"/>
          <rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${barColor}" rx="8"/>
          <text x="${x + barW/2}" y="${y - 6}" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${textColor}" text-anchor="middle">${score}</text>
          <text x="${x + barW/2}" y="${barBaseY + 18}" font-family="system-ui,sans-serif" font-size="11" fill="${isToday?ACCENT:MUTED}" text-anchor="middle" font-weight="${isToday?'700':'400'}">${d}</text>
        `;
      }).join('')}

      <!-- Average line -->
      <line x1="${barStartX}" y1="${barBaseY - (78.3/100)*barMaxH}" x2="${barStartX + days.length*(barW+10) - 10}" y2="${barBaseY - (78.3/100)*barMaxH}" stroke="${ACCENT2}" stroke-width="1.5" stroke-dasharray="4 4"/>
      <text x="${barStartX + days.length*(barW+10) + 4}" y="${barBaseY - (78.3/100)*barMaxH + 4}" font-family="system-ui,sans-serif" font-size="10" fill="${ACCENT2}">avg</text>

      <!-- Metric rows -->
      <text x="20" y="390" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">DEEP DIVE</text>

      ${[
        { label: 'Avg Deep Sleep', val: '1h 42m', pct: 68 },
        { label: 'Avg REM',        val: '1h 51m', pct: 74 },
        { label: 'Consistency',    val: '±18 min', pct: 82 },
      ].map((m, i) => {
        const y = 404 + i * 72;
        return `
          <rect x="20" y="${y}" width="350" height="58" fill="${SURFACE}" rx="12"/>
          <text x="40" y="${y+22}" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">${m.label}</text>
          <text x="350" y="${y+22}" font-family="system-ui,sans-serif" font-size="13" font-weight="700" fill="${TEXT}" text-anchor="end">${m.val}</text>
          <rect x="40" y="${y+32}" width="270" height="6" fill="${SURFACE2}" rx="3"/>
          <rect x="40" y="${y+32}" width="${270*m.pct/100}" height="6" fill="${ACCENT}" rx="3"/>
        `;
      }).join('')}

      <!-- Best night callout -->
      <rect x="20" y="628" width="350" height="72" fill="${SURFACE}" rx="14"/>
      <rect x="20" y="628" width="350" height="3" fill="${WARM}" rx="1.5"/>
      <text x="40" y="654" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${WARM}" letter-spacing="2">BEST NIGHT</text>
      <text x="40" y="680" font-family="Georgia,serif" font-size="22" font-weight="700" fill="${TEXT}">Thursday  ·  Score 88</text>
      <text x="350" y="672" font-family="system-ui,sans-serif" font-size="24" text-anchor="end">🏆</text>

      ${bottomNav('trends')}
    </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 5: Goals — sleep settings / targets
// ─────────────────────────────────────────────────────────────────────────────
function screen5() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <rect x="0" y="0" width="390" height="844" fill="${BG}"/>
      ${statusBar(BG)}

      <!-- Header -->
      <text x="20" y="74" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${ACCENT}" letter-spacing="3">YOUR GOALS</text>
      <text x="20" y="104" font-family="Georgia,serif" font-size="30" font-weight="700" fill="${TEXT}">Sleep Setup</text>
      <text x="20" y="126" font-family="system-ui,sans-serif" font-size="14" fill="${MUTED}">Personalise your targets</text>

      <!-- Sleep duration goal -->
      <text x="20" y="162" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">SLEEP DURATION GOAL</text>
      <rect x="20" y="172" width="350" height="80" fill="${SURFACE}" rx="16"/>
      <text x="40" y="204" font-family="Georgia,serif" font-size="36" font-weight="700" fill="${ACCENT}">7h 30m</text>
      <text x="40" y="222" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">Recommended for your age group</text>
      <!-- stepper -->
      <rect x="280" y="188" width="40" height="32" fill="${SURFACE2}" rx="8"/>
      <text x="300" y="209" font-family="Georgia,serif" font-size="20" fill="${TEXT}" text-anchor="middle">−</text>
      <rect x="326" y="188" width="40" height="32" fill="${ACCENT}" rx="8"/>
      <text x="346" y="209" font-family="Georgia,serif" font-size="20" fill="#fff" text-anchor="middle">+</text>

      <!-- Bedtime / wake time -->
      <text x="20" y="278" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">SCHEDULE</text>
      <rect x="20" y="288" width="165" height="80" fill="${SURFACE}" rx="14"/>
      <text x="40" y="314" font-family="system-ui,sans-serif" font-size="11" fill="${MUTED}" letter-spacing="1">BEDTIME</text>
      <text x="40" y="350" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${TEXT}">10:30</text>
      <text x="130" y="342" font-family="system-ui,sans-serif" font-size="13" fill="${MUTED}">PM</text>

      <rect x="205" y="288" width="165" height="80" fill="${SURFACE}" rx="14"/>
      <text x="225" y="314" font-family="system-ui,sans-serif" font-size="11" fill="${MUTED}" letter-spacing="1">WAKE TIME</text>
      <text x="225" y="350" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${TEXT}">6:00</text>
      <text x="285" y="342" font-family="system-ui,sans-serif" font-size="13" fill="${MUTED}">AM</text>

      <!-- Tracking toggles -->
      <text x="20" y="398" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${MUTED}" letter-spacing="2">TRACKING</text>

      ${[
        { label: 'Heart Rate Monitor', on: true },
        { label: 'HRV Analysis', on: true },
        { label: 'Snore Detection', on: false },
        { label: 'Smart Wake Window', on: true },
      ].map((t, i) => {
        const y = 408 + i * 60;
        return `
          <rect x="20" y="${y}" width="350" height="50" fill="${SURFACE}" rx="12"/>
          <text x="40" y="${y+29}" font-family="system-ui,sans-serif" font-size="14" fill="${t.on?TEXT:MUTED}">${t.label}</text>
          <!-- Toggle -->
          <rect x="300" y="${y+14}" width="48" height="24" fill="${t.on?ACCENT:SURFACE2}" rx="12"/>
          <circle cx="${t.on ? 336 : 316}" cy="${y+26}" r="9" fill="#fff"/>
        `;
      }).join('')}

      <!-- Streak badge -->
      <rect x="20" y="660" width="350" height="70" fill="${SURFACE}" rx="14"/>
      <rect x="20" y="660" width="350" height="3" fill="${ACCENT2}" rx="1.5"/>
      <text x="56" y="690" font-family="system-ui,sans-serif" font-size="32">🔥</text>
      <text x="92" y="686" font-family="Georgia,serif" font-size="22" font-weight="700" fill="${TEXT}">14-night streak</text>
      <text x="92" y="702" font-family="system-ui,sans-serif" font-size="12" fill="${MUTED}">Keep it up! Best ever: 21 nights</text>

      ${bottomNav('settings')}
    </svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble pen file
// ─────────────────────────────────────────────────────────────────────────────
const screens = [
  { id: 's1', name: 'Tonight',    svg: screen1() },
  { id: 's2', name: 'Live',       svg: screen2() },
  { id: 's3', name: 'Wake',       svg: screen3() },
  { id: 's4', name: 'Trends',     svg: screen4() },
  { id: 's5', name: 'Goals',      svg: screen5() },
];

const pen = {
  version: "2.8",
  meta: {
    title: "HELIX — Deep sleep intelligence",
    description: "A dark-themed sleep biometric tracker. Inspired by Frames (withframes.com on darkmodedesign.com) — niche precision utility apps with instrument-panel dark UIs — and Evervault's dense enterprise card layout (godly.website). Deep violet + electric teal on near-black.",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "dark",
    palette: {
      background: BG,
      surface: SURFACE,
      text: TEXT,
      accent: ACCENT,
      accent2: ACCENT2,
      muted: MUTED
    }
  },
  artboards: screens.map(s => ({
    id: s.id,
    name: s.name,
    width: 390,
    height: 844,
    layers: [{
      id: `${s.id}_layer`,
      name: "Design",
      visible: true,
      locked: false,
      type: "svg",
      content: s.svg
    }]
  }))
};

fs.writeFileSync('/workspace/group/design-studio/helix.pen', JSON.stringify(pen, null, 2));
console.log('✓ helix.pen written');
console.log('Screens:', screens.map(s => s.name).join(', '));
