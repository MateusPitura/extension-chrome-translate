import { SCRIPT } from "@/constants/script";
import { STYLE } from "@/constants/style";

export default function onOpenScript(): string {
  return `
    ${SCRIPT}

    const style = document.createElement("style");
      style.textContent = \`
        ${STYLE}
      \`;
    document.head.appendChild(style);

    true;
  `;
}
