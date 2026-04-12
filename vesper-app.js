#!/usr/bin/env node
// VESPER — Personal Clarity OS
// Inspired by: Dark Glassmorphism trend 2026 (research: darkmodedesign.com, medium.com)
//   — Ambient gradient orbs (deep violet/teal) floating behind semi-transparent glass cards
//   — Three-tier spatial depth: [1] orb field [2] glass surface cards [3] elevated elements
//   — Subtle glass: backdrop-filter blur(24px), ~6% white opacity surfaces
//   — Gradient borders give cards a "lit edge" feeling
//   — Micro-interactions: hover lifts blur, glow intensifies
//   Counter to serif.pen (light editorial) → fully dark, glass, ambient
// Theme: DARK (serif was LIGHT → rotate to DARK)
// Date: 2026-03-31
// Slug: vesper

'use strict';
const fs = require('fs');

const pen = {
  version: "2.8",
  meta: {
    name: "VESPER",
    tagline: "End each day with clarity",
    archetype: "personal-clarity-glass",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "dark",
    slug: "vesper",
    inspiration: "Dark Glassmorphism 2026 trend — ambient violet/teal gradient orbs behind glass cards; three-tier spatial hierarchy; gradient-border lit-edge cards; breathe-pulse animation on focus timer; from darkmodedesign.com showcases and web research on maturing glassmorphism aesthetic"
  },

  palette: {
    bg:            "#060412",
    surface:       "#0D0920",
    surfaceAlt:    "#120E28",
    surfaceGlass:  "rgba(255,255,255,0.042)",
    surfaceGlass2: "rgba(255,255,255,0.075)",
    surfaceGlass3: "rgba(255,255,255,0.11)",
    surfaceHover:  "rgba(155,109,255,0.08)",

    text:          "#EDE9FF",
    textMuted:     "rgba(237,233,255,0.42)",
    textFaint:     "rgba(237,233,255,0.20)",

    accent:        "#9B6DFF",
    accentBright:  "#B98FFF",
    accentSoft:    "rgba(155,109,255,0.15)",
    accentGlow:    "rgba(155,109,255,0.30)",

    accent2:       "#00D4BF",
    accent2Bright: "#00F0D8",
    accent2Soft:   "rgba(0,212,191,0.12)",
    accent2Glow:   "rgba(0,212,191,0.25)",

    orb1:          "rgba(91,46,255,0.18)",
    orb2:          "rgba(0,180,163,0.14)",
    orb3:          "rgba(155,109,255,0.08)",

    borderGlass:   "rgba(255,255,255,0.10)",
    borderAccent:  "rgba(155,109,255,0.30)",
    borderTeal:    "rgba(0,212,191,0.22)",
    borderAmber:   "rgba(255,183,77,0.25)",

    statusGreen:   "#3DE8B0",
    statusAmber:   "#FFB74D",
    statusRed:     "#FF6B8A",
    statusGreenSoft: "rgba(61,232,176,0.12)",
    statusAmberSoft: "rgba(255,183,77,0.12)",

    shadowDeep:    "0 24px 80px rgba(0,0,0,0.60)",
    shadowGlass:   "0 8px 32px rgba(0,0,0,0.40)",
    shadowAccent:  "0 4px 20px rgba(155,109,255,0.25)",
    shadowTeal:    "0 4px 20px rgba(0,212,191,0.20)",
    shadowAmber:   "0 4px 20px rgba(255,183,77,0.22)"
  },

  lightPalette: {
    bg:         "#F0ECFF",
    surface:    "#FFFFFF",
    surfaceAlt: "#EDE6FF",
    text:       "#1A1530",
    textMuted:  "rgba(26,21,48,0.48)",
    accent:     "#7B4DFF",
    accent2:    "#00A896",
    muted:      "rgba(26,21,48,0.32)",
    border:     "rgba(123,77,255,0.14)"
  },

  typography: {
    display:    { family: "Inter", weight: 700, size: 36, tracking: "-0.03em", leading: 1.1 },
    heading:    { family: "Inter", weight: 600, size: 22, tracking: "-0.02em", leading: 1.25 },
    subheading: { family: "Inter", weight: 500, size: 15, tracking: "-0.01em", leading: 1.4 },
    body:       { family: "Inter", weight: 400, size: 14, tracking: "0em",     leading: 1.65 },
    caption:    { family: "Inter", weight: 400, size: 12, tracking: "0.01em",  leading: 1.5 },
    mono:       { family: "JetBrains Mono", weight: 400, size: 13, tracking: "0em", leading: 1.5 },
    label:      { family: "Inter", weight: 500, size: 11, tracking: "0.08em", leading: 1.3 }
  },

  screens: [
    // ── SCREEN 1: TODAY ──────────────────────────────
    {
      id: "today",
      label: "Today",
      description: "Daily intention + floating glass metric cards over ambient violet/teal orb field.",
      components: [
        {
          type: "ambient-orb-field",
          orbs: [
            { cx: "22%", cy: "18%", r: 340, color: "rgba(91,46,255,0.18)" },
            { cx: "80%", cy: "62%", r: 260, color: "rgba(0,180,163,0.14)" },
            { cx: "55%", cy: "90%", r: 180, color: "rgba(155,109,255,0.08)" }
          ],
          note: "CSS radial-gradient background layer — depth tier 1"
        },
        {
          type: "glass-topbar",
          left:  { type: "wordmark", text: "VESPER", style: "label-tracked-caps" },
          center: { type: "date-label", value: "Tuesday · Mar 31", muted: true },
          right: { type: "avatar-glow", initials: "RL", glowColor: "accent" },
          glass: true, blur: 12, border: "borderGlass"
        },
        {
          type: "intention-card",
          eyebrow: "TODAY'S INTENTION",
          quote: "Build depth, not noise.",
          meta: "Set at 7:14 AM",
          style: {
            surface: "surfaceGlass2",
            blur: 24,
            border: "gradient-border-accent-to-teal",
            borderRadius: 24,
            padding: "28px",
            depth: "tier-2",
            quoteFont: "display",
            quoteGradient: "linear-gradient(135deg, #B98FFF 0%, #00D4BF 100%)"
          }
        },
        {
          type: "metric-card-row",
          label: "MOMENTUM",
          cards: [
            {
              label: "Focus",   value: "4h 20m", sub: "deep work", icon: "zap",
              accentColor: "#9B6DFF", glow: "shadowAccent",
              surface: "surfaceGlass2", border: "borderAccent", borderRadius: 18
            },
            {
              label: "Streak",  value: "18",     sub: "days",      icon: "flame",
              accentColor: "#FFB74D", glow: "shadowAmber",
              surface: "surfaceGlass2", border: "borderAmber",   borderRadius: 18
            },
            {
              label: "Clarity", value: "9.2",    sub: "avg score", icon: "eye",
              accentColor: "#00D4BF", glow: "shadowTeal",
              surface: "surfaceGlass2", border: "borderTeal",    borderRadius: 18
            }
          ]
        },
        {
          type: "ritual-checklist",
          label: "RITUALS",
          items: [
            { label: "Morning pages", done: true,  time: "6:30 AM", icon: "edit" },
            { label: "Meditation",    done: true,  time: "7:00 AM", icon: "moon" },
            { label: "Evening review",done: false, time: "9:00 PM", icon: "check" }
          ],
          glass: true, blur: 24, border: "borderGlass", borderRadius: 20
        },
        {
          type: "action-button",
          label: "Begin Focus Session",
          icon: "play",
          style: {
            bg: "linear-gradient(135deg, rgba(155,109,255,0.22) 0%, rgba(0,212,191,0.14) 100%)",
            border: "borderAccent", glow: "shadowAccent",
            blur: 16, borderRadius: 16, height: 56,
            font: "subheading", depth: "tier-3"
          }
        }
      ]
    },

    // ── SCREEN 2: FOCUS ──────────────────────────────
    {
      id: "focus",
      label: "Focus",
      description: "Immersive Pomodoro timer. Glowing orb breathes in sync with the session. Mono-spaced countdown. Minimal chrome.",
      components: [
        {
          type: "ambient-orb-field",
          orbs: [
            { cx: "50%", cy: "42%", r: 420, color: "rgba(91,46,255,0.20)", animate: "pulse-breathe 4s ease-in-out infinite" },
            { cx: "50%", cy: "42%", r: 200, color: "rgba(155,109,255,0.10)" }
          ]
        },
        {
          type: "focus-header",
          sessionLabel: "DEEP WORK · SESSION 2",
          task: "Design system tokens — VESPER",
          align: "center", muted: true
        },
        {
          type: "timer-ring",
          minutes: 47, seconds: 23,
          fontFamily: "JetBrains Mono", fontSize: 88, fontWeight: 700,
          textGlow: "0 0 60px rgba(155,109,255,0.35)",
          ring: {
            radius: 156, stroke: 3, pct: 61,
            color: "accent", trackColor: "rgba(155,109,255,0.10)",
            glow: "shadowAccent"
          },
          align: "center", depth: "tier-3"
        },
        {
          type: "focus-controls",
          layout: "center-row",
          items: [
            { id: "skip",  icon: "skip-forward", style: "ghost-glass", size: "md" },
            { id: "pause", icon: "pause",         style: "accent-glass", size: "xl", glow: "shadowAccent" },
            { id: "end",   icon: "x",             style: "ghost-glass", size: "md" }
          ],
          depth: "tier-3"
        },
        {
          type: "session-micro-log",
          label: "THIS SESSION",
          entries: [
            { time: "10:12", note: "Entered flow state" },
            { time: "10:28", note: "Completed token map v1" },
            { time: "Now",   note: "In component specs", current: true }
          ],
          glass: true, blur: 16, border: "borderGlass", borderRadius: 16
        }
      ]
    },

    // ── SCREEN 3: JOURNAL ──────────────────────────────
    {
      id: "journal",
      label: "Journal",
      description: "Full-bleed glass writing surface. Gradient-border prompt card. Generous editor with faint teal caret. Past entries strip below.",
      components: [
        {
          type: "ambient-orb-field",
          orbs: [
            { cx: "72%", cy: "12%", r: 300, color: "rgba(0,180,163,0.14)" },
            { cx: "18%", cy: "82%", r: 240, color: "rgba(91,46,255,0.16)" }
          ]
        },
        {
          type: "glass-topbar",
          left:   { type: "back-button", icon: "chevron-left" },
          center: { type: "title", text: "Evening Review", font: "subheading" },
          right:  { type: "text-action", label: "Save", color: "accent" },
          glass: true, blur: 12, border: "borderGlass"
        },
        {
          type: "prompt-card",
          eyebrow: "TONIGHT'S PROMPT",
          text: "What gave you energy today? What drained it?",
          surface: "surfaceGlass2",
          blur: 24,
          border: "gradient-border-teal",
          borderRadius: 20,
          padding: "20px 24px",
          depth: "tier-2"
        },
        {
          type: "glass-text-editor",
          placeholder: "Start writing freely…",
          wordCount: 284,
          content: "Today had a strange texture — productive in the morning but heavy by 3pm. The design review went well. I'm realising that my best thinking happens before noon…",
          style: {
            surface: "surfaceGlass",
            blur: 24, border: "borderGlass",
            focusBorder: "borderAccent", caretColor: "accent2",
            borderRadius: 20, padding: "24px",
            font: "body", lineHeight: 1.8,
            minHeight: 240, depth: "tier-2"
          }
        },
        {
          type: "tag-cloud",
          label: "THEMES",
          tags: [
            { text: "energy",       color: "accent2" },
            { text: "time-blocking",color: "accent" },
            { text: "design",       color: "accentBright" }
          ],
          addable: true
        },
        {
          type: "entries-strip",
          label: "RECENT ENTRIES",
          entries: [
            { date: "Mon 30", excerpt: "Shipped relay. Felt clean.", mood: "high" },
            { date: "Sun 29", excerpt: "Rest. Good silence.",        mood: "calm" },
            { date: "Sat 28", excerpt: "Overcomplicated things.",    mood: "low" }
          ],
          glass: true, blur: 16, border: "borderGlass", borderRadius: 16
        }
      ]
    },

    // ── SCREEN 4: REFLECT ──────────────────────────────
    {
      id: "reflect",
      label: "Reflect",
      description: "Glass analytics — clarity score area curve, energy heatmap, and AI insight card in elevated tier-3 glass.",
      components: [
        {
          type: "ambient-orb-field",
          orbs: [
            { cx: "88%", cy: "22%", r: 280, color: "rgba(91,46,255,0.16)" },
            { cx: "12%", cy: "60%", r: 220, color: "rgba(0,180,163,0.13)" }
          ]
        },
        {
          type: "section-header",
          title: "Reflect",
          sub: "March · Week 2 of 4",
          action: { label: "All time ›" }
        },
        {
          type: "glass-area-chart",
          label: "CLARITY SCORE — THIS WEEK",
          data: [
            { x: "Mon", y: 7.8 }, { x: "Tue", y: 8.4 },
            { x: "Wed", y: 6.9 }, { x: "Thu", y: 9.1 },
            { x: "Fri", y: 8.8 }, { x: "Sat", y: 7.2 },
            { x: "Sun", y: 9.4 }
          ],
          currentValue: "9.2", delta: "+0.8", deltaPositive: true,
          style: {
            lineColor: "accent", lineGlow: "shadowAccent",
            fill: "linear-gradient(180deg, rgba(155,109,255,0.25) 0%, rgba(155,109,255,0) 100%)",
            surface: "surfaceGlass", blur: 24,
            border: "borderGlass", borderRadius: 20, height: 160, depth: "tier-2"
          }
        },
        {
          type: "energy-heatmap",
          label: "ENERGY BY HOUR",
          days:  ["M","T","W","T","F","S","S"],
          hours: ["6am","9am","12pm","3pm","6pm","9pm"],
          scale: ["rgba(0,212,191,0.08)","rgba(0,212,191,0.28)","rgba(155,109,255,0.55)","#9B6DFF"],
          cellRadius: 6,
          glass: true, blur: 16, border: "borderGlass", borderRadius: 20
        },
        {
          type: "ai-insight-card",
          eyebrow: "VESPER INSIGHT",
          badge: "AI",
          text: "Your sharpest thinking clusters 8–11am across 6 of 7 days. You've been scheduling 62% of meetings in that window — consider protecting it.",
          action: { label: "Block mornings", icon: "lock" },
          style: {
            surface: "surfaceGlass2",
            blur: 40, border: "gradient-border-accent",
            borderRadius: 20, depth: "tier-3",
            accentLine: "accent", glow: "shadowAccent"
          }
        },
        {
          type: "stat-trio",
          stats: [
            { label: "Focus this week", value: "28h 40m", delta: "+3h",  positive: true },
            { label: "Journal streak",  value: "18 days", delta: "+18",  positive: true },
            { label: "Avg clarity",     value: "8.5 / 10", delta: "+0.3", positive: true }
          ],
          glass: true, blur: 16, border: "borderGlass", borderRadius: 16
        }
      ]
    },

    // ── SCREEN 5: RITUALS ──────────────────────────────
    {
      id: "rituals",
      label: "Rituals",
      description: "Glass ring-progress cards with per-habit ambient glow. Streak fire banner. Upcoming rituals list.",
      components: [
        {
          type: "ambient-orb-field",
          orbs: [
            { cx: "50%", cy: "28%", r: 320, color: "rgba(0,180,163,0.16)" },
            { cx: "18%", cy: "76%", r: 200, color: "rgba(91,46,255,0.14)" }
          ]
        },
        {
          type: "section-header",
          title: "Rituals",
          sub: "2 of 4 complete today",
          action: { icon: "plus", label: "Add" }
        },
        {
          type: "ritual-ring-grid",
          layout: "2-col",
          items: [
            { label: "Meditation", target: "20 min",  pct: 100, streak: 18, done: true,  color: "#9B6DFF",  glow: "shadowAccent", icon: "moon" },
            { label: "Journal",    target: "1 entry",  pct: 100, streak: 18, done: true,  color: "#00D4BF",  glow: "shadowTeal",   icon: "edit" },
            { label: "Move",       target: "30 min",  pct: 0,   streak: 5,  done: false, color: "#FFB74D",  glow: "shadowAmber",  icon: "activity" },
            { label: "Read",       target: "30 pages", pct: 40,  streak: 12, done: false, color: "#B98FFF",  glow: "0 4px 20px rgba(185,143,255,0.22)", icon: "book" }
          ],
          cardStyle: { glass: true, blur: 24, border: "borderGlass", borderRadius: 20, ringSize: 72, ringStroke: 6 }
        },
        {
          type: "streak-banner",
          icon: "flame",
          headline: "18-day streak",
          sub: "Keep the chain alive — one more night.",
          surface: "surfaceGlass2",
          border: "borderAmber",
          glow: "shadowAmber",
          borderRadius: 16
        },
        {
          type: "upcoming-list",
          label: "LATER TODAY",
          items: [
            { time: "8:00 PM", label: "Evening walk",   icon: "activity", color: "#FFB74D" },
            { time: "9:00 PM", label: "Evening review", icon: "moon",     color: "#9B6DFF" },
            { time: "9:30 PM", label: "Read 30 pages",  icon: "book",     color: "#B98FFF" }
          ],
          glass: true, blur: 16, border: "borderGlass", borderRadius: 16
        }
      ]
    },

    // ── SCREEN 6: PROFILE ──────────────────────────────
    {
      id: "profile",
      label: "Profile",
      description: "Identity and settings. Avatar with gradient ring glow. Glass setting groups. Theme toggle pill.",
      components: [
        {
          type: "ambient-orb-field",
          orbs: [
            { cx: "50%", cy: "18%", r: 260, color: "rgba(155,109,255,0.14)" }
          ]
        },
        {
          type: "profile-hero",
          name: "Rakis L.",
          handle: "@rakis",
          since: "March 2025",
          avatar: { initials: "RL", size: 72, ring: "gradient-accent-teal", glow: "shadowAccent" },
          stats: [
            { label: "Days",    value: "367" },
            { label: "Entries", value: "214" },
            { label: "Hours",   value: "623" }
          ],
          glass: true, blur: 24, border: "borderGlass", borderRadius: 24, align: "center"
        },
        {
          type: "settings-group",
          label: "PREFERENCES",
          items: [
            { icon: "layers",    label: "Appearance",      value: "Dark Glass",   action: "chevron" },
            { icon: "bell",      label: "Notifications",   value: "Smart",        action: "chevron" },
            { icon: "music",     label: "Focus sounds",    value: "Brown noise",  action: "chevron" },
            { icon: "zap",       label: "Haptic feedback", value: true,           action: "toggle", toggleColor: "accent" }
          ],
          glass: true, blur: 24, border: "borderGlass", borderRadius: 20
        },
        {
          type: "settings-group",
          label: "DATA",
          items: [
            { icon: "download",  label: "Export journal",  value: "Markdown / JSON", action: "chevron" },
            { icon: "cloud",     label: "Cloud backup",    value: "Daily · 2am",      action: "chevron" },
            { icon: "lock",      label: "Local encryption",value: "Enabled",          action: "chevron", valueColor: "statusGreen" }
          ],
          glass: true, blur: 24, border: "borderGlass", borderRadius: 20
        },
        {
          type: "theme-toggle",
          label: "THEME",
          options: [
            { id: "dark",  label: "Dark Glass", active: true,  preview: { bg: "#060412", accent: "#9B6DFF" } },
            { id: "light", label: "Light",      active: false, preview: { bg: "#F0ECFF", accent: "#7B4DFF" } }
          ],
          glass: true, blur: 16, border: "borderGlass", borderRadius: 16
        },
        {
          type: "footer-version",
          text: "VESPER 1.0.0 · built with intention.",
          align: "center", color: "textFaint", font: "caption"
        }
      ]
    }
  ],

  nav: [
    { id: "today",   label: "Today",   icon: "home" },
    { id: "focus",   label: "Focus",   icon: "zap" },
    { id: "journal", label: "Journal", icon: "edit" },
    { id: "reflect", label: "Reflect", icon: "chart" },
    { id: "rituals", label: "Rituals", icon: "activity" },
    { id: "profile", label: "Profile", icon: "user" }
  ],

  designNotes: {
    trend: "Dark Glassmorphism 2026 — ambient orb field as tier-1 depth, glass cards as tier-2, elevated interactive elements as tier-3",
    glass: "backdrop-filter blur(24px), 4.2%–11% white opacity, 1px gradient borders for lit-edge effect",
    orbs: "2–3 radial gradient orbs per screen, violet (#5B2EFF ~18%) and teal (#00B4A3 ~14%), radius 180–420px. Focus screen orb animates with 4s breathe-pulse",
    microInteractions: "Hover: surface opacity +3%, border +10%, glow +20% size. Active: brief scale(0.97) bounce.",
    typography: "Inter only — weight contrast (400/500/600/700) carries hierarchy. JetBrains Mono exclusively for the Pomodoro timer digits.",
    accessibility: "All text sits on glass surface, never directly over orb center. Min contrast 4.5:1 on body. Glass editor has solid text regardless of backdrop."
  }
};

const output = JSON.stringify(pen, null, 2);
fs.writeFileSync('vesper.pen', output);
console.log('✓ vesper.pen written — ' + Math.round(output.length / 1024) + 'KB');
console.log('  Screens: ' + pen.screens.length);
console.log('  Theme: ' + pen.meta.theme);
pen.screens.forEach(s => {
  console.log('  [' + s.id + '] ' + s.label + ' — ' + s.components.length + ' components');
});
