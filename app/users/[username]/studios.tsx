import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import type { CarouselStudio } from '@/util/types/users.types';

import { useUser } from '@/hooks/queries/useUser';
import ListLoading from '@/components/panels/ListLoading';
import StuffGrid from '@/components/panels/StuffGrid';
import StudioCard from '@/components/panels/StudioCard';


const UserStudiosPage = () => {

    const { username } = useLocalSearchParams<{ 
        username: string,
    }>();
    const insets = useSafeAreaInsets();

    const { user } = useUser(username);
    const data = user.data;
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const render = useCallback((studio: CarouselStudio, columns: number) => <StudioCard
        id={studio.id}
        title={studio.title}
        gridColumns={columns}
    />, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await user.refetch();
        setIsRefreshing(false);
    };

    if (user.isError) return <Text>{user.error.message}</Text>;
    if (user.isLoading || !data) return <ListLoading marginTop={insets.top + 60} />;

    return (<>
        <LinearGradient 
            colors={['#121212', '#121212', '#12121200']}
            style={[styles.topHide, { height: insets.top + 60 }]} 
        />
        <View style={[styles.container, { 
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
        }]}>
            <StuffGrid
                type="studio"
                title="Studios"
                subtitle={`Curated by @${username}`}
                items={data.studiosCurating}
                render={render}
                refreshable
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                topOffset={60}
            />
        </View>
    </>);
    
};

export default UserStudiosPage;

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
        flex: 1,
    },
});
