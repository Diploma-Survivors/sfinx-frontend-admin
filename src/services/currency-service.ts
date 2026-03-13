import clientApi from '@/lib/apis/axios-client';
import { ApiResponse } from '@/types/api';
import { CurrencyConfig, CreateCurrencyDto, UpdateCurrencyDto } from '@/types/currency';

export const currencyService = {
    async getAll(): Promise<ApiResponse<CurrencyConfig[]>> {
        const response = await clientApi.get<ApiResponse<CurrencyConfig[]>>('/currencies/all');
        return response.data;
    },

    async create(data: CreateCurrencyDto): Promise<ApiResponse<CurrencyConfig>> {
        const response = await clientApi.post<ApiResponse<CurrencyConfig>>('/currencies', data);
        return response.data;
    },

    async update(id: number, data: UpdateCurrencyDto): Promise<ApiResponse<CurrencyConfig>> {
        const response = await clientApi.put<ApiResponse<CurrencyConfig>>(`/currencies/${id}`, data);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await clientApi.delete(`/currencies/${id}`);
    },
};
