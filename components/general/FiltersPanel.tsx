import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type Filter = {
    key: string;
    title: string;
}

type FiltersPanelProps = {
    filters: Filter[];
    defaultFilter?: string;

    value: string[];
    onChange?: (newValue: string[]) => void;

    singleChoice?: boolean;
    canUnpress?: boolean;
};

const FiltersPanel = ({
    filters,
    defaultFilter = 'all',
    value,
    onChange,
    singleChoice = true,
    canUnpress = true,
}: FiltersPanelProps) => {

    const selectedIndicies = value.map(filter => filters.findIndex(f => f.key === filter));

    const handlePress = (filter: Filter) => {
        if (singleChoice) {
            if (canUnpress && value.includes(filter.key)) {
                onChange?.([defaultFilter]);
            } else {
                onChange?.([filter.key]);
            }
        } else {
            const newValue = value.includes(filter.key) 
                ? value.filter(key => key !== filter.key) 
                : [...value, filter.key];
            onChange?.(newValue.length === 0 ? [defaultFilter] : newValue);
        }
    };

    return (
        <View style={styles.container}>
            { filters.map((filter, idx) => (
                <Pressable 
                    key={filter.key} 
                    style={[
                        styles.filter, 
                        selectedIndicies.includes(idx) && styles.filterSelected
                    ]}
                    onPress={() => handlePress(filter)}
                    android_ripple={{ color: "#fff3", foreground: true }}
                >
                    <Text style={[
                        styles.filterText, 
                        selectedIndicies.includes(idx) && styles.filterSelectedText
                    ]}>
                        {filter.title}
                    </Text>
                </Pressable>
            )) }
        </View>
    );
};

export default FiltersPanel;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 16,
        zIndex: 1,
    },

    filter: {
        height: 36,
        paddingHorizontal: 18,
        backgroundColor: "#2D2D2D",
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    filterSelected: {
        backgroundColor: "#fff",
    },

    filterText: {
        fontSize: 16,
        fontWeight: 500,
        color: "#fff",
    },
    filterSelectedText: {
        color: "#000",
    },
});
