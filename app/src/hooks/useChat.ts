import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  CHAT_LANGUAGE,
  CLIPBOARD_DELAY_MS,
  CONTEXT_SIZE,
  DEFAULT_MODELS,
  MAIN_MEMBER_NAME,
  MY_LANGUAGE,
} from "../constants/config";
import type { AIModel, Message } from "../types";
import { getErrorText, hash, showToast, translationKey } from "../utils";
import { parseWhatsAppChat } from "../utils/parser";
import {
  loadApiKey,
  loadMessages,
  loadModels,
  loadSelectedModel,
  loadTranslations,
  saveApiKey,
  saveMessages,
  saveModels,
  saveSelectedModel,
  saveTranslations,
} from "../utils/storage";
import { translateMessage } from "../utils/translate";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_MODELS[0]);

  // Refs hold the latest values for async callbacks and the AppState listener.
  const messagesRef = useRef<Message[]>([]);
  const translationsRef = useRef<Record<string, string>>({});
  const apiKeyRef = useRef<string>("");
  const modelsRef = useRef<AIModel[]>(DEFAULT_MODELS);
  const selectedModelRef = useRef<AIModel>(DEFAULT_MODELS[0]);

  // 1. Load saved history, cached translations, apiKey, and models.
  useEffect(() => {
    (async () => {
      const [
        savedMessages,
        savedTranslations,
        savedApiKey,
        savedModels,
        savedSelectedModel,
      ] = await Promise.all([
        loadMessages(),
        loadTranslations(),
        loadApiKey(),
        loadModels(),
        loadSelectedModel(),
      ]);
      messagesRef.current = savedMessages;
      translationsRef.current = savedTranslations;
      apiKeyRef.current = savedApiKey;
      modelsRef.current = savedModels;

      const activeModel =
        savedModels.find((m) => m.name === savedSelectedModel.name) ??
        savedModels[0] ??
        DEFAULT_MODELS[0];

      selectedModelRef.current = activeModel;

      setMessages(savedMessages);
      setTranslations(savedTranslations);
      setApiKey(savedApiKey);
      setModels(savedModels);
      setSelectedModel(activeModel);
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

  const removeTranslation = useCallback(async (key: string) => {
    const next = translationsRef.current;
    delete next[key];
    translationsRef.current = next;
    setTranslations(next);
    await saveTranslations(next);
  }, []);

  /** Chat language -> my language, for one received message (with the previous ones as context). */
  const translateReceived = useCallback(
    async (id: string) => {
      const messagesList = messagesRef.current;
      const index = messagesList.findIndex((message) => message.id === id);
      if (index < 0) return;

      const key = translationKey(`msg:${id}`, CHAT_LANGUAGE, MY_LANGUAGE);
      if (translationsRef.current[key]) {
        await removeTranslation(key);
      }

      setPending((p) => ({ ...p, [id]: true }));
      try {
        const context = messagesList.slice(
          Math.max(0, index - CONTEXT_SIZE + 1),
          index + 1,
        );
        const result = await translateMessage(
          context,
          CHAT_LANGUAGE,
          MY_LANGUAGE,
          selectedModelRef.current,
          apiKeyRef.current,
        );
        await cacheTranslation(key, result);
      } catch (e) {
        showToast(getErrorText(e));
      } finally {
        setPending((p) => ({ ...p, [id]: false }));
      }
    },
    [cacheTranslation, removeTranslation],
  );

  const deleteReceived = useCallback(
    async (id: string) => {
      const messagesList = messagesRef.current;
      const index = messagesList.findIndex((message) => message.id === id);
      if (index < 0) return;

      const key = translationKey(`msg:${id}`, CHAT_LANGUAGE, MY_LANGUAGE);
      if (translationsRef.current[key]) {
        await removeTranslation(key);
      }

      const next = messagesList.filter((message) => message.id !== id);
      messagesRef.current = next; // update synchronously so concurrent imports see it
      setMessages(next);
      await saveMessages(next);
    },
    [removeTranslation],
  );

  /** My language -> chat language, for a draft. Throws on failure. */
  const translateDraft = useCallback(
    async (text: string): Promise<string> => {
      const key = translationKey(
        `draft:${hash(text)}`,
        MY_LANGUAGE,
        CHAT_LANGUAGE,
      );

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
        selectedModelRef.current,
        apiKeyRef.current,
      );
      await cacheTranslation(key, result);
      return result;
    },
    [cacheTranslation],
  );

  const updateApiKey = useCallback(async (key: string) => {
    apiKeyRef.current = key;
    setApiKey(key);
    await saveApiKey(key);
  }, []);

  const selectModel = useCallback(async (model: AIModel) => {
    selectedModelRef.current = model;
    setSelectedModel(model);
    await saveSelectedModel(model);
  }, []);

  const addModel = useCallback(async (newModel: AIModel): Promise<boolean> => {
    const trimmedName = newModel.name.trim();
    if (!trimmedName) {
      showToast("Model name cannot be empty");
      return false;
    }
    if (modelsRef.current.some((m) => m.name === trimmedName)) {
      showToast("A model with this name already exists");
      return false;
    }
    const item: AIModel = { name: trimmedName, provider: newModel.provider };
    const next = [...modelsRef.current, item];
    modelsRef.current = next;
    setModels(next);
    await saveModels(next);
    return true;
  }, []);

  const updateModel = useCallback(
    async (index: number, updated: AIModel): Promise<boolean> => {
      const trimmedName = updated.name.trim();
      if (!trimmedName) {
        showToast("Model name cannot be empty");
        return false;
      }
      const currentList = modelsRef.current;
      const oldModel = currentList[index];
      if (
        currentList.some((m, i) => i !== index && m.name === trimmedName)
      ) {
        showToast("A model with this name already exists");
        return false;
      }
      const item: AIModel = { name: trimmedName, provider: updated.provider };
      const next = [...currentList];
      next[index] = item;
      modelsRef.current = next;
      setModels(next);
      await saveModels(next);

      if (selectedModelRef.current.name === oldModel.name) {
        selectedModelRef.current = item;
        setSelectedModel(item);
        await saveSelectedModel(item);
      }
      return true;
    },
    [],
  );

  const deleteModel = useCallback(async (index: number) => {
    const currentList = modelsRef.current;
    if (currentList.length <= 1) {
      showToast("Cannot delete the only model");
      return;
    }
    const modelToDelete = currentList[index];
    const next = currentList.filter((_, i) => i !== index);
    modelsRef.current = next;
    setModels(next);
    await saveModels(next);

    if (selectedModelRef.current.name === modelToDelete.name) {
      const fallback = next[0];
      selectedModelRef.current = fallback;
      setSelectedModel(fallback);
      await saveSelectedModel(fallback);
    }
  }, []);

  return {
    messages,
    translations,
    pending,
    ready,
    apiKey,
    models,
    selectedModel,
    updateApiKey,
    selectModel,
    addModel,
    updateModel,
    deleteModel,
    importAndNotify,
    translateReceived,
    deleteReceived,
    translateDraft,
  };
}
