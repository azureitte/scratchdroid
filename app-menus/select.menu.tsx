import { StyleSheet, View, Text, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import { buildMenu } from '@/util/functions';
import { useSheet } from '@/hooks/useSheet';
import ContextMenu, { ContextMenuItem } from '@/components/general/ContextMenu';
import { ScrollView } from 'react-native-gesture-handler';

export type SelectMenuProps = {
    title?: string;
    items: ContextMenuItem[];
}

const SelectMenu = ({
    title,
    items,
}: SelectMenuProps) => {

    const sheet = useSheet();

    const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (e.nativeEvent.contentOffset.y > 0) {
            sheet.block();
        } else {
            sheet.unblock();
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.content} 
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                }}
                onScroll={handleScroll}
                showsVerticalScrollIndicator={false}
            >
                { title && <View style={styles.titleWrapper}>
                        <Text style={styles.titleText}>
                        { title }
                    </Text> 
                </View> }
                <ContextMenu 
                    items={items.map(item => ({ 
                        ...item, 
                        onPress: () => {
                            sheet.pop();
                            item.onPress?.();
                        }
                    }))} 
                />
            </ScrollView>
        </View>
    );
};

export default buildMenu({
    render: (props: SelectMenuProps) => <SelectMenu {...props} />,
    detents: [0.5, 1],
    isDark: true,
});

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'row',
        gap: 8,
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        gap: 8,
    },
    titleText: {
        fontSize: 24,
        fontWeight: 600,
        marginRight: 56,
        color: '#fff',
        overflow: 'scroll',
    },
    titleWrapper: {
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 20,
    }
});
