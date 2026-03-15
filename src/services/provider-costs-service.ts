import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import type {
  CostRecord,
  CostSummaryParams,
  CostSummaryResponse,
  FetchNowResponse,
  ListCostRecordsParams,
  ListCostRecordsResponse,
} from '@/types/provider-costs';
import qs from 'qs';

export const providerCostsService = {
  async listRecords(params: ListCostRecordsParams): Promise<ApiResponse<ListCostRecordsResponse>> {
    const queryString = qs.stringify(params, { skipNulls: true });
    const url = `/admin/provider-costs${queryString ? `?${queryString}` : ''}`;
    const response = await clientApi.get<ApiResponse<ListCostRecordsResponse>>(url);
    return response.data;
  },

  async getSummary(params: CostSummaryParams): Promise<ApiResponse<CostSummaryResponse>> {
    const response = await clientApi.get<ApiResponse<CostSummaryResponse>>(
      '/admin/provider-costs/summary',
      { params }
    );
    return response.data;
  },

  async fetchNow(date: string): Promise<ApiResponse<FetchNowResponse>> {
    const response = await clientApi.post<ApiResponse<FetchNowResponse>>(
      '/admin/provider-costs/fetch-now',
      { date }
    );
    return response.data;
  },
};
