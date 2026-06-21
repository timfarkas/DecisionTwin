import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, shadow } from '../theme';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'raised' has a soft shadow; 'flat' uses a hairline border only. */
  variant?: 'raised' | 'flat' | 'tinted';
  padded?: boolean;
};

/** Soft, rounded surface used to group content with calm, airy padding. */
export function Card({ children, style, variant = 'raised', padded = true }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        variant === 'raised' && styles.raised,
        variant === 'flat' && styles.flat,
        variant === 'tinted' && styles.tinted,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  padded: {
    padding: spacing.xl,
  },
  raised: {
    ...shadow.card,
  },
  flat: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  tinted: {
    backgroundColor: colors.primarySoft,
  },
});
