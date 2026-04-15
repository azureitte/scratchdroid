import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ICONS } from "@/util/assets";
import { useSheet } from "@/hooks/useSheet";
import { SelectMenuProps } from "@/app-menus/select.menu";

export type SelectItem = {
    value: string;
    label: string;
    icon?: string;
}

type SelectProps = {
    label?: string;
    items: SelectItem[];
    value: string;
    onChange?: (value: string) => void;
};

const Select = ({
    label,
    items,
    value,
    onChange,
}: SelectProps) => {

    const sheet = useSheet();
    const CollapseIcon = ICONS.cardViewMore;

    return (
        <>
            { label && <Text style={styles.inputLabel}>{label}</Text> }
            <Pressable 
                style={styles.inputWrapper}
                onPress={() => {
                    sheet.push<SelectMenuProps>('select', {
                        items: items.map(item => ({
                            key: item.value,
                            label: item.label,
                            icon: item.icon,
                            onPress: () => {
                                onChange?.(item.value);
                            },
                        })),
                        title: label,
                    });
                }}
            >
                <TextInput 
                    value={items.find(item => item.value === value)?.label ?? value}
                    style={styles.input} 
                    focusable={false}
                    editable={false}
                />
                <CollapseIcon style={styles.collapseIcon} />
            </Pressable>
        </>
    );
};

export default Select;

const styles = StyleSheet.create({
    inputWrapper: {
        width: "100%",
        borderColor: "#3D3D3D",
        backgroundColor: "#272727",
        borderWidth: 2,
        marginBottom: 32,
        borderRadius: 12,
        position: 'relative',
    },
    input: {
        width: "100%",
        paddingHorizontal: 24,
        paddingVertical: 16,
        color: "#fff",
        fontSize: 18,
        fontWeight: 500,
    },
    inputLabel: {
        color: "#fff",
        width: "100%",
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    collapseIcon: {
        position: 'absolute',
        right: 16,
        top: 14,
        width: 18,
        height: 18,
        transform: [{ rotate: '90deg' }],
    },
});
