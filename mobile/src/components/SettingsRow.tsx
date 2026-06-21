import React from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, type } from '../theme';
import { AppText } from './Typography';

type BaseProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

type ToggleRowProps = BaseProps & {
  kind: 'toggle';
  value: boolean;
  onValueChange: (v: boolean) => void;
};

type SelectRowProps = BaseProps & {
  kind: 'select';
  value: string;
  onPress?: () => void;
};

type SettingsRowProps = ToggleRowProps | SelectRowProps;

/** One row in a settings group: an icon, a title/subtitle, and a control. */
export function SettingsRow(props: SettingsRowProps) {
  const { icon, title, subtitle } = props;

  const body = (
    <View style={styles.row}>
      <View style={styles.iconWell}>
        <Ionicons name={icon} size={20} color={colors.primaryDeep} />
      </View>
      <View style={styles.texts}>
        <AppText variant="body" style={styles.title}>{title}</AppText>
        {subtitle ? (
          <AppText variant="bodySmall" color={colors.textMuted}>{subtitle}</AppText>
        ) : null}
      </View>
      {props.kind === 'toggle' ? (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
          thumbColor={colors.surface}
        />
      ) : (
        <View style={styles.selectValue}>
          <AppText variant="bodySmall" color={colors.primaryDeep} style={styles.selectText}>
            {props.value}
          </AppText>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>
      )}
    </View>
  );

  if (props.kind === 'select') {
    return (
      <Pressable onPress={props.onPress} accessibilityRole="button">
        {body}
      </Pressable>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  texts: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontWeight: '600',
  },
  selectValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontWeight: '600',
    marginRight: 4,
  },
});
