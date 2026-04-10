import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import type { ScratchProject } from '@/util/types/api/project.types';

import { useProject } from '@/hooks/queries/useProject';
import ListLoading from '@/components/panels/ListLoading';
import StuffGrid from '@/components/panels/StuffGrid';
import ProjectCard from '@/components/panels/ProjectCard';


const ProjectRemixesPage = () => {

    const { id } = useLocalSearchParams<{ 
        id: string,
    }>();
    const insets = useSafeAreaInsets();

    const { project } = useProject(Number(id));
    const data = project.data;
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const render = useCallback((project: ScratchProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.author.username}
        isInsideGrid
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
                type="project"
                title="Remixes"
                subtitle={data.project.title}
                items={data.remixes}
                render={render}
                refreshable
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                topOffset={60}
            />
        </View>
    </>);
    
};

export default ProjectRemixesPage;

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
