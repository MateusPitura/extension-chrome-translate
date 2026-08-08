import { Message } from "@src/types";

export async function translateMessage(
  messages: Message[],
): Promise<string> {
  console.log(
    "🌠 messages: ",
    messages.map((message) => message.text),
  );
  const response = await fetch(
    "https://messages-translator.mateuspitura.workers.dev/translate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "@cf/openai/gpt-oss-120b",
        inputLanguage: "Spanish [Spain]",
        outputLanguage: "Portuguese [Brazil]",
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
