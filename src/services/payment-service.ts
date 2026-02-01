import clientApi from '@/lib/apis/axios-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { PaymentStatus, PaymentTransaction, TransactionFilter, RevenueStats } from '@/types/payment';



export const paymentService = {
    async getTransactions(filter: TransactionFilter = {}): Promise<ApiResponse<PaginatedResponse<PaymentTransaction>>> {
        const response = await clientApi.get<ApiResponse<PaginatedResponse<PaymentTransaction>>>(
            '/payments/transactions',
            { params: filter }
        );
        return response.data;
    },

    async getRevenueStats(query?: { startDate?: string; endDate?: string }): Promise<ApiResponse<RevenueStats>> {
        const response = await clientApi.get<ApiResponse<RevenueStats>>(
            '/payments/stats',
            { params: query }
        );
        return response.data;
    },
};
