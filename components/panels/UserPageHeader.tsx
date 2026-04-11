import { memo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CountryFlag from "react-native-country-flag";

import { addPrefixUrl, relativeDate } from '@/util/functions';
import { $u } from '@/util/thumbnailCaching';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { countryToCode } from '@/util/countries';

import type { ProfileClassroom, CarouselProject, CarouselStudio, CarouselUser, User } from '@/util/types/users.types';

import Carousel from '@/components/panels/Carousel';
import ProjectCard from '@/components/panels/ProjectCard';
import UserCard from '@/components/panels/UserCard';
import StudioCard from './StudioCard';
import InfoCard from './InfoCard';
import Button from '../general/Button';


type UserPageHeaderProps = {
    data: User;
    username: string;
    isOwn?: boolean;
    followAction: {
        isPending: boolean;
        dispatch: () => void;
    },
    handleUserOptions?: () => void;
    rerender: number;
}

const UserPageHeader = memo(({
    data: user,
    username: myUsername,
    isOwn = false,
    followAction,
    handleUserOptions,
    rerender,
}: UserPageHeaderProps) => {

    const router = useRouter();
    
    const renderProject = useCallback((project: CarouselProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.author}
    />, []);

    const renderMyProject = useCallback((project: CarouselProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={myUsername}
        viewCount={project.views}
    />, [myUsername]);

    const renderUser = useCallback((user: CarouselUser) => <UserCard
        id={user.id}
        username={user.username}
    />, []);

    const renderStudio = useCallback((studio: CarouselStudio) => <StudioCard
        id={studio.id}
        title={studio.title}
    />, []);

    const renderClassroom = useCallback((classroom: ProfileClassroom) => <StudioCard
        id={classroom.id}
        title={classroom.title}
        isClassroom
    />, []);

    const shouldRenderClassrooms = user.classrooms.length > 0;
    const shouldRenderStudiosFollowing = user.studiosFollowing.length > 0;
    const shouldRenderStudiosCurating = user.studiosCurating.length > 0;

    return (<View style={[styles.content]}>
        <Pressable 
            style={styles.banner}
            onPress={() => user.bannerProject && router.push(`/projects/${user.bannerProject.id}`)}
            android_ripple={user.bannerProject ? DEFAULT_RIPPLE_CONFIG : undefined}
        >
            <LinearGradient
                colors={['#000', '#0000']}
                locations={[0.16, 1]}
                style={styles.bannerGradient}
            />
            { !!user.bannerProject?.thumbnail_url && <>
                <Image
                    source={{ uri: addPrefixUrl(user.bannerProject.thumbnail_url) }}
                    style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerSubtext} numberOfLines={1}>{'  ' + user.bannerProject.label + '  '}</Text>
                    <Text style={styles.bannerTitle} numberOfLines={1}>{'  ' + user.bannerProject.title + '  '}</Text>
                </View>
            </>}
        </Pressable>

        <View style={styles.info}>
            <Image 
                source={{
                    uri: $u(user.images.huge, 
                        myUsername, user.id, rerender),
                }}
                width={480}
                height={360}
                style={styles.avatar}
            />
            <Text style={styles.infoText}>@{myUsername}</Text>
            <Text style={styles.infoSubtext}>
                { 
                    user.roleLink 
                        ? <Link href={user.roleLink} style={styles.link}>{user.role}</Link>
                        : user.role 
                } • Joined { relativeDate(user.joined) }
            </Text>
            <View style={styles.infoSubtextWrap}>
                { user.country 
                    ? <>
                        <CountryFlag 
                            isoCode={countryToCode(user.country)} 
                            size={14} 
                            style={{ opacity: 0.6, borderRadius: 4 }} 
                        />
                        <Text style={styles.infoSubtext}>
                            { user.country }
                        </Text>
                    </>
                    : <Text style={styles.infoSubtext}>
                        Location not given
                    </Text> }
            </View>

            <View style={styles.actionBar}>
                <Button
                    onPress={handleUserOptions}
                    icon="more" square
                />
                { isOwn 
                    ? <Button
                        text="Edit profile"
                        icon="accountSettings"
                    />
                    : user.canFollow 
                        && <Button
                            text={user.isFollowing ? 'Unfollow' : 'Follow'}
                            role={user.isFollowing ? 'secondary' : 'primary'}
                            icon="follow"
                            isDisabled={followAction.isPending}
                            onPress={followAction.dispatch}
                        />
                }
            </View>
        </View>

        <InfoCard
            sections={[
                { title: 'About Me', text: user.bio },
                { title: 'What I\'m working on', text: user.status },
            ]}
            href={`/users/${myUsername}/info`}
        />

        <View style={styles.carousels}>
            <View style={styles.sep} /> 

            { shouldRenderClassrooms && <Carousel 
                title="Classrooms"
                count={user.classroomsCount}
                items={user.classrooms}
                render={renderClassroom}
                href={`/users/${myUsername}/classes`}
            /> }

            <Carousel 
                title="Shared Projects"
                count={user.sharedProjectsCount}
                items={user.sharedProjects}
                render={renderMyProject}
                href={`/users/${myUsername}/projects`}
            />

            <Carousel 
                title="Favorite Projects" 
                items={user.favoriteProjects}
                render={renderProject}
                href={`/users/${myUsername}/favorites`}
            />

            { 
                shouldRenderStudiosFollowing && 
                shouldRenderStudiosCurating && 
                <View style={styles.sep} /> 
            }

            { shouldRenderStudiosFollowing && <Carousel 
                title="Studios I'm Following" 
                items={user.studiosFollowing}
                render={renderStudio}
                href={`/users/${myUsername}/studios_following`}
            /> }

            { shouldRenderStudiosCurating && <Carousel 
                title="Studios I Curate" 
                items={user.studiosCurating}
                render={renderStudio}
                href={`/users/${myUsername}/studios`}
            /> }

            <View style={styles.sep} /> 

            <Carousel 
                title="Following" 
                items={user.following}
                render={renderUser}
                href={`/users/${myUsername}/following`}
            />

            <Carousel 
                title="Followers" 
                items={user.followers}
                render={renderUser}
                href={`/users/${myUsername}/followers`}
            />

            <View style={styles.sep} /> 
        </View>

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
        maxWidth: '100%',
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
        position: 'relative',
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
    link: {
        color: "#93C0FF",
        fontWeight: 500,
        fontSize: 16,
        fontStyle: 'normal',
        textDecorationLine: 'underline',
    },
    actionBar: {
        position: 'absolute',
        top: 64,
        right: 16,
        flexDirection: 'row',
        gap: 6,
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

    carousels: {
        gap: 20,
        marginBottom: -28,
    },
    sep: {
        height: 1,
        width: '100%',
        backgroundColor: '#222222',
        marginVertical: -4,
    }
});