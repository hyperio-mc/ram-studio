// VAULT — Private Archive
// Dark theme: pure black canvas, candlelight yellow accent, warm paper text
// Inspired by Antinomy Studio (awwwards SOTD) — pure black, giant display type,
// live mono clock strip, asterisk accents. Privacy as aesthetic.
// 5 screens: Entries, Open, Write, Search, Security

const screens = [];

// ─── PALETTE ──────────────────────────────
const bg        = '#030303';
const surface   = '#0D0C0B';
const lift      = '#161512';
const paper     = '#E6E1D6';
const paperMid  = 'rgba(230,225,214,0.50)';
const paperFaint= 'rgba(230,225,214,0.18)';
const candle    = '#FFE566';
const candleDim = '#C4A800';
const teal      = '#2DD4BF';
const red       = '#FF4040';
const W = 390, H = 844;

// ─── SCREEN 1 — ENTRIES ───────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('VAULT',16,52,200,24,{font:'mono',size:18,color:'${paper}',bold:true,caps:true,tracking:6});`);
  ch.push(`T('✦',${W - 44},46,28,24,{font:'mono',size:20,color:'${candle}'});`);
  ch.push(`T('ENTRIES',16,88,200,14,{font:'mono',size:10,color:'${paperMid}',caps:true,tracking:3});`);
  ch.push(`T('12 sealed',${W - 80},88,72,14,{font:'mono',size:10,color:'${paperMid}'});`);
  ch.push(`F(16,106,${W - 32},1,'${paperFaint}');`);

  const entries = [
    { title: 'On loneliness and distance',  date: '2026.04.01', tag: 'REFLECT', color: candle,   locked: true  },
    { title: 'The Lisbon conversation',     date: '2026.03.28', tag: 'MEMORY',  color: paper,    locked: true  },
    { title: 'Things I will not say',       date: '2026.03.22', tag: 'DRAFT',   color: paperMid, locked: false },
    { title: 'Architecture of trust',       date: '2026.03.15', tag: 'REFLECT', color: candle,   locked: true  },
    { title: 'Inventory of fears',          date: '2026.03.08', tag: 'LIST',    color: teal,     locked: false },
    { title: 'Letter to 2019 self',         date: '2026.02.14', tag: 'LETTER',  color: paper,    locked: true  },
  ];

  entries.forEach((e, i) => {
    const y = 120 + i * 112;
    ch.push(`F(16,${y},${W - 32},104,'${lift}',{r:10});`);
    ch.push(`T('${e.locked ? '◈' : '◎'}',${W - 44},${y + 12},24,20,{font:'mono',size:14,color:'${e.locked ? candle : paperFaint}'});`);
    ch.push(`T('${e.title}',24,${y + 14},${W - 72},32,{font:'display',size:20,color:'${paper}'});`);
    const tagW = e.tag.length * 7 + 16;
    ch.push(`F(24,${y + 52},${tagW},20,'${e.color === candle ? 'rgba(255,229,102,0.12)' : e.color === teal ? 'rgba(45,212,191,0.12)' : 'rgba(230,225,214,0.08)'}',{r:10});`);
    ch.push(`T('${e.tag}',30,${y + 55},${tagW - 4},14,{font:'mono',size:9,color:'${e.color}',caps:true,tracking:2});`);
    ch.push(`T('${e.date}',${W - 110},${y + 55},96,14,{font:'mono',size:10,color:'${paperMid}'});`);
    if (i < entries.length - 1) ch.push(`F(16,${y + 104},${W - 32},1,'${paperFaint}');`);
  });

  ch.push(`F(0,764,${W},80,'${surface}');`);
  ch.push(`F(0,764,${W},1,'${paperFaint}');`);
  ch.push(`T('⊕ NEW ENTRY',20,776,160,20,{font:'mono',size:12,color:'${candle}',bold:true,caps:true,tracking:2});`);
  ch.push(`T('04.01 · 08:56:34',${W - 136},779,128,14,{font:'mono',size:11,color:'${paperMid}'});`);
  ch.push(`T('ALL ENTRIES SEALED',${W - 164},795,148,12,{font:'mono',size:9,color:'${candleDim}',caps:true,tracking:1});`);

  screens.push({ name: 'Entries', children: ch });
}

// ─── SCREEN 2 — OPEN ENTRY ────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('← VAULT',16,52,120,16,{font:'mono',size:11,color:'${paperMid}',caps:true,tracking:2});`);
  ch.push(`T('◈ SEALED',${W - 88},48,76,22,{font:'mono',size:11,color:'${candle}',caps:true,tracking:2});`);

  ch.push(`T('On loneliness',16,90,${W - 32},48,{font:'display',size:40,color:'${paper}',bold:true});`);
  ch.push(`T('and distance.',16,136,${W - 32},48,{font:'display',size:40,color:'${paper}',bold:true});`);

  ch.push(`F(16,188,${W - 32},1,'${paperFaint}');`);
  ch.push(`T('2026.04.01 · 23:14',16,198,200,16,{font:'mono',size:11,color:'${paperMid}'});`);
  ch.push(`F(214,195,82,22,'rgba(255,229,102,0.12)',{r:11});`);
  ch.push(`T('REFLECT',220,197,74,16,{font:'mono',size:9,color:'${candle}',caps:true,tracking:2});`);
  ch.push(`F(16,222,${W - 32},1,'${paperFaint}');`);

  const lines = [
    'There is a particular quality to the',
    'silence between people who once',
    'spoke every thought aloud.',
    '',
    'I have been cataloguing the distance.',
    'Not in miles — in the number of things',
    'I no longer mention. The accumulation',
    'of small omissions.',
    '',
    'If distance is the measure of what we',
    'withhold, then proximity must be the',
    'practice of disclosure.',
    '',
    'I am not sure I know how to begin.',
  ];
  lines.forEach((line, i) => {
    if (line) {
      ch.push(`T('${line}',16,${234 + i * 26},${W - 32},22,{font:'sans',size:16,color:'${paper}'});`);
    }
  });

  ch.push(`F(0,764,${W},80,'${surface}');`);
  ch.push(`F(0,764,${W},1,'${paperFaint}');`);
  ch.push(`T('143 words',20,778,100,16,{font:'mono',size:11,color:'${paperMid}'});`);
  ch.push(`T('✏  EDIT',${W - 160},774,80,28,{font:'mono',size:11,color:'${paper}',caps:true,tracking:2});`);
  ch.push(`T('⊗  DELETE',${W - 80},774,72,28,{font:'mono',size:11,color:'rgba(255,64,64,0.60)',caps:true,tracking:2});`);
  ch.push(`T('04.01 · 23:14',${Math.round(W / 2) - 50},797,100,12,{font:'mono',size:9,color:'${paperMid}'});`);

  screens.push({ name: 'Open Entry', children: ch });
}

// ─── SCREEN 3 — NEW ENTRY / WRITE ─────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('✕',16,48,28,28,{font:'mono',size:20,color:'${paperMid}'});`);
  ch.push(`F(${W - 88},40,76,32,'${candle}',{r:8});`);
  ch.push(`T('SEAL',${W - 74},48,64,20,{font:'mono',size:12,color:'#030303',bold:true,caps:true,tracking:2});`);
  ch.push(`T('2026.04.01 · Now',16,88,240,16,{font:'mono',size:11,color:'${paperMid}'});`);

  const cats = ['REFLECT', 'MEMORY', 'LETTER', 'LIST', 'DRAFT'];
  cats.forEach((c, i) => {
    const active = i === 0;
    const x = 16 + i * 74;
    ch.push(`F(${x},112,68,24,'${active ? 'rgba(255,229,102,0.18)' : 'rgba(230,225,214,0.06)'}',{r:12});`);
    ch.push(`T('${c}',${x + 6},116,58,16,{font:'mono',size:8,color:'${active ? candle : paperMid}',caps:true,tracking:1});`);
  });

  ch.push(`F(16,142,${W - 32},1,'${paperFaint}');`);
  ch.push(`T('Title.',16,158,${W - 32},56,{font:'display',size:44,color:'rgba(230,225,214,0.22)'});`);
  ch.push(`F(16,215,3,40,'${candle}',{r:1});`);
  ch.push(`F(16,258,${W - 32},1,'${paperFaint}');`);

  const placeholders = [
    { txt: 'Begin anywhere. This is yours alone.', faint: true  },
    { txt: '',                                     faint: false },
    { txt: 'Write whatever wants to surface.',     faint: true  },
    { txt: 'No one is watching.',                  faint: true  },
    { txt: '',                                     faint: false },
    { txt: '▌',                                    cursor: true },
  ];
  placeholders.forEach((p, i) => {
    if (!p.txt) return;
    const col = p.cursor ? candle : 'rgba(230,225,214,0.28)';
    ch.push(`T('${p.txt}',16,${270 + i * 28},${W - 32},24,{font:'sans',size:17,color:'${col}'});`);
  });

  ch.push(`F(0,668,${W},80,'${surface}');`);
  ch.push(`F(0,668,${W},1,'${paperFaint}');`);
  ['B', 'I', '"', '—', '☰', '✦'].forEach((t, i) => {
    ch.push(`T('${t}',${28 + i * 52},682,30,28,{font:'mono',size:16,color:'${paperMid}'});`);
  });
  ch.push(`T('abc',${W - 52},684,44,24,{font:'mono',size:12,color:'${teal}',caps:true});`);

  ch.push(`F(0,764,${W},80,'${bg}');`);
  ch.push(`F(0,764,${W},1,'${paperFaint}');`);
  ch.push(`T('0 words',20,776,100,16,{font:'mono',size:11,color:'${paperMid}'});`);
  ch.push(`T('04.01 · 09:11:02',${W - 148},779,140,14,{font:'mono',size:11,color:'${paperMid}'});`);

  screens.push({ name: 'New Entry', children: ch });
}

// ─── SCREEN 4 — SEARCH ────────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('SEARCH',16,52,200,18,{font:'mono',size:14,color:'${paper}',bold:true,caps:true,tracking:4});`);
  ch.push(`T('✦',${W - 44},46,28,24,{font:'mono',size:20,color:'${candle}'});`);

  ch.push(`F(16,80,${W - 32},48,'${lift}',{r:12});`);
  ch.push(`T('⌕',24,90,28,28,{font:'mono',size:18,color:'${paperMid}'});`);
  ch.push(`T('loneliness',54,90,240,28,{font:'sans',size:18,color:'${paper}'});`);
  ch.push(`T('✕',${W - 40},90,24,28,{font:'mono',size:16,color:'${paperMid}'});`);
  ch.push(`F(176,92,2,26,'${candle}',{r:1});`);  // cursor

  ch.push(`F(16,134,${W - 32},1,'${paperFaint}');`);
  ch.push(`T('3 RESULTS',16,148,200,14,{font:'mono',size:10,color:'${paperMid}',caps:true,tracking:2});`);

  const results = [
    { title: 'On loneliness and distance',  date: '2026.04.01', match: '"...particular quality to the silence..."' },
    { title: 'The Lisbon conversation',     date: '2026.03.28', match: '"...when loneliness becomes familiar..."'  },
    { title: 'Architecture of trust',       date: '2026.03.15', match: '"...loneliness as a structural force..."'  },
  ];

  results.forEach((r, i) => {
    const y = 168 + i * 128;
    ch.push(`F(16,${y},${W - 32},120,'${lift}',{r:10});`);
    ch.push(`T('${r.title}',24,${y + 14},${W - 48},22,{font:'display',size:18,color:'${paper}'});`);
    ch.push(`F(24,${y + 42},${W - 48},24,'rgba(255,229,102,0.08)',{r:4});`);
    ch.push(`T('${r.match}',28,${y + 46},${W - 56},16,{font:'sans',size:12,color:'${candle}'});`);
    ch.push(`F(24,${y + 72},${W - 48},1,'${paperFaint}');`);
    ch.push(`T('${r.date}',24,${y + 80},120,14,{font:'mono',size:10,color:'${paperMid}'});`);
    ch.push(`T('◈ SEALED',${W - 96},${y + 80},80,14,{font:'mono',size:10,color:'${candle}'});`);
  });

  ch.push(`F(0,764,${W},80,'${surface}');`);
  ch.push(`F(0,764,${W},1,'${paperFaint}');`);
  ch.push(`T('RECENT:',20,776,68,14,{font:'mono',size:9,color:'${paperMid}',caps:true,tracking:2});`);
  ['Lisbon', 'fears', 'letter'].forEach((r, i) => {
    const rw = r.length * 7 + 16;
    ch.push(`F(${90 + i * 76},770,${rw},28,'rgba(230,225,214,0.08)',{r:14});`);
    ch.push(`T('${r}',${96 + i * 76},775,${rw - 4},18,{font:'mono',size:11,color:'${paperMid}'});`);
  });
  ch.push(`T('04.01 · 09:18:44',${W - 148},797,140,14,{font:'mono',size:9,color:'${paperFaint}'});`);

  screens.push({ name: 'Search', children: ch });
}

// ─── SCREEN 5 — SECURITY ──────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('SECURITY',16,52,240,18,{font:'mono',size:14,color:'${paper}',bold:true,caps:true,tracking:4});`);
  ch.push(`T('✦',${W - 44},46,28,24,{font:'mono',size:20,color:'${teal}'});`);

  // Lock status hero
  ch.push(`F(16,80,${W - 32},100,'${lift}',{r:14});`);
  ch.push(`E(${Math.round(W / 2) - 24},84,48,48,'rgba(45,212,191,0.12)');`);
  ch.push(`T('⬡',${Math.round(W / 2) - 16},88,32,40,{font:'mono',size:28,color:'${teal}'});`);
  ch.push(`T('VAULT SECURED',${Math.round(W / 2) - 70},138,140,14,{font:'mono',size:10,color:'${teal}',caps:true,tracking:2,bold:true});`);
  ch.push(`T('AES-256 · all 12 entries encrypted',48,158,${W - 96},14,{font:'mono',size:9,color:'${paperMid}'});`);

  ch.push(`F(16,192,${W - 32},1,'${paperFaint}');`);
  ch.push(`T('AUTHENTICATION',16,204,${W - 32},14,{font:'mono',size:10,color:'${paperMid}',caps:true,tracking:2});`);

  const toggles = [
    { label: 'Face ID',           sub: 'Instant unlock on open',           on: true,  color: teal   },
    { label: 'Passcode fallback', sub: '6-digit code if biometric fails',   on: true,  color: candle },
    { label: 'Auto-lock',         sub: 'After 30 seconds of inactivity',    on: true,  color: teal   },
    { label: 'Decoy mode',        sub: 'Show empty vault if forced',         on: false, color: red    },
  ];

  toggles.forEach((t, i) => {
    const y = 222 + i * 78;
    ch.push(`F(16,${y},${W - 32},70,'${lift}',{r:10});`);
    ch.push(`T('${t.label}',24,${y + 10},200,20,{font:'sans',size:15,color:'${paper}',bold:true});`);
    ch.push(`T('${t.sub}',24,${y + 34},280,16,{font:'sans',size:12,color:'${paperMid}'});`);
    const tonBg = t.on
      ? (t.color === teal ? 'rgba(45,212,191,0.20)' : t.color === candle ? 'rgba(255,229,102,0.20)' : 'rgba(255,64,64,0.20)')
      : 'rgba(230,225,214,0.08)';
    ch.push(`F(${W - 68},${y + 20},48,26,'${tonBg}',{r:13});`);
    ch.push(`E(${t.on ? W - 30 : W - 56},${y + 26},18,18,'${t.on ? t.color : paperMid}');`);
  });

  // Danger zone
  ch.push(`F(16,540,${W - 32},1,'rgba(255,64,64,0.20)');`);
  ch.push(`T('DANGER ZONE',16,554,200,14,{font:'mono',size:10,color:'rgba(255,64,64,0.60)',caps:true,tracking:2});`);
  ch.push(`F(16,572,${W - 32},52,'rgba(255,64,64,0.06)',{r:10});`);
  ch.push(`T('Wipe all entries',24,580,200,20,{font:'sans',size:15,color:'rgba(255,64,64,0.80)',bold:true});`);
  ch.push(`T('Permanently destroy all contents',24,602,280,16,{font:'sans',size:12,color:'rgba(255,64,64,0.50)'});`);
  ch.push(`T('→',${W - 36},584,24,28,{font:'mono',size:16,color:'rgba(255,64,64,0.40)'});`);

  ch.push(`F(16,636,${W - 32},52,'${lift}',{r:10});`);
  ch.push(`T('Export encrypted backup',24,644,240,20,{font:'sans',size:15,color:'${paper}',bold:true});`);
  ch.push(`T('.vault file · AES-256 protected',24,666,240,16,{font:'sans',size:12,color:'${paperMid}'});`);
  ch.push(`T('→',${W - 36},648,24,28,{font:'mono',size:16,color:'${candle}'});`);

  ch.push(`F(0,764,${W},80,'${surface}');`);
  ch.push(`F(0,764,${W},1,'${paperFaint}');`);
  ch.push(`T('LAST UNLOCKED',20,776,160,14,{font:'mono',size:9,color:'${paperMid}',caps:true,tracking:1});`);
  ch.push(`T('04.01 · 09:11:02',20,793,160,14,{font:'mono',size:10,color:'${teal}'});`);
  ch.push(`T('04.01 · 09:22:15',${W - 148},779,140,14,{font:'mono',size:11,color:'${paperMid}'});`);

  screens.push({ name: 'Security', children: ch });
}

// ─── RENDER ───────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'VAULT',
    tagline: 'Your most important thoughts, held in darkness.',
    archetype: 'private-archive-dark',
    theme: 'dark',
    palette: { bg, surface, ink: paper, accent: candle, accent2: teal },
    inspiration: 'Antinomy Studio (awwwards SOTD) — pure black canvas, giant display type, live mono clock strip',
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    children: s.children,
  })),
};

const fs = await import('fs');
fs.writeFileSync('./vault.pen', JSON.stringify(pen, null, 2));
console.log(`✓ vault.pen written — ${screens.length} screens`);
const bytes = fs.statSync('./vault.pen').size;
console.log(`  Size: ${(bytes / 1024).toFixed(1)} KB`);
screens.forEach((s, i) =>
  console.log(`  Screen ${i + 1}: ${s.name} (${s.children.length} elements)`)
);
