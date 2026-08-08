export async function translateMessage(sender: string, message: string) {
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
        messages: [
          {
            sender,
            text: message,
          },
        ],
      }),
    },
  );
  const responseJson = await response.json();
  return responseJson.translation;
}
