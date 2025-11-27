/**
 * VEO 3.1 Client Tests
 *
 * Basic tests for VEO client functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { VeoClient, getVeoClient, resetVeoClient } from './veo';
import { ValidationError } from './types';

describe('VeoClient', () => {
  describe('Configuration', () => {
    it('should throw error if API key is missing', () => {
      expect(() => {
        new VeoClient({
          apiKey: '',
          apiUrl: 'https://api.veo.ai/v3.1',
        });
      }).toThrow('VEO API key is required');
    });

    it('should throw error if API URL is missing', () => {
      expect(() => {
        new VeoClient({
          apiKey: 'test-key',
          apiUrl: '',
        });
      }).toThrow('VEO API URL is required');
    });

    it('should create client with valid config', () => {
      const client = new VeoClient({
        apiKey: 'test-key',
        apiUrl: 'https://api.veo.ai/v3.1',
      });

      expect(client).toBeInstanceOf(VeoClient);
    });
  });

  describe('Request Validation', () => {
    let client: VeoClient;

    beforeEach(() => {
      client = new VeoClient({
        apiKey: 'test-key',
        apiUrl: 'https://api.veo.ai/v3.1',
      });
    });

    it('should throw ValidationError if brand_id is missing', async () => {
      await expect(
        client.generateVideo({
          brand_id: '',
          prompt: 'Test video',
          duration: 30,
          aspect_ratio: '16:9',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if prompt is empty', async () => {
      await expect(
        client.generateVideo({
          brand_id: 'brand-123',
          prompt: '',
          duration: 30,
          aspect_ratio: '16:9',
        })
      ).rejects.toThrow('prompt is required and cannot be empty');
    });

    it('should throw ValidationError if duration is invalid', async () => {
      await expect(
        client.generateVideo({
          brand_id: 'brand-123',
          prompt: 'Test video',
          duration: 0,
          aspect_ratio: '16:9',
        })
      ).rejects.toThrow('duration must be a positive number');
    });

    it('should throw ValidationError if duration exceeds max', async () => {
      await expect(
        client.generateVideo({
          brand_id: 'brand-123',
          prompt: 'Test video',
          duration: 400,
          aspect_ratio: '16:9',
        })
      ).rejects.toThrow('duration cannot exceed 300 seconds');
    });

    it('should throw ValidationError if aspect_ratio is invalid', async () => {
      await expect(
        client.generateVideo({
          brand_id: 'brand-123',
          prompt: 'Test video',
          duration: 30,
          aspect_ratio: '21:9' as any,
        })
      ).rejects.toThrow('aspect_ratio must be one of');
    });

    it('should throw ValidationError if too many reference images', async () => {
      await expect(
        client.generateVideo({
          brand_id: 'brand-123',
          prompt: 'Test video',
          duration: 30,
          aspect_ratio: '16:9',
          reference_images: ['url1', 'url2', 'url3', 'url4', 'url5', 'url6'],
        })
      ).rejects.toThrow('Cannot provide more than 5 reference images');
    });

    it('should throw ValidationError if jobId is empty for getJobStatus', async () => {
      await expect(client.getJobStatus('')).rejects.toThrow('jobId is required');
    });

    it('should throw ValidationError if jobId is empty for cancelJob', async () => {
      await expect(client.cancelJob('')).rejects.toThrow('jobId is required');
    });
  });

  describe('Factory Function', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      resetVeoClient();
    });

    afterEach(() => {
      process.env = originalEnv;
      resetVeoClient();
    });

    it('should throw error if VEO_API_KEY is not set', () => {
      delete process.env.VEO_API_KEY;
      process.env.VEO_API_URL = 'https://api.veo.ai/v3.1';

      expect(() => getVeoClient()).toThrow('VEO_API_KEY environment variable is not set');
    });

    it('should throw error if VEO_API_URL is not set', () => {
      process.env.VEO_API_KEY = 'test-key';
      delete process.env.VEO_API_URL;

      expect(() => getVeoClient()).toThrow('VEO_API_URL environment variable is not set');
    });

    it('should create singleton instance', () => {
      process.env.VEO_API_KEY = 'test-key';
      process.env.VEO_API_URL = 'https://api.veo.ai/v3.1';

      const client1 = getVeoClient();
      const client2 = getVeoClient();

      expect(client1).toBe(client2);
    });

    it('should reset singleton instance', () => {
      process.env.VEO_API_KEY = 'test-key';
      process.env.VEO_API_URL = 'https://api.veo.ai/v3.1';

      const client1 = getVeoClient();
      resetVeoClient();
      const client2 = getVeoClient();

      expect(client1).not.toBe(client2);
    });
  });
});
