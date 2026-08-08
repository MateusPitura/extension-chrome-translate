export interface Message {
  sender: Sender;
  text: string;
  element: HTMLElement;
}

export interface Sender {
  raw: string;
  onlyName: string;
}

export enum Language {
  ES = "Spanish [Spain]",
  PT = "Portuguese [Brazil]",
}
