import type { SheetDetent } from "@lodev09/react-native-true-sheet";
import type { JSX } from "react";

export type SheetMenuDefinition = {
    render: (props?: any) => JSX.Element;
    title?: string;
    detents: SheetDetent[];
    dismissible: boolean;
    isDark?: boolean;
    scrollable?: boolean;
    translate?: boolean;
}

export type PartialSheetMenuDefinition = {
    render: (props?: any) => JSX.Element;
} & Partial<SheetMenuDefinition>;