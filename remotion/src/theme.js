/**
 * SoldiKeeper Video Design System
 * Single source of truth for all brand tokens used across compositions.
 */

export const BRAND = {
  // Core brand colours
  green:      '#10b981',   // emerald-500
  greenLight: '#34d399',   // emerald-400
  greenDark:  '#059669',   // emerald-600
  greenGlow:  'rgba(16,185,129,0.25)',

  // Backgrounds
  darkest:    '#060c14',
  dark:       '#0f172a',   // slate-900
  dark2:      '#1e293b',   // slate-800
  surface:    'rgba(255,255,255,0.07)',
  surfaceHover:'rgba(255,255,255,0.12)',

  // Text
  white:      '#ffffff',
  textMuted:  'rgba(255,255,255,0.70)',
  textFaint:  'rgba(255,255,255,0.45)',

  // Accent palette
  blue:       '#3b82f6',
  violet:     '#8b5cf6',
  amber:      '#f59e0b',
  red:        '#ef4444',
  pink:       '#ec4899',
  cyan:       '#06b6d4',

  // Gradients (use as background: value)
  bgMain:   'linear-gradient(135deg, #060c14 0%, #0f172a 50%, #060c14 100%)',
  bgGreen:  'linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #064e3b 100%)',
  bgBlue:   'linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%, #1e3a5f 100%)',
  bgViolet: 'linear-gradient(135deg, #2e1065 0%, #0f172a 60%, #2e1065 100%)',
  bgAmber:  'linear-gradient(135deg, #451a03 0%, #0f172a 60%, #451a03 100%)',
  btnGreen: 'linear-gradient(135deg, #10b981, #059669)',
};

export const FONT = {
  sans: '"Inter","SF Pro Display","Helvetica Neue",system-ui,sans-serif',
  mono: '"JetBrains Mono","Fira Code",monospace',
  weight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 900 },
};

export const EASE = {
  // Pre-baked extrapolate configs for interpolate()
  clamp: { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
};

/** Hex → "r,g,b" for rgba() usage */
export const rgb = (hex) => {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)}`;
};
