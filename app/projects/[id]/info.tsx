import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { shortDate } from '@/util/functions';

import { useProject } from '@/hooks/queries/useProject';
import ListLoading from '@/components/panels/ListLoading';
import InfoCard from '@/components/panels/InfoCard';
import ExtensionChip from '@/components/panels/ExtensionChip';


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

    const publishedStr = shortDate(new Date(data.project.history.shared));
    const modifiedStr = shortDate(new Date(data.project.history.modified));
    const publishedEqModified = publishedStr === modifiedStr;

    const hasExtensionsOrCloud = data.project.extensions.length > 0 || data.project.hasCloudData;

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
            <InfoCard
                sections={[
                    { title: 'Instructions', text: data.project.instructions },
                    { title: 'Notes & Credits', text: data.project.description },
                ]}
                childTitle={hasExtensionsOrCloud && 'Extensions'}
                subtext={
                    `Published on ${publishedStr}` 
                    + (!publishedEqModified ? ` • Modified on ${modifiedStr}` : '')
                }
                maxLength={Infinity}
                variation='full'
            >
                { hasExtensionsOrCloud && <View style={styles.extensionsBar}>
                    { data.project.extensions.includes('text2speech') && <ExtensionChip extension="text2speech" /> }
                    { data.project.extensions.includes('videoSensing') && <ExtensionChip extension="videoSensing" /> }
                    { data.project.extensions.includes('faceSensing') && <ExtensionChip extension="faceSensing" /> }
                    { data.project.extensions.includes('pen') && <ExtensionChip extension="pen" /> }
                    { data.project.extensions.includes('music') && <ExtensionChip extension="music" /> }
                    { data.project.extensions.includes('translate') && <ExtensionChip extension="translate" /> }
                    { data.project.extensions.includes('makeymakey') && <ExtensionChip extension="makeymakey" /> }
                    { data.project.extensions.includes('microbit') && <ExtensionChip extension="microbit" /> }
                    { data.project.extensions.includes('gdxfor') && <ExtensionChip extension="gdxfor" /> }
                    { data.project.extensions.includes('ev3') && <ExtensionChip extension="ev3" /> }
                    { data.project.extensions.includes('wedo2') && <ExtensionChip extension="wedo2" /> }
                    { data.project.hasCloudData && <ExtensionChip extension="cloud" /> }
                </View> }
            </InfoCard>
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

    extensionsBar: {
        flexDirection: 'row',
        gap: 8,
        marginHorizontal: -2,
        flexWrap: 'wrap',
    },
});
