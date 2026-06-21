import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadow } from '../theme';

type MicButtonProps = {
  listening?: boolean;
  onPress?: () => void;
};

/**
 * The hero control of the companion screen: a large, inviting circular mic.
 * When listening it shows a soft amber halo. Big tap target (96pt) by design.
 */
export function MicButton({ listening, onPress }: MicButtonProps) {
  return (
    <View style={styles.wrap}>
      {listening && <View style={styles.halo} />}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={listening ? 'Stop listening' : 'Start talking to your companion'}
        style={({ pressed }) => [
          styles.button,
          listening && styles.buttonActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={listening ? 'stop' : 'mic'}
          size={40}
          color={colors.onPrimary}
        />
      </Pressable>
    </View>
  );
}

const SIZE = 96;
const HALO = 128;

const styles = StyleSheet.create({
  wrap: {
    width: HALO,
    height: HALO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: HALO,
    height: HALO,
    borderRadius: HALO / 2,
    backgroundColor: colors.primarySoft,
    opacity: 0.7,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  buttonActive: {
    backgroundColor: colors.primaryDeep,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});
