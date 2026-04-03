import { emit } from "@/util/eventBus";
import type { SheetMenuName } from "@/components/app/Sheet";

export const useSheet = () => {
    const push = (name: SheetMenuName) => {
        emit('sheet-push', name);
    };

    const replace = (name: SheetMenuName) => {
        emit('sheet-replace', name);
    };

    const clear = () => {
        emit('sheet-clear');
    };

    return { push, replace, clear };
};