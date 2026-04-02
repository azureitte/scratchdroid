import { DEFAULT_RIPPLE_CONFIG } from '@/util/constants';
import { truncateText } from '@/util/functions';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

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

    maxLength?: number;
    lengthBehavior?: 'distribute'|'duplicate';
}

const InfoCard = ({
    sections,
    childTitle,
    children,
    subtext,
    href,

    maxLength = 800,
    lengthBehavior = 'distribute',
}: InfoCardProps) => {
    
    const router = useRouter();

    const nonEmptySections = sections.filter(s => !!s.text);

    const lengthPerSection = (lengthBehavior === 'distribute')
        ? Math.round(maxLength / nonEmptySections.length)
        : maxLength;

    return (
        <Pressable 
            style={styles.contentCard}
            onPress={() => router.push(href!)}
            android_ripple={DEFAULT_RIPPLE_CONFIG}
        >
            { nonEmptySections.map((section) => {
                const [text, isTruncated] = truncateText(section.text!, lengthPerSection);

                return <React.Fragment key={section.title}>
                    <Text style={styles.contentCardTitle}>{section.title}</Text>
                    <Text style={styles.contentCardText} selectable>
                        { text }
                        { isTruncated && href && 
                            <Link href={href} style={styles.link}>
                                {'\nRead More'}
                            </Link> }
                    </Text>
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
};

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
    contentCardSubtext: {
        fontSize: 16,
        color: '#888',
        fontWeight: 500,
        marginTop: 12,
        marginBottom: 8,
    },
    link: {
        color: "#71A3FF",
        fontWeight: 500,
        fontSize: 16,
        fontStyle: 'normal',
        textDecorationLine: 'underline',
    },
});
