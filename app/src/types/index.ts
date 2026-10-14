export type Language = "Spanish [Spain]" | "Portuguese [Brazil]";

export type TranslationProvider = "gemini" | "worker";

export interface AIModel {
  name: string;
  provider: TranslationProvider;
}

export interface Message {
  id: string;
  timestamp: number;
  sender: { onlyName: string };
  text: string;
}

