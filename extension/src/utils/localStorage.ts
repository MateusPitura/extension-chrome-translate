import { Message } from "@src/types";
import { createHash } from "./createHash";

const LOCAL_STORAGE_KEY = "translations";

async function createMessageHash(message: Message): Promise<string> {
  return await createHash(message.sender.raw + '#' + message.text);
}

export async function saveTranslationToLocalStorage(
  message: Message,
  translation: string,
) {
  const translations = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
  );
  const messageHash = await createMessageHash(message);
  translations[messageHash] = translation;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(translations));
}

export async function getTranslationFromLocalStorage(message: Message) {
  const translations = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "{}",
  );
  const messageHash = await createMessageHash(message);
  return translations[messageHash] || null;
}
