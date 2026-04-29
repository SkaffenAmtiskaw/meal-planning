import { act, renderHook } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ActionResult } from '@/_utils/actionResult/ActionResult';

import { type AsyncStatus, useAsyncStatus } from './useAsyncStatus';

const mockCatchify = vi.fn();

vi.mock('@/_utils/catchify', () => ({
	catchify: (...args: unknown[]) => mockCatchify(...args),
}));

describe('useAsyncStatus', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('initial state', () => {
		it('returns idle status and null error initially', () => {
			const { result } = renderHook(() => useAsyncStatus());

			expect(result.current.status).toBe('idle');
			expect(result.current.error).toBeNull();
		});
	});

	describe('run', () => {
		it('transitions status from idle to loading when run is called', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			let promise: Promise<ActionResult<undefined> | undefined>;
			act(() => {
				promise = result.current.run(mockFn);
			});

			expect(result.current.status).toBe('loading');
			expect(result.current.error).toBeNull();

			await act(async () => {
				await promise;
			});
		});

		it('transitions status from loading to success on successful execution', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.status).toBe('success');
			expect(result.current.error).toBeNull();
		});

		it('transitions status from loading to error on exception', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([undefined, new Error('Network error')]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.status).toBe('error');
			expect(result.current.error).toBe('Network error');
		});

		it('transitions status from loading to error when result.ok is false', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([
					{ ok: false, error: 'Business logic error' },
					undefined,
				]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.status).toBe('error');
			expect(result.current.error).toBe('Business logic error');
		});

		it('uses error message from exception', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([undefined, new Error('Custom error message')]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.error).toBe('Custom error message');
		});

		it('uses error message from result when ok is false', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([
					{ ok: false, error: 'Custom business error' },
					undefined,
				]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.error).toBe('Custom business error');
		});

		it('uses fallback message when ok is false without error', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: false, error: '' }, undefined]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.error).toBe('An error occurred');
		});

		it('clears previous error when starting new operation', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const failingFn = vi.fn();
			const successFn = vi.fn();

			// First run - fails
			mockCatchify.mockImplementationOnce(() =>
				Promise.resolve([undefined, new Error('First error')]),
			);

			await act(async () => {
				await result.current.run(failingFn);
			});

			expect(result.current.error).toBe('First error');

			// Second run - should clear error
			mockCatchify.mockImplementationOnce(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			await act(async () => {
				await result.current.run(successFn);
			});

			expect(result.current.error).toBeNull();
		});

		it('calls catchify with the provided function', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(mockCatchify).toHaveBeenCalledTimes(1);
			expect(mockCatchify).toHaveBeenCalledWith(mockFn);
		});

		it('returns a promise that resolves after function completes', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			const runPromise = act(async () => {
				await result.current.run(mockFn);
			});

			await expect(runPromise).resolves.toBeUndefined();
		});

		it('returns a promise that resolves even when function has business error', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: false, error: 'Business error' }, undefined]),
			);

			const runPromise = act(async () => {
				await result.current.run(mockFn);
			});

			await expect(runPromise).resolves.toBeUndefined();
		});

		it('returns a promise that resolves even when function throws exception', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([undefined, new Error('Exception')]),
			);

			const runPromise = act(async () => {
				await result.current.run(mockFn);
			});

			await expect(runPromise).resolves.toBeUndefined();
		});

		it('returns the result data on success', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			type TestData = { id: number; name: string };
			const mockData: ActionResult<TestData> = {
				ok: true,
				data: { id: 1, name: 'test' },
			};
			const mockFn = vi.fn().mockResolvedValue(mockData);
			mockCatchify.mockImplementation(() =>
				Promise.resolve([mockData, undefined]),
			);

			let returnValue: ActionResult<TestData> | undefined;
			await act(async () => {
				returnValue = await result.current.run(mockFn);
			});

			expect(returnValue).toEqual(mockData);
		});

		it('returns the error result on business logic error', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			const errorResult: ActionResult<void> = {
				ok: false,
				error: 'Business error',
			};
			mockCatchify.mockImplementation(() =>
				Promise.resolve([errorResult, undefined]),
			);

			let returnValue: ActionResult<void> | undefined;
			await act(async () => {
				returnValue = await result.current.run(mockFn);
			});

			expect(returnValue).toEqual(errorResult);
		});

		it('returns undefined on exception', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([undefined, new Error('Exception')]),
			);

			let returnValue: ActionResult<void> | undefined;
			await act(async () => {
				returnValue = await result.current.run(mockFn);
			});

			expect(returnValue).toBeUndefined();
		});
	});

	describe('reset', () => {
		it('resets status to idle', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.status).toBe('success');

			act(() => {
				result.current.reset();
			});

			expect(result.current.status).toBe('idle');
		});

		it('clears error message', async () => {
			const { result } = renderHook(() => useAsyncStatus());
			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([undefined, new Error('Test error')]),
			);

			await act(async () => {
				await result.current.run(mockFn);
			});

			expect(result.current.error).toBe('Test error');

			act(() => {
				result.current.reset();
			});

			expect(result.current.error).toBeNull();
		});

		it('can be called when already idle', () => {
			const { result } = renderHook(() => useAsyncStatus());

			expect(result.current.status).toBe('idle');

			act(() => {
				result.current.reset();
			});

			expect(result.current.status).toBe('idle');
			expect(result.current.error).toBeNull();
		});
	});

	describe('state transitions', () => {
		it('maintains correct status sequence: idle → loading → success', async () => {
			const statuses: AsyncStatus[] = [];
			const { result } = renderHook(() => useAsyncStatus());

			const mockFn = vi.fn().mockResolvedValue({ ok: true, data: undefined });
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: true, data: undefined }, undefined]),
			);

			statuses.push(result.current.status); // idle

			// Start the operation - status should be loading during execution
			let runPromise: Promise<ActionResult<undefined> | undefined>;
			act(() => {
				runPromise = result.current.run(mockFn);
			});

			statuses.push(result.current.status); // loading

			await act(async () => {
				await runPromise;
			});

			statuses.push(result.current.status); // success

			expect(statuses).toEqual(['idle', 'loading', 'success']);
		});

		it('maintains correct status sequence: idle → loading → error on exception', async () => {
			const statuses: AsyncStatus[] = [];
			const { result } = renderHook(() => useAsyncStatus());

			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([undefined, new Error('Test error')]),
			);

			statuses.push(result.current.status); // idle

			// Start the operation - status should be loading during execution
			let runPromise: Promise<ActionResult<undefined> | undefined>;
			act(() => {
				runPromise = result.current.run(mockFn);
			});

			statuses.push(result.current.status); // loading

			await act(async () => {
				await runPromise;
			});

			statuses.push(result.current.status); // error

			expect(statuses).toEqual(['idle', 'loading', 'error']);
		});

		it('maintains correct status sequence: idle → loading → error on business failure', async () => {
			const statuses: AsyncStatus[] = [];
			const { result } = renderHook(() => useAsyncStatus());

			const mockFn = vi.fn();
			mockCatchify.mockImplementation(() =>
				Promise.resolve([{ ok: false, error: 'Business error' }, undefined]),
			);

			statuses.push(result.current.status); // idle

			// Start the operation - status should be loading during execution
			let runPromise: Promise<ActionResult<undefined> | undefined>;
			act(() => {
				runPromise = result.current.run(mockFn);
			});

			statuses.push(result.current.status); // loading

			await act(async () => {
				await runPromise;
			});

			statuses.push(result.current.status); // error

			expect(statuses).toEqual(['idle', 'loading', 'error']);
		});
	});
});
