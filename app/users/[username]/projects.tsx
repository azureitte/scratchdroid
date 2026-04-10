import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import type { ProfileProject } from '@/util/types/app/users.types';
import type { ScratchProject } from '@/util/types/api/project.types';

import { useUser } from '@/hooks/queries/useUser';
import ListLoading from '@/components/panels/ListLoading';
import StuffGrid from '@/components/panels/StuffGrid';
import ProjectCard from '@/components/panels/ProjectCard';


const UserProjectsPage = () => {

    const { username } = useLocalSearchParams<{ 
        username: string,
    }>();
    const insets = useSafeAreaInsets();

    const { user } = useUser(username);
    const data = user.data;
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const render = useCallback((project: ScratchProject, columns: number) => <ProjectCard
        id={project.id}
        title={project.title}
        author={username}
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
                type="project"
                title="Shared Projects"
                subtitle={`by @${username}`}
                count={data.sharedProjectsCount}
                items={data.sharedProjects}
                render={render}
                refreshable
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                topOffset={60}
            />
        </View>
    </>);
    
};

export default UserProjectsPage;

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
