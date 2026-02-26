export interface PromptStatus {
    id: number;
    featureName: string;
    description: string | null;
    langfusePromptName: string;
    langfuseLabel: string;
    isActive: boolean;
    cached: boolean;
    cachedVersion: number | null;
    lastSyncedAt: string | null;
    langfuseUrl: string | null;
}

export interface CreatePromptConfig {
    featureName: string;
    description?: string;
    langfusePromptName: string;
    langfuseLabel?: string;
    isActive?: boolean;
}

export interface UpdatePromptConfig {
    description?: string;
    langfusePromptName?: string;
    langfuseLabel?: string;
    isActive?: boolean;
}

export interface PromptListResponse {
    data: PromptStatus[];
}
