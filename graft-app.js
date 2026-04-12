#!/usr/bin/env node
// GRAFT — Branch, test, and trace AI agent workflows
// Inspired by:
//   - Neon.com (godly.website) — "Instant branching. Develop and test with efficient copies"
//     applied to LLM agent workflow execution: branch prompts, compare outputs, trace runs
//   - Awwwards nominees "San Rita" and "Maxima Therapy" — warm editorial off-white,
//     confident large numerics, clean sans-serif with generous whitespace
//   - Evervault.com (godly.website) — clean developer-tool information architecture
// Theme: LIGHT (Zenith was dark → rotating to light)

const fs = require('fs');

const pen = {
  version: "2.8",
  meta: {
    name: "GRAFT",
    tagline: "Branch, test & trace AI workflows",
    archetype: "ai-observability-dev-tool",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "light"
  },
  palette: {
    // Light palette as primary (editorial warm off-white)
    bg: "#F4F2EF",
    surface: "#FFFFFF",
    surfaceAlt: "#ECEAE6",
    surfaceHover: "#F9F8F6",
    text: "#1C1A17",
    textMuted: "rgba(28,26,23,0.45)",
    accent: "#1ACA8A",
    accent2: "#6B48FF",
    accentSoft: "rgba(26,202,138,0.10)",
    accent2Soft: "rgba(107,72,255,0.09)",
    border: "rgba(28,26,23,0.09)",
    borderStrong: "rgba(28,26,23,0.18)",
    borderAccent: "rgba(26,202,138,0.30)",
    statusGreen: "#059669",
    statusOrange: "#D97706",
    statusRed: "#DC2626",
    statusGreenSoft: "rgba(5,150,105,0.09)",
    statusOrangeSoft: "rgba(217,119,6,0.09)",
    statusRedSoft: "rgba(220,38,38,0.09)",
    monoInk: "#1C1A17",
    monoSurface: "#ECEAE6"
  },
  lightPalette: {
    bg: "#F4F2EF",
    surface: "#FFFFFF",
    surfaceAlt: "#ECEAE6",
    text: "#1C1A17",
    textMuted: "rgba(28,26,23,0.45)",
    accent: "#1ACA8A",
    accent2: "#6B48FF",
    accentSoft: "rgba(26,202,138,0.10)",
    accent2Soft: "rgba(107,72,255,0.09)",
    border: "rgba(28,26,23,0.09)",
    borderStrong: "rgba(28,26,23,0.18)",
    statusGreen: "#059669",
    statusOrange: "#D97706",
    statusRed: "#DC2626"
  },
  darkPalette: {
    bg: "#0D0F14",
    surface: "#151821",
    surfaceAlt: "#1B1F2E",
    text: "#E6E3DE",
    textMuted: "rgba(230,227,222,0.42)",
    accent: "#00E89B",
    accent2: "#8B6FFF",
    border: "rgba(230,227,222,0.07)",
    borderStrong: "rgba(230,227,222,0.14)",
    statusGreen: "#00D68F",
    statusOrange: "#F59E0B",
    statusRed: "#F53B57"
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    monoFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    scale: { xs: 10, sm: 11, base: 13, md: 14, lg: 17, xl: 22, xxl: 30, hero: 48 }
  },
  screens: [

    // ───────────────────────────────────────────────────────────────
    // Screen 1: OVERVIEW — editorial dashboard with large numerics
    // ───────────────────────────────────────────────────────────────
    {
      id: "overview",
      label: "Overview",
      description: "Top-level health: headline metrics, run activity chart, recent branches",
      components: [
        {
          type: "app-topbar",
          appName: "GRAFT",
          appVersion: "v1.2",
          center: "AI Workflow Tracing",
          rightItems: [
            { icon: "bell", badge: "3" },
            { label: "New Run", icon: "play", variant: "accent" }
          ]
        },
        {
          type: "hero-metric-banner",
          style: "editorial-wide",
          label: "RUNS THIS WEEK",
          value: "2,841",
          sub: "↑ 18% vs last week",
          subColor: "statusGreen",
          supportingMetrics: [
            { label: "SUCCESS RATE", value: "97.3%", delta: "+0.8%" },
            { label: "AVG LATENCY", value: "1.4s", delta: "−0.2s" },
            { label: "TOKENS USED", value: "18.6M", delta: "↑ 12%" },
            { label: "COST THIS WEEK", value: "$24.80", delta: "+$3.10" }
          ]
        },
        {
          type: "section-header",
          label: "Run Activity — Last 7 Days",
          action: { label: "Export CSV", icon: "share" }
        },
        {
          type: "area-chart",
          height: 120,
          series: [
            {
              label: "Successful",
              color: "statusGreen",
              data: [310, 385, 402, 290, 450, 480, 524]
            },
            {
              label: "Failed",
              color: "statusRed",
              data: [12, 8, 15, 9, 11, 7, 6]
            }
          ],
          xLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        },
        {
          type: "section-header",
          label: "Active Branches",
          action: { label: "New Branch", icon: "plus" }
        },
        {
          type: "branch-list",
          items: [
            {
              id: "br-42",
              name: "main",
              description: "Production prompt — GPT-4o",
              runs: 1840,
              successRate: 98.2,
              avgLatency: "1.2s",
              status: "active",
              isMain: true,
              lastRun: "2 min ago"
            },
            {
              id: "br-57",
              name: "exp/chain-of-thought",
              description: "Testing CoT prompting strategy",
              runs: 412,
              successRate: 96.8,
              avgLatency: "1.9s",
              status: "testing",
              isMain: false,
              lastRun: "14 min ago"
            },
            {
              id: "br-61",
              name: "exp/gemini-flash",
              description: "Benchmark Gemini 2.0 Flash vs GPT-4o",
              runs: 239,
              successRate: 95.1,
              avgLatency: "0.8s",
              status: "testing",
              isMain: false,
              lastRun: "1 hr ago"
            },
            {
              id: "br-65",
              name: "fix/retry-logic",
              description: "Improved retry on rate-limit errors",
              runs: 88,
              successRate: 99.1,
              avgLatency: "1.4s",
              status: "staging",
              isMain: false,
              lastRun: "3 hr ago"
            }
          ]
        }
      ]
    },

    // ───────────────────────────────────────────────────────────────
    // Screen 2: RUNS — trace log with filtering
    // ───────────────────────────────────────────────────────────────
    {
      id: "runs",
      label: "Runs",
      description: "Full list of recent workflow executions — filterable by branch, status, model",
      components: [
        {
          type: "app-topbar",
          appName: "GRAFT",
          appVersion: "v1.2",
          center: "Run Log",
          rightItems: [
            { icon: "bell", badge: "3" },
            { label: "New Run", icon: "play", variant: "accent" }
          ]
        },
        {
          type: "search-filter-bar",
          placeholder: "Search runs by ID, input, output...",
          filters: [
            {
              label: "Branch",
              options: ["All", "main", "exp/chain-of-thought", "exp/gemini-flash", "fix/retry-logic"]
            },
            {
              label: "Status",
              options: ["All", "success", "failed", "running", "cancelled"]
            },
            {
              label: "Model",
              options: ["All", "GPT-4o", "Claude 3.6", "Gemini Flash", "Custom"]
            }
          ]
        },
        {
          type: "stat-row",
          items: [
            { label: "Showing", value: "2,841 runs", sub: "Last 7 days" },
            { label: "Running", value: "4", color: "accent" },
            { label: "Failed", value: "62", color: "statusRed" },
            { label: "Avg Cost", value: "$0.0087", sub: "per run" }
          ]
        },
        {
          type: "data-table",
          columns: ["Run ID", "Branch", "Model", "Status", "Latency", "Tokens", "Cost", "Started"],
          rows: [
            ["RUN-9041", "main", "GPT-4o", "success", "1.18s", "1,420", "$0.011", "just now"],
            ["RUN-9040", "exp/chain-of-thought", "GPT-4o", "running", "—", "—", "—", "30s ago"],
            ["RUN-9039", "main", "GPT-4o", "success", "1.24s", "1,380", "$0.009", "1 min ago"],
            ["RUN-9038", "exp/gemini-flash", "Gemini Flash", "success", "0.79s", "890", "$0.003", "2 min ago"],
            ["RUN-9037", "fix/retry-logic", "GPT-4o", "success", "1.41s", "1,510", "$0.012", "5 min ago"],
            ["RUN-9036", "main", "GPT-4o", "failed", "4.02s", "—", "$0.001", "7 min ago"],
            ["RUN-9035", "exp/chain-of-thought", "GPT-4o", "success", "2.11s", "2,180", "$0.017", "9 min ago"],
            ["RUN-9034", "main", "GPT-4o", "success", "1.09s", "1,220", "$0.008", "11 min ago"]
          ],
          statusColumn: 3,
          highlighted: 0
        }
      ]
    },

    // ───────────────────────────────────────────────────────────────
    // Screen 3: TRACE DETAIL — waterfall timeline for a single run
    // ───────────────────────────────────────────────────────────────
    {
      id: "trace",
      label: "Trace",
      description: "Deep-dive waterfall trace for RUN-9041 — steps, tokens, latency breakdown",
      components: [
        {
          type: "app-topbar",
          appName: "GRAFT",
          appVersion: "v1.2",
          back: "← Runs",
          center: "RUN-9041",
          rightItems: [
            { label: "Compare", icon: "layers" },
            { label: "Replay", icon: "play", variant: "accent" }
          ]
        },
        {
          type: "run-meta-header",
          runId: "RUN-9041",
          branch: "main",
          model: "GPT-4o",
          status: "success",
          statusColor: "statusGreen",
          startedAt: "Apr 1, 2026 — 09:42:18 UTC",
          totalDuration: "1,184ms",
          totalTokens: "1,420",
          inputTokens: "842",
          outputTokens: "578",
          estimatedCost: "$0.011"
        },
        {
          type: "section-header",
          label: "Execution Waterfall",
          sub: "Step-by-step latency breakdown"
        },
        {
          type: "trace-waterfall",
          totalMs: 1184,
          steps: [
            { name: "Input validation", type: "system", startMs: 0, durationMs: 12, color: "accent2" },
            { name: "Context retrieval (RAG)", type: "retrieval", startMs: 12, durationMs: 118, color: "accent" },
            { name: "Prompt assembly", type: "system", startMs: 130, durationMs: 22, color: "accent2" },
            { name: "LLM inference — GPT-4o", type: "llm", startMs: 152, durationMs: 891, color: "statusGreen", highlight: true },
            { name: "Output parsing", type: "system", startMs: 1043, durationMs: 31, color: "accent2" },
            { name: "Result storage", type: "storage", startMs: 1074, durationMs: 68, color: "statusOrange" },
            { name: "Webhook dispatch", type: "io", startMs: 1142, durationMs: 42, color: "accent" }
          ]
        },
        {
          type: "section-header",
          label: "Input / Output"
        },
        {
          type: "io-panel",
          input: {
            label: "INPUT",
            preview: "Summarize the following customer feedback in 3 bullet points, focusing on actionable insights:\n\n\"The new onboarding flow is much clearer but the pricing page still confuses me. I had to ask support about the difference between Pro and Business...\""
          },
          output: {
            label: "OUTPUT",
            preview: "• Onboarding improvement is recognized — users find the new flow significantly clearer ✓\n• Pricing page remains a friction point — Pro vs Business tier distinction is unclear\n• Support team is engaged but shouldn't be needed for basic pricing questions"
          }
        }
      ]
    },

    // ───────────────────────────────────────────────────────────────
    // Screen 4: COMPARE — A/B branch comparison
    // ───────────────────────────────────────────────────────────────
    {
      id: "compare",
      label: "Compare",
      description: "Side-by-side branch comparison — main vs exp/chain-of-thought over 100 runs",
      components: [
        {
          type: "app-topbar",
          appName: "GRAFT",
          appVersion: "v1.2",
          center: "Branch Compare",
          rightItems: [
            { label: "Promote to Main", icon: "zap", variant: "accent" }
          ]
        },
        {
          type: "compare-header",
          branchA: { name: "main", color: "accent", label: "A" },
          branchB: { name: "exp/chain-of-thought", color: "accent2", label: "B" },
          runCount: 100,
          verdict: "B is 0.4% more accurate, 2× slower — not worth it at current scale",
          verdictIcon: "alert"
        },
        {
          type: "compare-metric-grid",
          metrics: [
            {
              label: "Success Rate",
              a: { value: "98.2%", raw: 98.2 },
              b: { value: "96.8%", raw: 96.8 },
              winner: "a"
            },
            {
              label: "Avg Latency",
              a: { value: "1.2s", raw: 1.2 },
              b: { value: "2.1s", raw: 2.1 },
              winner: "a"
            },
            {
              label: "Avg Tokens",
              a: { value: "1,380", raw: 1380 },
              b: { value: "2,210", raw: 2210 },
              winner: "a"
            },
            {
              label: "Avg Cost / Run",
              a: { value: "$0.009", raw: 0.009 },
              b: { value: "$0.017", raw: 0.017 },
              winner: "a"
            },
            {
              label: "LLM Accuracy (eval)",
              a: { value: "92.1%", raw: 92.1 },
              b: { value: "92.5%", raw: 92.5 },
              winner: "b",
              note: "Eval: GPT-4o judge, 50 samples"
            },
            {
              label: "P95 Latency",
              a: { value: "2.4s", raw: 2.4 },
              b: { value: "4.8s", raw: 4.8 },
              winner: "a"
            }
          ]
        },
        {
          type: "section-header",
          label: "Latency Distribution"
        },
        {
          type: "dual-bar-chart",
          seriesA: { label: "main", color: "accent", data: [24, 41, 22, 9, 3, 1] },
          seriesB: { label: "CoT", color: "accent2", data: [8, 19, 28, 31, 11, 3] },
          xLabels: ["<0.5s", "0.5-1s", "1-2s", "2-3s", "3-4s", ">4s"]
        }
      ]
    },

    // ───────────────────────────────────────────────────────────────
    // Screen 5: AGENTS — model configs & performance
    // ───────────────────────────────────────────────────────────────
    {
      id: "agents",
      label: "Agents",
      description: "Configured agent models, system prompts, and performance benchmarks",
      components: [
        {
          type: "app-topbar",
          appName: "GRAFT",
          appVersion: "v1.2",
          center: "Agent Config",
          rightItems: [
            { label: "Add Agent", icon: "plus", variant: "accent" }
          ]
        },
        {
          type: "kpi-row",
          items: [
            { label: "Configured Agents", value: "4", icon: "layers" },
            { label: "Active Models", value: "3", icon: "zap" },
            { label: "Avg Eval Score", value: "91.8%", icon: "star" },
            { label: "Cheapest / Run", value: "$0.003", sub: "Gemini Flash", icon: "check" }
          ]
        },
        {
          type: "section-header",
          label: "Agent Profiles"
        },
        {
          type: "agent-card-list",
          agents: [
            {
              id: "ag-01",
              name: "Summarizer",
              model: "GPT-4o",
              provider: "OpenAI",
              promptPreview: "You are an expert at extracting 3 bullet-point actionable insights from...",
              runs: 1840,
              evalScore: 92.1,
              avgCost: "$0.009",
              avgLatency: "1.2s",
              status: "active",
              branch: "main"
            },
            {
              id: "ag-02",
              name: "Summarizer (CoT)",
              model: "GPT-4o",
              provider: "OpenAI",
              promptPreview: "Think step by step. First identify the core themes, then extract...",
              runs: 412,
              evalScore: 92.5,
              avgCost: "$0.017",
              avgLatency: "2.1s",
              status: "testing",
              branch: "exp/chain-of-thought"
            },
            {
              id: "ag-03",
              name: "Summarizer (Flash)",
              model: "Gemini 2.0 Flash",
              provider: "Google",
              promptPreview: "Summarize in 3 bullet points: actionable, specific, avoid jargon...",
              runs: 239,
              evalScore: 89.4,
              avgCost: "$0.003",
              avgLatency: "0.8s",
              status: "testing",
              branch: "exp/gemini-flash"
            },
            {
              id: "ag-04",
              name: "Summarizer (Retry)",
              model: "GPT-4o",
              provider: "OpenAI",
              promptPreview: "You are an expert... [same as ag-01, with retry on rate-limit]",
              runs: 88,
              evalScore: 92.3,
              avgCost: "$0.012",
              avgLatency: "1.4s",
              status: "staging",
              branch: "fix/retry-logic"
            }
          ]
        },
        {
          type: "section-header",
          label: "Evaluation Scores — Radar"
        },
        {
          type: "comparison-table",
          label: "Model Benchmark",
          columns: ["Agent", "Accuracy", "Coherence", "Brevity", "Latency", "Cost Eff."],
          rows: [
            ["Summarizer", "92.1", "94.0", "88.5", "95.0", "91.0"],
            ["CoT Variant", "92.5", "95.2", "81.0", "72.0", "74.0"],
            ["Flash Variant", "89.4", "90.1", "91.2", "99.0", "99.0"],
            ["Retry Variant", "92.3", "93.8", "88.5", "93.0", "88.0"]
          ],
          highlightRow: 0
        }
      ]
    },

    // ───────────────────────────────────────────────────────────────
    // Screen 6: COST — spending analytics
    // ───────────────────────────────────────────────────────────────
    {
      id: "cost",
      label: "Cost",
      description: "Spending analytics — by model, branch, and time period",
      components: [
        {
          type: "app-topbar",
          appName: "GRAFT",
          appVersion: "v1.2",
          center: "Cost Analytics",
          rightItems: [
            { label: "Set Budget Alert", icon: "bell" }
          ]
        },
        {
          type: "hero-metric-banner",
          style: "cost-wide",
          label: "TOTAL COST — APRIL 2026",
          value: "$24.80",
          sub: "↑ $3.10 vs March",
          subColor: "statusOrange",
          supportingMetrics: [
            { label: "MAIN BRANCH", value: "$16.56", delta: "66.8%" },
            { label: "EXPERIMENTS", value: "$7.82", delta: "31.5%" },
            { label: "PROJECTED", value: "$31.20", sub: "end of month" },
            { label: "BUDGET", value: "$50.00", sub: "remaining: $25.20" }
          ]
        },
        {
          type: "section-header",
          label: "Daily Spend — April 2026"
        },
        {
          type: "stacked-bar-chart",
          height: 110,
          series: [
            { label: "main", color: "accent", data: [0.72, 0.88, 0.91, 0.74, 1.02, 1.08, 1.19] },
            { label: "experiments", color: "accent2", data: [0.21, 0.28, 0.34, 0.19, 0.38, 0.41, 0.44] }
          ],
          xLabels: ["Mar 26", "Mar 27", "Mar 28", "Mar 29", "Mar 30", "Mar 31", "Apr 1"]
        },
        {
          type: "section-header",
          label: "Cost Breakdown by Model"
        },
        {
          type: "progress-list",
          items: [
            { label: "GPT-4o (main)", value: "$16.56", pct: 66.8, color: "accent" },
            { label: "GPT-4o (CoT)", value: "$7.00", pct: 28.2, color: "accent2" },
            { label: "Gemini 2.0 Flash", value: "$0.72", pct: 2.9, color: "statusGreen" },
            { label: "GPT-4o (retry)", value: "$0.52", pct: 2.1, color: "statusOrange" }
          ]
        },
        {
          type: "section-header",
          label: "Cost Optimization Tips"
        },
        {
          type: "tip-list",
          items: [
            {
              icon: "zap",
              title: "Switch to Gemini Flash for low-stakes runs",
              body: "Flash costs 3× less with only −2.7% accuracy loss. Could save ~$8/month.",
              impact: "HIGH",
              impactColor: "statusGreen"
            },
            {
              icon: "alert",
              title: "CoT prompting not worth it at current scale",
              body: "2× cost increase for +0.4% accuracy. Recommend closing exp/chain-of-thought.",
              impact: "MED",
              impactColor: "statusOrange"
            },
            {
              icon: "check",
              title: "Retry logic reduces failure cost",
              body: "fix/retry-logic branch eliminates expensive failed runs. Ready to promote.",
              impact: "LOW",
              impactColor: "accent"
            }
          ]
        }
      ]
    }
  ]
};

fs.writeFileSync('graft.pen', JSON.stringify(pen, null, 2));
console.log('✓ graft.pen written —', JSON.stringify(pen).length, 'chars,', pen.screens.length, 'screens');
pen.screens.forEach((s, i) => {
  console.log(`  Screen ${i+1}: ${s.label} (${s.components.length} components)`);
});
