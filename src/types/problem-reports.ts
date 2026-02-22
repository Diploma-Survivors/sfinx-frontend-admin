import { UserProfile } from "./user";

export enum ProblemReportType {
    WRONG_DESCRIPTION = "WRONG_DESCRIPTION",
    WRONG_ANSWER = "WRONG_ANSWER",
    WRONG_TEST_CASE = "WRONG_TEST_CASE",
    OTHER = "OTHER",
}

export enum ProblemReportStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED",
}

export interface ProblemReport {
    id: string;
    type: ProblemReportType;
    description: string;
    status: ProblemReportStatus;
    userId: number;
    problemId: number;
    createdAt: string;
    updatedAt: string;
    user: UserProfile;
    problem: {
        id: number;
        title: string;
    };
}
