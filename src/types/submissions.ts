import type { UserProfile } from "./user";
import type { Problem, SortOrder } from "./problems";
import { ProgrammingLanguage } from "./languages";

export enum SubmissionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  ACCEPTED = "ACCEPTED",
  WRONG_ANSWER = "WRONG_ANSWER",
  TIME_LIMIT_EXCEEDED = "TIME_LIMIT_EXCEEDED",
  MEMORY_LIMIT_EXCEEDED = "MEMORY_LIMIT_EXCEEDED",
  RUNTIME_ERROR = "RUNTIME_ERROR",
  COMPILATION_ERROR = "COMPILATION_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export const SubmissionStatusLabels: Record<SubmissionStatus, string> = {
  PENDING: "Pending",
  RUNNING: "Running",
  ACCEPTED: "Accepted",
  WRONG_ANSWER: "Wrong Answer",
  TIME_LIMIT_EXCEEDED: "Time Limit Exceeded",
  MEMORY_LIMIT_EXCEEDED: "Memory Limit Exceeded",
  RUNTIME_ERROR: "Runtime Error",
  COMPILATION_ERROR: "Compilation Error",
  UNKNOWN_ERROR: "Unknown Error",
};

export interface ResultDescription {
  message: string;
  stdin?: string;
  expectedOutput?: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
}

export interface Submission {
  id: number;
  status: SubmissionStatus;
  executionTime?: number;
  memoryUsed?: number;
  testcasesPassed: number;
  totalTestcases: number;
  resultDescription?: ResultDescription;
  problem?: Partial<Problem>;
  submittedAt: string;
  judgedAt?: string;
  problemId: number;
  languageId: number;
  language?: Partial<ProgrammingLanguage>;
  sourceCode?: string;
  contestId?: number;
  contest?: {
    id: number;
    title: string;
  };
  author?: {
    id: number;
    username: string;
    avatarUrl?: string;
    isPremium?: boolean;
  };
  user?: {
    id: number;
    username: string;
    avatarUrl?: string;
    isPremium?: boolean;
  };
}

export interface SubmissionFilters {
  status?: SubmissionStatus;
  languageId?: number;
  problemId?: number;
  contestId?: number;
  userId?: number;
  fromDate?: string;
  toDate?: string;
}

export enum SubmissionSortBy {
  ID = "id",
  SUBMITTED_AT = "submittedAt",
  RUNTIME_MS = "runtimeMs",
  MEMORY_KB = "memoryKb",
}

export interface GetSubmissionListRequest {
  page?: number;
  limit?: number;
  sortBy?: SubmissionSortBy;
  sortOrder?: SortOrder;
  status?: SubmissionStatus;
  languageId?: number;
  problemId?: number;
  contestId?: number;
  userId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface SubmissionMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SubmissionListResponse {
  data: Submission[];
  meta: SubmissionMeta;
}

// Map language names to Highlight.js language keys
// Map language names to Highlight.js language keys
export const languageMap: Record<string, string> = {
  // --- Original ---
  "C++": "cpp",
  "Python 2": "python",
  "Python 3": "python",
  Java: "java",
  JavaScript: "javascript",
  TypeScript: "typescript",
  "C#": "csharp",
  Go: "go",
  Rust: "rust",

  // --- Web Fundamentals ---
  HTML: "xml", // Highlight.js uses 'xml' for HTML
  XML: "xml",
  CSS: "css",
  SCSS: "scss",
  LESS: "less",
  JSON: "json",

  // --- Backend / Scripting ---
  PHP: "php",
  Ruby: "ruby",
  Perl: "perl",
  Bash: "bash",
  Shell: "shell",
  PowerShell: "powershell",
  Lua: "lua",
  SQL: "sql",
  GraphQL: "graphql",

  // --- Systems / Data Science ---
  C: "c",
  R: "r",
  Matlab: "matlab",
  Swift: "swift",
  Kotlin: "kotlin",
  Dart: "dart",
  Scala: "scala",
  ObjectiveC: "objectivec",

  // --- Configuration / Docs ---
  YAML: "yaml",
  Markdown: "markdown",
  Dockerfile: "dockerfile",
  Makefile: "makefile",
  INI: "ini",
  Diff: "diff", // Great for showing git changes
};
