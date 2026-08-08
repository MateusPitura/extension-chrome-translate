function addButtons() {
  const messages = document.querySelectorAll(
    '[data-testid="msg-container"]'
  );

  for (const message of messages) {
    if (message.querySelector(".my-reader-button")) {
      continue;
    }

    const button = document.createElement("button");

    button.className = "my-reader-button";
    button.textContent = "📖";

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const copyableText = message.querySelector(
        ".copyable-text[data-pre-plain-text]"
      );

      const selectableTexts = [
        ...message.querySelectorAll('[data-testid="selectable-text"]')
      ].filter(
        (element) => !element.closest('[data-testid="quoted-message"]')
      );

      const prePlainText = copyableText?.getAttribute("data-pre-plain-text");

      let sender = null;

      if (prePlainText) {
        const match = prePlainText.match(
          /^\[[^\]]+\]\s*(.*?):\s*$/
        );

        sender = match?.[1] ?? null;
      }

      const content = selectableTexts
        .map((element) => element.innerText)
        .join("\n");

      console.log({
        sender,
        content
      });

      let translation = message.querySelector(".my-reader-translation");

      if (!translation) {
        translation = document.createElement("div");

        translation.className = "my-reader-translation";
        translation.textContent =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

        Object.assign(translation.style, {
          padding: "6px 8px",
          marginTop: "4px",
          background: "#f0f0f0",
          borderRadius: "6px",
          fontSize: "13px",
          color: "#333"
        });

        const lastSelectableText = selectableTexts.at(-1);

        if (lastSelectableText) {
          lastSelectableText.parentElement?.appendChild(translation);
        } else {
          message.appendChild(translation);
        }
      } else {
        translation.style.display =
          translation.style.display === "none" ? "block" : "none";
      }
    });

    message.appendChild(button);
  }
}

const observer = new MutationObserver(() => {
  addButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

addButtons();