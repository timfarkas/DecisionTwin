import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, ChatBubble, Eyebrow, MicButton } from '../../src/components';
import { colors, radius, spacing } from '../../src/theme';
import { runtime, ChatTurn } from '../../src/runtime';

const GREETING: ChatTurn = {
  id: 'seed',
  role: 'companion',
  text: "Hi Maya. I'm here whenever you want to think something through — out loud or in writing. What's on your mind?",
  at: Date.now(),
};

/**
 * Companion screen — voice-first capture with a text fallback. Talking (or
 * typing) appends to the conversation; the mock runtime replies with gentle,
 * reflective nudges. This is the always-on capture entry point from the plan.
 */
export default function CompanionScreen() {
  const insets = useSafeAreaInsets();
  const [turns, setTurns] = useState<ChatTurn[]>([GREETING]);
  const [listening, setListening] = useState(false);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || thinking) return;

      const userTurn: ChatTurn = {
        id: `u-${Date.now()}`,
        role: 'user',
        text: clean,
        at: Date.now(),
      };
      const next = [...turns, userTurn];
      setTurns(next);
      setDraft('');
      setThinking(true);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

      const reply = await runtime.respond(next);
      setTurns((prev) => [
        ...prev,
        { id: `c-${Date.now()}`, role: 'companion', text: reply, at: Date.now() },
      ]);
      setThinking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    },
    [turns, thinking]
  );

  const onMic = useCallback(() => {
    // Real impl: start/stop whisper.cpp on-device STT. Stub: simulate a phrase.
    if (listening) {
      setListening(false);
      send('I keep going back and forth on a decision and it is stressing me out.');
    } else {
      setListening(true);
    }
  }, [listening, send]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Eyebrow>Your companion</Eyebrow>
        <AppText variant="title">Let's talk it through</AppText>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={styles.thread}
        showsVerticalScrollIndicator={false}
      >
        {turns.map((t) => (
          <ChatBubble key={t.id} text={t.text} from={t.role} />
        ))}
        {thinking && (
          <View style={styles.thinking}>
            <AppText variant="bodySmall" color={colors.textMuted}>
              Companion is thinking…
            </AppText>
          </View>
        )}
      </ScrollView>

      <View style={styles.micZone}>
        <MicButton listening={listening} onPress={onMic} />
        <AppText variant="caption" color={colors.textMuted} style={styles.micHint}>
          {listening ? 'Listening… tap to finish' : 'Tap to talk'}
        </AppText>
      </View>

      <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="…or type instead"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          onSubmitEditing={() => send(draft)}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => send(draft)}
          disabled={!draft.trim()}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={[styles.sendBtn, !draft.trim() && styles.sendBtnOff]}
        >
          <Ionicons name="arrow-up" size={22} color={colors.onPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.canvas },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  thread: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  thinking: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  micZone: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  micHint: {
    marginTop: spacing.xs,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnOff: {
    backgroundColor: colors.borderStrong,
  },
});
