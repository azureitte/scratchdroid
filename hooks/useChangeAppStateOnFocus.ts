import { useContext } from "react";
import { useFocusEffect } from "expo-router";
import { AppContext } from "@/context/AppContext";

type ChangeAppStateOnFocusProps = {
    headerVisible?: boolean;
    footerVisible?: boolean;
    primaryColor?: 'regular'|'explore';
}

export const useChangeAppStateOnFocus = ({
    headerVisible,
    footerVisible,
    primaryColor,
}: ChangeAppStateOnFocusProps) => {
    const { 
        setHeaderVisible, 
        setFooterVisible, 
        setPrimaryColor 
    } = useContext(AppContext);

    useFocusEffect(() => {
        if (headerVisible !== undefined) setHeaderVisible(headerVisible);
        if (footerVisible !== undefined) setFooterVisible(footerVisible);
        if (primaryColor !== undefined) setPrimaryColor(primaryColor);
    });
};