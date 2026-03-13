export interface CurrencyTranslation {
    languageCode: string;
    name: string;
    symbol?: string | null;
}

export interface CurrencyConfig {
    id: number;
    code: string;
    name: string;
    symbol: string;
    rateToVnd: number;
    isActive: boolean;
    translations?: CurrencyTranslation[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateCurrencyDto {
    code: string;
    name: string;
    symbol: string;
    rateToVnd: number;
    isActive?: boolean;
    translations?: CurrencyTranslation[];
}

export interface UpdateCurrencyDto {
    code?: string;
    name?: string;
    symbol?: string;
    rateToVnd?: number;
    isActive?: boolean;
    translations?: CurrencyTranslation[];
}
