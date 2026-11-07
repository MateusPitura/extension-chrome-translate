import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  CHAT_LANGUAGE,
  CLIPBOARD_DELAY_MS,
  CONTEXT_SIZE,
  DEFAULT_MODELS,
  DEFAULT_TRANSCRIBE_MODELS,
  MAIN_MEMBER_NAME,
  MY_LANGUAGE,
} from "../constants/config";
import type { AIModel, Message, ModelPurpose } from "../types";
import {
  getErrorText,
  hash,
  isMine,
  showToast,
  translationKey,
} from "../utils";
import { parseWhatsAppChat } from "../utils/parser";
import {
  loadApiKey,
  loadWorkerApiKey,
  loadMessages,
  loadModels,
  loadSelectedModel,
  loadSelectedTranscribeModel,
  loadTranslations,
  loadTranscribeModels,
  saveApiKey,
  saveWorkerApiKey,
  saveMessages,
  saveModels,
  saveSelectedModel,
  saveSelectedTranscribeModel,
  saveTranslations,
  saveTranscribeModels,
} from "../utils/storage";
import { transcribe } from "../utils/transcribe";
import { translateMessage } from "../utils/translate";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [workerApiKey, setWorkerApiKey] = useState("");
  const [models, setModels] = useState<AIModel[]>(DEFAULT_MODELS);
  const [transcribeModels, setTranscribeModels] = useState<AIModel[]>(DEFAULT_TRANSCRIBE_MODELS);
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    DEFAULT_MODELS[0],
  );
  const [selectedTranscribeModel, setSelectedTranscribeModel] = useState<AIModel>(DEFAULT_TRANSCRIBE_MODELS[0]);

  // Refs hold the latest values for async callbacks and the AppState listener.
  const messagesRef = useRef<Message[]>([]);
  const translationsRef = useRef<Record<string, string>>({});
  const apiKeyRef = useRef<string>("");
  const workerApiKeyRef = useRef<string>("");
  const modelsRef = useRef<AIModel[]>(DEFAULT_MODELS);
  const transcribeModelsRef = useRef<AIModel[]>(DEFAULT_TRANSCRIBE_MODELS);
  const selectedModelRef = useRef<AIModel>(DEFAULT_MODELS[0]);
  const selectedTranscribeModelRef = useRef<AIModel>(DEFAULT_TRANSCRIBE_MODELS[0]);

  // 1. Load saved history, cached translations, apiKey, and models.
  useEffect(() => {
    (async () => {
      const [
        savedMessages,
        savedTranslations,
        savedApiKey,
        savedWorkerApiKey,
        savedModels,
        savedSelectedModel,
        savedTranscribeModels,
        savedSelectedTranscribeModel,
      ] = await Promise.all([
        loadMessages(),
        loadTranslations(),
        loadApiKey(),
        loadWorkerApiKey(),
        loadModels(),
        loadSelectedModel(),
        loadTranscribeModels(),
        loadSelectedTranscribeModel(),
      ]);
      messagesRef.current = savedMessages;
      translationsRef.current = savedTranslations;
      apiKeyRef.current = savedApiKey;
      workerApiKeyRef.current = savedWorkerApiKey;
      modelsRef.current = savedModels;
      transcribeModelsRef.current = savedTranscribeModels;

      const activeModel =
        savedModels.find((m) => m.name === savedSelectedModel.name && m.provider === savedSelectedModel.provider) ??
        savedModels[0] ??
        DEFAULT_MODELS[0];

      selectedModelRef.current = activeModel;
      const activeTranscribeModel = savedTranscribeModels.find((m) => m.name === savedSelectedTranscribeModel.name && m.provider === savedSelectedTranscribeModel.provider) ?? savedTranscribeModels[0] ?? DEFAULT_TRANSCRIBE_MODELS[0];
      selectedTranscribeModelRef.current = activeTranscribeModel;

      setMessages(savedMessages);
      setTranslations(savedTranslations);
      setApiKey(savedApiKey);
      setWorkerApiKey(savedWorkerApiKey);
      setModels(savedModels);
      setTranscribeModels(savedTranscribeModels);
      setSelectedModel(activeModel);
      setSelectedTranscribeModel(activeTranscribeModel);
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

  const pasteClipboardMessage = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (!text.trim()) {
        showToast("Clipboard is empty");
        return;
      }

      const timestamp = Date.now();
      const id = `paste:${timestamp}:${hash(text)}`;
      const sender =
        messagesRef.current.find((message) => !isMine(message))?.sender
          .onlyName ?? "WhatsApp";
      const message: Message = {
        id,
        timestamp,
        sender: { onlyName: sender },
        text,
      };
      const next = [...messagesRef.current, message].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      messagesRef.current = next;
      setMessages(next);
      await saveMessages(next);
    } catch (error) {
      showToast(getErrorText(error));
    }
  }, []);

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
          workerApiKeyRef.current,
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

  const transcribeReceived = useCallback(async (id: string) => {
    const target = messagesRef.current.find((message) => message.id === id);
    if (!target?.audioUri) return;
    setPending((current) => ({ ...current, [id]: true }));
    try {
      const transcript = await transcribe(
        target.audioUri,
        selectedTranscribeModelRef.current,
        apiKeyRef.current,
        workerApiKeyRef.current,
      );
      const next = messagesRef.current.map((message) =>
        message.id === id
          ? { ...message, text: transcript, audioTranscript: transcript }
          : message,
      );
      messagesRef.current = next;
      setMessages(next);
      await saveMessages(next);
    } catch (error) {
      showToast(getErrorText(error));
    } finally {
      setPending((current) => ({ ...current, [id]: false }));
    }
  }, []);

  const addSharedAudio = useCallback(
    async (uri: string, fileName: string) => {
      const id = `audio:${fileName}`;
      if (messagesRef.current.some((message) => message.id === id)) return;

      const now = new Date();
      const filenameDate = fileName.match(/^PTT-(\d{4})(\d{2})(\d{2})-WA\d+\.opus$/i);
      let timestamp = now.getTime();
      if (filenameDate) {
        const [, year, month, day] = filenameDate;
        const messageDate = new Date(now);
        messageDate.setFullYear(Number(year), Number(month) - 1, Number(day));
        if (
          messageDate.getFullYear() === Number(year) &&
          messageDate.getMonth() === Number(month) - 1 &&
          messageDate.getDate() === Number(day)
        ) {
          timestamp = messageDate.getTime();
        }
      }
      const otherSender =
        messagesRef.current.find((message) => !isMine(message))?.sender
          .onlyName ?? "WhatsApp";
      const message: Message = {
        id,
        timestamp,
        sender: { onlyName: otherSender },
        text: `Audio message (${fileName})`,
        audioUri: uri,
      };
      const next = [...messagesRef.current, message].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      messagesRef.current = next;
      setMessages(next);
      await saveMessages(next);
      await transcribeReceived(id);
    },
    [transcribeReceived],
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
        workerApiKeyRef.current,
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

  const updateWorkerApiKey = useCallback(async (key: string) => {
    workerApiKeyRef.current = key;
    setWorkerApiKey(key);
    await saveWorkerApiKey(key);
  }, []);

  const selectModel = useCallback(async (purpose: ModelPurpose, model: AIModel) => {
    if (purpose === "translate") {
      selectedModelRef.current = model;
      setSelectedModel(model);
      await saveSelectedModel(model);
    } else {
      selectedTranscribeModelRef.current = model;
      setSelectedTranscribeModel(model);
      await saveSelectedTranscribeModel(model);
    }
  }, []);

  const addModel = useCallback(async (purpose: ModelPurpose, newModel: AIModel): Promise<boolean> => {
    const trimmedName = newModel.name.trim();
    if (!trimmedName) {
      showToast("Model name cannot be empty");
      return false;
    }
    const currentList = purpose === "translate" ? modelsRef.current : transcribeModelsRef.current;
    if (currentList.some((m) => m.name === trimmedName)) {
      showToast("A model with this name already exists");
      return false;
    }
    const item: AIModel = { name: trimmedName, provider: newModel.provider };
    const next = [...currentList, item];
    if (purpose === "translate") {
      modelsRef.current = next; setModels(next); await saveModels(next);
    } else {
      transcribeModelsRef.current = next; setTranscribeModels(next); await saveTranscribeModels(next);
    }
    return true;
  }, []);

  const updateModel = useCallback(
    async (purpose: ModelPurpose, index: number, updated: AIModel): Promise<boolean> => {
      const trimmedName = updated.name.trim();
      if (!trimmedName) {
        showToast("Model name cannot be empty");
        return false;
      }
      const currentList = purpose === "translate" ? modelsRef.current : transcribeModelsRef.current;
      const oldModel = currentList[index];
      if (currentList.some((m, i) => i !== index && m.name === trimmedName)) {
        showToast("A model with this name already exists");
        return false;
      }
      const item: AIModel = { name: trimmedName, provider: updated.provider };
      const next = [...currentList];
      next[index] = item;
      if (purpose === "translate") {
        modelsRef.current = next; setModels(next); await saveModels(next);
        if (selectedModelRef.current.name === oldModel.name && selectedModelRef.current.provider === oldModel.provider) {
          selectedModelRef.current = item; setSelectedModel(item); await saveSelectedModel(item);
        }
      } else {
        transcribeModelsRef.current = next; setTranscribeModels(next); await saveTranscribeModels(next);
        if (selectedTranscribeModelRef.current.name === oldModel.name && selectedTranscribeModelRef.current.provider === oldModel.provider) {
          selectedTranscribeModelRef.current = item; setSelectedTranscribeModel(item); await saveSelectedTranscribeModel(item);
        }
      }
      return true;
    },
    [],
  );

  const deleteModel = useCallback(async (purpose: ModelPurpose, index: number) => {
    const currentList = purpose === "translate" ? modelsRef.current : transcribeModelsRef.current;
    if (currentList.length <= 1) {
      showToast("Cannot delete the only model");
      return;
    }
    const modelToDelete = currentList[index];
    const next = currentList.filter((_, i) => i !== index);
    if (purpose === "translate") {
      modelsRef.current = next; setModels(next); await saveModels(next);
      if (selectedModelRef.current.name === modelToDelete.name && selectedModelRef.current.provider === modelToDelete.provider) {
        const fallback = next[0]; selectedModelRef.current = fallback; setSelectedModel(fallback); await saveSelectedModel(fallback);
      }
    } else {
      transcribeModelsRef.current = next; setTranscribeModels(next); await saveTranscribeModels(next);
      if (selectedTranscribeModelRef.current.name === modelToDelete.name && selectedTranscribeModelRef.current.provider === modelToDelete.provider) {
        const fallback = next[0]; selectedTranscribeModelRef.current = fallback; setSelectedTranscribeModel(fallback); await saveSelectedTranscribeModel(fallback);
      }
    }
  }, []);

  return {
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
    importAndNotify,
    pasteClipboardMessage,
    translateReceived,
    transcribeReceived,
    addSharedAudio,
    deleteReceived,
    translateDraft,
  };
}
