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
import icCardViewMore from "../assets/icons/ic-card-viewmore.svg";
import icClose from "../assets/icons/ic-close.svg";
import icReply from "../assets/icons/ic-reply.svg";

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

import svgProjectExtTts from "../assets/svgs/project/extension-text2speech.svg";
import svgProjectExtVideo from "../assets/svgs/project/extension-videosensing.svg";
import svgProjectExtPen from "../assets/svgs/project/extension-pen.svg";
import svgProjectExtMusic from "../assets/svgs/project/extension-music.svg";
import svgProjectExtGdxfor from "../assets/svgs/project/extension-gdxfor.svg";
import svgProjectExtEv3 from "../assets/svgs/project/extension-ev3.svg";
import svgProjectExtFaceSensing from "../assets/svgs/project/extension-facesensing.svg";
import svgProjectCloud from "../assets/svgs/project/clouddata.svg";

import pngProjectExtTranslate from "../assets/svgs/project/extension-translate.png";
import pngProjectExtMicrobit from "../assets/svgs/project/extension-microbit.png";
import pngProjectMakeymakey from "../assets/svgs/project/extension-makeymakey.png";
import pngProjectWedo2 from "../assets/svgs/project/extension-wedo2.png";

import pngArtWateringCan from "../assets/art/wateringcan.png";

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
    cardViewMore: icCardViewMore,
    close: icClose,
    reply: icReply,

    statView: icStatView,
    statLove: icStatLove,
} as const;

export const IMAGES = {
    logo: require("../assets/logo_sm.png"),
    art: {
        wateringCan: pngArtWateringCan,
    },
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
    project: {
        extTts: svgProjectExtTts,
        extVideo: svgProjectExtVideo,
        extPen: svgProjectExtPen,
        extMusic: svgProjectExtMusic,
        extGdxfor: svgProjectExtGdxfor,
        extEv3: svgProjectExtEv3,
        extFaceSensing: svgProjectExtFaceSensing,
        cloud: svgProjectCloud,
    },
} as const;

export const PNGS = {
    project: {
        extTranslate: pngProjectExtTranslate,
        extMicrobit: pngProjectExtMicrobit,
        extMakeymakey: pngProjectMakeymakey,
        extWedo2: pngProjectWedo2,
    },
} as const;

export const FONTS = {
    delaGothicOne: 'DelaGothicOne_400Regular',
}