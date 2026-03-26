import React from "react";
import { Tabs } from "expo-router";

import TabBar from "../../components/TabBar";

const TabsLayout = () => {
    const header = () => <></>;

    return (
        <Tabs tabBar={props => <TabBar {...props} />}>
            <Tabs.Screen name="home" options={{ title: 'Home', header }} />
            <Tabs.Screen name="explore" options={{ title: 'Explore', header }} />
            <Tabs.Screen name="messages" options={{ title: 'Messages', header }} />
            <Tabs.Screen name="mystuff" options={{ title: 'My Stuff', header }} />
        </Tabs>
    );
};

export default TabsLayout;