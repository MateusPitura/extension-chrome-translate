import { AIModel } from "@src/types";

export const DEFAULT_MODELS: AIModel[] = [
  { name: "@cf/google/gemma-4-26b-a4b-it", provider: "worker" },
  { name: "gemini-3.5-flash-lite", provider: "gemini" },
];
