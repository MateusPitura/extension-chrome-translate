export function getMessagesElement(): HTMLElement[] {
  return document.querySelectorAll(
    '[data-testid="msg-container"]',
  ) as unknown as HTMLElement[];
}
