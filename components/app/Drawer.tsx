import { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, DrawerLayoutAndroid, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { emit, off, on } from '@/util/eventBus';
import { AppContext } from '@/context/AppContext';
import { useSession } from '@/hooks/useSession';
import { useAccountStorage } from '@/hooks/queries/useAccountStorage';
import Button from '@/components/general/Button';
import { useRouter } from 'expo-router';

type DrawerState = 'Dragging' | 'Idle' | 'Settling';

const Drawer = () => {

    const insets = useSafeAreaInsets();
    const { headerVisible } = useContext(AppContext);
    const { session, logout, logoutAll, switchAccount } = useSession();
    const { accounts } = useAccountStorage();

    const drawer = useRef<DrawerLayoutAndroid>(null);
    const drawerOpened = useRef(false);
    const [ drawerState, setDrawerState ] = useState<DrawerState>('Idle');

    const handleDrawerToggle = () => {
        if (drawerOpened.current) drawer.current?.closeDrawer();
        else drawer.current?.openDrawer();
    };

    const handleDrawerClose = () => {
        drawer.current?.closeDrawer();
    };
    
    useEffect(() => {
        on('drawer-toggle', handleDrawerToggle);
        on('drawer-close', handleDrawerClose);

        return () => {
            off('drawer-toggle', handleDrawerToggle);
            off('drawer-close', handleDrawerClose);
        }
    }, []);
    
    const navigationView = () => (
        <View style={[styles.container, styles.navigationContainer, {
            paddingTop: insets.top + 80,
        }]} >
            <Text style={styles.paragraph}>
                Current account: @{session?.user?.username}
            </Text>

            { accounts.filter(a => a.username !== session?.user?.username).map(account => (
                <Button
                    key={account.id}
                    text={'@' + account.username}
                    onPress={() => {
                        drawer.current?.closeDrawer();
                        drawerOpened.current = false;
                        switchAccount(account.username);
                    }}
                />
            )) }
            <Button
                text="Add another account"
                onPress={async () => {
                    drawer.current?.closeDrawer();
                    drawerOpened.current = false;
                    logout();
                }}
            />

            <Button
                text="Log out of all accounts"
                onPress={() => {
                    drawer.current?.closeDrawer();
                    drawerOpened.current = false;
                    logoutAll();
                }}
            />
        </View>
    );

    const handleDrawerStateChange = (state: DrawerState) => {
        setDrawerState(state);
    }

    const shouldBeHidden = (!drawerOpened.current && drawerState === 'Idle');
    const shouldIgnorePointer = (drawerOpened.current && drawerState === 'Settling');

    return headerVisible && (
        <View 
            pointerEvents={shouldIgnorePointer ? 'none' : 'auto'}
            style={[
                styles.drawerContainer,
                shouldBeHidden && styles.drawerContainerHidden,
            ]}
        >
            <DrawerLayoutAndroid
                renderNavigationView={navigationView}
                drawerWidth={360}
                ref={drawer}
                onDrawerOpen={() => {
                    drawerOpened.current = true;
                }}
                onDrawerClose={() => {
                    drawerOpened.current = false;
                }}
                onDrawerStateChanged={handleDrawerStateChange}
            />
        </View>
    );
};

export default Drawer;

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        bottom: 0,
        zIndex: 5,
    },
    drawerContainerHidden: {
        width: 8,
    },
    container: {
        flex: 1,
        width: 360,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    navigationContainer: {
        backgroundColor: '#121212',
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
    },
    paragraph: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});
