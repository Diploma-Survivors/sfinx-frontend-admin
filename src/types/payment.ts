export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export interface PaymentTransaction {
    id: number;
    userId: number;
    username: string;
    planName: string;
    amount: number;
    basePriceSnapshot: number;
    totalFeePercentage: number;
    currency: string;
    provider: string;
    transactionId: string;
    status: PaymentStatus;
    paymentDate: string;
}

export interface TransactionFilter {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface RevenueStats {
    totalRevenue: number;
    activeSubscribers: number;
    churnRate: number;
    revenueByMonth: { month: string; amount: number }[];
    subscriptionsByPlan: { plan: string; count: number }[];
}
