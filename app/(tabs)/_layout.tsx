import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { router, Tabs } from 'expo-router';

import { AppTabKey } from '@/context/AppContext';
import { Easing } from 'react-native-reanimated';

const TabsLayout = () => {

    const tabBar = () => <></>;

    const handleTabNavigate = (tab: AppTabKey) => {
        router.navigate(`/${tab}`);
    };

    useEffect(() => {
        DeviceEventEmitter.addListener('tab-navigate', handleTabNavigate);
        return () => DeviceEventEmitter.removeAllListeners('tab-navigate');
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
            }
        }}>
            <Tabs.Screen name="home" options={{ title: 'Home', headerShown: false, freezeOnBlur: true }} />
            <Tabs.Screen name="explore" options={{ title: 'Explore', headerShown: false, freezeOnBlur: true }} />
            <Tabs.Screen name="messages" options={{ title: 'Messages', headerShown: false, freezeOnBlur: true }} />
            <Tabs.Screen name="mystuff" options={{ title: 'My Stuff', headerShown: false, freezeOnBlur: true }} />
        </Tabs>
    );
};

export default TabsLayout;