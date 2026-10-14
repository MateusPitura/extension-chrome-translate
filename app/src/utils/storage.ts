import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_MODELS } from "../constants/config";
import type { AIModel, Message } from "../types";

const MESSAGES_KEY = "chat:messages:v1";
const TRANSLATIONS_KEY = "chat:translations:v1";
const API_KEY_STORAGE = "chat:apiKey:v1";
const MODELS_KEY = "chat:models:v1";
const SELECTED_MODEL_KEY = "chat:selectedModel:v1";

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

export async function loadApiKey(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(API_KEY_STORAGE);
    if (!raw) return "";
    try {
      return JSON.parse(raw) as string;
    } catch {
      return raw;
    }
  } catch {
    return "";
  }
}

export function saveApiKey(apiKey: string): Promise<void> {
  return AsyncStorage.setItem(API_KEY_STORAGE, apiKey);
}

export async function loadModels(): Promise<AIModel[]> {
  const models = await load<AIModel[]>(MODELS_KEY, DEFAULT_MODELS);
  return models && models.length > 0 ? models : DEFAULT_MODELS;
}

export function saveModels(models: AIModel[]): Promise<void> {
  return AsyncStorage.setItem(MODELS_KEY, JSON.stringify(models));
}

export function loadSelectedModel(): Promise<AIModel> {
  return load<AIModel>(SELECTED_MODEL_KEY, DEFAULT_MODELS[0]);
}

export function saveSelectedModel(model: AIModel): Promise<void> {
  return AsyncStorage.setItem(SELECTED_MODEL_KEY, JSON.stringify(model));
}
