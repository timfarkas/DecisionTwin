/**
 * Typography tokens.
 *
 * Pairing a tasteful serif for display/headings (artistic, high-end) with the
 * system sans for body text (clean, legible). We lean on platform system fonts
 * so the scaffold runs with zero font-loading overhead; swap in a custom face
 * later by changing `fonts.serif` / `fonts.sans` only.
 */

import { Platform } from 'react-native';

export const fonts = {
  // Elegant serif for headings — Georgia ships on iOS; graceful fallback elsewhere.
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, "Times New Roman", serif',
  }) as string,
  // System sans for body.
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'system-ui, -apple-system, sans-serif',
  }) as string,
};

export const type = {
  display: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: 0.2,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 20,
    lineHeight: 26,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
    fontWeight: '600' as const,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
} as const;
