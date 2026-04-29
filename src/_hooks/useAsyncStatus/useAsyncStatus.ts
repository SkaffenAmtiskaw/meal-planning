'use client';

import { useCallback, useState } from 'react';

import type { ActionResult } from '@/_utils/actionResult/ActionResult';
import { catchify } from '@/_utils/catchify';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseAsyncStatusResult {
	status: AsyncStatus;
	error: string | null;
	run: <T>(
		fn: () => Promise<ActionResult<T>>,
	) => Promise<ActionResult<T> | undefined>;
	reset: () => void;
}

export const useAsyncStatus = (): UseAsyncStatusResult => {
	const [status, setStatus] = useState<AsyncStatus>('idle');
	const [error, setError] = useState<string | null>(null);

	const run = useCallback(
		async <T>(
			fn: () => Promise<ActionResult<T>>,
		): Promise<ActionResult<T> | undefined> => {
			setStatus('loading');
			setError(null);

			const [result, exception] = await catchify(fn);

			// Handle actual exceptions (network errors, etc.)
			if (exception) {
				setStatus('error');
				setError(exception.message);
				return undefined;
			}

			// Handle business logic errors (ok: false)
			if (!result?.ok) {
				setStatus('error');
				setError(result?.error || 'An error occurred');
				return result;
			}

			setStatus('success');
			return result;
		},
		[],
	);

	const reset = useCallback(() => {
		setStatus('idle');
		setError(null);
	}, []);

	return { status, error, run, reset };
};
