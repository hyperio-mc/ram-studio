// KITE — API health monitoring for dev teams
// Inspired by: Linear's pure-black + rounded grotesque dark UI (godly.website)
// Theme: DARK — near-black + burnt amber terminal accent
// Pencil.dev format v2.8

const fs = require('fs');

const pen = {
  name: "KITE",
  version: "2.8",
  metadata: {
    description: "Real-time API health monitoring for dev teams. 5 screens: Overview · Endpoints · Incident · Logs · Alerts.",
    theme: "dark",
    palette: "near-black #070709, amber #F97316, warm white #EEEAE2",
    archetype: "devtools-monitor",
    created: new Date().toISOString()
  },
  settings: {
    viewport: { width: 390, height: 844 },
    fontFamily: "Inter",
    borderRadius: 12,
    theme: {
      bg: "#070709",
      surface: "#0E0E14",
      surfaceAlt: "#141418",
      border: "rgba(238,234,226,0.08)",
      text: "#EEEAE2",
      textMuted: "rgba(238,234,226,0.42)",
      accent: "#F97316",
      accentDim: "rgba(249,115,22,0.15)",
      accentDimBorder: "rgba(249,115,22,0.3)",
      success: "#22C55E",
      successDim: "rgba(34,197,94,0.12)",
      warning: "#EAB308",
      warningDim: "rgba(234,179,8,0.12)",
      danger: "#EF4444",
      dangerDim: "rgba(239,68,68,0.12)"
    }
  },
  screens: [
    // ── SCREEN 1: OVERVIEW ────────────────────────────────────────────
    {
      id: "overview",
      label: "Overview",
      backgroundColor: "#070709",
      elements: [
        // Status bar
        {
          type: "statusbar",
          position: { x: 0, y: 0 },
          size: { width: 390, height: 44 },
          style: { backgroundColor: "#070709", time: "09:41", color: "#EEEAE2" }
        },
        // Nav header
        {
          type: "navbar",
          position: { x: 0, y: 44 },
          size: { width: 390, height: 52 },
          style: { backgroundColor: "#070709", borderBottom: "1px solid rgba(238,234,226,0.07)" },
          left: {
            type: "text",
            text: "KITE",
            style: { fontSize: 18, fontWeight: 700, color: "#F97316", letterSpacing: 3 }
          },
          right: {
            type: "row",
            items: [
              { type: "icon", name: "bell", size: 20, color: "#EEEAE2", badge: "2" },
              { type: "avatar", initials: "JK", size: 28, bg: "#F97316", color: "#070709" }
            ]
          }
        },
        // Big health score card
        {
          type: "card",
          position: { x: 20, y: 112 },
          size: { width: 350, height: 140 },
          style: {
            backgroundColor: "#0E0E14",
            borderRadius: 16,
            border: "1px solid rgba(249,115,22,0.2)"
          },
          children: [
            {
              type: "text",
              text: "SYSTEM HEALTH",
              position: { x: 20, y: 18 },
              style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
            },
            {
              type: "row",
              position: { x: 20, y: 40 },
              children: [
                {
                  type: "text",
                  text: "98.7",
                  style: { fontSize: 56, fontWeight: 800, color: "#EEEAE2", lineHeight: 1 }
                },
                {
                  type: "column",
                  style: { marginLeft: 12, marginTop: 14 },
                  children: [
                    { type: "text", text: "%", style: { fontSize: 22, fontWeight: 700, color: "rgba(238,234,226,0.5)" } },
                    { type: "pill", text: "▲ 0.3%", style: { fontSize: 10, backgroundColor: "rgba(34,197,94,0.15)", color: "#22C55E", borderRadius: 20, padding: "2px 8px", marginTop: 4 } }
                  ]
                }
              ]
            },
            {
              type: "text",
              text: "All systems operational · Last checked 12s ago",
              position: { x: 20, y: 108 },
              style: { fontSize: 11, color: "rgba(238,234,226,0.38)" }
            }
          ]
        },
        // 3 stat cards
        {
          type: "row",
          position: { x: 20, y: 268 },
          gap: 10,
          children: [
            {
              type: "card",
              size: { width: 107, height: 80 },
              style: { backgroundColor: "#0E0E14", borderRadius: 12, border: "1px solid rgba(238,234,226,0.07)" },
              children: [
                { type: "text", text: "ENDPOINTS", style: { fontSize: 9, fontWeight: 600, color: "rgba(238,234,226,0.38)", letterSpacing: 1.5 } },
                { type: "text", text: "47", style: { fontSize: 28, fontWeight: 800, color: "#EEEAE2", marginTop: 4 } },
                { type: "text", text: "monitored", style: { fontSize: 10, color: "rgba(238,234,226,0.38)" } }
              ]
            },
            {
              type: "card",
              size: { width: 107, height: 80 },
              style: { backgroundColor: "rgba(249,115,22,0.08)", borderRadius: 12, border: "1px solid rgba(249,115,22,0.25)" },
              children: [
                { type: "text", text: "INCIDENTS", style: { fontSize: 9, fontWeight: 600, color: "rgba(249,115,22,0.7)", letterSpacing: 1.5 } },
                { type: "text", text: "1", style: { fontSize: 28, fontWeight: 800, color: "#F97316", marginTop: 4 } },
                { type: "text", text: "active", style: { fontSize: 10, color: "rgba(249,115,22,0.6)" } }
              ]
            },
            {
              type: "card",
              size: { width: 107, height: 80 },
              style: { backgroundColor: "#0E0E14", borderRadius: 12, border: "1px solid rgba(238,234,226,0.07)" },
              children: [
                { type: "text", text: "P95 LATENCY", style: { fontSize: 9, fontWeight: 600, color: "rgba(238,234,226,0.38)", letterSpacing: 1.5 } },
                { type: "text", text: "142", style: { fontSize: 28, fontWeight: 800, color: "#EEEAE2", marginTop: 4 } },
                { type: "text", text: "ms avg", style: { fontSize: 10, color: "rgba(238,234,226,0.38)" } }
              ]
            }
          ]
        },
        // Section: Recent incidents
        {
          type: "text",
          text: "RECENT INCIDENTS",
          position: { x: 20, y: 366 },
          style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
        },
        // Incident row 1 — active
        {
          type: "card",
          position: { x: 20, y: 386 },
          size: { width: 350, height: 68 },
          style: { backgroundColor: "rgba(249,115,22,0.07)", borderRadius: 12, border: "1px solid rgba(249,115,22,0.2)" },
          children: [
            {
              type: "row",
              style: { padding: "14px 16px", alignItems: "center", justifyContent: "space-between" },
              children: [
                {
                  type: "row",
                  children: [
                    { type: "dot", size: 8, color: "#F97316", style: { marginTop: 2, animation: "pulse" } },
                    {
                      type: "column",
                      style: { marginLeft: 10 },
                      children: [
                        { type: "text", text: "POST /api/v2/payments", style: { fontSize: 13, fontWeight: 600, color: "#EEEAE2" } },
                        { type: "text", text: "High latency · 2,340ms P95", style: { fontSize: 11, color: "rgba(249,115,22,0.8)" } }
                      ]
                    }
                  ]
                },
                {
                  type: "column",
                  style: { alignItems: "flex-end" },
                  children: [
                    { type: "pill", text: "ACTIVE", style: { fontSize: 9, backgroundColor: "rgba(249,115,22,0.2)", color: "#F97316", borderRadius: 20, padding: "2px 7px", fontWeight: 700, letterSpacing: 1 } },
                    { type: "text", text: "14m ago", style: { fontSize: 10, color: "rgba(238,234,226,0.38)", marginTop: 4 } }
                  ]
                }
              ]
            }
          ]
        },
        // Incident row 2 — resolved
        {
          type: "card",
          position: { x: 20, y: 462 },
          size: { width: 350, height: 68 },
          style: { backgroundColor: "#0E0E14", borderRadius: 12, border: "1px solid rgba(238,234,226,0.07)" },
          children: [
            {
              type: "row",
              style: { padding: "14px 16px", alignItems: "center", justifyContent: "space-between" },
              children: [
                {
                  type: "row",
                  children: [
                    { type: "dot", size: 8, color: "#22C55E" },
                    {
                      type: "column",
                      style: { marginLeft: 10 },
                      children: [
                        { type: "text", text: "GET /api/users/bulk", style: { fontSize: 13, fontWeight: 600, color: "#EEEAE2" } },
                        { type: "text", text: "Timeout spike · Resolved", style: { fontSize: 11, color: "rgba(238,234,226,0.42)" } }
                      ]
                    }
                  ]
                },
                {
                  type: "column",
                  style: { alignItems: "flex-end" },
                  children: [
                    { type: "pill", text: "RESOLVED", style: { fontSize: 9, backgroundColor: "rgba(34,197,94,0.12)", color: "#22C55E", borderRadius: 20, padding: "2px 7px", fontWeight: 700, letterSpacing: 1 } },
                    { type: "text", text: "3h ago", style: { fontSize: 10, color: "rgba(238,234,226,0.38)", marginTop: 4 } }
                  ]
                }
              ]
            }
          ]
        },
        // Uptime bar chart label
        {
          type: "text",
          text: "30-DAY UPTIME",
          position: { x: 20, y: 548 },
          style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
        },
        // Uptime bar sparkline
        {
          type: "sparkline-bars",
          position: { x: 20, y: 566 },
          size: { width: 350, height: 28 },
          bars: 30,
          values: [1,1,1,1,1,1,1,1,1,1,1,1,1,0.4,1,1,1,1,1,1,1,1,0.7,1,1,1,1,1,1,0.8],
          colorMap: { 1: "#22C55E", 0.7: "#EAB308", 0.4: "#EF4444", 0.8: "#EAB308" },
          style: { borderRadius: 2, gap: 2 }
        },
        {
          type: "row",
          position: { x: 20, y: 600 },
          style: { justifyContent: "space-between", width: 350 },
          children: [
            { type: "text", text: "30 days ago", style: { fontSize: 10, color: "rgba(238,234,226,0.3)" } },
            { type: "text", text: "99.1% uptime", style: { fontSize: 10, color: "#22C55E", fontWeight: 600 } },
            { type: "text", text: "Today", style: { fontSize: 10, color: "rgba(238,234,226,0.3)" } }
          ]
        },
        // Bottom nav
        {
          type: "bottom-nav",
          position: { x: 0, y: 740 },
          size: { width: 390, height: 84 },
          style: { backgroundColor: "#0A0A0E", borderTop: "1px solid rgba(238,234,226,0.07)" },
          items: [
            { icon: "home", label: "Overview", active: true, color: "#F97316" },
            { icon: "activity", label: "Endpoints", active: false, color: "rgba(238,234,226,0.4)" },
            { icon: "alert", label: "Incidents", active: false, color: "rgba(238,234,226,0.4)", badge: "1" },
            { icon: "code", label: "Logs", active: false, color: "rgba(238,234,226,0.4)" },
            { icon: "settings", label: "Alerts", active: false, color: "rgba(238,234,226,0.4)" }
          ]
        }
      ]
    },

    // ── SCREEN 2: ENDPOINTS ──────────────────────────────────────────
    {
      id: "endpoints",
      label: "Endpoints",
      backgroundColor: "#070709",
      elements: [
        { type: "statusbar", position: { x: 0, y: 0 }, size: { width: 390, height: 44 }, style: { backgroundColor: "#070709", time: "09:41", color: "#EEEAE2" } },
        {
          type: "navbar",
          position: { x: 0, y: 44 },
          size: { width: 390, height: 52 },
          style: { backgroundColor: "#070709", borderBottom: "1px solid rgba(238,234,226,0.07)" },
          left: { type: "text", text: "Endpoints", style: { fontSize: 20, fontWeight: 700, color: "#EEEAE2" } },
          right: { type: "icon", name: "filter", size: 20, color: "rgba(238,234,226,0.6)" }
        },
        // Filter row
        {
          type: "row",
          position: { x: 20, y: 110 },
          gap: 8,
          children: [
            { type: "pill", text: "All  47", active: true, style: { fontSize: 12, backgroundColor: "#F97316", color: "#070709", borderRadius: 20, padding: "6px 14px", fontWeight: 700 } },
            { type: "pill", text: "Healthy  44", style: { fontSize: 12, backgroundColor: "#0E0E14", color: "rgba(238,234,226,0.6)", borderRadius: 20, padding: "6px 14px", border: "1px solid rgba(238,234,226,0.1)" } },
            { type: "pill", text: "Issues  3", style: { fontSize: 12, backgroundColor: "#0E0E14", color: "rgba(249,115,22,0.8)", borderRadius: 20, padding: "6px 14px", border: "1px solid rgba(249,115,22,0.2)" } }
          ]
        },
        // Search bar
        {
          type: "input",
          position: { x: 20, y: 150 },
          size: { width: 350, height: 42 },
          placeholder: "Search endpoints...",
          style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(238,234,226,0.1)", color: "#EEEAE2", fontSize: 14, paddingLeft: 40 },
          icon: { name: "search", color: "rgba(238,234,226,0.4)", position: "left" }
        },
        // Endpoint list — with status + latency inline
        ...[
          { method: "GET", path: "/api/v2/users", latency: "48ms", status: "healthy", p95: "72ms", rps: "1.2k" },
          { method: "POST", path: "/api/v2/payments", latency: "2340ms", status: "incident", p95: "2340ms", rps: "340" },
          { method: "GET", path: "/api/v2/products", latency: "61ms", status: "healthy", p95: "98ms", rps: "3.4k" },
          { method: "DELETE", path: "/api/v1/sessions", latency: "29ms", status: "healthy", p95: "41ms", rps: "88" },
          { method: "PUT", path: "/api/v2/orders/:id", latency: "310ms", status: "warning", p95: "480ms", rps: "201" },
          { method: "GET", path: "/api/v2/analytics", latency: "190ms", status: "healthy", p95: "240ms", rps: "520" }
        ].map((ep, i) => ({
          type: "card",
          position: { x: 20, y: 208 + i * 80 },
          size: { width: 350, height: 70 },
          style: {
            backgroundColor: ep.status === "incident" ? "rgba(249,115,22,0.07)" : "#0E0E14",
            borderRadius: 12,
            border: ep.status === "incident"
              ? "1px solid rgba(249,115,22,0.22)"
              : ep.status === "warning"
              ? "1px solid rgba(234,179,8,0.18)"
              : "1px solid rgba(238,234,226,0.07)"
          },
          children: [
            {
              type: "row",
              style: { padding: "12px 16px", alignItems: "center", justifyContent: "space-between" },
              children: [
                {
                  type: "row",
                  children: [
                    {
                      type: "pill",
                      text: ep.method,
                      style: {
                        fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                        backgroundColor: ep.method === "GET" ? "rgba(34,197,94,0.15)" : ep.method === "POST" ? "rgba(249,115,22,0.15)" : ep.method === "PUT" ? "rgba(234,179,8,0.15)" : "rgba(239,68,68,0.15)",
                        color: ep.method === "GET" ? "#22C55E" : ep.method === "POST" ? "#F97316" : ep.method === "PUT" ? "#EAB308" : "#EF4444",
                        borderRadius: 4, padding: "3px 7px", marginRight: 10, minWidth: 44, textAlign: "center"
                      }
                    },
                    {
                      type: "column",
                      children: [
                        { type: "text", text: ep.path, style: { fontSize: 13, fontWeight: 600, color: "#EEEAE2", fontFamily: "monospace" } },
                        { type: "text", text: `P95 ${ep.p95} · ${ep.rps} req/s`, style: { fontSize: 11, color: "rgba(238,234,226,0.42)", marginTop: 2 } }
                      ]
                    }
                  ]
                },
                {
                  type: "column",
                  style: { alignItems: "flex-end" },
                  children: [
                    {
                      type: "text",
                      text: ep.latency,
                      style: {
                        fontSize: 14, fontWeight: 700,
                        color: ep.status === "incident" ? "#F97316" : ep.status === "warning" ? "#EAB308" : "#22C55E"
                      }
                    },
                    {
                      type: "dot",
                      size: 7,
                      color: ep.status === "incident" ? "#F97316" : ep.status === "warning" ? "#EAB308" : "#22C55E",
                      style: { marginTop: 6, alignSelf: "flex-end" }
                    }
                  ]
                }
              ]
            }
          ]
        })),
        { type: "bottom-nav", position: { x: 0, y: 740 }, size: { width: 390, height: 84 }, style: { backgroundColor: "#0A0A0E", borderTop: "1px solid rgba(238,234,226,0.07)" }, items: [{ icon: "home", label: "Overview", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "activity", label: "Endpoints", active: true, color: "#F97316" }, { icon: "alert", label: "Incidents", active: false, color: "rgba(238,234,226,0.4)", badge: "1" }, { icon: "code", label: "Logs", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "settings", label: "Alerts", active: false, color: "rgba(238,234,226,0.4)" }] }
      ]
    },

    // ── SCREEN 3: INCIDENT DETAIL ────────────────────────────────────
    {
      id: "incident",
      label: "Incident",
      backgroundColor: "#070709",
      elements: [
        { type: "statusbar", position: { x: 0, y: 0 }, size: { width: 390, height: 44 }, style: { backgroundColor: "#070709", time: "09:41", color: "#EEEAE2" } },
        {
          type: "navbar",
          position: { x: 0, y: 44 },
          size: { width: 390, height: 52 },
          style: { backgroundColor: "#070709", borderBottom: "1px solid rgba(238,234,226,0.07)" },
          left: { type: "back-button", color: "#F97316" },
          center: { type: "text", text: "Incident #1042", style: { fontSize: 16, fontWeight: 700, color: "#EEEAE2" } }
        },
        // Status banner
        {
          type: "card",
          position: { x: 20, y: 112 },
          size: { width: 350, height: 90 },
          style: { backgroundColor: "rgba(249,115,22,0.1)", borderRadius: 14, border: "1px solid rgba(249,115,22,0.3)" },
          children: [
            { type: "row", style: { padding: "16px", alignItems: "center" }, children: [
              { type: "icon-circle", icon: "alert", bg: "rgba(249,115,22,0.2)", color: "#F97316", size: 42 },
              { type: "column", style: { marginLeft: 14 }, children: [
                { type: "text", text: "High Latency — Critical", style: { fontSize: 16, fontWeight: 700, color: "#F97316" } },
                { type: "text", text: "POST /api/v2/payments", style: { fontSize: 13, color: "#EEEAE2", fontFamily: "monospace", marginTop: 2 } },
                { type: "text", text: "Active for 14 minutes", style: { fontSize: 11, color: "rgba(249,115,22,0.7)", marginTop: 2 } }
              ]}
            ]}
          ]
        },
        // Latency chart (simulated)
        {
          type: "text",
          text: "LATENCY OVER TIME",
          position: { x: 20, y: 220 },
          style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
        },
        {
          type: "card",
          position: { x: 20, y: 238 },
          size: { width: 350, height: 110 },
          style: { backgroundColor: "#0E0E14", borderRadius: 12, border: "1px solid rgba(238,234,226,0.07)" },
          children: [
            {
              type: "line-chart",
              position: { x: 16, y: 16 },
              size: { width: 318, height: 78 },
              data: [120, 130, 125, 140, 135, 180, 400, 890, 1400, 2100, 2340, 2280, 2310],
              thresholdY: 500,
              style: {
                lineColor: "#F97316",
                lineWidth: 2,
                fillColor: "rgba(249,115,22,0.12)",
                thresholdLineColor: "rgba(249,115,22,0.3)",
                dotColor: "#F97316",
                gridColor: "rgba(238,234,226,0.06)"
              },
              yAxis: { labels: ["0", "1k", "2k"], color: "rgba(238,234,226,0.35)", fontSize: 9 }
            }
          ]
        },
        // Metrics row
        {
          type: "row",
          position: { x: 20, y: 364 },
          gap: 10,
          children: [
            { type: "card", size: { width: 105, height: 64 }, style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(238,234,226,0.07)" }, children: [{ type: "text", text: "P50", style: { fontSize: 9, color: "rgba(238,234,226,0.4)", letterSpacing: 1.5, fontWeight: 600 } }, { type: "text", text: "1,840ms", style: { fontSize: 16, fontWeight: 700, color: "#F97316", marginTop: 4 } }] },
            { type: "card", size: { width: 105, height: 64 }, style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(238,234,226,0.07)" }, children: [{ type: "text", text: "P95", style: { fontSize: 9, color: "rgba(238,234,226,0.4)", letterSpacing: 1.5, fontWeight: 600 } }, { type: "text", text: "2,340ms", style: { fontSize: 16, fontWeight: 700, color: "#F97316", marginTop: 4 } }] },
            { type: "card", size: { width: 105, height: 64 }, style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(238,234,226,0.07)" }, children: [{ type: "text", text: "ERROR %", style: { fontSize: 9, color: "rgba(238,234,226,0.4)", letterSpacing: 1.5, fontWeight: 600 } }, { type: "text", text: "0.4%", style: { fontSize: 16, fontWeight: 700, color: "#EAB308", marginTop: 4 } }] }
          ]
        },
        // Timeline
        {
          type: "text",
          text: "INCIDENT TIMELINE",
          position: { x: 20, y: 444 },
          style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
        },
        ...[
          { time: "09:27", label: "Incident opened", sub: "Latency threshold exceeded (>2000ms)", color: "#F97316", first: true },
          { time: "09:29", label: "Alert sent", sub: "PagerDuty + Slack #backend-alerts", color: "#EAB308" },
          { time: "09:33", label: "Assigned to @jkumar", sub: "Auto-assigned via on-call schedule", color: "rgba(238,234,226,0.5)" },
          { time: "09:38", label: "Investigation started", sub: "DB connection pool at 96% capacity", color: "rgba(238,234,226,0.5)" }
        ].map((ev, i) => ({
          type: "timeline-item",
          position: { x: 20, y: 464 + i * 64 },
          size: { width: 350, height: 60 },
          time: ev.time,
          label: ev.label,
          sub: ev.sub,
          dotColor: ev.color,
          lineColor: "rgba(238,234,226,0.1)",
          isFirst: ev.first,
          style: { fontSize: 13, color: "#EEEAE2", subColor: "rgba(238,234,226,0.45)", subFontSize: 11 }
        })),
        { type: "bottom-nav", position: { x: 0, y: 740 }, size: { width: 390, height: 84 }, style: { backgroundColor: "#0A0A0E", borderTop: "1px solid rgba(238,234,226,0.07)" }, items: [{ icon: "home", label: "Overview", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "activity", label: "Endpoints", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "alert", label: "Incidents", active: true, color: "#F97316", badge: "1" }, { icon: "code", label: "Logs", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "settings", label: "Alerts", active: false, color: "rgba(238,234,226,0.4)" }] }
      ]
    },

    // ── SCREEN 4: LOGS ───────────────────────────────────────────────
    {
      id: "logs",
      label: "Logs",
      backgroundColor: "#070709",
      elements: [
        { type: "statusbar", position: { x: 0, y: 0 }, size: { width: 390, height: 44 }, style: { backgroundColor: "#070709", time: "09:41", color: "#EEEAE2" } },
        {
          type: "navbar",
          position: { x: 0, y: 44 },
          size: { width: 390, height: 52 },
          style: { backgroundColor: "#070709", borderBottom: "1px solid rgba(238,234,226,0.07)" },
          left: { type: "text", text: "Request Logs", style: { fontSize: 20, fontWeight: 700, color: "#EEEAE2" } },
          right: { type: "pill", text: "● LIVE", style: { fontSize: 10, backgroundColor: "rgba(34,197,94,0.15)", color: "#22C55E", borderRadius: 20, padding: "4px 10px", fontWeight: 700, letterSpacing: 1 } }
        },
        // Filter bar
        {
          type: "row",
          position: { x: 20, y: 110 },
          gap: 8,
          children: [
            { type: "pill", text: "All", active: true, style: { fontSize: 12, backgroundColor: "#F97316", color: "#070709", borderRadius: 20, padding: "6px 14px", fontWeight: 700 } },
            { type: "pill", text: "2xx", style: { fontSize: 12, backgroundColor: "#0E0E14", color: "#22C55E", borderRadius: 20, padding: "6px 14px", border: "1px solid rgba(34,197,94,0.2)" } },
            { type: "pill", text: "4xx", style: { fontSize: 12, backgroundColor: "#0E0E14", color: "#EAB308", borderRadius: 20, padding: "6px 14px", border: "1px solid rgba(234,179,8,0.2)" } },
            { type: "pill", text: "5xx", style: { fontSize: 12, backgroundColor: "#0E0E14", color: "#EF4444", borderRadius: 20, padding: "6px 14px", border: "1px solid rgba(239,68,68,0.2)" } }
          ]
        },
        // Log entries — monospace terminal style
        ...[
          { time: "09:41:18", method: "GET", path: "/api/v2/users", status: 200, latency: "48ms", ip: "103.24.x.x" },
          { time: "09:41:17", method: "POST", path: "/api/v2/payments", status: 200, latency: "2340ms", ip: "91.108.x.x", slow: true },
          { time: "09:41:17", method: "GET", path: "/api/v2/products", status: 200, latency: "61ms", ip: "172.16.x.x" },
          { time: "09:41:16", method: "POST", path: "/api/v2/payments", status: 200, latency: "2280ms", ip: "103.24.x.x", slow: true },
          { time: "09:41:15", method: "GET", path: "/api/v2/users/me", status: 401, latency: "12ms", ip: "45.55.x.x", error: true },
          { time: "09:41:15", method: "DELETE", path: "/api/v1/sessions", status: 204, latency: "29ms", ip: "103.24.x.x" },
          { time: "09:41:14", method: "PUT", path: "/api/v2/orders/9281", status: 200, latency: "310ms", ip: "172.16.x.x", warn: true },
          { time: "09:41:14", method: "GET", path: "/api/v2/analytics", status: 200, latency: "190ms", ip: "91.108.x.x" }
        ].map((log, i) => ({
          type: "card",
          position: { x: 0, y: 148 + i * 68 },
          size: { width: 390, height: 60 },
          style: {
            backgroundColor: log.slow ? "rgba(249,115,22,0.05)" : log.error ? "rgba(239,68,68,0.05)" : "transparent",
            borderRadius: 0,
            borderBottom: "1px solid rgba(238,234,226,0.05)"
          },
          children: [
            {
              type: "row",
              style: { padding: "10px 20px", alignItems: "center" },
              children: [
                {
                  type: "pill",
                  text: String(log.status),
                  style: {
                    fontSize: 10, fontWeight: 700, fontFamily: "monospace",
                    backgroundColor: log.status >= 500 ? "rgba(239,68,68,0.15)" : log.status >= 400 ? "rgba(234,179,8,0.15)" : "rgba(34,197,94,0.12)",
                    color: log.status >= 500 ? "#EF4444" : log.status >= 400 ? "#EAB308" : "#22C55E",
                    borderRadius: 4, padding: "2px 6px", minWidth: 34, textAlign: "center"
                  }
                },
                {
                  type: "pill",
                  text: log.method,
                  style: {
                    fontSize: 9, fontWeight: 600, fontFamily: "monospace",
                    backgroundColor: "transparent", color: "rgba(238,234,226,0.5)",
                    marginLeft: 8, minWidth: 44
                  }
                },
                {
                  type: "column",
                  style: { flex: 1, marginLeft: 4 },
                  children: [
                    { type: "text", text: log.path, style: { fontSize: 12, fontFamily: "monospace", color: "#EEEAE2", fontWeight: 500 } },
                    { type: "text", text: `${log.time} · ${log.ip}`, style: { fontSize: 10, color: "rgba(238,234,226,0.3)", fontFamily: "monospace" } }
                  ]
                },
                {
                  type: "text",
                  text: log.latency,
                  style: {
                    fontSize: 12, fontWeight: 700, fontFamily: "monospace",
                    color: log.slow ? "#F97316" : log.warn ? "#EAB308" : "rgba(238,234,226,0.55)"
                  }
                }
              ]
            }
          ]
        })),
        { type: "bottom-nav", position: { x: 0, y: 740 }, size: { width: 390, height: 84 }, style: { backgroundColor: "#0A0A0E", borderTop: "1px solid rgba(238,234,226,0.07)" }, items: [{ icon: "home", label: "Overview", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "activity", label: "Endpoints", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "alert", label: "Incidents", active: false, color: "rgba(238,234,226,0.4)", badge: "1" }, { icon: "code", label: "Logs", active: true, color: "#F97316" }, { icon: "settings", label: "Alerts", active: false, color: "rgba(238,234,226,0.4)" }] }
      ]
    },

    // ── SCREEN 5: ALERT RULES ────────────────────────────────────────
    {
      id: "alerts",
      label: "Alerts",
      backgroundColor: "#070709",
      elements: [
        { type: "statusbar", position: { x: 0, y: 0 }, size: { width: 390, height: 44 }, style: { backgroundColor: "#070709", time: "09:41", color: "#EEEAE2" } },
        {
          type: "navbar",
          position: { x: 0, y: 44 },
          size: { width: 390, height: 52 },
          style: { backgroundColor: "#070709", borderBottom: "1px solid rgba(238,234,226,0.07)" },
          left: { type: "text", text: "Alert Rules", style: { fontSize: 20, fontWeight: 700, color: "#EEEAE2" } },
          right: { type: "button", text: "+ New Rule", style: { fontSize: 12, backgroundColor: "#F97316", color: "#070709", borderRadius: 20, padding: "6px 14px", fontWeight: 700 } }
        },
        // Channels
        {
          type: "text",
          text: "NOTIFICATION CHANNELS",
          position: { x: 20, y: 112 },
          style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
        },
        {
          type: "row",
          position: { x: 20, y: 130 },
          gap: 10,
          children: [
            { type: "card", size: { width: 104, height: 64 }, style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(34,197,94,0.25)" }, children: [{ type: "icon", name: "message", color: "#22C55E", size: 18 }, { type: "text", text: "Slack", style: { fontSize: 12, fontWeight: 600, color: "#EEEAE2", marginTop: 4 } }, { type: "text", text: "Connected", style: { fontSize: 10, color: "#22C55E" } }] },
            { type: "card", size: { width: 104, height: 64 }, style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(34,197,94,0.25)" }, children: [{ type: "icon", name: "bell", color: "#22C55E", size: 18 }, { type: "text", text: "PagerDuty", style: { fontSize: 12, fontWeight: 600, color: "#EEEAE2", marginTop: 4 } }, { type: "text", text: "Connected", style: { fontSize: 10, color: "#22C55E" } }] },
            { type: "card", size: { width: 104, height: 64 }, style: { backgroundColor: "#0E0E14", borderRadius: 10, border: "1px solid rgba(238,234,226,0.08)" }, children: [{ type: "icon", name: "share", color: "rgba(238,234,226,0.4)", size: 18 }, { type: "text", text: "Webhook", style: { fontSize: 12, fontWeight: 600, color: "rgba(238,234,226,0.6)", marginTop: 4 } }, { type: "text", text: "Add", style: { fontSize: 10, color: "rgba(238,234,226,0.35)" } }] }
          ]
        },
        // Rules list
        {
          type: "text",
          text: "ACTIVE RULES",
          position: { x: 20, y: 210 },
          style: { fontSize: 10, fontWeight: 600, color: "rgba(238,234,226,0.42)", letterSpacing: 2 }
        },
        ...[
          { name: "Latency Critical", condition: "P95 > 2000ms", scope: "All endpoints", severity: "critical", enabled: true },
          { name: "Latency Warning", condition: "P95 > 500ms", scope: "All endpoints", severity: "warning", enabled: true },
          { name: "Error Rate Spike", condition: "5xx > 1%", scope: "All endpoints", severity: "critical", enabled: true },
          { name: "Uptime Drop", condition: "Uptime < 99%", scope: "Production", severity: "critical", enabled: true },
          { name: "High Traffic", condition: "RPS > 10,000", scope: "/api/v2/users", severity: "info", enabled: false }
        ].map((rule, i) => ({
          type: "card",
          position: { x: 20, y: 228 + i * 86 },
          size: { width: 350, height: 78 },
          style: { backgroundColor: "#0E0E14", borderRadius: 12, border: "1px solid rgba(238,234,226,0.07)", opacity: rule.enabled ? 1 : 0.5 },
          children: [
            {
              type: "row",
              style: { padding: "14px 16px", alignItems: "center", justifyContent: "space-between" },
              children: [
                {
                  type: "row",
                  children: [
                    {
                      type: "dot",
                      size: 8,
                      color: rule.severity === "critical" ? "#EF4444" : rule.severity === "warning" ? "#EAB308" : "#22C55E",
                      style: { marginTop: 3 }
                    },
                    {
                      type: "column",
                      style: { marginLeft: 12 },
                      children: [
                        { type: "text", text: rule.name, style: { fontSize: 14, fontWeight: 600, color: "#EEEAE2" } },
                        { type: "text", text: `${rule.condition} · ${rule.scope}`, style: { fontSize: 11, color: "rgba(238,234,226,0.45)", marginTop: 3, fontFamily: "monospace" } }
                      ]
                    }
                  ]
                },
                {
                  type: "toggle",
                  checked: rule.enabled,
                  style: {
                    bg: rule.enabled ? "#F97316" : "rgba(238,234,226,0.15)",
                    knob: "#EEEAE2"
                  }
                }
              ]
            }
          ]
        })),
        { type: "bottom-nav", position: { x: 0, y: 740 }, size: { width: 390, height: 84 }, style: { backgroundColor: "#0A0A0E", borderTop: "1px solid rgba(238,234,226,0.07)" }, items: [{ icon: "home", label: "Overview", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "activity", label: "Endpoints", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "alert", label: "Incidents", active: false, color: "rgba(238,234,226,0.4)", badge: "1" }, { icon: "code", label: "Logs", active: false, color: "rgba(238,234,226,0.4)" }, { icon: "settings", label: "Alerts", active: true, color: "#F97316" }] }
      ]
    }
  ]
};

fs.writeFileSync('kite.pen', JSON.stringify(pen, null, 2));
console.log('✓ kite.pen written —', pen.screens.length, 'screens');
console.log('  Theme: dark · near-black + amber terminal accent');
console.log('  Screens:', pen.screens.map(s => s.label).join(' · '));
