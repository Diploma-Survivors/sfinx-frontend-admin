import clientApi from "@/lib/apis/axios-client";
import type { ApiResponse } from "@/types/api";
import type { ProblemStatistics } from "@/types/problem-statistics";
import {
  type CreateProblemRequest,
  type GetProblemListRequest,
  type Problem,
  type ProblemListResponse,
  type SampleTestCase,
} from "@/types/problems";
import type { AxiosResponse } from "axios";
import qs from "qs";

async function getProblemList(
  getProblemListRequest: GetProblemListRequest,
): Promise<AxiosResponse<ApiResponse<ProblemListResponse>>> {
  const { filters, ...rest } = getProblemListRequest;
  const params = qs.stringify(
    { ...rest, ...filters },
    {
      allowDots: true,
      skipNulls: true,
    },
  );
  const endpoint = "/problems";
  const url = params ? `${endpoint}?${params}` : endpoint;
  return await clientApi.get<ApiResponse<ProblemListResponse>>(url);
}

async function createProblem(
  problemRequest: CreateProblemRequest,
): Promise<AxiosResponse<ApiResponse<Problem>>> {
  const formData = new FormData();

  formData.append("title", problemRequest.title);
  formData.append("description", problemRequest.description);
  formData.append("constraints", problemRequest.constraints);
  formData.append("difficulty", problemRequest.difficulty);
  formData.append("isPremium", String(problemRequest.isPremium));
  if (problemRequest.isDraft !== undefined) {
    formData.append("isDraft", String(problemRequest.isDraft));
  }
  // formData.append('isActive', String(problemRequest.isActive ?? true)); // Default to true if not provided
  formData.append("timeLimitMs", String(problemRequest.timeLimitMs));
  formData.append("memoryLimitKb", String(problemRequest.memoryLimitKb));

  if (problemRequest.sampleTestcases) {
    formData.append(
      "sampleTestcases",
      JSON.stringify(problemRequest.sampleTestcases),
    );
  }

  if (problemRequest.hints) {
    formData.append("hints", JSON.stringify(problemRequest.hints));
  }

  if (problemRequest.hasOfficialSolution !== undefined) {
    formData.append(
      "hasOfficialSolution",
      String(problemRequest.hasOfficialSolution),
    );
  }

  if (
    problemRequest.hasOfficialSolution &&
    problemRequest.officialSolutionContent
  ) {
    formData.append(
      "officialSolutionContent",
      problemRequest.officialSolutionContent,
    );
  }

  if (problemRequest.similarProblems) {
    formData.append(
      "similarProblems",
      JSON.stringify(problemRequest.similarProblems),
    );
  }

  if (problemRequest.topicIds) {
    formData.append("topicIds", JSON.stringify(problemRequest.topicIds));
  }

  if (problemRequest.tagIds) {
    formData.append("tagIds", JSON.stringify(problemRequest.tagIds));
  }

  if (problemRequest.testcaseFile) {
    formData.append("testcaseFile", problemRequest.testcaseFile);
  }

  return await clientApi.post("/problems", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

async function getProblemSamples(
  id: number,
): Promise<AxiosResponse<ApiResponse<SampleTestCase[]>>> {
  return await clientApi.get(`/problems/${id}/samples`);
}

async function getProblemById(
  problemId: number,
): Promise<AxiosResponse<ApiResponse<Problem>>> {
  const [problemResponse, samplesResponse] = await Promise.all([
    clientApi.get<ApiResponse<Problem>>(`/problems/${problemId}`),
    clientApi
      .get<ApiResponse<SampleTestCase[]>>(`/problems/${problemId}/samples`)
      .catch(() => null),
  ]);

  if (problemResponse.data?.data && samplesResponse?.data?.data) {
    problemResponse.data.data.sampleTestcases = samplesResponse.data.data;
  }
  if (problemResponse.data?.data) {
    problemResponse.data.data.hasOfficialSolution =
      !!problemResponse.data.data.officialSolutionContent;
  }

  return problemResponse;
}

async function updateProblem(id: number, problemRequest: CreateProblemRequest) {
  const { testcaseFile, sampleTestcases, ...data } = problemRequest;

  const payload = {
    ...data,
    sampleTestcases: sampleTestcases
      ? JSON.stringify(sampleTestcases)
      : undefined,
    hints: data.hints ? JSON.stringify(data.hints) : undefined,
    similarProblems: data.similarProblems
      ? JSON.stringify(data.similarProblems)
      : undefined,
    tagIds: data.tagIds ? JSON.stringify(data.tagIds) : undefined,
    topicIds: data.topicIds ? JSON.stringify(data.topicIds) : undefined,
    officialSolutionContent: data.hasOfficialSolution
      ? data.officialSolutionContent
      : undefined,
    isDraft: data.isDraft,
  };

  return await clientApi.put(`/problems/${id}`, payload);
}

async function updateProblemStatus(id: number) {
  return await clientApi.put(`/problems/${id}/toggle`);
}

async function getProblemStatistics(
  problemId: number,
  from?: string,
  to?: string,
): Promise<AxiosResponse<ApiResponse<ProblemStatistics>>> {
  return await clientApi.get(`/problems/${problemId}/statistics`, {
    params: {
      from,
      to,
    },
  });
}

async function uploadTestcaseFile(problemId: number, file: File) {
  const formData = new FormData();
  formData.append("problemId", String(problemId));
  formData.append("testcaseFile", file);

  return await clientApi.post("/problems/testcases/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

async function removeTestcaseFile(problemId: number) {
  return await clientApi.delete(`/problems/${problemId}/testcases`);
}

function mapProblemToDTO(problem: Problem): CreateProblemRequest {
  const { tags, topics, testcase, ...rest } = problem;
  return {
    ...rest,
    description: problem.description || "",
    timeLimitMs: problem.timeLimitMs,
    memoryLimitKb: problem.memoryLimitKb,
    difficulty: problem.difficulty,
    tagIds: tags.map((tag) => tag.id),
    topicIds: topics.map((topic) => topic.id),
    testcaseFile: testcase || null,
    sampleTestcases:
      problem.sampleTestcases?.map((tc) => ({
        ...tc,
        explanation: tc.explanation ?? undefined,
      })) || [],
    constraints: problem.constraints,
    isPremium: problem.isPremium,
    isPublished: problem.isPublished,
    isDraft: problem.isDraft,
    hints:
      problem.hints?.map((h, i) => ({ ...h, order: h.order ?? i + 1 })) || [],
    officialSolutionContent: problem.officialSolutionContent ?? undefined,
  };
}

export const ProblemsService = {
  getProblemList,
  createProblem,
  mapProblemToDTO,
  getProblemById,
  updateProblem,
  updateProblemStatus,
  getProblemStatistics,
  uploadTestcaseFile,
  removeTestcaseFile,
  getProblemSamples,
};
