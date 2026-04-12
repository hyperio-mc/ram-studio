#!/usr/bin/env node
// LUMIS — See through your finances
// Inspired by: "Fluid Glass" Awwwards Site of the Day, March 30 2026 (by Exo Ape)
//              Liquid glassmorphism — physics-based translucent panels floating over
//              soft gradient underlays. Frosted surfaces that let background colour
//              bleed through, creating tactile depth without heavy drop-shadows.
//              Also: Neon.com dark-mode showcase (DarkModeDesign.com) — bold
//              typographic hierarchy with AI-era positioning.
// Theme: LIGHT (ZENITH was dark → rotating to light)
// Challenge: Personal finance clarity app using "liquid glass" aesthetic —
//            translucent cards over lavender→peach gradient fields, no harsh
//            borders, all depth via backdrop-blur + subtle tints.

const fs = require('fs');

const SLUG = 'lumis';

const pen = {
  version: "2.8",
  meta: {
    name: "LUMIS",
    tagline: "See through your finances",
    archetype: "personal-finance-clarity",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "light"
  },

  // PRIMARY: light (liquid glass on cream)
  palette: {
    bg:            "#F3F0EC",
    bgGrad1:       "#EDE9FE",   // lavender gradient zone
    bgGrad2:       "#FFF0E8",   // peach gradient zone
    bgGrad3:       "#E0F2FE",   // sky blue gradient zone
    surface:       "rgba(255,255,255,0.62)",
    surfaceStrong: "rgba(255,255,255,0.82)",
    surfaceAlt:    "rgba(237,233,254,0.45)",
    glass:         "rgba(255,255,255,0.52)",
    glassBorder:   "rgba(255,255,255,0.80)",
    text:          "#1C1917",
    textMuted:     "rgba(28,25,23,0.42)",
    textSoft:      "rgba(28,25,23,0.26)",
    accent:        "#6B4FE9",
    accentSoft:    "rgba(107,79,233,0.10)",
    accentMid:     "rgba(107,79,233,0.22)",
    accent2:       "#F97316",
    accent2Soft:   "rgba(249,115,22,0.10)",
    green:         "#059669",
    greenSoft:     "rgba(5,150,105,0.10)",
    red:           "#DC2626",
    redSoft:       "rgba(220,38,38,0.10)",
    amber:         "#D97706",
    amberSoft:     "rgba(217,119,6,0.10)",
    border:        "rgba(28,25,23,0.08)",
    borderStrong:  "rgba(28,25,23,0.14)"
  },

  // DARK counterpart
  darkPalette: {
    bg:          "#0D0B14",
    surface:     "rgba(255,255,255,0.06)",
    surfaceAlt:  "rgba(255,255,255,0.03)",
    glass:       "rgba(255,255,255,0.05)",
    glassBorder: "rgba(255,255,255,0.12)",
    text:        "#F5F3FF",
    textMuted:   "rgba(245,243,255,0.45)",
    accent:      "#9B7FFF",
    accent2:     "#FF8C42",
    green:       "#34D399",
    red:         "#F87171",
    amber:       "#FBBF24",
    border:      "rgba(245,243,255,0.07)"
  },

  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    displayFamily: "'Cal Sans', 'Inter', sans-serif",
    scale: { xs: 10, sm: 11, base: 13, md: 14, lg: 17, xl: 22, xxl: 32, hero: 48, display: 64 }
  },

  screens: [

    // ─── SCREEN 1: OVERVIEW ───────────────────────────────────────────────────
    {
      id: "overview",
      label: "Overview",
      description: "Net worth hero + glass metric cards floating over gradient field",
      gradientField: { from: "#EDE9FE", via: "#F3F0EC", to: "#FFF0E8", angle: 135 },
      components: [

        // Topbar
        {
          type: "glass-topbar",
          title: "LUMIS",
          subtitle: "April 2026",
          glassStyle: true,
          rightItems: [
            { type: "avatar-badge", initials: "AK", label: "Aiko K." },
            { type: "icon-btn", icon: "bell", badge: "2" }
          ]
        },

        // Hero net worth card — large glass panel with gradient bleed
        {
          type: "glass-hero-card",
          gradientBleed: { color1: "#EDE9FE", color2: "#E0F2FE", opacity: 0.7 },
          eyebrow: "NET WORTH",
          value: "$284,910",
          delta: { value: "+$4,230", pct: "+1.5%", dir: "up", period: "this month" },
          caption: "Across 6 accounts · updated now",
          sparkline: [62, 58, 65, 70, 68, 74, 71, 78, 76, 82, 80, 86, 84, 90, 88, 94],
          glassTint: "lavender"
        },

        // 3 glass metric chips row
        {
          type: "glass-metric-row",
          items: [
            { label: "Income",   value: "$8,400",  delta: "+3%",  color: "green",  icon: "trending-up"  },
            { label: "Spend",    value: "$3,240",  delta: "-8%",  color: "accent", icon: "activity"     },
            { label: "Saved",    value: "$1,860",  delta: "+22%", color: "accent2",icon: "zap"          }
          ]
        },

        // Spending donut + category legend in glass card
        {
          type: "glass-donut-card",
          title: "Spending breakdown",
          period: "March",
          total: "$3,240",
          chart: {
            segments: [
              { label: "Housing",    pct: 35, color: "#6B4FE9" },
              { label: "Food",       pct: 22, color: "#F97316" },
              { label: "Transport",  pct: 14, color: "#059669" },
              { label: "Health",     pct: 12, color: "#E879F9" },
              { label: "Other",      pct: 17, color: "#94A3B8" }
            ]
          },
          legendInline: true
        },

        // AI insight chip — glass with soft accent tint
        {
          type: "glass-insight-chip",
          icon: "zap",
          text: "You spent 18% less on food than last month. On track to hit your $500 savings goal.",
          accentColor: "accent"
        },

        // Bottom nav
        {
          type: "glass-bottom-nav",
          items: [
            { id: "overview",     icon: "home",     label: "Overview",  active: true  },
            { id: "accounts",     icon: "layers",   label: "Accounts"                 },
            { id: "transactions", icon: "list",     label: "Activity"                 },
            { id: "budget",       icon: "chart",    label: "Budget"                   },
            { id: "insights",     icon: "eye",      label: "Insights"                 }
          ]
        }
      ]
    },

    // ─── SCREEN 2: ACCOUNTS ───────────────────────────────────────────────────
    {
      id: "accounts",
      label: "Accounts",
      description: "Connected accounts as frosted glass list cards",
      gradientField: { from: "#E0F2FE", via: "#F3F0EC", to: "#EDE9FE", angle: 150 },
      components: [

        {
          type: "glass-topbar",
          title: "Accounts",
          subtitle: "6 connected",
          leftAction: { icon: "back" },
          rightItems: [{ type: "icon-btn", icon: "plus", label: "Link" }]
        },

        // Total summary pill
        {
          type: "glass-summary-pill",
          label: "Total balance",
          value: "$284,910",
          delta: "+$4,230 today",
          deltaDir: "up"
        },

        // Account cards
        {
          type: "glass-account-list",
          sections: [
            {
              label: "BANKING",
              items: [
                {
                  bank: "Chase",
                  accountType: "Checking",
                  accountLast4: "4821",
                  balance: "$12,440",
                  delta: "+$840",
                  deltaDir: "up",
                  color: "#1755F4",
                  icon: "💳",
                  status: "synced"
                },
                {
                  bank: "Marcus",
                  accountType: "HYSA",
                  accountLast4: "0034",
                  balance: "$48,200",
                  delta: "+$124 interest",
                  deltaDir: "up",
                  color: "#059669",
                  icon: "🏦",
                  status: "synced"
                }
              ]
            },
            {
              label: "INVESTMENTS",
              items: [
                {
                  bank: "Fidelity",
                  accountType: "Brokerage",
                  accountLast4: "7702",
                  balance: "$143,800",
                  delta: "+2.4% this wk",
                  deltaDir: "up",
                  color: "#6B4FE9",
                  icon: "📈",
                  status: "synced"
                },
                {
                  bank: "Coinbase",
                  accountType: "Crypto",
                  accountLast4: "—",
                  balance: "$18,470",
                  delta: "-4.1% today",
                  deltaDir: "down",
                  color: "#F97316",
                  icon: "₿",
                  status: "synced"
                }
              ]
            },
            {
              label: "CREDIT",
              items: [
                {
                  bank: "Amex",
                  accountType: "Platinum",
                  accountLast4: "1009",
                  balance: "-$3,240",
                  delta: "Due Apr 18",
                  deltaDir: "neutral",
                  color: "#C0A060",
                  icon: "💎",
                  status: "due-soon",
                  utilisation: 18
                }
              ]
            }
          ]
        },

        {
          type: "glass-cta-button",
          label: "Link new account",
          icon: "plus",
          style: "outline-glass"
        },

        { type: "glass-bottom-nav", activeId: "accounts",
          items: [
            { id: "overview",     icon: "home",   label: "Overview"              },
            { id: "accounts",     icon: "layers", label: "Accounts",  active: true },
            { id: "transactions", icon: "list",   label: "Activity"              },
            { id: "budget",       icon: "chart",  label: "Budget"                },
            { id: "insights",     icon: "eye",    label: "Insights"              }
          ]
        }
      ]
    },

    // ─── SCREEN 3: TRANSACTIONS ───────────────────────────────────────────────
    {
      id: "transactions",
      label: "Activity",
      description: "Glass transaction feed with smart categories and inline search",
      gradientField: { from: "#FFF0E8", via: "#F3F0EC", to: "#EDE9FE", angle: 120 },
      components: [

        {
          type: "glass-topbar",
          title: "Activity",
          subtitle: "Last 30 days",
          rightItems: [
            { type: "icon-btn", icon: "filter" },
            { type: "icon-btn", icon: "search" }
          ]
        },

        // Horizontal filter chips
        {
          type: "glass-filter-chips",
          chips: [
            { label: "All",       active: true  },
            { label: "Food",      color: "#F97316" },
            { label: "Housing",   color: "#6B4FE9" },
            { label: "Transport", color: "#059669" },
            { label: "Health",    color: "#E879F9" }
          ]
        },

        // Transaction feed
        {
          type: "glass-tx-feed",
          groups: [
            {
              date: "Today",
              items: [
                { icon: "🍜", merchant: "Ramen-Ya", category: "Food",      amount: "-$18.40",  dir: "out", time: "12:32",  account: "Chase ••4821" },
                { icon: "🚌", merchant: "MTA Metro",category: "Transport", amount: "-$2.90",   dir: "out", time: "08:14",  account: "Chase ••4821" }
              ]
            },
            {
              date: "Yesterday",
              items: [
                { icon: "💼", merchant: "Salary",   category: "Income",    amount: "+$4,200",  dir: "in",  time: "09:00",  account: "Chase ••4821", tag: "payroll" },
                { icon: "🏋️", merchant: "Equinox",  category: "Health",    amount: "-$180.00", dir: "out", time: "07:55",  account: "Amex ••1009" },
                { icon: "☁️", merchant: "AWS",      category: "Tech",      amount: "-$24.50",  dir: "out", time: "00:01",  account: "Amex ••1009" }
              ]
            },
            {
              date: "Mar 28",
              items: [
                { icon: "🛒", merchant: "Whole Foods", category: "Food",  amount: "-$112.40", dir: "out", time: "18:22", account: "Chase ••4821" },
                { icon: "💡", merchant: "ConEd",    category: "Housing",   amount: "-$94.00",  dir: "out", time: "10:00", account: "Chase ••4821" }
              ]
            }
          ]
        },

        { type: "glass-bottom-nav", activeId: "transactions",
          items: [
            { id: "overview",     icon: "home",   label: "Overview"              },
            { id: "accounts",     icon: "layers", label: "Accounts"              },
            { id: "transactions", icon: "list",   label: "Activity", active: true },
            { id: "budget",       icon: "chart",  label: "Budget"                },
            { id: "insights",     icon: "eye",    label: "Insights"              }
          ]
        }
      ]
    },

    // ─── SCREEN 4: BUDGET ─────────────────────────────────────────────────────
    {
      id: "budget",
      label: "Budget",
      description: "Liquid-glass progress rings and budget category sliders",
      gradientField: { from: "#EDE9FE", via: "#F8F5FF", to: "#FFF0E8", angle: 160 },
      components: [

        {
          type: "glass-topbar",
          title: "Budget",
          subtitle: "April · 1 of 30 days",
          rightItems: [{ type: "icon-btn", icon: "settings" }]
        },

        // Big glass progress ring — overall month budget
        {
          type: "glass-ring-hero",
          title: "Monthly budget",
          spent: 420,
          total: 3500,
          spentLabel: "$420 spent",
          remainLabel: "$3,080 left",
          pct: 12,
          ringColor: "accent",
          caption: "On track · 28 days left"
        },

        // Budget category list with glass progress bars
        {
          type: "glass-budget-categories",
          items: [
            { label: "Housing",   budget: 1200, spent: 94,   color: "#6B4FE9", icon: "🏠" },
            { label: "Food",      budget: 600,  spent: 131,  color: "#F97316", icon: "🍽️" },
            { label: "Transport", budget: 200,  spent: 53,   color: "#059669", icon: "🚌" },
            { label: "Health",    budget: 300,  spent: 180,  color: "#E879F9", icon: "💊" },
            { label: "Shopping",  budget: 400,  spent: 0,    color: "#94A3B8", icon: "🛍️" },
            { label: "Savings",   budget: 500,  spent: 0,    color: "#059669", icon: "🏦", isGoal: true }
          ]
        },

        // Glass savings goal card
        {
          type: "glass-goal-card",
          icon: "✈️",
          label: "Japan trip",
          target: 5000,
          current: 2800,
          pct: 56,
          deadline: "Sep 2026",
          color: "accent"
        },

        { type: "glass-bottom-nav", activeId: "budget",
          items: [
            { id: "overview",     icon: "home",   label: "Overview"              },
            { id: "accounts",     icon: "layers", label: "Accounts"              },
            { id: "transactions", icon: "list",   label: "Activity"              },
            { id: "budget",       icon: "chart",  label: "Budget",   active: true },
            { id: "insights",     icon: "eye",    label: "Insights"              }
          ]
        }
      ]
    },

    // ─── SCREEN 5: INSIGHTS ───────────────────────────────────────────────────
    {
      id: "insights",
      label: "Insights",
      description: "AI-generated glass analysis cards with sparklines and trend chips",
      gradientField: { from: "#E0F2FE", via: "#EDE9FE", to: "#FFF0E8", angle: 145 },
      components: [

        {
          type: "glass-topbar",
          title: "Insights",
          subtitle: "AI-powered · updated 2m ago",
          rightItems: [{ type: "icon-btn", icon: "zap", label: "Ask" }]
        },

        // Weekly trend sparkline card
        {
          type: "glass-trend-card",
          title: "Spending trend",
          period: "Last 8 weeks",
          sparkline: [420, 510, 380, 460, 390, 480, 340, 420],
          labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
          color: "accent",
          delta: { value: "-12%", label: "vs avg", dir: "down", positive: true }
        },

        // AI insight cards (glass with gradient tint)
        {
          type: "glass-insight-cards",
          cards: [
            {
              priority: "high",
              icon: "📉",
              tint: "greenSoft",
              title: "Great food month",
              body: "Food spend down 18% vs March. You saved $34 compared to your average.",
              cta: "See transactions",
              ctaIcon: "arrow-right"
            },
            {
              priority: "medium",
              icon: "⚡",
              tint: "amberSoft",
              title: "Subscription check",
              body: "6 recurring charges ($128/mo) flagged. 2 look unused based on login history.",
              cta: "Review subscriptions",
              ctaIcon: "arrow-right"
            },
            {
              priority: "info",
              icon: "📈",
              tint: "accentSoft",
              title: "HYSA rate update",
              body: "Marcus rate moved from 4.7% to 5.0% APY. Estimated +$200/yr on your balance.",
              cta: "View account",
              ctaIcon: "arrow-right"
            }
          ]
        },

        // Net worth over time (12-month) — glass area chart card
        {
          type: "glass-area-chart-card",
          title: "Net worth growth",
          period: "12 months",
          data: [226000, 231000, 238000, 235000, 243000, 249000, 252000, 258000, 261000, 270000, 278000, 284910],
          labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
          color: "accent",
          fillOpacity: 0.12,
          startValue: "$226,000",
          endValue:   "$284,910",
          delta: "+$58,910 (+26%)"
        },

        { type: "glass-bottom-nav", activeId: "insights",
          items: [
            { id: "overview",     icon: "home",   label: "Overview"              },
            { id: "accounts",     icon: "layers", label: "Accounts"              },
            { id: "transactions", icon: "list",   label: "Activity"              },
            { id: "budget",       icon: "chart",  label: "Budget"                },
            { id: "insights",     icon: "eye",    label: "Insights", active: true }
          ]
        }
      ]
    }

  ] // end screens
};

fs.writeFileSync(`${SLUG}.pen`, JSON.stringify(pen, null, 2));
console.log(`✓ ${SLUG}.pen written (${JSON.stringify(pen).length} chars, ${pen.screens.length} screens)`);
