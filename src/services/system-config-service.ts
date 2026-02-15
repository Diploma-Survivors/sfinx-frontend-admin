import clientApi from "@/lib/apis/axios-client";
import { SystemConfig, UpsertSystemConfigDto } from "@/types/system-config";

export const SystemConfigService = {
  /**
   * Get all system configurations
   */
  async getAll(): Promise<SystemConfig[]> {
    const response = await clientApi.get("/admin/system-config");
    return response.data.data;
  },

  /**
   * Get a single system configuration by key
   */
  async get(key: string): Promise<SystemConfig> {
    const response = await clientApi.get(`/admin/system-config/${key}`);
    return response.data.data;
  },

  /**
   * Create or update a system configuration
   */
  async upsert(
    key: string,
    data: UpsertSystemConfigDto,
  ): Promise<SystemConfig> {
    const response = await clientApi.put(`/admin/system-config/${key}`, data);
    return response.data.data;
  },

  /**
   * Delete a system configuration
   */
  async delete(key: string): Promise<void> {
    await clientApi.delete(`/admin/system-config/${key}`);
  },
};
