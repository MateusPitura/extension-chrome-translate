export function setWhatsAppInput(text: string) {
  const input = document.querySelector(
    '[data-testid="conversation-compose-box-input"]',
  ) as HTMLElement | null;

  if (!input) {
    console.error("WhatsApp input not found");
    return;
  }

  input.focus();

  const selection = window.getSelection();

  if (!selection) {
    console.error("No selection available");
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(input);
  selection.removeAllRanges();
  selection.addRange(range);

  input.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      inputType: "insertText",
      data: text,
    }),
  );
}
