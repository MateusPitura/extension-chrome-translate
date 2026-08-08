const SENDER_REGEX = /^\[[^\]]+\]\s*(.*?):\s*$/;

export function getSender(messageElement: HTMLElement): string {
  const copyableText = messageElement.querySelector(
    ".copyable-text[data-pre-plain-text]",
  );

  const prePlainText = copyableText?.getAttribute("data-pre-plain-text");

  if (!prePlainText) {
    throw new Error("Cannot get sender");
  }

  const match = prePlainText.match(SENDER_REGEX)?.[1];

  if (!match) {
    throw new Error("Cannot get sender");
  }

  return match;
}
