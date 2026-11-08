import {
  setAudioModeAsync,
  useAudioPlayer as useExpoAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

export interface UseAudioPlayerReturn {
  playingId: string | null;
  isLoading: boolean;
  togglePlay: (id: string, uri: string) => Promise<void>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const player = useExpoAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const operationInProgress = useRef(false);

  // The expo-audio hook owns and releases the native player on unmount.
  useEffect(() => {
    if (status.didJustFinish) setPlayingId(null);
  }, [status.didJustFinish]);

  useEffect(() => {
    if (!status.error) return;
    setPlayingId(null);
    Alert.alert("Audio playback failed", status.error);
  }, [status.error]);

  const stopCurrent = useCallback(() => {
    player.pause();
    setPlayingId(null);
  }, [player]);

  const togglePlay = useCallback(
    async (id: string, uri: string) => {
      if (operationInProgress.current) return;

      if (playingId === id && status.playing) {
        stopCurrent();
        return;
      }

      operationInProgress.current = true;
      setIsLoading(true);
      try {
        await setAudioModeAsync({ playsInSilentMode: true });
        player.pause();
        player.replace({ uri });
        player.play();
        setPlayingId(id);
      } catch {
        setPlayingId(null);
        Alert.alert("Audio playback failed", "The audio file could not be played.");
      } finally {
        operationInProgress.current = false;
        setIsLoading(false);
      }
    },
    [playingId, player, status.playing, stopCurrent],
  );

  return { playingId, isLoading: isLoading || status.isBuffering, togglePlay };
}
