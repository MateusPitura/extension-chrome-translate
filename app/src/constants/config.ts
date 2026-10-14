import type { Language } from "../types";

export const MAIN_MEMBER_NAME = process.env.EXPO_PUBLIC_MAIN_MEMBER_NAME ?? "";
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "";

export const WORKER_URL =
  "https://messages-translator.mateuspitura.workers.dev/translate";

export const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";

export const TRANSLATE_MODEL = "@cf/google/gemma-4-26b-a4b-it";

export const CHAT_LANGUAGE: Language = "Spanish [Spain]";

export const MY_LANGUAGE: Language = "Portuguese [Brazil]";

export const CONTEXT_SIZE = 10;

export const CLIPBOARD_DELAY_MS = 400;
