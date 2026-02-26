import axiosInstance from "@/lib/apis/axios-client";
import {
    PromptStatus,
    CreatePromptConfig,
    UpdatePromptConfig,
} from "@/types/ai-prompt";

export const AiPromptService = {
    getAll: async (): Promise<PromptStatus[]> => {
        const response = await axiosInstance.get("/admin/prompts");
        return response.data.data;
    },

    getById: async (id: number): Promise<PromptStatus> => {
        const response = await axiosInstance.get(`/admin/prompts/${id}`);
        return response.data.data;
    },

    create: async (data: CreatePromptConfig): Promise<PromptStatus> => {
        const response = await axiosInstance.post("/admin/prompts", data);
        return response.data.data;
    },

    update: async (id: number, data: UpdatePromptConfig): Promise<PromptStatus> => {
        const response = await axiosInstance.patch(`/admin/prompts/${id}`, data);
        return response.data.data;
    },

    deactivate: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/admin/prompts/${id}`);
    },

    clearAllCache: async (): Promise<void> => {
        await axiosInstance.delete("/admin/prompts/cache");
    },

    clearCacheByFeature: async (featureName: string): Promise<void> => {
        await axiosInstance.delete(`/admin/prompts/cache/${featureName}`);
    },
};
