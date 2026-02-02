import clientApi from '@/lib/apis/axios-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { SubscriptionPlan, CreatePlanDto, UpdatePlanDto, RevenueStats } from '@/types/subscription-plan';

export type { RevenueStats };

export const subscriptionService = {

    async getRevenueStats(params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' | 'year' }): Promise<ApiResponse<RevenueStats>> {
        const response = await clientApi.get<ApiResponse<RevenueStats>>('/payments/stats', {
            params
        });
        return response.data;
    },

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
