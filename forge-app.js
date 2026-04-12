const fs = require('fs');

const pen = {
  "version": "2.8",
  "name": "Forge",
  "description": "Real-time infrastructure command center for engineering teams",
  "screens": [
    {
      "id": "dashboard",
      "name": "Overview",
      "background": "#060A0F",
      "elements": [
        {
          "type": "statusBar",
          "time": "9:41",
          "color": "#E2E8F0"
        },
        {
          "type": "header",
          "title": "forge",
          "subtitle": "infrastructure · 4 services",
          "titleColor": "#22D3EE",
          "subtitleColor": "#64748B",
          "titleFont": "mono",
          "rightAction": { "icon": "bell", "badge": "2" }
        },
        {
          "type": "card",
          "style": "hero",
          "background": "#0D1520",
          "border": "#1E2D42",
          "padding": 20,
          "content": [
            {
              "type": "label",
              "text": "SYSTEM HEALTH",
              "color": "#64748B",
              "font": "mono",
              "size": 10,
              "letterSpacing": 2
            },
            {
              "type": "metric-xl",
              "value": "98.7",
              "unit": "%",
              "color": "#22D3EE",
              "unitColor": "#64748B"
            },
            {
              "type": "status-row",
              "items": [
                { "label": "Uptime", "value": "99.98%", "color": "#10B981" },
                { "label": "Incidents", "value": "1 open", "color": "#F59E0B" },
                { "label": "P99 Latency", "value": "142ms", "color": "#E2E8F0" }
              ]
            }
          ]
        },
        {
          "type": "section-title",
          "text": "Services",
          "color": "#94A3B8",
          "font": "mono",
          "rightLabel": "View all →",
          "rightColor": "#22D3EE"
        },
        {
          "type": "list",
          "style": "compact-dark",
          "items": [
            {
              "icon": "database",
              "iconBg": "#0F2A1E",
              "iconColor": "#10B981",
              "title": "postgres-primary",
              "subtitle": "us-east-1 · 14ms avg",
              "badge": "healthy",
              "badgeColor": "#10B981",
              "badgeBg": "#0F2A1E"
            },
            {
              "icon": "zap",
              "iconBg": "#1A1230",
              "iconColor": "#818CF8",
              "title": "api-gateway",
              "subtitle": "edge · 8ms avg",
              "badge": "healthy",
              "badgeColor": "#10B981",
              "badgeBg": "#0F2A1E"
            },
            {
              "icon": "layers",
              "iconBg": "#1A1007",
              "iconColor": "#F59E0B",
              "title": "worker-queue",
              "subtitle": "us-east-1 · 847 jobs/min",
              "badge": "degraded",
              "badgeColor": "#F59E0B",
              "badgeBg": "#1A1007"
            },
            {
              "icon": "activity",
              "iconBg": "#0A1A2E",
              "iconColor": "#22D3EE",
              "title": "cdn-edge",
              "subtitle": "global · 99.99% cache",
              "badge": "healthy",
              "badgeColor": "#10B981",
              "badgeBg": "#0F2A1E"
            }
          ]
        },
        {
          "type": "card",
          "style": "alert",
          "background": "#140D00",
          "border": "#2A1F00",
          "content": [
            {
              "type": "alert-header",
              "icon": "alert",
              "iconColor": "#F59E0B",
              "title": "Worker queue backlog elevated",
              "subtitle": "3 min ago · P2 severity"
            },
            {
              "type": "text",
              "value": "worker-queue job processing rate dropped 23% over last 15 min. 1,847 jobs pending.",
              "color": "#94A3B8",
              "size": 13
            }
          ]
        },
        {
          "type": "nav-bar",
          "activeTab": 0,
          "tabs": [
            { "icon": "home", "label": "Overview" },
            { "icon": "activity", "label": "Metrics" },
            { "icon": "bell", "label": "Alerts", "badge": "2" },
            { "icon": "layers", "label": "Services" },
            { "icon": "message", "label": "AI" }
          ],
          "activeColor": "#22D3EE",
          "inactiveColor": "#475569",
          "background": "#0D1520",
          "borderColor": "#1E2D42"
        }
      ]
    },
    {
      "id": "metrics",
      "name": "Metrics",
      "background": "#060A0F",
      "elements": [
        {
          "type": "statusBar",
          "time": "9:41",
          "color": "#E2E8F0"
        },
        {
          "type": "header",
          "title": "Metrics",
          "titleColor": "#E2E8F0",
          "rightAction": { "icon": "filter", "label": "1h" }
        },
        {
          "type": "tab-row",
          "tabs": ["Request Rate", "Latency", "Errors", "CPU"],
          "activeTab": 0,
          "activeColor": "#22D3EE",
          "activeBg": "#0D2030",
          "inactiveColor": "#475569",
          "background": "#0D1520",
          "border": "#1E2D42"
        },
        {
          "type": "chart",
          "style": "area-glow",
          "height": 160,
          "background": "#0D1520",
          "border": "#1E2D42",
          "lineColor": "#22D3EE",
          "fillColor": "rgba(34,211,238,0.08)",
          "glowColor": "#22D3EE",
          "data": [42,45,43,48,52,49,55,61,58,64,60,67,63,70,74,69,72,78,82,79,85,88,84,91,87,93,89,95,98,94],
          "xLabels": ["8:00", "8:15", "8:30", "8:45", "9:00", "9:15", "9:30", "9:41"],
          "yLabel": "req/s",
          "currentValue": "94 req/s",
          "currentColor": "#22D3EE"
        },
        {
          "type": "metric-grid",
          "columns": 2,
          "background": "#0D1520",
          "border": "#1E2D42",
          "items": [
            { "label": "P50 Latency", "value": "42ms", "trend": "-5%", "trendUp": false, "color": "#10B981" },
            { "label": "P99 Latency", "value": "142ms", "trend": "+12%", "trendUp": true, "color": "#F59E0B" },
            { "label": "Error Rate", "value": "0.03%", "trend": "-0.01%", "trendUp": false, "color": "#10B981" },
            { "label": "Throughput", "value": "94 r/s", "trend": "+8%", "trendUp": true, "color": "#22D3EE" }
          ]
        },
        {
          "type": "section-title",
          "text": "By Service",
          "color": "#94A3B8"
        },
        {
          "type": "progress-list",
          "background": "#0D1520",
          "border": "#1E2D42",
          "items": [
            { "label": "api-gateway", "value": "38 req/s", "pct": 40, "color": "#818CF8" },
            { "label": "postgres-primary", "value": "29 req/s", "pct": 31, "color": "#22D3EE" },
            { "label": "cdn-edge", "value": "18 req/s", "pct": 19, "color": "#10B981" },
            { "label": "worker-queue", "value": "9 req/s", "pct": 10, "color": "#F59E0B" }
          ]
        },
        {
          "type": "nav-bar",
          "activeTab": 1,
          "tabs": [
            { "icon": "home", "label": "Overview" },
            { "icon": "activity", "label": "Metrics" },
            { "icon": "bell", "label": "Alerts", "badge": "2" },
            { "icon": "layers", "label": "Services" },
            { "icon": "message", "label": "AI" }
          ],
          "activeColor": "#22D3EE",
          "inactiveColor": "#475569",
          "background": "#0D1520",
          "borderColor": "#1E2D42"
        }
      ]
    },
    {
      "id": "alerts",
      "name": "Alerts",
      "background": "#060A0F",
      "elements": [
        {
          "type": "statusBar",
          "time": "9:41",
          "color": "#E2E8F0"
        },
        {
          "type": "header",
          "title": "Alerts",
          "titleColor": "#E2E8F0",
          "rightAction": { "icon": "settings", "label": "Rules" }
        },
        {
          "type": "filter-chips",
          "chips": [
            { "label": "All (4)", "active": true },
            { "label": "Open (2)" },
            { "label": "Resolved (2)" }
          ],
          "activeColor": "#22D3EE",
          "activeBg": "#0D2030",
          "inactiveColor": "#475569",
          "inactiveBg": "#0D1520"
        },
        {
          "type": "alert-list",
          "items": [
            {
              "severity": "P2",
              "severityColor": "#F59E0B",
              "severityBg": "#1A1007",
              "title": "Worker queue backlog elevated",
              "service": "worker-queue",
              "time": "3 min ago",
              "status": "open",
              "description": "Job processing rate dropped 23%. 1,847 jobs pending in queue."
            },
            {
              "severity": "P3",
              "severityColor": "#818CF8",
              "severityBg": "#1A1230",
              "title": "P99 latency spike: api-gateway",
              "service": "api-gateway",
              "time": "18 min ago",
              "status": "open",
              "description": "P99 latency elevated to 380ms for /auth endpoints (threshold: 300ms)."
            },
            {
              "severity": "P2",
              "severityColor": "#10B981",
              "severityBg": "#0F2A1E",
              "title": "Disk usage: postgres replica",
              "service": "postgres-replica",
              "time": "2 hr ago",
              "status": "resolved",
              "description": "Disk usage crossed 85%. Auto-scaled to next tier."
            },
            {
              "severity": "P3",
              "severityColor": "#10B981",
              "severityBg": "#0F2A1E",
              "title": "CDN cache hit rate low",
              "service": "cdn-edge",
              "time": "6 hr ago",
              "status": "resolved",
              "description": "Cache invalidation event caused temporary 40% miss rate."
            }
          ]
        },
        {
          "type": "nav-bar",
          "activeTab": 2,
          "tabs": [
            { "icon": "home", "label": "Overview" },
            { "icon": "activity", "label": "Metrics" },
            { "icon": "bell", "label": "Alerts", "badge": "2" },
            { "icon": "layers", "label": "Services" },
            { "icon": "message", "label": "AI" }
          ],
          "activeColor": "#22D3EE",
          "inactiveColor": "#475569",
          "background": "#0D1520",
          "borderColor": "#1E2D42"
        }
      ]
    },
    {
      "id": "services",
      "name": "Services",
      "background": "#060A0F",
      "elements": [
        {
          "type": "statusBar",
          "time": "9:41",
          "color": "#E2E8F0"
        },
        {
          "type": "header",
          "title": "Services",
          "titleColor": "#E2E8F0",
          "rightAction": { "icon": "plus", "label": "Add" }
        },
        {
          "type": "topology-card",
          "background": "#0D1520",
          "border": "#1E2D42",
          "title": "Service Topology",
          "subtitle": "Last updated 30s ago",
          "nodes": [
            { "id": "cdn", "label": "cdn-edge", "status": "healthy", "color": "#22D3EE", "x": 50, "y": 15 },
            { "id": "api", "label": "api-gateway", "status": "healthy", "color": "#818CF8", "x": 50, "y": 40 },
            { "id": "db", "label": "postgres", "status": "healthy", "color": "#10B981", "x": 25, "y": 70 },
            { "id": "worker", "label": "worker-queue", "status": "degraded", "color": "#F59E0B", "x": 75, "y": 70 }
          ],
          "edges": [
            { "from": "cdn", "to": "api" },
            { "from": "api", "to": "db" },
            { "from": "api", "to": "worker" }
          ]
        },
        {
          "type": "service-detail-list",
          "items": [
            {
              "name": "postgres-primary",
              "region": "us-east-1",
              "type": "Database",
              "typeColor": "#10B981",
              "status": "healthy",
              "uptime": "99.98%",
              "latency": "14ms",
              "version": "16.2"
            },
            {
              "name": "api-gateway",
              "region": "edge (7 regions)",
              "type": "API",
              "typeColor": "#818CF8",
              "status": "healthy",
              "uptime": "99.99%",
              "latency": "8ms",
              "version": "3.1.4"
            },
            {
              "name": "worker-queue",
              "region": "us-east-1",
              "type": "Worker",
              "typeColor": "#F59E0B",
              "status": "degraded",
              "uptime": "99.82%",
              "latency": "—",
              "version": "2.7.1"
            }
          ]
        },
        {
          "type": "nav-bar",
          "activeTab": 3,
          "tabs": [
            { "icon": "home", "label": "Overview" },
            { "icon": "activity", "label": "Metrics" },
            { "icon": "bell", "label": "Alerts", "badge": "2" },
            { "icon": "layers", "label": "Services" },
            { "icon": "message", "label": "AI" }
          ],
          "activeColor": "#22D3EE",
          "inactiveColor": "#475569",
          "background": "#0D1520",
          "borderColor": "#1E2D42"
        }
      ]
    },
    {
      "id": "ai",
      "name": "AI Assistant",
      "background": "#060A0F",
      "elements": [
        {
          "type": "statusBar",
          "time": "9:41",
          "color": "#E2E8F0"
        },
        {
          "type": "header",
          "title": "Forge AI",
          "titleColor": "#22D3EE",
          "titleFont": "mono",
          "subtitle": "Ask anything about your infra",
          "subtitleColor": "#475569"
        },
        {
          "type": "ai-thread",
          "messages": [
            {
              "role": "ai",
              "content": "I've detected an anomaly in worker-queue. Processing rate dropped 23% over the last 15 minutes. Root cause analysis in progress — likely related to a surge in job submissions from api-gateway after the 09:18 deploy.",
              "timestamp": "09:22",
              "actionLabel": "View runbook →"
            },
            {
              "role": "user",
              "content": "What's causing the latency spike on api-gateway /auth endpoints?",
              "timestamp": "09:34"
            },
            {
              "role": "ai",
              "content": "The /auth endpoint P99 latency is 380ms vs the 300ms threshold. Correlates with increased token validation load — your JWT verification is CPU-bound. Recommend: enable caching for validated tokens (TTL 5min). Estimated improvement: 40% latency reduction.",
              "timestamp": "09:34",
              "code": "jwt.verify(token, secret, { cache: true, cacheTTL: 300 })",
              "codeLanguage": "js",
              "actionLabel": "Apply suggestion →"
            },
            {
              "role": "user",
              "content": "Show me a summary of last 24h incidents",
              "timestamp": "09:38"
            },
            {
              "role": "ai",
              "content": "Last 24h: 4 incidents, MTTR avg 18 min, 0 P1s. Services are trending stable. worker-queue degradation is the only active issue.",
              "timestamp": "09:38",
              "chips": ["View full report", "Compare to last week", "Set up SLO alert"]
            }
          ]
        },
        {
          "type": "ai-input",
          "placeholder": "Ask about your infrastructure...",
          "background": "#0D1520",
          "border": "#1E2D42",
          "accentColor": "#22D3EE",
          "suggestions": ["Why is worker-queue slow?", "Show memory usage", "Create alert for P99 > 200ms"]
        },
        {
          "type": "nav-bar",
          "activeTab": 4,
          "tabs": [
            { "icon": "home", "label": "Overview" },
            { "icon": "activity", "label": "Metrics" },
            { "icon": "bell", "label": "Alerts", "badge": "2" },
            { "icon": "layers", "label": "Services" },
            { "icon": "message", "label": "AI" }
          ],
          "activeColor": "#22D3EE",
          "inactiveColor": "#475569",
          "background": "#0D1520",
          "borderColor": "#1E2D42"
        }
      ]
    }
  ],
  "palette": {
    "bg": "#060A0F",
    "surface": "#0D1520",
    "border": "#1E2D42",
    "text": "#E2E8F0",
    "muted": "#64748B",
    "accent": "#22D3EE",
    "accent2": "#818CF8",
    "success": "#10B981",
    "warning": "#F59E0B"
  },
  "typography": {
    "primary": "Inter",
    "mono": "JetBrains Mono"
  },
  "metadata": {
    "appName": "Forge",
    "tagline": "Infrastructure command center for engineering teams",
    "archetype": "devtools-monitor",
    "theme": "dark",
    "createdAt": "2026-04-04T00:00:00Z",
    "inspiration": "Neon.tech ultra-dark electric-cyan palette + Midday.ai tabbed feature exploration"
  }
};

fs.writeFileSync('/workspace/group/design-studio/forge.pen', JSON.stringify(pen, null, 2));
console.log('✓ forge.pen written —', pen.screens.length, 'screens');
