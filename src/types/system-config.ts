export interface SystemConfig {
  key: string;
  value: string;
  description?: string;
}

export interface UpsertSystemConfigDto {
  value: string;
  description?: string;
}
