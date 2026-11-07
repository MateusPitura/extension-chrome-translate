import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
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
import SettingsModal from "./SettingsModal";
import { useAudioShare } from "../hooks/useAudioShare";

export default function Chat() {
  const insets = useSafeAreaInsets();
  const [settingsVisible, setSettingsVisible] = useState(false);

  const {
    messages,
    translations,
    pending,
    ready,
    apiKey,
    workerApiKey,
    models,
    transcribeModels,
    selectedModel,
    selectedTranscribeModel,
    updateApiKey,
    updateWorkerApiKey,
    selectModel,
    addModel,
    updateModel,
    deleteModel,
    pasteClipboardMessage,
    translateReceived,
    transcribeReceived,
    addSharedAudio,
    deleteReceived,
    translateDraft,
  } = useChat();

  useAudioShare({ onAudioReceived: ({ path, fileName }) => addSharedAudio(path, fileName ?? "audio") });

  const data = useMemo(() => [...messages].reverse(), [messages]);

  const otherName = messages.find((message) => !isMine(message))?.sender
    .onlyName;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.title} numberOfLines={1}>{otherName ?? "Chat"}</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={pasteClipboardMessage} hitSlop={10}>
              <Text style={styles.settingsButton}>Paste</Text>
            </Pressable>
            <Pressable onPress={() => setSettingsVisible(true)} hitSlop={10}>
              <Text style={styles.settingsButton}>Settings</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.headerDetails}>
          <Text style={styles.modelName} numberOfLines={1}>
            {messages.length} messages • {selectedModel.name} • {selectedTranscribeModel.name}
          </Text>
        </View>
        {!MAIN_MEMBER_NAME && (
          <Text style={[styles.warning, styles.configWarning]}>
            Set EXPO_PUBLIC_MAIN_MEMBER_NAME in .env
          </Text>
        )}
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        apiKey={apiKey}
        onUpdateApiKey={updateApiKey}
        workerApiKey={workerApiKey}
        onUpdateWorkerApiKey={updateWorkerApiKey}
        models={models}
        transcribeModels={transcribeModels}
        selectedModel={selectedModel}
        selectedTranscribeModel={selectedTranscribeModel}
        onSelectModel={selectModel}
        onAddModel={addModel}
        onUpdateModel={updateModel}
        onDeleteModel={deleteModel}
      />

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
                  onTranscribe={transcribeReceived}
                  onDelete={deleteReceived}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: "700", flex: 1 },
  messageCount: { color: colors.muted, fontSize: 10, flexShrink: 0 },
  modelName: { color: colors.muted, fontSize: 10, flex: 1, flexShrink: 1 },
  warning: { color: colors.danger },
  configWarning: { fontSize: 10, marginTop: 3 },
  settingsButton: {
    color: colors.translation,
    fontSize: 13,
    fontWeight: "600",
  },
  list: { paddingHorizontal: 10, paddingVertical: 8 },
});
