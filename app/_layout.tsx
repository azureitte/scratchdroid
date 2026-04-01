import { useCallback, useEffect } from "react";
import { AppState, AppStateStatus, View } from "react-native";
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
import { enableFreeze } from 'react-native-screens';

enableFreeze(true);

import { IS_DEV } from "@/util/constants";
import { SessionProvider } from "@/context/SessionContext";
import { AppProvider } from "@/context/AppContext";

import Header from "@/components/app/Header";
import TabBar from "@/components/app/TabBar";
import Drawer from "@/components/app/Drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
            <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>

                <TabBar />
                <Drawer />
                <Header />
                
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            backgroundColor: '#121212',
                        },
                        animation: 'fade_from_bottom',
                        animationDuration: 300,
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="projects/[id]" />
                    <Stack.Screen name="users/[username]/index" />
                    <Stack.Screen name="account/login" />
                </Stack>
            </GestureHandlerRootView>
            </AppProvider>
            </SessionProvider>
            { IS_DEV && <DevToolsBubble
                queryClient={queryClient}
                onCopy={onCopy}
                bubbleStyle={{
                    opacity: 0.5,
                    transform: [{ translateY: -50 }, { translateX: -10 }],
                }}
            /> }
        </QueryClientProvider>
    );
}
