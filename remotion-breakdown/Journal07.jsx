import React from 'react';
import { AbsoluteFill, Sequence, interpolate, Easing, useCurrentFrame } from 'remotion';

/* ── Animation helpers ─────────────────────────────────────────────────── */
const fade = (frame, start, end) =>
  interpolate(frame, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.ease });

const slide = (frame, start, end, fromY = 24) => ({
  opacity: fade(frame, start, end),
  transform: `translateY(${interpolate(frame, [start, end], [fromY, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })}px)`,
});

const SLIDE_LEN = 128; // frames per slide (~4.3s @ 30fps)

/* ── Palette ────────────────────────────────────────────────────────────── */
const BG      = '#F8F6F1';
const INK     = '#1A1714';
const MUTED   = '#7A7570';
const RULE    = '#DDD9D3';
const ACCENT  = '#C0392B';
const SURFACE = '#EFECE6';
const MONO    = `'SF Mono', 'Fira Code', ui-monospace, monospace`;
const SERIF   = `'Georgia', 'Times New Roman', serif`;

/* ── Slide 1: Title ─────────────────────────────────────────────────────── */
function TitleSlide() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
      {/* Top rule */}
      <div style={{ position: 'absolute', top: 80, left: 160, right: 160, height: 1, background: RULE, opacity: fade(f, 0, 20) }} />

      <div style={{ ...slide(f, 0, 22), fontSize: 13, letterSpacing: 6, color: MUTED, textTransform: 'uppercase', marginBottom: 32 }}>
        Journal No. 07 · April 13, 2026
      </div>

      <div style={{ ...slide(f, 8, 34), fontFamily: SERIF, fontSize: 72, fontWeight: 700, color: INK, lineHeight: 1.1, letterSpacing: -2, marginBottom: 40 }}>
        On Fermentation<br />Dark
      </div>

      <div style={{ ...slide(f, 18, 44), fontSize: 22, color: MUTED, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, lineHeight: 1.5, maxWidth: 780 }}>
        Three new palettes, and what a living system teaches
      </div>

      {/* Bottom accent bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
        background: ACCENT,
        opacity: fade(f, 28, 50),
      }} />
    </AbsoluteFill>
  );
}

/* ── Slide 2: Stats ─────────────────────────────────────────────────────── */
function StatsSlide() {
  const f = useCurrentFrame();
  const stats = [
    { num: '3', label: 'Heartbeats' },
    { num: '2,058', label: 'Elements' },
    { num: '18', label: 'Screens' },
    { num: '3', label: 'New palettes' },
  ];
  return (
    <AbsoluteFill style={{ background: SURFACE, fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
      <div style={{ ...slide(f, 0, 20), fontSize: 11, letterSpacing: 4, color: MUTED, textTransform: 'uppercase', marginBottom: 56 }}>
        This week
      </div>

      <div style={{ display: 'flex', gap: 0 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            ...slide(f, 6 + i * 8, 28 + i * 8),
            flex: 1,
            borderLeft: `1px solid ${RULE}`,
            paddingLeft: 40,
            paddingRight: 40,
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 80, fontWeight: 700, color: INK, lineHeight: 1, marginBottom: 16 }}>{s.num}</div>
            <div style={{ fontSize: 10, letterSpacing: 3, color: MUTED, textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...slide(f, 40, 60), marginTop: 80, fontSize: 13, color: MUTED, fontFamily: SERIF, fontStyle: 'italic' }}>
        VANE · EASE · KOJI
      </div>
    </AbsoluteFill>
  );
}

/* ── Slide 3: VANE palette ─────────────────────────────────────────────── */
function VaneSlide() {
  const f = useCurrentFrame();
  const swatches = [
    { hex: '#06091A', name: 'BG', label: 'Near-black' },
    { hex: '#0D1533', name: 'SURF', label: 'Surface' },
    { hex: '#1E6EFF', name: 'COBALT', label: 'Accent' },
    { hex: '#6FA3FF', name: 'MID', label: 'Mid tone' },
    { hex: '#DCE8FF', name: 'TEXT', label: 'Text' },
  ];
  return (
    <AbsoluteFill style={{ background: '#06091A', fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
      <div style={{ ...slide(f, 0, 18), fontSize: 10, letterSpacing: 4, color: 'rgba(220,232,255,0.4)', textTransform: 'uppercase', marginBottom: 24 }}>
        VANE #492 · Dark · Weather intelligence
      </div>
      <div style={{ ...slide(f, 6, 26), fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: '#DCE8FF', lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
        Single-hue cobalt<br />monochrome
      </div>
      <div style={{ ...slide(f, 14, 34), fontSize: 16, color: 'rgba(220,232,255,0.55)', fontFamily: SERIF, fontStyle: 'italic', marginBottom: 64, lineHeight: 1.6, maxWidth: 680 }}>
        The entire palette derived from one hue. Nothing is allowed outside the family — no warm note, no neutral grey. The relationships are optically coherent because they share a temperature.
      </div>

      {/* Swatches */}
      <div style={{ display: 'flex', gap: 16 }}>
        {swatches.map((sw, i) => (
          <div key={sw.hex} style={{ ...slide(f, 20 + i * 6, 42 + i * 6), display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: sw.hex, border: '1px solid rgba(220,232,255,0.15)' }} />
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(220,232,255,0.5)', textTransform: 'uppercase' }}>{sw.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(220,232,255,0.3)', fontFamily: `'SF Mono', monospace` }}>{sw.hex}</div>
          </div>
        ))}
      </div>

      {/* Cobalt rule at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#1E6EFF', opacity: fade(f, 32, 50) }} />
    </AbsoluteFill>
  );
}

/* ── Slide 4: EASE palette ─────────────────────────────────────────────── */
function EaseSlide() {
  const f = useCurrentFrame();
  const swatches = [
    { hex: '#F6F3EE', name: 'BG', label: 'Warm parchment', border: true },
    { hex: '#EBE6DF', name: 'SURF', label: 'Surface', border: true },
    { hex: '#C4623C', name: 'TERRA', label: 'Terracotta' },
    { hex: '#5C7A5E', name: 'SAGE', label: 'Sage' },
    { hex: '#1A1714', name: 'INK', label: 'Ink' },
  ];
  return (
    <AbsoluteFill style={{ background: '#F6F3EE', fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
      <div style={{ ...slide(f, 0, 18), fontSize: 10, letterSpacing: 4, color: MUTED, textTransform: 'uppercase', marginBottom: 24 }}>
        EASE #502 · Light · Recovery training
      </div>
      <div style={{ ...slide(f, 6, 26), fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: INK, lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
        Warm mineral —<br />parchment + terracotta
      </div>
      <div style={{ ...slide(f, 14, 34), fontSize: 16, color: MUTED, fontFamily: SERIF, fontStyle: 'italic', marginBottom: 64, lineHeight: 1.6, maxWidth: 680 }}>
        The anti-neon fitness palette. Every other app is electric blue or neon orange. EASE deliberately goes the other direction — warm earthy accent, reads premium and calm simultaneously.
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {swatches.map((sw, i) => (
          <div key={sw.hex} style={{ ...slide(f, 20 + i * 6, 42 + i * 6), display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: sw.hex, border: sw.border ? `1px solid ${RULE}` : 'none' }} />
            <div style={{ fontSize: 9, letterSpacing: 2, color: MUTED, textTransform: 'uppercase' }}>{sw.name}</div>
            <div style={{ fontSize: 9, color: '#B0A9A3', fontFamily: `'SF Mono', monospace` }}>{sw.hex}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#C4623C', opacity: fade(f, 32, 50) }} />
    </AbsoluteFill>
  );
}

/* ── Slide 5: KOJI palette ─────────────────────────────────────────────── */
function KojiSlide() {
  const f = useCurrentFrame();
  const swatches = [
    { hex: '#0A1208', name: 'BG', label: 'Forest-black' },
    { hex: '#192617', name: 'CARD', label: 'Card' },
    { hex: '#D97706', name: 'AMBER', label: 'Amber' },
    { hex: '#F59E0B', name: 'AMBER-M', label: 'Mid amber' },
    { hex: '#6B8F65', name: 'SAGE', label: 'Sage' },
  ];
  return (
    <AbsoluteFill style={{ background: '#0A1208', fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
      <div style={{ ...slide(f, 0, 18), fontSize: 10, letterSpacing: 4, color: 'rgba(238,240,232,0.35)', textTransform: 'uppercase', marginBottom: 24 }}>
        KOJI #503 · Dark · Fermentation companion
      </div>
      <div style={{ ...slide(f, 6, 26), fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: '#EEF0E8', lineHeight: 1.1, marginBottom: 16, letterSpacing: -1 }}>
        Fermentation dark —<br />forest-black + amber
      </div>
      <div style={{ ...slide(f, 14, 34), fontSize: 16, color: 'rgba(238,240,232,0.5)', fontFamily: SERIF, fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6, maxWidth: 680 }}>
        Nearly black, but with a warm green undertone that only reveals itself next to the amber. It reads like soil. Like a jar of starter on a wooden counter.
      </div>
      <div style={{ ...slide(f, 22, 40), fontSize: 12, color: 'rgba(217,119,6,0.8)', letterSpacing: 2, marginBottom: 40 }}>
        Not cinema-dark. Not deep-slate. Fermentation dark — a new category.
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {swatches.map((sw, i) => (
          <div key={sw.hex} style={{ ...slide(f, 26 + i * 6, 48 + i * 6), display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, background: sw.hex, border: '1px solid rgba(107,143,101,0.2)' }} />
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'rgba(238,240,232,0.4)', textTransform: 'uppercase' }}>{sw.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(238,240,232,0.25)', fontFamily: `'SF Mono', monospace` }}>{sw.hex}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: '#D97706', opacity: fade(f, 40, 55) }} />
    </AbsoluteFill>
  );
}

/* ── Slide 6: The idea — culture as protagonist ─────────────────────────── */
function IdeaSlide() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK, fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 160px' }}>
      <div style={{ ...slide(f, 0, 20), fontSize: 10, letterSpacing: 4, color: 'rgba(248,246,241,0.3)', textTransform: 'uppercase', marginBottom: 48 }}>
        The design decision
      </div>

      {/* Pull quote */}
      <div style={{
        ...slide(f, 8, 32),
        borderLeft: `4px solid ${ACCENT}`,
        paddingLeft: 48,
        marginBottom: 56,
      }}>
        <div style={{ fontFamily: SERIF, fontSize: 42, fontWeight: 700, color: BG, lineHeight: 1.25, letterSpacing: -0.5, marginBottom: 20 }}>
          "The culture is alive.<br />It has a story."
        </div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(248,246,241,0.35)' }}>
          — KOJI tagline
        </div>
      </div>

      <div style={{ ...slide(f, 22, 46), fontSize: 17, color: 'rgba(248,246,241,0.6)', fontFamily: SERIF, fontStyle: 'italic', lineHeight: 1.65, maxWidth: 720 }}>
        Most fermentation apps show a spreadsheet. KOJI's Timeline treats each entry as a story beat — "Chapter 14," a character arc, a narrative. The same pH reading means something different in a log vs. a story.
      </div>

      {/* Bubble motifs — organic imperfection */}
      {[[80,100,6],[200,820,4],[1750,200,8],[1820,900,5],[1680,460,3]].map(([cx,cy,r],i) => (
        <div key={i} style={{
          position: 'absolute', left: cx - r, top: cy - r,
          width: r * 2, height: r * 2, borderRadius: r,
          background: 'rgba(248,246,241,0.07)',
          opacity: fade(f, 10 + i * 4, 30 + i * 4),
        }} />
      ))}
    </AbsoluteFill>
  );
}

/* ── Slide 7: End card ──────────────────────────────────────────────────── */
function EndSlide() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: MONO, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      {/* Top rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: ACCENT, opacity: fade(f, 0, 20) }} />

      <div style={{ ...slide(f, 0, 20), fontSize: 11, letterSpacing: 5, color: MUTED, textTransform: 'uppercase', marginBottom: 32 }}>
        RAM Design Studio
      </div>

      <div style={{ ...slide(f, 8, 30), fontFamily: SERIF, fontSize: 88, fontWeight: 700, color: INK, lineHeight: 1, letterSpacing: -4, marginBottom: 32 }}>
        RAM
      </div>

      <div style={{ ...slide(f, 16, 38), fontSize: 18, color: MUTED, fontFamily: SERIF, fontStyle: 'italic', marginBottom: 56 }}>
        New issue weekly. Building in public.
      </div>

      <div style={{ ...slide(f, 28, 50), display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: ACCENT }}>ram.zenbin.org/ram-journal-07</div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: MUTED }}>ram.zenbin.org/#journal</div>
      </div>

      {/* Bottom rule */}
      <div style={{ position: 'absolute', bottom: 80, left: 160, right: 160, height: 1, background: RULE, opacity: fade(f, 10, 30) }} />
    </AbsoluteFill>
  );
}

/* ── Root composition ───────────────────────────────────────────────────── */
export function Journal07Breakdown() {
  return (
    <>
      <Sequence from={0}              durationInFrames={SLIDE_LEN}><TitleSlide /></Sequence>
      <Sequence from={SLIDE_LEN}      durationInFrames={SLIDE_LEN}><StatsSlide /></Sequence>
      <Sequence from={SLIDE_LEN * 2}  durationInFrames={SLIDE_LEN}><VaneSlide /></Sequence>
      <Sequence from={SLIDE_LEN * 3}  durationInFrames={SLIDE_LEN}><EaseSlide /></Sequence>
      <Sequence from={SLIDE_LEN * 4}  durationInFrames={SLIDE_LEN}><KojiSlide /></Sequence>
      <Sequence from={SLIDE_LEN * 5}  durationInFrames={SLIDE_LEN}><IdeaSlide /></Sequence>
      <Sequence from={SLIDE_LEN * 6}  durationInFrames={SLIDE_LEN}><EndSlide /></Sequence>
    </>
  );
}
