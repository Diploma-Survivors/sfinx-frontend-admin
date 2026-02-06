import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CreateProblemFormValues } from '@/components/problems/problem-create-form';
import { ProblemDifficulty } from '@/types/problems';

const STORAGE_KEY = 'create_problem_draft';

const initialState: CreateProblemFormValues = {
  title: '',
  difficulty: ProblemDifficulty.EASY,
  isPremium: false,
  isPublished: true,
  timeLimitMs: 1000,
  memoryLimitKb: 256000,
  topics: [],
  tags: [],
  similarProblems: [],
  description: `# Problem Title

## Description
Provide a clear and concise description of the problem here. Explain what the input represents and what the desired output should be.
\`\`\`
`,
  constraints: `- \`1 <= n <= 10^5\`
- \`0 <= arr[i] <= 1000\`
- The input is guaranteed to be valid.`,
  sampleTestcases: [],
  hints: [],
  hasOfficialSolution: false,
  officialSolutionContent: '',
  testcaseFile: null,
};

export const createProblemSlice = createSlice({
  name: 'createProblem',
  initialState,
  reducers: {
    setDraft: (
      state,
      action: PayloadAction<Partial<CreateProblemFormValues>>
    ) => {
      // Exclude testcaseFile from state as it is not serializable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { testcaseFile, ...payloadWithoutFile } = action.payload;
      return { ...state, ...payloadWithoutFile };
    },
    clearDraft: () => {
      return initialState;
    },
  },
});

export const { setDraft, clearDraft } = createProblemSlice.actions;
export default createProblemSlice.reducer;
