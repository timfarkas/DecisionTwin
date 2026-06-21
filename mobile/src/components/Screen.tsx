import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type ScreenProps = {
  children: React.ReactNode;
  /** When true, content scrolls. When false, it's a fixed full-height view. */
  scroll?: boolean;
  /** Extra padding applied to the content container. */
  contentStyle?: StyleProp<ViewStyle>;
  /** Disable the default horizontal gutter (e.g. for edge-to-edge chat). */
  noGutter?: boolean;
};

/**
 * Standard warm canvas wrapper for every screen. Honors the device safe area
 * and applies the generous default gutters that define the app's calm feel.
 */
export function Screen({ children, scroll = true, contentStyle, noGutter }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const gutter = noGutter ? 0 : spacing.xl;

  const padding: ViewStyle = {
    paddingTop: insets.top + spacing.lg,
    paddingBottom: insets.bottom + spacing.xxl,
    paddingHorizontal: gutter,
  };

  if (scroll) {
    return (
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={[padding, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.canvas, padding, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
});
