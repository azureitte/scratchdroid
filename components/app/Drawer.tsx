import { Activity, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, DrawerLayoutAndroid, Text, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {  off, on } from '@/util/eventBus';
import { IMAGES } from '@/util/assets';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { addPrefixUrl, getRoleNameFromSession } from '@/util/functions';

import { AppContext } from '@/context/AppContext';
import { useSession } from '@/hooks/useSession';
import { useAccountStorage } from '@/hooks/queries/useAccountStorage';
import ContextMenu, { ContextMenuItem } from '../general/ContextMenu';

type DrawerState = 'Dragging' | 'Idle' | 'Settling';

const DRAWER_WIDTH = 360;

const Drawer = () => {

    const insets = useSafeAreaInsets();
    const router = useRouter();

    const { headerVisible } = useContext(AppContext);
    const { session, logout, logoutAll, switchAccount } = useSession();
    const { accounts } = useAccountStorage();

    const drawer = useRef<DrawerLayoutAndroid>(null);
    const drawerOpened = useRef(false);
    const [ drawerState, setDrawerState ] = useState<DrawerState>('Idle');

    const [ accountSwitcherCollapsed, setAccountSwitcherCollapsed ] = useState(true);

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

    const otherAccounts = accounts.filter(a => a.username !== session?.user?.username);

    const accountSwitcherMenu = useMemo(() => {

        const menu: ContextMenuItem[] = [];
        if (otherAccounts.length) {
            menu.push({
                key: 'account-switcher-toggle',
                label: 'Other accounts',
                collapsible: true,
                isCollapsed: accountSwitcherCollapsed,
                onPress: () => {
                    setAccountSwitcherCollapsed(!accountSwitcherCollapsed);
                },
            });
        }

        if (!accountSwitcherCollapsed || !otherAccounts.length) {
            otherAccounts.forEach((account) => {
                menu.push({
                    key: `switch-to-${account.username}`,
                    label: '@' + account.username,
                    icon: `https://cdn2.scratch.mit.edu/get_image/user/${account.id}_32x32.png`,
                    iconIsPng: true,
                    badge: account.unread,
                    isBold: true,
                    onPress: () => {
                        drawer.current?.closeDrawer();
                        switchAccount(account.username);
                    },
                });
            });

            if (otherAccounts.length < 10) {
                menu.push({
                    key: 'add-account',
                    icon: 'add',
                    label: 'Add an account',
                    onPress: () => {
                        drawer.current?.closeDrawer();
                        logout(true); // silent logout, to avoid losing active account in the storage
                    },
                });
            }
        }
        return menu;

    }, [otherAccounts, accountSwitcherCollapsed, session?.user]);

    const currentAccountMenu: ContextMenuItem[] = [
        {
            key: 'account-settings',
            label: 'Account settings',
            icon: 'accountSettings',
            onPress: () => {
                drawer.current?.closeDrawer();
                // TODO
            },
        },
        {
            key: 'logout',
            label: 'Log out of all accounts',
            icon: 'logout',
            isDanger: true,
            onPress: () => {
                drawer.current?.closeDrawer();
                logoutAll();
            },
        },
    ];
    
    
    const navigationView = () => (
        <View style={[styles.container, styles.navigationContainer, {
            paddingTop: insets.top,
        }]} >
            <Image source={IMAGES.logo} style={styles.logo} height={34} width={92} />

            { session?.user &&
                <Pressable 
                    onPress={() => {
                        drawer.current?.closeDrawer();
                        router.push(`users/${session!.user!.username}`);
                    }}
                    style={styles.currentUserContainer}
                    android_ripple={DEFAULT_RIPPLE_CONFIG}
                >
                    <Image 
                        source={{ 
                            uri: addPrefixUrl(session.user.thumbnailUrl),
                        }} 
                        style={styles.currentUserAvatar} 
                    />
                    <View style={styles.currentUserInfo}>
                        <Text style={styles.currentUserName}>
                            @{session.user.username}
                        </Text>
                        <Text style={styles.currentUserSubtext}>
                            { getRoleNameFromSession(session) } • Logged In
                        </Text>
                    </View>
                </Pressable>
            }

            <ContextMenu items={accountSwitcherMenu} />
            <View />
            <ContextMenu items={currentAccountMenu} />
        </View>
    );

    const handleDrawerStateChange = (state: DrawerState) => {
        setDrawerState(state);
    }

    const shouldBeHidden = (!drawerOpened.current && drawerState === 'Idle');
    const shouldIgnorePointer = (drawerOpened.current && drawerState === 'Settling');

    return (
        <Activity
            mode={headerVisible ? 'visible' : 'hidden'}
        >
            <View 
                pointerEvents={shouldIgnorePointer ? 'none' : 'auto'}
                style={[
                    styles.drawerContainer,
                    shouldBeHidden && styles.drawerContainerHidden,
                ]}
            >
                <DrawerLayoutAndroid
                    renderNavigationView={navigationView}
                    drawerWidth={DRAWER_WIDTH}
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
        </Activity>
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
        width: DRAWER_WIDTH,
        backgroundColor: '#121212',
    },
    navigationContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        gap: 8,
    },
    paragraph: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },

    logo: {
        height: 34,
        objectFit: "contain",
        margin: 16,
    },

    currentUserContainer: {
        backgroundColor: '#192135',
        padding: 16,
        borderRadius: 12,
        height: 75,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        overflow: 'hidden',
    },
    currentUserAvatar: {
        width: 42,
        height: 42,
        borderRadius: 8,
        objectFit: 'fill',
    },
    currentUserInfo: {
        flex: 1,
        gap: 4,
    },
    currentUserName: {
        fontSize: 20,
        fontWeight: 600,
        color: '#fff',
    },
    currentUserSubtext: {
        fontSize: 14,
        fontWeight: 500,
        color: '#7488B8',
    },
});
