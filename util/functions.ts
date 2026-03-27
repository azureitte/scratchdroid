export function shortRelativeDate(date: Date) {
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 10) {
        return "now";
    }

    const units = [
        { limit: 60, div: 1, suffix: "s" },
        { limit: 3600, div: 60, suffix: "m" },
        { limit: 86400, div: 3600, suffix: "h" },
        { limit: 604800, div: 86400, suffix: "d" },
        { limit: 2629800, div: 604800, suffix: "w" },
        { limit: 31557600, div: 2629800, suffix: "mo" },
        { limit: Infinity, div: 31557600, suffix: "y" },
    ];

    for (const u of units) {
        if (diff < u.limit) {
            return Math.floor(diff / u.div) + u.suffix;
        }
    }
}

export function relativeDate (date: Date) {
    let diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 10) {
        return "just now";
    }

    const units = [
        { limit: 60, div: 1, suffix: " seconds" },
        { limit: 3600, div: 60, suffix: " minutes" },
        { limit: 86400, div: 3600, suffix: " hours" },
        { limit: 604800, div: 86400, suffix: " days" },
        { limit: 2629800, div: 604800, suffix: " weeks" },
        { limit: 31557600, div: 2629800, suffix: " months" },
        { limit: Infinity, div: 31557600, suffix: " years" },
    ];

    for (const u of units) {
        if (diff < u.limit) {
            return Math.floor(diff / u.div) + u.suffix + " ago";
        }
    }

    return date.toDateString();
}