import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Composer } from "./src/components/Composer";
import { MessageBubble } from "./src/components/MessageBubble";
import { CHAT_LANGUAGE, MAIN_MEMBER_NAME, MY_LANGUAGE } from "./src/config";
import { colors } from "./src/theme";
import type { Message } from "./src/types";
import { useChat } from "./src/useChat";
import { dayKey, formatDay, normalizeName, translationKey } from "./src/utils";

function Chat() {
  const insets = useSafeAreaInsets();
  const {
    messages,
    translations,
    pending,
    ready,
    importAndNotify,
    translateReceived,
    translateDraft,
  } = useChat();

  const mainName = normalizeName(MAIN_MEMBER_NAME);
  const isMine = (m: Message) => normalizeName(m.sender.onlyName) === mainName;

  // The list is inverted (newest at the bottom, opens at the bottom), so the data is reversed.
  const data = useMemo(() => [...messages].reverse(), [messages]);
  const otherName = messages.find((m) => !isMine(m))?.sender.onlyName;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{otherName ?? "Chat"}</Text>
          <Text style={[styles.subtitle, !MAIN_MEMBER_NAME && styles.warning]}>
            {MAIN_MEMBER_NAME
              ? `${messages.length} messages`
              : "Set EXPO_PUBLIC_MAIN_MEMBER_NAME in .env"}
          </Text>
        </View>
        <Pressable onPress={importAndNotify} hitSlop={10}>
          <Text style={styles.refresh}>Paste from clipboard</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {ready && messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              In WhatsApp, select two or more messages and copy them, then come
              back here. A single message has no date or name, so it is ignored.
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.flex}
            contentContainerStyle={styles.list}
            data={data}
            inverted
            keyExtractor={(m) => m.id}
            extraData={[translations, pending]}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              const previous = data[index + 1]; // chronologically before this one
              const newDay =
                !previous || dayKey(previous.timestamp) !== dayKey(item.timestamp);
              return (
                <MessageBubble
                  message={item}
                  mine={isMine(item)}
                  translation={
                    translations[
                      translationKey(`msg:${item.id}`, CHAT_LANGUAGE, MY_LANGUAGE)
                    ]
                  }
                  loading={!!pending[item.id]}
                  dayLabel={newDay ? formatDay(item.timestamp) : undefined}
                  onTranslate={translateReceived}
                />
              );
            }}
          />
        )}

        <Composer onTranslate={translateDraft} bottomInset={insets.bottom} />
      </KeyboardAvoidingView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Chat />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  headerText: { flexShrink: 1 },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  warning: { color: colors.danger },
  refresh: { color: colors.translation, fontSize: 13, fontWeight: "600" },
  list: { paddingHorizontal: 10, paddingVertical: 8 },
  empty: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "600", marginBottom: 8 },
  emptyText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
