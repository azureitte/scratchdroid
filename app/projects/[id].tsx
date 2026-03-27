import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';

import { useSession } from '../../hooks/useSession';
import { apiReq } from '../../util/api';
import { ScratchProject } from '../../util/types';

const ProjectPage = () => {

    const { id } = useLocalSearchParams<{ id: string }>();
    const { session } = useSession();
    const screen = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const {
        data: project,
        isLoading,
        isError,
        error,
    } = useQuery<ScratchProject>({
        queryKey: ['project', id],
        queryFn: async () => {
            if (!id) return;

            const projectRes = await apiReq<any>({
                host: 'https://api.scratch.mit.edu',
                path: `/projects/${id}/`,
                auth: session?.user?.token,
                responseType: 'json',
            });
            if (!projectRes.success) throw new Error(projectRes.error);

            return projectRes.data;
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    if (isError) return <Text>{error.message}</Text>;
    if (isLoading || !project) return <ActivityIndicator />;

    const projectWidth = Math.min(480, screen.width - 16);
    const projectHeight = (projectWidth / 4) * 3 + 45;

    return (
        <View style={styles.container}>
            <View style={{ marginTop: insets.top + 60 }} />
            <Text style={styles.projectTitle}>{project.title}</Text>
            <WebView
                source={{
                    uri: `https://turbowarp.org/${project.id}/embed?addons=pause,mute-project&settings-button`,
                }}
                style={{
                    flex: 0,
                    width: projectWidth,
                    height: projectHeight,
                    backgroundColor: 'transparent',
                }}
            />
            <Text>{id}</Text>
        </View>
    );
    
};

export default ProjectPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        padding: 8,
    },
    projectTitle: {
        fontSize: 28,
        padding: 4,
        marginVertical: 8,
        fontWeight: 900,
        color: '#fff',
        width: '100%',
    },
});
