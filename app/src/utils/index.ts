import { ToastAndroid } from "react-native";
import { MAIN_MEMBER_NAME } from "../constants/config";
import type { Language } from "../types";
import { Message } from "../types";

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isMine(message: Message) {
  const mainName = normalizeName(MAIN_MEMBER_NAME);

  return normalizeName(message.sender.onlyName) === mainName;
}

/** Small, fast, non-cryptographic string hash (two djb2 variants, ~64 bits). */
export function hash(input: string): string {
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = (h1 * 33) ^ c;
    h2 = (h2 * 33) ^ c;
  }
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

/** Key used to cache a translation. `scope` is `msg:<id>` or `draft:<hash>`. */
export function translationKey(
  scope: string,
  inputLanguage: Language,
  outputLanguage: Language,
): string {
  return `${scope}|${inputLanguage}>${outputLanguage}`;
}

export function dayKey(ts: number) {
  return new Date(ts).toDateString();
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDay(ts: number) {
  const date = new Date(ts);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

export function showToast(text: string) {
  return ToastAndroid.show(text, ToastAndroid.SHORT);
}

export function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}
