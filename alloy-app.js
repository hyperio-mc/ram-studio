/**
 * ALLOY — Wealth Composition Platform
 * RAM Design Heartbeat — Mar 26 2026
 *
 * Inspired by: godly.website avant-garde grid layouts with asymmetric card
 * sizing, and darkmodedesign.com's "void + single chromatic accent" aesthetic.
 * The metallurgy metaphor maps financial assets to elemental compounds.
 *
 * Theme: DARK (previous TENDRIL was light)
 * Palette: Near-void bg · deep indigo surface · electric violet accent
 */

const fs = require('fs');
const path = require('path');

// ─── Pencil.dev v2.8 structure ─────────────────────────────────────────────

const SCREENS = [
  // ── 1. Portfolio Command ─────────────────────────────────────────────────
  {
    id: 's1', name: 'Portfolio',
    bg: '#0B0C10',
    elements: [
      // Status bar
      { id: 'e1', type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: '#0B0C10' },
      { id: 'e2', type: 'text', x: 20, y: 16, text: '9:41', fontSize: 15, fontWeight: '600', fill: '#E8E9F0' },
      { id: 'e3', type: 'text', x: 340, y: 16, text: '●●● ▲', fontSize: 12, fill: '#E8E9F0' },

      // Header
      { id: 'e4', type: 'rect', x: 0, y: 50, w: 390, h: 64, fill: '#0B0C10' },
      { id: 'e5', type: 'text', x: 20, y: 68, text: 'ALLOY', fontSize: 22, fontWeight: '800', fill: '#7C5CFC', letterSpacing: 4 },
      { id: 'e6', type: 'text', x: 20, y: 92, text: 'Wealth Composition', fontSize: 12, fill: 'rgba(232,233,240,0.45)', letterSpacing: 1 },
      { id: 'e7', type: 'rect', x: 340, y: 63, w: 36, h: 36, rx: 18, fill: '#14162A', stroke: '#7C5CFC', strokeWidth: 1.5 },
      { id: 'e8', type: 'text', x: 352, y: 86, text: 'RK', fontSize: 11, fontWeight: '700', fill: '#7C5CFC' },

      // Hero metric — total net worth
      { id: 'e9', type: 'rect', x: 16, y: 128, w: 358, h: 148, rx: 20, fill: '#14162A', stroke: '#7C5CFC', strokeWidth: 1 },
      // Purple glow accent
      { id: 'e10', type: 'rect', x: 16, y: 128, w: 358, h: 4, rx: 2, fill: '#7C5CFC' },
      { id: 'e11', type: 'text', x: 32, y: 158, text: 'NET WORTH', fontSize: 10, fontWeight: '700', fill: 'rgba(232,233,240,0.45)', letterSpacing: 2 },
      { id: 'e12', type: 'text', x: 32, y: 200, text: '$284,917', fontSize: 42, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'e13', type: 'rect', x: 32, y: 218, w: 86, h: 22, rx: 11, fill: 'rgba(72,199,120,0.15)' },
      { id: 'e14', type: 'text', x: 45, y: 233, text: '▲ 8.4%  YTD', fontSize: 11, fontWeight: '600', fill: '#48C778' },
      { id: 'e15', type: 'text', x: 270, y: 160, text: 'ALLOY', fontSize: 56, fontWeight: '900', fill: 'rgba(124,92,252,0.07)', letterSpacing: 2 },

      // Quick stats row
      { id: 'e16', type: 'rect', x: 16, y: 292, w: 112, h: 72, rx: 14, fill: '#14162A' },
      { id: 'e17', type: 'text', x: 28, y: 314, text: 'LIQUID', fontSize: 9, fill: 'rgba(232,233,240,0.4)', letterSpacing: 1.5 },
      { id: 'e18', type: 'text', x: 28, y: 342, text: '$42.1K', fontSize: 20, fontWeight: '700', fill: '#E8E9F0', fontFamily: 'monospace' },

      { id: 'e19', type: 'rect', x: 140, y: 292, w: 112, h: 72, rx: 14, fill: '#14162A' },
      { id: 'e20', type: 'text', x: 152, y: 314, text: 'INVESTED', fontSize: 9, fill: 'rgba(232,233,240,0.4)', letterSpacing: 1.5 },
      { id: 'e21', type: 'text', x: 152, y: 342, text: '$218K', fontSize: 20, fontWeight: '700', fill: '#E8E9F0', fontFamily: 'monospace' },

      { id: 'e22', type: 'rect', x: 264, y: 292, w: 110, h: 72, rx: 14, fill: '#14162A' },
      { id: 'e23', type: 'text', x: 276, y: 314, text: 'DEBT', fontSize: 9, fill: 'rgba(232,233,240,0.4)', letterSpacing: 1.5 },
      { id: 'e24', type: 'text', x: 276, y: 342, text: '−$24.8K', fontSize: 18, fontWeight: '700', fill: '#FF6B6B', fontFamily: 'monospace' },

      // Alloy composition preview
      { id: 'e25', type: 'rect', x: 16, y: 380, w: 358, h: 20, rx: 10, fill: '#14162A' },
      { id: 'e26', type: 'rect', x: 16, y: 380, w: 179, h: 20, rx: 10, fill: '#7C5CFC' },    // equities 50%
      { id: 'e27', type: 'rect', x: 195, y: 380, w: 72, h: 20, rx: 0, fill: '#48C778' },      // bonds 20%
      { id: 'e28', type: 'rect', x: 267, y: 380, w: 57, h: 20, rx: 0, fill: '#FFB340' },      // real estate 16%
      { id: 'e29', type: 'rect', x: 324, y: 380, w: 50, h: 20, rx: 10, fill: '#FF6B6B', borderRadiusRight: 10 },  // other 14%
      { id: 'e30', type: 'text', x: 16, y: 414, text: 'Equities 50%', fontSize: 10, fill: '#7C5CFC' },
      { id: 'e31', type: 'text', x: 105, y: 414, text: 'Bonds 20%', fontSize: 10, fill: '#48C778' },
      { id: 'e32', type: 'text', x: 196, y: 414, text: 'RE 16%', fontSize: 10, fill: '#FFB340' },
      { id: 'e33', type: 'text', x: 272, y: 414, text: 'Alt 14%', fontSize: 10, fill: '#FF6B6B' },

      // Recent activity
      { id: 'e34', type: 'text', x: 20, y: 444, text: 'RECENT MOVES', fontSize: 10, fontWeight: '700', fill: 'rgba(232,233,240,0.45)', letterSpacing: 2 },

      { id: 'e35', type: 'rect', x: 16, y: 460, w: 358, h: 56, rx: 14, fill: '#14162A' },
      { id: 'e36', type: 'rect', x: 32, y: 476, w: 24, h: 24, rx: 12, fill: 'rgba(124,92,252,0.2)' },
      { id: 'e37', type: 'text', x: 39, y: 493, text: '↑', fontSize: 14, fill: '#7C5CFC' },
      { id: 'e38', type: 'text', x: 68, y: 476, text: 'VTI — Vanguard Total Market', fontSize: 13, fontWeight: '600', fill: '#E8E9F0' },
      { id: 'e39', type: 'text', x: 68, y: 494, text: 'Bought · 2 shares · Today', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'e40', type: 'text', x: 310, y: 485, text: '+$430', fontSize: 13, fontWeight: '700', fill: '#48C778', fontFamily: 'monospace' },

      { id: 'e41', type: 'rect', x: 16, y: 524, w: 358, h: 56, rx: 14, fill: '#14162A' },
      { id: 'e42', type: 'rect', x: 32, y: 540, w: 24, h: 24, rx: 12, fill: 'rgba(255,107,107,0.15)' },
      { id: 'e43', type: 'text', x: 38, y: 557, text: '→', fontSize: 14, fill: '#FF6B6B' },
      { id: 'e44', type: 'text', x: 68, y: 540, text: 'HYSA Transfer', fontSize: 13, fontWeight: '600', fill: '#E8E9F0' },
      { id: 'e45', type: 'text', x: 68, y: 558, text: 'Savings → Brokerage · Mar 24', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'e46', type: 'text', x: 296, y: 549, text: '$2,000', fontSize: 13, fontWeight: '700', fill: 'rgba(232,233,240,0.7)', fontFamily: 'monospace' },

      // Bottom nav
      { id: 'e47', type: 'rect', x: 0, y: 720, w: 390, h: 80, fill: '#0E0F14', stroke: '#1F2235', strokeWidth: 1 },
      { id: 'e48', type: 'text', x: 30, y: 748, text: '⬡', fontSize: 22, fill: '#7C5CFC' },
      { id: 'e49', type: 'text', x: 24, y: 766, text: 'Portfolio', fontSize: 10, fill: '#7C5CFC' },
      { id: 'e50', type: 'text', x: 114, y: 748, text: '◈', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e51', type: 'text', x: 108, y: 766, text: 'Elements', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e52', type: 'text', x: 194, y: 748, text: '≋', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e53', type: 'text', x: 190, y: 766, text: 'Cashflow', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e54', type: 'text', x: 278, y: 748, text: '⚡', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e55', type: 'text', x: 272, y: 766, text: 'Signals', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e56', type: 'text', x: 353, y: 748, text: '⚗', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'e57', type: 'text', x: 352, y: 766, text: 'Forge', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
    ]
  },

  // ── 2. Elements (Asset Composition) ──────────────────────────────────────
  {
    id: 's2', name: 'Elements',
    bg: '#0B0C10',
    elements: [
      { id: 'f1', type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: '#0B0C10' },
      { id: 'f2', type: 'text', x: 20, y: 16, text: '9:41', fontSize: 15, fontWeight: '600', fill: '#E8E9F0' },

      { id: 'f3', type: 'rect', x: 0, y: 50, w: 390, h: 64, fill: '#0B0C10' },
      { id: 'f4', type: 'text', x: 20, y: 72, text: 'Elements', fontSize: 26, fontWeight: '800', fill: '#E8E9F0' },
      { id: 'f5', type: 'text', x: 20, y: 96, text: 'Your alloy composition', fontSize: 12, fill: 'rgba(232,233,240,0.45)' },

      // Equities element card
      { id: 'f6', type: 'rect', x: 16, y: 126, w: 358, h: 100, rx: 18, fill: '#14162A', stroke: '#7C5CFC', strokeWidth: 1 },
      { id: 'f7', type: 'rect', x: 16, y: 126, w: 6, h: 100, rx: 3, fill: '#7C5CFC' },
      { id: 'f8', type: 'text', x: 36, y: 150, text: 'EQUITIES', fontSize: 10, fontWeight: '700', fill: '#7C5CFC', letterSpacing: 2 },
      { id: 'f9', type: 'text', x: 36, y: 178, text: '$142,400', fontSize: 28, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'f10', type: 'text', x: 36, y: 202, text: '14 positions · VTI, QQQ, AAPL +11', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'f11', type: 'rect', x: 280, y: 138, w: 72, h: 28, rx: 14, fill: 'rgba(72,199,120,0.12)' },
      { id: 'f12', type: 'text', x: 293, y: 157, text: '▲ 12.3%', fontSize: 12, fontWeight: '700', fill: '#48C778' },
      // Progress bar
      { id: 'f13', type: 'rect', x: 36, y: 212, w: 320, h: 6, rx: 3, fill: 'rgba(124,92,252,0.15)' },
      { id: 'f14', type: 'rect', x: 36, y: 212, w: 160, h: 6, rx: 3, fill: '#7C5CFC' },  // 50%

      // Bonds element card
      { id: 'f15', type: 'rect', x: 16, y: 240, w: 358, h: 100, rx: 18, fill: '#14162A' },
      { id: 'f16', type: 'rect', x: 16, y: 240, w: 6, h: 100, rx: 3, fill: '#48C778' },
      { id: 'f17', type: 'text', x: 36, y: 264, text: 'BONDS & FIXED', fontSize: 10, fontWeight: '700', fill: '#48C778', letterSpacing: 2 },
      { id: 'f18', type: 'text', x: 36, y: 292, text: '$57,800', fontSize: 28, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'f19', type: 'text', x: 36, y: 316, text: '3 positions · BND, TLT, I-Bonds', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'f20', type: 'rect', x: 280, y: 252, w: 72, h: 28, rx: 14, fill: 'rgba(72,199,120,0.12)' },
      { id: 'f21', type: 'text', x: 295, y: 271, text: '▲ 3.1%', fontSize: 12, fontWeight: '700', fill: '#48C778' },
      { id: 'f22', type: 'rect', x: 36, y: 326, w: 320, h: 6, rx: 3, fill: 'rgba(72,199,120,0.15)' },
      { id: 'f23', type: 'rect', x: 36, y: 326, w: 64, h: 6, rx: 3, fill: '#48C778' },  // 20%

      // Real Estate card
      { id: 'f24', type: 'rect', x: 16, y: 354, w: 358, h: 100, rx: 18, fill: '#14162A' },
      { id: 'f25', type: 'rect', x: 16, y: 354, w: 6, h: 100, rx: 3, fill: '#FFB340' },
      { id: 'f26', type: 'text', x: 36, y: 378, text: 'REAL ESTATE', fontSize: 10, fontWeight: '700', fill: '#FFB340', letterSpacing: 2 },
      { id: 'f27', type: 'text', x: 36, y: 406, text: '$45,500', fontSize: 28, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'f28', type: 'text', x: 36, y: 430, text: 'VNQ, Fundrise · 16% alloy', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'f29', type: 'rect', x: 280, y: 366, w: 72, h: 28, rx: 14, fill: 'rgba(255,179,64,0.12)' },
      { id: 'f30', type: 'text', x: 295, y: 385, text: '▲ 6.7%', fontSize: 12, fontWeight: '700', fill: '#FFB340' },
      { id: 'f31', type: 'rect', x: 36, y: 440, w: 320, h: 6, rx: 3, fill: 'rgba(255,179,64,0.15)' },
      { id: 'f32', type: 'rect', x: 36, y: 440, w: 51, h: 6, rx: 3, fill: '#FFB340' },  // 16%

      // Alternatives card
      { id: 'f33', type: 'rect', x: 16, y: 468, w: 358, h: 100, rx: 18, fill: '#14162A' },
      { id: 'f34', type: 'rect', x: 16, y: 468, w: 6, h: 100, rx: 3, fill: '#FF6B6B' },
      { id: 'f35', type: 'text', x: 36, y: 492, text: 'ALTERNATIVES', fontSize: 10, fontWeight: '700', fill: '#FF6B6B', letterSpacing: 2 },
      { id: 'f36', type: 'text', x: 36, y: 520, text: '$39,200', fontSize: 28, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'f37', type: 'text', x: 36, y: 544, text: 'BTC, Gold, Commodities · 14%', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'f38', type: 'rect', x: 280, y: 480, w: 72, h: 28, rx: 14, fill: 'rgba(255,107,107,0.12)' },
      { id: 'f39', type: 'text', x: 295, y: 499, text: '▼ 2.4%', fontSize: 12, fontWeight: '700', fill: '#FF6B6B' },
      { id: 'f40', type: 'rect', x: 36, y: 554, w: 320, h: 6, rx: 3, fill: 'rgba(255,107,107,0.15)' },
      { id: 'f41', type: 'rect', x: 36, y: 554, w: 45, h: 6, rx: 3, fill: '#FF6B6B' },  // 14%

      // Rebalance CTA
      { id: 'f42', type: 'rect', x: 16, y: 582, w: 358, h: 52, rx: 16, fill: '#7C5CFC' },
      { id: 'f43', type: 'text', x: 143, y: 613, text: '⚗  Run Forge Analysis', fontSize: 14, fontWeight: '700', fill: '#FFFFFF' },

      // Bottom nav
      { id: 'f44', type: 'rect', x: 0, y: 720, w: 390, h: 80, fill: '#0E0F14', stroke: '#1F2235', strokeWidth: 1 },
      { id: 'f45', type: 'text', x: 30, y: 748, text: '⬡', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f46', type: 'text', x: 24, y: 766, text: 'Portfolio', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f47', type: 'text', x: 114, y: 748, text: '◈', fontSize: 20, fill: '#7C5CFC' },
      { id: 'f48', type: 'text', x: 108, y: 766, text: 'Elements', fontSize: 10, fill: '#7C5CFC' },
      { id: 'f49', type: 'text', x: 194, y: 748, text: '≋', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f50', type: 'text', x: 190, y: 766, text: 'Cashflow', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f51', type: 'text', x: 278, y: 748, text: '⚡', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f52', type: 'text', x: 272, y: 766, text: 'Signals', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f53', type: 'text', x: 353, y: 748, text: '⚗', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'f54', type: 'text', x: 352, y: 766, text: 'Forge', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
    ]
  },

  // ── 3. Cash Flow ──────────────────────────────────────────────────────────
  {
    id: 's3', name: 'Cashflow',
    bg: '#0B0C10',
    elements: [
      { id: 'g1', type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: '#0B0C10' },
      { id: 'g2', type: 'text', x: 20, y: 16, text: '9:41', fontSize: 15, fontWeight: '600', fill: '#E8E9F0' },

      { id: 'g3', type: 'text', x: 20, y: 72, text: 'Cash Flow', fontSize: 26, fontWeight: '800', fill: '#E8E9F0' },
      { id: 'g4', type: 'text', x: 20, y: 96, text: 'March 2026 · 26 days', fontSize: 12, fill: 'rgba(232,233,240,0.45)' },

      // Monthly summary cards
      { id: 'g5', type: 'rect', x: 16, y: 114, w: 172, h: 88, rx: 16, fill: '#14162A' },
      { id: 'g6', type: 'text', x: 28, y: 136, text: 'INCOME', fontSize: 9, fontWeight: '700', fill: '#48C778', letterSpacing: 2 },
      { id: 'g7', type: 'text', x: 28, y: 168, text: '$8,420', fontSize: 26, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'g8', type: 'text', x: 28, y: 192, text: 'Salary + freelance', fontSize: 10, fill: 'rgba(232,233,240,0.4)' },

      { id: 'g9', type: 'rect', x: 202, y: 114, w: 172, h: 88, rx: 16, fill: '#14162A' },
      { id: 'g10', type: 'text', x: 214, y: 136, text: 'SPENT', fontSize: 9, fontWeight: '700', fill: '#FF6B6B', letterSpacing: 2 },
      { id: 'g11', type: 'text', x: 214, y: 168, text: '$4,187', fontSize: 26, fontWeight: '800', fill: '#E8E9F0', fontFamily: 'monospace' },
      { id: 'g12', type: 'text', x: 214, y: 192, text: '49.7% of income', fontSize: 10, fill: 'rgba(232,233,240,0.4)' },

      // Net saved banner
      { id: 'g13', type: 'rect', x: 16, y: 216, w: 358, h: 48, rx: 14, fill: 'rgba(124,92,252,0.12)', stroke: '#7C5CFC', strokeWidth: 1 },
      { id: 'g14', type: 'text', x: 32, y: 247, text: 'NET SAVED THIS MONTH', fontSize: 10, fontWeight: '700', fill: 'rgba(232,233,240,0.5)', letterSpacing: 1.5 },
      { id: 'g15', type: 'text', x: 240, y: 247, text: '$4,233', fontSize: 20, fontWeight: '800', fill: '#7C5CFC', fontFamily: 'monospace' },

      // Bar chart - 6 weeks cashflow
      { id: 'g16', type: 'rect', x: 16, y: 278, w: 358, h: 180, rx: 18, fill: '#14162A' },
      { id: 'g17', type: 'text', x: 32, y: 300, text: 'FLOW HISTORY', fontSize: 10, fontWeight: '700', fill: 'rgba(232,233,240,0.45)', letterSpacing: 2 },
      // Bar chart bars (income = purple, expense = coral)
      // Oct
      { id: 'g18', type: 'rect', x: 44, y: 380, w: 18, h: -100, rx: 4, fill: '#7C5CFC' },
      { id: 'g19', type: 'rect', x: 64, y: 380, w: 18, h: -52, rx: 4, fill: '#FF6B6B' },
      // Nov
      { id: 'g20', type: 'rect', x: 104, y: 380, w: 18, h: -88, rx: 4, fill: '#7C5CFC' },
      { id: 'g21', type: 'rect', x: 124, y: 380, w: 18, h: -60, rx: 4, fill: '#FF6B6B' },
      // Dec
      { id: 'g22', type: 'rect', x: 164, y: 380, w: 18, h: -95, rx: 4, fill: '#7C5CFC' },
      { id: 'g23', type: 'rect', x: 184, y: 380, w: 18, h: -72, rx: 4, fill: '#FF6B6B' },
      // Jan
      { id: 'g24', type: 'rect', x: 224, y: 380, w: 18, h: -90, rx: 4, fill: '#7C5CFC' },
      { id: 'g25', type: 'rect', x: 244, y: 380, w: 18, h: -45, rx: 4, fill: '#FF6B6B' },
      // Feb
      { id: 'g26', type: 'rect', x: 284, y: 380, w: 18, h: -102, rx: 4, fill: '#7C5CFC' },
      { id: 'g27', type: 'rect', x: 304, y: 380, w: 18, h: -50, rx: 4, fill: '#FF6B6B' },
      // Mar (current — highlighted)
      { id: 'g28', type: 'rect', x: 344, y: 380, w: 18, h: -100, rx: 4, fill: '#7C5CFC', opacity: 1 },
      { id: 'g29', type: 'rect', x: 346, y: 380, w: 14, h: -50, rx: 4, fill: '#FF6B6B', opacity: 0.9 },
      { id: 'g30', type: 'text', x: 44, y: 400, text: 'OCT', fontSize: 8, fill: 'rgba(232,233,240,0.3)' },
      { id: 'g31', type: 'text', x: 104, y: 400, text: 'NOV', fontSize: 8, fill: 'rgba(232,233,240,0.3)' },
      { id: 'g32', type: 'text', x: 164, y: 400, text: 'DEC', fontSize: 8, fill: 'rgba(232,233,240,0.3)' },
      { id: 'g33', type: 'text', x: 224, y: 400, text: 'JAN', fontSize: 8, fill: 'rgba(232,233,240,0.3)' },
      { id: 'g34', type: 'text', x: 284, y: 400, text: 'FEB', fontSize: 8, fill: 'rgba(232,233,240,0.3)' },
      { id: 'g35', type: 'text', x: 344, y: 400, text: 'MAR', fontSize: 8, fill: '#7C5CFC' },

      // Spending breakdown
      { id: 'g36', type: 'text', x: 20, y: 478, text: 'WHERE IT WENT', fontSize: 10, fontWeight: '700', fill: 'rgba(232,233,240,0.45)', letterSpacing: 2 },
      // Categories
      ...['Housing · $1,450', 'Food & Dining · $680', 'Transport · $310', 'Subscriptions · $240', 'Health · $190', 'Shopping · $880', 'Other · $437'].map((cat, i) => {
        const [label, amt] = cat.split(' · ');
        const pcts = [0.34, 0.16, 0.07, 0.06, 0.04, 0.21, 0.10];
        return [
          { id: `gc${i}a`, type: 'rect', x: 16, y: 494 + i * 34, w: 358, h: 28, rx: 8, fill: '#14162A' },
          { id: `gc${i}b`, type: 'text', x: 28, y: 513 + i * 34, text: label, fontSize: 12, fill: '#E8E9F0' },
          { id: `gc${i}c`, type: 'text', x: 316, y: 513 + i * 34, text: amt, fontSize: 12, fontFamily: 'monospace', fill: 'rgba(232,233,240,0.6)' },
          { id: `gc${i}d`, type: 'rect', x: 16, y: 519 + i * 34, w: 358, h: 3, rx: 0, fill: 'rgba(124,92,252,0.08)' },
          { id: `gc${i}e`, type: 'rect', x: 16, y: 519 + i * 34, w: Math.round(358 * pcts[i]), h: 3, rx: 0, fill: '#7C5CFC', opacity: 0.5 },
        ];
      }).flat(),

      // Bottom nav
      { id: 'g50', type: 'rect', x: 0, y: 720, w: 390, h: 80, fill: '#0E0F14', stroke: '#1F2235', strokeWidth: 1 },
      { id: 'g51', type: 'text', x: 30, y: 748, text: '⬡', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g52', type: 'text', x: 24, y: 766, text: 'Portfolio', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g53', type: 'text', x: 114, y: 748, text: '◈', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g54', type: 'text', x: 108, y: 766, text: 'Elements', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g55', type: 'text', x: 194, y: 748, text: '≋', fontSize: 22, fill: '#7C5CFC' },
      { id: 'g56', type: 'text', x: 190, y: 766, text: 'Cashflow', fontSize: 10, fill: '#7C5CFC' },
      { id: 'g57', type: 'text', x: 278, y: 748, text: '⚡', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g58', type: 'text', x: 272, y: 766, text: 'Signals', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g59', type: 'text', x: 353, y: 748, text: '⚗', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'g60', type: 'text', x: 352, y: 766, text: 'Forge', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
    ]
  },

  // ── 4. Signals ────────────────────────────────────────────────────────────
  {
    id: 's4', name: 'Signals',
    bg: '#0B0C10',
    elements: [
      { id: 'h1', type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: '#0B0C10' },
      { id: 'h2', type: 'text', x: 20, y: 16, text: '9:41', fontSize: 15, fontWeight: '600', fill: '#E8E9F0' },

      { id: 'h3', type: 'text', x: 20, y: 72, text: 'Signals', fontSize: 26, fontWeight: '800', fill: '#E8E9F0' },
      { id: 'h4', type: 'text', x: 20, y: 96, text: '4 new · Updated 3m ago', fontSize: 12, fill: 'rgba(232,233,240,0.45)' },

      // Alert pill filters
      { id: 'h5', type: 'rect', x: 16, y: 112, w: 70, h: 28, rx: 14, fill: '#7C5CFC' },
      { id: 'h6', type: 'text', x: 28, y: 131, text: 'All · 12', fontSize: 12, fontWeight: '600', fill: '#fff' },
      { id: 'h7', type: 'rect', x: 96, y: 112, w: 80, h: 28, rx: 14, fill: '#14162A' },
      { id: 'h8', type: 'text', x: 108, y: 131, text: 'Rebalance', fontSize: 12, fill: 'rgba(232,233,240,0.5)' },
      { id: 'h9', type: 'rect', x: 186, y: 112, w: 60, h: 28, rx: 14, fill: '#14162A' },
      { id: 'h10', type: 'text', x: 200, y: 131, text: 'Alerts', fontSize: 12, fill: 'rgba(232,233,240,0.5)' },
      { id: 'h11', type: 'rect', x: 256, y: 112, w: 70, h: 28, rx: 14, fill: '#14162A' },
      { id: 'h12', type: 'text', x: 265, y: 131, text: 'Market', fontSize: 12, fill: 'rgba(232,233,240,0.5)' },

      // HIGH PRIORITY signal
      { id: 'h13', type: 'rect', x: 16, y: 156, w: 358, h: 90, rx: 18, fill: '#14162A', stroke: '#FF6B6B', strokeWidth: 1 },
      { id: 'h14', type: 'rect', x: 16, y: 156, w: 358, h: 4, rx: 2, fill: '#FF6B6B' },
      { id: 'h15', type: 'rect', x: 28, y: 170, w: 52, h: 18, rx: 9, fill: 'rgba(255,107,107,0.2)' },
      { id: 'h16', type: 'text', x: 35, y: 183, text: '● HIGH', fontSize: 9, fontWeight: '700', fill: '#FF6B6B', letterSpacing: 1 },
      { id: 'h17', type: 'text', x: 28, y: 208, text: 'Alts overweight by 4%', fontSize: 15, fontWeight: '700', fill: '#E8E9F0' },
      { id: 'h18', type: 'text', x: 28, y: 228, text: 'Target 10% — currently 14%. Trim BTC or Gold to rebalance.', fontSize: 11, fill: 'rgba(232,233,240,0.5)' },
      { id: 'h19', type: 'rect', x: 280, y: 200, w: 80, h: 30, rx: 15, fill: '#FF6B6B' },
      { id: 'h20', type: 'text', x: 296, y: 220, text: 'Act →', fontSize: 12, fontWeight: '700', fill: '#fff' },

      // MEDIUM signal
      { id: 'h21', type: 'rect', x: 16, y: 260, w: 358, h: 90, rx: 18, fill: '#14162A' },
      { id: 'h22', type: 'rect', x: 28, y: 274, w: 62, h: 18, rx: 9, fill: 'rgba(255,179,64,0.2)' },
      { id: 'h23', type: 'text', x: 34, y: 287, text: '● MEDIUM', fontSize: 9, fontWeight: '700', fill: '#FFB340', letterSpacing: 1 },
      { id: 'h24', type: 'text', x: 28, y: 312, text: 'Emergency fund dip', fontSize: 15, fontWeight: '700', fill: '#E8E9F0' },
      { id: 'h25', type: 'text', x: 28, y: 332, text: 'HYSA dropped below 3-month threshold ($10K)', fontSize: 11, fill: 'rgba(232,233,240,0.5)' },
      { id: 'h26', type: 'text', x: 290, y: 318, text: 'Review →', fontSize: 11, fill: '#FFB340' },

      // INFO signals
      { id: 'h27', type: 'rect', x: 16, y: 364, w: 358, h: 78, rx: 18, fill: '#14162A' },
      { id: 'h28', type: 'text', x: 28, y: 390, text: 'QQQ up 3.2% · Tech rally continues', fontSize: 13, fontWeight: '600', fill: '#E8E9F0' },
      { id: 'h29', type: 'text', x: 28, y: 410, text: 'Your QQQ position gained +$1,240 this week', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'h30', type: 'rect', x: 28, y: 428, w: 52, h: 4, rx: 2, fill: '#48C778', opacity: 0.6 },

      { id: 'h31', type: 'rect', x: 16, y: 456, w: 358, h: 78, rx: 18, fill: '#14162A' },
      { id: 'h32', type: 'text', x: 28, y: 482, text: 'Tax-loss opportunity · INTC −18%', fontSize: 13, fontWeight: '600', fill: '#E8E9F0' },
      { id: 'h33', type: 'text', x: 28, y: 502, text: 'Harvest up to $3.8K in losses before year-end', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'h34', type: 'rect', x: 28, y: 520, w: 52, h: 4, rx: 2, fill: '#7C5CFC', opacity: 0.6 },

      { id: 'h35', type: 'rect', x: 16, y: 548, w: 358, h: 78, rx: 18, fill: '#14162A' },
      { id: 'h36', type: 'text', x: 28, y: 574, text: 'I Bond rate reset · 4.28% → 3.97%', fontSize: 13, fontWeight: '600', fill: '#E8E9F0' },
      { id: 'h37', type: 'text', x: 28, y: 594, text: 'Consider shifting new bond purchases to TIPS', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'h38', type: 'rect', x: 28, y: 612, w: 52, h: 4, rx: 2, fill: '#48C778', opacity: 0.4 },

      // Bottom nav
      { id: 'h39', type: 'rect', x: 0, y: 720, w: 390, h: 80, fill: '#0E0F14', stroke: '#1F2235', strokeWidth: 1 },
      { id: 'h40', type: 'text', x: 30, y: 748, text: '⬡', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h41', type: 'text', x: 24, y: 766, text: 'Portfolio', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h42', type: 'text', x: 114, y: 748, text: '◈', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h43', type: 'text', x: 108, y: 766, text: 'Elements', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h44', type: 'text', x: 194, y: 748, text: '≋', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h45', type: 'text', x: 190, y: 766, text: 'Cashflow', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h46', type: 'text', x: 278, y: 748, text: '⚡', fontSize: 20, fill: '#7C5CFC' },
      { id: 'h47', type: 'text', x: 272, y: 766, text: 'Signals', fontSize: 10, fill: '#7C5CFC' },
      { id: 'h48', type: 'text', x: 353, y: 748, text: '⚗', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'h49', type: 'text', x: 352, y: 766, text: 'Forge', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
    ]
  },

  // ── 5. Forge (Scenario Lab) ───────────────────────────────────────────────
  {
    id: 's5', name: 'Forge',
    bg: '#0B0C10',
    elements: [
      { id: 'i1', type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: '#0B0C10' },
      { id: 'i2', type: 'text', x: 20, y: 16, text: '9:41', fontSize: 15, fontWeight: '600', fill: '#E8E9F0' },

      { id: 'i3', type: 'text', x: 20, y: 72, text: 'Forge', fontSize: 26, fontWeight: '800', fill: '#E8E9F0' },
      { id: 'i4', type: 'text', x: 20, y: 96, text: 'Rebalance & scenario lab', fontSize: 12, fill: 'rgba(232,233,240,0.45)' },

      // Current vs Target header
      { id: 'i5', type: 'rect', x: 16, y: 112, w: 358, h: 48, rx: 14, fill: '#14162A' },
      { id: 'i6', type: 'text', x: 32, y: 141, text: 'CURRENT ALLOY', fontSize: 10, fontWeight: '700', fill: 'rgba(232,233,240,0.4)', letterSpacing: 1.5 },
      { id: 'i7', type: 'text', x: 220, y: 141, text: 'TARGET ALLOY', fontSize: 10, fontWeight: '700', fill: '#7C5CFC', letterSpacing: 1.5 },

      // Slider-style rebalancer cards
      ...[
        { label: 'Equities', cur: 50, target: 55, color: '#7C5CFC', y: 174 },
        { label: 'Bonds', cur: 20, target: 15, color: '#48C778', y: 246 },
        { label: 'Real Estate', cur: 16, target: 20, color: '#FFB340', y: 318 },
        { label: 'Alternatives', cur: 14, target: 10, color: '#FF6B6B', y: 390 },
      ].map((row, i) => [
        { id: `ia${i}`, type: 'rect', x: 16, y: row.y, w: 358, h: 64, rx: 16, fill: '#14162A' },
        { id: `ib${i}`, type: 'rect', x: 16, y: row.y, w: 4, h: 64, rx: 2, fill: row.color },
        { id: `ic${i}`, type: 'text', x: 32, y: row.y + 22, text: row.label, fontSize: 13, fontWeight: '600', fill: '#E8E9F0' },
        { id: `id${i}`, type: 'text', x: 32, y: row.y + 44, text: `${row.cur}% → ${row.target}%`, fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
        { id: `ie${i}`, type: 'rect', x: 160, y: row.y + 26, w: 160, h: 12, rx: 6, fill: 'rgba(255,255,255,0.07)' },
        { id: `if${i}`, type: 'rect', x: 160, y: row.y + 26, w: Math.round(160 * row.target / 100), h: 12, rx: 6, fill: row.color },
        { id: `ig${i}`, type: 'text', x: 336, y: row.y + 38, text: `${row.target}%`, fontSize: 14, fontWeight: '700', fill: row.color, fontFamily: 'monospace' },
      ]).flat(),

      // Trade summary
      { id: 'i20', type: 'rect', x: 16, y: 468, w: 358, h: 100, rx: 18, fill: 'rgba(124,92,252,0.08)', stroke: '#7C5CFC', strokeWidth: 1 },
      { id: 'i21', type: 'text', x: 32, y: 492, text: 'FORGE PLAN', fontSize: 10, fontWeight: '700', fill: '#7C5CFC', letterSpacing: 2 },
      { id: 'i22', type: 'text', x: 32, y: 516, text: 'Buy $13,700 VTI · Sell $13,700 BTC', fontSize: 13, fill: '#E8E9F0' },
      { id: 'i23', type: 'text', x: 32, y: 534, text: 'Est. tax impact: −$420 · Rebalance fee: $0', fontSize: 11, fill: 'rgba(232,233,240,0.45)' },
      { id: 'i24', type: 'text', x: 32, y: 554, text: 'Net outcome: +0.18% expected annual return', fontSize: 11, fill: '#48C778' },

      // Execute CTA
      { id: 'i25', type: 'rect', x: 16, y: 582, w: 172, h: 52, rx: 16, fill: '#7C5CFC' },
      { id: 'i26', type: 'text', x: 40, y: 613, text: '⚗ Execute Forge', fontSize: 14, fontWeight: '700', fill: '#fff' },
      { id: 'i27', type: 'rect', x: 202, y: 582, w: 172, h: 52, rx: 16, fill: '#14162A', stroke: '#7C5CFC', strokeWidth: 1 },
      { id: 'i28', type: 'text', x: 226, y: 613, text: '↗ Save Scenario', fontSize: 14, fontWeight: '600', fill: '#7C5CFC' },

      // Disclaimer
      { id: 'i29', type: 'text', x: 40, y: 648, text: 'Not financial advice · For educational purposes only', fontSize: 10, fill: 'rgba(232,233,240,0.25)' },

      // Bottom nav
      { id: 'i30', type: 'rect', x: 0, y: 720, w: 390, h: 80, fill: '#0E0F14', stroke: '#1F2235', strokeWidth: 1 },
      { id: 'i31', type: 'text', x: 30, y: 748, text: '⬡', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i32', type: 'text', x: 24, y: 766, text: 'Portfolio', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i33', type: 'text', x: 114, y: 748, text: '◈', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i34', type: 'text', x: 108, y: 766, text: 'Elements', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i35', type: 'text', x: 194, y: 748, text: '≋', fontSize: 22, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i36', type: 'text', x: 190, y: 766, text: 'Cashflow', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i37', type: 'text', x: 278, y: 748, text: '⚡', fontSize: 20, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i38', type: 'text', x: 272, y: 766, text: 'Signals', fontSize: 10, fill: 'rgba(232,233,240,0.35)' },
      { id: 'i39', type: 'text', x: 353, y: 748, text: '⚗', fontSize: 20, fill: '#7C5CFC' },
      { id: 'i40', type: 'text', x: 352, y: 766, text: 'Forge', fontSize: 10, fill: '#7C5CFC' },
    ]
  },
];

// ─── Build pen structure ───────────────────────────────────────────────────

const pen = {
  version: '2.8',
  meta: {
    id: 'alloy-wealth-platform',
    name: 'ALLOY — Wealth Composition Platform',
    description: 'Dark-mode personal wealth OS. Inspired by godly.website\'s void-palette + asymmetric card grids and darkmodedesign.com\'s "single chromatic accent on near-black" aesthetic. Metallurgy as finance metaphor.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    tags: ['finance', 'dark', 'portfolio', 'wealth', 'dashboard', 'monochrome', 'electric-violet'],
  },
  canvas: { width: 390, height: 844, deviceFrame: 'iphone15pro' },
  palette: {
    bg:      '#0B0C10',
    surface: '#14162A',
    text:    '#E8E9F0',
    accent:  '#7C5CFC',
    accent2: '#FF6B6B',
    muted:   'rgba(232,233,240,0.35)',
  },
  screens: SCREENS,
  flows: [
    { id: 'main', name: 'Core Navigation', connections: [
      { from: 's1', to: 's2', trigger: 'tap-nav-elements' },
      { from: 's2', to: 's3', trigger: 'tap-nav-cashflow' },
      { from: 's3', to: 's4', trigger: 'tap-nav-signals' },
      { from: 's4', to: 's5', trigger: 'tap-nav-forge' },
      { from: 's5', to: 's1', trigger: 'tap-nav-portfolio' },
    ]},
  ],
};

// ─── Write .pen file ───────────────────────────────────────────────────────

const OUT = path.join(__dirname, 'alloy.pen');
fs.writeFileSync(OUT, JSON.stringify(pen, null, 2));
console.log('✓ alloy.pen written (' + Math.round(fs.statSync(OUT).size / 1024) + 'KB)');
