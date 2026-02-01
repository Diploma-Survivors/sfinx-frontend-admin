import clientApi from '@/lib/apis/axios-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { SubscriptionPlan, CreatePlanDto, UpdatePlanDto } from '@/types/subscription-plan';

export const subscriptionService = {

    async getAllPlans(lang: string = 'en'): Promise<ApiResponse<SubscriptionPlan[]>> {
        const response = await clientApi.get<ApiResponse<SubscriptionPlan[]>>(
            '/subscription-plans/all',
            { params: { lang } }
        );
        return response.data;
    },

    async createPlan(data: CreatePlanDto): Promise<ApiResponse<SubscriptionPlan>> {
        const response = await clientApi.post<ApiResponse<SubscriptionPlan>>(
            '/subscription-plans',
            data
        );
        return response.data;
    },

    async updatePlan(id: number, data: UpdatePlanDto): Promise<ApiResponse<SubscriptionPlan>> {
        const response = await clientApi.put<ApiResponse<SubscriptionPlan>>(
            `/subscription-plans/${id}`,
            data
        );
        return response.data;
    },

    async getPlan(id: number): Promise<ApiResponse<SubscriptionPlan>> {
        const response = await clientApi.get<ApiResponse<SubscriptionPlan>>(`/subscription-plans/${id}/details`);
        return response.data;
    },

    async deletePlan(id: number): Promise<void> {
        await clientApi.delete(`/subscription-plans/${id}`);
    },
};
