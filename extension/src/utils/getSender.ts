import { Sender } from "@src/types";

export function getSender(messageElement: HTMLElement): Sender {
  const copyableText = messageElement.querySelector(
    ".copyable-text[data-pre-plain-text]",
  );

  const prePlainText = copyableText?.getAttribute("data-pre-plain-text");

  if (!prePlainText) {
    throw new Error("Cannot get sender, no text");
  }

  const closeBracketIndex = prePlainText.indexOf("]");
  const lastColonIndex = prePlainText.lastIndexOf(":");

  if (
    closeBracketIndex === -1 ||
    lastColonIndex === -1 ||
    lastColonIndex <= closeBracketIndex
  ) {
    throw new Error("Cannot get sender, unexpected format: " + prePlainText);
  }

  const name = prePlainText.slice(closeBracketIndex + 1, lastColonIndex).trim();

  if (!name) {
    throw new Error("Cannot get sender, empty name: " + prePlainText);
  }

  return {
    raw: prePlainText,
    onlyName: name,
  };
}
