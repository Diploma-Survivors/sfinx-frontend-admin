export interface ProgrammingLanguage {
    id: number;
    name: string;
    slug: string;
    judge0Id: number | null;
    monacoLanguage: string | null;
    isActive: boolean;
    orderIndex: number;
    starterCode: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProgrammingLanguageRequest {
    name: string;
    judge0Id?: number;
    monacoLanguage?: string;
    isActive?: boolean;
    orderIndex?: number;
    starterCode: string;
}

export interface UpdateProgrammingLanguageRequest {
    name?: string;
    judge0Id?: number;
    monacoLanguage?: string;
    isActive?: boolean;
    orderIndex?: number;
    starterCode?: string;
}

export interface QueryProgrammingLanguageParams {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedProgrammingLanguageResponse {
    data: ProgrammingLanguage[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
