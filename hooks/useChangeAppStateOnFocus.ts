import { useContext } from "react";
import { useFocusEffect } from "expo-router";
import { AppContext } from "@/context/AppContext";

type ChangeAppStateOnFocusProps = {
    headerVisible?: boolean;
    footerVisible?: boolean;
    primaryColor?: 'regular'|'explore';
}

export const useChangeAppStateOnFocus = ({
    headerVisible: newHeaderVisible,
    footerVisible: newFooterVisible,
    primaryColor: newPrimaryColor,
}: ChangeAppStateOnFocusProps) => {
    const { 
        setHeaderVisible, 
        setFooterVisible, 
        setPrimaryColor,
        headerVisible,
        footerVisible,
        primaryColor,
    } = useContext(AppContext);

    const cb = () => {
        setTimeout(() => {
            if (newHeaderVisible !== undefined && headerVisible !== newHeaderVisible) setHeaderVisible(newHeaderVisible);
            if (newFooterVisible !== undefined && footerVisible !== newFooterVisible) setFooterVisible(newFooterVisible);
            if (newPrimaryColor !== undefined && primaryColor !== newPrimaryColor) setPrimaryColor(newPrimaryColor);
        }, 0);
    };

    useFocusEffect(cb);
};