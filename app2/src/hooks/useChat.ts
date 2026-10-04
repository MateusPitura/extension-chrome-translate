import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  CHAT_LANGUAGE,
  CLIPBOARD_DELAY_MS,
  CONTEXT_SIZE,
  MAIN_MEMBER_NAME,
  MY_LANGUAGE,
} from "../constants/config";
import type { Message } from "../types";
import { getErrorText, hash, showToast, translationKey } from "../utils";
import { parseWhatsAppChat } from "../utils/parser";
import {
  loadMessages,
  loadTranslations,
  saveMessages,
  saveTranslations,
} from "../utils/storage";
import { translateMessage } from "../utils/translate";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  // Refs hold the latest values for async callbacks and the AppState listener.
  const messagesRef = useRef<Message[]>([]);
  const translationsRef = useRef<Record<string, string>>({});

  // 1. Load saved history and cached translations.
  useEffect(() => {
    (async () => {
      const [savedMessages, savedTranslations] = await Promise.all([
        loadMessages(),
        loadTranslations(),
      ]);
      messagesRef.current = savedMessages;
      translationsRef.current = savedTranslations;
      setMessages(savedMessages);
      setTranslations(savedTranslations);
      setReady(true);
    })();
  }, []);

  /** Reads the clipboard and merges new WhatsApp messages into the history. */
  const importFromClipboard = useCallback(async (): Promise<number> => {
    const text = await Clipboard.getStringAsync();
    const parsed = parseWhatsAppChat(text);
    if (parsed.length === 0) return 0;

    const known = new Set(messagesRef.current.map((m) => m.id));
    const fresh = parsed.filter((m) => !known.has(m.id));
    if (fresh.length === 0) return 0;

    // Array.sort is stable: same-minute messages keep their paste order.
    const next = [...messagesRef.current, ...fresh].sort(
      (a, b) => a.timestamp - b.timestamp,
    );
    messagesRef.current = next; // update synchronously so concurrent imports see it
    setMessages(next);
    await saveMessages(next);
    return fresh.length;
  }, []);

  const importAndNotify = useCallback(async () => {
    try {
      const added = await importFromClipboard();
      if (added > 0)
        showToast(`${added} new message${added > 1 ? "s" : ""} added`);
    } catch (e) {
      showToast(getErrorText(e));
    }
  }, [importFromClipboard]);

  // 2. Import when the app opens and every time it comes back to the foreground.
  useEffect(() => {
    if (!ready) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(importAndNotify, CLIPBOARD_DELAY_MS);
    };
    schedule();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") schedule();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [ready, importAndNotify]);

  const cacheTranslation = useCallback(async (key: string, value: string) => {
    const next = { ...translationsRef.current, [key]: value };
    translationsRef.current = next;
    setTranslations(next);
    await saveTranslations(next);
  }, []);

  /** Chat language -> my language, for one received message (with the previous ones as context). */
  const translateReceived = useCallback(
    async (id: string) => {
      const list = messagesRef.current;
      const index = list.findIndex((m) => m.id === id);
      const key = translationKey(`msg:${id}`, CHAT_LANGUAGE, MY_LANGUAGE);
      if (index < 0 || translationsRef.current[key]) return;

      setPending((p) => ({ ...p, [id]: true }));
      try {
        const context = list.slice(
          Math.max(0, index - CONTEXT_SIZE + 1),
          index + 1,
        );
        const result = await translateMessage(
          context,
          CHAT_LANGUAGE,
          MY_LANGUAGE,
        );
        await cacheTranslation(key, result);
      } catch (e) {
        showToast(getErrorText(e));
      } finally {
        setPending((p) => ({ ...p, [id]: false }));
      }
    },
    [cacheTranslation],
  );

  /** My language -> chat language, for a draft. Throws on failure. */
  const translateDraft = useCallback(
    async (text: string): Promise<string> => {
      const key = translationKey(
        `draft:${hash(text)}`,
        MY_LANGUAGE,
        CHAT_LANGUAGE,
      );
      const cached = translationsRef.current[key];
      if (cached) return cached;

      const draft: Message = {
        id: "draft",
        timestamp: Date.now(),
        sender: { onlyName: MAIN_MEMBER_NAME },
        text,
      };
      const context = [
        ...messagesRef.current.slice(-(CONTEXT_SIZE - 1)),
        draft,
      ];
      const result = await translateMessage(
        context,
        MY_LANGUAGE,
        CHAT_LANGUAGE,
      );
      await cacheTranslation(key, result);
      return result;
    },
    [cacheTranslation],
  );

  return {
    messages,
    translations,
    pending,
    ready,
    importAndNotify,
    translateReceived,
    translateDraft,
  };
}
