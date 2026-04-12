import React, { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { truncateText } from '@/util/functions';
import { parseMultilineRichText } from '@/util/parsing';
import { useRouter } from 'expo-router';
import CommentContent from './CommentContent';
import { CommentContentNode } from '@/util/types/comments.types';

type InfoSection = {
    title: string;
    text?: string;
}

type InfoCardProps = {
    sections: InfoSection[];
    childTitle?: string|false;
    children?: React.ReactNode;
    subtext?: string;
    href?: string;
    onPress?: () => void;

    maxLength?: number;
    lengthBehavior?: 'distribute'|'duplicate';
    variation?: 'regular'|'full';
    expandHeight?: boolean;
}

const InfoCard = forwardRef(({
    sections,
    childTitle,
    children,
    subtext,
    href,
    onPress,

    maxLength = 800,
    lengthBehavior = 'distribute',
    variation = 'regular',
    expandHeight = false,
}: InfoCardProps, ref?: React.ForwardedRef<View>|null) => {
    
    const router = useRouter();

    const nonEmptySections = sections.filter(s => !!s.text);

    const memoKey = nonEmptySections.map(s => s.text).join('');
    
    const lengthPerSection = (lengthBehavior === 'distribute')
        ? Math.round(maxLength / nonEmptySections.length)
        : maxLength;

    // memoized formatted and truncated texts
    // we do this to avoid calling the expensive format function as much as possible
    const formattedContents = useMemo(() => {
        return nonEmptySections.map((section): [CommentContentNode[], boolean] => {
            const [text, isTruncated] = truncateText(section.text!, lengthPerSection);
            return [parseMultilineRichText(text), isTruncated];
        });
    }, [memoKey, lengthPerSection]);

    return (
        <Pressable 
            style={[
                styles.contentCard, 
                variation === 'full' && styles.contentCardFull,
                expandHeight && styles.contentCardExpand,
            ]}
            onPress={() => {
                if (href) router.push(href);
                if (onPress) onPress();
            }}
            android_ripple={href ? DEFAULT_RIPPLE_CONFIG : undefined}
            ref={ref}
        >
            { nonEmptySections.map((section, idx) => {
                const [content, isTruncated] = formattedContents[idx];

                return <React.Fragment key={section.title}>
                    <Text style={[
                        styles.contentCardTitle,
                        variation === 'full' && styles.contentCardTitleFull,
                    ]}>{section.title}</Text>
                    <CommentContent 
                        content={content}
                        style={[
                            styles.contentCardText,
                            variation === 'full' && styles.contentCardTextFull,
                        ]} 
                        selectable
                        readMoreHref={isTruncated ? href : undefined}
                        onReadMore={onPress}
                    />
                </React.Fragment>;
            }) }
            { !!childTitle && <Text style={styles.contentCardTitle}>
                {childTitle}
            </Text> }
            { children }
            { !!subtext && <Text style={styles.contentCardSubtext}>
                { subtext }
            </Text> }
        </Pressable>
    );
});

export default InfoCard;

const styles = StyleSheet.create({
    contentCard: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 8,
        borderRadius: 12,
        backgroundColor: '#1C1C1C',
        gap: 8,
        overflow: 'hidden',
    },
    contentCardFull: {
        paddingHorizontal: 8,
        paddingVertical: 16,
        backgroundColor: '#0000',
    },
    contentCardExpand: {
        minHeight: 240,
    },

    contentCardTitle: {
        fontSize: 14,
        fontWeight: 600,
        color: '#888',
        marginTop: 4,
    },
    contentCardTitleFull: {
        fontSize: 16,
    },

    contentCardText: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: 400,
        color: '#fff',
        marginBottom: 8,
    },
    contentCardTextFull: {
        fontSize: 20,
        marginBottom: 24,
    },

    contentCardSubtext: {
        fontSize: 16,
        color: '#888',
        fontWeight: 500,
        marginTop: 12,
        marginBottom: 8,
    },
});
