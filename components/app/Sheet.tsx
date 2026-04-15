import { Activity, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboard } from "react-native-use-keyboard";
import { FormattedMessage } from 'react-intl';

import { off, on } from '@/util/eventBus';
import { useStack } from '@/hooks/useStack';
import Heading from '@/components/general/Heading';


import SelectMenu from '@/app-menus/select.menu';
import TestMenu from '@/app-menus/test.menu';
import CreateMenu from '@/app-menus/create.menu';
import AddCommentMenu from '@/app-menus/comments/add.menu';
import CommentOptionsMenu from '@/app-menus/comments/options.menu';
import ProjectOptionsMenu from '@/app-menus/project/options.menu';
import UserOptionsMenu from '@/app-menus/user/options.menu';

const MENUS = {
    select: SelectMenu,
    test1: TestMenu,
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

    const [ isBlocked, setIsBlocked ] = useState(false);

    const onBack = () => {
        stack.pop();
    }
    
    const isLast = stack.size <= 1;

    
    const handleSheetPush = <T extends any>(name: SheetMenuName, props?: T) => {
        Keyboard.dismiss();
        setIsBlocked(false);
        stack.push({
            name,
            props,
        });
    };

    const handleSheetPop = () => {
        Keyboard.dismiss();
        setIsBlocked(false);
        if (isLast) sheetRef.current?.dismiss().then(() => stack.clear());
        else stack.pop();
    };

    const handleSheetReplace = <T extends any>(name: SheetMenuName, props?: T) => {
        Keyboard.dismiss();
        setIsBlocked(false);
        stack.replace({
            name,
            props,
        });
    };

    const handleSheetBlock = () => {
        setIsBlocked(true);
    }

    const handleSheetUnblock = () => {
        setIsBlocked(false);
    }

    const handleSheetClear = () => {
        Keyboard.dismiss();
        setIsBlocked(false);
        if (sheetRef.current && isSheetOpen.current) sheetRef.current.dismiss().then(() => stack.clear());
        else stack.clear();
    };

    useEffect(() => {
        on('sheet-push', handleSheetPush);
        on('sheet-pop', handleSheetPop);
        on('sheet-replace', handleSheetReplace);
        on('sheet-clear', handleSheetClear);
        on('sheet-block', handleSheetBlock);
        on('sheet-unblock', handleSheetUnblock);

        return () => {
            off('sheet-push', handleSheetPush);
            off('sheet-pop', handleSheetPop);
            off('sheet-replace', handleSheetReplace);
            off('sheet-clear', handleSheetClear);
            off('sheet-block', handleSheetBlock);
            off('sheet-unblock', handleSheetUnblock);
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
            detents={isBlocked ? [1] : currentMenuDef?.detents ?? ['auto']}
            dismissible={!isBlocked && (currentMenuDef?.dismissible ?? true)}
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
            scrollable={currentMenuDef?.scrollable ?? false}
        >
            <View style={[styles.container, {
                marginBottom: keyboard.isVisible
                    ? (-insets.bottom)
                    : 0,
            }]}>
                { !!(currentMenuDef?.title) && <Heading style={styles.heading}>
                    
                    {currentMenuDef.translate
                        ? <FormattedMessage id={currentMenuDef.title} />
                        : currentMenuDef.title }
                </Heading> }
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
