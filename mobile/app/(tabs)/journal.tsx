import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Card, Eyebrow, Screen, Tag } from '../../src/components';
import { colors, radius, spacing } from '../../src/theme';
import { journalEntries } from '../../src/data/mockData';
import { JournalEntry, Mood } from '../../src/data/types';

/**
 * Journal / memory view — the user's personal corpus, the mobile heir of the
 * backend's data.md. Each day shows the note, a mood tag, and the metrics the
 * companion learns from.
 */
export default function JournalScreen() {
  return (
    <Screen>
      <Eyebrow>Your memory</Eyebrow>
      <AppText variant="title">Journal</AppText>
      <AppText variant="bodySmall" color={colors.textSecondary} style={styles.sub}>
        Everything here stays on your phone. The companion reads from it to
        understand your patterns.
      </AppText>

      <View style={styles.list}>
        {journalEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </View>
    </Screen>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.dateChip}>
          <AppText variant="caption" color={colors.primaryDeep} style={styles.day}>
            {entry.dayLabel}
          </AppText>
          <AppText variant="heading" color={colors.text}>
            {entry.date.slice(8, 10)}
          </AppText>
        </View>
        <Tag label={moodLabel(entry.moodTag)} tone={moodTone(entry.moodTag)} />
      </View>

      <AppText variant="body" style={styles.note}>
        {entry.note}
      </AppText>

      <View style={styles.metrics}>
        <Metric icon="moon" label="Sleep" value={`${entry.sleepHours}h`} />
        <Metric icon="leaf" label="Meditate" value={`${entry.meditationMin}m`} />
        <Metric icon="pulse" label="Mood" value={`${entry.mood}/10`} />
        <Metric icon="flame" label="Stress" value={`${entry.stress}/10`} />
      </View>

      <View style={styles.gratitude}>
        <Ionicons name="heart" size={14} color={colors.primary} />
        <AppText variant="bodySmall" color={colors.textSecondary} style={styles.gratText}>
          {entry.gratitude}
        </AppText>
      </View>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <AppText variant="body" color={colors.text} style={styles.metricValue}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textMuted}>
        {label}
      </AppText>
    </View>
  );
}

function moodLabel(m: Mood): string {
  return { low: 'Low', okay: 'Okay', good: 'Good', great: 'Great' }[m];
}
function moodTone(m: Mood): 'muted' | 'neutral' | 'sage' | 'amber' {
  return { low: 'muted', okay: 'neutral', good: 'sage', great: 'amber' }[m] as
    | 'muted'
    | 'neutral'
    | 'sage'
    | 'amber';
}

const styles = StyleSheet.create({
  sub: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  list: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  day: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  note: {
    lineHeight: 24,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  metricValue: {
    fontWeight: '700',
    marginTop: 2,
  },
  gratitude: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gratText: {
    flex: 1,
    fontStyle: 'italic',
  },
});
