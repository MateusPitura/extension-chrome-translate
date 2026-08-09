import { Language, Message } from "@src/types";

export async function translateMessage(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
): Promise<string> {
  const response = await fetch(
    "https://messages-translator.mateuspitura.workers.dev/translate",
    {
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
    },
  );
  const responseJson = await response.json();
  return responseJson.translation;
}
