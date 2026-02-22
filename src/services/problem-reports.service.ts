import clientApi from "@/lib/apis/axios-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import { type ProblemReport, type ProblemReportStatus, type ProblemReportType } from "@/types/problem-reports";

export interface GetProblemReportsParams {
    page?: number;
    limit?: number;
    status?: ProblemReportStatus;
    type?: ProblemReportType;
}

const getProblemReports = async (
    params: GetProblemReportsParams
): Promise<ApiResponse<PaginatedResponse<ProblemReport>>> => {
    const { data } = await clientApi.get<ApiResponse<PaginatedResponse<ProblemReport>>>(
        "/problem-reports",
        { params }
    );
    return data;
};

const updateProblemReportStatus = async (
    id: string,
    status: ProblemReportStatus
): Promise<ApiResponse<ProblemReport>> => {
    const { data } = await clientApi.patch<ApiResponse<ProblemReport>>(
        `/problem-reports/${id}/status`,
        { status }
    );
    return data;
};

export const ProblemReportsService = {
    getProblemReports,
    updateProblemReportStatus,
};
