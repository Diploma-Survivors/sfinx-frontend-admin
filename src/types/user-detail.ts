export interface Solution {
    id: string;
    title: string;
    problemId: number;
    userId: number;
    content: string;
    language: string;
    tags: string[];
    upvoteCount: number;
    downvoteCount: number;
    commentCount: number;
    viewCount: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    author: {
        id: number;
        username: string;
        avatarUrl: string;
    };
}

export enum SolutionSortBy {
    RECENT = 'recent',
    MOST_VOTED = 'most_voted',
}

export enum SubmissionStatus {
    ACCEPTED = 'Accepted',
    WRONG_ANSWER = 'Wrong Answer',
    TIME_LIMIT_EXCEEDED = 'Time Limit Exceeded',
    RUNTIME_ERROR = 'Runtime Error',
    COMPILATION_ERROR = 'Compilation Error',
}

export interface UserProblemStats {
    total: {
        solved: number;
        total: number;
    };
    easy: {
        solved: number;
        total: number;
    };
    medium: {
        solved: number;
        total: number;
    };
    hard: {
        solved: number;
        total: number;
    };
}

export interface UserSubmissionStats {
    total: number;
    accepted: number;
    wrongAnswer: number;
    timeLimitExceeded: number;
    runtimeError: number;
    compilationError: number;
    others: number;
}

export interface UserActivityCalendar {
    totalActiveDays: number;
    activeDays: {
        date: string;
        count: number;
    }[];
}

export interface UserRecentACProblem {
    problemId: number;
    problem: {
        id: number;
        title: string;
        slug: string;
        difficulty: string;
    };
    firstSolvedAt: string;
}
