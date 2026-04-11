import { apiReq } from "../request";
import { FeaturedTab } from "../types/featured.types";

export const getFeatured = async () => {
    const res = await apiReq<FeaturedTab>({
        host: 'https://api.scratch.mit.edu',
        path: '/proxy/featured/',
        responseType: 'json',
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
}