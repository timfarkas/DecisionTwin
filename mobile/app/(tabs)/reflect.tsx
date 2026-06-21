import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppButton,
  AppText,
  Card,
  Eyebrow,
  Screen,
  Tag,
} from '../../src/components';
import { colors, radius, spacing } from '../../src/theme';
import { latestReflection, openDecisions } from '../../src/data/mockData';

/**
 * Reflect view — surfaces the periodic reflection report (the mobile heir of
 * report.md) and any open decisions the companion can help weigh. "Reflect now"
 * stands in for the on-device reflection job.
 */
export default function ReflectScreen() {
  const r = latestReflection;
  const [running, setRunning] = useState(false);

  const reflectNow = () => {
    // Real impl: run the on-device reflection job over local memory.
    setRunning(true);
    setTimeout(() => setRunning(false), 1200);
  };

  return (
    <Screen>
      <Eyebrow>Reflection</Eyebrow>
      <AppText variant="title">{r.title}</AppText>
      <View style={styles.metaRow}>
        <Tag label={r.period} tone="amber" />
        <AppText variant="caption" color={colors.textMuted}>
          Updated nightly · on-device
        </AppText>
      </View>

      <Card style={styles.summaryCard} variant="tinted">
        <AppText variant="body" color={colors.text} style={styles.summary}>
          {r.summary}
        </AppText>
      </Card>

      <SectionLabel icon="search" text="What's helping" />
      <Card>
        {r.insights.map((line, i) => (
          <Bullet key={i} text={line} last={i === r.insights.length - 1} icon="checkmark-circle" />
        ))}
      </Card>

      <SectionLabel icon="leaf" text="Gentle suggestions" />
      <Card>
        {r.suggestions.map((line, i) => (
          <Bullet
            key={i}
            text={line}
            last={i === r.suggestions.length - 1}
            icon="arrow-forward-circle"
          />
        ))}
      </Card>

      <SectionLabel icon="git-compare" text="Decisions you're weighing" />
      <View style={styles.decisions}>
        {openDecisions.map((d) => (
          <Card key={d.id} variant="flat" style={styles.decisionCard}>
            <AppText variant="heading">{d.question}</AppText>
            <AppText variant="bodySmall" color={colors.textSecondary} style={styles.decisionCtx}>
              {d.context}
            </AppText>
            <View style={styles.factors}>
              {d.factors.map((f) => (
                <Tag key={f} label={f} tone="neutral" />
              ))}
            </View>
          </Card>
        ))}
      </View>

      <AppButton
        label={running ? 'Reflecting…' : 'Reflect now'}
        icon="sparkles"
        onPress={reflectNow}
        disabled={running}
        style={styles.cta}
      />
    </Screen>
  );
}

function SectionLabel({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText variant="heading">{text}</AppText>
    </View>
  );
}

function Bullet({
  text,
  icon,
  last,
}: {
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  last?: boolean;
}) {
  return (
    <View style={[styles.bullet, !last && styles.bulletDivider]}>
      <Ionicons name={icon} size={18} color={colors.accent} style={styles.bulletIcon} />
      <AppText variant="body" style={styles.bulletText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  summary: {
    lineHeight: 25,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  bulletDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bulletIcon: {
    marginTop: 2,
    marginRight: spacing.md,
  },
  bulletText: {
    flex: 1,
    lineHeight: 23,
  },
  decisions: {
    gap: spacing.md,
  },
  decisionCard: {
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  decisionCtx: {
    lineHeight: 21,
  },
  factors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cta: {
    marginTop: spacing.xxl,
  },
});
