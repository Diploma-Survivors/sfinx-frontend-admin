import clientApi from '@/lib/apis/axios-client';
import { ApiResponse } from '@/types/api';
import { FeeConfig, CreateFeeConfigDto, UpdateFeeConfigDto } from '@/types/fee-config';

export const feeConfigService = {
    async getAll(): Promise<ApiResponse<FeeConfig[]>> {
        const response = await clientApi.get<ApiResponse<FeeConfig[]>>('/fee-configs/all');
        return response.data;
    },

    async create(data: CreateFeeConfigDto): Promise<ApiResponse<FeeConfig>> {
        const response = await clientApi.post<ApiResponse<FeeConfig>>('/fee-configs', data);
        return response.data;
    },

    async update(id: number, data: UpdateFeeConfigDto): Promise<ApiResponse<FeeConfig>> {
        const response = await clientApi.put<ApiResponse<FeeConfig>>(`/fee-configs/${id}`, data);
        return response.data;
    },

    async remove(id: number): Promise<void> {
        await clientApi.delete(`/fee-configs/${id}`);
    },
};
