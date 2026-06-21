import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';

type Tone = 'neutral' | 'amber' | 'sage' | 'muted';

type TagProps = {
  label: string;
  tone?: Tone;
};

/** Small rounded pill for moods, categories, and metadata. */
export function Tag({ label, tone = 'neutral' }: TagProps) {
  return (
    <View style={[styles.base, toneFill[tone]]}>
      <Text style={[styles.label, toneText[tone]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    ...type.caption,
    fontWeight: '600',
  },
});

const toneFill = StyleSheet.create({
  neutral: { backgroundColor: colors.surfaceAlt },
  amber: { backgroundColor: colors.primarySoft },
  sage: { backgroundColor: '#E4E8DC' },
  muted: { backgroundColor: colors.surfaceSunken },
});

const toneText = StyleSheet.create({
  neutral: { color: colors.textSecondary },
  amber: { color: colors.primaryDeep },
  sage: { color: '#5C6B4C' },
  muted: { color: colors.textMuted },
});
