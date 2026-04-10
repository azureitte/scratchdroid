import { Activity, useEffect, useRef } from 'react';
import { BackHandler, Keyboard, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboard } from "react-native-use-keyboard";

import { off, on } from '@/util/eventBus';
import { useStack } from '@/hooks/useStack';
import Heading from '@/components/general/Heading';


import Test from '../menus/Test';
import Test2 from '../menus/Test2';
import CreateMenu from '../menus/CreateMenu';
import AddCommentMenu from '../menus/AddCommentMenu';
import CommentOptionsMenu from '../menus/CommentOptionsMenu';
import ProjectOptionsMenu from '../menus/ProjectOptionsMenu';
import UserOptionsMenu from '../menus/UserOptionsMenu';

const MENUS = {
    test1: Test,
    test2: Test2,
    create: CreateMenu,
    addComment: AddCommentMenu,
    commentOptions: CommentOptionsMenu,
    projectOptions: ProjectOptionsMenu,
    userOptions: UserOptionsMenu,
} as const;

export type SheetMenuName = keyof typeof MENUS;
const getMenu = (name: SheetMenuName) => MENUS[name];


type SheetMenu = {
    name: SheetMenuName;
    props?: any;
}

const Sheet = () => {
    
    const stack = useStack<SheetMenu>();
    const insets = useSafeAreaInsets();
    const keyboard = useKeyboard();

    const sheetRef = useRef<TrueSheet>(null);
    const isSheetOpen = useRef(false);

    const onBack = () => {
        stack.pop();
    }
    
    const isLast = stack.size <= 1;

    
    const handleSheetPush = <T extends any>(name: SheetMenuName, props?: T) => {
        Keyboard.dismiss();
        stack.push({
            name,
            props,
        });
    };

    const handleSheetPop = () => {
        Keyboard.dismiss();
        if (isLast) sheetRef.current?.dismiss().then(() => stack.clear());
        else stack.pop();
    };

    const handleSheetReplace = <T extends any>(name: SheetMenuName, props?: T) => {
        Keyboard.dismiss();
        stack.replace({
            name,
            props,
        });
    };

    const handleSheetClear = () => {
        Keyboard.dismiss();
        if (sheetRef.current && isSheetOpen.current) sheetRef.current.dismiss().then(() => stack.clear());
        else stack.clear();
    };

    useEffect(() => {
        on('sheet-push', handleSheetPush);
        on('sheet-pop', handleSheetPop);
        on('sheet-replace', handleSheetReplace);
        on('sheet-clear', handleSheetClear);

        return () => {
            off('sheet-push', handleSheetPush);
            off('sheet-pop', handleSheetPop);
            off('sheet-replace', handleSheetReplace);
            off('sheet-clear', handleSheetClear);
        };
    }, [stack]);
    
    const currentMenu: SheetMenu|undefined = stack.stack[stack.size - 1];
    const currentMenuDef = currentMenu ? getMenu(currentMenu.name) : null;

    useEffect(() => {
        if (stack.size === 0 && isSheetOpen.current) {
            sheetRef.current?.dismiss();
        }
        
        if (stack.size > 0 && !isSheetOpen.current) {
            sheetRef.current?.present();
        }
    }, [stack.size]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!currentMenuDef?.dismissible) return false;

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
            detents={currentMenuDef?.detents ?? ['auto']}
            dismissible={currentMenuDef?.dismissible ?? true}
            onDidDismiss={() => {
                isSheetOpen.current = false;
                onBack();
            }}
            onDidPresent={() => {
                isSheetOpen.current = true;
            }}
            backgroundColor={
                currentMenuDef?.isDark 
                    ? '#121212' 
                    : '#1C1C1C'
            }
            style={{ 
                paddingBottom: 20,
            }}
        >
            <View style={[styles.container, {
                marginBottom: keyboard.isVisible
                    ? (-insets.bottom)
                    : 0,
            }]}>
                { !!(currentMenuDef?.title) && <Heading style={styles.heading}>{currentMenuDef?.title}</Heading> }
                { stack.stack.map((menu, index) => (
                    <Activity
                        key={`${index}_${menu.name}`}
                        mode={menu.name === currentMenu.name ? 'visible' : 'hidden'}
                    >
                        { getMenu(menu.name).render(menu.props) }
                    </Activity>
                )) }
            </View>
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
    },
    container: {
        flexDirection: 'column',
    },
});
