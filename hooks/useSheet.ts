import { emit } from "@/util/eventBus";
import type { SheetMenuName } from "@/components/app/Sheet";

export const useSheet = () => {
    const push = <T extends any>(name: SheetMenuName, props?: T) => {
        emit('sheet-push', name, props);
    };

    const pop = () => {
        emit('sheet-pop');
    };

    const replace = <T extends any>(name: SheetMenuName, props?: T) => {
        emit('sheet-replace', name, props);
    };

    const clear = () => {
        emit('sheet-clear');
    };

    const block = () => {
        emit('sheet-block');
    };

    const unblock = () => {
        emit('sheet-unblock');
    };

    return { push, pop, replace, clear, block, unblock };
};