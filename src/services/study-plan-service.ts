import apiClient from "@/lib/apis/axios-client";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import {
    AddStudyPlanItemDto,
    AdminStudyPlanDetailResponseDto,
    AdminStudyPlanResponseDto,
    CreateStudyPlanDto,
    FilterStudyPlanDto,
    ReorderItemsDto,
    StudyPlanItemResponseDto,
    UpdateStudyPlanDto
} from "@/types/study-plan";

class StudyPlanService {
  private readonly baseUrl = "/admin/study-plans";

  async getStudyPlans(
    params?: FilterStudyPlanDto,
    lang?: string,
  ): Promise<PaginatedResponse<AdminStudyPlanResponseDto>> {
    const response = await apiClient.get(this.baseUrl, {
      params: { ...params, lang },
    });
    return response.data.data;
  }

  async getStudyPlanById(
    id: number,
  ): Promise<ApiResponse<AdminStudyPlanDetailResponseDto>> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async createStudyPlan(
    data: CreateStudyPlanDto,
    coverImage?: File,
  ): Promise<ApiResponse<AdminStudyPlanDetailResponseDto>> {
    let payload: any;
    let headers = {};

    if (coverImage) {
      const formData = new FormData();
      formData.append("coverImage", coverImage);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === "object" || Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      payload = formData;
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      payload = {
        ...data,
        translations: data.translations ? JSON.stringify(data.translations) : undefined,
        topicIds: data.topicIds ? JSON.stringify(data.topicIds) : undefined,
        tagIds: data.tagIds ? JSON.stringify(data.tagIds) : undefined,
        similarPlanIds: data.similarPlanIds ? JSON.stringify(data.similarPlanIds) : undefined,
      };
    }

    const response = await apiClient.post(this.baseUrl, payload, { headers });
    return response.data;
  }

  async updateStudyPlan(
    id: number,
    data: UpdateStudyPlanDto,
    coverImage?: File,
  ): Promise<ApiResponse<AdminStudyPlanDetailResponseDto>> {
    let payload: any;
    let headers = {};

    if (coverImage) {
      const formData = new FormData();
      formData.append("coverImage", coverImage);

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === "object" || Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      payload = formData;
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      payload = {
        ...data,
        translations: data.translations ? JSON.stringify(data.translations) : undefined,
        topicIds: data.topicIds ? JSON.stringify(data.topicIds) : undefined,
        tagIds: data.tagIds ? JSON.stringify(data.tagIds) : undefined,
        similarPlanIds: data.similarPlanIds ? JSON.stringify(data.similarPlanIds) : undefined,
      };
    }

    const response = await apiClient.patch(`${this.baseUrl}/${id}`, payload, {
      headers,
    });
    return response.data;
  }

  async deleteStudyPlan(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async publishStudyPlan(
    id: number,
  ): Promise<ApiResponse<AdminStudyPlanDetailResponseDto>> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/publish`);
    return response.data;
  }

  async archiveStudyPlan(
    id: number,
  ): Promise<ApiResponse<AdminStudyPlanDetailResponseDto>> {
    const response = await apiClient.post(`${this.baseUrl}/${id}/archive`);
    return response.data;
  }

  // Study Plan Items Management
  async addItem(
    planId: number,
    data: AddStudyPlanItemDto,
  ): Promise<ApiResponse<StudyPlanItemResponseDto>> {
    const response = await apiClient.post(
      `${this.baseUrl}/${planId}/items`,
      data,
    );
    return response.data;
  }

  async removeItem(planId: number, itemId: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete(
      `${this.baseUrl}/${planId}/items/${itemId}`,
    );
    return response.data;
  }

  async reorderItems(
    planId: number,
    data: ReorderItemsDto,
  ): Promise<ApiResponse<null>> {
    const response = await apiClient.patch(
      `${this.baseUrl}/${planId}/items/reorder`,
      data,
    );
    return response.data;
  }
}

export const studyPlanService = new StudyPlanService();
