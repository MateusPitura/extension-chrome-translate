export type Language = "Spanish [Spain]" | "Portuguese [Brazil]";

export interface Message {
  id: string;
  timestamp: number;
  sender: { onlyName: string };
  text: string;
}
