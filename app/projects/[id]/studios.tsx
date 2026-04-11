import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useProject } from '@/hooks/queries/useProject';
import ListLoading from '@/components/panels/ListLoading';
import StuffGrid from '@/components/panels/StuffGrid';
import StudioCard from '@/components/panels/StudioCard';


const ProjectStudiosPage = () => {

    const { id } = useLocalSearchParams<{ 
        id: string,
    }>();
    const insets = useSafeAreaInsets();

    const { project } = useProject(Number(id));
    const data = project.data;
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const render = useCallback((studio: any, columns: number) => <StudioCard
        id={studio.id}
        title={studio.title}
        gridColumns={columns}
    />, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await project.refetch();
        setIsRefreshing(false);
    };

    if (project.isError) return <Text>{project.error.message}</Text>;
    if (project.isLoading || !data) return <ListLoading marginTop={insets.top + 60} />;

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
                subtitle={data.project.title}
                items={data.studios}
                render={render}
                refreshable
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                topOffset={60}
            />
        </View>
    </>);
    
};

export default ProjectStudiosPage;

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
