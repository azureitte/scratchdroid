import { useState } from 'react';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useUser } from '@/hooks/queries/useUser';
import ListLoading from '@/components/panels/ListLoading';
import InfoCard from '@/components/panels/InfoCard';


const UserInfoPage = () => {

    const { username } = useLocalSearchParams<{ 
        username: string,
    }>();

    const { user } = useUser(username);
    const data = user.data;
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const insets = useSafeAreaInsets();

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
                    { title: 'About Me', text: data.bio },
                    { title: 'What I\'m working on', text: data.status },
                ]}
                maxLength={Infinity}
                variation='full'
            />
        </ScrollView>
    </>);
    
};

export default UserInfoPage;

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
