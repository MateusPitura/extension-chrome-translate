import { Language, Message } from "@src/types";
import { bridgeFetch } from "./bridgeFetch";

const URL = "https://messages-translator.mateuspitura.workers.dev/translate";

export async function translateMessage(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
): Promise<string> {
  const common = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "@cf/google/gemma-4-26b-a4b-it",
      inputLanguage,
      outputLanguage,
      messages: messages.map((message) => ({
        sender: message.sender.onlyName,
        text: message.text,
      })),
    }),
  };

  let responseJson;
  if (import.meta.env.VITE_ENV === "app") {
    responseJson = await bridgeFetch(URL, common);
  } else {
    const response = await fetch(URL, common);
    responseJson = await response.json();
  }

  return responseJson.translation;
}
