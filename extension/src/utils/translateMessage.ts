import { AIModel, Language, Message, TranslationProvider } from "@src/types";
import { getSelectedModel } from "./modelStorage";

export type { TranslationProvider };

const WORKER_URL =
  "https://messages-translator.mateuspitura.workers.dev/translate";

async function translateWithWorker(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
  modelName: string,
): Promise<string> {
  const workerApiKey = import.meta.env.VITE_WORKER_API_KEY;
  if (!workerApiKey) {
    throw new Error("VITE_WORKER_API_KEY is not set");
  }

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Worker-Api-Key": workerApiKey,
    },
    body: JSON.stringify({
      model: modelName,
      inputLanguage,
      outputLanguage,
      messages: messages.map((message) => ({
        sender: message.sender.onlyName,
        text: message.text,
      })),
    }),
  };

  let responseJson;
  const response = await fetch(WORKER_URL, payload);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Worker translation error (${response.status}): ${errorText}`,
    );
  }
  responseJson = await response.json();

  return responseJson.translation;
}

async function translateWithGemini(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
  modelName: string,
): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not set");
  }

  const conversation = messages
    .map((message) => `${message.sender.onlyName}: ${message.text}`)
    .join("\n");

  const prompt = `
Translate the LAST message in the conversation.

Source language: ${inputLanguage}
Target language: ${outputLanguage}

Conversation context:
${conversation}

Instructions:
- Translate only the LAST message.
- Return the COMPLETE translation of the LAST message. Never truncate, shorten, summarize, or omit any part of it.
- Use the previous messages only as context to understand the LAST message.
- Translate messages even when they contain errors, typos, or grammatical mistakes.
- Preserve the original meaning, tone, and level of detail.
- Keep slang and informal language natural.
- Do not translate people's names.
- Do not add explanations, comments, or quotation marks.
- Return only the translated text.
`.trim();

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  };

  let responseJson;
  const response = await fetch(geminiUrl, payload);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }
  responseJson = await response.json();

  const candidateText =
    responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (candidateText === undefined || candidateText === null) {
    throw new Error("No translation returned from Gemini API");
  }

  return candidateText.trim();
}

export async function translateMessage(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
  model?: AIModel,
): Promise<string> {
  const activeModel = model ?? (await getSelectedModel());

  switch (activeModel.provider) {
    case "gemini":
      return translateWithGemini(
        messages,
        inputLanguage,
        outputLanguage,
        activeModel.name,
      );
    case "worker":
      return translateWithWorker(
        messages,
        inputLanguage,
        outputLanguage,
        activeModel.name,
      );
    default: {
      throw new Error("Unsupported translation provider");
    }
  }
}
