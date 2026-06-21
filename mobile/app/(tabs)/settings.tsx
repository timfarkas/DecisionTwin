import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AppText,
  Card,
  Eyebrow,
  Screen,
  SettingsRow,
} from '../../src/components';
import { colors, radius, spacing } from '../../src/theme';
import { availableModels, runtime } from '../../src/runtime';

/**
 * Settings — model choice, reflection cadence, and privacy/location controls.
 * Mirrors the architecture decisions: 0.5B default with a 1.5B upgrade path,
 * nightly-default reflection, and the single OSM place-lookup network boundary.
 */
export default function SettingsScreen() {
  const models = availableModels();
  const [modelLabel, setModelLabel] = useState(runtime.model.label);
  const [cadence] = useState('Nightly');

  const [voiceFirst, setVoiceFirst] = useState(true);
  const [storeOnDevice] = useState(true); // always true; shown as reassurance
  const [allowPlaceLookup, setAllowPlaceLookup] = useState(true);
  const [coarseLocation, setCoarseLocation] = useState(true);

  const cycleModel = () => {
    const idx = models.findIndex((m) => m.label === modelLabel);
    setModelLabel(models[(idx + 1) % models.length].label);
  };

  return (
    <Screen>
      <Eyebrow>Preferences</Eyebrow>
      <AppText variant="title">Settings</AppText>

      {/* Model */}
      <GroupLabel text="On-device model" />
      <Card padded={false} style={styles.group}>
        <View style={styles.groupInner}>
          <SettingsRow
            kind="select"
            icon="hardware-chip"
            title="Model"
            subtitle="Runs entirely on your phone — no cloud"
            value={modelLabel}
            onPress={cycleModel}
          />
          <Divider />
          <SettingsRow
            kind="select"
            icon="speedometer"
            title="Reflection cadence"
            subtitle="When the nightly review runs"
            value={cadence}
          />
        </View>
      </Card>
      <Hint text="0.5B is the default for the widest device support. Switch to 1.5B on a newer iPhone for stronger reasoning." />

      {/* Conversation */}
      <GroupLabel text="Conversation" />
      <Card padded={false} style={styles.group}>
        <View style={styles.groupInner}>
          <SettingsRow
            kind="toggle"
            icon="mic"
            title="Voice first"
            subtitle="Open the mic by default; typing always works"
            value={voiceFirst}
            onValueChange={setVoiceFirst}
          />
        </View>
      </Card>

      {/* Privacy */}
      <GroupLabel text="Privacy & location" />
      <Card padded={false} style={styles.group}>
        <View style={styles.groupInner}>
          <SettingsRow
            kind="toggle"
            icon="lock-closed"
            title="Keep everything on device"
            subtitle="Journal, memory, and model never leave your phone"
            value={storeOnDevice}
            onValueChange={() => {}}
          />
          <Divider />
          <SettingsRow
            kind="toggle"
            icon="restaurant"
            title="Allow nearby place lookups"
            subtitle="The only feature that uses the network"
            value={allowPlaceLookup}
            onValueChange={setAllowPlaceLookup}
          />
          <Divider />
          <SettingsRow
            kind="toggle"
            icon="navigate"
            title="Send coarse location only"
            subtitle="Round your location before any place lookup"
            value={coarseLocation}
            onValueChange={setCoarseLocation}
          />
        </View>
      </Card>

      <Card variant="tinted" style={styles.boundary}>
        <View style={styles.boundaryHead}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primaryDeep} />
          <AppText variant="heading" color={colors.primaryDeep}>
            One network boundary
          </AppText>
        </View>
        <AppText variant="bodySmall" color={colors.text} style={styles.boundaryText}>
          Place lookups use OpenStreetMap and send only a rough location and a
          generic query — never your name, journal, or conversations. Everything
          else happens privately on your device.
        </AppText>
      </Card>

      <AppText variant="caption" color={colors.textMuted} style={styles.version}>
        DecisionTwin · scaffold build 0.1.0
      </AppText>
    </Screen>
  );
}

function GroupLabel({ text }: { text: string }) {
  return <AppText variant="label" color={colors.textMuted} style={styles.groupLabel}>{text.toUpperCase()}</AppText>;
}

function Hint({ text }: { text: string }) {
  return (
    <AppText variant="caption" color={colors.textMuted} style={styles.hint}>
      {text}
    </AppText>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.sm,
  },
  groupInner: {
    paddingHorizontal: spacing.xl,
  },
  groupLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    letterSpacing: 1.2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  hint: {
    marginTop: spacing.xs,
    marginHorizontal: spacing.xs,
    lineHeight: 17,
  },
  boundary: {
    marginTop: spacing.xl,
    gap: spacing.sm,
    borderRadius: radius.lg,
  },
  boundaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  boundaryText: {
    lineHeight: 21,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
