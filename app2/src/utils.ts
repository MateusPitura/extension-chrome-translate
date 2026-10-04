import type { Language } from "./types";

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

/** Case- and accent-insensitive form of a name, for comparisons. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** Key used to cache a translation. `scope` is `msg:<id>` or `draft:<hash>`. */
export function translationKey(
  scope: string,
  inputLanguage: Language,
  outputLanguage: Language,
): string {
  return `${scope}|${inputLanguage}>${outputLanguage}`;
}

export const dayKey = (ts: number) => new Date(ts).toDateString();

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDay = (ts: number) => {
  const date = new Date(ts);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};
