import { TRANSLATE_SVG } from "./constants/svgs/translate";
import { Message } from "./types";
import { addTranslationInput } from "./utils/addTranslationInput";
import { appendTranslation } from "./utils/appendTranslation";
import { getMessages } from "./utils/getMessages";
import { getMessagesElement } from "./utils/getMessagesElement";
import { getSender } from "./utils/getSender";
import { getText } from "./utils/getText";
import { getTranslationFromLocalStorage } from "./utils/localStorage";
import { onClickTranslateMessage } from "./utils/onClickTranslateMessage";

const BUTTON_ELEMENT_CLASS = "my-reader-button";

function main() {
  const messagesElement = getMessagesElement();

  for (const messageElement of messagesElement) {
    if (messageElement.querySelector("." + BUTTON_ELEMENT_CLASS)) {
      continue;
    }

    const button = document.createElement("button");
    button.className = BUTTON_ELEMENT_CLASS;
    button.innerHTML = TRANSLATE_SVG;
    let currentMessage: Message;

    try {
      currentMessage = {
        sender: getSender(messageElement),
        text: getText(messageElement),
        element: messageElement,
      };
    } catch {
      continue;
    }

    button.addEventListener("click", async (event) => {
      event.stopPropagation();

      const messagesFormatted = getMessages();

      const currentMessageIndex = messagesFormatted.findIndex(
        (message) =>
          message.sender.raw === currentMessage.sender.raw &&
          message.text === currentMessage.text,
      );

      button.style.color = "#d1d1d1";
      try {
        await onClickTranslateMessage(
          currentMessage,
          messagesFormatted.slice(
            Math.max(0, currentMessageIndex - 9),
            currentMessageIndex + 1,
          ),
        );
      } finally {
        button.style.color = "";
      }
    });

    messageElement.appendChild(button);
    getTranslationFromLocalStorage(currentMessage).then((translation) => {
      if (translation) {
        appendTranslation(currentMessage, translation);
      }
    });
  }

  addTranslationInput();
}

const observer = new MutationObserver(() => {
  main();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

main();
