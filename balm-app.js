#!/usr/bin/env node
// BALM — Know what your body knows
// Inspired by: silencio.es (godly.website) — luxury editorial warmth, parchment palette,
//              generous whitespace, serif display type with refined organic colour pops.
//              V7 Go AI Platform (land-book.com) — "agent reasoning shown inline" UI trend:
//              displaying the AI's thought process as a first-class design element.
//              DarkModeDesign.com: Midday/Temply light-SaaS patterns → editorial card grids.
// Theme: LIGHT (ZENITH was dark → rotating to light)
// Slug: balm

const fs = require('fs');

const pen = {
  version: "2.8",
  meta: {
    name: "BALM",
    tagline: "Know what your body knows",
    archetype: "wellness-biometric",
    author: "RAM Design Heartbeat",
    created: new Date().toISOString(),
    theme: "light"
  },
  palette: {
    bg: "#F6F1EB",
    surface: "#FFFFFF",
    surfaceAlt: "#EDE8DF",
    surfaceWarm: "#FAF7F3",
    surfaceHover: "#F0EAE0",
    text: "#1A1410",
    textMuted: "rgba(26,20,16,0.45)",
    accent: "#C04A12",
    accent2: "#3D7A56",
    accentSoft: "rgba(192,74,18,0.08)",
    accent2Soft: "rgba(61,122,86,0.08)",
    accentMid: "rgba(192,74,18,0.18)",
    border: "rgba(26,20,16,0.08)",
    borderStrong: "rgba(26,20,16,0.16)",
    borderAccent: "rgba(192,74,18,0.22)",
    statusGreen: "#2D9E60",
    statusOrange: "#D97706",
    statusRed: "#DC2626",
    statusGreenSoft: "rgba(45,158,96,0.09)",
    statusOrangeSoft: "rgba(217,119,6,0.09)",
    statusRedSoft: "rgba(220,38,38,0.09)",
    sand: "#B8A898",
    sandSoft: "rgba(184,168,152,0.25)"
  },
  typography: {
    fontFamily: "'Libre Baskerville', Georgia, serif",
    sansFamily: "Inter, system-ui, -apple-system, sans-serif",
    scale: { xs: 10, sm: 11, base: 13, md: 14, lg: 17, xl: 24, xxl: 36, hero: 54 },
    note: "Serif for display scores + headings — editorial warmth; sans for all UI labels"
  },
  screens: [
    {
      id: "morning",
      label: "Morning",
      description: "Body brief — readiness score, HRV, sleep summary, and day intent",
      components: [
        {
          type: "wordmark-topbar",
          brand: "BALM",
          brandStyle: "serif-spaced",
          right: "Fri, Apr 3",
          rightSub: "Good morning, Rakis"
        },
        {
          type: "readiness-score-hero",
          score: 84,
          label: "Readiness",
          descriptor: "Well Primed",
          body: "Your nervous system is recovered and ready for a high-output day.",
          ring: {
            fill: 84, max: 100, colorKey: "accent2",
            inner: [
              { label: "Sleep", pct: 91 },
              { label: "HRV", pct: 78 },
              { label: "Recovery", pct: 83 }
            ]
          },
          style: "editorial-score-large"
        },
        {
          type: "biometric-tiles",
          label: "KEY SIGNALS",
          cols: 4,
          items: [
            { icon: "heart", label: "HRV", value: "62ms", trend: "+4ms", up: true, status: "good" },
            { icon: "activity", label: "Resting HR", value: "54bpm", trend: "stable", up: null, status: "good" },
            { icon: "moon", label: "Sleep", value: "7h 42m", trend: "+28m", up: true, status: "good" },
            { icon: "zap", label: "Temp", value: "+0.1°", trend: "baseline", up: null, status: "neutral" }
          ]
        },
        {
          type: "insight-card",
          badge: "BALM INSIGHT",
          body: "HRV trending up 3 days straight — your nervous system is building resilience. Light to moderate intensity today will compound these gains.",
          accentKey: "accent2",
          style: "warm-callout-serif"
        },
        {
          type: "sleep-stage-bar",
          label: "LAST NIGHT — 7h 42m",
          score: 91,
          stages: [
            { label: "Deep", minutes: 108, pct: 23, colorKey: "accent" },
            { label: "REM",  minutes: 115, pct: 25, colorKey: "accent2" },
            { label: "Light", minutes: 218, pct: 47, colorKey: "sand" },
            { label: "Awake", minutes: 21,  pct: 5,  colorKey: "sandSoft" }
          ]
        },
        {
          type: "action-chips",
          items: [
            { icon: "pencil", label: "Log mood" },
            { icon: "play", label: "Breathe" },
            { icon: "calendar", label: "Day plan" }
          ]
        }
      ]
    },
    {
      id: "move",
      label: "Move",
      description: "Movement log — activity rings, zone breakdown, and recent workouts",
      components: [
        {
          type: "wordmark-topbar",
          brand: "BALM",
          brandStyle: "serif-spaced",
          right: "Today"
        },
        {
          type: "ring-trio",
          rings: [
            { label: "Move",     value: 680, goal: 800, unit: "kcal", pct: 85, colorKey: "accent" },
            { label: "Exercise", value: 34,  goal: 45,  unit: "min",  pct: 76, colorKey: "accent2" },
            { label: "Stand",    value: 9,   goal: 12,  unit: "hrs",  pct: 75, colorKey: "statusOrange" }
          ],
          style: "concentric-editorial"
        },
        {
          type: "stat-grid",
          cols: 4,
          items: [
            { label: "Steps",    value: "8,241", sub: "goal 10k" },
            { label: "Distance", value: "5.8km", sub: "3.6mi" },
            { label: "Active",   value: "34m",   sub: "goal 45" },
            { label: "Floors",   value: "12",    sub: "climbed" }
          ]
        },
        {
          type: "hr-zone-bars",
          label: "HEART RATE ZONES",
          zones: [
            { label: "Zone 1  Recovery",    bpm: "< 100", min: 18, pct: 53, colorKey: "accent2Soft" },
            { label: "Zone 2  Aerobic base", bpm: "100–130", min: 10, pct: 29, colorKey: "accent2" },
            { label: "Zone 3  Tempo",        bpm: "130–155", min: 5,  pct: 15, colorKey: "statusOrange" },
            { label: "Zone 4  Threshold",    bpm: "155–175", min: 1,  pct: 3,  colorKey: "accent" }
          ]
        },
        {
          type: "workout-list",
          label: "RECENT ACTIVITY",
          items: [
            { type: "Morning Run",    dur: "34 min", dist: "4.9 km", hr: "148 avg bpm", when: "Today 06:18" },
            { type: "Mobility Flow",  dur: "20 min", dist: null,     hr: "89 avg bpm",  when: "Yesterday 07:02" },
            { type: "Cycling",        dur: "52 min", dist: "18.4 km",hr: "136 avg bpm", when: "Apr 1" }
          ]
        }
      ]
    },
    {
      id: "nourish",
      label: "Nourish",
      description: "Food and hydration log — macros, meals, intuitive eating cues",
      components: [
        {
          type: "wordmark-topbar",
          brand: "BALM",
          brandStyle: "serif-spaced",
          right: "Today"
        },
        {
          type: "caloric-arc-hero",
          consumed: 1420,
          goal: 2100,
          remaining: 680,
          style: "editorial-donut-display"
        },
        {
          type: "macro-progress-trio",
          label: "MACROS",
          items: [
            { label: "Protein", val: 78,  goal: 120, unit: "g", colorKey: "accent" },
            { label: "Carbs",   val: 165, goal: 220, unit: "g", colorKey: "statusOrange" },
            { label: "Fat",     val: 52,  goal: 70,  unit: "g", colorKey: "accent2" }
          ]
        },
        {
          type: "water-bar",
          label: "HYDRATION",
          consumed: 1.4, goal: 2.5, unit: "L",
          segments: 10, filled: 5,
          note: "Drink 1.1L more before 6pm"
        },
        {
          type: "meal-log",
          label: "MEALS TODAY",
          items: [
            { meal: "Breakfast", time: "7:15am",  foods: "Oat porridge, berries, almond milk", kcal: 420 },
            { meal: "Snack",     time: "10:30am", foods: "Greek yogurt, walnuts, honey",       kcal: 280 },
            { meal: "Lunch",     time: "12:45pm", foods: "Lentil soup, sourdough, olive oil",  kcal: 720 }
          ],
          addLabel: "+ Log dinner"
        },
        {
          type: "insight-card",
          badge: "NUTRITIONAL NOTE",
          body: "You're ahead on protein by lunch — unusual for you. A lighter dinner tonight would align with your early sleep goal.",
          accentKey: "accent2",
          style: "warm-callout-serif"
        }
      ]
    },
    {
      id: "reflect",
      label: "Reflect",
      description: "Evening reflection — mood check-in, body scan, journal, gratitude",
      components: [
        {
          type: "wordmark-topbar",
          brand: "BALM",
          brandStyle: "serif-spaced",
          right: "Evening"
        },
        {
          type: "mood-selector",
          label: "HOW ARE YOU FEELING?",
          options: [
            { symbol: "🌱", label: "Growing" },
            { symbol: "⚡", label: "Energised", selected: true },
            { symbol: "😌", label: "Calm" },
            { symbol: "🌊", label: "Flowing" },
            { symbol: "😴", label: "Tired" }
          ]
        },
        {
          type: "body-scan-list",
          label: "BODY SCAN",
          areas: [
            { region: "Head & neck",  tension: "low",    note: "No tension noted" },
            { region: "Shoulders",    tension: "medium", note: "Mild tightness post-run" },
            { region: "Lower back",   tension: "low",    note: "Looser than yesterday" },
            { region: "Legs",         tension: "medium", note: "Mild DOMS from tempo run" }
          ]
        },
        {
          type: "journal-card",
          label: "BALM PROMPT",
          prompt: "What did your body ask for today that you actually listened to?",
          preview: "I took a longer walk at lunch instead of eating at my desk. My energy after was noticeably different…",
          wordCount: 87
        },
        {
          type: "gratitude-list",
          label: "THREE THINGS",
          items: [
            "The morning run before the city woke up",
            "That my shoulders feel less locked than last week",
            "Eating a real lunch instead of snacking through meetings"
          ]
        },
        {
          type: "tomorrow-intent",
          label: "TOMORROW",
          user: "Rest day — walk, stretch, early dinner",
          suggestion: "Your HRV supports a light Zone 2 session — 30 min easy cycling would be ideal.",
          suggestedBy: "BALM"
        }
      ]
    },
    {
      id: "trends",
      label: "Trends",
      description: "7-day overview — sparkline grid, BALM AI correlations, weekly dots",
      components: [
        {
          type: "wordmark-topbar",
          brand: "BALM",
          brandStyle: "serif-spaced",
          right: "Mar 28 – Apr 3"
        },
        {
          type: "weekly-headline",
          headline: "Your best recovery week in 3 months.",
          sub: "HRV up 8%, sleep consistency 94%, and 4 of 7 readiness scores above 80.",
          style: "editorial-serif-callout"
        },
        {
          type: "sparkline-grid",
          label: "7-DAY TRENDS",
          cols: 2,
          charts: [
            { label: "Readiness", unit: "/100", data: [72,68,74,78,82,80,84], days: ["M","T","W","T","F","S","S"], colorKey: "accent2" },
            { label: "HRV",       unit: "ms",   data: [54,51,55,57,60,59,62], days: ["M","T","W","T","F","S","S"], colorKey: "accent" },
            { label: "Sleep",     unit: "hrs",  data: [6.8,7.1,7.0,7.3,7.5,8.1,7.7], days: ["M","T","W","T","F","S","S"], colorKey: "statusOrange" },
            { label: "Steps",     unit: "k",    data: [7.2,9.1,6.8,10.2,8.4,11.1,8.2], days: ["M","T","W","T","F","S","S"], colorKey: "accent2" }
          ]
        },
        {
          type: "correlation-cards",
          label: "BALM CORRELATIONS",
          items: [
            { finding: "Days you ran before 7am had 12% higher HRV the next morning", confidence: "high", colorKey: "accent2" },
            { finding: "Screens after 10pm reduced your sleep score by an average of 9 points", confidence: "high", colorKey: "accent" },
            { finding: "Thursday meals skew highest in processed carbs — and so do Thursday headaches", confidence: "medium", colorKey: "statusOrange" }
          ]
        },
        {
          type: "week-calendar-dots",
          label: "WEEK AT A GLANCE",
          days: [
            { day: "Mon", readiness: 72, mood: "calm",      workout: true },
            { day: "Tue", readiness: 68, mood: "tired",     workout: false },
            { day: "Wed", readiness: 74, mood: "growing",   workout: true },
            { day: "Thu", readiness: 78, mood: "energised", workout: true },
            { day: "Fri", readiness: 82, mood: "flowing",   workout: true },
            { day: "Sat", readiness: 80, mood: "calm",      workout: false },
            { day: "Sun", readiness: 84, mood: "energised", workout: true }
          ]
        }
      ]
    }
  ],
  nav: [
    { id: "morning", label: "Morning", icon: "sunrise" },
    { id: "move",    label: "Move",    icon: "activity" },
    { id: "nourish", label: "Nourish", icon: "leaf" },
    { id: "reflect", label: "Reflect", icon: "heart" },
    { id: "trends",  label: "Trends",  icon: "chart" }
  ]
};

fs.writeFileSync('balm.pen', JSON.stringify(pen, null, 2));
const size = fs.statSync('balm.pen').size;
console.log('✓ balm.pen written (' + size + ' bytes)');
console.log('  Screens: ' + pen.screens.map(s => s.label).join(', '));
