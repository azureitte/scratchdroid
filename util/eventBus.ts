export const events: Map<string, Set<Function>> = new Map();

export const on = (event: string, callback: Function) => {
    if (!events.has(event)) events.set(event, new Set());
    events.get(event)?.add(callback);
};

export const off = (event: string, callback: Function) => {
    if (!events.has(event)) return;
    events.get(event)?.delete(callback);
};

export const emit = (event: string, ...args: any[]) => {
    if (!events.has(event)) return;
    events.get(event)?.forEach(callback => callback(...args));
};