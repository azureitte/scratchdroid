import { useCallback, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";
import { Slot, Stack } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
    QueryClient,
    QueryClientProvider,
    focusManager,
    onlineManager,
} from "@tanstack/react-query";
import { DevToolsBubble } from "react-native-react-query-devtools";
import NetInfo from "@react-native-community/netinfo";

import { SessionProvider } from "../context/SessionContext";
import Header from "../components/app/Header";

const queryClient = new QueryClient();

const onCopy = async (text: string) => {
    try {
        await Clipboard.setStringAsync(text);
        return true;
    } catch {
        return false;
    }
};

onlineManager.setEventListener((setOnline) => {
    return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
    });
});

export default function RootLayout() {
    const onAppStateChange = useCallback((status: AppStateStatus) => {
        focusManager.setFocused(status === "active");
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener(
            "change",
            onAppStateChange,
        );
        return () => subscription.remove();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider>
                <Stack
                    screenOptions={{
                        header: (props) => <></>,
                    }}
                >
                    <Slot />
                </Stack>

                <Header />
            </SessionProvider>
            <DevToolsBubble
                queryClient={queryClient}
                onCopy={onCopy}
                bubbleStyle={{
                    opacity: 0.5,
                    transform: [{ translateY: -50 }, { translateX: -10 }],
                }}
            />
        </QueryClientProvider>
    );
}
