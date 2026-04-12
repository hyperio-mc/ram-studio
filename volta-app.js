#!/usr/bin/env node
'use strict';
// volta-app.js — VOLTA: luxury travel intelligence & concierge
//
// Design Challenge:
//   Build a dark, editorial luxury travel app inspired by:
//
//   1. Atlas Card (atlascard.com via godly.website — Apr 7 2026):
//      Ultra-premium concierge card site — deep editorial photography
//      backgrounds, uppercase section labels (DINING / HOTELS / EXPERIENCES),
//      "Request Invite" exclusivity pattern, cinematic scroll-reveal sections.
//      Gold/cream text on near-black. Each section gets its own full-bleed
//      atmospheric hero treatment.
//
//   2. Cushion.so (darkmodedesign.com):
//      Dark async messaging app — clean dark sidebar with emoji-labelled
//      channels, inbox UI with unread badges. Inspired the Concierge screen's
//      request-thread layout and quick-reply patterns.
//
//   3. Withframes.com (darkmodedesign.com):
//      Film photography notebook — dark, precise metadata tracking.
//      Inspired the dense Member card's monospaced card number treatment.
//
// Theme: DARK — folio was light; rotating to dark
// Slug:  volta-travel

const fs = require('fs');

const P = {
  bg:           '#090807',
  surface:      '#131110',
  surface2:     '#1A1714',
  surfaceAlt:   '#221E1B',
  text:         '#EDE5D8',
  textMuted:    'rgba(237,229,216,0.42)',
  accent:       '#C49A5E',
  accent2:      '#7EA38E',
  accentSoft:   'rgba(196,154,94,0.12)',
  accent2Soft:  'rgba(126,163,142,0.12)',
  border:       'rgba(237,229,216,0.08)',
  borderStrong: 'rgba(237,229,216,0.14)',
  borderAccent: 'rgba(196,154,94,0.22)',
  good:         '#7EA38E',
  warn:         '#C4905E',
  danger:       '#B06060',
  goodSoft:     'rgba(126,163,142,0.12)',
  warnSoft:     'rgba(196,144,94,0.12)',
  dangerSoft:   'rgba(176,96,96,0.12)',
};

const pen = {
  version: '2.8',
  meta: {
    name:      'VOLTA',
    tagline:   'Journeys, elevated.',
    archetype: 'luxury-travel-concierge',
    author:    'RAM Design Heartbeat',
    created:   new Date().toISOString(),
    theme:     'dark',
    inspired: [
      'Atlas Card (atlascard.com via godly.website) — editorial dark bg, uppercase DINING/HOTELS sections, Request Invite exclusivity pattern',
      'Cushion.so (darkmodedesign.com) — dark inbox/channels, request-thread layout, quick-reply buttons',
      'Withframes.com (darkmodedesign.com) — precise metadata UI, monospaced data in dark form',
    ],
  },
  palette: P,
  lightPalette: {
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#A07838',
    accent2: '#4E7D68',
    muted:   'rgba(26,21,16,0.42)',
  },
  typography: {
    display: { family: '"Cormorant Garamond", Georgia, serif', weight: 300, tracking: '0.04em' },
    heading: { family: '"Cormorant Garamond", Georgia, serif', weight: 400, tracking: '0.01em' },
    body:    { family: '"Inter", "Helvetica Neue", sans-serif', weight: 400 },
    label:   { family: '"Inter", "Helvetica Neue", sans-serif', weight: 500, tracking: '0.10em', transform: 'uppercase', size: '9px' },
    mono:    { family: '"SF Mono", "Fira Mono", monospace', weight: 400 },
  },
  screens: [

    {
      id: 'today', label: 'Today',
      description: 'Featured destination hero + curated picks and upcoming trips',
      fill: P.bg, width: 390, height: 844,
      components: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 44, fill: P.bg },
        { type: 'text', x: 20, y: 28, text: '9:41', fontSize: 14, fontWeight: 600, fill: P.text, align: 'left' },
        { type: 'text', x: 370, y: 28, text: 'lll', fontSize: 9, fill: P.textMuted, align: 'right' },

        // Hero card
        { type: 'rect', x: 0, y: 44, w: 390, h: 268, fill: '#1C2320' },
        { type: 'rect', x: 0, y: 44, w: 390, h: 268, fill: 'rgba(9,8,7,0.40)' },
        { type: 'rect', x: 0, y: 250, w: 390, h: 62, fill: 'rgba(9,8,7,0.75)' },
        { type: 'text', x: 20, y: 84, text: 'FEATURED DESTINATION', fontSize: 9, fill: P.accent, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'rect', x: 20, y: 89, w: 34, h: 1, fill: P.accent },
        { type: 'text', x: 20, y: 150, text: 'KYOTO', fontSize: 52, fontWeight: 300, fill: P.text, letterSpacing: 8, align: 'left' },
        { type: 'text', x: 20, y: 172, text: 'Japan  ·  Spring Season', fontSize: 12, fill: P.textMuted, letterSpacing: 1, align: 'left' },
        { type: 'rect', x: 20, y: 246, w: 78, h: 22, r: 11, fill: P.accentSoft },
        { type: 'text', x: 59, y: 261, text: '3 NIGHTS LEFT', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'center' },
        { type: 'rect', x: 306, y: 244, w: 64, h: 26, r: 13, fill: P.accent },
        { type: 'text', x: 338, y: 260, text: 'EXPLORE', fontSize: 8, fill: P.bg, letterSpacing: 2, fontWeight: 700, align: 'center' },

        { type: 'rect', x: 0, y: 312, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 334, text: "TODAY'S CURATION", fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 370, y: 334, text: 'SEE ALL', fontSize: 9, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'right' },

        // Card strip
        { type: 'rect', x: 20, y: 346, w: 150, h: 110, r: 6, fill: P.surface2 },
        { type: 'rect', x: 20, y: 346, w: 150, h: 65, r: 6, fill: '#1E2820' },
        { type: 'text', x: 32, y: 366, text: 'DINING', fontSize: 8, fill: P.accent, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 32, y: 390, text: 'Niku Kappo', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'text', x: 32, y: 408, text: 'Tokyo · Wagyu', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 32, y: 420, w: 48, h: 16, r: 8, fill: P.accent2Soft },
        { type: 'text', x: 56, y: 431, text: 'OPEN', fontSize: 8, fill: P.accent2, letterSpacing: 2, fontWeight: 600, align: 'center' },

        { type: 'rect', x: 182, y: 346, w: 150, h: 110, r: 6, fill: P.surface2 },
        { type: 'rect', x: 182, y: 346, w: 150, h: 65, r: 6, fill: '#201E2A' },
        { type: 'text', x: 194, y: 366, text: 'HOTEL', fontSize: 8, fill: P.accent, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 194, y: 390, text: 'Aman Kyoto', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'text', x: 194, y: 408, text: 'Kyoto · Forest Suite', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 194, y: 420, w: 64, h: 16, r: 8, fill: P.accentSoft },
        { type: 'text', x: 226, y: 431, text: 'MEMBER RATE', fontSize: 7, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'center' },

        { type: 'rect', x: 0, y: 472, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 492, text: 'UPCOMING', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },

        { type: 'rect', x: 20, y: 504, w: 350, h: 58, r: 6, fill: P.surface },
        { type: 'rect', x: 20, y: 504, w: 4, h: 58, r: 2, fill: P.accent },
        { type: 'text', x: 36, y: 524, text: 'Tokyo  Apr 12 - 18', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 540, text: '2 dining  1 hotel  1 experience', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 554, text: 'CONCIERGE CONFIRMED', fontSize: 8, fill: P.accent2, letterSpacing: 2, fontWeight: 600, align: 'left' },

        { type: 'rect', x: 20, y: 570, w: 350, h: 46, r: 6, fill: P.surface },
        { type: 'rect', x: 20, y: 570, w: 4, h: 46, r: 2, fill: P.borderStrong },
        { type: 'text', x: 36, y: 590, text: 'Kyoto  Apr 18 - 22', fontSize: 13, fontWeight: 500, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 606, text: '1 hotel pending  Concierge building itinerary', fontSize: 10, fill: P.textMuted, align: 'left' },

        { type: 'rect', x: 0, y: 628, w: 390, h: 1, fill: P.border },
        { type: 'rect', x: 20, y: 638, w: 350, h: 36, r: 6, fill: P.surfaceAlt },
        { type: 'text', x: 40, y: 659, text: 'OBSIDIAN MEMBER  48,200 pts', fontSize: 10, fill: P.accent, letterSpacing: 1, fontWeight: 500, align: 'left' },
        { type: 'text', x: 358, y: 659, text: '>', fontSize: 14, fill: P.accent, align: 'right' },

        // Tab bar
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: P.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: P.border },
        { type: 'rect', x: 28, y: 782, w: 34, h: 2, r: 1, fill: P.accent },
        { type: 'text', x: 45, y: 804, text: 'TODAY', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'center' },
        { type: 'text', x: 123, y: 804, text: 'DINING', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 195, y: 804, text: 'HOTELS', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 268, y: 804, text: 'CONCIERGE', fontSize: 7, fill: P.textMuted, letterSpacing: 1, align: 'center' },
        { type: 'text', x: 345, y: 804, text: 'MEMBER', fontSize: 7, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'rect', x: 0, y: 828, w: 390, h: 16, fill: P.surface },
        { type: 'rect', x: 130, y: 836, w: 130, h: 5, r: 2.5, fill: P.textMuted },
      ],
    },

    {
      id: 'dining', label: 'Dining',
      description: 'Restaurant discovery - availability windows, cuisine filters, member access',
      fill: P.bg, width: 390, height: 844,
      components: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 44, fill: P.bg },
        { type: 'text', x: 20, y: 28, text: '9:41', fontSize: 14, fontWeight: 600, fill: P.text, align: 'left' },
        { type: 'text', x: 370, y: 28, text: 'lll', fontSize: 9, fill: P.textMuted, align: 'right' },

        { type: 'text', x: 20, y: 78, text: 'DINING', fontSize: 26, fontWeight: 300, fill: P.text, letterSpacing: 8, align: 'left' },
        { type: 'text', x: 20, y: 96, text: 'Primetime access for Volta members', fontSize: 11, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 0, y: 108, w: 390, h: 1, fill: P.border },

        // Filter chips
        { type: 'rect', x: 20, y: 118, w: 42, h: 22, r: 11, fill: P.accent },
        { type: 'text', x: 41, y: 132, text: 'ALL', fontSize: 8, fill: P.bg, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'rect', x: 70, y: 118, w: 62, h: 22, r: 11, fill: P.surface2 },
        { type: 'text', x: 101, y: 132, text: 'JAPANESE', fontSize: 8, fill: P.textMuted, letterSpacing: 1, align: 'center' },
        { type: 'rect', x: 140, y: 118, w: 52, h: 22, r: 11, fill: P.surface2 },
        { type: 'text', x: 166, y: 132, text: 'FRENCH', fontSize: 8, fill: P.textMuted, letterSpacing: 1, align: 'center' },
        { type: 'rect', x: 200, y: 118, w: 52, h: 22, r: 11, fill: P.surface2 },
        { type: 'text', x: 226, y: 132, text: 'NORDIC', fontSize: 8, fill: P.textMuted, letterSpacing: 1, align: 'center' },

        { type: 'rect', x: 0, y: 148, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 168, text: 'TOKYO  TONIGHT', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 370, y: 168, text: 'CHANGE', fontSize: 9, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'right' },

        // Restaurant 1 - fully booked
        { type: 'rect', x: 20, y: 180, w: 350, h: 120, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 180, w: 350, h: 68, r: 8, fill: '#1C2022' },
        { type: 'text', x: 36, y: 204, text: 'NIKU KAPPO', fontSize: 10, fill: P.accent, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 36, y: 224, text: 'Wagyu counter  Tokyo  Michelin **', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'rect', x: 282, y: 188, w: 76, h: 20, r: 10, fill: P.dangerSoft },
        { type: 'text', x: 320, y: 201, text: 'FULLY BOOKED', fontSize: 7, fill: P.danger, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 256, text: 'No openings tonight  Waitlist: 3 ahead of you', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 36, y: 268, w: 102, h: 18, r: 9, fill: P.accentSoft },
        { type: 'text', x: 87, y: 280, text: 'JOIN WAITLIST', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'center' },

        // Restaurant 2 - available
        { type: 'rect', x: 20, y: 312, w: 350, h: 120, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 312, w: 350, h: 68, r: 8, fill: '#1A2220' },
        { type: 'text', x: 36, y: 336, text: 'FLORILEGE', fontSize: 10, fill: P.accent2, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 36, y: 356, text: 'New French  Omotesando  Michelin **', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'rect', x: 278, y: 320, w: 80, h: 20, r: 10, fill: P.accent2Soft },
        { type: 'text', x: 318, y: 333, text: '2 SLOTS', fontSize: 8, fill: P.accent2, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 388, text: 'Available: 7:30 pm  9:00 pm', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 36, y: 400, w: 68, h: 20, r: 10, fill: P.accent },
        { type: 'text', x: 70, y: 413, text: '7:30 PM', fontSize: 9, fill: P.bg, letterSpacing: 1, fontWeight: 600, align: 'center' },
        { type: 'rect', x: 112, y: 400, w: 68, h: 20, r: 10, fill: P.surface2 },
        { type: 'text', x: 146, y: 413, text: '9:00 PM', fontSize: 9, fill: P.textMuted, letterSpacing: 1, align: 'center' },

        // Restaurant 3 - member exclusive
        { type: 'rect', x: 20, y: 444, w: 350, h: 110, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 444, w: 350, h: 64, r: 8, fill: '#201F24' },
        { type: 'text', x: 36, y: 468, text: 'SEZANNE', fontSize: 10, fill: P.accent, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 36, y: 488, text: 'French Modern  Marunouchi  Michelin ***', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'rect', x: 228, y: 452, w: 130, h: 20, r: 10, fill: 'rgba(196,154,94,0.15)' },
        { type: 'text', x: 293, y: 465, text: 'MEMBER EXCLUSIVE', fontSize: 7, fill: P.accent, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 516, text: 'Tonight: 1 seat at counter - Volta Obsidian only', fontSize: 10, fill: P.accent, align: 'left' },
        { type: 'text', x: 36, y: 532, text: '10-course omakase  Sake pairing included', fontSize: 10, fill: P.textMuted, align: 'left' },

        // Tab bar
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: P.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: P.border },
        { type: 'rect', x: 106, y: 782, w: 34, h: 2, r: 1, fill: P.accent },
        { type: 'text', x: 45, y: 804, text: 'TODAY', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 123, y: 804, text: 'DINING', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'center' },
        { type: 'text', x: 195, y: 804, text: 'HOTELS', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 268, y: 804, text: 'CONCIERGE', fontSize: 7, fill: P.textMuted, letterSpacing: 1, align: 'center' },
        { type: 'text', x: 345, y: 804, text: 'MEMBER', fontSize: 7, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'rect', x: 0, y: 828, w: 390, h: 16, fill: P.surface },
        { type: 'rect', x: 130, y: 836, w: 130, h: 5, r: 2.5, fill: P.textMuted },
      ],
    },

    {
      id: 'hotels', label: 'Hotels',
      description: 'Curated stays - member rates, tier access, preference-matched properties',
      fill: P.bg, width: 390, height: 844,
      components: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 44, fill: P.bg },
        { type: 'text', x: 20, y: 28, text: '9:41', fontSize: 14, fontWeight: 600, fill: P.text, align: 'left' },

        { type: 'text', x: 20, y: 78, text: 'HOTELS', fontSize: 26, fontWeight: 300, fill: P.text, letterSpacing: 8, align: 'left' },
        { type: 'text', x: 20, y: 96, text: 'Properties reserved for members', fontSize: 11, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 0, y: 108, w: 390, h: 1, fill: P.border },

        // Destination tabs
        { type: 'rect', x: 20, y: 118, w: 60, h: 26, r: 13, fill: P.accent },
        { type: 'text', x: 50, y: 134, text: 'TOKYO', fontSize: 8, fill: P.bg, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'rect', x: 88, y: 118, w: 60, h: 26, r: 13, fill: P.surface2 },
        { type: 'text', x: 118, y: 134, text: 'KYOTO', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'rect', x: 156, y: 118, w: 60, h: 26, r: 13, fill: P.surface2 },
        { type: 'text', x: 186, y: 134, text: 'OSAKA', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'rect', x: 224, y: 118, w: 66, h: 26, r: 13, fill: P.surface2 },
        { type: 'text', x: 257, y: 134, text: 'HAKONE', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },

        { type: 'rect', x: 20, y: 156, w: 350, h: 38, r: 6, fill: P.surface2 },
        { type: 'text', x: 36, y: 179, text: 'Apr 12 to Apr 18  2 guests', fontSize: 12, fill: P.text, align: 'left' },
        { type: 'text', x: 358, y: 179, text: 'EDIT', fontSize: 9, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'right' },

        { type: 'rect', x: 0, y: 204, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 222, text: '6 PROPERTIES AVAILABLE', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },

        // Hotel 1 - featured
        { type: 'rect', x: 20, y: 232, w: 350, h: 164, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 232, w: 350, h: 108, r: 8, fill: '#1A2128' },
        { type: 'rect', x: 32, y: 244, w: 86, h: 20, r: 10, fill: 'rgba(196,154,94,0.18)' },
        { type: 'text', x: 75, y: 257, text: 'STAFF PICK', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 32, y: 284, text: 'PALACE HOTEL TOKYO', fontSize: 14, fontWeight: 500, fill: P.text, letterSpacing: 2, align: 'left' },
        { type: 'text', x: 32, y: 302, text: 'Marunouchi  Imperial Palace view', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 32, y: 348, text: '86,000 yen / night', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'text', x: 32, y: 366, text: 'Member rate: save 18%  Breakfast included', fontSize: 10, fill: P.accent2, align: 'left' },
        { type: 'rect', x: 280, y: 340, w: 78, h: 28, r: 14, fill: P.accent },
        { type: 'text', x: 319, y: 357, text: 'BOOK', fontSize: 9, fill: P.bg, letterSpacing: 2, fontWeight: 700, align: 'center' },

        // Hotel 2
        { type: 'rect', x: 20, y: 406, w: 350, h: 110, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 406, w: 350, h: 62, r: 8, fill: '#1F1E2A' },
        { type: 'text', x: 36, y: 430, text: 'THE PENINSULA TOKYO', fontSize: 13, fontWeight: 500, fill: P.text, letterSpacing: 1, align: 'left' },
        { type: 'text', x: 36, y: 448, text: 'Hibiya  Grand Deluxe Suite', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 472, text: '112,000 yen / night', fontSize: 12, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 488, text: '24,000 pts or member rate', fontSize: 10, fill: P.accent2, align: 'left' },
        { type: 'rect', x: 286, y: 464, w: 72, h: 24, r: 12, fill: P.surface2 },
        { type: 'text', x: 322, y: 479, text: 'VIEW', fontSize: 9, fill: P.textMuted, letterSpacing: 2, fontWeight: 600, align: 'center' },

        // Hotel 3 - Obsidian only
        { type: 'rect', x: 20, y: 526, w: 350, h: 100, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 526, w: 350, h: 56, r: 8, fill: '#1E1B14' },
        { type: 'text', x: 36, y: 550, text: 'AMAN TOKYO', fontSize: 13, fontWeight: 500, fill: P.text, letterSpacing: 1, align: 'left' },
        { type: 'text', x: 36, y: 566, text: 'Otemachi Tower  Deluxe Garden View', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 236, y: 534, w: 122, h: 20, r: 10, fill: 'rgba(196,154,94,0.15)' },
        { type: 'text', x: 297, y: 547, text: 'OBSIDIAN ONLY', fontSize: 7, fill: P.accent, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 590, text: '148,000 yen / night  Comp spa access', fontSize: 12, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 606, text: 'Exclusive rate for Obsidian members only', fontSize: 10, fill: P.accent, align: 'left' },

        // Tab bar
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: P.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: P.border },
        { type: 'rect', x: 178, y: 782, w: 34, h: 2, r: 1, fill: P.accent },
        { type: 'text', x: 45, y: 804, text: 'TODAY', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 123, y: 804, text: 'DINING', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 195, y: 804, text: 'HOTELS', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'center' },
        { type: 'text', x: 268, y: 804, text: 'CONCIERGE', fontSize: 7, fill: P.textMuted, letterSpacing: 1, align: 'center' },
        { type: 'text', x: 345, y: 804, text: 'MEMBER', fontSize: 7, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'rect', x: 0, y: 828, w: 390, h: 16, fill: P.surface },
        { type: 'rect', x: 130, y: 836, w: 130, h: 5, r: 2.5, fill: P.textMuted },
      ],
    },

    {
      id: 'concierge', label: 'Concierge',
      description: 'Active requests + quick compose - inbox-style request threads',
      fill: P.bg, width: 390, height: 844,
      components: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 44, fill: P.bg },
        { type: 'text', x: 20, y: 28, text: '9:41', fontSize: 14, fontWeight: 600, fill: P.text, align: 'left' },

        { type: 'text', x: 20, y: 78, text: 'CONCIERGE', fontSize: 22, fontWeight: 300, fill: P.text, letterSpacing: 5, align: 'left' },
        { type: 'rect', x: 258, y: 60, w: 22, h: 22, r: 11, fill: P.accent },
        { type: 'text', x: 269, y: 75, text: '2', fontSize: 11, fill: P.bg, fontWeight: 700, align: 'center' },
        { type: 'text', x: 20, y: 96, text: 'Your personal Volta concierge team', fontSize: 11, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 0, y: 108, w: 390, h: 1, fill: P.border },

        // Compose
        { type: 'rect', x: 20, y: 118, w: 350, h: 44, r: 8, fill: P.surface2 },
        { type: 'text', x: 44, y: 143, text: 'Message your concierge...', fontSize: 13, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 342, y: 126, w: 16, h: 28, r: 4, fill: P.accent },

        { type: 'rect', x: 0, y: 172, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 192, text: 'ACTIVE REQUESTS', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },

        // Request 1 - confirmed
        { type: 'rect', x: 20, y: 202, w: 350, h: 86, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 202, w: 4, h: 86, r: 2, fill: P.accent2 },
        { type: 'text', x: 36, y: 222, text: 'Dinner  Florilege  Apr 12', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'rect', x: 246, y: 209, w: 112, h: 20, r: 10, fill: P.accent2Soft },
        { type: 'text', x: 302, y: 222, text: 'CONFIRMED', fontSize: 8, fill: P.accent2, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 238, text: '7:30 PM  4 guests  Counter seats', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 256, text: 'Your concierge secured the counter seats you wanted.', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 274, text: 'VIEW DETAILS', fontSize: 9, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'left' },

        // Request 2 - in progress
        { type: 'rect', x: 20, y: 298, w: 350, h: 86, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 298, w: 4, h: 86, r: 2, fill: P.warn },
        { type: 'text', x: 36, y: 318, text: 'Helicopter  Kyoto transfer  Apr 18', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'rect', x: 252, y: 305, w: 106, h: 20, r: 10, fill: P.warnSoft },
        { type: 'text', x: 305, y: 318, text: 'IN PROGRESS', fontSize: 8, fill: P.warn, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 334, text: 'Private transfer  2 passengers', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 350, text: 'Checking availability - response in ~2h', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 370, text: 'REPLY', fontSize: 9, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'left' },

        // Request 3 - awaiting
        { type: 'rect', x: 20, y: 394, w: 350, h: 80, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 394, w: 4, h: 80, r: 2, fill: P.accent },
        { type: 'text', x: 36, y: 414, text: 'Spa booking  Aman Tokyo  Apr 13', fontSize: 13, fontWeight: 500, fill: P.text, align: 'left' },
        { type: 'rect', x: 246, y: 401, w: 112, h: 20, r: 10, fill: P.accentSoft },
        { type: 'text', x: 302, y: 414, text: 'AWAITING YOU', fontSize: 8, fill: P.accent, letterSpacing: 2, fontWeight: 700, align: 'center' },
        { type: 'text', x: 36, y: 430, text: 'Please confirm: Aman Journey or Ryokan Ritual?', fontSize: 10, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 36, y: 446, w: 120, h: 16, r: 8, fill: P.accentSoft },
        { type: 'text', x: 96, y: 457, text: 'AMAN JOURNEY', fontSize: 8, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'center' },
        { type: 'rect', x: 164, y: 446, w: 110, h: 16, r: 8, fill: P.surface2 },
        { type: 'text', x: 219, y: 457, text: 'RYOKAN RITUAL', fontSize: 8, fill: P.textMuted, letterSpacing: 1, align: 'center' },

        { type: 'rect', x: 0, y: 484, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 502, text: 'COMPLETED', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },

        { type: 'rect', x: 20, y: 512, w: 350, h: 44, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 512, w: 4, h: 44, r: 2, fill: P.borderStrong },
        { type: 'text', x: 36, y: 530, text: 'Dinner  Kikunoi  Mar 22', fontSize: 12, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 546, text: 'Completed  Rate this experience?', fontSize: 10, fill: P.accent, align: 'left' },

        { type: 'rect', x: 20, y: 564, w: 350, h: 44, r: 8, fill: P.surface },
        { type: 'rect', x: 20, y: 564, w: 4, h: 44, r: 2, fill: P.borderStrong },
        { type: 'text', x: 36, y: 582, text: 'Car service  Narita to Aman  Mar 19', fontSize: 12, fill: P.textMuted, align: 'left' },
        { type: 'text', x: 36, y: 598, text: 'Completed  Rated 5 stars', fontSize: 10, fill: P.textMuted, align: 'left' },

        // Tab bar
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: P.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: P.border },
        { type: 'rect', x: 251, y: 782, w: 34, h: 2, r: 1, fill: P.accent },
        { type: 'text', x: 45, y: 804, text: 'TODAY', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 123, y: 804, text: 'DINING', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 195, y: 804, text: 'HOTELS', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 268, y: 804, text: 'CONCIERGE', fontSize: 7, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'center' },
        { type: 'text', x: 345, y: 804, text: 'MEMBER', fontSize: 7, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'rect', x: 0, y: 828, w: 390, h: 16, fill: P.surface },
        { type: 'rect', x: 130, y: 836, w: 130, h: 5, r: 2.5, fill: P.textMuted },
      ],
    },

    {
      id: 'member', label: 'Member',
      description: 'Membership tier, points, card, and curated benefits',
      fill: P.bg, width: 390, height: 844,
      components: [
        { type: 'rect', x: 0, y: 0, w: 390, h: 44, fill: P.bg },
        { type: 'text', x: 20, y: 28, text: '9:41', fontSize: 14, fontWeight: 600, fill: P.text, align: 'left' },

        { type: 'text', x: 20, y: 78, text: 'MEMBERSHIP', fontSize: 22, fontWeight: 300, fill: P.text, letterSpacing: 5, align: 'left' },
        { type: 'text', x: 20, y: 96, text: 'James Beaumont  Member since 2022', fontSize: 11, fill: P.textMuted, align: 'left' },
        { type: 'rect', x: 0, y: 108, w: 390, h: 1, fill: P.border },

        // Card
        { type: 'rect', x: 20, y: 122, w: 350, h: 200, r: 12, fill: P.surfaceAlt },
        { type: 'rect', x: 20, y: 220, w: 350, h: 102, r: 12, fill: 'rgba(9,8,7,0.30)' },
        { type: 'text', x: 44, y: 154, text: 'V O L T A', fontSize: 22, fontWeight: 300, fill: P.accent, letterSpacing: 10, align: 'left' },
        { type: 'text', x: 346, y: 154, text: '*', fontSize: 18, fill: P.accent, align: 'right' },
        { type: 'text', x: 44, y: 178, text: 'OBSIDIAN', fontSize: 11, fill: P.accent, letterSpacing: 5, fontWeight: 600, align: 'left' },
        { type: 'text', x: 44, y: 234, text: '....  ....  ....  4921', fontSize: 16, fill: P.text, letterSpacing: 3, align: 'left' },
        { type: 'text', x: 44, y: 258, text: 'JAMES BEAUMONT', fontSize: 11, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 44, y: 278, text: 'EXP  03/29', fontSize: 11, fill: P.textMuted, letterSpacing: 2, align: 'left' },

        // Points
        { type: 'rect', x: 20, y: 334, w: 350, h: 56, r: 8, fill: P.surface },
        { type: 'text', x: 36, y: 356, text: '48,200', fontSize: 22, fontWeight: 400, fill: P.accent, letterSpacing: 1, align: 'left' },
        { type: 'text', x: 36, y: 374, text: 'VOLTA POINTS  Earned this year: 12,400', fontSize: 9, fill: P.textMuted, letterSpacing: 2, fontWeight: 600, align: 'left' },
        { type: 'text', x: 357, y: 362, text: 'REDEEM', fontSize: 9, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'right' },

        // Tier progress
        { type: 'text', x: 20, y: 406, text: 'TIER PROGRESS', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },
        { type: 'text', x: 370, y: 406, text: 'OBSIDIAN to APEX', fontSize: 9, fill: P.accent, letterSpacing: 1, fontWeight: 600, align: 'right' },
        { type: 'rect', x: 20, y: 416, w: 350, h: 6, r: 3, fill: P.surface2 },
        { type: 'rect', x: 20, y: 416, w: 245, h: 6, r: 3, fill: P.accent },
        { type: 'text', x: 20, y: 434, text: '48,200 pts  1,800 more for Apex tier', fontSize: 10, fill: P.textMuted, align: 'left' },

        { type: 'rect', x: 0, y: 448, w: 390, h: 1, fill: P.border },
        { type: 'text', x: 20, y: 464, text: 'OBSIDIAN BENEFITS', fontSize: 9, fill: P.textMuted, letterSpacing: 3, fontWeight: 600, align: 'left' },

        { type: 'rect', x: 20, y: 474, w: 350, h: 44, r: 6, fill: P.surface },
        { type: 'text', x: 36, y: 492, text: 'Dining  Priority access + same-day cancellation', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 508, text: 'Michelin 1-3 stars  3 complimentary reservation holds', fontSize: 9, fill: P.textMuted, align: 'left' },

        { type: 'rect', x: 20, y: 526, w: 350, h: 44, r: 6, fill: P.surface },
        { type: 'text', x: 36, y: 544, text: 'Hotels  Member rate + 4th night free', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 560, text: '420 partner hotels  complimentary spa day-pass', fontSize: 9, fill: P.textMuted, align: 'left' },

        { type: 'rect', x: 20, y: 578, w: 350, h: 44, r: 6, fill: P.surface },
        { type: 'text', x: 36, y: 596, text: 'Experiences  Front-row and backstage access', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 612, text: 'Concerts, fashion weeks, private gallery openings', fontSize: 9, fill: P.textMuted, align: 'left' },

        { type: 'rect', x: 20, y: 630, w: 350, h: 44, r: 6, fill: P.surface },
        { type: 'text', x: 36, y: 648, text: 'Health  Remedy Place and Sollis Health', fontSize: 11, fill: P.text, align: 'left' },
        { type: 'text', x: 36, y: 664, text: 'Medical concierge  wellness credits: $2,400/yr', fontSize: 9, fill: P.textMuted, align: 'left' },

        // Tab bar
        { type: 'rect', x: 0, y: 780, w: 390, h: 64, fill: P.surface },
        { type: 'rect', x: 0, y: 780, w: 390, h: 1, fill: P.border },
        { type: 'rect', x: 328, y: 782, w: 34, h: 2, r: 1, fill: P.accent },
        { type: 'text', x: 45, y: 804, text: 'TODAY', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 123, y: 804, text: 'DINING', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 195, y: 804, text: 'HOTELS', fontSize: 8, fill: P.textMuted, letterSpacing: 2, align: 'center' },
        { type: 'text', x: 268, y: 804, text: 'CONCIERGE', fontSize: 7, fill: P.textMuted, letterSpacing: 1, align: 'center' },
        { type: 'text', x: 345, y: 804, text: 'MEMBER', fontSize: 7, fill: P.accent, letterSpacing: 2, fontWeight: 600, align: 'center' },
        { type: 'rect', x: 0, y: 828, w: 390, h: 16, fill: P.surface },
        { type: 'rect', x: 130, y: 836, w: 130, h: 5, r: 2.5, fill: P.textMuted },
      ],
    },

  ],
};

fs.writeFileSync('volta.pen', JSON.stringify(pen, null, 2));
console.log('VOLTA.PEN written - 5 screens');
console.log('Screens:', pen.screens.map(s => s.label).join(' | '));
console.log('Theme: dark | Palette:', P.bg, '->', P.accent);
