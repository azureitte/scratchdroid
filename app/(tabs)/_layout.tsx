import { useEffect } from 'react';
import { Easing } from 'react-native-reanimated';
import { router, Tabs } from 'expo-router';

import { off, on } from '@/util/eventBus';
import { AppTabKey } from '@/context/AppContext';

const TabsLayout = () => {

    const tabBar = () => <></>;

    const handleTabNavigate = (tab: AppTabKey) => {
        if (router.canDismiss()) router.dismissAll();
        router.replace(`/${tab}`);
    };

    useEffect(() => {
        on('tab-navigate', handleTabNavigate);
        return () => off('tab-navigate', handleTabNavigate);
    }, []);

    return (
        <Tabs tabBar={tabBar} screenOptions={{
            headerShown: false,
            animation: 'shift',
            sceneStyle: {
                backgroundColor: '#121212',
            },
            transitionSpec: {
                animation: 'timing',
                config: {
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                }
            },
        }} backBehavior="none">
            <Tabs.Screen name="home" options={{ title: 'Home', headerShown: false, freezeOnBlur: true }} />
            <Tabs.Screen name="explore" options={{ title: 'Explore', headerShown: false, freezeOnBlur: true }} />
            <Tabs.Screen name="messages" options={{ title: 'Messages', headerShown: false, freezeOnBlur: true }} />
            <Tabs.Screen name="mystuff" options={{ title: 'My Stuff', headerShown: false, freezeOnBlur: true }} />
        </Tabs>
    );
};

export default TabsLayout;