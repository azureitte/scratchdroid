import { useState } from 'react';
import {
    StyleSheet,
    Text,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useSession } from '@/hooks/useSession';
import { useSheet } from '@/hooks/useSheet';
import { useChangeAppStateOnFocus } from '@/hooks/useChangeAppStateOnFocus';
import { useStudio } from '@/hooks/queries/useStudio';

import ListLoading from '@/components/panels/ListLoading';

const StudioPage = () => {

    const { id, commentId } = useLocalSearchParams<{ 
        id: string,
        commentId?: string,
    }>();
    const studioId = Number(id);

    const { session } = useSession();
    const sheet = useSheet();
    const insets = useSafeAreaInsets();

    const { 
        studio,
    } = useStudio(studioId);
    const data = studio.data;

    const [ isRefreshing, setIsRefreshing ] = useState(false);

    useChangeAppStateOnFocus({
        footerVisible: false,
        primaryColor: 'regular',
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchAll();
        setIsRefreshing(false);
    };

    const fetchAll = async () => {
        await Promise.all([
            studio.refetch(),
            //commentSectionRef.current?.refresh(),
        ]);
    };

    if (studio.isError) return <Text>{studio.error.message}</Text>;
    if (studio.isLoading || !data) return <ListLoading marginTop={insets.top + 60} />;

    return (<>
        <LinearGradient 
            colors={['#121212', '#121212', '#12121200']}
            style={[styles.topHide, { height: insets.top + 60 }]} 
        />
        <ScrollView 
            style={[styles.container, { 
                marginTop: insets.top,
                marginBottom: insets.bottom,
            }]}
            contentContainerStyle={{ paddingTop: 60 }}
            refreshControl={<RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
            />}
        >
            <Text style={{ color: '#fff', fontFamily: 'monospace' }}>
                {JSON.stringify(data, null, 2)}
            </Text>
        </ScrollView>
    </>);
    
};

export default StudioPage;

const styles = StyleSheet.create({
    topHide: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },

    container: {
        backgroundColor: '#121212',
    },
});
