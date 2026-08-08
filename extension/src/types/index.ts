export interface Message {
  sender: Sender;
  text: string;
  element: HTMLElement
}

export interface Sender {
  raw: string;
  onlyName: string;
}