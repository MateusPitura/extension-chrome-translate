import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Message } from "../types";

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

export function loadMessages() {
  return load<Message[]>(MESSAGES_KEY, []);
}

export function saveMessages(messages: Message[]) {
  return AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function loadTranslations() {
  return load<Record<string, string>>(TRANSLATIONS_KEY, {});
}

export function saveTranslations(translations: Record<string, string>) {
  return AsyncStorage.setItem(TRANSLATIONS_KEY, JSON.stringify(translations));
}
