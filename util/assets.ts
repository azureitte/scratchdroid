import icHome from "../assets/icons/ic-home.svg";
import icExplore from "../assets/icons/ic-explore.svg";
import icMessages from "../assets/icons/ic-messages.svg";
import icMyStuff from "../assets/icons/ic-mystuff.svg";
import icCreate from "../assets/icons/ic-create.svg";

import icHomeActive from "../assets/icons/ic-home-active.svg";
import icExploreActive from "../assets/icons/ic-explore-active.svg";
import icMessagesActive from "../assets/icons/ic-messages-active.svg";
import icMyStuffActive from "../assets/icons/ic-mystuff-active.svg";

export const ICONS = {
    home: icHome,
    explore: icExplore,
    messages: icMessages,
    mystuff: icMyStuff,
    create: icCreate,

    homeActive: icHomeActive,
    exploreActive: icExploreActive,
    messagesActive: icMessagesActive,
    mystuffActive: icMyStuffActive,
} as const;

export const IMAGES = {
    logo: require("../assets/logo_sm.png"),
} as const;