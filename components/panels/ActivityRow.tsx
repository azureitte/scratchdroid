import { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

import { SVGS } from "@/util/assets";
import { shortRelativeDate } from "@/util/functions";
import { ActivityType, type ActivityUnit } from "@/util/types/activity.types";
import { $u } from "@/util/thumbnailCaching";

const getIcon = (unit: ActivityUnit) => {
    switch (unit.type) {
        case ActivityType.FOLLOW_USER: return SVGS.messages.follow;
        case ActivityType.FOLLOW_STUDIO: return SVGS.messages.followStudio;
        case ActivityType.SHARE_PROJECT: return SVGS.messages.project;
        case ActivityType.LOVE_PROJECT: return SVGS.messages.love;
        case ActivityType.FAVORITE_PROJECT: return SVGS.messages.favorite;
        case ActivityType.REMIX_PROJECT: return SVGS.messages.remix;
        case ActivityType.BECOME_CURATOR: return SVGS.messages.hostTransfer;
        case ActivityType.BECOME_MANAGER: return SVGS.messages.ownerInvite;
        case ActivityType.ADD_PROJECT: return SVGS.messages.studioActivity;
        case ActivityType.USER_JOIN: return SVGS.messages.follow;
        default: return SVGS.messages.comment;
    }
};


type ActivityRowProps = {
    unit: ActivityUnit;
    showAvatars?: boolean;
    linkActor?: boolean;
    variation?: 'regular'|'full';
};

const MessageRow = memo(({
    unit,
    showAvatars = false,
    linkActor = true,
    variation = 'regular',
}: ActivityRowProps) => {

    const Icon = getIcon(unit);

    const actor = linkActor
        ? <Link href={`/users/${unit.actor.username}`} style={styles.linkText}>{unit.actor.username}</Link>
        : <Text style={styles.bold}>{unit.actor.username}</Text>;

    return (
        <View style={[
            styles.container,
            (variation === 'full' || showAvatars) && styles.containerFull,
        ]}>
            { showAvatars 
                ? <Image 
                    source={{ 
                        uri: $u(`https://uploads.scratch.mit.edu/users/avatars/${unit.actor.id}.png`, 
                            unit.actor.username, unit.actor.id),
                    }} 
                    style={styles.avatar} 
                />
                : <Icon style={styles.icon} />
            }
            <View style={styles.contentWrapper}>
                <View style={styles.content}>

                    { unit.type === ActivityType.FOLLOW_USER && 
                        <Text style={styles.text}>
                            { actor } is now following <Link style={styles.linkText} href={`/users/${unit.followee.username}`}>
                                {unit.followee.username}
                            </Link>
                        </Text> 
                    }

                    { unit.type === ActivityType.FOLLOW_STUDIO && 
                        <Text style={styles.text}>
                            { actor } is now following <Link style={styles.linkText} href={`/users/${unit.studio.id}`}>
                                {unit.studio.title}
                            </Link>
                        </Text> 
                    }

                    { unit.type === ActivityType.SHARE_PROJECT && 
                        <Text style={styles.text}>
                            { actor } shared the project <Link style={styles.linkText} href={`/projects/${unit.project.id}`}>
                                {unit.project.title}
                            </Link>
                        </Text> 
                    }

                    { unit.type === ActivityType.LOVE_PROJECT &&
                        <Text style={styles.text}>
                            { actor } loved <Link style={styles.linkText} href={`/projects/${unit.project.id}`}>
                                {unit.project.title}
                            </Link>
                        </Text> 
                    }

                    { unit.type === ActivityType.FAVORITE_PROJECT &&
                        <Text style={styles.text}>
                            { actor } favorited <Link style={styles.linkText} href={`/projects/${unit.project.id}`}>
                                {unit.project.title}
                            </Link>
                        </Text>
                    }

                    { unit.type === ActivityType.REMIX_PROJECT &&
                        <Text style={styles.text}>
                            { actor } remixed <Link style={styles.linkText} href={`/projects/${unit.parent.id}`}>
                                {unit.parent.title}
                            </Link> as <Link style={styles.linkText} href={`/projects/${unit.project.id}`}>
                                {unit.project.title}
                            </Link>
                        </Text>
                    }

                    { unit.type === ActivityType.BECOME_CURATOR &&
                        <Text style={styles.text}>
                            { actor } became a curator of <Link style={styles.linkText} href={`/studios/${unit.studio.id}`}>
                                {unit.studio.title}
                            </Link>
                        </Text>
                    }

                    { unit.type === ActivityType.BECOME_MANAGER &&
                        <Text style={styles.text}>
                            { actor } was promoted to manager of <Link style={styles.linkText} href={`/studios/${unit.studio.id}`}>
                                {unit.studio.title}
                            </Link>
                        </Text>
                    }

                    { unit.type === ActivityType.ADD_PROJECT && 
                        <Text style={styles.text}>
                            { actor } added <Link style={styles.linkText} href={`/projects/${unit.project.id}`}>
                                {unit.project.title}
                            </Link> to the studio <Link style={styles.linkText} href={`/projects/${unit.studio.id}`}>
                                {unit.studio.title}
                            </Link>
                        </Text>
                    }

                    { unit.type === ActivityType.USER_JOIN &&
                        <Text style={styles.text}>
                            { actor } joined Scratch 
                        </Text>
                    }

                </View>
            </View>

            <Text style={styles.dateText}>
                { shortRelativeDate(unit.date) }
            </Text>
        </View>
    );
});

export default MessageRow;

const styles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#262626",
        gap: 16,
        flexShrink: 0,
        flexGrow: 0,
        minHeight: 42,
        width: '100%',
    },
    containerFull: {
        paddingVertical: 16,
    },

    icon: {
        marginTop: 2,
    },
    avatar: {
        width: 32,
        height: 32,
        margin: -6,
        marginLeft: -2,
        marginRight: -4,
        borderRadius: 6,
    },

    contentWrapper: {
        flex: 1,
        maxWidth: '100%',
        flexDirection: "column",
        gap: 12,
        justifyContent: 'center',
    },

    content: {
        flex: 0,
        flexDirection: "row",
        flexWrap: "wrap",
    },

    text: {
        fontSize: 16,
        fontWeight: 500,
        color: "#fff",
        lineHeight: 26,
    },
    linkText: {
        color: "#93C0FF",
        fontWeight: 600,
    },
    bold: {
        fontWeight: 600,
    },

    dateText: {
        color: '#6C6C6C',
        fontSize: 14,
    },
});
