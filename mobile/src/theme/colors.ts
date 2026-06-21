/**
 * DecisionTwin color palette.
 *
 * Direction: low-key, high-end, understated-premium. Soft warm neutrals with
 * gentle earthy/amber accents — calm and inviting for a personal mindfulness /
 * decision companion. Everything reads warm; nothing is pure cold white or black.
 */

export const colors = {
  // Canvas & surfaces (warm neutrals)
  canvas: '#FBF6EF', // app background — soft warm cream
  surface: '#FFFDFA', // raised cards
  surfaceAlt: '#F3E9DB', // secondary fills, inputs
  surfaceSunken: '#F1E6D6', // pressed / inset wells

  // Lines
  border: '#E9DECE',
  borderStrong: '#DCCDB8',

  // Earthy / amber accents
  primary: '#C0794B', // warm terracotta-amber
  primaryDeep: '#A2623A', // pressed / emphasis
  primarySoft: '#EFDFCB', // tinted backgrounds
  accent: '#8B9A7B', // calm sage — secondary accent

  // Text (warm near-blacks & taupes)
  text: '#322C25',
  textSecondary: '#6B6157',
  textMuted: '#9C8F80',
  onPrimary: '#FFF8F0', // text on amber

  // Semantic
  success: '#7F9468',
  warning: '#C9974A',
  danger: '#B5654B',

  // Effects
  shadow: '#3A2C1C',
  overlay: 'rgba(50, 40, 28, 0.35)',
} as const;

export type ColorToken = keyof typeof colors;
