/**
 * Shared mock for @/_hooks.
 *
 * Usage in a test file:
 *   vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(useFormFeedback).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';
import { useState } from 'react';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

export const useFormFeedback = vi.fn(() => ({
	status: 'idle' as FeedbackStatus,
	countdown: 0,
	errorMessage: undefined as string | undefined,
	wrap:
		<TArgs extends unknown[], TData>(
			fn: (...args: TArgs) => Promise<{ ok: boolean; data?: TData; error?: string }>,
			onSuccess?: (data: TData) => void,
		) =>
		async (...args: TArgs): Promise<void> => {
			const result = await fn(...args);
			if (result.ok && onSuccess) {
				onSuccess(result.data as TData);
			}
		},
	reset: vi.fn(),
}));

export const useAsyncStatus = vi.fn(() => {
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [error, setError] = useState<string | null>(null);

	const run = async (fn: () => Promise<unknown>) => {
		try {
			setStatus('loading');
			await fn();
			setStatus('success');
			return { ok: true };
		} catch {
			setStatus('error');
			setError('An error occurred');
			return { ok: false };
		}
	};

	const reset = () => {
		setStatus('idle');
		setError(null);
	};

	return { status, error, run, reset };
});

export const useEditMode = vi.fn((initial = false) => {
	const [editing, setEditing] = useState(initial);

	return [
		editing,
		{
			enterEditing: vi.fn(() => setEditing(true)),
			exitEditing: vi.fn(() => setEditing(false)),
		},
	];
});

export const useAsyncButton = vi.fn(() => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const run = async <T>(fn: () => Promise<T>) => {
		setLoading(true);
		setError(null);
		try {
			const result = await fn();
			setLoading(false);
			return result;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			setLoading(false);
			// Don't re-throw - error is available via error state
		}
	};

	return { loading, error, run };
});

export const useOneTap = vi.fn();
