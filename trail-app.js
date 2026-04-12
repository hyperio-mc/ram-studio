// TRAIL — Personal Movement Journal
// Light theme: warm parchment canvas, electric lime accent, condensed caps
// Inspired by San Rita (sanrita.ca) — spatial data aesthetic, trail map motif
// 5 screens: Active Route, Map View, Log, Places, Week

const screens = [];

// ─────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────
const bg       = '#F0ECE5';   // warm parchment
const surface  = '#FAF9F5';   // near-white
const surface2 = '#EEEAE2';   // slightly deeper panel
const ink      = '#1A1914';   // near-black warm
const inkMid   = 'rgba(26,25,20,0.55)';
const inkFaint = 'rgba(26,25,20,0.18)';
const lime     = '#C6FF52';   // electric lime (San Rita trail lines)
const limeDeep = '#8DC200';   // deeper lime for labels on light
const coral    = '#FF5527';   // warm orange-red secondary
const coralSoft= '#FFF0EB';   // tinted coral surface
const limeSoft = '#F1FFCC';   // tinted lime surface

const W = 390, H = 844;

// Helper — small mono label
function label(txt, x, y, color = inkMid) {
  return `T('${txt}',${x},${y},300,18,{font:'mono',size:10,color:'${color}',caps:true,tracking:2});`;
}

// ─────────────────────────────────────────
// SCREEN 1 — ACTIVE ROUTE
// Running in progress. Live stats.
// ─────────────────────────────────────────
{
  const ch = [];

  // Status bar area
  ch.push(`F(0,0,${W},${H},'${bg}');`);

  // Top pill — LIVE indicator
  ch.push(`F(16,52,72,22,'${lime}',{r:11});`);
  ch.push(`T('● LIVE',20,55,68,14,{font:'mono',size:10,color:'${ink}',bold:true,caps:true,tracking:1});`);

  // Route name
  ch.push(`T('Morning Circuit',16,88,280,36,{font:'display',size:28,color:'${ink}',bold:true});`);
  ch.push(`T('Riverside Loop · San Rafael Park',16,126,320,18,{font:'sans',size:13,color:'${inkMid}'});`);

  // Divider
  ch.push(`F(16,152,${W - 32},1,'${inkFaint}');`);

  // Live stat trio — big mono numbers
  // Distance
  ch.push(`F(16,164,105,80,'${surface}',{r:10});`);
  ch.push(`T('4.7',24,175,90,42,{font:'mono',size:34,color:'${ink}',bold:true});`);
  ch.push(`T('km',24,218,90,16,{font:'mono',size:11,color:'${inkMid}',caps:true,tracking:2});`);

  // Pace
  ch.push(`F(143,164,105,80,'${surface}',{r:10});`);
  ch.push(`T('5:12',151,175,90,42,{font:'mono',size:34,color:'${ink}',bold:true});`);
  ch.push(`T('/ km',151,218,90,16,{font:'mono',size:11,color:'${inkMid}',caps:true,tracking:2});`);

  // Time
  ch.push(`F(270,164,104,80,'${lime}',{r:10});`);
  ch.push(`T('28:44',278,175,90,42,{font:'mono',size:34,color:'${ink}',bold:true});`);
  ch.push(`T('elapsed',278,218,90,16,{font:'mono',size:11,color:'${limeDeep}',caps:true,tracking:2});`);

  // Elevation strip
  ch.push(`F(16,258,${W - 32},54,'${surface}',{r:10});`);
  ch.push(`T('ELEVATION',24,264,150,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  ch.push(`T('+142 m',24,280,150,18,{font:'mono',size:13,color:'${ink}',bold:true});`);
  // Elevation mini-bar (simulated terrain)
  ch.push(`F(160,266,200,30,'${inkFaint}',{r:4});`);
  ch.push(`F(160,278,200,18,'${limeDeep}',{r:4});`);  // fill level
  ch.push(`F(160,270,70,26,'${lime}',{r:4});`);       // active segment

  // Trail path visual — organic route line on light surface
  ch.push(`F(16,326,${W - 32},200,'${surface}',{r:14});`);
  // Route line segments (approximated as overlapping ellipses for organic path)
  ch.push(`E(120,390,180,8,'${lime}',{});`);
  ch.push(`E(200,410,120,8,'${limeDeep}',{});`);
  ch.push(`E(280,430,100,8,'${lime}',{});`);
  ch.push(`E(250,460,160,8,'${limeDeep}',{});`);
  // Waypoint dots
  ch.push(`E(90,388,14,14,'${lime}',{});`);
  ch.push(`E(340,432,10,10,'${coral}',{});`);   // current position
  // Start/end labels
  ch.push(`T('START',24,338,60,14,{font:'mono',size:9,color:'${inkMid}',caps:true,tracking:1});`);
  ch.push(`T('YOU →',310,426,60,14,{font:'mono',size:9,color:'${coral}',caps:true,tracking:1});`);
  ch.push(`T('4.7 / 8.0 km',16,502,200,16,{font:'mono',size:12,color:'${inkMid}'});`);
  // Progress bar
  ch.push(`F(16,520,${W - 32},6,'${inkFaint}',{r:3});`);
  ch.push(`F(16,520,${Math.round((W - 32) * 0.59)},6,'${lime}',{r:3});`);

  // Heart rate strip
  ch.push(`F(16,540,${W - 32},44,'${coralSoft}',{r:10});`);
  ch.push(`T('♥ 148 bpm',24,550,200,14,{font:'mono',size:12,color:'${coral}',bold:true});`);
  ch.push(`T('CARDIO ZONE 3',24,566,200,14,{font:'mono',size:10,color:'${coral}',caps:true,tracking:2});`);
  ch.push(`T('Aerobic',${W - 90},550,80,14,{font:'mono',size:11,color:'${coral}'});`);

  // Bottom actions
  ch.push(`F(16,608,${W - 32},1,'${inkFaint}');`);
  ch.push(`F(16,620,168,52,'${surface}',{r:12});`);
  ch.push(`T('⏸  Pause',52,638,100,18,{font:'sans',size:15,color:'${ink}'});`);
  ch.push(`F(206,620,168,52,'${ink}',{r:12});`);
  ch.push(`T('Finish Route ✓',218,638,144,18,{font:'sans',size:15,color:'${bg}',bold:true});`);

  // Nav bar
  ch.push(`F(0,764,${W},80,'${surface}',{});`);
  ch.push(`F(0,764,${W},1,'${inkFaint}',{});`);
  const navItems = [
    { icon: '◉', label: 'Now',     x: 20,  active: true  },
    { icon: '◎', label: 'Map',     x: 98,  active: false },
    { icon: '≡', label: 'Log',     x: 176, active: false },
    { icon: '◈', label: 'Places',  x: 254, active: false },
    { icon: '◑', label: 'Week',    x: 332, active: false },
  ];
  navItems.forEach(n => {
    const c = n.active ? ink : inkMid;
    const icSize = n.active ? 20 : 18;
    ch.push(`T('${n.icon}',${n.x + 15},776,36,${icSize},{font:'mono',size:${icSize},color:'${c}'});`);
    ch.push(`T('${n.label}',${n.x},800,58,12,{font:'mono',size:9,color:'${c}',caps:true,tracking:1});`);
    if (n.active) ch.push(`F(${n.x + 22},768,12,3,'${lime}',{r:1});`);
  });

  screens.push({ name: 'Active Route', children: ch });
}

// ─────────────────────────────────────────
// SCREEN 2 — MAP VIEW
// Spatial top-down. Trail as drawn path.
// ─────────────────────────────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);

  // Header
  ch.push(`T('MAP',16,52,200,28,{font:'mono',size:22,color:'${ink}',bold:true,caps:true,tracking:4});`);
  ch.push(`T('Riverside Loop',16,84,280,18,{font:'sans',size:14,color:'${inkMid}'});`);

  // Map canvas — large spatial area
  ch.push(`F(0,110,${W},480,'${surface2}',{});`);

  // Grid lines (topographic feel)
  for (let i = 0; i < 8; i++) {
    ch.push(`F(0,${110 + i * 60},${W},1,'${inkFaint}',{});`);
  }
  for (let i = 0; i < 7; i++) {
    ch.push(`F(${i * 60},110,1,480,'${inkFaint}',{});`);
  }

  // Trail path — organic lime route
  ch.push(`E(100,200,220,14,'${limeSoft}',{});`);
  ch.push(`E(180,250,180,14,'${limeSoft}',{});`);
  ch.push(`E(240,310,140,14,'${limeSoft}',{});`);
  ch.push(`E(200,370,200,12,'${limeSoft}',{});`);
  ch.push(`E(120,420,160,12,'${limeSoft}',{});`);
  // Lime line on top
  ch.push(`E(100,200,200,6,'${lime}',{});`);
  ch.push(`E(170,248,160,6,'${lime}',{});`);
  ch.push(`E(230,308,130,6,'${lime}',{});`);
  ch.push(`E(195,368,185,5,'${lime}',{});`);
  ch.push(`E(118,418,145,5,'${lime}',{});`);

  // Waypoint markers
  ch.push(`E(50,196,16,16,'${surface}',{});`);
  ch.push(`E(52,198,12,12,'${limeDeep}',{});`);  // start
  ch.push(`T('A',44,190,20,14,{font:'mono',size:10,color:'${limeDeep}',bold:true});`);

  ch.push(`E(286,300,16,16,'${surface}',{});`);
  ch.push(`E(288,302,12,12,'${inkMid}',{});`);  // waypoint 2
  ch.push(`T('B',282,294,20,14,{font:'mono',size:10,color:'${inkMid}',bold:true});`);

  ch.push(`E(54,412,20,20,'${coral}',{});`);  // current position
  ch.push(`E(60,418,8,8,'${surface}',{});`);  // inner white dot
  ch.push(`T('YOU',40,436,36,12,{font:'mono',size:9,color:'${coral}',bold:true,caps:true});`);

  // Coordinate labels (San Rita floating data pattern)
  ch.push(`T('37.9749° N',${W - 110},120,100,14,{font:'mono',size:10,color:'${inkMid}'});`);
  ch.push(`T('122.5186° W',${W - 110},136,100,14,{font:'mono',size:10,color:'${inkMid}'});`);

  // Scale bar
  ch.push(`F(16,564,80,2,'${ink}',{});`);
  ch.push(`T('500 m',16,570,80,12,{font:'mono',size:10,color:'${inkMid}'});`);

  // Bottom stats row
  ch.push(`F(0,590,${W},1,'${inkFaint}',{});`);
  ch.push(`F(0,591,${W},96,'${surface}',{});`);

  const stats = [
    { val: '8.0 km', lbl: 'Total', x: 16 },
    { val: '+142 m', lbl: 'Elevation', x: 116 },
    { val: '52 min', lbl: 'Est. Time', x: 226 },
    { val: '3.2', lbl: 'Difficulty', x: 326 },
  ];
  stats.forEach(s => {
    ch.push(`T('${s.val}',${s.x},606,92,22,{font:'mono',size:16,color:'${ink}',bold:true});`);
    ch.push(`T('${s.lbl}',${s.x},630,92,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:1});`);
  });

  // Nav bar
  ch.push(`F(0,764,${W},80,'${surface}',{});`);
  ch.push(`F(0,764,${W},1,'${inkFaint}',{});`);
  const navItems = [
    { icon: '◉', label: 'Now',     x: 20,  active: false },
    { icon: '◎', label: 'Map',     x: 98,  active: true  },
    { icon: '≡', label: 'Log',     x: 176, active: false },
    { icon: '◈', label: 'Places',  x: 254, active: false },
    { icon: '◑', label: 'Week',    x: 332, active: false },
  ];
  navItems.forEach(n => {
    const c = n.active ? ink : inkMid;
    const icSize = n.active ? 20 : 18;
    ch.push(`T('${n.icon}',${n.x + 15},776,36,${icSize},{font:'mono',size:${icSize},color:'${c}'});`);
    ch.push(`T('${n.label}',${n.x},800,58,12,{font:'mono',size:9,color:'${c}',caps:true,tracking:1});`);
    if (n.active) ch.push(`F(${n.x + 22},768,12,3,'${lime}',{r:1});`);
  });

  screens.push({ name: 'Map View', children: ch });
}

// ─────────────────────────────────────────
// SCREEN 3 — LOG
// Route history as journal entries
// ─────────────────────────────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);

  ch.push(`T('LOG',16,52,200,28,{font:'mono',size:22,color:'${ink}',bold:true,caps:true,tracking:4});`);
  ch.push(`T('Your movement journal',16,84,280,18,{font:'sans',size:14,color:'${inkMid}'});`);

  // Filter pills
  const filters = ['All', 'Run', 'Walk', 'Ride'];
  filters.forEach((f, i) => {
    const active = i === 0;
    ch.push(`F(${16 + i * 76},114,68,26,'${active ? lime : surface}',{r:13});`);
    ch.push(`T('${f}',${24 + i * 76},118,52,18,{font:'mono',size:11,color:'${active ? ink : inkMid}',caps:true,tracking:1});`);
  });

  // Log entries
  const routes = [
    { date: 'Today',     name: 'Morning Circuit',        sub: 'Riverside Loop',      km: '4.7', pace: '5:12', time: '28:44', icon: '◉', color: lime, type: 'RUN'  },
    { date: 'Yesterday', name: 'Evening Walk',           sub: 'Marina Promenade',    km: '3.2', pace: '9:14', time: '29:31', icon: '◎', color: ink,  type: 'WALK' },
    { date: 'Mon',       name: 'Long Run',               sub: 'Headlands Trail',     km: '12.4',pace: '5:38', time: '1:10:02',icon: '◉',color: coral,type: 'RUN'  },
    { date: 'Mon',       name: 'Recovery Walk',          sub: 'Neighborhood Circuit',km: '2.1', pace: '10:02',time: '21:04',icon: '◎', color: ink,  type: 'WALK' },
    { date: 'Sun',       name: 'Weekend Ride',           sub: 'Bay Trail North',     km: '22.8',pace: '3:18', time: '1:15:16',icon: '▷', color: limeDeep,type: 'RIDE'},
  ];

  routes.forEach((r, i) => {
    const y = 158 + i * 106;
    // Card
    ch.push(`F(16,${y},${W - 32},98,'${surface}',{r:12});`);
    // Date chip + type
    ch.push(`T('${r.date}',24,${y + 10},80,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:1});`);
    ch.push(`F(${W - 80},${y + 8},60,20,'${r.color === lime ? limeSoft : surface2}',{r:10});`);
    ch.push(`T('${r.type}',${W - 74},${y + 11},54,14,{font:'mono',size:9,color:'${r.color}',caps:true,tracking:2});`);
    // Route name
    ch.push(`T('${r.name}',24,${y + 28},260,20,{font:'sans',size:16,color:'${ink}',bold:true});`);
    ch.push(`T('${r.sub}',24,${y + 50},260,16,{font:'sans',size:12,color:'${inkMid}'});`);
    // Stats row
    ch.push(`F(16,${y + 72},${W - 32},1,'${inkFaint}',{});`);
    ch.push(`T('${r.km} km',24,${y + 78},80,16,{font:'mono',size:12,color:'${ink}',bold:true});`);
    ch.push(`T('${r.pace}/km',120,${y + 78},90,16,{font:'mono',size:12,color:'${inkMid}'});`);
    ch.push(`T('${r.time}',${W - 96},${y + 78},80,16,{font:'mono',size:12,color:'${inkMid}'});`);
  });

  // Nav bar
  ch.push(`F(0,764,${W},80,'${surface}',{});`);
  ch.push(`F(0,764,${W},1,'${inkFaint}',{});`);
  const navItems = [
    { icon: '◉', label: 'Now',     x: 20,  active: false },
    { icon: '◎', label: 'Map',     x: 98,  active: false },
    { icon: '≡', label: 'Log',     x: 176, active: true  },
    { icon: '◈', label: 'Places',  x: 254, active: false },
    { icon: '◑', label: 'Week',    x: 332, active: false },
  ];
  navItems.forEach(n => {
    const c = n.active ? ink : inkMid;
    const icSize = n.active ? 20 : 18;
    ch.push(`T('${n.icon}',${n.x + 15},776,36,${icSize},{font:'mono',size:${icSize},color:'${c}'});`);
    ch.push(`T('${n.label}',${n.x},800,58,12,{font:'mono',size:9,color:'${c}',caps:true,tracking:1});`);
    if (n.active) ch.push(`F(${n.x + 22},768,12,3,'${lime}',{r:1});`);
  });

  screens.push({ name: 'Log', children: ch });
}

// ─────────────────────────────────────────
// SCREEN 4 — PLACES
// Saved waypoints — with coordinates
// ─────────────────────────────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);

  ch.push(`T('PLACES',16,52,240,28,{font:'mono',size:22,color:'${ink}',bold:true,caps:true,tracking:4});`);
  ch.push(`T('Favourite waypoints',16,84,280,18,{font:'sans',size:14,color:'${inkMid}'});`);

  // Add button
  ch.push(`F(${W - 56},46,40,40,'${lime}',{r:20});`);
  ch.push(`T('+',${W - 44},52,28,28,{font:'mono',size:22,color:'${ink}',bold:true});`);

  // Places list
  const places = [
    { name: 'Riverside Start',     coord: '37.9749° N · 122.5186° W', visits: 24, badge: 'FAV', color: lime    },
    { name: 'Headlands Overlook',  coord: '37.8330° N · 122.4832° W', visits: 11, badge: 'VIEW',color: coral   },
    { name: 'Bike Trail Junction', coord: '37.8018° N · 122.4472° W', visits: 8,  badge: 'LINK',color: limeDeep},
    { name: 'Marina Bench',        coord: '37.8064° N · 122.4394° W', visits: 6,  badge: null,  color: ink     },
    { name: 'Summit Rest Point',   coord: '37.9221° N · 122.5517° W', visits: 3,  badge: null,  color: ink     },
  ];

  places.forEach((p, i) => {
    const y = 120 + i * 112;
    ch.push(`F(16,${y},${W - 32},104,'${surface}',{r:12});`);

    // Icon circle
    ch.push(`E(40,${y + 28},36,36,'${p.color === lime ? limeSoft : p.color === coral ? coralSoft : surface2}',{});`);
    ch.push(`T('◈',26,${y + 24},42,28,{font:'mono',size:18,color:'${p.color}'});`);

    // Name + coord
    ch.push(`T('${p.name}',88,${y + 12},230,20,{font:'sans',size:15,color:'${ink}',bold:true});`);
    ch.push(`T('${p.coord}',88,${y + 34},250,16,{font:'mono',size:10,color:'${inkMid}'});`);

    // Visit count
    ch.push(`T('${p.visits}×',88,${y + 56},50,18,{font:'mono',size:13,color:'${ink}',bold:true});`);
    ch.push(`T('visits',138,${y + 56},60,18,{font:'mono',size:11,color:'${inkMid}'});`);

    // Badge
    if (p.badge) {
      ch.push(`F(${W - 78},${y + 12},58,22,'${p.color === lime ? lime : p.color === coral ? coral : surface2}',{r:11});`);
      ch.push(`T('${p.badge}',${W - 72},${y + 15},50,16,{font:'mono',size:9,color:'${p.color === lime || p.color === coral ? ink : inkMid}',caps:true,tracking:2});`);
    }

    // Divider
    if (i < places.length - 1) {
      ch.push(`F(88,${y + 88},${W - 104},1,'${inkFaint}',{});`);
    }
  });

  // Nav bar
  ch.push(`F(0,764,${W},80,'${surface}',{});`);
  ch.push(`F(0,764,${W},1,'${inkFaint}',{});`);
  const navItems = [
    { icon: '◉', label: 'Now',     x: 20,  active: false },
    { icon: '◎', label: 'Map',     x: 98,  active: false },
    { icon: '≡', label: 'Log',     x: 176, active: false },
    { icon: '◈', label: 'Places',  x: 254, active: true  },
    { icon: '◑', label: 'Week',    x: 332, active: false },
  ];
  navItems.forEach(n => {
    const c = n.active ? ink : inkMid;
    const icSize = n.active ? 20 : 18;
    ch.push(`T('${n.icon}',${n.x + 15},776,36,${icSize},{font:'mono',size:${icSize},color:'${c}'});`);
    ch.push(`T('${n.label}',${n.x},800,58,12,{font:'mono',size:9,color:'${c}',caps:true,tracking:1});`);
    if (n.active) ch.push(`F(${n.x + 22},768,12,3,'${lime}',{r:1});`);
  });

  screens.push({ name: 'Places', children: ch });
}

// ─────────────────────────────────────────
// SCREEN 5 — WEEK
// Weekly movement summary — editorial stats
// ─────────────────────────────────────────
{
  const ch = [];
  ch.push(`F(0,0,${W},${H},'${bg}');`);

  ch.push(`T('THIS WEEK',16,52,240,24,{font:'mono',size:18,color:'${ink}',bold:true,caps:true,tracking:4});`);
  ch.push(`T('Mar 25 – Mar 31',16,82,260,16,{font:'sans',size:13,color:'${inkMid}'});`);

  // Hero stat — total km in giant mono
  ch.push(`F(16,108,${W - 32},96,'${lime}',{r:14});`);
  ch.push(`T('47.2',24,112,240,68,{font:'mono',size:60,color:'${ink}',bold:true});`);
  ch.push(`T('km this week',${W - 156},132,140,22,{font:'mono',size:14,color:'${limeDeep}',bold:true});`);
  ch.push(`T('↑ 12% vs last week',${W - 156},156,140,18,{font:'mono',size:11,color:'${limeDeep}'});`);

  // Day bars
  ch.push(`F(16,220,${W - 32},120,'${surface}',{r:12});`);
  ch.push(`T('DAILY DISTANCE',24,230,200,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);

  const days = [
    { d: 'M', km: 4.2 },
    { d: 'T', km: 7.8 },
    { d: 'W', km: 0   },
    { d: 'T', km: 12.4 },
    { d: 'F', km: 5.5 },
    { d: 'S', km: 14.8, active: true },
    { d: 'S', km: 2.5 },
  ];
  const maxKm = 14.8;
  const barW = 36;
  const barAreaH = 60;
  days.forEach((day, i) => {
    const bx = 24 + i * 50;
    const barH = day.km > 0 ? Math.round((day.km / maxKm) * barAreaH) : 2;
    const by = 220 + 90 - barH;
    const col = day.active ? lime : (day.km === 0 ? inkFaint : surface2);
    ch.push(`F(${bx},${by},${barW},${barH},'${col}',{r:4});`);
    ch.push(`T('${day.d}',${bx + 6},312,${barW},14,{font:'mono',size:11,color:'${day.active ? ink : inkMid}',caps:true});`);
    if (day.km > 0) {
      ch.push(`T('${day.km}',${bx},${by - 16},${barW + 4},14,{font:'mono',size:9,color:'${day.active ? limeDeep : inkMid}'});`);
    }
  });

  // Activity type breakdown
  ch.push(`F(16,356,${W - 32},1,'${inkFaint}',{});`);
  ch.push(`T('BY TYPE',16,368,200,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);

  const types = [
    { label: 'Running',  km: '31.5 km', pct: 67, color: lime    },
    { label: 'Walking',  km: '8.2 km',  pct: 17, color: ink     },
    { label: 'Cycling',  km: '7.5 km',  pct: 16, color: coral   },
  ];
  types.forEach((t, i) => {
    const y = 390 + i * 68;
    ch.push(`F(16,${y},${W - 32},60,'${surface}',{r:10});`);
    ch.push(`T('${t.label}',24,${y + 8},180,18,{font:'sans',size:14,color:'${ink}',bold:true});`);
    ch.push(`T('${t.km}',24,${y + 28},120,16,{font:'mono',size:12,color:'${inkMid}'});`);
    // pct bar
    ch.push(`F(180,${y + 14},${W - 196},6,'${inkFaint}',{r:3});`);
    ch.push(`F(180,${y + 14},${Math.round((W - 196) * t.pct / 100)},6,'${t.color}',{r:3});`);
    ch.push(`T('${t.pct}%',${W - 52},${y + 10},42,16,{font:'mono',size:12,color:'${ink}',bold:true});`);
  });

  // Streak badge
  ch.push(`F(16,602,${W - 32},56,'${ink}',{r:12});`);
  ch.push(`T('🔥 8-day streak',24,616,220,22,{font:'sans',size:16,color:'${bg}',bold:true});`);
  ch.push(`T('Keep moving tomorrow!',24,640,220,18,{font:'sans',size:12,color:'rgba(240,236,229,0.65)'});`);
  ch.push(`T('Personal Best: 52.1 km',${W - 196},618,180,18,{font:'mono',size:11,color:'${lime}'});`);
  ch.push(`T('Week of Feb 10',${W - 196},638,180,16,{font:'mono',size:10,color:'rgba(240,236,229,0.50)'});`);

  // Nav bar
  ch.push(`F(0,764,${W},80,'${surface}',{});`);
  ch.push(`F(0,764,${W},1,'${inkFaint}',{});`);
  const navItems = [
    { icon: '◉', label: 'Now',     x: 20,  active: false },
    { icon: '◎', label: 'Map',     x: 98,  active: false },
    { icon: '≡', label: 'Log',     x: 176, active: false },
    { icon: '◈', label: 'Places',  x: 254, active: false },
    { icon: '◑', label: 'Week',    x: 332, active: true  },
  ];
  navItems.forEach(n => {
    const c = n.active ? ink : inkMid;
    const icSize = n.active ? 20 : 18;
    ch.push(`T('${n.icon}',${n.x + 15},776,36,${icSize},{font:'mono',size:${icSize},color:'${c}'});`);
    ch.push(`T('${n.label}',${n.x},800,58,12,{font:'mono',size:9,color:'${c}',caps:true,tracking:1});`);
    if (n.active) ch.push(`F(${n.x + 22},768,12,3,'${lime}',{r:1});`);
  });

  screens.push({ name: 'Week', children: ch });
}

// ─────────────────────────────────────────
// RENDER
// ─────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'TRAIL',
    tagline: 'Movement is memory. Log every route.',
    archetype: 'movement-journal-light',
    theme: 'light',
    palette: { bg, surface, ink, accent: lime, accent2: coral },
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    children: s.children,
  })),
};

const fs = await import('fs');
fs.writeFileSync('./trail.pen', JSON.stringify(pen, null, 2));
console.log(`✓ trail.pen written — ${screens.length} screens`);
const bytes = fs.statSync('./trail.pen').size;
console.log(`  Size: ${(bytes / 1024).toFixed(1)} KB`);
screens.forEach((s, i) => console.log(`  Screen ${i + 1}: ${s.name} (${s.children.length} elements)`));
