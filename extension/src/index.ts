import { Message } from "./types";
import { getSender } from "./utils/getSender";
import { getText } from "./utils/getText";
import { onClickTranslateMessage } from "./utils/onClickTranslateMessage";

const BUTTON_ELEMENT_CLASS = "my-reader-button";

function main() {
  const messagesElement = document.querySelectorAll(
    '[data-testid="msg-container"]',
  );

  for (const messageElementIndex in messagesElement) {
    const messageElement = messagesElement[messageElementIndex] as HTMLElement;
    if (messageElement.querySelector(`.${BUTTON_ELEMENT_CLASS}`)) {
      continue;
    }

    const button = document.createElement("button");
    button.className = BUTTON_ELEMENT_CLASS;
    button.textContent = "📖";

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const messagesElementAux = document.querySelectorAll(
        '[data-testid="msg-container"]',
      );

      const messagesFormatted: Message[] = [];
      for (const messageElementAuxIndex in messagesElementAux) {
        const messageElementAux = messagesElementAux[
          messageElementAuxIndex
        ] as HTMLElement;

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

      const currentMessage = {
        sender: getSender(messageElement),
        text: getText(messageElement),
        element: messageElement,
      };

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
