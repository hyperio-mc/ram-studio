#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────
// RAFT — Sprint intelligence for healthy teams
// Inspired by:
//   · Mixpanel "Digital analytics reimagined for an AI-first world"
//     (featured on godly.website) — clean editorial light-mode analytics,
//     breathable grid, bold typography, minimal chrome
//   · JetBrains Air "Multitask with agents, stay in control" (lapa.ninja)
//     — agent-powered workflow insight with calm human-centered design
//
// LIGHT editorial theme: warm cream, forest green, amber accent
// Pencil.dev v2.8 format
// ─────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

// ── Palette ──────────────────────────────────────────────────────
const BG       = '#F8F5EF';   // warm cream
const SURFACE  = '#FFFFFF';
const SURFACE2 = '#F2EFE8';   // muted cream
const TEXT     = '#1C1A17';   // warm near-black
const MUTED    = '#8A8277';
const LIGHT    = '#DDD8CF';   // separator
const ACCENT   = '#2D6A4F';   // forest green
const ACCENT2  = '#F4A261';   // warm amber
const ACCENT3  = '#C1440E';   // terracotta/alert
const SUCCESS  = '#52B788';   // soft mint
const INFO     = '#4A7CC9';   // calm blue
const TAG_BG   = '#E8F5EE';
const TAG_TC   = '#2D6A4F';

// ── Primitives ───────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y, width:w, height:h, fill,
    radius: opts.radius??0, opacity: opts.opacity??1,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth??1 };
}
function txt(content,x,y,opts={}) {
  return { type:'text', content:String(content), x, y,
    fontSize: opts.size??13, fontWeight: opts.weight??'regular',
    color: opts.color??TEXT, align: opts.align??'left',
    fontFamily: opts.font??'Inter', opacity: opts.opacity??1 };
}
function ln(x1,y1,x2,y2,color=LIGHT,w=1) {
  return { type:'line', x1,y1,x2,y2, stroke:color, strokeWidth:w };
}
function circ(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r, fill,
    opacity: opts.opacity??1, stroke: opts.stroke, strokeWidth: opts.strokeWidth };
}

// ── Compounds ────────────────────────────────────────────────────
function bar(x,y,w,pct,opts={}) {
  const h=opts.h??5, tr=opts.track??'#E8E4DC', fc=opts.fill??ACCENT;
  return [
    rect(x,y,w,h,tr,{radius:h/2}),
    rect(x,y,Math.max(h,w*Math.min(1,pct)),h,fc,{radius:h/2}),
  ];
}

function tag(x,y,label,opts={}) {
  if(!label) return [];
  const bg=opts.bg??TAG_BG, tc=opts.color??TAG_TC;
  const w=opts.w||(label.length*6+18);
  return [
    rect(x,y-9,w,18,bg,{radius:9}),
    txt(label, x+w/2, y+4, {size:10,weight:'medium',color:tc,align:'center'}),
  ];
}

function card(x,y,w,h,opts={}) {
  return rect(x,y,w,h, opts.fill??SURFACE,
    {radius:opts.radius??10, stroke:opts.stroke??LIGHT, strokeWidth:1});
}

// ── Status bar ───────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,390,44,BG),
    txt('9:41',16,28,{size:15,weight:'semibold'}),
    txt('● ◀ ▌▌',280,28,{size:11}),
  ];
}

// ── Nav bar ──────────────────────────────────────────────────────
function navBar(active) {
  const items=[
    {label:'Sprint',icon:'◈'},
    {label:'Pulse', icon:'♡'},
    {label:'Trends',icon:'↗'},
    {label:'Actions',icon:'✦'},
    {label:'Team',  icon:'⊕'},
  ];
  const y=780, W=390, els=[
    rect(0,y,W,60,SURFACE,{stroke:LIGHT}),
    ln(0,y,W,y,LIGHT),
  ];
  items.forEach((it,i)=>{
    const cx = W/items.length*i + W/items.length/2;
    const on = i===active;
    const c  = on ? ACCENT : MUTED;
    els.push(
      txt(it.icon, cx, y+16, {size:on?16:14, color:c, align:'center', weight:on?'bold':'regular'}),
      txt(it.label, cx, y+34, {size:9, color:c, align:'center', weight:on?'semibold':'regular'}),
    );
    if(on) els.push(rect(cx-18,y,36,2,ACCENT,{radius:1}));
  });
  return els;
}

// ── Header ───────────────────────────────────────────────────────
function header(y,opts={}) {
  const els=[];
  if(opts.logo) {
    els.push(
      txt('RAFT',20,y+28,{size:18,weight:'bold',color:TEXT,font:'Georgia'}),
    );
  }
  if(opts.title)    els.push(txt(opts.title,20,y+26,{size:18,weight:'bold'}));
  if(opts.subtitle) els.push(txt(opts.subtitle,20,y+44,{size:12,color:MUTED}));
  if(opts.action) {
    els.push(
      rect(314,y+12,60,26,ACCENT,{radius:13}),
      txt(opts.action,344,y+30,{size:11,weight:'semibold',color:'#FFF',align:'center'}),
    );
  }
  if(opts.avatar) {
    els.push(circ(358,y+22,16,ACCENT2));
    els.push(txt('RK',358,y+26,{size:10,weight:'bold',color:'#FFF',align:'center'}));
  }
  return els;
}

// ═════════════════════════════════════════════════════════════════
// SCREEN 1 — Sprint Overview
// ═════════════════════════════════════════════════════════════════
function s1() {
  const els=[rect(0,0,390,840,BG), ...statusBar()];
  els.push(...header(44,{logo:true, subtitle:'Sprint 24 · Q2 2026', avatar:true}));

  // Big health score
  let y=110;
  els.push(
    txt('Sprint Health',20,y+12,{size:11,color:MUTED,weight:'medium'}),
    txt('78',20,y+68,{size:64,weight:'bold',color:ACCENT,font:'Georgia'}),
    txt('/ 100',94,y+62,{size:22,color:MUTED,font:'Georgia'}),
    txt('↑ 6 pts vs last sprint',20,y+82,{size:12,color:SUCCESS}),
    ...bar(20,y+96,240,0.78,{h:6,fill:ACCENT}),
    txt('4 days left',272,y+102,{size:11,color:MUTED}),
  );

  y=224; els.push(ln(20,y,370,y));

  // Metrics row
  y=238;
  const M=[
    {label:'Velocity',  v:'42', sub:'pts',    delta:'+8%',  up:true},
    {label:'Completed', v:'18', sub:'tasks',  delta:'76%',  up:true},
    {label:'Blocked',   v:' 3', sub:'tasks',  delta:'-1',   up:false},
  ];
  const mw=(350-16)/3;
  M.forEach((m,i)=>{
    const mx=20+i*(mw+8);
    const vc=i===2?ACCENT3:TEXT;
    els.push(
      card(mx,y,mw,68),
      txt(m.label, mx+10,y+14,{size:10,color:MUTED}),
      txt(m.v,     mx+10,y+40,{size:24,weight:'bold',color:vc}),
      txt(m.sub,   mx+10+(m.v.trim().length*13.5),y+36,{size:11,color:MUTED}),
      txt(m.delta, mx+mw-8,y+40,{size:11,color:m.up?SUCCESS:ACCENT3,align:'right'}),
    );
  });

  // In-progress tasks
  y=324;
  els.push(
    txt('In Progress',20,y+12,{size:13,weight:'semibold'}),
    txt('See all →',330,y+12,{size:12,color:ACCENT}),
  );
  y=348;

  const tasks=[
    {title:'Redesign onboarding flow',   initials:'JL',color:INFO,    pct:0.70,tag:'Design',  blocked:false},
    {title:'API rate limiting v2',        initials:'MK',color:SUCCESS, pct:0.45,tag:'Eng',     blocked:true },
    {title:'Write Q2 OKR brief',          initials:'RK',color:ACCENT2, pct:0.90,tag:'Strategy',blocked:false},
  ];
  tasks.forEach((t,i)=>{
    const ty=y+i*76;
    const bc=t.blocked?ACCENT3:ACCENT;
    els.push(
      card(20,ty,350,66,{radius:8}),
      circ(42,ty+20,12,t.blocked?'#FFF3F0':TAG_BG,{stroke:bc,strokeWidth:1.5}),
      txt(t.initials,42,ty+24,{size:8,weight:'bold',color:bc,align:'center'}),
      txt(t.title,62,ty+20,{size:12,weight:'semibold'}),
      ...bar(62,ty+32,220,t.pct,{h:4,fill:bc}),
      txt(Math.round(t.pct*100)+'%',292,ty+36,{size:10,color:MUTED}),
      ...tag(62,ty+52,t.tag),
    );
    if(t.blocked) els.push(...tag(114,ty+52,'BLOCKED',{bg:'#FFEDEB',color:ACCENT3}));
  });

  // AI insight
  y=584;
  els.push(
    card(20,y,350,52,{fill:'#F0FAF4',stroke:SUCCESS,radius:10}),
    txt('✦',38,y+28,{size:14,color:ACCENT}),
    txt('AI Insight',58,y+18,{size:10,weight:'semibold',color:ACCENT}),
    txt('Blocker pattern mirrors Sprint 21 slowdown.',58,y+33,{size:11,color:TEXT}),
    txt('View →',336,y+28,{size:11,color:ACCENT,align:'right'}),
  );

  els.push(...navBar(0));
  return els;
}

// ═════════════════════════════════════════════════════════════════
// SCREEN 2 — Team Pulse
// ═════════════════════════════════════════════════════════════════
function s2() {
  const els=[rect(0,0,390,840,BG), ...statusBar()];
  els.push(...header(44,{title:'Team Pulse',subtitle:'Sprint 24 · 5 responses'}));

  let y=104;
  els.push(
    txt('Overall Mood',20,y+12,{size:11,color:MUTED,weight:'medium'}),
    txt('Energized',20,y+52,{size:32,weight:'bold',font:'Georgia'}),
    txt('↑ up from Neutral last sprint',20,y+72,{size:12,color:SUCCESS}),
  );

  // Mood bar
  y=168;
  const moods=[
    {label:'😊 Great',pct:0.40,color:SUCCESS},
    {label:'🙂 Good', pct:0.35,color:ACCENT},
    {label:'😐 Meh',  pct:0.15,color:ACCENT2},
    {label:'😟 Rough',pct:0.10,color:ACCENT3},
  ];
  let bx=20;
  moods.forEach(m=>{
    const sw=Math.round(348*m.pct)-2;
    els.push(rect(bx,y,sw,10,m.color,{radius:4}));
    bx+=sw+2;
  });
  y+=18;
  moods.forEach((m,i)=>{
    const lx=20+i*90;
    els.push(
      circ(lx+6,y+8,4,m.color),
      txt(m.label,lx+14,y+12,{size:10,color:MUTED}),
      txt(Math.round(m.pct*100)+'%',lx+14,y+24,{size:11,weight:'semibold',color:TEXT}),
    );
  });

  y=226; els.push(ln(20,y,370,y));
  y=238;
  els.push(txt('By Category',20,y+12,{size:13,weight:'semibold'}));
  y=260;

  const cats=[
    {label:'Collaboration', score:4.2,max:5},
    {label:'Workload',      score:3.1,max:5},
    {label:'Process clarity',score:3.8,max:5},
    {label:'Manager support',score:4.6,max:5},
  ];
  cats.forEach((c,i)=>{
    const cy=y+i*44, pct=c.score/c.max;
    const sc=pct>=0.8?SUCCESS:pct>=0.6?ACCENT:ACCENT2;
    els.push(
      txt(c.label,20,cy+14,{size:12}),
      txt(c.score.toFixed(1),360,cy+14,{size:13,weight:'bold',color:sc,align:'right'}),
      ...bar(20,cy+22,310,pct,{h:5,fill:sc}),
    );
  });

  y=444; els.push(ln(20,y,370,y));
  els.push(
    txt('Feedback',20,y+16,{size:13,weight:'semibold'}),
    txt('Anonymous',320,y+16,{size:11,color:MUTED}),
  );
  y=472;
  const fb=[
    {mood:'😊',text:'"Really liked how we handled the backend incident — fast and calm."',tag:'Process'},
    {mood:'😐',text:'"Too many context switches this sprint. Focus would help a lot."',tag:'Workload'},
  ];
  fb.forEach((f,i)=>{
    const fy=y+i*88;
    els.push(
      card(20,fy,350,76,{radius:8}),
      txt(f.mood,34,fy+30,{size:20}),
      txt(f.text,62,fy+22,{size:11,color:TEXT}),
      ...tag(62,fy+52,f.tag),
    );
  });

  y=658;
  els.push(
    card(20,y,350,52,{fill:'#FFF8F0',stroke:ACCENT2,radius:10}),
    txt('✦',38,y+28,{size:14,color:ACCENT2}),
    txt('AI Summary',58,y+18,{size:10,weight:'semibold',color:ACCENT2}),
    txt('Collaboration strong. Workload & focus need attention.',58,y+33,{size:11,color:TEXT}),
  );

  els.push(...navBar(1));
  return els;
}

// ═════════════════════════════════════════════════════════════════
// SCREEN 3 — Velocity Trends
// ═════════════════════════════════════════════════════════════════
function s3() {
  const els=[rect(0,0,390,840,BG), ...statusBar()];
  els.push(...header(44,{title:'Velocity',subtitle:'Last 6 sprints'}));

  let y=110;
  els.push(txt('Story Points Delivered',20,y+12,{size:11,color:MUTED}));

  const sprints=[
    {n:'S19',pts:28},{n:'S20',pts:34},{n:'S21',pts:31},
    {n:'S22',pts:38},{n:'S23',pts:34},{n:'S24',pts:42,cur:true},
  ];
  const cY=y+36, cH=110, maxP=50;
  const bW=38, gap=(350-bW*6)/7;

  // Avg line
  const avg=sprints.reduce((a,s)=>a+s.pts,0)/sprints.length;
  const avgY=cY+cH-(avg/maxP)*cH;
  els.push(
    ln(20,avgY,370,avgY,'#C8D8CF',1),
    txt('avg '+Math.round(avg),372,avgY+4,{size:9,color:MUTED}),
  );

  // Bars + trend line
  sprints.forEach((s,i)=>{
    const bx=20+gap+i*(bW+gap);
    const bh=(s.pts/maxP)*cH, by=cY+cH-bh;
    const c=s.cur?ACCENT:'#C8D8CF';
    els.push(
      rect(bx,by,bW,bh,c,{radius:4}),
      txt(s.pts,bx+bW/2,by-6,{size:11,weight:s.cur?'bold':'regular',color:s.cur?ACCENT:MUTED,align:'center'}),
      txt(s.n,bx+bW/2,cY+cH+14,{size:10,color:MUTED,align:'center'}),
    );
    const cx=bx+bW/2, cy2=by;
    if(i>0){
      const prev=sprints[i-1];
      const px=20+gap+(i-1)*(bW+gap)+bW/2;
      const py=cY+cH-(prev.pts/maxP)*cH;
      els.push(ln(px,py,cx,cy2,ACCENT,1.5));
    }
    els.push(circ(cx,cy2,4,s.cur?ACCENT:SURFACE,{stroke:ACCENT,strokeWidth:1.5}));
  });

  y=282; els.push(ln(20,y,370,y));
  y=294;
  els.push(txt('Sprint Breakdown',20,y+12,{size:13,weight:'semibold'}));
  y=316;

  const bkd=[
    {label:'Features',  pts:22,pct:0.52,color:ACCENT},
    {label:'Bug fixes', pts:12,pct:0.29,color:ACCENT2},
    {label:'Tech debt',  pts:5,pct:0.12,color:INFO},
    {label:'Discovery',  pts:3,pct:0.07,color:MUTED},
  ];
  bkd.forEach((b,i)=>{
    const by2=y+i*38;
    els.push(
      circ(28,by2+10,5,b.color),
      txt(b.label,40,by2+14,{size:12}),
      txt(b.pts+' pts',355,by2+14,{size:12,color:MUTED,align:'right'}),
      ...bar(40,by2+22,296,b.pct,{h:4,fill:b.color}),
    );
  });

  // Prediction card
  y=484;
  els.push(
    card(20,y,350,68,{fill:'#F0FAF4',stroke:SUCCESS,radius:10}),
    txt('✦ Prediction',36,y+18,{size:11,weight:'semibold',color:ACCENT}),
    txt('Next sprint',36,y+36,{size:12,color:TEXT}),
    txt('46–50 pts',36,y+54,{size:20,weight:'bold',color:ACCENT,font:'Georgia'}),
    txt('↑ Based on 3-sprint trend + team capacity',160,y+46,{size:10,color:MUTED}),
  );

  // Recurring blockers
  y=570; els.push(ln(20,y,370,y));
  y+=12;
  els.push(txt('Recurring Blockers',20,y+12,{size:13,weight:'semibold'}));
  y+=34;

  const blk=[
    {name:'External API dependency',count:3,sprints:'S21–S24'},
    {name:'Design handoff delays',  count:2,sprints:'S22–S23'},
  ];
  blk.forEach((b,i)=>{
    const by3=y+i*54;
    els.push(
      card(20,by3,350,44,{radius:8}),
      rect(20,by3,4,44,ACCENT3,{radius:2}),
      txt(b.name,34,by3+18,{size:12,weight:'medium'}),
      txt('×'+b.count+' sprints · '+b.sprints,34,by3+32,{size:10,color:MUTED}),
      txt('View →',352,by3+24,{size:11,color:ACCENT,align:'right'}),
    );
  });

  els.push(...navBar(2));
  return els;
}

// ═════════════════════════════════════════════════════════════════
// SCREEN 4 — Action Items
// ═════════════════════════════════════════════════════════════════
function s4() {
  const els=[rect(0,0,390,840,BG), ...statusBar()];
  els.push(...header(44,{title:'Actions',subtitle:'Sprint 24 · 8 items',action:'+ New'}));

  let y=100;
  const filters=['All  8','Open  5','Done  3'];
  filters.forEach((f,i)=>{
    const on=i===1, fw=62, fx=20+i*(fw+8);
    els.push(
      rect(fx,y,fw,24,on?ACCENT:SURFACE2,{radius:12,stroke:on?ACCENT:LIGHT}),
      txt(f,fx+fw/2,y+16,{size:11,weight:on?'semibold':'regular',color:on?'#FFF':MUTED,align:'center'}),
    );
  });

  y=136;
  els.push(txt('Open',20,y+10,{size:11,weight:'semibold',color:MUTED}));
  y+=28;

  const actions=[
    {title:'Add daily async standup template', owner:'JL',oc:INFO,   due:'Apr 5',priority:'high',   sprint:'S24'},
    {title:'Document API rollback procedure',  owner:'MK',oc:SUCCESS, due:'Apr 8',priority:'high',   sprint:'S24'},
    {title:'Schedule design-eng sync weekly',  owner:'RK',oc:ACCENT2, due:'Apr 3',priority:'medium', sprint:'S24'},
    {title:'Create on-call rotation doc',      owner:'AL',oc:'#9B59B6',due:'Apr 10',priority:'low',  sprint:'S24'},
    {title:'Update team norms doc',            owner:'JL',oc:INFO,   due:'Apr 1', done:true,          sprint:'S23'},
  ];

  actions.filter(a=>!a.done).forEach((a,i)=>{
    const ay=y+i*74;
    const pc=a.priority==='high'?ACCENT3:a.priority==='medium'?ACCENT2:MUTED;
    const pbg=a.priority==='high'?'#FFEDEB':a.priority==='medium'?'#FFF8EE':SURFACE2;
    els.push(
      card(20,ay,350,64,{radius:8}),
      rect(30,ay+18,18,18,SURFACE2,{radius:4,stroke:LIGHT}),
      txt(a.title,56,ay+20,{size:12,weight:'semibold'}),
      circ(58,ay+46,9,a.oc),
      txt(a.owner,58,ay+49,{size:7,weight:'bold',color:'#FFF',align:'center'}),
      txt(a.due,74,ay+48,{size:10,color:MUTED}),
      ...tag(a.priority?242:999,ay+40,a.priority?(a.priority==='high'?'HIGH':a.priority==='medium'?'MED':'LOW'):'',{bg:pbg,color:pc,w:38}),
      ...tag(292,ay+40,a.sprint),
    );
  });

  // Done section
  y = y + 4*74 + 10;
  els.push(ln(20,y,370,y));
  y+=12;
  els.push(txt('Completed  ·  3 this sprint',20,y+10,{size:11,weight:'semibold',color:MUTED}));
  y+=28;

  actions.filter(a=>a.done).forEach((a,i)=>{
    const ay=y+i*48;
    els.push(
      card(20,ay,350,38,{radius:8,fill:SURFACE2}),
      rect(30,ay+10,18,18,SUCCESS,{radius:4}),
      txt('✓',39,ay+21,{size:10,weight:'bold',color:'#FFF',align:'center'}),
      txt(a.title,56,ay+21,{size:12,color:MUTED}),
      circ(312,ay+19,9,a.oc),
      txt(a.owner,312,ay+22,{size:7,weight:'bold',color:'#FFF',align:'center'}),
      txt(a.due,328,ay+21,{size:10,color:LIGHT}),
    );
  });

  els.push(...navBar(3));
  return els;
}

// ═════════════════════════════════════════════════════════════════
// SCREEN 5 — Team Health
// ═════════════════════════════════════════════════════════════════
function s5() {
  const els=[rect(0,0,390,840,BG), ...statusBar()];
  els.push(...header(44,{title:'Team',subtitle:'5 members · Active',action:'Invite'}));

  let y=104;
  const members=[
    {name:'Jordan Lee', role:'Design Lead',   initials:'JL',color:INFO,    health:88,mood:'😊',pts:12,acts:2,risk:false},
    {name:'Maya Kim',   role:'Backend Eng',   initials:'MK',color:SUCCESS, health:74,mood:'🙂',pts:18,acts:1,risk:false},
    {name:'Rakis',      role:'Product',       initials:'RK',color:ACCENT2, health:91,mood:'😊',pts:8, acts:1,risk:false},
    {name:'Alex Liu',   role:'Frontend Eng',  initials:'AL',color:'#9B59B6',health:56,mood:'😐',pts:14,acts:3,risk:true},
  ];

  members.forEach((m,i)=>{
    const my=y+i*86;
    const hc=m.health>=80?SUCCESS:m.health>=65?ACCENT:ACCENT3;
    els.push(
      card(20,my,350,76,{radius:10}),
      circ(52,my+28,20,m.color),
      txt(m.initials,52,my+32,{size:11,weight:'bold',color:'#FFF',align:'center'}),
      txt(m.name,82,my+20,{size:13,weight:'semibold'}),
      txt(m.role,82,my+35,{size:11,color:MUTED}),
      txt(m.mood+' '+m.pts+'pts · '+m.acts+' actions',82,my+56,{size:10,color:MUTED}),
      txt(m.health,322,my+22,{size:20,weight:'bold',color:hc,align:'right'}),
      txt('health',322,my+37,{size:9,color:MUTED,align:'right'}),
      ...bar(82,my+62,200,m.health/100,{h:3,fill:hc,track:'#EDE9E1'}),
    );
    if(m.risk) {
      els.push(
        rect(290,my+48,52,16,'#FFEDEB',{radius:8}),
        txt('At risk',316,my+59,{size:9,weight:'semibold',color:ACCENT3,align:'center'}),
      );
    }
  });

  // Aggregate
  y=452; els.push(ln(20,y,370,y));
  y+=12;
  els.push(
    txt('Team average',20,y+14,{size:12,color:MUTED}),
    txt('77',358,y+14,{size:14,weight:'bold',color:ACCENT,align:'right'}),
    ...bar(20,y+24,350,0.77,{h:6,fill:ACCENT}),
  );

  // AI recommendation
  y+=58;
  els.push(
    card(20,y,350,80,{fill:'#FFF8F0',stroke:ACCENT2,radius:10}),
    txt('✦ Recommendation',36,y+18,{size:11,weight:'semibold',color:ACCENT2}),
    txt("Alex's health score has dropped 3 sprints in a row.",36,y+36,{size:11,color:TEXT}),
    txt('Consider a 1:1 before next sprint planning.',36,y+52,{size:11,color:TEXT}),
    txt('Schedule →',340,y+36,{size:11,color:ACCENT,align:'right'}),
  );

  // Upcoming retro
  y+=98;
  els.push(
    card(20,y,350,52,{fill:TAG_BG,stroke:ACCENT,radius:10}),
    txt('📅',36,y+28,{size:16}),
    txt('Sprint 24 Retro',60,y+20,{size:12,weight:'semibold',color:ACCENT}),
    txt('Friday Apr 5 · 2:00 PM · 8 responses so far',60,y+36,{size:11,color:MUTED}),
    txt('Join →',342,y+30,{size:11,color:ACCENT,align:'right'}),
  );

  els.push(...navBar(4));
  return els;
}

// ═════════════════════════════════════════════════════════════════
// WRITE PEN
// ═════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  name: 'RAFT — Sprint intelligence for healthy teams',
  description: 'Light warm editorial theme. AI-powered sprint health, team pulse, velocity trends, and retrospective action tracking. Inspired by Mixpanel\'s AI-first analytics clarity (godly.website) and JetBrains Air agent-productivity aesthetic (lapa.ninja).',
  theme: 'light',
  screens: [
    {id:'screen1',name:'Sprint Overview',width:390,height:840,backgroundColor:BG,elements:s1()},
    {id:'screen2',name:'Team Pulse',     width:390,height:840,backgroundColor:BG,elements:s2()},
    {id:'screen3',name:'Velocity',       width:390,height:840,backgroundColor:BG,elements:s3()},
    {id:'screen4',name:'Actions',        width:390,height:840,backgroundColor:BG,elements:s4()},
    {id:'screen5',name:'Team Health',    width:390,height:840,backgroundColor:BG,elements:s5()},
  ],
};

const out=path.join(__dirname,'raft.pen');
fs.writeFileSync(out,JSON.stringify(pen,null,2));
const kb=(fs.statSync(out).size/1024).toFixed(1);
console.log(`✓ raft.pen written (${kb} KB)`);
console.log(`  5 screens — light editorial theme`);
console.log(`  Palette: cream #F8F5EF + forest green #2D6A4F + amber #F4A261`);
