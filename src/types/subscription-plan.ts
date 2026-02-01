import { SubscriptionFeature } from './subscription-feature';

export enum SubscriptionType {
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
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
