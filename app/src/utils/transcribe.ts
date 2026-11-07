import * as FileSystem from "expo-file-system/legacy";
import { TRANSCRIBE_WORKER_URL } from "../constants/config";
import type { AIModel, GeminiTranscriptionResponse } from "../types";

export async function transcribe(
  uri: string,
  model: AIModel,
  apiKey: string,
  workerApiKey: string,
): Promise<string> {
  const extension = uri.toLowerCase().split("?")[0].split(".").pop();
  if (extension !== "oga" && extension !== "opus") {
    throw new Error("Expected an .oga or .opus audio file.");
  }
  const audioBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (model.provider === "worker") {
    const response = await fetch(TRANSCRIBE_WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Worker-Api-Key": workerApiKey,
      },
      body: JSON.stringify({ model: model.name, audioBase64, fileName: uri.split("/").pop()?.split("?")[0] ?? "audio.oga" }),
    });
    if (!response.ok) throw new Error(`Worker transcription error (${response.status}): ${await response.text()}`);
    const result = (await response.json()) as { transcription?: string };
    const text = result.transcription?.trim();
    if (!text) throw new Error("Worker returned no transcription.");
    return text;
  }
  if (!apiKey) throw new Error("Gemini API key is not set. Please insert it in Settings.");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.name)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: "Transcribe this audio verbatim. Return only the spoken words." },
          { inlineData: { mimeType: "audio/ogg", data: audioBase64 } },
        ] }],
      }),
    },
  );
  if (!response.ok)
    throw new Error(
      `Gemini API error (${response.status}): ${await response.text()}`,
    );
  const result = (await response.json()) as GeminiTranscriptionResponse;
  const text = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Gemini returned no transcription.");
  return text;
}
