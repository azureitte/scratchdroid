import React from 'react';
import { StyleSheet, Text, Image, View } from 'react-native';
import { Link } from 'expo-router';

import { EMOJI_CONTAIN_CODES } from '@/util/constants';
import type { CommentContentNode } from '@/util/types/app/comments.types';

type CommentContentProps = {
    content: CommentContentNode[];
    numberOfLines?: number;
    isReported?: boolean;
}

const CommentContent = ({
    content,
    numberOfLines,
    isReported,
}: CommentContentProps) => {
    return (
        <Text
            style={[
                styles.text,
                isReported && styles.textReported,
            ]}
            numberOfLines={numberOfLines}
        >
            {content.map((node) => {
                if (!node) return '';

                if (node.type === 'text')
                    return (
                        <React.Fragment key={node.key}>
                            {node.text}
                        </React.Fragment>
                    );
                if (node.type === 'link')
                    return (
                        <Link
                            href={node.url}
                            key={node.key}
                            style={styles.link}
                        >
                            {node.text}
                        </Link>
                    );
                if (node.type === 'mention')
                    return (
                        <Link
                            href={`/users/${node.username}`}
                            key={node.key}
                            style={styles.mentionLink}
                        >
                            {node.text}
                        </Link>
                    );
                if (node.type === 'emoji')
                    return (
                        <View key={node.key} style={styles.emojiWrapper}>
                            <Image
                                source={{ uri: node.imageUrl }}
                                style={[
                                    styles.emoji,
                                    {
                                        objectFit: EMOJI_CONTAIN_CODES.includes(
                                            node.text,
                                        )
                                            ? 'contain'
                                            : 'cover',
                                    },
                                ]}
                            />
                        </View>
                    );

                return '';
            })}
        </Text>
    );
};

export default CommentContent;

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: 400,
        color: "#fff",
    },
    textReported: {
        color: "#FFC2C2",
    },
    link: {
        color: "#93C0FF",
        fontWeight: 500,
        fontSize: 16,
        fontStyle: 'normal',
        textDecorationLine: 'underline',
    },
    mentionLink: {
        color: "#93C0FF",
        fontWeight: 500,
        fontSize: 16,
        fontStyle: 'normal',
    },
    emojiWrapper: {
        width: 30,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        width: 28,
        height: 25,
        transform: [{ scale: 0.9 }, { translateX: -2 }],
        objectFit: 'cover',
    },
});
