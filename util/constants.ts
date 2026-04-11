export const IS_DEV = process.env.NODE_ENV === 'development';

export const WEBSITE_URL = 'https://scratch.mit.edu';

export const DEFAULT_PFP_URL = 'https://cdn2.scratch.mit.edu/get_image/user/default_60x60.png';

export const DEFAULT_RIPPLE_CONFIG = { 
    color: "#fff3", 
    foreground: true 
};

export const PROJECT_CARD_THUMBNAIL_HEIGHT = 120;
export const USER_CARD_THUMBNAIL_HEIGHT = 67;

export const DEFAULT_REPLY_COUNT = 3;
export const REPLY_INCREMENT_COUNT = 10;

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