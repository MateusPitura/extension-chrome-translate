import { Message } from "@src/types";

const TRANSLATION_ELEMENT_CLASS = "my-reader-translation";

export function appendTranslation(message: Message, translatedMessage: string) {
  let translationElement = message.element.querySelector(
    '.' + TRANSLATION_ELEMENT_CLASS,
  ) as HTMLElement | null;

  if (translationElement) {
    translationElement.textContent = translatedMessage;
  } else {
    translationElement = document.createElement("div");
    translationElement.className = TRANSLATION_ELEMENT_CLASS;
    translationElement.textContent = translatedMessage;
    message.element.appendChild(translationElement);
  }
}
