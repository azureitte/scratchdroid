import { memo } from "react";
import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import { Link } from "expo-router";

import { SVGS } from "@/util/assets";
import { shortRelativeDate } from "@/util/functions";
import { $u } from "@/util/thumbnailCaching";
import { MessageType, type Message } from "@/util/types/messages.types";

import CommentContent from "./CommentContent";


const getIcon = (message: Message) => {
    switch (message.type) {
        case MessageType.FOLLOW_USER: return SVGS.messages.follow;
        case MessageType.LOVE_PROJECT: return SVGS.messages.love;
        case MessageType.FAVORITE_PROJECT: return SVGS.messages.favorite;
        case MessageType.ADD_COMMENT: return SVGS.messages.comment;
        case MessageType.CURATOR_INVITE: return SVGS.messages.curatorInvite;
        case MessageType.REMIX_PROJECT: return SVGS.messages.remix;
        case MessageType.STUDIO_ACTIVITY: return SVGS.messages.studioActivity;
        case MessageType.FORUM_POST: return SVGS.messages.forumActivity;
        case MessageType.BECOME_HOST_STUDIO: return SVGS.messages.hostTransfer;
        case MessageType.BECOME_MANAGER_STUDIO: return SVGS.messages.ownerInvite;
        case MessageType.USER_JOIN: return SVGS.messages.follow;
        default: return SVGS.messages.comment;
    }
};


type MessageRowProps = {
    message: Message;
    myUsername?: string;
    isUnread: boolean;
};

const MessageRow = memo(({
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

                    { message.type === MessageType.FOLLOW_USER && 
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> is now following you
                        </Text> 
                    }

                    { message.type === MessageType.LOVE_PROJECT &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> loved your project <Link style={styles.linkText} href={`/projects/${message.project.id}`}>
                                {message.project.title}
                            </Link>
                        </Text> 
                    }

                    { message.type === MessageType.FAVORITE_PROJECT &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> favorited your project <Link style={styles.linkText} href={`/projects/${message.project.id}`}>
                                {message.project.title}
                            </Link>
                        </Text>
                    }

                    { message.type === MessageType.ADD_COMMENT &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link>

                            { message.comment.type === 'project' && <>
                                    { !!message.commentee 
                                        ? ' replied to your comment on ' 
                                        : ' commented on your project ' }
                                    <Link style={styles.linkText} href={`/projects/${message.object.id}?commentId=${message.comment.id}`}>
                                         {message.object.title }
                                    </Link>
                                </>
                            }
                            { message.comment.type === 'user' && <>
                                    { !!message.commentee 
                                        ? ' replied to your comment on ' 
                                        : ' commented on ' }
                                    <Link style={styles.linkText} href={`/users/${message.object.title}?commentId=${message.comment.id}`}>
                                        { message.object.title === myUsername
                                            ? 'your profile'
                                            : `${message.object.title}'s profile`
                                        }
                                    </Link>
                                </>
                            }
                            { message.comment.type === 'studio' && <>
                                    { !!message.commentee 
                                        ? ' replied to your comment in ' 
                                        : ' commented in studio ' }
                                    <Link style={styles.linkText} href={`/studios/${message.object.id}?commentId=${message.comment.id}`}>
                                        {message.object.title}
                                    </Link>
                                </>
                            }
                        </Text>
                    }

                    { message.type === MessageType.CURATOR_INVITE &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> invited you to curate the studio <Link style={styles.linkText} href={`/studios/${message.studio.id}`}>
                                {message.studio.title}
                            </Link>
                        </Text>
                    }

                    { message.type === MessageType.REMIX_PROJECT &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> remixed your project <Link style={styles.linkText} href={`/projects/${message.parent.id}`}>
                                {message.parent.title}
                            </Link>. Check out <Link style={styles.linkText} href={`/projects/${message.project.id}`}>the remix</Link>!
                        </Text>
                    }

                    { message.type === MessageType.STUDIO_ACTIVITY &&
                        <Text style={styles.text}>
                            There was new activivty in <Link style={styles.linkText} href={`/studios/${message.studio.id}`}>
                                {message.studio.title}
                            </Link> today
                        </Text>
                    }

                    { message.type === MessageType.FORUM_POST &&
                        <Text style={styles.text}>
                            There are new posts in the forum thread: <Link style={styles.linkText} href={`https://scratch.mit.edu/discuss/topic/${message.topic.id}`}>
                                {message.topic.title}
                            </Link>
                        </Text>
                    }

                    { message.type === MessageType.BECOME_MANAGER_STUDIO &&
                        <Text style={styles.text}>
                            <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> promoted you to manager for the studio <Link style={styles.linkText} href={`/studios/${message.studio.id}`}>
                                {message.studio.title}
                            </Link>
                        </Text>
                    }

                    { message.type === MessageType.BECOME_HOST_STUDIO &&
                        <Text style={styles.text}>
                            { message.actorIsAdmin ? 'A Scratch Team member' : <Link style={styles.linkText} href={`/users/${message.actor.username}`}>
                                {message.actor.username}
                            </Link> } made you the host of the studio <Link style={styles.linkText} href={`/studios/${message.studio.id}`}>
                                {message.studio.title}
                            </Link>. As host, you now have the ability to edit the studio title, thumbnail, and description. Go say hello in the studio!
                        </Text>
                    }

                    { message.type === MessageType.USER_JOIN &&
                        <Text style={styles.text}>
                            Welcome to Scratch! After you make projects and comments, you'll get messages about them here. Go explore or create.
                        </Text>
                    }

                </View>

                { message.type === 'addcomment' && 
                    <View style={styles.commentWrapper}>
                        <Image source={{ uri: $u(
                            `https://uploads.scratch.mit.edu/get_image/user/${message.actor.id}_32x32.png`,
                            message.actor.username, message.actor.id) }} style={styles.commentAvatar} />
                        <View style={styles.commentBubbleDeco} />
                        <View style={styles.commentBubble}>
                            <CommentContent 
                                content={message.comment.content}
                                numberOfLines={16}
                            />
                        </View>
                    </View>
                }
            </View>

            <Text style={styles.dateText}>
                { shortRelativeDate(message.date) }
            </Text>
        </View>
    );
});

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
        color: "#93C0FF",
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
