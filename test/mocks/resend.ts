/**
 * Shared mock for resend.
 *
 * Usage in a test file:
 *
 *   import { mockSend, resendConstructor } from '@mocks/resend';
 *   vi.mock('resend', async () => await import('@mocks/resend'));
 *
 * `mockSend` is the spy on `emails.send`. Use `mockSend.mockResolvedValueOnce(...)`
 * to control the return value for a single test.
 *
 * `resendConstructor` is the spy called with the API key when `new Resend(key)` is invoked.
 */

import { vi } from 'vitest';

export const mockSend = vi.fn();
export const resendConstructor = vi.fn();

// biome-ignore lint/complexity/useArrowFunction: arrow functions cannot be used as constructors
export const Resend = vi.fn().mockImplementation(function (apiKey: string) {
	resendConstructor(apiKey);
	return { emails: { send: mockSend } };
});
