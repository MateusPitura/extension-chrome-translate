import { Message } from "@src/types";
import { translateMessage } from "./translateMessage";

const TRANSLATION_ELEMENT_CLASS = "my-reader-translation";

export async function onClickTranslateMessage(
  message: Message,
  messages: Message[],
) {
  let translationElement = message.element.querySelector(
    `.${TRANSLATION_ELEMENT_CLASS}`,
  ) as HTMLElement | null;

  if (translationElement) return;

  const translatedMessage = await translateMessage(messages);

  translationElement = document.createElement("div");

  translationElement.className = TRANSLATION_ELEMENT_CLASS;
  translationElement.textContent = translatedMessage;

  message.element.appendChild(translationElement);
}
