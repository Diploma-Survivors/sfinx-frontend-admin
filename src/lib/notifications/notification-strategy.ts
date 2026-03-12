import {
    Notification,
    NotificationType,
} from "@/services/notification.service";

/**
 * Notification events matching NOTIFICATION_SYSTEM.md
 */
export enum NotificationEvent {
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  NEW_PROBLEM_REPORT = "NEW_PROBLEM_REPORT",
  PROBLEM_SOLVED = "PROBLEM_SOLVED",
  POST_PUBLISHED = "POST_PUBLISHED",
  POST_COMMENT = "POST_COMMENT",
  POST_COMMENT_REPLY = "POST_COMMENT_REPLY",
  SOLUTION_COMMENT = "SOLUTION_COMMENT",
  SOLUTION_COMMENT_REPLY = "SOLUTION_COMMENT_REPLY",
  PROBLEM_COMMENT_REPLY = "PROBLEM_COMMENT_REPLY",
  STUDY_PLAN_COMPLETED = "STUDY_PLAN_COMPLETED",
  STUDY_PLAN_MILESTONE = "STUDY_PLAN_MILESTONE",
  STUDY_PLAN_DAY_COMPLETED = "STUDY_PLAN_DAY_COMPLETED",
}

/**
 * Strategy interface for handling different notification types.
 * Each strategy builds a plain link string; hash fragments (#id)
 * are used for scroll-to-element targeting.
 */
export interface NotificationStrategy {
  getLink(notification: Notification, locale: string): string;
}

// ─── Payment ────────────────────────────────────────────────

class PaymentSuccessStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { transactionId } = notification.metadata || {};
    return transactionId
      ? `/${locale}/subscriptions/transactions#transaction-${transactionId}`
      : `/${locale}/subscriptions/transactions`;
  }
}

// ─── System ─────────────────────────────────────────────────

class NewProblemReportStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { reportId } = notification.metadata || {};
    return reportId
      ? `/${locale}/reports#report-${reportId}`
      : `/${locale}/reports`;
  }
}

// ─── Submission ─────────────────────────────────────────────

class ProblemSolvedStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { submissionId } = notification.metadata || {};
    return submissionId
      ? `/${locale}/submissions/${submissionId}`
      : `/${locale}/submissions`;
  }
}

// ─── Discuss ────────────────────────────────────────────────

class PostPublishedStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { postId } = notification.metadata || {};
    return postId
      ? `/${locale}/discussions/${postId}`
      : `/${locale}/discussions`;
  }
}

// ─── Comment ────────────────────────────────────────────────

class PostCommentStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { postId, commentId } = notification.metadata || {};
    if (!postId) return `/${locale}/discussions`;
    return commentId
      ? `/${locale}/discussions/${postId}#comment-${commentId}`
      : `/${locale}/discussions/${postId}`;
  }
}

class SolutionCommentStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { solutionId, commentId } = notification.metadata || {};
    if (!solutionId) return `/${locale}/solutions`;
    return commentId
      ? `/${locale}/solutions/${solutionId}#comment-${commentId}`
      : `/${locale}/solutions/${solutionId}`;
  }
}

// ─── Reply ──────────────────────────────────────────────────

class PostCommentReplyStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { postId, commentId } = notification.metadata || {};
    if (!postId) return `/${locale}/discussions`;
    return commentId
      ? `/${locale}/discussions/${postId}#comment-${commentId}`
      : `/${locale}/discussions/${postId}`;
  }
}

class SolutionCommentReplyStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { solutionId, commentId } = notification.metadata || {};
    if (!solutionId) return `/${locale}/solutions`;
    return commentId
      ? `/${locale}/solutions/${solutionId}#comment-${commentId}`
      : `/${locale}/solutions/${solutionId}`;
  }
}

class ProblemCommentReplyStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { problemId, commentId } = notification.metadata || {};
    if (!problemId) return `/${locale}/problems`;
    return commentId
      ? `/${locale}/problems/${problemId}/edit#comment-${commentId}`
      : `/${locale}/problems/${problemId}/edit`;
  }
}

// ─── Study Plan ─────────────────────────────────────────────

class StudyPlanCompletedStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { studyPlanId } = notification.metadata || {};
    return studyPlanId
      ? `/${locale}/study-plans/${studyPlanId}/edit`
      : `/${locale}/study-plans`;
  }
}

class StudyPlanMilestoneStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { studyPlanId } = notification.metadata || {};
    return studyPlanId
      ? `/${locale}/study-plans/${studyPlanId}/items`
      : `/${locale}/study-plans`;
  }
}

class StudyPlanDayCompletedStrategy implements NotificationStrategy {
  getLink(notification: Notification, locale: string): string {
    const { studyPlanId, dayNumber } = notification.metadata || {};
    if (!studyPlanId) return `/${locale}/study-plans`;
    return dayNumber
      ? `/${locale}/study-plans/${studyPlanId}/items#day-${dayNumber}`
      : `/${locale}/study-plans/${studyPlanId}/items`;
  }
}

// ─── Default ────────────────────────────────────────────────

class DefaultStrategy implements NotificationStrategy {
  getLink(_notification: Notification, locale: string): string {
    return `/${locale}/dashboard`;
  }
}

// ─── Factory ────────────────────────────────────────────────

/**
 * Factory to retrieve the appropriate strategy for a notification.
 * First tries exact event match, then falls back to type-based matching.
 */
export class NotificationStrategyFactory {
  static getStrategy(notification: Notification): NotificationStrategy {
    const { type, metadata } = notification;
    const event = metadata?.event;

    // First, try matching by event for granular control
    if (event) {
      const upperEvent = event.toUpperCase() as NotificationEvent;
      switch (upperEvent) {
        case NotificationEvent.PAYMENT_SUCCESS:
          return new PaymentSuccessStrategy();

        case NotificationEvent.NEW_PROBLEM_REPORT:
          return new NewProblemReportStrategy();

        case NotificationEvent.PROBLEM_SOLVED:
          return new ProblemSolvedStrategy();

        case NotificationEvent.POST_PUBLISHED:
          return new PostPublishedStrategy();

        case NotificationEvent.POST_COMMENT:
          return new PostCommentStrategy();

        case NotificationEvent.POST_COMMENT_REPLY:
          return new PostCommentReplyStrategy();

        case NotificationEvent.SOLUTION_COMMENT:
          return new SolutionCommentStrategy();

        case NotificationEvent.SOLUTION_COMMENT_REPLY:
          return new SolutionCommentReplyStrategy();

        case NotificationEvent.PROBLEM_COMMENT_REPLY:
          return new ProblemCommentReplyStrategy();

        case NotificationEvent.STUDY_PLAN_COMPLETED:
          return new StudyPlanCompletedStrategy();

        case NotificationEvent.STUDY_PLAN_MILESTONE:
          return new StudyPlanMilestoneStrategy();

        case NotificationEvent.STUDY_PLAN_DAY_COMPLETED:
          return new StudyPlanDayCompletedStrategy();
      }
    }

    // Fallback to type-based matching for robustness
    switch (type) {
      case NotificationType.PAYMENT:
        return new PaymentSuccessStrategy();
      case NotificationType.SUBMISSION:
        return new ProblemSolvedStrategy();
      case NotificationType.DISCUSS:
        return new PostPublishedStrategy();
      case NotificationType.STUDY_PLAN:
        return new StudyPlanDayCompletedStrategy();
      case NotificationType.COMMENT:
      case NotificationType.REPLY:
        if (metadata?.solutionId) return new SolutionCommentStrategy();
        if (metadata?.postId) return new PostCommentStrategy();
        return new ProblemCommentReplyStrategy();
      case NotificationType.SYSTEM:
        return new NewProblemReportStrategy();
      default:
        return new DefaultStrategy();
    }
  }
}
