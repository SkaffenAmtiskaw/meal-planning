import { act, renderHook } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useFormFeedback } from './useFormFeedback';

describe('useFormFeedback', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.resetAllMocks();
	});

	test('returns idle initial state', () => {
		const { result } = renderHook(() => useFormFeedback());

		expect(result.current.status).toBe('idle');
		expect(result.current.countdown).toBe(0);
		expect(result.current.errorMessage).toBeUndefined();
	});

	describe('wrap — success with countdown', () => {
		test('transitions submitting → success and sets initial countdown', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockResolvedValue(undefined);
			const onSuccess = vi.fn();

			await act(async () => {
				await result.current.wrap(fn, onSuccess)();
			});

			expect(result.current.status).toBe('success');
			expect(result.current.countdown).toBe(3);
			expect(onSuccess).not.toHaveBeenCalled();
		});

		test('decrements countdown each second', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockResolvedValue(undefined);

			await act(async () => {
				await result.current.wrap(fn, vi.fn())();
			});

			act(() => {
				vi.advanceTimersByTime(1000);
			});
			expect(result.current.countdown).toBe(2);

			act(() => {
				vi.advanceTimersByTime(1000);
			});
			expect(result.current.countdown).toBe(1);
		});

		test('calls onSuccess when countdown reaches 0', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockResolvedValue(undefined);
			const onSuccess = vi.fn();

			await act(async () => {
				await result.current.wrap(fn, onSuccess)();
			});

			act(() => {
				vi.advanceTimersByTime(3000);
			});

			expect(onSuccess).toHaveBeenCalledOnce();
		});
	});

	describe('wrap — successDuration: 0', () => {
		test('calls onSuccess immediately without entering success state', async () => {
			const { result } = renderHook(() =>
				useFormFeedback({ successDuration: 0 }),
			);
			const fn = vi.fn().mockResolvedValue(undefined);
			const onSuccess = vi.fn();

			await act(async () => {
				await result.current.wrap(fn, onSuccess)();
			});

			expect(onSuccess).toHaveBeenCalledOnce();
			expect(result.current.status).not.toBe('success');
		});

		test('does not start a countdown interval', async () => {
			const { result } = renderHook(() =>
				useFormFeedback({ successDuration: 0 }),
			);
			const fn = vi.fn().mockResolvedValue(undefined);

			await act(async () => {
				await result.current.wrap(fn, vi.fn())();
			});

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(result.current.countdown).toBe(0);
		});
	});

	describe('wrap — error', () => {
		test('transitions to error with Error message', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockRejectedValue(new Error('Network failure'));

			await act(async () => {
				await result.current.wrap(fn, vi.fn())();
			});

			expect(result.current.status).toBe('error');
			expect(result.current.errorMessage).toBe('Network failure');
		});

		test('uses fallback message for non-Error throws', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockRejectedValue('plain string error');

			await act(async () => {
				await result.current.wrap(fn, vi.fn())();
			});

			expect(result.current.status).toBe('error');
			expect(result.current.errorMessage).toBe('An unexpected error occurred');
		});

		test('does not call onSuccess on failure', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockRejectedValue(new Error('fail'));
			const onSuccess = vi.fn();

			await act(async () => {
				await result.current.wrap(fn, onSuccess)();
			});

			expect(onSuccess).not.toHaveBeenCalled();
		});
	});

	describe('reset', () => {
		test('returns to idle and clears errorMessage when no interval is active', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockRejectedValue(new Error('fail'));

			await act(async () => {
				await result.current.wrap(fn, vi.fn())();
			});

			expect(result.current.status).toBe('error');

			act(() => {
				result.current.reset();
			});

			expect(result.current.status).toBe('idle');
			expect(result.current.errorMessage).toBeUndefined();
		});

		test('clears an active countdown interval and prevents onSuccess from being called', async () => {
			const { result } = renderHook(() => useFormFeedback());
			const fn = vi.fn().mockResolvedValue(undefined);
			const onSuccess = vi.fn();

			await act(async () => {
				await result.current.wrap(fn, onSuccess)();
			});

			act(() => {
				result.current.reset();
			});

			act(() => {
				vi.advanceTimersByTime(5000);
			});

			expect(onSuccess).not.toHaveBeenCalled();
			expect(result.current.status).toBe('idle');
		});
	});

	test('clears active interval on unmount', async () => {
		const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
		const { result, unmount } = renderHook(() => useFormFeedback());
		const fn = vi.fn().mockResolvedValue(undefined);

		await act(async () => {
			await result.current.wrap(fn, vi.fn())();
		});

		unmount();

		expect(clearIntervalSpy).toHaveBeenCalled();
	});

	test('does not call clearInterval on unmount when no interval is active', () => {
		const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
		const { unmount } = renderHook(() => useFormFeedback());

		unmount();

		expect(clearIntervalSpy).not.toHaveBeenCalled();
	});
});
