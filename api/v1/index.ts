import { API_LEGACY_AJAX_ENDPOINT, API_LEGACY_ENDPOINT, API_MODERN_ENDPOINT, API_PROJECTS_ENDPOINT, DEFAULT_PFP_URL, WEBSITE_URL } from "./constants";

import { getAdminAlerts } from "./queries/getAdminAlerts";
import { getFeatured } from "./queries/getFeatured";
import { getFollowingActivity } from "./queries/getFollowingActivity";
import { getFollowingLoves } from "./queries/getFollowingLoves";
import { getMessages, getMessagesPerPage } from "./queries/getMessages";
import { getMystuff, getMystuffItemsPerPage } from "./queries/getMystuff";
import { getProject } from "./queries/getProject";
import { getProjectCommentFlags, getProjectCommentHighlight, getProjectReplies, getProjectRootComments } from "./queries/getProjectComments";
import { getSession } from "./queries/getSession";
import { getUnreadCount } from "./queries/getUnreadCount";
import { getUser } from "./queries/getUser";
import { getUserActivity } from "./queries/getUserActivity";
import { getUserCommentFlags, getUserCommentHighlight, getUserReplies, getUserRootComments } from "./queries/getUserComments";

import { addProjectComment } from "./actions/addProjectComment";
import { addUserComment } from "./actions/addUserComment";
import { deleteMessage } from "./actions/deleteMessage";
import { deleteProjectComment } from "./actions/deleteProjectComment";
import { deleteUserComment } from "./actions/deleteUserComment";
import { followUser } from "./actions/followUser";
import { login } from "./actions/login";
import { markMessagesRead } from "./actions/markMessagesRead";
import { rateProject } from "./actions/rateProject";
import { reportProjectComment } from "./actions/reportProjectComment";
import { reportUserComment } from "./actions/reportUserComment";
import { toggleProjectComments } from "./actions/toggleProjectComments";
import { toggleUserComments } from "./actions/toggleUserComments";

export default {
    info: {
        id: 'scratchdroid.scratch.v1',
        name: 'Scratch API (Legacy)',
        authors: ['azureitte'],
    },

    config: {
        websiteUrl: WEBSITE_URL,
        apiEndpoints: [
            API_MODERN_ENDPOINT,
            API_PROJECTS_ENDPOINT,
            API_LEGACY_ENDPOINT,
            API_LEGACY_AJAX_ENDPOINT,
        ],
        defaultPfpUrl: DEFAULT_PFP_URL,
    },

    q: {
        getSession,

        getFeatured,
        getFollowingActivity,
        getFollowingLoves,

        getMessages,
        getAdminAlerts,
        getMessagesPerPage,
        getUnreadCount,

        getMystuff,
        getMystuffItemsPerPage,

        getUser,
        getUserActivity,
        getUserRootComments,
        getUserReplies,
        getUserCommentHighlight,
        getUserCommentFlags,

        getProject,
        getProjectRootComments,
        getProjectReplies,
        getProjectCommentHighlight,
        getProjectCommentFlags,
    },

    a: {
        login,

        markMessagesRead,
        deleteMessage,

        followUser,
        rateProject,

        addUserComment,
        deleteUserComment,
        reportUserComment,
        toggleUserComments,

        addProjectComment,
        deleteProjectComment,
        reportProjectComment,
        toggleProjectComments,
    },
}