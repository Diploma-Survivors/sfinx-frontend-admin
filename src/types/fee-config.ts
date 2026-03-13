export interface FeeConfigTranslation {
    languageCode: string;
    name: string;
    description?: string | null;
}

export interface FeeConfig {
    id: number;
    code: string;
    value: number;
    isActive: boolean;
    translations?: FeeConfigTranslation[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateFeeConfigDto {
    code: string;
    value: number;
    isActive?: boolean;
    translations?: FeeConfigTranslation[];
}

export interface UpdateFeeConfigDto {
    code?: string;
    value?: number;
    isActive?: boolean;
    translations?: FeeConfigTranslation[];
}
