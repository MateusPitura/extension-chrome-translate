import { WORKER_URL } from "../constants/config";
import type { AIModel, Language, Message, TranslationProvider } from "../types";

export type { TranslationProvider };

async function translateWithWorker(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
  modelName: string,
  workerApiKey: string,
): Promise<string> {
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

  const response = await fetch(WORKER_URL, payload);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Worker translation error (${response.status}): ${errorText}`,
    );
  }
  const responseJson = await response.json();

  return responseJson.translation;
}

async function translateWithGemini(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
  modelName: string,
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not set. Please insert it in Settings.");
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

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

  const response = await fetch(url, payload);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }
  const responseJson = await response.json();

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
  model: AIModel,
  apiKey: string,
  workerApiKey: string,
): Promise<string> {
  if (model.provider === "gemini") {
    return translateWithGemini(
      messages,
      inputLanguage,
      outputLanguage,
      model.name,
      apiKey,
    );
  } else if (model.provider === "worker") {
    return translateWithWorker(
      messages,
      inputLanguage,
      outputLanguage,
      model.name,
      workerApiKey,
    );
  }

  throw new Error("Unsupported translation provider");
}
