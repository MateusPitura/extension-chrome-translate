import type { Language } from "./types";

/**
 * Name of the main member (you), exactly as it appears in WhatsApp.
 * Set it in `.env` as EXPO_PUBLIC_MAIN_MEMBER_NAME (restart Metro with `npx expo start -c` after changing it).
 */
export const MAIN_MEMBER_NAME = process.env.EXPO_PUBLIC_MAIN_MEMBER_NAME ?? "";

export const TRANSLATE_URL =
  "https://messages-translator.mateuspitura.workers.dev/translate";
export const TRANSLATE_MODEL = "@cf/google/gemma-4-26b-a4b-it";

/** Language of the chat (what is copied from WhatsApp). */
export const CHAT_LANGUAGE: Language = "Spanish [Spain]";
/** Language you read and write in. */
export const MY_LANGUAGE: Language = "Portuguese [Brazil]";

/** How many messages (including the one being translated) are sent as context. */
export const CONTEXT_SIZE = 10;

/** Delay before reading the clipboard: Android 10+ only allows it once the app has focus. */
export const CLIPBOARD_DELAY_MS = 400;
