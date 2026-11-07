export type Language = "Spanish [Spain]" | "Portuguese [Brazil]";

export type TranslationProvider = "gemini" | "worker";
export type ModelPurpose = "translate" | "transcribe";

export interface AIModel {
  name: string;
  provider: TranslationProvider;
}

export interface Message {
  id: string;
  timestamp: number;
  sender: { onlyName: string };
  text: string;
  audioUri?: string;
  audioTranscript?: string;
}

export interface GeminiTranscriptionResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

export interface ShareIntentFile {
  path: string;
  fileName?: string;
  mimeType?: string;
}

