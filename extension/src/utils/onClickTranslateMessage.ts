import { getContent } from "./getContent";
import { getSender } from "./getSender";
import { translateMessage } from "./translateMessage";

const TRANSLATION_ELEMENT_CLASS = "my-reader-translation";

export async function onClickTranslateMessage(messageElement: HTMLElement) {
  let translationElement = messageElement.querySelector(
    `.${TRANSLATION_ELEMENT_CLASS}`,
  ) as HTMLElement | null;

  if (translationElement) return;

  const sender = getSender(messageElement);
  const message = getContent(messageElement);

  const translatedMessage = await translateMessage(sender, message);

  translationElement = document.createElement("div");

  translationElement.className = TRANSLATION_ELEMENT_CLASS;
  translationElement.textContent = translatedMessage;

  messageElement.appendChild(translationElement);
}
