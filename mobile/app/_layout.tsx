import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme';
import { runtime } from '../src/runtime';

/**
 * Root layout. Warms the (mock) on-device runtime once on launch and sets the
 * app-wide warm status bar + navigation theme.
 */
export default function RootLayout() {
  useEffect(() => {
    // Real impl: load weights into llama.cpp/MLC. Stub resolves quickly.
    runtime.load().catch(() => {
      /* surfaced in UI later; ignored in scaffold */
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
