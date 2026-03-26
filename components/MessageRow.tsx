import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import {} from "react";

import { CommentType, type ScratchMessage } from "../util/types";
import { SVGS } from "../util/assets";

import { Link } from "expo-router";
import { shortRelativeDate } from "../util/functions";

type MessageRowProps = {
    message: ScratchMessage;
    myUsername?: string;
    isUnread: boolean;
};

const getIcon = (message: ScratchMessage) => {
    switch (message.type) {
        case 'followuser': return SVGS.messages.follow;
        case 'loveproject': return SVGS.messages.love;
        case 'favoriteproject': return SVGS.messages.favorite;
        case 'addcomment': return SVGS.messages.comment;
        case 'curatorinvite': return SVGS.messages.curatorInvite;
        case 'remixproject': return SVGS.messages.remix;
        case 'studioactivity': return SVGS.messages.studioActivity;
        case 'forumpost': return SVGS.messages.forumActivity;
        case 'becomehoststudio': return SVGS.messages.hostTransfer;
        case 'becomeownerstudio': return SVGS.messages.ownerInvite;
        case 'userjoin': return SVGS.messages.comment;
        default: return SVGS.messages.comment;
    }
};

const MessageRow = ({
    message,
    myUsername,
    isUnread,
}: MessageRowProps) => {

    const Icon = getIcon(message);

    return (
        <View style={[styles.container, isUnread && styles.unread]}>
            <Icon style={styles.icon} />
            <View style={styles.contentWrapper}>
                <View style={styles.content}>

                    { message.type === 'followuser' && 
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> is now following you
                        </Text> 
                    }

                    { message.type === 'loveproject' && 
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> loved your project <Link style={styles.linkText} href={`/projects/${message.project_id}`}>
                                {message.title}
                            </Link>
                        </Text> 
                    }

                    { message.type === 'favoriteproject' &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> favorited your project <Link style={styles.linkText} href={`/projects/${message.project_id}`}>
                                {message.title}
                            </Link>
                        </Text>
                    }

                    { message.type === 'addcomment' &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link>

                            { message.comment_type === CommentType.PROJECT && <>
                                    { !!message.commentee_username 
                                        ? ' replied to your comment on ' 
                                        : ' commented on your project ' }
                                    <Link style={styles.linkText} href={`/projects/${message.comment_obj_id}`}>
                                         {message.comment_obj_title }
                                    </Link>
                                </>
                            }
                            { message.comment_type === CommentType.USER && <>
                                    { !!message.commentee_username 
                                        ? ' replied to your comment on ' 
                                        : ' commented on ' }
                                    <Link style={styles.linkText} href={`/users/${message.comment_obj_title}`}>
                                        { message.comment_obj_title === myUsername
                                            ? 'your profile'
                                            : `${message.comment_obj_title}'s profile`
                                        }
                                    </Link>
                                </>
                            }
                            { message.comment_type === CommentType.STUDIO && <>
                                    { !!message.commentee_username 
                                        ? ' replied to your comment in ' 
                                        : ' commented in studio ' }
                                    <Link style={styles.linkText} href={`/studios/${message.comment_obj_id}`}>
                                        {message.comment_obj_title}
                                    </Link>
                                </>
                            }
                        </Text>
                    }

                    { message.type === 'curatorinvite' &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> invited you to curate the studio <Link style={styles.linkText} href={`/studios/${message.gallery_id}`}>
                                {message.title}
                            </Link>
                        </Text>
                    }

                    { message.type === 'remixproject' &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> remixed your project <Link style={styles.linkText} href={`/projects/${message.parent_id}`}>
                                {message.parent_title}
                            </Link>. Check out <Link style={styles.linkText} href={`/projects/${message.project_id}`}>the remix</Link>!
                        </Text>
                    }

                    { message.type === 'studioactivity' &&
                        <Text style={styles.text}>
                            There was new activivty in <Link style={styles.linkText} href={`/studios/${message.gallery_id}`}>
                                {message.title}
                            </Link> today
                        </Text>
                    }

                    { message.type === 'forumpost' && 
                        <Text style={styles.text}>
                            There are new posts in the forum thread: <Link style={styles.linkText} href={`https://scratch.mit.edu/discuss/topic/${message.topic_id}`}>
                                {message.topic_title}
                            </Link>
                        </Text>
                    }

                    { message.type === 'becomeownerstudio' &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> promoted you to manager for the studio <Link style={styles.linkText} href={`/studios/${message.gallery_id}`}>
                                {message.gallery_title}
                            </Link>
                        </Text>
                    }

                    { message.type === 'becomehoststudio' &&
                        <Text style={styles.text}>
                            { message.admin_actor ? 'A Scratch Team member' : <Link style={styles.linkText} href={`/users/${message.actor_username}`}>
                                {message.actor_username}
                            </Link> } made you the host of the studio <Link style={styles.linkText} href={`/studios/${message.gallery_id}`}>
                                {message.gallery_title}
                            </Link>. As host, you now have the ability to edit the studio title, thumbnail, and description. Go say hello in the studio!
                        </Text>
                    }

                    { message.type === 'userjoin' &&
                        <Text style={styles.text}>
                            Welcome to Scratch! After you make projects and comments, you'll get messages about them here. Go explore or create.
                        </Text>
                    }

                </View>

                { message.type === 'addcomment' && 
                    <View style={styles.commentWrapper}>
                        <Image source={{ uri: `https://uploads.scratch.mit.edu/get_image/user/${message.actor_id}_32x32.png` }} style={styles.commentAvatar} />
                        <View style={styles.commentBubbleDeco} />
                        <View style={styles.commentBubble}>
                            <Text style={styles.commentText} selectable>
                                {
                                    message.comment_fragment
                                        .replaceAll('\n', ' ')
                                        .replaceAll('&quot;', '"')
                                        .replaceAll('&amp;', '&')
                                        .replaceAll('&lt;', '<')
                                        .replaceAll('&gt;', '>')
                                }
                            </Text>
                        </View>
                    </View>
                }
            </View>

            <Text style={styles.dateText}>
                { shortRelativeDate(new Date(message.datetime_created)) }
            </Text>
        </View>
    );
};

export default MessageRow;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#262626",
        gap: 16,
    },
    unread: {
        backgroundColor: '#4177ff14',
        borderBottomColor: '#2A3551',
    },

    icon: {
        marginTop: 2,
    },

    contentWrapper: {
        flex: 1,
        flexDirection: "column",
        gap: 12,
    },

    content: {
        flex: 1,
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
        color: "#71A3FF",
        textDecorationLine: "underline",
        fontWeight: 600,
    },

    dateText: {
        color: '#6C6C6C',
        fontSize: 14,
    },

    commentWrapper: {
        flex: 1,
        flexDirection: "row",
    },
    commentAvatar: { 
        width: 32, 
        height: 32, 
        borderRadius: 8,
        marginRight: 10,
    },
    commentBubbleDeco: {
        width: 20,
        height: 16,
        borderBottomStartRadius: 16,
        backgroundColor: "#212121",
        borderWidth: 2,
        borderEndColor: "#212121",
        marginRight: -2.5,
        zIndex: 1,
        borderColor: "#353535",
    },
    commentBubble: {
        padding: 16,
        minHeight: 58,
        borderRadius: 8,
        borderTopStartRadius: 0,
        backgroundColor: "#212121",
        borderWidth: 2,
        borderColor: "#353535",
        maxWidth: Dimensions.get("window").width - 150,
    },
    commentText: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: 400,
        color: "#fff",
    },
});
