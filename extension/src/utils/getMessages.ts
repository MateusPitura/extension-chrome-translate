import { Message } from "@src/types";
import { getMessagesElement } from "./getMessagesElement";
import { getSender } from "./getSender";
import { getText } from "./getText";

export function getMessages(): Message[] {
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
  return messagesFormatted;
}
