'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ActionResult } from '@/_utils/actionResult';

import { useAsyncStatus } from '../useAsyncStatus';

type Status = 'idle' | 'submitting' | 'success' | 'error';

type Options = {
	successDuration?: number;
};

export const useFormFeedback = ({ successDuration = 3000 }: Options = {}) => {
	const {
		status: asyncStatus,
		error,
		run,
		reset: resetAsync,
	} = useAsyncStatus();
	const [countdown, setCountdown] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const countdownRef = useRef(0);

	// Map asyncStatus to form feedback status
	const status: Status = useMemo(() => {
		if (asyncStatus === 'loading') return 'submitting';
		if (asyncStatus === 'success') return 'success';
		if (asyncStatus === 'error') return 'error';
		return 'idle';
	}, [asyncStatus]);

	useEffect(() => {
		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const reset = useCallback(() => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		countdownRef.current = 0;
		setCountdown(0);
		resetAsync();
	}, [resetAsync]);

	const wrap = useCallback(
		<TArgs extends unknown[], TData>(
			fn: (...args: TArgs) => Promise<ActionResult<TData>>,
			onSuccess?: (data: TData) => void,
		) =>
			async (...args: TArgs): Promise<void> => {
				// Clear any existing interval before starting new operation
				if (intervalRef.current !== null) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
				countdownRef.current = 0;
				setCountdown(0);

				const result = await run(() => fn(...args));

				// Error case - useAsyncStatus already handled status/error state
				if (!result?.ok) {
					return;
				}

				// Handle successDuration: 0 case - call onSuccess immediately and reset status
				if (successDuration === 0) {
					onSuccess?.(result.data);
					resetAsync();
					return;
				}

				// Handle countdown case
				const { data } = result;
				const seconds = successDuration / 1000;
				countdownRef.current = seconds;
				setCountdown(seconds);

				const id = setInterval(() => {
					countdownRef.current -= 1;
					setCountdown(countdownRef.current);
					if (countdownRef.current <= 0) {
						intervalRef.current = null;
						clearInterval(id);
						onSuccess?.(data);
					}
				}, 1000);
				intervalRef.current = id;
			},
		[run, successDuration, resetAsync],
	);

	// Provide fallback message for non-Error throws where error would be null/undefined
	const errorMessage =
		error ??
		(asyncStatus === 'error' ? 'An unexpected error occurred' : undefined);

	return { status, countdown, errorMessage, wrap, reset };
};
