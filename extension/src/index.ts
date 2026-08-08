import { onClickTranslateMessage } from "./utils/onClickTranslateMessage";

const BUTTON_ELEMENT_CLASS = "my-reader-button";

function addButtons() {
  const messagesElements = document.querySelectorAll(
    '[data-testid="msg-container"]',
  );

  for (const messageElement of messagesElements) {
    if (messageElement.querySelector(`.${BUTTON_ELEMENT_CLASS}`)) {
      continue;
    }

    const button = document.createElement("button");

    button.className = BUTTON_ELEMENT_CLASS;
    button.textContent = "📖";

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onClickTranslateMessage(messageElement as HTMLElement);
    });

    messageElement.appendChild(button);
  }
}

const observer = new MutationObserver(() => {
  addButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

addButtons();
