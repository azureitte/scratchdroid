import { FeaturedTab } from "@/util/types/featured.types";
import { ScratchFeaturedProject, ScratchFeaturedStudio, ScratchFeaturedTab } from "../types/featured.types";
import { apiReq } from "../request";
import { CarouselProject, CarouselStudio } from "@/util/types/users.types";

const serializeFeaturedProject = (project: ScratchFeaturedProject): CarouselProject => ({
    id: project.id,
    title: project.title,
    author: project.creator,
    loves: project.love_count,
});

const serializeFeaturedStudio = (studio: ScratchFeaturedStudio): CarouselStudio => ({
    id: studio.id,
    title: studio.title,
});

export const getFeatured = async (): Promise<FeaturedTab> => {
    const res = await apiReq<ScratchFeaturedTab>({
        host: 'https://api.scratch.mit.edu',
        path: '/proxy/featured/',
        responseType: 'json',
    });
    if (!res.success) throw new Error(res.error);
    return {
        featuredProjects: res.data.community_featured_projects.map(serializeFeaturedProject),
        featuredStudios: res.data.community_featured_studios.map(serializeFeaturedStudio),
        recentProjects: res.data.community_newest_projects.map(serializeFeaturedProject),
        designStudio: res.data.scratch_design_studio.map(serializeFeaturedProject),
        designStudioTitle: res.data.scratch_design_studio[0]?.gallery_title,
    }
}