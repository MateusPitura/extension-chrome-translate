import type { AIModel, Language } from "../types";

export const MAIN_MEMBER_NAME = process.env.EXPO_PUBLIC_MAIN_MEMBER_NAME ?? "";

export const WORKER_URL =
  "https://messages-translator.mateuspitura.workers.dev/translate";

export const DEFAULT_MODELS: AIModel[] = [
  { name: "@cf/google/gemma-4-26b-a4b-it", provider: "worker" },
  { name: "gemini-3.5-flash-lite", provider: "gemini" },
];


export const CHAT_LANGUAGE: Language = "Spanish [Spain]";

export const MY_LANGUAGE: Language = "Portuguese [Brazil]";

export const CONTEXT_SIZE = 10;

export const CLIPBOARD_DELAY_MS = 400;
