import icHome from "../assets/icons/ic-home.svg";
import icExplore from "../assets/icons/ic-explore.svg";
import icMessages from "../assets/icons/ic-messages.svg";
import icMyStuff from "../assets/icons/ic-mystuff.svg";
import icCreate from "../assets/icons/ic-create.svg";

import icHomeActive from "../assets/icons/ic-home-active.svg";
import icExploreActive from "../assets/icons/ic-explore-active.svg";
import icMessagesActive from "../assets/icons/ic-messages-active.svg";
import icMyStuffActive from "../assets/icons/ic-mystuff-active.svg";

import icMenu from "../assets/icons/ic-menu.svg";

import icStatView from "../assets/icons/ic-stat-view.svg";
import icStatLove from "../assets/icons/ic-stat-love.svg";

import svgMessageComment from "../assets/svgs/messages/comment.svg";
import svgMessageLove from "../assets/svgs/messages/love.svg";
import svgMessageFavorite from "../assets/svgs/messages/favorite.svg";
import svgMessageFollow from "../assets/svgs/messages/follow.svg";
import svgMessageCuratorInvite from "../assets/svgs/messages/curator-invite.svg";
import svgMessageRemix from "../assets/svgs/messages/remix.svg";
import svgMessageStudioActivity from "../assets/svgs/messages/studio-activity.svg";
import svgMessageForumActivity from "../assets/svgs/messages/forum-activity.svg";
import svgMessageHostTransfer from "../assets/svgs/messages/host-transfer.svg";
import svgMessageOwnerInvite from "../assets/svgs/messages/owner-invite.svg";

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

    menu: icMenu,

    statView: icStatView,
    statLove: icStatLove,
} as const;

export const IMAGES = {
    logo: require("../assets/logo_sm.png"),
} as const;

export const SVGS = {
    messages: {
        comment: svgMessageComment,
        love: svgMessageLove,
        favorite: svgMessageFavorite,
        follow: svgMessageFollow,
        curatorInvite: svgMessageCuratorInvite,
        remix: svgMessageRemix,
        studioActivity: svgMessageStudioActivity,
        forumActivity: svgMessageForumActivity,
        hostTransfer: svgMessageHostTransfer,
        ownerInvite: svgMessageOwnerInvite,
    },
} as const;

export const FONTS = {
    delaGothicOne: 'DelaGothicOne_400Regular',
}