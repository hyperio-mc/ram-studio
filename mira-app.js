// MIRA — Cognitive Wellness Tracker
// Inspired by: Dawn (evidence-based AI for mental health, spotted on Lapa Ninja) + Amie (calendar/minimal, Godly.website)
// Trend: "Computational Warmth" — clinical data precision with genuinely warm, human visual design
// Theme: LIGHT (previous was dark/axon)

'use strict';
const fs = require('fs');

const SLUG = 'mira';
const APP_NAME = 'Mira';
const TAGLINE = 'Think clearly, feel grounded';

const palette = {
  bg:        '#FAF8F4',   // warm cream
  surface:   '#FFFFFF',
  surface2:  '#F3F0EB',
  surface3:  '#EDE9E2',
  text:      '#1C1917',
  textMuted: 'rgba(28,25,23,0.45)',
  accent:    '#4A7C5A',   // sage green
  accent2:   '#C4704A',   // terracotta
  accent3:   '#7B68AA',   // muted violet
  border:    '#E5E1D9',
  borderLight: '#EDE9E2',
};

const pen = {
  version: '2.8',
  meta: {
    name: 'Mira',
    slug: SLUG,
    tagline: TAGLINE,
    description: 'A cognitive wellness tracker for high-performers. Evidence-based mood logging, focus scoring, and pattern insights — all wrapped in a warm, unhurried interface.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    inspiration: 'Dawn (evidence-based AI for mental health, Lapa Ninja) + Amie calendar app (Godly.website) — computational warmth: clinical precision meets human softness',
    tags: ['wellness', 'productivity', 'mental-health', 'light', 'data', 'ai'],
  },
  canvas: { width: 390, height: 844, platform: 'mobile' },
  palette,
  screens: [

    // ── SCREEN 1 ── Daily Overview
    {
      id: 'overview',
      name: 'Today',
      bg: palette.bg,
      elements: [
        // Status bar
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },

        // Greeting header
        { type: 'text', x: 20, y: 68, text: 'Good morning, Rakis', fontSize: 13, color: palette.textMuted },
        { type: 'text', x: 20, y: 90, text: 'Thursday, Mar 26', fontSize: 24, fontWeight: '700', color: palette.text },

        // Wellness score card
        { type: 'rect', x: 16, y: 112, w: 358, h: 130, rx: 20, fill: palette.accent },
        { type: 'text', x: 36, y: 140, text: 'CLARITY SCORE', fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: 1.5 },
        { type: 'text', x: 36, y: 172, text: '78', fontSize: 54, fontWeight: '800', color: '#FFFFFF' },
        { type: 'text', x: 84, y: 185, text: '/100', fontSize: 16, color: 'rgba(255,255,255,0.6)' },
        { type: 'text', x: 36, y: 200, text: '↑ 12 pts from yesterday', fontSize: 12, color: 'rgba(255,255,255,0.75)' },

        // Ring chart (decorative)
        { type: 'circle', cx: 320, cy: 177, r: 42, fill: 'none', stroke: 'rgba(255,255,255,0.15)', strokeWidth: 8 },
        { type: 'arc', cx: 320, cy: 177, r: 42, startAngle: -90, endAngle: 191, stroke: 'rgba(255,255,255,0.85)', strokeWidth: 8, fill: 'none', strokeLinecap: 'round' },
        { type: 'text', x: 320, y: 173, text: '78%', fontSize: 11, fontWeight: '700', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 320, y: 187, text: 'focus', fontSize: 9, color: 'rgba(255,255,255,0.65)', textAnchor: 'middle' },

        // 3-metric row
        { type: 'rect', x: 16, y: 254, w: 110, h: 80, rx: 16, fill: palette.surface },
        { type: 'rect', x: 16, y: 254, w: 110, h: 80, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 71, y: 284, text: '😴', fontSize: 20, textAnchor: 'middle' },
        { type: 'text', x: 71, y: 306, text: '7h 20m', fontSize: 13, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 71, y: 320, text: 'Sleep', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 140, y: 254, w: 110, h: 80, rx: 16, fill: palette.surface },
        { type: 'rect', x: 140, y: 254, w: 110, h: 80, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 195, y: 284, text: '🧠', fontSize: 20, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 306, text: 'Medium', fontSize: 13, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 320, text: 'Cog. Load', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 264, y: 254, w: 110, h: 80, rx: 16, fill: palette.surface },
        { type: 'rect', x: 264, y: 254, w: 110, h: 80, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 319, y: 284, text: '🌿', fontSize: 20, textAnchor: 'middle' },
        { type: 'text', x: 319, y: 306, text: '3 / 5', fontSize: 13, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 319, y: 320, text: 'Recovery', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },

        // Mood prompt card
        { type: 'rect', x: 16, y: 346, w: 358, h: 88, rx: 16, fill: palette.surface2 },
        { type: 'text', x: 36, y: 372, text: 'How are you feeling right now?', fontSize: 14, fontWeight: '600', color: palette.text },
        { type: 'text', x: 36, y: 390, text: 'Last check-in was 3 hours ago', fontSize: 11, color: palette.textMuted },
        // Mood buttons
        { type: 'rect', x: 36, y: 402, w: 44, h: 22, rx: 11, fill: palette.surface },
        { type: 'text', x: 58, y: 417, text: '😔', fontSize: 12, textAnchor: 'middle' },
        { type: 'rect', x: 86, y: 402, w: 44, h: 22, rx: 11, fill: palette.surface },
        { type: 'text', x: 108, y: 417, text: '😐', fontSize: 12, textAnchor: 'middle' },
        { type: 'rect', x: 136, y: 402, w: 44, h: 22, rx: 11, fill: palette.accent },
        { type: 'text', x: 158, y: 417, text: '🙂', fontSize: 12, textAnchor: 'middle' },
        { type: 'rect', x: 186, y: 402, w: 44, h: 22, rx: 11, fill: palette.surface },
        { type: 'text', x: 208, y: 417, text: '😄', fontSize: 12, textAnchor: 'middle' },
        { type: 'rect', x: 236, y: 402, w: 44, h: 22, rx: 11, fill: palette.surface },
        { type: 'text', x: 258, y: 417, text: '🤩', fontSize: 12, textAnchor: 'middle' },

        // Focus timeline section
        { type: 'text', x: 20, y: 458, text: "Today's Focus Blocks", fontSize: 15, fontWeight: '700', color: palette.text },
        { type: 'text', x: 20, y: 474, text: '3 sessions · 4h 10m total', fontSize: 11, color: palette.textMuted },

        // Timeline bars
        { type: 'rect', x: 16, y: 488, w: 358, h: 52, rx: 14, fill: palette.surface },
        { type: 'rect', x: 16, y: 488, w: 358, h: 52, rx: 14, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 32, y: 504, w: 6, h: 20, rx: 3, fill: palette.accent },
        { type: 'text', x: 48, y: 515, text: '8:00 AM', fontSize: 11, fontWeight: '600', color: palette.text },
        { type: 'text', x: 48, y: 529, text: 'Deep work · 90 min · Score 91', fontSize: 10, color: palette.textMuted },
        { type: 'rect', x: 340, y: 504, w: 18, h: 20, rx: 10, fill: palette.surface2 },
        { type: 'text', x: 349, y: 519, text: '→', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 16, y: 548, w: 358, h: 52, rx: 14, fill: palette.surface },
        { type: 'rect', x: 16, y: 548, w: 358, h: 52, rx: 14, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 32, y: 564, w: 6, h: 20, rx: 3, fill: palette.accent2 },
        { type: 'text', x: 48, y: 575, text: '10:30 AM', fontSize: 11, fontWeight: '600', color: palette.text },
        { type: 'text', x: 48, y: 589, text: 'Meetings · 60 min · Score 62', fontSize: 10, color: palette.textMuted },
        { type: 'rect', x: 340, y: 564, w: 18, h: 20, rx: 10, fill: palette.surface2 },
        { type: 'text', x: 349, y: 579, text: '→', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 16, y: 608, w: 358, h: 52, rx: 14, fill: palette.surface },
        { type: 'rect', x: 16, y: 608, w: 358, h: 52, rx: 14, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 32, y: 624, w: 6, h: 20, rx: 3, fill: palette.accent3 },
        { type: 'text', x: 48, y: 635, text: '12:00 PM', fontSize: 11, fontWeight: '600', color: palette.text },
        { type: 'text', x: 48, y: 649, text: 'Flow state · 160 min · Score 88', fontSize: 10, color: palette.textMuted },
        { type: 'rect', x: 340, y: 624, w: 18, h: 20, rx: 10, fill: palette.surface2 },
        { type: 'text', x: 349, y: 639, text: '→', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },

        // Bottom nav
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: palette.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 49, y: 808, text: '●', fontSize: 6, color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 49, y: 822, text: 'Today', fontSize: 10, fontWeight: '600', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 808, text: '📊', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 822, text: 'Insights', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 802, text: '+', fontSize: 24, fontWeight: '300', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'rect', x: 171, y: 787, w: 48, h: 36, rx: 18, fill: palette.accent },
        { type: 'text', x: 195, y: 811, text: '+', fontSize: 22, fontWeight: '300', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 261, y: 808, text: '🌿', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 261, y: 822, text: 'Focus', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 808, text: '👤', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 822, text: 'Profile', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 2 ── Mood + Log Entry
    {
      id: 'log',
      name: 'Log Entry',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },

        // Back button + title
        { type: 'rect', x: 16, y: 58, w: 36, h: 36, rx: 18, fill: palette.surface2 },
        { type: 'text', x: 34, y: 82, text: '←', fontSize: 16, color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 82, text: 'Check In', fontSize: 17, fontWeight: '700', color: palette.text, textAnchor: 'middle' },

        // Mood picker large
        { type: 'text', x: 195, y: 130, text: 'How are you feeling?', fontSize: 20, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 152, text: 'Be honest — no judgment here', fontSize: 13, color: palette.textMuted, textAnchor: 'middle' },

        // Large emoji selector
        { type: 'rect', x: 16, y: 168, w: 358, h: 90, rx: 20, fill: palette.surface },
        { type: 'rect', x: 16, y: 168, w: 358, h: 90, rx: 20, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 52, y: 222, text: '😔', fontSize: 32, textAnchor: 'middle' },
        { type: 'text', x: 52, y: 244, text: 'Rough', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 115, y: 222, text: '😐', fontSize: 32, textAnchor: 'middle' },
        { type: 'text', x: 115, y: 244, text: 'Meh', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        // Selected state
        { type: 'rect', x: 164, y: 178, w: 62, h: 70, rx: 14, fill: palette.accent, opacity: 0.12 },
        { type: 'rect', x: 164, y: 178, w: 62, h: 70, rx: 14, fill: 'none', stroke: palette.accent, strokeWidth: 1.5 },
        { type: 'text', x: 195, y: 222, text: '🙂', fontSize: 32, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 244, text: 'Good', fontSize: 9, color: palette.accent, fontWeight: '600', textAnchor: 'middle' },
        { type: 'text', x: 275, y: 222, text: '😄', fontSize: 32, textAnchor: 'middle' },
        { type: 'text', x: 275, y: 244, text: 'Great', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 222, text: '🤩', fontSize: 32, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 244, text: 'Peak', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        // Energy level slider
        { type: 'text', x: 20, y: 290, text: 'Energy Level', fontSize: 15, fontWeight: '700', color: palette.text },
        { type: 'text', x: 370, y: 290, text: '7/10', fontSize: 13, color: palette.accent, fontWeight: '600', textAnchor: 'end' },
        { type: 'rect', x: 20, y: 304, w: 350, h: 6, rx: 3, fill: palette.surface3 },
        { type: 'rect', x: 20, y: 304, w: 245, h: 6, rx: 3, fill: palette.accent },
        { type: 'circle', cx: 265, cy: 307, r: 10, fill: '#FFFFFF', stroke: palette.accent, strokeWidth: 2 },

        // Cognitive load
        { type: 'text', x: 20, y: 342, text: 'Cognitive Load', fontSize: 15, fontWeight: '700', color: palette.text },
        { type: 'text', x: 370, y: 342, text: '5/10', fontSize: 13, color: palette.accent2, fontWeight: '600', textAnchor: 'end' },
        { type: 'rect', x: 20, y: 356, w: 350, h: 6, rx: 3, fill: palette.surface3 },
        { type: 'rect', x: 20, y: 356, w: 175, h: 6, rx: 3, fill: palette.accent2 },
        { type: 'circle', cx: 195, cy: 359, r: 10, fill: '#FFFFFF', stroke: palette.accent2, strokeWidth: 2 },

        // Context tags
        { type: 'text', x: 20, y: 398, text: "What's contributing?", fontSize: 15, fontWeight: '700', color: palette.text },
        // Tag chips
        { type: 'rect', x: 20, y: 414, w: 82, h: 28, rx: 14, fill: palette.accent, opacity: 0.15 },
        { type: 'rect', x: 20, y: 414, w: 82, h: 28, rx: 14, fill: 'none', stroke: palette.accent, strokeWidth: 1 },
        { type: 'text', x: 61, y: 433, text: '🧘 Rested', fontSize: 11, color: palette.accent, fontWeight: '600', textAnchor: 'middle' },
        { type: 'rect', x: 110, y: 414, w: 94, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 157, y: 433, text: '💻 Deep work', fontSize: 11, color: palette.text, textAnchor: 'middle' },
        { type: 'rect', x: 212, y: 414, w: 82, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 253, y: 433, text: '☕ Caffeine', fontSize: 11, color: palette.text, textAnchor: 'middle' },
        { type: 'rect', x: 302, y: 414, w: 72, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 338, y: 433, text: '🏃 Exercise', fontSize: 11, color: palette.text, textAnchor: 'middle' },
        { type: 'rect', x: 20, y: 450, w: 80, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 60, y: 469, text: '🤝 Meeting', fontSize: 11, color: palette.text, textAnchor: 'middle' },
        { type: 'rect', x: 108, y: 450, w: 68, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 142, y: 469, text: '😓 Stressed', fontSize: 11, color: palette.text, textAnchor: 'middle' },
        { type: 'rect', x: 184, y: 450, w: 62, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 215, y: 469, text: '+ Add tag', fontSize: 11, color: palette.textMuted, textAnchor: 'middle' },

        // Private note
        { type: 'text', x: 20, y: 508, text: 'Private note', fontSize: 15, fontWeight: '700', color: palette.text },
        { type: 'text', x: 370, y: 508, text: '🔒', fontSize: 12, textAnchor: 'end' },
        { type: 'rect', x: 20, y: 520, w: 350, h: 80, rx: 14, fill: palette.surface },
        { type: 'rect', x: 20, y: 520, w: 350, h: 80, rx: 14, fill: 'none', stroke: palette.accent, strokeWidth: 1.5 },
        { type: 'text', x: 36, y: 546, text: 'Had a productive morning, the deep work', fontSize: 12, color: palette.text },
        { type: 'text', x: 36, y: 562, text: "session on the API redesign really clicked.", fontSize: 12, color: palette.text },
        { type: 'text', x: 36, y: 578, text: "Feeling good about the afternoon ahead...", fontSize: 12, color: palette.textMuted },

        // CTA
        { type: 'rect', x: 20, y: 628, w: 350, h: 52, rx: 26, fill: palette.accent },
        { type: 'text', x: 195, y: 660, text: 'Save Check-in', fontSize: 16, fontWeight: '700', color: '#FFFFFF', textAnchor: 'middle' },

        // Nav
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: palette.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 49, y: 808, text: '📅', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 49, y: 822, text: 'Today', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 808, text: '📊', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 822, text: 'Insights', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'rect', x: 171, y: 787, w: 48, h: 36, rx: 18, fill: palette.accent },
        { type: 'text', x: 195, y: 811, text: '+', fontSize: 22, fontWeight: '300', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 261, y: 808, text: '🌿', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 261, y: 822, text: 'Focus', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 808, text: '👤', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 822, text: 'Profile', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 3 ── Weekly Insights
    {
      id: 'insights',
      name: 'Insights',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },

        { type: 'text', x: 20, y: 68, text: 'Insights', fontSize: 28, fontWeight: '800', color: palette.text },
        { type: 'text', x: 20, y: 92, text: 'Mar 20 – Mar 26', fontSize: 13, color: palette.textMuted },

        // Week selector tabs
        { type: 'rect', x: 16, y: 106, w: 358, h: 36, rx: 18, fill: palette.surface2 },
        { type: 'rect', x: 18, y: 108, w: 116, h: 32, rx: 16, fill: '#FFFFFF' },
        { type: 'text', x: 76, y: 130, text: 'Week', fontSize: 13, fontWeight: '600', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 130, text: 'Month', fontSize: 13, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 316, y: 130, text: 'Quarter', fontSize: 13, color: palette.textMuted, textAnchor: 'middle' },

        // Trend chart card
        { type: 'rect', x: 16, y: 154, w: 358, h: 148, rx: 20, fill: palette.surface },
        { type: 'rect', x: 16, y: 154, w: 358, h: 148, rx: 20, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 32, y: 178, text: 'Clarity Score — 7 Days', fontSize: 13, fontWeight: '700', color: palette.text },
        { type: 'text', x: 350, y: 178, text: 'Avg 71', fontSize: 12, color: palette.accent, fontWeight: '600', textAnchor: 'end' },

        // Chart bars
        { type: 'rect', x: 34, y: 270, w: 28, h: 0, rx: 4, fill: palette.surface3 },
        { type: 'rect', x: 34, y: 240, w: 28, h: 30, rx: 4, fill: palette.accent, opacity: 0.5 },
        { type: 'text', x: 48, y: 284, text: 'M', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 80, y: 220, w: 28, h: 50, rx: 4, fill: palette.accent, opacity: 0.6 },
        { type: 'text', x: 94, y: 284, text: 'T', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 126, y: 230, w: 28, h: 40, rx: 4, fill: palette.accent, opacity: 0.7 },
        { type: 'text', x: 140, y: 284, text: 'W', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 172, y: 210, w: 28, h: 60, rx: 4, fill: palette.accent, opacity: 0.8 },
        { type: 'text', x: 186, y: 284, text: 'T', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 218, y: 250, w: 28, h: 20, rx: 4, fill: palette.accent, opacity: 0.45 },
        { type: 'text', x: 232, y: 284, text: 'F', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 264, y: 225, w: 28, h: 45, rx: 4, fill: palette.accent, opacity: 0.65 },
        { type: 'text', x: 278, y: 284, text: 'S', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 310, y: 196, w: 28, h: 74, rx: 4, fill: palette.accent },
        { type: 'text', x: 324, y: 284, text: 'S', fontSize: 9, color: palette.accent, fontWeight: '700', textAnchor: 'middle' },

        // Key patterns
        { type: 'text', x: 20, y: 326, text: 'Patterns Found', fontSize: 15, fontWeight: '700', color: palette.text },

        // Pattern card 1
        { type: 'rect', x: 16, y: 340, w: 358, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 16, y: 340, w: 358, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 32, y: 360, w: 36, h: 36, rx: 10, fill: 'rgba(74,124,90,0.12)' },
        { type: 'text', x: 50, y: 384, text: '🌅', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 80, y: 362, text: 'Morning peak performance', fontSize: 13, fontWeight: '600', color: palette.text },
        { type: 'text', x: 80, y: 378, text: 'Your clarity scores are 34% higher', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 80, y: 392, text: 'before 11 AM vs. afternoon sessions.', fontSize: 11, color: palette.textMuted },

        // Pattern card 2
        { type: 'rect', x: 16, y: 420, w: 358, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 16, y: 420, w: 358, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 32, y: 440, w: 36, h: 36, rx: 10, fill: 'rgba(196,112,74,0.12)' },
        { type: 'text', x: 50, y: 464, text: '😴', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 80, y: 442, text: 'Sleep drives everything', fontSize: 13, fontWeight: '600', color: palette.text },
        { type: 'text', x: 80, y: 458, text: 'On days with 7h+ sleep, your focus', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 80, y: 472, text: 'score averages 82. Below 6h: just 54.', fontSize: 11, color: palette.textMuted },

        // Pattern card 3
        { type: 'rect', x: 16, y: 500, w: 358, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 16, y: 500, w: 358, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'rect', x: 32, y: 520, w: 36, h: 36, rx: 10, fill: 'rgba(123,104,170,0.12)' },
        { type: 'text', x: 50, y: 544, text: '🏃', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 80, y: 522, text: 'Exercise boosts your afternoon', fontSize: 13, fontWeight: '600', color: palette.text },
        { type: 'text', x: 80, y: 538, text: 'Days with morning exercise show', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 80, y: 552, text: '+22% afternoon focus scores.', fontSize: 11, color: palette.textMuted },

        // Mira AI insight
        { type: 'rect', x: 16, y: 584, w: 358, h: 76, rx: 16, fill: 'rgba(74,124,90,0.08)' },
        { type: 'rect', x: 16, y: 584, w: 358, h: 76, rx: 16, fill: 'none', stroke: 'rgba(74,124,90,0.3)', strokeWidth: 1 },
        { type: 'rect', x: 32, y: 600, w: 28, h: 28, rx: 8, fill: palette.accent },
        { type: 'text', x: 46, y: 619, text: 'M', fontSize: 13, fontWeight: '800', color: '#FFF', textAnchor: 'middle' },
        { type: 'text', x: 72, y: 604, text: 'Mira suggests:', fontSize: 11, color: palette.accent, fontWeight: '600' },
        { type: 'text', x: 72, y: 620, text: 'Schedule your API design session for', fontSize: 11, color: palette.text },
        { type: 'text', x: 72, y: 634, text: 'tomorrow 8–10 AM — your optimal window.', fontSize: 11, color: palette.text },
        { type: 'text', x: 72, y: 648, text: 'Add it to calendar →', fontSize: 11, color: palette.accent, fontWeight: '600' },

        // Nav
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: palette.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 49, y: 808, text: '📅', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 49, y: 822, text: 'Today', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 808, text: '●', fontSize: 6, color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 822, text: 'Insights', fontSize: 10, fontWeight: '600', color: palette.accent, textAnchor: 'middle' },
        { type: 'rect', x: 171, y: 787, w: 48, h: 36, rx: 18, fill: palette.accent },
        { type: 'text', x: 195, y: 811, text: '+', fontSize: 22, fontWeight: '300', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 261, y: 808, text: '🌿', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 261, y: 822, text: 'Focus', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 808, text: '👤', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 822, text: 'Profile', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 4 ── Focus Session (Ambient Timer)
    {
      id: 'focus',
      name: 'Focus Session',
      bg: '#F5F2EC',
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: '#F5F2EC' },
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: '#F5F2EC' },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },

        // Header
        { type: 'text', x: 195, y: 70, text: 'Focus Session', fontSize: 17, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'rect', x: 330, y: 54, w: 44, h: 28, rx: 14, fill: palette.surface2 },
        { type: 'text', x: 352, y: 73, text: 'End', fontSize: 12, color: palette.accent, fontWeight: '600', textAnchor: 'middle' },

        // Large timer circle
        { type: 'circle', cx: 195, cy: 230, r: 120, fill: '#FFFFFF', stroke: palette.border, strokeWidth: 1 },
        { type: 'circle', cx: 195, cy: 230, r: 105, fill: 'none', stroke: palette.surface3, strokeWidth: 12 },
        { type: 'arc', cx: 195, cy: 230, r: 105, startAngle: -90, endAngle: 170, stroke: palette.accent, strokeWidth: 12, fill: 'none', strokeLinecap: 'round' },
        { type: 'text', x: 195, y: 212, text: '42:18', fontSize: 44, fontWeight: '800', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 234, text: 'remaining', fontSize: 13, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 260, text: 'Deep Work — Pomodoro', fontSize: 12, color: palette.accent, fontWeight: '600', textAnchor: 'middle' },

        // Live metrics row
        { type: 'rect', x: 16, y: 374, w: 110, h: 70, rx: 16, fill: '#FFFFFF' },
        { type: 'rect', x: 16, y: 374, w: 110, h: 70, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 71, y: 402, text: 'Flow', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 71, y: 426, text: 'HIGH', fontSize: 16, fontWeight: '800', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 71, y: 438, text: '↑ rising', fontSize: 9, color: palette.accent, textAnchor: 'middle' },

        { type: 'rect', x: 140, y: 374, w: 110, h: 70, rx: 16, fill: '#FFFFFF' },
        { type: 'rect', x: 140, y: 374, w: 110, h: 70, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 195, y: 402, text: 'Distractions', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 426, text: '2', fontSize: 16, fontWeight: '800', color: palette.accent2, textAnchor: 'middle' },
        { type: 'text', x: 195, y: 438, text: 'this session', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        { type: 'rect', x: 264, y: 374, w: 110, h: 70, rx: 16, fill: '#FFFFFF' },
        { type: 'rect', x: 264, y: 374, w: 110, h: 70, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 319, y: 402, text: 'Score so far', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 319, y: 426, text: '88', fontSize: 16, fontWeight: '800', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 319, y: 438, text: '↑ personal best', fontSize: 9, color: palette.accent, textAnchor: 'middle' },

        // Focus context
        { type: 'rect', x: 16, y: 458, w: 358, h: 60, rx: 16, fill: '#FFFFFF' },
        { type: 'rect', x: 16, y: 458, w: 358, h: 60, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 480, text: 'Working on:', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 36, y: 498, text: 'API Redesign — Authentication Module', fontSize: 13, fontWeight: '600', color: palette.text },
        { type: 'text', x: 338, y: 492, text: '✏️', fontSize: 16, textAnchor: 'middle' },

        // Controls
        { type: 'rect', x: 16, y: 534, w: 358, h: 64, rx: 20, fill: '#FFFFFF' },
        { type: 'rect', x: 16, y: 534, w: 358, h: 64, rx: 20, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 88, y: 572, text: '⏸', fontSize: 22, textAnchor: 'middle' },
        { type: 'rect', x: 155, y: 542, w: 80, h: 48, rx: 24, fill: palette.accent },
        { type: 'text', x: 195, y: 572, text: '⏵', fontSize: 22, color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 303, y: 572, text: '↺', fontSize: 22, textAnchor: 'middle' },

        // Ambient note
        { type: 'text', x: 195, y: 626, text: '🌿 You\'re in a flow state. Keep going.', fontSize: 12, color: palette.accent, textAnchor: 'middle' },

        // Nav
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: '#FFFFFF' },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 49, y: 808, text: '📅', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 49, y: 822, text: 'Today', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 808, text: '📊', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 822, text: 'Insights', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'rect', x: 171, y: 787, w: 48, h: 36, rx: 18, fill: palette.accent },
        { type: 'text', x: 195, y: 811, text: '+', fontSize: 22, fontWeight: '300', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 261, y: 808, text: '●', fontSize: 6, color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 261, y: 822, text: 'Focus', fontSize: 10, fontWeight: '600', color: palette.accent, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 808, text: '👤', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 822, text: 'Profile', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

    // ── SCREEN 5 ── Weekly Review / Sustainable Pace
    {
      id: 'review',
      name: 'Weekly Review',
      bg: palette.bg,
      elements: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: palette.bg },
        { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: palette.text },

        // Header
        { type: 'text', x: 20, y: 68, text: 'Weekly Review', fontSize: 28, fontWeight: '800', color: palette.text },
        { type: 'text', x: 20, y: 90, text: 'Mar 20 – Mar 26 · Week 13', fontSize: 13, color: palette.textMuted },

        // Hero score
        { type: 'rect', x: 16, y: 108, w: 358, h: 110, rx: 20, fill: palette.surface2 },
        { type: 'rect', x: 16, y: 108, w: 358, h: 110, rx: 20, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 138, text: 'SUSTAINABLE PACE SCORE', fontSize: 10, fontWeight: '700', color: palette.textMuted, letterSpacing: 1.2 },
        { type: 'text', x: 36, y: 182, text: '74', fontSize: 58, fontWeight: '800', color: palette.text },
        { type: 'text', x: 84, y: 196, text: '/100', fontSize: 16, color: palette.textMuted },
        { type: 'text', x: 36, y: 206, text: '↑ 8 pts from last week · Great momentum', fontSize: 12, color: palette.accent },

        // Indicator dots
        { type: 'circle', cx: 310, cy: 163, r: 35, fill: 'none', stroke: palette.border, strokeWidth: 8 },
        { type: 'arc', cx: 310, cy: 163, r: 35, startAngle: -90, endAngle: 177, stroke: palette.accent, strokeWidth: 8, fill: 'none', strokeLinecap: 'round' },
        { type: 'text', x: 310, y: 159, text: '74%', fontSize: 12, fontWeight: '700', color: palette.text, textAnchor: 'middle' },
        { type: 'text', x: 310, y: 174, text: 'pace', fontSize: 9, color: palette.textMuted, textAnchor: 'middle' },

        // 4 stat cards
        { type: 'rect', x: 16, y: 232, w: 170, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 16, y: 232, w: 170, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 256, text: 'Focus Hours', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 36, y: 280, text: '22h 40m', fontSize: 18, fontWeight: '800', color: palette.text },
        { type: 'text', x: 36, y: 296, text: '↑ 3h from last week', fontSize: 10, color: palette.accent },

        { type: 'rect', x: 204, y: 232, w: 170, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 204, y: 232, w: 170, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 224, y: 256, text: 'Check-ins Logged', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 224, y: 280, text: '18 / 21', fontSize: 18, fontWeight: '800', color: palette.text },
        { type: 'text', x: 224, y: 296, text: '86% streak maintained', fontSize: 10, color: palette.accent },

        { type: 'rect', x: 16, y: 314, w: 170, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 16, y: 314, w: 170, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 338, text: 'Avg Mood', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 36, y: 362, text: '🙂 Good', fontSize: 18, fontWeight: '800', color: palette.text },
        { type: 'text', x: 36, y: 378, text: 'Up from "Meh" last week', fontSize: 10, color: palette.accent },

        { type: 'rect', x: 204, y: 314, w: 170, h: 72, rx: 16, fill: palette.surface },
        { type: 'rect', x: 204, y: 314, w: 170, h: 72, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 224, y: 338, text: 'Recovery Days', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 224, y: 362, text: '2 days', fontSize: 18, fontWeight: '800', color: palette.text },
        { type: 'text', x: 224, y: 378, text: 'Sat + Sun (healthy!)', fontSize: 10, color: palette.accent },

        // Habit tracker
        { type: 'text', x: 20, y: 412, text: 'Habit Consistency', fontSize: 15, fontWeight: '700', color: palette.text },

        { type: 'rect', x: 16, y: 426, w: 358, h: 44, rx: 14, fill: palette.surface },
        { type: 'rect', x: 16, y: 426, w: 358, h: 44, rx: 14, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 453, text: '🌅 Morning routine', fontSize: 12, color: palette.text },
        { type: 'rect', x: 200, y: 436, w: 148, h: 12, rx: 6, fill: palette.surface3 },
        { type: 'rect', x: 200, y: 436, w: 133, h: 12, rx: 6, fill: palette.accent },
        { type: 'text', x: 354, y: 449, text: '90%', fontSize: 10, fontWeight: '700', color: palette.accent, textAnchor: 'end' },

        { type: 'rect', x: 16, y: 478, w: 358, h: 44, rx: 14, fill: palette.surface },
        { type: 'rect', x: 16, y: 478, w: 358, h: 44, rx: 14, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 505, text: '🏃 Exercise', fontSize: 12, color: palette.text },
        { type: 'rect', x: 200, y: 488, w: 148, h: 12, rx: 6, fill: palette.surface3 },
        { type: 'rect', x: 200, y: 488, w: 89, h: 12, rx: 6, fill: palette.accent2 },
        { type: 'text', x: 354, y: 501, text: '60%', fontSize: 10, fontWeight: '700', color: palette.accent2, textAnchor: 'end' },

        { type: 'rect', x: 16, y: 530, w: 358, h: 44, rx: 14, fill: palette.surface },
        { type: 'rect', x: 16, y: 530, w: 358, h: 44, rx: 14, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 557, text: '📵 Digital sunset', fontSize: 12, color: palette.text },
        { type: 'rect', x: 200, y: 540, w: 148, h: 12, rx: 6, fill: palette.surface3 },
        { type: 'rect', x: 200, y: 540, w: 59, h: 12, rx: 6, fill: palette.accent3 },
        { type: 'text', x: 354, y: 553, text: '40%', fontSize: 10, fontWeight: '700', color: palette.accent3, textAnchor: 'end' },

        // Next week intention
        { type: 'rect', x: 16, y: 590, w: 358, h: 80, rx: 16, fill: '#FFFFFF' },
        { type: 'rect', x: 16, y: 590, w: 358, h: 80, rx: 16, fill: 'none', stroke: palette.border, strokeWidth: 1 },
        { type: 'text', x: 36, y: 614, text: 'Set intention for next week', fontSize: 13, fontWeight: '700', color: palette.text },
        { type: 'text', x: 36, y: 632, text: '"Protect morning focus blocks and add', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 36, y: 648, text: 'one more exercise session mid-week."', fontSize: 11, color: palette.textMuted },
        { type: 'text', x: 36, y: 662, text: 'Edit intention →', fontSize: 11, color: palette.accent, fontWeight: '600' },

        // Nav
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: palette.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: palette.border },
        { type: 'text', x: 49, y: 808, text: '📅', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 49, y: 822, text: 'Today', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 808, text: '📊', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 130, y: 822, text: 'Insights', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'rect', x: 171, y: 787, w: 48, h: 36, rx: 18, fill: palette.accent },
        { type: 'text', x: 195, y: 811, text: '+', fontSize: 22, fontWeight: '300', color: '#FFFFFF', textAnchor: 'middle' },
        { type: 'text', x: 261, y: 808, text: '🌿', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 261, y: 822, text: 'Focus', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 808, text: '👤', fontSize: 18, textAnchor: 'middle' },
        { type: 'text', x: 342, y: 822, text: 'Profile', fontSize: 10, color: palette.textMuted, textAnchor: 'middle' },
      ],
    },

  ], // end screens
};

// Write the .pen file
fs.writeFileSync('mira.pen', JSON.stringify(pen, null, 2));
console.log(`✓ mira.pen written (${pen.screens.length} screens)`);
