/**
 * Shared mock for @/_hooks.
 *
 * Usage in a test file:
 *
 *   import { mockUseFormFeedback } from '@mocks/@/_hooks';
 *   vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));
 *
 * `mockUseFormFeedback` defaults to an idle state whose `wrap` calls `fn` and
 * forwards the result to `onSuccess`. Use `mockReturnValueOnce(...)` to override
 * for a single test (e.g. to simulate error state).
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(useOneTap).mockImplementationOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

export const mockUseFormFeedback = vi.fn(() => ({
	status: 'idle' as FeedbackStatus,
	countdown: 0,
	errorMessage: undefined as string | undefined,
	wrap:
		<TArgs extends unknown[], TData>(
			fn: (...args: TArgs) => Promise<{ ok: boolean; data?: TData; error?: string }>,
			onSuccess: (data: TData) => void,
		) =>
		async (...args: TArgs): Promise<void> => {
			const result = await fn(...args);
			if (result.ok && result.data !== undefined) onSuccess(result.data);
		},
	reset: vi.fn(),
}));

export const useFormFeedback = () => mockUseFormFeedback();
export const useOneTap = vi.fn();
export const useAsyncButton = vi.fn();
export const useEditMode = vi.fn();