/**
 * Gemini AI Service
 * Wraps the Google Generative AI SDK with error handling, timeouts, and retries.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger, safeJSONParse, withTimeout } from '../utils/helpers';
import { getConfig } from '../config';

let geminiInstance: GoogleGenerativeAI | null = null;

/**
 * Initialize and return Gemini client (singleton).
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiInstance) {
    const config = getConfig();
    geminiInstance = new GoogleGenerativeAI(config.GEMINI_API_KEY);
    logger.info('✓ Gemini AI initialized');
  }
  return geminiInstance;
}

/**
 * Generate structured JSON response from Gemini.
 * Includes timeout handling and fallback for malformed responses.
 */
export async function generateJSON<T>(
  prompt: string,
  fallback?: T
): Promise<T> {
  try {
    const config = getConfig();
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await withTimeout(promise, config.API_TIMEOUT_MS);
    const text = result.response.text();

    // Validate and parse JSON response
    const parsed = safeJSONParse<T>(text, fallback || {} as T);
    return parsed;
  } catch (error) {
    logger.error('Gemini generation error', error);

    if (fallback !== undefined) {
      logger.warn('Using fallback response due to generation error');
      return fallback;
    }

    throw new Error('Failed to generate response from AI. Please try again.');
  }
}

/**
 * Generate text response from Gemini (non-JSON).
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const config = getConfig();
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const promise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const result = await withTimeout(promise, config.API_TIMEOUT_MS);
    return result.response.text();
  } catch (error) {
    logger.error('Gemini text generation error', error);
    throw new Error('Failed to generate text response. Please try again.');
  }
}

/**
 * Health check for Gemini API.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await withTimeout(
      model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      }),
      5000
    );

    return !!result.response.text();
  } catch (error) {
    logger.error('Gemini health check failed', error);
    return false;
  }
}
