/**
 * Shared mock for @/_hooks.
 *
 * Usage in a test file:
 *   vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
 *
 * Default implementations survive `vi.resetAllMocks()`. Use
 * `vi.mocked(useFormFeedback).mockReturnValueOnce(...)` etc. to override for a single test.
 */

import { vi } from 'vitest';

import { type ReactNode, useState } from 'react';

import { DateTime } from 'luxon';

import { makeKnownDay } from '#fixtures/viewerDay';
import type { AsyncStatus } from '@/_hooks/useAsyncStatus';
import type { Status } from '@/_hooks/useFormFeedback';
import type { UseSwipeOptions } from '@/_hooks/useSwipe';
import type { ViewerDay } from '@/_hooks/useTimeZone';
import { type DateStyle, formatDate } from '@/_utils/formatDate';

const idle: Status = 'idle';

export const useFormFeedback = vi.fn(() => ({
	status: idle,
	countdown: 0,
	errorMessage: undefined as string | undefined,
	wrap:
		<TArgs extends unknown[], TData>(
			fn: (
				...args: TArgs
			) => Promise<{ ok: boolean; data?: TData; error?: string }>,
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
	const [status, setStatus] = useState<AsyncStatus>('idle');
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

export const MobileGuessProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);

export const useIsMobile = vi.fn(() => false);

export const useFocusOnExpand = vi.fn(() => ({
	ref: { current: null },
	requestFocus: vi.fn(),
}));

/**
 * A test swipes by calling the `onSwipe` it was given:
 *   act(() => vi.mocked(useSwipe).mock.lastCall?.[0].onSwipe('left'));
 */
export const useSwipe = vi.fn((_options: UseSwipeOptions) => vi.fn());

export const TimeZoneProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);

/**
 * A known zone by default, formatting in UTC. A test of the unknown zone sets:
 *   vi.mocked(useViewerZoneFormat).mockReturnValue({ isKnown: false, format: ... });
 */
export const useViewerZoneFormat = vi.fn(() => ({
	isKnown: true,
	format: (isoDateTime: string, style: DateStyle) =>
		formatDate(DateTime.fromISO(isoDateTime, { zone: 'UTC' }), style),
}));

/**
 * A known day by default. A test sets another with the `#fixtures/viewerDay` builders:
 *   vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
 */
export const useToday = vi.fn(
	(): ViewerDay => makeKnownDay(DateTime.now().startOf('day')),
);

/** Gives the `useToday` mock's day, so a test sets the day once for both. */
export const useTodayOrThrow = vi.fn((): DateTime => {
	const { today } = useToday();
	if (!today) {
		throw new Error('useTodayOrThrow() was called while the day is unknown.');
	}
	return today;
});
