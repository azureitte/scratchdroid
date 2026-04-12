import { CarouselProject, CarouselStudio } from "./users.types";

export type FeaturedTab = {
    featuredProjects: CarouselProject[];
    featuredStudios: CarouselStudio[];
    recentProjects: CarouselProject[];
    designStudio: CarouselProject[];
    designStudioTitle?: string;
}