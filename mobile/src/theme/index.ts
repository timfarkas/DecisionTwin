export { colors } from './colors';
export type { ColorToken } from './colors';
export { spacing, radius, shadow } from './spacing';
export { fonts, type } from './typography';

import { colors } from './colors';
import { spacing, radius, shadow } from './spacing';
import { fonts, type } from './typography';

/** Convenience bundle for `import { theme } from '../theme'`. */
export const theme = { colors, spacing, radius, shadow, fonts, type } as const;
