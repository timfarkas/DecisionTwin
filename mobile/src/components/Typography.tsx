import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, type } from '../theme';

type Variant = keyof typeof type;

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  children: React.ReactNode;
};

/**
 * Single text primitive wired to the typography scale. Use `variant` to pick a
 * role (display/title/heading/body/...) so type stays consistent everywhere.
 */
export function AppText({ variant = 'body', color, style, children, ...rest }: AppTextProps) {
  return (
    <Text style={[type[variant], { color: color ?? defaultColor(variant) }, style]} {...rest}>
      {children}
    </Text>
  );
}

function defaultColor(variant: Variant): string {
  switch (variant) {
    case 'caption':
    case 'label':
      return colors.textMuted;
    case 'bodySmall':
      return colors.textSecondary;
    default:
      return colors.text;
  }
}

/** Small uppercase eyebrow label used above section content. */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={styles.eyebrow}>{String(children).toUpperCase()}</Text>;
}

const styles = StyleSheet.create({
  eyebrow: {
    ...type.label,
    color: colors.primary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
});
