export type Language = "Spanish [Spain]" | "Portuguese [Brazil]";

export interface Message {
  /** Stable hash of timestamp + sender + text (+ occurrence index). Used for de-duplication. */
  id: string;
  /** Epoch milliseconds. */
  timestamp: number;
  sender: { onlyName: string };
  text: string;
}
