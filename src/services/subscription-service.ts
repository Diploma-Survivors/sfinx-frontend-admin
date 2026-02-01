import clientApi from '@/lib/apis/axios-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export enum SubscriptionType {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export interface SubscriptionFeature {
    id: number;
    key: string;
    name: string;
    description?: string;
    isActive: boolean;
}

export interface SubscriptionPlan {
    id: number;
    type: SubscriptionType;
    name: string;
    description: string;
    priceUsd: number;
    durationMonths: number;
    isActive: boolean;
    features: SubscriptionFeature[];
    translations?: {
        languageCode: string;
        name: string;
        description: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}



export interface CreatePlanDto {
    type: SubscriptionType;
    priceUsd: number;
    durationMonths: number;
    isActive?: boolean;
    translations: {
        languageCode: string;
        name: string;
        description: string;
    }[];
}

export interface UpdatePlanDto {
    type?: SubscriptionType;
    priceUsd?: number;
    durationMonths?: number;
    isActive?: boolean;
    translations?: {
        languageCode: string;
        name: string;
        description: string;
    }[];
    featureIds?: number[];
}

export interface CreateFeatureDto {
    key: string;
    isActive?: boolean;
    translations: {
        languageCode: string;
        name: string;
        description?: string;
    }[];
}

export interface UpdateFeatureDto {
    isActive?: boolean;
    translations?: {
        languageCode: string;
        name: string;
        description?: string;
    }[];
}

export const subscriptionService = {
    // ==================== SUBSCRIPTION PLANS ====================

    async getAllPlans(lang: string = 'en'): Promise<ApiResponse<SubscriptionPlan[]>> {
        const response = await clientApi.get<ApiResponse<SubscriptionPlan[]>>(
            '/subscription-plans/all',
            { params: { lang } }
        );
        return response.data;
    },

    async getPlan(id: number, lang: string = 'en'): Promise<ApiResponse<SubscriptionPlan>> {
        const response = await clientApi.get<ApiResponse<SubscriptionPlan>>(
            `/subscription-plans/${id}`,
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

    async deletePlan(id: number): Promise<void> {
        await clientApi.delete(`/subscription-plans/${id}`);
    },

    // ==================== SUBSCRIPTION FEATURES ====================

    async getAllFeatures(lang: string = 'en'): Promise<ApiResponse<SubscriptionFeature[]>> {
        const response = await clientApi.get<ApiResponse<SubscriptionFeature[]>>(
            '/subscription-features/all',
            { params: { lang } }
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
