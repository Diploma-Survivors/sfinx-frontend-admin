import clientApi from '@/lib/apis/axios-client';
import { ApiResponse } from '@/types/api';

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

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export interface PaymentTransaction {
    id: number;
    userId: number;
    username: string;
    planId: number;
    planName: string;
    amount: number;
    amountVnd: number;
    currency: string;
    provider: string;
    transactionId: string;
    status: PaymentStatus;
    paymentDate: string;
    createdAt: string;
}

export interface TransactionFilter {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
    };
}

export interface RevenueStats {
    totalRevenue: number;
    activeSubscribers: number;
    churnRate: number;
    revenueByMonth: { month: string; amount: number }[];
    subscriptionsByPlan: { plan: string; count: number }[];
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

    // ==================== TRANSACTIONS ====================

    async getTransactions(filter: TransactionFilter = {}): Promise<ApiResponse<PaginatedResponse<PaymentTransaction>>> {
        const response = await clientApi.get<ApiResponse<PaginatedResponse<PaymentTransaction>>>(
            '/payments/transactions',
            { params: filter }
        );
        return response.data;
    },

    // ==================== STATISTICS ====================

    async getRevenueStats(query?: { startDate?: string; endDate?: string }): Promise<ApiResponse<RevenueStats>> {
        const response = await clientApi.get<ApiResponse<RevenueStats>>(
            '/payments/stats',
            { params: query }
        );
        return response.data;
    },
};
