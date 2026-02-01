import clientApi from '@/lib/apis/axios-client';
import type {
  CreateTestcaseFileResponse,
  CreateTestcaseResponse,
  SampleTestCase,
} from '@/types/testcases';
import { toastService } from './toasts-service';

export class TestcasesService {
  // Create test cases from array (returns testcase ID)
  static async createTestcase(
    testcases: SampleTestCase[]
  ): Promise<CreateTestcaseResponse> {
    try {
      const response = await clientApi.post('/testcases', { testcases });
      return response?.data?.data;
    } catch (error) {
      console.error('Error creating testcase:', error);
      throw error;
    }
  }

  // Create testcase by uploading file
  static async createTestcaseFile(
    file: File
  ): Promise<CreateTestcaseFileResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file, file.name);

      const response = await clientApi.post('/testcases', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // Include cookies if needed
      });
      return response?.data?.data;
    } catch (error) {
      console.error('Error uploading testcase file:', error);
      throw error;
    }
  }

  // Cache management for testcase responses
  private static testcaseStorage = new Map<
    string,
    CreateTestcaseFileResponse
  >();

  static saveTestcaseToCache(
    key: string,
    response: CreateTestcaseFileResponse
  ): void {
    TestcasesService.testcaseStorage.set(key, response);
    // Optional: Set expiration time (e.g., 1 hour)
    setTimeout(
      () => {
        TestcasesService.testcaseStorage.delete(key);
      },
      60 * 60 * 1000
    ); // 1 hour expiration
  }

  static getTestcaseFromCache(key: string): CreateTestcaseFileResponse | null {
    return TestcasesService.testcaseStorage.get(key) || null;
  }

  static clearTestcaseCache(): void {
    TestcasesService.testcaseStorage.clear();
  }

  // Helper method to generate cache key for file
  static generateCacheKey(file: File): string {
    return `testcase_${file.name}_${file.size}_${file.lastModified}`;
  }

  // Complete testcase creation workflow with caching
  static async createTestcaseComplete(file: File): Promise<number> {
    try {
      // Check if we have a cached testcase response for this file
      const cacheKey = TestcasesService.generateCacheKey(file);
      const cachedResponse = TestcasesService.getTestcaseFromCache(cacheKey);

      if (cachedResponse) {
        return cachedResponse.id;
      }
      // Upload new testcase and cache the result
      const testcaseResponse = await TestcasesService.createTestcaseFile(file);
      TestcasesService.saveTestcaseToCache(cacheKey, testcaseResponse);
      return testcaseResponse.id;
    } catch (error) {
      toastService.error('Failed to create testcase');
      throw error;
    }
  }
}
