import { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, DrawerLayoutAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppContext } from '@/context/AppContext';
import { useSession } from '@/hooks/useSession';
import Button from '@/components/general/Button';

type DrawerState = 'Dragging' | 'Idle' | 'Settling';

const Drawer = () => {

    const insets = useSafeAreaInsets();
    const { drawerOpen, setDrawerOpen, headerVisible } = useContext(AppContext);
    const { logout } = useSession();

    const drawer = useRef<DrawerLayoutAndroid>(null);
    const [ drawerState, setDrawerState ] = useState<DrawerState>('Idle');
    
    useEffect(() => {
        if (drawerOpen) drawer.current?.openDrawer();
        else drawer.current?.closeDrawer();
    }, [drawerOpen]);
    
    const navigationView = () => (
        <View style={[styles.container, styles.navigationContainer, {
            paddingTop: insets.top + 80,
        }]} >
            <Button
                text="Log out"
                fullWidth
                onPress={() => {
                    drawer.current?.closeDrawer();
                    logout();
                }}
            />
        </View>
    );

    const handleDrawerStateChange = (state: DrawerState) => {
        setDrawerState(state);
    }

    const shouldBeHidden = (!drawerOpen && drawerState === 'Idle');
    const shouldIgnorePointer = (drawerOpen && drawerState === 'Settling');

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
                    setDrawerOpen(true);
                }}
                onDrawerClose={() => {
                    setDrawerOpen(false);
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
