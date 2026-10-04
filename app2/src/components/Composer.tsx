import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { colors } from "../constants/theme";

interface Props {
  onTranslate: (text: string) => Promise<string>;
  bottomInset: number;
}

export function Composer({ onTranslate, bottomInset }: Props) {
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canTranslate = draft.trim().length > 0 && !loading;

  async function translate() {
    if (!canTranslate) return;
    setLoading(true);
    setResult(null);
    try {
      const newResult = await onTranslate(draft.trim())
      setResult(newResult);
      copy(newResult);
    } catch (error) {
      ToastAndroid.show(
        error instanceof Error ? error.message : "Translation failed",
        ToastAndroid.LONG,
      );
    } finally {
      setLoading(false);
    }
  }

  async function copy(text?: string) {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    ToastAndroid.show("Copied", ToastAndroid.SHORT);
  }

  function clear() {
    setDraft("");
    setResult(null);
  }

  return (
    <View style={[styles.container, { paddingBottom: 10 + bottomInset }]}>
      {result ? (
        <View style={styles.result}>
          <Text style={styles.resultText} selectable>
            {result}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => copy(result)} hitSlop={8}>
              <Text style={styles.action}>Copy</Text>
            </Pressable>
            <Pressable onPress={clear} hitSlop={8}>
              <Text style={styles.actionMuted}>Clear</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={(text) => {
            setDraft(text);
            setResult(null);
          }}
          placeholder="Write"
          placeholderTextColor={colors.muted}
          multiline
        />
        <Pressable
          onPress={translate}
          disabled={!canTranslate}
          style={[styles.button, !canTranslate && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Translate</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  result: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.translation,
  },
  resultText: { color: colors.translationText, fontSize: 15, lineHeight: 21 },
  actions: { flexDirection: "row", gap: 18, marginTop: 6 },
  action: { color: colors.translation, fontSize: 13, fontWeight: "600" },
  actionMuted: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  input: {
    flex: 1,
    maxHeight: 120,
    color: colors.text,
    backgroundColor: colors.theirs,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    minWidth: 92,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: colors.translation,
    paddingHorizontal: 14,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.background, fontSize: 15, fontWeight: "700" },
});
