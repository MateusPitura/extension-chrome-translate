export function getText(messageElement: HTMLElement): string {
  const selectableTexts = [
    ...messageElement.querySelectorAll(".selectable-text"),
  ].filter(
    (element) => !element.closest('[data-testid="quoted-message"]'),
  ) as HTMLElement[];

  return selectableTexts[0].innerText;
}
