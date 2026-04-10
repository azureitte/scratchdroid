import { memo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CountryFlag from "react-native-country-flag";

import { addPrefixUrl, relativeDate } from '@/util/functions';
import { $u } from '@/util/thumbnailCaching';
import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { countryToCode } from '@/util/countries';

import type { ProfileClassroom, ProfileProject, ProfileStudio, ProfileUser, UserQueryData } from '@/util/types/app/users.types';
import type { ScratchProject } from '@/util/types/api/project.types';

import { useSheet } from '@/hooks/useSheet';
import { useFollowUser } from '@/hooks/mutations/useFollowUser';

import Carousel from '@/components/panels/Carousel';
import ProjectCard from '@/components/panels/ProjectCard';
import UserCard from '@/components/panels/UserCard';
import StudioCard from './StudioCard';
import InfoCard from './InfoCard';
import Button from '../general/Button';
import type { UserOptionsMenuProps } from '../menus/UserOptionsMenu';


type UserPageHeaderProps = {
    data: UserQueryData;
    username: string;
    isOwn?: boolean;
    setIsFollowing?: (to: boolean) => void;
    setCanComment?: (commentsAllowed: boolean) => void;
    rerender: number;
}

const UserPageHeader = memo(({
    data,
    username: myUsername,
    isOwn = false,
    setIsFollowing,
    setCanComment,
    rerender,
}: UserPageHeaderProps) => {

    const router = useRouter();
    const sheet = useSheet();

    const followAction = useFollowUser({
        username: myUsername,
        onSuccess: (following) => {
            setIsFollowing?.(following);
        },
    })

    const handleProjectOptions = () => {
        sheet.push<UserOptionsMenuProps>('userOptions', { 
            username: myUsername,
            canComment: data.canComment,
            canToggleCommenting: isOwn,
            canReport: !isOwn,
            setCanComment,
        });
    }
    
    const renderProject = useCallback((project: ProfileProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={project.author}
    />, [data.user]);

    const renderMyProject = useCallback((project: ScratchProject) => <ProjectCard
        id={project.id}
        title={project.title}
        author={myUsername}
        viewCount={project.stats.views}
    />, [data.user]);

    const renderUser = useCallback((user: ProfileUser) => <UserCard
        id={user.id}
        username={user.username}
    />, []);

    const renderStudio = useCallback((studio: ProfileStudio) => <StudioCard
        id={studio.id}
        title={studio.title}
    />, []);

    const renderClassroom = useCallback((classroom: ProfileClassroom) => <StudioCard
        id={classroom.id}
        title={classroom.title}
        isClassroom
    />, []);

    const shouldRenderClassrooms = data.classrooms.length > 0;
    const shouldRenderStudiosFollowing = data.studiosFollowing.length > 0;
    const shouldRenderStudiosCurating = data.studiosCurating.length > 0;

    return (<View style={[styles.content]}>
        <Pressable 
            style={styles.banner}
            onPress={() => data.bannerProject && router.push(`/projects/${data.bannerProject.id}`)}
            android_ripple={data.bannerProject ? DEFAULT_RIPPLE_CONFIG : undefined}
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
                    uri: $u(data.user.profile.images['90x90'], 
                        myUsername, data.user.id, rerender),
                }}
                width={480}
                height={360}
                style={styles.avatar}
            />
            <Text style={styles.infoText}>@{myUsername}</Text>
            <Text style={styles.infoSubtext}>
                { 
                    data.roleLink 
                        ? <Link href={data.roleLink} style={styles.link}>{data.role}</Link>
                        : data.role 
                } • Joined { relativeDate(new Date(data.user.history.joined)) }
            </Text>
            <View style={styles.infoSubtextWrap}>
                { data.user.profile.country 
                    ? <>
                        <CountryFlag 
                            isoCode={countryToCode(data.user.profile.country)} 
                            size={14} 
                            style={{ opacity: 0.6, borderRadius: 4 }} 
                        />
                        <Text style={styles.infoSubtext}>
                            { data.user.profile.country }
                        </Text>
                    </>
                    : <Text style={styles.infoSubtext}>
                        Location not given
                    </Text> }
            </View>

            <View style={styles.actionBar}>
                <Button
                    onPress={handleProjectOptions}
                    icon="more" square
                />
                { isOwn 
                    ? <Button
                        text="Edit profile"
                        icon="accountSettings"
                    />
                    : data.canFollow 
                        && <Button
                            text={data.isFollowing ? 'Unfollow' : 'Follow'}
                            role={data.isFollowing ? 'secondary' : 'primary'}
                            icon="follow"
                            isDisabled={followAction.isPending}
                            onPress={() => {
                                setIsFollowing?.(!data.isFollowing);
                                followAction.mutate({ 
                                    from: data.isFollowing, 
                                    to: !data.isFollowing 
                                });
                            }}
                        />
                }
            </View>
        </View>

        <InfoCard
            sections={[
                { title: 'About Me', text: data.user.profile.bio },
                { title: 'What I\'m working on', text: data.user.profile.status },
            ]}
            href={`/users/${myUsername}/info`}
        />

        <View style={styles.carousels}>
            <View style={styles.sep} /> 

            { shouldRenderClassrooms && <Carousel 
                title="Classrooms"
                count={data.classroomsCount}
                items={data.classrooms}
                render={renderClassroom}
                href={`/users/${myUsername}/classes`}
            /> }

            <Carousel 
                title="Shared Projects"
                count={data.sharedProjectsCount}
                items={data.sharedProjects}
                render={renderMyProject}
                href={`/users/${myUsername}/projects`}
            />

            <Carousel 
                title="Favorite Projects" 
                items={data.favoriteProjects}
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
                items={data.studiosFollowing}
                render={renderStudio}
                href={`/users/${myUsername}/studios_following`}
            /> }

            { shouldRenderStudiosCurating && <Carousel 
                title="Studios I Curate" 
                items={data.studiosCurating}
                render={renderStudio}
                href={`/users/${myUsername}/studios`}
            /> }

            <View style={styles.sep} /> 

            <Carousel 
                title="Following" 
                items={data.following}
                render={renderUser}
                href={`/users/${myUsername}/following`}
            />

            <Carousel 
                title="Followers" 
                items={data.followers}
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