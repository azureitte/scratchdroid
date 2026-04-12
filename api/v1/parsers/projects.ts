import type { ScratchProjectFile } from "../types/project.types";

export function projectHasCloudVariables (project?: ScratchProjectFile|null) {
    if (!project) return false;

    const stageTarget = project.targets?.find(t => t.isStage);
    if (!stageTarget) return false;

    try {
        return Object.values(stageTarget.variables).some((v: any) => v[2] === true);
    } catch {
        return false;
    }
}