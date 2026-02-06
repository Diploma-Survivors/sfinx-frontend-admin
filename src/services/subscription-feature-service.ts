    import clientApi from '@/lib/apis/axios-client';
import { ApiResponse } from '@/types/api';
import { SubscriptionFeature, CreateFeatureDto, UpdateFeatureDto } from '@/types/subscription-feature';

export const subscriptionFeatureService = {
    async getAllFeatures(lang: string = 'en'): Promise<ApiResponse<SubscriptionFeature[]>> {
        const response = await clientApi.get<ApiResponse<SubscriptionFeature[]>>(
            '/subscription-features/all',
            { params: { lang } }
        );
        return response.data;
    },

    async getFeature(id: number): Promise<ApiResponse<SubscriptionFeature>> {
        const response = await clientApi.get<ApiResponse<SubscriptionFeature>>(
            `/subscription-features/${id}`
        );
        return response.data;
    },

    async createFeature(data: CreateFeatureDto): Promise<ApiResponse<SubscriptionFeature>> {
        const response = await clientApi.post<ApiResponse<SubscriptionFeature>>(
            '/subscription-features',
            data
        );
        return response.data;
    },

    async updateFeature(id: number, data: UpdateFeatureDto): Promise<ApiResponse<SubscriptionFeature>> {
        const response = await clientApi.put<ApiResponse<SubscriptionFeature>>(
            `/subscription-features/${id}`,
            data
        );
        return response.data;
    },

    async deleteFeature(id: number): Promise<void> {
        await clientApi.delete(`/subscription-features/${id}`);
    },
};
