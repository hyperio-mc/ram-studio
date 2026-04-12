// SONA — Voice Journal & Emotional Intelligence
// Light theme, inspired by Format AI's "hear the color" concept (darkmodedesign.com)
// RAM Design Heartbeat · 2026-04-01

const fs = require('fs');

const P = {
  bg:           '#F6F3EE',
  surface:      '#FFFFFF',
  surfaceAlt:   '#EDE9E3',
  surfaceHover: '#FAF9F6',
  text:         '#1C1917',
  textMuted:    'rgba(28,25,23,0.44)',
  accent:       '#E8603A',
  accent2:      '#7C5CFC',
  accentSoft:   'rgba(232,96,58,0.10)',
  accent2Soft:  'rgba(124,92,252,0.10)',
  border:       'rgba(28,25,23,0.09)',
  borderStrong: 'rgba(28,25,23,0.18)',
  green:        '#059669',
  greenSoft:    'rgba(5,150,105,0.10)',
  amber:        '#D97706',
  amberSoft:    'rgba(217,119,6,0.10)',
};

const design = {
  version: '2.8',
  meta: {
    name: 'SONA',
    tagline: 'Speak freely, hear clearly',
    archetype: 'ai-voice-wellness-journal',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    inspiration: 'Format AI (useformat.ai/podcasts) — "hear the color" emotional AI synthesis, spotted on darkmodedesign.com',
  },
  palette: {
    bg:           P.bg,
    surface:      P.surface,
    surfaceAlt:   P.surfaceAlt,
    surfaceHover: P.surfaceHover,
    text:         P.text,
    textMuted:    P.textMuted,
    accent:       P.accent,
    accent2:      P.accent2,
    accentSoft:   P.accentSoft,
    accent2Soft:  P.accent2Soft,
    border:       P.border,
    borderStrong: P.borderStrong,
    green:        P.green,
    greenSoft:    P.greenSoft,
    amber:        P.amber,
    amberSoft:    P.amberSoft,
  },
  darkPalette: {
    bg:           '#111009',
    surface:      '#1C1916',
    surfaceAlt:   '#241F1A',
    text:         '#EDE9E3',
    textMuted:    'rgba(237,233,227,0.44)',
    accent:       '#F07550',
    accent2:      '#9D82FF',
    accentSoft:   'rgba(240,117,80,0.12)',
    accent2Soft:  'rgba(157,130,255,0.12)',
    border:       'rgba(237,233,227,0.08)',
    borderStrong: 'rgba(237,233,227,0.16)',
    green:        '#10B981',
    greenSoft:    'rgba(16,185,129,0.12)',
    amber:        '#F59E0B',
    amberSoft:    'rgba(245,158,11,0.12)',
  },
  typography: {
    fontFamily: "'Inter', 'Neue Haas Grotesk', system-ui, -apple-system, sans-serif",
    monoFamily: "'JetBrains Mono', 'Fira Code', monospace",
    scale: { xs: 10, sm: 12, base: 14, md: 16, lg: 20, xl: 28, xxl: 40, hero: 56 },
  },

  screens: [

    // ── SCREEN 1: TODAY ──────────────────────────────────────────────────────
    {
      id: 'today',
      label: 'Today',
      description: 'Morning check-in: mood ring, yesterday\'s AI insight capsule, quick record button, streak counter',
      components: [
        {
          type: 'app-topbar',
          appName: 'SONA',
          subtitle: 'Wednesday, Apr 1',
          rightItems: [
            { icon: 'bell', badge: '2' },
            { type: 'avatar', initials: 'MK', bg: P.accent2Soft, color: P.accent2 },
          ],
        },
        {
          type: 'mood-check-in',
          label: 'How are you right now?',
          labelStyle: { size: 16, weight: 600, color: P.text },
          moods: [
            { emoji: '😌', label: 'Calm',      value: 'calm',      color: '#7C5CFC', selected: false },
            { emoji: '✨', label: 'Energised', value: 'energised', color: '#E8603A', selected: true  },
            { emoji: '😔', label: 'Low',       value: 'low',       color: '#6B7A8D', selected: false },
            { emoji: '😤', label: 'Stressed',  value: 'stressed',  color: '#DC2626', selected: false },
            { emoji: '🤔', label: 'Uncertain', value: 'uncertain', color: '#D97706', selected: false },
          ],
          style: {
            bg: P.surface,
            border: `1px solid ${P.border}`,
            radius: 16,
            padding: '18px 20px',
          },
        },
        {
          type: 'insight-capsule',
          eyebrow: 'YESTERDAY\'S INSIGHT',
          eyebrowColor: P.accent2,
          quote: '"You mentioned feeling overwhelmed three times — all before 11am. Your afternoon entries were notably calmer."',
          quoteStyle: { size: 14, lineHeight: 1.6, color: P.text, style: 'italic' },
          emotion: { label: 'Reflective', color: P.accent2, bg: P.accent2Soft },
          action: { label: 'Listen to digest →', color: P.accent },
          style: {
            bg: P.surface,
            border: `1px solid ${P.border}`,
            borderLeft: `3px solid ${P.accent2}`,
            radius: 16,
            padding: '18px 20px',
          },
        },
        {
          type: 'record-cta',
          label: 'Start a voice entry',
          sub: "What's on your mind?",
          recordButton: {
            icon: 'mic',
            label: 'Hold to speak',
            bg: P.accent,
            color: '#FFFFFF',
            size: 64,
            pulse: true,
          },
          quickPrompts: [
            'How did yesterday feel?',
            'What are you carrying today?',
            'One thing you\'re grateful for?',
          ],
          style: {
            bg: `linear-gradient(135deg, ${P.accentSoft} 0%, ${P.accent2Soft} 100%)`,
            border: `1px solid ${P.border}`,
            radius: 20,
            padding: '24px 20px',
            align: 'center',
          },
        },
        {
          type: 'stat-row',
          items: [
            { label: 'DAY STREAK',  value: '23',    icon: 'zap',      iconColor: P.amber },
            { label: 'THIS WEEK',   value: '7 notes', icon: 'mic',    iconColor: P.accent },
            { label: 'AVG MOOD',    value: 'Calm',  icon: 'heart',    iconColor: P.green },
            { label: 'AI INSIGHTS', value: '12',    icon: 'eye',      iconColor: P.accent2 },
          ],
          style: { bg: P.surface, border: `1px solid ${P.border}`, radius: 14, padding: '16px 18px' },
        },
      ],
    },

    // ── SCREEN 2: JOURNAL ────────────────────────────────────────────────────
    {
      id: 'journal',
      label: 'Journal',
      description: 'Chronological list of voice entries — each shows AI-generated title, emotional tag, duration, waveform thumbnail',
      components: [
        {
          type: 'app-topbar',
          appName: 'SONA',
          center: 'My Journal',
          rightItems: [
            { icon: 'filter' },
            { icon: 'search' },
          ],
        },
        {
          type: 'search-filter-bar',
          placeholder: 'Search entries…',
          filters: [
            { label: 'All',      active: true  },
            { label: 'Calm',     active: false },
            { label: 'Stressed', active: false },
            { label: 'Grateful', active: false },
          ],
        },
        {
          type: 'section-header',
          label: 'Today',
          sub: '2 entries',
        },
        {
          type: 'voice-entry-list',
          entries: [
            {
              id: 've1',
              time: '8:42 AM',
              duration: '1m 47s',
              aiTitle: 'Morning clarity despite the early chaos',
              aiSummary: 'Felt rushed but grounded. Referenced the project deadline twice and a conversation with Priya.',
              emotion: { label: 'Energised', color: P.accent, bg: P.accentSoft },
              waveform: [0.2,0.4,0.7,0.9,0.6,0.8,1.0,0.7,0.5,0.8,0.9,0.6,0.4,0.7,0.5,0.3,0.6,0.8,0.7,0.4],
              waveformColor: P.accent,
              hasInsight: true,
            },
            {
              id: 've2',
              time: '12:15 PM',
              duration: '3m 12s',
              aiTitle: 'Lunch walk: processing the morning meeting',
              aiSummary: 'Unpacked frustration with unclear expectations. Notable shift to optimism in final 40 seconds.',
              emotion: { label: 'Reflective', color: P.accent2, bg: P.accent2Soft },
              waveform: [0.3,0.5,0.4,0.6,0.8,0.9,0.7,0.5,0.6,0.7,0.8,0.9,1.0,0.8,0.6,0.7,0.8,0.5,0.4,0.3],
              waveformColor: P.accent2,
              hasInsight: false,
            },
          ],
          style: { gap: 12 },
        },
        {
          type: 'section-header',
          label: 'Yesterday',
          sub: '3 entries',
        },
        {
          type: 'voice-entry-list',
          entries: [
            {
              id: 've3',
              time: '7:50 AM',
              duration: '2m 05s',
              aiTitle: 'Anticipating the week ahead',
              emotion: { label: 'Anxious', color: P.amber, bg: P.amberSoft },
              waveform: [0.5,0.6,0.7,0.5,0.6,0.8,0.7,0.6,0.5,0.7,0.8,0.6,0.5,0.4,0.5,0.6,0.7,0.6,0.5,0.4],
              waveformColor: P.amber,
              hasInsight: true,
            },
            {
              id: 've4',
              time: '1:30 PM',
              duration: '4m 38s',
              aiTitle: 'Breakthrough in the design review',
              emotion: { label: 'Excited', color: P.green, bg: P.greenSoft },
              waveform: [0.4,0.5,0.8,1.0,0.9,0.8,0.9,1.0,0.8,0.7,0.9,1.0,0.8,0.7,0.6,0.8,0.9,0.7,0.5,0.4],
              waveformColor: P.green,
              hasInsight: true,
            },
          ],
          style: { gap: 12 },
        },
      ],
    },

    // ── SCREEN 3: INSIGHTS ───────────────────────────────────────────────────
    {
      id: 'insights',
      label: 'Insights',
      description: 'Weekly emotional pattern analysis — mood chart, dominant themes, emotional vocabulary heatmap',
      components: [
        {
          type: 'app-topbar',
          appName: 'SONA',
          center: 'Weekly Insights',
          rightItems: [
            { label: 'Apr 1–7', icon: 'calendar', variant: 'ghost' },
          ],
        },
        {
          type: 'hero-metric-banner',
          style: 'editorial-warm',
          eyebrow: 'YOUR WEEK IN FEELING',
          value: 'Increasingly Calm',
          sub: '↑ Stress patterns fading Thu–Sat',
          subColor: 'green',
          supportingMetrics: [
            { label: 'ENTRIES',    value: '12',    delta: '+3 vs last wk' },
            { label: 'PEAK MOOD',  value: 'Joyful', delta: 'Fri 3:20pm' },
            { label: 'AVG LENGTH', value: '2m 41s', delta: '↑ 18s deeper' },
            { label: 'THEMES',     value: '8',     delta: 'work, family, body' },
          ],
        },
        {
          type: 'section-header',
          label: 'Emotional Arc — This Week',
        },
        {
          type: 'area-chart',
          series: [
            {
              label: 'Calm',
              color: P.accent2,
              fillOpacity: 0.15,
              data: [
                { x: 'Mon', y: 42 }, { x: 'Tue', y: 38 }, { x: 'Wed', y: 55 },
                { x: 'Thu', y: 61 }, { x: 'Fri', y: 74 }, { x: 'Sat', y: 80 }, { x: 'Sun', y: 77 },
              ],
            },
            {
              label: 'Stress',
              color: P.accent,
              fillOpacity: 0.10,
              data: [
                { x: 'Mon', y: 58 }, { x: 'Tue', y: 62 }, { x: 'Wed', y: 44 },
                { x: 'Thu', y: 39 }, { x: 'Fri', y: 25 }, { x: 'Sat', y: 20 }, { x: 'Sun', y: 23 },
              ],
            },
          ],
          height: 160,
          gridLines: true,
          style: { bg: P.surface, border: `1px solid ${P.border}`, radius: 16, padding: '16px' },
        },
        {
          type: 'section-header',
          label: 'Most Spoken Themes',
        },
        {
          type: 'progress-list',
          items: [
            { label: 'Work / focus',    value: 34, color: P.accent,  sub: '8 entries mentioned' },
            { label: 'Relationships',   value: 22, color: P.accent2, sub: '5 entries mentioned' },
            { label: 'Body & sleep',    value: 18, color: P.green,   sub: '4 entries mentioned' },
            { label: 'Creative output', value: 14, color: P.amber,   sub: '3 entries mentioned' },
            { label: 'Uncertainty',     value: 12, color: P.textMuted, sub: '3 entries mentioned' },
          ],
          style: { bg: P.surface, border: `1px solid ${P.border}`, radius: 16, padding: '16px 18px' },
        },
        {
          type: 'tip-list',
          eyebrow: 'AI OBSERVATION',
          items: [
            'Your calmest entries happen after physical activity (3 correlations found).',
            'You use the word "overwhelmed" most on Tuesdays and before 10am.',
            'Gratitude moments spiked 40% this week — a personal best.',
          ],
          icon: 'eye',
          iconColor: P.accent2,
          style: { bg: P.accent2Soft, border: `1px solid ${P.accent2}22`, radius: 14, padding: '16px 18px' },
        },
      ],
    },

    // ── SCREEN 4: LISTEN (DIGEST PLAYER) ─────────────────────────────────────
    {
      id: 'listen',
      label: 'Listen',
      description: 'AI-generated weekly audio digest — podcast-style player with chapter markers, transcript, and emotional highlights',
      components: [
        {
          type: 'app-topbar',
          appName: 'SONA',
          center: 'Audio Digest',
          rightItems: [
            { icon: 'share' },
          ],
        },
        {
          type: 'audio-player-card',
          episode: {
            title: 'Your Week, Synthesised',
            subtitle: 'Sona Weekly Digest · Apr 1–7, 2026',
            duration: '8m 24s',
            cover: {
              type: 'generative-waveform',
              palette: [P.accent, P.accent2, P.amber],
              label: 'WEEK 14',
            },
          },
          progress: {
            current: 212,
            total: 504,
            buffered: 300,
            barColor: P.accent,
            trackColor: P.surfaceAlt,
          },
          controls: {
            skipBack: true,
            skipForward: true,
            playPause: true,
            playing: true,
            speed: '1.2×',
          },
          style: {
            bg: P.surface,
            border: `1px solid ${P.border}`,
            radius: 20,
            padding: '24px',
          },
        },
        {
          type: 'section-header',
          label: 'Chapters',
          sub: '5 sections',
        },
        {
          type: 'chapter-list',
          chapters: [
            { id: 'c1', time: '0:00',  title: 'Opening — your emotional snapshot',       active: false, done: true,  color: P.textMuted },
            { id: 'c2', time: '1:42',  title: 'The tension of Monday & Tuesday',         active: true,  done: false, color: P.accent },
            { id: 'c3', time: '3:10',  title: 'Turning point — Wednesday afternoon',     active: false, done: false, color: P.textMuted },
            { id: 'c4', time: '5:28',  title: 'What your body was telling you',          active: false, done: false, color: P.textMuted },
            { id: 'c5', time: '7:01',  title: 'Closing — patterns to carry forward',     active: false, done: false, color: P.textMuted },
          ],
          style: { bg: P.surface, border: `1px solid ${P.border}`, radius: 16 },
        },
        {
          type: 'section-header',
          label: 'Live Transcript',
          action: { label: 'Full transcript', icon: 'eye' },
        },
        {
          type: 'transcript-panel',
          lines: [
            { speaker: 'SONA AI', text: 'On Tuesday you said — ', color: P.accent2, size: 11 },
            { speaker: 'YOU',     text: '"I keep feeling like I\'m running behind before the day even starts."', highlight: true, highlightColor: P.accentSoft, size: 13, weight: 500 },
            { speaker: 'SONA AI', text: 'This appeared in 4 of your 12 entries. It peaked before 9:30am on workdays.', color: P.textMuted, size: 12 },
          ],
          style: { bg: P.surfaceAlt, border: `1px solid ${P.border}`, radius: 14, padding: '16px 18px' },
        },
      ],
    },

    // ── SCREEN 5: GROW ───────────────────────────────────────────────────────
    {
      id: 'grow',
      label: 'Grow',
      description: 'Coaching nudges, reflection prompts from AI, progress toward personal intentions, weekly letter',
      components: [
        {
          type: 'app-topbar',
          appName: 'SONA',
          center: 'Your Growth',
          rightItems: [
            { label: 'Settings', icon: 'settings', variant: 'ghost' },
          ],
        },
        {
          type: 'insight-capsule',
          eyebrow: 'THIS WEEK\'S LETTER',
          eyebrowColor: P.accent,
          quote: '"Dear Mira — this was a week of quiet transformation. You began it braced for collision and ended it standing straighter. Your words say more than you realise."',
          quoteStyle: { size: 14, lineHeight: 1.7, color: P.text, style: 'italic' },
          emotion: { label: 'Composed by Sona AI', color: P.textMuted, bg: 'transparent' },
          action: { label: 'Read full letter →', color: P.accent },
          style: {
            bg: `linear-gradient(140deg, #FFF7F4 0%, #F0EEFE 100%)`,
            border: `1px solid ${P.border}`,
            borderLeft: `3px solid ${P.accent}`,
            radius: 16,
            padding: '20px',
          },
        },
        {
          type: 'section-header',
          label: 'Your Intentions',
          action: { label: 'Edit', icon: 'settings' },
        },
        {
          type: 'progress-list',
          items: [
            { label: 'Speak for 2+ min / day',       value: 71, color: P.green,   sub: '5 of 7 days this week', badge: '✓' },
            { label: 'Name one feeling each morning', value: 85, color: P.accent2, sub: '6 of 7 mornings', badge: '✓' },
            { label: 'End-of-day reflection',         value: 42, color: P.amber,   sub: '3 of 7 days — keep going' },
            { label: 'Gratitude entry weekly',        value: 100, color: P.green,  sub: 'Complete!', badge: '✓' },
          ],
          style: { bg: P.surface, border: `1px solid ${P.border}`, radius: 16, padding: '16px 18px' },
        },
        {
          type: 'section-header',
          label: 'Today\'s Prompts',
          sub: 'Curated by Sona',
        },
        {
          type: 'prompt-card-list',
          prompts: [
            {
              icon: 'zap',
              iconBg: P.accentSoft,
              iconColor: P.accent,
              title: 'The Overwhelm Pattern',
              body: 'You\'ve mentioned feeling overwhelmed 8 times this week, always before noon. What do you think is driving that?',
              action: 'Record reply',
            },
            {
              icon: 'heart',
              iconBg: P.greenSoft,
              iconColor: P.green,
              title: 'Your Best Moment',
              body: 'Friday\'s 3:20pm entry had your highest joy marker all week. What made that moment stand out?',
              action: 'Record reply',
            },
            {
              icon: 'star',
              iconBg: P.accent2Soft,
              iconColor: P.accent2,
              title: 'Forward Motion',
              body: 'If you could change one thing about how you start your mornings this coming week, what would it be?',
              action: 'Record reply',
            },
          ],
          style: { gap: 12 },
        },
      ],
    },

  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'journal',  label: 'Journal',  icon: 'list'     },
    { id: 'insights', label: 'Insights', icon: 'activity' },
    { id: 'listen',   label: 'Listen',   icon: 'play'     },
    { id: 'grow',     label: 'Grow',     icon: 'zap'      },
  ],

  globalStyle: {
    fontFamily: { ui: 'Inter', accent: 'Neue Haas Grotesk' },
    borderRadius: 14,
    navBar: {
      bg: P.surface,
      border: `1px solid ${P.border}`,
      activeColor: P.accent,
      inactiveColor: P.textMuted,
      style: 'rounded-pill',
    },
    motionPrinciple: 'spring-ease — entries slide up; audio waveforms breathe; mood selections pop with scale(1.1)',
    designNotes: [
      'Warm linen bg (#F6F3EE) echoes physical journal / notebook feel',
      'Terracotta accent (#E8603A) carries emotional warmth — bodily, not digital',
      'Violet accent2 (#7C5CFC) marks AI-generated content — distinguishes voice from machine',
      'Waveform thumbnails serve double duty: visual ID + emotional texture at a glance',
    ],
  },
};

const out = JSON.stringify(design, null, 2);
fs.writeFileSync('sona.pen', out);
console.log(`✓ sona.pen written (${(out.length / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${design.screens.length}`);
console.log(`  Theme: ${design.meta.theme}`);
console.log(`  Inspiration: ${design.meta.inspiration}`);
