/**
 * PODIUM — Conference talk discovery & personal agenda builder
 * Inspired by: Stripe Sessions 2026 editorial design (godly.website)
 * + Mixpanel's AI-first cream/teal/indigo aesthetic
 * Theme: LIGHT (warm cream editorial)
 */

const fs = require('fs');

const SLUG = 'podium';

const pen = {
  version: '2.8',
  meta: {
    name: 'Podium',
    description: 'Conference talk discovery & personal agenda builder. The talks worth your time.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
  },
  design: {
    colors: {
      background:   '#F7F4EE',
      surface:      '#FFFFFF',
      surfaceAlt:   '#F0EDE6',
      text:         '#16130E',
      textSecondary:'#7A7268',
      accent:       '#635BFF',
      accentLight:  'rgba(99,91,255,0.10)',
      accent2:      '#E6521A',
      accent2Light: 'rgba(230,82,26,0.10)',
      teal:         '#2EC4B6',
      border:       'rgba(22,19,14,0.10)',
      shadow:       'rgba(22,19,14,0.06)',
    },
    typography: {
      fontFamily:    'Inter, -apple-system, sans-serif',
      displaySize:   '52px',
      displayWeight: '700',
      headingSize:   '28px',
      headingWeight: '700',
      bodySize:      '15px',
      bodyWeight:    '400',
      labelSize:     '12px',
      labelWeight:   '600',
      letterSpacing: '-0.02em',
    },
    spacing: {
      unit: 8,
      pageMargin: 24,
      cardRadius: 16,
      pillRadius: 24,
    },
  },
  screens: [
    // ─── Screen 1: Discover / Home ─────────────────────────────
    {
      id: 'discover',
      label: 'Discover',
      backgroundColor: '#F7F4EE',
      elements: [
        // Status bar area
        {
          type: 'rect', x: 0, y: 0, width: 390, height: 52,
          fill: '#F7F4EE',
        },
        // Header
        {
          type: 'text', x: 24, y: 62,
          text: 'Podium',
          fontSize: 22, fontWeight: '700', fill: '#16130E',
          letterSpacing: '-0.03em',
        },
        {
          type: 'circle', x: 354, y: 73, radius: 18,
          fill: '#FFFFFF',
          stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1,
        },
        {
          type: 'text', x: 354, y: 77,
          text: '⚇',
          fontSize: 16, fill: '#16130E', textAnchor: 'middle',
        },
        // Greeting
        {
          type: 'text', x: 24, y: 118,
          text: 'Good morning, Alex.',
          fontSize: 13, fontWeight: '500', fill: '#7A7268',
        },
        {
          type: 'text', x: 24, y: 150,
          text: 'Your week in',
          fontSize: 42, fontWeight: '700', fill: '#16130E',
          letterSpacing: '-0.03em',
        },
        {
          type: 'text', x: 24, y: 196,
          text: 'conferences.',
          fontSize: 42, fontWeight: '700', fill: '#635BFF',
          letterSpacing: '-0.03em',
        },

        // — Featured Talk Card ——————
        {
          type: 'rect', x: 24, y: 224, width: 342, height: 160,
          fill: '#FFFFFF',
          rx: 20,
          shadow: '0 4px 20px rgba(22,19,14,0.08)',
        },
        // Track chip
        {
          type: 'rect', x: 40, y: 244, width: 90, height: 24,
          fill: 'rgba(99,91,255,0.10)', rx: 12,
        },
        {
          type: 'text', x: 85, y: 261,
          text: '✦ AI / ML',
          fontSize: 11, fontWeight: '700', fill: '#635BFF',
          textAnchor: 'middle', letterSpacing: '0.02em',
        },
        // Featured label
        {
          type: 'text', x: 350, y: 258,
          text: 'FEATURED',
          fontSize: 9, fontWeight: '700', fill: '#E6521A',
          textAnchor: 'end', letterSpacing: '0.08em',
        },
        {
          type: 'text', x: 40, y: 293,
          text: 'Designing for Agentic Systems:',
          fontSize: 15, fontWeight: '700', fill: '#16130E',
          letterSpacing: '-0.02em',
        },
        {
          type: 'text', x: 40, y: 313,
          text: 'Trust, Error & Recovery',
          fontSize: 15, fontWeight: '700', fill: '#16130E',
          letterSpacing: '-0.02em',
        },
        {
          type: 'circle', x: 52, y: 342, radius: 14,
          fill: '#635BFF',
        },
        {
          type: 'text', x: 52, y: 347,
          text: 'M',
          fontSize: 12, fontWeight: '700', fill: '#FFFFFF',
          textAnchor: 'middle',
        },
        {
          type: 'text', x: 74, y: 346,
          text: 'Maria Chen  ·  Config 2026',
          fontSize: 12, fontWeight: '500', fill: '#7A7268',
        },
        // Time
        {
          type: 'text', x: 350, y: 346,
          text: '2:30 PM',
          fontSize: 12, fontWeight: '600', fill: '#16130E',
          textAnchor: 'end',
        },
        // Bookmark button
        {
          type: 'rect', x: 308, y: 360, width: 58, height: 14,
          fill: 'rgba(99,91,255,0.10)', rx: 7,
        },
        {
          type: 'text', x: 337, y: 371,
          text: '+ Save',
          fontSize: 10, fontWeight: '700', fill: '#635BFF',
          textAnchor: 'middle',
        },

        // Section label
        {
          type: 'text', x: 24, y: 414,
          text: 'TRENDING THIS WEEK',
          fontSize: 11, fontWeight: '700', fill: '#7A7268',
          letterSpacing: '0.08em',
        },

        // Talk row 1
        {
          type: 'rect', x: 24, y: 430, width: 342, height: 78,
          fill: '#FFFFFF', rx: 16,
          shadow: '0 2px 12px rgba(22,19,14,0.05)',
        },
        {
          type: 'rect', x: 40, y: 445, width: 46, height: 46,
          fill: 'rgba(46,196,182,0.12)', rx: 12,
        },
        {
          type: 'text', x: 63, y: 474,
          text: '◈',
          fontSize: 22, fill: '#2EC4B6', textAnchor: 'middle',
        },
        {
          type: 'text', x: 100, y: 459,
          text: 'The New Shape of Design Systems',
          fontSize: 14, fontWeight: '700', fill: '#16130E',
          letterSpacing: '-0.01em',
        },
        {
          type: 'text', x: 100, y: 476,
          text: 'Figma Config  ·  Design Systems',
          fontSize: 12, fill: '#7A7268',
        },
        {
          type: 'rect', x: 100, y: 488, width: 52, height: 16,
          fill: 'rgba(46,196,182,0.12)', rx: 8,
        },
        {
          type: 'text', x: 126, y: 499,
          text: 'Tomorrow',
          fontSize: 10, fontWeight: '600', fill: '#2EC4B6',
          textAnchor: 'middle',
        },
        {
          type: 'text', x: 356, y: 471,
          text: '→',
          fontSize: 18, fill: '#C9C4BB', textAnchor: 'middle',
        },

        // Talk row 2
        {
          type: 'rect', x: 24, y: 518, width: 342, height: 78,
          fill: '#FFFFFF', rx: 16,
        },
        {
          type: 'rect', x: 40, y: 533, width: 46, height: 46,
          fill: 'rgba(230,82,26,0.10)', rx: 12,
        },
        {
          type: 'text', x: 63, y: 562,
          text: '◎',
          fontSize: 22, fill: '#E6521A', textAnchor: 'middle',
        },
        {
          type: 'text', x: 100, y: 547,
          text: 'Pricing Psychology in SaaS',
          fontSize: 14, fontWeight: '700', fill: '#16130E',
          letterSpacing: '-0.01em',
        },
        {
          type: 'text', x: 100, y: 564,
          text: 'SaaStr Annual  ·  Growth',
          fontSize: 12, fill: '#7A7268',
        },
        {
          type: 'text', x: 100, y: 582,
          text: 'Apr 5, 2026',
          fontSize: 11, fontWeight: '500', fill: '#B8B3A8',
        },
        {
          type: 'text', x: 356, y: 559,
          text: '→',
          fontSize: 18, fill: '#C9C4BB', textAnchor: 'middle',
        },

        // Bottom nav bar
        {
          type: 'rect', x: 0, y: 700, width: 390, height: 88,
          fill: '#FFFFFF',
          stroke: 'rgba(22,19,14,0.08)', strokeWidth: 1,
        },
        { type: 'text', x: 56,  y: 731, text: '⌂', fontSize: 22, fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 56,  y: 748, text: 'Discover', fontSize: 10, fontWeight: '700', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 140, y: 731, text: '◷', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 140, y: 748, text: 'Agenda', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 224, y: 731, text: '⊕', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 224, y: 748, text: 'Browse', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 308, y: 731, text: '◉', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 308, y: 748, text: 'Profile', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },

        // Home indicator
        {
          type: 'rect', x: 155, y: 778, width: 80, height: 5,
          fill: '#16130E', rx: 2.5,
        },
      ],
    },

    // ─── Screen 2: Talk Detail ──────────────────────────────────
    {
      id: 'talk-detail',
      label: 'Talk Detail',
      backgroundColor: '#F7F4EE',
      elements: [
        // Top band in accent colour
        {
          type: 'rect', x: 0, y: 0, width: 390, height: 280,
          fill: '#635BFF',
        },
        // Back button
        {
          type: 'rect', x: 20, y: 56, width: 38, height: 38,
          fill: 'rgba(255,255,255,0.15)', rx: 12,
        },
        {
          type: 'text', x: 39, y: 80,
          text: '←',
          fontSize: 18, fill: '#FFFFFF', textAnchor: 'middle',
        },
        // Bookmark button
        {
          type: 'rect', x: 332, y: 56, width: 38, height: 38,
          fill: 'rgba(255,255,255,0.15)', rx: 12,
        },
        {
          type: 'text', x: 351, y: 80,
          text: '♡',
          fontSize: 18, fill: '#FFFFFF', textAnchor: 'middle',
        },
        // Track chip
        {
          type: 'rect', x: 24, y: 114, width: 76, height: 24,
          fill: 'rgba(255,255,255,0.20)', rx: 12,
        },
        {
          type: 'text', x: 62, y: 131,
          text: '✦ AI / ML',
          fontSize: 11, fontWeight: '700', fill: '#FFFFFF',
          textAnchor: 'middle',
        },
        // Big title
        {
          type: 'text', x: 24, y: 166,
          text: 'Designing for',
          fontSize: 36, fontWeight: '700', fill: '#FFFFFF',
          letterSpacing: '-0.03em',
        },
        {
          type: 'text', x: 24, y: 206,
          text: 'Agentic Systems',
          fontSize: 36, fontWeight: '700', fill: 'rgba(255,255,255,0.75)',
          letterSpacing: '-0.03em',
        },
        {
          type: 'text', x: 24, y: 250,
          text: 'Trust, Error & Recovery',
          fontSize: 20, fontWeight: '500', fill: 'rgba(255,255,255,0.60)',
          letterSpacing: '-0.02em',
        },

        // White card below
        {
          type: 'rect', x: 0, y: 264, width: 390, height: 524,
          fill: '#F7F4EE',
          rx: 24,
        },

        // Speaker row
        {
          type: 'circle', x: 48, y: 312, radius: 22,
          fill: '#635BFF',
        },
        {
          type: 'text', x: 48, y: 318,
          text: 'MC',
          fontSize: 13, fontWeight: '700', fill: '#FFFFFF',
          textAnchor: 'middle',
        },
        {
          type: 'text', x: 80, y: 307,
          text: 'Maria Chen',
          fontSize: 15, fontWeight: '700', fill: '#16130E',
        },
        {
          type: 'text', x: 80, y: 325,
          text: 'Head of Design, Anthropic',
          fontSize: 12, fill: '#7A7268',
        },
        {
          type: 'rect', x: 296, y: 300, width: 70, height: 26,
          fill: 'rgba(99,91,255,0.10)', rx: 13,
        },
        {
          type: 'text', x: 331, y: 318,
          text: '+ Follow',
          fontSize: 11, fontWeight: '700', fill: '#635BFF',
          textAnchor: 'middle',
        },

        // Divider
        { type: 'rect', x: 24, y: 346, width: 342, height: 1, fill: 'rgba(22,19,14,0.08)' },

        // Meta pills row
        {
          type: 'rect', x: 24, y: 360, width: 100, height: 32,
          fill: '#FFFFFF', rx: 16,
          stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1,
        },
        { type: 'text', x: 74, y: 380, text: '📅 Apr 29', fontSize: 12, fontWeight: '600', fill: '#16130E', textAnchor: 'middle' },

        {
          type: 'rect', x: 132, y: 360, width: 80, height: 32,
          fill: '#FFFFFF', rx: 16,
          stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1,
        },
        { type: 'text', x: 172, y: 380, text: '⏱ 45 min', fontSize: 12, fontWeight: '600', fill: '#16130E', textAnchor: 'middle' },

        {
          type: 'rect', x: 220, y: 360, width: 88, height: 32,
          fill: '#FFFFFF', rx: 16,
          stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1,
        },
        { type: 'text', x: 264, y: 380, text: '🎙 Hall A', fontSize: 12, fontWeight: '600', fill: '#16130E', textAnchor: 'middle' },

        // Abstract
        { type: 'text', x: 24, y: 420, text: 'About this talk', fontSize: 16, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 24, y: 442, text: 'As AI agents take on more complex, multi-step tasks', fontSize: 13, fill: '#7A7268' },
        { type: 'text', x: 24, y: 460, text: 'in real products, the design challenges multiply:', fontSize: 13, fill: '#7A7268' },
        { type: 'text', x: 24, y: 478, text: 'How do we communicate uncertainty? How should', fontSize: 13, fill: '#7A7268' },
        { type: 'text', x: 24, y: 496, text: 'errors surface and recover? This talk explores...', fontSize: 13, fill: '#7A7268' },

        // Related tags
        { type: 'text', x: 24, y: 530, text: 'Topics', fontSize: 14, fontWeight: '700', fill: '#16130E' },
        { type: 'rect', x: 24, y: 542, width: 72, height: 28, fill: 'rgba(99,91,255,0.10)', rx: 14 },
        { type: 'text', x: 60, y: 561, text: 'AI Design', fontSize: 11, fontWeight: '600', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'rect', x: 104, y: 542, width: 64, height: 28, fill: 'rgba(46,196,182,0.10)', rx: 14 },
        { type: 'text', x: 136, y: 561, text: 'UX Patterns', fontSize: 11, fontWeight: '600', fill: '#2EC4B6', textAnchor: 'middle' },
        { type: 'rect', x: 176, y: 542, width: 56, height: 28, fill: 'rgba(22,19,14,0.06)', rx: 14 },
        { type: 'text', x: 204, y: 561, text: 'Product', fontSize: 11, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },

        // Add to Agenda CTA
        {
          type: 'rect', x: 24, y: 630, width: 342, height: 56,
          fill: '#635BFF', rx: 20,
        },
        {
          type: 'text', x: 195, y: 664,
          text: '+ Add to My Agenda',
          fontSize: 16, fontWeight: '700', fill: '#FFFFFF',
          textAnchor: 'middle',
        },

        // Home indicator
        { type: 'rect', x: 155, y: 778, width: 80, height: 5, fill: '#16130E', rx: 2.5 },
      ],
    },

    // ─── Screen 3: My Agenda (Timeline) ───────────────────────
    {
      id: 'agenda',
      label: 'My Agenda',
      backgroundColor: '#F7F4EE',
      elements: [
        { type: 'rect', x: 0, y: 0, width: 390, height: 52, fill: '#F7F4EE' },
        { type: 'text', x: 24, y: 72, text: 'My Agenda', fontSize: 28, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.03em' },
        { type: 'text', x: 24, y: 98, text: '4 talks saved · 2 conferences', fontSize: 14, fill: '#7A7268' },

        // Date pills row
        { type: 'rect', x: 24, y: 114, width: 70, height: 34, fill: '#635BFF', rx: 17 },
        { type: 'text', x: 59, y: 136, text: 'Apr 29', fontSize: 12, fontWeight: '700', fill: '#FFFFFF', textAnchor: 'middle' },
        { type: 'rect', x: 102, y: 114, width: 70, height: 34, fill: '#FFFFFF', rx: 17, stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1 },
        { type: 'text', x: 137, y: 136, text: 'Apr 30', fontSize: 12, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'rect', x: 180, y: 114, width: 70, height: 34, fill: '#FFFFFF', rx: 17, stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1 },
        { type: 'text', x: 215, y: 136, text: 'May 5', fontSize: 12, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },

        // Timeline
        { type: 'rect', x: 72, y: 172, width: 2, height: 480, fill: 'rgba(22,19,14,0.08)' },

        // — Event 1 ——
        { type: 'text', x: 24, y: 186, text: '9:00', fontSize: 12, fontWeight: '700', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'circle', x: 73, y: 182, radius: 7, fill: '#635BFF' },
        { type: 'rect', x: 90, y: 166, width: 276, height: 78, fill: '#FFFFFF', rx: 16 },
        { type: 'rect', x: 90, y: 166, width: 4, height: 78, fill: '#635BFF', rx: 2 },
        { type: 'text', x: 106, y: 191, text: 'Opening Keynote', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 106, y: 209, text: 'Patrick Collison  ·  Stripe Sessions', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 106, y: 220, width: 64, height: 18, fill: 'rgba(99,91,255,0.10)', rx: 9 },
        { type: 'text', x: 138, y: 233, text: 'Main Stage', fontSize: 10, fontWeight: '600', fill: '#635BFF', textAnchor: 'middle' },

        // — Event 2 ——
        { type: 'text', x: 24, y: 280, text: '10:30', fontSize: 12, fontWeight: '700', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'circle', x: 73, y: 276, radius: 7, fill: '#2EC4B6' },
        { type: 'rect', x: 90, y: 260, width: 276, height: 78, fill: '#FFFFFF', rx: 16 },
        { type: 'rect', x: 90, y: 260, width: 4, height: 78, fill: '#2EC4B6', rx: 2 },
        { type: 'text', x: 106, y: 285, text: 'The New Shape of Design Systems', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 106, y: 303, text: 'Juliana Perez  ·  Figma Config', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 106, y: 314, width: 48, height: 18, fill: 'rgba(46,196,182,0.10)', rx: 9 },
        { type: 'text', x: 130, y: 327, text: 'Room 2', fontSize: 10, fontWeight: '600', fill: '#2EC4B6', textAnchor: 'middle' },

        // — Conflict warning ——
        { type: 'rect', x: 90, y: 346, width: 276, height: 28, fill: 'rgba(230,82,26,0.08)', rx: 10 },
        { type: 'text', x: 228, y: 365, text: '⚠ Conflicts with "Pricing Psychology" — resolve?', fontSize: 10, fontWeight: '600', fill: '#E6521A', textAnchor: 'middle' },

        // — Event 3 ——
        { type: 'text', x: 24, y: 416, text: '2:30', fontSize: 12, fontWeight: '700', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'circle', x: 73, y: 412, radius: 7, fill: '#635BFF' },
        { type: 'rect', x: 90, y: 396, width: 276, height: 78, fill: '#FFFFFF', rx: 16 },
        { type: 'rect', x: 90, y: 396, width: 4, height: 78, fill: '#635BFF', rx: 2 },
        { type: 'text', x: 106, y: 421, text: 'Designing for Agentic Systems', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 106, y: 439, text: 'Maria Chen  ·  Stripe Sessions', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 106, y: 450, width: 48, height: 18, fill: 'rgba(99,91,255,0.10)', rx: 9 },
        { type: 'text', x: 130, y: 463, text: 'Hall A', fontSize: 10, fontWeight: '600', fill: '#635BFF', textAnchor: 'middle' },

        // — Event 4 ——
        { type: 'text', x: 24, y: 514, text: '4:15', fontSize: 12, fontWeight: '700', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'circle', x: 73, y: 510, radius: 7, fill: '#E6521A' },
        { type: 'rect', x: 90, y: 494, width: 276, height: 78, fill: '#FFFFFF', rx: 16 },
        { type: 'rect', x: 90, y: 494, width: 4, height: 78, fill: '#E6521A', rx: 2 },
        { type: 'text', x: 106, y: 519, text: 'Revenue Models in the AI Age', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 106, y: 537, text: 'David Sacks  ·  SaaStr Annual', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 106, y: 548, width: 56, height: 18, fill: 'rgba(230,82,26,0.10)', rx: 9 },
        { type: 'text', x: 134, y: 561, text: 'Growth', fontSize: 10, fontWeight: '600', fill: '#E6521A', textAnchor: 'middle' },

        // Bottom nav
        { type: 'rect', x: 0, y: 700, width: 390, height: 88, fill: '#FFFFFF', stroke: 'rgba(22,19,14,0.08)', strokeWidth: 1 },
        { type: 'text', x: 56,  y: 731, text: '⌂', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 56,  y: 748, text: 'Discover', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 140, y: 731, text: '◷', fontSize: 22, fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 140, y: 748, text: 'Agenda', fontSize: 10, fontWeight: '700', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 224, y: 731, text: '⊕', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 224, y: 748, text: 'Browse', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 308, y: 731, text: '◉', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 308, y: 748, text: 'Profile', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'rect', x: 155, y: 778, width: 80, height: 5, fill: '#16130E', rx: 2.5 },
      ],
    },

    // ─── Screen 4: Speaker Profile ─────────────────────────────
    {
      id: 'speaker',
      label: 'Speaker Profile',
      backgroundColor: '#F7F4EE',
      elements: [
        // Header band
        { type: 'rect', x: 0, y: 0, width: 390, height: 240, fill: '#16130E' },
        // Back
        { type: 'rect', x: 20, y: 56, width: 38, height: 38, fill: 'rgba(255,255,255,0.10)', rx: 12 },
        { type: 'text', x: 39, y: 80, text: '←', fontSize: 18, fill: '#FFFFFF', textAnchor: 'middle' },

        // Speaker avatar circle
        { type: 'circle', x: 195, y: 148, radius: 52, fill: '#635BFF' },
        { type: 'text', x: 195, y: 157, text: 'MC', fontSize: 28, fontWeight: '700', fill: '#FFFFFF', textAnchor: 'middle' },

        // White card
        { type: 'rect', x: 0, y: 226, width: 390, height: 562, fill: '#F7F4EE', rx: 28 },

        // Name / title
        { type: 'text', x: 195, y: 270, text: 'Maria Chen', fontSize: 24, fontWeight: '700', fill: '#16130E', textAnchor: 'middle', letterSpacing: '-0.02em' },
        { type: 'text', x: 195, y: 292, text: 'Head of Design · Anthropic', fontSize: 14, fill: '#7A7268', textAnchor: 'middle' },

        // Stats row
        { type: 'rect', x: 24, y: 312, width: 342, height: 70, fill: '#FFFFFF', rx: 18 },
        { type: 'text', x: 88, y: 342, text: '12', fontSize: 22, fontWeight: '700', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 88, y: 360, text: 'Talks', fontSize: 11, fill: '#7A7268', textAnchor: 'middle' },
        { type: 'rect', x: 178, y: 326, width: 1, height: 44, fill: 'rgba(22,19,14,0.08)' },
        { type: 'text', x: 227, y: 342, text: '3.2K', fontSize: 22, fontWeight: '700', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 227, y: 360, text: 'Followers', fontSize: 11, fill: '#7A7268', textAnchor: 'middle' },
        { type: 'rect', x: 301, y: 326, width: 1, height: 44, fill: 'rgba(22,19,14,0.08)' },
        { type: 'text', x: 344, y: 342, text: '98%', fontSize: 22, fontWeight: '700', fill: '#2EC4B6', textAnchor: 'middle' },
        { type: 'text', x: 344, y: 360, text: 'Rating', fontSize: 11, fill: '#7A7268', textAnchor: 'middle' },

        // Bio
        { type: 'text', x: 24, y: 410, text: 'About', fontSize: 16, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 24, y: 432, text: 'Maria leads design at Anthropic, where she focuses', fontSize: 13, fill: '#7A7268' },
        { type: 'text', x: 24, y: 450, text: 'on making AI systems understandable, trustworthy,', fontSize: 13, fill: '#7A7268' },
        { type: 'text', x: 24, y: 468, text: 'and usable by everyone. Former design lead at Figma.', fontSize: 13, fill: '#7A7268' },

        // Upcoming talks
        { type: 'text', x: 24, y: 506, text: 'Upcoming Talks', fontSize: 16, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },

        { type: 'rect', x: 24, y: 520, width: 342, height: 72, fill: '#FFFFFF', rx: 16 },
        { type: 'rect', x: 24, y: 520, width: 4, height: 72, fill: '#635BFF', rx: 2 },
        { type: 'text', x: 44, y: 548, text: 'Designing for Agentic Systems', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 44, y: 566, text: 'Config 2026  ·  Apr 29, 2:30 PM', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 44, y: 578, width: 52, height: 8, fill: '#635BFF', rx: 4 },

        { type: 'rect', x: 24, y: 602, width: 342, height: 60, fill: '#FFFFFF', rx: 16 },
        { type: 'text', x: 44, y: 628, text: 'Trust Layers in Multi-Agent Systems', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 44, y: 646, text: 'NeurIPS 2026  ·  Jun 12', fontSize: 12, fill: '#7A7268' },

        // Follow CTA
        { type: 'rect', x: 24, y: 674, width: 342, height: 52, fill: '#16130E', rx: 18 },
        { type: 'text', x: 195, y: 706, text: '+ Follow Maria', fontSize: 15, fontWeight: '700', fill: '#FFFFFF', textAnchor: 'middle' },

        { type: 'rect', x: 155, y: 778, width: 80, height: 5, fill: '#16130E', rx: 2.5 },
      ],
    },

    // ─── Screen 5: Browse / Search ──────────────────────────────
    {
      id: 'browse',
      label: 'Browse',
      backgroundColor: '#F7F4EE',
      elements: [
        { type: 'rect', x: 0, y: 0, width: 390, height: 52, fill: '#F7F4EE' },
        { type: 'text', x: 24, y: 72, text: 'Browse Talks', fontSize: 28, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.03em' },

        // Search bar
        { type: 'rect', x: 24, y: 90, width: 342, height: 50, fill: '#FFFFFF', rx: 16, stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1 },
        { type: 'text', x: 50, y: 120, text: '🔍', fontSize: 16, fill: '#B8B3A8' },
        { type: 'text', x: 74, y: 121, text: 'Search talks, speakers, conferences...', fontSize: 14, fill: '#B8B3A8' },

        // Active filters
        { type: 'rect', x: 24, y: 152, width: 72, height: 30, fill: '#635BFF', rx: 15 },
        { type: 'text', x: 60, y: 172, text: '✦ AI / ML', fontSize: 11, fontWeight: '700', fill: '#FFFFFF', textAnchor: 'middle' },
        { type: 'rect', x: 104, y: 152, width: 64, height: 30, fill: '#FFFFFF', rx: 15, stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1 },
        { type: 'text', x: 136, y: 172, text: 'Design', fontSize: 11, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'rect', x: 176, y: 152, width: 56, height: 30, fill: '#FFFFFF', rx: 15, stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1 },
        { type: 'text', x: 204, y: 172, text: 'Growth', fontSize: 11, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'rect', x: 240, y: 152, width: 56, height: 30, fill: '#FFFFFF', rx: 15, stroke: 'rgba(22,19,14,0.10)', strokeWidth: 1 },
        { type: 'text', x: 268, y: 172, text: 'DevEx', fontSize: 11, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },

        // Results count
        { type: 'text', x: 24, y: 204, text: '48 talks · filtered by AI/ML', fontSize: 13, fill: '#7A7268' },

        // Conference header strip
        { type: 'rect', x: 24, y: 218, width: 342, height: 36, fill: 'rgba(99,91,255,0.06)', rx: 12 },
        { type: 'text', x: 40, y: 241, text: '✦ Stripe Sessions 2026  ·  Apr 29–30, San Francisco', fontSize: 12, fontWeight: '600', fill: '#635BFF' },

        // Talk card 1
        { type: 'rect', x: 24, y: 264, width: 342, height: 86, fill: '#FFFFFF', rx: 16 },
        { type: 'text', x: 44, y: 290, text: 'Designing for Agentic Systems', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 44, y: 308, text: 'Maria Chen  ·  2:30 PM  ·  Hall A', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 44, y: 320, width: 64, height: 20, fill: 'rgba(99,91,255,0.10)', rx: 10 },
        { type: 'text', x: 76, y: 334, text: '✓ Saved', fontSize: 11, fontWeight: '600', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 356, y: 309, text: '→', fontSize: 18, fill: '#C9C4BB', textAnchor: 'middle' },

        // Talk card 2
        { type: 'rect', x: 24, y: 360, width: 342, height: 86, fill: '#FFFFFF', rx: 16 },
        { type: 'text', x: 44, y: 386, text: 'AI-Powered Payment Optimisation', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 44, y: 404, text: 'Dhruv Malhotra  ·  10:00 AM  ·  Room 3', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 44, y: 416, width: 56, height: 20, fill: 'rgba(22,19,14,0.06)', rx: 10 },
        { type: 'text', x: 72, y: 430, text: '+ Save', fontSize: 11, fontWeight: '600', fill: '#7A7268', textAnchor: 'middle' },
        { type: 'text', x: 356, y: 405, text: '→', fontSize: 18, fill: '#C9C4BB', textAnchor: 'middle' },

        // Conference header strip 2
        { type: 'rect', x: 24, y: 456, width: 342, height: 36, fill: 'rgba(46,196,182,0.08)', rx: 12 },
        { type: 'text', x: 40, y: 479, text: '◈ Figma Config 2026  ·  May 5–6, New York', fontSize: 12, fontWeight: '600', fill: '#2EC4B6' },

        // Talk card 3
        { type: 'rect', x: 24, y: 502, width: 342, height: 86, fill: '#FFFFFF', rx: 16 },
        { type: 'text', x: 44, y: 528, text: 'The New Shape of Design Systems', fontSize: 14, fontWeight: '700', fill: '#16130E', letterSpacing: '-0.01em' },
        { type: 'text', x: 44, y: 546, text: 'Juliana Perez  ·  11:30 AM  ·  Stage 1', fontSize: 12, fill: '#7A7268' },
        { type: 'rect', x: 44, y: 558, width: 64, height: 20, fill: 'rgba(46,196,182,0.10)', rx: 10 },
        { type: 'text', x: 76, y: 572, text: '✓ Saved', fontSize: 11, fontWeight: '600', fill: '#2EC4B6', textAnchor: 'middle' },
        { type: 'text', x: 356, y: 547, text: '→', fontSize: 18, fill: '#C9C4BB', textAnchor: 'middle' },

        // Bottom nav
        { type: 'rect', x: 0, y: 700, width: 390, height: 88, fill: '#FFFFFF', stroke: 'rgba(22,19,14,0.08)', strokeWidth: 1 },
        { type: 'text', x: 56,  y: 731, text: '⌂', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 56,  y: 748, text: 'Discover', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 140, y: 731, text: '◷', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 140, y: 748, text: 'Agenda', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 224, y: 731, text: '⊕', fontSize: 22, fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 224, y: 748, text: 'Browse', fontSize: 10, fontWeight: '700', fill: '#635BFF', textAnchor: 'middle' },
        { type: 'text', x: 308, y: 731, text: '◉', fontSize: 22, fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'text', x: 308, y: 748, text: 'Profile', fontSize: 10, fontWeight: '500', fill: '#C9C4BB', textAnchor: 'middle' },
        { type: 'rect', x: 155, y: 778, width: 80, height: 5, fill: '#16130E', rx: 2.5 },
      ],
    },
  ],
  navigation: {
    items: [
      { id: 'discover',    label: 'Discover',  icon: 'home' },
      { id: 'agenda',      label: 'Agenda',    icon: 'calendar' },
      { id: 'browse',      label: 'Browse',    icon: 'search' },
      { id: 'talk-detail', label: 'Talk',      icon: 'play' },
      { id: 'speaker',     label: 'Speaker',   icon: 'user' },
    ],
  },
};

fs.writeFileSync('podium.pen', JSON.stringify(pen, null, 2));
console.log('✓ podium.pen written —', pen.screens.length, 'screens');
console.log('  Theme: light · Palette: warm cream + indigo + teal');
