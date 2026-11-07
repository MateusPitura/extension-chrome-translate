import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useShareIntent } from "expo-share-intent";
import type { ShareIntentFile } from "../types";

export interface UseAudioShareOptions {
  onAudioReceived: (file: ShareIntentFile) => Promise<void>;
}

export function useAudioShare({ onAudioReceived }: UseAudioShareOptions): void {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  const handling = useRef(false);

  useEffect(() => {
    if (!hasShareIntent || !shareIntent?.files?.length || handling.current) return;
    const audio = shareIntent.files.find((file) => /\.(oga|opus)(?:$|\?)/i.test(file.fileName ?? file.path));
    resetShareIntent();
    if (!audio) {
      Alert.alert(
        "Unsupported file",
        "Share a WhatsApp voice message in .oga or .opus format.",
      );
      return;
    }
    handling.current = true;
    void onAudioReceived(audio as ShareIntentFile).finally(() => { handling.current = false; });
  }, [hasShareIntent, shareIntent, resetShareIntent, onAudioReceived]);
}
