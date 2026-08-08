import { Language, Message } from "@src/types";
import { appendTranslation } from "./appendTranslation";
import { saveTranslationToLocalStorage } from "./localStorage";
import { translateMessage } from "./translateMessage";

export async function onClickTranslateMessage(
  message: Message,
  messages: Message[],
) {
  const translatedMessage = await translateMessage(
    messages,
    Language.ES,
    Language.PT,
  );

  appendTranslation(message, translatedMessage);

  await saveTranslationToLocalStorage(message, translatedMessage);
}
