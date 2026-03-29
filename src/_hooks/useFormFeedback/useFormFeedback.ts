'use client';

import { useEffect, useRef, useState } from 'react';

import type { ActionResult } from '@/_utils/actionResult';

type Status = 'idle' | 'submitting' | 'success' | 'error';

type Options = {
	successDuration?: number;
};

export const useFormFeedback = ({ successDuration = 3000 }: Options = {}) => {
	const [status, setStatus] = useState<Status>('idle');
	const [countdown, setCountdown] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const countdownRef = useRef(0);

	useEffect(() => {
		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	const reset = () => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setStatus('idle');
		setCountdown(0);
		setErrorMessage(undefined);
	};

	const wrap =
		<TArgs extends unknown[], TData>(
			fn: (...args: TArgs) => Promise<ActionResult<TData>>,
			onSuccess: (data: TData) => void,
		) =>
		async (...args: TArgs): Promise<void> => {
			setStatus('submitting');
			setErrorMessage(undefined);

			try {
				const result = await fn(...args);

				if (!result.ok) {
					setStatus('error');
					setErrorMessage(result.error);
					return;
				}

				if (successDuration === 0) {
					onSuccess(result.data);
					return;
				}

				const { data } = result;
				const seconds = successDuration / 1000;
				countdownRef.current = seconds;
				setStatus('success');
				setCountdown(seconds);

				const id = setInterval(() => {
					countdownRef.current -= 1;
					setCountdown(countdownRef.current);
					if (countdownRef.current <= 0) {
						intervalRef.current = null;
						clearInterval(id);
						onSuccess(data);
					}
				}, 1000);
				intervalRef.current = id;
			} catch (err) {
				setStatus('error');
				setErrorMessage(
					err instanceof Error ? err.message : 'An unexpected error occurred',
				);
			}
		};

	return { status, countdown, errorMessage, wrap, reset };
};
