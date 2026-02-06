export interface SubscriptionFeature {
    id: number;
    key: string;
    name: string;
    description?: string;
    isActive: boolean;
    translations?: {
        languageCode: string;
        name: string;
        description: string;
    }[];
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
