const fs = require('fs');

// EPOCH - Your year, rendered.
// Inspired by Awwwards "Unseen Studio 2025 Wrapped" — editorial dark annual review aesthetic
// Deep obsidian base + warm amber + indigo accents — dark theme

const pen = {
  "version": "2.8",
  "name": "EPOCH",
  "description": "Annual intelligence platform that renders your year as immersive visual data — work patterns, creative output, and key moments in one cinematic dashboard.",
  "settings": {
    "viewport": { "width": 390, "height": 844 },
    "fontFamily": "Inter",
    "backgroundColor": "#09090E",
    "statusBar": "light"
  },
  "screens": [
    {
      "id": "screen1",
      "name": "Year Wrapped",
      "backgroundColor": "#09090E",
      "elements": [
        // Top nav
        {
          "id": "e1", "type": "rectangle",
          "x": 0, "y": 0, "width": 390, "height": 56,
          "fill": "#09090E",
          "opacity": 1
        },
        {
          "id": "e2", "type": "text",
          "x": 24, "y": 18, "width": 80, "height": 22,
          "text": "EPOCH",
          "fontSize": 14, "fontWeight": "700",
          "letterSpacing": 4,
          "fill": "#EBE8F7"
        },
        {
          "id": "e3", "type": "text",
          "x": 300, "y": 18, "width": 66, "height": 22,
          "text": "2025 ↗",
          "fontSize": 13, "fontWeight": "500",
          "fill": "#F5A623"
        },
        // Big headline
        {
          "id": "e4", "type": "text",
          "x": 24, "y": 76, "width": 342, "height": 56,
          "text": "Your Year,\nRendered.",
          "fontSize": 38, "fontWeight": "700",
          "lineHeight": 1.15,
          "fill": "#EBE8F7",
          "letterSpacing": -1
        },
        // Subtext
        {
          "id": "e5", "type": "text",
          "x": 24, "y": 145, "width": 280, "height": 36,
          "text": "2,847 hours of focused work. 394 tasks shipped. One story.",
          "fontSize": 14, "fontWeight": "400",
          "fill": "rgba(235,232,247,0.5)",
          "lineHeight": 1.45
        },
        // Hero stat card
        {
          "id": "e6", "type": "rectangle",
          "x": 24, "y": 200, "width": 342, "height": 200,
          "fill": "#131320",
          "cornerRadius": 20,
          "border": { "color": "rgba(245,166,35,0.18)", "width": 1 }
        },
        // Decorative gradient orb
        {
          "id": "e7", "type": "ellipse",
          "x": 220, "y": 205, "width": 150, "height": 150,
          "fill": "rgba(245,166,35,0.08)",
          "opacity": 1
        },
        {
          "id": "e8", "type": "text",
          "x": 40, "y": 220, "width": 180, "height": 16,
          "text": "FOCUS SCORE",
          "fontSize": 10, "fontWeight": "700",
          "letterSpacing": 3,
          "fill": "rgba(235,232,247,0.4)"
        },
        {
          "id": "e9", "type": "text",
          "x": 40, "y": 242, "width": 200, "height": 80,
          "text": "94",
          "fontSize": 72, "fontWeight": "800",
          "fill": "#F5A623",
          "letterSpacing": -3
        },
        {
          "id": "e10", "type": "text",
          "x": 40, "y": 325, "width": 220, "height": 18,
          "text": "Top 3% globally · +11pts from 2024",
          "fontSize": 12, "fontWeight": "500",
          "fill": "rgba(235,232,247,0.55)"
        },
        {
          "id": "e10b", "type": "rectangle",
          "x": 40, "y": 355, "width": 130, "height": 28,
          "fill": "rgba(245,166,35,0.15)",
          "cornerRadius": 14,
          "border": { "color": "rgba(245,166,35,0.3)", "width": 1 }
        },
        {
          "id": "e10c", "type": "text",
          "x": 52, "y": 362, "width": 106, "height": 16,
          "text": "🏆  Best Year Yet",
          "fontSize": 11, "fontWeight": "600",
          "fill": "#F5A623"
        },
        // Three mini stat cards
        {
          "id": "e11", "type": "rectangle",
          "x": 24, "y": 418, "width": 104, "height": 90,
          "fill": "#131320",
          "cornerRadius": 14,
          "border": { "color": "rgba(124,111,255,0.2)", "width": 1 }
        },
        {
          "id": "e12", "type": "text",
          "x": 36, "y": 433, "width": 80, "height": 14,
          "text": "TASKS",
          "fontSize": 9, "fontWeight": "700",
          "letterSpacing": 2,
          "fill": "rgba(235,232,247,0.4)"
        },
        {
          "id": "e13", "type": "text",
          "x": 36, "y": 452, "width": 80, "height": 36,
          "text": "394",
          "fontSize": 28, "fontWeight": "800",
          "fill": "#7C6FFF"
        },
        {
          "id": "e14", "type": "text",
          "x": 36, "y": 488, "width": 80, "height": 14,
          "text": "shipped",
          "fontSize": 11, "fontWeight": "400",
          "fill": "rgba(235,232,247,0.4)"
        },
        {
          "id": "e15", "type": "rectangle",
          "x": 143, "y": 418, "width": 104, "height": 90,
          "fill": "#131320",
          "cornerRadius": 14,
          "border": { "color": "rgba(124,111,255,0.2)", "width": 1 }
        },
        {
          "id": "e16", "type": "text",
          "x": 155, "y": 433, "width": 80, "height": 14,
          "text": "HOURS",
          "fontSize": 9, "fontWeight": "700",
          "letterSpacing": 2,
          "fill": "rgba(235,232,247,0.4)"
        },
        {
          "id": "e17", "type": "text",
          "x": 155, "y": 452, "width": 80, "height": 36,
          "text": "2.8K",
          "fontSize": 28, "fontWeight": "800",
          "fill": "#7C6FFF"
        },
        {
          "id": "e18", "type": "text",
          "x": 155, "y": 488, "width": 80, "height": 14,
          "text": "focused",
          "fontSize": 11, "fontWeight": "400",
          "fill": "rgba(235,232,247,0.4)"
        },
        {
          "id": "e19", "type": "rectangle",
          "x": 262, "y": 418, "width": 104, "height": 90,
          "fill": "#131320",
          "cornerRadius": 14,
          "border": { "color": "rgba(124,111,255,0.2)", "width": 1 }
        },
        {
          "id": "e20", "type": "text",
          "x": 274, "y": 433, "width": 80, "height": 14,
          "text": "STREAK",
          "fontSize": 9, "fontWeight": "700",
          "letterSpacing": 2,
          "fill": "rgba(235,232,247,0.4)"
        },
        {
          "id": "e21", "type": "text",
          "x": 274, "y": 452, "width": 80, "height": 36,
          "text": "47d",
          "fontSize": 28, "fontWeight": "800",
          "fill": "#7C6FFF"
        },
        {
          "id": "e22", "type": "text",
          "x": 274, "y": 488, "width": 80, "height": 14,
          "text": "best run",
          "fontSize": 11, "fontWeight": "400",
          "fill": "rgba(235,232,247,0.4)"
        },
        // Progress bar label
        {
          "id": "e23", "type": "text",
          "x": 24, "y": 526, "width": 200, "height": 14,
          "text": "Annual goal progress",
          "fontSize": 12, "fontWeight": "500",
          "fill": "rgba(235,232,247,0.5)"
        },
        {
          "id": "e24", "type": "text",
          "x": 306, "y": 526, "width": 60, "height": 14,
          "text": "87%",
          "fontSize": 12, "fontWeight": "700",
          "fill": "#F5A623"
        },
        {
          "id": "e25", "type": "rectangle",
          "x": 24, "y": 546, "width": 342, "height": 6,
          "fill": "#1E1E2E",
          "cornerRadius": 3
        },
        {
          "id": "e26", "type": "rectangle",
          "x": 24, "y": 546, "width": 298, "height": 6,
          "fill": "#F5A623",
          "cornerRadius": 3
        },
        // CTA
        {
          "id": "e27", "type": "rectangle",
          "x": 24, "y": 580, "width": 342, "height": 52,
          "fill": "#F5A623",
          "cornerRadius": 16
        },
        {
          "id": "e28", "type": "text",
          "x": 24, "y": 595, "width": 342, "height": 22,
          "text": "See Your Full Story →",
          "fontSize": 15, "fontWeight": "700",
          "fill": "#09090E",
          "textAlign": "center"
        },
        // Bottom nav
        {
          "id": "e29", "type": "rectangle",
          "x": 0, "y": 736, "width": 390, "height": 84,
          "fill": "#09090E",
          "border": { "color": "rgba(235,232,247,0.06)", "width": 1 }
        },
        { "id": "e30", "type": "text", "x": 26, "y": 754, "width": 50, "height": 24, "text": "◑", "fontSize": 20, "fill": "#F5A623", "textAlign": "center" },
        { "id": "e31", "type": "text", "x": 26, "y": 776, "width": 50, "height": 12, "text": "Home", "fontSize": 9, "fontWeight": "600", "fill": "#F5A623", "textAlign": "center" },
        { "id": "e32", "type": "text", "x": 115, "y": 754, "width": 50, "height": 24, "text": "◈", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e33", "type": "text", "x": 115, "y": 776, "width": 50, "height": 12, "text": "Timeline", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e34", "type": "text", "x": 195, "y": 754, "width": 50, "height": 24, "text": "✦", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e35", "type": "text", "x": 195, "y": 776, "width": 50, "height": 12, "text": "Moments", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e36", "type": "text", "x": 280, "y": 754, "width": 50, "height": 24, "text": "⬡", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e37", "type": "text", "x": 280, "y": 776, "width": 50, "height": 12, "text": "Network", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e38", "type": "text", "x": 338, "y": 754, "width": 50, "height": 24, "text": "◎", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "e39", "type": "text", "x": 338, "y": 776, "width": 50, "height": 12, "text": "Insights", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" }
      ]
    },
    {
      "id": "screen2",
      "name": "Timeline",
      "backgroundColor": "#09090E",
      "elements": [
        { "id": "f1", "type": "rectangle", "x": 0, "y": 0, "width": 390, "height": 56, "fill": "#09090E" },
        { "id": "f2", "type": "text", "x": 24, "y": 18, "width": 80, "height": 22, "text": "EPOCH", "fontSize": 14, "fontWeight": "700", "letterSpacing": 4, "fill": "#EBE8F7" },
        { "id": "f3", "type": "text", "x": 280, "y": 18, "width": 86, "height": 22, "text": "2025 ↗", "fontSize": 13, "fontWeight": "500", "fill": "#F5A623" },
        // Section header
        { "id": "f4", "type": "text", "x": 24, "y": 72, "width": 200, "height": 28, "text": "Your Timeline", "fontSize": 22, "fontWeight": "700", "fill": "#EBE8F7", "letterSpacing": -0.5 },
        { "id": "f5", "type": "text", "x": 24, "y": 104, "width": 280, "height": 16, "text": "Activity heatmap across 2025", "fontSize": 13, "fill": "rgba(235,232,247,0.45)" },
        // Heatmap visual (month grid)
        { "id": "f6", "type": "rectangle", "x": 24, "y": 134, "width": 342, "height": 130, "fill": "#131320", "cornerRadius": 16, "border": { "color": "rgba(124,111,255,0.15)", "width": 1 } },
        { "id": "f7", "type": "text", "x": 36, "y": 146, "width": 100, "height": 14, "text": "JAN → DEC", "fontSize": 9, "fontWeight": "700", "letterSpacing": 2, "fill": "rgba(235,232,247,0.35)" },
        // Heatmap cells - row 1 (simulated with varied opacity rectangles)
        ...Array.from({length: 12}, (_, i) => ({
          "id": `f_hm_${i}`, "type": "rectangle",
          "x": 36 + i * 26, "y": 168,
          "width": 20, "height": 20,
          "fill": `rgba(245,166,35,${[0.15,0.25,0.4,0.6,0.8,0.95,0.7,0.55,0.85,0.45,0.3,0.2][i]})`,
          "cornerRadius": 4
        })),
        ...Array.from({length: 12}, (_, i) => ({
          "id": `f_hm2_${i}`, "type": "rectangle",
          "x": 36 + i * 26, "y": 196,
          "width": 20, "height": 20,
          "fill": `rgba(124,111,255,${[0.2,0.35,0.5,0.7,0.4,0.6,0.9,0.3,0.5,0.75,0.4,0.25][i]})`,
          "cornerRadius": 4
        })),
        ...Array.from({length: 12}, (_, i) => ({
          "id": `f_hm3_${i}`, "type": "rectangle",
          "x": 36 + i * 26, "y": 224,
          "width": 20, "height": 20,
          "fill": `rgba(245,166,35,${[0.1,0.2,0.3,0.45,0.65,0.5,0.8,0.6,0.4,0.55,0.35,0.15][i]})`,
          "cornerRadius": 4
        })),
        // Month labels
        { "id": "f8", "type": "text", "x": 36, "y": 252, "width": 318, "height": 12, "text": "J  F  M  A  M  J   J   A  S   O  N  D", "fontSize": 8, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "letterSpacing": 6 },
        // Peak month callout
        { "id": "f9", "type": "rectangle", "x": 24, "y": 280, "width": 165, "height": 72, "fill": "#131320", "cornerRadius": 14, "border": { "color": "rgba(245,166,35,0.25)", "width": 1 } },
        { "id": "f10", "type": "text", "x": 38, "y": 292, "width": 120, "height": 12, "text": "PEAK MONTH", "fontSize": 9, "fontWeight": "700", "letterSpacing": 2, "fill": "rgba(235,232,247,0.4)" },
        { "id": "f11", "type": "text", "x": 38, "y": 310, "width": 120, "height": 26, "text": "July 2025", "fontSize": 20, "fontWeight": "800", "fill": "#F5A623" },
        { "id": "f12", "type": "text", "x": 38, "y": 338, "width": 140, "height": 12, "text": "312 hrs · 48 tasks", "fontSize": 11, "fill": "rgba(235,232,247,0.5)" },
        // Deep work card
        { "id": "f13", "type": "rectangle", "x": 201, "y": 280, "width": 165, "height": 72, "fill": "#131320", "cornerRadius": 14, "border": { "color": "rgba(124,111,255,0.25)", "width": 1 } },
        { "id": "f14", "type": "text", "x": 215, "y": 292, "width": 120, "height": 12, "text": "DEEP WORK", "fontSize": 9, "fontWeight": "700", "letterSpacing": 2, "fill": "rgba(235,232,247,0.4)" },
        { "id": "f15", "type": "text", "x": 215, "y": 310, "width": 120, "height": 26, "text": "6.2h avg", "fontSize": 20, "fontWeight": "800", "fill": "#7C6FFF" },
        { "id": "f16", "type": "text", "x": 215, "y": 338, "width": 140, "height": 12, "text": "per day · top quartile", "fontSize": 11, "fill": "rgba(235,232,247,0.5)" },
        // Momentum chart label
        { "id": "f17", "type": "text", "x": 24, "y": 368, "width": 200, "height": 16, "text": "Momentum over time", "fontSize": 13, "fontWeight": "600", "fill": "#EBE8F7" },
        // Chart area
        { "id": "f18", "type": "rectangle", "x": 24, "y": 390, "width": 342, "height": 110, "fill": "#131320", "cornerRadius": 14, "border": { "color": "rgba(235,232,247,0.05)", "width": 1 } },
        // Simulated line chart bars
        ...Array.from({length: 12}, (_, i) => {
          const heights = [30,45,55,70,60,85,95,75,80,65,50,40];
          return {
            "id": `f_bar_${i}`, "type": "rectangle",
            "x": 40 + i * 26, "y": 500 - heights[i],
            "width": 16, "height": heights[i],
            "fill": i === 6 ? "#F5A623" : `rgba(124,111,255,${0.3 + i * 0.05})`,
            "cornerRadius": 4
          };
        }),
        // Bottom nav
        { "id": "f40", "type": "rectangle", "x": 0, "y": 736, "width": 390, "height": 84, "fill": "#09090E", "border": { "color": "rgba(235,232,247,0.06)", "width": 1 } },
        { "id": "f41", "type": "text", "x": 26, "y": 754, "width": 50, "height": 24, "text": "◑", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f42", "type": "text", "x": 26, "y": 776, "width": 50, "height": 12, "text": "Home", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f43", "type": "text", "x": 115, "y": 754, "width": 50, "height": 24, "text": "◈", "fontSize": 20, "fill": "#F5A623", "textAlign": "center" },
        { "id": "f44", "type": "text", "x": 115, "y": 776, "width": 50, "height": 12, "text": "Timeline", "fontSize": 9, "fontWeight": "600", "fill": "#F5A623", "textAlign": "center" },
        { "id": "f45", "type": "text", "x": 195, "y": 754, "width": 50, "height": 24, "text": "✦", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f46", "type": "text", "x": 195, "y": 776, "width": 50, "height": 12, "text": "Moments", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f47", "type": "text", "x": 280, "y": 754, "width": 50, "height": 24, "text": "⬡", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f48", "type": "text", "x": 280, "y": 776, "width": 50, "height": 12, "text": "Network", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f49", "type": "text", "x": 338, "y": 754, "width": 50, "height": 24, "text": "◎", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "f50", "type": "text", "x": 338, "y": 776, "width": 50, "height": 12, "text": "Insights", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" }
      ]
    },
    {
      "id": "screen3",
      "name": "Top Moments",
      "backgroundColor": "#09090E",
      "elements": [
        { "id": "g1", "type": "rectangle", "x": 0, "y": 0, "width": 390, "height": 56, "fill": "#09090E" },
        { "id": "g2", "type": "text", "x": 24, "y": 18, "width": 80, "height": 22, "text": "EPOCH", "fontSize": 14, "fontWeight": "700", "letterSpacing": 4, "fill": "#EBE8F7" },
        { "id": "g3", "type": "text", "x": 280, "y": 18, "width": 86, "height": 22, "text": "2025 ↗", "fontSize": 13, "fontWeight": "500", "fill": "#F5A623" },
        { "id": "g4", "type": "text", "x": 24, "y": 72, "width": 250, "height": 28, "text": "Top Moments", "fontSize": 22, "fontWeight": "700", "fill": "#EBE8F7", "letterSpacing": -0.5 },
        { "id": "g5", "type": "text", "x": 24, "y": 104, "width": 280, "height": 16, "text": "Your highest-impact days of the year", "fontSize": 13, "fill": "rgba(235,232,247,0.45)" },
        // Moment 1 - featured large card
        { "id": "g6", "type": "rectangle", "x": 24, "y": 134, "width": 342, "height": 120, "fill": "#131320", "cornerRadius": 18, "border": { "color": "rgba(245,166,35,0.3)", "width": 1 } },
        { "id": "g7", "type": "rectangle", "x": 24, "y": 134, "width": 6, "height": 120, "fill": "#F5A623", "cornerRadius": [0, 18, 18, 0] },
        { "id": "g8", "type": "text", "x": 44, "y": 150, "width": 200, "height": 12, "text": "#1  ·  July 14, 2025", "fontSize": 10, "fontWeight": "700", "letterSpacing": 2, "fill": "rgba(235,232,247,0.4)" },
        { "id": "g9", "type": "text", "x": 44, "y": 168, "width": 280, "height": 24, "text": "Shipped v2.0 launch", "fontSize": 18, "fontWeight": "700", "fill": "#EBE8F7" },
        { "id": "g10", "type": "text", "x": 44, "y": 196, "width": 280, "height": 16, "text": "14h deep focus · 3 PRs merged · 0 bugs", "fontSize": 12, "fill": "rgba(235,232,247,0.5)" },
        { "id": "g10b", "type": "rectangle", "x": 300, "y": 154, "width": 44, "height": 44, "fill": "rgba(245,166,35,0.12)", "cornerRadius": 12 },
        { "id": "g10c", "type": "text", "x": 300, "y": 165, "width": 44, "height": 22, "text": "🚀", "fontSize": 20, "textAlign": "center" },
        // Moment 2
        { "id": "g11", "type": "rectangle", "x": 24, "y": 270, "width": 165, "height": 100, "fill": "#131320", "cornerRadius": 16, "border": { "color": "rgba(124,111,255,0.2)", "width": 1 } },
        { "id": "g12", "type": "text", "x": 38, "y": 284, "width": 130, "height": 12, "text": "#2  ·  March 3", "fontSize": 10, "fontWeight": "700", "letterSpacing": 1, "fill": "rgba(235,232,247,0.4)" },
        { "id": "g13", "type": "text", "x": 38, "y": 301, "width": 130, "height": 36, "text": "47-day streak hit", "fontSize": 14, "fontWeight": "700", "fill": "#EBE8F7", "lineHeight": 1.3 },
        { "id": "g14", "type": "text", "x": 38, "y": 342, "width": 130, "height": 14, "text": "Personal record", "fontSize": 11, "fill": "rgba(235,232,247,0.4)" },
        // Moment 3
        { "id": "g15", "type": "rectangle", "x": 201, "y": 270, "width": 165, "height": 100, "fill": "#131320", "cornerRadius": 16, "border": { "color": "rgba(124,111,255,0.2)", "width": 1 } },
        { "id": "g16", "type": "text", "x": 215, "y": 284, "width": 130, "height": 12, "text": "#3  ·  Sep 22", "fontSize": 10, "fontWeight": "700", "letterSpacing": 1, "fill": "rgba(235,232,247,0.4)" },
        { "id": "g17", "type": "text", "x": 215, "y": 301, "width": 130, "height": 36, "text": "100 tasks in a week", "fontSize": 14, "fontWeight": "700", "fill": "#EBE8F7", "lineHeight": 1.3 },
        { "id": "g18", "type": "text", "x": 215, "y": 342, "width": 130, "height": 14, "text": "Top 1% that week", "fontSize": 11, "fill": "rgba(235,232,247,0.4)" },
        // Categories section
        { "id": "g19", "type": "text", "x": 24, "y": 388, "width": 200, "height": 18, "text": "By Category", "fontSize": 15, "fontWeight": "700", "fill": "#EBE8F7" },
        // Category pills
        ...([
          { label: "Engineering", pct: 62, color: "#7C6FFF" },
          { label: "Design", pct: 21, color: "#F5A623" },
          { label: "Meetings", pct: 11, color: "rgba(235,232,247,0.3)" },
          { label: "Planning", pct: 6, color: "rgba(235,232,247,0.2)" }
        ].map((cat, i) => [
          { "id": `g_cat_bg_${i}`, "type": "rectangle", "x": 24, "y": 416 + i * 54, "width": 342, "height": 44, "fill": "#131320", "cornerRadius": 12, "border": { "color": "rgba(235,232,247,0.05)", "width": 1 } },
          { "id": `g_cat_label_${i}`, "type": "text", "x": 36, "y": 427 + i * 54, "width": 150, "height": 16, "text": cat.label, "fontSize": 13, "fontWeight": "600", "fill": "#EBE8F7" },
          { "id": `g_cat_pct_${i}`, "type": "text", "x": 320, "y": 427 + i * 54, "width": 36, "height": 16, "text": cat.pct + "%", "fontSize": 12, "fontWeight": "700", "fill": cat.color },
          { "id": `g_cat_bar_bg_${i}`, "type": "rectangle", "x": 36, "y": 447 + i * 54, "width": 318, "height": 4, "fill": "rgba(235,232,247,0.06)", "cornerRadius": 2 },
          { "id": `g_cat_bar_${i}`, "type": "rectangle", "x": 36, "y": 447 + i * 54, "width": Math.round(318 * cat.pct / 100), "height": 4, "fill": cat.color, "cornerRadius": 2 }
        ]).flat()),
        // Bottom nav
        { "id": "g40", "type": "rectangle", "x": 0, "y": 736, "width": 390, "height": 84, "fill": "#09090E", "border": { "color": "rgba(235,232,247,0.06)", "width": 1 } },
        { "id": "g41", "type": "text", "x": 26, "y": 754, "width": 50, "height": 24, "text": "◑", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g42", "type": "text", "x": 26, "y": 776, "width": 50, "height": 12, "text": "Home", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g43", "type": "text", "x": 115, "y": 754, "width": 50, "height": 24, "text": "◈", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g44", "type": "text", "x": 115, "y": 776, "width": 50, "height": 12, "text": "Timeline", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g45", "type": "text", "x": 195, "y": 754, "width": 50, "height": 24, "text": "✦", "fontSize": 20, "fill": "#F5A623", "textAlign": "center" },
        { "id": "g46", "type": "text", "x": 195, "y": 776, "width": 50, "height": 12, "text": "Moments", "fontSize": 9, "fontWeight": "600", "fill": "#F5A623", "textAlign": "center" },
        { "id": "g47", "type": "text", "x": 280, "y": 754, "width": 50, "height": 24, "text": "⬡", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g48", "type": "text", "x": 280, "y": 776, "width": 50, "height": 12, "text": "Network", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g49", "type": "text", "x": 338, "y": 754, "width": 50, "height": 24, "text": "◎", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "g50", "type": "text", "x": 338, "y": 776, "width": 50, "height": 12, "text": "Insights", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" }
      ]
    },
    {
      "id": "screen4",
      "name": "Network",
      "backgroundColor": "#09090E",
      "elements": [
        { "id": "h1", "type": "rectangle", "x": 0, "y": 0, "width": 390, "height": 56, "fill": "#09090E" },
        { "id": "h2", "type": "text", "x": 24, "y": 18, "width": 80, "height": 22, "text": "EPOCH", "fontSize": 14, "fontWeight": "700", "letterSpacing": 4, "fill": "#EBE8F7" },
        { "id": "h3", "type": "text", "x": 280, "y": 18, "width": 86, "height": 22, "text": "2025 ↗", "fontSize": 13, "fontWeight": "500", "fill": "#F5A623" },
        { "id": "h4", "type": "text", "x": 24, "y": 72, "width": 250, "height": 28, "text": "Your Network", "fontSize": 22, "fontWeight": "700", "fill": "#EBE8F7", "letterSpacing": -0.5 },
        { "id": "h5", "type": "text", "x": 24, "y": 104, "width": 280, "height": 16, "text": "Collaboration strength map", "fontSize": 13, "fill": "rgba(235,232,247,0.45)" },
        // Network overview card
        { "id": "h6", "type": "rectangle", "x": 24, "y": 134, "width": 342, "height": 80, "fill": "#131320", "cornerRadius": 16, "border": { "color": "rgba(245,166,35,0.15)", "width": 1 } },
        { "id": "h7", "type": "text", "x": 40, "y": 148, "width": 200, "height": 14, "text": "TOTAL COLLABORATORS", "fontSize": 10, "fontWeight": "700", "letterSpacing": 2, "fill": "rgba(235,232,247,0.4)" },
        { "id": "h8", "type": "text", "x": 40, "y": 168, "width": 120, "height": 30, "text": "47", "fontSize": 26, "fontWeight": "800", "fill": "#F5A623" },
        { "id": "h9", "type": "text", "x": 40, "y": 199, "width": 200, "height": 12, "text": "18 new this year · 29 returning", "fontSize": 11, "fill": "rgba(235,232,247,0.45)" },
        // Orbit visualization (radial circles)
        { "id": "h10", "type": "ellipse", "x": 120, "y": 240, "width": 150, "height": 150, "fill": "transparent", "border": { "color": "rgba(124,111,255,0.08)", "width": 1 } },
        { "id": "h11", "type": "ellipse", "x": 150, "y": 270, "width": 90, "height": 90, "fill": "transparent", "border": { "color": "rgba(124,111,255,0.12)", "width": 1 } },
        { "id": "h12", "type": "ellipse", "x": 175, "y": 295, "width": 40, "height": 40, "fill": "rgba(245,166,35,0.12)", "border": { "color": "rgba(245,166,35,0.3)", "width": 1 } },
        { "id": "h13", "type": "text", "x": 175, "y": 305, "width": 40, "height": 20, "text": "YOU", "fontSize": 8, "fontWeight": "800", "fill": "#F5A623", "textAlign": "center" },
        // Orbit nodes
        ...([
          { x: 140, y: 250, label: "Alex", size: 20 },
          { x: 235, y: 255, label: "Sam", size: 18 },
          { x: 250, y: 340, label: "Jordan", size: 16 },
          { x: 130, y: 355, label: "Casey", size: 14 },
          { x: 100, y: 295, label: "Blake", size: 12 },
          { x: 107, y: 250, label: "Kai", size: 10 }
        ].map((node, i) => [
          { "id": `h_node_${i}`, "type": "ellipse", "x": node.x, "y": node.y, "width": node.size, "height": node.size, "fill": `rgba(124,111,255,${0.4 + i * 0.08})`, "border": { "color": "rgba(124,111,255,0.5)", "width": 1 } },
          { "id": `h_node_label_${i}`, "type": "text", "x": node.x - 10, "y": node.y + node.size + 2, "width": 40, "height": 12, "text": node.label, "fontSize": 8, "fill": "rgba(235,232,247,0.45)", "textAlign": "center" }
        ]).flat()),
        // Top collaborators list
        { "id": "h30", "type": "text", "x": 24, "y": 430, "width": 200, "height": 18, "text": "Closest Collaborators", "fontSize": 15, "fontWeight": "700", "fill": "#EBE8F7" },
        ...([
          { name: "Alex Chen", role: "Engineering", hrs: "284h", avatar: "AC" },
          { name: "Sam Park", role: "Design", hrs: "176h", avatar: "SP" },
          { name: "Jordan Lee", role: "Product", hrs: "142h", avatar: "JL" }
        ].map((person, i) => [
          { "id": `h_person_bg_${i}`, "type": "rectangle", "x": 24, "y": 456 + i * 58, "width": 342, "height": 48, "fill": "#131320", "cornerRadius": 12, "border": { "color": "rgba(235,232,247,0.05)", "width": 1 } },
          { "id": `h_avatar_${i}`, "type": "ellipse", "x": 38, "y": 464 + i * 58, "width": 34, "height": 34, "fill": `rgba(124,111,255,${0.5 - i * 0.1})` },
          { "id": `h_avatar_text_${i}`, "type": "text", "x": 38, "y": 470 + i * 58, "width": 34, "height": 22, "text": person.avatar, "fontSize": 10, "fontWeight": "700", "fill": "#EBE8F7", "textAlign": "center" },
          { "id": `h_person_name_${i}`, "type": "text", "x": 82, "y": 466 + i * 58, "width": 150, "height": 16, "text": person.name, "fontSize": 13, "fontWeight": "600", "fill": "#EBE8F7" },
          { "id": `h_person_role_${i}`, "type": "text", "x": 82, "y": 484 + i * 58, "width": 150, "height": 12, "text": person.role, "fontSize": 11, "fill": "rgba(235,232,247,0.4)" },
          { "id": `h_person_hrs_${i}`, "type": "text", "x": 322, "y": 472 + i * 58, "width": 36, "height": 16, "text": person.hrs, "fontSize": 12, "fontWeight": "700", "fill": i === 0 ? "#F5A623" : "#7C6FFF" }
        ]).flat()),
        // Bottom nav
        { "id": "h60", "type": "rectangle", "x": 0, "y": 736, "width": 390, "height": 84, "fill": "#09090E", "border": { "color": "rgba(235,232,247,0.06)", "width": 1 } },
        { "id": "h61", "type": "text", "x": 26, "y": 754, "width": 50, "height": 24, "text": "◑", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h62", "type": "text", "x": 26, "y": 776, "width": 50, "height": 12, "text": "Home", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h63", "type": "text", "x": 115, "y": 754, "width": 50, "height": 24, "text": "◈", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h64", "type": "text", "x": 115, "y": 776, "width": 50, "height": 12, "text": "Timeline", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h65", "type": "text", "x": 195, "y": 754, "width": 50, "height": 24, "text": "✦", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h66", "type": "text", "x": 195, "y": 776, "width": 50, "height": 12, "text": "Moments", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h67", "type": "text", "x": 280, "y": 754, "width": 50, "height": 24, "text": "⬡", "fontSize": 20, "fill": "#F5A623", "textAlign": "center" },
        { "id": "h68", "type": "text", "x": 280, "y": 776, "width": 50, "height": 12, "text": "Network", "fontSize": 9, "fontWeight": "600", "fill": "#F5A623", "textAlign": "center" },
        { "id": "h69", "type": "text", "x": 338, "y": 754, "width": 50, "height": 24, "text": "◎", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "h70", "type": "text", "x": 338, "y": 776, "width": 50, "height": 12, "text": "Insights", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" }
      ]
    },
    {
      "id": "screen5",
      "name": "AI Insights",
      "backgroundColor": "#09090E",
      "elements": [
        { "id": "i1", "type": "rectangle", "x": 0, "y": 0, "width": 390, "height": 56, "fill": "#09090E" },
        { "id": "i2", "type": "text", "x": 24, "y": 18, "width": 80, "height": 22, "text": "EPOCH", "fontSize": 14, "fontWeight": "700", "letterSpacing": 4, "fill": "#EBE8F7" },
        { "id": "i3", "type": "text", "x": 280, "y": 18, "width": 86, "height": 22, "text": "2025 ↗", "fontSize": 13, "fontWeight": "500", "fill": "#F5A623" },
        { "id": "i4", "type": "text", "x": 24, "y": 72, "width": 250, "height": 28, "text": "AI Insights", "fontSize": 22, "fontWeight": "700", "fill": "#EBE8F7", "letterSpacing": -0.5 },
        { "id": "i5", "type": "text", "x": 24, "y": 104, "width": 300, "height": 16, "text": "What your year is really telling you", "fontSize": 13, "fill": "rgba(235,232,247,0.45)" },
        // AI insight card 1
        { "id": "i6", "type": "rectangle", "x": 24, "y": 134, "width": 342, "height": 110, "fill": "#131320", "cornerRadius": 18, "border": { "color": "rgba(245,166,35,0.25)", "width": 1 } },
        { "id": "i7", "type": "rectangle", "x": 24, "y": 134, "width": 342, "height": 3, "fill": "#F5A623", "cornerRadius": [18, 18, 0, 0] },
        { "id": "i8", "type": "text", "x": 40, "y": 153, "width": 280, "height": 12, "text": "✦  PATTERN DETECTED", "fontSize": 9, "fontWeight": "700", "letterSpacing": 2, "fill": "#F5A623" },
        { "id": "i9", "type": "text", "x": 40, "y": 172, "width": 300, "height": 20, "text": "You do your best work on Tuesdays", "fontSize": 15, "fontWeight": "700", "fill": "#EBE8F7" },
        { "id": "i10", "type": "text", "x": 40, "y": 198, "width": 300, "height": 36, "text": "78% of your high-output days this year fell on Tuesdays or Wednesdays. Try scheduling creative work then.", "fontSize": 12, "lineHeight": 1.5, "fill": "rgba(235,232,247,0.55)" },
        // AI insight card 2
        { "id": "i11", "type": "rectangle", "x": 24, "y": 258, "width": 342, "height": 100, "fill": "#131320", "cornerRadius": 18, "border": { "color": "rgba(124,111,255,0.25)", "width": 1 } },
        { "id": "i12", "type": "rectangle", "x": 24, "y": 258, "width": 342, "height": 3, "fill": "#7C6FFF", "cornerRadius": [18, 18, 0, 0] },
        { "id": "i13", "type": "text", "x": 40, "y": 277, "width": 280, "height": 12, "text": "◈  GROWTH SIGNAL", "fontSize": 9, "fontWeight": "700", "letterSpacing": 2, "fill": "#7C6FFF" },
        { "id": "i14", "type": "text", "x": 40, "y": 296, "width": 300, "height": 20, "text": "Deep focus time ↑ 34% vs 2024", "fontSize": 15, "fontWeight": "700", "fill": "#EBE8F7" },
        { "id": "i15", "type": "text", "x": 40, "y": 320, "width": 300, "height": 30, "text": "Your uninterrupted work blocks grew from 45min to 6.2h average. Momentum compound effect.", "fontSize": 12, "lineHeight": 1.5, "fill": "rgba(235,232,247,0.55)" },
        // 2026 Goals section
        { "id": "i16", "type": "text", "x": 24, "y": 374, "width": 200, "height": 18, "text": "2026 Projections", "fontSize": 15, "fontWeight": "700", "fill": "#EBE8F7" },
        ...([
          { label: "At current pace", value: "3,200h", desc: "focus hours projected", color: "#F5A623" },
          { label: "Stretch target", value: "500", desc: "tasks shipped if +27%", color: "#7C6FFF" },
          { label: "Network growth", value: "+12", desc: "new collaborators", color: "rgba(235,232,247,0.6)" }
        ].map((proj, i) => [
          { "id": `i_proj_bg_${i}`, "type": "rectangle", "x": 24, "y": 400 + i * 58, "width": 342, "height": 48, "fill": "#131320", "cornerRadius": 12, "border": { "color": "rgba(235,232,247,0.05)", "width": 1 } },
          { "id": `i_proj_dot_${i}`, "type": "ellipse", "x": 38, "y": 418 + i * 58, "width": 10, "height": 10, "fill": proj.color },
          { "id": `i_proj_label_${i}`, "type": "text", "x": 58, "y": 408 + i * 58, "width": 160, "height": 14, "text": proj.label, "fontSize": 10, "fontWeight": "600", "fill": "rgba(235,232,247,0.5)" },
          { "id": `i_proj_val_${i}`, "type": "text", "x": 58, "y": 426 + i * 58, "width": 160, "height": 16, "text": proj.desc, "fontSize": 12, "fill": "rgba(235,232,247,0.7)" },
          { "id": `i_proj_num_${i}`, "type": "text", "x": 310, "y": 416 + i * 58, "width": 50, "height": 24, "text": proj.value, "fontSize": 14, "fontWeight": "800", "fill": proj.color, "textAlign": "right" }
        ]).flat()),
        // Share CTA
        { "id": "i40", "type": "rectangle", "x": 24, "y": 676, "width": 342, "height": 50, "fill": "#131320", "cornerRadius": 14, "border": { "color": "rgba(245,166,35,0.3)", "width": 1 } },
        { "id": "i41", "type": "text", "x": 24, "y": 691, "width": 342, "height": 20, "text": "Share Your Year  ↗", "fontSize": 14, "fontWeight": "700", "fill": "#F5A623", "textAlign": "center" },
        // Bottom nav
        { "id": "i50", "type": "rectangle", "x": 0, "y": 736, "width": 390, "height": 84, "fill": "#09090E", "border": { "color": "rgba(235,232,247,0.06)", "width": 1 } },
        { "id": "i51", "type": "text", "x": 26, "y": 754, "width": 50, "height": 24, "text": "◑", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i52", "type": "text", "x": 26, "y": 776, "width": 50, "height": 12, "text": "Home", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i53", "type": "text", "x": 115, "y": 754, "width": 50, "height": 24, "text": "◈", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i54", "type": "text", "x": 115, "y": 776, "width": 50, "height": 12, "text": "Timeline", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i55", "type": "text", "x": 195, "y": 754, "width": 50, "height": 24, "text": "✦", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i56", "type": "text", "x": 195, "y": 776, "width": 50, "height": 12, "text": "Moments", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i57", "type": "text", "x": 280, "y": 754, "width": 50, "height": 24, "text": "⬡", "fontSize": 20, "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i58", "type": "text", "x": 280, "y": 776, "width": 50, "height": 12, "text": "Network", "fontSize": 9, "fontWeight": "500", "fill": "rgba(235,232,247,0.3)", "textAlign": "center" },
        { "id": "i59", "type": "text", "x": 338, "y": 754, "width": 50, "height": 24, "text": "◎", "fontSize": 20, "fill": "#F5A623", "textAlign": "center" },
        { "id": "i60", "type": "text", "x": 338, "y": 776, "width": 50, "height": 12, "text": "Insights", "fontSize": 9, "fontWeight": "600", "fill": "#F5A623", "textAlign": "center" }
      ]
    }
  ]
};

fs.writeFileSync('/workspace/group/design-studio/epoch.pen', JSON.stringify(pen, null, 2));
console.log('✓ epoch.pen written');
console.log('Screens:', pen.screens.length);
