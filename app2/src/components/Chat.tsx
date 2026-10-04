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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    CHAT_LANGUAGE,
    MAIN_MEMBER_NAME,
    MY_LANGUAGE,
} from "../constants/config";
import { colors } from "../constants/theme";
import { useChat } from "../hooks/useChat";
import { dayKey, formatDay, isMine, translationKey } from "../utils";
import { Composer } from "./Composer";
import Empty from "./Empty";
import MessageBubble from "./MessageBubble";

export default function Chat() {
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

  const data = useMemo(() => [...messages].reverse(), [messages]);

  const otherName = messages.find((message) => !isMine(message))?.sender
    .onlyName;

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
          <Text style={styles.refresh}>Paste</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {ready && messages.length === 0 ? (
          <Empty />
        ) : (
          <FlatList
            style={styles.flex}
            contentContainerStyle={styles.list}
            data={data}
            inverted
            keyExtractor={(message) => message.id}
            extraData={[translations, pending]}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              const previous = data[index + 1];
              const newDay =
                !previous ||
                dayKey(previous.timestamp) !== dayKey(item.timestamp);

              return (
                <MessageBubble
                  message={item}
                  mine={isMine(item)}
                  translation={
                    translations[
                      translationKey(
                        `msg:${item.id}`,
                        CHAT_LANGUAGE,
                        MY_LANGUAGE,
                      )
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
});
