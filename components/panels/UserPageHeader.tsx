import { memo, RefObject, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CountryFlag from "react-native-country-flag";

import type { ScratchProject, ScratchUser, UserQueryData } from '@/util/types';
import { addPrefixUrl, relativeDate } from '@/util/functions';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';


import Carousel from '@/components/panels/Carousel';
import ProjectCard from '@/components/panels/ProjectCard';
import UserCard from '@/components/panels/UserCard';
import { countryToCode } from '@/util/countries';


type UserPageHeaderProps = {
    data: UserQueryData;
    username: string;
    pfpCachePrevent: RefObject<number>;
}

const UserPageHeader = memo(({
    data,
    username: myUsername,
    pfpCachePrevent,
}: UserPageHeaderProps) => {

    const router = useRouter();
    
    const renderProject = useCallback((project: ScratchProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={myUsername}
        viewCount={project.stats.views}
    />, [data.user]);

    const renderUser = useCallback((user: ScratchUser) => <UserCard
        id={user.id}
        username={user.username}
        image={user.profile.images['60x60']}
    />, []);

    return (<View style={[styles.content]}>
        <Pressable 
            style={styles.banner}
            onPress={() => data.bannerProject && router.push(`/projects/${data.bannerProject.id}`)}
            android_ripple={DEFAULT_RIPPLE_CONFIG}
        >
            <LinearGradient
                colors={['#000', '#0000']}
                locations={[0.16, 1]}
                style={styles.bannerGradient}
            />
            { !!data.bannerProject?.thumbnail_url && <>
                <Image
                    source={{ uri: addPrefixUrl(data.bannerProject.thumbnail_url) }}
                    style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerSubtext} numberOfLines={1}>{'  ' + data.bannerProject.label + '  '}</Text>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{'  ' + data.bannerProject.title + '  '}</Text>
                </View>
            </>}
        </Pressable>

        <View style={styles.info}>
            <Image 
                source={{
                    uri: data.user.profile.images['90x90'] + '?a=' + pfpCachePrevent.current,
                }}
                width={480}
                height={360}
                style={styles.avatar}
            />
            <Text style={styles.infoText}>@{myUsername}</Text>
            <Text style={styles.infoSubtext}>{ 
                data.user.scratchteam ? 'Scratch Team' : 'Scratcher' 
            } • Joined { 
                relativeDate(new Date(data.user.history.joined))
            }</Text>
            <View style={styles.infoSubtextWrap}>
                <CountryFlag isoCode={countryToCode(data.user.profile.country)} size={14} style={{ opacity: 0.6, borderRadius: 4 }} />
                <Text style={styles.infoSubtext}>{ data.user.profile.country }</Text>
            </View>
        </View>

        <View style={styles.contentCard}>
            <Text style={styles.contentCardTitle}>About Me</Text>
            <Text style={styles.contentCardText} selectable>{ data.user.profile.bio }</Text>
            <Text style={styles.contentCardTitle}>What I'm working on</Text>
            <Text style={styles.contentCardText} selectable>{ data.user.profile.status }</Text>
        </View>

        <Carousel 
            title="Shared Projects" 
            items={data.sharedProjects}
            render={renderProject}
        />

        <Carousel 
            title="Favorite Projects" 
            items={data.favoriteProjects}
            render={renderProject}
        />

        <Carousel 
            title="Followers" 
            items={data.followers}
            render={renderUser}
        />

        <Carousel 
            title="Following" 
            items={data.following}
            render={renderUser}
        />

    </View>)
});

export default UserPageHeader;

const styles = StyleSheet.create({
    content: {
        gap: 16,
    },
    
    banner: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: '#1d2b4d',
        position: 'relative',
        overflow: 'hidden',
    },
    bannerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    bannerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    bannerOverlay: {
        position: 'absolute',
        top: 66,
        right: 16,
        zIndex: 2,
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
        maxWidth: '80%',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: 500,
        color: '#fff',

        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 16,
        paddingVertical: 10,
        marginVertical: -10,
        marginRight: -10,
    },
    bannerSubtext: {
        fontSize: 18,
        fontWeight: 400,
        color: '#ffffff9a',
        
        textShadowColor: '#000a',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 16,
        paddingVertical: 10,
        marginVertical: -10,
        marginRight: -6,
    },

    info: {
        paddingHorizontal: 16,
        gap: 4,
        marginTop: -64,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 12,
        boxShadow: '0 0 0 8px #121212',
        backgroundColor: '#121212',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 24,
        fontWeight: 600,
        color: '#fff',
    },
    infoSubtext: {
        fontSize: 16,
        fontWeight: 500,
        color: '#888',
    },
    infoSubtextWrap: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },

    contentCard: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#1C1C1C',
        gap: 8,
    },
    contentCardTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#888',
        marginTop: 4,
    },
    contentCardText: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: 400,
        color: '#fff',
        marginBottom: 8,
    },
});