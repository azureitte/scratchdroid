import { useState } from 'react';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useProject } from '@/hooks/queries/useProject';
import ListLoading from '@/components/panels/ListLoading';
import ProjectInfoCard from '@/components/panels/ProjectInfoCard';


const ProjectInfoPage = () => {

    const { id } = useLocalSearchParams<{ 
        id: string,
    }>();

    const { project } = useProject(Number(id));
    const data = project.data;
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const insets = useSafeAreaInsets();

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
        <ScrollView 
            refreshControl={<RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                progressViewOffset={60}
            />}
            contentContainerStyle={[styles.container, { 
                paddingTop: insets.top + 60,
                paddingBottom: insets.bottom,
            }]}
        >
            <ProjectInfoCard
                project={data.project}
                projectId={Number(id)}
                isFull
            />
        </ScrollView>
    </>);
    
};

export default ProjectInfoPage;

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
