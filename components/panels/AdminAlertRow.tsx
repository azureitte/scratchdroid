import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ScratchAdminAlert } from "@/util/types/api/message.types";

import { shortDate } from "@/util/functions";
import { ICONS } from "@/util/assets";


type MessageRowProps = {
    message: ScratchAdminAlert;
    onClose?: () => void;
};

const MessageRow = memo(({
    message,
    onClose,
}: MessageRowProps) => {
    const IconClose = ICONS.close;

    return (
        <View style={[styles.container]}>
            <View style={styles.contentWrapper}>
                <Text style={styles.text}>
                    { message.message }
                </Text>

                <Text style={styles.subtext}>
                    { shortDate(new Date(message.datetime_created)) } • Scratch Team
                </Text>

                <Pressable
                    style={styles.closeBtn}
                    onPress={onClose}
                >
                    <IconClose />
                </Pressable>
            </View>
        </View>
    );
});

export default MessageRow;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#262626",
        gap: 16,
    },

    contentWrapper: {
        flex: 1,
        flexDirection: "column",
        gap: 8,
        backgroundColor: '#1d2b4d',
        borderRadius: 8,
        position: 'relative',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    text: {
        width: '90%',
        fontSize: 16,
        fontWeight: 500,
        color: "#fff",
        lineHeight: 26,
    },

    subtext: {
        color: '#6780ba',
        fontSize: 14,
    },

    closeBtn: {
        position: 'absolute',
        top: 8,
        right: 12,
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4177FF',
        borderRadius: 8,
    }
});
