/**
 * FACET — Material Intelligence for Architects
 * Inspired by:
 *   - darkmodedesign.com: SaltBits (geological dark texture backgrounds),
 *     Mortons "Created by light" (luxury product photography on pure black)
 *   - minimal.gallery: Old Tom Capital (dark textural landscape + editorial type),
 *     Hemispherical Stacks (deep dark with material texture)
 *   - lapa.ninja: KO Collective (editorial fashion, sophisticated dark palette)
 *
 * Theme: DARK — deep charcoal (#0C0B09), warm amber (#C47D2A), cream text
 * 6 screens: Discover, Detail, Board, Palette, Scan, Profile
 */

const fs = require('fs');

const W = 390, H = 844;

const C = {
  bg:       '#0C0B09',
  surface:  '#181714',
  surface2: '#211F1B',
  surface3: '#2B2820',
  border:   'rgba(232,227,220,0.07)',
  border2:  'rgba(232,227,220,0.13)',
  text:     '#E8E3DC',
  textMid:  'rgba(232,227,220,0.52)',
  textDim:  'rgba(232,227,220,0.28)',
  amber:    '#C47D2A',
  amberSft: '#E8A84A',
  amberDim: 'rgba(196,125,42,0.15)',
  slate:    '#6B8A9E',
  green:    '#5E8B6A',
};

let _id = 0;
const uid = p => `${p||'e'}-${(++_id).toString(36).padStart(4,'0')}`;

const r  = (x,y,w,h,fill,rr=0,stroke,sw=0,op=1) =>
  ({type:'rect',id:uid('r'),x,y,width:w,height:h,fill,cornerRadius:rr,
    stroke:stroke||null,strokeWidth:sw,opacity:op});

const t  = (x,y,w,h,content,fs=13,fw=400,c=C.text,ta='left',ls=0,lh=1.4,ff='Inter,system-ui,sans-serif') =>
  ({type:'text',id:uid('t'),x,y,width:w,height:h,text:content,
    fontFamily:ff,fontSize:fs,fontWeight:fw,color:c,letterSpacing:ls,
    lineHeight:lh,align:ta});

const g  = (children,opts={}) =>
  ({type:'group',id:uid('g'),children,
    x:opts.x||0,y:opts.y||0,width:opts.w||W,height:opts.h||H,clip:opts.clip||false});

// ── Shared components ──────────────────────────────────────────────────────
function statusBar() {
  return g([
    r(0,0,W,44,C.bg),
    t(16,14,50,16,'9:41',12,600,C.text),
    t(W-66,14,56,16,'●●●',10,500,C.text,'right'),
  ]);
}

function navBar(active=0) {
  const items=[{ic:'⬡',lb:'Discover'},{ic:'◫',lb:'Boards'},{ic:'',lb:''},{ic:'◳',lb:'Projects'},{ic:'◯',lb:'Profile'}];
  const iw=W/5;
  const ch=[
    r(0,0,W,64,C.surface2),
    r(0,0,W,1,C.border2),
    r(W/2-26,6,52,52,C.amber,14),
    t(W/2-26,6,52,52,'⊕',22,300,'#0C0B09','center'),
  ];
  items.forEach((item,i)=>{
    if(i===2) return;
    const x=i*iw, act=i===active;
    ch.push(t(x,7,iw,22,item.ic,16,act?600:400,act?C.amberSft:C.textDim,'center'));
    ch.push(t(x,25,iw,15,item.lb,9,act?700:400,act?C.amberSft:C.textDim,'center',0.04));
    if(act) ch.push(r(x+iw/2-12,56,24,2,C.amber,1));
  });
  return g(ch,{y:H-64,h:64});
}

// Material texture simulation
function matTex(x,y,w,h,tones,rr=0) {
  const [a,b,c,d]=tones;
  return g([
    r(x,y,w,h,a,rr),
    r(x,y,w*0.38,h,b,rr),
    r(x+w*0.28,y,w*0.38,h,c,0),
    r(x+w*0.55,y,w*0.45,h*0.72,d,0),
    r(x+w*0.27,y,2,h*0.7,'rgba(232,210,178,0.08)',0),
    r(x+w*0.58,y+h*0.12,1,h*0.6,'rgba(232,210,178,0.06)',0),
    r(x+w*0.42,y,1,h*0.5,'rgba(232,210,178,0.05)',0),
  ]);
}

const MAT_TONES={
  marble: ['#3E2E1E','#5C4634','#7A6048','#4E3C2C'],
  granite:['#1E2432','#2C3A4C','#3A5062','#243344'],
  oak:    ['#2A2018','#3E3020','#52422E','#342818'],
  quartzite:['#1E2A1E','#2C3E2A','#3A5038','#263828'],
  sandstone:['#3A2C10','#5A4418','#7A5E24','#4A3814'],
  zinc:   ['#202830','#303E4A','#3E5060','#283240'],
};

function matCard(x,y,w,h,opts={}) {
  const {name='Calacatta Oro',origin='Italy',cat='MARBLE',tag='PREMIUM',
         toneKey='marble',saved=false}=opts;
  const tones=MAT_TONES[toneKey]||MAT_TONES.marble;
  const imgH=h*0.61;
  return g([
    r(x,y,w,h,C.surface,12),
    ...matTex(x,y,w,imgH,tones,12).children,
    r(x+8,y+8,w-16,18,'rgba(12,11,9,0.68)',4),
    t(x+8,y+8,w-16,18,cat,8,700,C.amber,'center',0.1),
    r(x+w-30,y+6,24,24,'rgba(12,11,9,0.55)',12),
    t(x+w-30,y+6,24,24,saved?'♥':'♡',12,400,saved?C.amber:C.textMid,'center'),
    r(x,y+imgH,w,h-imgH,C.surface,0),
    t(x+10,y+imgH+8,w-20,17,name,13,600,C.text),
    t(x+10,y+imgH+26,w-20,14,origin,11,400,C.textMid),
    r(x+10,y+imgH+44,48,14,C.amberDim,3),
    t(x+10,y+imgH+44,48,14,tag,8,700,C.amberSft,'center',0.06),
  ]);
}

// ── Screen 1: Discover ─────────────────────────────────────────────────────
function screenDiscover() {
  const chips=['All','Stone','Wood','Metal','Textile','Glass'];
  const chipW=[32,48,42,42,60,40];
  const chipX=[20,60,116,166,216,284];
  return {
    id:'discover',label:'DISCOVER',backgroundColor:C.bg,
    elements:[
      r(0,0,W,H,C.bg),
      statusBar(),
      t(20,52,W-80,30,'FACET',24,700,C.text,'left',0.12,'1','Georgia,serif'),
      t(20,82,220,16,'Material Intelligence',12,400,C.textMid),
      r(W-52,54,32,32,C.surface2,16),
      t(W-52,54,32,32,'◎',14,400,C.text,'center'),
      r(W-36,50,8,8,C.amber,4),

      // Search
      r(20,106,W-40,40,C.surface2,12,C.border2,1),
      t(46,106,W-80,40,'Search materials, finishes…',13,400,C.textDim),
      t(26,106,20,40,'◎',14,400,C.textDim,'center'),
      r(W-56,114,28,24,C.amberDim,6),
      t(W-56,114,28,24,'⊟',13,500,C.amber,'center'),

      // Filter chips
      ...chips.map((c,i)=>g([
        r(chipX[i],158,chipW[i],26,i===0?C.amber:C.surface2,13,i===0?null:C.border2,i===0?0:1),
        t(chipX[i],158,chipW[i],26,c,10,i===0?700:400,i===0?'#0C0B09':C.textMid,'center',0.04),
      ])),

      // Grid col 1
      matCard(20,196,W/2-26,200,{name:'Calacatta Oro',origin:'Carrara, Italy',cat:'MARBLE',toneKey:'marble',saved:true}),
      matCard(20,404,W/2-26,158,{name:'Black Absolut',origin:'Zimbabwe',cat:'GRANITE',toneKey:'granite'}),
      matCard(20,570,W/2-26,180,{name:'Smoked Oak',origin:'Appalachians, US',cat:'HARDWOOD',toneKey:'oak'}),

      // Grid col 2
      matCard(W/2+6,196,W/2-26,148,{name:'Verde Indio',origin:'Brazil',cat:'QUARTZITE',toneKey:'quartzite'}),
      matCard(W/2+6,352,W/2-26,190,{name:'Sahara Gold',origin:'Morocco',cat:'SANDSTONE',toneKey:'sandstone',saved:true}),
      matCard(W/2+6,550,W/2-26,200,{name:'Pewter Zinc',origin:'Belgium',cat:'METAL',toneKey:'zinc'}),

      navBar(0),
    ]
  };
}

// ── Screen 2: Material Detail ──────────────────────────────────────────────
function screenDetail() {
  const tones=MAT_TONES.marble;
  return {
    id:'detail',label:'DETAIL',backgroundColor:C.bg,
    elements:[
      r(0,0,W,H,C.bg),
      ...matTex(0,0,W,320,tones,0).children,
      r(16,48,36,36,'rgba(12,11,9,0.62)',18),
      t(16,48,36,36,'←',16,500,C.text,'center'),
      r(W-52,48,36,36,'rgba(12,11,9,0.62)',18),
      t(W-52,48,36,36,'⬡',14,400,C.text,'center'),
      r(16,282,68,20,C.amber,4),
      t(16,282,68,20,'MARBLE',9,700,'#0C0B09','center',0.1),

      r(0,302,W,H-302,C.surface,0),
      r(W/2-20,310,40,4,'rgba(232,227,220,0.18)',2),

      t(20,324,W-80,32,'Calacatta Oro',26,700,C.text,'left',0,'1.2','Georgia,serif'),
      t(20,358,200,18,'Carrara · Tuscany, Italy',13,400,C.textMid),
      r(W-58,322,38,38,C.amberDim,19),
      t(W-58,322,38,38,'♥',17,400,C.amber,'center'),

      t(20,386,200,17,'From $285 / m²',14,600,C.amberSft),
      t(190,389,150,13,'lead time 6 – 10 wk',10,400,C.textDim),

      r(20,408,W-40,1,C.border),

      // Specs 2×2
      ...([['Finish','Honed + Polished'],['Thickness','20 / 30 mm'],
           ['Slab Size','320 × 180 cm'],['Origin','Italy, DOP cert.']]).map(([k,v],i)=>{
        const col=i%2,row=Math.floor(i/2),xo=col*(W/2),yo=422+row*56;
        return g([t(xo+20,yo,W/2-20,14,k.toUpperCase(),9,600,C.textDim,'left',0.08),
                  t(xo+20,yo+16,W/2-20,20,v,13,500,C.text)]);
      }),

      r(20,538,W-40,1,C.border),
      t(20,548,200,12,'SIMILAR FINISHES'.toUpperCase(),9,700,C.amber,'left',0.12),
      ...Object.values(MAT_TONES).slice(0,5).map((tns,i)=>g([
        r(20+i*52,564,42,42,tns[0],8,i===0?C.amber:'transparent',i===0?2:0),
        r(20+i*52+18,564,24,42,tns[1],0),
      ])),

      r(20,626,W-40,50,C.amber,12),
      t(20,626,W-40,50,'Request Sample  →',15,700,'#0C0B09','center',0.02),
      r(20,684,W-40,40,'transparent',12,C.border2,1),
      t(20,684,W-40,40,'Add to Board',14,500,C.text,'center'),
    ]
  };
}

// ── Screen 3: Collection Board ─────────────────────────────────────────────
function screenBoard() {
  const boards=[
    {name:'Penthouse Suite · Zurich',mats:7,tones:['marble','zinc']},
    {name:'Seaside Villa · Mallorca',mats:5,tones:['quartzite','sandstone']},
    {name:'Office Fit-out · NYC',mats:8,tones:['granite','oak']},
  ];
  return {
    id:'board',label:'BOARDS',backgroundColor:C.bg,
    elements:[
      r(0,0,W,H,C.bg),
      statusBar(),
      t(20,52,W-100,24,'My Boards',20,700,C.text,'left',0,'1','Georgia,serif'),
      t(20,78,160,14,'4 collections',12,400,C.textMid),
      r(W-52,52,32,32,C.amber,10),
      t(W-52,52,32,32,'+',18,300,'#0C0B09','center'),

      // Featured board
      r(20,104,W-40,200,C.surface2,16,C.border2,1),
      ...matTex(28,112,78,80,MAT_TONES.marble,8).children,
      ...matTex(28,200,78,42,MAT_TONES.zinc,8).children,
      ...matTex(114,112,58,62,MAT_TONES.quartzite,8).children,
      ...matTex(114,182,58,58,MAT_TONES.oak,8).children,
      ...matTex(180,112,W-200,110,MAT_TONES.sandstone,8).children,
      t(28,252,W-60,18,'Penthouse Suite · Zurich',14,700,C.text),
      t(28,270,160,14,'7 materials saved',11,400,C.textMid),
      r(W-80,264,60,22,C.amberDim,6),
      t(W-80,264,60,22,'↗ Share',10,600,C.amber,'center'),

      // Board list
      t(20,316,W-40,12,'OTHER BOARDS',9,700,C.amber,'left',0.12),
      ...boards.slice(1).map((b,i)=>{
        const y=340+i*90;
        const [k1,k2]=[MAT_TONES[b.tones[0]],MAT_TONES[b.tones[1]]];
        return g([
          r(20,y,W-40,80,C.surface,12),
          ...matTex(28,y+10,56,58,k1,8).children,
          ...matTex(92,y+10,30,58,k2,8).children,
          r(130,y+12,24,28,C.surface3,6),
          r(130,y+44,24,24,C.surface3,6),
          t(164,y+16,W-184,18,b.name,13,600,C.text),
          t(164,y+36,W-184,14,`${b.mats} materials`,11,400,C.textMid),
          t(W-44,y+28,24,24,'›',16,300,C.textDim,'center'),
        ]);
      }),

      navBar(1),
    ]
  };
}

// ── Screen 4: Project Palette ──────────────────────────────────────────────
function screenPalette() {
  const mats=[
    {name:'Calacatta Oro',cat:'MARBLE',area:'Flooring',sqm:142,pct:30,toneKey:'marble'},
    {name:'Smoked Oak',cat:'HARDWOOD',area:'Wall panelling',sqm:88,pct:20,toneKey:'oak'},
    {name:'Pewter Zinc',cat:'METAL',area:'Ceiling',sqm:34,pct:14,toneKey:'zinc'},
    {name:'Verde Indio',cat:'QUARTZITE',area:'Feature wall',sqm:26,pct:12,toneKey:'quartzite'},
    {name:'Sahara Gold',cat:'SANDSTONE',area:'Terrace',sqm:210,pct:24,toneKey:'sandstone'},
  ];
  const pcts=[0.30,0.20,0.14,0.12,0.24];
  const stripX=[];
  let sx=20;
  pcts.forEach(p=>{stripX.push(sx);sx+=Math.round((W-40)*p);});

  return {
    id:'palette',label:'PROJECT',backgroundColor:C.bg,
    elements:[
      r(0,0,W,H,C.bg),
      statusBar(),
      t(20,52,W-120,22,'Project Palette',20,700,C.text,'left',0,'1','Georgia,serif'),
      t(20,76,220,14,'Penthouse Suite · Zurich',12,400,C.textMid),
      r(W-110,50,90,42,C.surface2,10),
      t(W-110,54,90,14,'BUDGET USED',8,700,C.textDim,'center',0.08),
      t(W-110,68,90,22,'68%',16,700,C.amberSft,'center'),

      // Palette strip
      ...mats.map((m,i)=>r(stripX[i],104,Math.round((W-40)*pcts[i]),36,
        MAT_TONES[m.toneKey][0],i===0?8:i===4?8:0)),

      t(20,152,200,12,'MATERIALS SPECIFIED',9,700,C.amber,'left',0.12),

      ...mats.map((m,i)=>{
        const y=174+i*90;
        const tns=MAT_TONES[m.toneKey];
        return g([
          r(20,y,W-40,80,C.surface,12),
          ...matTex(28,y+10,56,58,tns,8).children,
          t(94,y+12,W-160,18,m.name,14,600,C.text),
          t(94,y+30,120,14,m.cat,9,600,C.amber,'left',0.08),
          t(94,y+46,140,14,m.area,11,400,C.textMid),
          t(W-76,y+14,56,16,`${m.sqm}m²`,13,700,C.text,'right'),
          t(W-76,y+32,56,14,`${m.pct}%`,11,400,C.textDim,'right'),
          r(94,y+64,W-138,4,C.border,2),
          r(94,y+64,Math.round((W-138)*m.pct/100),4,tns[1]||C.amber,2),
        ]);
      }),

      navBar(3),
    ]
  };
}

// ── Screen 5: Scan / Identify ──────────────────────────────────────────────
function screenScan() {
  const tones=MAT_TONES.marble;
  const reticY=H*0.22;
  return {
    id:'scan',label:'SCAN',backgroundColor:'#0A0908',
    elements:[
      r(0,0,W,H,'#0A0908'),
      ...matTex(0,0,W,H*0.58,tones,0).children,
      statusBar(),

      r(16,48,36,36,'rgba(12,11,9,0.65)',18),
      t(16,48,36,36,'←',16,500,C.text,'center'),
      t(20,H*0.58-60,W,24,'FACET SCAN',10,700,C.amberSft,'center',0.14),

      // Reticle corners
      ...([[-70,-70,30,3],[  -70,-70, 3,30],[40,-70,30,3],[67,-70,3,30],
           [-70, 67,30,3],[-70, 40, 3,30],[40, 67,30,3],[67, 40,3,30]]).map(([dx,dy,rw,rh])=>
        r(W/2+dx,reticY+dy,rw,rh,C.amber,1)),

      r(W/2-66,reticY-18,132,2,'rgba(196,125,42,0.55)'),
      r(W/2-50,reticY+80,100,24,'rgba(12,11,9,0.78)',6),
      t(W/2-50,reticY+80,100,24,'ANALYSING…',9,700,C.amber,'center',0.12),

      // Result sheet
      r(0,H*0.58,W,H*0.42,C.surface,0),
      r(W/2-20,H*0.58+10,40,4,'rgba(232,227,220,0.18)',2),

      t(20,H*0.58+24,W-40,22,'Match Found',18,700,C.text,'left',0,'1','Georgia,serif'),
      t(20,H*0.58+48,120,16,'97% confidence',12,500,C.green),

      r(20,H*0.58+72,W-40,1,C.border),

      ...matTex(20,H*0.58+82,68,62,tones,8).children,
      t(100,H*0.58+86,W-120,18,'Calacatta Oro',16,700,C.text),
      t(100,H*0.58+106,120,14,'Marble · Italy',12,400,C.textMid),
      t(100,H*0.58+122,110,14,'From $285 / m²',12,600,C.amberSft),

      r(20,H*0.58+158,W-40,6,C.border,3),
      r(20,H*0.58+158,(W-40)*0.97,6,C.amber,3),
      t(20,H*0.58+168,W-40,12,'97% visual match',10,400,C.textDim),

      r(20,H*0.58+190,W/2-28,44,C.amber,10),
      t(20,H*0.58+190,W/2-28,44,'View Material',13,700,'#0C0B09','center'),
      r(W/2+8,H*0.58+190,W/2-28,44,C.surface2,10,C.border2,1),
      t(W/2+8,H*0.58+190,W/2-28,44,'Save to Board',13,500,C.text,'center'),
    ]
  };
}

// ── Screen 6: Profile ──────────────────────────────────────────────────────
function screenProfile() {
  const menuItems=[
    {ic:'◈',lb:'Subscription · Pro',sb:'₽4,200/yr · renews June'},
    {ic:'⬡',lb:'Preferred Suppliers',sb:'Saved 12 suppliers'},
    {ic:'⊟',lb:'Measurement Units',sb:'Metric (m²)'},
    {ic:'◎',lb:'Notifications',sb:'Push & Email'},
    {ic:'↗',lb:'Export & Share',sb:'PDF, CSV, IFC'},
  ];
  return {
    id:'profile',label:'PROFILE',backgroundColor:C.bg,
    elements:[
      r(0,0,W,H,C.bg),
      ...matTex(0,0,W,178,MAT_TONES.marble,0).children,
      statusBar(),

      r(W/2-36,58,72,72,C.amber,36),
      t(W/2-36,58,72,72,'EL',22,700,'#0C0B09','center'),
      t(20,138,W-40,20,'Elise Laurent',17,700,C.text,'center'),
      t(20,158,W-40,16,'Principal · Laurent & Associates',12,400,C.textMid,'center'),

      // Stats
      r(20,190,W-40,64,C.surface,14),
      ...([['142','Materials'],['7','Boards'],['3','Projects']]).map(([v,l],i)=>{
        const x=20+i*(W-40)/3;
        return g([
          i>0?r(x,198,1,48,C.border):r(0,0,0,0,'transparent'),
          t(x,200,(W-40)/3,22,v,20,700,C.amberSft,'center'),
          t(x,224,(W-40)/3,14,l,10,600,C.textDim,'center',0.06),
        ]);
      }),

      t(20,270,200,12,'ACCOUNT',9,700,C.amber,'left',0.12),

      ...menuItems.map((item,i)=>{
        const y=292+i*54;
        return g([
          r(20,y,W-40,46,C.surface,10),
          r(28,y+10,28,26,C.surface2,7),
          t(28,y+10,28,26,item.ic,13,400,C.amber,'center'),
          t(64,y+9,W-120,16,item.lb,13,500,C.text),
          t(64,y+26,W-120,13,item.sb,10,400,C.textDim),
          t(W-44,y+13,24,20,'›',16,300,C.textDim,'center'),
        ]);
      }),

      navBar(4),
    ]
  };
}

// ── Assemble ───────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'FACET',
    slug: 'facet',
    description: 'Material discovery & specification platform for architects and interior designers',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    palette: 'deep charcoal / warm amber / natural material textures',
    inspiration: 'darkmodedesign.com (SaltBits geological texture, Mortons luxury product on dark); minimal.gallery (Old Tom Capital editorial dark)',
  },
  canvasWidth: W,
  canvasHeight: H,
  screens: [
    screenDiscover(),
    screenDetail(),
    screenBoard(),
    screenPalette(),
    screenScan(),
    screenProfile(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/facet.pen', JSON.stringify(pen,null,2));
console.log('✓ facet.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s=>{
  const n=(JSON.stringify(s).match(/"type"/g)||[]).length;
  console.log(`  · ${s.label}: ~${n} elements`);
});
