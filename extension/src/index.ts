import { handleClickMessage } from "./utils/onClickMessage";

function addButtons() {
  const messages = document.querySelectorAll('[data-testid="msg-container"]');

  for (const message of messages) {
    if (message.querySelector(".my-reader-button")) {
      continue;
    }

    const button = document.createElement("button");

    button.className = "my-reader-button";
    button.textContent = "📖";

    button.addEventListener("click", (event) =>
      handleClickMessage(event, message as HTMLElement),
    );

    message.appendChild(button);
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
