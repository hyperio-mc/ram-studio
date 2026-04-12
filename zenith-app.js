#!/usr/bin/env node
// ZENITH — Command your AI fleet
// Inspired by: Midday.ai's agent-first "business stack for modern founders"
//              (featured on DarkModeDesign.com — deep dark palette, always-on metrics)
//              + Traffic Productions' stat-embedded bold typography (godly.website)
//              "GROW WITH TRAFFIC (27%)" — stats baked directly into the UI chrome
// Theme: DARK (PANE was light → rotating to dark)

const fs = require('fs');

const pen = {
  version: "2.8",
  meta: {
    name: "ZENITH",
    tagline: "Command your AI fleet",
    archetype: "ai-ops-command",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "dark"
  },
  palette: {
    bg: "#050810",
    surface: "#0C1220",
    surfaceAlt: "#111827",
    surfaceHover: "#152035",
    text: "#E8EEFF",
    textMuted: "rgba(232,238,255,0.40)",
    accent: "#00CFFF",
    accent2: "#8B5CF6",
    accentSoft: "rgba(0,207,255,0.10)",
    accent2Soft: "rgba(139,92,246,0.10)",
    border: "rgba(232,238,255,0.07)",
    borderStrong: "rgba(232,238,255,0.14)",
    borderAccent: "rgba(0,207,255,0.25)",
    statusGreen: "#00F5A0",
    statusOrange: "#FF9A3C",
    statusRed: "#FF4D6A",
    statusGreenSoft: "rgba(0,245,160,0.10)",
    statusOrangeSoft: "rgba(255,154,60,0.10)",
    statusRedSoft: "rgba(255,77,106,0.10)",
    gridLine: "rgba(232,238,255,0.03)"
  },
  lightPalette: {
    bg: "#EFF3FF",
    surface: "#FFFFFF",
    surfaceAlt: "#E4EAF8",
    text: "#0A1628",
    textMuted: "rgba(10,22,40,0.45)",
    accent: "#0080CC",
    accent2: "#6B3FA0",
    accentSoft: "rgba(0,128,204,0.08)",
    accent2Soft: "rgba(107,63,160,0.08)",
    border: "rgba(10,22,40,0.09)",
    borderStrong: "rgba(10,22,40,0.18)",
    borderAccent: "rgba(0,128,204,0.25)",
    statusGreen: "#00A870",
    statusOrange: "#D4700A",
    statusRed: "#D92B50",
    statusGreenSoft: "rgba(0,168,112,0.09)",
    statusOrangeSoft: "rgba(212,112,10,0.09)",
    statusRedSoft: "rgba(217,43,80,0.09)"
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    monoFamily: "'JetBrains Mono', 'Fira Code', monospace",
    scale: { xs: 10, sm: 11, base: 13, md: 14, lg: 17, xl: 22, xxl: 30, hero: 42 }
  },
  screens: [
    {
      id: "command",
      label: "Command",
      description: "Fleet overview — live agent grid, global health ticker, active mission strip",
      components: [
        {
          type: "ops-topbar",
          left: "ZENITH",
          leftVersion: "v2.4",
          centerLabel: "FLEET COMMAND",
          centerBadge: { text: "LIVE", color: "statusGreen" },
          rightItems: ["12 agents", "4 missions", "09:42 UTC"],
          style: "command-chrome"
        },
        {
          type: "stat-ticker",
          items: [
            { label: "UPTIME", value: "99.7%", delta: "+0.2%" },
            { label: "TASKS TODAY", value: "1,847", delta: "+23%" },
            { label: "AVG LATENCY", value: "312ms", delta: "−18ms" },
            { label: "SUCCESS RATE", value: "96.4%", delta: "+1.1%" },
            { label: "TOKENS USED", value: "4.2M", delta: "62% budget" },
            { label: "COST TODAY", value: "$18.40", delta: "+$2.10" }
          ],
          style: "scrolling-strip"
        },
        {
          type: "section-header",
          label: "AGENT FLEET — 12 ACTIVE",
          action: { label: "Deploy Agent", icon: "plus" }
        },
        {
          type: "agent-status-grid",
          columns: 3,
          agents: [
            { id: "AG-01", name: "Nexus", role: "Orchestrator", status: "active", uptime: 99.2, tasks: 342, model: "GPT-4o" },
            { id: "AG-02", name: "Scout", role: "Researcher", status: "active", uptime: 98.8, tasks: 215, model: "Claude 3.6" },
            { id: "AG-03", name: "Forge", role: "Code Writer", status: "active", uptime: 97.4, tasks: 189, model: "GPT-4o" },
            { id: "AG-04", name: "Prism", role: "Analyzer", status: "active", uptime: 99.9, tasks: 407, model: "Gemini 1.5" },
            { id: "AG-05", name: "Echo", role: "Summarizer", status: "idle", uptime: 100, tasks: 93, model: "Claude 3.6" },
            { id: "AG-06", name: "Vault", role: "Memory Mgr", status: "active", uptime: 99.1, tasks: 601, model: "Custom" },
            { id: "AG-07", name: "Relay", role: "Dispatcher", status: "warning", uptime: 98.3, tasks: 278, model: "GPT-4o Mini" },
            { id: "AG-08", name: "Lens", role: "Vision Agent", status: "active", uptime: 96.7, tasks: 134, model: "GPT-4V" },
            { id: "AG-09", name: "Tide", role: "Scheduler", status: "active", uptime: 99.5, tasks: 512, model: "Claude 3.6" }
          ]
        },
        {
          type: "mission-strip",
          label: "ACTIVE MISSIONS",
          missions: [
            { id: "M-0042", name: "Q2 Market Analysis", agents: ["Scout","Prism"], progress: 67, status: "running", eta: "2h 14m" },
            { id: "M-0043", name: "Codebase Refactor", agents: ["Forge","Nexus"], progress: 23, status: "running", eta: "5h 40m" },
            { id: "M-0044", name: "Content Pipeline", agents: ["Echo","Relay"], progress: 89, status: "finalizing", eta: "22m" },
            { id: "M-0045", name: "Data Reconciliation", agents: ["Vault","Prism"], progress: 5, status: "queued", eta: "—" }
          ],
          style: "progress-bars-horizontal"
        }
      ]
    },
    {
      id: "agents",
      label: "Agents",
      description: "Agent roster with expanded profile, capability map, and uptime history",
      components: [
        {
          type: "ops-topbar",
          left: "ZENITH",
          leftVersion: "v2.4",
          centerLabel: "AGENT ROSTER",
          rightItems: ["12 agents", "3 models"]
        },
        {
          type: "search-filter-bar",
          placeholder: "Search agents…",
          filters: ["All", "Active", "Idle", "Warning"],
          activeFilter: "All",
          sort: "Tasks ↓"
        },
        {
          type: "agent-profile-expanded",
          agent: {
            id: "AG-01",
            name: "Nexus",
            role: "Orchestrator",
            status: "active",
            model: "GPT-4o",
            created: "Jan 14, 2026",
            tasksTotal: 8342,
            tasksToday: 342,
            avgLatency: "290ms",
            successRate: 97.8,
            uptime: 99.2,
            capabilities: ["Task routing", "Agent coordination", "Priority arbitration", "Error recovery"],
            recentMissions: ["Q2 Market Analysis", "System Audit", "Onboarding Pipeline"],
            uptimeSparkline: [99.1, 99.3, 99.0, 99.4, 99.2, 99.5, 99.2]
          }
        },
        {
          type: "agent-list-table",
          agents: [
            { id: "AG-02", name: "Scout", role: "Researcher", status: "active", tasks: 215, uptime: 98.8 },
            { id: "AG-03", name: "Forge", role: "Code Writer", status: "active", tasks: 189, uptime: 97.4 },
            { id: "AG-04", name: "Prism", role: "Analyzer", status: "active", tasks: 407, uptime: 99.9 },
            { id: "AG-05", name: "Echo", role: "Summarizer", status: "idle", tasks: 93, uptime: 100 },
            { id: "AG-07", name: "Relay", role: "Dispatcher", status: "warning", tasks: 278, uptime: 98.3 }
          ]
        }
      ]
    },
    {
      id: "missions",
      label: "Missions",
      description: "Kanban pipeline with mission detail panel and step timeline",
      components: [
        {
          type: "ops-topbar",
          left: "ZENITH",
          leftVersion: "v2.4",
          centerLabel: "MISSION CONTROL",
          rightItems: ["4 running", "2 queued", "18 done today"]
        },
        {
          type: "mission-kanban",
          columns: [
            { label: "QUEUED", colorKey: "textMuted", items: [
              { id: "M-0045", name: "Data Reconciliation", agents: ["Vault","Prism"], priority: "medium", eta: "~6h" },
              { id: "M-0046", name: "Competitor Scan", agents: ["Scout"], priority: "low", eta: "~3h" }
            ]},
            { label: "RUNNING", colorKey: "accent", items: [
              { id: "M-0042", name: "Q2 Market Analysis", agents: ["Scout","Prism"], priority: "high", progress: 67, eta: "2h 14m" },
              { id: "M-0043", name: "Codebase Refactor", agents: ["Forge","Nexus"], priority: "high", progress: 23, eta: "5h 40m" },
              { id: "M-0044", name: "Content Pipeline", agents: ["Echo","Relay"], priority: "medium", progress: 89, eta: "22m" },
              { id: "M-0047", name: "Legal Doc Review", agents: ["Prism"], priority: "critical", progress: 41, eta: "1h 55m" }
            ]},
            { label: "FINALIZING", colorKey: "statusOrange", items: [
              { id: "M-0041", name: "Quarterly Report", agents: ["Nexus","Echo"], priority: "high", progress: 95, eta: "8m" }
            ]},
            { label: "DONE", colorKey: "statusGreen", items: [
              { id: "M-0040", name: "API Integration Test", agents: ["Forge"], completedAt: "08:12 UTC" },
              { id: "M-0039", name: "User Research Digest", agents: ["Scout","Echo"], completedAt: "07:30 UTC" }
            ]}
          ]
        },
        {
          type: "mission-detail-panel",
          mission: {
            id: "M-0042",
            name: "Q2 Market Analysis",
            description: "Aggregate competitive intelligence across 14 market verticals, synthesize trends, produce executive brief.",
            status: "running",
            priority: "high",
            progress: 67,
            agents: ["Scout","Prism"],
            startedAt: "07:28 UTC",
            eta: "09:56 UTC",
            steps: [
              { label: "Data collection", status: "done", duration: "42m" },
              { label: "Source verification", status: "done", duration: "18m" },
              { label: "Trend synthesis", status: "running", duration: "ongoing" },
              { label: "Competitive gap analysis", status: "pending" },
              { label: "Executive brief generation", status: "pending" }
            ]
          }
        }
      ]
    },
    {
      id: "alerts",
      label: "Alerts",
      description: "Anomaly detection log with severity triage and agent-specific interventions",
      components: [
        {
          type: "ops-topbar",
          left: "ZENITH",
          leftVersion: "v2.4",
          centerLabel: "ALERT CENTER",
          centerBadge: { text: "3 ACTIVE", color: "statusOrange" },
          rightItems: ["Last scan: 12s ago"]
        },
        {
          type: "severity-summary",
          counts: [
            { label: "CRITICAL", value: 0, colorKey: "statusRed" },
            { label: "WARNING", value: 3, colorKey: "statusOrange" },
            { label: "INFO", value: 7, colorKey: "accent" },
            { label: "RESOLVED TODAY", value: 14, colorKey: "statusGreen" }
          ]
        },
        {
          type: "alert-log",
          alerts: [
            { id: "ALT-089", severity: "warning", agent: "Relay", title: "Elevated error rate", detail: "AG-07 reporting 4.2% error rate — above 2% threshold. Auto-throttle applied.", time: "09:31", status: "active", action: "Inspect" },
            { id: "ALT-088", severity: "warning", agent: "Forge", title: "Token budget at 78%", detail: "Daily allocation 78% consumed with 14h remaining.", time: "09:18", status: "active", action: "Adjust" },
            { id: "ALT-087", severity: "warning", agent: "Nexus", title: "Latency spike on M-0042", detail: "Orchestration latency spiked to 890ms (3× baseline) during Scout ↔ Prism handoff.", time: "08:54", status: "active", action: "Trace" },
            { id: "ALT-086", severity: "info", agent: "Vault", title: "Memory index rebuilt", detail: "Vector index for 'Q2-Research' rebuilt after 1,240 new entries.", time: "08:30", status: "resolved", action: null },
            { id: "ALT-085", severity: "info", agent: "System", title: "Model updated: Claude 3.5→3.6", detail: "Scout and Echo auto-migrated during maintenance window.", time: "03:00", status: "resolved", action: null }
          ]
        }
      ]
    },
    {
      id: "deploy",
      label: "Deploy",
      description: "New agent launcher — model selection, capability toggles, mission assignment",
      components: [
        {
          type: "ops-topbar",
          left: "ZENITH",
          leftVersion: "v2.4",
          centerLabel: "DEPLOY AGENT",
          rightItems: ["Slot available", "12 running"]
        },
        {
          type: "wizard-steps",
          steps: ["Identity", "Model", "Capabilities", "Launch"],
          currentStep: 1,
          style: "horizontal-stepper"
        },
        {
          type: "form-group",
          label: "AGENT IDENTITY",
          fields: [
            { type: "text", label: "Agent Name", placeholder: "e.g. Spectra", value: "Spectra" },
            { type: "text", label: "Role", placeholder: "e.g. Data Validator", value: "" },
            { type: "select", label: "Team", options: ["Research", "Engineering", "Ops", "Finance"], value: "Ops" }
          ]
        },
        {
          type: "radio-card-group",
          label: "FOUNDATION MODEL",
          options: [
            { id: "gpt4o", name: "GPT-4o", provider: "OpenAI", tags: ["Fast", "Versatile"], latency: "~280ms", cost: "$$" },
            { id: "claude36", name: "Claude 3.6", provider: "Anthropic", tags: ["Reasoning", "Long ctx"], latency: "~340ms", cost: "$$", selected: true },
            { id: "gemini15", name: "Gemini 1.5 Pro", provider: "Google", tags: ["Multimodal"], latency: "~410ms", cost: "$$$" },
            { id: "gpt4mini", name: "GPT-4o Mini", provider: "OpenAI", tags: ["Lightweight"], latency: "~140ms", cost: "$" }
          ]
        },
        {
          type: "toggle-grid",
          label: "CAPABILITIES",
          items: [
            { id: "web-search", label: "Web Search", enabled: true },
            { id: "code-exec", label: "Code Execution", enabled: false },
            { id: "file-io", label: "File I/O", enabled: true },
            { id: "memory", label: "Persistent Memory", enabled: true },
            { id: "vision", label: "Vision / Images", enabled: false },
            { id: "a2a", label: "Agent-to-Agent Comms", enabled: true }
          ]
        },
        {
          type: "cta-bar",
          primary: "Launch Agent →",
          secondary: "Save as Template"
        }
      ]
    },
    {
      id: "analytics",
      label: "Analytics",
      description: "Task throughput charts, token cost breakdown by agent, mission performance table",
      components: [
        {
          type: "ops-topbar",
          left: "ZENITH",
          leftVersion: "v2.4",
          centerLabel: "ANALYTICS",
          rightItems: ["Last 7 days", "Export CSV"]
        },
        {
          type: "kpi-row",
          items: [
            { label: "Total Tasks", value: "12,847", delta: "+18%", period: "vs last week" },
            { label: "Success Rate", value: "96.4%", delta: "+1.1pp", period: "vs last week" },
            { label: "Token Spend", value: "$124.80", delta: "+$12.40", period: "vs last week" },
            { label: "Fleet Uptime", value: "99.1%", delta: "−0.1pp", period: "vs last week" }
          ]
        },
        {
          type: "area-chart",
          label: "TASK THROUGHPUT — 7 DAYS",
          data: [
            { day: "Mon", tasks: 1420, success: 1368 },
            { day: "Tue", tasks: 1680, success: 1622 },
            { day: "Wed", tasks: 1540, success: 1487 },
            { day: "Thu", tasks: 1920, success: 1856 },
            { day: "Fri", tasks: 2100, success: 2030 },
            { day: "Sat", tasks: 980, success: 963 },
            { day: "Sun", tasks: 1230, success: 1187 }
          ],
          series: [
            { key: "tasks", colorKey: "accent", label: "Total tasks" },
            { key: "success", colorKey: "statusGreen", label: "Successful" }
          ]
        },
        {
          type: "bar-chart",
          label: "TOKEN COST BY AGENT",
          data: [
            { agent: "Prism", cost: 32.40, pct: 26 },
            { agent: "Nexus", cost: 24.10, pct: 19 },
            { agent: "Forge", cost: 21.80, pct: 18 },
            { agent: "Scout", cost: 18.30, pct: 15 },
            { agent: "Vault", cost: 12.60, pct: 10 },
            { agent: "Others", cost: 15.60, pct: 13 }
          ],
          orientation: "horizontal"
        },
        {
          type: "data-table",
          label: "TOP MISSIONS BY TASK COUNT",
          columns: ["Mission", "Agents", "Tasks", "Success", "Cost", "Status"],
          rows: [
            ["Q2 Market Analysis", "Scout, Prism", "847", "97.2%", "$14.30", "Running"],
            ["Codebase Refactor", "Forge, Nexus", "612", "94.8%", "$22.10", "Running"],
            ["Content Pipeline", "Echo, Relay", "1,204", "98.5%", "$8.70", "Finalizing"],
            ["Quarterly Report", "Nexus, Echo", "440", "96.1%", "$6.90", "Finalizing"]
          ]
        }
      ]
    }
  ]
};

fs.writeFileSync('/workspace/group/design-studio/zenith.pen', JSON.stringify(pen, null, 2));
console.log('✓ zenith.pen written —', pen.screens.length, 'screens');
