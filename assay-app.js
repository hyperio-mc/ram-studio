// assay-app.js — ASSAY precision biomedical research platform
// Theme: LIGHT — clinical ice-blue + deep navy + electric blue
// Inspired by:
//   ZettaJoule (Awwwards HM Mar 2026) — #D3E7FF ice palette, technical diagram precision
//   Mixpanel (Godly.website featured) — numbered 01-05 step UI, AI-first analytics SaaS
// Design challenge: clinical trial tracker, clean science UI, numbered nav progression

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// ─── Palette (Light — clinical ice) ─────────────────────────────────────────
const BG      = '#EBF3FF';   // pale ice blue (ZettaJoule #D3E7FF lightened)
const SURFACE = '#FFFFFF';
const CARD    = '#F4F8FF';
const CARD2   = '#E2EDFF';
const BLUE    = '#1155EE';
const BLUE2   = '#4B82F6';
const TEAL    = '#00B8A0';
const NAVY    = '#0A1628';
const TEXT    = '#0A1628';
const MUTED   = 'rgba(10,22,40,0.48)';
const DIM     = 'rgba(10,22,40,0.22)';
const FAINT   = 'rgba(10,22,40,0.10)';
const WHITE   = '#FFFFFF';
const GREEN   = '#10B981';
const WARN    = '#F59E0B';
const RED     = '#EF4444';
const ICE     = '#D3E7FF';
const BORDER  = 'rgba(17,85,238,0.13)';

let nodes = [];
let nid = 1;

const n = (node) => { nodes.push({...node, id:`n${nid++}`}); };

function R(name, x, y, w, h, fill, cr=0, op=1, stroke=null, sw=0) {
  n({ type:'RECTANGLE', name, x, y, width:w, height:h, fill, cornerRadius:cr, opacity:op, stroke, strokeWidth:sw });
}
function T(name, x, y, w, content, size, color, font='DM Sans', weight=400, align='left', lh=1.38, ls=0) {
  n({ type:'TEXT', name, x, y, width:w, content, fontSize:size, color, fontFamily:font, fontWeight:weight, textAlign:align, lineHeight:lh, letterSpacing:ls });
}
const sans  = (nm,x,y,w,c,sz,col,wt=400,al='left',lh=1.38,ls=0) => T(nm,x,y,w,c,sz,col,'DM Sans',wt,al,lh,ls);
const mono  = (nm,x,y,w,c,sz,col,wt=400,al='left',lh=1.4,ls=0.04) => T(nm,x,y,w,c,sz,col,'DM Mono',wt,al,lh,ls);
const serif = (nm,x,y,w,c,sz,col) => T(nm,x,y,w,c,sz,col,'DM Serif Display',400,'left',1.05,-0.01);

// ─── Shared helpers ──────────────────────────────────────────────────────────
function statusBar(sx) {
  mono(`sb-t-${sx}`, sx+16, 14, 50, '9:41', 12, NAVY, 500);
  R(`sb-bat-${sx}`, sx+W-54, 18, 28, 13, FAINT, 3);
  R(`sb-batf-${sx}`, sx+W-53, 19, 22, 11, BLUE, 2);
  R(`sb-sig-${sx}`, sx+W-88, 17, 10, 14, FAINT, 2);
  R(`sb-wifi-${sx}`, sx+W-72, 19, 12, 10, FAINT, 2);
}

// Numbered bottom nav — key differentiator inspired by Mixpanel's 01–05 sections
function nav(sx, active) {
  R(`nav-bg-${sx}`, sx, H-80, W, 80, SURFACE);
  R(`nav-line-${sx}`, sx, H-81, W, 1, BORDER);
  const tabs = ['Overview','Trials','Markers','Analysis','Team'];
  const nums = ['01','02','03','04','05'];
  tabs.forEach((lbl, i) => {
    const tx = sx + 8 + i*72;
    const on = i === active;
    mono(`nav-num-${sx}-${i}`, tx+6, H-68, 56, nums[i], 8, on?BLUE:MUTED, on?600:400, 'center');
    sans(`nav-lbl-${sx}-${i}`, tx, H-52, 68, lbl, 9, on?BLUE:MUTED, on?600:400, 'center');
    if (on) R(`nav-dot-${sx}`, tx+26, H-20, 16, 3, BLUE, 2);
  });
}

function screenBg(sx) {
  R(`bg-${sx}`, sx, 0, W, H, BG);
  statusBar(sx);
}

function card(sx, y, h, opts={}) {
  R(`card-${sx}-${y}`, sx+16, y, W-32, h, opts.fill||SURFACE, opts.cr||12, 1, BORDER, 1);
}

function hr(sx, y, ind=12) {
  R(`hr-${sx}-${y}`, sx+16+ind, y, W-32-ind, 1, BORDER);
}

function pbar(sx, y, lbl, pct, col, val) {
  sans(`pb-lbl-${sx}-${y}`, sx+28, y, 140, lbl, 11, TEXT, 500);
  mono(`pb-val-${sx}-${y}`, sx+W-52, y, 36, val, 11, col, 700, 'right');
  R(`pb-track-${sx}-${y}`, sx+28, y+18, W-60, 5, FAINT, 3);
  R(`pb-fill-${sx}-${y}`, sx+28, y+18, Math.round((W-60)*pct), 5, col, 3);
}

function spark(sx, sy, vals, col) {
  const w=58, h=22, mn=Math.min(...vals), mx=Math.max(...vals)||1;
  vals.slice(0,-1).forEach((v,i)=>{
    const x1=sx+i*(w/(vals.length-1)), y1=sy+h-((v-mn)/(mx-mn))*h;
    const x2=sx+(i+1)*(w/(vals.length-1));
    R(`sp-${sx}-${sy}-${i}`, x1, y1, x2-x1+1, 2, col, 1, 0.75);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// S1 — OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════
const X1 = GAP;
screenBg(X1);

sans(`s1-brand`, X1+16, 52, 90, 'ASSAY', 11, BLUE, 700, 'left', 1.2, 0.14);
mono(`s1-date`, X1+W-96, 52, 80, 'MAR 28, 2026', 9.5, MUTED, 400, 'right');

serif(`s1-h1`, X1+16, 74, W-32, 'Research\nOverview', 30, NAVY);
mono(`s1-step`, X1+16, 136, 160, '01 / Dashboard', 10, BLUE, 500, 'left', 1.4, 0.08);

// 3 stat cards
[[BLUE,'12','Active\nTrials'],[TEAL,'847','Enrolled\nSubjects'],[WARN,'3','Open\nAlerts']].forEach(([col,val,lbl],i)=>{
  const cw=(W-48)/3, cx=X1+16+i*(cw+8);
  R(`s1-sc-${i}`, cx, 162, cw, 74, SURFACE, 12, 1, col+'30', 1);
  R(`s1-scb-${i}`, cx, 162, cw, 3, col, [2,2,0,0]);
  mono(`s1-sv-${i}`, cx+10, 177, cw-16, val, 22, col, 700);
  sans(`s1-sl-${i}`, cx+10, 204, cw-16, lbl, 9, MUTED, 400, 'left', 1.2);
});

// Studies card
card(X1, 248, 200);
sans(`s1-sc-hdr`, X1+28, 262, 160, 'Active Studies', 12, NAVY, 600);
mono(`s1-sc-ct`, X1+W-52, 262, 36, '12', 11, BLUE, 700, 'right');
hr(X1, 282);

[['PHOENIX-3','Phase II · 234 subjects',BLUE,'+8.4%',78],
 ['AURORA-1','Phase III · 312 subjects',TEAL,'+12.1%',91],
 ['DELTA-7','Phase I · 48 subjects',WARN,'−2.3%',34],
 ['VEGA-2','Preclinical · 253 cells',GREEN,'+5.7%',62]].forEach(([nm,det,col,chg,pct],i)=>{
  const ry=X1+287+i*45;
  R(`s1-dot-${i}`, X1+28, ry+14, 8, 8, col, 4);
  sans(`s1-nm-${i}`, X1+44, ry+7, 120, nm, 12, NAVY, 600);
  mono(`s1-det-${i}`, X1+44, ry+23, 130, det, 9, MUTED, 400, 'left', 1.3, 0.02);
  mono(`s1-chg-${i}`, X1+W-68, ry+7, 44, chg, 10, chg.startsWith('+')?GREEN:RED, 600, 'right');
  R(`s1-tk-${i}`, X1+W-68, ry+24, 44, 4, FAINT, 2);
  R(`s1-fl-${i}`, X1+W-68, ry+24, Math.round(44*pct/100), 4, col, 2);
});

// AI strip
R(`s1-ai-bg`, X1+16, 460, W-32, 54, CARD2, 10);
R(`s1-ai-bar`, X1+16, 460, 4, 54, BLUE, [10,0,0,10]);
mono(`s1-ai-lbl`, X1+30, 471, 30, 'AI', 9, BLUE, 700, 'left', 1.3, 0.1);
sans(`s1-ai-txt`, X1+30, 485, W-56, 'PHOENIX-3 showing strongest efficacy signal — expand cohort?', 11, NAVY, 400, 'left', 1.3);

// Weekly bars
sans(`s1-wb-hdr`, X1+16, 530, W-32, 11, 'Weekly Activity', 12, NAVY, 600);
const wv=[72,85,63,90,78,44,55];
'MTWTFSS'.split('').forEach((d,i)=>{
  const bx=X1+16+i*((W-32)/7);
  const bh=Math.round(wv[i]/100*48);
  R(`s1-bbt-${i}`, bx+8, 552, 14, 48, FAINT, 4);
  R(`s1-bbf-${i}`, bx+8, 552+(48-bh), 14, bh, i===3?BLUE:BLUE2+'55', 4);
  mono(`s1-bbd-${i}`, bx+4, 606, 22, d, 8.5, i===3?BLUE:MUTED, i===3?600:400, 'center');
});

nav(X1, 0);

// ═══════════════════════════════════════════════════════════════════════════
// S2 — TRIALS
// ═══════════════════════════════════════════════════════════════════════════
const X2 = GAP+W+GAP;
screenBg(X2);

sans(`s2-brand`, X2+16, 52, 90, 'ASSAY', 11, BLUE, 700, 'left', 1.2, 0.14);
mono(`s2-pg`, X2+W-50, 52, 34, '02/05', 10, MUTED, 400, 'right');

serif(`s2-h1`, X2+16, 74, W-32, 'Active\nTrials', 30, NAVY);
mono(`s2-step`, X2+16, 136, 180, '02 / Trials · 3 enrolling', 10, BLUE, 500, 'left', 1.4, 0.08);

// Phase filter
let px=X2+16;
['All','Phase I','Phase II','Phase III'].forEach((lbl,i)=>{
  const pw=lbl.length*6.8+18;
  R(`s2-pf-${i}`, px, 153, pw, 26, i===0?BLUE:CARD2, 13);
  sans(`s2-pft-${i}`, px+9, 160, pw-18, lbl, 9.5, i===0?WHITE:MUTED, i===0?600:400);
  px+=pw+8;
});

const trials=[
  {nm:'PHOENIX-3',ph:'Phase II',drug:'XR-448 Inhibitor',en:234,tgt:300,stg:2,col:BLUE,days:47,eff:'78.4%',p:'<0.001'},
  {nm:'AURORA-1',ph:'Phase III',drug:'AU-112 Antibody',en:312,tgt:340,stg:3,col:TEAL,days:183,eff:'91.2%',p:'<0.0001'},
  {nm:'DELTA-7',ph:'Phase I',drug:'DX-07 Small Mol.',en:48,tgt:80,stg:1,col:WARN,days:12,eff:'34.1%',p:'0.043'},
];

trials.forEach((t,i)=>{
  const ty=192+i*186;
  card(X2, ty, 173);
  R(`s2-ta-${i}`, X2+16, ty, 4, 173, t.col, [12,0,0,12]);
  sans(`s2-tnm-${i}`, X2+32, ty+14, 140, t.nm, 14, NAVY, 700);
  const phw=t.ph.length*6.5+14;
  R(`s2-ph-${i}`, X2+W-32-phw, ty+14, phw, 20, t.col+'22', 10);
  mono(`s2-pht-${i}`, X2+W-32-phw+7, ty+19, phw-14, t.ph, 8.5, t.col, 600);
  sans(`s2-dr-${i}`, X2+32, ty+33, 200, t.drug, 10, MUTED);
  hr(X2, ty+52, 16);
  // Stage dots (01–04)
  ['Pre','I','II','III'].forEach((s,si)=>{
    const dx=X2+32+si*74;
    const done=si<=t.stg-1;
    const active=si===t.stg-1;
    R(`s2-sd-${i}-${si}`, dx, ty+62, active?12:8, active?12:8, done?t.col:FAINT, active?6:4);
    mono(`s2-sl-${i}-${si}`, dx-4, ty+79, 32, s, 8, done?t.col:MUTED, done?600:400);
    if(si<3) R(`s2-sline-${i}-${si}`, dx+(active?12:8), ty+66, 62, 2, si<t.stg-1?t.col:FAINT, 1);
  });
  hr(X2, ty+98, 16);
  // Metrics
  [['Enrolled',`${t.en}/${t.tgt}`],['Days',String(t.days)],['Efficacy',t.eff],['p-val',t.p]].forEach(([lbl,val],mi)=>{
    const mx=X2+32+mi*80;
    mono(`s2-mv-${i}-${mi}`, mx, ty+108, 76, val, 11, mi===2?GREEN:NAVY, 600);
    sans(`s2-ml-${i}-${mi}`, mx, ty+124, 76, lbl, 9, MUTED);
  });
  R(`s2-enrt-${i}`, X2+32, ty+148, W-64, 6, FAINT, 3);
  R(`s2-enrf-${i}`, X2+32, ty+148, Math.round((W-64)*t.en/t.tgt), 6, t.col, 3);
  mono(`s2-ep-${i}`, X2+W-56, ty+155, 40, `${Math.round(t.en/t.tgt*100)}%`, 8.5, t.col, 600, 'right');
});

nav(X2, 1);

// ═══════════════════════════════════════════════════════════════════════════
// S3 — BIOMARKERS
// ═══════════════════════════════════════════════════════════════════════════
const X3 = GAP+2*(W+GAP);
screenBg(X3);

sans(`s3-brand`, X3+16, 52, 90, 'ASSAY', 11, BLUE, 700, 'left', 1.2, 0.14);
mono(`s3-pg`, X3+W-50, 52, 34, '03/05', 10, MUTED, 400, 'right');

serif(`s3-h1`, X3+16, 74, W-32, 'Biomarker\nTracker', 30, NAVY);
mono(`s3-step`, X3+16, 136, 200, '03 / Markers · PHOENIX-3', 10, BLUE, 500, 'left', 1.4, 0.08);

const markers=[
  {nm:'IL-6',full:'Interleukin-6',val:'4.2',unit:'pg/mL',rng:'< 7.0',trend:'+0.3',col:BLUE,vals:[3.1,3.5,3.8,4.0,4.2,4.1,4.2]},
  {nm:'CRP',full:'C-Reactive Protein',val:'0.8',unit:'mg/L',rng:'< 3.0',trend:'−0.2',col:GREEN,vals:[1.4,1.2,1.1,1.0,0.9,0.9,0.8]},
  {nm:'TNF-α',full:'Tumor Necrosis Factor',val:'12.1',unit:'pg/mL',rng:'< 20.0',trend:'+1.4',col:WARN,vals:[9.2,9.8,10.4,11.1,11.5,11.8,12.1]},
  {nm:'CD4',full:'CD4+ T Cell Count',val:'743',unit:'cells/μL',rng:'500–1200',trend:'+24',col:TEAL,vals:[680,695,710,720,728,736,743]},
];

markers.forEach((m,i)=>{
  const my=156+i*130;
  card(X3, my, 116);
  R(`s3-ma-${i}`, X3+16, my, 4, 116, m.col, [12,0,0,12]);
  mono(`s3-mn-${i}`, X3+32, my+14, 64, m.nm, 16, m.col, 700);
  sans(`s3-mf-${i}`, X3+32, my+34, 140, m.full, 9, MUTED, 400, 'left', 1.2);
  mono(`s3-mv-${i}`, X3+32, my+52, 80, m.val, 24, NAVY, 700);
  sans(`s3-mu-${i}`, X3+32, my+80, 80, m.unit, 9, MUTED);
  const rw=`Norm: ${m.rng}`.length*5.5+16;
  R(`s3-rb-${i}`, X3+32, my+96, rw, 16, m.col+'22', 8);
  mono(`s3-rt-${i}`, X3+32+8, my+100, rw-16, `Norm: ${m.rng}`, 7.5, m.col, 500, 'left', 1.3, 0.04);
  spark(X3+W-94, my+38, m.vals, m.col);
  mono(`s3-mtr-${i}`, X3+W-52, my+68, 36, m.trend, 10, m.trend.startsWith('−')?GREEN:m.col, 700, 'right');
  sans(`s3-m7d-${i}`, X3+W-52, my+84, 36, '7d', 8.5, MUTED, 400, 'right');
});

[['Normal',GREEN,'■'],['Borderline',WARN,'■'],['Elevated',RED,'■']].forEach(([lbl,col,sym],i)=>{
  mono(`s3-leg-${i}`, X3+16+i*112, H-100, 10, sym, 10, col);
  sans(`s3-legl-${i}`, X3+28+i*112, H-100, 80, lbl, 9, MUTED);
});

nav(X3, 2);

// ═══════════════════════════════════════════════════════════════════════════
// S4 — AI ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════
const X4 = GAP+3*(W+GAP);
screenBg(X4);

sans(`s4-brand`, X4+16, 52, 90, 'ASSAY', 11, BLUE, 700, 'left', 1.2, 0.14);
R(`s4-aibadge-bg`, X4+W-74, 46, 62, 22, BLUE+'22', 11);
sans(`s4-aibadge-t`, X4+W-68, 50, 56, 'AI · Live', 10, BLUE, 600);

serif(`s4-h1`, X4+16, 74, W-32, 'AI\nAnalysis', 30, NAVY);
mono(`s4-step`, X4+16, 136, 220, '04 / Insights · Generated 09:41', 10, BLUE, 500, 'left', 1.4, 0.08);

// Summary hero card — dark inversion (navy on light screen = strong focal point)
R(`s4-sum-bg`, X4+16, 157, W-32, 82, NAVY, 14);
sans(`s4-sum-lbl`, X4+28, 169, 100, 'AI Summary', 10, WHITE+'99', 500);
sans(`s4-sum-txt`, X4+28, 186, W-56, 'PHOENIX-3 shows significant efficacy improvement. Recommend accelerating Phase III enrollment by 30 subjects.', 12, WHITE, 400, 'left', 1.35);

// Confidence bars
[['Efficacy signal',94,BLUE],['Safety profile',87,GREEN],['Protocol adherence',91,TEAL],['Data completeness',78,WARN]].forEach(([lbl,pct,col],i)=>{
  pbar(X4, 255+i*52, lbl, pct/100, col, `${pct}%`);
});

// Detected patterns
sans(`s4-pat-hdr`, X4+16, 468, W-32, 'Detected Patterns', 12, NAVY, 600);

[{tag:'SIGNAL',txt:'IL-6 suppression correlates with XR-448 dosage increase',time:'2h',col:BLUE},
 {tag:'ANOMALY',txt:'Subject 047 shows atypical CRP elevation — review needed',time:'5h',col:WARN},
 {tag:'TREND',txt:'CD4 recovery outperforming Phase II baseline by 31%',time:'8h',col:GREEN}].forEach((p,i)=>{
  const py=488+i*82;
  card(X4, py, 70);
  const tw=p.tag.length*6.5+14;
  R(`s4-tg-${i}`, X4+28, py+14, tw, 18, p.col+'22', 9);
  mono(`s4-tgt-${i}`, X4+28+7, py+18, tw-14, p.tag, 7.5, p.col, 700, 'left', 1.3, 0.1);
  sans(`s4-pt-${i}`, X4+28, py+36, W-60, p.txt, 11, NAVY, 400, 'left', 1.3);
  mono(`s4-tm-${i}`, X4+W-56, py+14, 40, `${p.time} ago`, 9, MUTED, 400, 'right');
});

nav(X4, 3);

// ═══════════════════════════════════════════════════════════════════════════
// S5 — TEAM
// ═══════════════════════════════════════════════════════════════════════════
const X5 = GAP+4*(W+GAP);
screenBg(X5);

sans(`s5-brand`, X5+16, 52, 90, 'ASSAY', 11, BLUE, 700, 'left', 1.2, 0.14);
sans(`s5-online`, X5+W-70, 50, 54, '● 8 online', 10, GREEN, 500, 'right');

serif(`s5-h1`, X5+16, 74, W-32, 'Research\nTeam', 30, NAVY);
mono(`s5-step`, X5+16, 136, 200, '05 / Team · 3 active now', 10, BLUE, 500, 'left', 1.4, 0.08);

[{ini:'DK',nm:'Dr. Kovacs',role:'Principal Investigator',st:'online',trial:'PHOENIX-3',col:BLUE},
 {ini:'SL',nm:'Sarah Lin',role:'Clinical Statistician',st:'online',trial:'AURORA-1',col:TEAL},
 {ini:'MR',nm:'Marc Reyes',role:'Data Coordinator',st:'away',trial:'DELTA-7',col:WARN},
 {ini:'AT',nm:'Aiko Tanaka',role:'Lab Scientist',st:'online',trial:'PHOENIX-3',col:GREEN}].forEach((m,i)=>{
  const ty=158+i*90;
  card(X5, ty, 78);
  R(`s5-av-${i}`, X5+28, ty+14, 44, 44, m.col+'22', 22);
  sans(`s5-ai-${i}`, X5+28, ty+21, 44, m.ini, 15, m.col, 700, 'center');
  R(`s5-st-${i}`, X5+57, ty+50, 10, 10, m.st==='online'?GREEN:WARN, 5);
  sans(`s5-nm-${i}`, X5+82, ty+14, 180, m.nm, 13, NAVY, 700);
  sans(`s5-rl-${i}`, X5+82, ty+32, 180, m.role, 10, MUTED);
  const tbw=m.trial.length*5.8+14;
  R(`s5-tb-${i}`, X5+82, ty+52, tbw, 18, m.col+'22', 9);
  mono(`s5-tt-${i}`, X5+82+7, ty+56, tbw-14, m.trial, 8, m.col, 600, 'left', 1.3, 0.04);
  mono(`s5-ts-${i}`, X5+W-52, ty+14, 36, ['now','now','2h','now'][i], 10, m.st==='online'?GREEN:MUTED, 500, 'right');
});

sans(`s5-act-hdr`, X5+16, 522, W-32, 'Recent Activity', 12, NAVY, 600);

[{u:'DK',txt:'Updated efficacy endpoint analysis for PHOENIX-3',t:'9:41',col:BLUE},
 {u:'SL',txt:'Reviewed AURORA-1 interim data package',t:'9:22',col:TEAL},
 {u:'AT',txt:'Added 12 new biomarker readings to dataset',t:'8:55',col:GREEN},
 {u:'MR',txt:'Submitted DELTA-7 SAE safety report',t:'8:30',col:WARN}].forEach((a,i)=>{
  const ay=542+i*50;
  R(`s5-aav-${i}`, X5+16, ay+4, 28, 28, a.col+'22', 14);
  sans(`s5-aai-${i}`, X5+16, ay+9, 28, a.u, 10, a.col, 700, 'center');
  sans(`s5-at-${i}`, X5+54, ay+4, W-90, a.txt, 11, NAVY, 400, 'left', 1.3);
  mono(`s5-atm-${i}`, X5+W-52, ay+4, 36, a.t, 9.5, MUTED, 400, 'right');
  if(i<3) hr(X5, ay+38, 38);
});

nav(X5, 4);

// ─── Export ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'ASSAY — precision biomedical research platform',
  width: canvas_w,
  height: H,
  fill: ICE,
  children: nodes.map(nd => {
    if (nd.type==='RECTANGLE') return {
      type:'RECTANGLE', id:nd.id, name:nd.name,
      x:nd.x, y:nd.y, width:nd.width, height:nd.height,
      fill:nd.fill, cornerRadius:nd.cornerRadius,
      opacity:nd.opacity, stroke:nd.stroke, strokeWidth:nd.strokeWidth,
    };
    if (nd.type==='TEXT') return {
      type:'TEXT', id:nd.id, name:nd.name,
      x:nd.x, y:nd.y, width:nd.width,
      content:nd.content, fontSize:nd.fontSize, color:nd.color,
      fontFamily:nd.fontFamily, fontWeight:nd.fontWeight,
      textAlign:nd.textAlign, lineHeight:nd.lineHeight, letterSpacing:nd.letterSpacing,
    };
    return nd;
  })
};

fs.writeFileSync('assay.pen', JSON.stringify(pen, null, 2));
console.log(`✓ assay.pen — ${nodes.length} nodes across ${SCREENS} screens`);
console.log(`  Canvas: ${canvas_w}×${H}  Theme: LIGHT (ice-blue)`);
