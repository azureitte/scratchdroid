import { useContext, useEffect } from 'react';
import { router, Tabs } from 'expo-router';

import { AppContext } from '@/context/AppContext';

const TabsLayout = () => {
    const { currentTab } = useContext(AppContext);

    const header = () => <></>;
    const tabBar = () => <></>;

    useEffect(() => {
        router.navigate(`/${currentTab}`)
    }, [currentTab]);

    return (
        <Tabs tabBar={tabBar}>
            <Tabs.Screen name="home" options={{ title: 'Home', header }} />
            <Tabs.Screen name="explore" options={{ title: 'Explore', header }} />
            <Tabs.Screen name="messages" options={{ title: 'Messages', header }} />
            <Tabs.Screen name="mystuff" options={{ title: 'My Stuff', header }} />
        </Tabs>
    );
};

export default TabsLayout;