import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Message } from "./types";

const MESSAGES_KEY = "chat:messages:v1";
const TRANSLATIONS_KEY = "chat:translations:v1";

async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const loadMessages = () => load<Message[]>(MESSAGES_KEY, []);
export const saveMessages = (messages: Message[]) =>
  AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

export const loadTranslations = () =>
  load<Record<string, string>>(TRANSLATIONS_KEY, {});
export const saveTranslations = (translations: Record<string, string>) =>
  AsyncStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(translations));
