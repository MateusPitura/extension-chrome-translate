import { Message } from "./types";
import { appendTranslation } from "./utils/appendTranslation";
import { getMessagesElement } from "./utils/getMessagesElement";
import { getSender } from "./utils/getSender";
import { getText } from "./utils/getText";
import { getTranslationFromLocalStorage } from "./utils/localStorage";
import { onClickTranslateMessage } from "./utils/onClickTranslateMessage";

const BUTTON_ELEMENT_CLASS = "my-reader-button";

function main() {
  const messagesElement = getMessagesElement();

  for (const messageElement of messagesElement) {
    if (messageElement.querySelector(`.${BUTTON_ELEMENT_CLASS}`)) {
      continue;
    }

    const button = document.createElement("button");
    button.className = BUTTON_ELEMENT_CLASS;
    button.textContent = "📖";
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

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const messagesElementAux = getMessagesElement();

      const messagesFormatted: Message[] = [];
      for (const messageElementAux of messagesElementAux) {
        try {
          messagesFormatted.push({
            sender: getSender(messageElementAux),
            text: getText(messageElementAux),
            element: messageElementAux,
          });
        } catch {
          continue;
        }
      }

      const currentMessageIndex = messagesFormatted.findIndex(
        (message) =>
          message.sender.raw === currentMessage.sender.raw &&
          message.text === currentMessage.text,
      );

      onClickTranslateMessage(
        currentMessage,
        messagesFormatted.slice(
          Math.max(0, currentMessageIndex - 9),
          currentMessageIndex + 1,
        ),
      );
    });

    messageElement.appendChild(button);
    getTranslationFromLocalStorage(currentMessage).then((translation) => {
      if (translation) {
        appendTranslation(currentMessage, translation);
      }
    });
  }
}

const observer = new MutationObserver(() => {
  main();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

main();
