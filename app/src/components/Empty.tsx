import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function Empty() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptyText}>
        In WhatsApp, select two or more messages and copy them, then come back
        here. A single message copied is ignored.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: { color: colors.muted, fontSize: 15, lineHeight: 22 },
});
