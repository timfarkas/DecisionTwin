import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import { AppText } from './Typography';

type ChatBubbleProps = {
  text: string;
  from: 'user' | 'companion';
};

/** Conversation bubble. Companion speaks in warm cream; the user in soft amber. */
export function ChatBubble({ text, from }: ChatBubbleProps) {
  const isUser = from === 'user';
  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowCompanion]}>
      <View style={[styles.bubble, isUser ? styles.user : styles.companion]}>
        {!isUser && <AppText variant="caption" color={colors.primary} style={styles.who}>Companion</AppText>}
        <AppText variant="body" color={isUser ? colors.primaryDeep : colors.text}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: spacing.md,
    maxWidth: '88%',
  },
  rowUser: {
    alignSelf: 'flex-end',
  },
  rowCompanion: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  companion: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  user: {
    backgroundColor: colors.primarySoft,
    borderTopRightRadius: radius.sm,
  },
  who: {
    marginBottom: 2,
    fontWeight: '700',
  },
});
