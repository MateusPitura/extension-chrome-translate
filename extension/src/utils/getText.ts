export function getText(messageElement: HTMLElement): string {
  const selectableTexts = [
    ...messageElement.querySelectorAll('[data-testid="selectable-text"]'),
  ].filter(
    (element) => !element.closest('[data-testid="quoted-message"]'),
  ) as HTMLElement[];

  return selectableTexts.map((element) => element.innerText).join("\n");
}
