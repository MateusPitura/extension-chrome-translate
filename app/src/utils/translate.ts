import {
  GEMINI_API_KEY,
  GEMINI_API_URL,
  TRANSLATE_MODEL,
  WORKER_URL,
} from "../constants/config";
import { Language, Message } from "../types";

export type TranslationProvider = "gemini" | "worker";

async function translateWithWorker(
  messages: Message[],
  inputLanguage: Language,
  outputLanguage: Language,
): Promise<string> {
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: TRANSLATE_MODEL,
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
): Promise<string> {
  if (!GEMINI_API_KEY) {
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

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
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
  const response = await fetch(GEMINI_API_URL, payload);
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
  provider: TranslationProvider = "gemini",
): Promise<string> {
  switch (provider) {
    case "gemini":
      return translateWithGemini(messages, inputLanguage, outputLanguage);
    case "worker":
      return translateWithWorker(messages, inputLanguage, outputLanguage);
    default: {
      throw new Error(`Unsupported translation provider: ${provider}`);
    }
  }
}
