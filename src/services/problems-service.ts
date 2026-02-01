import clientApi from '@/lib/apis/axios-client';
import type { ApiResponse } from '@/types/api';
import {
  type CreateProblemRequest,
  type GetProblemListRequest,
  type Problem,
  type ProblemDataResponse,
  ProblemDifficulty,
  type ProblemEndpointType,
  type ProblemListResponse,
  ProblemType,
  ProblemVisibility,
  type SampleTestCase,
} from '@/types/problems';
import type { ProblemStatistics } from '@/types/problem-statistics';
import type { AxiosResponse } from 'axios';
import { serialize } from 'object-to-formdata';
import qs from 'qs';
import { HttpStatus } from '@/types/api';

async function getProblemList(
  getProblemListRequest: GetProblemListRequest
): Promise<AxiosResponse<ApiResponse<ProblemListResponse>>> {
  const { filters, ...rest } = getProblemListRequest;
  const params = qs.stringify(
    { ...rest, ...filters },
    {
      allowDots: true,
      skipNulls: true,
    }
  );
  const endpoint = '/problems';
  const url = params ? `${endpoint}?${params}` : endpoint;
  return await clientApi.get<ApiResponse<ProblemListResponse>>(url);
}

async function createProblem(
  problemRequest: CreateProblemRequest
): Promise<AxiosResponse<ApiResponse<Problem>>> {
  const formData = new FormData();

  formData.append('title', problemRequest.title);
  formData.append('description', problemRequest.description);
  formData.append('constraints', problemRequest.constraints);
  formData.append('difficulty', problemRequest.difficulty);
  formData.append('isPremium', String(problemRequest.isPremium));
  // formData.append('isActive', String(problemRequest.isActive ?? true)); // Default to true if not provided
  formData.append('timeLimitMs', String(problemRequest.timeLimitMs));
  formData.append('memoryLimitKb', String(problemRequest.memoryLimitKb));

  if (problemRequest.sampleTestcases) {
    formData.append(
      'sampleTestcases',
      JSON.stringify(problemRequest.sampleTestcases)
    );
  }

  if (problemRequest.hints) {
    formData.append('hints', JSON.stringify(problemRequest.hints));
  }

  if (problemRequest.hasOfficialSolution !== undefined) {
    formData.append('hasOfficialSolution', String(problemRequest.hasOfficialSolution));
  }

  if (problemRequest.hasOfficialSolution && problemRequest.officialSolutionContent) {
    formData.append(
      'officialSolutionContent',
      problemRequest.officialSolutionContent
    );
  }

  if (problemRequest.similarProblems) {
    formData.append(
      'similarProblems',
      JSON.stringify(problemRequest.similarProblems)
    );
  }

  if (problemRequest.topicIds) {
    formData.append('topicIds', JSON.stringify(problemRequest.topicIds));
  }

  if (problemRequest.tagIds) {
    formData.append('tagIds', JSON.stringify(problemRequest.tagIds));
  }

  if (problemRequest.testcaseFile) {
    formData.append('testcaseFile', problemRequest.testcaseFile);
  }

  return await clientApi.post('/problems', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // // Mock response data
  // const mockProblem: Problem = {
  //   id: Math.floor(Math.random() * 1000),
  //   title: problemRequest.title,
  //   difficulty: problemRequest.difficulty,
  //   timeLimitMs: problemRequest.timeLimitMs,
  //   memoryLimitKb: problemRequest.memoryLimitKb,
  //   topics: [], // In a real mock, we'd map these from IDs
  //   tags: [], // In a real mock, we'd map these from IDs
  //   description: problemRequest.description,
  //   constraints: problemRequest.constraints,
  //   sampleTestcases: problemRequest.sampleTestcases,
  //   hints: [],
  //   isPremium: problemRequest.isPremium,
  //   isPublished: problemRequest.isPublished,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  //   // authorId: 'mock-author-id', // Removed as it's not in Problem interface
  //   slug: problemRequest.title.toLowerCase().replace(/\s+/g, '-'),
  //   // averageRating: 0,
  //   // ratingCount: 0,
  //   // ratingCount: 0,
  //   acceptanceRate: '0',
  //   // submissionCount: 0,
  //   // acceptedCount: 0,
  //   testcase: null,
  //   testcaseResponse: undefined,
  //   isActive: true,
  //   totalSubmissions: 0,
  //   totalAccepted: 0,
  //   totalAttempts: 0,
  //   totalSolved: 0,
  //   averageTimeToSolve: 0,
  //   difficultyRating: 0,
  //   testcaseCount: 0,
  //   similarProblems: [],
  // };

  // return {
  //   data: {
  //     data: mockProblem,
  //     statusCode: 200,
  //     timestamp: new Date().toISOString(),
  //     path: '/problems',
  //   },
  //   status: 200,
  //   statusText: 'OK',
  //   headers: {},
  //   config: {} as any,
  // };
}

async function getProblemSamples(id: number): Promise<AxiosResponse<ApiResponse<SampleTestCase[]>>> {
  return await clientApi.get(`/problems/${id}/samples`);
}

async function getProblemById(
  problemId: number
): Promise<AxiosResponse<ApiResponse<Problem>>> {

  const [problemResponse, samplesResponse] = await Promise.all([
    clientApi.get<ApiResponse<Problem>>(`/problems/${problemId}`),
    clientApi.get<ApiResponse<SampleTestCase[]>>(`/problems/${problemId}/samples`).catch(() => null),
  ]);

  if (problemResponse.data?.data && samplesResponse?.data?.data) {
    problemResponse.data.data.sampleTestcases = samplesResponse.data.data;
  }
  if(problemResponse.data?.data){
    problemResponse.data.data.hasOfficialSolution = !!problemResponse.data.data.officialSolutionContent;
  }

  return problemResponse;

  // Mock API call
//   await new Promise((resolve) => setTimeout(resolve, 500));

//   const mockProblem: Problem = {
//     id: problemId,
//     title: 'Two Sum',
//     slug: 'two-sum',
//     description: `# Two Sum

// Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

// You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

// You can return the answer in any order.

// ## Example 1:

// \`\`\`
// Input: nums = [2,7,11,15], target = 9
// Output: [0,1]
// Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
// \`\`\`
// `,
//     constraints: `- \`2 <= nums.length <= 10^4\`
// - \`-10^9 <= nums[i] <= 10^9\`
// - \`-10^9 <= target <= 10^9\`
// - **Only one valid answer exists.**`,
//     difficulty: ProblemDifficulty.EASY,
//     timeLimitMs: 1000,
//     memoryLimitKb: 256000,
//     maxScore: 100,
//     isPremium:true,
//     topics: [
//       {
//         id: 1,
//         name: 'Array',
//         slug: 'array',
//         description: 'Array problems',
//         iconUrl: '',
//         orderIndex: 1,
//         isActive: true,
//         createdAt: new Date().toISOString(),
//       },
//       {
//         id: 2,
//         name: 'Hash Table',
//         slug: 'hash-table',
//         description: 'Hash Table problems',
//         iconUrl: '',
//         orderIndex: 2,
//         isActive: true,
//         createdAt: new Date().toISOString(),
//       },
//     ],
//     tags: [
//       {
//         id: 1,
//         name: 'Blind 75',
//         slug: 'blind-75',
//         type: 'default',
//         description: 'Blind 75 list',
//         color: 'blue',
//         createdAt: new Date().toISOString(),
//       },
//     ],
//     sampleTestcases: [
//       {
//         input: '2\n2 7 11 15\n9',
//         expectedOutput: '0 1',
//         explanation: '2 + 7 = 9',
//       },
//     ],
//     hints: [
//       {
//         order: 1,
//         content:
//           'A really brute force way would be to search for all possible pairs of numbers but that would be too slow.',
//       },
//       {
//         order: 2,
//         content:
//           'So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter.',
//       },
//     ],
//     isPublished: true,
//     isActive: true,
//     hasOfficialSolution: true,
//     officialSolutionContent: 'This is the official solution content.',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     totalSubmissions: 100,
//     totalAccepted: 50,
//     acceptanceRate: '50',
//     totalAttempts: 200,
//     totalSolved: 50,
//     averageTimeToSolve: 300,
//     difficultyRating: 1000,
//     testcaseCount: 10,
//     similarProblems: [1, 2],
//   };

//   return {
//     data: {
//       data: mockProblem,
//       statusCode: 200,
//       timestamp: new Date().toISOString(),
//       path: `/problems/${problemId}`,
//     },
//     status: 200,
//     statusText: 'OK',
//     headers: {},
//     config: {} as any,
//   };
}

async function updateProblem(id: number, problemRequest: CreateProblemRequest) {
  const { testcaseFile, sampleTestcases, ...data } = problemRequest;
  
  const payload = {
    ...data,
    sampleTestcases: sampleTestcases ? JSON.stringify(sampleTestcases) : undefined,
    hints: data.hints ? JSON.stringify(data.hints) : undefined,
    similarProblems: data.similarProblems ? JSON.stringify(data.similarProblems) : undefined,
    tagIds: data.tagIds ? JSON.stringify(data.tagIds) : undefined,
    topicIds: data.topicIds ? JSON.stringify(data.topicIds) : undefined,
    officialSolutionContent: data.hasOfficialSolution ? data.officialSolutionContent : undefined,
  };

  return await clientApi.put(`/problems/${id}`, payload);
}

async function updateProblemStatus(id: number) {
    return await clientApi.post(`/problems/${id}/toggle`);
}

async function getProblemStatistics(
  problemId: number,
  from?: string,
  to?: string
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
  formData.append('problemId', String(problemId));
  formData.append('testcaseFile', file);

  return await clientApi.post('/problems/testcases/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
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
    description: problem.description || '',
    timeLimitMs: problem.timeLimitMs,
    memoryLimitKb: problem.memoryLimitKb,
    difficulty: problem.difficulty,
    tagIds: tags.map((tag) => tag.id),
    topicIds: topics.map((topic) => topic.id),
    testcaseFile: testcase || null,
    sampleTestcases: problem.sampleTestcases?.map((tc) => ({
      ...tc,
      explanation: tc.explanation ?? undefined,
    })) || [],
    constraints: problem.constraints,
    isPremium: problem.isPremium,
    isPublished: problem.isPublished,
    hints: problem.hints?.map((h, i) => ({ ...h, order: h.order ?? i + 1 })) || [],
    officialSolutionContent: problem.officialSolutionContent ?? undefined,
  };
}

// function mapProblemDataResponseToProblemData(
//   problemResponse: ProblemDataResponse
// ): Problem {
//   return {
//     ...problemResponse,
//     testcaseResponse: problemResponse.testcase,
//     testcase: null,
//     sampleTestcases: problemResponse.testcaseSamples,
//     constraints: '', // Default if missing in response
//     isActive: true, // Default if missing
//     topics: problemResponse.topics || [],
//     tags: problemResponse.tags || [],
//   };
// }


export const ProblemsService = {
  getProblemList,
  createProblem,
  mapProblemToDTO,
  getProblemById,
  // mapProblemDataResponseToProblemData,
  updateProblem,
  updateProblemStatus,
  getProblemStatistics,
  uploadTestcaseFile,
  removeTestcaseFile,
  getProblemSamples,
};
