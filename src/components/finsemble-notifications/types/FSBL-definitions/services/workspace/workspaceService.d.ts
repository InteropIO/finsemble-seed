import { Workspace, ActiveWorkspace, GroupData } from "../../common/workspace";
export declare type WorkspaceStateUpdate = {
    activeWorkspace: ActiveWorkspace;
    workspaces: Workspace[];
    groups: Record<string, GroupData>;
    reason: string;
};
