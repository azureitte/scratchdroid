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
import icMore from "../assets/icons/ic-more.svg";
import icClose from "../assets/icons/ic-close.svg";
import icReply from "../assets/icons/ic-reply.svg";
import icAdd from "../assets/icons/ic-add.svg";
import icAccountSettings from "../assets/icons/ic-account-settings.svg";
import icLogout from "../assets/icons/ic-logout.svg";
import icCopy from "../assets/icons/ic-copy.svg";
import icShare from "../assets/icons/ic-share.svg";
import icReplyAlt from "../assets/icons/ic-reply-alt.svg";
import icDelete from "../assets/icons/ic-delete.svg";
import icReport from "../assets/icons/ic-report.svg";
import icLink from "../assets/icons/ic-link.svg";
import icDownload from "../assets/icons/ic-download.svg";
import icFollow from "../assets/icons/ic-follow.svg";
import icComments from "../assets/icons/ic-comments.svg";

import icStatView from "../assets/icons/ic-stat-view.svg";
import icStatLove from "../assets/icons/ic-stat-love.svg";
import icLoveInactive from "../assets/icons/ic-love-inactive.svg";
import icLoveActive from "../assets/icons/ic-love-active.svg";
import icFavInactive from "../assets/icons/ic-fav-inactive.svg";
import icFavActive from "../assets/icons/ic-fav-active.svg";
import icRemix from "../assets/icons/ic-remix.svg";
import icView from "../assets/icons/ic-view.svg";
import icSettings from "../assets/icons/ic-settings.svg";
import icRefresh from "../assets/icons/ic-refresh.svg";

import svgMessageComment from "../assets/svgs/messages/comment.svg";
import svgMessageLove from "../assets/svgs/messages/love.svg";
import svgMessageFavorite from "../assets/svgs/messages/favorite.svg";
import svgMessageFollow from "../assets/svgs/messages/follow.svg";
import svgMessageFollowStudio from "../assets/svgs/messages/follow-studio.svg";
import svgMessageCuratorInvite from "../assets/svgs/messages/curator-invite.svg";
import svgMessageRemix from "../assets/svgs/messages/remix.svg";
import svgMessageStudioActivity from "../assets/svgs/messages/studio-activity.svg";
import svgMessageForumActivity from "../assets/svgs/messages/forum-activity.svg";
import svgMessageHostTransfer from "../assets/svgs/messages/host-transfer.svg";
import svgMessageOwnerInvite from "../assets/svgs/messages/owner-invite.svg";
import svgMessageProject from "../assets/svgs/messages/project.svg";

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
import pngArtScratchNews from "../assets/art/scratchnews.png";

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
    more: icMore,
    close: icClose,
    reply: icReply,
    add: icAdd,
    accountSettings: icAccountSettings,
    logout: icLogout,
    copy: icCopy,
    share: icShare,
    replyAlt: icReplyAlt,
    delete: icDelete,
    report: icReport,
    link: icLink,
    download: icDownload,
    follow: icFollow,
    comments: icComments,
    settings: icSettings,
    refresh: icRefresh,

    statView: icStatView,
    statLove: icStatLove,
    loveInactive: icLoveInactive,
    loveActive: icLoveActive,
    favInactive: icFavInactive,
    favActive: icFavActive,
    remix: icRemix,
    view: icView,
} as const;

export const IMAGES = {
    logo: require("../assets/logo_sm.png"),
    art: {
        wateringCan: pngArtWateringCan,
        scratchNews: pngArtScratchNews,
    },
} as const;

export const SVGS = {
    messages: {
        comment: svgMessageComment,
        love: svgMessageLove,
        favorite: svgMessageFavorite,
        follow: svgMessageFollow,
        followStudio: svgMessageFollowStudio,
        curatorInvite: svgMessageCuratorInvite,
        remix: svgMessageRemix,
        studioActivity: svgMessageStudioActivity,
        forumActivity: svgMessageForumActivity,
        hostTransfer: svgMessageHostTransfer,
        ownerInvite: svgMessageOwnerInvite,
        project: svgMessageProject,
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