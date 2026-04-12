const fs = require('fs');

const pen = {
  version: "2.8",
  name: "ARCA",
  description: "Agent Run Control & Analytics — light-theme AI pipeline monitor",
  settings: {
    fontFamily: "Inter",
    fontSize: 14,
    deviceFrame: "iphone15pro"
  },
  screens: [
    // ─── SCREEN 1: OVERVIEW DASHBOARD ───────────────────────────────
    {
      id: "overview",
      name: "Overview",
      backgroundColor: "#F4F1EC",
      statusBarStyle: "dark",
      elements: [
        // Header
        { type: "rectangle", x: 0, y: 0, width: 390, height: 96,
          fill: "#F4F1EC", opacity: 1 },
        { type: "text", x: 20, y: 56, width: 200, height: 20,
          content: "ARCA", fontSize: 11, fontWeight: "500",
          color: "#888070", letterSpacing: 4 },
        { type: "text", x: 20, y: 76, width: 300, height: 28,
          content: "Agent Control", fontSize: 22, fontWeight: "700",
          color: "#1A1714" },
        // Status pill
        { type: "rectangle", x: 310, y: 78, width: 60, height: 22,
          fill: "#D8F3D8", cornerRadius: 11 },
        { type: "text", x: 316, y: 82, width: 48, height: 14,
          content: "● LIVE", fontSize: 10, fontWeight: "600",
          color: "#1E7A1E", letterSpacing: 0.5 },

        // ── Metric cards row 1 ──
        // Active Runs
        { type: "rectangle", x: 16, y: 116, width: 109, height: 90,
          fill: "#FFFFFF", cornerRadius: 16,
          shadow: { color: "rgba(26,23,20,0.06)", blur: 12, x: 0, y: 4 } },
        { type: "text", x: 28, y: 132, width: 85, height: 12,
          content: "ACTIVE RUNS", fontSize: 9, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        { type: "text", x: 28, y: 152, width: 80, height: 36,
          content: "12", fontSize: 32, fontWeight: "800", color: "#1A1714" },
        { type: "text", x: 28, y: 190, width: 85, height: 12,
          content: "↑ 3 from 1h ago", fontSize: 9, color: "#2B8A3E" },

        // Avg Latency
        { type: "rectangle", x: 141, y: 116, width: 109, height: 90,
          fill: "#FFFFFF", cornerRadius: 16,
          shadow: { color: "rgba(26,23,20,0.06)", blur: 12, x: 0, y: 4 } },
        { type: "text", x: 153, y: 132, width: 85, height: 12,
          content: "AVG LATENCY", fontSize: 9, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        { type: "text", x: 153, y: 152, width: 80, height: 36,
          content: "1.4s", fontSize: 28, fontWeight: "800", color: "#1A1714" },
        { type: "text", x: 153, y: 190, width: 85, height: 12,
          content: "→ stable", fontSize: 9, color: "#9A8E82" },

        // Success rate
        { type: "rectangle", x: 266, y: 116, width: 109, height: 90,
          fill: "#FFFFFF", cornerRadius: 16,
          shadow: { color: "rgba(26,23,20,0.06)", blur: 12, x: 0, y: 4 } },
        { type: "text", x: 278, y: 132, width: 85, height: 12,
          content: "SUCCESS", fontSize: 9, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        { type: "text", x: 278, y: 152, width: 80, height: 36,
          content: "97%", fontSize: 28, fontWeight: "800", color: "#2254C8" },
        { type: "text", x: 278, y: 190, width: 85, height: 12,
          content: "↑ 2% today", fontSize: 9, color: "#2B8A3E" },

        // ── Pipeline Activity bar chart ──
        { type: "rectangle", x: 16, y: 224, width: 358, height: 148,
          fill: "#FFFFFF", cornerRadius: 16,
          shadow: { color: "rgba(26,23,20,0.06)", blur: 12, x: 0, y: 4 } },
        { type: "text", x: 28, y: 238, width: 200, height: 14,
          content: "PIPELINE ACTIVITY", fontSize: 10, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        { type: "text", x: 28, y: 254, width: 200, height: 18,
          content: "Runs / hour", fontSize: 13, fontWeight: "600", color: "#1A1714" },
        // Bars
        ...[
          [28, 72], [48, 54], [68, 88], [88, 64], [108, 96],
          [128, 78], [148, 92], [168, 60], [188, 110], [208, 84],
          [228, 100], [248, 70], [268, 88], [288, 95], [308, 68]
        ].map(([xOff, barH], i) => ({
          type: "rectangle",
          x: 28 + xOff, y: 340 - barH, width: 14, height: barH,
          fill: i === 14 ? "#2254C8" : "#E8E4DC",
          cornerRadius: 4,
          opacity: 1
        })),
        // x-axis labels
        { type: "text", x: 28, y: 348, width: 40, height: 10,
          content: "09:00", fontSize: 8, color: "#B0A898" },
        { type: "text", x: 170, y: 348, width: 40, height: 10,
          content: "13:00", fontSize: 8, color: "#B0A898" },
        { type: "text", x: 318, y: 348, width: 40, height: 10,
          content: "NOW", fontSize: 8, fontWeight: "600", color: "#2254C8" },

        // ── Tool calls today ──
        { type: "rectangle", x: 16, y: 390, width: 358, height: 68,
          fill: "#2254C8", cornerRadius: 16 },
        { type: "text", x: 28, y: 404, width: 200, height: 14,
          content: "TOOL CALLS TODAY", fontSize: 10, fontWeight: "600",
          color: "rgba(255,255,255,0.6)", letterSpacing: 1.5 },
        { type: "text", x: 28, y: 422, width: 180, height: 24,
          content: "14,830 executions", fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
        { type: "text", x: 270, y: 406, width: 90, height: 42,
          content: "↑ 18%\nvs yesterday", fontSize: 11, fontWeight: "500",
          color: "rgba(255,255,255,0.75)", textAlign: "right" },

        // ── Recent agent runs ──
        { type: "text", x: 20, y: 478, width: 200, height: 14,
          content: "RECENT RUNS", fontSize: 10, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },

        ...[
          { ref: "ARK-00841", agent: "ResearchBot", steps: "8 steps", status: "done", statusColor: "#2B8A3E", statusBg: "#D8F3D8", dur: "1.2s" },
          { ref: "ARK-00840", agent: "CodeReview", steps: "12 steps", status: "running", statusColor: "#2254C8", statusBg: "#DCE9FF", dur: "—" },
          { ref: "ARK-00839", agent: "DataSync", steps: "5 steps", status: "error", statusColor: "#C0392B", statusBg: "#FDDEDE", dur: "0.8s" },
        ].flatMap((run, i) => {
          const y = 502 + i * 66;
          return [
            { type: "rectangle", x: 16, y, width: 358, height: 56,
              fill: "#FFFFFF", cornerRadius: 14,
              shadow: { color: "rgba(26,23,20,0.05)", blur: 8, x: 0, y: 2 } },
            { type: "text", x: 28, y: y + 10, width: 200, height: 12,
              content: run.ref, fontSize: 10, fontWeight: "600",
              color: "#9A8E82", letterSpacing: 1.2 },
            { type: "text", x: 28, y: y + 26, width: 200, height: 16,
              content: run.agent, fontSize: 14, fontWeight: "600", color: "#1A1714" },
            { type: "text", x: 28, y: y + 44, width: 200, height: 10,
              content: run.steps, fontSize: 9, color: "#B0A898" },
            // Status badge
            { type: "rectangle", x: 272, y: y + 8, width: 60, height: 20,
              fill: run.statusBg, cornerRadius: 10 },
            { type: "text", x: 280, y: y + 12, width: 52, height: 12,
              content: run.status.toUpperCase(), fontSize: 9, fontWeight: "600",
              color: run.statusColor },
            { type: "text", x: 340, y: y + 30, width: 26, height: 12,
              content: run.dur, fontSize: 10, color: "#9A8E82", textAlign: "right" },
          ];
        }),

        // ── Bottom Nav ──
        { type: "rectangle", x: 0, y: 706, width: 390, height: 82,
          fill: "#FFFFFF", opacity: 0.96 },
        { type: "rectangle", x: 0, y: 706, width: 390, height: 1, fill: "#E8E4DC" },
        ...["◈ Home", "⎇ Flows", "⊕ Runs", "⚙ Config"].map((label, i) => ({
          type: "text", x: 18 + i * 90, y: 724, width: 80, height: 14,
          content: label, fontSize: 10, fontWeight: i === 0 ? "700" : "500",
          color: i === 0 ? "#2254C8" : "#B0A898",
          textAlign: "center"
        })),
      ]
    },

    // ─── SCREEN 2: PIPELINE FLOW VIEW ──────────────────────────────
    {
      id: "pipeline",
      name: "Pipeline",
      backgroundColor: "#F4F1EC",
      statusBarStyle: "dark",
      elements: [
        // Header
        { type: "rectangle", x: 0, y: 0, width: 390, height: 96,
          fill: "#F4F1EC" },
        { type: "text", x: 20, y: 56, width: 200, height: 14,
          content: "ARK-00841", fontSize: 11, fontWeight: "500",
          color: "#888070", letterSpacing: 3 },
        { type: "text", x: 20, y: 74, width: 280, height: 24,
          content: "ResearchBot Pipeline", fontSize: 20, fontWeight: "700",
          color: "#1A1714" },
        // Duration badge
        { type: "rectangle", x: 316, y: 76, width: 58, height: 22,
          fill: "#D8F3D8", cornerRadius: 11 },
        { type: "text", x: 322, y: 80, width: 46, height: 14,
          content: "1.2s", fontSize: 11, fontWeight: "700", color: "#1E7A1E" },

        // ── Step timeline ──
        // Vertical guide line
        { type: "rectangle", x: 45, y: 112, width: 2, height: 500,
          fill: "#DDD8D0" },

        // Steps
        ...[
          { n: "01", label: "PLAN", tool: "think()", status: "done", dur: "0.09s", detail: "Decomposed query into 4 sub-tasks", color: "#2254C8" },
          { n: "02", label: "SEARCH", tool: "web_search()", status: "done", dur: "0.24s", detail: "Found 12 relevant sources", color: "#2254C8" },
          { n: "03", label: "FETCH", tool: "read_url()", status: "done", dur: "0.31s", detail: "Extracted content from top 3 URLs", color: "#2254C8" },
          { n: "04", label: "SUMMARIZE", tool: "llm_call()", status: "done", dur: "0.38s", detail: "Generated 320-word synthesis", color: "#2254C8" },
          { n: "05", label: "VERIFY", tool: "fact_check()", status: "done", dur: "0.12s", detail: "Cross-referenced 6 claims", color: "#2254C8" },
          { n: "06", label: "FORMAT", tool: "render_md()", status: "done", dur: "0.06s", detail: "Markdown output with citations", color: "#2254C8" },
        ].flatMap((step, i) => {
          const y = 116 + i * 88;
          return [
            // Circle node
            { type: "ellipse", x: 33, y: y + 8, width: 24, height: 24,
              fill: "#2254C8" },
            { type: "text", x: 34, y: y + 11, width: 22, height: 14,
              content: step.n, fontSize: 9, fontWeight: "700",
              color: "#FFFFFF", textAlign: "center" },
            // Card
            { type: "rectangle", x: 72, y, width: 302, height: 72,
              fill: "#FFFFFF", cornerRadius: 14,
              shadow: { color: "rgba(26,23,20,0.06)", blur: 10, x: 0, y: 3 } },
            { type: "text", x: 84, y: y + 10, width: 120, height: 12,
              content: step.label, fontSize: 10, fontWeight: "700",
              color: "#1A1714", letterSpacing: 1.5 },
            // Tool chip
            { type: "rectangle", x: 220, y: y + 8, width: 100, height: 18,
              fill: "#EEF2FF", cornerRadius: 9 },
            { type: "text", x: 224, y: y + 11, width: 92, height: 12,
              content: step.tool, fontSize: 9, fontWeight: "600",
              color: "#2254C8" },
            { type: "text", x: 84, y: y + 28, width: 270, height: 28,
              content: step.detail, fontSize: 11, color: "#666056",
              lineHeight: 1.4 },
            { type: "text", x: 84, y: y + 56, width: 60, height: 10,
              content: step.dur, fontSize: 9, color: "#B0A898" },
            // checkmark
            { type: "text", x: 340, y: y + 56, width: 24, height: 10,
              content: "✓", fontSize: 10, color: "#2B8A3E", textAlign: "right" },
          ];
        }),

        // ── Bottom Nav ──
        { type: "rectangle", x: 0, y: 706, width: 390, height: 82,
          fill: "#FFFFFF", opacity: 0.96 },
        { type: "rectangle", x: 0, y: 706, width: 390, height: 1, fill: "#E8E4DC" },
        ...["◈ Home", "⎇ Flows", "⊕ Runs", "⚙ Config"].map((label, i) => ({
          type: "text", x: 18 + i * 90, y: 724, width: 80, height: 14,
          content: label, fontSize: 10, fontWeight: i === 1 ? "700" : "500",
          color: i === 1 ? "#2254C8" : "#B0A898",
          textAlign: "center"
        })),
      ]
    },

    // ─── SCREEN 3: TOOL INVENTORY ────────────────────────────────────
    {
      id: "tools",
      name: "Tools",
      backgroundColor: "#F4F1EC",
      statusBarStyle: "dark",
      elements: [
        { type: "rectangle", x: 0, y: 0, width: 390, height: 96, fill: "#F4F1EC" },
        { type: "text", x: 20, y: 56, width: 200, height: 14,
          content: "INVENTORY", fontSize: 11, fontWeight: "500",
          color: "#888070", letterSpacing: 4 },
        { type: "text", x: 20, y: 74, width: 280, height: 24,
          content: "Tool Registry", fontSize: 22, fontWeight: "700", color: "#1A1714" },

        // Search bar
        { type: "rectangle", x: 16, y: 108, width: 358, height: 40,
          fill: "#FFFFFF", cornerRadius: 12,
          shadow: { color: "rgba(26,23,20,0.04)", blur: 8, x: 0, y: 2 } },
        { type: "text", x: 32, y: 120, width: 300, height: 16,
          content: "⌕ Search tools...", fontSize: 13, color: "#B0A898" },

        // Column headers
        { type: "rectangle", x: 16, y: 160, width: 358, height: 28,
          fill: "rgba(34,84,200,0.06)", cornerRadius: 8 },
        { type: "text", x: 28, y: 168, width: 130, height: 12,
          content: "TOOL", fontSize: 9, fontWeight: "700",
          color: "#2254C8", letterSpacing: 1.5 },
        { type: "text", x: 196, y: 168, width: 60, height: 12,
          content: "CALLS", fontSize: 9, fontWeight: "700",
          color: "#2254C8", letterSpacing: 1.5 },
        { type: "text", x: 278, y: 168, width: 80, height: 12,
          content: "SUCCESS", fontSize: 9, fontWeight: "700",
          color: "#2254C8", letterSpacing: 1.5 },

        // Tool rows
        ...[
          { tool: "web_search()", calls: "4,210", pct: 98, bar: 294 },
          { tool: "llm_call()", calls: "3,840", pct: 96, bar: 288 },
          { tool: "read_url()", calls: "2,991", pct: 94, bar: 282 },
          { tool: "write_file()", calls: "1,720", pct: 99, bar: 297 },
          { tool: "code_exec()", calls: "1,204", pct: 87, bar: 261 },
          { tool: "send_email()", calls: "890", pct: 99, bar: 297 },
          { tool: "db_query()", calls: "753", pct: 91, bar: 273 },
          { tool: "fact_check()", calls: "420", pct: 95, bar: 285 },
        ].flatMap((row, i) => {
          const y = 200 + i * 60;
          const barW = Math.round((row.pct / 100) * 64);
          const pctColor = row.pct >= 95 ? "#2B8A3E" : row.pct >= 90 ? "#E67700" : "#C0392B";
          return [
            { type: "rectangle", x: 16, y, width: 358, height: 50,
              fill: i % 2 === 0 ? "#FFFFFF" : "#FAF8F4", cornerRadius: 12,
              shadow: { color: "rgba(26,23,20,0.03)", blur: 6, x: 0, y: 1 } },
            // Tool name
            { type: "text", x: 28, y: y + 10, width: 150, height: 14,
              content: row.tool, fontSize: 12, fontWeight: "600", color: "#1A1714" },
            // Calls
            { type: "text", x: 196, y: y + 10, width: 60, height: 14,
              content: row.calls, fontSize: 12, fontWeight: "500", color: "#555048" },
            // Progress bar bg
            { type: "rectangle", x: 268, y: y + 18, width: 64, height: 6,
              fill: "#E8E4DC", cornerRadius: 3 },
            // Progress bar fill
            { type: "rectangle", x: 268, y: y + 18, width: barW, height: 6,
              fill: pctColor, cornerRadius: 3 },
            // Pct label
            { type: "text", x: 336, y: y + 14, width: 30, height: 14,
              content: `${row.pct}%`, fontSize: 11, fontWeight: "700",
              color: pctColor, textAlign: "right" },
          ];
        }),

        // Bottom Nav
        { type: "rectangle", x: 0, y: 706, width: 390, height: 82,
          fill: "#FFFFFF", opacity: 0.96 },
        { type: "rectangle", x: 0, y: 706, width: 390, height: 1, fill: "#E8E4DC" },
        ...["◈ Home", "⎇ Flows", "⊕ Runs", "⚙ Config"].map((label, i) => ({
          type: "text", x: 18 + i * 90, y: 724, width: 80, height: 14,
          content: label, fontSize: 10, fontWeight: i === 2 ? "700" : "500",
          color: i === 2 ? "#2254C8" : "#B0A898",
          textAlign: "center"
        })),
      ]
    },

    // ─── SCREEN 4: ALERTS & ANOMALIES ──────────────────────────────
    {
      id: "alerts",
      name: "Alerts",
      backgroundColor: "#F4F1EC",
      statusBarStyle: "dark",
      elements: [
        { type: "rectangle", x: 0, y: 0, width: 390, height: 96, fill: "#F4F1EC" },
        { type: "text", x: 20, y: 56, width: 200, height: 14,
          content: "ANOMALIES", fontSize: 11, fontWeight: "500",
          color: "#888070", letterSpacing: 4 },
        { type: "text", x: 20, y: 74, width: 280, height: 24,
          content: "Alerts", fontSize: 22, fontWeight: "700", color: "#1A1714" },
        // Alert count badge
        { type: "rectangle", x: 324, y: 76, width: 54, height: 22,
          fill: "#FDDEDE", cornerRadius: 11 },
        { type: "text", x: 330, y: 80, width: 42, height: 14,
          content: "3 OPEN", fontSize: 9, fontWeight: "700", color: "#C0392B" },

        // Active alerts
        ...[
          {
            id: "ALT-009", sev: "HIGH", label: "Rate Limit Exceeded",
            desc: "tool: web_search() — 429 errors × 14 in last 5min",
            agent: "ResearchBot", time: "2 min ago",
            sevColor: "#C0392B", sevBg: "#FDDEDE"
          },
          {
            id: "ALT-008", sev: "WARN", label: "Latency Spike",
            desc: "llm_call() avg 4.8s — 3.4× above baseline",
            agent: "CodeReview", time: "11 min ago",
            sevColor: "#B45309", sevBg: "#FEF3C7"
          },
          {
            id: "ALT-007", sev: "WARN", label: "Token Budget",
            desc: "ARK-00836 used 94% of 100k token budget",
            agent: "DataSync", time: "34 min ago",
            sevColor: "#B45309", sevBg: "#FEF3C7"
          },
        ].flatMap((alert, i) => {
          const y = 112 + i * 116;
          return [
            { type: "rectangle", x: 16, y, width: 358, height: 104,
              fill: "#FFFFFF", cornerRadius: 16,
              shadow: { color: "rgba(26,23,20,0.06)", blur: 12, x: 0, y: 4 } },
            // Left accent bar
            { type: "rectangle", x: 16, y, width: 4, height: 104,
              fill: alert.sevColor, cornerRadius: { tl: 16, bl: 16, tr: 0, br: 0 } },
            // Severity badge
            { type: "rectangle", x: 32, y: y + 12, width: 46, height: 18,
              fill: alert.sevBg, cornerRadius: 9 },
            { type: "text", x: 38, y: y + 15, width: 36, height: 12,
              content: alert.sev, fontSize: 9, fontWeight: "700", color: alert.sevColor },
            // ID
            { type: "text", x: 300, y: y + 14, width: 60, height: 12,
              content: alert.id, fontSize: 9, fontWeight: "500",
              color: "#B0A898", textAlign: "right" },
            // Title
            { type: "text", x: 32, y: y + 36, width: 310, height: 18,
              content: alert.label, fontSize: 15, fontWeight: "700", color: "#1A1714" },
            // Description
            { type: "text", x: 32, y: y + 58, width: 310, height: 24,
              content: alert.desc, fontSize: 11, color: "#666056", lineHeight: 1.4 },
            // Footer
            { type: "text", x: 32, y: y + 86, width: 150, height: 12,
              content: `Agent: ${alert.agent}`, fontSize: 9, color: "#9A8E82" },
            { type: "text", x: 280, y: y + 86, width: 78, height: 12,
              content: alert.time, fontSize: 9, color: "#B0A898", textAlign: "right" },
          ];
        }),

        // Resolved section header
        { type: "text", x: 20, y: 468, width: 200, height: 14,
          content: "RESOLVED — LAST 24H", fontSize: 10, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        ...[
          { id: "ALT-006", label: "Memory Overflow — DataSync", time: "1h ago" },
          { id: "ALT-005", label: "Auth Token Expired — APIAgent", time: "3h ago" },
          { id: "ALT-004", label: "Tool Timeout — CodeReview", time: "5h ago" },
        ].flatMap((r, i) => {
          const y = 490 + i * 48;
          return [
            { type: "rectangle", x: 16, y, width: 358, height: 38,
              fill: "#FAF8F4", cornerRadius: 12 },
            { type: "text", x: 28, y: y + 5, width: 60, height: 10,
              content: r.id, fontSize: 9, color: "#B0A898", letterSpacing: 1 },
            { type: "text", x: 28, y: y + 18, width: 260, height: 14,
              content: r.label, fontSize: 12, color: "#9A8E82" },
            { type: "text", x: 308, y: y + 14, width: 58, height: 12,
              content: r.time, fontSize: 10, color: "#C0BAB0", textAlign: "right" },
            // checkmark
            { type: "text", x: 352, y: y + 4, width: 14, height: 10,
              content: "✓", fontSize: 10, color: "#2B8A3E" },
          ];
        }),

        // Bottom Nav
        { type: "rectangle", x: 0, y: 706, width: 390, height: 82,
          fill: "#FFFFFF", opacity: 0.96 },
        { type: "rectangle", x: 0, y: 706, width: 390, height: 1, fill: "#E8E4DC" },
        ...["◈ Home", "⎇ Flows", "⊕ Runs", "⚙ Config"].map((label, i) => ({
          type: "text", x: 18 + i * 90, y: 724, width: 80, height: 14,
          content: label, fontSize: 10, fontWeight: i === 3 ? "700" : "500",
          color: i === 3 ? "#2254C8" : "#B0A898",
          textAlign: "center"
        })),
      ]
    },

    // ─── SCREEN 5: AGENT DETAIL ──────────────────────────────────────
    {
      id: "agent-detail",
      name: "Agent Detail",
      backgroundColor: "#F4F1EC",
      statusBarStyle: "dark",
      elements: [
        { type: "rectangle", x: 0, y: 0, width: 390, height: 96, fill: "#F4F1EC" },
        { type: "text", x: 20, y: 56, width: 200, height: 14,
          content: "AGENT PROFILE", fontSize: 11, fontWeight: "500",
          color: "#888070", letterSpacing: 4 },
        { type: "text", x: 20, y: 74, width: 280, height: 24,
          content: "ResearchBot", fontSize: 22, fontWeight: "700", color: "#1A1714" },
        // Active badge
        { type: "rectangle", x: 300, y: 76, width: 74, height: 22,
          fill: "#D8F3D8", cornerRadius: 11 },
        { type: "text", x: 308, y: 80, width: 58, height: 14,
          content: "● ACTIVE", fontSize: 9, fontWeight: "700", color: "#1E7A1E" },

        // Agent identity card
        { type: "rectangle", x: 16, y: 112, width: 358, height: 112,
          fill: "#1A1714", cornerRadius: 20 },
        // Big ref number top-right
        { type: "text", x: 240, y: 120, width: 120, height: 20,
          content: "AGT-001", fontSize: 11, fontWeight: "500",
          color: "rgba(255,255,255,0.3)", letterSpacing: 3, textAlign: "right" },
        { type: "text", x: 28, y: 130, width: 200, height: 28,
          content: "ResearchBot", fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
        { type: "text", x: 28, y: 160, width: 300, height: 14,
          content: "GPT-4o + web_search + read_url + fact_check", fontSize: 11,
          color: "rgba(255,255,255,0.5)" },
        // Stat pills
        ...[
          { label: "Runs", value: "481" },
          { label: "Avg steps", value: "7.2" },
          { label: "P95 lat", value: "2.1s" },
        ].map((stat, i) => ({
          type: "rectangle", x: 28 + i * 112, y: 188, width: 96, height: 28,
          fill: "rgba(255,255,255,0.08)", cornerRadius: 14,
          _children: [
            { type: "text", x: 36 + i * 112, y: 193, width: 80, height: 18,
              content: `${stat.value} ${stat.label}`, fontSize: 10, fontWeight: "600",
              color: "rgba(255,255,255,0.7)" }
          ]
        })).flatMap(el => [el, ...(el._children || [])]),

        // Stat table (Silencio-inspired)
        { type: "rectangle", x: 16, y: 240, width: 358, height: 200,
          fill: "#FFFFFF", cornerRadius: 16,
          shadow: { color: "rgba(26,23,20,0.06)", blur: 12, x: 0, y: 4 } },
        { type: "text", x: 28, y: 254, width: 200, height: 14,
          content: "PERFORMANCE METRICS", fontSize: 10, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        { type: "rectangle", x: 28, y: 272, width: 302, height: 1, fill: "#E8E4DC" },
        ...[
          ["TOTAL RUNS", "481", "#1A1714"],
          ["SUCCESS RATE", "97.3%", "#2B8A3E"],
          ["AVG TOOL CALLS", "8.4 / run", "#1A1714"],
          ["AVG LATENCY", "1.4s", "#1A1714"],
          ["ERRORS TODAY", "4", "#C0392B"],
          ["TOKENS / RUN", "6,240", "#1A1714"],
        ].flatMap(([label, value, valColor], i) => {
          const y = 282 + i * 26;
          return [
            { type: "text", x: 28, y, width: 180, height: 14,
              content: label, fontSize: 11, color: "#9A8E82", letterSpacing: 0.5 },
            { type: "text", x: 248, y, width: 80, height: 14,
              content: value, fontSize: 11, fontWeight: "700",
              color: valColor, textAlign: "right" },
            ...(i < 5 ? [{ type: "rectangle", x: 28, y: y + 18, width: 302, height: 1, fill: "#F0EDE8" }] : []),
          ];
        }),

        // Top tools used
        { type: "text", x: 20, y: 458, width: 200, height: 14,
          content: "TOP TOOLS USED", fontSize: 10, fontWeight: "600",
          color: "#9A8E82", letterSpacing: 1.5 },
        ...[
          { name: "web_search()", pct: 44 },
          { name: "llm_call()", pct: 31 },
          { name: "fact_check()", pct: 14 },
          { name: "read_url()", pct: 11 },
        ].flatMap((tool, i) => {
          const y = 480 + i * 52;
          const barW = Math.round((tool.pct / 100) * 290);
          return [
            { type: "rectangle", x: 16, y, width: 358, height: 40,
              fill: "#FFFFFF", cornerRadius: 10,
              shadow: { color: "rgba(26,23,20,0.03)", blur: 6, x: 0, y: 1 } },
            { type: "text", x: 28, y: y + 8, width: 200, height: 14,
              content: tool.name, fontSize: 12, fontWeight: "600", color: "#1A1714" },
            // Bar
            { type: "rectangle", x: 28, y: y + 28, width: 290, height: 4,
              fill: "#E8E4DC", cornerRadius: 2 },
            { type: "rectangle", x: 28, y: y + 28, width: barW, height: 4,
              fill: "#2254C8", cornerRadius: 2 },
            { type: "text", x: 320, y: y + 8, width: 44, height: 14,
              content: `${tool.pct}%`, fontSize: 11, fontWeight: "700",
              color: "#2254C8", textAlign: "right" },
          ];
        }),

        // Bottom Nav
        { type: "rectangle", x: 0, y: 706, width: 390, height: 82,
          fill: "#FFFFFF", opacity: 0.96 },
        { type: "rectangle", x: 0, y: 706, width: 390, height: 1, fill: "#E8E4DC" },
        ...["◈ Home", "⎇ Flows", "⊕ Runs", "⚙ Config"].map((label, i) => ({
          type: "text", x: 18 + i * 90, y: 724, width: 80, height: 14,
          content: label, fontSize: 10, fontWeight: "500",
          color: "#B0A898", textAlign: "center"
        })),
      ]
    }
  ]
};

fs.writeFileSync('arca.pen', JSON.stringify(pen, null, 2));
console.log('✓ arca.pen written —', pen.screens.length, 'screens');
