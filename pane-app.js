#!/usr/bin/env node
// PANE — Retro-windowed AI knowledge workspace
// Inspired by: "Chus Retro OS Portfolio" on Minimal Gallery (retro OS UI trend)
//              + Land-book warm off-white palette (#f7f6f5 trend)
// Theme: LIGHT (STRIDE was dark → rotating to light)

const fs = require('fs');

const pen = {
  version: "2.8",
  meta: {
    name: "PANE",
    tagline: "Your retro-windowed AI workspace",
    archetype: "ai-knowledge-os",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "light"
  },
  palette: {
    bg: "#F5F1EB",
    surface: "#FFFFFF",
    surfaceAlt: "#EDE9E2",
    text: "#1A1714",
    textMuted: "rgba(26,23,20,0.45)",
    accent: "#C04B2C",
    accent2: "#4A6FE3",
    accentSoft: "rgba(192,75,44,0.1)",
    accent2Soft: "rgba(74,111,227,0.1)",
    border: "rgba(26,23,20,0.12)",
    borderStrong: "rgba(26,23,20,0.22)",
    windowBar: "#E8E3DB",
    windowDot1: "#FF6059",
    windowDot2: "#FFBD30",
    windowDot3: "#29C940",
    mono: "#4A3F35",
    monoSoft: "rgba(74,63,53,0.6)"
  },
  darkPalette: {
    bg: "#161210",
    surface: "#1E1B17",
    surfaceAlt: "#252118",
    text: "#F2EDE4",
    textMuted: "rgba(242,237,228,0.45)",
    accent: "#E0603A",
    accent2: "#5B8EFF",
    accentSoft: "rgba(224,96,58,0.12)",
    accent2Soft: "rgba(91,142,255,0.12)",
    border: "rgba(242,237,228,0.1)",
    borderStrong: "rgba(242,237,228,0.2)",
    windowBar: "#2A2520",
    windowDot1: "#FF6059",
    windowDot2: "#FFBD30",
    windowDot3: "#29C940",
    mono: "#C8B89A",
    monoSoft: "rgba(200,184,154,0.55)"
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    monoFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    scale: { xs: 11, sm: 12, base: 14, md: 15, lg: 18, xl: 22, xxl: 28, hero: 36 }
  },
  screens: [
    {
      id: "desktop",
      label: "Desktop",
      description: "OS-style home with window tiles, recent docs, and AI status",
      components: [
        {
          type: "os-header",
          leftItems: ["PANE", "File", "Edit", "View", "AI"],
          rightItems: ["09:42", "◐", "⌘"],
          style: "menubar"
        },
        {
          type: "hero-greeting",
          headline: "Good morning, Rakis",
          subline: "3 windows open · AI ready · 12 sources indexed",
          cta: "New Window"
        },
        {
          type: "window-grid",
          columns: 3,
          windows: [
            {
              title: "Research: Neural Interfaces",
              type: "document",
              status: "active",
              preview: "Cortical plasticity studies suggest...",
              wordCount: "2,847 words",
              modified: "2 min ago",
              accentDot: "accent"
            },
            {
              title: "Source Library",
              type: "library",
              status: "idle",
              preview: "42 sources · 8 unread",
              modified: "1 hr ago",
              accentDot: "accent2"
            },
            {
              title: "AI Chat — GPT-5",
              type: "terminal",
              status: "thinking",
              preview: "Comparing frameworks across...",
              modified: "just now",
              accentDot: "accent"
            }
          ]
        },
        {
          type: "quick-actions",
          label: "Quick Open",
          items: [
            { icon: "doc", label: "New Document" },
            { icon: "search", label: "Search All" },
            { icon: "import", label: "Import PDF" },
            { icon: "ai", label: "Ask AI" }
          ]
        },
        {
          type: "recent-list",
          label: "Recent",
          items: [
            { title: "Climate Policy Draft", type: "doc", time: "Today" },
            { title: "arxiv:2401.09981", type: "paper", time: "Yesterday" },
            { title: "Interview Notes — Dr. Park", type: "note", time: "Mon" }
          ]
        },
        {
          type: "os-dock",
          items: ["Desktop", "Research", "Library", "AI Chat", "Insights", "Settings"]
        }
      ]
    },
    {
      id: "research",
      label: "Research",
      description: "Windowed document editor with AI annotation sidebar",
      components: [
        {
          type: "window-chrome",
          title: "Research: Neural Interfaces.pane",
          windowControls: true,
          toolbar: ["Bold", "Italic", "Link", "Cite", "AI ✦"]
        },
        {
          type: "document-body",
          title: "Cortical Plasticity in Neural Interface Design",
          body: "Recent advances in high-density electrode arrays have enabled unprecedented signal resolution. Chronic implant studies (Park et al., 2024) demonstrate 94% signal retention across 18-month periods, challenging previous assumptions about glial scarring...",
          annotations: [
            { text: "Park et al., 2024", type: "citation", note: "Opens source card" },
            { text: "94% signal retention", type: "ai-highlight", note: "AI-flagged key stat" }
          ],
          wordCount: "2,847",
          readingTime: "11 min"
        },
        {
          type: "ai-sidebar",
          label: "AI ✦ Suggestions",
          items: [
            { type: "insight", text: "This claim conflicts with Yoo et al. 2023 — add qualification?" },
            { type: "citation", text: "3 related papers found for 'glial scarring'" },
            { type: "rewrite", text: "Simplify paragraph 2 for broader audience?" }
          ]
        },
        {
          type: "citation-strip",
          label: "Sources in use",
          count: 7,
          items: ["Park 2024", "Yoo 2023", "Lin 2022", "+4"]
        }
      ]
    },
    {
      id: "library",
      label: "Library",
      description: "Source archive styled as OS file folders with metadata",
      components: [
        {
          type: "window-chrome",
          title: "Source Library — 42 items",
          windowControls: true,
          toolbar: ["All", "Papers", "Notes", "Web", "PDFs"]
        },
        {
          type: "filter-bar",
          search: "Search sources...",
          filters: ["All", "Unread", "Starred", "Recent"],
          sortBy: "Date added"
        },
        {
          type: "source-grid",
          columns: 2,
          items: [
            {
              type: "paper",
              title: "Chronic Neural Interface Stability in Cortical Recordings",
              authors: "Park, Kim, Okonkwo",
              year: "2024",
              journal: "Nature Neuroscience",
              tags: ["neuroscience", "BCI"],
              read: false,
              starred: true
            },
            {
              type: "paper",
              title: "Glial Response Mitigation via Surface Coating",
              authors: "Yoo, Chen, Petrov",
              year: "2023",
              journal: "Journal of Neural Engineering",
              tags: ["glial", "coating"],
              read: true,
              starred: false
            },
            {
              type: "note",
              title: "Interview Notes — Dr. Park",
              source: "Personal",
              date: "Mar 24, 2026",
              tags: ["interview", "primary"],
              read: true,
              starred: true
            },
            {
              type: "web",
              title: "FDA Breakthrough Device Designation — NeuralOS",
              source: "fda.gov",
              date: "Mar 12, 2026",
              tags: ["regulatory", "FDA"],
              read: false,
              starred: false
            }
          ]
        },
        {
          type: "library-stats",
          stats: [
            { label: "Total", value: "42" },
            { label: "Unread", value: "8" },
            { label: "Starred", value: "11" },
            { label: "PDFs", value: "29" }
          ]
        }
      ]
    },
    {
      id: "ai-chat",
      label: "AI Chat",
      description: "Typewriter-style AI terminal with monospace output",
      components: [
        {
          type: "window-chrome",
          title: "AI Chat — GPT-5 Turbo · Session #4",
          windowControls: true,
          statusBadge: { text: "Connected", color: "green" }
        },
        {
          type: "terminal-header",
          label: "PANE AI TERMINAL v2.1",
          subtitle: "Model: GPT-5-turbo · Context: 127K tokens · Temperature: 0.7",
          style: "mono"
        },
        {
          type: "chat-messages",
          messages: [
            {
              role: "user",
              content: "Compare the signal degradation curves across the three papers I have tagged 'BCI'",
              timestamp: "09:38"
            },
            {
              role: "ai",
              content: "Comparing signal degradation across BCI-tagged papers:\n\n→ Park 2024: 6% decay over 18mo (best)\n→ Yoo 2023: 18% decay over 12mo (coating variant)\n→ Lin 2022: 31% decay over 6mo (baseline)\n\nKey finding: surface coating (Yoo method) reduces long-term decay by ~41% vs baseline. Park's array design compounds this effect.",
              timestamp: "09:38",
              style: "mono",
              tokens: 89
            },
            {
              role: "user",
              content: "Can you draft a synthesis paragraph combining these findings?",
              timestamp: "09:41"
            },
            {
              role: "ai",
              content: "Drafting synthesis...",
              timestamp: "09:42",
              style: "mono",
              status: "streaming"
            }
          ]
        },
        {
          type: "chat-input",
          placeholder: "Ask about your research, request a draft, or query sources...",
          actions: ["Sources", "Draft", "Cite", "⏎ Send"]
        }
      ]
    },
    {
      id: "insights",
      label: "Insights",
      description: "Research analytics dashboard — reading velocity, source maps, AI usage",
      components: [
        {
          type: "window-chrome",
          title: "Insights — March 2026",
          windowControls: true
        },
        {
          type: "metric-row",
          items: [
            { label: "Sources read", value: "34", delta: "+8 this week" },
            { label: "Words written", value: "18.4K", delta: "+3.2K today" },
            { label: "AI queries", value: "127", delta: "+23 today" },
            { label: "Citing rate", value: "92%", delta: "↑ from 78%" }
          ]
        },
        {
          type: "activity-heatmap",
          label: "Reading Activity — Last 30 Days",
          description: "Grid of daily activity intensity",
          weeks: 5
        },
        {
          type: "source-breakdown",
          label: "Sources by Type",
          items: [
            { label: "Academic papers", pct: 68, count: 29 },
            { label: "Web articles", pct: 19, count: 8 },
            { label: "Personal notes", pct: 13, count: 5 }
          ]
        },
        {
          type: "ai-usage-log",
          label: "Recent AI Interactions",
          items: [
            { query: "Compare BCI degradation curves", time: "09:38", tokens: 89 },
            { query: "Summarize Park 2024 key findings", time: "08:15", tokens: 210 },
            { query: "Find contradictions in my claims", time: "Yesterday", tokens: 143 }
          ]
        }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      description: "OS preferences panel with retro segmented controls",
      components: [
        {
          type: "window-chrome",
          title: "PANE Preferences",
          windowControls: true
        },
        {
          type: "settings-nav",
          items: ["General", "AI Model", "Appearance", "Shortcuts", "Integrations"],
          active: "Appearance"
        },
        {
          type: "settings-section",
          title: "Appearance",
          fields: [
            {
              type: "segmented",
              label: "Theme",
              options: ["Light", "Dark", "System"],
              value: "Light"
            },
            {
              type: "segmented",
              label: "Window style",
              options: ["Retro OS", "Minimal", "Floating"],
              value: "Retro OS"
            },
            {
              type: "segmented",
              label: "Font",
              options: ["Inter", "System", "Serif"],
              value: "Inter"
            },
            {
              type: "toggle",
              label: "Show OS menubar",
              value: true
            },
            {
              type: "toggle",
              label: "Monospace AI output",
              value: true
            },
            {
              type: "toggle",
              label: "Window dot controls",
              value: true
            },
            {
              type: "color-swatch",
              label: "Accent color",
              options: ["#C04B2C", "#4A6FE3", "#2DAA6F", "#9B5FC0", "#D4A017"],
              value: "#C04B2C"
            }
          ]
        },
        {
          type: "settings-footer",
          version: "PANE v1.0.0",
          actions: ["Reset to defaults", "Export settings"]
        }
      ]
    }
  ],
  navigation: {
    type: "os-dock",
    items: [
      { id: "desktop", label: "Desktop", icon: "grid" },
      { id: "research", label: "Research", icon: "layers" },
      { id: "library", label: "Library", icon: "list" },
      { id: "ai-chat", label: "AI Chat", icon: "message" },
      { id: "insights", label: "Insights", icon: "chart" },
      { id: "settings", label: "Settings", icon: "settings" }
    ]
  },
  designNotes: {
    inspiration: "Chus Retro OS Portfolio on Minimal Gallery — desktop OS metaphors applied to modern tools. Also Land-book's warm off-white (#f7f6f5) palette trend replacing clinical white.",
    decisions: [
      "Window chrome (title bar + traffic light dots) as the primary card component — every panel is a 'window'",
      "Monospace JetBrains Mono for all AI output — creates a terminal-typewriter feel that grounds the AI in craft",
      "Warm terracotta (#C04B2C) accent from earthy Land-book palette — bridges nostalgic and modern without feeling retro-kitsch"
    ],
    critique: "The retro OS chrome risks feeling like cosplay rather than considered design — without actual drag/resize interactions, the window metaphor is decorative rather than functional"
  }
};

fs.writeFileSync('pane.pen', JSON.stringify(pen, null, 2));
console.log('✓ pane.pen written');
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Theme: ${pen.meta.theme}`);
console.log(`  Palette: ${pen.palette.bg} bg, ${pen.palette.accent} accent`);
