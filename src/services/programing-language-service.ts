import axiosInstance from '@/lib/apis/axios-client';
import {
    ProgrammingLanguage,
    CreateProgrammingLanguageRequest,
    UpdateProgrammingLanguageRequest,
    QueryProgrammingLanguageParams,
    PaginatedProgrammingLanguageResponse,
} from '@/types/programing-language-type';

export const ProgrammingLanguageService = {
    /**
     * Get all programming languages with optional filtering and pagination
     */
    getAllProgrammingLanguages: async (
        params?: QueryProgrammingLanguageParams
    ): Promise<PaginatedProgrammingLanguageResponse> => {
        const response = await axiosInstance.get('/programming-languages', { params });
        return response.data.data;
    },

    /**
     * Get all active programming languages (ordered by display order)
     */
    getAllActiveProgrammingLanguages: async (): Promise<ProgrammingLanguage[]> => {
        const response = await axiosInstance.get('/programming-languages/active');
        return response.data.data;
    },

    /**
     * Get programming language by ID
     */
    getProgrammingLanguageById: async (id: number): Promise<ProgrammingLanguage> => {
        const response = await axiosInstance.get(`/programming-languages/${id}`);
        return response.data.data;
    },

    /**
     * Get programming language by slug
     */
    getProgrammingLanguageBySlug: async (slug: string): Promise<ProgrammingLanguage> => {
        const response = await axiosInstance.get(`/programming-languages/slug/${slug}`);
        return response.data.data;
    },

    /**
     * Create a new programming language (Admin only)
     */
    createProgrammingLanguage: async (
        data: CreateProgrammingLanguageRequest
    ): Promise<ProgrammingLanguage> => {
        const response = await axiosInstance.post('/programming-languages', data);
        return response.data.data;
    },

    /**
     * Update an existing programming language (Admin only)
     */
    updateProgrammingLanguage: async (
        id: number,
        data: UpdateProgrammingLanguageRequest
    ): Promise<ProgrammingLanguage> => {
        const response = await axiosInstance.patch(`/programming-languages/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete a programming language (soft delete - Admin only)
     */
    deleteProgrammingLanguage: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/programming-languages/${id}`);
    },

    /**
     * Activate a programming language (Admin only)
     */
    activateProgrammingLanguage: async (id: number): Promise<ProgrammingLanguage> => {
        const response = await axiosInstance.patch(`/programming-languages/${id}/activate`);
        return response.data.data;
    },

    /**
     * Deactivate a programming language (Admin only)
     */
    deactivateProgrammingLanguage: async (id: number): Promise<ProgrammingLanguage> => {
        const response = await axiosInstance.patch(`/programming-languages/${id}/deactivate`);
        return response.data.data;
    },
};
