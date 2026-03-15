export type Provider = 'langsmith' | 'deepgram' | 'elevenlabs' | 'brevo';

export interface LangSmithMetrics {
  rootTraceCount: number;
  totalTokens: number;
  totalCostUsd: number;
}

export interface DeepgramMetrics {
  requestCount: number;
  totalAudioSeconds: number;
  totalCostUsd: number;
}

export interface ElevenLabsMetrics {
  totalCharacters: number;
  nextInvoiceCents: number;
}

export interface BrevoMetrics {
  emailsSent: number;
  delivered: number;
  bounced: number;
  spam: number;
}

export type ProviderRawMetrics =
  | LangSmithMetrics
  | DeepgramMetrics
  | ElevenLabsMetrics
  | BrevoMetrics;

export interface CostRecord {
  id: number;
  provider: Provider;
  periodStart: string;
  periodEnd: string;
  rawMetrics: Record<string, number>;
  fetchedAt: string;
  currency: string;
  computedCost: number;
  computedCostUsd: number;
}

export interface ListCostRecordsResponse {
  data: CostRecord[];
  total: number;
  page: number;
  limit: number;
}

export interface ProviderCostEntry {
  cost: number;
  costUsd: number;
}

export interface CostSummaryResponse {
  currency: string;
  totalCost: number;
  totalCostUsd: number;
  byProvider: Partial<Record<Provider, ProviderCostEntry>>;
  periodStart: string;
  periodEnd: string;
}

export interface FetchNowResponse {
  message: string;
  date: string;
}

export interface ListCostRecordsParams {
  provider?: Provider;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  currency?: string;
}

export interface CostSummaryParams {
  from: string;
  to: string;
  currency?: string;
}
