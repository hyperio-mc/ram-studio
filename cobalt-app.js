// COBALT — Developer Operations Command Center
// Theme: DARK (graft was light → rotating to dark)
// Inspired by: Evervault:Customers (godly.website) — encrypted-data dark UI with glowing cards
//              Neon DB (darkmodedesign.com) — neon-mint terminal accents on deep black
//              Chus Retro OS Portfolio (minimal.gallery) — terminal/OS-in-browser aesthetic
// Style: Terminal-OS hybrid, bento grid, neon-on-black, glowing mono typography

'use strict';
const fs = require('fs');

const P = {
  bg:       '#08090E',
  surface:  '#10131C',
  surface2: '#171B28',
  border:   '#1E2535',
  text:     '#CDD9EE',
  textDim:  '#6B7FA0',
  mint:     '#3DFFA0',   // neon mint — primary accent (terminal green)
  violet:   '#6E3FFF',   // electric violet
  pink:     '#FF3D8A',   // hot pink / error
  amber:    '#FFB93D',   // amber / warning
};

const pen = {
  version: "2.8",
  name: "COBALT",
  description: "Developer operations command center — terminal-OS hybrid, bento grid, neon-on-black",
  theme: "dark",
  metadata: {
    created: new Date().toISOString(),
    author: "RAM Design Heartbeat",
    slug: "cobalt",
    archetype: "developer-ops-dashboard",
    inspiration: [
      "Evervault: Customers (godly.website) — dark encrypted-data UI with glowing card system",
      "Neon DB (darkmodedesign.com) — neon-green terminal accents, deep black substrate",
      "Chus Retro OS Portfolio (minimal.gallery) — terminal/OS-in-browser hybrid aesthetic"
    ]
  },
  palette: P,

  screens: [
    {
      id: "overview",
      label: "Overview",
      icon: "grid",
      layout: "bento",
      bg: P.bg,
      header: {
        type: "terminal-bar",
        prefix: "cobalt@core:~$",
        title: "COBALT",
        subtitle: "OPERATIONS CENTER",
        titleStyle: { font: "mono", size: 13, weight: 700, color: P.mint, letterSpacing: "0.25em" },
        subtitleStyle: { font: "mono", size: 8, color: P.textDim, letterSpacing: "0.45em" },
        right: {
          type: "status-pill",
          label: "ALL SYSTEMS",
          value: "NOMINAL",
          color: P.mint,
          pulse: true
        }
      },
      grid: {
        columns: 12, gap: 10,
        cells: [
          {
            id: "uptime", col: 1, colspan: 3, row: 1, rowspan: 2,
            type: "metric-card",
            bg: P.surface,
            border: `1px solid ${P.mint}22`,
            glow: { color: P.mint, blur: 40, opacity: 0.08 },
            label: { text: "UPTIME", font: "mono", size: 8, color: P.mint, letterSpacing: "0.3em" },
            value: { text: "99.97%", font: "mono", size: 36, weight: 700, color: P.mint },
            sub: { text: "↑ 30-day rolling avg", font: "mono", size: 9, color: P.textDim },
            sparkline: { data: [99.9,100,99.8,100,100,99.97,100,100,99.9,100,100,99.97], color: P.mint, height: 28, filled: true, fillOpacity: 0.15 }
          },
          {
            id: "deploys", col: 4, colspan: 3, row: 1,
            type: "metric-card", bg: P.surface,
            label: { text: "DEPLOYS TODAY", font: "mono", size: 8, color: P.textDim, letterSpacing: "0.3em" },
            value: { text: "14", font: "mono", size: 32, weight: 700, color: P.text },
            badge: { text: "+3 vs yesterday", color: P.mint, bg: `${P.mint}18` }
          },
          {
            id: "prs", col: 7, colspan: 3, row: 1,
            type: "metric-card", bg: P.surface,
            label: { text: "OPEN PRS", font: "mono", size: 8, color: P.textDim, letterSpacing: "0.3em" },
            value: { text: "28", font: "mono", size: 32, weight: 700, color: P.text },
            badge: { text: "6 awaiting review", color: P.amber, bg: `${P.amber}18` }
          },
          {
            id: "errors", col: 10, colspan: 3, row: 1,
            type: "metric-card", bg: P.surface,
            label: { text: "ERROR RATE", font: "mono", size: 8, color: P.textDim, letterSpacing: "0.3em" },
            value: { text: "0.03%", font: "mono", size: 32, weight: 700, color: P.text },
            badge: { text: "↓ from 0.04% peak", color: P.mint, bg: `${P.mint}18` }
          },
          {
            id: "timeline", col: 4, colspan: 6, row: 2,
            type: "timeline-card", bg: P.surface,
            label: { text: "RECENT DEPLOYMENTS", font: "mono", size: 8, color: P.textDim, letterSpacing: "0.3em" },
            items: [
              { env:"prod", service:"api-gateway",  status:"success", time:"12m ago", hash:"a4f2c1b" },
              { env:"prod", service:"auth-service",  status:"success", time:"1h ago",  hash:"b9e3d7f" },
              { env:"stg",  service:"ml-pipeline",   status:"running", time:"2h ago",  hash:"c2a9f4e" },
              { env:"prod", service:"billing-svc",   status:"failed",  time:"3h ago",  hash:"d7b1a3c" },
            ],
            statusColors: { success: P.mint, running: P.violet, failed: P.pink }
          },
          {
            id: "heatmap", col: 10, colspan: 3, row: 2,
            type: "heatmap-mini", bg: P.surface,
            label: { text: "COMMITS / 7D", font: "mono", size: 8, color: P.textDim, letterSpacing: "0.3em" },
            data: [[3,5,2,7,4,6,1],[5,2,8,3,6,4,2],[1,4,3,5,7,2,6],[6,3,5,1,4,8,3]],
            color: P.violet,
            total: { text: "143", label: "this week", color: P.text }
          },
          {
            id: "services", col: 1, colspan: 9, row: 3,
            type: "service-grid", bg: P.surface,
            label: { text: "SERVICE HEALTH", font: "mono", size: 8, color: P.textDim, letterSpacing: "0.3em" },
            services: [
              { name:"API Gateway",   latency:"12ms",  status:"ok",   load:64 },
              { name:"Auth Service",  latency:"8ms",   status:"ok",   load:31 },
              { name:"DB Primary",    latency:"2ms",   status:"ok",   load:48 },
              { name:"ML Pipeline",   latency:"340ms", status:"warn", load:82 },
              { name:"CDN Edge",      latency:"4ms",   status:"ok",   load:17 },
              { name:"Queue Worker",  latency:"—",     status:"ok",   load:55 },
            ],
            statusColors: { ok: P.mint, warn: P.amber, err: P.pink }
          },
          {
            id: "terminal", col: 10, colspan: 3, row: 3,
            type: "terminal-card", bg: '#060708',
            border: `1px solid ${P.mint}33`,
            glow: { color: P.mint, blur: 20, opacity: 0.05 },
            lines: [
              { text: "$ cobalt status --live", color: P.mint },
              { text: "● api-gateway     UP",   color: P.textDim },
              { text: "● auth-service    UP",   color: P.textDim },
              { text: "● ml-pipeline     ⚠",    color: P.amber },
              { text: "● billing         UP",   color: P.textDim },
              { text: "_", color: P.mint, blink: true }
            ]
          }
        ]
      }
    },

    {
      id: "repos",
      label: "Repos",
      icon: "layers",
      bg: P.bg,
      header: {
        type: "terminal-bar",
        prefix: "cobalt@repos:~$",
        title: "REPOSITORIES",
        titleStyle: { font: "mono", size: 13, weight: 700, color: P.text, letterSpacing: "0.2em" },
        right: {
          type: "filter-row",
          filters: ["ALL", "ACTIVE", "STALE", "ARCHIVED"],
          active: "ACTIVE", color: P.mint
        }
      },
      content: [
        {
          type: "repo-list", bg: P.surface,
          items: [
            { name:"api-gateway",   lang:"Go",         langColor:"#00ADD8", stars:847,  prs:3, issues:12, lastCommit:"12m ago", health:94, branches:8,  status:"active" },
            { name:"auth-service",  lang:"TypeScript",  langColor:"#3178C6", stars:234,  prs:1, issues:5,  lastCommit:"1h ago",  health:88, branches:4,  status:"active" },
            { name:"ml-pipeline",   lang:"Python",      langColor:"#3572A5", stars:1204, prs:7, issues:31, lastCommit:"2h ago",  health:71, branches:12, status:"active", alert:"CI failing" },
            { name:"design-system", lang:"TypeScript",  langColor:"#3178C6", stars:512,  prs:0, issues:8,  lastCommit:"2d ago",  health:99, branches:2,  status:"stable" },
            { name:"billing-svc",   lang:"Rust",        langColor:"#DEA584", stars:89,   prs:2, issues:4,  lastCommit:"3h ago",  health:85, branches:5,  status:"active" }
          ]
        },
        {
          type: "language-breakdown",
          label: "LANGUAGE DISTRIBUTION",
          data: [
            { lang:"TypeScript", pct:42, color:"#3178C6" },
            { lang:"Go",         pct:28, color:"#00ADD8" },
            { lang:"Python",     pct:19, color:"#3572A5" },
            { lang:"Rust",       pct:11, color:"#DEA584" }
          ]
        }
      ]
    },

    {
      id: "deployments",
      label: "Deploys",
      icon: "zap",
      bg: P.bg,
      header: {
        type: "terminal-bar",
        prefix: "cobalt@deploy:~$",
        title: "DEPLOYMENTS",
        titleStyle: { font: "mono", size: 13, weight: 700, color: P.text, letterSpacing: "0.2em" },
        right: {
          type: "env-toggle",
          envs: ["production","staging","preview"],
          active: "production", color: P.mint
        }
      },
      content: [
        {
          type: "pipeline-view", bg: P.surface,
          stages: ["build","test","security","deploy"],
          deploys: [
            { id:"deploy-0491", service:"api-gateway", version:"v3.14.2", author:"aria.chen",
              status:"success", duration:"3m 12s", time:"12 min ago", env:"prod",
              stages:{ build:"pass", test:"pass", security:"pass", deploy:"pass" } },
            { id:"deploy-0490", service:"ml-pipeline", version:"v1.9.0", author:"rio.nakamura",
              status:"running", duration:"ongoing", time:"in progress", env:"stg",
              stages:{ build:"pass", test:"running", security:"pending", deploy:"pending" } },
            { id:"deploy-0489", service:"billing-svc", version:"v2.3.1", author:"sam.osei",
              status:"failed", duration:"1m 44s", time:"3h ago", env:"prod",
              stages:{ build:"pass", test:"fail", security:"skip", deploy:"skip" } }
          ],
          statusColors: { pass:P.mint, fail:P.pink, running:P.violet, pending:P.textDim, skip:P.border }
        },
        {
          type: "deploy-frequency-chart",
          label: "DEPLOY FREQUENCY — THIS WEEK",
          data: [
            { day:"Mon", prod:4, stg:8 },{ day:"Tue", prod:6, stg:12 },
            { day:"Wed", prod:3, stg:7 },{ day:"Thu", prod:8, stg:14 },
            { day:"Fri", prod:5, stg:9 },{ day:"Sat", prod:1, stg:3 },
            { day:"Sun", prod:2, stg:4 }
          ],
          colors: { prod:P.mint, stg:P.violet }
        }
      ]
    },

    {
      id: "logs",
      label: "Logs",
      icon: "list",
      bg: '#060708',
      header: {
        type: "terminal-bar",
        prefix: "cobalt@logs:~$",
        title: "LIVE LOG STREAM",
        titleStyle: { font: "mono", size: 13, weight: 700, color: P.mint, letterSpacing: "0.2em" },
        right: { type: "live-badge", label: "LIVE", color: P.mint, pulse: true }
      },
      content: [
        {
          type: "log-filter-bar", bg: P.surface,
          filters: [
            { label:"ALL",   count:14820, active:false },
            { label:"ERROR", count:4,     active:true,  color:P.pink },
            { label:"WARN",  count:23,    active:false, color:P.amber },
            { label:"INFO",  count:14793, active:false, color:P.textDim }
          ],
          search: { placeholder:"filter logs...", font:"mono" }
        },
        {
          type: "terminal-log",
          bg: '#060708',
          border: `1px solid ${P.mint}22`,
          glow: { color: P.mint, blur: 30, opacity: 0.04 },
          scanlines: true,
          font: "mono", size: 10,
          entries: [
            { ts:"14:32:18.941", level:"ERROR", service:"billing-svc",  msg:"Stripe webhook signature verification failed",       color:P.pink },
            { ts:"14:32:17.220", level:"WARN",  service:"ml-pipeline",  msg:"GPU memory at 94% — consider scaling up",            color:P.amber },
            { ts:"14:32:15.003", level:"INFO",  service:"api-gateway",  msg:"GET /v3/users/batch 200 12ms x-request-id=a4f2",     color:P.textDim },
            { ts:"14:32:14.888", level:"INFO",  service:"auth-service", msg:"Token refreshed for user u_8821fa — device mobile", color:P.textDim },
            { ts:"14:32:13.512", level:"ERROR", service:"billing-svc",  msg:"Retry 2/3: downstream timeout on payment processor", color:P.pink },
            { ts:"14:32:12.104", level:"INFO",  service:"cdn-edge",     msg:"Cache purged assets/v3.14.2/* — 2,491 objects",      color:P.textDim },
            { ts:"14:32:11.778", level:"INFO",  service:"api-gateway",  msg:"POST /v3/deploy 201 — pipeline enqueued #0491",      color:P.textDim },
            { ts:"14:32:10.323", level:"WARN",  service:"queue-worker", msg:"Job retry queue depth at 847 — above threshold",    color:P.amber },
            { ts:"14:32:09.001", level:"INFO",  service:"auth-service", msg:"OAuth callback for github/rio.nakamura — success",  color:P.textDim },
            { ts:"14:32:08.448", level:"INFO",  service:"api-gateway",  msg:"Health check /v3/ping 200 2ms",                     color:P.textDim },
            { ts:"14:32:07.910", level:"INFO",  service:"db-primary",   msg:"Checkpoint complete — WAL flushed 128MB",           color:P.textDim },
            { ts:"14:32:06.299", level:"INFO",  service:"api-gateway",  msg:"Rate limit applied ip/203.0.113.42 — 429",          color:P.textDim },
          ],
          cursor: { text:"_", color:P.mint, blink:true }
        }
      ]
    },

    {
      id: "team",
      label: "Team",
      icon: "user",
      bg: P.bg,
      header: {
        type: "terminal-bar",
        prefix: "cobalt@team:~$",
        title: "CONTRIBUTORS",
        titleStyle: { font: "mono", size: 13, weight: 700, color: P.text, letterSpacing: "0.2em" },
        right: {
          type: "period-toggle",
          periods: ["7D","30D","90D"],
          active: "30D", color: P.mint
        }
      },
      content: [
        {
          type: "contributor-list", bg: P.surface,
          items: [
            { handle:"aria.chen",   role:"Platform Lead",    avatar:{ initials:"AC", bg:P.violet },    commits:142, reviews:67, prs:18, additions:14200, deletions:8400,  streak:14, activity:[8,12,5,14,9,6,11,7,13,8,10,4,16,9] },
            { handle:"rio.nakamura",role:"ML Engineer",      avatar:{ initials:"RN", bg:"#E05CC3" },   commits:98,  reviews:23, prs:11, additions:22100, deletions:4800,  streak:8,  activity:[5,7,11,3,8,12,6,9,4,10,7,8,5,11] },
            { handle:"sam.osei",    role:"Backend Engineer", avatar:{ initials:"SO", bg:P.amber },     commits:87,  reviews:41, prs:14, additions:9800,  deletions:6200,  streak:21, activity:[6,4,9,7,5,8,12,4,7,9,6,8,5,10] },
            { handle:"dev.santos",  role:"Frontend",         avatar:{ initials:"DS", bg:"#FF5F5F" },   commits:63,  reviews:18, prs:9,  additions:8300,  deletions:5100,  streak:5,  activity:[4,6,3,8,5,4,7,3,6,5,4,7,3,6] }
          ]
        },
        {
          type: "ownership-map",
          label: "CODE OWNERSHIP",
          bg: P.surface,
          data: [
            { module:"API Gateway",  aria:45, rio:10, sam:35, dev:10 },
            { module:"ML Pipeline",  aria:15, rio:70, sam:10, dev:5  },
            { module:"Auth Service", aria:30, rio:5,  sam:45, dev:20 },
            { module:"Design Sys",   aria:10, rio:5,  sam:10, dev:75 }
          ],
          colors: [P.violet, "#E05CC3", P.amber, "#FF5F5F"]
        },
        {
          type: "activity-pulse",
          label: "TEAM PULSE — TODAY",
          bg: P.surface,
          data: {
            hours:   ["00","02","04","06","08","10","12","14","16","18","20","22"],
            commits: [0,0,1,2,8,14,12,18,16,11,6,2],
            reviews: [0,0,0,1,4,8,7,12,10,8,4,1]
          },
          colors: { commits:P.mint, reviews:P.violet }
        }
      ]
    }
  ],

  nav: [
    { id:"overview",    label:"Grid",   icon:"grid"   },
    { id:"repos",       label:"Repos",  icon:"layers" },
    { id:"deployments", label:"Deploy", icon:"zap"    },
    { id:"logs",        label:"Logs",   icon:"list"   },
    { id:"team",        label:"Team",   icon:"user"   }
  ],

  globalStyle: {
    fontFamily: { ui:"Inter", mono:"JetBrains Mono, Fira Code, monospace" },
    borderRadius: 6,
    navBar: {
      bg: '#0C0E16',
      border: `1px solid ${P.border}`,
      activeColor: P.mint,
      inactiveColor: P.textDim,
    },
    scanlineOverlay: { opacity: 0.03, spacing: 2 }
  }
};

fs.writeFileSync('cobalt.pen', JSON.stringify(pen, null, 2));
console.log('✓ cobalt.pen written —', JSON.stringify(pen).length, 'bytes');
console.log('  Screens:', pen.screens.map(s => s.label).join(', '));
