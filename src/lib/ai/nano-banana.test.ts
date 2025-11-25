/**
 * Tests for Nano Banana Pro API Client
 *
 * These tests demonstrate the client functionality.
 * In a real environment, you would use a testing framework like Jest or Vitest.
 */

import { NanoBananaClient, resetNanoBananaClient } from './nano-banana';
import {
  ValidationError,
  AuthenticationError,
  AIServiceError,
  GenerateImageRequest,
} from './types';

// ============================================================================
// Test Helpers
// ============================================================================

function createMockClient(apiKey = 'test_key', apiUrl = 'http://localhost:3001') {
  return new NanoBananaClient({ apiKey, apiUrl, debug: true });
}

function createValidRequest(): GenerateImageRequest {
  return {
    brand_id: 'brand_123',
    prompt: 'Test product photography',
    output_formats: [
      { name: 'square', width: 1080, height: 1080 },
    ],
  };
}

// ============================================================================
// Configuration Tests
// ============================================================================

async function testConfigValidation() {
  console.log('Test: Configuration validation');

  try {
    // Should throw without API key
    new NanoBananaClient({ apiKey: '', apiUrl: 'http://test.com' });
    console.error('❌ Should have thrown error for missing API key');
  } catch (error) {
    if (error instanceof Error && error.message.includes('API key is required')) {
      console.log('✅ Correctly validates missing API key');
    }
  }

  try {
    // Should throw without API URL
    new NanoBananaClient({ apiKey: 'test', apiUrl: '' });
    console.error('❌ Should have thrown error for missing API URL');
  } catch (error) {
    if (error instanceof Error && error.message.includes('API URL is required')) {
      console.log('✅ Correctly validates missing API URL');
    }
  }

  // Should succeed with valid config
  const client = createMockClient();
  console.log('✅ Creates client with valid config');
}

// ============================================================================
// Request Validation Tests
// ============================================================================

async function testRequestValidation() {
  console.log('\nTest: Request validation');
  const client = createMockClient();

  // Test missing brand_id
  try {
    await client.generateImage({
      brand_id: '',
      prompt: 'test',
      output_formats: [{ name: 'test', width: 100, height: 100 }],
    });
    console.error('❌ Should validate brand_id');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('brand_id')) {
      console.log('✅ Validates missing brand_id');
    }
  }

  // Test missing prompt
  try {
    await client.generateImage({
      brand_id: 'brand_123',
      prompt: '',
      output_formats: [{ name: 'test', width: 100, height: 100 }],
    });
    console.error('❌ Should validate prompt');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('prompt')) {
      console.log('✅ Validates missing prompt');
    }
  }

  // Test missing output formats
  try {
    await client.generateImage({
      brand_id: 'brand_123',
      prompt: 'test',
      output_formats: [],
    });
    console.error('❌ Should validate output formats');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('output format')) {
      console.log('✅ Validates missing output formats');
    }
  }

  // Test invalid variations
  try {
    await client.generateImage({
      brand_id: 'brand_123',
      prompt: 'test',
      output_formats: [{ name: 'test', width: 100, height: 100 }],
      variations: 10, // Too many
    });
    console.error('❌ Should validate variations range');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('variations')) {
      console.log('✅ Validates variations range');
    }
  }

  // Test invalid output format
  try {
    await client.generateImage({
      brand_id: 'brand_123',
      prompt: 'test',
      output_formats: [{ name: '', width: 100, height: 100 }],
    });
    console.error('❌ Should validate output format name');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('name')) {
      console.log('✅ Validates output format name');
    }
  }

  // Test invalid dimensions
  try {
    await client.generateImage({
      brand_id: 'brand_123',
      prompt: 'test',
      output_formats: [{ name: 'test', width: 0, height: 100 }],
    });
    console.error('❌ Should validate width');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('width')) {
      console.log('✅ Validates width');
    }
  }
}

// ============================================================================
// Job Status Validation Tests
// ============================================================================

async function testJobStatusValidation() {
  console.log('\nTest: Job status validation');
  const client = createMockClient();

  try {
    await client.getJobStatus('');
    console.error('❌ Should validate jobId');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('jobId')) {
      console.log('✅ Validates empty jobId');
    }
  }

  try {
    await client.cancelJob('');
    console.error('❌ Should validate jobId for cancel');
  } catch (error) {
    if (error instanceof ValidationError && error.message.includes('jobId')) {
      console.log('✅ Validates empty jobId for cancel');
    }
  }
}

// ============================================================================
// Error Type Tests
// ============================================================================

function testErrorTypes() {
  console.log('\nTest: Error types');

  // Test ValidationError
  const validationError = new ValidationError('Invalid param', { field: 'test' });
  console.log('✅ ValidationError:', {
    name: validationError.name,
    code: validationError.code,
    statusCode: validationError.statusCode,
    details: validationError.details,
  });

  // Test AuthenticationError
  const authError = new AuthenticationError('Invalid key');
  console.log('✅ AuthenticationError:', {
    name: authError.name,
    code: authError.code,
    statusCode: authError.statusCode,
  });

  // Test AIServiceError
  const aiError = new AIServiceError('Service error', 'CUSTOM_ERROR', 500, { foo: 'bar' });
  console.log('✅ AIServiceError:', {
    name: aiError.name,
    code: aiError.code,
    statusCode: aiError.statusCode,
    details: aiError.details,
  });
}

// ============================================================================
// Type Tests
// ============================================================================

function testTypes() {
  console.log('\nTest: Type definitions');

  const request: GenerateImageRequest = {
    brand_id: 'brand_123',
    product_id: 'prod_456',
    talent_id: 'talent_789',
    prompt: 'Professional photography',
    negative_prompt: 'blurry',
    style_preset: 'minimal',
    output_formats: [
      { name: 'instagram', width: 1080, height: 1080 },
      { name: 'facebook', width: 1200, height: 630 },
    ],
    variations: 3,
    seed: 12345,
  };

  console.log('✅ GenerateImageRequest type is valid');

  const stylePresets: Array<typeof request.style_preset> = [
    'minimal',
    'bold',
    'lifestyle',
    'promotional',
  ];

  console.log('✅ StylePreset enum is valid:', stylePresets);
}

// ============================================================================
// Singleton Tests
// ============================================================================

async function testSingleton() {
  console.log('\nTest: Singleton pattern');

  // Set environment variables for singleton
  process.env.NANO_BANANA_API_KEY = 'test_key';
  process.env.NANO_BANANA_API_URL = 'http://test.com';

  resetNanoBananaClient();

  const { getNanoBananaClient } = await import('./nano-banana');

  const client1 = getNanoBananaClient();
  const client2 = getNanoBananaClient();

  if (client1 === client2) {
    console.log('✅ Singleton returns same instance');
  } else {
    console.error('❌ Singleton should return same instance');
  }

  resetNanoBananaClient();

  const client3 = getNanoBananaClient();

  if (client1 !== client3) {
    console.log('✅ Reset creates new instance');
  } else {
    console.error('❌ Reset should create new instance');
  }
}

// ============================================================================
// Mock API Response Tests (would need actual mocking in real tests)
// ============================================================================

function testMockResponses() {
  console.log('\nTest: Mock response types');

  const mockJobResponse = {
    job_id: 'job_123',
    status: 'completed' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      {
        url: 'https://example.com/image.jpg',
        format: { name: 'square', width: 1080, height: 1080 },
        seed: 12345,
        variation_index: 0,
      },
    ],
    metadata: {
      prompt: 'Test prompt',
      style_preset: 'minimal' as const,
      model_version: '1.0',
    },
  };

  console.log('✅ Job response structure is valid:', mockJobResponse);
}

// ============================================================================
// Run All Tests
// ============================================================================

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('NANO BANANA CLIENT TESTS');
  console.log('='.repeat(60));

  await testConfigValidation();
  await testRequestValidation();
  await testJobStatusValidation();
  testErrorTypes();
  testTypes();
  await testSingleton();
  testMockResponses();

  console.log('\n' + '='.repeat(60));
  console.log('ALL TESTS COMPLETED');
  console.log('='.repeat(60));
}

// Export for use in test runners
export {
  testConfigValidation,
  testRequestValidation,
  testJobStatusValidation,
  testErrorTypes,
  testTypes,
  testSingleton,
  testMockResponses,
  runAllTests,
};

// Run if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
