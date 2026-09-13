import { SCRIPT } from "@/constants/script";
import { STYLE } from "@/constants/style";

export default function onOpenScript(): string {
  return `
    ${SCRIPT}

    const chatListHeader = document.querySelector('[data-testid="chatlist-header"]');
    if (chatListHeader) chatListHeader.style.display = "none";

    const drawerLeft = document.querySelector('[data-testid="drawer-left"]');
    if (drawerLeft) drawerLeft.style.border = "none";

    const drawerMiddle = document.querySelector('[data-testid="drawer-middle"]');
    if (drawerMiddle) drawerMiddle.style.border = "none";

    const style = document.createElement("style");
      style.textContent = \`
        ${STYLE}
      \`;
    document.head.appendChild(style);

    true;
  `;
}
