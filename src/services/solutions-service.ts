import clientApi from "@/lib/apis/axios-client";
import {
  Solution,
  FilterSolutionDto,
  CreateSolutionDto,
  UpdateSolutionDto,
  SolutionComment,
  SolutionCommentVoteType,
  SolutionVoteType,
  CreateCommentDto,
} from "@/types/solution";
import { PaginatedResult } from "@/types/common";
import qs from "qs";
import { ApiResponse } from "@/types/api";

export class SolutionsService {
  private static BASE_URL = "/solutions";

  static async getSolutions(
    filters?: FilterSolutionDto,
  ): Promise<PaginatedResult<Solution>> {
    const params = qs.stringify(
      {
        ...filters,
      },
      { allowDots: true, skipNulls: true },
    );

    const response = await clientApi.get<
      ApiResponse<PaginatedResult<Solution>>
    >(`${this.BASE_URL}?${params}`);

    return response.data.data;
  }

  static async getSolution(id: number): Promise<Solution> {
    const response = await clientApi.get<ApiResponse<Solution>>(
      `${this.BASE_URL}/${id}`,
    );
    return response.data.data;
  }

  static async getUserSolutions(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<Solution>> {
    const response = await clientApi.get<
      ApiResponse<PaginatedResult<Solution>>
    >(`${this.BASE_URL}/user/${userId}`, { params: { page, limit } });
    return response.data.data;
  }

  static async create(data: CreateSolutionDto): Promise<Solution> {
    const response = await clientApi.post<ApiResponse<Solution>>(
      this.BASE_URL,
      data,
    );
    return response.data.data;
  }

  static async update(id: number, data: UpdateSolutionDto): Promise<Solution> {
    const response = await clientApi.put<ApiResponse<Solution>>(
      `${this.BASE_URL}/${id}`,
      data,
    );
    return response.data.data;
  }

  static async remove(id: number): Promise<void> {
    await clientApi.delete(`${this.BASE_URL}/${id}`);
  }

  static async vote(id: number, voteType: SolutionVoteType): Promise<void> {
    await clientApi.post(`${this.BASE_URL}/${id}/vote`, { voteType });
  }

  static async unvote(id: number): Promise<void> {
    await clientApi.delete(`${this.BASE_URL}/${id}/vote`);
  }

  // Comment methods - Updated to match backend API
  static async getComments(solutionId: number): Promise<SolutionComment[]> {
    const response = await clientApi.get<ApiResponse<SolutionComment[]>>(
      `${this.BASE_URL}/${solutionId}/comments`,
    );
    return response.data.data || [];
  }

  static async createComment(data: CreateCommentDto): Promise<SolutionComment> {
    const response = await clientApi.post<ApiResponse<SolutionComment>>(
      `${this.BASE_URL}/${data.solutionId}/comments`,
      data,
    );
    return response.data.data;
  }

  static async updateComment(
    commentId: number,
    data: { content: string },
  ): Promise<SolutionComment> {
    const response = await clientApi.patch<ApiResponse<SolutionComment>>(
      `${this.BASE_URL}/comments/${commentId}`,
      data,
    );
    return response.data.data;
  }

  static async deleteComment(commentId: number): Promise<void> {
    await clientApi.delete(`${this.BASE_URL}/comments/${commentId}`);
  }

  static async voteComment(
    commentId: number,
    voteType: SolutionCommentVoteType,
  ): Promise<void> {
    await clientApi.post(`${this.BASE_URL}/comments/${commentId}/vote`, {
      voteType,
    });
  }

  static async unvoteComment(commentId: number): Promise<void> {
    await clientApi.delete(`${this.BASE_URL}/comments/${commentId}/vote`);
  }

  static async pinComment(commentId: number): Promise<void> {
    await clientApi.post(`/admin/solutions/comments/${commentId}/pin`);
  }

  static async unpinComment(commentId: number): Promise<void> {
    await clientApi.delete(`/admin/solutions/comments/${commentId}/pin`);
  }

  static async deleteSolutionAdmin(id: number): Promise<void> {
    await clientApi.delete(`/admin/solutions/${id}`);
  }
}
