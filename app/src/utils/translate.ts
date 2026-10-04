import { TRANSLATE_MODEL, TRANSLATE_URL } from "../constants/config";
import type { Language, Message } from "../types";

/**
 * Translates the LAST message of `messages`; the previous ones are sent as conversation context.
 */
export async function translateMessage(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
): Promise<string> {
  const common = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TRANSLATE_MODEL,
      inputLanguage,
      outputLanguage,
      messages: messages.map((message) => ({
        sender: message.sender.onlyName,
        text: message.text,
      })),
    }),
  };

  const response = await fetch(TRANSLATE_URL, common);
  if (!response.ok) {
    throw new Error(`Translation failed (HTTP ${response.status})`);
  }

  const data = (await response.json()) as { translation?: string };
  if (!data.translation) throw new Error("Translation came back empty");
  return data.translation;
}
