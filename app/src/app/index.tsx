import { useRef } from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { onMessage } from "./onMessage";
import onOpenScript from "./onOpenScript";

const chromeUserAgent =
  "Mozilla/5.0 (X11; Linux x86_64) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/140.0.0.0 Safari/537.36";

export default function Index() {
  const webViewRef = useRef<WebView>(null);

  async function handleOnMessage(event: any) {
    await onMessage(event, webViewRef);
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar barStyle="dark-content" />
      <WebView
        ref={webViewRef}
        source={{ uri: "https://web.whatsapp.com/" }}
        style={{ flex: 1 }}
        userAgent={chromeUserAgent}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        injectedJavaScript={onOpenScript()}
        onMessage={handleOnMessage}
      />
    </SafeAreaView>
  );
}
