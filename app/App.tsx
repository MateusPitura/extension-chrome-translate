import {
  SafeAreaProvider
} from "react-native-safe-area-context";
import Chat from "./src/components/Chat";

export default function App() {
  return (
    <SafeAreaProvider>
      <Chat />
    </SafeAreaProvider>
  );
}
