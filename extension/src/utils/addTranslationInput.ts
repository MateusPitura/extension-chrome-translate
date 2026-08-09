import { Language } from "@src/types";
import { getMessages } from "./getMessages";
import { setWhatsAppInput } from "./setWhatsAppInput";
import { translateMessage } from "./translateMessage";

const INPUT_CONTAINER_ELEMENT_CLASS = "my-reader-controls";

export async function addTranslationInput() {
  const messageElement = document.querySelector(
    '[data-testid="compose-box"]',
  ) as HTMLElement | null;

  if (
    !messageElement ||
    messageElement.querySelector(`.${INPUT_CONTAINER_ELEMENT_CLASS}`)
  ) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = INPUT_CONTAINER_ELEMENT_CLASS;

  const input = document.createElement("input");
  input.className = "my-reader-input";
  input.placeholder = "Translation...";

  const button = document.createElement("button");
  button.className = "my-reader-translate";
  button.textContent = "Translate";

  button.addEventListener("click", async (event) => {
    event.stopPropagation();

    const originalText = input.value.trim();

    if (!originalText) {
      return;
    }

    button.disabled = true;
    button.textContent = "Translating...";

    const messagesFormatted = getMessages();
    const lastMessages = messagesFormatted.slice(
      Math.max(0, messagesFormatted.length - 9),
      messagesFormatted.length,
    );

    try {
      const translatedText = await translateMessage(
        [
          ...lastMessages,
          {
            element: messageElement,
            text: originalText,
            sender: {
              raw: import.meta.env.VITE_SENDER,
              onlyName: import.meta.env.VITE_SENDER,
            },
          },
        ],
        Language.PT,
        Language.ES,
      );

      setWhatsAppInput(translatedText);
    } finally {
      button.disabled = false;
      button.textContent = "Translate";
    }
  });

  controls.append(input, button);

  messageElement.prepend(controls);
}
