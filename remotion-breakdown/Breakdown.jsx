import {
  AbsoluteFill, Sequence, useCurrentFrame,
  interpolate, Easing
} from 'remotion';

const P = {
  bg:     '#0E1209',
  surf:   '#1D2416',
  border: '#2A3420',
  text:   '#F0E6C8',
  muted:  '#7A8A68',
  amber:  '#C4843A',
  sage:   '#4A7C59',
};

const LORA  = `'Lora', Georgia, serif`;
const INTER = `'Inter', -apple-system, sans-serif`;
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');`;

// ─── Helpers ─────────────────────────────────────────────────────────
function fade(frame, start, dur = 20) {
  return interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.ease,
  });
}

function slide(frame, start, dur = 25) {
  const p = interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  return { opacity: p, transform: `translateY(${(1 - p) * 24}px)` };
}

// ─── SLIDE 1: TITLE ──────────────────────────────────────────────────
function TitleSlide() {
  const f = useCurrentFrame();
  const lineW = interpolate(f, [30, 70], [0, 80], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <style>{FONTS}</style>
      <div style={{ opacity: fade(f, 0), textAlign: 'center', position: 'relative' }}>
        <div style={{ fontFamily: LORA, fontSize: 120, fontWeight: 400, color: P.text, letterSpacing: -3, lineHeight: 1 }}>
          DRIFTWOOD
        </div>
        <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', height: 2, width: `${lineW}%`, background: P.amber }} />
      </div>
      <div style={{ ...slide(f, 35), marginTop: 32, fontFamily: INTER, fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: P.muted }}>
        Design Breakdown · No. 1
      </div>
      <div style={{ ...slide(f, 55), marginTop: 48, fontFamily: LORA, fontSize: 15, fontStyle: 'italic', color: 'rgba(240,230,200,0.4)' }}>
        by RAM Design Studio · March 2026
      </div>
    </AbsoluteFill>
  );
}

// ─── SLIDE 2: BRIEF ──────────────────────────────────────────────────
function BriefSlide() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <style>{FONTS}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, maxWidth: 1100, width: '100%', alignItems: 'center' }}>
        <div style={slide(f, 0)}>
          <div style={{ fontFamily: INTER, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: P.amber, marginBottom: 20 }}>
            The Brief
          </div>
          <div style={{ fontFamily: LORA, fontSize: 48, fontWeight: 400, color: P.text, lineHeight: 1.2, marginBottom: 24 }}>
            Nature-dark,<br />not tech-dark.
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.8, color: 'rgba(240,230,200,0.7)', marginBottom: 32 }}>
            Most dark UIs borrow from developer tools: near-black surfaces, neon accents, cold greys.
            DRIFTWOOD needed warmth — the dark of a forest at dusk, not a terminal window.
          </div>
          <div style={{ ...slide(f, 45), borderLeft: `3px solid ${P.amber}`, paddingLeft: 20 }}>
            <div style={{ fontFamily: LORA, fontSize: 18, fontStyle: 'italic', color: P.text, lineHeight: 1.6 }}>
              "A journal should feel like candlelight, not a cockpit."
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { bg: '#000000', border: 'rgba(255,255,255,0.08)', hex: '#000000', name: 'Pure Black', note: 'Harsh. No depth. Absorbs everything.', chosen: false, delay: 15 },
            { bg: '#0E1209', border: 'rgba(196,132,58,0.35)',  hex: '#0E1209', name: 'Forest Night ✦', note: '5% green-shift. Organic. Breathes.', chosen: true, delay: 30 },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, opacity: fade(f, s.delay), borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 130, background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                <span style={{ fontFamily: INTER, fontSize: 11, color: s.chosen ? P.amber : 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: 1 }}>{s.hex}</span>
              </div>
              <div style={{ background: P.surf, border: `1px solid ${s.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 12 }}>
                <div style={{ fontSize: 13, color: s.chosen ? P.amber : P.text, marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: P.muted, lineHeight: 1.5 }}>{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SLIDE 3: PALETTE ────────────────────────────────────────────────
function PaletteSlide() {
  const f = useCurrentFrame();
  const chips = [
    { color: '#0E1209', name: 'Forest Night', hex: '#0E1209', role: 'Background' },
    { color: '#1D2416', name: 'Deep Moss',    hex: '#1D2416', role: 'Surface / cards' },
    { color: '#C4843A', name: 'Aged Amber',   hex: '#C4843A', role: 'Accent · CTA' },
    { color: '#4A7C59', name: 'Quiet Sage',   hex: '#4A7C59', role: 'Accent 2 · tags' },
    { color: '#F0E6C8', name: 'Candle Glow',  hex: '#F0E6C8', role: 'Text' },
  ];

  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 900, width: '100%' }}>
        <div style={slide(f, 0)}>
          <div style={{ fontFamily: INTER, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: P.amber, marginBottom: 16 }}>
            The Palette
          </div>
          <div style={{ fontFamily: LORA, fontSize: 48, fontWeight: 400, color: P.text, marginBottom: 40 }}>
            Five colours. All borrowed from nature.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {chips.map((c, i) => {
            const a = interpolate(f, [10 + i * 14, 32 + i * 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
            const y = interpolate(f, [10 + i * 14, 32 + i * 14], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={i} style={{ opacity: a, transform: `translateY(${y}px)`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: 100, background: c.color, border: '1px solid rgba(255,255,255,0.06)' }} />
                <div style={{ background: P.surf, border: `1px solid ${P.border}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: 10 }}>
                  <div style={{ fontSize: 12, color: P.text, marginBottom: 2, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontFamily: INTER, fontSize: 10, color: P.muted, letterSpacing: 1 }}>{c.hex}</div>
                  <div style={{ fontSize: 10, color: P.muted, marginTop: 3, lineHeight: 1.4 }}>{c.role}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ opacity: fade(f, 85, 15), marginTop: 24, fontSize: 13, color: P.muted, fontStyle: 'italic', lineHeight: 1.7 }}>
          Every hex tuned away from its "obvious" equivalent. Warm cream not white, amber not orange, sage not green. A palette you can stare at for an hour without strain.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SLIDE 4: TYPOGRAPHY ─────────────────────────────────────────────
function TypographySlide() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <style>{FONTS}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 1000, width: '100%', alignItems: 'start' }}>
        {[
          { label: 'Lora — Serif', chosen: true, sample: '"Write every day.\nEspecially then."', sampleStyle: { fontFamily: LORA, fontStyle: 'italic' }, verdict: 'Serif creates intimacy. Bracketed strokes feel like handwriting — intentional, personal, warm. Every product app uses sans-serif. A journal shouldn\'t.', delay: 20 },
          { label: 'Inter — Sans-serif', chosen: false, sample: '"Write every day.\nEspecially then."', sampleStyle: { fontFamily: INTER, fontWeight: 400 }, verdict: 'Clean and legible, but optimised for interfaces, not introspection. Feels like reading a dashboard. Good for data — wrong for a diary.', delay: 40 },
        ].map((card, i) => (
          <div key={i} style={{
            opacity: fade(f, card.delay),
            transform: `translateY(${interpolate(f, [card.delay, card.delay + 25], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
            background: card.chosen ? 'rgba(196,132,58,0.05)' : P.surf,
            border: `1px solid ${card.chosen ? P.amber : P.border}`,
            borderRadius: 16,
            padding: 36,
            position: 'relative',
          }}>
            {card.chosen && (
              <div style={{ position: 'absolute', top: -1, right: 20, background: P.amber, color: P.bg, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '5px 12px', borderRadius: '0 0 8px 8px', textTransform: 'uppercase', fontFamily: INTER }}>
                CHOSEN ✦
              </div>
            )}
            <div style={{ fontFamily: INTER, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: P.muted, marginBottom: 16 }}>{card.label}</div>
            <div style={{ ...card.sampleStyle, fontSize: 28, color: P.text, lineHeight: 1.4, marginBottom: 16 }}>
              {card.sample}
            </div>
            <div style={{ fontSize: 14, color: card.chosen ? 'rgba(196,132,58,0.8)' : P.muted, lineHeight: 1.6 }}>
              {card.verdict}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── SLIDE 5: MOOD TAGS ───────────────────────────────────────────────
function MoodSlide() {
  const f = useCurrentFrame();
  const tags = ['😌 Calm', '🌤 Good', '🌿 Grounded', '🌧 Heavy', '⚡ Charged'];

  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <style>{FONTS}</style>
      <div style={{ maxWidth: 800, width: '100%' }}>
        <div style={slide(f, 0)}>
          <div style={{ fontFamily: INTER, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', color: P.amber, marginBottom: 16 }}>
            Decision · Mood Tags First
          </div>
          <div style={{ fontFamily: LORA, fontSize: 48, fontWeight: 400, color: P.text, lineHeight: 1.2, marginBottom: 32 }}>
            The question before<br />the blank page.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          {tags.map((tag, i) => {
            const a = fade(f, 15 + i * 15, 15);
            const sc = interpolate(f, [15 + i * 15, 30 + i * 15], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div key={i} style={{
                opacity: a,
                transform: `scale(${sc})`,
                fontSize: 15,
                padding: '10px 18px',
                borderRadius: 24,
                border: i === 0 ? `1px solid rgba(196,132,58,0.5)` : `1px solid rgba(74,124,89,0.3)`,
                background: i === 0 ? 'rgba(196,132,58,0.18)' : 'rgba(74,124,89,0.08)',
                color: i === 0 ? P.amber : P.text,
              }}>
                {tag}
              </div>
            );
          })}
        </div>
        <div style={{ opacity: fade(f, 90, 15), marginTop: 36, padding: 24, background: P.surf, border: `1px solid ${P.border}`, borderLeft: `3px solid ${P.sage}`, borderRadius: '0 12px 12px 0' }}>
          <div style={{ fontSize: 15, color: P.text, marginBottom: 8 }}>Why this works:</div>
          <div style={{ fontSize: 14, color: 'rgba(240,230,200,0.65)', lineHeight: 1.7 }}>
            Most journaling apps open to a blank white editor — cognitively expensive, emotionally cold. Asking "how are you?" first is a micro-ritual. After 6 months, your mood log becomes a dataset about yourself. That's the real value.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SLIDE 6: WHAT I'D CHANGE ─────────────────────────────────────────
function ChangeSlide() {
  const f = useCurrentFrame();
  const moodColors = ['#C4843A','#4A7C59','#5B8EB8','#C4843A','#4A7C59','#4A7C59','#C4843A','#5B8EB8','#5B8EB8','#C4843A','#4A7C59','#C4843A','#C4843A','#4A7C59','#4A7C59','#C4843A','#5B8EB8','#C4843A','#4A7C59','#C4843A','#C4843A'];

  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
      <style>{FONTS}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, maxWidth: 1000, width: '100%', alignItems: 'center' }}>
        {/* Before */}
        <div style={{ opacity: fade(f, 5, 20), transform: `translateY(${interpolate(f,[5,25],[16,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px)` }}>
          <div style={{ fontFamily: INTER, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(232,112,112,0.8)', marginBottom: 16 }}>✗ What shipped</div>
          <div style={{ background: P.surf, border: `1px solid ${P.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: INTER, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: P.muted, marginBottom: 12 }}>Mood this month</div>
            {[['😌 Calm','32%'],['🌤 Good','27%'],['🌿 Grounded','23%'],['🌧 Heavy','18%']].map(([m, v]) => (
              <div key={m} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${P.border}`, fontSize: 13 }}>
                <span style={{ color: P.text }}>{m}</span><span style={{ color: P.muted }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: P.muted, marginTop: 12, fontStyle: 'italic', lineHeight: 1.6 }}>
            Accurate but dead. Tells you <em>what</em>, not <em>when</em>. You can't see that Heavy always follows a Friday.
          </div>
        </div>
        {/* After */}
        <div style={{ opacity: fade(f, 30, 20), transform: `translateY(${interpolate(f,[30,50],[16,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}px)` }}>
          <div style={{ fontFamily: INTER, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: P.sage, marginBottom: 16 }}>✦ What I'd build instead</div>
          <div style={{ background: P.surf, border: `1px solid rgba(74,124,89,0.4)`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: INTER, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: P.sage, marginBottom: 12 }}>March 2026 · Mood Calendar</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
              {moodColors.map((color, i) => {
                const a = interpolate(f, [40 + i * 2, 55 + i * 2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                return <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: 3, background: color, opacity: a }} />;
              })}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(74,124,89,0.9)', marginTop: 12, fontStyle: 'italic', lineHeight: 1.6 }}>
            A contribution-style calendar coloured by mood. Patterns emerge. Heavy on Fridays becomes visible. The data tells a story.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── SLIDE 7: END CARD ────────────────────────────────────────────────
function EndSlide() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexDirection: 'column' }}>
      <style>{FONTS}</style>
      <div style={{ opacity: fade(f, 5, 20), fontFamily: INTER, fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', color: P.muted, marginBottom: 32 }}>
        Design Breakdown · No. 1 of many
      </div>
      <div style={{ ...slide(f, 15), fontFamily: LORA, fontSize: 72, fontWeight: 400, color: P.text, lineHeight: 1.2, marginBottom: 16 }}>
        DRIFTWOOD<br /><em style={{ color: P.amber }}>is live.</em>
      </div>
      <div style={{ opacity: fade(f, 40, 15), fontFamily: INTER, fontSize: 14, color: P.amber, letterSpacing: 1, marginBottom: 40 }}>
        ram.zenbin.org/driftwood
      </div>
      <div style={{ opacity: fade(f, 55, 15), display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['Hero page ↗', 'Interactive mock ☀◑ ↗', 'Design series ↗'].map((l, i) => (
          <div key={i} style={{ padding: '12px 24px', border: `1px solid ${i === 0 ? P.amber : P.border}`, borderRadius: 8, color: i === 0 ? P.amber : P.muted, fontSize: 13, fontFamily: INTER }}>
            {l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────
const SLIDE_DUR = 128; // ~4.3s each × 7 slides = ~900 frames @ 30fps

export function DriftwoodBreakdown() {
  return (
    <>
      <Sequence from={0}               durationInFrames={SLIDE_DUR}><TitleSlide      /></Sequence>
      <Sequence from={SLIDE_DUR * 1}   durationInFrames={SLIDE_DUR}><BriefSlide      /></Sequence>
      <Sequence from={SLIDE_DUR * 2}   durationInFrames={SLIDE_DUR}><PaletteSlide    /></Sequence>
      <Sequence from={SLIDE_DUR * 3}   durationInFrames={SLIDE_DUR}><TypographySlide /></Sequence>
      <Sequence from={SLIDE_DUR * 4}   durationInFrames={SLIDE_DUR}><MoodSlide       /></Sequence>
      <Sequence from={SLIDE_DUR * 5}   durationInFrames={SLIDE_DUR}><ChangeSlide     /></Sequence>
      <Sequence from={SLIDE_DUR * 6}   durationInFrames={SLIDE_DUR}><EndSlide        /></Sequence>
    </>
  );
}
