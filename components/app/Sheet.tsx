import { Activity, useEffect, useRef } from 'react';
import { BackHandler, Keyboard, StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { off, on } from '@/util/eventBus';
import { useStack } from '@/hooks/useStack';
import Heading from '@/components/general/Heading';


import Test from '../menus/Test';
import Test2 from '../menus/Test2';
import CreateMenu from '../menus/CreateMenu';

const MENUS = {
    test1: Test,
    test2: Test2,
    create: CreateMenu,
} as const;

export type SheetMenuName = keyof typeof MENUS;
const getMenu = (name: SheetMenuName) => MENUS[name];



const Sheet = () => {
    
    const stack = useStack<SheetMenuName>();
    const insets = useSafeAreaInsets();

    const onBack = () => {
        stack.pop();
    }
    
    const isLast = stack.size <= 1;

    
    const handleSheetPush = (name: SheetMenuName) => {
        Keyboard.dismiss();
        stack.push(name);
    };

    const handleSheetReplace = (name: SheetMenuName) => {
        Keyboard.dismiss();
        stack.replace(name);
    };

    const handleSheetClear = () => {
        Keyboard.dismiss();
        stack.clear();
    };

    useEffect(() => {
        on('sheet-push', handleSheetPush);
        on('sheet-replace', handleSheetReplace);
        on('sheet-clear', handleSheetClear);

        return () => {
            off('sheet-push', handleSheetPush);
            off('sheet-replace', handleSheetReplace);
            off('sheet-clear', handleSheetClear);
        };
    }, [stack]);


    const sheetRef = useRef<TrueSheet>(null);
    
    const currentMenuName: SheetMenuName|undefined = stack.stack[stack.size - 1];
    const currentMenu = currentMenuName ? getMenu(currentMenuName) : null;

    useEffect(() => {
        if (stack.size === 0) {
            sheetRef.current?.dismiss();
        } else {
            sheetRef.current?.present();
        }
    }, [stack.size]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!currentMenu?.dismissible) return false;

            if (isLast) 
                sheetRef.current?.dismiss().then(onBack);
            else
                onBack?.();
            return true;
        });

        return () => {
            backHandler.remove();
        };
    }, [onBack]);

    return (
        <TrueSheet
            ref={sheetRef}
            detents={currentMenu?.detents ?? ['auto']}
            dismissible={currentMenu?.dismissible ?? true}
            onDidDismiss={onBack}
            backgroundColor={'#1C1C1C'}
            style={{
                paddingBottom: insets.bottom,
            }}
        >
            { !!(currentMenu?.title) && <Heading style={styles.heading}>{currentMenu?.title}</Heading> }
            { stack.stack.map((name, index) => (
                <Activity
                    key={`${index}_${name}`}
                    mode={name === currentMenuName ? 'visible' : 'hidden'}
                >
                    { getMenu(name).render() }
                </Activity>
            )) }
        </TrueSheet>
    );
};

export default Sheet;

const styles = StyleSheet.create({
    heading: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginTop: 16,
        fontSize: 24,
    }
});
