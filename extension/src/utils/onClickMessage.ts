import { translateMessage } from "./translateMessage";

export async function handleClickMessage(event: Event, message: HTMLElement) {
  event.stopPropagation();

  const copyableText = message.querySelector(
    ".copyable-text[data-pre-plain-text]",
  );

  const selectableTexts = [
    ...message.querySelectorAll('[data-testid="selectable-text"]'),
  ].filter(
    (element) => !element.closest('[data-testid="quoted-message"]'),
  ) as HTMLElement[];

  const prePlainText = copyableText?.getAttribute("data-pre-plain-text");

  let sender = "";

  if (prePlainText) {
    const match = prePlainText.match(/^\[[^\]]+\]\s*(.*?):\s*$/);

    sender = match?.[1] ?? "";
  }

  const content = selectableTexts
    .map((element) => element.innerText)
    .join("\n");

  const translatedContent = await translateMessage(sender, content);

  console.log({
    sender,
    content,
  });

  let translation = message.querySelector(
    ".my-reader-translation",
  ) as HTMLElement | null;

  if (!translation) {
    translation = document.createElement("div");

    translation.className = "my-reader-translation";
    translation.textContent = translatedContent;

    Object.assign(translation.style, {
      padding: "6px 8px",
      marginTop: "4px",
      background: "#f0f0f0",
      borderRadius: "6px",
      fontSize: "13px",
      color: "#333",
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
}
