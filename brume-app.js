'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG      = 'brume';
const NAME      = 'BRUME';
const TAGLINE   = 'Your creative studio, at rest';
const HEARTBEAT = 390;
const W = 390, H = 844;

// Warm cream editorial palette — LIGHT theme
// Inspired by Land-book "warm neutral" SaaS + minimal.gallery "Pastel Confidence"
const BG    = '#F8F4EE';
const SURF  = '#FFFFFF';
const CARD  = '#F0EAE0';
const ACC   = '#C75D3A';  // sienna / terracotta
const ACC2  = '#4B7BAB';  // steel blue
const ACCLT = '#FCE8E0';  // terracotta tint
const ACC2LT= '#DDE8F3';  // blue tint
const TEXT  = '#1D1916';
const MID   = '#7A6D66';  // warm grey
const DIVID = '#E4DDD4';
const GREEN = '#3B7D5B';
const GREENLT='#DCF0E5';
const AMBER = '#B08520';
const AMBERLT='#FDF0C9';

// ── primitives ──────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.fw||'normal',
    fontFamily: opts.font||'Georgia, serif',
    textAnchor: opts.anchor||'start',
    letterSpacing: opts.ls||0, opacity: opts.opacity!=null?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!=null?opts.opacity:1 };
}

const screens = [];

// ── helpers ──────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0,0,W,44,SURF));
  els.push(text(20,28,'9:41',13,TEXT,{fw:'500',font:'system-ui'}));
  els.push(text(W-20,28,'●●●',13,TEXT,{anchor:'end',font:'system-ui'}));
}
function bottomNav(els, active) {
  els.push(rect(0,H-80,W,80,SURF,{stroke:DIVID,sw:1}));
  const tabs=[
    {icon:'⌂',label:'Studio',id:'studio'},
    {icon:'◫',label:'Projects',id:'projects'},
    {icon:'◎',label:'Clients',id:'clients'},
    {icon:'≡',label:'Insights',id:'insights'},
  ];
  tabs.forEach((t,i)=>{
    const x=24+(i*(W-48)/3);
    const isActive=t.id===active;
    els.push(text(x+18,H-48,t.icon,18,isActive?ACC:MID,{anchor:'middle',font:'system-ui'}));
    els.push(text(x+18,H-28,t.label,10,isActive?ACC:MID,{anchor:'middle',font:'system-ui',fw:isActive?'600':'400'}));
    if(isActive) els.push(rect(x+8,H-80,20,3,ACC,{rx:1.5}));
  });
}
function screenHeader(els,title,sub,yTop=44) {
  els.push(rect(0,yTop,W,64,SURF));
  els.push(text(20,yTop+24,title,20,TEXT,{fw:'700',font:'Georgia, serif'}));
  if(sub) els.push(text(20,yTop+44,sub,12,MID,{font:'system-ui'}));
  els.push(line(0,yTop+64,W,yTop+64,DIVID,{sw:1,opacity:0.6}));
}
function pill(x,y,label,bg,col,els,w=60,h=22) {
  els.push(rect(x,y,w,h,bg,{rx:11}));
  els.push(text(x+w/2,y+15,label,10,col,{anchor:'middle',font:'system-ui',fw:'600'}));
}
function avatar(cx,cy,r,initial,bg,els) {
  els.push(circle(cx,cy,r,bg));
  els.push(text(cx,cy+5,initial,r*0.8,SURF,{anchor:'middle',font:'system-ui',fw:'700'}));
}

// ═══════════════════════════════════════════════════════════════
// Screen 1: Studio Hub
// ═══════════════════════════════════════════════════════════════
(()=>{
  const els=[];
  statusBar(els);

  // Header greeting
  els.push(rect(0,44,W,88,SURF));
  els.push(text(20,76,'Good morning, Mia',22,TEXT,{fw:'700',font:'Georgia, serif'}));
  els.push(text(20,96,'Tuesday, April 8',12,MID,{font:'system-ui'}));

  // Avatar cluster
  avatar(W-56,75,18,MID,ACC,els);
  els.push(text(W-56,80,'M',10,SURF,{anchor:'middle',font:'system-ui',fw:'700'}));

  // Notification badge
  els.push(circle(W-42,62,6,ACC));
  els.push(text(W-42,66,'3',8,SURF,{anchor:'middle',font:'system-ui',fw:'700'}));

  els.push(line(0,132,W,132,DIVID,{sw:1,opacity:0.6}));

  // Quick stats row
  const statsY=148;
  els.push(rect(0,132,W,84,BG));
  const stats=[
    {label:'Active',val:'7',sub:'projects'},
    {label:'Pending',val:'$12.4k',sub:'invoices'},
    {label:'This Month',val:'142h',sub:'tracked'},
  ];
  stats.forEach((s,i)=>{
    const x=20+i*118;
    els.push(rect(x,statsY,108,56,SURF,{rx:10,stroke:DIVID,sw:1}));
    els.push(text(x+12,statsY+16,s.label,9,MID,{font:'system-ui'}));
    els.push(text(x+12,statsY+34,s.val,17,TEXT,{fw:'700',font:'Georgia, serif'}));
    els.push(text(x+12,statsY+48,s.sub,9,MID,{font:'system-ui'}));
  });

  // Section: Active Projects
  els.push(text(20,228,'Active Projects',13,TEXT,{fw:'600',font:'system-ui'}));
  els.push(text(W-20,228,'See all →',11,ACC,{anchor:'end',font:'system-ui'}));

  const projects=[
    {name:'Arktide Rebrand',client:'Arktide Co.',due:'Apr 14',pct:72,color:ACC},
    {name:'Nova App UI',client:'Nova Health',due:'Apr 22',pct:45,color:ACC2},
    {name:'Sundry Campaign',client:'Sundry Foods',due:'May 3',pct:28,color:GREEN},
  ];
  projects.forEach((p,i)=>{
    const y=240+i*88;
    els.push(rect(20,y,W-40,80,SURF,{rx:12,stroke:DIVID,sw:1}));
    // Color bar
    els.push(rect(20,y,4,80,p.color,{rx:2}));
    // Text
    els.push(text(36,y+22,p.name,13,TEXT,{fw:'600',font:'system-ui'}));
    els.push(text(36,y+38,p.client,11,MID,{font:'system-ui'}));
    // Due
    els.push(rect(W-80,y+12,60,22,CARD,{rx:11}));
    els.push(text(W-50,y+27,'Due '+p.due,9,MID,{anchor:'middle',font:'system-ui'}));
    // Progress bar
    els.push(rect(36,y+52,W-96,6,CARD,{rx:3}));
    els.push(rect(36,y+52,Math.max((W-96)*p.pct/100,4),6,p.color,{rx:3,opacity:0.85}));
    els.push(text(W-52,y+58,p.pct+'%',10,MID,{anchor:'end',font:'system-ui'}));
  });

  // Section: Today's focus
  els.push(text(20,510,'Today\'s Focus',13,TEXT,{fw:'600',font:'system-ui'}));
  const tasks=[
    {t:'Review brand mockups',tag:'Design',done:true},
    {t:'Send Nova invoice',tag:'Finance',done:false},
    {t:'Client call — 3pm',tag:'Meeting',done:false},
  ];
  tasks.forEach((tk,i)=>{
    const y=524+i*46;
    els.push(rect(20,y,W-40,40,SURF,{rx:8,stroke:DIVID,sw:1}));
    // Checkbox
    els.push(rect(32,y+12,16,16,tk.done?ACC:SURF,{rx:4,stroke:tk.done?ACC:DIVID,sw:1.5}));
    if(tk.done) els.push(text(40,y+23,'✓',10,SURF,{anchor:'middle',font:'system-ui',fw:'700'}));
    els.push(text(56,y+24,tk.t,12,tk.done?MID:TEXT,{font:'system-ui',opacity:tk.done?0.7:1}));
    // Tag pill
    const tagW=tk.tag.length*6+16;
    const tagColor=tk.tag==='Design'?ACCLT:tk.tag==='Finance'?AMBERLT:ACC2LT;
    const tagText=tk.tag==='Design'?ACC:tk.tag==='Finance'?AMBER:ACC2;
    els.push(rect(W-20-tagW,y+10,tagW,20,tagColor,{rx:10}));
    els.push(text(W-20-tagW/2,y+23,tk.tag,9,tagText,{anchor:'middle',font:'system-ui',fw:'600'}));
  });

  bottomNav(els,'studio');
  screens.push({ name:'Studio Hub', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements:els });
})();

// ═══════════════════════════════════════════════════════════════
// Screen 2: Projects Board
// ═══════════════════════════════════════════════════════════════
(()=>{
  const els=[];
  statusBar(els);
  screenHeader(els,'Projects','8 active · 3 on hold');

  // Filter row
  els.push(rect(0,108,W,40,SURF));
  const filters=['All','Active','On Hold','Complete'];
  let fx=16;
  filters.forEach((f,i)=>{
    const fw=f.length*7+20;
    const isActive=i===0;
    els.push(rect(fx,112,fw,28,isActive?ACC:CARD,{rx:14}));
    els.push(text(fx+fw/2,129,f,11,isActive?SURF:MID,{anchor:'middle',font:'system-ui',fw:isActive?'600':'400'}));
    fx+=fw+8;
  });
  els.push(line(0,148,W,148,DIVID,{sw:1,opacity:0.5}));

  // Project cards
  const projects2=[
    {name:'Arktide Rebrand',client:'Arktide Co.',type:'Branding',pct:72,status:'Active',color:ACC,due:'Apr 14',budget:'$8,500'},
    {name:'Nova App UI',client:'Nova Health',type:'Product Design',pct:45,status:'Active',color:ACC2,due:'Apr 22',budget:'$14,200'},
    {name:'Sundry Campaign',client:'Sundry Foods',type:'Campaign',pct:28,status:'Active',color:GREEN,due:'May 3',budget:'$6,000'},
    {name:'Morten Annual Report',client:'Morten Group',type:'Editorial',pct:91,status:'Active',color:AMBER,due:'Apr 10',budget:'$4,800'},
  ];
  projects2.forEach((p,i)=>{
    const y=156+i*110;
    els.push(rect(16,y,W-32,100,SURF,{rx:14,stroke:DIVID,sw:1}));
    // Top section
    els.push(rect(16,y,W-32,44,CARD,{rx:14}));
    els.push(rect(16,y+34,W-32,10,CARD)); // overlap fix
    // Color dot + name
    els.push(circle(32,y+22,7,p.color));
    els.push(text(46,y+27,p.name,13,TEXT,{fw:'600',font:'system-ui'}));
    // Status pill
    pill(W-76,y+12,p.status,GREENLT,GREEN,els,64);
    // Client + type
    els.push(text(20,y+57,p.client,11,MID,{font:'system-ui'}));
    els.push(text(20,y+73,p.type,10,MID,{font:'system-ui',opacity:0.7}));
    // Budget
    els.push(text(W-24,y+57,p.budget,12,TEXT,{anchor:'end',font:'system-ui',fw:'600'}));
    els.push(text(W-24,y+73,'Budget',9,MID,{anchor:'end',font:'system-ui'}));
    // Progress bar
    els.push(rect(16,y+85,W-32,6,CARD,{rx:3}));
    els.push(rect(16,y+85,(W-32)*p.pct/100,6,p.color,{rx:3,opacity:0.8}));
    els.push(text(W-24,y+98,p.pct+'%',9,MID,{anchor:'end',font:'system-ui'}));
    els.push(text(20,y+98,'Due '+p.due,9,MID,{font:'system-ui'}));
  });

  // Add project FAB
  els.push(circle(W-52,H-100,24,ACC,{opacity:0.95}));
  els.push(text(W-52,H-95,'+',22,SURF,{anchor:'middle',font:'system-ui',fw:'300'}));

  bottomNav(els,'projects');
  screens.push({ name:'Projects Board', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements:els });
})();

// ═══════════════════════════════════════════════════════════════
// Screen 3: Clients
// ═══════════════════════════════════════════════════════════════
(()=>{
  const els=[];
  statusBar(els);
  screenHeader(els,'Clients','12 relationships');

  // Search bar
  els.push(rect(0,108,W,52,SURF));
  els.push(rect(16,116,W-32,34,CARD,{rx:17,stroke:DIVID,sw:1}));
  els.push(text(36,136,'⌕',16,MID,{font:'system-ui',anchor:'middle'}));
  els.push(text(54,136,'Search clients…',12,MID,{font:'system-ui'}));

  els.push(line(0,160,W,160,DIVID,{sw:1,opacity:0.5}));

  // Client list
  const clients=[
    {name:'Arktide Co.',contact:'James Park',projects:2,spend:'$18.2k',health:'Strong',hc:GREEN,avatar:'A',ac:ACC},
    {name:'Nova Health',contact:'Sarah Chen',projects:1,spend:'$14.2k',health:'Active',hc:ACC2,avatar:'N',ac:ACC2},
    {name:'Sundry Foods',contact:'Tom Reeves',projects:1,spend:'$6k',health:'Active',hc:ACC2,avatar:'S',ac:GREEN},
    {name:'Morten Group',contact:'Lea Morten',projects:3,spend:'$31.4k',health:'VIP',hc:ACC,avatar:'M',ac:AMBER},
    {name:'Halcyon Studio',contact:'Priya Nair',projects:0,spend:'$0',health:'Prospect',hc:MID,avatar:'H',ac:MID},
  ];

  clients.forEach((c,i)=>{
    const y=168+i*96;
    els.push(rect(16,y,W-32,86,SURF,{rx:12,stroke:DIVID,sw:1}));
    // Avatar
    avatar(46,y+32,20,c.initial,c.ac,els);
    els.push(text(46,y+37,c.avatar,11,SURF,{anchor:'middle',font:'system-ui',fw:'700'}));
    // Name + contact
    els.push(text(76,y+22,c.name,13,TEXT,{fw:'600',font:'system-ui'}));
    els.push(text(76,y+38,c.contact,11,MID,{font:'system-ui'}));
    // Health pill
    const hw=c.health.length*6+16;
    els.push(rect(W-24-hw,y+14,hw,22,c.hc+'22',{rx:11}));
    els.push(text(W-24-hw/2,y+28,c.health,9,c.hc,{anchor:'middle',font:'system-ui',fw:'600'}));
    // Stats
    els.push(line(16,y+54,W-16,y+54,DIVID,{sw:0.75,opacity:0.6}));
    els.push(text(28,y+72,c.projects+' projects',10,MID,{font:'system-ui'}));
    els.push(circle(W/2,y+67,2,DIVID));
    els.push(text(W/2+10,y+72,'Total: '+c.spend,10,MID,{font:'system-ui'}));
    els.push(text(W-24,y+72,'›',14,MID,{anchor:'end',font:'system-ui'}));
  });

  bottomNav(els,'clients');
  screens.push({ name:'Clients', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements:els });
})();

// ═══════════════════════════════════════════════════════════════
// Screen 4: Timeline
// ═══════════════════════════════════════════════════════════════
(()=>{
  const els=[];
  statusBar(els);
  screenHeader(els,'Timeline','April 2026');

  // Week selector
  els.push(rect(0,108,W,48,SURF));
  const days=['M','T','W','T','F','S','S'];
  const nums=['6','7','8','9','10','11','12'];
  days.forEach((d,i)=>{
    const x=20+i*50;
    const isToday=i===2;
    if(isToday){
      els.push(rect(x-4,110,36,44,ACC,{rx:18}));
      els.push(text(x+14,128,d,11,SURF,{anchor:'middle',font:'system-ui',fw:'600'}));
      els.push(text(x+14,145,nums[i],13,SURF,{anchor:'middle',font:'system-ui',fw:'700'}));
    } else {
      els.push(text(x+14,128,d,11,MID,{anchor:'middle',font:'system-ui'}));
      els.push(text(x+14,145,nums[i],13,TEXT,{anchor:'middle',font:'system-ui',fw:'400'}));
    }
  });
  els.push(line(0,156,W,156,DIVID,{sw:1,opacity:0.5}));

  // Timeline entries
  const items=[
    {time:'9:00',label:'Morning standup',project:'Arktide Rebrand',dur:30,color:ACC,type:'meeting'},
    {time:'10:30',label:'Logo exploration',project:'Arktide Rebrand',dur:120,color:ACC,type:'design'},
    {time:'13:00',label:'Client call',project:'Nova Health',dur:60,color:ACC2,type:'meeting'},
    {time:'14:30',label:'Wireframes review',project:'Nova Health',dur:90,color:ACC2,type:'design'},
    {time:'16:30',label:'Invoice prep',project:'Sundry Foods',dur:45,color:GREEN,type:'admin'},
    {time:'17:30',label:'EOD wrap-up',project:'Studio',dur:30,color:MID,type:'admin'},
  ];

  const timeY=166;
  const hourH=58;
  // Time axis
  ['9','10','11','12','13','14','15','16','17'].forEach((h,i)=>{
    const y=timeY+i*hourH;
    els.push(text(20,y+14,h+':00',10,MID,{font:'system-ui',opacity:0.7}));
    els.push(line(54,y+10,W-16,y+10,DIVID,{sw:0.75,opacity:0.5}));
  });

  items.forEach(item=>{
    const [hh,mm]=item.time.split(':').map(Number);
    const startY=timeY+(hh-9)*hourH+(mm/60)*hourH+6;
    const itemH=Math.max((item.dur/60)*hourH-4,18);
    els.push(rect(58,startY,W-74,itemH,item.color+'18',{rx:8,stroke:item.color+'44',sw:1}));
    els.push(rect(58,startY,3,itemH,item.color,{rx:1.5}));
    els.push(text(70,startY+16,item.label,11,TEXT,{fw:'600',font:'system-ui'}));
    if(itemH>30) els.push(text(70,startY+31,item.project,10,MID,{font:'system-ui'}));
    if(itemH>46) {
      const typeColor=item.type==='meeting'?ACC2:item.type==='design'?ACC:AMBER;
      pill(W-86,startY+8,item.type,typeColor+'22',typeColor,els,52,18);
    }
  });

  bottomNav(els,'studio');
  screens.push({ name:'Timeline', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements:els });
})();

// ═══════════════════════════════════════════════════════════════
// Screen 5: Finances
// ═══════════════════════════════════════════════════════════════
(()=>{
  const els=[];
  statusBar(els);
  screenHeader(els,'Finances','April 2026');

  // Revenue hero card
  els.push(rect(16,116,W-32,106,ACC,{rx:18}));
  // Subtle pattern dots
  for(let i=0;i<6;i++) for(let j=0;j<3;j++)
    els.push(circle(W-60+i*12,128+j*14,2,SURF,{opacity:0.1}));
  els.push(text(32,140,'Monthly Revenue',11,SURF,{font:'system-ui',opacity:0.8}));
  els.push(text(32,172,'$21,400',32,SURF,{fw:'700',font:'Georgia, serif'}));
  els.push(text(32,192,'↑ 18% vs last month',11,SURF,{font:'system-ui',opacity:0.85}));
  // Mini bars
  const barVals=[0.4,0.55,0.48,0.7,0.62,0.85,0.75];
  barVals.forEach((v,i)=>{
    const bx=W-90+i*10;
    const bh=30*v;
    els.push(rect(bx,197-bh,7,bh,SURF,{rx:3.5,opacity:0.35}));
  });

  // Stats row
  const sfY=234;
  const sfs=[
    {label:'Invoiced',val:'$28.2k',icon:'◈'},
    {label:'Received',val:'$21.4k',icon:'◉'},
    {label:'Overdue',val:'$2.8k',icon:'◬'},
  ];
  sfs.forEach((s,i)=>{
    const x=16+i*122;
    els.push(rect(x,sfY,112,66,SURF,{rx:10,stroke:DIVID,sw:1}));
    els.push(text(x+12,sfY+20,s.icon,14,i===2?ACC:GREEN,{font:'system-ui'}));
    els.push(text(x+12,sfY+40,s.val,15,TEXT,{fw:'700',font:'Georgia, serif'}));
    els.push(text(x+12,sfY+56,s.label,10,MID,{font:'system-ui'}));
  });

  // Invoice list
  els.push(text(20,316,'Recent Invoices',13,TEXT,{fw:'600',font:'system-ui'}));
  els.push(text(W-20,316,'All →',11,ACC,{anchor:'end',font:'system-ui'}));

  const invoices=[
    {num:'INV-024',client:'Morten Group',amount:'$4,800',status:'Paid',sc:GREEN,sb:GREENLT},
    {num:'INV-025',client:'Arktide Co.',amount:'$3,200',status:'Sent',sc:ACC2,sb:ACC2LT},
    {num:'INV-026',client:'Nova Health',amount:'$6,000',status:'Draft',sc:MID,sb:CARD},
    {num:'INV-023',client:'Halcyon',amount:'$2,800',status:'Overdue',sc:ACC,sb:ACCLT},
  ];
  invoices.forEach((inv,i)=>{
    const y=328+i*76;
    els.push(rect(16,y,W-32,68,SURF,{rx:10,stroke:DIVID,sw:1}));
    // Invoice icon
    els.push(rect(28,y+16,32,36,CARD,{rx:6}));
    els.push(text(44,y+37,'◻',14,MID,{anchor:'middle',font:'system-ui'}));
    // Info
    els.push(text(72,y+26,inv.num,12,TEXT,{fw:'600',font:'system-ui'}));
    els.push(text(72,y+43,inv.client,11,MID,{font:'system-ui'}));
    // Amount
    els.push(text(W-24,y+26,inv.amount,13,TEXT,{anchor:'end',fw:'700',font:'Georgia, serif'}));
    // Status
    const sw=inv.status.length*6+14;
    els.push(rect(W-24-sw,y+38,sw,20,inv.sb,{rx:10}));
    els.push(text(W-24-sw/2,y+51,inv.status,9,inv.sc,{anchor:'middle',font:'system-ui',fw:'600'}));
  });

  bottomNav(els,'studio');
  screens.push({ name:'Finances', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements:els });
})();

// ═══════════════════════════════════════════════════════════════
// Screen 6: Insights
// ═══════════════════════════════════════════════════════════════
(()=>{
  const els=[];
  statusBar(els);
  screenHeader(els,'Insights','Your studio at a glance');

  // Period selector
  els.push(rect(0,108,W,40,SURF));
  const periods=['Week','Month','Quarter','Year'];
  let px=16;
  periods.forEach((p,i)=>{
    const pw=p.length*8+20;
    const isA=i===1;
    els.push(rect(px,112,pw,26,isA?ACC:CARD,{rx:13}));
    els.push(text(px+pw/2,128,p,11,isA?SURF:MID,{anchor:'middle',font:'system-ui',fw:isA?'600':'400'}));
    px+=pw+8;
  });
  els.push(line(0,148,W,148,DIVID,{sw:1,opacity:0.5}));

  // Revenue chart card
  els.push(rect(16,156,W-32,154,SURF,{rx:14,stroke:DIVID,sw:1}));
  els.push(text(28,176,'Revenue Trend',12,TEXT,{fw:'600',font:'system-ui'}));
  els.push(text(28,194,'$21,400',22,TEXT,{fw:'700',font:'Georgia, serif'}));
  els.push(text(28,210,'April 2026',10,MID,{font:'system-ui'}));
  // Chart area
  const months=['Jan','Feb','Mar','Apr'];
  const vals=[14200,17800,18100,21400];
  const maxV=24000;
  const chartX=28, chartW=W-56, chartH=72, chartY=222;
  // Gridlines
  [0.25,0.5,0.75,1].forEach(g=>{
    const gy=chartY+chartH-(chartH*g);
    els.push(line(chartX,gy,chartX+chartW,gy,DIVID,{sw:0.75,opacity:0.5}));
  });
  // Bars
  const barW=(chartW-40)/months.length;
  months.forEach((m,i)=>{
    const bh=(vals[i]/maxV)*chartH;
    const bx=chartX+20+i*(barW+10);
    const isLast=i===months.length-1;
    els.push(rect(bx,chartY+chartH-bh,barW,bh,isLast?ACC:CARD,{rx:4,opacity:isLast?0.9:0.8}));
    els.push(text(bx+barW/2,chartY+chartH+14,m,9,MID,{anchor:'middle',font:'system-ui'}));
    if(isLast) {
      els.push(text(bx+barW/2,chartY+chartH-bh-6,'$21.4k',8,ACC,{anchor:'middle',font:'system-ui',fw:'600'}));
    }
  });

  // Key metrics 2×2
  els.push(text(20,326,'Key Metrics',13,TEXT,{fw:'600',font:'system-ui'}));
  const metrics=[
    {label:'Utilisation',val:'78%',sub:'↑4% vs last month',color:GREEN,icon:'◑'},
    {label:'Avg Project Value',val:'$9.2k',sub:'Across 7 projects',color:ACC2,icon:'◈'},
    {label:'Client Retention',val:'91%',sub:'Since Jan 2026',color:ACC,icon:'◎'},
    {label:'Hours Tracked',val:'142h',sub:'20 days remaining',color:AMBER,icon:'◷'},
  ];
  metrics.forEach((m,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const mx=16+col*(W/2-12);
    const my=340+row*100;
    els.push(rect(mx,my,(W/2-22),90,SURF,{rx:12,stroke:DIVID,sw:1}));
    els.push(text(mx+14,my+20,m.icon,14,m.color,{font:'system-ui'}));
    els.push(text(mx+14,my+44,m.val,20,TEXT,{fw:'700',font:'Georgia, serif'}));
    els.push(text(mx+14,my+60,m.label,10,MID,{font:'system-ui'}));
    els.push(text(mx+14,my+76,m.sub,9,m.color,{font:'system-ui'}));
  });

  // Quote footer
  els.push(rect(16,548,W-32,60,ACCLT,{rx:12}));
  els.push(text(28,572,'"A quiet month builds a loud quarter."',11,ACC,{font:'Georgia, serif'}));
  els.push(text(W-28,584,'— RAM',10,ACC,{anchor:'end',font:'system-ui',fw:'500'}));

  bottomNav(els,'insights');
  screens.push({ name:'Insights', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements:els });
})();

// ── Write .pen file ─────────────────────────────────────────────
const totalEls = screens.reduce((s,sc)=>s+sc.elements.length,0);
const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalEls,
    slug: SLUG,
    inspiration: 'Land-book warm editorial + minimal.gallery pastel confidence',
    archetype: 'studio-workspace',
  },
  screens: screens.map(s=>({ name:s.name, svg:s.svg, elements:s.elements })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
