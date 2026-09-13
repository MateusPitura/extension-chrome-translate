import { RefObject } from "react";
import WebView from "react-native-webview";

export async function onMessage(
  event: any,
  webViewRef: RefObject<WebView | null>,
) {
  let msg;
  try {
    msg = JSON.parse(event.nativeEvent.data);
  } catch {
    return;
  }

  if (msg.type !== "bridge-fetch") return;

  const { id, url, options } = msg;

  try {
    const response = await fetch(url, {
      method: options.method ?? "GET",
      headers: options.headers ?? {},
      body: options.body !== undefined ? options.body : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    webViewRef.current?.injectJavaScript(`
        window.__resolveBridgeFetch(${JSON.stringify(id)}, ${JSON.stringify({
          ok: true,
          data,
        })});
        true;
      `);
  } catch (e) {
    if (e instanceof Error) {
      console.log("Bridge fetch error:", e.message);
    } else {
      console.log("Bridge fetch error");
    }

    webViewRef.current?.injectJavaScript(`
        window.__resolveBridgeFetch(${JSON.stringify(id)}, ${JSON.stringify({
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        })});
        true;
      `);
  }
}
