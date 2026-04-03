import { useState, useEffect } from 'react';

export function useStack<T>(initial: T[] = []) {
    const [stack, setStack] = useState<T[]>(initial);

    const push = (item: T) => {
        if (stack.includes(item)) {
            // pop items from the stack to return to the target item
            setStack(stack.slice(0, stack.indexOf(item) + 1));
            return;
        }
        setStack(stack.concat(item));
    };

    const replace = (item: T) => {
        setStack([item]);
    };

    const pop = () => {
        setStack(stack.slice(0, -1));
    };

    const clear = () => {
        setStack([]);
    };

    const current = stack[stack.length - 1];
    const size = stack.length;

    return { stack, push, replace, pop, clear, current, size };
}