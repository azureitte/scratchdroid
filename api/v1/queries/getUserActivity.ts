import { apiReq } from "../request";
import { getActivityFromR2 } from "../parsers/activity";
import { ActivityUnit } from "@/util/types/activity.types";
import { API_LEGACY_AJAX_ENDPOINT } from "../constants";

type GetUserActivityOptions = {
    username: string;
    from?: number;
    limit?: number;
}

const activityCache: ActivityUnit[] = [];

const hasCache = () => activityCache.length > 0;
const clearCache = () => activityCache.length = 0;

const getCache = (from = 0, limit = 4) => activityCache.slice(from, from + limit);
const setCache = (activity: ActivityUnit[]) => activityCache.push(...activity);

export const getUserActivity = async ({
    username,
    from = 0,
    limit = 4,
}: GetUserActivityOptions): Promise<ActivityUnit[]> => {

    let max = limit;
    if (from > 0) {
        if (hasCache())
            return getCache(from, limit);

        max = 1000;
    } else {
        clearCache();
    }

    const res = await apiReq({
        endpoint: API_LEGACY_AJAX_ENDPOINT,
        path: `/user-activity/`,
        params: { user: username, max },
        responseType: 'html',
    });

    if (!res.success) throw new Error(res.error);
    if (res.status >= 299) throw new Error('Something went wrong');

    const newData = getActivityFromR2(res.data);
    if (from === 0) return newData;

    setCache(newData);
    return getCache(from, limit);

}