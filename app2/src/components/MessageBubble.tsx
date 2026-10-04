import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../constants/theme";
import type { Message } from "../types";
import { formatTime } from "../utils";

interface Props {
  message: Message;
  mine: boolean;
  translation?: string;
  loading: boolean;
  dayLabel?: string;
  onTranslate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MessageBubble({
  message,
  mine,
  translation,
  loading,
  dayLabel,
  onTranslate,
  onDelete
}: Props) {
  return (
    <View>
      {dayLabel ? (
        <View style={styles.dayWrap}>
          <Text style={styles.day}>{dayLabel}</Text>
        </View>
      ) : null}

      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        {!mine && <Text style={styles.sender}>{message.sender.onlyName}</Text>}

        <Text style={styles.text} selectable>
          {message.text}
        </Text>

        {translation ? (
          <View style={styles.translation}>
            <Text style={styles.translationText} selectable>
              {translation}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Pressable onPress={() => onDelete(message.id)} hitSlop={10}>
            <Text style={styles.deleteButton}>Delete</Text>
          </Pressable>
          {loading ? (
            <ActivityIndicator size="small" color={colors.translation} />
          ) : (
            <Pressable onPress={() => onTranslate(message.id)} hitSlop={10}>
              <Text style={styles.translateButton}>Translate</Text>
            </Pressable>
          )}
          <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayWrap: { alignItems: "center", marginVertical: 14 },
  day: {
    color: colors.muted,
    backgroundColor: colors.surface,
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  bubble: {
    maxWidth: "86%",
    marginVertical: 3,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    borderRadius: 16,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.mine,
    borderBottomRightRadius: 4,
  },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: colors.theirs,
    borderBottomLeftRadius: 4,
  },
  sender: {
    color: colors.translation,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  text: { color: colors.text, fontSize: 16, lineHeight: 22 },
  translation: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.translation,
  },
  translationText: {
    color: colors.translationText,
    fontSize: 15,
    lineHeight: 21,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 14,
    marginTop: 4,
  },
  deleteButton: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  translateButton: {
    color: colors.translation,
    fontSize: 12,
    fontWeight: "600",
  },
  time: { color: colors.muted, fontSize: 12 },
});
