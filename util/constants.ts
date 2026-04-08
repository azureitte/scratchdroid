import { muteStatusDateToString } from "./functions";
import type { MuteStatus } from "./types/api/account.types";

export const IS_DEV = process.env.NODE_ENV === 'development';

export const WEBSITE_URL = 'https://scratch.mit.edu';

export const DEFAULT_RIPPLE_CONFIG = { 
    color: "#fff3", 
    foreground: true 
};

export const PROJECT_CARD_THUMBNAIL_HEIGHT = 120;
export const USER_CARD_THUMBNAIL_HEIGHT = 67;

export const DEFAULT_REPLY_COUNT = 3;
export const REPLY_INCREMENT_COUNT = 10;

export const FAIL_REASON_MESSAGES: Record<string, (muteStatus?: MuteStatus) => string> = {
    error: (_?: MuteStatus) => 'Oops! Something went wrong',

    isBad: (muteStatus?: MuteStatus) => {
        if (!muteStatus) 
            return 'Hmm...the bad word detector thinks there is a problem with your comment. Please change it and remember to be respectful.';

        let s = '';
        switch (muteStatus.currentMessageType) {
            case 'pii': 
                s += 'Your comment appeared to be sharing or asking for private information.'; break;
            case 'unconstructive': 
                s += 'It appears that your comment was saying something that might have been hurtful.'; break;
            case 'vulgarity': 
                s += 'It appears that your comment contains a bad word.'; break;
            case 'spam': 
                s += 'Your most recent comment appeared to contain advertising, text art, or a chain message.'; break;
            default: 
                s += 'It appears that your comment didn\u2019t follow the Scratch Community Guidelines.'; break;
        }

        s += ' ';
        s += FAIL_REASON_MESSAGES.isMuted(muteStatus);
        return s;
    },
    
    hasChatSite: (_?: MuteStatus) =>
       'Uh oh! This comment contains a link to a website with unmoderated chat. For safety reasons, please do not link to these sites!',
    isEmpty: (_?: MuteStatus) => "You can't post an empty comment!",
    isSpam: (_?: MuteStatus) => 
       "Hmm, seems like you've posted the same comment a bunch of times. Please don't spam.",
    isFlood: (_?: MuteStatus) =>
       "Woah, seems like you're commenting really quickly. Please wait longer between posts.",
    isMuted: (muteStatus?: MuteStatus) => muteStatus === undefined 
       ? "Hmm, the filterbot is pretty sure your recent comments weren't ok for Scratch, so your account has been muted for the rest of the day. :/"
       : `You will be able to comment again ${muteStatusDateToString(muteStatus.muteExpiresAt)}. Your account has been paused from commenting until then.`,
    isUnconstructive: (_?: MuteStatus) =>
       "Hmm, the filterbot thinks your comment may be mean or disrespectful. Remember, most projects on Scratch are made by people who are just learning how to program. Read the community guidelines, and be nice.",
    isDisallowed: (_?: MuteStatus) =>
       'Hmm, it looks like comments have been turned off for this page. :/',
    isIPMuted: (_?: MuteStatus) =>
       'Your IP address has been muted from commenting on this site.',
    isTooLong: (_?: MuteStatus) =>
        "That's too long!",
}

export const SCRATCH_EMOJI_CODES: Record<string, string> = {
    'meow': '_meow_',
    'camera': '_camera_',
    'map': '_map_',
    'pizza': '_pizza_',
    'cat': '_:)_',
    'aww-cat': '_:D_',
    'wink-cat': '_;P_',
    'lol-cat': '_:\'P_',
    'love-it-cat': '_<3_',
    'fav-it-cat': '_**_',
    'cool-cat': '_B)_',
    'tongue-out-cat': '_:P_',
    'pizza-cat': '_:D<_',
    'rainbow-cat': '_:))_',
}

export const EMOJI_CONTAIN_CODES = [
    '_camera_', '_map_', '_pizza_', '_meow_',
]